/**
 * Import Google Maps scraper CSVs (gosom/google-maps-scraper) into Supabase.
 * Port of the deleted backend GoogleMapsImportService + PriceEstimator.
 *
 * Usage:
 *   node --env-file=../../.env.migrate import-scraper.mjs <csv-file|dir> [options]
 *
 * Options:
 *   --city <name>    Fallback city when address detection fails (default: Bangalore)
 *   --owner <email>  Profile that owns imported PGs (default: owner@example.com, fallback admin@example.com)
 *   --status <s>     APPROVED | PENDING_VERIFICATION (default: APPROVED)
 *   --limit <n>      Only process first n rows (testing)
 *   --new-only       Skip rows whose google_place_id already exists (no updates)
 *   --dry-run        Parse + report only, no writes
 *
 * Idempotent: dedupes by google_place_id (existing rows are updated),
 * skips images already in storage/DB, replaces Google-reviews on update.
 */
import fs from 'node:fs';
import path from 'node:path';
import { supabase, readCsv, num, PUBLIC_URL } from './utils.mjs';

const args = process.argv.slice(2);
const flags = {};
const inputs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
    flags[key] = val;
  } else {
    inputs.push(args[i]);
  }
}
if (!inputs.length) {
  console.error('Usage: import-scraper.mjs <csv-file|dir> [--city X] [--owner email] [--status S] [--limit N] [--dry-run]');
  process.exit(1);
}

const DEFAULT_CITY = flags.city || 'Bangalore';
const STATUS = (flags.status || 'APPROVED').toUpperCase();
const DRY = !!flags['dry-run'];
const LIMIT = flags.limit ? Number(flags.limit) : Infinity;
const ONLY_IDS = flags['place-ids'] ? flags['place-ids'].split(',').map((s) => s.trim()).filter(Boolean) : null;

// ---------------------------------------------------------------------------
// Heuristics (ported from GoogleMapsImportService)
// ---------------------------------------------------------------------------
const CITY_STATE_MAP = {
  mumbai: 'Maharashtra', bangalore: 'Karnataka', bengaluru: 'Karnataka',
  delhi: 'Delhi', 'new delhi': 'Delhi', pune: 'Maharashtra', hyderabad: 'Telangana',
  chennai: 'Tamil Nadu', kolkata: 'West Bengal', gurugram: 'Haryana',
  gurgaon: 'Haryana', noida: 'Uttar Pradesh', ghaziabad: 'Uttar Pradesh',
  ahmedabad: 'Gujarat', indore: 'Madhya Pradesh', jaipur: 'Rajasthan',
  kochi: 'Kerala', nagpur: 'Maharashtra',
};
const BASE_PRICES = {
  mumbai: 15000, bangalore: 10000, bengaluru: 10000, delhi: 12000, pune: 8000,
  hyderabad: 9000, chennai: 8500, kolkata: 7000, gurugram: 14000,
  gurgaon: 14000, noida: 9000, ghaziabad: 7000, ahmedabad: 8000,
};
const MULTIPLIERS = { SINGLE: 1.3, DOUBLE: 1.0, TRIPLE: 0.75, QUAD: 0.6 };

function estimate(city, sharing) {
  const base = BASE_PRICES[(city || 'bangalore').toLowerCase()] ?? 10000;
  const mult = MULTIPLIERS[(sharing || 'SINGLE').toUpperCase()] ?? 1.0;
  return Math.round((base * mult) / 500) * 500;
}

function parsePriceRange(priceRange, city, sharing) {
  if (priceRange) {
    const first = priceRange.trim().split(/[-–—]/)[0].replace(/[^0-9.]/g, '');
    const val = Number(first);
    if (val > 100) return val;
  }
  return estimate(city, sharing);
}

function determineCity(address, completeAddress, defaultCity) {
  const lower = `${address || ''} ${completeAddress || ''}`.toLowerCase();
  for (const city of Object.keys(CITY_STATE_MAP)) {
    if (lower.includes(city)) return city[0].toUpperCase() + city.slice(1);
  }
  return defaultCity;
}

function inferGenderType(title) {
  const lower = (title || '').toLowerCase();
  if (lower.includes('boys') || lower.includes('men') || lower.includes('male') || lower.includes('gentlemen')) return 'MALE';
  if (lower.includes('girls') || lower.includes('women') || lower.includes('female') || lower.includes('ladies')) return 'FEMALE';
  return 'UNISEX';
}

function generateSlug(title, placeId) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const shortId = placeId.length > 8 ? placeId.slice(-8) : placeId;
  return `${base}-${shortId}`;
}

// gosom CSV column names (header names match the gosom output)
function parseJsonCol(v) {
  if (!v || !v.trim()) return null;
  try { return JSON.parse(v); } catch { return null; }
}

// ---------------------------------------------------------------------------
// Resolve files
// ---------------------------------------------------------------------------
let files = [];
for (const input of inputs) {
  if (fs.statSync(input).isDirectory()) {
    files.push(...fs.readdirSync(input).filter((f) => f.endsWith('.csv')).map((f) => path.join(input, f)));
  } else {
    files.push(input);
  }
}
console.log(`Files (${files.length}): ${files.join(', ')}${DRY ? '  [DRY RUN]' : ''}`);

// ---------------------------------------------------------------------------
// Resolve owner + google-reviews profile
// ---------------------------------------------------------------------------
const ownerEmails = [flags.owner, 'owner@example.com', 'admin@example.com'].filter(Boolean);
const { data: ownerProfiles, error: ownerErr } = await supabase
  .from('profiles').select('id, email, role').in('email', ownerEmails);
if (ownerErr) throw ownerErr;
const owner = ownerProfiles?.[0];
if (!owner) throw new Error(`No profile found for owner emails: ${ownerEmails.join(', ')}`);
console.log(`Owner: ${owner.email} (${owner.role})`);

const { data: grUser, error: grErr } = await supabase
  .from('profiles').select('id').eq('email', 'reviews@google-maps.local').maybeSingle();
if (grErr || !grUser) throw new Error('Profile reviews@google-maps.local missing (created by load.mjs)');
const googleReviewsUserId = grUser.id;

// ---------------------------------------------------------------------------
// Process each file/row
// ---------------------------------------------------------------------------
let imported = 0, updated = 0, skipped = 0, imagesUploaded = 0, reviewsImported = 0;
const errors = [];
const skippedList = [];

async function uploadImageIfNew(url, baseName) {
  // skip streetview placeholders (parity with old service)
  if (!url || url.includes('streetviewpixels')) return null;
  const ext = url.includes('.png') ? 'png' : 'jpg';
  const storageName = `${baseName}.${ext}`;
  const fullUrl = `${PUBLIC_URL}/${storageName}`;
  try {
    const head = await fetch(fullUrl, { method: 'HEAD' }).catch(() => null);
    if (head && head.ok) return fullUrl;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LivioBot/1.0)' } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const { error } = await supabase.storage.from('pg-images')
      .upload(storageName, buf, { contentType: ext === 'png' ? 'image/png' : 'image/jpeg', upsert: true, cacheControl: '31536000' });
    if (error) return null;
    imagesUploaded++;
    return fullUrl;
  } catch {
    return null;
  }
}

for (const file of files) {
  const rows = readCsv(file);
  if (!rows.length) { console.log(`  ${path.basename(file)}: empty`); continue; }

  const cityFromName = path.basename(file).split('_')[0];
  console.log(`\n${path.basename(file)}: ${rows.length} rows (default city: ${cityFromName || DEFAULT_CITY})`);
  let n = 0;

  for (const row of rows) {
    if (++n > LIMIT) break;
    try {
      const title = (row.title || '').trim();
      const placeId = (row.place_id || '').trim();
      if (!placeId || !title) { skipped++; skippedList.push(`NO_PLACE_ID_OR_TITLE: ${title || '?'}`); continue; }
      if (ONLY_IDS && !ONLY_IDS.includes(placeId)) continue;

      const address = row.address || 'Address not provided';
      const city = determineCity(address, row.complete_address, cityFromName || DEFAULT_CITY);
      const state = CITY_STATE_MAP[city.toLowerCase()] || 'Unknown';
      const gender = inferGenderType(title);
      const priceSingle = parsePriceRange(row.price_range, city, 'SINGLE');
      const priceDouble = parsePriceRange(row.price_range, city, 'DOUBLE');
      const priceTriple = parsePriceRange(row.price_range, city, 'TRIPLE');
      const website = row.website ? row.website.slice(0, 255) : null;
      const rating = num(row.review_rating);
      const reviewsCount = num(row.review_count) ?? 0;
      const userReviews = parseJsonCol(row.user_reviews);

      const pgRow = {
        owner_id: owner.id,
        title,
        description: `Imported from Google Maps: ${title}`,
        slug: generateSlug(title, placeId),
        address,
        city,
        state,
        price: priceSingle,
        price_single: priceSingle,
        price_double: priceDouble,
        price_triple: priceTriple,
        rules: 'Standard PG rules apply. Contact owner for details.',
        gender_type: gender,
        sharing_type: 'SINGLE',
        google_place_id: placeId,
        phone: row.phone || null,
        website,
        latitude: num(row.latitude),
        longitude: num(row.longitude),
        google_maps_url: `https://maps.google.com/maps/place/?q=place_id:${placeId}`,
        source: 'GOOGLE_MAPS',
        property_type: 'PG',
        status: STATUS,
        rating,
        reviews_count: reviewsCount,
      };

      // dedupe: existing place_id -> update (or skip with --new-only)
      const { data: existing, error: findErr } = await supabase
        .from('pgs').select('id, google_place_id').eq('google_place_id', placeId).maybeSingle();
      if (findErr) throw findErr;
      if (existing && flags['new-only']) { skipped++; continue; }

      if (DRY) {
        if (existing) { updated++; } else { imported++; }
        continue;
      }

      const { data: saved, error: saveErr } = await supabase
        .from('pgs').upsert(pgRow, { onConflict: 'google_place_id' }).select('id').single();
      if (saveErr) throw saveErr;
      const pgId = saved.id;
      if (existing) updated++; else imported++;

      // ---- images: thumbnail (primary) + gallery JSON, direct to Storage ----
      const urls = new Set();
      const thumb = await uploadImageIfNew(row.thumbnail, `${placeId}_thumb`);
      if (thumb) urls.add(thumb);
      const gallery = parseJsonCol(row.images);
      if (Array.isArray(gallery)) {
        let idx = 0;
        for (const imgData of gallery) {
          const imgUrl = imgData?.image;
          if (!imgUrl) continue;
          const u = await uploadImageIfNew(imgUrl, `${placeId}_${idx}`);
          if (u) urls.add(u);
          idx++;
        }
      }
      if (urls.size) {
        const { data: existingImgs } = await supabase.from('images').select('url').in('url', [...urls]);
        const have = new Set((existingImgs || []).map((i) => i.url));
        const toInsert = [...urls]
          .filter((u) => !have.has(u))
          .map((u) => ({ pg_id: pgId, url: u, is_primary: u === thumb }));
        if (toInsert.length) {
          const { error: imgErr } = await supabase.from('images').insert(toInsert);
          if (imgErr) throw imgErr;
        }
      }

      // ---- google user_reviews JSON -> reviews rows (profile reviews@google-maps.local) ----
      if (Array.isArray(userReviews) && userReviews.length) {
        await supabase.from('reviews').delete().eq('pg_id', pgId).eq('user_id', googleReviewsUserId);
        const mapped = userReviews.map((r) => {
          const name = r.Name || '';
          const desc = r.Description || '';
          const comment = `${name ? `[${name}] ` : ''}${desc}`;
          let createdAt = null;
          if (r.published_at) {
            const d = new Date(String(r.published_at).slice(0, 19).replace(' ', 'T'));
            if (!Number.isNaN(d.getTime())) createdAt = d.toISOString();
          }
          return {
            pg_id: pgId,
            user_id: googleReviewsUserId,
            rating: num(r.Rating) ?? 5,
            comment,
            ...(createdAt ? { created_at: createdAt } : {}),
          };
        });
        for (let i = 0; i < mapped.length; i += 100) {
          const { error: revErr } = await supabase.from('reviews').insert(mapped.slice(i, i + 100));
          if (revErr) throw revErr;
        }
        reviewsImported += mapped.length;
      }
    } catch (e) {
      errors.push(`${row?.title || '?'}: ${e.message}`);
    }
  }
  console.log(`  processed ${Math.min(n - 1, LIMIT)} rows`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`\n${DRY ? '[DRY RUN] ' : ''}Done:
  new PGs:        ${imported}
  updated PGs:    ${updated}
  skipped:        ${skipped}${skippedList.length ? ' (' + skippedList.slice(0, 5).join(' | ') + (skippedList.length > 5 ? ' …' : '') + ')' : ''}
  images uploaded:${DRY ? ' (dry-run)' : ' ' + imagesUploaded}
  google reviews: ${DRY ? ' (dry-run)' : ' ' + reviewsImported}
  errors:         ${errors.length}`);
if (errors.length) console.log(errors.slice(0, 20).map((e) => '  ! ' + e).join('\n'));

if (!DRY && (imported || updated)) {
  const { count } = await supabase.from('pgs').select('*', { count: 'exact', head: true });
  console.log(`\nTotal PGs in Supabase: ${count}`);
}

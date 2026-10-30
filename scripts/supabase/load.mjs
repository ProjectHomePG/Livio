/**
 * One-time migration: H2 export CSVs -> Supabase Postgres.
 *
 * Usage:
 *   node --env-file=.env.migrate scripts/supabase/load.mjs
 *
 * Prerequisites:
 *   - supabase/migrations/0001_init.sql applied to the project
 *   - CSVs exported via scripts/supabase/export-h2.sh (default: /tmp/h2export)
 */
import crypto from 'node:crypto';
import {
  supabase,
  readCsv,
  num,
  bool,
  ts,
  upsertInBatches,
  PUBLIC_URL,
} from './utils.mjs';

const DIR = process.env.H2EXPORT_DIR || '/tmp/h2export';
const SKIP_AUTH = process.argv.includes('--skip-auth');

// ---------------------------------------------------------------------------
// PriceEstimator port (backend/src/main/java/com/livio/util/PriceEstimator.java)
// ---------------------------------------------------------------------------
const BASE_PRICES = {
  mumbai: 15000,
  bangalore: 10000,
  bengaluru: 10000,
  delhi: 12000,
  pune: 8000,
  hyderabad: 9000,
  chennai: 8500,
  kolkata: 7000,
  gurugram: 14000,
  gurgaon: 14000,
  noida: 9000,
  ghaziabad: 7000,
};
const MULTIPLIERS = { SINGLE: 1.3, DOUBLE: 1.0, TRIPLE: 0.75, QUAD: 0.6 };

function estimate(city, sharing) {
  const base = BASE_PRICES[(city || 'bangalore').toLowerCase()] ?? 10000;
  const mult = MULTIPLIERS[(sharing || 'SINGLE').toUpperCase()] ?? 1.0;
  return Math.round((base * mult) / 500) * 500;
}

function isSet(v) {
  return v !== null && v !== undefined && v > 0;
}

// ---------------------------------------------------------------------------
// Read exports
// ---------------------------------------------------------------------------
console.log(`Reading CSVs from ${DIR}`);
const users = readCsv(`${DIR}/users.csv`);
const amenities = readCsv(`${DIR}/amenities.csv`);
const pgs = readCsv(`${DIR}/pgs.csv`);
const images = readCsv(`${DIR}/images.csv`);
const reviews = readCsv(`${DIR}/reviews.csv`);
const favorites = readCsv(`${DIR}/favorites.csv`);
const inquiries = readCsv(`${DIR}/inquiries.csv`);
const pgAmenities = readCsv(`${DIR}/pg_amenities.csv`);
const nearby = readCsv(`${DIR}/pg_nearby_places.csv`);

console.log(
  `  users=${users.length} amenities=${amenities.length} pgs=${pgs.length} ` +
    `images=${images.length} reviews=${reviews.length} favorites=${favorites.length} ` +
    `inquiries=${inquiries.length} pg_amenities=${pgAmenities.length} nearby=${nearby.length}`
);

// ---------------------------------------------------------------------------
// profiles (legacy users -> uuid keyed rows, legacy_id preserves old mapping)
// ---------------------------------------------------------------------------
const legacyToUuid = new Map();
const profiles = users.map((u) => {
  const id = crypto.randomUUID();
  legacyToUuid.set(Number(u.ID), id);
  return {
    id,
    legacy_id: num(u.ID),
    name: u.NAME,
    email: u.EMAIL,
    phone: u.PHONE,
    role: u.ROLE || 'ROLE_USER',
    bio: u.BIO,
    city: u.CITY,
    profile_picture: u.PROFILE_PICTURE,
    created_at: ts(u.CREATED_AT),
    updated_at: ts(u.UPDATED_AT),
  };
});

// ---------------------------------------------------------------------------
// pgs
// ---------------------------------------------------------------------------
const mappedPgs = pgs.map((p) => {
  let price = num(p.PRICE);
  let single = num(p.PRICE_SINGLE);
  let dbl = num(p.PRICE_DOUBLE);
  let triple = num(p.PRICE_TRIPLE);
  if (![price, single, dbl, triple].some(isSet)) {
    single = estimate(p.CITY, 'SINGLE');
    dbl = estimate(p.CITY, 'DOUBLE');
    triple = estimate(p.CITY, 'TRIPLE');
    price = single;
  }
  const ownerId = legacyToUuid.get(num(p.OWNER_ID));
  if (!ownerId) throw new Error(`PG ${p.ID} references unknown owner ${p.OWNER_ID}`);
  return {
    id: num(p.ID),
    owner_id: ownerId,
    title: p.TITLE,
    description: p.DESCRIPTION,
    slug: p.SLUG,
    address: p.ADDRESS,
    city: p.CITY,
    state: p.STATE,
    zip_code: p.ZIP_CODE,
    price,
    price_single: single,
    price_double: dbl,
    price_triple: triple,
    rules: p.RULES,
    gender_type: p.GENDER_TYPE,
    sharing_type: p.SHARING_TYPE,
    google_place_id: p.GOOGLE_PLACE_ID,
    phone: p.PHONE,
    website: p.WEBSITE,
    latitude: num(p.LATITUDE),
    longitude: num(p.LONGITUDE),
    google_maps_url: p.GOOGLE_MAPS_URL,
    source: p.SOURCE,
    property_type: p.PROPERTY_TYPE,
    status: p.STATUS || 'APPROVED',
    deposit_amount: num(p.DEPOSIT_AMOUNT) ?? 5000,
    maintenance_charges: num(p.MAINTENANCE_CHARGES),
    cancellation_policy: p.CANCELLATION_POLICY,
    rating: num(p.RATING),
    reviews_count: num(p.REVIEWS_COUNT) ?? 0,
    created_at: ts(p.CREATED_AT),
    updated_at: ts(p.UPDATED_AT),
  };
});

// ---------------------------------------------------------------------------
// images (rewrite local /uploads/images/... to Supabase Storage public URLs)
// ---------------------------------------------------------------------------
const mappedImages = images.map((im) => {
  let url = im.URL;
  if (url && url.startsWith('/uploads/images/')) {
    url = `${PUBLIC_URL}/${url.slice('/uploads/images/'.length)}`;
  }
  return {
    id: num(im.ID),
    pg_id: num(im.PG_ID),
    url,
    is_primary: bool(im.IS_PRIMARY) ?? false,
  };
});

// ---------------------------------------------------------------------------
// reviews / favorites / join tables
// ---------------------------------------------------------------------------
const mappedReviews = reviews.map((r) => {
  const userId = legacyToUuid.get(num(r.USER_ID));
  if (!userId) throw new Error(`Review ${r.ID} references unknown user ${r.USER_ID}`);
  return {
    id: num(r.ID),
    pg_id: num(r.PG_ID),
    user_id: userId,
    rating: num(r.RATING),
    comment: r.COMMENT,
    created_at: ts(r.CREATED_AT),
  };
});

const mappedFavorites = favorites.map((f) => {
  const userId = legacyToUuid.get(num(f.USER_ID));
  if (!userId) throw new Error(`Favorite ${f.ID} references unknown user ${f.USER_ID}`);
  return {
    id: num(f.ID),
    pg_id: num(f.PG_ID),
    user_id: userId,
    created_at: ts(f.CREATED_AT),
  };
});

const mappedPgAmenities = pgAmenities.map((a) => ({
  pg_id: num(a.PG_ID),
  amenity_id: num(a.AMENITY_ID),
}));

const mappedNearby = nearby.map((n, i) => ({
  id: i + 1,
  pg_id: num(n.PG_ID),
  name: n.NAME,
  distance: n.DISTANCE,
  type: n.TYPE,
}));

// ---------------------------------------------------------------------------
// Load (order matters for FKs; reviews trigger recomputes pgs.rating)
// ---------------------------------------------------------------------------
console.log('\nLoading data...');
await upsertInBatches('amenities', amenities.map((a) => ({
  id: num(a.ID),
  name: a.NAME,
  icon: a.ICON,
})), { onConflict: 'id' });

await upsertInBatches('profiles', profiles, { onConflict: 'id' });
await upsertInBatches('pgs', mappedPgs, { onConflict: 'id' });
await upsertInBatches('images', mappedImages, { onConflict: 'id' });

if (mappedPgAmenities.length) {
  await upsertInBatches('pg_amenities', mappedPgAmenities, {
    onConflict: 'pg_id,amenity_id',
  });
}
if (mappedNearby.length) {
  await upsertInBatches('pg_nearby_places', mappedNearby, { onConflict: 'id' });
}
await upsertInBatches('reviews', mappedReviews, { onConflict: 'id' });
if (mappedFavorites.length) {
  await upsertInBatches('favorites', mappedFavorites, { onConflict: 'id' });
}
if (inquiries.length) {
  await upsertInBatches('inquiries', inquiries.map((q) => ({
    id: num(q.ID),
    pg_id: num(q.PG_ID),
    name: q.NAME,
    email: q.EMAIL,
    phone: q.PHONE,
    message: q.MESSAGE,
    status: q.STATUS || 'PENDING',
    created_at: ts(q.CREATED_AT),
  })), { onConflict: 'id' });
}

// ---------------------------------------------------------------------------
// Reseed identity sequences (explicit ids were supplied above)
// ---------------------------------------------------------------------------
const { error: reseedErr } = await supabase.rpc('reseed_sequences');
if (reseedErr) {
  console.warn(`  reseed_sequences failed (is 0001_init.sql applied?): ${reseedErr.message}`);
} else {
  console.log('  sequences reseeded');
}

// ---------------------------------------------------------------------------
// Create Supabase Auth users for legacy accounts + link profiles
// ---------------------------------------------------------------------------
if (!SKIP_AUTH) {
  console.log('\nCreating auth users for legacy accounts...');
  for (const p of profiles) {
    const legacy = users.find((u) => num(u.ID) === p.legacy_id);
    const password = legacy?.PASSWORD || crypto.randomUUID().slice(0, 16);
    const { data, error } = await supabase.auth.admin.createUser({
      email: p.email,
      password,
      email_confirm: true,
      user_metadata: { name: p.name, phone: p.phone, role: p.role },
    });
    if (error) {
      if (/already (registered|exists)/i.test(error.message)) {
        console.log(`  ${p.email}: already exists, linking profile`);
        const { data: existing } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        const found = existing?.users?.find(
          (u) => u.email?.toLowerCase() === p.email.toLowerCase()
        );
        if (found) {
          await supabase.from('profiles').update({ auth_id: found.id }).eq('id', p.id);
        }
      } else {
        console.warn(`  ${p.email}: FAILED - ${error.message}`);
      }
      continue;
    }
    const authId = data.user?.id;
    if (authId) {
      const { error: linkErr } = await supabase
        .from('profiles')
        .update({ auth_id: authId })
        .eq('id', p.id);
      if (linkErr) console.warn(`  ${p.email}: link failed - ${linkErr.message}`);
    }
    console.log(`  ${p.email} (${p.role}) created`);
  }
  console.log(
    '\n  NOTE: legacy passwords were reused (demo accounts). Change admin@example.com\n' +
      '  password in Supabase Auth before enabling the login UI.'
  );
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------
console.log('\nVerification:');
for (const t of ['profiles', 'pgs', 'images', 'reviews', 'favorites', 'amenities', 'inquiries']) {
  const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
  console.log(`  ${t}: ${error ? `ERROR ${error.message}` : count}`);
}
const { data: sample, error: sampleErr } = await supabase
  .from('pgs')
  .select('id, title, slug, rating, reviews_count, price_single, images(url, is_primary)')
  .not('rating', 'is', null)
  .limit(3);
console.log('  sample:', sampleErr ? sampleErr.message : JSON.stringify(sample, null, 2));

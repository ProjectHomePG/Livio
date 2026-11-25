/**
 * Server-side Supabase PostgREST data access for SSR, ISR, and sitemap generation.
 * Uses native fetch() to avoid Node.js WebSocket issues in @supabase/realtime-js
 * and leverage Next.js revalidate caching cleanly.
 */

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const SUMMARY_SELECT =
  'id,title,slug,description,address,city,state,zip_code,price,price_single,price_double,price_triple,gender_type,sharing_type,property_type,status,latitude,longitude,rating,reviews_count,created_at,updated_at,images(id,url,is_primary)';

// Note: explicitly omit owner email from public SSR/API payloads.
const DETAIL_SELECT =
  SUMMARY_SELECT +
  ',rules,deposit_amount,maintenance_charges,cancellation_policy,google_maps_url,source' +
  ',amenities(id,name,icon)' +
  ',pg_nearby_places(id,name,distance,type)' +
  ',owner:profiles(id,name,role)' +
  ',reviews(id,rating,comment,created_at,user:profiles(id,name))';

const SNAKE_TO_CAMEL = {
  zip_code: 'zipCode',
  gender_type: 'genderType',
  sharing_type: 'sharingType',
  price_single: 'priceSingle',
  price_double: 'priceDouble',
  price_triple: 'priceTriple',
  google_place_id: 'googlePlaceId',
  google_maps_url: 'googleMapsUrl',
  property_type: 'propertyType',
  deposit_amount: 'depositAmount',
  maintenance_charges: 'maintenanceCharges',
  cancellation_policy: 'cancellationPolicy',
  reviews_count: 'reviewsCount',
  owner_id: 'ownerId',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

export function mapPgRow(row) {
  if (!row) return null;
  const pg = {};
  for (const [key, value] of Object.entries(row)) {
    if (
      key === 'amenities' ||
      key === 'pg_nearby_places' ||
      key === 'owner' ||
      key === 'reviews' ||
      key === 'images'
    ) {
      continue;
    }
    pg[SNAKE_TO_CAMEL[key] || key] = value;
  }

  const sortedImages = [...(row.images || [])].sort((a, b) => (a.id || 0) - (b.id || 0));
  pg.images = sortedImages.map((img) => ({
    id: img.id,
    url: img.url,
    isPrimary: img.is_primary,
  }));
  pg.amenities = row.amenities || [];
  pg.nearbyPlaces = (row.pg_nearby_places || []).map((place) => ({
    id: place.id,
    name: place.name,
    distance: place.distance,
    type: place.type,
  }));
  if (row.owner) {
    pg.owner = {
      id: row.owner.id,
      name: row.owner.name,
      role: row.owner.role,
    };
  }
  if (row.reviews) {
    pg.reviews = [...row.reviews]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        user: review.user,
      }));
  }
  return pg;
}

export function getLowestPrice(pg) {
  const candidates = [pg.priceTriple, pg.priceDouble, pg.priceSingle, pg.price]
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0);
  return candidates.length > 0 ? Math.min(...candidates) : 0;
}

async function postgrestGet(path, { revalidate = 3600 } = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      next: { revalidate },
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch all approved PGs using PostgREST pagination (bypasses the 1,000-row cap).
 */
export async function getAllApprovedPgs({
  select = SUMMARY_SELECT,
  revalidate = 3600,
  maxRows = 5000,
} = {}) {
  // Keep chunks <= 400 rows so each PostgREST response stays well below Next.js's 2MB Data Cache limit.
  const pageSize = 400;
  const rows = [];
  let offset = 0;

  while (rows.length < maxRows) {
    const query = `pgs?select=${encodeURIComponent(select)}&status=eq.APPROVED&order=id.asc&limit=${pageSize}&offset=${offset}`;
    const chunk = await postgrestGet(query, { revalidate });
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    rows.push(...chunk);
    if (chunk.length < pageSize) break;
    offset += pageSize;
  }

  return rows.map(mapPgRow);
}

/**
 * Fetch lightweight initial PGs for the homepage SSR payload.
 */
export async function getInitialHomePgs(limit = 48) {
  const query = `pgs?select=${encodeURIComponent(SUMMARY_SELECT)}&status=eq.APPROVED&order=reviews_count.desc,id.asc&limit=${limit}`;
  const rows = await postgrestGet(query, { revalidate: 1800 });
  if (!Array.isArray(rows)) return [];
  return rows.map(mapPgRow);
}

/**
 * Fetch a single approved PG by exact slug.
 */
export async function getPgBySlug(slug) {
  if (!slug) return null;
  const query = `pgs?select=${encodeURIComponent(DETAIL_SELECT)}&slug=eq.${encodeURIComponent(slug)}&status=eq.APPROVED&limit=1`;
  const rows = await postgrestGet(query, { revalidate: 3600 });
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return mapPgRow(rows[0]);
}

/**
 * Fetch a single approved PG slug by numeric ID (for legacy /pg?id=... redirects).
 */
export async function getPgSlugById(id) {
  if (!id || !/^\d+$/.test(String(id))) return null;
  const query = `pgs?select=slug&id=eq.${encodeURIComponent(id)}&status=eq.APPROVED&limit=1`;
  const rows = await postgrestGet(query, { revalidate: 3600 });
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0]?.slug || null;
}

/**
 * Fetch related PGs in the same city (excluding current property).
 */
export async function getRelatedPgs(city, excludeId, limit = 6) {
  if (!city) return [];
  const safeCity = String(city).trim();
  const query = `pgs?select=${encodeURIComponent(SUMMARY_SELECT)}&status=eq.APPROVED&city=ilike.${encodeURIComponent(`*${safeCity}*`)}&id=neq.${encodeURIComponent(excludeId)}&order=reviews_count.desc,id.asc&limit=${limit}`;
  const rows = await postgrestGet(query, { revalidate: 3600 });
  if (!Array.isArray(rows)) return [];
  return rows.map(mapPgRow);
}

/**
 * Fetch all approved PG slugs + timestamps for sitemap.xml.
 */
export async function getSitemapPgEntries() {
  const pageSize = 1000;
  const entries = [];
  let offset = 0;

  while (true) {
    const query = `pgs?select=slug,updated_at,created_at&status=eq.APPROVED&order=id.asc&limit=${pageSize}&offset=${offset}`;
    const chunk = await postgrestGet(query, { revalidate: 86400 });
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    for (const row of chunk) {
      if (row && row.slug) {
        entries.push({
          slug: row.slug,
          updatedAt: row.updated_at || row.created_at || null,
        });
      }
    }
    if (chunk.length < pageSize) break;
    offset += pageSize;
  }

  return entries;
}

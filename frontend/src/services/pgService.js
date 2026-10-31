import { supabase } from '../lib/supabase';
import authService from './authService';

const LIST_SELECT = '*, images(id,url,is_primary)';
const DETAIL_SELECT =
  LIST_SELECT +
  ', amenities(id,name,icon)' +
  ', pg_nearby_places(id,name,distance,type)' +
  ', owner:profiles(id,name,email,role)' +
  ', reviews(id,rating,comment,created_at,user:profiles(id,name))';

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

function mapPg(row) {
  if (!row) return row;
  const pg = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'amenities' || key === 'pg_nearby_places' || key === 'owner' ||
        key === 'reviews' || key === 'images') continue;
    pg[SNAKE_TO_CAMEL[key] || key] = value;
  }
  pg.images = (row.images || []).map((img) => ({
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
  if (row.owner) pg.owner = row.owner;
  if (row.reviews) {
    pg.reviews = row.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      user: review.user,
    }));
  }
  return pg;
}

function mapList(rows) {
  return (rows || []).map(mapPg);
}

/** Form payload -> snake_case database row (only fields the UI can edit). */
function toRow(data) {
  const row = {};
  if (data.title !== undefined) row.title = data.title;
  if (data.description !== undefined) row.description = data.description;
  if (data.address !== undefined) row.address = data.address;
  if (data.city !== undefined) row.city = data.city;
  if (data.state !== undefined) row.state = data.state;
  if (data.zipCode !== undefined) row.zip_code = data.zipCode;
  if (data.price !== undefined) row.price = Number(data.price);
  if (data.rules !== undefined) row.rules = data.rules;
  if (data.genderType !== undefined) row.gender_type = data.genderType;
  if (data.sharingType !== undefined) row.sharing_type = data.sharingType;
  if (data.latitude !== undefined) {
    row.latitude = data.latitude === null || data.latitude === '' ? null : Number(data.latitude);
  }
  if (data.longitude !== undefined) {
    row.longitude = data.longitude === null || data.longitude === '' ? null : Number(data.longitude);
  }
  return row;
}

const BASE_PRICES = {
  mumbai: 15000, bangalore: 10000, bengaluru: 10000, delhi: 12000,
  pune: 8000, hyderabad: 9000, chennai: 8500, kolkata: 7000,
  gurugram: 14000, gurgaon: 14000, noida: 9000, ghaziabad: 7000,
};
const MULTIPLIERS = { SINGLE: 1.3, DOUBLE: 1.0, TRIPLE: 0.75, QUAD: 0.6 };

function estimatePrice(city, sharing) {
  const base = BASE_PRICES[(city || 'bangalore').toLowerCase()] ?? 10000;
  const mult = MULTIPLIERS[(sharing || 'SINGLE').toUpperCase()] ?? 1.0;
  return Math.round((base * mult) / 500) * 500;
}

function applyPriceFallback(row) {
  const isSet = (v) => v !== null && v !== undefined && v > 0;
  if ([row.price, row.price_single, row.price_double, row.price_triple].some(isSet)) return;
  row.price_single = estimatePrice(row.city, 'SINGLE');
  row.price_double = estimatePrice(row.city, 'DOUBLE');
  row.price_triple = estimatePrice(row.city, 'TRIPLE');
  row.price = row.price_single;
}

function slugify(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(title) {
  const base = slugify(title) || 'pg-stay';
  let slug = base;
  for (let attempt = 2; attempt <= 50; attempt++) {
    const { data, error } = await supabase
      .from('pgs').select('id').eq('slug', slug).limit(1);
    if (error) throw new Error(error.message);
    if (!data.length) return slug;
    slug = `${base}-${attempt}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function orderImages(query) {
  return query.order('id', { referencedTable: 'images', ascending: true });
}

function throwIf(error, fallback) {
  if (error) throw new Error(error.message || fallback);
}

export const pgService = {
  getAll: async () => {
    const { data, error } = await orderImages(
      supabase.from('pgs').select(LIST_SELECT).limit(10000)
    );
    throwIf(error, 'Failed to load PG stays');
    return mapList(data);
  },

  search: async (query, filters = {}) => {
    let qb = supabase.from('pgs').select(LIST_SELECT).limit(10000);

    const q = (query || '').trim();
    if (q) {
      const safe = q.replace(/[,()\\]/g, ' ').trim();
      if (safe) {
        qb = qb.or(
          `title.ilike.%${safe}%,city.ilike.%${safe}%,state.ilike.%${safe}%,address.ilike.%${safe}%`
        );
      }
    }
    if (filters.gender && filters.gender !== 'ALL') {
      qb = qb.ilike('gender_type', filters.gender);
    }
    if (filters.sharing && filters.sharing !== 'ALL') {
      qb = qb.ilike('sharing_type', filters.sharing);
    }
    if (filters.minPrice) qb = qb.gte('price', Number(filters.minPrice));
    if (filters.maxPrice) qb = qb.lte('price', Number(filters.maxPrice));

    const { data, error } = await orderImages(qb);
    throwIf(error, 'Search failed');
    let results = mapList(data);

    if (filters.sortBy && results.length > 0) {
      if (filters.sortBy === 'PRICE_LOW_HIGH') {
        results.sort((a, b) => (a.priceTriple || a.priceDouble || a.price || 0) - (b.priceTriple || b.priceDouble || b.price || 0));
      } else if (filters.sortBy === 'PRICE_HIGH_LOW') {
        results.sort((a, b) => (b.priceTriple || b.priceDouble || b.price || 0) - (a.priceTriple || a.priceDouble || a.price || 0));
      } else if (filters.sortBy === 'RATING') {
        results.sort((a, b) => (b.rating || 5.0) - (a.rating || 5.0));
      }
    }
    return results;
  },

  getSuggestions: async (query, limit = 6) => {
    const q = (query || '').trim();
    if (!q || q.length < 2) return { pgs: [], locations: [] };
    const safe = q.replace(/[,()\\]/g, ' ').trim();
    if (!safe) return { pgs: [], locations: [] };

    try {
      const { data, error } = await supabase
        .from('pgs')
        .select('id, title, slug, city, state, address, price, price_single, price_double, price_triple, sharing_type, gender_type, rating, images(id,url,is_primary)')
        .or(`title.ilike.%${safe}%,city.ilike.%${safe}%,state.ilike.%${safe}%,address.ilike.%${safe}%`)
        .limit(limit);

      if (error) throw new Error(error.message);

      const locMap = new Map();
      (data || []).forEach((row) => {
        if (row.city) {
          const key = row.state ? `${row.city}, ${row.state}` : row.city;
          if (!locMap.has(key)) {
            locMap.set(key, { name: row.city, label: key, type: 'city' });
          }
        }
        if (row.address) {
          const parts = row.address.split(',').map((p) => p.trim()).filter(Boolean);
          if (parts[0] && !locMap.has(parts[0])) {
            locMap.set(parts[0], { name: parts[0], label: `${parts[0]}${row.city ? ', ' + row.city : ''}`, type: 'area' });
          }
        }
      });

      return {
        pgs: mapList(data || []),
        locations: Array.from(locMap.values()).slice(0, 5),
      };
    } catch (err) {
      console.warn('getSuggestions failed:', err.message);
      return { pgs: [], locations: [] };
    }
  },


  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('pgs')
      .select(DETAIL_SELECT)
      .eq('slug', slug)
      .order('id', { referencedTable: 'images', ascending: true })
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error(`PG stay not found with slug: ${slug}`);
    return mapPg(data);
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('pgs')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .order('id', { referencedTable: 'images', ascending: true })
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('PG stay not found');
    return mapPg(data);
  },

  create: async (pgData) => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('You must be signed in to create a listing.');

    const row = toRow(pgData);
    row.owner_id = user.id;
    row.slug = await uniqueSlug(pgData.title);
    row.status = 'APPROVED';
    applyPriceFallback(row);

    const { data, error } = await supabase
      .from('pgs')
      .insert(row)
      .select(LIST_SELECT)
      .single();
    throwIf(error, 'Failed to create listing');
    return mapPg(data);
  },

  update: async (id, pgData) => {
    const row = toRow(pgData);
    row.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('pgs')
      .update(row)
      .eq('id', id)
      .select('id');
    throwIf(error, 'Failed to update listing');
    if (!data?.length) throw new Error('You are not allowed to edit this listing.');
    const { data: full, error: fullError } = await supabase
      .from('pgs')
      .select(LIST_SELECT)
      .eq('id', id)
      .single();
    throwIf(fullError, 'Failed to load updated listing');
    return mapPg(full);
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('pgs')
      .delete()
      .eq('id', id)
      .select('id');
    throwIf(error, 'Failed to delete listing');
    if (!data?.length) throw new Error('You are not allowed to delete this listing.');
    return { message: 'Listing deleted' };
  },

  submitInquiry: async (inquiryData) => {
    const { error } = await supabase.from('inquiries').insert({
      pg_id: inquiryData.pgId ?? null,
      name: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone,
      message: inquiryData.message,
    });
    throwIf(error, 'Failed to submit inquiry');
    return { message: 'Inquiry submitted' };
  },

  addFavorite: async (pgId) => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in to save favorites.');
    const { error } = await supabase
      .from('favorites')
      .upsert(
        { user_id: user.id, pg_id: pgId },
        { onConflict: 'user_id,pg_id', ignoreDuplicates: true }
      );
    throwIf(error, 'Failed to save favorite');
    return { message: 'Added to favorites' };
  },

  removeFavorite: async (pgId) => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Sign in to manage favorites.');
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('pg_id', pgId);
    throwIf(error, 'Failed to remove favorite');
    return { message: 'Removed from favorites' };
  },

  getFavorites: async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select(`pg:pgs(${LIST_SELECT})`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return mapList((data || []).map((f) => f.pg).filter(Boolean));
    } catch (err) {
      console.warn('Get favorites failed:', err.message);
      return [];
    }
  },

  checkFavoriteStatus: async (pgId) => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return false;
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('pg_id', pgId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return !!data;
    } catch (err) {
      console.warn('Check favorite status failed:', err.message);
      return false;
    }
  },

  getMyPGs: async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return [];
      const { data, error } = await orderImages(
        supabase.from('pgs').select(LIST_SELECT).eq('owner_id', user.id).limit(10000)
      );
      if (error) throw new Error(error.message);
      return mapList(data);
    } catch (err) {
      console.warn('Get my PGs failed:', err.message);
      return [];
    }
  },

  createMyPG: async (pgData) => pgService.create(pgData),

  updateMyPG: async (pgId, pgData) => pgService.update(pgId, pgData),

  deleteMyPG: async (pgId) => pgService.delete(pgId),
};

export default pgService;

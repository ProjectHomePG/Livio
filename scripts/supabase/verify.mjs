import { createClient } from '@supabase/supabase-js';
import { supabase as admin } from './utils.mjs';
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
const sb = createClient(url, anon, { auth: { persistSession: false } });

// 1. homepage list query (same select as pgService.getAll)
const { data: all, error: e1 } = await sb.from('pgs').select('*, images(id,url,is_primary)').limit(10000);
console.log('getAll:', e1 ? 'ERR '+e1.message : `ok ${all.length} pgs, images included: ${all[0]?.images?.length}`);

// 2. search query
const { data: s, error: e2 } = await sb.from('pgs').select('*, images(id,url,is_primary)')
  .or('title.ilike.%indiranagar%,city.ilike.%indiranagar%,state.ilike.%indiranagar%,address.ilike.%indiranagar%')
  .ilike('gender_type','MALE').gte('price',5000).lte('price',15000).limit(10000);
console.log('search:', e2 ? 'ERR '+e2.message : `ok ${s.length} results`);

// 3. detail query by slug
const { data: d, error: e3 } = await sb.from('pgs').select('*, images(id,url,is_primary), amenities(id,name,icon), pg_nearby_places(id,name,distance,type), owner:profiles(id,name,email,role), reviews(id,rating,comment,created_at,user:profiles(id,name))')
  .eq('slug', all[0].slug).maybeSingle();
console.log('getBySlug:', e3 ? 'ERR '+e3.message : `ok "${d.title}" owner=${d.owner?.email} reviews=${d.reviews?.length} images=${d.images?.length}`);

// 4. anon write attempts must be DENIED by RLS
const w1 = await sb.from('pgs').insert({ owner_id: '00000000-0000-0000-0000-000000000001', title:'x', slug:'x', address:'x', city:'x', state:'x', price: 1 });
console.log('anon insert pgs (must fail):', w1.error ? 'DENIED: '+w1.error.message.slice(0,60) : 'ALLOWED !!!');
const w2 = await sb.from('inquiries').insert({ name:'anon test', email:'t@t.co', phone:'1', message:'m' });
console.log('anon insert inquiries (must pass):', w2.error ? 'DENIED: '+w2.error.message : 'ALLOWED (public contact form)');
const w3 = await sb.from('reviews').select('id').limit(1);
const w4 = await sb.from('inquiries').select('id');
console.log('anon read inquiries inbox (must be empty):', w4.error ? 'ERR '+w4.error.message : `rows=${w4.data.length}`);
const w5 = await sb.from('favorites').select('id');
console.log('anon read favorites (must be empty):', w5.error ? 'ERR '+w5.error.message : `rows=${w5.data.length}`);

// 5. image storage fetch (public bucket) - first image URL
const imgUrl = all.find(p=>p.images?.length)?.images[0].url;
const r = await fetch(imgUrl);
console.log('image fetch:', r.status, r.headers.get('content-type'), imgUrl.slice(-40));

// 6. rating stats
const { count: nullRatings } = await sb.from('pgs').select('*', { count:'exact', head:true }).is('rating', null);
console.log('pgs with null rating:', nullRatings);

// 7. cleanup: anon cannot see/delete its own inquiry (RLS), so remove it with the service key
if (!w2.error) {
  const { data: removed, error: delErr } = await admin.from('inquiries').delete().eq('name', 'anon test').select('id');
  console.log('cleanup test inquiry:', delErr ? 'ERR ' + delErr.message : `removed ${removed.length}`);
}

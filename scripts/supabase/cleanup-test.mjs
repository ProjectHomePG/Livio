import { supabase } from './utils.mjs';

const { data, error } = await supabase.from('inquiries').delete().eq('name', 'anon test').select('id');
console.log(error ? 'ERR ' + error.message : `deleted ${data.length} test inquiry row(s)`);

import { createClient } from '../utils/supabase/client';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

let _clientInstance = null;

export const getSupabase = () => {
  if (!_clientInstance) {
    _clientInstance = createClient();
  }
  return _clientInstance;
};

// Singleton browser client proxy (cookie-based session, refreshed by middleware)
export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) {
      if (typeof window === 'undefined') {
        // Return dummy chainable function for server/SSG pre-render
        return () => ({
          select: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
          eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
          order: () => Promise.resolve({ data: [], error: null }),
        });
      }
      throw new Error(
        'Supabase client is not initialized. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set.'
      );
    }
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

export default supabase;


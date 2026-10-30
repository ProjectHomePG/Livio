import { supabase } from '../lib/supabase';

const USER_KEY = 'user';
const TOKEN_KEY = 'token';

async function fetchProfile(authId, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, bio, city, profile_picture, created_at')
      .eq('auth_id', authId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return data;
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw new Error('Profile not found for this account.');
}

function storeSession(user, accessToken) {
  if (typeof window !== 'undefined') {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken || 'supabase-session');
  }
}

export const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message || 'Login failed.');
    const profile = await fetchProfile(data.user.id);
    storeSession(profile, data.session?.access_token);
    return profile;
  },

  register: async (name, email, password, phone, role = 'ROLE_USER') => {
    // Only user/owner can be self-selected; admin must be granted manually.
    const safeRole = role === 'ROLE_OWNER' ? 'ROLE_OWNER' : 'ROLE_USER';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, role: safeRole },
      },
    });
    if (error) throw new Error(error.message || 'Registration failed.');

    if (!data.session) {
      throw new Error(
        'Account created! Please check your email to confirm your account, then sign in.'
      );
    }
    const profile = await fetchProfile(data.user.id);
    storeSession(profile, data.session.access_token);
    return profile;
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out failed:', err.message);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    return true;
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getSessionUser: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;
      const profile = await fetchProfile(session.user.id, 1);
      storeSession(profile, session.access_token);
      return profile;
    } catch {
      return null;
    }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id, 1);
          storeSession(profile, session.access_token);
          callback(profile);
        } catch {
          callback(null);
        }
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
        callback(null);
      }
    });
  },

  updateProfile: async (profileUpdates) => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: profileUpdates.name ?? user.name,
        phone: profileUpdates.phone ?? user.phone,
        bio: profileUpdates.bio ?? user.bio,
        city: profileUpdates.city ?? user.city,
        profile_picture: profileUpdates.profilePicture ?? user.profile_picture,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    storeSession(data);
    return data;
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem(TOKEN_KEY) !== null &&
        localStorage.getItem(USER_KEY) !== null
      );
    }
    return false;
  },
};

export default authService;

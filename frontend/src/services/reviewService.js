import { supabase } from '../lib/supabase';
import authService from './authService';

export const reviewService = {
  getByPgId: async (pgId) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, user:profiles(id, name)')
        .eq('pg_id', pgId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        user: review.user,
      }));
    } catch (error) {
      console.warn('Reviews fetch failed:', error);
      return [];
    }
  },

  create: async (pgId, rating, comment) => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('You must be signed in to submit a review.');

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        pg_id: pgId,
        user_id: user.id,
        rating: Number(rating),
        comment: comment || '',
      })
      .select('id, rating, comment, created_at, user:profiles(id, name)')
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      rating: data.rating,
      comment: data.comment,
      createdAt: data.created_at,
      user: data.user,
    };
  },
};

export default reviewService;


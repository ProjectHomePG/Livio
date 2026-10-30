import { supabase } from '../lib/supabase';

/**
 * inquiryService handles booking inquiries and general contact messages.
 * Contact messages are posted without a pgId and surface in the admin inbox.
 * Reads/updates are restricted to admins by RLS; inserts are public.
 */
const inquiryService = {
  submitContact: async (contactData) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          pg_id: contactData.pgId ?? null,
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          message: contactData.message,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.warn('Submit Contact failed:', error.message);
      throw new Error(error.message || 'Server unavailable. Please try again later.');
    }
  },

  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('id, pg_id, name, email, phone, message, status, created_at, pg:pgs(id, title, slug)')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map((inq) => ({
        id: inq.id,
        name: inq.name,
        email: inq.email,
        phone: inq.phone,
        message: inq.message,
        status: inq.status,
        createdAt: inq.created_at,
        pg: inq.pg,
      }));
    } catch (error) {
      console.warn('Fetch Inquiries failed:', error.message);
      throw new Error(error.message || 'Server unavailable. Please try again later.');
    }
  },

  updateStatus: async (id, status) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.warn('Update Inquiry Status failed:', error.message);
      throw new Error(error.message || 'Server unavailable. Please try again later.');
    }
  },
};

export default inquiryService;

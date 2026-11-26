import { supabase } from '../lib/supabase';

export const storageService = {
  /**
   * Uploads an image file to the Supabase 'pg-images' bucket.
   * Returns public URL of the uploaded image.
   */
  uploadImage: async (file, folder = 'listings') => {
    if (!file) throw new Error('No file provided');

    const ext = file.name.split('.').pop() || 'jpg';
    const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

    const { data, error } = await supabase.storage
      .from('pg-images')
      .upload(fileName, file, {
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) {
      throw new Error(error.message || 'Image upload failed');
    }

    const { data: publicUrlData } = supabase.storage
      .from('pg-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  /**
   * Uploads multiple image files sequentially.
   */
  uploadMultipleImages: async (files, folder = 'listings') => {
    const urls = [];
    for (const file of files) {
      const url = await storageService.uploadImage(file, folder);
      urls.push(url);
    }
    return urls;
  },
};

export default storageService;

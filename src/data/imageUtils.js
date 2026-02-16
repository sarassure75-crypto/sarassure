import { supabase } from '@/lib/supabaseClient';

export const fetchImageUrls = async (imageIds) => {
  if (!imageIds || imageIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('app_images')
    .select('id, file_path')
    .in('id', imageIds);

  if (error) {
    console.error('Error fetching image paths:', error);
    return new Map();
  }

  const urlMap = new Map();
  for (const image of data) {
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(image.file_path);
    if (urlData && urlData.publicUrl) {
      urlMap.set(image.id, urlData.publicUrl);
    }
  }
  return urlMap;
};

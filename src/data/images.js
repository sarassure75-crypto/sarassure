
import { supabase, getImageUrl } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

let imagesCache = null;
let imagesPromise = null;
let categoriesCache = null;
let categoriesPromise = null;

export const fetchImages = async (forceRefresh = false) => {
  if (imagesCache && !forceRefresh) {
    return imagesCache;
  }

  if (imagesPromise && !forceRefresh) {
    return imagesPromise;
  }

  imagesPromise = (async () => {
    const { data, error } = await supabase
      .from('app_images')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching images:', error);
      imagesPromise = null; 
      throw error;
    }
    
    const { data: files, error: filesError } = await supabase.storage.from('images').list('public');
    if (filesError) {
      console.error('Error listing storage files:', filesError);
      // continue without metadata if storage fails
    }
    const filesMap = new Map(files?.map(f => [f.name, f]));

    const imagesWithUrls = data.map(image => {
      const fileName = image.file_path.replace('public/', '');
      const fileMetadata = filesMap.get(fileName)?.metadata;
      return {
        ...image,
        publicUrl: getImageUrl(image.file_path),
        metadata: { ...image.metadata, ...fileMetadata }
      }
    });

    imagesCache = new Map(imagesWithUrls.map(img => [img.id, img]));
    imagesPromise = null; 
    return imagesCache;
  })();

  return imagesPromise;
};

export const getImageCategories = async (forceRefresh = false) => {
  if (categoriesCache && !forceRefresh) {
    return categoriesCache;
  }
  if (categoriesPromise && !forceRefresh) {
    return categoriesPromise;
  }
  categoriesPromise = (async () => {
    const { data, error } = await supabase
      .rpc('get_distinct_image_categories');

    if (error) {
      console.error('Error fetching image categories:', error);
      categoriesPromise = null;
      return ['all', 'default'];
    }
    const cats = data.map(item => item.category);
    categoriesCache = ['all', ...new Set(cats.filter(Boolean))];
    categoriesPromise = null;
    return categoriesCache;
  })();
  return categoriesPromise;
};

const invalidateCache = () => {
  imagesCache = null;
  imagesPromise = null;
};
const invalidateCategoriesCache = () => {
  categoriesCache = null;
  categoriesPromise = null;
};


export const addImage = async (imageData) => {
  const { data, error } = await supabase
    .from('app_images')
    .insert([imageData])
    .select()
    .single();

  if (error) {
    console.error('Error adding image data:', error);
    throw error;
  }
  invalidateCache();
  if (!categoriesCache?.includes(imageData.category)) {
      invalidateCategoriesCache();
  }
  return data;
};

export const updateImage = async (id, updates) => {
  const { data, error } = await supabase
    .from('app_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating image data:', error);
    throw error;
  }
  invalidateCache();
  invalidateCategoriesCache();
  return data;
};

export const deleteImage = async (id, filePath) => {
    if (filePath) {
        const { error: fileError } = await supabase.storage.from('images').remove([filePath]);
        if (fileError && fileError.statusCode !== '404') {
            console.error('Error deleting image file from storage:', fileError);
            // Don't throw, just log, as we want to delete DB record anyway
        }
    }

    const { error: dbError } = await supabase.from('app_images').delete().eq('id', id);
    if (dbError) {
        console.error('Error deleting image data from database:', dbError);
        throw dbError;
    }
    invalidateCache();
    invalidateCategoriesCache();
};

export const addImageCategory = async (categoryName) => {
    // This is a dummy operation as categories are dynamic.
    // We invalidate cache to force a refresh which will include the new category if an image uses it.
    invalidateCategoriesCache();
    return { success: true, message: "Refresh category list to see changes after an image uses it." };
};

export const deleteImageCategory = async (categoryName) => {
    const { data: imagesInCategory, error: fetchError } = await supabase
        .from('app_images')
        .select('id')
        .eq('category', categoryName);

    if (fetchError) throw fetchError;

    if (imagesInCategory.length > 0) {
        throw new Error("Impossible de supprimer : des images utilisent encore cette catégorie.");
    }
    
    // As categories are just strings on images, there's nothing to delete from a separate table.
    // We just need to invalidate the cache.
    invalidateCategoriesCache();
    return { success: true };
};


export const getImageById = async (id) => {
    if (!id) return null;
    const { data, error } = await supabase.from('app_images').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error("Error fetching image by id:", error);
      throw error;
    }
    return data;
};

export const getImageByName = async (name) => {
    const { data, error } = await supabase.from('app_images').select('id, file_path').eq('name', name).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error("Error fetching image by name:", error);
      throw error;
    }
    return data;
};

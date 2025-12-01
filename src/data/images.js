
import { supabase, getImageUrl } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

let imagesCache = null;
let imagesPromise = null;
let categoriesCache = null;
let categoriesPromise = null;
let subcategoriesCache = {};
let subcategoriesPromise = {};

const CUSTOM_CATEGORIES_KEY = 'admin_custom_image_categories';

// Default subcategories for "Capture d'écran" category
export const DEFAULT_SUBCATEGORIES = ['général', 'parametres', 'first acces'];

const getCustomCategories = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCustomCategories = (categories) => {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving custom categories:', e);
  }
};

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
    const customCats = getCustomCategories();
    categoriesCache = ['all', ...new Set([...cats.filter(Boolean), ...customCats])];
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
const invalidateSubcategoriesCache = (category = null) => {
  if (category) {
    delete subcategoriesCache[category];
    delete subcategoriesPromise[category];
  } else {
    subcategoriesCache = {};
    subcategoriesPromise = {};
  }
};


export const addImage = async (imageData) => {
  const dataWithSubcategory = {
    ...imageData,
    subcategory: imageData.subcategory || 'général'
  };
  
  const { data, error } = await supabase
    .from('app_images')
    .insert([dataWithSubcategory])
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
  invalidateSubcategoriesCache(imageData.category);
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
  invalidateSubcategoriesCache();
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
    invalidateSubcategoriesCache();
};

export const addImageCategory = async (categoryName) => {
    const customCats = getCustomCategories();
    if (!customCats.includes(categoryName)) {
        customCats.push(categoryName);
        saveCustomCategories(customCats);
    }
    invalidateCategoriesCache();
    return { success: true, message: "Catégorie ajoutée avec succès." };
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
    
    // Remove from custom categories
    const customCats = getCustomCategories();
    const filtered = customCats.filter(cat => cat !== categoryName);
    saveCustomCategories(filtered);
    
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

export const getImageSubcategories = async (category = null, forceRefresh = false) => {
  const cacheKey = category || 'all';
  
  if (subcategoriesCache[cacheKey] && !forceRefresh) {
    return subcategoriesCache[cacheKey];
  }
  
  if (subcategoriesPromise[cacheKey] && !forceRefresh) {
    return subcategoriesPromise[cacheKey];
  }
  
  subcategoriesPromise[cacheKey] = (async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_distinct_image_subcategories', { category_filter: category });
      
      if (error) {
        console.error('Error fetching image subcategories:', error);
        // Return defaults if RPC fails
        subcategoriesCache[cacheKey] = DEFAULT_SUBCATEGORIES;
        delete subcategoriesPromise[cacheKey];
        return DEFAULT_SUBCATEGORIES;
      }
      
      const subcats = data.map(item => item.subcategory).filter(Boolean);
      // Ensure defaults are always present
      const merged = [...new Set([...DEFAULT_SUBCATEGORIES, ...subcats])];
      subcategoriesCache[cacheKey] = merged;
      delete subcategoriesPromise[cacheKey];
      return merged;
    } catch (err) {
      console.error('Error in getImageSubcategories:', err);
      subcategoriesCache[cacheKey] = DEFAULT_SUBCATEGORIES;
      delete subcategoriesPromise[cacheKey];
      return DEFAULT_SUBCATEGORIES;
    }
  })();
  
  return subcategoriesPromise[cacheKey];
};

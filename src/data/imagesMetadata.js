import { supabase, getImageUrl } from '../lib/supabaseClient';
import { logger } from '@/lib/logger';

/**
 * ============================================================================
 * API : IMAGES METADATA
 * Gestion enrichie de la bibliothèque d'images avec recherche et modération
 * ============================================================================
 */

// Limite de taille : 1 Mo
export const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB

// ============================================================================
// UPLOAD ET CRÉATION
// ============================================================================

/**
 * Upload une image vers Supabase Storage avec métadonnées
 * Note: L'image doit être redimensionnée AVANT l'upload (limite 1 Mo)
 */
export async function uploadImageWithMetadata(file, metadata, userId, bucketName = 'images') {
  try {
    // Vérification taille
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(
        `L'image dépasse la taille maximale de ${
          MAX_IMAGE_SIZE / 1024 / 1024
        } Mo. Veuillez la redimensionner.`
      );
    }

    // 1. Upload vers Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file);

    if (uploadError) throw uploadError;

    // 2. Récupérer l'URL publique
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    // 3. Créer les métadonnées en base
    const { data: metaData, error: metaError } = await supabase
      .from('images_metadata')
      .insert([
        {
          storage_path: fileName,
          storage_bucket: bucketName,
          public_url: urlData.publicUrl,
          title: metadata.title || file.name,
          description: metadata.description || '',
          tags: metadata.tags || [],
          category: metadata.category || 'Autre',
          uploaded_by: userId,
          width: metadata.width || null,
          height: metadata.height || null,
          file_size: file.size,
          mime_type: file.type,
          moderation_status: 'pending',
        },
      ])
      .select()
      .single();

    if (metaError) throw metaError;

    return { success: true, data: metaData };
  } catch (error) {
    logger.error('Error uploading image with metadata:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mettre à jour les métadonnées d'une image
 */
export async function updateImageMetadata(imageId, updates) {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .update(updates)
      .eq('id', imageId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error updating image metadata:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// RECHERCHE ET FILTRAGE
// ============================================================================

/**
 * Rechercher des images avec filtres avancés
 * Inclut les images contributeurs ET les images admin approuvées
 */
export async function searchImages(filters = {}) {
  try {
    let allImages = [];

    // Charger depuis app_images (admin) EN PREMIER
    try {
      let adminQuery = supabase.from('app_images').select('*');

      // Les images admin devraient être approuvées (colonne moderation_status n'existe peut-être pas encore)
      if (filters.category) {
        adminQuery = adminQuery.eq('category', filters.category);
      }

      if (filters.searchText) {
        adminQuery = adminQuery.or(
          `name.ilike.%${filters.searchText}%,description.ilike.%${filters.searchText}%`
        );
      }

      adminQuery = adminQuery.order('created_at', { ascending: false });

      if (filters.limit) {
        adminQuery = adminQuery.limit(Math.floor(filters.limit / 2));
      }

      const { data: adminImages, error: adminError } = await adminQuery;

      if (!adminError && adminImages) {
        allImages = allImages.concat(
          adminImages.map((img) => ({
            ...img,
            id: img.id,
            title: img.name || img.file_path,
            description: img.description || '',
            public_url: getImageUrl(img.file_path),
            source: 'admin',
            category: img.category || 'Autre',
            uploaded_by: { id: 'admin', first_name: 'Admin', last_name: '', email: 'admin' },
            moderation_status: img.moderation_status || 'approved',
          }))
        );
      }
    } catch (err) {
      console.warn('Erreur chargement images admin:', err);
    }

    // Essayer de charger depuis images_metadata (contributeurs)
    try {
      let contributorQuery = supabase.from('images_metadata').select(`
          *,
          uploader:uploaded_by (
            id,
            first_name,
            last_name,
            email
          )
        `);

      // Filtre par statut de modération
      if (filters.moderationStatus) {
        contributorQuery = contributorQuery.eq('moderation_status', filters.moderationStatus);
      } else {
        contributorQuery = contributorQuery.eq('moderation_status', 'approved');
      }

      if (filters.category) {
        contributorQuery = contributorQuery.eq('category', filters.category);
      }

      if (filters.tags && filters.tags.length > 0) {
        contributorQuery = contributorQuery.overlaps('tags', filters.tags);
      }

      if (filters.searchText) {
        contributorQuery = contributorQuery.or(
          `title.ilike.%${filters.searchText}%,description.ilike.%${filters.searchText}%`
        );
      }

      if (filters.uploadedBy) {
        contributorQuery = contributorQuery.eq('uploaded_by', filters.uploadedBy);
      }

      if (filters.dateFrom) {
        contributorQuery = contributorQuery.gte('uploaded_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        contributorQuery = contributorQuery.lte('uploaded_at', filters.dateTo);
      }

      if (filters.minUsage !== undefined) {
        contributorQuery = contributorQuery.gte('usage_count', filters.minUsage);
      }
      if (filters.maxUsage !== undefined) {
        contributorQuery = contributorQuery.lte('usage_count', filters.maxUsage);
      }

      const orderBy = filters.orderBy || 'uploaded_at';
      const ascending = filters.ascending !== undefined ? filters.ascending : false;
      contributorQuery = contributorQuery.order(orderBy, { ascending });

      if (filters.limit) {
        contributorQuery = contributorQuery.limit(Math.floor(filters.limit / 2));
      }
      if (filters.offset) {
        contributorQuery = contributorQuery.range(
          filters.offset,
          filters.offset + (filters.limit || 20) - 1
        );
      }

      const { data: contributorImages, error: contribError } = await contributorQuery;

      if (!contribError && contributorImages) {
        allImages = allImages.concat(
          contributorImages.map((img) => ({
            ...img,
            source: 'contributor',
            public_url: img.public_url || img.file_path,
          }))
        );
      }
    } catch (err) {
      console.warn('Erreur requête images_metadata:', err);
    }

    return { success: true, data: allImages };
  } catch (error) {
    logger.error('Error searching images:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer une image par ID
 */
export async function getImageById(imageId) {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .select(
        `
        *,
        uploader:uploaded_by (
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .eq('id', imageId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error fetching image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les images d'un utilisateur
 */
export async function getMyImages(userId, filters = {}) {
  try {
    let query = supabase.from('images_metadata').select('*').eq('uploaded_by', userId);

    // Filtre par statut
    if (filters.moderationStatus) {
      query = query.eq('moderation_status', filters.moderationStatus);
    }

    query = query.order('uploaded_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error fetching my images:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// MODÉRATION (ADMIN)
// ============================================================================

/**
 * Admin : Récupérer images en attente de modération
 */
export async function getPendingImages(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .select(
        `
        *,
        uploader:uploaded_by (
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .eq('moderation_status', 'pending')
      .order('uploaded_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error fetching pending images:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Approuver une image
 */
export async function approveImage(imageId, moderatorId) {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .update({
        moderation_status: 'approved',
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', imageId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error approving image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Rejeter une image
 */
export async function rejectImage(imageId, moderatorId, reason = '') {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .update({
        moderation_status: 'rejected',
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', imageId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error rejecting image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Approuver plusieurs images en masse
 */
export async function bulkApproveImages(imageIds, moderatorId) {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .update({
        moderation_status: 'approved',
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString(),
      })
      .in('id', imageIds)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error bulk approving images:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Rejeter plusieurs images en masse
 */
export async function bulkRejectImages(imageIds, moderatorId, reason = '') {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .update({
        moderation_status: 'rejected',
        moderated_by: moderatorId,
        moderated_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .in('id', imageIds)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error bulk rejecting images:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// UTILISATION ET STATISTIQUES
// ============================================================================

/**
 * Incrémenter le compteur d'utilisation d'une image
 * (appelé quand une image est utilisée dans un exercice)
 */
export async function incrementImageUsage(imageId, taskId) {
  try {
    const { data, error } = await supabase.rpc('increment_image_usage', {
      p_image_id: imageId,
      p_task_id: taskId,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error('Error incrementing image usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les exercices utilisant une image
 */
export async function getImageUsage(imageId) {
  try {
    const { data: image, error } = await supabase
      .from('images_metadata')
      .select('used_in_tasks')
      .eq('id', imageId)
      .single();

    if (error) throw error;

    if (!image.used_in_tasks || image.used_in_tasks.length === 0) {
      return { success: true, data: [] };
    }

    // Récupérer les détails des tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, category, subcategory')
      .in('id', image.used_in_tasks);

    if (tasksError) throw tasksError;

    return { success: true, data: tasks };
  } catch (error) {
    logger.error('Error fetching image usage:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// SUPPRESSION
// ============================================================================

/**
 * Supprimer une image (avec vérification qu'elle n'est pas utilisée)
 */
export async function deleteImage(imageId, _userId) {
  try {
    // 1. Vérifier que l'image n'est pas utilisée
    const { data: image, error: fetchError } = await supabase
      .from('images_metadata')
      .select('*')
      .eq('id', imageId)
      .single();

    if (fetchError) throw fetchError;

    if (image.usage_count > 0) {
      throw new Error('Cette image est utilisée dans des exercices et ne peut pas être supprimée.');
    }

    // 2. Supprimer de Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(image.storage_bucket)
      .remove([image.storage_path]);

    if (storageError) throw storageError;

    // 3. Supprimer les métadonnées
    const { error: deleteError } = await supabase
      .from('images_metadata')
      .delete()
      .eq('id', imageId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    logger.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// TAGS ET CATÉGORIES
// ============================================================================

/**
 * Récupérer tous les tags utilisés
 */
export async function getAllTags() {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .select('tags')
      .eq('moderation_status', 'approved');

    if (error) throw error;

    // Extraire et dédupliquer les tags
    const tagsSet = new Set();
    data.forEach((row) => {
      if (row.tags) {
        row.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    return { success: true, data: Array.from(tagsSet).sort() };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer toutes les catégories utilisées
 */
export async function getAllCategories() {
  try {
    const { data, error } = await supabase
      .from('images_metadata')
      .select('category')
      .eq('moderation_status', 'approved')
      .not('category', 'is', null);

    if (error) throw error;

    // Dédupliquer
    const categoriesSet = new Set(data.map((row) => row.category));

    return { success: true, data: Array.from(categoriesSet).sort() };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// STATISTIQUES IMAGES
// ============================================================================

/**
 * Statistiques globales de la bibliothèque d'images
 */
export async function getImageLibraryStats() {
  try {
    const { data: totalData, error: totalError } = await supabase
      .from('images_metadata')
      .select('*', { count: 'exact', head: true });

    const { data: approvedData, error: approvedError } = await supabase
      .from('images_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'approved');

    const { data: pendingData, error: pendingError } = await supabase
      .from('images_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'pending');

    const { data: rejectedData, error: rejectedError } = await supabase
      .from('images_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'rejected');

    if (totalError || approvedError || pendingError || rejectedError) {
      throw totalError || approvedError || pendingError || rejectedError;
    }

    return {
      success: true,
      data: {
        total: totalData.count || 0,
        approved: approvedData.count || 0,
        pending: pendingData.count || 0,
        rejected: rejectedData.count || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching image library stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Compter les images en attente (pour badge admin)
 */
export async function countPendingImages() {
  try {
    const { count, error } = await supabase
      .from('images_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'pending');

    if (error) throw error;
    return { success: true, count };
  } catch (error) {
    console.error('Error counting pending images:', error);
    return { success: false, error: error.message, count: 0 };
  }
}

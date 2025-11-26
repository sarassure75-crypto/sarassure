import { useState, useEffect } from 'react';
import {
  searchImages,
  getImageById,
  getMyImages,
  getPendingImages,
  uploadImageWithMetadata,
  updateImageMetadata,
  approveImage,
  rejectImage,
  bulkApproveImages,
  bulkRejectImages,
  deleteImage,
  getAllTags,
  getAllCategories,
  getImageLibraryStats,
  countPendingImages
} from '../data/imagesMetadata';

/**
 * ============================================================================
 * HOOK : useImageLibrary
 * Recherche et navigation dans la bibliothèque d'images
 * ============================================================================
 */
export function useImageLibrary(filters = {}, autoFetch = true) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);

    const result = await searchImages(filters);

    if (result.success) {
      // Afficher TOUTES les images approuvées (y compris celles des admins)
      setImages(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchImages();
    }
  }, [JSON.stringify(filters), autoFetch]);

  return {
    images,
    loading,
    error,
    refresh: fetchImages,
    search: (newFilters) => {
      return searchImages(newFilters);
    }
  };
}

/**
 * ============================================================================
 * HOOK : useMyImages
 * Images uploadées par l'utilisateur courant
 * ============================================================================
 */
export function useMyImages(userId, filters = {}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyImages = async () => {
    setLoading(true);
    setError(null);

    const result = await getMyImages(userId, filters);

    if (result.success) {
      setImages(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchMyImages();
    }
  }, [userId, JSON.stringify(filters)]);

  return {
    images,
    loading,
    error,
    refresh: fetchMyImages
  };
}

/**
 * ============================================================================
 * HOOK : usePendingImages (Admin)
 * Images en attente de modération
 * ============================================================================
 */
export function usePendingImages(limit = 50) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  const fetchPendingImages = async () => {
    setLoading(true);
    setError(null);

    const result = await getPendingImages(limit);

    if (result.success) {
      setImages(result.data);
      setCount(result.data.length);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPendingImages();
  }, [limit]);

  return {
    images,
    count,
    loading,
    error,
    refresh: fetchPendingImages
  };
}

/**
 * ============================================================================
 * HOOK : useImageUpload
 * Upload d'images avec métadonnées
 * ============================================================================
 */
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = async (file, metadata, userId) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulation de progression (Supabase ne fournit pas de vrai progress)
      setProgress(30);

      const result = await uploadImageWithMetadata(file, metadata, userId);

      setProgress(100);

      if (!result.success) {
        setError(result.error);
      }

      setUploading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setUploading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    upload,
    uploading,
    progress,
    error
  };
}

/**
 * ============================================================================
 * HOOK : useImageActions
 * Actions sur les images (modération, mise à jour, suppression)
 * ============================================================================
 */
export function useImageActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateMetadata = async (imageId, updates) => {
    setLoading(true);
    setError(null);

    const result = await updateImageMetadata(imageId, updates);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const approve = async (imageId, moderatorId) => {
    setLoading(true);
    setError(null);

    const result = await approveImage(imageId, moderatorId);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const reject = async (imageId, moderatorId, reason) => {
    setLoading(true);
    setError(null);

    const result = await rejectImage(imageId, moderatorId, reason);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const bulkApprove = async (imageIds, moderatorId) => {
    setLoading(true);
    setError(null);

    const result = await bulkApproveImages(imageIds, moderatorId);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const bulkReject = async (imageIds, moderatorId, reason) => {
    setLoading(true);
    setError(null);

    const result = await bulkRejectImages(imageIds, moderatorId, reason);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  const remove = async (imageId, userId) => {
    setLoading(true);
    setError(null);

    const result = await deleteImage(imageId, userId);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }

    return result;
  };

  return {
    loading,
    error,
    updateMetadata,
    approve,
    reject,
    bulkApprove,
    bulkReject,
    remove
  };
}

/**
 * ============================================================================
 * HOOK : useImageTags
 * Récupération de tous les tags disponibles
 * ============================================================================
 */
export function useImageTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);

    const result = await getAllTags();

    if (result.success) {
      setTags(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    refresh: fetchTags
  };
}

/**
 * ============================================================================
 * HOOK : useImageCategories
 * Récupération de toutes les catégories disponibles
 * ============================================================================
 */
export function useImageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    const result = await getAllCategories();

    if (result.success) {
      setCategories(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories
  };
}

/**
 * ============================================================================
 * HOOK : useImageLibraryStats
 * Statistiques globales de la bibliothèque
 * ============================================================================
 */
export function useImageLibraryStats() {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    const result = await getImageLibraryStats();

    if (result.success) {
      setStats(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
}

/**
 * ============================================================================
 * HOOK : usePendingImagesCount (pour badge admin)
 * Compte les images en attente
 * ============================================================================
 */
export function usePendingImagesCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    setLoading(true);
    const result = await countPendingImages();
    if (result.success) {
      setCount(result.count);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCount();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    count,
    loading,
    refresh: fetchCount
  };
}

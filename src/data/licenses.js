import { supabase } from '@/lib/supabaseClient';

/**
 * Récupère toutes les licences d'un formateur
 * @param {string} trainerId - L'ID du formateur
 * @returns {Promise<Array>} Liste des licences avec les détails des catégories
 */
export const getTrainerLicenses = async (trainerId) => {
  const { data, error } = await supabase
    .from('trainer_category_licenses')
    .select(`
      *,
      category:task_categories(*)
    `)
    .eq('trainer_id', trainerId)
    .eq('is_active', true);

  if (error) {
    console.error('Erreur lors de la récupération des licences:', error);
    throw error;
  }

  return data || [];
};

/**
 * Vérifie si un formateur a une licence active pour une catégorie
 * @param {string} trainerId - L'ID du formateur
 * @param {string} categoryId - L'ID de la catégorie
 * @returns {Promise<boolean>}
 */
export const hasLicenseForCategory = async (trainerId, categoryId) => {
  const { data, error } = await supabase
    .from('trainer_category_licenses')
    .select('id')
    .eq('trainer_id', trainerId)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Erreur lors de la vérification de la licence:', error);
    return false;
  }

  // Vérifier l'expiration
  if (data && data.expires_at) {
    return new Date(data.expires_at) > new Date();
  }

  return !!data;
};

/**
 * Active une licence pour un formateur (Admin only)
 * @param {string} trainerId - L'ID du formateur
 * @param {string} categoryId - L'ID de la catégorie
 * @param {Date|null} expiresAt - Date d'expiration (null = à vie)
 * @returns {Promise<Object>}
 */
export const activateLicense = async (trainerId, categoryId, expiresAt = null) => {
  const { data, error } = await supabase
    .from('trainer_category_licenses')
    .upsert({
      trainer_id: trainerId,
      category_id: categoryId,
      is_active: true,
      expires_at: expiresAt
    }, {
      onConflict: 'trainer_id,category_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'activation de la licence:', error);
    throw error;
  }

  return data;
};

/**
 * Désactive une licence
 * @param {string} trainerId - L'ID du formateur
 * @param {string} categoryId - L'ID de la catégorie
 */
export const deactivateLicense = async (trainerId, categoryId) => {
  const { error } = await supabase
    .from('trainer_category_licenses')
    .update({ is_active: false })
    .eq('trainer_id', trainerId)
    .eq('category_id', categoryId);

  if (error) {
    console.error('Erreur lors de la désactivation de la licence:', error);
    throw error;
  }
};

/**
 * Récupère toutes les catégories avec le statut de licence pour un formateur
 * @param {string} trainerId - L'ID du formateur
 * @returns {Promise<Array>} Catégories avec statut de licence
 */
export const getCategoriesWithLicenseStatus = async (trainerId) => {
  // Récupérer toutes les catégories
  const { data: categories, error: catError } = await supabase
    .from('task_categories')
    .select('*')
    .order('name');

  if (catError) {
    console.error('Erreur lors de la récupération des catégories:', catError);
    throw catError;
  }

  // Récupérer les licences du formateur
  const { data: licenses, error: licError } = await supabase
    .from('trainer_category_licenses')
    .select('category_id, is_active, expires_at')
    .eq('trainer_id', trainerId);

  if (licError) {
    console.error('Erreur lors de la récupération des licences:', licError);
    throw licError;
  }

  // Fusionner les données
  const licenseMap = new Map(
    licenses?.map(l => [l.category_id, l]) || []
  );

  return categories.map(cat => ({
    ...cat,
    hasLicense: licenseMap.has(cat.id) && licenseMap.get(cat.id).is_active,
    expiresAt: licenseMap.get(cat.id)?.expires_at
  }));
};

/**
 * Attribue une licence de catégorie à un apprenant
 * @param {string} learnerId - L'ID de l'apprenant
 * @param {number} categoryId - L'ID de la catégorie
 * @param {string} trainerId - L'ID du formateur qui attribue (optionnel)
 * @returns {Promise<Object>}
 */
export const assignCategoryToLearner = async (learnerId, categoryId, trainerId = null) => {
  const { data, error } = await supabase
    .from('learner_category_licenses')
    .upsert({
      learner_id: learnerId,
      category_id: categoryId,
      assigned_by_trainer_id: trainerId
    }, {
      onConflict: 'learner_id,category_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'attribution de la catégorie:', error);
    throw error;
  }

  return data;
};

/**
 * Retire une licence de catégorie d'un apprenant
 * @param {string} learnerId - L'ID de l'apprenant
 * @param {number} categoryId - L'ID de la catégorie
 */
export const removeCategoryFromLearner = async (learnerId, categoryId) => {
  const { error } = await supabase
    .from('learner_category_licenses')
    .delete()
    .eq('learner_id', learnerId)
    .eq('category_id', categoryId);

  if (error) {
    console.error('Erreur lors du retrait de la catégorie:', error);
    throw error;
  }
};

/**
 * Récupère les licences d'un apprenant
 * @param {string} learnerId - L'ID de l'apprenant
 * @returns {Promise<Array>}
 */
export const getLearnerLicenses = async (learnerId) => {
  const { data, error } = await supabase
    .from('learner_category_licenses')
    .select(`
      *,
      category:task_categories(*)
    `)
    .eq('learner_id', learnerId);

  if (error) {
    console.error('Erreur lors de la récupération des licences apprenant:', error);
    throw error;
  }

  return data || [];
};

/**
 * Récupère les catégories avec le statut de licence pour un apprenant
 * @param {string} learnerId - L'ID de l'apprenant
 * @returns {Promise<Array>}
 */
export const getCategoriesWithLicenseStatusForLearner = async (learnerId) => {
  // Récupérer toutes les catégories
  const { data: categories, error: catError } = await supabase
    .from('task_categories')
    .select('*')
    .order('name');

  if (catError) {
    console.error('Erreur lors de la récupération des catégories:', catError);
    throw catError;
  }

  // Récupérer les licences de l'apprenant
  const { data: licenses, error: licError } = await supabase
    .from('learner_category_licenses')
    .select('category_id')
    .eq('learner_id', learnerId);

  if (licError) {
    console.error('Erreur lors de la récupération des licences:', licError);
    throw licError;
  }

  // Fusionner les données
  const licenseSet = new Set((licenses || []).map(l => l.category_id));

  return categories.map(cat => ({
    ...cat,
    hasLicense: licenseSet.has(cat.id)
  }));
};

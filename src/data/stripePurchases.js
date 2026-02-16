import { supabase } from '@/lib/supabaseClient';

/**
 * Récupère tous les forfaits de licences disponibles
 * @returns {Promise<Array>}
 */
export const getLicensePackages = async () => {
  try {
    const { data, error } = await supabase
      .from('license_packages')
      .select('*')
      .order('quantity', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur lors de la récupération des forfaits:', err);
    throw err;
  }
};

/**
 * Crée un achat de licences (avant paiement Stripe)
 * @param {Object} purchaseData
 * @param {number} purchaseData.packageId - ID du forfait
 * @param {string} purchaseData.trainerIdId - ID du formateur
 * @returns {Promise<Object>}
 */
export const createLicensePurchase = async ({ packageId, trainerId }) => {
  try {
    // Récupérer le forfait
    const { data: packageData, error: pkgError } = await supabase
      .from('license_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError) throw new Error('Forfait non trouvé');

    // Créer l'achat
    const { data, error } = await supabase
      .from('license_purchases')
      .insert({
        trainer_id: trainerId,
        package_id: packageId,
        quantity: packageData.quantity,
        amount_cents: packageData.price_cents,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erreur lors de la création de l'achat:", err);
    throw err;
  }
};

/**
 * Met à jour le statut d'un achat après paiement Stripe
 * @param {string} purchaseId - ID de l'achat
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>}
 */
export const updatePurchaseStatus = async (purchaseId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('license_purchases')
      .update({
        ...updateData,
        completed_at: updateData.status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'achat:", err);
    throw err;
  }
};

/**
 * Récupère tous les achats d'un formateur
 * @param {string} trainerId - ID du formateur
 * @returns {Promise<Array>}
 */
export const getTrainerPurchases = async (trainerId) => {
  try {
    const { data, error } = await supabase
      .from('license_purchases')
      .select(
        `
        *,
        license_packages (
          name,
          quantity,
          price_cents
        )
      `
      )
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur lors de la récupération des achats:', err);
    throw err;
  }
};

/**
 * Récupère les licences achetées disponibles (non assignées)
 * @param {string} trainerId - ID du formateur
 * @returns {Promise<Array>}
 */
export const getAvailablePurchasedLicenses = async (trainerId) => {
  try {
    const { data, error } = await supabase
      .from('purchased_licenses')
      .select(
        `
        *,
        task_categories (
          id,
          name
        )
      `
      )
      .eq('trainer_id', trainerId)
      .eq('is_assigned', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erreur lors de la récupération des licences disponibles:', err);
    throw err;
  }
};

/**
 * Assigne une licence achetée à un apprenant
 * @param {string} purchasedLicenseId - ID de la licence achetée
 * @param {string} learnerId - ID de l'apprenant
 * @returns {Promise<Object>}
 */
export const assignPurchasedLicense = async (purchasedLicenseId, learnerId) => {
  try {
    const { data, error } = await supabase
      .from('purchased_licenses')
      .update({
        learner_id: learnerId,
        is_assigned: true,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', purchasedLicenseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erreur lors de l'assignation de la licence:", err);
    throw err;
  }
};

/**
 * Récupère le nombre de licences disponibles par catégorie
 * @param {string} trainerId - ID du formateur
 * @returns {Promise<Object>} - {categoryId: count}
 */
export const getAvailableLicensesByCategory = async (trainerId) => {
  try {
    const { data, error } = await supabase
      .from('purchased_licenses')
      .select('category_id')
      .eq('trainer_id', trainerId)
      .eq('is_assigned', false);

    if (error) throw error;

    // Compter par catégorie
    const counts = {};
    (data || []).forEach((license) => {
      counts[license.category_id] = (counts[license.category_id] || 0) + 1;
    });

    return counts;
  } catch (err) {
    console.error('Erreur lors du comptage des licences:', err);
    throw err;
  }
};

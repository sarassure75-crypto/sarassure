/**
 * ============================================================================
 * Contributor Revenue Tracking Functions
 * ============================================================================
 * Functions to track and retrieve revenue data for contributors
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Get revenue statistics for a contributor
 * @param {string} contributorId - The contributor's user ID
 * @returns {Promise<Object>} Revenue data with exercises, images, total, and milestones
 */
export const getContributorRevenue = async (contributorId) => {
  try {
    const { data, error } = await supabase
      .from('contributor_revenue_summary')
      .select('*')
      .eq('contributor_id', contributorId)
      .single();

    if (error) {
      // Handle both missing data (PGRST116) and view not found (406)
      if (error.code === 'PGRST116' || error.code === 'PGRST301' || error.status === 406) {
        // No data found or view doesn't exist, return empty structure
        console.warn('Contributor revenue summary not available, returning empty structure:', error.message);
        return {
          exercise_sales_count: 0,
          exercise_revenue_cents: 0,
          image_sales_count: 0,
          image_revenue_cents: 0,
          total_revenue_cents: 0,
          total_sales_count: 0,
          milestone_count: 0
        };
      }
      throw error;
    }

    return data || {
      exercise_sales_count: 0,
      exercise_revenue_cents: 0,
      image_sales_count: 0,
      image_revenue_cents: 0,
      total_revenue_cents: 0,
      total_sales_count: 0,
      milestone_count: 0
    };
  } catch (err) {
    console.error('Error fetching contributor revenue:', err);
    // Return empty structure on error to prevent page crash
    return {
      exercise_sales_count: 0,
      exercise_revenue_cents: 0,
      image_sales_count: 0,
      image_revenue_cents: 0,
      total_revenue_cents: 0,
      total_sales_count: 0,
      milestone_count: 0
    };
  }
};

/**
 * Record a sale for an exercise
 * @param {Object} saleData - Sale information
 * @param {string} saleData.exerciseId - Exercise ID
 * @param {string} saleData.versionId - Version ID (optional)
 * @param {string} saleData.contributorId - Contributor's user ID
 * @param {string} saleData.buyerId - Buyer's user ID
 * @param {number} saleData.priceCents - Price in cents (default: 1000 = €10)
 * @returns {Promise<Object>} Created sale record
 */
export const recordExerciseSale = async ({
  exerciseId,
  versionId,
  contributorId,
  buyerId,
  priceCents = 1000
}) => {
  try {
    const { data, error } = await supabase
      .from('contributor_exercise_sales')
      .insert([{
        exercise_id: exerciseId,
        version_id: versionId,
        contributor_id: contributorId,
        buyer_id: buyerId,
        price_cents: priceCents
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error recording exercise sale:', err);
    throw err;
  }
};

/**
 * Record a sale for an image
 * @param {Object} saleData - Sale information
 * @param {string} saleData.imageId - Image metadata ID
 * @param {string} saleData.contributorId - Contributor's user ID
 * @param {string} saleData.buyerId - Buyer's user ID
 * @param {number} saleData.priceCents - Price in cents (default: 500 = €5)
 * @returns {Promise<Object>} Created sale record
 */
export const recordImageSale = async ({
  imageId,
  contributorId,
  buyerId,
  priceCents = 500
}) => {
  try {
    const { data, error } = await supabase
      .from('contributor_image_sales')
      .insert([{
        image_id: imageId,
        contributor_id: contributorId,
        buyer_id: buyerId,
        price_cents: priceCents
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error recording image sale:', err);
    throw err;
  }
};

/**
 * Get all exercise sales for a contributor
 * @param {string} contributorId - Contributor's user ID
 * @param {number} limit - Number of records to return (default: 100)
 * @returns {Promise<Array>} List of exercise sales
 */
export const getContributorExerciseSales = async (contributorId, limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('contributor_exercise_sales')
      .select(`
        *,
        task:tasks(title),
        version:versions(name),
        buyer:profiles(first_name, last_name, email)
      `)
      .eq('contributor_id', contributorId)
      .order('purchase_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching exercise sales:', err);
    throw err;
  }
};

/**
 * Get all image sales for a contributor
 * @param {string} contributorId - Contributor's user ID
 * @param {number} limit - Number of records to return (default: 100)
 * @returns {Promise<Array>} List of image sales
 */
export const getContributorImageSales = async (contributorId, limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('contributor_image_sales')
      .select(`
        *,
        image:images_metadata(title, name),
        buyer:profiles(first_name, last_name, email)
      `)
      .eq('contributor_id', contributorId)
      .order('purchase_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching image sales:', err);
    throw err;
  }
};

/**
 * Calculate milestone progress (€1000 increments)
 * @param {number} totalRevenueCents - Total revenue in cents
 * @returns {Object} Current and next milestone information
 */
export const calculateMilestoneProgress = (totalRevenueCents) => {
  const milestoneCents = 100000; // €1000
  const currentMilestone = Math.floor(totalRevenueCents / milestoneCents);
  const nextMilestone = currentMilestone + 1;
  const progressInMilestone = totalRevenueCents % milestoneCents;
  const progressPercent = (progressInMilestone / milestoneCents) * 100;

  return {
    currentMilestone,
    nextMilestone,
    progressCents: progressInMilestone,
    progressPercent,
    totalRevenueCents,
    milestoneCents,
    currentMilestoneEuro: currentMilestone * 1000,
    nextMilestoneEuro: nextMilestone * 1000
  };
};

/**
 * Format revenue as currency string
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted currency (e.g., "€10.50")
 */
export const formatRevenue = (cents) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100);
};

/**
 * Get revenue statistics for multiple contributors (Admin)
 * @param {number} limit - Number of top contributors to return
 * @returns {Promise<Array>} Top contributors by revenue
 */
export const getTopContributorsByRevenue = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('contributor_revenue_summary')
      .select('*')
      .order('total_revenue_cents', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching top contributors:', err);
    throw err;
  }
};

/**
 * Get total platform revenue
 * @returns {Promise<Object>} Total revenue statistics
 */
export const getPlatformRevenueStats = async () => {
  try {
    // Exercise sales total
    const { data: exerciseStats, error: exerciseError } = await supabase
      .from('contributor_exercise_sales')
      .select('price_cents', { count: 'exact' });

    // Image sales total
    const { data: imageStats, error: imageError } = await supabase
      .from('contributor_image_sales')
      .select('price_cents', { count: 'exact' });

    if (exerciseError || imageError) {
      throw exerciseError || imageError;
    }

    const exerciseRevenue = (exerciseStats || []).reduce((sum, sale) => sum + sale.price_cents, 0);
    const imageRevenue = (imageStats || []).reduce((sum, sale) => sum + sale.price_cents, 0);
    const totalRevenue = exerciseRevenue + imageRevenue;

    return {
      exercise_revenue_cents: exerciseRevenue,
      exercise_count: exerciseStats?.length || 0,
      image_revenue_cents: imageRevenue,
      image_count: imageStats?.length || 0,
      total_revenue_cents: totalRevenue,
      total_sales: (exerciseStats?.length || 0) + (imageStats?.length || 0)
    };
  } catch (err) {
    console.error('Error fetching platform revenue stats:', err);
    throw err;
  }
};

export default {
  getContributorRevenue,
  recordExerciseSale,
  recordImageSale,
  getContributorExerciseSales,
  getContributorImageSales,
  calculateMilestoneProgress,
  formatRevenue,
  getTopContributorsByRevenue,
  getPlatformRevenueStats
};

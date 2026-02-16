import { useState, useEffect, useCallback } from 'react';
import { getContributorRevenue } from '@/data/contributorRevenue';

/**
 * Hook: Get contributor revenue statistics
 * @param {string} contributorId - The contributor's user ID
 * @returns {Object} Revenue stats, loading state, error, and refresh function
 */
export function useContributorRevenue(contributorId) {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenue = useCallback(async () => {
    if (!contributorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getContributorRevenue(contributorId);
      setRevenue(data);
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contributorId]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return {
    revenue,
    loading,
    error,
    refresh: fetchRevenue,
  };
}

export default useContributorRevenue;

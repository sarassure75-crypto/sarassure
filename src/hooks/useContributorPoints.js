import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook: Get contributor points and platform total points
 * @param {string} contributorId - The contributor's user ID
 * @returns {Object} Points data (contributor total, platform total), loading state, and error
 */
export function useContributorPoints(contributorId) {
  const [points, setPoints] = useState({
    contributorTotal: 0,
    platformTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contributorId) {
      setLoading(false);
      return;
    }

    const fetchPoints = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get contributor's total points
        const { data: contributorData, error: contributorError } = await supabase
          .from('contributor_points')
          .select('total_points')
          .eq('contributor_id', contributorId)
          .single();

        if (contributorError && contributorError.code !== 'PGRST116') {
          throw contributorError;
        }

        const contributorPoints = contributorData?.total_points || 0;

        // Get platform total points (sum of all contributors)
        const { data: platformData, error: platformError } = await supabase
          .from('contributor_points')
          .select('total_points');

        if (platformError) {
          throw platformError;
        }

        const platformTotal = (platformData || []).reduce(
          (sum, row) => sum + (row.total_points || 0),
          0
        );

        setPoints({
          contributorTotal: contributorPoints,
          platformTotal: platformTotal,
        });
      } catch (err) {
        console.error('Error fetching points:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [contributorId]);

  return {
    points,
    loading,
    error,
  };
}

export default useContributorPoints;

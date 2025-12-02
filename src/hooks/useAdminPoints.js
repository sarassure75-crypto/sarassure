import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook: Get all contributors with their points and admin points
 * @returns {Object} Contributors list, loading state, error, and functions to update points
 */
export function useAdminPoints() {
  const [contributors, setContributors] = useState([]);
  const [adminPoints, setAdminPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all contributors with their points
  const fetchContributors = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all profiles with their role
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, role, created_at');

      if (profilesError) throw profilesError;

      // Get all contributor points
      const { data: pointsData, error: pointsError } = await supabase
        .from('contributor_points')
        .select('contributor_id, total_points, last_updated');

      if (pointsError) throw pointsError;

      // Create a map of points by contributor ID
      const pointsMap = {};
      (pointsData || []).forEach(row => {
        pointsMap[row.contributor_id] = {
          total_points: row.total_points,
          last_updated: row.last_updated
        };
      });

      // Merge profiles with points data
      const contributorsWithPoints = (profilesData || [])
        .filter(profile => profile.role === 'contributor')
        .map(profile => ({
          id: profile.id,
          username: profile.username,
          role: profile.role,
          total_points: pointsMap[profile.id]?.total_points || 0,
          last_updated: pointsMap[profile.id]?.last_updated || profile.created_at,
          created_at: profile.created_at
        }))
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0));

      setContributors(contributorsWithPoints);

      // Calculate admin points (all points from admin user)
      const adminProfile = profilesData?.find(p => p.role === 'admin');
      if (adminProfile && pointsMap[adminProfile.id]) {
        setAdminPoints(pointsMap[adminProfile.id].total_points);
      }
    } catch (err) {
      console.error('Error fetching contributors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply bonus or penalty to a contributor
  const updateContributorPoints = async (contributorId, pointsChange, description) => {
    try {
      // Get current points
      const { data: currentData } = await supabase
        .from('contributor_points')
        .select('total_points')
        .eq('contributor_id', contributorId)
        .single();

      const newTotal = (currentData?.total_points || 0) + pointsChange;

      // Update total points
      const { error: updateError } = await supabase
        .from('contributor_points')
        .update({
          total_points: newTotal,
          last_updated: new Date().toISOString()
        })
        .eq('contributor_id', contributorId);

      if (updateError) throw updateError;

      // Record in history
      const { error: historyError } = await supabase
        .from('contributor_points_history')
        .insert([{
          contributor_id: contributorId,
          points_change: pointsChange,
          contribution_type: 'manual_adjustment',
          description: description
        }]);

      if (historyError) throw historyError;

      // Refresh data
      await fetchContributors();
      return { success: true };
    } catch (err) {
      console.error('Error updating contributor points:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchContributors();
  }, []);

  return {
    contributors,
    adminPoints,
    loading,
    error,
    refresh: fetchContributors,
    updateContributorPoints
  };
}

export default useAdminPoints;

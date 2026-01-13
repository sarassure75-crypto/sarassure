import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/lib/logger';

/**
 * Hook to get admin statistics and revenue
 * 
 * ADMIN COUNTS:
 * - Exercises: ALL versions (no status filter) for tasks owned by admin
 * - Images: ALL images from 'images' storage bucket uploaded by admin
 * 
 * CONTRIBUTORS COUNTS:
 * - Contributors: Number of users with role 'contributor'
 * - Exercises contributeurs: VALIDATED versions from all non-admin users
 * - Images contributeurs: VALIDATED images from all non-admin users
 * 
 * PLATFORM:
 * - Sur la plateforme: Total of admin + contributor validated content
 */
export function useAdminRevenue(adminId) {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.log('Loading admin data for adminId:', adminId);

      // DEBUG: Check what admin user looks like
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', adminId)
        .single();
      logger.log('Admin profile:', adminProfile);

      // ========================================
      // 1. ADMIN STATS
      // ========================================
      
      // Get all tasks owned by admin
      const { data: adminTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('owner_id', adminId);

      if (tasksError) {
        logger.error('Tasks error:', tasksError);
        throw tasksError;
      }

      logger.log('Admin tasks loaded:', adminTasks?.length || 0);

      const adminTaskIds = adminTasks?.map(t => t.id) || [];

      // Count ALL versions for admin's tasks (no status filter)
      let adminVersionsCount = 0;
      if (adminTaskIds.length > 0) {
        const { count, error: versionsError } = await supabase
          .from('versions')
          .select('id', { count: 'exact', head: true })
          .in('task_id', adminTaskIds);

        if (versionsError) {
          logger.error('Versions error:', versionsError);
        } else {
          adminVersionsCount = count || 0;
          logger.log('Admin versions count (all, no status filter):', adminVersionsCount);
        }
      }

      // Count ALL images uploaded by admin 
      // CORRECTION: Admin images are in 'app_images' table with user_id = NULL
      const { count: adminImagesCount, error: adminImagesError } = await supabase
        .from('app_images')
        .select('id', { count: 'exact', head: true })
        .is('user_id', null);

      if (adminImagesError) {
        logger.error('Admin images (app_images) error:', adminImagesError);
      }
      
      logger.log('Admin images count (from app_images with user_id=null):', adminImagesCount || 0);
      
      // Debug: get sample admin images from app_images
      const { data: sampleAdminImages } = await supabase
        .from('app_images')
        .select('id, file_path, user_id, created_at')
        .is('user_id', null)
        .limit(3);
      
      logger.log('Sample admin images (app_images):', sampleAdminImages);

      // ========================================
      // 2. CONTRIBUTORS STATS
      // ========================================
      
      // Count users with role 'contributor'
      const { count: contributorsCount, error: contributorsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'contributor');

      if (contributorsError) {
        logger.error('Contributors error:', contributorsError);
      }
      
      logger.log('Contributors count:', contributorsCount || 0);

      // DEBUGGING: Let's check specifically the version that should count as contributor
      logger.log('🔍 DEBUGGING: Checking the problematic version 8f637b93-22a5-474d-8805-fb06f46356b3');
      
      // Check this specific version with manual join
      const { data: problemVersion } = await supabase
        .from('versions')
        .select(`
          id,
          creation_status,
          task_id,
          tasks(id, owner_id, title)
        `)
        .eq('id', '8f637b93-22a5-474d-8805-fb06f46356b3')
        .single();
      logger.log('Problem version:', problemVersion);
      
      // Check the task directly
      if (problemVersion?.task_id) {
        const { data: problemTask } = await supabase
          .from('tasks')
          .select('id, owner_id, title')
          .eq('id', problemVersion.task_id)
          .single();
        logger.log('Problem task:', problemTask);
      }

      // Get all users that are not admin
      const { data: nonAdminUsers } = await supabase
        .from('profiles')
        .select('id, username, email')
        .neq('id', adminId)
        .limit(5);
      logger.log('Non-admin users:', nonAdminUsers);
      
      // Get all tasks with their owners
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('id, title, owner_id')
        .limit(10);
      logger.log('All tasks (first 10):', allTasks?.map(t => ({
        id: t.id,
        title: t.title,
        owner_id: t.owner_id,
        is_admin: t.owner_id === adminId
      })));

      // Use the working join method for main query
      const { data: allVersionsData, error: versionsError } = await supabase
        .from('versions')
        .select(`
          id,
          creation_status,
          task_id,
          user_id
        `);

      if (versionsError) {
        logger.error('All versions error:', versionsError);
      }
      
      logger.log('🔍 RAW versions data (first 5):', allVersionsData?.slice(0, 5).map(v => ({
        id: v.id,
        creation_status: v.creation_status,
        user_id: v.user_id,
        is_admin: v.user_id === adminId
      })));
      
      logger.log('All versions data:', allVersionsData?.length || 0);
      logger.log('AdminId for filtering:', adminId);
      
      // Debug: show ALL validated versions first
      const allValidatedVersions = allVersionsData?.filter(v => v.creation_status === 'validated') || [];
      logger.log('🔍 ALL VALIDATED VERSIONS:', allValidatedVersions.length);
      allValidatedVersions.forEach(v => {
        logger.log(`Version ${v.id}:`, {
          creation_status: v.creation_status,
          user_id: v.user_id,
          is_admin_owned: v.user_id === adminId,
          adminId: adminId
        });
      });

      // Count contributor exercises: validated versions where user_id != admin
      const contributorValidatedVersions = allVersionsData?.filter(v => {
        const isValidated = v.creation_status === 'validated';
        const isNotAdmin = v.user_id && v.user_id !== adminId;
        
        // Debug each validated version
        if (isValidated) {
          logger.log(`✅ Validated version ${v.id}:`, {
            creation_status: v.creation_status,
            user_id: v.user_id,
            is_admin: v.user_id === adminId,
            shouldInclude: isValidated && isNotAdmin
          });
        }
        
        return isValidated && isNotAdmin;
      }) || [];      const contributorValidatedVersionsCount = contributorValidatedVersions.length;
      logger.log('🎯 FINAL Contributor validated versions count:', contributorValidatedVersionsCount);
      logger.log('🎯 Contributor versions details:', contributorValidatedVersions.map(v => ({
        id: v.id,
        task_owner: v.tasks?.owner_id
      })));

      // Count VALIDATED images from ALL contributors (everyone except admin)
      const { data: allImagesData, error: allImagesError } = await supabase
        .from('images_metadata')
        .select('id, uploaded_by, moderation_status');
      
      if (allImagesError) {
        logger.error('All images error:', allImagesError);
      }
      
      // Filter: validated images where uploader is NOT admin
      const contributorValidatedImages = allImagesData?.filter(img => 
        img.uploaded_by !== adminId && 
        img.moderation_status === 'approved'  // Images use 'approved', not 'validated'
      ) || [];
      
      const contributorValidatedImagesCount = contributorValidatedImages.length;
      logger.log('Contributor validated images count:', contributorValidatedImagesCount);

      // ========================================
      // 3. PLATFORM REVENUE
      // ========================================

      // Get ALL revenue data (sum of all contributors including admin)
      const { data: allRevenueData, error: revenueError } = await supabase
        .from('contributor_revenue_summary')
        .select('*');

      if (revenueError) {
        logger.error('Revenue error:', revenueError);
      }

      logger.log('All revenue data:', allRevenueData);

      // Calculate total platform revenue (sum of all contributors)
      let totalRevenue = 0;
      let totalSales = 0;
      let totalExerciseSales = 0;
      let totalExerciseRevenue = 0;
      let totalImageSales = 0;
      let totalImageRevenue = 0;

      if (allRevenueData && allRevenueData.length > 0) {
        allRevenueData.forEach(contributor => {
          totalRevenue += contributor.total_revenue_cents || 0;
          totalSales += contributor.total_sales_count || 0;
          totalExerciseSales += contributor.exercise_sales_count || 0;
          totalExerciseRevenue += contributor.exercise_revenue_cents || 0;
          totalImageSales += contributor.image_sales_count || 0;
          totalImageRevenue += contributor.image_revenue_cents || 0;
        });
      }

      const milestoneCount = Math.floor(totalRevenue / 100000);

      // ========================================
      // 4. CALCULATE TOTALS FOR "SUR LA PLATEFORME"
      // ========================================
      
      const totalPlatformVersions = adminVersionsCount + contributorValidatedVersionsCount;
      const totalPlatformImages = adminImagesCount + contributorValidatedImagesCount;
      const totalPlatformContent = totalPlatformVersions + totalPlatformImages;

      // ========================================
      // 5. BUILD RESULT OBJECTS
      // ========================================

      const statsResult = {
        exercises: {
          total: adminVersionsCount,  // All admin versions (no status filter)
          approved: 0,
          pending: 0
        },
        images: {
          total: adminImagesCount,  // All admin images from 'images' bucket
          approved: 0,
          pending: 0
        },
        global: {
          total_exercises: totalPlatformVersions,
          total_images: totalPlatformImages,
          total_content: totalPlatformContent
        },
        contributors: {
          count: contributorsCount || 0,  // Users with role 'contributor'
          versions: contributorValidatedVersionsCount,  // Validated versions from all non-admin users
          images: contributorValidatedImagesCount  // Validated images from all non-admin users
        }
      };

      const revenueResult = {
        exercise_sales_count: totalExerciseSales,
        exercise_revenue_cents: totalExerciseRevenue,
        image_sales_count: totalImageSales,
        image_revenue_cents: totalImageRevenue,
        total_revenue_cents: totalRevenue,
        total_sales_count: totalSales,
        milestone_count: milestoneCount
      };

      logger.log('Final stats:', statsResult);
      logger.log('Final revenue:', revenueResult);

      setStats(statsResult);
      setRevenue(revenueResult);
    } catch (err) {
      logger.error('Error loading admin data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    if (adminId) {
      loadAdminData();
    }
  }, [adminId, loadAdminData]);

  const refresh = useCallback(() => {
    loadAdminData();
  }, [loadAdminData]);

  return {
    stats,
    revenue,
    loading,
    error,
    refresh
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

  useEffect(() => {
    if (adminId) {
      loadAdminData();
    }
  }, [adminId]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading admin data for adminId:', adminId);

      // DEBUG: Check what admin user looks like
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', adminId)
        .single();
      console.log('Admin profile:', adminProfile);

      // ========================================
      // 1. ADMIN STATS
      // ========================================
      
      // Get all tasks owned by admin
      const { data: adminTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('owner_id', adminId);

      if (tasksError) {
        console.error('Tasks error:', tasksError);
        throw tasksError;
      }

      console.log('Admin tasks loaded:', adminTasks?.length || 0);

      const adminTaskIds = adminTasks?.map(t => t.id) || [];

      // Count ALL versions for admin's tasks (no status filter)
      let adminVersionsCount = 0;
      if (adminTaskIds.length > 0) {
        const { count, error: versionsError } = await supabase
          .from('versions')
          .select('id', { count: 'exact', head: true })
          .in('task_id', adminTaskIds);

        if (versionsError) {
          console.error('Versions error:', versionsError);
        } else {
          adminVersionsCount = count || 0;
          console.log('Admin versions count (all, no status filter):', adminVersionsCount);
        }
      }

      // Count ALL images uploaded by admin 
      // CORRECTION: Admin images are in 'app_images' table with user_id = NULL
      const { count: adminImagesCount, error: adminImagesError } = await supabase
        .from('app_images')
        .select('id', { count: 'exact', head: true })
        .is('user_id', null);

      if (adminImagesError) {
        console.error('Admin images (app_images) error:', adminImagesError);
      }
      
      console.log('Admin images count (from app_images with user_id=null):', adminImagesCount || 0);
      
      // Debug: get sample admin images from app_images
      const { data: sampleAdminImages } = await supabase
        .from('app_images')
        .select('id, file_path, user_id, created_at')
        .is('user_id', null)
        .limit(3);
      
      console.log('Sample admin images (app_images):', sampleAdminImages);

      // ========================================
      // 2. CONTRIBUTORS STATS
      // ========================================
      
      // Count users with role 'contributor'
      const { count: contributorsCount, error: contributorsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'contributor');

      if (contributorsError) {
        console.error('Contributors error:', contributorsError);
      }
      
      console.log('Contributors count:', contributorsCount || 0);

      // DEBUGGING: Let's check specifically the version that should count as contributor
      console.log('🔍 DEBUGGING: Checking the problematic version 8f637b93-22a5-474d-8805-fb06f46356b3');
      
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
      console.log('Problem version:', problemVersion);
      
      // Check the task directly
      if (problemVersion?.task_id) {
        const { data: problemTask } = await supabase
          .from('tasks')
          .select('id, owner_id, title')
          .eq('id', problemVersion.task_id)
          .single();
        console.log('Problem task:', problemTask);
      }

      // Get all users that are not admin
      const { data: nonAdminUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .neq('id', adminId)
        .limit(5);
      console.log('Non-admin users:', nonAdminUsers);
      
      // Get all tasks with their owners
      const { data: allTasks, error: allTasksError } = await supabase
        .from('tasks')
        .select('id, title, owner_id')
        .limit(10);
      console.log('All tasks (first 10):', allTasks?.map(t => ({
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
        console.error('All versions error:', versionsError);
      }
      
      console.log('🔍 RAW versions data (first 5):', allVersionsData?.slice(0, 5).map(v => ({
        id: v.id,
        creation_status: v.creation_status,
        user_id: v.user_id,
        is_admin: v.user_id === adminId
      })));
      
      console.log('All versions data:', allVersionsData?.length || 0);
      console.log('AdminId for filtering:', adminId);
      
      // Debug: show ALL validated versions first
      const allValidatedVersions = allVersionsData?.filter(v => v.creation_status === 'validated') || [];
      console.log('🔍 ALL VALIDATED VERSIONS:', allValidatedVersions.length);
      allValidatedVersions.forEach(v => {
        console.log(`Version ${v.id}:`, {
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
          console.log(`✅ Validated version ${v.id}:`, {
            creation_status: v.creation_status,
            user_id: v.user_id,
            is_admin: v.user_id === adminId,
            shouldInclude: isValidated && isNotAdmin
          });
        }
        
        return isValidated && isNotAdmin;
      }) || [];      const contributorValidatedVersionsCount = contributorValidatedVersions.length;
      console.log('🎯 FINAL Contributor validated versions count:', contributorValidatedVersionsCount);
      console.log('🎯 Contributor versions details:', contributorValidatedVersions.map(v => ({
        id: v.id,
        task_owner: v.tasks?.owner_id
      })));

      // Count VALIDATED images from ALL contributors (everyone except admin)
      const { data: allImagesData, error: allImagesError } = await supabase
        .from('images_metadata')
        .select('id, uploaded_by, moderation_status');
      
      if (allImagesError) {
        console.error('All images error:', allImagesError);
      }
      
      // Filter: validated images where uploader is NOT admin
      const contributorValidatedImages = allImagesData?.filter(img => 
        img.uploaded_by !== adminId && 
        img.moderation_status === 'approved'  // Images use 'approved', not 'validated'
      ) || [];
      
      const contributorValidatedImagesCount = contributorValidatedImages.length;
      console.log('Contributor validated images count:', contributorValidatedImagesCount);

      // ========================================
      // 3. PLATFORM REVENUE
      // ========================================

      // Get ALL revenue data (sum of all contributors including admin)
      const { data: allRevenueData, error: revenueError } = await supabase
        .from('contributor_revenue_summary')
        .select('*');

      if (revenueError) {
        console.error('Revenue error:', revenueError);
      }

      console.log('All revenue data:', allRevenueData);

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

      console.log('Final stats:', statsResult);
      console.log('Final revenue:', revenueResult);

      setStats(statsResult);
      setRevenue(revenueResult);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadAdminData();
  };

  return {
    stats,
    revenue,
    loading,
    error,
    refresh
  };
}

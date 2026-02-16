import { supabase } from '../lib/supabaseClient';
import { deleteImage } from './imagesMetadata';

/**
 * ============================================================================
 * API : CONTRIBUTIONS
 * Gestion des contributions (exercices, images, etc.) par les contributeurs
 * ============================================================================
 */

// ============================================================================
// DEMANDES D'ACCÈS CONTRIBUTEUR
// ============================================================================

/**
 * Créer une demande d'accès contributeur
 */
export async function createContributorRequest(userId, { message, experience }) {
  try {
    const { data, error } = await supabase
      .from('contributor_requests')
      .insert([
        {
          user_id: userId,
          message,
          experience,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating contributor request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer la demande d'un utilisateur
 */
export async function getMyContributorRequest(userId) {
  try {
    const { data, error } = await supabase
      .from('contributor_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching contributor request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Récupérer toutes les demandes en attente
 */
export async function getPendingContributorRequests() {
  try {
    const { data, error } = await supabase
      .from('contributor_requests')
      .select(
        `
        *,
        users:user_id (
          id,
          email,
          first_name,
          last_name,
          created_at
        )
      `
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Approuver une demande
 */
export async function approveContributorRequest(requestId, adminId, adminNotes = '') {
  try {
    const { data: request, error: fetchError } = await supabase
      .from('contributor_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // 1. Mettre à jour le rôle de l'utilisateur
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ role: 'contributeur' })
      .eq('id', request.user_id);

    if (updateUserError) throw updateUserError;

    // 2. Mettre à jour la demande
    const { data, error } = await supabase
      .from('contributor_requests')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // 3. Initialiser les stats du contributeur
    const { error: statsError } = await supabase
      .from('contributor_stats')
      .insert([{ user_id: request.user_id }]);

    if (statsError && statsError.code !== '23505') {
      // Ignore si déjà existe
      console.warn('Stats initialization warning:', statsError);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error approving contributor request:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Rejeter une demande
 */
export async function rejectContributorRequest(requestId, adminId, adminNotes = '') {
  try {
    const { data, error } = await supabase
      .from('contributor_requests')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error rejecting contributor request:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// CONTRIBUTIONS (EXERCICES, IMAGES, ETC.)
// ============================================================================

/**
 * Créer une nouvelle contribution (brouillon)
 */
export async function createContribution(contributorId, type, content) {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .insert([
        {
          contributor_id: contributorId,
          type,
          content,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating contribution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mettre à jour une contribution (brouillon uniquement)
 */
export async function updateContribution(contributionId, updates) {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .update(updates)
      .eq('id', contributionId)
      .eq('status', 'draft') // Seulement les brouillons
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating contribution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Soumettre une contribution pour validation
 */
export async function submitContribution(contributionId) {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .update({
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', contributionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting contribution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les contributions d'un contributeur
 */
export async function getMyContributions(contributorId, filters = {}) {
  try {
    let query = supabase.from('contributions').select('*').eq('contributor_id', contributorId);

    // Filtres optionnels
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Récupérer toutes les contributions en attente de validation
 */
export async function getPendingContributions(filters = {}) {
  try {
    let query = supabase
      .from('contributions')
      .select(
        `
        *,
        contributor:contributor_id (
          id,
          email,
          first_name,
          last_name
        )
      `
      )
      .eq('status', 'pending');

    // Filtres optionnels
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    query = query.order('submitted_at', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching pending contributions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Approuver une contribution
 * Possibilité de modifier le contenu avant publication
 */
export async function approveContribution(contributionId, reviewerId, modifications = null) {
  try {
    const updateData = {
      status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    };

    // Si l'admin a modifié le contenu
    if (modifications) {
      updateData.admin_modifications = modifications;
      updateData.content = modifications.modifiedContent;
    }

    const { data, error } = await supabase
      .from('contributions')
      .update(updateData)
      .eq('id', contributionId)
      .select()
      .single();

    if (error) throw error;

    // Si c'est un exercice, le publier automatiquement
    if (data.type === 'exercise') {
      const publishResult = await publishContributionAsTask(data);
      if (!publishResult.success) {
        console.error('Error publishing task:', publishResult.error);
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error approving contribution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Rejeter une contribution
 */
export async function rejectContribution(contributionId, reviewerId, reason) {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', contributionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error rejecting contribution:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Publier une contribution approuvée comme exercice (task)
 */
export async function publishContributionAsTask(contribution) {
  try {
    const taskData = {
      ...contribution.content,
      contributor_id: contribution.contributor_id,
      contribution_id: contribution.id,
      is_community_content: true,
      original_contributor: contribution.contributor_id,
      created_by: contribution.reviewed_by, // L'admin qui a validé
      is_visible: true,
    };

    const { data, error } = await supabase.from('tasks').insert([taskData]).select().single();

    if (error) throw error;

    // Mettre à jour la contribution avec l'ID de la task publiée
    await supabase
      .from('contributions')
      .update({ published_task_id: data.id })
      .eq('id', contribution.id);

    return { success: true, data };
  } catch (error) {
    console.error('Error publishing contribution as task:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Supprimer une contribution (version, task ou image)
 */
export async function deleteContribution(
  contributionId,
  contributionType = 'version',
  userId = null
) {
  try {
    let error;

    if (contributionType === 'image') {
      // Utiliser la fonction spécialisée pour les images
      const result = await deleteImage(contributionId, userId);
      if (!result.success) {
        throw new Error(result.error);
      }
    } else if (contributionType === 'draft') {
      // Supprimer la tâche complète (brouillon)
      const { error: taskError } = await supabase.from('tasks').delete().eq('id', contributionId);

      error = taskError;
    } else {
      // Pour une version spécifique, d'abord récupérer le task_id
      const { data: versionData, error: fetchError } = await supabase
        .from('versions')
        .select('task_id')
        .eq('id', contributionId)
        .single();

      if (fetchError) throw fetchError;

      const taskId = versionData?.task_id;

      // Supprimer la version
      const { error: versionError } = await supabase
        .from('versions')
        .delete()
        .eq('id', contributionId);

      if (versionError) throw versionError;

      // Vérifier s'il reste des versions pour cette tâche
      if (taskId) {
        const { data: remainingVersions } = await supabase
          .from('versions')
          .select('id')
          .eq('task_id', taskId);

        // Si plus aucune version, supprimer la tâche
        if (!remainingVersions || remainingVersions.length === 0) {
          const { error: taskError } = await supabase.from('tasks').delete().eq('id', taskId);

          if (taskError) throw taskError;
        }
      }
    }

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// STATISTIQUES CONTRIBUTEUR
// ============================================================================

/**
 * Récupérer les statistiques d'un contributeur
 */
export async function getContributorStats(userId) {
  try {
    // Get all task IDs for this contributor
    const { data: userTasks } = await supabase.from('tasks').select('id').eq('owner_id', userId);

    const taskIds = userTasks?.map((t) => t.id) || [];

    // Count ALL versions (submitted) for this contributor's tasks
    const { data: allVersions } = await supabase
      .from('versions')
      .select('id, creation_status')
      .in('task_id', taskIds);

    // Count versions by status
    const approvedVersions =
      allVersions?.filter((v) => v.creation_status === 'validated').length || 0;
    const pendingVersions = allVersions?.filter((v) => v.creation_status === 'pending').length || 0;
    const rejectedVersions =
      allVersions?.filter((v) => v.creation_status === 'rejected').length || 0;
    // Total = validated + pending (ignore rejected/drafts)
    const totalVersions = approvedVersions + pendingVersions;

    // Compter les images du contributeur
    const { count: totalImages } = await supabase
      .from('images_metadata')
      .select('id', { count: 'exact', head: true })
      .eq('uploaded_by', userId);

    const { count: approvedImages } = await supabase
      .from('images_metadata')
      .select('id', { count: 'exact', head: true })
      .eq('uploaded_by', userId)
      .eq('moderation_status', 'approved');

    const { count: pendingImages } = await supabase
      .from('images_metadata')
      .select('id', { count: 'exact', head: true })
      .eq('uploaded_by', userId)
      .eq('moderation_status', 'pending');

    const { count: rejectedImages } = await supabase
      .from('images_metadata')
      .select('id', { count: 'exact', head: true })
      .eq('uploaded_by', userId)
      .eq('moderation_status', 'rejected');

    // Compter tous les exercices et images (pour comparaison globale)
    const { count: allTasks } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true });

    const { count: allImages } = await supabase
      .from('images_metadata')
      .select('id', { count: 'exact', head: true });

    const data = {
      // Exercices du contributeur (count VERSIONS: only validated + pending, ignore rejected)
      exercises: {
        total: totalVersions,
        approved: approvedVersions,
        pending: pendingVersions,
        rejected: rejectedVersions,
      },
      // Images du contributeur
      images: {
        total: totalImages || 0,
        approved: approvedImages || 0,
        pending: pendingImages || 0,
        rejected: rejectedImages || 0,
      },
      // Totaux globaux pour contexte
      global: {
        total_exercises: allTasks || 0,
        total_images: allImages || 0,
      },
      // Compatibilité avec ancien code (total = validated + pending only)
      total_contributions: totalVersions + (totalImages || 0),
      approved_contributions: approvedVersions + (approvedImages || 0),
      pending_contributions: pendingVersions + (pendingImages || 0),
      rejected_contributions: rejectedVersions + (rejectedImages || 0),
      images_uploaded: totalImages || 0,
      images_approved: approvedImages || 0,
    };

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching contributor stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Forcer le recalcul des stats d'un contributeur
 */
export async function refreshContributorStats(userId) {
  try {
    const { data, error } = await supabase.rpc('update_contributor_stats', {
      p_user_id: userId,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error refreshing contributor stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin : Récupérer le classement des contributeurs
 */
export async function getTopContributors(limit = 10, orderBy = 'approved_contributions') {
  try {
    const { data, error } = await supabase
      .from('contributor_stats')
      .select(
        `
        *,
        user:user_id (
          id,
          email,
          first_name,
          last_name
        )
      `
      )
      .order(orderBy, { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// NOTIFICATIONS (pour futur système)
// ============================================================================

/**
 * Compter les contributions en attente (pour badge admin)
 */
export async function countPendingContributions() {
  try {
    const { count, error } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;
    return { success: true, count };
  } catch (error) {
    console.error('Error counting pending contributions:', error);
    return { success: false, error: error.message, count: 0 };
  }
}

/**
 * Compter les demandes contributeur en attente
 */
export async function countPendingRequests() {
  try {
    const { count, error } = await supabase
      .from('contributor_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;
    return { success: true, count };
  } catch (error) {
    console.error('Error counting pending requests:', error);
    return { success: false, error: error.message, count: 0 };
  }
}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Gestion des demandes d'exercices (Exercise Requests)
 * Système de coordination entre admins et contributeurs pour planifier les exercices à créer
 */

/**
 * Récupérer toutes les demandes d'exercices
 * @param {Object} filters - Filtres optionnels { status, priority, category_id }
 * @returns {Promise<Array>}
 */
export async function fetchExerciseRequests(filters = {}) {
  try {
    let query = supabase
      .from('exercise_requests')
      .select(`
        *,
        category:categories(id, name, icon),
        creator:profiles!exercise_requests_created_by_fkey(id, username, role)
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching exercise requests:', error);
    throw error;
  }
}

/**
 * Récupérer une demande par son code
 * @param {string} code - Code unique (ex: "EX-2025-001")
 * @returns {Promise<Object|null>}
 */
export async function fetchExerciseRequestByCode(code) {
  try {
    const { data, error } = await supabase
      .from('exercise_requests')
      .select(`
        *,
        category:categories(id, name, icon),
        creator:profiles!exercise_requests_created_by_fkey(id, username, role)
      `)
      .eq('code', code)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching exercise request by code:', error);
    return null;
  }
}

/**
 * Créer une nouvelle demande d'exercice
 * @param {Object} requestData - { title, description, category_id, priority, notes }
 * @returns {Promise<Object>}
 */
export async function createExerciseRequest(requestData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('exercise_requests')
      .insert([{
        ...requestData,
        created_by: user.id,
        status: 'pending'
      }])
      .select(`
        *,
        category:categories(id, name, icon),
        creator:profiles!exercise_requests_created_by_fkey(id, username, role)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating exercise request:', error);
    throw error;
  }
}

/**
 * Mettre à jour une demande d'exercice
 * @param {string} id - UUID de la demande
 * @param {Object} updates - Champs à mettre à jour
 * @returns {Promise<Object>}
 */
export async function updateExerciseRequest(id, updates) {
  try {
    const { data, error } = await supabase
      .from('exercise_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, icon),
        creator:profiles!exercise_requests_created_by_fkey(id, username, role)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating exercise request:', error);
    throw error;
  }
}

/**
 * Supprimer une demande d'exercice
 * @param {string} id - UUID de la demande
 * @returns {Promise<boolean>}
 */
export async function deleteExerciseRequest(id) {
  try {
    const { error } = await supabase
      .from('exercise_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting exercise request:', error);
    throw error;
  }
}

/**
 * Lier un exercice (task) à une demande via son code
 * @param {string} requestCode - Code de la demande (ex: "EX-2025-001")
 * @param {number} taskId - ID du task créé
 * @returns {Promise<boolean>}
 */
export async function linkExerciseToRequest(requestCode, taskId) {
  try {
    const { data, error } = await supabase.rpc('link_exercise_to_request', {
      p_request_code: requestCode,
      p_task_id: taskId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error linking exercise to request:', error);
    throw error;
  }
}

/**
 * Mettre à jour les compteurs de versions d'une demande
 * @param {string} requestCode - Code de la demande
 * @returns {Promise<boolean>}
 */
export async function updateExerciseRequestCounters(requestCode) {
  try {
    const { data, error } = await supabase.rpc('update_exercise_request_counters', {
      p_request_code: requestCode
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating exercise request counters:', error);
    throw error;
  }
}

/**
 * Récupérer les statistiques globales des demandes
 * @returns {Promise<Object>}
 */
export async function getExerciseRequestsStats() {
  try {
    const { data, error } = await supabase
      .from('exercise_requests')
      .select('status, priority');

    if (error) throw error;

    const stats = {
      total: data.length,
      by_status: {
        pending: data.filter(r => r.status === 'pending').length,
        in_progress: data.filter(r => r.status === 'in_progress').length,
        completed: data.filter(r => r.status === 'completed').length,
        cancelled: data.filter(r => r.status === 'cancelled').length
      },
      by_priority: {
        high: data.filter(r => r.priority === 'high').length,
        normal: data.filter(r => r.priority === 'normal').length,
        low: data.filter(r => r.priority === 'low').length
      }
    };

    return stats;
  } catch (error) {
    console.error('Error fetching exercise requests stats:', error);
    throw error;
  }
}

/**
 * Rechercher des demandes par texte
 * @param {string} searchTerm - Terme de recherche
 * @returns {Promise<Array>}
 */
export async function searchExerciseRequests(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('exercise_requests')
      .select(`
        *,
        category:categories(id, name, icon),
        creator:profiles!exercise_requests_created_by_fkey(id, username, role)
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching exercise requests:', error);
    throw error;
  }
}

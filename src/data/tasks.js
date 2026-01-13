import { supabase } from '@/lib/supabaseClient';
import { invalidateAllCaches } from '@/lib/retryUtils';
import { logger } from '@/lib/logger';

    export const actionTypes = [
      { id: 'tap', label: 'Tap' },
      { id: 'double_tap', label: 'Double tap' },
      { id: 'long_press', label: 'Appui long' },
      { id: 'swipe_left', label: 'Glisser gauche' },
      { id: 'swipe_right', label: 'Glisser droite' },
      { id: 'swipe_up', label: 'Glisser haut' },
      { id: 'swipe_down', label: 'Glisser bas' },
      { id: 'scroll', label: 'Scroll' },
      { id: 'drag_and_drop', label: 'Maintenir et déplacer' },
      { id: 'number_input', label: 'Clavier num' },
      { id: 'text_input', label: 'Clavier texte' },
      { id: 'button_power', label: '⏻ Bouton Power' },
      { id: 'button_volume_up', label: '🔊 Bouton Volume+' },
      { id: 'button_volume_down', label: '🔉 Bouton Volume-' },
      // Actions combinées (2 boutons simultanés)
      { id: 'button_power_volume_down', label: '⏻+🔉 Power + Volume-', combo: true },
      { id: 'button_power_volume_up', label: '⏻+🔊 Power + Volume+', combo: true },
      { id: 'button_volume_up_down', label: '🔊+🔉 Volume+ + Volume-', combo: true },
      { id: 'bravo', label: '🎉 Bravo (sans zone d\'action)' },
    ];

    export const creationStatuses = [
      { id: 'draft', label: 'Brouillon', color: 'bg-gray-500' },
      { id: 'pending', label: 'En attente', color: 'bg-blue-500' },
      { id: 'needs_changes', label: 'À Corriger', color: 'bg-yellow-500' },
      { id: 'validated', label: 'Validé', color: 'bg-green-500' },
      { id: 'rejected', label: 'Rejeté', color: 'bg-red-500' },
    ];

    export const fetchTaskCategories = async () => {
      try {
        const { data, error } = await supabase.from('task_categories').select('id, name').order('name');
        if (error) throw error;
        return data;
      } catch (error) {
        logger.error("Error fetching task categories:", error);
        return [];
      }
    };

    export const fetchTasks = async (forceRefresh = false) => {
      try {
        let query = supabase
          .from('tasks')
          .select(`
            id, title, description, icon_name, pictogram_app_image_id, creation_status, category_id, category, video_url, created_at, task_type,
            versions (
              *,
              steps ( * )
            )
          `)
          .filter('is_deleted', 'is', false);

        // Trick to bypass Service Worker cache when refreshing
        if (forceRefresh) {
          query = query.neq('id', '00000000-0000-0000-0000-000000000000');
        }

        const { data: tasks, error: tasksError } = await query.order('created_at', { ascending: false });

        if (tasksError) {
          logger.error('Supabase error in fetchTasks:', tasksError);
          throw tasksError;
        }

        logger.log('=== DEBUG fetchTasks: Tâches brutes reçues ===', tasks);
        
        // Log spécial pour les questionnaires
        const questionnairesTasks = tasks.filter(t => t.task_type === 'questionnaire');
        if (questionnairesTasks.length > 0) {
          logger.log('=== DEBUG fetchTasks: Questionnaires trouvés ===', questionnairesTasks.length);
          questionnairesTasks.forEach(q => {
            logger.log(`QCM "${q.title}": versions=${q.versions?.length || 0}`, q.versions);
          });
        }

        const processedTasks = tasks.map(task => ({
          ...task,
          versions: (task.versions || []).map(version => ({
            ...version,
            steps: (version.steps || []).sort((a, b) => a.step_order - b.step_order)
          })).sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
        }));
        
        logger.log('=== DEBUG fetchTasks: Tâches traitées finales ===', processedTasks);
        
        return processedTasks;
      } catch (error) {
        logger.error('Error processing tasks in fetchTasks:', error);
        return [];
      }
    };
    
    export const fetchDeletedTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title, description, updated_at')
          .eq('is_deleted', true)
          .order('updated_at', { ascending: false });
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching deleted tasks:", error);
        return [];
      }
    };

    export const fetchAppStats = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('updated_at')
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                 if (error.code === 'PGRST116') { 
                    return { lastUpdate: new Date().toISOString() };
                }
                throw error;
            }
            
            return {
                lastUpdate: data ? data.updated_at : new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching app stats:', error);
            return {
                lastUpdate: new Date().toISOString() 
            };
        }
    };

    export const addTask = async (taskData) => {
      try {
        // Utiliser la RPC function sécurisée si disponible
        const { data, error } = await supabase.rpc('create_task', {
          p_title: taskData.title,
          p_description: taskData.description || null,
          p_icon_name: taskData.icon_name || null,
          p_creation_status: taskData.creation_status || 'draft',
          p_category_id: taskData.category_id || null,
          p_task_type: taskData.task_type || 'normal'
        });
        
        if (error) {
          console.error('Error creating task via RPC:', error);
          // Fallback: créer directement via table insert
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('tasks')
            .insert(taskData)
            .select();
          if (fallbackError) throw fallbackError;
          if (!fallbackData || fallbackData.length === 0) throw new Error("La création de la tâche a échoué.");
          return fallbackData[0];
        }
        
        if (!data || data.length === 0) throw new Error("La création de la tâche a échoué.");
        return data[0];
      } catch (error) {
        console.error('Error in addTask:', error);
        throw error;
      }
    };

    export const updateTask = async (taskId, updates) => {
      const { data, error } = await supabase.from('tasks').upsert({ ...updates, id: taskId }, { onConflict: 'id' }).select();

      if (error) {
          console.error("Error updating task:", error);
          throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("La tâche à mettre à jour n'a pas été trouvée.");
      }
      
      if (updates.creation_status === 'validated') {
        const { error: rpcError } = await supabase.rpc('cascade_validate_task', { p_task_id: taskId });
        if (rpcError) {
          console.error('Error calling cascade_validate_task:', rpcError);
        }
      }
      
      // Invalider TOUS les caches pour forcer le refresh côté apprenant
      await invalidateAllCaches();
      
      return data[0];
    };

    export const deleteTask = async (taskId) => {
      const { error } = await supabase.from('tasks').update({ is_deleted: true }).eq('id', taskId);
      if (error) throw error;
      return true;
    };
    
    export const restoreTask = async (taskId) => {
      const { error } = await supabase.from('tasks').update({ is_deleted: false }).eq('id', taskId);
      if (error) throw error;
      return true;
    };

    export const permanentlyDeleteTask = async (taskId) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      return true;
    };

    export const upsertVersion = async (versionData) => {
      try {
        // Si c'est une nouvelle version (pas d'ID), utiliser la RPC function
        if (!versionData.id) {
          const { data, error } = await supabase.rpc('create_version', {
            p_task_id: versionData.task_id,
            p_description: versionData.description || null,
            p_video_url: versionData.video_url || null
          });
          
          if (error) {
            console.error('Error creating version via RPC:', error);
            // Fallback: créer via insert
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('versions')
              .insert(versionData)
              .select();
            if (fallbackError) throw fallbackError;
            if (!fallbackData || fallbackData.length === 0) throw new Error("L'enregistrement de la version a échoué.");
            return fallbackData[0];
          }
          
          if (!data || data.length === 0) throw new Error("L'enregistrement de la version a échoué.");
          return data[0];
        } else {
          // Pour les mises à jour, utiliser le upsert direct
          const { data, error } = await supabase
            .from('versions')
            .upsert(versionData, { onConflict: 'id' })
            .select();
          if (error) throw error;
          if (!data || data.length === 0) throw new Error("L'enregistrement de la version a échoué.");
          return data[0];
        }
      } catch (error) {
        console.error('Error in upsertVersion:', error);
        throw error;
      }
    };

    export const deleteVersion = async (versionId) => {
      const { error } = await supabase.from('versions').delete().eq('id', versionId);
      if (error) throw error;
      return true;
    };

    export const upsertManySteps = async (stepsData) => {
        try {
            const cleanStepsData = stepsData.map(({ isNew: _isNew, ...rest }) => rest);
            
            // Séparer les nouvelles étapes des mises à jour
            const newSteps = cleanStepsData.filter(s => !s.id);
            const updateSteps = cleanStepsData.filter(s => s.id);
            
            let allData = [];
            
            // Créer les nouvelles étapes via RPC
            if (newSteps.length > 0) {
              for (const step of newSteps) {
                try {
                  const { data, error } = await supabase.rpc('create_step', {
                    p_version_id: step.version_id,
                    p_step_order: step.step_order,
                    p_step_type: step.step_type,
                    p_content_text: step.content_text || null,
                    p_areas: step.areas || null
                  });
                  
                  if (error) {
                    console.warn('RPC create_step failed, falling back to direct insert:', error);
                    // Fallback: insérer directement avec created_at
                    const stepWithTimestamp = {
                      ...step,
                      created_at: step.created_at || new Date().toISOString(),
                      updated_at: step.updated_at || new Date().toISOString()
                    };
                    const { data: fallbackData, error: fallbackError } = await supabase
                      .from('steps')
                      .insert(stepWithTimestamp)
                      .select();
                    if (fallbackError) throw fallbackError;
                    allData = allData.concat(fallbackData);
                  } else if (data) {
                    allData = allData.concat(data);
                  }
                } catch (stepError) {
                  console.error('Error creating step:', stepError);
                  throw stepError;
                }
              }
            }
            
            // Mettre à jour les étapes existantes
            if (updateSteps.length > 0) {
              // Pour les updates: faire d'abord un fetch pour récupérer created_at existant
              const stepIds = updateSteps.map(s => s.id);
              const { data: existingSteps, error: fetchError } = await supabase
                .from('steps')
                .select('id, created_at')
                .in('id', stepIds);
              
              if (fetchError) {
                console.error("Error fetching existing steps:", fetchError);
                throw fetchError;
              }
              
              // Créer une map des created_at existants
              const createdAtMap = {};
              existingSteps?.forEach(s => {
                createdAtMap[s.id] = s.created_at;
              });
              
              // Ajouter created_at et updated_at à chaque étape
              const stepsWithTimestamps = updateSteps.map(step => ({
                ...step,
                created_at: createdAtMap[step.id] || step.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              }));
              
              const { data, error } = await supabase
                .from('steps')
                .upsert(stepsWithTimestamps, { onConflict: 'id' })
                .select();
              
              if (error) {
                console.error("Error updating steps:", error);
                throw error;
              }
              allData = allData.concat(data || []);
            }
            
            return allData;
        } catch (error) {
            console.error("Error in upsertManySteps:", error);
            throw error;
        }
    }

    export const deleteStep = async (stepId) => {
      const { error } = await supabase.from('steps').delete().eq('id', stepId);
      if (error) throw error;
      return true;
    };

    export const addTaskCategory = async (name) => {
        const { data, error } = await supabase.from('task_categories').insert({ name }).select().single();
        if (error) throw error;
        return data;
    };
    export const renameTaskCategory = async (id, newName) => {
        const { data, error } = await supabase.from('task_categories').update({ name: newName }).eq('id', id).select().single();
        if (error) throw error;
        
        const { error: taskUpdateError } = await supabase.from('tasks').update({ category: newName }).eq('category_id', id);
        if (taskUpdateError) console.error("Error updating tasks category field:", taskUpdateError);
        return data;
    };
    export const deleteTaskCategory = async (id) => {
        const { error } = await supabase.from('task_categories').delete().eq('id', id);
        if (error) throw error;
        return true;
    };

    // Fetch categories with hierarchy (parent + subcategories)
    export const fetchCategoriesHierarchy = async () => {
        const { data, error } = await supabase
            .from('task_categories')
            .select('id, name, parent_category_id')
            .order('name');
        
        if (error) {
            console.error("Error fetching categories hierarchy:", error);
            return [];
        }

        // Build hierarchy: group subcategories under their parents
        const categories = [];
        const categoryMap = {};

        // First pass: create flat map
        data.forEach(cat => {
            categoryMap[cat.id] = { ...cat, subcategories: [] };
        });

        // Second pass: build hierarchy
        data.forEach(cat => {
            if (cat.parent_category_id === null) {
                // Parent category
                categories.push(categoryMap[cat.id]);
            } else {
                // Subcategory - add to parent's list
                if (categoryMap[cat.parent_category_id]) {
                    categoryMap[cat.parent_category_id].subcategories.push(categoryMap[cat.id]);
                }
            }
        });

        return categories;
    };

    // Add a subcategory to a parent category
    export const addSubcategory = async (parentCategoryId, subcategoryName) => {
        const { data, error } = await supabase
            .from('task_categories')
            .insert({ name: subcategoryName, parent_category_id: parentCategoryId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    };

    // Update subcategory parent (move between parents)
    export const updateSubcategoryParent = async (subcategoryId, newParentId) => {
        const { data, error } = await supabase
            .from('task_categories')
            .update({ parent_category_id: newParentId })
            .eq('id', subcategoryId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    };

    // Remove subcategory parent (make it a root category)
    export const removeSubcategoryParent = async (categoryId) => {
        const { data, error } = await supabase
            .from('task_categories')
            .update({ parent_category_id: null })
            .eq('id', categoryId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    };
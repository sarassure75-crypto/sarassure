import { supabase } from '@/lib/supabaseClient';

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
    ];

    export const creationStatuses = [
      { id: 'draft', label: 'Brouillon', color: 'bg-gray-500' },
      { id: 'pending', label: 'En attente', color: 'bg-blue-500' },
      { id: 'needs_changes', label: 'À Corriger', color: 'bg-yellow-500' },
      { id: 'validated', label: 'Validé', color: 'bg-green-500' },
      { id: 'rejected', label: 'Rejeté', color: 'bg-red-500' },
    ];

    export const fetchTaskCategories = async (forceRefresh = false) => {
      try {
        const { data, error } = await supabase.from('task_categories').select('id, name').order('name');
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching task categories:", error);
        return [];
      }
    };

    export const fetchTasks = async (forceRefresh = false) => {
      try {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            id, title, description, icon_name, pictogram_app_image_id, creation_status, category_id, category, video_url, created_at,
            versions (
              *,
              steps ( * )
            )
          `)
          .filter('is_deleted', 'is', false)
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.error('Supabase error in fetchTasks:', tasksError);
          throw tasksError;
        }

        const processedTasks = tasks.map(task => ({
          ...task,
          versions: (task.versions || []).map(version => ({
            ...version,
            steps: (version.steps || []).sort((a, b) => a.step_order - b.step_order)
          })).sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
        }));
        return processedTasks;
      } catch (error) {
        console.error('Error processing tasks in fetchTasks:', error);
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
      const { data, error } = await supabase.from('tasks').insert(taskData).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("La création de la tâche a échoué.");
      return data[0];
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
      const { data, error } = await supabase.from('versions').upsert(versionData, { onConflict: 'id' }).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("L'enregistrement de la version a échoué.");
      return data[0];
    };

    export const deleteVersion = async (versionId) => {
      const { error } = await supabase.from('versions').delete().eq('id', versionId);
      if (error) throw error;
      return true;
    };

    export const upsertManySteps = async (stepsData) => {
        const cleanStepsData = stepsData.map(({ isNew, ...rest }) => rest);
        const { data, error } = await supabase
            .from('steps')
            .upsert(cleanStepsData, { onConflict: 'id' })
            .select();
            
        if (error) {
            console.error("Error in upsertManySteps:", error);
            throw error;
        }
        return data;
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
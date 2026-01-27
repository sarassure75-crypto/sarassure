
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, RefreshCw, ChevronLeft, Loader2 } from 'lucide-react';
import AdminTaskList from './AdminTaskList';
import AdminTaskForm from './AdminTaskForm';
import AdminVersionList from './AdminVersionList';
import AdminQuestionnaireEditor from './AdminQuestionnaireEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

/**
 * Fonction helper pour sauvegarder les questions d'un QCM dans versions/steps
 * Crée automatiquement une version v1.0 si nécessaire
 */
async function saveQuestionnaireQuestionsAsSteps(taskId, questions) {
  console.log('=== Sauvegarde QCM dans versions/steps ===');
  console.log('Task ID:', taskId);
  console.log('Questions:', questions);

  try {
    // Vérifier si une version existe déjà
    const { data: existingVersions } = await supabase
      .from('versions')
      .select('id')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
      .limit(1);

    let versionId;

    if (existingVersions && existingVersions.length > 0) {
      // Utiliser la première version existante
      versionId = existingVersions[0].id;
      console.log('Version existante trouvée:', versionId);

      // Supprimer les anciens steps
      const { error: deleteError } = await supabase
        .from('steps')
        .delete()
        .eq('version_id', versionId);

      if (deleteError) throw deleteError;
      console.log('Anciens steps supprimés');
    } else {
      // Créer une nouvelle version v1.0
      const { data: newVersion, error: versionError } = await supabase
        .from('versions')
        .insert({
          task_id: taskId,
          version_number: '1.0',
          status: 'draft'
        })
        .select()
        .single();

      if (versionError) throw versionError;
      versionId = newVersion.id;
      console.log('Nouvelle version créée:', versionId);
    }

    // Créer les steps avec expected_input JSON
    const stepsToInsert = questions.map((q, idx) => {
      const questionData = {
        questionType: 'mixed',
        type: 'mixed',
        hint: q.hint || '',
        imageId: q.imageId,
        imageName: q.imageName,
        choices: q.choices.map(c => ({
          id: c.id,
          imageId: c.imageId,
          imageName: c.imageName,
          iconSvg: c.iconSvg || null,
          text: c.text,
          isCorrect: q.correctAnswers.includes(c.id)
        })),
        correctAnswers: q.correctAnswers
      };

      return {
        version_id: versionId,
        step_order: idx + 1,
        instruction: q.instruction,
        expected_input: questionData
      };
    });

    const { error: stepsError } = await supabase
      .from('steps')
      .insert(stepsToInsert);

    if (stepsError) throw stepsError;
    console.log('Steps créés avec succès:', stepsToInsert.length);

    return { success: true, versionId };
  } catch (error) {
    console.error('Erreur sauvegarde QCM:', error);
    throw error;
  }
}

const AdminTaskManager = () => {
  const { tasks, images, categories, fetchAllData, isLoading, error, deleteTask, updateTask, createTask } = useAdmin();
  const [view, setView] = useState('list'); // 'list', 'form'
  const [selectedTask, setSelectedTask] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (view === 'list') {
        fetchAllData();
    }
  }, [view, fetchAllData]);

  const handleSelectTask = useCallback((task) => {
    // Ouvrir le formulaire d'édition pour tous les types de tâches
    setSelectedTask(task);
    setView('form');
  }, []);

  const handleAddNewTask = () => {
    const newTask = {
      id: uuidv4(),
      title: 'Nouvelle Tâche',
      description: '',
      creation_status: 'to_create',
      versions: [],
      isNew: true, // Flag to indicate this is a new task
    };
    setSelectedTask(newTask);
    setView('form');
  };

  const handleCreateQuestionnaire = () => {
    navigate('/contributeur/questionnaire');
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setView('list');
  };

  const handleSaveTask = async (taskData) => {
    try {
      const { isNew, questions, ...dataToSave } = taskData;
      let savedTask;

      if (isNew) {
        // Explicitly use createTask for new tasks
        savedTask = await createTask(dataToSave);
        toast({ title: "Tâche créée", description: "Vous pouvez maintenant ajouter des versions." });
        
        // Pour les QCM avec questions, créer automatiquement une version et des steps
        if (dataToSave.task_type === 'questionnaire' && questions && questions.length > 0) {
          await saveQuestionnaireQuestionsAsSteps(savedTask.id, questions);
        }
      } else {
        // Use updateTask for existing tasks
        savedTask = await updateTask(taskData.id, dataToSave);
        
        // Pour les QCM avec questions, mettre à jour les steps de la première version
        if (taskData.task_type === 'questionnaire' && questions && questions.length > 0) {
          await saveQuestionnaireQuestionsAsSteps(taskData.id, questions);
        }
        
        toast({ title: "Tâche enregistrée", description: "Les modifications ont été sauvegardées." });
      }
      
      // After saving, refetch all data to get the freshest state
      const updatedData = await fetchAllData(true);
      const updatedTasks = updatedData.tasksData || [];
      
      // Find the saved task in the newly fetched list
      const foundTask = updatedTasks.find(t => t.id === savedTask.id);

      if (foundTask) {
        // Update the selected task state with the fresh data and remove the 'isNew' flag
        setSelectedTask({ ...foundTask, isNew: false });
      } else {
        // Fallback in case it's not found (should not happen)
        setSelectedTask(current => ({ ...current, ...savedTask, isNew: false }));
        handleBackToList(); // Or go back to the list
      }
      
    } catch (err) {
      console.error("Task saving error:", err);
      toast({ title: "Erreur", description: err.message || "Impossible d'enregistrer la tâche.", variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast({ title: "Tâche déplacée dans la corbeille", description: "Vous pouvez la restaurer depuis la corbeille." });
      if (selectedTask && selectedTask.id === taskId) {
        handleBackToList();
      } else {
        fetchAllData(true);
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de supprimer la tâche.", variant: "destructive" });
    }
  };

  const handleDuplicateTask = (task) => {
    const duplicatedTask = {
      ...task,
      id: uuidv4(),
      title: `${task.title} (Copie)`,
      isNew: true
    };
    setSelectedTask(duplicatedTask);
    setView('form');
  };

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tasks]);

  const imagesMap = useMemo(() => {
    if (!images || !(images instanceof Map)) return new Map();
    return images;
  }, [images]);

  if (isLoading && !tasks.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Erreur de chargement: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          {view === 'form' && (
            <Button variant="outline" onClick={handleBackToList}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour à la liste
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => fetchAllData(true)} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: view === 'form' ? 300 : -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: view === 'form' ? -300 : 300 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'list' ? (
            <AdminTaskList
              tasks={sortedTasks}
              onSelectTask={handleSelectTask}
              onAddNewTask={handleAddNewTask}
              onCreateQuestionnaire={handleCreateQuestionnaire}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              imagesMap={imagesMap}
              categories={categories}
            />
          ) : (
            selectedTask && (
              <div>
                {selectedTask.task_type === 'questionnaire' ? (
                  <AdminQuestionnaireEditor
                    key={selectedTask.id}
                    task={selectedTask}
                    onSave={handleSaveTask}
                    onCancel={handleBackToList}
                    onDelete={handleDeleteTask}
                  />
                ) : (
                  <>
                    <AdminTaskForm
                      key={selectedTask.id}
                      task={selectedTask}
                      onSave={handleSaveTask}
                      onCancel={handleBackToList}
                      onDelete={handleDeleteTask}
                    />
                    {!selectedTask.isNew && <AdminVersionList task={selectedTask} />}
                  </>
                )}
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminTaskManager;

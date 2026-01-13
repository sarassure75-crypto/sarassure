
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
        
        // Si c'est un QCM avec des questions, créer les questions et réponses
        if (dataToSave.task_type === 'questionnaire' && questions && questions.length > 0) {
          try {
            console.log('=== DEBUG: Sauvegarde questions pour nouveau QCM ===');
            console.log('Questions reçues:', JSON.stringify(questions, null, 2));
            
            // Créer la version et les steps avec expected_input JSON
            const { data: version, error: versionError } = await supabase
              .from('versions')
              .insert([{
                task_id: savedTask.id,
                name: 'Version 1',
                version: 1,
                creation_status: 'pending'
              }])
              .select()
              .single();

            if (versionError) throw versionError;

            const stepsToInsert = questions.map((q, idx) => {
              const questionData = {
                questionType: 'mixed',
                type: 'mixed',
                imageId: q.imageId,
                imageName: q.imageName,
                choices: q.choices.map(c => ({
                  id: c.id,
                  imageId: c.imageId,
                  imageName: c.imageName,
                  text: c.text,
                  isCorrect: q.correctAnswers.includes(c.id)
                })),
                correctAnswers: q.correctAnswers
              };

              return {
                version_id: version.id,
                step_order: idx + 1,
                instruction: q.instruction,
                expected_input: JSON.stringify(questionData)
              };
            });

            const { error: stepsError } = await supabase
              .from('steps')
              .insert(stepsToInsert);

            if (stepsError) throw stepsError;

            toast({ title: "Questions sauvegardées", description: "Les questions ont été créées avec succès." });
          } catch (stepError) {
            console.error('Erreur sauvegarde questions:', stepError);
            toast({ title: "Attention", description: "Tâche créée mais erreur sur les questions: " + stepError.message, variant: "destructive" });
          }
        }
      } else {
        // Use updateTask for existing tasks
        savedTask = await updateTask(taskData.id, dataToSave);
        
        // Si c'est un QCM avec des questions, mettre à jour les steps (expected_input JSON)
        if (taskData.task_type === 'questionnaire' && questions && questions.length > 0) {
          try {
            console.log('=== DEBUG: Mise à jour steps pour QCM existant ===');
            
            // Récupérer ou créer la première version
            let { data: versions, error: versionError } = await supabase
              .from('versions')
              .select('id')
              .eq('task_id', taskData.id)
              .order('created_at')
              .limit(1);

            if (versionError) throw versionError;

            let versionId;
            if (!versions || versions.length === 0) {
              // Créer une version si elle n'existe pas
              const { data: newVersion, error: newVersionError } = await supabase
                .from('versions')
                .insert([{ task_id: taskData.id, name: 'Version 1', version: 1 }])
                .select()
                .single();
              if (newVersionError) throw newVersionError;
              versionId = newVersion.id;
            } else {
              versionId = versions[0].id;
            }

            // Supprimer les anciens steps
            const { error: deleteError } = await supabase
              .from('steps')
              .delete()
              .eq('version_id', versionId);
            
            if (deleteError) throw deleteError;
            console.log('Anciens steps supprimés');

            // Créer les nouveaux steps avec expected_input JSON
            const stepsToInsert = questions.map((q, idx) => {
              const questionData = {
                questionType: 'mixed',
                type: 'mixed',
                imageId: q.imageId,
                imageName: q.imageName,
                choices: q.choices.map(c => ({
                  id: c.id,
                  imageId: c.imageId,
                  imageName: c.imageName,
                  text: c.text,
                  isCorrect: q.correctAnswers.includes(c.id)
                })),
                correctAnswers: q.correctAnswers
              };

              return {
                version_id: versionId,
                step_order: idx + 1,
                instruction: q.instruction,
                expected_input: JSON.stringify(questionData)
              };
            });

            const { error: stepsError } = await supabase
              .from('steps')
              .insert(stepsToInsert);

            if (stepsError) throw stepsError;
            console.log('Nouveaux steps créés avec expected_input JSON');

            toast({ title: "Questions mises à jour", description: "Les questions ont été mises à jour avec succès." });
          } catch (stepError) {
            console.error('Erreur sauvegarde questions:', stepError);
            toast({ title: "Attention", description: "Tâche sauvegardée mais erreur sur les questions: " + stepError.message, variant: "destructive" });
          }
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

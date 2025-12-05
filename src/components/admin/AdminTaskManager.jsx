
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
            
            // Créer les questions
            const questionsToInsert = questions.map((q, index) => ({
              task_id: savedTask.id,
              instruction: q.instruction,
              question_order: index + 1,
              question_type: q.questionType,
              image_id: q.imageId,
              image_name: q.imageName
            }));

            const { data: createdQuestions, error: questionsError } = await supabase
              .from('questionnaire_questions')
              .insert(questionsToInsert)
              .select();

            if (questionsError) throw questionsError;
            console.log('Questions créées:', createdQuestions);

            // Créer les réponses pour chaque question
            const choicesToInsert = [];
            createdQuestions.forEach((createdQuestion, qIndex) => {
              const originalQuestion = questions[qIndex];
              if (originalQuestion.choices && originalQuestion.choices.length > 0) {
                originalQuestion.choices.forEach((choice, cIndex) => {
                  choicesToInsert.push({
                    question_id: createdQuestion.id,
                    text: choice.text,
                    choice_order: cIndex + 1,
                    is_correct: originalQuestion.correctAnswers.includes(choice.id),
                    image_id: choice.imageId,
                    image_name: choice.imageName
                  });
                });
              }
            });

            if (choicesToInsert.length > 0) {
              const { data: choicesData, error: choicesError } = await supabase
                .from('questionnaire_choices')
                .insert(choicesToInsert)
                .select();

              if (choicesError) throw choicesError;
              console.log('Réponses créées:', choicesData);
            }

            toast({ title: "Questions sauvegardées", description: "Les questions ont été créées avec succès." });
          } catch (stepError) {
            console.error('Erreur sauvegarde questions:', stepError);
            toast({ title: "Attention", description: "Tâche créée mais erreur sur les questions: " + stepError.message, variant: "destructive" });
          }
        }
      } else {
        // Use updateTask for existing tasks
        savedTask = await updateTask(taskData.id, dataToSave);
        
        // Si c'est un QCM avec des questions, mettre à jour les questions et réponses
        if (taskData.task_type === 'questionnaire' && questions && questions.length > 0) {
          try {
            console.log('=== DEBUG: Mise à jour questions pour QCM existant ===');
            console.log('Questions reçues:', JSON.stringify(questions, null, 2));

            // Supprimer les anciennes questions (qui supprimera en cascade les réponses)
            const { error: deleteError } = await supabase
              .from('questionnaire_questions')
              .delete()
              .eq('task_id', taskData.id);
            
            if (deleteError) throw deleteError;
            console.log('Anciennes questions supprimées');

            // Créer les nouvelles questions
            const questionsToInsert = questions.map((q, index) => ({
              task_id: taskData.id,
              instruction: q.instruction,
              question_order: index + 1,
              question_type: q.questionType,
              image_id: q.imageId,
              image_name: q.imageName
            }));

            const { data: createdQuestions, error: questionsError } = await supabase
              .from('questionnaire_questions')
              .insert(questionsToInsert)
              .select();

            if (questionsError) throw questionsError;
            console.log('Nouvelles questions créées:', createdQuestions);

            // Créer les réponses pour chaque question
            const choicesToInsert = [];
            createdQuestions.forEach((createdQuestion, qIndex) => {
              const originalQuestion = questions[qIndex];
              if (originalQuestion.choices && originalQuestion.choices.length > 0) {
                originalQuestion.choices.forEach((choice, cIndex) => {
                  choicesToInsert.push({
                    question_id: createdQuestion.id,
                    text: choice.text,
                    choice_order: cIndex + 1,
                    is_correct: originalQuestion.correctAnswers.includes(choice.id),
                    image_id: choice.imageId,
                    image_name: choice.imageName
                  });
                });
              }
            });

            if (choicesToInsert.length > 0) {
              const { data: choicesData, error: choicesError } = await supabase
                .from('questionnaire_choices')
                .insert(choicesToInsert)
                .select();

              if (choicesError) throw choicesError;
              console.log('Réponses créées:', choicesData);
            }

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

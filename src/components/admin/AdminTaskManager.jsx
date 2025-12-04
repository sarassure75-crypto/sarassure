
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, RefreshCw, ChevronLeft, Loader2 } from 'lucide-react';
import AdminTaskList from './AdminTaskList';
import AdminTaskForm from './AdminTaskForm';
import AdminVersionList from './AdminVersionList';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

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
    // Si c'est un questionnaire, rediriger vers la page de validation des QCM
    if (task.task_type === 'questionnaire') {
      navigate('/admin/validation/questionnaires');
    } else {
      // Sinon, ouvrir le formulaire d'édition normal
      setSelectedTask(task);
      setView('form');
    }
  }, [navigate]);

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
      const { isNew, ...dataToSave } = taskData;
      let savedTask;

      if (isNew) {
        // Explicitly use createTask for new tasks
        savedTask = await createTask(dataToSave);
        toast({ title: "Tâche créée", description: "Vous pouvez maintenant ajouter des versions." });
      } else {
        // Use updateTask for existing tasks
        savedTask = await updateTask(taskData.id, dataToSave);
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
                <AdminTaskForm
                  key={selectedTask.id}
                  task={selectedTask}
                  onSave={handleSaveTask}
                  onCancel={handleBackToList}
                  onDelete={handleDeleteTask}
                />
                {!selectedTask.isNew && <AdminVersionList task={selectedTask} />}
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminTaskManager;

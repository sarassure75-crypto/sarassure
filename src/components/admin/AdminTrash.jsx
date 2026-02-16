import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2, Undo } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminTrash = () => {
  const {
    fetchDeletedTasks,
    restoreTask,
    permanentlyDeleteTask,
    isLoading: contextIsLoading,
  } = useAdmin();
  const { toast } = useToast();
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  const loadDeletedTasks = useCallback(async () => {
    setIsLocalLoading(true);
    const tasks = await fetchDeletedTasks();
    setDeletedTasks(tasks);
    setIsLocalLoading(false);
  }, [fetchDeletedTasks]);

  useEffect(() => {
    loadDeletedTasks();
  }, [loadDeletedTasks]);

  const handleRestore = async (taskId) => {
    try {
      await restoreTask(taskId);
      toast({
        title: 'Tâche restaurée',
        description: 'La tâche est de nouveau visible dans la liste principale.',
      });
      loadDeletedTasks();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de restaurer la tâche.',
        variant: 'destructive',
      });
    }
  };

  const handlePermanentDelete = async (taskId) => {
    try {
      await permanentlyDeleteTask(taskId);
      toast({
        title: 'Tâche supprimée définitivement',
        description: 'La tâche a été supprimée pour de bon.',
      });
      loadDeletedTasks();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la tâche définitivement.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = contextIsLoading || isLocalLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Corbeille</CardTitle>
        <CardDescription>
          Gérez les tâches supprimées. Elles seront définitivement effacées après 30 jours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : deletedTasks.length > 0 ? (
          <ul className="space-y-3">
            {deletedTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Supprimée{' '}
                    {formatDistanceToNow(new Date(task.updated_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleRestore(task.id)}>
                    <Undo className="mr-2 h-4 w-4" /> Restaurer
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. La tâche "{task.title}" sera supprimée
                          définitivement.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handlePermanentDelete(task.id)}>
                          Confirmer la suppression
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Trash2 className="mx-auto h-12 w-12" />
            <p className="mt-4">La corbeille est vide.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTrash;

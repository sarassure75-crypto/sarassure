import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Loader2, Eye, EyeOff, Copy } from 'lucide-react';
import { creationStatuses } from '@/data/tasks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminExerciseList = ({
  exercises,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onSelect,
  selectedExerciseId,
  isLoading,
}) => {
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, exerciseId: null });

  const getStatusInfo = (statusId) => {
    return (
      creationStatuses.find((s) => s.id === statusId) || { label: 'Inconnu', color: 'bg-gray-400' }
    );
  };

  const handleDeleteClick = (exerciseId) => {
    setDeleteAlert({ isOpen: true, exerciseId });
  };

  const confirmDelete = () => {
    if (deleteAlert.exerciseId) {
      onDelete(deleteAlert.exerciseId);
    }
    setDeleteAlert({ isOpen: false, exerciseId: null });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Versions</CardTitle>
          <CardDescription>Gérez les versions de cette tâche.</CardDescription>
        </div>
        <Button onClick={onAdd} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Version
        </Button>
      </CardHeader>
      <CardContent>
        {exercises && exercises.length > 0 ? (
          <ul className="space-y-3">
            {exercises.map((exercise) => {
              const statusInfo = getStatusInfo(exercise.creation_status);
              const isSelected = exercise.id === selectedExerciseId;
              return (
                <li
                  key={exercise.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => onSelect(exercise.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{exercise.name || 'Nouvelle Version'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`${statusInfo.color} text-white`}>
                          {statusInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {exercise.steps ? `${exercise.steps.length} étape(s)` : '0 étape'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(exercise.id);
                        }}
                        aria-label="Éditer l'exercice"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(exercise.id);
                        }}
                        aria-label="Dupliquer l'exercice"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(exercise.id);
                        }}
                        aria-label="Supprimer l'exercice"
                      >
                        {isLoading && deleteAlert.exerciseId === exercise.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune version pour cette tâche.</p>
            <p className="text-sm">Cliquez sur "Ajouter une Version" pour commencer.</p>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={deleteAlert.isOpen}
        onOpenChange={(isOpen) => setDeleteAlert({ ...deleteAlert, isOpen })}
      >
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La version et toutes ses étapes seront définitivement
              supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlert({ isOpen: false, exerciseId: null })}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminExerciseList;

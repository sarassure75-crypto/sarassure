import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { creationStatuses } from '@/data/tasks';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AdminVersionForm from './AdminVersionForm';
import AdminStepList from './AdminStepList';
import { v4 as uuidv4 } from 'uuid';

const AdminVersionList = ({ task }) => {
  const { upsertVersion, deleteVersion, isLoading } = useAdmin();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingVersion, setEditingVersion] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null); // State to manage which version's steps are shown
  const [deleteConfirmVersion, setDeleteConfirmVersion] = useState(null); // State for delete confirmation

  const getStatusInfo = (statusId) => {
    return creationStatuses.find(s => s.id === statusId) || { label: 'Inconnu', color: 'bg-gray-400' };
  };

  const handleAddNewVersion = () => {
    const newVersion = {
      id: uuidv4(),
      task_id: task.id,
      name: `Nouvelle Version ${task.versions.length + 1}`,
      version: '',
      creation_status: 'draft',
      has_variant_note: false,
      steps: [],
      isNew: true,
    };
    setEditingVersion(newVersion);
  };

  const handleEditVersion = (version) => {
    setEditingVersion(version);
  };

  const handleSaveVersion = async (versionData) => {
    try {
      // Ajouter user_id pour les nouvelles versions
      if (!versionData.user_id && user?.id) {
        versionData.user_id = user.id;
      }
      await upsertVersion(versionData);
      toast({ title: "Version enregistrée", description: "La version a été enregistrée avec succès." });
      setEditingVersion(null);
    } catch (error) {
      console.error('Error saving version:', error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la version.", variant: "destructive" });
    }
  };

  const handleDeleteVersion = async (versionId) => {
    try {
      await deleteVersion(versionId);
      toast({ title: "Version supprimée", description: "La version a été supprimée." });
      if (editingVersion?.id === versionId) setEditingVersion(null);
      if (selectedVersionId === versionId) setSelectedVersionId(null);
      setDeleteConfirmVersion(null);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer la version.", variant: "destructive" });
    }
  };

  const toggleVersionSteps = (versionId) => {
    setSelectedVersionId(prevId => (prevId === versionId ? null : versionId));
  };

  if (editingVersion) {
    return (
      <AdminVersionForm
        version={editingVersion}
        onSave={handleSaveVersion}
        onCancel={() => setEditingVersion(null)}
        onDelete={handleDeleteVersion}
      />
    );
  }

  return (
    <>
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Versions</CardTitle>
          <CardDescription>Gérez les versions de cette tâche.</CardDescription>
        </div>
        <Button onClick={handleAddNewVersion} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Version
        </Button>
      </CardHeader>
      <CardContent>
        {task.versions && task.versions.length > 0 ? (
          <ul className="space-y-3">
            {task.versions.map(version => {
              const statusInfo = getStatusInfo(version.creation_status);
              const isSelected = version.id === selectedVersionId;
              return (
                <li key={version.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{version.name || 'Nouvelle Version'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {version.steps ? `${version.steps.length} étape(s)` : '0 étape'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditVersion(version)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => setDeleteConfirmVersion(version)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleVersionSteps(version.id)} title="Gérer les étapes">
                        {isSelected ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-4 pl-4 border-l-2">
                      <AdminStepList version={version} />
                    </div>
                  )}
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
    </Card>

    {/* Alert Dialog for delete confirmation */}
    <AlertDialog open={!!deleteConfirmVersion} onOpenChange={(open) => !open && setDeleteConfirmVersion(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous vous apprêtez à supprimer la version "<strong>{deleteConfirmVersion?.name || 'Nouvelle Version'}</strong>" et toutes ses étapes. Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              if (deleteConfirmVersion) {
                handleDeleteVersion(deleteConfirmVersion.id);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Oui, supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default AdminVersionList;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2, Loader2, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { creationStatuses } from '@/data/tasks';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AdminVersionForm from './AdminVersionForm';
import AdminStepList from './AdminStepList';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

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
      // Extraire les métadonnées locales
      const metadata = versionData._metadata || {};
      const isDuplication = metadata.isNew && metadata.originalVersionId;
      const originalVersionId = metadata.originalVersionId;
      
      // Retirer les métadonnées avant l'envoi à Supabase
      const cleanData = { ...versionData };
      delete cleanData._metadata;
      
      // Ajouter user_id pour les nouvelles versions
      if (!cleanData.user_id && user?.id) {
        cleanData.user_id = user.id;
      }
      
      const savedVersion = await upsertVersion(cleanData);
      
      // Si c'est une duplication, dupliquer les tâches avec le nouvel ID
      if (isDuplication && savedVersion?.id && originalVersionId) {
        console.log(`🔄 Début de la duplication des étapes pour version ID: "${originalVersionId}"`);
        await duplicateVersionTasks(savedVersion, originalVersionId);
      }
      
      toast({ title: "Version enregistrée", description: "La version a été enregistrée avec succès." });
      setEditingVersion(null);
    } catch (error) {
      console.error('Error saving version:', error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la version.", variant: "destructive" });
    }
  };

  const duplicateVersionTasks = async (newVersion, originalVersionId) => {
    try {
      // Chercher la version originale par ID
      const originalVersion = task.versions.find(v => v.id === originalVersionId);
      
      if (!originalVersion) {
        console.warn(`❌ Version originale avec ID "${originalVersionId}" non trouvée. Versions disponibles:`, task.versions.map(v => ({ id: v.id, name: v.name })));
        return;
      }

      console.log(`📋 Version originale trouvée: ${originalVersion.id} - ${originalVersion.name}`);
      console.log(`📋 Nouvelle version ID: ${newVersion.id} - ${newVersion.name}`);

      // Récupérer les étapes de la version originale depuis la BD
      const { data: originalSteps, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .eq('version_id', originalVersion.id);

      if (stepsError) {
        console.error('❌ Erreur lors de la récupération des étapes:', stepsError);
        throw stepsError;
      }

      console.log(`📝 ${originalSteps?.length || 0} étape(s) trouvée(s) à dupliquer`);

      // Dupliquer les étapes (steps)
      if (originalSteps && originalSteps.length > 0) {
        const newSteps = originalSteps.map(step => ({
          version_id: newVersion.id,
          step_order: step.step_order,
          instruction: step.instruction,
          action_type: step.action_type,
          target_area: step.target_area,
          text_input_area: step.text_input_area,
          start_area: step.start_area,
          expected_input: step.expected_input,
          app_image_id: step.app_image_id,
          pictogram_app_image_id: step.pictogram_app_image_id,
          icon_name: step.icon_name
        }));

        console.log(`✏️ Insertion de ${newSteps.length} nouvelle(s) étape(s)...`);

        const { error: insertError } = await supabase
          .from('steps')
          .insert(newSteps);

        if (insertError) {
          console.error('❌ Erreur lors de l\'insertion des étapes:', insertError);
          throw insertError;
        }

        console.log(`✅ ${originalSteps.length} étape(s) dupliquée(s) avec succès`);
      } else {
        console.warn('⚠️ Aucune étape à dupliquer pour cette version');
      }

      // Si c'est un questionnaire, dupliquer les questions et réponses
      if (task.task_type === 'questionnaire') {
        const { data: questions, error: questionsError } = await supabase
          .from('questionnaire_questions')
          .select('*')
          .eq('task_id', task.id);

        if (questionsError) throw questionsError;

        if (questions && questions.length > 0) {
          // Dupliquer les questions
          const newQuestions = await Promise.all(questions.map(async (q) => {
            const { data: newQ, error: qError } = await supabase
              .from('questionnaire_questions')
              .insert([{
                task_id: task.id,
                instruction: q.instruction,
                question_order: q.question_order,
                question_type: q.question_type,
                image_id: q.image_id,
                image_name: q.image_name
              }])
              .select()
              .single();

            if (qError) throw qError;
            return { original: q, duplicate: newQ };
          }));

          // Dupliquer les réponses pour chaque question
          for (const qPair of newQuestions) {
            const { data: choices, error: choicesError } = await supabase
              .from('questionnaire_choices')
              .select('*')
              .eq('question_id', qPair.original.id);

            if (choicesError) throw choicesError;

            if (choices && choices.length > 0) {
              const newChoices = choices.map(c => ({
                question_id: qPair.duplicate.id,
                text: c.text,
                choice_order: c.choice_order,
                is_correct: c.is_correct,
                image_id: c.image_id,
                image_name: c.image_name
              }));

              const { error: choicesInsertError } = await supabase
                .from('questionnaire_choices')
                .insert(newChoices);

              if (choicesInsertError) throw choicesInsertError;
            }
          }
        }
      }

      console.log('✅ Version et tâches dupliquées avec succès');
    } catch (error) {
      console.error('❌ Erreur duplication tâches:', error);
      toast({ title: "Attention", description: "Version dupliquée mais erreur lors de la copie des tâches.", variant: "default" });
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

  const handleDuplicateVersion = (version) => {
    const duplicatedVersion = {
      ...version,
      id: uuidv4(),
      name: `${version.name} (Copie)`,
      isNew: true,
      originalVersionId: version.id // ✅ Passer l'ID de la version originale
    };
    setEditingVersion(duplicatedVersion);
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
                      <Button variant="ghost" size="icon" onClick={() => handleDuplicateVersion(version)}>
                        <Copy className="h-4 w-4" />
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
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
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
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, PlusCircle, Trash2, GripVertical, Save, X, Loader2, HelpCircle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import AdminStepForm from './AdminStepForm';
import { v4 as uuidv4 } from 'uuid';
import * as LucideIcons from 'lucide-react';

const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const AdminStepList = ({ version }) => {
  const { upsertManySteps, deleteStep, isLoading, images } = useAdmin();
  const imageArray = images instanceof Map ? Array.from(images.values()) : [];
  const { toast } = useToast();
  const [steps, setSteps] = useState(version.steps || []);
  const [editingStep, setEditingStep] = useState(null);

  const handleAddStep = () => {
    const newStep = {
      id: uuidv4(),
      version_id: version.id,
      step_order: steps.length,
      instruction: '',
      action_type: 'tap',
      isNew: true,
    };
    setEditingStep(newStep);
  };

  const handleEditStep = (step) => {
    setEditingStep(step);
  };

  const handleSaveStep = (stepData) => {
    let updatedSteps;
    if (stepData.isNew) {
      updatedSteps = [...steps, { ...stepData, isNew: false }];
    } else {
      updatedSteps = steps.map(s => s.id === stepData.id ? stepData : s);
    }
    setSteps(updatedSteps.map((s, i) => ({ ...s, step_order: i })));
    setEditingStep(null);
  };

  const handleDeleteStep = async (stepId) => {
    try {
      // Get the step to check if it exists in DB
      const stepToDelete = steps.find(s => s.id === stepId);
      
      // Only call deleteStep if it's not a new step (has been saved to DB)
      if (stepToDelete && !stepToDelete.isNew) {
        await deleteStep(stepId);
      }
      
      // Update local state
      setSteps(steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, step_order: i })));
      if (editingStep?.id === stepId) {
        setEditingStep(null);
      }
      toast({ title: "Étape supprimée", description: "L'étape a été supprimée." });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer l'étape.", variant: "destructive" });
    }
  };

  const handleSaveAllSteps = async () => {
    try {
      await upsertManySteps(steps);
      toast({ title: "Étapes enregistrées", description: "Toutes les modifications ont été enregistrées." });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les étapes.", variant: "destructive" });
    }
  };

  if (editingStep) {
    return (
      <AdminStepForm
        step={editingStep}
        onSave={handleSaveStep}
        onCancel={() => setEditingStep(null)}
        onDelete={() => handleDeleteStep(editingStep.id)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Étapes</CardTitle>
        <CardDescription>Gérez les étapes pour cette version.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {steps && steps.length > 0 ? (
            steps.map((step, index) => {
              const pictogramInfo = step.pictogram_app_image_id ? imageArray.find(img => img.id === step.pictogram_app_image_id) : null;
              const IconComponent = LucideIcons[toPascalCase(step.icon_name)] || null;
              return (
                <li
                  key={step.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center flex-1 truncate pr-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-grab" />
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-2">
                      {IconComponent ? (
                        <IconComponent className="h-5 w-5 text-primary" />
                      ) : pictogramInfo ? (
                        <img src={pictogramInfo.publicUrl} alt={pictogramInfo.name} className="h-6 w-6 object-contain" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="flex-1 truncate" title={step.instruction}>
                      {index + 1}. {step.instruction}
                    </span>
                  </div>
                  <div>
                     <Button variant="ghost" size="icon" onClick={() => handleEditStep(step)}>
                       <Edit className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteStep(step.id)}>
                       <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                     </Button>
                  </div>
                </li>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Aucune étape pour cette version.
            </p>
          )}
        </ul>
        <div className="flex justify-between mt-4">
          <Button onClick={handleAddStep} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Étape
          </Button>
          <Button onClick={handleSaveAllSteps} size="sm" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer les Étapes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStepList;
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StepAreaEditor from './StepAreaEditor';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Composant pour éditer les zones d'action dans la validation d'exercices
 */
export default function AdminExerciseStepEditor({ steps = [], onStepsUpdate }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [editingStep, setEditingStep] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const currentStep = steps[currentStepIndex];

  // Fonction pour ouvrir l'éditeur d'une étape
  const startEditingStep = (step) => {
    setEditingStep({ ...step });
  };

  // Fonction pour annuler l'édition
  const cancelEditing = () => {
    setEditingStep(null);
  };

  // Fonction pour sauvegarder les modifications d'une étape
  const saveStepChanges = async () => {
    if (!editingStep) return;

    setSaving(true);
    try {
      // Préparer les données des zones à sauvegarder
      const updateData = {};

      // Déterminer quelle zone mettre à jour selon le type d'action
      if (editingStep.target_area_data) {
        updateData.target_area = JSON.stringify(editingStep.target_area_data);
      }
      if (editingStep.text_input_area_data) {
        updateData.text_input_area = JSON.stringify(editingStep.text_input_area_data);
      }
      if (editingStep.start_area_data) {
        updateData.start_area = JSON.stringify(editingStep.start_area_data);
      }

      const { error } = await supabase.from('steps').update(updateData).eq('id', editingStep.id);

      if (error) throw error;

      // Mettre à jour les steps localement
      const updatedSteps = [...steps];
      const stepIndex = updatedSteps.findIndex((s) => s.id === editingStep.id);
      if (stepIndex >= 0) {
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          ...updateData,
          target_area_data: editingStep.target_area_data,
          text_input_area_data: editingStep.text_input_area_data,
          start_area_data: editingStep.start_area_data,
        };
      }

      onStepsUpdate?.(updatedSteps);
      setEditingStep(null);

      toast({
        title: "✅ Zone d'action sauvegardée",
        description: 'Les modifications ont été enregistrées avec succès.',
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: '❌ Erreur de sauvegarde',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour parser une zone d'action depuis JSON
  const parseAreaData = (areaJson) => {
    if (!areaJson) return null;
    try {
      return typeof areaJson === 'string' ? JSON.parse(areaJson) : areaJson;
    } catch (e) {
      console.error('Error parsing area data:', e);
      return null;
    }
  };

  // Fonction pour mettre à jour une zone d'action
  const updateAreaData = (areaType, newAreaData) => {
    if (!editingStep) return;

    setEditingStep({
      ...editingStep,
      [`${areaType}_data`]: newAreaData,
    });
  };

  // Navigation entre les étapes
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setEditingStep(null);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setEditingStep(null);
    }
  };

  // Initialiser les données des zones si pas déjà fait
  useEffect(() => {
    if (
      editingStep &&
      !editingStep.target_area_data &&
      !editingStep.text_input_area_data &&
      !editingStep.start_area_data
    ) {
      setEditingStep({
        ...editingStep,
        target_area_data: parseAreaData(editingStep.target_area),
        text_input_area_data: parseAreaData(editingStep.text_input_area),
        start_area_data: parseAreaData(editingStep.start_area),
      });
    }
  }, [editingStep]);

  if (!currentStep) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Aucune étape à afficher</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navigation entre les étapes */}
      {steps.length > 1 && (
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePreviousStep}
            disabled={currentStepIndex === 0}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédente
          </Button>

          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setEditingStep(null);
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  idx === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNextStep}
            disabled={currentStepIndex === steps.length - 1}
            variant="outline"
            size="sm"
          >
            Suivante
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Étape courante */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Étape {currentStepIndex + 1} / {steps.length}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{currentStep.instruction}</p>
              <p className="text-xs text-gray-500 mt-1">
                Action: <span className="font-medium">{currentStep.action_type}</span>
              </p>
            </div>

            {!editingStep && (
              <Button onClick={() => startEditingStep(currentStep)} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Éditer zones
              </Button>
            )}
          </div>
        </div>

        {/* Aperçu de l'étape ou éditeur */}
        <div className="p-6">
          {editingStep ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  🎯 Édition des zones d'action
                </p>
                <p className="text-xs text-blue-700">
                  Vous pouvez modifier les zones d'action pour corriger les erreurs de proportions.
                </p>
              </div>

              {/* Éditeur pour chaque type de zone */}
              {['target_area', 'text_input_area', 'start_area'].map((areaType) => {
                const areaData = editingStep[`${areaType}_data`];
                const shouldShow =
                  (areaType === 'target_area' &&
                    ['tap', 'double_tap', 'long_press'].includes(editingStep.action_type)) ||
                  (areaType === 'text_input_area' &&
                    ['text_input', 'number_input'].includes(editingStep.action_type)) ||
                  (areaType === 'start_area' &&
                    [
                      'swipe_left',
                      'swipe_right',
                      'swipe_up',
                      'swipe_down',
                      'scroll',
                      'drag_and_drop',
                    ].includes(editingStep.action_type));

                if (!shouldShow) return null;

                const areaLabels = {
                  target_area: 'Zone cible (tap/clic)',
                  text_input_area: 'Zone de saisie (texte)',
                  start_area: 'Zone de démarrage (swipe/scroll)',
                };

                return (
                  <div key={areaType} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{areaLabels[areaType]}</h4>

                    {editingStep.image_url ? (
                      <StepAreaEditor
                        imageUrl={editingStep.image_url}
                        area={areaData}
                        onAreaChange={(newArea) => updateAreaData(areaType, newArea)}
                      />
                    ) : (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-500 text-sm">
                          Image non disponible pour cette étape
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Actions de l'éditeur */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={saveStepChanges} disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>

                <Button onClick={cancelEditing} variant="outline" disabled={saving}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            // Aperçu simple de l'étape
            <div className="space-y-4">
              {currentStep.image_url ? (
                <div className="relative mx-auto inline-block" style={{ maxWidth: '360px' }}>
                  <img
                    src={currentStep.image_url}
                    alt={`Étape ${currentStepIndex + 1}`}
                    className="w-full h-auto rounded-lg border border-gray-200 block"
                  />

                  {/* Afficher les zones existantes */}
                  {[
                    {
                      data: parseAreaData(currentStep.target_area),
                      color: 'rgba(239, 68, 68, 0.3)',
                      borderColor: '#ef4444',
                      label: 'Cible',
                    },
                    {
                      data: parseAreaData(currentStep.text_input_area),
                      color: 'rgba(59, 130, 246, 0.3)',
                      borderColor: '#3b82f6',
                      label: 'Saisie',
                    },
                    {
                      data: parseAreaData(currentStep.start_area),
                      color: 'rgba(34, 197, 94, 0.3)',
                      borderColor: '#22c55e',
                      label: 'Départ',
                    },
                  ].map((zone, idx) => {
                    if (!zone.data) return null;

                    const x = zone.data.x_percent ?? zone.data.x ?? 0;
                    const y = zone.data.y_percent ?? zone.data.y ?? 0;
                    const w = zone.data.width_percent ?? zone.data.width ?? 10;
                    const h = zone.data.height_percent ?? zone.data.height ?? 10;

                    return (
                      <div
                        key={idx}
                        className="absolute border-2 pointer-events-none"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${w}%`,
                          height: `${h}%`,
                          backgroundColor: zone.data.color
                            ? zone.data.color
                                .replace('rgb', 'rgba')
                                .replace(')', `, ${zone.data.opacity || 0.3})`)
                            : zone.color,
                          borderColor: zone.data.color || zone.borderColor,
                          borderRadius: zone.data.shape === 'ellipse' ? '50%' : '4px',
                        }}
                      >
                        <div
                          className="absolute -top-6 left-0 bg-white/90 px-2 py-0.5 rounded text-xs font-medium"
                          style={{ borderColor: zone.borderColor }}
                        >
                          {zone.label}
                        </div>
                      </div>
                    );
                  })}

                  {/* Message si aucune zone */}
                  {!(
                    currentStep.target_area ||
                    currentStep.text_input_area ||
                    currentStep.start_area
                  ) && (
                    <div className="absolute top-2 left-2 bg-amber-100 border border-amber-300 rounded px-3 py-1 text-xs text-amber-800">
                      ℹ️ Aucune zone d'action définie
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                  <p className="text-gray-500">Image non disponible pour cette étape</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Instruction:</strong> {currentStep.instruction}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Action:</strong> {currentStep.action_type}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

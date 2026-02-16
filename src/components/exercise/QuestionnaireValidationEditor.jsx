import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Check, X, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const isIconReference = (value) => {
  if (!value || typeof value !== 'string') return false;
  return (
    value.startsWith('fa6-') ||
    value.startsWith('fa-') ||
    value.startsWith('bs-') ||
    value.startsWith('md-') ||
    value.startsWith('fi-') ||
    value.startsWith('hi2-') ||
    value.startsWith('ai-') ||
    value.startsWith('lucide-') ||
    value.includes(':')
  );
};

const normalizeExpectedInput = (rawExpected) => {
  let expected = rawExpected;

  if (typeof rawExpected === 'string') {
    try {
      expected = JSON.parse(rawExpected);
    } catch (error) {
      console.error('Erreur de parsing expected_input:', error);
      expected = {};
    }
  }

  expected = expected || {};

  const questionType = expected.questionType || expected.type || 'mixed';
  const rawChoices = Array.isArray(expected.choices)
    ? expected.choices
    : Array.isArray(expected.answers)
    ? expected.answers
    : [];

  const choices = rawChoices.map((choice) => {
    const iconId =
      choice.iconId || choice.icon?.id || (typeof choice.icon === 'string' ? choice.icon : null);

    return {
      id: choice.id || uuidv4(),
      text: choice.text || '',
      imageId: choice.imageId || null,
      imageName: choice.imageName || '',
      iconId,
      icon: choice.icon || null,
      isCorrect: !!choice.isCorrect,
    };
  });

  const correctAnswers =
    Array.isArray(expected.correctAnswers) && expected.correctAnswers.length > 0
      ? expected.correctAnswers
      : choices.filter((c) => c.isCorrect).map((c) => c.id);

  return {
    ...expected,
    questionType,
    choices,
    correctAnswers,
  };
};

/**
 * QuestionnaireValidationEditor
 * Affiche et permet de modifier les réponses correctes des QCM
 */
export default function QuestionnaireValidationEditor({
  steps = [],
  onUpdate = null,
  versionId = null,
}) {
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [editMode, setEditMode] = useState({});
  const [localChoices, setLocalChoices] = useState({});
  const [saving, setSaving] = useState(false);

  const toggleQuestion = (stepId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const toggleEditMode = (stepId) => {
    if (!editMode[stepId]) {
      // Initialiser les choix locaux quand on rentre en mode édition
      const step = steps.find((s) => s.id === stepId);
      if (step) {
        setLocalChoices((prev) => ({
          ...prev,
          [stepId]: normalizeExpectedInput(step.expected_input),
        }));
      }
    }
    setEditMode((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const toggleCorrectAnswer = (stepId, choiceId) => {
    setLocalChoices((prev) => {
      const step = steps.find((s) => s.id === stepId);
      const base = prev[stepId] || normalizeExpectedInput(step?.expected_input);
      const correctAnswers = base?.correctAnswers || [];

      const updatedAnswers = correctAnswers.includes(choiceId)
        ? correctAnswers.filter((id) => id !== choiceId)
        : [...correctAnswers, choiceId];

      return {
        ...prev,
        [stepId]: {
          ...base,
          correctAnswers: updatedAnswers,
        },
      };
    });
  };

  const saveChanges = async (stepId) => {
    setSaving(true);
    try {
      const step = steps.find((s) => s.id === stepId);
      const payload = localChoices[stepId] || normalizeExpectedInput(step?.expected_input);

      // Mettre à jour la base de données
      if (versionId) {
        const { error } = await supabase
          .from('steps')
          .update({ expected_input: JSON.stringify(payload) })
          .eq('id', stepId);

        if (error) throw error;
      }

      // Appeler le callback si fourni
      if (onUpdate) {
        onUpdate(stepId, payload);
      }

      setEditMode((prev) => ({
        ...prev,
        [stepId]: false,
      }));
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800">Aucune question trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => {
        const normalized = normalizeExpectedInput(step.expected_input);
        const isExpanded = expandedQuestions[step.id];
        const isEditing = editMode[step.id];
        const currentChoices = isEditing ? localChoices[step.id] || normalized : normalized;
        const choices = currentChoices.choices || [];
        const correctAnswers = currentChoices.correctAnswers || [];

        return (
          <Card key={step.id} className="overflow-hidden">
            {/* En-tête */}
            <button onClick={() => toggleQuestion(step.id)} className="w-full text-left">
              <CardHeader className="pb-3 cursor-pointer hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {idx + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        📋 Réponses texte / image / icône
                      </span>
                      {isEditing && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          ✏️ Édition
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-base text-gray-900">
                      {step.instruction || 'Question sans titre'}
                    </p>
                  </div>
                  <div className="ml-2 text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </button>

            {/* Détails */}
            {isExpanded && (
              <CardContent className="bg-slate-50 border-t pt-4 space-y-4">
                {/* Réponses */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Réponses ({choices.length}):
                    </p>
                    {!isEditing && (
                      <Button
                        onClick={() => toggleEditMode(step.id)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        ✏️ Modifier
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {choices.map((choice, choiceIdx) => {
                      const choiceId = choice.id || choiceIdx;
                      const isCorrect = correctAnswers.includes(choiceId);
                      const iconId =
                        choice.iconId ||
                        choice.icon?.id ||
                        (typeof choice.icon === 'string' ? choice.icon : null) ||
                        (isIconReference(choice.imageId) ? choice.imageId : null);
                      const hasImage = choice.imageId && !isIconReference(choice.imageId);
                      const hasText = !!choice.text;

                      return (
                        <div
                          key={choiceId}
                          className={cn(
                            'p-3 rounded-lg border-2 transition-all',
                            isCorrect ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200',
                            isEditing && 'cursor-pointer hover:border-blue-400'
                          )}
                          onClick={() => isEditing && toggleCorrectAnswer(step.id, choiceId)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox/Checkmark */}
                            <div className="flex-shrink-0 mt-1">
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={isCorrect}
                                  onChange={() => toggleCorrectAnswer(step.id, choiceId)}
                                  className="w-5 h-5 cursor-pointer accent-green-600"
                                />
                              ) : (
                                isCorrect && (
                                  <div className="flex items-center justify-center w-5 h-5 rounded bg-green-500">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )
                              )}
                            </div>

                            {/* Image de la réponse */}
                            {hasImage && (
                              <div className="flex-shrink-0">
                                <img
                                  src={`https://qcimwwhiymhhidkxtpzt.supabase.co/storage/v1/object/public/app-images/${choice.imageName}`}
                                  alt={choice.text || 'Réponse'}
                                  className="w-16 h-16 object-cover rounded"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}

                            {/* Contenu de la réponse */}
                            <div className="flex-1 min-w-0">
                              {hasText && (
                                <p className="text-sm text-gray-700 break-words">{choice.text}</p>
                              )}
                              {iconId && (
                                <p className="text-xs text-indigo-700 font-medium flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                                    Icône
                                  </span>
                                  <span className="truncate">{iconId}</span>
                                </p>
                              )}
                              {!hasText && !hasImage && !iconId && (
                                <p className="text-xs text-gray-400 italic">(Réponse vide)</p>
                              )}
                            </div>

                            {/* Badge correct */}
                            {isCorrect && !isEditing && (
                              <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-green-100">
                                <span className="text-xs font-medium text-green-700">Correcte</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Informations */}
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    {isEditing ? (
                      <p className="font-medium">
                        Cliquez sur les réponses ou cochez les cases pour marquer comme correctes
                      </p>
                    ) : (
                      <p className="font-medium">
                        {correctAnswers.length > 0
                          ? `${correctAnswers.length} réponse${
                              correctAnswers.length > 1 ? 's' : ''
                            } correcte${correctAnswers.length > 1 ? 's' : ''}`
                          : '⚠️ Aucune réponse correcte définie'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Boutons d'action */}
                {isEditing && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => saveChanges(step.id)}
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {saving && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                      {saving ? 'Enregistrement...' : '✓ Enregistrer'}
                    </Button>
                    <Button
                      onClick={() => toggleEditMode(step.id)}
                      variant="outline"
                      disabled={saving}
                      className="flex-1"
                    >
                      ✕ Annuler
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * QuestionnaireValidationEditor
 * Affiche et permet de modifier les réponses correctes des QCM
 */
export default function QuestionnaireValidationEditor({ steps = [], onUpdate = null }) {
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [editMode, setEditMode] = useState({});
  const [localChoices, setLocalChoices] = useState({});

  const toggleQuestion = (stepId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const toggleEditMode = (stepId) => {
    if (!editMode[stepId]) {
      // Initialiser les choix locaux quand on rentre en mode édition
      const step = steps.find(s => s.id === stepId);
      if (step) {
        setLocalChoices(prev => ({
          ...prev,
          [stepId]: { ...(step.expected_input || {}) }
        }));
      }
    }
    setEditMode(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const toggleCorrectAnswer = (stepId, choiceId) => {
    setLocalChoices(prev => {
      const updated = { ...prev[stepId] };
      const correctAnswers = updated.correctAnswers || [];
      
      if (correctAnswers.includes(choiceId)) {
        updated.correctAnswers = correctAnswers.filter(id => id !== choiceId);
      } else {
        updated.correctAnswers = [...correctAnswers, choiceId];
      }
      
      return {
        ...prev,
        [stepId]: updated
      };
    });
  };

  const saveChanges = (stepId) => {
    if (onUpdate) {
      onUpdate(stepId, localChoices[stepId]);
    }
    setEditMode(prev => ({
      ...prev,
      [stepId]: false
    }));
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
        const expected = step.expected_input || {};
        const isExpanded = expandedQuestions[step.id];
        const isEditing = editMode[step.id];
        const currentChoices = isEditing ? localChoices[step.id] : expected;
        const questionType = currentChoices.questionType || 'unknown';
        const choices = currentChoices.choices || [];
        const correctAnswers = currentChoices.correctAnswers || [];

        return (
          <Card key={step.id} className="overflow-hidden">
            {/* En-tête */}
            <button
              onClick={() => toggleQuestion(step.id)}
              className="w-full text-left"
            >
              <CardHeader className="pb-3 cursor-pointer hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {idx + 1}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                        questionType === 'image_choice' && "bg-purple-100 text-purple-700",
                        questionType === 'image_text' && "bg-blue-100 text-blue-700",
                        questionType === 'mixed' && "bg-indigo-100 text-indigo-700"
                      )}>
                        {questionType === 'image_choice' && "📷 Images"}
                        {questionType === 'image_text' && "📝 Texte"}
                        {questionType === 'mixed' && "📷+📝 Mixte"}
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

                      return (
                        <div
                          key={choiceId}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all",
                            isCorrect
                              ? "bg-green-50 border-green-300"
                              : "bg-white border-gray-200",
                            isEditing && "cursor-pointer hover:border-blue-400"
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
                            {choice.imageId && ['image_choice', 'mixed'].includes(questionType) && (
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
                              {choice.text && (
                                <p className="text-sm text-gray-700 break-words">
                                  {choice.text}
                                </p>
                              )}
                              {!choice.text && !choice.imageId && (
                                <p className="text-xs text-gray-400 italic">
                                  (Réponse vide)
                                </p>
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
                      <p className="font-medium">Cliquez sur les réponses ou cochez les cases pour marquer comme correctes</p>
                    ) : (
                      <p className="font-medium">
                        {correctAnswers.length > 0 
                          ? `${correctAnswers.length} réponse${correctAnswers.length > 1 ? 's' : ''} correcte${correctAnswers.length > 1 ? 's' : ''}`
                          : "⚠️ Aucune réponse correcte définie"
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Boutons d'action */}
                {isEditing && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => saveChanges(step.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      ✓ Enregistrer
                    </Button>
                    <Button
                      onClick={() => toggleEditMode(step.id)}
                      variant="outline"
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

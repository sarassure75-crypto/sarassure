import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Check, X, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * QuestionnairePreviewCard
 * Affiche un aperçu complet d'un QCM avec toutes les questions et réponses
 * Idéal pour la validation par l'admin
 */
export default function QuestionnairePreviewCard({ steps = [] }) {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (stepId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
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
        const questionType = expected.questionType || 'unknown';
        const choices = expected.choices || [];
        const correctAnswers = expected.correctAnswers || [];

        return (
          <Card key={step.id} className="overflow-hidden">
            {/* En-tête de la question */}
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
                        {questionType === 'image_choice' && (
                          <><ImageIcon className="w-3 h-3" /> Images</>
                        )}
                        {questionType === 'image_text' && (
                          <><FileText className="w-3 h-3" /> Texte</>
                        )}
                        {questionType === 'mixed' && (
                          <><FileText className="w-3 h-3" /> Mixte</>
                        )}
                      </span>
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

            {/* Détails de la question (dépliable) */}
            {isExpanded && (
              <CardContent className="bg-slate-50 border-t pt-4 space-y-4">
                {/* Image de la question si présente */}
                {expected.imageId && ['image_choice', 'mixed'].includes(questionType) && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Image de la question:</p>
                    <div className="bg-white border rounded-lg p-2">
                      <img
                        src={`https://qcimwwhiymhhidkxtpzt.supabase.co/storage/v1/object/public/app-images/${expected.imageName}`}
                        alt="Question"
                        className="max-w-full h-auto rounded max-h-48 mx-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Réponses */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Réponses possibles ({choices.length}):
                  </p>
                  <div className="space-y-2">
                    {choices.map((choice, choiceIdx) => {
                      const choiceId = choice.id || choiceIdx;
                      const isCorrect = correctAnswers.includes(choiceId);

                      return (
                        <div
                          key={choiceId}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-colors",
                            isCorrect
                              ? "bg-green-50 border-green-300"
                              : "bg-white border-gray-200"
                          )}
                        >
                          <div className="flex items-start gap-3">
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

                            {/* Badge correct/incorrect */}
                            {isCorrect && (
                              <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-green-100">
                                <Check className="w-4 h-4 text-green-700" />
                                <span className="text-xs font-medium text-green-700">Correcte</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {choices.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Aucune réponse définie</p>
                  )}

                  {/* Info sur les bonnes réponses */}
                  {correctAnswers.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                      <p className="font-medium">
                        {correctAnswers.length} réponse{correctAnswers.length > 1 ? 's' : ''} correcte{correctAnswers.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {correctAnswers.length === 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                      <p className="font-medium">⚠️ Aucune réponse correcte définie</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

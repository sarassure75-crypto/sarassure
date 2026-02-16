/**
 * QuestionnaireTranslationManager.jsx
 * Composant d'administration pour gérer les traductions des QCM
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  getAvailableLanguages,
  getQuestionnaireQuestionTranslations,
  getQuestionnaireChoiceTranslations,
  createQuestionnaireQuestionTranslation,
  createQuestionnaireChoiceTranslation,
  updateQuestionnaireQuestionTranslation,
  updateQuestionnaireChoiceTranslation,
  deleteQuestionnaireQuestionTranslation,
  deleteQuestionnaireChoiceTranslation,
  autoTranslateQuestionnaire,
} from '@/data/translation';
import { Loader2, Edit2, Trash2, Plus, Check, X, Save, Wand2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AdminQuestionnaireTranslationManager
 * Outil d'administration pour gérer les traductions des QCM
 */
export function AdminQuestionnaireTranslationManager() {
  const { toast } = useToast();
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionTranslations, setQuestionTranslations] = useState([]);
  const [choiceTranslations, setChoiceTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionData, setEditingQuestionData] = useState({});
  const [editingChoiceId, setEditingChoiceId] = useState(null);
  const [editingChoiceData, setEditingChoiceData] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // État pour ajouter une nouvelle traduction
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestionTranslation, setNewQuestionTranslation] = useState({
    question_id: '',
    translated_instruction: '',
  });

  const [showAddChoiceForm, setShowAddChoiceForm] = useState(false);
  const [newChoiceTranslation, setNewChoiceTranslation] = useState({
    choice_id: '',
    translated_choice_text: '',
    translated_feedback: '',
  });

  // État pour l'auto-traduction
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [autoTranslationProgress, setAutoTranslationProgress] = useState(null);
  const [showAutoTranslateConfirm, setShowAutoTranslateConfirm] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const langs = await getAvailableLanguages();
        setLanguages(langs);

        if (langs.length > 0) {
          setSelectedLanguage(langs[0].language_code);
        }

        // Récupérer les questionnaires
        const { data: questData } = await supabase
          .from('tasks')
          .select('id, title, description')
          .eq('task_type', 'questionnaire')
          .order('created_at', { ascending: false });

        setQuestionnaires(questData || []);

        if (questData && questData.length > 0) {
          setSelectedQuestionnaire(questData[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Charger les questions et traductions quand le questionnaire change
  useEffect(() => {
    if (selectedQuestionnaire) {
      fetchQuestions();
      fetchTranslations();
    }
  }, [selectedQuestionnaire, selectedLanguage]);

  const fetchQuestions = async () => {
    try {
      const { data: questionsData } = await supabase
        .from('questionnaire_questions')
        .select(
          `
          id,
          instruction,
          question_order,
          question_type,
          questionnaire_choices (
            id,
            text,
            choice_order,
            is_correct,
            feedback
          )
        `
        )
        .eq('task_id', selectedQuestionnaire)
        .order('question_order');

      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les questions',
        variant: 'destructive',
      });
    }
  };

  const fetchTranslations = async () => {
    try {
      const questionTrans = await getQuestionnaireQuestionTranslations(selectedLanguage);
      setQuestionTranslations(questionTrans);

      const choiceTrans = await getQuestionnaireChoiceTranslations(selectedLanguage);
      setChoiceTranslations(choiceTrans);
    } catch (error) {
      console.error('Error fetching translations:', error);
    }
  };

  const getQuestionTranslation = (questionId) => {
    return questionTranslations.find((t) => t.question_id === questionId);
  };

  const getChoiceTranslation = (choiceId) => {
    return choiceTranslations.find((t) => t.choice_id === choiceId);
  };

  // Gérer l'édition d'une traduction de question
  const handleEditQuestion = (questionId, translation) => {
    setEditingQuestionId(questionId);
    setEditingQuestionData({
      translated_instruction: translation?.translated_instruction || '',
    });
  };

  const handleSaveQuestionEdit = async (questionId, translationId) => {
    setSaving(true);
    try {
      if (translationId) {
        // Mise à jour
        await updateQuestionnaireQuestionTranslation(translationId, editingQuestionData);
        setQuestionTranslations(
          questionTranslations.map((t) =>
            t.id === translationId ? { ...t, ...editingQuestionData } : t
          )
        );
      } else {
        // Création
        const newTrans = await createQuestionnaireQuestionTranslation(
          questionId,
          selectedLanguage,
          editingQuestionData.translated_instruction
        );
        setQuestionTranslations([...questionTranslations, newTrans]);
      }

      setEditingQuestionId(null);
      toast({
        title: 'Succès',
        description: 'Question mise à jour',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error saving question translation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Gérer l'édition d'une traduction de choix
  const handleEditChoice = (choiceId, translation) => {
    setEditingChoiceId(choiceId);
    setEditingChoiceData({
      translated_choice_text: translation?.translated_choice_text || '',
      translated_feedback: translation?.translated_feedback || '',
    });
  };

  const handleSaveChoiceEdit = async (choiceId, translationId) => {
    setSaving(true);
    try {
      if (translationId) {
        // Mise à jour
        await updateQuestionnaireChoiceTranslation(translationId, editingChoiceData);
        setChoiceTranslations(
          choiceTranslations.map((t) =>
            t.id === translationId ? { ...t, ...editingChoiceData } : t
          )
        );
      } else {
        // Création
        const newTrans = await createQuestionnaireChoiceTranslation(
          choiceId,
          selectedLanguage,
          editingChoiceData.translated_choice_text,
          editingChoiceData.translated_feedback
        );
        setChoiceTranslations([...choiceTranslations, newTrans]);
      }

      setEditingChoiceId(null);
      toast({
        title: 'Succès',
        description: 'Réponse mise à jour',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error saving choice translation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Supprimer une traduction
  const handleDeleteQuestionTranslation = async (translationId) => {
    if (!confirm('Êtes-vous sûr ?')) return;

    try {
      await deleteQuestionnaireQuestionTranslation(translationId);
      setQuestionTranslations(questionTranslations.filter((t) => t.id !== translationId));
      toast({
        title: 'Succès',
        description: 'Traduction supprimée',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChoiceTranslation = async (translationId) => {
    if (!confirm('Êtes-vous sûr ?')) return;

    try {
      await deleteQuestionnaireChoiceTranslation(translationId);
      setChoiceTranslations(choiceTranslations.filter((t) => t.id !== translationId));
      toast({
        title: 'Succès',
        description: 'Traduction supprimée',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer',
        variant: 'destructive',
      });
    }
  };

  const handleAutoTranslate = async () => {
    if (!selectedQuestionnaire || !selectedLanguage || selectedLanguage === 'fr') {
      toast({
        title: 'Erreur',
        description: 'Sélectionnez un questionnaire et une langue',
        variant: 'destructive',
      });
      return;
    }

    setShowAutoTranslateConfirm(false);
    setIsAutoTranslating(true);
    setAutoTranslationProgress({ current: 0, total: 0, message: 'Démarrage...' });

    try {
      await autoTranslateQuestionnaire(selectedQuestionnaire, selectedLanguage, (progress) => {
        setAutoTranslationProgress(progress);
      });

      // Recharger les traductions
      await fetchTranslations();

      toast({
        title: 'Succès',
        description: 'Traduction automatique terminée',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error in auto-translation:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la traduction automatique',
        variant: 'destructive',
      });
    } finally {
      setIsAutoTranslating(false);
      setAutoTranslationProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Traductions des QCM</h1>
        <p className="text-gray-600">
          Gérez les traductions des questions et réponses des questionnaires
        </p>
      </div>

      {/* Sélection du questionnaire et de la langue */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Questionnaire</label>
              <select
                value={selectedQuestionnaire || ''}
                onChange={(e) => setSelectedQuestionnaire(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un questionnaire</option>
                {questionnaires.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title || 'Sans titre'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.language_code} value={lang.language_code}>
                    {lang.language_name} ({lang.language_code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bouton de traduction automatique */}
          {selectedLanguage && selectedLanguage !== 'fr' && selectedQuestionnaire && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAutoTranslateConfirm(true)}
                disabled={isAutoTranslating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Wand2 className="h-4 w-4" />
                {isAutoTranslating ? 'Traduction en cours...' : '✨ Traduction Auto'}
              </button>
            </div>
          )}

          {/* Barre de progression */}
          {autoTranslationProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {autoTranslationProgress.message}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (autoTranslationProgress.current / autoTranslationProgress.total) * 100
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-blue-700">
                {autoTranslationProgress.current}/{autoTranslationProgress.total} questions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation */}
      {showAutoTranslateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Confirmation de traduction automatique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">Êtes-vous sûr ? Cette action va :</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Traduire automatiquement toutes les questions et réponses</li>
                <li>Remplacer les traductions existantes</li>
                <li>Appliquer les termes du glossaire</li>
              </ul>
              <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                Cette opération peut prendre plusieurs minutes ({questions.length} questions).
              </p>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAutoTranslateConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAutoTranslate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Traduire automatiquement
              </button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Liste des questions avec traductions */}
      {questions.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 text-center text-gray-600">
            Aucune question trouvée pour ce questionnaire
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === question.id ? null : question.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      Q{question.question_order}: {question.instruction.substring(0, 100)}...
                    </CardTitle>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                    {question.questionnaire_choices?.length || 0} réponses
                  </span>
                </div>
              </CardHeader>

              {expandedQuestion === question.id && (
                <CardContent className="pt-6 space-y-6 bg-gray-50">
                  {/* Traduction de la question */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-blue-700 mb-3">📝 Instruction de la question</h3>

                    {editingQuestionId === question.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingQuestionData.translated_instruction}
                          onChange={(e) =>
                            setEditingQuestionData({
                              ...editingQuestionData,
                              translated_instruction: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Entrez la traduction..."
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleSaveQuestionEdit(
                                question.id,
                                getQuestionTranslation(question.id)?.id
                              )
                            }
                            disabled={saving}
                          >
                            {saving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Sauvegarder
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingQuestionId(null)}
                          >
                            <X className="h-4 w-4" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="p-3 bg-white rounded border border-gray-200 mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Original:</strong> {question.instruction}
                          </p>
                        </div>

                        {getQuestionTranslation(question.id) ? (
                          <div>
                            <div className="p-3 bg-green-50 rounded border border-green-200 mb-3">
                              <p className="text-sm text-green-700">
                                <strong>Traduction:</strong>{' '}
                                {getQuestionTranslation(question.id).translated_instruction}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleEditQuestion(
                                    question.id,
                                    getQuestionTranslation(question.id)
                                  )
                                }
                              >
                                <Edit2 className="h-4 w-4" />
                                Modifier
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteQuestionTranslation(
                                    getQuestionTranslation(question.id).id
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-sm text-yellow-700 mb-2">Aucune traduction</p>
                            <Button size="sm" onClick={() => handleEditQuestion(question.id, null)}>
                              <Plus className="h-4 w-4" />
                              Ajouter une traduction
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Traductions des réponses */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-purple-700 mb-3">✅ Réponses</h3>

                    <div className="space-y-3">
                      {question.questionnaire_choices?.map((choice) => (
                        <div
                          key={choice.id}
                          className="p-3 bg-white rounded border border-gray-200"
                        >
                          {editingChoiceId === choice.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingChoiceData.translated_choice_text}
                                onChange={(e) =>
                                  setEditingChoiceData({
                                    ...editingChoiceData,
                                    translated_choice_text: e.target.value,
                                  })
                                }
                                rows={2}
                                placeholder="Texte de la réponse traduite..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                              />
                              <textarea
                                value={editingChoiceData.translated_feedback}
                                onChange={(e) =>
                                  setEditingChoiceData({
                                    ...editingChoiceData,
                                    translated_feedback: e.target.value,
                                  })
                                }
                                rows={2}
                                placeholder="Retour traduit (optionnel)..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleSaveChoiceEdit(
                                      choice.id,
                                      getChoiceTranslation(choice.id)?.id
                                    )
                                  }
                                  disabled={saving}
                                >
                                  {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                  Sauvegarder
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingChoiceId(null)}
                                >
                                  <X className="h-4 w-4" />
                                  Annuler
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      'px-2 py-1 text-xs rounded font-bold',
                                      choice.is_correct
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    )}
                                  >
                                    {choice.is_correct ? '✓ Correcte' : '✗ Incorrecte'}
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-700 mb-2">
                                <strong>Original:</strong> {choice.choice_text}
                              </p>

                              {getChoiceTranslation(choice.id) ? (
                                <div>
                                  <p className="text-sm text-purple-700 mb-2">
                                    <strong>Traduction:</strong>{' '}
                                    {getChoiceTranslation(choice.id).translated_choice_text}
                                  </p>
                                  {getChoiceTranslation(choice.id).translated_feedback && (
                                    <p className="text-sm text-gray-600 italic mb-2">
                                      <strong>Retour:</strong>{' '}
                                      {getChoiceTranslation(choice.id).translated_feedback}
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleEditChoice(choice.id, getChoiceTranslation(choice.id))
                                      }
                                    >
                                      <Edit2 className="h-4 w-4" />
                                      Modifier
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleDeleteChoiceTranslation(
                                          getChoiceTranslation(choice.id).id
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Supprimer
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button size="sm" onClick={() => handleEditChoice(choice.id, null)}>
                                  <Plus className="h-4 w-4" />
                                  Ajouter traduction
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

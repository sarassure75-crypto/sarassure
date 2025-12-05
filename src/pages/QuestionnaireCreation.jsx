import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, X, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const QuestionnaireCreation = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // État du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Charger les images et catégories disponibles
  useEffect(() => {
    loadImages();
    loadCategories();
  }, []);

  const loadImages = async () => {
    try {
      // Charger uniquement les images de catégorie 'qcm'
      const { data, error } = await supabase
        .from('app_images')
        .select('id, name, file_path, description, category')
        .eq('category', 'qcm')
        .order('name');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erreur chargement images QCM:', error);
      // Continuer même si aucune image disponible
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('category')
        .neq('category', null);

      if (error) throw error;
      
      // Extraire les catégories uniques
      const uniqueCategories = [...new Set(data?.map(t => t.category) || [])];
      setCategories(uniqueCategories.filter(Boolean).sort());
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  // Ajouter une question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      text: '',
      helpText: '',
      questionType: 'image_choice', // image_choice, image_text, mixed
      imageId: null, // Pour image_text et mixed
      imageName: '', // Pour image_text et mixed
      choices: Array(6).fill(null).map(() => ({ 
        id: uuidv4(), 
        imageId: null, 
        imageName: '', 
        text: '', 
        isCorrect: false 
      }))
    };
    setQuestions([...questions, newQuestion]);
  };

  // Supprimer une question
  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  // Mettre à jour le texte de la question
  const handleUpdateQuestionText = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  // Ajouter une réponse supplémentaire
  const handleAddChoice = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      if (q.choices.length >= 6) return q;
      return {
        ...q,
        choices: [...q.choices, { id: uuidv4(), imageId: null, imageName: '', text: '', isCorrect: false }]
      };
    }));
  };

  // Supprimer une réponse
  const handleDeleteChoice = (questionId, choiceId) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      if (q.choices.length <= 2) return q;
      return {
        ...q,
        choices: q.choices.filter(c => c.id !== choiceId)
      };
    }));
  };

  // Mettre à jour un champ d'une réponse (text, imageId, imageName, etc.)
  const handleUpdateChoiceText = (questionId, choiceId, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        choices: q.choices.map(c =>
          c.id === choiceId ? { ...c, [field]: value } : c
        )
      };
    }));
  };

  // Marquer/Demarquer la réponse correcte (plusieurs possibles)
  const handleToggleCorrect = (questionId, choiceId) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        choices: q.choices.map(c =>
          c.id === choiceId ? { ...c, isCorrect: !c.isCorrect } : c
        )
      };
    }));
  };

  // Gérer le type de question
  const handleChangeQuestionType = (questionId, questionType) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return { ...q, questionType };
    }));
  };

  // Sélectionner l'image pour image_text ou mixed
  const handleSelectImageForQuestion = (questionId, imageId, imageName) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, imageId, imageName } : q
    ));
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = [];
    if (!title.trim()) errors.push('Le titre est requis');
    if (!category) errors.push('La catégorie est requise');
    if (questions.length === 0) errors.push('Au moins une question est requise');
    
    questions.forEach((q, idx) => {
      if (!q.text.trim()) errors.push(`Question ${idx + 1}: le texte est requis`);
      
      if (q.questionType === 'image_choice') {
        // Pour image_choice: vérifier qu'au moins une image est sélectionnée
        const choicesWithImages = q.choices.filter(c => c.imageId);
        if (choicesWithImages.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une image est requise`);
        }
        
        // Vérifier qu'au moins une réponse avec image est marquée correcte
        const correctAnswers = choicesWithImages.filter(c => c.isCorrect);
        if (correctAnswers.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une réponse doit être marquée correcte`);
        }
      } else if (q.questionType === 'image_text') {
        // Pour image_text: vérifier qu'au moins un texte est saisi
        const choicesWithText = q.choices.filter(c => c.text.trim());
        if (choicesWithText.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une réponse texte est requise`);
        }
        
        // Vérifier qu'au moins une réponse texte est marquée correcte
        const correctAnswers = choicesWithText.filter(c => c.isCorrect);
        if (correctAnswers.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une réponse doit être marquée correcte`);
        }
      } else if (q.questionType === 'mixed') {
        // Pour mixed: vérifier qu'au moins une image + texte est saisi
        const choicesWithImages = q.choices.filter(c => c.imageId || c.text.trim());
        if (choicesWithImages.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une réponse (image + texte) est requise`);
        }
        
        // Vérifier qu'au moins une réponse est marquée correcte
        const correctAnswers = choicesWithImages.filter(c => c.isCorrect);
        if (correctAnswers.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une réponse doit être marquée correcte`);
        }
        
        // Image question est requise pour mixed
        if (!q.imageId) {
          errors.push(`Question ${idx + 1}: une image est requise pour ce type de question`);
        }
      }
    });

    return errors;
  };

  // Sauvegarder en tant que brouillon
  const handleSaveDraft = () => {
    const draft = {
      id: uuidv4(),
      type: 'questionnaire',
      title,
      description,
      category,
      questions
    };
    
    const drafts = JSON.parse(localStorage.getItem('questionnaireDrafts') || '[]');
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.push(draft);
    }
    
    localStorage.setItem('questionnaireDrafts', JSON.stringify(drafts));
    setDraftSaved(true);
    
    toast({
      title: 'Brouillon sauvegardé',
      description: 'Votre questionnaire a été sauvegardé localement'
    });
    
    setTimeout(() => setDraftSaved(false), 3000);
  };

  // Soumettre le questionnaire
  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Erreurs de validation',
        description: errors.join('\n'),
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Utilisateur non authentifié',
          variant: 'destructive'
        });
        return;
      }

      // Créer la tâche questionnaire
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          title,
          description: description.trim() || null,
          category,
          owner_id: user.id,
          task_type: 'questionnaire'  // Distinguer des exercices normaux
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      console.log('Task créée:', task.id);

      // Insérer les questions dans la table questionnaire_questions
      const questionsDataForDB = questions.map((q, idx) => {
        let questionType = 'text'; // Par défaut
        let questionInstruction = q.text;
        let questionImageId = null;
        let questionImageName = '';

        // Pour les types mixed, on stocke l'image de la question
        if (q.questionType === 'mixed') {
          questionType = 'mixed';
          questionImageId = q.imageId;
          questionImageName = q.imageName;
        } else if (q.questionType === 'image_choice') {
          questionType = 'image_choice';
        } else if (q.questionType === 'image_text') {
          questionType = 'image_text';
        }

        return {
          task_id: task.id,
          instruction: questionInstruction,
          question_order: idx + 1,
          question_type: questionType,
          image_id: questionImageId,
          image_name: questionImageName
        };
      });

      const { data: insertedQuestions, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .insert(questionsDataForDB)
        .select();

      if (questionsError) {
        console.error('Erreur création questions:', questionsError);
        throw questionsError;
      }

      console.log('Questions créées:', insertedQuestions.length);

      // Insérer les réponses (choices) pour chaque question
      const allChoices = [];
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const insertedQuestion = insertedQuestions[i];

        // Filtrer les réponses remplies selon le type
        let filledChoices = [];
        
        if (q.questionType === 'image_choice') {
          filledChoices = q.choices.filter(c => c.imageId);
        } else if (q.questionType === 'image_text') {
          filledChoices = q.choices.filter(c => c.text.trim());
        } else if (q.questionType === 'mixed') {
          filledChoices = q.choices.filter(c => c.imageId || c.text.trim());
        }

        // Créer les enregistrements de choix
        const choicesForQuestion = filledChoices.map((choice, choiceIdx) => ({
          question_id: insertedQuestion.id,
          text: choice.text || null,
          choice_order: choiceIdx + 1,
          is_correct: choice.isCorrect,
          image_id: choice.imageId || null,
          image_name: choice.imageName || ''
        }));

        allChoices.push(...choicesForQuestion);
      }

      if (allChoices.length > 0) {
        const { error: choicesError } = await supabase
          .from('questionnaire_choices')
          .insert(allChoices);

        if (choicesError) {
          console.error('Erreur création réponses:', choicesError);
          throw choicesError;
        }

        console.log('Réponses créées:', allChoices.length);
      }

      toast({
        title: 'Succès!',
        description: 'Votre questionnaire a été créé et soumis pour validation'
      });

      navigate('/contributeur/mes-contributions');
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Créer un Questionnaire</h1>
          <p className="text-gray-600 mt-2">
            Créez un exercice d'apprentissage basé sur la sélection d'images
          </p>
        </div>

        {/* Informations générales */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du questionnaire *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Identifier les paramètres Wi-Fi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'objectif de ce questionnaire (optionnel)..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Questions ({questions.length})</h2>
            <Button onClick={handleAddQuestion} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <HelpCircle className="w-12 h-12 mb-4 text-gray-300" />
                <p>Aucune question ajoutée</p>
                <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question, qIdx) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Question {qIdx + 1}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Texte de la question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte de la question *
                    </label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleUpdateQuestionText(question.id, 'text', e.target.value)}
                      placeholder="Ex: Quelle capture montre le menu des paramètres Wi-Fi?"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Texte d'aide */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte d'aide (optionnel)
                    </label>
                    <input
                      type="text"
                      value={question.helpText}
                      onChange={(e) => handleUpdateQuestionText(question.id, 'helpText', e.target.value)}
                      placeholder="Ex: Cherchez l'engrenage et Wi-Fi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Type de question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de question
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={question.questionType === 'image_choice'}
                          onChange={() => handleChangeQuestionType(question.id, 'image_choice')}
                          className="w-4 h-4"
                        />
                        <span>Réponses : Images uniquement</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={question.questionType === 'image_text'}
                          onChange={() => handleChangeQuestionType(question.id, 'image_text')}
                          className="w-4 h-4"
                        />
                        <span>Réponses : Texte uniquement</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={question.questionType === 'mixed'}
                          onChange={() => handleChangeQuestionType(question.id, 'mixed')}
                          className="w-4 h-4"
                        />
                        <span>Réponses : Image + Texte</span>
                      </label>
                    </div>
                  </div>

                  {/* RÉPONSES UNIFIÉES: Support 6 slots pour tous les types */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Réponses possibles (2-6 propositions) *
                    </label>

                    {/* Pour image_choice: Sélectionnez images */}
                    {question.questionType === 'image_choice' && (
                      <div className="space-y-3">
                        {question.choices.map((choice, cIdx) => {
                          const isFilled = choice.imageId || choice.text.trim();
                          return (
                            <div key={choice.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Réponse {cIdx + 1}
                                </span>
                                <div className="flex gap-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={choice.isCorrect}
                                      onChange={() => handleToggleCorrect(question.id, choice.id)}
                                      className="w-4 h-4 rounded"
                                    />
                                    <span className="text-xs text-gray-600">Correcte</span>
                                  </label>
                                  {question.choices.length > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteChoice(question.id, choice.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {choice.imageName ? (
                                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">{choice.imageName}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddChoice(question.id, choice.id)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    Changer
                                  </Button>
                                </div>
                              ) : (
                                <div className="mb-3 max-h-60 overflow-y-auto border rounded-lg bg-gray-50">
                                  <div className="grid grid-cols-3 gap-2 p-2">
                                    {images.map(img => (
                                      <button
                                        key={img.id}
                                        onClick={() => {
                                          handleUpdateChoiceText(question.id, choice.id, 'imageId', img.id);
                                          handleUpdateChoiceText(question.id, choice.id, 'imageName', img.name);
                                        }}
                                        className="p-2 text-center rounded hover:bg-blue-100 border border-gray-200 hover:border-blue-400 transition-colors bg-white"
                                      >
                                        <img 
                                          src={img.file_path} 
                                          alt={img.name}
                                          className="w-full h-20 object-cover rounded mb-1"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                        <p className="text-xs text-gray-700 line-clamp-2">{img.name}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {question.choices.length < 6 && (
                          <Button
                            onClick={() => handleAddChoice(question.id)}
                            variant="outline"
                            className="w-full gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter une réponse
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Pour image_text: Texte seul sans image */}
                    {question.questionType === 'image_text' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            💡 <strong>Mode Texte Uniquement:</strong> Les réponses sont du texte pur. Aucune image requise pour la question.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Réponses texte possibles *
                          </label>
                          <div className="space-y-3">
                            {question.choices.map((choice, cIdx) => {
                              const isFilled = choice.text.trim();
                              return (
                                <div key={choice.id} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">
                                      Proposition {cIdx + 1}
                                    </span>
                                    <div className="flex gap-2">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={choice.isCorrect}
                                          onChange={() => handleToggleCorrect(question.id, choice.id)}
                                          className="w-4 h-4 rounded"
                                        />
                                        <span className="text-xs text-gray-600">Correcte</span>
                                      </label>
                                      {question.choices.length > 2 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteChoice(question.id, choice.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={choice.text}
                                    onChange={(e) => handleUpdateChoiceText(question.id, choice.id, 'text', e.target.value)}
                                    placeholder={`Entrez la proposition ${cIdx + 1}...`}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              );
                            })}
                            {question.choices.length < 6 && (
                              <Button
                                onClick={() => handleAddChoice(question.id)}
                                variant="outline"
                                className="w-full gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Ajouter une réponse
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pour mixed: Image + Text labels */}
                    {question.questionType === 'mixed' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Image de la question *
                          </label>
                          {question.imageId ? (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">{question.imageName}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleUpdateQuestionText(question.id, 'imageId', null);
                                  handleUpdateQuestionText(question.id, 'imageName', '');
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Changer
                              </Button>
                            </div>
                          ) : (
                            <div className="max-h-60 overflow-y-auto border rounded-lg bg-gray-50">
                              <div className="grid grid-cols-3 gap-2 p-2">
                                {images.map(img => (
                                  <button
                                    key={img.id}
                                    onClick={() => {
                                      handleUpdateQuestionText(question.id, 'imageId', img.id);
                                      handleUpdateQuestionText(question.id, 'imageName', img.name);
                                    }}
                                    className="p-2 text-center rounded hover:bg-blue-100 border border-gray-200 hover:border-blue-400 transition-colors bg-white"
                                  >
                                    <img 
                                      src={img.file_path} 
                                      alt={img.name}
                                      className="w-full h-20 object-cover rounded mb-1"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <p className="text-xs text-gray-700 line-clamp-2">{img.name}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Réponses (image + label) *
                          </label>
                          <div className="space-y-3">
                            {question.choices.map((choice, cIdx) => (
                              <div key={choice.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-gray-700">
                                    Réponse {cIdx + 1}
                                  </span>
                                  <div className="flex gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={choice.isCorrect}
                                        onChange={() => handleToggleCorrect(question.id, choice.id)}
                                        className="w-4 h-4 rounded"
                                      />
                                      <span className="text-xs text-gray-600">Correcte</span>
                                    </label>
                                    {question.choices.length > 2 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteChoice(question.id, choice.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-600 mb-2">
                                    Sélectionnez une image:
                                  </label>
                                  {choice.imageName ? (
                                    <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs text-blue-900">{choice.imageName}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          handleUpdateChoiceText(question.id, choice.id, 'imageId', null);
                                          handleUpdateChoiceText(question.id, choice.id, 'imageName', '');
                                        }}
                                        className="text-blue-600 hover:text-blue-700 p-0 h-6"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2">
                                      <div className="grid grid-cols-3 gap-2">
                                        {images.map(img => (
                                          <button
                                            key={img.id}
                                            onClick={() => {
                                              handleUpdateChoiceText(question.id, choice.id, 'imageId', img.id);
                                              handleUpdateChoiceText(question.id, choice.id, 'imageName', img.name);
                                            }}
                                            className="p-1 text-center rounded hover:bg-blue-100 border border-gray-200 hover:border-blue-400 transition-colors bg-white"
                                          >
                                            <img 
                                              src={img.file_path} 
                                              alt={img.name}
                                              className="w-full h-16 object-cover rounded mb-1"
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                              }}
                                            />
                                            <p className="text-xs text-gray-600 line-clamp-1">{img.name}</p>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                  Label texte pour cette réponse:
                                </label>
                                <input
                                  type="text"
                                  value={choice.text}
                                  onChange={(e) => handleUpdateChoiceText(question.id, choice.id, 'text', e.target.value)}
                                  placeholder="Ex: Mode poche, Notifications..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                            ))}
                            {question.choices.length < 6 && (
                              <Button
                                onClick={() => handleAddChoice(question.id)}
                                variant="outline"
                                className="w-full gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Ajouter une réponse
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            className="flex-1"
          >
            {draftSaved ? '✓ Brouillon sauvegardé' : 'Sauvegarder comme brouillon'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Création en cours...' : 'Créer et soumettre'}
          </Button>
          <Button
            onClick={() => navigate('/contributeur')}
            variant="outline"
            className="flex-1"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireCreation;

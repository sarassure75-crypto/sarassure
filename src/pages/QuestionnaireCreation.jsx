import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, Copy, CheckCircle, AlertCircle, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const QuestionnaireCreation = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // État du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('facile');
  const [questions, setQuestions] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Charger les images disponibles
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('app_images')
        .select('id, name, file_path, description')
        .limit(100);

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erreur chargement images:', error);
    }
  };

  // Ajouter une question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      text: '',
      helpText: '',
      questionType: 'image_choice', // image_choice ou image_text
      answerType: '2choices', // 2choices ou 3choices (pour image_choice)
      imageId: null, // Pour image_text
      imageName: '', // Pour image_text
      choices: [
        { id: uuidv4(), imageId: null, imageName: '', isCorrect: false },
        { id: uuidv4(), imageId: null, imageName: '', isCorrect: false }
      ],
      textAnswers: [ // Pour image_text
        { id: uuidv4(), text: '', isCorrect: false },
        { id: uuidv4(), text: '', isCorrect: false },
        { id: uuidv4(), text: '', isCorrect: false }
      ]
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

  // Mettre à jour le nombre de choix
  const handleChangeAnswerType = (questionId, answerType) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      
      if (answerType === '2choices' && q.choices.length > 2) {
        return { ...q, answerType, choices: q.choices.slice(0, 2) };
      } else if (answerType === '3choices' && q.choices.length === 2) {
        return { 
          ...q, 
          answerType, 
          choices: [...q.choices, { id: uuidv4(), imageId: null, imageName: '', isCorrect: false }]
        };
      }
      return { ...q, answerType };
    }));
  };

  // Ajouter une image à une réponse
  const handleSelectImageForChoice = (questionId, choiceId, imageId, imageName) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        choices: q.choices.map(c =>
          c.id === choiceId ? { ...c, imageId, imageName } : c
        )
      };
    }));
  };

  // Marquer la réponse correcte
  const handleMarkCorrect = (questionId, choiceId) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        choices: q.choices.map(c => ({
          ...c,
          isCorrect: c.id === choiceId
        }))
      };
    }));
  };

  // Gérer le type de question (image_choice ou image_text)
  const handleChangeQuestionType = (questionId, questionType) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      
      if (questionType === 'image_choice') {
        return { 
          ...q, 
          questionType,
          answerType: '2choices',
          choices: [
            { id: uuidv4(), imageId: null, imageName: '', isCorrect: false },
            { id: uuidv4(), imageId: null, imageName: '', isCorrect: false }
          ]
        };
      } else {
        return {
          ...q,
          questionType,
          imageId: null,
          imageName: '',
          textAnswers: [
            { id: uuidv4(), text: '', isCorrect: false },
            { id: uuidv4(), text: '', isCorrect: false },
            { id: uuidv4(), text: '', isCorrect: false }
          ]
        };
      }
    }));
  };

  // Sélectionner l'image pour image_text
  const handleSelectImageForQuestion = (questionId, imageId, imageName) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, imageId, imageName } : q
    ));
  };

  // Mettre à jour une réponse texte
  const handleUpdateTextAnswer = (questionId, answerId, text) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        textAnswers: q.textAnswers.map(a =>
          a.id === answerId ? { ...a, text } : a
        )
      };
    }));
  };

  // Marquer une réponse texte comme correcte
  const handleMarkTextAnswerCorrect = (questionId, answerId) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        textAnswers: q.textAnswers.map(a => ({
          ...a,
          isCorrect: a.id === answerId
        }))
      };
    }));
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = [];
    if (!title.trim()) errors.push('Le titre est requis');
    if (!description.trim()) errors.push('La description est requise');
    if (!category) errors.push('La catégorie est requise');
    if (questions.length === 0) errors.push('Au moins une question est requise');
    
    questions.forEach((q, idx) => {
      if (!q.text.trim()) errors.push(`Question ${idx + 1}: le texte est requis`);
      
      if (q.questionType === 'image_choice') {
        const choicesWithImages = q.choices.filter(c => c.imageId);
        if (choicesWithImages.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une image est requise`);
        }
        
        const correctAnswers = q.choices.filter(c => c.isCorrect);
        if (correctAnswers.length === 0) {
          errors.push(`Question ${idx + 1}: veuillez marquer la réponse correcte`);
        }
      } else if (q.questionType === 'image_text') {
        if (!q.imageId) {
          errors.push(`Question ${idx + 1}: une image est requise`);
        }
        
        const filledAnswers = q.textAnswers.filter(a => a.text.trim());
        if (filledAnswers.length === 0) {
          errors.push(`Question ${idx + 1}: au moins une réponse texte est requise`);
        }
        
        const correctAnswers = q.textAnswers.filter(a => a.isCorrect);
        if (correctAnswers.length === 0) {
          errors.push(`Question ${idx + 1}: veuillez marquer la réponse correcte`);
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
      difficulty,
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
      // Créer la tâche questionnaire
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          title,
          description,
          category,
          owner_id: currentUser.id,
          is_public: false,
          creation_status: {
            type: 'questionnaire',
            difficulty,
            created_at: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      // Créer la version questionnaire
      const { data: version, error: versionError } = await supabase
        .from('versions')
        .insert([{
          task_id: task.id,
          name: 'Questionnaire',
          version: 1,
          version_int: 1,
          creation_status: 'pending'
        }])
        .select()
        .single();

      if (versionError) throw versionError;

      // Sauvegarder les questions avec leurs images ou réponses texte
      const questionsData = questions.map((q, idx) => {
        let questionData = {};
        
        if (q.questionType === 'image_choice') {
          questionData = {
            type: 'image_choice',
            choicesCount: q.choices.length,
            choices: q.choices.map(c => ({
              id: c.id,
              imageId: c.imageId,
              imageName: c.imageName,
              isCorrect: c.isCorrect
            }))
          };
        } else if (q.questionType === 'image_text') {
          questionData = {
            type: 'image_text',
            imageId: q.imageId,
            imageName: q.imageName,
            answers: q.textAnswers.map(a => ({
              id: a.id,
              text: a.text,
              isCorrect: a.isCorrect
            }))
          };
        }
        
        return {
          id: uuidv4(),
          version_id: version.id,
          step_order: idx + 1,
          instruction: q.text,
          expected_input: q.helpText || (q.questionType === 'image_choice' ? 'Choisir la bonne capture d\'écran' : 'Sélectionnez la bonne réponse'),
          creation_status: 'pending',
          question_data: questionData
        };
      });

      // Insérer les questions comme des steps
      const { error: stepsError } = await supabase
        .from('steps')
        .insert(questionsData);

      if (stepsError) throw stepsError;

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
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'objectif de ce questionnaire..."
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
                  <option value="Communication">Communication</option>
                  <option value="Réseaux sociaux">Réseaux sociaux</option>
                  <option value="Paramètres">Paramètres</option>
                  <option value="Applications">Applications</option>
                  <option value="Sécurité">Sécurité</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulté
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
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
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={question.questionType === 'image_choice'}
                          onChange={() => handleChangeQuestionType(question.id, 'image_choice')}
                          className="w-4 h-4"
                        />
                        <span>Image + Choix d'images</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={question.questionType === 'image_text'}
                          onChange={() => handleChangeQuestionType(question.id, 'image_text')}
                          className="w-4 h-4"
                        />
                        <span>Image + Réponses texte</span>
                      </label>
                    </div>
                  </div>

                  {/* Nombre de choix (seulement pour image_choice) */}
                  {question.questionType === 'image_choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de réponses
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={question.answerType === '2choices'}
                            onChange={() => handleChangeAnswerType(question.id, '2choices')}
                            className="w-4 h-4"
                          />
                          <span>2 réponses</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={question.answerType === '3choices'}
                            onChange={() => handleChangeAnswerType(question.id, '3choices')}
                            className="w-4 h-4"
                          />
                          <span>3 réponses</span>
                        </label>
                      </div>
                    </div>
                  )}                  {/* SECTION IMAGE_CHOICE: Choix avec images */}
                  {question.questionType === 'image_choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Réponses (sélectionnez une image par réponse) *
                      </label>
                      <div className="space-y-3">
                        {question.choices.map((choice, cIdx) => (
                          <div key={choice.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-medium text-gray-700">
                                Réponse {cIdx + 1}
                              </span>
                              {choice.isCorrect && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                  <CheckCircle className="w-3 h-3" /> Correcte
                                </span>
                              )}
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
                                  onClick={() => handleSelectImageForChoice(question.id, choice.id, null, '')}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  Changer
                                </Button>
                              </div>
                            ) : (
                              <div className="mb-3 max-h-48 overflow-y-auto border rounded-lg">
                                <div className="grid grid-cols-3 gap-2 p-2">
                                  {images.map(img => (
                                    <button
                                      key={img.id}
                                      onClick={() => handleSelectImageForChoice(question.id, choice.id, img.id, img.name)}
                                      className="p-2 text-center rounded hover:bg-blue-50 border hover:border-blue-300 transition-colors"
                                    >
                                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                                      <p className="text-xs text-gray-700 line-clamp-2">{img.name}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={() => handleMarkCorrect(question.id, choice.id)}
                              variant={choice.isCorrect ? 'default' : 'outline'}
                              size="sm"
                              className={choice.isCorrect ? 'w-full bg-green-600 hover:bg-green-700' : 'w-full'}
                            >
                              {choice.isCorrect ? '✓ Réponse correcte' : 'Marquer comme correcte'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SECTION IMAGE_TEXT: Image + Réponses texte */}
                  {question.questionType === 'image_text' && (
                    <div className="space-y-4">
                      {/* Sélectionner l'image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Image de la question *
                        </label>
                        {question.imageName ? (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">{question.imageName}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectImageForQuestion(question.id, null, '')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Changer
                            </Button>
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border rounded-lg">
                            <div className="grid grid-cols-3 gap-2 p-2">
                              {images.map(img => (
                                <button
                                  key={img.id}
                                  onClick={() => handleSelectImageForQuestion(question.id, img.id, img.name)}
                                  className="p-2 text-center rounded hover:bg-blue-50 border hover:border-blue-300 transition-colors"
                                >
                                  <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                                  <p className="text-xs text-gray-700 line-clamp-2">{img.name}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Réponses texte */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Réponses possibles (3 propositions) *
                        </label>
                        <div className="space-y-3">
                          {question.textAnswers.map((answer, aIdx) => (
                            <div key={answer.id} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Proposition {aIdx + 1}
                                </span>
                                {answer.isCorrect && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                    <CheckCircle className="w-3 h-3" /> Correcte
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                value={answer.text}
                                onChange={(e) => handleUpdateTextAnswer(question.id, answer.id, e.target.value)}
                                placeholder={`Entrez la proposition ${aIdx + 1}...`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                              />
                              <Button
                                onClick={() => handleMarkTextAnswerCorrect(question.id, answer.id)}
                                variant={answer.isCorrect ? 'default' : 'outline'}
                                size="sm"
                                className={answer.isCorrect ? 'w-full bg-green-600 hover:bg-green-700' : 'w-full'}
                              >
                                {answer.isCorrect ? '✓ Réponse correcte' : 'Marquer comme correcte'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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

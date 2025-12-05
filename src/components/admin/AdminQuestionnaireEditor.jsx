import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Save, Trash2, XCircle, Plus, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { creationStatuses } from '@/data/tasks';
import { useToast } from '@/components/ui/use-toast';
import { supabase, getImageUrl } from '@/lib/supabaseClient';

/**
 * AdminQuestionnaireEditor
 * Éditeur spécifique pour les questionnaires (QCM) dans l'interface admin
 * Permet de modifier le titre, description, catégorie et les questions du QCM
 */
const AdminQuestionnaireEditor = ({ task: initialTask, onSave, onCancel, onDelete }) => {
  const [task, setTask] = useState(initialTask);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [images, setImages] = useState([]);
  const { categories, isLoading } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== DEBUG AdminQuestionnaireEditor: initialTask reçu ===', initialTask);
    setTask(initialTask);
    
    // Charger les questions directement depuis la table questionnaire_questions
    if (initialTask?.id) {
      loadQuestionsFromDatabase(initialTask.id);
    } else {
      setQuestions([]);
    }
  }, [initialTask]);

  const loadQuestionsFromDatabase = async (taskId) => {
    try {
      console.log('=== DEBUG: Chargement questions depuis la base de données ===');
      
      // D'abord, essayer de récupérer les questions de la nouvelle table questionnaire_questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('task_id', taskId)
        .order('question_order');

      if (questionsError) {
        console.error('Erreur chargement questions (nouvelle table):', questionsError);
        // Continuer avec le fallback sur les versions/steps
      }

      console.log('Questions chargées (nouvelle table):', questionsData);

      // Si on a trouvé des questions dans la nouvelle table
      if (questionsData && questionsData.length > 0) {
        // Récupérer les réponses pour chaque question
        const questionIds = questionsData.map(q => q.id);
        const { data: choicesData, error: choicesError } = await supabase
          .from('questionnaire_choices')
          .select('*')
          .in('question_id', questionIds)
          .order('choice_order');

        if (choicesError) {
          console.error('Erreur chargement réponses:', choicesError);
        }

        console.log('Réponses chargées:', choicesData);

        // Combiner les données
        const loadedQuestions = questionsData.map(q => {
          const questionChoices = (choicesData || []).filter(c => c.question_id === q.id);
          return {
            id: q.id,
            order: q.question_order,
            instruction: q.instruction,
            questionType: q.question_type,
            imageId: q.image_id,
            imageName: q.image_name,
            choices: questionChoices.map(c => ({
              id: c.id,
              text: c.text,
              imageId: c.image_id,
              imageName: c.image_name
            })),
            correctAnswers: questionChoices.filter(c => c.is_correct).map(c => c.id)
          };
        });

        console.log('=== DEBUG: Questions finales chargées (nouvelle table) ===', loadedQuestions);
        setQuestions(loadedQuestions);
        return;
      }

      // FALLBACK: Si aucune question dans la nouvelle table, essayer les versions/steps (ancien système)
      console.log('Aucune question dans la nouvelle table, essai du système versions/steps...');
      
      // Récupérer les versions du task
      const { data: versionsData, error: versionsError } = await supabase
        .from('versions')
        .select('id, steps(*)')
        .eq('task_id', taskId)
        .order('created_at');

      if (versionsError) {
        console.error('Erreur chargement versions:', versionsError);
        setQuestions([]);
        return;
      }

      console.log('Versions chargées (fallback):', versionsData);

      if (!versionsData || versionsData.length === 0) {
        console.log('Aucune version trouvée non plus');
        setQuestions([]);
        return;
      }

      // Utiliser la première version
      const firstVersion = versionsData[0];
      if (!firstVersion.steps || firstVersion.steps.length === 0) {
        console.log('La première version n\'a pas de steps');
        setQuestions([]);
        return;
      }

      // Convertir les steps en questions
      const loadedQuestions = firstVersion.steps.map(step => {
        const expectedInput = step.expected_input || {};
        return {
          id: step.id,
          order: step.step_order,
          instruction: step.instruction,
          questionType: expectedInput.questionType || 'image_choice',
          imageId: expectedInput.imageId,
          imageName: expectedInput.imageName,
          choices: (expectedInput.choices || []).map(c => ({
            id: c.id || `choice-${Date.now()}-${Math.random()}`,
            text: c.text,
            imageId: c.imageId,
            imageName: c.imageName
          })),
          correctAnswers: expectedInput.correctAnswers || []
        };
      });

      console.log('=== DEBUG: Questions finales chargées (fallback versions/steps) ===', loadedQuestions);
      setQuestions(loadedQuestions);
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      setQuestions([]);
    }
  };

  useEffect(() => {
    loadQCMImages();
  }, []);

  const loadQCMImages = async () => {
    try {
      const { data, error } = await supabase
        .from('app_images')
        .select('*')
        .eq('category', 'QCM')
        .order('name');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erreur chargement images QCM:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    const selectedCat = categories.find(c => c.id.toString() === categoryId);
    setTask(prev => ({ 
      ...prev, 
      category_id: categoryId,
      category: selectedCat ? selectedCat.name : null
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      order: questions.length + 1,
      instruction: '',
      questionType: 'image_choice',
      imageId: null,
      imageName: null,
      choices: [],
      correctAnswers: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const addChoice = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newChoice = {
          id: `choice-${Date.now()}`,
          text: '',
          imageId: null,
          imageName: null
        };
        return { ...q, choices: [...q.choices, newChoice] };
      }
      return q;
    }));
  };

  const removeChoice = (questionId, choiceId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { 
          ...q, 
          choices: q.choices.filter(c => c.id !== choiceId),
          correctAnswers: q.correctAnswers.filter(ca => ca !== choiceId)
        };
      }
      return q;
    }));
  };

  const updateChoice = (questionId, choiceId, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          choices: q.choices.map(c => 
            c.id === choiceId ? { ...c, [field]: value } : c
          )
        };
      }
      return q;
    }));
  };

  const toggleCorrectAnswer = (questionId, choiceId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const isCorrect = q.correctAnswers.includes(choiceId);
        return {
          ...q,
          correctAnswers: isCorrect
            ? q.correctAnswers.filter(ca => ca !== choiceId)
            : [...q.correctAnswers, choiceId]
        };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!task.title?.trim()) {
        toast({ title: 'Erreur', description: 'Le titre est obligatoire', variant: 'destructive' });
        return;
      }

      if (questions.length === 0) {
        toast({ title: 'Erreur', description: 'Ajoutez au moins une question', variant: 'destructive' });
        return;
      }

      // Vérifier que chaque question a au moins une bonne réponse
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        if (!q.instruction?.trim()) {
          toast({ title: 'Erreur', description: `Question ${i + 1}: L'énoncé est obligatoire`, variant: 'destructive' });
          return;
        }
        
        if (q.choices.length === 0) {
          toast({ title: 'Erreur', description: `Question "${q.instruction}": Ajoutez au moins une réponse`, variant: 'destructive' });
          return;
        }

        // Vérifier que chaque réponse a un texte
        const choicesWithText = q.choices.filter(c => c.text?.trim());
        if (choicesWithText.length !== q.choices.length) {
          toast({ title: 'Erreur', description: `Question "${q.instruction}": Toutes les réponses doivent avoir un texte`, variant: 'destructive' });
          return;
        }

        if (q.correctAnswers.length === 0) {
          toast({ title: 'Erreur', description: `La question "${q.instruction}" doit avoir au moins une bonne réponse. Cochez au moins une réponse.`, variant: 'destructive' });
          return;
        }
      }

      // Log pour debug
      console.log('=== DEBUG: Questions avant sauvegarde ===');
      questions.forEach((q, i) => {
        console.log(`Question ${i + 1}: "${q.instruction}"`);
        console.log(`  Réponses: ${q.choices.length}`, q.choices);
        console.log(`  Bonnes réponses: ${q.correctAnswers.length}`, q.correctAnswers);
      });

      // Préparer les données de sauvegarde
      const taskData = {
        ...task,
        task_type: 'questionnaire',
        questions: questions // Inclure les questions pour traitement ultérieur
      };

      console.log('=== DEBUG: TaskData à sauvegarder ===', taskData);

      onSave(taskData);
    } catch (error) {
      console.error('Erreur sauvegarde QCM:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder le QCM', variant: 'destructive' });
    }
  };

  // Use the global getImageUrl from supabaseClient for consistent image loading
  // This uses the 'images' bucket and handles the publicUrl correctly

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            Éditer le Questionnaire (QCM)
          </CardTitle>
          <CardDescription>
            Modifiez les informations et questions de ce QCM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre du QCM *</Label>
              <Input
                id="title"
                name="title"
                value={task.title || ''}
                onChange={handleChange}
                placeholder="Ex: Test de connaissances sur..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={task.description || ''}
                onChange={handleChange}
                placeholder="Décrivez brièvement ce QCM"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={task.category_id?.toString() || ''} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={task.creation_status || 'draft'} 
                  onValueChange={(value) => handleSelectChange('creation_status', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {creationStatuses.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Questions ({questions.length})</Label>
              <Button onClick={addQuestion} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={question.id} className="border-blue-200">
                <CardHeader className="bg-blue-50 pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base text-blue-900">
                      Question {qIndex + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Énoncé de la question */}
                  <div>
                    <Label>Énoncé de la question *</Label>
                    <Textarea
                      value={question.instruction}
                      onChange={(e) => updateQuestion(question.id, 'instruction', e.target.value)}
                      placeholder="Posez votre question ici..."
                      rows={2}
                    />
                  </div>

                  {/* Image de la question */}
                  <div>
                    <Label>Image de la question (optionnelle)</Label>
                    <Select
                      value={question.imageId || 'none'}
                      onValueChange={(value) => {
                        const img = images.find(i => i.id === value);
                        updateQuestion(question.id, 'imageId', value === 'none' ? null : value);
                        updateQuestion(question.id, 'imageName', value === 'none' ? null : img?.file_path || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Aucune image" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune image</SelectItem>
                        {images.map(img => (
                          <SelectItem key={img.id} value={img.id}>
                            {img.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {question.imageName && (
                      <img
                        src={getImageUrl(question.imageName)}
                        alt="Aperçu"
                        className="mt-2 max-h-32 rounded border"
                      />
                    )}
                  </div>

                  {/* Réponses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Réponses possibles *</Label>
                      <Button
                        onClick={() => addChoice(question.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter une réponse
                      </Button>
                    </div>

                    {question.choices.map((choice, cIndex) => (
                      <div key={choice.id} className="flex items-start gap-2 p-3 border rounded bg-background">
                        <input
                          type="checkbox"
                          checked={question.correctAnswers.includes(choice.id)}
                          onChange={() => toggleCorrectAnswer(question.id, choice.id)}
                          className="mt-2 h-4 w-4 accent-green-600"
                          title="Cocher si c'est une bonne réponse"
                        />
                        <div className="flex-1 space-y-2">
                          <Input
                            value={choice.text}
                            onChange={(e) => updateChoice(question.id, choice.id, 'text', e.target.value)}
                            placeholder={`Réponse ${cIndex + 1}`}
                          />
                          <Select
                            value={choice.imageId || 'none'}
                            onValueChange={(value) => {
                              const img = images.find(i => i.id === value);
                              updateChoice(question.id, choice.id, 'imageId', value === 'none' ? null : value);
                              updateChoice(question.id, choice.id, 'imageName', value === 'none' ? null : img?.file_path || null);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Image (opt.)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucune</SelectItem>
                              {images.map(img => (
                                <SelectItem key={img.id} value={img.id}>
                                  {img.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChoice(question.id, choice.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {question.choices.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        Aucune réponse ajoutée. Cliquez sur "Ajouter une réponse".
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {questions.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <XCircle className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            {!task.isNew && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer le QCM
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce QCM ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(task.id);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminQuestionnaireEditor;

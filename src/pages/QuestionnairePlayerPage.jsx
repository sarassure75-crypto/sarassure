import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, getImageUrl } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * QuestionnairePlayerPage
 * Page dédiée pour afficher et permettre aux apprenants de répondre aux QCM
 */
const QuestionnairePlayerPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [task, setTask] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuestionnaireData();
  }, [taskId]);

  const fetchQuestionnaireData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer la tâche
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      if (!taskData) {
        setError('Questionnaire non trouvé');
        return;
      }

      // Vérifier que c'est un questionnaire
      if (taskData.task_type !== 'questionnaire') {
        setError('Cette tâche n\'est pas un questionnaire');
        return;
      }

      setTask(taskData);

      // Récupérer les questions avec les images associées
      const { data: questionsData, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select(`
          *,
          app_images:image_id (id, name, file_path),
          questionnaire_choices (
            *,
            app_images:image_id (id, name, file_path)
          )
        `)
        .eq('task_id', taskId)
        .order('question_order');

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        setError('Aucune question trouvée pour ce questionnaire');
        return;
      }

      // Formater les questions avec les réponses
      const formattedQuestions = questionsData.map(q => ({
        id: q.id,
        instruction: q.instruction,
        type: q.question_type,
        image: q.app_images ? {
          id: q.app_images.id,
          name: q.app_images.name,
          filePath: q.app_images.file_path
        } : null,
        choices: (q.questionnaire_choices || []).sort((a, b) => a.choice_order - b.choice_order).map(c => ({
          id: c.id,
          text: c.text,
          image: c.app_images ? {
            id: c.app_images.id,
            name: c.app_images.name,
            filePath: c.app_images.file_path
          } : null,
          isCorrect: c.is_correct
        }))
      }));

      setQuestions(formattedQuestions);
    } catch (err) {
      console.error('Erreur chargement questionnaire:', err);
      setError('Erreur lors du chargement du questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, choiceId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Fin du questionnaire
      calculateScore();
      setShowCompletionScreen(true);
      saveAttempt();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach(question => {
      const selectedChoiceId = userAnswers[question.id];
      if (selectedChoiceId) {
        const selectedChoice = question.choices.find(c => c.id === selectedChoiceId);
        if (selectedChoice?.isCorrect) {
          correctCount++;
        }
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(percentage);
  };

  const saveAttempt = async () => {
    try {
      if (!currentUser) {
        console.error('Pas de utilisateur connecté');
        return;
      }

      console.log('=== DEBUG: Sauvegarde tentative QCM ===');
      console.log('Task ID:', taskId);
      console.log('Learner ID:', currentUser.id);

      const correctAnswersCount = questions.reduce((count, question) => {
        const selectedChoiceId = userAnswers[question.id];
        if (selectedChoiceId) {
          const selectedChoice = question.choices.find(c => c.id === selectedChoiceId);
          return selectedChoice?.isCorrect ? count + 1 : count;
        }
        return count;
      }, 0);

      const percentage = Math.round((correctAnswersCount / questions.length) * 100);
      console.log('Percentage calculé:', percentage);

      // Vérifier si l'utilisateur a déjà des tentatives
      const { data: existingAttempts, error: selectError } = await supabase
        .from('questionnaire_attempts')
        .select('*')
        .eq('questionnaire_id', taskId)
        .eq('learner_id', currentUser.id);

      if (selectError) {
        console.error('Erreur lors de la recherche de tentatives:', selectError);
        throw selectError;
      }

      console.log('Tentatives existantes:', existingAttempts);

      if (existingAttempts && existingAttempts.length > 0) {
        // Mettre à jour la tentative existante
        const existingAttempt = existingAttempts[0];
        console.log('Mise à jour tentative existante:', existingAttempt.id);
        
        const { error } = await supabase
          .from('questionnaire_attempts')
          .update({
            percentage: percentage,
            status: 'completed',
            attempted_at: new Date().toISOString(),
            best_percentage: Math.max(existingAttempt.best_percentage || 0, percentage)
          })
          .eq('id', existingAttempt.id);

        if (error) {
          console.error('Erreur mise à jour:', error);
          throw error;
        }
        console.log('Tentative mise à jour avec succès');
      } else {
        // Créer une nouvelle tentative
        console.log('Création nouvelle tentative');
        const { data: insertData, error } = await supabase
          .from('questionnaire_attempts')
          .insert({
            questionnaire_id: taskId,
            learner_id: currentUser.id,
            percentage: percentage,
            status: 'completed',
            attempted_at: new Date().toISOString(),
            best_percentage: percentage
          })
          .select();

        if (error) {
          console.error('Erreur insertion:', error);
          throw error;
        }
        console.log('Tentative créée:', insertData);
      }

      toast({
        title: 'Questionnaire sauvegardé',
        description: `Votre score: ${percentage}%`
      });
    } catch (err) {
      console.error('Erreur sauvegarde tentative:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erreur</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate('/taches')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  if (!task || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswerId = userAnswers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/taches')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-blue-700">{task.title}</h1>
          <div className="w-24"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-blue-100" />
        </div>

        <AnimatePresence mode="wait">
          {!showCompletionScreen ? (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question Card */}
              <Card className="border-2 border-blue-500 shadow-lg mb-6">
                <CardHeader className="bg-blue-50 border-b-2 border-blue-500">
                  <CardTitle className="text-blue-700">{currentQuestion.instruction}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Question Image - Conteneur dédié */}
                  {currentQuestion.image?.filePath && (
                    <div className="w-full bg-gradient-to-br from-blue-50 to-gray-50 border-2 border-blue-200 rounded-xl p-4">
                      <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Image de la question</p>
                      <div className="flex justify-center items-center min-h-40 bg-white rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(currentQuestion.image.filePath)}
                          alt={currentQuestion.image.name}
                          className="max-w-full max-h-56 object-contain"
                          onError={(e) => {
                            console.warn(`Failed to load image: ${currentQuestion.image.filePath}`);
                            e.target.parentElement.innerHTML = '<div class="text-gray-400 text-sm">Image non disponible</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Choices - Conteneur */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Sélectionnez votre réponse</p>
                    <div className="space-y-3">
                    {currentQuestion.choices.map(choice => (
                      <motion.button
                        key={choice.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectAnswer(currentQuestion.id, choice.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedAnswerId === choice.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                      >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1 ${
                              selectedAnswerId === choice.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedAnswerId === choice.id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-800">{choice.text}</span>
                          </div>
                        </div>
                        {choice.image?.filePath && (
                          <div className="ml-8 bg-white border border-gray-200 rounded-lg p-2 overflow-hidden">
                            <img
                              src={getImageUrl(choice.image.filePath)}
                              alt={choice.image.name}
                              className="max-w-full h-auto max-h-32 object-contain mx-auto"
                              onError={(e) => {
                                console.warn(`Failed to load choice image: ${choice.image.filePath}`);
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      </motion.button>
                    ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Précédent
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleNext}
                  disabled={!selectedAnswerId}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Terminer' : 'Suivant'}
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Completion Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="mb-6">
                {score >= 80 ? (
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                ) : score >= 50 ? (
                  <AlertTriangle className="h-20 w-20 text-yellow-500 mx-auto" />
                ) : (
                  <XCircle className="h-20 w-20 text-red-500 mx-auto" />
                )}
              </div>

              <h2 className="text-3xl font-bold mb-2">Questionnaire terminé !</h2>
              <p className="text-gray-600 mb-6">
                {score >= 80
                  ? '🎉 Excellent travail !'
                  : score >= 50
                  ? '👍 Pas mal !'
                  : '📚 Continuez vos efforts'}
              </p>

              <Card className="bg-blue-50 border-blue-200 mb-6">
                <CardContent className="pt-6">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{score}%</div>
                  <p className="text-gray-600">Votre score</p>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/taches')}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Retour à la liste
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setCurrentQuestionIndex(0);
                    setUserAnswers({});
                    setShowCompletionScreen(false);
                  }}
                >
                  Recommencer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionnairePlayerPage;

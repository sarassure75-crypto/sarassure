import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase, getImageUrl } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import ImageFromSupabase from '@/components/ImageFromSupabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * QuestionnairePlayer
 * Composant pour répondre à un questionnaire (QCM)
 * Affiche les questions une par une et collecte les réponses
 */
export default function QuestionnairePlayer({ versionId, taskId, learner_id, onComplete }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  // Charger les questions du questionnaire
  useEffect(() => {
    loadQuestions();
    startAttempt();
  }, [versionId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('steps')
        .select('*')
        .eq('version_id', versionId)
        .order('step_order', { ascending: true });

      if (error) throw error;

      // Traiter les questions
      const processedQuestions = (data || []).map(step => {
        const expected = step.expected_input || {};
        return {
          id: step.id,
          order: step.step_order,
          instruction: step.instruction,
          questionType: expected.questionType || 'image_choice',
          imageId: expected.imageId,
          imageName: expected.imageName,
          choices: expected.choices || [],
          correctAnswers: expected.correctAnswers || []
        };
      });

      setQuestions(processedQuestions);
      // Initialiser les réponses
      const initialAnswers = {};
      processedQuestions.forEach(q => {
        initialAnswers[q.id] = [];
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Erreur chargement questions:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les questions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const startAttempt = async () => {
    try {
      const { data, error } = await supabase
        .from('questionnaire_attempts')
        .insert({
          learner_id: currentUser.id,
          questionnaire_id: taskId,
          version_id: versionId,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      setAttemptId(data.id);
    } catch (error) {
      console.error('Erreur création tentative:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectChoice = (choiceId) => {
    if (!currentQuestion) return;

    if (currentQuestion.questionType === 'image_choice' || currentQuestion.questionType === 'image_text') {
      // Radio button: une seule réponse
      setAnswers({
        ...answers,
        [currentQuestion.id]: [choiceId]
      });
    } else if (currentQuestion.questionType === 'mixed') {
      // Checkbox: plusieurs réponses
      const current = answers[currentQuestion.id] || [];
      if (current.includes(choiceId)) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: current.filter(id => id !== choiceId)
        });
      } else {
        setAnswers({
          ...answers,
          [currentQuestion.id]: [...current, choiceId]
        });
      }
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitAttempt = async () => {
    if (!attemptId || !currentQuestion) return;

    setSubmitting(true);
    try {
      let totalScore = 0;
      let maxScore = questions.length;

      // Enregistrer toutes les réponses et calculer le score
      for (const question of questions) {
        const selectedChoices = answers[question.id] || [];
        const correctChoiceIds = (question.correctAnswers || []);
        
        // Vérifier si la réponse est correcte
        const isCorrect = 
          selectedChoices.length === correctChoiceIds.length &&
          selectedChoices.every(id => correctChoiceIds.includes(id));

        if (isCorrect) totalScore += 1;

        // Enregistrer la réponse
        await supabase
          .from('questionnaire_answers')
          .insert({
            attempt_id: attemptId,
            step_id: question.id,
            selected_choice_ids: selectedChoices,
            is_correct: isCorrect
          });
      }

      // Calculer le pourcentage
      const percentage = Math.round((totalScore / maxScore) * 100);

      // Mettre à jour la tentative avec le score final
      await supabase
        .from('questionnaire_attempts')
        .update({
          score: totalScore,
          max_score: maxScore,
          percentage: percentage,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      setFinalScore({ score: totalScore, maxScore, percentage });
      setIsCompleted(true);

      toast({ title: 'Succès', description: `Score: ${totalScore}/${maxScore}` });
      
      // Appeler le callback après 3 secondes
      if (onComplete) {
        setTimeout(() => onComplete({ score: totalScore, maxScore, percentage }), 3000);
      }
    } catch (error) {
      console.error('Erreur soumission:', error);
      toast({ title: 'Erreur', description: 'Impossible de soumettre votre réponse', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du questionnaire...</div>;
  }

  if (questions.length === 0) {
    return <div className="text-center py-8">Aucune question trouvée</div>;
  }

  if (isCompleted && finalScore) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-8 text-center">
          <div className="mb-6">
            {finalScore.percentage >= 80 ? (
              <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            )}
          </div>
          <h2 className="text-3xl font-bold mb-4">Résultat: {finalScore.percentage}%</h2>
          <p className="text-lg text-gray-600 mb-2">
            {finalScore.score} / {finalScore.maxScore} réponses correctes
          </p>
          <p className="text-sm text-gray-500">
            {finalScore.percentage >= 80 ? '✓ Excellent travail!' : 'Continuez vos efforts!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const selectedAnswers = answers[currentQuestion.id] || [];

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-blue-500">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-blue-700">
          Question {currentQuestionIndex + 1} / {questions.length}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Instruction de la question */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
          <h3 className="text-xl font-bold text-blue-900 mb-2">{currentQuestion.instruction}</h3>

          {/* Image de la question (si image_choice ou mixed) */}
          {currentQuestion.imageId && ['image_choice', 'mixed'].includes(currentQuestion.questionType) && (
            <div className="mb-4">
              <ImageFromSupabase
                imageId={currentQuestion.imageId}
                alt="Question"
                className="max-w-full h-auto rounded-lg max-h-80 mx-auto"
              />
            </div>
          )}
        </div>

        {/* Réponses possibles */}
        <div className="space-y-3">
          {currentQuestion.choices.map((choice, idx) => {
            const choiceId = choice.id || idx;
            const isSelected = selectedAnswers.includes(choiceId);

            return (
              <div key={choiceId} className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                {currentQuestion.questionType === 'image_choice' || currentQuestion.questionType === 'image_text' ? (
                  // Radio button
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={isSelected}
                    onChange={() => handleSelectChoice(choiceId)}
                    className="w-5 h-5 mt-1 cursor-pointer accent-blue-600"
                  />
                ) : (
                  // Checkbox (mixed)
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectChoice(choiceId)}
                    className="w-5 h-5 mt-1 cursor-pointer accent-blue-600"
                  />
                )}

                <label className="flex-1 cursor-pointer">
                  {/* Image de la réponse (si available) */}
                  {choice.imageId && ['image_choice', 'mixed'].includes(currentQuestion.questionType) && (
                    <div className="mb-2">
                      <ImageFromSupabase
                        imageId={choice.imageId}
                        alt={choice.text || 'Réponse'}
                        className="w-20 h-20 rounded object-cover cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Texte de la réponse */}
                  {choice.text && <p className="text-base">{choice.text}</p>}
                </label>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-2 justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={submitAttempt}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Soumission...' : 'Soumettre'}
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="pt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

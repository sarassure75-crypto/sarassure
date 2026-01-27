import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, AlertCircle, Home, Volume2, Type } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';
import { cn } from '@/lib/utils';
import ImageFromSupabase from '@/components/ImageFromSupabase';
import { HighlightGlossaryTerms } from '@/components/GlossaryComponents';
import { v4 as uuidv4 } from 'uuid';

// Helper pour afficher les icônes
const renderIcon = (iconString) => {
  if (!iconString) return null;
  
  // Support pour les icônes Iconify colorées (format: "logos:react", "skill-icons:javascript")
  if (iconString.includes(':') && (
    iconString.startsWith('logos:') || 
    iconString.startsWith('skill-icons:') || 
    iconString.startsWith('devicon:')
  )) {
    return <IconifyIcon icon={iconString} width="64" height="64" />;
  }
  
  // Déterminer la bibliothèque et le nom de l'icône
  let library, name;
  
  // Format avec tiret: "fa6-FaPhone", "bs-BsArchive", etc.
  if (iconString.includes('-')) {
    const parts = iconString.split('-');
    library = parts[0];
    name = parts.slice(1).join('-'); // Rejoindre en cas de plusieurs tirets
  } 
  // Format Iconify avec : pour autres bibliothèques
  else if (iconString.includes(':')) {
    const [lib, iconName] = iconString.split(':');
    library = lib;
    name = iconName;
  } else {
    console.error('❌ Format d\'icône invalide:', iconString);
    return null;
  }
  
  const libraries = {
    lucide: LucideIcons,
    fa6: FontAwesome6,
    fa: FontAwesome6,
    bs: BootstrapIcons,
    md: MaterialIcons,
    fi: FeatherIcons,
    hi2: HeroiconsIcons,
    ai: AntIcons,
  };
  
  const lib = libraries[library];
  if (!lib) {
    console.error('❌ Library not found:', library);
    return null;
  }
  
  const IconComponent = lib[name];
  if (!IconComponent) {
    console.error('❌ Icon not found:', name, 'in library:', library);
    console.log('Available icons sample:', Object.keys(lib).slice(0, 5));
    return null;
  }
  
  return <IconComponent size={64} className="text-primary" />;
};

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

/**
 * QuestionnairePlayer
 * Composant pour répondre à un questionnaire (QCM)
 * Affiche les questions une par une et collecte les réponses
 */
export default function QuestionnairePlayer({ versionId, taskId, learner_id, onComplete }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [textZoom, setTextZoom] = useState(1);
  const [showTextZoomMenu, setShowTextZoomMenu] = useState(false);

  // Charger les questions du questionnaire
  useEffect(() => {
    console.log('🎬 QuestionnairePlayer mounted with props:', { versionId, taskId, learner_id });
    loadQuestions();
    startAttempt();
  }, [versionId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading questions for versionId:', versionId, 'taskId:', taskId);
      
      const { data, error } = await supabase
        .from('steps')
        .select('*')
        .eq('version_id', versionId)
        .order('step_order', { ascending: true });

      console.log('📊 Query result:', { error, dataLength: data?.length, versionId });

      if (error) throw error;

      if (!data || data.length === 0) {
        console.warn('⚠️ No steps found for versionId:', versionId);
        console.warn('Check if:');
        console.warn('1. versionId is correct');
        console.warn('2. Steps exist in the database for this version');
        console.warn('3. RLS policies allow reading');
        setQuestions([]);
        setLoading(false);
        return;
      }

      console.log('✅ Steps found:', data.length);

      const processedQuestions = (data || []).map(step => {
        const rawExpected = step.expected_input;
        let expected = rawExpected;

        if (typeof rawExpected === 'string') {
          try {
            expected = JSON.parse(rawExpected);
          } catch (error) {
            console.error('Erreur de parsing expected_input pour la question', step.id, error);
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

        const normalizedChoices = rawChoices.map(choice => {
          const iconId = choice.iconId || choice.icon?.id || (typeof choice.icon === 'string' ? choice.icon : null);

          return {
            id: choice.id || uuidv4(),
            text: choice.text || '',
            imageId: choice.imageId || null,
            imageName: choice.imageName || '',
            iconId,
            icon: choice.icon || null,
            iconSvg: choice.iconSvg || null,
            isCorrect: !!choice.isCorrect
          };
        });
        
        console.log('🔍 DEBUG QCM - Choices chargées:', normalizedChoices);

        const correctAnswers = Array.isArray(expected.correctAnswers) && expected.correctAnswers.length > 0
          ? expected.correctAnswers
          : normalizedChoices.filter(c => c.isCorrect).map(c => c.id);

        return {
          id: step.id,
          order: step.step_order,
          instruction: step.instruction,
          questionType,
          imageId: expected.imageId || null,
          imageName: expected.imageName || null,
          choices: normalizedChoices,
          correctAnswers
        };
      });

      setQuestions(processedQuestions);
      // Initialiser les réponses
      const initialAnswers = {};
      processedQuestions.forEach(q => {
        initialAnswers[q.id] = [];
      });
      setAnswers(initialAnswers);
      
      console.log('✅ Questions loaded successfully:', {
        totalQuestions: processedQuestions.length,
        firstQuestion: processedQuestions[0] ? {
          id: processedQuestions[0].id,
          instruction: processedQuestions[0].instruction,
          choiceCount: processedQuestions[0].choices.length,
          choices: processedQuestions[0].choices.map(c => ({ id: c.id.substring(0, 5), text: c.text, isCorrect: c.isCorrect }))
        } : null
      });
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
  
  // Protection contre les questions invalides
  if (!currentQuestion || !currentQuestion.choices || !Array.isArray(currentQuestion.choices)) {
    console.error('❌ Question invalide:', currentQuestionIndex, currentQuestion);
    return <div className="text-center py-8 text-red-600">Erreur: Question invalide</div>;
  }

  const handleSelectChoice = (choiceId) => {
    if (!currentQuestion) return;

    // Mixed mode: multiple answers allowed (checkboxes)
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

  const playAudio = (textToSpeak) => {
    if ('speechSynthesis' in window && textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'fr-FR';
        utterance.rate = 1;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        
        // Chercher une voix féminine française
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.lang.startsWith('fr') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => 
          voice.lang.startsWith('fr')
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        
        window.speechSynthesis.cancel(); 
        window.speechSynthesis.speak(utterance);
    } else {
        toast({
            title: "Audio non disponible",
            description: "La lecture audio n'est pas supportée par votre navigateur.",
            variant: "destructive"
        });
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
      <div className="flex flex-col w-full max-w-4xl mx-auto gap-4">
        {/* Barre d'outils */}
        <div className="flex gap-2 bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/taches')}
            title="Retour à la liste des exercices"
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Button>
        </div>

        {/* Résultat global */}
        <Card className="w-full border-2 border-blue-500">
          <CardContent className="pt-8 text-center">
            <div className="mb-6">
              {finalScore.percentage >= 80 ? (
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              ) : (
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-4 text-blue-900">Résultat: {finalScore.percentage}%</h2>
            <p className="text-lg text-gray-600 mb-2">
              {finalScore.score} / {finalScore.maxScore} réponses correctes
            </p>
            <p className="text-sm text-gray-500">
              {finalScore.percentage >= 80 ? '✓ Excellent travail!' : 'Continuez vos efforts!'}
            </p>
          </CardContent>
        </Card>

        {/* Récapitulatif des questions */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">Détail des réponses</h3>
          
          {questions.map((question, qIdx) => {
            const userAnswers = answers[question.id] || [];
            const correctAnswerIds = question.correctAnswers || [];
            const isQuestionCorrect = userAnswers.length === correctAnswerIds.length && userAnswers.every(id => correctAnswerIds.includes(id));

            return (
              <Card key={question.id} className={`border-2 ${isQuestionCorrect ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
                <CardHeader className={`${isQuestionCorrect ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${isQuestionCorrect ? 'text-green-900' : 'text-orange-900'}`}>
                        Question {qIdx + 1}: {question.instruction}
                      </CardTitle>
                    </div>
                    <div className="ml-4">
                      {isQuestionCorrect ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Correcte
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-sm font-semibold">
                          <XCircle className="w-4 h-4" />
                          Incorrecte
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-3">
                  {/* Image de la question si présente */}
                  {question.imageId && (
                    <div className="mb-4 flex justify-center">
                      <ImageFromSupabase
                        imageId={question.imageId}
                        alt="Question"
                        className="w-full max-w-md h-auto rounded-lg object-contain"
                      />
                    </div>
                  )}

                  {/* Réponses avec indication des bonnes réponses */}
                  {question.choices.map((choice, cIdx) => {
                    const isCorrect = correctAnswerIds.includes(choice.id);
                    const isSelected = userAnswers.includes(choice.id);
                    const iconId = choice.iconId || choice.icon?.id || (typeof choice.icon === 'string' ? choice.icon : null);
                    const imageId = iconId ? null : choice.imageId;

                    return (
                      <div
                        key={choice.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCorrect
                            ? 'border-green-500 bg-green-50'
                            : isSelected && !isCorrect
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Indicateur visuel */}
                          <div className="mt-1 flex-shrink-0">
                            {isCorrect ? (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            ) : isSelected && !isCorrect ? (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white">
                                <XCircle className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100" />
                            )}
                          </div>

                          <div className="flex-1">
                            {/* Affichage: SVG → Icône → Image */}
                            {choice.iconSvg ? (
                              <div className="mb-2 flex justify-center">
                                <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                                  <div dangerouslySetInnerHTML={{ __html: choice.iconSvg }} />
                                </div>
                              </div>
                            ) : iconId ? (
                              <div className="mb-2 flex justify-center">
                                <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                                  {renderIcon(iconId)}
                                </div>
                              </div>
                            ) : imageId ? (
                              <div className="mb-2 flex justify-center">
                                <ImageFromSupabase
                                  imageId={imageId}
                                  alt={choice.text || 'Réponse'}
                                  className="w-24 h-24 rounded object-contain"
                                />
                              </div>
                            ) : null}

                            {/* Texte de la réponse */}
                            {choice.text && (
                              <p className="text-base font-medium">
                                <HighlightGlossaryTerms text={choice.text} />
                              </p>
                            )}

                            {/* Légende */}
                            <div className="mt-2 flex gap-2 text-xs font-semibold">
                              {isCorrect && (
                                <span className="inline-block px-2 py-1 bg-green-200 text-green-900 rounded">
                                  ✓ Bonne réponse
                                </span>
                              )}
                              {isSelected && !isCorrect && (
                                <span className="inline-block px-2 py-1 bg-red-200 text-red-900 rounded">
                                  ✗ Votre réponse (incorrecte)
                                </span>
                              )}
                              {isSelected && isCorrect && (
                                <span className="inline-block px-2 py-1 bg-green-200 text-green-900 rounded">
                                  ✓ Votre réponse (correcte)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bouton retour */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => navigate('/taches')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Retour à la liste des exercices
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const selectedAnswers = answers[currentQuestion.id] || [];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-4">
      {/* Barre d'outils */}
      <div className="flex gap-2 bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md sticky top-0 z-10">
        {/* Bouton Accueil */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/taches')}
          title="Retour à la liste des exercices"
          className="flex items-center gap-2 hover:bg-gray-100"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Accueil</span>
        </Button>

        {/* Bouton Lecture Audio */}
        {currentQuestion?.instruction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => playAudio(currentQuestion.instruction)}
            title="Lire l'instruction audio"
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <Volume2 className="h-4 w-4" />
            <span className="hidden sm:inline">Écouter</span>
          </Button>
        )}

        {/* Bouton Taille de Texte */}
        <div className="relative ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTextZoomMenu(!showTextZoomMenu)}
            title={`Taille du texte (${Math.round(textZoom * 100)}%)`}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Texte</span>
          </Button>

          {/* Menu déroulant zoom texte */}
          {showTextZoomMenu && (
            <div 
              className="absolute bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 min-w-[160px] top-full mt-2 right-0"
            >
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-600 mb-2 px-2">Taille du texte:</p>
                {[1, 1.25, 1.5, 2].map((zoom) => (
                  <button
                    key={zoom}
                    onClick={() => {
                      setTextZoom(zoom);
                      setShowTextZoomMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 transition-colors",
                      textZoom === zoom && "bg-blue-100 font-semibold text-blue-800"
                    )}
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Card */}
      <Card className="w-full max-w-4xl mx-auto border-2 border-blue-500">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-700">
            Question {currentQuestionIndex + 1} / {questions.length}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instruction de la question */}
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-blue-900 mb-2" style={{ fontSize: `${100 * textZoom}%` }}>
              <HighlightGlossaryTerms text={currentQuestion.instruction} />
            </h3>

          {/* Image de la question (if present) */}
          {currentQuestion.imageId && (
            <div className="mb-4 flex justify-center">
              <ImageFromSupabase
                imageId={currentQuestion.imageId}
                alt="Question"
                className="w-full max-w-md h-auto rounded-lg object-contain"
              />
            </div>
          )}
        </div>

        {/* Réponses possibles */}
        <div className="space-y-3">
          {currentQuestion.choices.map((choice, idx) => {
            console.log('🎯 Affichage choice:', { id: choice.id, text: choice.text, imageId: choice.imageId, iconId: choice.iconId });
            const choiceId = choice.id || idx;
            const isSelected = selectedAnswers.includes(choiceId);
            const iconId = choice.iconId || choice.icon?.id || (typeof choice.icon === 'string' ? choice.icon : null) || (isIconReference(choice.imageId) ? choice.imageId : null);
            const imageId = iconId ? null : choice.imageId;

            return (
              <div key={choiceId} className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`} onClick={() => handleSelectChoice(choiceId)}>
                {/* Mixed mode: checkboxes for multiple answers */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectChoice(choiceId);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-5 h-5 mt-1 cursor-pointer accent-blue-600 flex-shrink-0"
                />

                <div className="flex-1">
                  {/* Affichage priorité: SVG stocké → Icône → Image Supabase */}
                  {choice.iconSvg ? (
                    <div className="mb-2 flex justify-center">
                      <div className="w-32 h-32 flex items-center justify-center bg-primary/10 rounded-lg">
                        <div dangerouslySetInnerHTML={{ __html: choice.iconSvg }} />
                      </div>
                    </div>
                  ) : iconId ? (
                    <div className="mb-2 flex justify-center">
                      <div className="w-32 h-32 flex items-center justify-center bg-primary/10 rounded-lg">
                        {renderIcon(iconId)}
                      </div>
                    </div>
                  ) : imageId ? (
                    <div className="mb-2 flex justify-center">
                      <ImageFromSupabase
                        imageId={imageId}
                        alt={choice.text || 'Réponse'}
                        className="w-32 h-32 rounded object-contain"
                      />
                    </div>
                  ) : null}

                  {/* Texte de la réponse */}
                  {choice.text && <p className="text-base" style={{ fontSize: `${100 * textZoom}%` }}><HighlightGlossaryTerms text={choice.text} /></p>}
                </div>
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
    </div>
  );
}

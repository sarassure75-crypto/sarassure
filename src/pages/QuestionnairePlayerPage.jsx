import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, getImageUrl } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ChevronLeft, CheckCircle, XCircle, Home, Volume2, Type, Globe, ListChecks } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import {
  getAvailableLanguages,
  getQuestionnaireQuestionTranslations,
  getQuestionnaireChoiceTranslations
} from '@/data/translation';

// Helper function to render icons from different libraries
const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const getIconComponent = (iconData) => {
  if (!iconData) return ListChecks;
  
  // Si iconData est juste un string 
  if (typeof iconData === 'string') {
    let library, name;
    
    // Format 1: "library:name" (avec deux-points)
    if (iconData.includes(':')) {
      [library, name] = iconData.split(':');
    } else if (iconData.includes('-')) {
      // Format 2: "library-Name" (comme "md-MdAddCircle" ou "fa6-Fa2")
      // Extraire library et name du format "library-Name"
      const parts = iconData.split('-');
      library = parts[0];
      name = parts.slice(1).join('-');
      
      console.log(`[Icon Debug] String format: "${iconData}" → library="${library}", name="${name}"`);
    } else {
      // Fallback: Lucide avec PascalCase
      const pascalIcon = toPascalCase(iconData);
      return LucideIcons[pascalIcon] || ListChecks;
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
    console.log(`[Icon Debug] Resolved library="${library}" to:`, lib ? 'FOUND' : 'NOT FOUND');
    console.log(`[Icon Debug] Looking for name="${name}" in library`);
    if (lib && lib[name]) {
      console.log(`[Icon Debug] ✅ Found icon: ${library}.${name}`);
      return lib[name];
    }
    console.log(`[Icon Debug] ❌ Icon not found: ${library}.${name}`);
    return ListChecks;
  }
  
  // Si iconData est un objet avec library et name
  if (iconData.library && iconData.name) {
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
    const lib = libraries[iconData.library];
    console.log(`[Icon Debug] Object format: library="${iconData.library}", name="${iconData.name}"`);
    console.log(`[Icon Debug] Resolved library to:`, lib ? 'FOUND' : 'NOT FOUND');
    return lib && lib[iconData.name] ? lib[iconData.name] : ListChecks;
  }
  
  return ListChecks;
};

const renderIconComponent = (iconData) => {
  const IconComponent = getIconComponent(iconData);
  return <IconComponent className="w-16 h-16 text-blue-600" />;
};

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
  const [textZoom, setTextZoom] = useState(1);
  const [showTextZoomMenu, setShowTextZoomMenu] = useState(false);
  const [currentLanguage, setCurrentLanguageState] = useState('fr'); // Sera mis à jour après la récupération de user
  const [preferredLanguageFromProfile, setPreferredLanguageFromProfile] = useState('fr'); // La vraie langue préférée du profil
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [questionTranslations, setQuestionTranslations] = useState({});
  const [choiceTranslations, setChoiceTranslations] = useState({});

  // ============ LANGUAGE MANAGEMENT (APRÈS currentUser) ============
  // Wrapper pour sauvegarder la langue (dans le profil ET localStorage)
  const setCurrentLanguage = useCallback(async (lang) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem('preferredLanguage', lang);
      // Sauvegarder dans le profil utilisateur SEULEMENT si ce n'est pas le français (FR est la langue par défaut)
      if (currentUser?.id && lang !== 'fr') {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_translation_language: lang })
          .eq('id', currentUser.id);
        
        if (error) {
          console.error('Error saving language to profile:', error);
        }
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [currentUser?.id]);

  // Charger la langue préférée du profil au démarrage
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (currentUser?.id) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('preferred_translation_language')
            .eq('id', currentUser.id)
            .single();
          
          if (data?.preferred_translation_language) {
            // Sauvegarder la vraie langue préférée du profil
            const prefLang = data.preferred_translation_language;
            setPreferredLanguageFromProfile(prefLang);
            localStorage.setItem('preferredLanguage', prefLang);
            
            // Si la langue préférée n'est pas FR, la charger comme langue actuelle
            if (prefLang !== 'fr') {
              setCurrentLanguageState(prefLang);
            }
          }
        } catch (error) {
          console.error('Error loading user language preference:', error);
        }
      }
    };

    loadUserLanguage();
  }, [currentUser?.id]);

  useEffect(() => {
    fetchQuestionnaireData();
    fetchLanguages();
  }, [taskId]);

  // Charger les langues disponibles
  const fetchLanguages = async () => {
    try {
      const langs = await getAvailableLanguages();
      setAvailableLanguages(langs);
    } catch (error) {
      logger.error('Error fetching languages:', error);
    }
  };

  // Fermer les menus avec Échap et clic extérieur
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setShowTextZoomMenu(false);
      }
    };

    const handleClickOutside = () => {
      setShowTextZoomMenu(false);
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Charger les traductions quand la langue change
  useEffect(() => {
    if (currentLanguage !== 'fr') {
      loadTranslations(currentLanguage);
    } else {
      setQuestionTranslations({});
      setChoiceTranslations({});
    }
  }, [currentLanguage]);

  const loadTranslations = async (languageCode) => {
    try {
      logger.log(`🌍 Chargement des traductions pour ${languageCode}...`);
      const [qTrans, cTrans] = await Promise.all([
        getQuestionnaireQuestionTranslations(languageCode),
        getQuestionnaireChoiceTranslations(languageCode)
      ]);

      logger.log(`📚 Questions translations trouvées: ${qTrans.length}`, qTrans);
      logger.log(`📚 Choices translations trouvées: ${cTrans.length}`, cTrans);

      // Créer des maps pour accès rapide
      const qTransMap = {};
      qTrans.forEach(t => {
        qTransMap[t.question_id] = t.translated_instruction;
      });
      setQuestionTranslations(qTransMap);
      logger.log('📍 Question translations map:', qTransMap);

      const cTransMap = {};
      cTrans.forEach(t => {
        cTransMap[t.choice_id] = t.translated_choice_text;
      });
      setChoiceTranslations(cTransMap);
      logger.log('📍 Choice translations map:', cTransMap);
    } catch (error) {
      logger.error('Error loading translations:', error);
    }
  };

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

      // NOUVEAU SYSTÈME: Essayer de charger depuis versions/steps (système actuel)
      const { data: versionsData, error: versionsError } = await supabase
        .from('versions')
        .select('id, steps(*)')
        .eq('task_id', taskId)
        .order('created_at');

      if (versionsError) {
        console.error('Erreur chargement versions:', versionsError);
      }

      console.log('📋 Versions chargées:', versionsData);

      if (versionsData && versionsData.length > 0) {
        const firstVersion = versionsData[0];
        if (firstVersion.steps && firstVersion.steps.length > 0) {
          const formattedQuestions = firstVersion.steps.map(step => {
            let expectedInput = step.expected_input || {};
            
            // Parse le JSON si c'est une string
            if (typeof expectedInput === 'string') {
              try {
                expectedInput = JSON.parse(expectedInput);
              } catch (error) {
                console.error('❌ Erreur parsing JSON pour step', step.id, ':', error);
                expectedInput = {};
              }
            }

            const formattedChoices = (expectedInput.choices || []).map(c => {
              // Vérifier si imageId est une icône (ancien système) ou une vraie image
              const isIconId = c.imageId && (
                c.imageId.startsWith('fa6-') || 
                c.imageId.startsWith('fa-') || 
                c.imageId.startsWith('bs-') || 
                c.imageId.startsWith('md-') || 
                c.imageId.startsWith('fi-') || 
                c.imageId.startsWith('hi2-') || 
                c.imageId.startsWith('ai-') || 
                c.imageId.startsWith('lucide-') ||
                c.imageId.includes(':')
              );

              console.log(`[Choice] text="${c.text}", imageId="${c.imageId}", isIconId=${isIconId}, c.icon=`, c.icon);

              return {
                id: c.id,
                text: c.text || '',
                // Si c'est une icône (ancien système), la mettre dans icon
                icon: c.icon || (isIconId ? c.imageId : null),
                // Vraies images Supabase seulement
                image: (!isIconId && c.imageId) ? { id: c.imageId, name: c.imageName } : null,
                isCorrect: c.isCorrect || false
              };
            });

            return {
              id: step.id,
              instruction: step.instruction,
              type: expectedInput.questionType || 'mixed',
              image: expectedInput.imageId ? { id: expectedInput.imageId, name: expectedInput.imageName } : null,
              choices: formattedChoices,
              correctAnswers: expectedInput.correctAnswers || []
            };
          });

          console.log('✅ Questions formatted (NEW SYSTEM):', formattedQuestions);
          setQuestions(formattedQuestions);
          return;
        }
      }

      // FALLBACK: Ancienne table questionnaire_questions (système legacy)
      console.log('⚠️ Pas de versions/steps trouvées, essai système legacy...');
      
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
      
      logger.log('🔍 Raw questionsData from DB (LEGACY):', questionsData);

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        setError('Aucune question trouvée pour ce questionnaire');
        return;
      }

      // Formater les questions avec les réponses
      const formattedQuestions = questionsData.map(q => {
        const formattedChoices = (q.questionnaire_choices || []).sort((a, b) => a.choice_order - b.choice_order).map(c => ({
          id: c.id,
          text: c.text,
          image: c.app_images ? {
            id: c.app_images.id,
            name: c.app_images.name,
            filePath: c.app_images.file_path
          } : null,
          isCorrect: c.is_correct
        }));
        
        logger.log(`📝 Question "${q.instruction}" - Choices:`, formattedChoices.map(c => ({ id: c.id, text: c.text })));
        
        return {
          id: q.id,
          instruction: q.instruction,
          type: q.question_type,
          image: q.app_images ? {
            id: q.app_images.id,
            name: q.app_images.name,
            filePath: q.app_images.file_path
          } : null,
          choices: formattedChoices
        };
      });
      
      logger.log('✅ Formatted questions (LEGACY):', formattedQuestions);

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

  const playAudio = (textToSpeak) => {
    if ('speechSynthesis' in window && textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1.2;
      utterance.volume = 1;
      
      // Chercher une voix féminine de la langue appropriée
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = currentLanguage === 'fr' ? 'fr' : 'en';
      const femaleVoice = voices.find(voice => 
        voice.lang.startsWith(langPrefix) && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => 
        voice.lang.startsWith(langPrefix)
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

  // Obtenir le texte traduit ou original
  const getQuestionText = (question) => {
    if (currentLanguage !== 'fr' && questionTranslations[question.id]) {
      return questionTranslations[question.id];
    }
    return question.instruction;
  };

  const getChoiceText = (choice) => {
    const translated = choiceTranslations[choice.id];
    const result = currentLanguage !== 'fr' && translated ? translated : choice.text;
    if (!result) {
      logger.warn(`⚠️ Choice ${choice.id} has no text! translated=${translated}, choice.text=${choice.text}, currentLanguage=${currentLanguage}`);
    }
    return result;
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
        logger.error('Pas de utilisateur connecté');
        return;
      }

      logger.log('=== DEBUG: Sauvegarde tentative QCM ===');
      logger.log('Task ID:', taskId);
      logger.log('Learner ID:', currentUser.id);

      const correctAnswersCount = questions.reduce((count, question) => {
        const selectedChoiceId = userAnswers[question.id];
        if (selectedChoiceId) {
          const selectedChoice = question.choices.find(c => c.id === selectedChoiceId);
          return selectedChoice?.isCorrect ? count + 1 : count;
        }
        return count;
      }, 0);

      const percentage = Math.round((correctAnswersCount / questions.length) * 100);
      logger.log('Percentage calculé:', percentage);

      // Vérifier si l'utilisateur a déjà des tentatives
      const { data: existingAttempts, error: selectError } = await supabase
        .from('questionnaire_attempts')
        .select('*')
        .eq('questionnaire_id', taskId)
        .eq('learner_id', currentUser.id);

      if (selectError) {
        logger.error('Erreur lors de la recherche de tentatives:', selectError);
        throw selectError;
      }

      logger.log('Tentatives existantes:', existingAttempts);

      if (existingAttempts && existingAttempts.length > 0) {
        // Mettre à jour la tentative existante
        const existingAttempt = existingAttempts[0];
        logger.log('Mise à jour tentative existante:', existingAttempt.id);
        
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
          logger.error('Erreur mise à jour:', error);
          throw error;
        }
        logger.log('Tentative mise à jour avec succès');
      } else {
        // Créer une nouvelle tentative
        logger.log('Création nouvelle tentative');
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
          logger.error('Erreur insertion:', error);
          throw error;
        }
        logger.log('Tentative créée:', insertData);
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
        {/* Barre d'outils */}
        <div className="flex gap-2 bg-white border-2 border-gray-300 rounded-lg p-3 shadow-md mb-6">
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
              onClick={() => playAudio(getQuestionText(currentQuestion))}
              title="Lire l'instruction audio"
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Écouter</span>
            </Button>
          )}

          {/* Sélecteur de langue - Switch simple FR/Langue préférée */}
          {preferredLanguageFromProfile !== 'fr' && (
            <Button
              variant={currentLanguage === 'fr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentLanguage(currentLanguage === 'fr' ? preferredLanguageFromProfile : 'fr')}
              title={`Basculer entre Français et ${preferredLanguageFromProfile.toUpperCase()}`}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{currentLanguage.toUpperCase()}</span>
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
                onMouseLeave={() => setShowTextZoomMenu(false)}
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

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-24"></div>
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
                  <CardTitle className="text-blue-700" style={{ fontSize: `${100 * textZoom}%` }}>
                    {getQuestionText(currentQuestion)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Question Image - Conteneur dédié */}
                  {currentQuestion.image?.filePath && (() => {
                    const imageUrl = getImageUrl(currentQuestion.image.filePath);
                    console.log('🖼️ Question image URL:', { filePath: currentQuestion.image.filePath, url: imageUrl });
                    return imageUrl && (
                      <div className="w-full bg-gradient-to-br from-blue-50 to-gray-50 border-2 border-blue-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Image de la question</p>
                        <div className="flex justify-center items-center min-h-40 bg-white rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={currentQuestion.image.name}
                            className="max-w-full max-h-56 object-contain"
                            onError={(e) => {
                              console.warn(`Failed to load image: ${currentQuestion.image.filePath}`);
                              e.target.parentElement.innerHTML = '<div class="text-gray-400 text-sm">Image non disponible</div>';
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Choices - Conteneur */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Sélectionnez votre réponse</p>
                    <div className="space-y-3">
                      {currentQuestion.choices && currentQuestion.choices.length > 0 ? (
                        currentQuestion.choices.map(choice => {
                          const choiceText = getChoiceText(choice);
                          logger.log(`🎯 Rendering choice ${choice.id}: text="${choiceText}", icon=${choice.icon?.id}, image=${choice.image?.id}`);
                          return (
                        <motion.button
                          key={choice.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectAnswer(currentQuestion.id, choice.id)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedAnswerId === choice.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
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
                              <span className="font-medium text-gray-800" style={{ fontSize: `${100 * textZoom}%` }}>
                                {choiceText}
                              </span>
                            </div>
                          </div>
                          
                          {/* Afficher l'icône si présente */}
                          {choice.icon && (() => {
                            return (
                              <div className="mt-2 ml-8 bg-white border border-gray-200 rounded-lg p-3 flex justify-center items-center h-24">
                                {renderIconComponent(choice.icon)}
                              </div>
                            );
                          })()}
                          
                          {/* Afficher l'image si présente */}
                          {choice.image?.filePath && (() => {
                            const imageUrl = getImageUrl(choice.image.filePath);
                            return imageUrl && (
                              <div className="mt-2 ml-8 bg-white border border-gray-200 rounded-lg p-2 overflow-hidden">
                                <img
                                  src={imageUrl}
                                  alt={choice.image.name}
                                  className="max-w-full h-auto max-h-32 object-contain mx-auto"
                                  onError={(e) => {
                                    console.warn(`Failed to load choice image: ${choice.image.filePath}`);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            );
                          })()}
                        </motion.button>
                          );
                        })
                      ) : (
                        <p className="text-gray-500">Aucune réponse disponible</p>
                      )}
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  MousePointerClick,
  Keyboard,
  CheckCircle,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const tutorialSteps = [
  {
    id: 1,
    icon: <Smartphone className="w-12 h-12 text-primary" />,
    title: 'Bienvenue sur SARASSURE',
    description: 'Une plateforme interactive pour apprendre à utiliser votre smartphone pas à pas.',
    details: [
      "Exercices pratiques avec captures d'écran réelles",
      'Instructions claires et audio disponible',
      'Adaptée à tous les niveaux',
    ],
  },
  {
    id: 2,
    icon: <MousePointerClick className="w-12 h-12 text-primary" />,
    title: "Suivez les zones d'action",
    description: "Chaque exercice vous montre exactement où toucher l'écran.",
    details: [
      'Zones vertes = action à effectuer',
      'Animations pour guider vos gestes',
      'Indices si vous êtes bloqué',
    ],
    demoImage: 'action-zone', // Placeholder pour une image démo
  },
  {
    id: 3,
    icon: <Keyboard className="w-12 h-12 text-primary" />,
    title: 'Saisie de texte facilitée',
    description: 'Clavier intégré pour les exercices de saisie.',
    details: [
      "Clavier numérique ou texte selon l'exercice",
      'Validation automatique des saisies',
      'Pas de distraction avec le clavier du téléphone',
    ],
  },
  {
    id: 4,
    icon: <Play className="w-12 h-12 text-primary" />,
    title: "Modes d'apprentissage variés",
    description: "Plusieurs formats pour s'adapter à votre rythme.",
    details: [
      'Mode guidé : instructions détaillées à chaque étape',
      'Mode autonome : testez vos connaissances',
      'QCM : validez votre compréhension',
    ],
  },
  {
    id: 5,
    icon: <CheckCircle className="w-12 h-12 text-green-600" />,
    title: 'Suivez votre progression',
    description: "Visualisez vos réussites et points d'amélioration.",
    details: [
      'Historique de vos exercices complétés',
      'Évaluation de confiance avant/après',
      "Notes personnelles et captures d'écran",
    ],
  },
];

const TutorialStep = ({ step, isActive }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
    transition={{ duration: 0.3 }}
    className={`${isActive ? '' : 'pointer-events-none'}`}
  >
    <Card
      className={`h-full ${isActive ? 'border-2 border-primary shadow-xl' : 'border-gray-200'}`}
    >
      <CardContent className="p-6 md:p-8 text-center">
        {/* Icône */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: isActive ? 1 : 0.8 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 p-6 rounded-2xl w-fit"
        >
          {step.icon}
        </motion.div>

        {/* Titre */}
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
          {step.description}
        </p>

        {/* Détails */}
        <div className="space-y-3 text-left max-w-md mx-auto">
          {step.details.map((detail, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isActive ? 1 : 0, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                {detail}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Demo Image Placeholder */}
        {step.demoImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isActive ? 1 : 0, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300"
          >
            <div className="text-gray-500 text-sm">[Capture d'écran démo : {step.demoImage}]</div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const AppTutorial = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const goToNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Guide de démarrage
              </h2>
              <p className="text-sm text-muted-foreground">
                Étape {currentStep + 1} sur {tutorialSteps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TutorialStep step={tutorialSteps[currentStep]} isActive={true} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer - Navigation */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={goToPrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            {/* Step Indicators */}
            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-primary w-8'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  aria-label={`Aller à l'étape ${index + 1}`}
                />
              ))}
            </div>

            <Button onClick={goToNext} className="gap-2">
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Terminer
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppTutorial;

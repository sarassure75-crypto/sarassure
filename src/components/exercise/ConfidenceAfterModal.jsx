import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Award, TrendingUp } from 'lucide-react';

/**
 * ConfidenceAfterModal - Modal pour demander le niveau de confiance APRÈS l'exercice
 * 
 * Affiche 3 smileys et compare avec avant
 * Affiche message motivant basé sur progression
 */
export default function ConfidenceAfterModal({ isOpen, onClose, onSubmit, taskTitle, confidenceBefore }) {
  const [selectedConfidence, setSelectedConfidence] = useState(null);

  const confidenceLevels = [
    { value: 1, emoji: '😟', label: 'Pas confiant', description: 'C\'est difficile' },
    { value: 2, emoji: '🙂', label: 'Un peu confiant', description: 'C\'est mieux' },
    { value: 3, emoji: '😄', label: 'Confiant', description: 'Je maîtrise!' }
  ];

  const getProgressMessage = () => {
    if (!confidenceBefore || selectedConfidence === null) return null;

    if (selectedConfidence > confidenceBefore) {
      const diff = selectedConfidence - confidenceBefore;
      if (diff === 2) {
        return {
          title: '🌟 Wow! Progression énorme!',
          message: 'Tu as gagné énormément en confiance. Bravo, tu as progressé!',
          color: 'text-green-600'
        };
      } else if (diff === 1) {
        return {
          title: '✨ Super! Tu as progressé!',
          message: 'Tu es devenu(e) plus confiant(e). Continue comme ça!',
          color: 'text-green-600'
        };
      }
    } else if (selectedConfidence === confidenceBefore) {
      return {
        title: '👍 Bien!',
        message: 'Tu as gardé ton niveau de confiance. Tu maîtrises cet exercice!',
        color: 'text-blue-600'
      };
    } else {
      return {
        title: '💪 C\'est normal!',
        message: 'L\'apprentissage, c\'est progressif. Tu vas progresser rapidement!',
        color: 'text-amber-600'
      };
    }
  };

  const progressMessage = getProgressMessage();

  const handleSubmit = () => {
    if (selectedConfidence !== null) {
      onSubmit(selectedConfidence);
      setSelectedConfidence(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Après l'exercice</DialogTitle>
          <DialogDescription className="text-center mt-2">
            <p className="font-semibold text-foreground">{taskTitle}</p>
            <p className="mt-2 text-sm">Maintenant, combien tu te sens confiant(e)?</p>
          </DialogDescription>
        </DialogHeader>

        {/* Grille des smileys */}
        <div className="grid grid-cols-3 gap-3 my-6">
          {confidenceLevels.map((level) => (
            <motion.button
              key={level.value}
              onClick={() => setSelectedConfidence(level.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${selectedConfidence === level.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }
              `}
            >
              <span className="text-4xl mb-2">{level.emoji}</span>
              <span className="text-xs font-semibold text-center text-gray-900">{level.label}</span>
              <span className="text-xs text-gray-600 text-center mt-1">{level.description}</span>
            </motion.button>
          ))}
        </div>

        {/* Message de progression */}
        {progressMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg bg-gray-50 border-l-4 ${
              progressMessage.color === 'text-green-600' ? 'border-green-400' :
              progressMessage.color === 'text-blue-600' ? 'border-blue-400' :
              'border-amber-400'
            }`}
          >
            <p className={`font-bold mb-1 ${progressMessage.color}`}>
              {progressMessage.title}
            </p>
            <p className="text-sm text-gray-700">{progressMessage.message}</p>
          </motion.div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={selectedConfidence === null}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Continuer
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="text-xs text-center text-gray-600 mt-4">
          <p className="flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" /> Tu progresses! C'est comme ça qu'on devient compétent!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

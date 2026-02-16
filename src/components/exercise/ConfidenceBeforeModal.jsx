import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

/**
 * ConfidenceBeforeModal - Modal pour demander le niveau de confiance AVANT l'exercice
 *
 * Affiche 3 smileys:
 * 😟 (1) = Pas confiant
 * 🙂 (2) = Un peu confiant
 * 😄 (3) = Confiant
 */
export default function ConfidenceBeforeModal({ isOpen, onClose, onSubmit, taskTitle }) {
  const [selectedConfidence, setSelectedConfidence] = useState(null);

  const confidenceLevels = [
    { value: 1, emoji: '😟', label: 'Pas confiant', description: "J'ai peur de me tromper" },
    { value: 2, emoji: '🙂', label: 'Un peu confiant', description: 'Je vais essayer' },
    { value: 3, emoji: '😄', label: 'Confiant', description: 'Je peux le faire' },
  ];

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
          <DialogTitle className="text-center text-lg">Avant de commencer</DialogTitle>
          <DialogDescription className="text-center mt-2">
            <p className="font-semibold text-foreground">{taskTitle}</p>
            <p className="mt-2 text-sm">Combien tu te sens confiant(e) pour cet exercice?</p>
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
                ${
                  selectedConfidence === level.value
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-300'
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

        {/* Bouton d'action */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={selectedConfidence === null}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Commencer l'exercice
          </Button>
        </div>

        {/* Message motivant */}
        <p className="text-xs text-center text-gray-600 mt-4">
          N'oublie pas: cet exercice est une simulation. Tu peux te tromper autant que tu veux -
          c'est comme ça qu'on apprend ! 💪
        </p>
      </DialogContent>
    </Dialog>
  );
}

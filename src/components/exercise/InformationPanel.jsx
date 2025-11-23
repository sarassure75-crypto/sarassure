import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InformationPanel = ({
  isVisible,
  onClose,
  actionType,
  startArea,
}) => {
  if (!isVisible || !actionType) return null;

  const getActionLabel = () => {
    const labels = {
      'tap': 'Appuyer',
      'long_press': 'Appui long',
      'swipe_left': 'Glisser vers la gauche',
      'swipe_right': 'Glisser vers la droite',
      'swipe_up': 'Glisser vers le haut',
      'swipe_down': 'Glisser vers le bas',
      'drag_and_drop': 'Glisser et déposer',
      'text_input': 'Saisir du texte',
      'number_input': 'Saisir un numéro',
    };
    return labels[actionType] || actionType.replace(/_/g, ' ');
  };

  return (
    <AnimatePresence>
      <motion.div
        className="w-full bg-blue-50 border border-blue-200 rounded-md p-2 mt-1"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-semibold">
                Action: {getActionLabel()}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InformationPanel;

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';

/**
 * Overlay de félicitations "Bravo" qui apparaît en semi-transparent
 * sans masquer complètement la capture d'écran
 */
const BravoOverlay = ({ isOpen, onClose, onReturnToTasks }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          'linear-gradient(135deg, rgba(240, 253, 244, 0.85) 0%, rgba(209, 250, 229, 0.85) 100%)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center px-6 py-8 max-w-sm"
      >
        {/* Icône de fête */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
          transition={{
            scale: { delay: 0.2, type: 'spring', stiffness: 200 },
            rotate: { delay: 0.3, duration: 0.5 },
          }}
          className="mb-6 flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <PartyPopper className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Titre Bravo */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-gray-800 mb-4"
          style={{ fontFamily: 'system-ui, -apple-system' }}
        >
          Bravo !
        </motion.h2>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 mb-8"
        >
          Vous avez terminé cet exercice avec succès.
        </motion.p>

        {/* Bouton retour */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onReturnToTasks}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 text-lg shadow-lg"
          >
            Retour à la liste des tâches
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BravoOverlay;

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * ConfidenceSelector - Composant pour sélectionner un niveau de confiance avec smileys
 * Affichable en mode "affichage" ou "édition"
 */
export default function ConfidenceSelector({ value, onChange, editable = false, size = 'md' }) {
  const confidenceLevels = [
    { value: 1, emoji: '😟', label: 'Pas confiant' },
    { value: 2, emoji: '🙂', label: 'Un peu' },
    { value: 3, emoji: '😄', label: 'Confiant' },
  ];

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  if (!editable && value) {
    // Mode affichage seul
    const level = confidenceLevels.find((l) => l.value === value);
    return (
      <div className="flex items-center gap-2">
        <span className={sizeClasses[size]}>{level?.emoji}</span>
        <span className="text-xs text-gray-600">{level?.label}</span>
      </div>
    );
  }

  if (!editable) {
    // Pas de valeur et pas éditable
    return <span className="text-gray-400 text-sm">-</span>;
  }

  // Mode éditable
  return (
    <div className="flex gap-2 justify-center">
      {confidenceLevels.map((level) => (
        <motion.button
          key={level.value}
          onClick={() => onChange(level.value)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'p-2 rounded-lg border-2 transition-all',
            value === level.value
              ? 'border-green-500 bg-green-50 ring-2 ring-green-300'
              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
          )}
          title={level.label}
        >
          <span className={sizeClasses[size]}>{level.emoji}</span>
        </motion.button>
      ))}
    </div>
  );
}

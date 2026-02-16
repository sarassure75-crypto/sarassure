import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const InputAnimator = ({
  actionType,
  targetArea,
  onInputChange,
  inputValue,
  imageWidth = 360,
  imageHeight = 640,
  isMobileLayout = false,
}) => {
  // Check condition FIRST - BEFORE hooks
  if (!targetArea || !['number_input', 'text_input'].includes(actionType)) {
    return null;
  }

  // THEN hooks - only called if condition passed
  const [isInputActive, setIsInputActive] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);

  // Clavier numérique
  const numberPadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  const handleKeyPress = (key) => {
    let newValue = inputValue + key;
    // Limiter la longueur pour le clavier numérique
    if (isNumberInput && newValue.length > 15) {
      newValue = newValue.slice(0, 15);
    }
    onInputChange?.(newValue);
  };

  const handleBackspace = () => {
    onInputChange?.(inputValue.slice(0, -1));
  };

  const handleClear = () => {
    onInputChange?.('');
  };

  // Animer la zone cible quand on clique dessus
  const containerVariants = {
    inactive: { scale: 1 },
    active: {
      scale: 1.1,
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    },
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Zone cible animée */}
      <motion.div
        className="absolute border-2 border-green-500 bg-green-500/10 rounded-md cursor-pointer pointer-events-auto flex items-center justify-center"
        style={{
          left: `${targetArea.x_percent ?? 0}%`,
          top: `${targetArea.y_percent ?? 0}%`,
          width: `${targetArea.width_percent ?? 0}%`,
          height: `${targetArea.height_percent ?? 0}%`,
        }}
        variants={containerVariants}
        initial="inactive"
        animate={isInputActive ? 'active' : 'inactive'}
        onClick={() => {
          setIsInputActive(true);
          setShowKeyboard(true);
          inputRef.current?.focus();
        }}
      >
        <motion.div
          animate={isInputActive ? { opacity: [0.5, 0.8, 0.5] } : { opacity: 0.5 }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="flex items-center gap-2 text-green-600 font-semibold"
        >
          <Keyboard className="h-4 w-4" />
          <span className="text-xs">Cliquer ici</span>
        </motion.div>
      </motion.div>

      {/* Affichage de la valeur saisie */}
      {inputValue && (
        <motion.div
          className="absolute text-xs font-semibold text-blue-600 pointer-events-none"
          style={{
            left: `${targetArea.x_percent ?? 0}%`,
            top: `${(targetArea.y_percent ?? 0) + (targetArea.height_percent ?? 0) + 2}%`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          Valeur: {inputValue}
        </motion.div>
      )}

      {/* Clavier numérique ou texte */}
      {showKeyboard && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 p-3 sm:p-4 z-50 pointer-events-auto"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
        >
          <div className="max-w-md mx-auto">
            {/* Affichage de la saisie */}
            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 flex items-center justify-between">
              <span className="text-sm sm:text-base font-mono break-all">
                {inputValue || '___'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBackspace}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
              >
                ⌫
              </Button>
            </div>

            {isNumberInput ? (
              // Clavier numérique
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {numberPadKeys.map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    variant="outline"
                    className="h-10 sm:h-12 text-sm sm:text-base font-semibold hover:bg-blue-100"
                  >
                    {key}
                  </Button>
                ))}
              </div>
            ) : (
              // Clavier texte simplifié (AZERTY)
              <>
                <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-2">
                  {['A', 'Z', 'E', 'R', 'T', 'Y'].map((key) => (
                    <Button
                      key={key}
                      onClick={() => handleKeyPress(key.toLowerCase())}
                      variant="outline"
                      className="h-8 sm:h-10 text-xs sm:text-sm font-semibold hover:bg-blue-100"
                    >
                      {key}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1 sm:gap-2 mb-2">
                  {['U', 'I', 'O', 'P', 'Q', 'S'].map((key) => (
                    <Button
                      key={key}
                      onClick={() => handleKeyPress(key.toLowerCase())}
                      variant="outline"
                      className="h-8 sm:h-10 text-xs sm:text-sm font-semibold hover:bg-blue-100"
                    >
                      {key}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1 sm:gap-2">
                  {['D', 'F', 'G', 'H', 'J', 'K'].map((key) => (
                    <Button
                      key={key}
                      onClick={() => handleKeyPress(key.toLowerCase())}
                      variant="outline"
                      className="h-8 sm:h-10 text-xs sm:text-sm font-semibold hover:bg-blue-100"
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2 mt-3">
              <Button onClick={handleClear} variant="destructive" size="sm" className="flex-1">
                <Trash2 className="h-4 w-4 mr-1" />
                Effacer
              </Button>
              <Button
                onClick={() => setShowKeyboard(false)}
                variant="default"
                size="sm"
                className="flex-1"
              >
                Fermer
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InputAnimator;

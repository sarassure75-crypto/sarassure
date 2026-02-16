import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getButtonConfig, DEFAULT_BUTTON_CONFIG } from '@/data/phoneButtonConfigs';

/**
 * Overlay pour afficher les boutons physiques du téléphone avec zones d'action
 * Support de différentes configurations (Samsung, iPhone, Pixel, etc.)
 */
const PhoneButtonsOverlay = ({
  actions = {},
  hideActionZones = {},
  onButtonClick = () => {},
  phoneWidth = 0,
  phoneHeight = 0,
  isMobileLayout = false,
  buttonConfig = DEFAULT_BUTTON_CONFIG, // 'samsung', 'iphone', 'pixel', etc.
  isComboAction = false, // true si action combinée
  requiredButtons = [], // boutons requis pour action combinée
}) => {
  const [pressedButtons, setPressedButtons] = useState(new Set());

  // Récupérer la configuration des boutons
  const config = getButtonConfig(buttonConfig);
  const buttons = config.buttons;

  const getButtonStyle = (button) => {
    const isRight = button.position.side === 'right';
    const topPercent = button.position.top;
    const height = button.height || '40px';

    return {
      position: 'absolute',
      [isRight ? 'right' : 'left']: '-8px', // Slightly outside the phone frame
      top: topPercent,
      transform: 'translateY(-50%)',
      width: '12px',
      height: height,
      backgroundColor: button.color,
      borderRadius: '4px',
      cursor: 'pointer',
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      color: 'white',
      fontWeight: 'bold',
      transition: 'all 0.2s ease',
    };
  };

  const handleButtonClick = (buttonId) => {
    if (isComboAction) {
      // Mode action combinée
      const newPressed = new Set(pressedButtons);

      if (newPressed.has(buttonId)) {
        newPressed.delete(buttonId);
      } else {
        newPressed.add(buttonId);
      }

      setPressedButtons(newPressed);

      // Vérifier si tous les boutons requis sont pressés
      const allPressed = requiredButtons.every((btn) => newPressed.has(btn));
      if (allPressed && newPressed.size === requiredButtons.length) {
        onButtonClick(buttonId);
        setPressedButtons(new Set()); // Reset après validation
      }
    } else {
      // Mode action simple
      onButtonClick(buttonId);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Indicateur pour action combinée */}
      {isComboAction && requiredButtons.length > 0 && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1 rounded-full z-50 shadow-lg">
          Appuyez sur {requiredButtons.length} boutons simultanément
        </div>
      )}

      {/* Boutons physiques du téléphone */}
      {Object.entries(buttons).map(([key, button]) => {
        const isPressed = pressedButtons.has(button.id);
        const isRequired = requiredButtons.includes(button.id);

        return (
          <motion.div
            key={button.id}
            style={{
              ...getButtonStyle(button),
              backgroundColor: isPressed
                ? '#10b981'
                : isRequired && isComboAction
                ? button.color
                : button.color,
              boxShadow: isPressed ? `0 0 20px ${button.color}` : '0 2px 8px rgba(0,0,0,0.3)',
              border: isRequired && isComboAction ? '2px solid yellow' : 'none',
            }}
            whileHover={{ scale: 1.15, boxShadow: `0 4px 12px ${button.color}60` }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButtonClick(button.id)}
            title={button.description}
            animate={
              isRequired && isComboAction
                ? {
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 1 },
                  }
                : {}
            }
          >
            <div className="text-xs">{button.icon}</div>
          </motion.div>
        );
      })}

      {/* Zones d'action animées pour les boutons */}
      <AnimatePresence>
        {Object.entries(buttons).map(([key, button]) => {
          const isHidden = hideActionZones[button.id];

          if (isHidden) return null; // N'afficher que si visible

          const isRight = button.position.side === 'right';
          const topPercent = button.position.top;

          return (
            <motion.div
              key={`zone-${button.id}`}
              style={{
                position: 'absolute',
                [isRight ? 'right' : 'left']: '-15px',
                top: topPercent,
                transform: 'translateY(-50%)',
                width: '20px',
                height: '50px',
                border: `2px solid ${button.color}`,
                borderRadius: '4px',
                pointerEvents: 'none',
                zIndex: 40,
              }}
              initial={{ opacity: 0.3, scale: 1 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.05, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Étiquette du bouton */}
              <div
                style={{
                  position: 'absolute',
                  [isRight ? 'right' : 'left']: '100%',
                  [isRight ? 'marginRight' : 'marginLeft']: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: button.color,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {button.label}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default PhoneButtonsOverlay;

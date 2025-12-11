import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Overlay pour afficher les boutons physiques du téléphone avec zones d'action
 * Affiche: Power (côté droit), Volume+ (côté gauche haut), Volume- (côté gauche bas)
 */
const PhoneButtonsOverlay = ({ 
  actions = {},
  hideActionZones = {},
  onButtonClick = () => {},
  phoneWidth = 0,
  phoneHeight = 0,
  isMobileLayout = false
}) => {
  // Configuration des boutons
  const buttons = {
    power: {
      id: 'power',
      label: 'Power',
      icon: '⏻',
      position: { side: 'right', top: '35%' },
      color: '#ef4444', // red
      description: 'Bouton d\'allumage'
    },
    volumeUp: {
      id: 'volumeUp',
      label: 'Vol+',
      icon: '🔊',
      position: { side: 'left', top: '25%' },
      color: '#3b82f6', // blue
      description: 'Bouton volume haut'
    },
    volumeDown: {
      id: 'volumeDown',
      label: 'Vol-',
      icon: '🔉',
      position: { side: 'left', top: '40%' },
      color: '#06b6d4', // cyan
      description: 'Bouton volume bas'
    }
  };

  const getButtonStyle = (button) => {
    const isRight = button.position.side === 'right';
    const topPercent = button.position.top;

    return {
      position: 'absolute',
      [isRight ? 'right' : 'left']: '-8px', // Slightly outside the phone frame
      top: topPercent,
      transform: 'translateY(-50%)',
      width: '12px',
      height: '40px',
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
      transition: 'all 0.2s ease'
    };
  };

  const handleButtonClick = (buttonId) => {
    onButtonClick(buttonId);
  };

  return (
    <div className="relative w-full h-full">
      {/* Boutons physiques du téléphone */}
      {Object.entries(buttons).map(([key, button]) => (
        <motion.div
          key={button.id}
          style={getButtonStyle(button)}
          whileHover={{ scale: 1.15, boxShadow: `0 4px 12px ${button.color}60` }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonClick(button.id)}
          title={button.description}
        >
          <div className="text-xs">{button.icon}</div>
        </motion.div>
      ))}

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
                zIndex: 40
              }}
              initial={{ opacity: 0.3, scale: 1 }}
              animate={{ 
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.05, 1]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut'
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
                  pointerEvents: 'none'
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

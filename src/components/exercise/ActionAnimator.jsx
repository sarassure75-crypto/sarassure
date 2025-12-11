import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActionAnimator = ({ 
  actionType, 
  startArea,
  hideActionZone = false,
  isMobileLayout = false 
}) => {
  const [clickedZone, setClickedZone] = useState(null);
  
  // Afficher la zone pour les actions de geste (swipe, tap, double_tap, long_press, drag)
  const shouldUseZones = ['tap', 'double_tap', 'long_press', 'swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'drag_and_drop'].includes(actionType);
  
  if (!shouldUseZones || !startArea) {
    return null;
  }

  // Utiliser la couleur et l'opacité admin, jamais de vert ou valeur par défaut
  const borderColor = startArea.color || '#3b82f6';
  let bgColor = 'rgba(59, 130, 246, 0.15)';
  if (startArea.color) {
    // Si couleur au format rgb(r, g, b), convertir en rgba avec opacité
    const rgbMatch = startArea.color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch;
      bgColor = `rgba(${r}, ${g}, ${b}, ${startArea.opacity !== undefined ? startArea.opacity : 0.15})`;
    } else if (startArea.color.startsWith('#')) {
      // Si couleur hex, convertir en rgba
      const hex = startArea.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      bgColor = `rgba(${r}, ${g}, ${b}, ${startArea.opacity !== undefined ? startArea.opacity : 0.15})`;
    } else if (startArea.color.startsWith('rgba')) {
      // Si déjà rgba, remplacer l'opacité
      bgColor = startArea.color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)/, (m, r, g, b) => `rgba(${r}, ${g}, ${b}, ${startArea.opacity !== undefined ? startArea.opacity : 0.15})`);
    } else {
      bgColor = startArea.color;
    }
  }

  const handleZoneClick = () => {
    if (hideActionZone) {
      setClickedZone({
        x: startArea.x_percent ?? 0,
        y: startArea.y_percent ?? 0,
        width: startArea.width_percent ?? 0,
        height: startArea.height_percent ?? 0,
        color: borderColor,
        bgColor: bgColor,
        timestamp: Date.now()
      });
      
      // Auto-clear après animation
      setTimeout(() => setClickedZone(null), 600);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Animation continue: clignotement et légère pulsation */}
      <motion.div
        key={hideActionZone ? 'hidden' : 'visible'}
        onClick={hideActionZone ? handleZoneClick : undefined}
        style={{
          position: 'absolute',
          left: `${startArea.x_percent ?? 0}%`,
          top: `${startArea.y_percent ?? 0}%`,
          width: `${startArea.width_percent ?? 0}%`,
          height: `${startArea.height_percent ?? 0}%`,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: borderColor,
          backgroundColor: bgColor,
          borderRadius: '8px',
          cursor: hideActionZone ? 'pointer' : 'default',
          pointerEvents: hideActionZone ? 'auto' : 'none',
        }}
        initial={{ opacity: hideActionZone ? 0.05 : 0.3, scale: 1 }}
        animate={{ 
          opacity: hideActionZone ? [0.05, 0.1, 0.05] : [0.3, 0.8, 0.3],
          scale: hideActionZone ? 1 : [1, 1.05, 1]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Effet de capture/mouvement au clic */}
      <AnimatePresence>
        {clickedZone && (
          <>
            {/* Flash initial */}
            <motion.div
              key={`flash-${clickedZone.timestamp}`}
              style={{
                position: 'absolute',
                left: `${clickedZone.x}%`,
                top: `${clickedZone.y}%`,
                width: `${clickedZone.width}%`,
                height: `${clickedZone.height}%`,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: clickedZone.color,
                backgroundColor: clickedZone.bgColor,
                borderRadius: '8px',
                pointerEvents: 'none',
              }}
              initial={{ 
                opacity: 1,
                scale: 1,
                boxShadow: `0 0 20px ${clickedZone.color}40`
              }}
              animate={{ 
                opacity: [1, 0.5],
                scale: [1, 1.15],
                boxShadow: `0 0 30px ${clickedZone.color}80`
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />

            {/* Ondes de pulsion */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`pulse-${clickedZone.timestamp}-${i}`}
                style={{
                  position: 'absolute',
                  left: `${clickedZone.x + clickedZone.width / 2}%`,
                  top: `${clickedZone.y + clickedZone.height / 2}%`,
                  width: `${clickedZone.width}%`,
                  height: `${clickedZone.height}%`,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: clickedZone.color,
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ 
                  opacity: 0.8,
                  scale: 0.8,
                }}
                animate={{ 
                  opacity: 0,
                  scale: 2,
                }}
                transition={{ 
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: 'easeOut'
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionAnimator;

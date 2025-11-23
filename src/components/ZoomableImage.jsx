
import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { Maximize, Minimize } from 'lucide-react';
import ImageFromSupabase from './ImageFromSupabase';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const ZoomableImage = ({ imageId, alt, targetArea, actionType, startArea, onInteraction, imageContainerClassName, isMobileLayout, isZoomActive: initialZoom = false, hideActionZone = false }) => {
  const [isZoomed, setIsZoomed] = useState(initialZoom);
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const containerRef = useRef(null);
  const longPressTimeout = useRef(null);
  
  // Select appropriate zone based on action type
  const actionArea = ['tap', 'double_tap', 'long_press', 'swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'scroll', 'drag_and_drop'].includes(actionType) ? startArea : targetArea;
  
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const textInputRef = useRef(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const interactionState = useRef({ isDown: false, startTime: 0, hasMoved: false, lastTapTime: 0, lastTapX: 0, lastTapY: 0 });
  
  useEffect(() => {
    setIsZoomed(initialZoom);
  }, [initialZoom]);
  
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  if (!imageId) {
    return (
      <div className={cn("w-full h-full bg-muted flex items-center justify-center text-muted-foreground", imageContainerClassName)}>
        <p>Aucune image pour cette étape.</p>
      </div>
    );
  }

  const handleWrongAction = () => {
    const newCount = attemptCount + 1;
    setAttemptCount(newCount);
    
    // Afficher le message d'aide seulement APRES 3 tentatives (pas avant)
    if (newCount >= 3) {
      setShowHint(true);
    }
    onInteraction(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const handlePointerDown = (event) => {
    if (actionType === 'drag_and_drop') return;
    
    interactionState.current = { 
      isDown: true, 
      startTime: Date.now(), 
      hasMoved: false, 
      startX: event.clientX, 
      startY: event.clientY,
      lastTapTime: interactionState.current.lastTapTime,
      lastTapX: interactionState.current.lastTapX,
      lastTapY: interactionState.current.lastTapY
    };
    
    if (actionType === 'long_press') {
      longPressTimeout.current = setTimeout(() => {
        if (interactionState.current.isDown && !interactionState.current.hasMoved) {
          setAttemptCount(0);
          onInteraction(true);
        }
      }, 700);
    }
  };

  const handlePointerMove = (event) => {
    if (actionType === 'drag_and_drop') return;
    
    if (interactionState.current.isDown) {
      const dx = event.clientX - (interactionState.current.startX || event.clientX);
      const dy = event.clientY - (interactionState.current.startY || event.clientY);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      interactionState.current.currentX = event.clientX;
      interactionState.current.currentY = event.clientY;
      
      if (distance > 10) {
        interactionState.current.hasMoved = true;
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
        }
      }
    }
  };

  const isPointerInZone = (event) => {
    if (!actionArea) return false;
    const rect = containerRef.current?.querySelector('[data-action-zone]')?.getBoundingClientRect();
    if (!rect) return true;
    return event.clientX >= rect.left && event.clientX <= rect.right &&
           event.clientY >= rect.top && event.clientY <= rect.bottom;
  };

  const handlePointerUp = (event) => {
    if (actionType === 'drag_and_drop') return;
    
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    interactionState.current.isDown = false;
    
    const dx = (interactionState.current.currentX || event.clientX) - (interactionState.current.startX || event.clientX);
    const dy = (interactionState.current.currentY || event.clientY) - (interactionState.current.startY || event.clientY);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Vérifier si le geste a commencé dans la zone
    const startInZone = isPointerInZone({
      clientX: interactionState.current.startX,
      clientY: interactionState.current.startY
    });
    
    // Si le geste n'a pas commencé dans la zone, rejeter
    if (!startInZone) {
      handleWrongAction();
      return;
    }
    
    // Detect swipe/scroll (>50px movement)
    if (distance > 50) {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      
      if (absX > absY) {
        // Horizontal swipe
        if (actionType === 'swipe_left' && dx < -50) {
          setAttemptCount(0);
          onInteraction(true);
          return;
        } else if (actionType === 'swipe_right' && dx > 50) {
          setAttemptCount(0);
          onInteraction(true);
          return;
        } else if (['swipe_left', 'swipe_right'].includes(actionType)) {
          handleWrongAction();
          return;
        }
      } else {
        // Vertical swipe/scroll
        if (actionType === 'swipe_up' && dy < -50) {
          setAttemptCount(0);
          onInteraction(true);
          return;
        } else if (actionType === 'swipe_down' && dy > 50) {
          setAttemptCount(0);
          onInteraction(true);
          return;
        } else if (actionType === 'scroll' && Math.abs(dy) > 50) {
          setAttemptCount(0);
          onInteraction(true);
          return;
        } else if (['swipe_up', 'swipe_down', 'scroll'].includes(actionType)) {
          handleWrongAction();
          return;
        }
      }
      
      if (['swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'scroll'].includes(actionType)) {
        handleWrongAction();
        return;
      }
    }
    
    // Handle tap/double_tap
    if (distance < 10) {
      const elapsed = Date.now() - interactionState.current.startTime;
      const isQuickTap = elapsed < 700;
      
      if (actionType === 'double_tap') {
        // Double-tap: détecter 2 taps rapides (<300ms) dans la même zone
        const now = Date.now();
        const isSecondTap = now - interactionState.current.lastTapTime < 300 &&
                          Math.abs(event.clientX - interactionState.current.lastTapX) < 50 &&
                          Math.abs(event.clientY - interactionState.current.lastTapY) < 50;
        
        if (isSecondTap) {
          // Double-tap valide!
          setAttemptCount(0);
          onInteraction(true);
          interactionState.current.lastTapTime = 0;
          return;
        } else if (isQuickTap) {
          // Premier tap - mémoriser pour le prochain
          interactionState.current.lastTapTime = now;
          interactionState.current.lastTapX = event.clientX;
          interactionState.current.lastTapY = event.clientY;
          return;
        }
      } else if (isQuickTap && actionType === 'tap') {
        setAttemptCount(0);
        onInteraction(true);
        return;
      } else if (isQuickTap && (actionType === 'text_input' || actionType === 'number_input')) {
        setShowTextInput(true);
        return;
      } else if (isQuickTap && !['long_press', 'drag_and_drop'].includes(actionType)) {
        handleWrongAction();
        return;
      }
    }
    
    if (!['drag_and_drop'].includes(actionType)) {
      handleWrongAction();
    }
  };

  const handleDragEnd = (event, info) => {
    if (actionType === 'drag_and_drop') {
      const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
      if (dragDistance > 30) {
        setAttemptCount(0);
        onInteraction(true);
      } else {
        handleWrongAction();
      }
    }
    setIsDragging(false);
  };

  const handleTextInputChange = (e) => {
    const value = e.target.value;
    setTextInputValue(value);
    
    // Validation automatique si c'est correct
    if (value.trim().length > 0) {
      const expectedValue = actionArea?.expected_input || 
                           actionArea?.expected_text || 
                           actionArea?.expected_value || 
                           actionArea?.value;
      
      const expected = expectedValue?.trim();
      const isCorrect = value.toLowerCase() === expected?.toLowerCase();
      
      if (isCorrect) {
        // Validation réussie - fermer le clavier et confirmer
        setTimeout(() => {
          setAttemptCount(0);
          setShowTextInput(false);
          setTextInputValue('');
          onInteraction(true);
        }, 500);
      }
    }
  };

  const getActionLabel = () => {
    const labels = {
      'tap': 'un simple tap',
      'double_tap': 'un double tap (2 fois rapidement)',
      'long_press': 'un appui long (>700ms)',
      'swipe_left': 'un glissement vers la gauche',
      'swipe_right': 'un glissement vers la droite',
      'swipe_up': 'un glissement vers le haut',
      'swipe_down': 'un glissement vers le bas',
      'scroll': 'un scroll (haut ou bas)',
      'drag_and_drop': 'un maintien et déplacement',
      'text_input': 'une saisie de texte',
      'number_input': 'une saisie de nombre',
    };
    return labels[actionType] || 'l\'action attendue';
  };

  const getAreaStyle = (area) => ({
    position: 'absolute',
    left: `${area.x_percent ?? area.x ?? 0}%`,
    top: `${area.y_percent ?? area.y ?? 0}%`,
    width: `${area.width_percent ?? area.width ?? 0}%`,
    height: `${area.height_percent ?? area.height ?? 0}%`,
    borderRadius: area.shape === 'ellipse' ? '50%' : '8px',
  });

  const getAreaBorderStyle = (area) => {
    // Récupérer les paramètres de bordure depuis les données
    // Utiliser la couleur de la zone pour la bordure
    const borderColor = area.color || 'rgba(59, 130, 246, 0.5)'; // Bleu par défaut
    
    // Si show_border est explicitement false, pas de bordure
    if (area.show_border === false) return {};
    
    return {
      border: `2px dashed ${borderColor}`,
    };
  };

  const getAreaBackgroundStyle = (area) => {
    // Récupérer les paramètres de couleur depuis les données admin
    const bgColor = area.color || 'rgba(59, 130, 246, 0.3)'; // Bleu par défaut
    const bgOpacity = area.opacity !== undefined ? area.opacity : 0.3;
    
    // Convertir rgba/rgb en format avec opacité personnalisée
    if (bgColor.includes('rgba')) {
      // Format: rgba(r, g, b, a) - remplacer l'alpha
      const match = bgColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
      if (match) {
        const [, r, g, b] = match;
        return {
          backgroundColor: `rgba(${r}, ${g}, ${b}, ${bgOpacity})`,
        };
      }
    } else if (bgColor.includes('rgb')) {
      // Format: rgb(r, g, b) - ajouter l'alpha
      const match = bgColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (match) {
        const [, r, g, b] = match;
        return {
          backgroundColor: `rgba(${r}, ${g}, ${b}, ${bgOpacity})`,
        };
      }
    }
    
    // Fallback pour les couleurs hex
    if (bgColor.startsWith('#')) {
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${bgOpacity})`,
      };
    }
    
    return {
      backgroundColor: bgColor,
    };
  };

  const getAnimationColor = (area) => {
    // Récupérer la couleur d'animation depuis les données
    return area.animation_color || 'rgba(59, 130, 246, 0.3)'; // Bleu par défaut
  };

  const getAnimationVariants = () => {
    // Utiliser seulement l'opacité pour les animations (respecter les couleurs admin)
    switch (actionType) {
      case 'tap':
      case 'double_tap':
        // Clignotement de transparence pour tap/double_tap
        return {
          opacity: [0.5, 1, 0.5],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'long_press':
        // Clignotement plus lent pour appui long
        return {
          opacity: [0.4, 0.9, 0.4],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'swipe_left':
        return {
          opacity: [0.5, 1, 0.5],
          x: [10, -20, 10],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'swipe_right':
        return {
          opacity: [0.5, 1, 0.5],
          x: [-10, 20, -10],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'swipe_up':
        return {
          opacity: [0.5, 1, 0.5],
          y: [10, -20, 10],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'swipe_down':
        return {
          opacity: [0.5, 1, 0.5],
          y: [-10, 20, -10],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'scroll':
        return {
          opacity: [0.5, 1, 0.5],
          y: [-10, 20, -10],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'drag_and_drop':
        return {
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.05, 1],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'text_input':
      case 'number_input':
        // Barre clignotante pour l'apparition du clavier
        return {
          opacity: [0.3, 1, 0.3],
          borderWidth: [1, 3, 1],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        };
      default:
        return {
          opacity: [0.5, 1, 0.5],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        };
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full h-full overflow-hidden bg-black select-none", imageContainerClassName)} 
      onContextMenu={handleContextMenu}
      onPointerDown={actionType !== 'drag_and_drop' ? handlePointerDown : undefined}
      onPointerMove={actionType !== 'drag_and_drop' ? handlePointerMove : undefined}
      onPointerUp={actionType !== 'drag_and_drop' ? handlePointerUp : undefined}
    >
      <motion.div
        className="absolute inset-0 w-full h-full cursor-grab"
        drag={isZoomed && isDragging}
        dragControls={dragControls}
        dragConstraints={containerRef}
        dragElastic={0.1}
        onPointerDown={(e) => isZoomed && dragControls.start(e)}
        whileTap={{ cursor: 'grabbing' }}
      >
        <motion.div
          className="w-full h-full"
          animate={{
            scale: isZoomed ? 2 : 1,
            transition: { type: 'spring', stiffness: 300, damping: 30 },
          }}
        >
          <ImageFromSupabase imageId={imageId} alt={alt} className="w-full h-full object-contain" />
        </motion.div>
      </motion.div>
      
      {actionArea && !hideActionZone && (
        <motion.div
          data-action-zone
          style={{ 
            ...getAreaStyle(actionArea), 
            ...getAreaBorderStyle(actionArea),
            ...getAreaBackgroundStyle(actionArea),
            touchAction: 'none', 
            WebkitUserSelect: 'none', 
            WebkitTouchCallout: 'none' 
          }}
          className={cn(
            "z-10",
            actionType === 'drag_and_drop' && "cursor-grab",
            actionType !== 'drag_and_drop' && "cursor-pointer"
          )}
          animate={getAnimationVariants()}
          whileHover={{ scale: 1.02 }}
          onContextMenu={handleContextMenu}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          drag={actionType === 'drag_and_drop'}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
        />
      )}

      {showTextInput && actionArea && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={getAreaStyle(actionArea)}
          className="z-20 flex items-center justify-center p-4 bg-white rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex flex-col items-center gap-2">
            {/* Barre en contraste - noire au début */}
            <div className="w-full h-3 bg-black rounded-t-lg"></div>
            
            <Input
              ref={textInputRef}
              type={actionType === 'number_input' ? 'number' : 'text'}
              inputMode={actionType === 'number_input' ? 'numeric' : 'text'}
              value={textInputValue}
              onChange={handleTextInputChange}
              className="w-full text-center text-lg p-3 rounded border-0 focus:outline-none"
              placeholder={actionType === 'number_input' ? 'Entrez un nombre...' : 'Entrez le texte...'}
              autoComplete="off"
              autoFocus
            />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-30 pointer-events-none"
          >
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 text-center shadow-lg pointer-events-auto cursor-pointer" onClick={() => setShowHint(false)}>
              <p className="text-red-900 font-bold mb-1 text-sm">
                Ce n'est pas le bon geste!
              </p>
              <p className="text-red-800 text-xs mb-1">
                Vous devez effectuer: <strong>{getActionLabel()}</strong>
              </p>
              <p className="text-red-700 text-xs">
                Essayez à nouveau...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsZoomed(!isZoomed)}
        className="absolute bottom-2 right-2 z-20 p-2 bg-background/50 backdrop-blur-sm rounded-full text-foreground hover:bg-background/80"
        title={isZoomed ? "Dézoomer" : "Zoomer"}
      >
        {isZoomed ? <Minimize size={isMobileLayout ? 16 : 20} /> : <Maximize size={isMobileLayout ? 16 : 20} />}
      </button>
    </div>
  );
};

export default ZoomableImage;

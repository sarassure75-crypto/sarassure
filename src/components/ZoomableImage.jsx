
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import ImageFromSupabase from './ImageFromSupabase';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';

// Helper to get icon component from icon string
const getIconComponent = (iconString) => {
  if (!iconString) return null;
  
  // Support pour les icônes Iconify colorées (logos, skill-icons, devicon)
  if (iconString.includes(':') && (
    iconString.startsWith('logos:') || 
    iconString.startsWith('skill-icons:') || 
    iconString.startsWith('devicon:')
  )) {
    return (props) => <IconifyIcon icon={iconString} {...props} />;
  }
  
  const [library, name] = iconString.split(':');
  
  // Import icon libraries
  const libraries = {
    lucide: LucideIcons,
    fa6: FontAwesome6,
    bs: BootstrapIcons,
    md: MaterialIcons,
    fi: FeatherIcons,
    hi2: HeroiconsIcons,
    ai: AntIcons,
  };
  
  const lib = libraries[library];
  return lib ? lib[name] : null;
};

const ZoomableImage = ({ imageId, alt, targetArea, actionType, startArea, onInteraction, imageContainerClassName, isMobileLayout, isZoomActive: initialZoom = false, hideActionZone = false, keyboardAutoShow = false, expectedInput = '' }) => {
  const [isZoomed, setIsZoomed] = useState(initialZoom);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const longPressTimeout = useRef(null);
  
  // Loupe qui suit le curseur
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [mainImageRect, setMainImageRect] = useState(null);
  const [mainImageSrc, setMainImageSrc] = useState(null);
  
  // Select appropriate zone based on action type
  const actionArea = ['tap', 'double_tap', 'long_press', 'swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'scroll', 'drag_and_drop', 'bravo'].includes(actionType) ? startArea : targetArea;
  
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const textInputRef = useRef(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const interactionState = useRef({ isDown: false, startTime: 0, hasMoved: false, lastTapTime: 0, lastTapX: 0, lastTapY: 0 });
  
  useEffect(() => {
    setIsZoomed(initialZoom);
  }, [initialZoom]);
  
  // Gestionnaire du mouvement de la loupe - simple et direct
  const handleMouseMove = (e) => {
    if (!isZoomed || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Vérifier que le pointeur est dans les limites du container
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMagnifierPos({ x, y });
      setShowMagnifier(true);
    }
  };
  
  const handleTouchMove = (e) => {
    if (!isZoomed || !containerRef.current || e.touches.length === 0) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    // Vérifier que le pointeur est dans les limites du container
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMagnifierPos({ x, y });
      setShowMagnifier(true);
    }
  };
  
  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };
  
  const handleTouchEnd = () => {
    setShowMagnifier(false);
  };
  
  // Affichage automatique du clavier pour number_input ou text_input avec keyboard_auto_show
  useEffect(() => {
    if (actionType === 'number_input') {
      setShowTextInput(true);
    } else if (actionType === 'text_input' && keyboardAutoShow) {
      setShowTextInput(true);
    }
  }, [actionType, keyboardAutoShow]);
  
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
    // Pour bravo, pas de vérification de zone - n'importe quel tap sur l'image valide
    if (actionType === 'bravo') return true;
    
    if (!actionArea) return false;
    const rect = containerRef.current?.querySelector('[data-action-zone]')?.getBoundingClientRect();
    if (!rect) return true;
    return event.clientX >= rect.left && event.clientX <= rect.right &&
           event.clientY >= rect.top && event.clientY <= rect.bottom;
  };

  const handlePointerUp = (event) => {
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
      } else if (isQuickTap && actionType === 'bravo') {
        // Pour le type "bravo", n'importe quel tap dans la zone déclenche l'overlay
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
    // Pour drag_and_drop, ne pas signaler d'erreur ici car la validation se fait dans handleDragEnd
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
    transform: 'translate(-50%, -50%)',
    borderRadius: area.shape === 'ellipse' ? '50%' : '8px',
  });

  const getAreaBorderStyle = (area) => {
    // Récupérer les paramètres de bordure depuis les données
    // Utiliser la couleur de la zone pour la bordure
    const borderColor = area.color || 'rgba(59, 130, 246, 0.5)'; // Bleu par défaut
    
    // Si show_border est explicitement false, pas de bordure
    if (area.show_border === false) return {};
    
    // Réduire la visibilité de la bordure si la zone est masquée
    const borderWidth = hideActionZone ? '1px' : '2px';
    const borderOpacity = hideActionZone ? 0.1 : 1;
    
    let finalBorderColor = borderColor;
    if (hideActionZone && borderColor.includes('rgba')) {
      finalBorderColor = borderColor.replace(/([\d.]+)\)$/, `${borderOpacity})`);
    } else if (hideActionZone && borderColor.includes('rgb(')) {
      finalBorderColor = borderColor.replace('rgb', 'rgba').replace(')', `, ${borderOpacity})`);
    }
    
    return {
      border: `${borderWidth} dashed ${finalBorderColor}`,
    };
  };

  const getAreaBackgroundStyle = (area) => {
    // Récupérer les paramètres de couleur depuis les données admin
    const bgColor = area.color || 'rgba(59, 130, 246, 0.3)'; // Bleu par défaut
    const bgOpacity = hideActionZone ? 0.02 : (area.opacity !== undefined ? area.opacity : 0.3);
    
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
      className={cn("relative overflow-hidden w-auto h-auto max-w-full max-h-full", imageContainerClassName)} 
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image principale sans zoom */}
      <div className="relative w-full h-full">
        <ImageFromSupabase 
          ref={imageRef}
          imageId={imageId} 
          alt={alt} 
          className="w-full h-auto"
          style={{ objectFit: 'contain', objectPosition: 'left top', display: 'block' }}
          onLoad={() => {
            try {
              const el = imageRef.current;
              if (el) {
                const rect = el.getBoundingClientRect();
                setMainImageRect({ width: rect.width, height: rect.height });
                setMainImageSrc(el.src || null);
              }
            } catch (e) {
              // ignore
            }
          }}
        />
      </div>
      
      {actionArea && (
        <motion.div
          data-action-zone
          style={{ 
            ...getAreaStyle(actionArea), 
            ...getAreaBorderStyle(actionArea),
            ...getAreaBackgroundStyle(actionArea),
            touchAction: 'none', 
            WebkitUserSelect: 'none', 
            WebkitTouchCallout: 'none',
            pointerEvents: 'auto'
          }}
          className={cn(
            "z-10 flex items-center justify-center",
            actionType === 'drag_and_drop' && "cursor-grab",
            actionType !== 'drag_and_drop' && "cursor-pointer"
          )}
          animate={hideActionZone ? { opacity: 1 } : getAnimationVariants()}
          whileHover={hideActionZone ? {} : { scale: 1.02 }}
          onContextMenu={handleContextMenu}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          drag={actionType === 'drag_and_drop'}
          dragConstraints={containerRef}
          dragElastic={0.1}
        >
          {/* Afficher l'icône si présente */}
          {actionArea.icon_name && (
            (() => {
              const IconComponent = getIconComponent(actionArea.icon_name);
              return IconComponent ? (
                <IconComponent 
                  className="text-white drop-shadow-lg" 
                  style={{ fontSize: '3rem', pointerEvents: 'none' }} 
                />
              ) : null;
            })()
          )}
        </motion.div>
      )}

      {showTextInput && targetArea && (
        (() => {
          const area = { ...targetArea };
          return (
            <div
              style={getAreaStyle(area)}
              className="z-20 flex items-center justify-center p-2 bg-white/95 rounded border-2 border-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                ref={textInputRef}
                type={actionType === 'number_input' ? 'number' : 'text'}
                inputMode={actionType === 'number_input' ? 'numeric' : 'text'}
                value={textInputValue}
                onChange={handleTextInputChange}
                onBlur={() => {
                  setShowTextInput(false);
                  setTextInputValue('');
                }}
                className="w-full text-center text-lg p-3 rounded border-2 border-blue-500 bg-white"
                placeholder={actionType === 'number_input' ? '0' : 'Tapez ici...'}
                autoComplete="off"
                autoFocus
              />
            </div>
          );
        })()
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

      {/* Loupe circulaire simple qui suit le curseur */}
      {isZoomed && showMagnifier && mainImageSrc && mainImageRect && (
        <div
          className="absolute pointer-events-none z-40"
          style={{
            left: `${magnifierPos.x}px`,
            top: `${magnifierPos.y}px`,
            width: '120px',
            height: '120px',
            transform: 'translate(-50%, -50%)',
            border: '2px solid white',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Background-based magnifier: use the main image src and scale/position the background */}
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${mainImageSrc})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${mainImageRect.width * 2}px ${mainImageRect.height * 2}px`,
              backgroundPosition: `${60 - magnifierPos.x * 2}px ${60 - magnifierPos.y * 2}px`
            }}
          />
        </div>
      )}

      <button
        onClick={() => setIsZoomed(!isZoomed)}
        className="absolute bottom-2 right-2 z-20 p-2 bg-background/50 backdrop-blur-sm rounded-full text-foreground hover:bg-background/80"
        title={isZoomed ? "Désactiver la loupe" : "Activer la loupe"}
      >
        {isZoomed ? <X size={isMobileLayout ? 16 : 20} /> : <Search size={isMobileLayout ? 16 : 20} />}
      </button>
    </div>
  );
};

export default ZoomableImage;

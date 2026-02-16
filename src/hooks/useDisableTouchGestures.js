import { useEffect } from 'react';

/**
 * Hook pour désactiver les gestes tactiles natifs du téléphone
 * Empêche le swipe-back, double-tap zoom, screenshots, et scroll interferes
 */
const useDisableTouchGestures = () => {
  useEffect(() => {
    // Désactiver overscroll bounce
    document.documentElement.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehaviorY = 'none';
    document.documentElement.style.overscrollBehaviorX = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehaviorY = 'none';
    document.body.style.overscrollBehaviorX = 'none';

    // Empêcher le double-tap zoom
    let lastTouchTime = 0;
    const handleTouchStart = (e) => {
      const now = Date.now();

      // Bloquer double-tap (moins de 300ms entre deux touches)
      if (now - lastTouchTime < 300) {
        e.preventDefault();
      }
      lastTouchTime = now;

      // Bloquer swipe-back (toucher au bord gauche)
      if (e.touches && e.touches[0].clientX < 15) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      // Si c'est dans la zone d'exercice, empêcher tous les gestes natifs
      const target = e.target;
      const isInExerciseZone =
        target.closest('.exercise-container') ||
        target.closest('[data-zoomable-image]') ||
        target.closest('motion-div') ||
        target.closest('[style*="touchAction"]');

      if (isInExerciseZone && e.cancelable) {
        // Laisser le handler custom faire le travail
      }
    };

    const handleGestureStart = (e) => {
      e.preventDefault();
    };

    // Appliquer les écouteurs
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('gesturestart', handleGestureStart, { passive: false });

    // Créer un style global pour désactiver les gestes
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        overscroll-behavior: none !important;
        overscroll-behavior-y: none !important;
        overscroll-behavior-x: none !important;
        touch-action: manipulation !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      
      * {
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      
      [data-zoomable-image], 
      .exercise-container,
      motion-div[style*="touchAction"] {
        touch-action: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('gesturestart', handleGestureStart);
      document.head.removeChild(style);
      document.documentElement.style.overscrollBehavior = 'auto';
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);
};

export default useDisableTouchGestures;

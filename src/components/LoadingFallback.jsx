import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced loading fallback component
 * Shows a smooth loader without blocking interaction
 */
const LoadingFallback = ({ message = "Chargement...", showProgress = false }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!showProgress) return;
    
    // Simulate progress loading
    const interval = setInterval(() => {
      setProgress(p => {
        const newProgress = p + Math.random() * 30;
        return Math.min(newProgress, 90); // Cap at 90% until actual completion
      });
    }, 500);

    return () => clearInterval(interval);
  }, [showProgress]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated loader */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-full"
          />
          
          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-4 border-transparent border-b-indigo-400 rounded-full"
          />
          
          {/* Inner circle */}
          <div className="absolute inset-4 bg-primary/10 rounded-full" />
        </div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg font-semibold text-primary"
        >
          {message}
        </motion.p>

        {/* Progress bar (optional) */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            transition={{ duration: 0.5 }}
            className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-primary"
            />
          </motion.div>
        )}

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-xs text-muted-foreground mt-4"
        >
          Aucun rafraîchissement requis
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingFallback;

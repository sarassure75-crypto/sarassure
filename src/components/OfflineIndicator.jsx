import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [justWentOnline, setJustWentOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustWentOnline(true);
      setShowIndicator(true);
      // Hide online indicator after 3 seconds
      setTimeout(() => {
        setShowIndicator(false);
        setJustWentOnline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      setJustWentOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline indicator on mount if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border-2 ${
            isOnline 
              ? 'bg-green-500/90 border-green-400 text-white' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400'
          }`}
        >
          <motion.div
            animate={{ rotate: isOnline ? 0 : [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: isOnline ? 0 : Infinity, repeatDelay: 2 }}
          >
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
          </motion.div>
          
          <div className="flex flex-col">
            <span className="font-bold text-sm">
              {isOnline ? 'Connexion rétablie' : 'Mode hors ligne'}
            </span>
            <span className="text-xs opacity-90">
              {isOnline ? 'Toutes les fonctionnalités disponibles' : 'Données en cache disponibles'}
            </span>
          </div>
          
          {!isOnline && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

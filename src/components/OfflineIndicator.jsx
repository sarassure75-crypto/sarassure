import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-slide-down">
      <WifiOff className="w-5 h-5" />
      <span className="font-semibold">Mode hors ligne - Données en cache disponibles</span>
    </div>
  );
}

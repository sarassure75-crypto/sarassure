import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Empêcher le mini-infobar par défaut
      e.preventDefault();
      // Stocker l'événement pour l'utiliser plus tard
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowButton(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Afficher le prompt d'installation
    deferredPrompt.prompt();

    // Attendre le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response: ${outcome}`);

    // Réinitialiser le prompt
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[#3A5A40] to-[#588157] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-bounce-slow"
      aria-label="Installer l'application"
    >
      <Download className="w-5 h-5" />
      <span className="font-semibold">Installer l'app</span>
    </button>
  );
}

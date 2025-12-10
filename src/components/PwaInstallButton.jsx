import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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

      if (outcome === 'accepted') {
        toast({
          title: "Installation réussie !",
          description: "L'application est maintenant disponible depuis votre écran d'accueil.",
          variant: "default"
        });
      } else {
        toast({
          title: "Installation annulée",
          description: "Vous pouvez installer l'application plus tard depuis le menu.",
          variant: "destructive"
        });
      }

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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[#3A5A40] via-[#588157] to-[#3A5A40] bg-[length:200%_100%] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-bounce-slow hover:animate-none group"
      style={{
        animation: 'bounce-slow 3s ease-in-out infinite, shimmer 3s linear infinite'
      }}
      aria-label="Installer l'application"
    >
      <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="font-semibold">Installer l'app</span>
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />
    </button>
  );
}

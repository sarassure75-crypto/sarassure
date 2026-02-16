import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Home,
  BookOpen,
  User,
  LogOut,
  Shield,
  UserCog,
  MessageSquare as MessageSquareQuestion,
  BarChart3,
  Bug,
  Download,
  Share,
} from 'lucide-react';
import { USER_ROLES } from '@/data/users';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import AppBanner from '@/components/AppBanner';

const PwaInstallCard = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const userAgent = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMac = /Macintosh/.test(userAgent) && 'ontouchend' in document;
    setIsIos(isIOSDevice || isMac);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPrompt = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  if (isAppInstalled) {
    return (
      <Card className="bg-muted/50">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center text-lg">
            <Download className="mr-2 h-5 w-5 text-green-500" />
            Application Installée
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <CardDescription>
            Vous utilisez déjà la version installée de l'application.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/50">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center text-lg">
          <Download className="mr-2 h-5 w-5" />
          Version PWA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription>
          Installez l'application pour un accès rapide et une utilisation hors-ligne.
        </CardDescription>
        {deferredPrompt ? (
          <Button onClick={handleInstallPrompt} className="w-full mt-4">
            Installer l'application
          </Button>
        ) : isIos ? (
          <div className="text-sm text-muted-foreground bg-slate-100 p-3 rounded-lg mt-4">
            <p>
              Sur iPhone/iPad: Appuyez sur <Share className="inline-block h-4 w-4 mx-1" /> puis "Sur
              l'écran d'accueil".
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">
            L'installation n'est pas disponible sur ce navigateur.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const Layout = ({ pwaMode = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppBanner />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-2 sm:py-8">
        <Outlet context={{ isMobileView: pwaMode }} />
      </main>
    </div>
  );
};

export default Layout;

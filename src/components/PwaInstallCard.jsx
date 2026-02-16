import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, Share } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const PwaInstallCard = ({ delay }) => {
  const { deferredPrompt, handleInstallPrompt } = useAuth();
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMac = /Macintosh/.test(userAgent) && 'ontouchend' in document; // For iPad on recent iOS
    setIsIos(isIOSDevice || isMac);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className="h-full text-center flex flex-col">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4">Version PWA</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center">
          <CardDescription className="mb-4">
            Installez l'application pour un accès rapide et une utilisation hors-ligne sur mobile.
          </CardDescription>
          {deferredPrompt ? (
            <Button onClick={handleInstallPrompt}>
              <Download className="mr-2 h-4 w-4" />
              Installer l'application
            </Button>
          ) : isIos ? (
            <div className="text-sm text-muted-foreground bg-slate-100 p-3 rounded-lg">
              <p>
                Sur iPhone/iPad, appuyez sur l'icône <Share className="inline-block h-4 w-4 mx-1" />{' '}
                puis "Sur l'écran d'accueil".
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              L'installation n'est pas disponible sur ce navigateur.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PwaInstallCard;

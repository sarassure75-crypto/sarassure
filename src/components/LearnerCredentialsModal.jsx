import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, KeyRound, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LearnerCredentialsModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  if (!currentUser || currentUser.role !== 'apprenant') {
    return null;
  }

  const handleCopy = (textToCopy, fieldName) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast({
          title: `${fieldName} copié !`,
          description: `${textToCopy} a été copié dans le presse-papiers.`,
        });
      })
      .catch((err) => {
        toast({
          title: 'Erreur de copie',
          description: `Impossible de copier : ${err}`,
          variant: 'destructive',
        });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-green-50 to-emerald-100 border-green-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700 flex items-center">
            <KeyRound className="mr-2 h-6 w-6 text-green-600" />
            Mes Informations de Connexion
          </DialogTitle>
          <DialogDescription className="text-green-600">
            Voici vos informations pour vous connecter à l'application. Gardez votre code secret !
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="flex items-center p-4 bg-white rounded-lg shadow border border-green-200">
            <User className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Votre Prénom :</p>
              <p className="text-2xl font-semibold text-green-700">{currentUser.first_name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-green-500 hover:text-green-700"
              onClick={() => handleCopy(currentUser.first_name, 'Prénom')}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center p-4 bg-white rounded-lg shadow border border-green-200">
            <KeyRound className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Votre Code Secret (mot de passe) :
              </p>
              <p className="text-3xl font-bold tracking-wider text-green-700">
                {currentUser.learner_code}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-green-500 hover:text-green-700"
              onClick={() => handleCopy(currentUser.learner_code, 'Code Secret')}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LearnerCredentialsModal;

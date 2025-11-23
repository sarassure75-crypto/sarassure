import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { User, KeyRound, Copy, LogOut, Loader2 } from 'lucide-react';

const LearnerAccountPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleCopy = (textToCopy, fieldName) => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({ title: `${fieldName} copié !`, description: `${textToCopy} a été copié dans le presse-papiers.` });
      })
      .catch(err => {
        toast({ title: "Erreur de copie", description: `Impossible de copier : ${err}`, variant: "destructive" });
      });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
      toast({ title: "Déconnexion réussie", description: "Vous avez été déconnecté." });
    } catch (error) {
      toast({ title: "Erreur de déconnexion", description: error.message, variant: "destructive" });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="w-full shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <User className="mr-3 h-8 w-8" />
            Mon Compte Apprenant
          </CardTitle>
          <CardDescription>
            Voici vos informations personnelles. Gardez votre code secret en sécurité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center p-4 bg-muted/50 rounded-lg border">
            <User className="h-6 w-6 text-muted-foreground mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Votre Prénom</p>
              <p className="text-xl font-semibold">{currentUser.first_name}</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleCopy(currentUser.first_name, "Prénom")}>
              <Copy className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center p-4 bg-muted/50 rounded-lg border">
            <KeyRound className="h-6 w-6 text-muted-foreground mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Votre Code Secret (mot de passe)</p>
              <p className="text-2xl font-bold tracking-wider">{currentUser.learner_code}</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleCopy(currentUser.learner_code, "Code Secret")}>
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Se déconnecter
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LearnerAccountPage;
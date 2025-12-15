import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { User, KeyRound, Copy, LogOut, Loader2, Link } from 'lucide-react';
import SatisfactionSurvey from '@/components/SatisfactionSurvey';
import { LanguagePreferenceSelector } from '@/components/LanguagePreferenceSelector';
import { supabase } from '@/lib/supabaseClient';

const LearnerAccountPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [trainerCode, setTrainerCode] = React.useState('');
  const [trainerProfile, setTrainerProfile] = React.useState(null);
  const [isLoadingTrainer, setIsLoadingTrainer] = React.useState(true);
  const [isLinking, setIsLinking] = React.useState(false);
  const [showLinkForm, setShowLinkForm] = React.useState(false);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Charger le profil du formateur s'il est lié
  React.useEffect(() => {
    const loadTrainerProfile = async () => {
      try {
        setIsLoadingTrainer(true);
        if (currentUser.assigned_trainer_id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, pseudo, trainer_code')
            .eq('id', currentUser.assigned_trainer_id)
            .single();

          if (error) throw error;
          setTrainerProfile(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil du formateur:', error);
      } finally {
        setIsLoadingTrainer(false);
      }
    };

    loadTrainerProfile();
  }, [currentUser.assigned_trainer_id]);

  const handleLinkTrainer = async (e) => {
    e.preventDefault();
    if (!trainerCode.trim()) {
      toast({ title: "Code requis", description: "Veuillez entrer le code du formateur.", variant: "destructive" });
      return;
    }

    setIsLinking(true);
    try {
      // Trouver le formateur par code
      const { data: trainer, error: trainerError } = await supabase
        .from('profiles')
        .select('id, first_name, pseudo, trainer_code')
        .eq('trainer_code', trainerCode.toUpperCase())
        .eq('role', 'formateur')
        .single();

      if (trainerError || !trainer) {
        toast({ title: "Formateur non trouvé", description: "Aucun formateur ne correspond à ce code.", variant: "destructive" });
        return;
      }

      // Lier l'apprenant au formateur
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ assigned_trainer_id: trainer.id })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      setTrainerProfile(trainer);
      setTrainerCode('');
      setShowLinkForm(false);
      toast({ title: "Succès!", description: `Vous avez été lié au formateur ${trainer.first_name}` });
    } catch (error) {
      console.error('Erreur:', error);
      toast({ title: "Erreur de liaison", description: error.message, variant: "destructive" });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkTrainer = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ assigned_trainer_id: null })
        .eq('id', currentUser.id);

      if (error) throw error;
      setTrainerProfile(null);
      toast({ title: "Succès!", description: "Vous avez été délié du formateur" });
    } catch (error) {
      console.error('Erreur:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

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
          {/* Satisfaction survey */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Donnez votre avis</h3>
            <p className="text-sm text-muted-foreground mb-3">Votre retour nous aide à améliorer l'application. Ce questionnaire est court et anonyme.</p>
            <SatisfactionSurvey onSubmitted={async () => {
              // Optionally refetch profile or show something
            }} />
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

          {/* Section Sélection Langue */}
          <div className="border-t pt-6">
            <LanguagePreferenceSelector />
          </div>

          {/* Section Liaison Formateur */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Link className="h-5 w-5" />
              Liaison Formateur
            </h3>

            {isLoadingTrainer ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Chargement du profil formateur...</span>
              </div>
            ) : trainerProfile ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Vous êtes lié au formateur :</p>
                  <p className="text-lg font-semibold text-green-900">{trainerProfile.first_name} ({trainerProfile.pseudo})</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleUnlinkTrainer}
                  className="w-full"
                >
                  Se délier du formateur
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Vous n'êtes pas lié à un formateur. Entrez le code du formateur pour l'ajouter.
                </p>

                {!showLinkForm ? (
                  <Button
                    onClick={() => setShowLinkForm(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Lier un formateur
                  </Button>
                ) : (
                  <form onSubmit={handleLinkTrainer} className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Code du Formateur
                      </label>
                      <input
                        type="text"
                        value={trainerCode}
                        onChange={(e) => setTrainerCode(e.target.value.toUpperCase())}
                        placeholder="Ex: US5785"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isLinking}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Le code du formateur se trouve dans son compte
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isLinking}
                        className="flex-1"
                      >
                        {isLinking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Liaison...
                          </>
                        ) : (
                          <>
                            <Link className="mr-2 h-4 w-4" />
                            Lier
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowLinkForm(false);
                          setTrainerCode('');
                        }}
                        disabled={isLinking}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
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
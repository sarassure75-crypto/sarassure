import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getLearnersByTrainer,
  assignTrainerToLearner,
  unassignTrainerFromLearner,
  getLearnerByCode,
  USER_ROLES,
} from '@/data/users';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Users,
  UserPlus,
  Link2,
  Trash2,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Lock,
  Copy,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import LearnerLicensesManager from '@/components/LearnerLicensesManager';
import PurchaseLicensesModal from '@/components/PurchaseLicensesModal';
import PurchaseHistory from '@/components/PurchaseHistory';
import TrainerLicensesOverview from '@/components/TrainerLicensesOverview';
import TrainerLearnersProgressReport from '@/components/TrainerLearnersProgressReport';

const TrainerAccountPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [learners, setLearners] = useState([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState(true);
  const [learnerCode, setLearnerCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const [expandedLearner, setExpandedLearner] = useState(null);
  const [activeTab, setActiveTab] = useState('learners');

  const fetchLearners = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingLearners(true);
    try {
      const data = await getLearnersByTrainer(currentUser.id);
      setLearners(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les apprenants.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLearners(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  const handleLinkLearner = async (e) => {
    e.preventDefault();
    if (!learnerCode) {
      toast({
        title: 'Code requis',
        description: "Veuillez entrer le code d'un apprenant.",
        variant: 'destructive',
      });
      return;
    }
    setIsLinking(true);
    try {
      const learner = await getLearnerByCode(learnerCode);
      if (!learner) throw new Error('Aucun apprenant trouvé avec ce code.');
      if (learner.assigned_trainer_id)
        throw new Error('Cet apprenant est déjà lié à un autre formateur.');

      await assignTrainerToLearner(learner.id, currentUser.id);
      toast({
        title: 'Apprenant lié !',
        description: `${learner.first_name} vous a été assigné(e).`,
      });
      setLearnerCode('');
      fetchLearners();
    } catch (error) {
      toast({ title: 'Erreur de liaison', description: error.message, variant: 'destructive' });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkLearner = async (learnerId) => {
    try {
      await unassignTrainerFromLearner(learnerId);
      toast({
        title: 'Apprenant délié !',
        description: "L'apprenant a été délié de votre compte.",
      });
      fetchLearners();
    } catch (error) {
      toast({
        title: 'Erreur de dissociation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copié !', description: 'Le code a été copié dans le presse-papiers.' });
  };

  if (!currentUser || currentUser.role !== USER_ROLES.TRAINER) {
    return <p className="p-4 text-center text-destructive">Accès non autorisé.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 md:p-8"
    >
      <Card className="mb-8 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <CardTitle className="text-3xl flex items-center">
            <Users className="mr-3 h-8 w-8" /> Mon Compte Formateur
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 flex items-center gap-4">
            Bienvenue, {currentUser.first_name} ({currentUser.pseudo}) !
            <span className="flex items-center gap-2 bg-primary-foreground/20 p-1.5 rounded-md">
              Votre code formateur :
              <strong className="font-bold text-lg tracking-wider">
                {currentUser.trainer_code}
              </strong>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white"
                onClick={() => handleCopy(currentUser.trainer_code)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={activeTab === 'learners' ? 'default' : 'outline'}
          onClick={() => setActiveTab('learners')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Apprenants
        </Button>
        <Button
          variant={activeTab === 'progress' ? 'default' : 'outline'}
          onClick={() => setActiveTab('progress')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Suivi des Apprenants
        </Button>
        <Button
          variant={activeTab === 'licenses' ? 'default' : 'outline'}
          onClick={() => setActiveTab('licenses')}
          className="flex items-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Acheter des licences
        </Button>
        <Button
          variant={activeTab === 'licenses-management' ? 'default' : 'outline'}
          onClick={() => setActiveTab('licenses-management')}
          className="flex items-center gap-2"
        >
          <Lock className="h-4 w-4" />
          Gestion des licences
        </Button>
        <Button
          variant={activeTab === 'faq' ? 'default' : 'outline'}
          onClick={() => setActiveTab('faq')}
          className="flex items-center gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          FAQ Formateurs
        </Button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'learners' && (
        <div className="grid md:grid-cols-1 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Lier un Apprenant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLinkLearner} className="space-y-4">
                  <div>
                    <Label htmlFor="learnerCode">Code de l'Apprenant</Label>
                    <Input
                      id="learnerCode"
                      value={learnerCode}
                      onChange={(e) => setLearnerCode(e.target.value)}
                      placeholder="Entrez le code de l'apprenant"
                      disabled={isLinking}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLinking}>
                    {isLinking ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="mr-2 h-4 w-4" />
                    )}
                    Lier l'Apprenant
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-1 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-xl">
                    <span>Mes Apprenants ({learners.length})</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchLearners}
                      disabled={isLoadingLearners}
                    >
                      <RefreshCw className={`h-5 w-5 ${isLoadingLearners ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLoadingLearners ? (
                      <p className="text-center text-muted-foreground py-4">Chargement...</p>
                    ) : learners.length > 0 ? (
                      learners.map((learner) => (
                        <div key={learner.id} className="border rounded-lg">
                          <div
                            className="flex items-center justify-between p-3 hover:bg-muted/30 cursor-pointer"
                            onClick={() =>
                              setExpandedLearner(expandedLearner === learner.id ? null : learner.id)
                            }
                          >
                            <div>
                              <p className="font-medium">{learner.first_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {learner.learner_code}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnlinkLearner(learner.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  expandedLearner === learner.id ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </div>

                          {expandedLearner === learner.id && (
                            <div className="border-t p-3 bg-muted/20">
                              <LearnerLicensesManager
                                learnerId={learner.id}
                                learnerName={learner.first_name}
                                trainerId={currentUser.id}
                                onUpdate={fetchLearners}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Aucun apprenant lié.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div>
          <TrainerLearnersProgressReport trainerId={currentUser.id} learners={learners} />
        </div>
      )}

      {activeTab === 'licenses' && (
        <div className="grid md:grid-cols-1 gap-6">
          <PurchaseLicensesModal
            trainerId={currentUser.id}
            onSuccess={() => {
              toast({
                title: 'Succès',
                description: 'Vos licences ont été achetées avec succès !',
              });
              setActiveTab('learners');
            }}
          />
          <PurchaseHistory trainerId={currentUser.id} />
        </div>
      )}

      {activeTab === 'licenses-management' && (
        <div className="grid md:grid-cols-1 gap-6">
          <TrainerLicensesOverview trainerId={currentUser.id} />
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="grid md:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                FAQ Formateurs
              </CardTitle>
              <CardDescription>Questions fréquemment posées pour les formateurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Comment créer un apprenant?</h3>
                <p className="text-sm text-muted-foreground">
                  Allez dans l'onglet "Apprenants" et cliquez sur "Créer un apprenant". Remplissez
                  le prénom de l'apprenant. Un code unique sera généré automatiquement.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Comment lier un apprenant existant?</h3>
                <p className="text-sm text-muted-foreground">
                  Allez dans l'onglet "Apprenants" et cliquez sur "Lier un apprenant". Entrez le
                  code apprenant de l'utilisateur. Vous pouvez le trouver dans son profil "Espace
                  Apprenant".
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Comment acheter des licences?</h3>
                <p className="text-sm text-muted-foreground">
                  Allez dans l'onglet "Acheter des licences" et sélectionnez le nombre de licences
                  que vous souhaitez pour chaque catégorie. Les paiements se font en ligne.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Comment attribuer une licence à un apprenant?</h3>
                <p className="text-sm text-muted-foreground">
                  Allez dans l'onglet "Gestion des licences". Vous y verrez un résumé de vos
                  licences achetées et une liste de vos apprenants avec les catégories auxquelles
                  ils ont accès.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Que faire si j'ai besoin d'aide?</h3>
                <p className="text-sm text-muted-foreground">
                  Consultez la page FAQ complète ou contactez notre support via le formulaire de
                  contact disponible sur le site.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default TrainerAccountPage;

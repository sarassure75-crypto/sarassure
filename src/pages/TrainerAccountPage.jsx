import React, { useState, useEffect, useCallback } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { getLearnersByTrainer, assignTrainerToLearner, unassignTrainerFromLearner, getLearnerByCode, USER_ROLES } from '@/data/users';
    import { supabase } from '@/lib/supabaseClient';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { Users, UserPlus, Link2, Copy, Trash2, Loader2, RefreshCw, Lock, Shield, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { getCategoriesWithLicenseStatus } from '@/data/licenses';
    import { Badge } from '@/components/ui/badge';
    import LearnerLicensesManager from '@/components/LearnerLicensesManager';
    import PurchaseLicensesModal from '@/components/PurchaseLicensesModal';
    import PurchaseHistory from '@/components/PurchaseHistory';

    const TrainerAccountPage = () => {
      const { currentUser } = useAuth();
      const { toast } = useToast();
      const [learners, setLearners] = useState([]);
      const [isLoadingLearners, setIsLoadingLearners] = useState(true);
      const [learnerCode, setLearnerCode] = useState('');
      const [isLinking, setIsLinking] = useState(false);
      const [categories, setCategories] = useState([]);
      const [isLoadingCategories, setIsLoadingCategories] = useState(true);
      const [newPassword, setNewPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [isChangingPassword, setIsChangingPassword] = useState(false);
      const [expandedLearner, setExpandedLearner] = useState(null);
      const [activeTab, setActiveTab] = useState('learners');

      const fetchLearners = useCallback(async () => {
        if (!currentUser) return;
        setIsLoadingLearners(true);
        try {
          const data = await getLearnersByTrainer(currentUser.id);
          setLearners(data);
        } catch (error) {
          toast({ title: "Erreur", description: "Impossible de charger les apprenants.", variant: "destructive" });
        } finally {
          setIsLoadingLearners(false);
        }
      }, [currentUser, toast]);

      const fetchCategories = useCallback(async () => {
        if (!currentUser) return;
        setIsLoadingCategories(true);
        try {
          const data = await getCategoriesWithLicenseStatus(currentUser.id);
          setCategories(data);
        } catch (error) {
          toast({ title: "Erreur", description: "Impossible de charger les licences.", variant: "destructive" });
        } finally {
          setIsLoadingCategories(false);
        }
      }, [currentUser, toast]);

      useEffect(() => {
        fetchLearners();
        fetchCategories();
      }, [fetchLearners, fetchCategories]);

      const handleLinkLearner = async (e) => {
        e.preventDefault();
        if (!learnerCode) {
          toast({ title: "Code requis", description: "Veuillez entrer le code d'un apprenant.", variant: "destructive" });
          return;
        }
        setIsLinking(true);
        try {
          const learner = await getLearnerByCode(learnerCode);
          if (!learner) throw new Error("Aucun apprenant trouvé avec ce code.");
          if (learner.assigned_trainer_id) throw new Error("Cet apprenant est déjà lié à un autre formateur.");
          
          await assignTrainerToLearner(learner.id, currentUser.id);
          toast({ title: "Apprenant lié !", description: `${learner.first_name} vous a été assigné(e).` });
          setLearnerCode('');
          fetchLearners();
        } catch (error) {
          toast({ title: "Erreur de liaison", description: error.message, variant: "destructive" });
        } finally {
          setIsLinking(false);
        }
      };

      const handleUnlinkLearner = async (learnerId) => {
        try {
          await unassignTrainerFromLearner(learnerId);
          toast({ title: "Apprenant délié !", description: "L'apprenant a été délié de votre compte." });
          fetchLearners();
        } catch (error) {
          toast({ title: "Erreur de dissociation", description: error.message, variant: "destructive" });
        }
      };
      
      const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copié !", description: "Le code a été copié dans le presse-papiers."});
      }

      const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (!newPassword || !confirmPassword) {
          toast({ title: "Champs requis", description: "Veuillez remplir tous les champs.", variant: "destructive" });
          return;
        }

        if (newPassword.length < 6) {
          toast({ title: "Mot de passe trop court", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
          return;
        }

        if (newPassword !== confirmPassword) {
          toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
          return;
        }

        setIsChangingPassword(true);
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (error) throw error;

          toast({ 
            title: "Mot de passe modifié !", 
            description: "Votre mot de passe a été mis à jour avec succès." 
          });
          setNewPassword('');
          setConfirmPassword('');
        } catch (error) {
          toast({ 
            title: "Erreur", 
            description: error.message || "Impossible de modifier le mot de passe.", 
            variant: "destructive" 
          });
        } finally {
          setIsChangingPassword(false);
        }
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
              <CardTitle className="text-3xl flex items-center"><Users className="mr-3 h-8 w-8" /> Mon Compte Formateur</CardTitle>
              <CardDescription className="text-primary-foreground/90 flex items-center gap-4">
                Bienvenue, {currentUser.first_name} ({currentUser.pseudo}) ! 
                <span className="flex items-center gap-2 bg-primary-foreground/20 p-1.5 rounded-md">
                    Votre code formateur : 
                    <strong className="font-bold text-lg tracking-wider">{currentUser.trainer_code}</strong>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white" onClick={() => handleCopy(currentUser.trainer_code)}>
                        <Copy className="h-4 w-4"/>
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
              variant={activeTab === 'licenses' ? 'default' : 'outline'}
              onClick={() => setActiveTab('licenses')}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Acheter des licences
            </Button>
            <Button 
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Paramètres
            </Button>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'learners' && (
            <div className="grid md:grid-cols-1 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center"><UserPlus className="mr-2 h-5 w-5"/>Lier un Apprenant</CardTitle>
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
                        {isLinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Link2 className="mr-2 h-4 w-4"/>}
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
                          <Button variant="ghost" size="icon" onClick={fetchLearners} disabled={isLoadingLearners}>
                             <RefreshCw className={`h-5 w-5 ${isLoadingLearners ? 'animate-spin' : ''}`} />
                          </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {isLoadingLearners ? (
                          <p className="text-center text-muted-foreground py-4">Chargement...</p>
                        ) : learners.length > 0 ? (
                          learners.map(learner => (
                            <div key={learner.id} className="border rounded-lg">
                              <div className="flex items-center justify-between p-3 hover:bg-muted/30 cursor-pointer"
                                   onClick={() => setExpandedLearner(expandedLearner === learner.id ? null : learner.id)}>
                                <div>
                                  <p className="font-medium">{learner.first_name}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{learner.learner_code}</p>
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
                                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedLearner === learner.id ? 'rotate-180' : ''}`} />
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

          {activeTab === 'licenses' && (
            <div className="grid md:grid-cols-1 gap-6">
              <PurchaseLicensesModal 
                trainerId={currentUser.id}
                onSuccess={() => {
                  toast({ 
                    title: "Succès", 
                    description: "Vos licences ont été achetées avec succès !" 
                  });
                  setActiveTab('learners');
                }}
              />
              <PurchaseHistory trainerId={currentUser.id} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid md:grid-cols-1 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Lock className="mr-2 h-5 w-5"/>
                      Changer mon mot de passe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input 
                          id="newPassword"
                          type="password"
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          placeholder="Minimum 6 caractères"
                          disabled={isChangingPassword}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input 
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          placeholder="Retapez le mot de passe"
                          disabled={isChangingPassword}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        ) : (
                          <Lock className="mr-2 h-4 w-4"/>
                        )}
                        Modifier
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Shield className="mr-2 h-5 w-5"/>
                      Mes Licences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[246px]">
                      {isLoadingCategories ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Chargement...</p>
                      ) : (
                        <div className="space-y-2">
                          {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm font-medium">{cat.name}</span>
                              {cat.name?.toLowerCase() === 'tactile' ? (
                                <Badge variant="secondary" className="text-xs">Gratuit</Badge>
                              ) : cat.hasLicense ? (
                                <Badge className="text-xs bg-green-600">Actif</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Non actif</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      );
    };

    export default TrainerAccountPage;
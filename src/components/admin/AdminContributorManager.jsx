import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  UserPlus, 
  Trash2, 
  Mail, 
  User, 
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminContributorManager = ({ onContributorCreated }) => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { toast } = useToast();

  // Fonction pour vérifier le statut CGU d'un contributeur
  const checkCGUStatus = (contributor) => {
    const hasAcceptedCGU = contributor.cgu_accepted === true;
    const acceptanceDate = contributor.cgu_accepted_date;
    
    return { hasAccepted: hasAcceptedCGU, acceptedDate: acceptanceDate };
  };

  // Fonction pour basculer le statut CGU d'un contributeur
  const toggleCGUStatus = async (contributor) => {
    try {
      const currentStatus = checkCGUStatus(contributor);
      const newStatus = !currentStatus.hasAccepted;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          cgu_accepted: newStatus,
          cgu_accepted_date: newStatus ? new Date().toISOString() : null
        })
        .eq('id', contributor.id);

      if (error) throw error;

      toast({
        title: 'Statut CGU mis à jour',
        description: `CGU ${newStatus ? 'acceptées' : 'révoquées'} pour ${contributor.email}`,
      });
      
      loadContributors();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut CGU:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut CGU',
        variant: 'destructive'
      });
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: ''
  });

  useEffect(() => {
    loadContributors();
  }, []);

  const loadContributors = async () => {
    try {
      setLoading(true);
      
      // Get all users with contributor role
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at,
          role,
          cgu_accepted,
          cgu_accepted_date
        `)
        .eq('role', 'contributor')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContributors(profiles || []);
    } catch (error) {
      console.error('Error loading contributors:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les contributeurs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContributor = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Erreur',
        description: 'Email et mot de passe sont requis',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCreating(true);

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'contributor',
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // 2. Update profile with contributor role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'contributor',
          first_name: formData.firstName,
          last_name: formData.lastName
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // 3. Create contributor profile
      const { error: contributorError } = await supabase
        .from('contributor_profiles')
        .insert({
          user_id: authData.user.id,
          username: formData.username || formData.email.split('@')[0],
          bio: '',
          is_public: true
        });

      if (contributorError) throw contributorError;

      toast({
        title: 'Contributeur créé',
        description: `Le compte contributeur pour ${formData.email} a été créé avec succès`,
      });

      // Reset form and reload
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        username: ''
      });
      setShowCreateForm(false);
      loadContributors();
      
      if (onContributorCreated) {
        onContributorCreated();
      }
    } catch (error) {
      console.error('Error creating contributor:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le contributeur',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteContributor = async (contributor) => {
    try {
      // Delete contributor profile first
      const { error: profileError } = await supabase
        .from('contributor_profiles')
        .delete()
        .eq('user_id', contributor.id);

      if (profileError) throw profileError;

      // Update role to 'user'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', contributor.id);

      if (updateError) throw updateError;

      toast({
        title: 'Contributeur supprimé',
        description: `Le rôle contributeur de ${contributor.email} a été révoqué`,
        variant: 'destructive'
      });

      loadContributors();
    } catch (error) {
      console.error('Error deleting contributor:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le contributeur',
        variant: 'destructive'
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Gestion des Contributeurs
              </CardTitle>
              <CardDescription>
                Créez et gérez les comptes contributeurs de la plateforme
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {showCreateForm ? 'Annuler' : 'Nouveau Contributeur'}
            </Button>
          </div>
        </CardHeader>

        {/* Create Form */}
        {showCreateForm && (
          <CardContent>
            <form onSubmit={handleCreateContributor} className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contributeur@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 caractères"
                    minLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Jean"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Dupont"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Pseudo (optionnel)</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="jean_creator"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={creating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {creating ? 'Création...' : 'Créer le Contributeur'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Contributors List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Contributeurs Actifs ({contributors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contributors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Aucun contributeur</p>
              <p className="text-sm">Créez votre premier compte contributeur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributors.map((contributor) => (
                <div 
                  key={contributor.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(contributor.first_name?.[0] || contributor.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {contributor.first_name && contributor.last_name
                            ? `${contributor.first_name} ${contributor.last_name}`
                            : contributor.email}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          Contributeur
                        </Badge>
                        
                        {/* Badge CGU conditionnel */}
                        {(() => {
                          const cguStatus = checkCGUStatus(contributor);
                          
                          return cguStatus.hasAccepted ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              CGU acceptées
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              CGU non acceptées
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contributor.email}
                        </p>
                        {contributor.created_at && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Créé le {new Date(contributor.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(() => {
                      const cguStatus = checkCGUStatus(contributor);
                      return cguStatus.hasAccepted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCGUStatus(contributor)}
                          className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Révoquer CGU
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCGUStatus(contributor)}
                          className="gap-2 text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Marquer CGU acceptées
                        </Button>
                      );
                    })()}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(contributor)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Révoquer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer le rôle contributeur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir révoquer le rôle contributeur de{' '}
              <strong>{deleteConfirm?.email}</strong> ?
              <br />
              <br />
              Le profil contributeur sera supprimé et l'utilisateur redeviendra un utilisateur standard.
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteContributor(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminContributorManager;

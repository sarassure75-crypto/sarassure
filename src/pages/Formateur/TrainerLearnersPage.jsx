import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Mail,
  Calendar,
  Plus,
  Link2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

import { createLearner } from '@/data/users';

export default function TrainerLearnersPage() {
  const { currentUser } = useAuth();
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [learnerCode, setLearnerCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLearnerFirstName, setNewLearnerFirstName] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadLearners();
    }
  }, [currentUser]);

  const loadLearners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('assigned_trainer_id', currentUser.id)
        .eq('role', 'apprenant')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLearners(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des apprenants' });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkLearner = async (e) => {
    e.preventDefault();

    if (!learnerCode.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer un code apprenant' });
      return;
    }

    try {
      setIsLinking(true);

      // Chercher l'apprenant par code
      const { data: learnerData, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('learner_code', learnerCode.toUpperCase())
        .single();

      if (fetchError || !learnerData) {
        setMessage({ type: 'error', text: 'Code apprenant non trouvé' });
        return;
      }

      // Vérifier si déjà lié
      if (learnerData.assigned_trainer_id && learnerData.assigned_trainer_id !== currentUser.id) {
        setMessage({ type: 'error', text: 'Cet apprenant est déjà lié à un autre formateur' });
        return;
      }

      // Lier l'apprenant
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ assigned_trainer_id: currentUser.id })
        .eq('id', learnerData.id);

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: `Apprenant ${learnerData.full_name} lié avec succès!` });
      setLearnerCode('');
      setShowLinkForm(false);
      loadLearners();
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la liaison' });
    } finally {
      setIsLinking(false);
    }
  };

  const handleCreateLearner = async (e) => {
    e.preventDefault();

    if (!newLearnerFirstName.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer un prénom' });
      return;
    }

    try {
      setIsCreating(true);

      const newLearner = await createLearner(newLearnerFirstName);

      // Lier l'apprenant au formateur
      const { error: linkError } = await supabase
        .from('profiles')
        .update({ assigned_trainer_id: currentUser.id })
        .eq('id', newLearner.id);

      if (linkError) throw linkError;

      setMessage({
        type: 'success',
        text: `Apprenant "${newLearner.first_name}" créé avec succès! Code: ${newLearner.learner_code}`,
      });

      setNewLearnerFirstName('');
      setShowCreateForm(false);
      loadLearners();

      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la création du compte' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUnlinkLearner = async (learnerId) => {
    if (!confirm('Êtes-vous sûr de vouloir délier cet apprenant?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ assigned_trainer_id: null })
        .eq('id', learnerId);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Apprenant déié avec succès!' });
      loadLearners();
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression de la liaison' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-primary" />
              Mes Apprenants
            </h1>
            <p className="text-gray-600 mt-1">Gérez et créez les comptes de vos apprenants</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4" />
              Créer un apprenant
            </Button>
            <Button
              onClick={() => setShowLinkForm(!showLinkForm)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Link2 className="h-4 w-4" />
              Lier un apprenant
            </Button>
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <Alert
            className={
              message.type === 'error'
                ? 'bg-red-50 border-red-200 mb-8'
                : 'bg-green-50 border-green-200 mb-8'
            }
          >
            {message.type === 'error' ? (
              <AlertCircle className="text-red-600" />
            ) : (
              <CheckCircle2 className="text-green-600" />
            )}
            <AlertDescription
              className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Formulaire de création */}
        {showCreateForm && (
          <Card className="mb-8 border-green-300 bg-green-50">
            <CardHeader className="border-b border-green-200">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <UserPlus className="text-green-600" />
                Créer un apprenant (sans email)
              </CardTitle>
              <CardDescription className="text-green-800">
                Créez un compte pour un apprenant qui n'a pas d'adresse email. Un code unique sera
                généré.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateLearner} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom de l'apprenant
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Jean"
                    value={newLearnerFirstName}
                    onChange={(e) => setNewLearnerFirstName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isCreating ? 'Création en cours...' : 'Créer le compte'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewLearnerFirstName('');
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Formulaire de liaison */}
        {showLinkForm && (
          <Card className="mb-8 border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="text-primary" />
                Lier un apprenant
              </CardTitle>
              <CardDescription>
                Entrez le code de l'apprenant pour établir la liaison
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLinkLearner} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code apprenant
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: AP12345"
                    value={learnerCode}
                    onChange={(e) => setLearnerCode(e.target.value.toUpperCase())}
                    disabled={isLinking}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le code apprenant se trouve dans son profil "Espace Apprenant"
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isLinking}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isLinking ? 'Liaison en cours...' : "Lier l'apprenant"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowLinkForm(false);
                      setLearnerCode('');
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistiques */}
        {learners.length > 0 && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">{learners.length}</div>
                <p className="text-blue-600 text-sm">apprenant(s) lié(s)</p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : learners.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun apprenant lié</h3>
              <p className="text-gray-600 mb-6">
                Créez ou liez des apprenants à votre compte formateur
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Créer un apprenant
                </Button>
                <Button
                  onClick={() => setShowLinkForm(true)}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Link2 className="h-4 w-4" />
                  Lier un apprenant
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learners.map((learner) => (
              <Card key={learner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{learner.first_name || 'Apprenant'}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <Mail className="h-4 w-4" />
                    {learner.email?.includes('@example.com') ? 'Aucun' : learner.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-100 rounded font-mono text-sm text-center">
                      Code:{' '}
                      <span className="font-bold text-primary">
                        {learner.learner_code || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Inscrit le {new Date(learner.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlinkLearner(learner.id)}
                      className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Délier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

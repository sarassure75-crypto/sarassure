import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function TrainerProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [currentUser, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;
      setProfile({
        full_name: data?.full_name || '',
        email: data?.email || currentUser.email || '',
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name })
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      // Update email in auth if changed
      if (profile.email !== currentUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email,
        });
        if (emailError) throw emailError;
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    try {
      setUpdating(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Erreur lors de la mise à jour du mot de passe',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 rounded-t-lg">
            <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
            <p className="text-white/90">
              Gérez vos informations personnelles et vos paramètres de sécurité
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Alertes Messages */}
            {message.text && (
              <Alert
                className={
                  message.type === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }
              >
                {message.type === 'error' ? (
                  <AlertCircle
                    className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}
                  />
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

            {/* Information Personnelle */}
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>Modifiez votre nom et votre adresse email</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Un lien de confirmation sera envoyé si vous changez d'email
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {updating ? 'Mise à jour...' : 'Enregistrer les modifications'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sécurité - Mot de passe */}
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez votre mot de passe</CardDescription>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full border-primary text-primary hover:bg-primary/10"
                  >
                    Changer le mot de passe
                  </Button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="Minimum 6 caractères"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        placeholder="Confirmez le mot de passe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {updating ? 'Mise à jour...' : 'Mettre à jour'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Session */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Session</CardTitle>
                <CardDescription className="text-red-800">
                  Gérez votre session actuelle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={logout} className="w-full">
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

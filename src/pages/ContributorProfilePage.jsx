import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function ContributorProfilePage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    pseudonym: '',
    paypal_email: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Charger les données du profil
  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  const loadProfileData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, pseudonym, paypal_email')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;

      setProfileData({
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        email: data?.email || currentUser.email || '',
        pseudonym: data?.pseudonym || '',
        paypal_email: data?.paypal_email || '',
      });
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement du profil',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfileChanges = async () => {
    if (!currentUser) return;

    // Validation
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Les mots de passe ne correspondent pas',
      });
      return;
    }

    try {
      setSaving(true);

      // 1. Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          pseudonym: profileData.pseudonym,
          paypal_email: profileData.paypal_email,
        })
        .eq('id', currentUser.id);

      if (profileError) throw profileError;

      // 2. Changer l'email si modifié
      if (profileData.email !== currentUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email,
        });
        if (emailError) throw emailError;
      }

      // 3. Changer le mot de passe si fourni
      if (passwords.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: passwords.newPassword,
        });
        if (passwordError) throw passwordError;

        // Réinitialiser les champs de mot de passe
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }

      setMessage({
        type: 'success',
        text: '✅ Profil mis à jour avec succès',
      });

      // Recharger les données après quelques secondes
      setTimeout(loadProfileData, 1500);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setMessage({
        type: 'error',
        text: `❌ Erreur: ${error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil Contributeur</h1>

      {/* Message d'état */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Section Informations Personnelles */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations Personnelles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
            <input
              type="text"
              name="first_name"
              value={profileData.first_name}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre prénom"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input
              type="text"
              name="last_name"
              value={profileData.last_name}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom"
            />
          </div>

          {/* Pseudo (Pseudonyme) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pseudo / Nom d'Utilisateur
            </label>
            <input
              type="text"
              name="pseudonym"
              value={profileData.pseudonym}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre pseudo (visible publiquement)"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre email"
            />
          </div>

          {/* Email PayPal */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email PayPal (pour les paiements)
            </label>
            <input
              type="email"
              name="paypal_email"
              value={profileData.paypal_email}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre-email@paypal.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cet email sera utilisé pour recevoir vos paiements via PayPal
            </p>
          </div>
        </div>
      </div>

      {/* Section Sécurité */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sécurité</h2>

        <div className="space-y-6">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel (optionnel)
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Entrez votre mot de passe actuel"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe (optionnel)
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Entrez un nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    new: !prev.new,
                  }))
                }
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Confirmez le nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-4">
        <button
          onClick={saveProfileChanges}
          disabled={saving}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
        </button>
        <button
          onClick={loadProfileData}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

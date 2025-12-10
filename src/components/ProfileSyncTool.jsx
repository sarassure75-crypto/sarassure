import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { USER_ROLES } from '@/data/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Database, User, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ProfileSyncTool() {
  const { currentUser, refetchUser } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fixing, setFixing] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleSync = async () => {
    setSyncing(true);
    try {
      await refetchUser();
      toast({
        title: "✅ Profil synchronisé",
        description: "Les données ont été rechargées",
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!currentUser) {
      toast({
        title: "❌ Erreur",
        description: "Aucun utilisateur connecté",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Utilisateur non trouvé");

      // Déterminer le rôle basé sur l'email
      let role = USER_ROLES.LEARNER;
      let firstName = 'Utilisateur';
      let lastName = 'Nouveau';

      if (user.email.includes('admin')) {
        role = USER_ROLES.ADMIN;
        firstName = 'Admin';
        lastName = 'SARASSURE';
      } else if (user.email.includes('formateur') || user.email.includes('trainer')) {
        role = USER_ROLES.TRAINER;
        firstName = 'Formateur';
      } else if (user.email.includes('contributeur') || user.email.includes('contributor')) {
        role = USER_ROLES.CONTRIBUTOR;
        firstName = 'Contributeur';
      }

      console.log('Creating profile with role:', role);

      // Créer ou mettre à jour le profil
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: role,
          first_name: firstName,
          last_name: lastName,
        }, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: "✅ Profil créé",
        description: `Profil ${role} créé avec succès`,
      });

      // Recharger
      setTimeout(() => refetchUser(), 500);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleFixRole = async () => {
    if (!currentUser) return;

    setFixing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non trouvé");

      // Déterminer le bon rôle
      let correctRole = USER_ROLES.LEARNER;
      if (user.email.includes('admin')) correctRole = USER_ROLES.ADMIN;
      else if (user.email.includes('formateur')) correctRole = USER_ROLES.TRAINER;
      else if (user.email.includes('contributeur')) correctRole = USER_ROLES.CONTRIBUTOR;

      console.log('Fixing role to:', correctRole);

      const { error } = await supabase
        .from('profiles')
        .update({ role: correctRole })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "✅ Rôle corrigé",
        description: `Rôle mis à jour: ${correctRole}`,
      });

      setTimeout(() => refetchUser(), 500);
    } catch (error) {
      console.error('Error fixing role:', error);
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  const needsProfile = currentUser && currentUser.role === 'authenticated';
  const wrongRole = currentUser && currentUser.role && !Object.values(USER_ROLES).includes(currentUser.role);

  return (
    <div className="fixed bottom-20 left-4 z-[9999] max-w-xs">
      <Card className="bg-blue-900/95 text-white border-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Profile Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`w-3 h-3 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync Profile
          </Button>
          
          {needsProfile && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full text-xs"
              onClick={handleCreateProfile}
              disabled={creating}
            >
              <User className={`w-3 h-3 mr-2 ${creating ? 'animate-pulse' : ''}`} />
              Create Profile
            </Button>
          )}

          {(wrongRole || currentUser?.role === 'contributor') && (
            <Button
              size="sm"
              className="w-full text-xs bg-orange-600 hover:bg-orange-700"
              onClick={handleFixRole}
              disabled={fixing}
            >
              <Shield className={`w-3 h-3 mr-2 ${fixing ? 'animate-pulse' : ''}`} />
              Fix Role
            </Button>
          )}
          
          {needsProfile && (
            <p className="text-xs text-yellow-300 mt-2">
              ⚠️ Profil manquant dans la DB
            </p>
          )}
          {wrongRole && (
            <p className="text-xs text-orange-300 mt-2">
              ⚠️ Rôle incorrect: {currentUser.role}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

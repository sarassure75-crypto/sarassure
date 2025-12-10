import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserById } from '@/data/users';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user) => {
    if (!user) {
        setCurrentUser(null);
        return;
    }
    try {
      const profile = await getUserById(user.id);
      const userWithProfile = profile ? { ...user, ...profile } : user;
      setCurrentUser(userWithProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await fetchProfile(session?.user);
      setLoading(false);
    });

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetchProfile(session?.user);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const loginWithLearnerCode = async (learnerCode) => {
    console.log('🔍 Recherche du code apprenant:', learnerCode);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, learner_code, role')
      .eq('learner_code', learnerCode)
      .single();

    console.log('📊 Résultat recherche profile:', { profile, profileError });

    if (profileError || !profile) {
      console.error('❌ Code non trouvé dans la table profiles');
      throw new Error("Code apprenant invalide.");
    }

    console.log('✅ Profile trouvé, tentative de connexion avec:', profile.email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: learnerCode,
    });

    console.log('🔐 Résultat connexion:', { data: data?.user?.email, error });

    if (error) {
      console.error("❌ Échec connexion:", error.message);
      throw new Error("La connexion a échoué. Veuillez vérifier votre code et réessayer.");
    }

    return data;
  };
  
  const refetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchProfile(user);
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    setCurrentUser(null); // Nettoyer immédiatement l'état
    await supabase.auth.signOut();
  }, []);

  const isAuthenticated = Boolean(currentUser && currentUser.id);

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    logout,
    register: (email, password, metadata) => supabase.auth.signUp({ email, password, options: { data: metadata } }),
    loginWithLearnerCode,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
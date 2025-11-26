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
      console.error("Error fetching profile on auth state change:", error);
      setCurrentUser(user); // Fallback to session user if profile fetch fails
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
  }, []); // Retirer la dépendance fetchProfile pour éviter les re-renders inutiles

  const loginWithLearnerCode = async (learnerCode) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('learner_code', learnerCode)
      .single();

    if (profileError || !profile) {
      throw new Error("Code apprenant invalide.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: learnerCode,
    });

    if (error) {
      console.error("Learner login failed:", error.message);
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

  const value = {
    currentUser,
    loading,
    login: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    logout: () => supabase.auth.signOut(),
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
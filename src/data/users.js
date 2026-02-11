import { supabase } from '@/lib/supabaseClient';

export const USER_ROLES = {
  ADMIN: 'administrateur',
  TRAINER: 'formateur',
  LEARNER: 'apprenant',
  CONTRIBUTOR: 'contributor',
};    export const fetchAllUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*', { head: false, count: 'exact' })
        .order('first_name', { foreignTable: undefined })
        .headers({ Accept: 'application/json' });
      if (error) throw error;
      return data;
    };
    
    export const getAllUsersByRole = async (role) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*', { head: false, count: 'exact' })
          .eq('role', role)
          .order('first_name', { foreignTable: undefined })
          .headers({ Accept: 'application/json' });
        if (error) throw error;
        return data;
    };

    export const getUserById = async (userId) => {
      try {
        // Utiliser la function Supabase secure (avec RLS + search_path)
        const { data, error } = await supabase
          .rpc('get_user_profile', { input_user_id: userId });
        if (error) {
          console.error('Error fetching profile via RPC:', error);
          // Fallback: essayer l'accès direct si la function échoue
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .select('*', { head: false, count: 'exact' })
            .eq('id', userId)
            .maybeSingle()
            .headers({ Accept: 'application/json' });
          if (fallbackError && fallbackError.code !== 'PGRST116') {
            throw fallbackError;
          }
          return fallbackData;
        }
        return data && data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error('getUserById error:', error);
        return null;
      }
    };

    export const getLearnersByTrainer = async (trainerId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*', { head: false, count: 'exact' })
        .eq('assigned_trainer_id', trainerId)
        .eq('role', USER_ROLES.LEARNER)
        .headers({ Accept: 'application/json' });
      if (error) throw error;
      return data;
    };

    export const getUnassignedLearners = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*', { head: false, count: 'exact' })
        .is('assigned_trainer_id', null)
        .eq('role', USER_ROLES.LEARNER)
        .headers({ Accept: 'application/json' });
      if (error) throw error;
      return data;
    };

    export const assignTrainerToLearner = async (learnerId, trainerId) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ assigned_trainer_id: trainerId })
        .eq('id', learnerId)
        .select()
        .maybeSingle()
        .headers({ Accept: 'application/json' });
      if (error) throw error;
      return data;
    };

    export const unassignTrainerFromLearner = async (learnerId) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ assigned_trainer_id: null })
        .eq('id', learnerId)
        .select()
        .maybeSingle()
        .headers({ Accept: 'application/json' });
      if (error) throw error;
      return data;
    };

    export const getLearnerByCode = async (code) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*', { head: false, count: 'exact' })
          .eq('learner_code', code)
          .eq('role', USER_ROLES.LEARNER)
          .maybeSingle()
          .headers({ Accept: 'application/json' });
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    };

    export const getTrainerByPseudoAndCode = async (pseudo, code) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, pseudo', { head: false, count: 'exact' })
          .eq('pseudo', pseudo)
          .eq('trainer_code', code)
          .eq('role', USER_ROLES.TRAINER)
          .maybeSingle()
          .headers({ Accept: 'application/json' });
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    };

    export const updateUser = async (userId, updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle()
        .headers({ Accept: 'application/json' });
      if (error) throw error;
      return data;
    };

    export const deleteUser = async (userId) => {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });

      if (error) {
        console.error('Error invoking delete-user function:', error);
        throw new Error(`La suppression a échoué: ${error.message}`);
      }
      
      if (data.error) {
         console.error('Error from delete-user function:', data.error);
         throw new Error(`La suppression a échoué: ${data.error}`);
      }

      return data;
    };
    
    export const createLearner = async (firstName) => {
        const tempEmail = `${Date.now()}-${firstName.replace(/\s+/g, '-')}@example.com`;
        const tempPassword = `temp-password-${Date.now()}`;

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: tempEmail,
            password: tempPassword,
            options: {
                data: {
                    first_name: firstName,
                    role: 'apprenant',
                }
            }
        });

        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error("La création de l'utilisateur a échoué.");

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, learner_code')
          .eq('id', signUpData.user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;
        if (!profile || !profile.learner_code) throw new Error("Impossible de récupérer le code apprenant après la création.");

        const { error: updateError } = await supabase.functions.invoke('update-user-password', {
            body: { userId: signUpData.user.id, password: profile.learner_code },
        });

        if (updateError) {
            console.error("Failed to update password to learner_code:", updateError);
        }

        const { data: fullProfile, error: fullProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signUpData.user.id)
            .single();
        if (fullProfileError) throw fullProfileError;

        return fullProfile;
    };

    export const createTrainer = async (firstName, pseudo) => {
        const { data, error } = await supabase.auth.signUp({
            email: `${Date.now()}-${pseudo}@example.com`,
            password: `password-${Date.now()}`,
            options: {
                data: {
                    first_name: firstName,
                    pseudo: pseudo,
                    role: 'formateur',
                }
            }
        });
        if (error) throw error;
        if (!data.user) throw new Error("La création du formateur a échoué.");

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;

        return profile;
    };

    export const getTrainers = async () => {
        return getAllUsersByRole(USER_ROLES.TRAINER);
    };
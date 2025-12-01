import { supabase } from '@/lib/supabaseClient';

export const getProgressForVersion = async (userId, versionId) => {
  if (!userId || !versionId) return null;
  try {
    const { data, error } = await supabase
      .from('user_version_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('version_id', versionId)
      .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error here
        throw error;
    }
    return data;
  } catch(error) {
    console.error("Error fetching progress for version:", error);
    return null;
  }
}
// Alias pour compatibilité avec les imports existants
export const getProgress = getProgressForVersion;

export const getAllProgressForUser = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('user_version_progress')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching all progress for user:", error);
    return [];
  }
}

export const fetchUserProgressDetails = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .rpc('get_user_progress_details', { p_user_id: userId });

    if (error) {
      console.error('Error fetching user progress details:', error);
      throw error;
    }
    return data;
  } catch (error) {
    return [];
  }
};


export const recordCompletion = async (userId, versionId, timeTakenInSeconds) => {
  if (!userId || !versionId) return { error: 'Missing userId or versionId' };

  const existingProgress = await getProgressForVersion(userId, versionId);

  let newProgressData = {};
  const completionEvent = { time: new Date().toISOString(), duration: timeTakenInSeconds };

  if (existingProgress) {
    newProgressData = {
      user_id: userId,
      version_id: versionId,
      attempts: (existingProgress.attempts || 0) + 1,
      last_time_seconds: timeTakenInSeconds,
      best_time_seconds: Math.min(existingProgress.best_time_seconds || Infinity, timeTakenInSeconds),
      completed_steps_history: [...(existingProgress.completed_steps_history || []), completionEvent]
    };
  } else {
    newProgressData = {
      user_id: userId,
      version_id: versionId,
      attempts: 1,
      first_time_seconds: timeTakenInSeconds,
      last_time_seconds: timeTakenInSeconds,
      best_time_seconds: timeTakenInSeconds,
      completed_steps_history: [completionEvent]
    };
  }
  
  try {
     const { data, error } = await supabase
       .from('user_version_progress')
       .upsert(newProgressData, {
         onConflict: 'user_id,version_id'
       })
       .select()
       .single();
       
    if (error) {
      console.error("recordCompletion - upsert error:", error);
      return { error };
    }
    // return inserted/updated row to caller so UI can react
    return { data };
  } catch (error) {
    console.error("Error recording completion:", error);
    return { error };
  }
};

export const calculateProgressFactor = (firstTime, bestTime) => {
  if (firstTime && bestTime && bestTime > 0 && firstTime > 0) {
    const factor = firstTime / bestTime;
    return `${factor.toFixed(1)}x`;
  }
  return '-';
};

export const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
};
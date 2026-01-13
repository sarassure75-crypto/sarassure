import { logger } from '@/lib/logger';
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * useConfidence - Hook pour gérer la confiance des apprenants avant/après exercices
 */
export function useConfidence() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupérer la confiance actuelle d'un apprenant pour une version
   */
  const fetchConfidence = useCallback(async (userId, versionId) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_exercise_confidence')
        .select('confidence_before, confidence_after, created_at, updated_at')
        .eq('user_id', userId)
        .eq('version_id', versionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      logger.error('Error fetching confidence:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Enregistrer la confiance AVANT l'exercice
   */
  const recordConfidenceBefore = useCallback(async (userId, versionId, confidenceLevel) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: upsertError } = await supabase
        .from('user_exercise_confidence')
        .upsert(
          {
            user_id: userId,
            version_id: versionId,
            confidence_before: confidenceLevel,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id, version_id' }
        )
        .select()
        .single();

      if (upsertError) throw upsertError;

      logger.log('✅ Confidence before recorded:', data);
      return data;
    } catch (err) {
      logger.error('Error recording confidence before:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Enregistrer la confiance APRÈS l'exercice
   */
  const recordConfidenceAfter = useCallback(async (userId, versionId, confidenceLevel) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: upsertError } = await supabase
        .from('user_exercise_confidence')
        .upsert(
          {
            user_id: userId,
            version_id: versionId,
            confidence_after: confidenceLevel,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id, version_id' }
        )
        .select()
        .single();

      if (upsertError) throw upsertError;

      logger.log('✅ Confidence after recorded:', data);
      return data;
    } catch (err) {
      logger.error('Error recording confidence after:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupérer l'historique de confiance d'un apprenant
   * Retourne: { version_id, task_title, confidence_before, confidence_after, progress }
   */
  const fetchConfidenceHistory = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_exercise_confidence')
        .select(`
          id,
          version_id,
          confidence_before,
          confidence_after,
          created_at,
          updated_at,
          versions(id, name, task_id, tasks(id, title))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Mapper les données et calculer la progression
      const history = data.map(item => ({
        id: item.id,
        versionId: item.version_id,
        versionName: item.versions?.name,
        taskId: item.versions?.tasks?.id,
        taskTitle: item.versions?.tasks?.title,
        confidenceBefore: item.confidence_before,
        confidenceAfter: item.confidence_after,
        progress: item.confidence_after && item.confidence_before 
          ? item.confidence_after - item.confidence_before 
          : null,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      return history;
    } catch (err) {
      logger.error('Error fetching confidence history:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculer les statistiques de confiance
   * Retourne: { totalExercises, averageProgression, improvementCount, stableCount }
   */
  const calculateConfidenceStats = useCallback((history) => {
    if (!history || history.length === 0) {
      return {
        totalExercises: 0,
        averageProgression: 0,
        improvementCount: 0,
        stableCount: 0,
        declineCount: 0
      };
    }

    const completedExercises = history.filter(h => h.confidenceBefore && h.confidenceAfter);
    const totalExercises = completedExercises.length;
    
    if (totalExercises === 0) {
      return {
        totalExercises: 0,
        averageProgression: 0,
        improvementCount: 0,
        stableCount: 0,
        declineCount: 0
      };
    }

    const progressions = completedExercises.map(h => h.progress).filter(p => p !== null);
    const averageProgression = progressions.length > 0
      ? (progressions.reduce((a, b) => a + b, 0) / progressions.length).toFixed(2)
      : 0;

    const improvementCount = completedExercises.filter(h => h.progress > 0).length;
    const stableCount = completedExercises.filter(h => h.progress === 0).length;
    const declineCount = completedExercises.filter(h => h.progress < 0).length;

    return {
      totalExercises,
      averageProgression: parseFloat(averageProgression),
      improvementCount,
      stableCount,
      declineCount
    };
  }, []);

  return {
    loading,
    error,
    fetchConfidence,
    recordConfidenceBefore,
    recordConfidenceAfter,
    fetchConfidenceHistory,
    calculateConfidenceStats
  };
}

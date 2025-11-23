import { supabase } from '@/lib/supabaseClient';

    /**
     * Récupère les autorisations de visibilité pour un apprenant spécifique.
     * La logique est inversée : par défaut, tout est visible. La table stocke les exceptions (is_visible = false).
     * @param {string} learnerId - L'ID de l'apprenant.
     * @returns {Promise<Map<string, boolean>>} Une Map où la clé est "task_id-version_id" et la valeur est un booléen (is_visible).
     */
    export const fetchVisibilityForLearner = async (learnerId) => {
      if (!learnerId) return new Map();

      const { data, error } = await supabase
        .from('learner_visibility')
        .select('task_id, version_id, is_visible')
        .eq('learner_id', learnerId);

      if (error) {
        console.error('Erreur lors de la récupération des paramètres de visibilité :', error);
        throw error;
      }

      const visibilityMap = new Map();
      if (data) {
        data.forEach(item => {
          if (item.task_id && item.version_id) {
            const key = `${item.task_id}-${item.version_id}`;
            visibilityMap.set(key, item.is_visible);
          }
        });
      }

      return visibilityMap;
    };

    /**
     * Définit l'autorisation de visibilité pour une version et un apprenant donnés.
     * Si 'isVisible' est true (le défaut), la ligne est supprimée de la table d'exceptions.
     * Si 'isVisible' est false, la ligne est ajoutée ou mise à jour.
     * @param {string} learnerId - L'ID de l'apprenant.
     * @param {string} taskId - L'ID de la tâche.
     * @param {string} versionId - L'ID de la version.
     * @param {boolean} isVisible - La nouvelle valeur de visibilité.
     */
    export const setVisibilityForLearner = async (learnerId, taskId, versionId, isVisible) => {
      if (!learnerId || !taskId || !versionId) {
        throw new Error('Les IDs de l\'apprenant, de la tâche et de la version sont requis.');
      }

      // Si l'exercice doit être visible (état par défaut), on supprime l'exception.
      if (isVisible) {
        const { error } = await supabase
          .from('learner_visibility')
          .delete()
          .match({
            learner_id: learnerId,
            task_id: taskId,
            version_id: versionId,
          });
        
        if (error) {
          console.error('Erreur lors de la suppression de l\'exception de visibilité :', error);
          throw error;
        }
      } else {
        // Sinon, on insère ou met à jour l'exception pour cacher l'exercice.
        const { error } = await supabase
          .from('learner_visibility')
          .upsert(
            {
              learner_id: learnerId,
              task_id: taskId,
              version_id: versionId,
              is_visible: false, // On stocke uniquement les 'false'.
            },
            {
              onConflict: 'learner_id, task_id, version_id',
              ignoreDuplicates: false,
            }
          );
        
        if (error) {
          console.error('Erreur lors de la définition de la visibilité :', error);
          throw error;
        }
      }

      return { success: true };
    };
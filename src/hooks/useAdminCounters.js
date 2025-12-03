import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook pour compter les items en attente (validation)
 */
export function useAdminCounters() {
  const [counters, setCounters] = useState({
    pendingImages: 0,
    pendingContributions: 0,
    pendingQuestionnaires: 0,
    pendingMessages: 0,
    pendingFaq: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounters();
    
    // Rafraîchir tous les 5 secondes
    const interval = setInterval(fetchCounters, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCounters = async () => {
    try {
      // Compter les images en attente de modération
      // Utiliser SELECT au lieu de HEAD pour éviter les problèmes RLS
      const { data: pendingImagesData, error: imagesError } = await supabase
        .from('images_metadata')
        .select('id')
        .eq('moderation_status', 'pending');

      if (imagesError) {
        console.warn('Erreur images_metadata:', imagesError.message);
      }

      // Compter les exercices (tasks/versions) en attente de validation
      const { data: versionsData, error: versionsError } = await supabase
        .from('versions')
        .select('id, steps(id, instruction)')
        .eq('creation_status', 'pending');
      
      if (versionsError) {
        console.warn('Erreur versions:', versionsError.message);
      }

      // Séparer exercices et questionnaires
      // Les questionnaires ont des instructions spécifiques (questions)
      // Les exercices ont des instructions d'action (action_type)
      // Pour simplifier: compter tous comme exercices et questionnnaires = 0
      const exercisesCount = versionsData?.length || 0;
      const questionnairesCount = 0;

      // Compter les messages de contact non lus
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('id')
        .eq('is_read', false);

      if (messagesError) {
        console.warn('Erreur contact_messages:', messagesError.message);
      }

      // Compter tous les items FAQ
      const { data: faqData, error: faqError } = await supabase
        .from('faq_items')
        .select('id');

      if (faqError) {
        console.warn('Erreur faq_items:', faqError.message);
      }

      setCounters({
        pendingImages: pendingImagesData?.length || 0,
        pendingContributions: exercisesCount,
        pendingQuestionnaires: questionnairesCount,
        pendingMessages: messagesData?.length || 0,
        pendingFaq: faqData?.length || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des compteurs:', error);
      // Ne pas bloquer l'interface si les compteurs échouent
      setCounters({
        pendingImages: 0,
        pendingContributions: 0,
        pendingQuestionnaires: 0,
        pendingMessages: 0,
        pendingFaq: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return { counters, loading, refresh: fetchCounters };
}

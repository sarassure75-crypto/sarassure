import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/lib/logger';

/**
 * Envoie un message de contact via une fonction RPC
 * Cette approche contourne les problèmes de RLS en utilisant une fonction côté serveur
 * @param {Object} messageData - Les données du message
 * @param {string} messageData.name - Nom de l'expéditeur
 * @param {string} messageData.email - Email de l'expéditeur
 * @param {string} messageData.subject - Sujet du message
 * @param {string} messageData.message - Contenu du message
 * @returns {Promise<Object>}
 */
export const sendContactMessage = async ({ name, email, subject, message }) => {
  try {
    logger.log('📤 Envoi du message de contact:', { name, email });

    // Utiliser la fonction RPC pour insérer le message
    const { data, error } = await supabase.rpc('insert_contact_message', {
      p_name: name,
      p_email: email,
      p_subject: subject || null,
      p_message: message,
    });

    if (error) {
      logger.error('❌ Erreur RPC Supabase:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // Message d'erreur plus spécifique
      if (error.code === '42501') {
        throw new Error("Permission refusée. La fonction RPC n'est pas accessible.");
      }

      throw new Error(error.message || "Erreur lors de l'envoi du message");
    }

    logger.log('✅ Message envoyé avec succès:', data);
    return data?.[0] || data;
  } catch (err) {
    logger.error("❌ Erreur lors de l'envoi du message:", err);
    throw err;
  }
};

/**
 * Récupère tous les messages de contact (Admin only)
 * @param {boolean} unreadOnly - Si true, ne récupère que les messages non lus
 * @returns {Promise<Array>}
 */
export const getContactMessages = async (unreadOnly = false) => {
  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Erreur lors de la récupération des messages:', error);
    throw error;
  }

  return data || [];
};

/**
 * Marque un message comme lu
 * @param {string} messageId - L'ID du message
 * @returns {Promise<void>}
 */
export const markMessageAsRead = async (messageId) => {
  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', messageId);

  if (error) {
    logger.error('Erreur lors du marquage du message:', error);
    throw error;
  }
};

/**
 * Marque un message comme répondu
 * @param {string} messageId - L'ID du message
 * @returns {Promise<void>}
 */
export const markMessageAsReplied = async (messageId) => {
  const { error } = await supabase
    .from('contact_messages')
    .update({ replied: true, is_read: true })
    .eq('id', messageId);

  if (error) {
    logger.error('Erreur lors du marquage de la réponse:', error);
    throw error;
  }
};

/**
 * Supprime un message de contact
 * @param {string} messageId - L'ID du message
 * @returns {Promise<void>}
 */
export const deleteContactMessage = async (messageId) => {
  const { error } = await supabase.from('contact_messages').delete().eq('id', messageId);

  if (error) {
    logger.error('Erreur lors de la suppression du message:', error);
    throw error;
  }
};

/**
 * Compte les messages non lus
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
  const { count, error } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact' })
    .eq('is_read', false);

  if (error) {
    console.error('Erreur lors du comptage des messages non lus:', error);
    return 0;
  }

  return count || 0;
};

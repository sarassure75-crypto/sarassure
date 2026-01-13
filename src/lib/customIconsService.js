/**
 * Service de gestion des icônes personnalisées
 * Stocke et récupère les icônes préférées et collections
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Créer une table pour les icônes personnalisées (si nécessaire)
 * Cette fonction est appelée une seule fois pour initialiser la structure
 */
export const initializeCustomIconsTable = async () => {
  try {
    // Vérifier si la table existe déjà
    const { error } = await supabase
      .from('custom_icon_collections')
      .select('id')
      .limit(1);

    if (error?.code === 'PGRST116') {
      // La table n'existe pas, créer la structure (via migration)
      console.log('Table custom_icon_collections n\'existe pas. Migration requise.');
      return false;
    }

    console.log('Table custom_icon_collections prête.');
    return true;
  } catch (error) {
    console.error('Erreur vérification table:', error);
    return false;
  }
};

/**
 * Ajouter une icône à une collection personnalisée
 */
export const addIconToCollection = async (collectionId, iconData) => {
  try {
    const { data, error } = await supabase
      .from('custom_icon_collections')
      .insert([
        {
          collection_id: collectionId,
          library_id: iconData.libraryId,
          icon_name: iconData.iconName,
          display_name: iconData.displayName,
          category: iconData.category,
          notes: iconData.notes,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Erreur ajout icône:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

/**
 * Récupérer une collection personnalisée
 */
export const getCollection = async (collectionId) => {
  try {
    const { data, error } = await supabase
      .from('custom_icon_collections')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération collection:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};

/**
 * Supprimer une icône d'une collection
 */
export const removeIconFromCollection = async (iconId) => {
  try {
    const { error } = await supabase
      .from('custom_icon_collections')
      .delete()
      .eq('id', iconId);

    if (error) {
      console.error('Erreur suppression icône:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
};

/**
 * Créer une nouvelle collection personnalisée
 */
export const createCollection = async (userId, collectionName, description) => {
  try {
    const { data, error } = await supabase
      .from('icon_collections')
      .insert([
        {
          user_id: userId,
          name: collectionName,
          description: description,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Erreur création collection:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

/**
 * Récupérer les collections de l'utilisateur
 */
export const getUserCollections = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('icon_collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération collections:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};

/**
 * Exporter une collection en JSON
 */
export const exportCollection = (collection, collectionName = 'icons-export') => {
  const dataStr = JSON.stringify(collection, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${collectionName}.json`;
  link.click();
};

/**
 * Importer une collection depuis JSON
 */
export const importCollection = async (file, collectionId) => {
  try {
    const text = await file.text();
    const icons = JSON.parse(text);

    if (!Array.isArray(icons)) {
      throw new Error('Le fichier doit contenir un tableau d\'icônes');
    }

    // Insérer les icônes dans la collection
    const { data, error } = await supabase
      .from('custom_icon_collections')
      .insert(
        icons.map(icon => ({
          collection_id: collectionId,
          library_id: icon.libraryId,
          icon_name: icon.iconName,
          display_name: icon.displayName,
          category: icon.category,
          notes: icon.notes,
          created_at: new Date().toISOString(),
        }))
      )
      .select();

    if (error) {
      console.error('Erreur import:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

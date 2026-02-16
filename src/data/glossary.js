/**
 * Glossaire/Lexique - Gestion des termes et définitions
 * Utilisé pour montrer des définitions aux apprenants lors des exercices
 */

import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/lib/logger';

/**
 * Récupérer tous les termes du lexique actifs
import { logger } from '@/lib/logger';
 */
export const getAllGlossaryTerms = async () => {
  try {
    const { data, error } = await supabase
      .from('glossary')
      .select('id, term, definition, example, category, related_terms, is_active, variants')
      .eq('is_active', true)
      .order('term', { ascending: true });

    if (error) throw error;

    // Debug: vérifier les variantes chargées
    if (data && data.length > 0) {
      logger.log(
        'Termes chargés avec variantes:',
        data.map((t) => ({ term: t.term, variants: t.variants }))
      );
    }

    return data || [];
  } catch (error) {
    logger.error('Error fetching glossary terms:', error);
    throw error;
  }
};

/**
 * Rechercher un terme spécifique
 */
export const getGlossaryTerm = async (term) => {
  try {
    const { data, error } = await supabase
      .from('glossary')
      .select('*')
      .eq('term', term)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  } catch (error) {
    logger.error('Error fetching glossary term:', error);
    throw error;
  }
};

/**
 * Rechercher les termes par catégorie
 */
export const getGlossaryTermsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('glossary')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('term', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching glossary terms by category:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les catégories du lexique
 */
export const getGlossaryCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('glossary')
      .select('category')
      .eq('is_active', true)
      .neq('category', null);

    if (error) throw error;

    // Extraire les catégories uniques
    const categories = [...new Set(data.map((item) => item.category))].sort();
    return categories;
  } catch (error) {
    logger.error('Error fetching glossary categories:', error);
    throw error;
  }
};

/**
 * Créer un nouveau terme (admin seulement)
 */
export const createGlossaryTerm = async (
  term,
  definition,
  category,
  example = null,
  relatedTerms = []
) => {
  try {
    const { data, error } = await supabase
      .from('glossary')
      .insert([
        {
          term: term.trim(),
          definition: definition.trim(),
          category: category.trim(),
          example: example ? example.trim() : null,
          related_terms: relatedTerms,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    logger.log('Glossary term created:', data.term);
    return data;
  } catch (error) {
    logger.error('Error creating glossary term:', error);
    throw error;
  }
};

/**
 * Mettre à jour un terme (admin seulement)
 */
export const updateGlossaryTerm = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('glossary')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    logger.log('Glossary term updated:', data.term);
    return data;
  } catch (error) {
    logger.error('Error updating glossary term:', error);
    throw error;
  }
};

/**
 * Supprimer un terme (soft delete - marquer comme inactif)
 */
export const deleteGlossaryTerm = async (id) => {
  try {
    const { data, error } = await supabase
      .from('glossary')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    logger.log('Glossary term deleted:', data.term);
    return data;
  } catch (error) {
    logger.error('Error deleting glossary term:', error);
    throw error;
  }
};

/**
 * Récupérer les termes associés à un terme donné
 */
export const getRelatedTerms = async (relatedTermNames) => {
  try {
    if (!relatedTermNames || relatedTermNames.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('glossary')
      .select('term, definition')
      .in('term', relatedTermNames)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching related terms:', error);
    throw error;
  }
};

/**
 * Rechercher les termes du lexique qui correspondent au texte donné
 * Utile pour identifier les mots clés dans une instruction
 */
export const findGlossaryWordsInText = async (text) => {
  try {
    if (!text || text.length === 0) {
      return [];
    }

    const words = text.toLowerCase().split(/\s+/);
    const { data, error } = await supabase
      .from('glossary')
      .select('id, term, definition')
      .eq('is_active', true);

    if (error) throw error;

    // Filtrer les termes qui apparaissent dans le texte
    const foundTerms = (data || []).filter((glossaryItem) => {
      const glossaryTerm = glossaryItem.term.toLowerCase();
      return words.some((word) => word.includes(glossaryTerm) || glossaryTerm.includes(word));
    });

    return foundTerms;
  } catch (error) {
    logger.error('Error finding glossary words in text:', error);
    return [];
  }
};

/**
 * Obtenir les statistiques du lexique (admin)
 */
export const getGlossaryStats = async () => {
  try {
    const { data: allData, error: allError } = await supabase.from('glossary').select('id');

    const { data: activeData, error: activeError } = await supabase
      .from('glossary')
      .select('id')
      .eq('is_active', true);

    const { data: categoryData, error: categoryError } = await supabase
      .from('glossary')
      .select('category')
      .eq('is_active', true);

    const { data: variantData, error: variantError } = await supabase
      .from('glossary_variants')
      .select('id');

    if (allError || activeError || categoryError || variantError) {
      throw allError || activeError || categoryError || variantError;
    }

    const categories = [...new Set((categoryData || []).map((item) => item.category))];

    return {
      totalTerms: (allData || []).length,
      activeTerms: (activeData || []).length,
      inactiveTerms: (allData || []).length - (activeData || []).length,
      categories: categories,
      categoryCount: categories.length,
      totalVariants: (variantData || []).length,
    };
  } catch (error) {
    logger.error('Error fetching glossary stats:', error);
    throw error;
  }
};

/**
 * Obtenir les variantes d'un terme
 */
export const getTermVariants = async (glossaryId) => {
  try {
    const { data, error } = await supabase
      .from('glossary_variants')
      .select('variant_word')
      .eq('glossary_id', glossaryId)
      .order('variant_word', { ascending: true });

    if (error) throw error;
    return (data || []).map((item) => item.variant_word);
  } catch (error) {
    logger.error('Error fetching term variants:', error);
    return [];
  }
};

/**
 * Ajouter une variante à un terme
 */
export const addTermVariant = async (glossaryId, variant) => {
  try {
    const { data, error } = await supabase
      .from('glossary_variants')
      .insert([
        {
          glossary_id: glossaryId,
          variant_word: variant.trim().toLowerCase(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    logger.log('Term variant added:', variant);
    return data;
  } catch (error) {
    logger.error('Error adding term variant:', error);
    throw error;
  }
};

/**
 * Supprimer une variante
 */
export const deleteTermVariant = async (variantId) => {
  try {
    const { error } = await supabase.from('glossary_variants').delete().eq('id', variantId);

    if (error) throw error;
    logger.log('Term variant deleted');
    return true;
  } catch (error) {
    logger.error('Error deleting term variant:', error);
    throw error;
  }
};

/**
 * Rechercher un terme par variante
 * Utile pour trouver la définition d'une variante
 */
export const findGlossaryTermByVariant = async (variant) => {
  try {
    // D'abord chercher en exact
    let { data, error } = await supabase
      .from('glossary')
      .select('*')
      .eq('term', variant)
      .eq('is_active', true)
      .single();

    if (!error) return data;

    // Ensuite chercher dans les variantes
    const { data: variantData, error: variantError } = await supabase
      .from('glossary_variants')
      .select('glossary_id')
      .eq('variant_word', variant.toLowerCase())
      .single();

    if (variantError || !variantData) return null;

    // Récupérer le terme complet
    ({ data, error } = await supabase
      .from('glossary')
      .select('*')
      .eq('id', variantData.glossary_id)
      .eq('is_active', true)
      .single());

    if (error) throw error;
    return data || null;
  } catch (error) {
    logger.error('Error finding glossary term by variant:', error);
    return null;
  }
};

/**
 * Mettre à jour les variantes d'un terme (remplace complètement)
 */
export const updateTermVariants = async (glossaryId, variants) => {
  try {
    // D'abord supprimer les anciennes variantes
    await supabase.from('glossary_variants').delete().eq('glossary_id', glossaryId);

    // Puis insérer les nouvelles
    if (variants && variants.length > 0) {
      const { error } = await supabase.from('glossary_variants').insert(
        variants.map((variant) => ({
          glossary_id: glossaryId,
          variant_word: variant.trim().toLowerCase(),
        }))
      );

      if (error) throw error;
    }

    logger.log('Term variants updated');
    return true;
  } catch (error) {
    logger.error('Error updating term variants:', error);
    throw error;
  }
};

/**
 * Service de traduction pour les consignes et termes du lexique
 * Support multi-langue avec glossaire personnalisé et API de traduction automatique
 */

import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/lib/logger';

// Configuration des APIs de traduction
const TRANSLATION_CONFIG = {
  // Option 1: Google Translate (nécessite API key)
  google: {
    apiKey: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY,
    baseUrl: 'https://translation.googleapis.com/language/translate/v2'
  },
  // Option 2: LibreTranslate (open source, gratuit) - avec proxy CORS
  libre: {
    // Utiliser un serveur public avec support CORS
    baseUrl: 'https://libretranslate.com/translate',
    // Alternative: 'https://libretranslate.de/translate' (peut avoir des limites)
  },
  // Option 3: MyMemory (gratuit, pas besoin de clé, support CORS)
  mymemory: {
    baseUrl: 'https://api.mymemory.translated.net/get'
  },
  // Option 4: DeepL (excellente qualité)
  deepl: {
    apiKey: import.meta.env.VITE_DEEPL_API_KEY,
    baseUrl: 'https://api-free.deepl.com/v1/translate'
  }
};

/**
 * Récupérer toutes les langues de traduction disponibles
 */
export const getAvailableLanguages = async () => {
  try {
    const { data, error } = await supabase
      .from('translation_settings')
      .select('*')
      .eq('is_active', true)
      .order('language_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching available languages:', error);
    throw error;
  }
};

/**
 * Récupérer les traductions du lexique pour une langue spécifique
 */
export const getGlossaryTranslations = async (languageCode) => {
  try {
    const { data, error } = await supabase
      .from('glossary_translations')
      .select(`
        id,
        translated_term,
        translated_definition,
        translated_example,
        glossary:glossary_id(id, term, category)
      `)
      .eq('language_code', languageCode);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching glossary translations:', error);
    throw error;
  }
};

/**
 * Traduire une instruction: COMPLÈTE traduction + termes du glossaire prioritaires
 */
export const translateInstruction = async (text, targetLanguage, glossaryTerms = null) => {
  try {
    if (!text || text.trim().length === 0) {
      return text;
    }

    // Si c'est du français (langue par défaut), ne pas traduire
    if (targetLanguage === 'fr') {
      return text;
    }

    // Étape 1: Récupérer les traductions du glossaire
    let glossaryTranslations = glossaryTerms;
    if (!glossaryTranslations) {
      glossaryTranslations = await getGlossaryTranslations(targetLanguage);
    }

    // Étape 2: Faire une traduction COMPLÈTE de la phrase
    let fullyTranslatedText = text;
    try {
      // Essayer de traduire la phrase entière
      fullyTranslatedText = await autoTranslateText(text, targetLanguage);
      logger.log(`Traduction complète de "${text}" en ${targetLanguage}: "${fullyTranslatedText}"`);
    } catch (autoError) {
      logger.warn('Auto-translation failed, continuing with glossary only:', autoError);
      // En cas d'erreur, on continuera avec le glossaire
    }

    // Étape 3: Remplacer les termes du glossaire par leurs traductions PERSONNALISÉES (prioritaires)
    // Cela assure que les termes du glossaire restent tels que l'admin les a définis
    if (glossaryTranslations && glossaryTranslations.length > 0) {
      glossaryTranslations.forEach(trans => {
        // Remplacer dans le texte traduit AUSSI (ne pas juste le texte original)
        // Chercher le terme original français
        const frenchTermRegex = new RegExp(`\\b${trans.glossary.term}\\b`, 'gi');
        fullyTranslatedText = fullyTranslatedText.replace(frenchTermRegex, trans.translated_term);
        
        // Aussi chercher la traduction auto du terme français (au cas où elle a été traduite autrement)
        try {
          // Si le traducteur a traduit différemment, on remplace aussi
          const autoTranslatedTerm = fullyTranslatedText.match(frenchTermRegex);
          if (!autoTranslatedTerm) {
            // Chercher une version traduite du terme français
            const termPattern = new RegExp(`\\b${trans.glossary.term}\\b`, 'gi');
            fullyTranslatedText = fullyTranslatedText.replace(termPattern, trans.translated_term);
          }
        } catch (e) {
          // Ignorer les erreurs de remplacement
        }
      });
    }

    return fullyTranslatedText;
  } catch (error) {
    logger.error('Error translating instruction:', error);
    return text; // Retourner le texte original en cas d'erreur
  }
};

/**
 * Traduire du texte en utilisant Google Translate API
 */
export const translateWithGoogle = async (text, targetLanguage) => {
  try {
    const apiKey = TRANSLATION_CONFIG.google.apiKey;
    if (!apiKey) {
      throw new Error('Google Translate API key not configured');
    }

    const response = await fetch(TRANSLATION_CONFIG.google.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        key: apiKey
      })
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    logger.error('Error with Google Translate:', error);
    throw error;
  }
};

/**
 * Traduire du texte en utilisant DeepL API (Recommandé pour meilleure qualité)
 */
export const translateWithDeepL = async (text, targetLanguage) => {
  try {
    const apiKey = TRANSLATION_CONFIG.deepl.apiKey;
    if (!apiKey) {
      throw new Error('DeepL API key not configured');
    }

    // Mapper les codes de langue
    const deepLLanguageMap = {
      'fr': 'FR',
      'en': 'EN-US',
      'es': 'ES',
      'de': 'DE',
      'it': 'IT',
      'pt': 'PT-BR',
      'nl': 'NL'
    };

    const targetLang = deepLLanguageMap[targetLanguage] || targetLanguage.toUpperCase();

    const response = await fetch(TRANSLATION_CONFIG.deepl.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang
      })
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    logger.error('Error with DeepL:', error);
    throw error;
  }
};

/**
 * Traduire du texte en utilisant MyMemory (gratuit, avec CORS)
 */
const translateWithMyMemory = async (text, targetLanguage) => {
  try {
    // Mapper les codes langue si nécessaire (MyMemory utilise codes ISO)
    const langMap = {
      'fr': 'fr', 'en': 'en', 'es': 'es', 'de': 'de', 
      'it': 'it', 'pt': 'pt', 'nl': 'nl'
    };
    const mappedLang = langMap[targetLanguage] || targetLanguage;
    
    // MyMemory utilise les paramètres de query
    const url = new URL(TRANSLATION_CONFIG.mymemory.baseUrl);
    url.searchParams.append('q', text);
    url.searchParams.append('langpair', `fr|${mappedLang}`);
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // MyMemory retourne dans translatedText
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('MyMemory returned no translation');
  } catch (error) {
    logger.error('Error with MyMemory:', error);
    throw error;
  }
};

/**
 * Traduire du texte en utilisant LibreTranslate (gratuit, open source)
 */
export const translateWithLibreTranslate = async (text, targetLanguage) => {
  try {
    const response = await fetch(TRANSLATION_CONFIG.libre.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    logger.error('Error with LibreTranslate:', error);
    throw error;
  }
};

/**
 * Fonction automatique de traduction (essaie plusieurs APIs)
 */
const autoTranslateText = async (text, targetLanguage) => {
  // Essayer DeepL d'abord (meilleure qualité)
  try {
    if (TRANSLATION_CONFIG.deepl.apiKey) {
      return await translateWithDeepL(text, targetLanguage);
    }
  } catch (error) {
    logger.warn('DeepL translation failed:', error);
  }

  // Essayer Google Translate
  try {
    if (TRANSLATION_CONFIG.google.apiKey) {
      return await translateWithGoogle(text, targetLanguage);
    }
  } catch (error) {
    logger.warn('Google Translate failed:', error);
  }

  // Essayer MyMemory (gratuit, avec support CORS)
  try {
    return await translateWithMyMemory(text, targetLanguage);
  } catch (error) {
    logger.warn('MyMemory translation failed:', error);
  }

  // Essayer LibreTranslate (gratuit, fallback)
  try {
    return await translateWithLibreTranslate(text, targetLanguage);
  } catch (error) {
    logger.warn('LibreTranslate failed:', error);
    throw error;
  }
};

/**
 * Vérifier si la traduction automatique est activée pour cette langue
 */
const shouldUseAutoTranslation = async (targetLanguage) => {
  try {
    const { data, error } = await supabase
      .from('translation_settings')
      .select('auto_translate')
      .eq('language_code', targetLanguage)
      .single();

    if (error) return false;
    return data?.auto_translate || false;
  } catch (error) {
    return false;
  }
};

/**
 * Fusionner les traductions du glossaire avec la traduction automatique
 */
const mergeTranslations = (original, autoTranslated, glossaryTranslations) => {
  // Priorité au glossaire personnalisé
  let result = autoTranslated;
  
  if (glossaryTranslations && glossaryTranslations.length > 0) {
    glossaryTranslations.forEach(trans => {
      const regex = new RegExp(`\\b${trans.glossary.term}\\b`, 'gi');
      result = result.replace(regex, trans.translated_term);
    });
  }

  return result;
};

/**
 * Créer une traduction pour un terme du lexique (admin)
 */
export const createGlossaryTranslation = async (glossaryId, languageCode, translatedTerm, translatedDefinition, translatedExample = null) => {
  try {
    const { data, error } = await supabase
      .from('glossary_translations')
      .insert([{
        glossary_id: glossaryId,
        language_code: languageCode,
        translated_term: translatedTerm.trim(),
        translated_definition: translatedDefinition.trim(),
        translated_example: translatedExample ? translatedExample.trim() : null
      }])
      .select()
      .single();

    if (error) throw error;
    logger.log('Glossary translation created:', data);
    return data;
  } catch (error) {
    logger.error('Error creating glossary translation:', error);
    throw error;
  }
};

/**
 * Mettre à jour une traduction
 */
export const updateGlossaryTranslation = async (translationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('glossary_translations')
      .update(updates)
      .eq('id', translationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error updating glossary translation:', error);
    throw error;
  }
};

/**
 * Supprimer une traduction
 */
export const deleteGlossaryTranslation = async (translationId) => {
  try {
    const { error } = await supabase
      .from('glossary_translations')
      .delete()
      .eq('id', translationId);

    if (error) throw error;
    logger.log('Glossary translation deleted');
  } catch (error) {
    logger.error('Error deleting glossary translation:', error);
    throw error;
  }
};

/**
 * Obtenir les statistiques de traduction
 */
export const getTranslationStats = async () => {
  try {
    const { data: languages } = await supabase
      .from('translation_settings')
      .select('language_code, language_name');

    const { data: translations } = await supabase
      .from('glossary_translations')
      .select('language_code');

    const stats = {};
    (languages || []).forEach(lang => {
      const count = (translations || []).filter(t => t.language_code === lang.language_code).length;
      stats[lang.language_code] = {
        name: lang.language_name,
        translated: count
      };
    });

    return stats;
  } catch (error) {
    logger.error('Error fetching translation stats:', error);
    throw error;
  }
};

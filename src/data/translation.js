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

/**
 * ========================================
 * TRADUCTIONS DES QCM (Questions à Choix Multiples)
 * ========================================
 */

/**
 * Récupérer les traductions des questions d'un QCM pour une langue spécifique
 */
export const getQuestionnaireQuestionTranslations = async (languageCode) => {
  try {
    const { data, error } = await supabase
      .from('questionnaire_question_translations')
      .select(`
        id,
        question_id,
        language_code,
        translated_instruction,
        created_at,
        updated_at
      `)
      .eq('language_code', languageCode);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching questionnaire question translations:', error);
    throw error;
  }
};

/**
 * Récupérer les traductions des réponses d'un QCM pour une langue spécifique
 */
export const getQuestionnaireChoiceTranslations = async (languageCode) => {
  try {
    const { data, error } = await supabase
      .from('questionnaire_choice_translations')
      .select(`
        id,
        choice_id,
        language_code,
        translated_choice_text,
        translated_feedback,
        created_at,
        updated_at
      `)
      .eq('language_code', languageCode);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching questionnaire choice translations:', error);
    throw error;
  }
};

/**
 * Créer une traduction pour une question de QCM
 */
export const createQuestionnaireQuestionTranslation = async (questionId, languageCode, translatedInstruction) => {
  try {
    // D'abord, vérifier s'il existe déjà une traduction
    const { data: existing } = await supabase
      .from('questionnaire_question_translations')
      .select('id')
      .eq('question_id', questionId)
      .eq('language_code', languageCode);

    if (existing && existing.length > 0) {
      // Mettre à jour la traduction existante
      const { data, error } = await supabase
        .from('questionnaire_question_translations')
        .update({
          translated_instruction: translatedInstruction.trim()
        })
        .eq('id', existing[0].id)
        .select()
        .single();

      if (error) throw error;
      logger.log('Questionnaire question translation updated:', data);
      return data;
    } else {
      // Créer une nouvelle traduction
      const { data, error } = await supabase
        .from('questionnaire_question_translations')
        .insert([{
          question_id: questionId,
          language_code: languageCode,
          translated_instruction: translatedInstruction.trim()
        }])
        .select()
        .single();

      if (error) throw error;
      logger.log('Questionnaire question translation created:', data);
      return data;
    }
  } catch (error) {
    logger.error('Error creating/updating questionnaire question translation:', error);
    throw error;
  }
};

/**
 * Créer une traduction pour une réponse de QCM
 */
export const createQuestionnaireChoiceTranslation = async (choiceId, languageCode, translatedChoiceText, translatedFeedback = null) => {
  try {
    // D'abord, vérifier s'il existe déjà une traduction
    const { data: existing } = await supabase
      .from('questionnaire_choice_translations')
      .select('id')
      .eq('choice_id', choiceId)
      .eq('language_code', languageCode);

    if (existing && existing.length > 0) {
      // Mettre à jour la traduction existante
      const { data, error } = await supabase
        .from('questionnaire_choice_translations')
        .update({
          translated_choice_text: translatedChoiceText.trim(),
          translated_feedback: translatedFeedback ? translatedFeedback.trim() : null
        })
        .eq('id', existing[0].id)
        .select()
        .single();

      if (error) throw error;
      logger.log('Questionnaire choice translation updated:', data);
      return data;
    } else {
      // Créer une nouvelle traduction
      const { data, error } = await supabase
        .from('questionnaire_choice_translations')
        .insert([{
          choice_id: choiceId,
          language_code: languageCode,
          translated_choice_text: translatedChoiceText.trim(),
          translated_feedback: translatedFeedback ? translatedFeedback.trim() : null
        }])
        .select()
        .single();

      if (error) throw error;
      logger.log('Questionnaire choice translation created:', data);
      return data;
    }
  } catch (error) {
    logger.error('Error creating/updating questionnaire choice translation:', error);
    throw error;
  }
};

/**
 * Mettre à jour une traduction de question de QCM
 */
export const updateQuestionnaireQuestionTranslation = async (translationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('questionnaire_question_translations')
      .update(updates)
      .eq('id', translationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error updating questionnaire question translation:', error);
    throw error;
  }
};

/**
 * Mettre à jour une traduction de réponse de QCM
 */
export const updateQuestionnaireChoiceTranslation = async (translationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('questionnaire_choice_translations')
      .update(updates)
      .eq('id', translationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error updating questionnaire choice translation:', error);
    throw error;
  }
};

/**
 * Supprimer une traduction de question de QCM
 */
export const deleteQuestionnaireQuestionTranslation = async (translationId) => {
  try {
    const { error } = await supabase
      .from('questionnaire_question_translations')
      .delete()
      .eq('id', translationId);

    if (error) throw error;
    logger.log('Questionnaire question translation deleted');
  } catch (error) {
    logger.error('Error deleting questionnaire question translation:', error);
    throw error;
  }
};

/**
 * Supprimer une traduction de réponse de QCM
 */
export const deleteQuestionnaireChoiceTranslation = async (translationId) => {
  try {
    const { error } = await supabase
      .from('questionnaire_choice_translations')
      .delete()
      .eq('id', translationId);

    if (error) throw error;
    logger.log('Questionnaire choice translation deleted');
  } catch (error) {
    logger.error('Error deleting questionnaire choice translation:', error);
    throw error;
  }
};

/**
 * Obtenir une question traduite avec toutes ses réponses traduites
 */
export const getTranslatedQuestion = async (questionId, languageCode, glossaryTerms = null) => {
  try {
    // Si c'est français (langue par défaut), récupérer directement la question
    if (languageCode === 'fr') {
      const { data, error } = await supabase
        .from('questionnaire_questions')
        .select(`
          id,
          instruction,
          question_type,
          image_id,
          questionnaire_choices (
            id,
            text,
            choice_order,
            is_correct,
            feedback,
            image_id
          )
        `)
        .eq('id', questionId)
        .single();

      if (error) throw error;
      return {
        id: data.id,
        instruction: data.instruction,
        type: data.question_type,
        imageId: data.image_id,
        choices: data.questionnaire_choices
      };
    }

    // Récupérer la question avec ses traductions
    const { data: question, error: qError } = await supabase
      .from('questionnaire_questions')
      .select(`
        id,
        instruction,
        question_type,
        image_id
      `)
      .eq('id', questionId)
      .single();

    if (qError) throw qError;

    // Récupérer la traduction de la question
    const { data: translations } = await supabase
      .from('questionnaire_question_translations')
      .select('translated_instruction')
      .eq('question_id', questionId)
      .eq('language_code', languageCode)
      .single();

    // Récupérer les choix
    const { data: choices, error: cError } = await supabase
      .from('questionnaire_choices')
      .select(`
        id,
        text,
        choice_order,
        is_correct,
        feedback,
        image_id
      `)
      .eq('question_id', questionId)
      .order('choice_order');

    if (cError) throw cError;

    // Récupérer les traductions des choix
    const choiceIds = choices.map(c => c.id);
    const { data: choiceTranslations } = await supabase
      .from('questionnaire_choice_translations')
      .select('choice_id, translated_choice_text, translated_feedback')
      .in('choice_id', choiceIds)
      .eq('language_code', languageCode);

    // Mapper les traductions de choix
    const translationMap = {};
    (choiceTranslations || []).forEach(t => {
      translationMap[t.choice_id] = t;
    });

    return {
      id: question.id,
      instruction: translations?.translated_instruction || question.instruction,
      type: question.question_type,
      imageId: question.image_id,
      choices: choices.map(choice => ({
        id: choice.id,
        text: translationMap[choice.id]?.translated_choice_text || choice.text,
        order: choice.choice_order,
        isCorrect: choice.is_correct,
        feedback: translationMap[choice.id]?.translated_feedback || choice.feedback,
        imageId: choice.image_id
      }))
    };
  } catch (error) {
    logger.error('Error getting translated question:', error);
    throw error;
  }
};

/**
 * Obtenir les statistiques de traduction des QCM
 */
export const getQuestionnaireTranslationStats = async () => {
  try {
    const { data: languages } = await supabase
      .from('translation_settings')
      .select('language_code, language_name');

    const { data: questionTranslations } = await supabase
      .from('questionnaire_question_translations')
      .select('language_code');

    const { data: choiceTranslations } = await supabase
      .from('questionnaire_choice_translations')
      .select('language_code');

    const stats = {};
    (languages || []).forEach(lang => {
      const questionCount = (questionTranslations || []).filter(t => t.language_code === lang.language_code).length;
      const choiceCount = (choiceTranslations || []).filter(t => t.language_code === lang.language_code).length;
      stats[lang.language_code] = {
        name: lang.language_name,
        questions: questionCount,
        choices: choiceCount
      };
    });

    return stats;
  } catch (error) {
    logger.error('Error fetching questionnaire translation stats:', error);
    throw error;
  }
};

/**
 * ========================================
 * AUTO-TRADUCTION DES QCM
 * ========================================
 */

/**
 * Traduire automatiquement une question de QCM
 */
export const autoTranslateQuestionnaireQuestion = async (questionId, instruction, targetLanguage) => {
  try {
    if (!instruction || instruction.trim().length === 0) {
      logger.warn(`Question ${questionId} has empty instruction`);
      return '';
    }

    // Si c'est du français (langue par défaut), ne pas traduire
    if (targetLanguage === 'fr') {
      return instruction;
    }

    logger.log(`🌍 Traduction question ${questionId}: "${instruction}" vers ${targetLanguage}`);

    // Récupérer les traductions du glossaire
    const glossaryTranslations = await getGlossaryTranslations(targetLanguage);

    // Faire une traduction automatique complète
    let translatedText = instruction;
    try {
      translatedText = await autoTranslateText(instruction, targetLanguage);
      logger.log(`✅ Auto-traduction question: "${instruction}" → "${translatedText}"`);
    } catch (error) {
      logger.warn(`⚠️ Auto-translation failed for question ${questionId}:`, error);
      return instruction;
    }

    // Remplacer les termes du glossaire par leurs traductions personnalisées
    if (glossaryTranslations && glossaryTranslations.length > 0) {
      glossaryTranslations.forEach(trans => {
        const regex = new RegExp(`\\b${trans.glossary.term}\\b`, 'gi');
        translatedText = translatedText.replace(regex, trans.translated_term);
      });
      logger.log(`🔤 Après glossaire: "${translatedText}"`);
    }

    return translatedText;
  } catch (error) {
    logger.error(`Error auto-translating question ${questionId}:`, error);
    return instruction;
  }
};

/**
 * Traduire automatiquement une réponse de QCM
 */
export const autoTranslateQuestionnaireChoice = async (choiceId, choiceText, targetLanguage) => {
  try {
    if (!choiceText || choiceText.trim().length === 0) {
      logger.warn(`Choice ${choiceId} has empty text`);
      return '';
    }

    // Si c'est du français (langue par défaut), ne pas traduire
    if (targetLanguage === 'fr') {
      return choiceText;
    }

    logger.log(`🌍 Traduction choix ${choiceId}: "${choiceText}" vers ${targetLanguage}`);

    // Récupérer les traductions du glossaire
    const glossaryTranslations = await getGlossaryTranslations(targetLanguage);

    // Faire une traduction automatique complète
    let translatedText = choiceText;
    try {
      translatedText = await autoTranslateText(choiceText, targetLanguage);
      logger.log(`✅ Auto-traduction réponse: "${choiceText}" → "${translatedText}"`);
    } catch (error) {
      logger.warn(`⚠️ Auto-translation failed for choice ${choiceId}:`, error);
      return choiceText;
    }

    // Remplacer les termes du glossaire par leurs traductions personnalisées
    if (glossaryTranslations && glossaryTranslations.length > 0) {
      glossaryTranslations.forEach(trans => {
        const regex = new RegExp(`\\b${trans.glossary.term}\\b`, 'gi');
        translatedText = translatedText.replace(regex, trans.translated_term);
      });
      logger.log(`🔤 Après glossaire: "${translatedText}"`);
    }

    return translatedText;
  } catch (error) {
    logger.error(`Error auto-translating choice ${choiceId}:`, error);
    return choiceText;
  }
};

/**
 * Traduire automatiquement un questionnaire complet
 * Crée automatiquement toutes les traductions pour toutes les questions et réponses
 */
export const autoTranslateQuestionnaire = async (taskId, languageCode, onProgress = null) => {
  try {
    if (languageCode === 'fr') {
      logger.log('Skipping auto-translation for French (default language)');
      return { success: true, message: 'Traduction non nécessaire pour le français' };
    }

    logger.log(`🚀 Début auto-traduction questionnaire ${taskId} en ${languageCode}`);

    // Récupérer toutes les questions du questionnaire
    const { data: questionsData, error: questionsError } = await supabase
      .from('questionnaire_questions')
      .select(`
        id,
        instruction,
        questionnaire_choices (
          id,
          text
        )
      `)
      .eq('task_id', taskId);

    if (questionsError) throw questionsError;
    if (!questionsData || questionsData.length === 0) {
      throw new Error('Aucune question trouvée');
    }

    logger.log(`📊 Questionnaire ${taskId}: ${questionsData.length} questions trouvées`, questionsData);

    let translatedCount = 0;
    const totalQuestions = questionsData.length;
    let currentItemIndex = 0;

    // Compter le nombre total d'éléments (questions + réponses)
    let totalItems = 0;
    const allItems = [];
    questionsData.forEach(question => {
      totalItems++; // La question elle-même
      allItems.push({ type: 'question', data: question });
      
      if (question.questionnaire_choices && question.questionnaire_choices.length > 0) {
        question.questionnaire_choices.forEach(choice => {
          totalItems++;
          allItems.push({ type: 'choice', data: choice, questionId: question.id });
        });
      }
    });

    logger.log(`📊 Total d'éléments à traduire: ${totalItems} (${totalQuestions} questions)`);

    // Traiter chaque élément
    for (const item of allItems) {
      currentItemIndex++;

      try {
        if (item.type === 'question') {
          const question = item.data;
          logger.log(`🌍 Traduction question ${question.id}: "${question.instruction}"`);
          
          const translatedInstruction = await autoTranslateQuestionnaireQuestion(
            question.id,
            question.instruction,
            languageCode
          );

          logger.log(`✨ Traduction obtenue: "${translatedInstruction}"`);

          // Créer la traduction
          const result = await createQuestionnaireQuestionTranslation(
            question.id,
            languageCode,
            translatedInstruction
          );
          
          logger.log(`💾 Traduction créée en BDD:`, result);

          translatedCount++;
          logger.log(`✅ Question traduite (${currentItemIndex}/${totalItems})`);
        } else if (item.type === 'choice') {
          const choice = item.data;
          logger.log(`🌍 Traduction choix ${choice.id}: "${choice.text}"`);
          
          const translatedChoiceText = await autoTranslateQuestionnaireChoice(
            choice.id,
            choice.text,
            languageCode
          );

          logger.log(`✨ Traduction obtenue: "${translatedChoiceText}"`);

          // Créer la traduction
          const result = await createQuestionnaireChoiceTranslation(
            choice.id,
            languageCode,
            translatedChoiceText
          );
          
          logger.log(`💾 Traduction créée en BDD:`, result);

          translatedCount++;
          logger.log(`✅ Réponse traduite (${currentItemIndex}/${totalItems})`);
        }

        if (onProgress) {
          onProgress({
            current: currentItemIndex,
            total: totalItems,
            message: `${currentItemIndex}/${totalItems} éléments traduits`
          });
        }
      } catch (error) {
        logger.warn(`⚠️ Erreur traduction élément ${currentItemIndex}:`, error);
      }

      // Ajouter un délai pour éviter les limites de taux de l'API
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    logger.log(`✅ Auto-traduction complétée: ${translatedCount}/${totalItems} éléments traduits`);

    return {
      success: true,
      message: `${translatedCount}/${totalItems} éléments traduits avec succès`,
      translated: translatedCount,
      total: totalItems
    };
  } catch (error) {
    logger.error('Error auto-translating questionnaire:', error);
    throw error;
  }
};

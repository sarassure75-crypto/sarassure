/**
 * Validation stricte pour les formulaires
 */

/**
 * Valide une question de questionnaire
 * @throws {Error} si la validation échoue
 */
export const validateQuestion = (question) => {
  const errors = [];

  // Texte de la question obligatoire
  if (!question.question_text?.trim()) {
    errors.push('Le texte de la question est obligatoire');
  }

  // Minimum 2 choix
  if (!question.choices || question.choices.length < 2) {
    errors.push('Au moins 2 choix de réponse sont requis');
  }

  // Au moins une réponse correcte
  // Support both camelCase (isCorrect) and snake_case (is_correct)
  const hasCorrectAnswer = question.choices?.some(c => c.is_correct || c.isCorrect);
  if (!hasCorrectAnswer) {
    errors.push('Au moins une réponse correcte est requise');
  }

  // All questions now use mixed mode: each response must have IMAGE OR TEXT
  const allHaveAtLeastOne = question.choices?.every(c => (c.image_id || c.imageId) || c.text?.trim());
  if (!allHaveAtLeastOne) {
    errors.push('Chaque réponse doit avoir au moins une image OU du texte');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return true;
};

/**
 * Valide un questionnaire complet
 */
export const validateQuestionnaire = (questionnaire) => {
  const errors = [];

  if (!questionnaire.title?.trim()) {
    errors.push('Le titre du questionnaire est obligatoire');
  }

  if (!questionnaire.questions || questionnaire.questions.length === 0) {
    errors.push('Le questionnaire doit contenir au moins une question');
  }

  // Valider chaque question
  questionnaire.questions?.forEach((q, index) => {
    try {
      validateQuestion(q);
    } catch (err) {
      errors.push(`Question ${index + 1}: ${err.message}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return true;
};

/**
 * Valide une étape d'exercice
 */
export const validateExerciseStep = (step) => {
  const errors = [];

  if (!step.instruction?.trim()) {
    errors.push('L\'instruction est obligatoire');
  }

  if (!step.image_id) {
    errors.push('Une capture d\'écran est obligatoire');
  }

  if (!step.action_type) {
    errors.push('Le type d\'action est obligatoire');
  }

  // Actions nécessitant une zone cible
  const actionsNeedingTarget = [
    'tap', 'long_press', 'swipe_left', 'swipe_right', 
    'swipe_up', 'swipe_down', 'drag_and_drop'
  ];

  if (actionsNeedingTarget.includes(step.action_type)) {
    if (!step.target_area || !step.target_area.x_percent || !step.target_area.y_percent) {
      errors.push('Une zone d\'action est requise pour ce type d\'action');
    }
  }

  // Actions de saisie nécessitant une zone texte
  const inputActions = ['text_input', 'number_input'];
  if (inputActions.includes(step.action_type)) {
    if (!step.target_area) {
      errors.push('Une zone de saisie est requise pour ce type d\'action');
    }
  }

  // Actions de boutons physiques (pas de zone requise - les boutons sont fixes)
  const buttonActions = ['button_power', 'button_volume_up', 'button_volume_down'];
  // Les boutons ne nécessitent pas de zone d'action car ils sont fixes

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return true;
};

/**
 * Sanitize HTML pour éviter XSS
 */
export const sanitizeHTML = (text) => {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Valide un email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un code apprenant (6 chiffres)
 */
export const validateLearnerCode = (code) => {
  return /^\d{6}$/.test(code);
};

/**
 * Valide un mot de passe (min 6 caractères)
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
  }
  return true;
};

/**
 * Nettoie une chaîne de caractères (trim + pas de null/undefined)
 */
export const cleanString = (str) => {
  if (!str) return '';
  return str.trim();
};

/**
 * Valide une URL
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Utilitaires pour gérer les actions de boutons physiques
 * Gère les actions simples et combinées
 */

/**
 * Détermine si une action est une action de bouton physique
 */
export const isPhysicalButtonAction = (actionType) => {
  const buttonActions = [
    'button_power',
    'button_volume_up',
    'button_volume_down',
    'button_power_volume_down',
    'button_power_volume_up',
    'button_volume_up_down',
  ];
  return buttonActions.includes(actionType);
};

/**
 * Détermine si une action est une combinaison de boutons
 */
export const isComboButtonAction = (actionType) => {
  const comboActions = [
    'button_power_volume_down',
    'button_power_volume_up',
    'button_volume_up_down',
  ];
  return comboActions.includes(actionType);
};

/**
 * Récupère les boutons requis pour une action combinée
 * @param {string} actionType - Type d'action
 * @returns {array} Liste des IDs de boutons requis
 */
export const getRequiredButtons = (actionType) => {
  const mapping = {
    button_power_volume_down: ['power', 'volumeDown'],
    button_power_volume_up: ['power', 'volumeUp'],
    button_volume_up_down: ['volumeUp', 'volumeDown'],
  };
  return mapping[actionType] || [];
};

/**
 * Récupère le mapping des noms de boutons
 * @param {string} buttonId - ID du bouton
 * @returns {string} Nom convivial du bouton
 */
export const getButtonLabel = (buttonId) => {
  const labels = {
    power: 'Power',
    volumeUp: 'Volume+',
    volumeDown: 'Volume-',
  };
  return labels[buttonId] || buttonId;
};

/**
 * Génère le texte d'instruction pour une action combinée
 * @param {string} actionType - Type d'action
 * @returns {string} Texte d'aide
 */
export const getComboInstructionText = (actionType) => {
  const instructions = {
    button_power_volume_down: 'Appuyez simultanément sur Power + Volume-',
    button_power_volume_up: 'Appuyez simultanément sur Power + Volume+',
    button_volume_up_down: 'Appuyez simultanément sur Volume+ + Volume-',
  };
  return instructions[actionType] || '';
};

/**
 * Mapping des actions de boutons vers les types Supabase
 */
export const buttonActionMapping = {
  power: 'button_power',
  volumeUp: 'button_volume_up',
  volumeDown: 'button_volume_down',
};

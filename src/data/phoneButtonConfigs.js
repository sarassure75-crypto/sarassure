/**
 * Configurations des boutons physiques pour différents modèles de téléphones
 * Permet de s'entraîner sur différentes dispositions de boutons
 */

export const phoneButtonConfigs = {
  // Configuration Samsung/Generic Android (la plus courante)
  samsung: {
    id: 'samsung',
    name: 'Samsung / Android Standard',
    description: 'Bouton Power à droite, Volume à gauche',
    buttons: {
      power: {
        id: 'power',
        label: 'Power',
        icon: '⏻',
        position: { side: 'right', top: '35%' },
        color: '#ef4444',
        height: '40px',
        description: "Bouton d'allumage",
      },
      volumeUp: {
        id: 'volumeUp',
        label: 'Vol+',
        icon: '🔊',
        position: { side: 'left', top: '25%' },
        color: '#3b82f6',
        height: '40px',
        description: 'Bouton volume haut',
      },
      volumeDown: {
        id: 'volumeDown',
        label: 'Vol-',
        icon: '🔉',
        position: { side: 'left', top: '40%' },
        color: '#06b6d4',
        height: '40px',
        description: 'Bouton volume bas',
      },
    },
  },

  // Configuration iPhone style
  iphone: {
    id: 'iphone',
    name: 'iPhone Style',
    description: 'Power à droite haut, Volume séparés à gauche',
    buttons: {
      power: {
        id: 'power',
        label: 'Power',
        icon: '⏻',
        position: { side: 'right', top: '20%' },
        color: '#ef4444',
        height: '50px',
        description: "Bouton d'allumage",
      },
      volumeUp: {
        id: 'volumeUp',
        label: 'Vol+',
        icon: '🔊',
        position: { side: 'left', top: '18%' },
        color: '#3b82f6',
        height: '35px',
        description: 'Bouton volume haut',
      },
      volumeDown: {
        id: 'volumeDown',
        label: 'Vol-',
        icon: '🔉',
        position: { side: 'left', top: '28%' },
        color: '#06b6d4',
        height: '35px',
        description: 'Bouton volume bas',
      },
    },
  },

  // Configuration Pixel Google
  pixel: {
    id: 'pixel',
    name: 'Google Pixel',
    description: 'Tous les boutons à droite, Power en haut',
    buttons: {
      power: {
        id: 'power',
        label: 'Power',
        icon: '⏻',
        position: { side: 'right', top: '22%' },
        color: '#ef4444',
        height: '45px',
        description: "Bouton d'allumage",
      },
      volumeUp: {
        id: 'volumeUp',
        label: 'Vol+',
        icon: '🔊',
        position: { side: 'right', top: '35%' },
        color: '#3b82f6',
        height: '38px',
        description: 'Bouton volume haut',
      },
      volumeDown: {
        id: 'volumeDown',
        label: 'Vol-',
        icon: '🔉',
        position: { side: 'right', top: '47%' },
        color: '#06b6d4',
        height: '38px',
        description: 'Bouton volume bas',
      },
    },
  },

  // Configuration Xiaomi
  xiaomi: {
    id: 'xiaomi',
    name: 'Xiaomi / Redmi',
    description: 'Power à droite milieu, Volume à droite haut',
    buttons: {
      power: {
        id: 'power',
        label: 'Power',
        icon: '⏻',
        position: { side: 'right', top: '38%' },
        color: '#ef4444',
        height: '42px',
        description: "Bouton d'allumage",
      },
      volumeUp: {
        id: 'volumeUp',
        label: 'Vol+',
        icon: '🔊',
        position: { side: 'right', top: '22%' },
        color: '#3b82f6',
        height: '40px',
        description: 'Bouton volume haut',
      },
      volumeDown: {
        id: 'volumeDown',
        label: 'Vol-',
        icon: '🔉',
        position: { side: 'right', top: '30%' },
        color: '#06b6d4',
        height: '40px',
        description: 'Bouton volume bas',
      },
    },
  },

  // Configuration OnePlus
  oneplus: {
    id: 'oneplus',
    name: 'OnePlus',
    description: 'Power à droite, Volume à gauche, switch alerte à droite haut',
    buttons: {
      power: {
        id: 'power',
        label: 'Power',
        icon: '⏻',
        position: { side: 'right', top: '40%' },
        color: '#ef4444',
        height: '45px',
        description: "Bouton d'allumage",
      },
      volumeUp: {
        id: 'volumeUp',
        label: 'Vol+',
        icon: '🔊',
        position: { side: 'left', top: '28%' },
        color: '#3b82f6',
        height: '42px',
        description: 'Bouton volume haut',
      },
      volumeDown: {
        id: 'volumeDown',
        label: 'Vol-',
        icon: '🔉',
        position: { side: 'left', top: '42%' },
        color: '#06b6d4',
        height: '42px',
        description: 'Bouton volume bas',
      },
    },
  },

  // Configuration Huawei
  huawei: {
    id: 'huawei',
    name: 'Huawei / Honor',
    description: 'Power à droite bas, Volume à droite haut',
    buttons: {
      power: {
        id: 'power',
        label: 'Power',
        icon: '⏻',
        position: { side: 'right', top: '42%' },
        color: '#ef4444',
        height: '48px',
        description: "Bouton d'allumage",
      },
      volumeUp: {
        id: 'volumeUp',
        label: 'Vol+',
        icon: '🔊',
        position: { side: 'right', top: '24%' },
        color: '#3b82f6',
        height: '38px',
        description: 'Bouton volume haut',
      },
      volumeDown: {
        id: 'volumeDown',
        label: 'Vol-',
        icon: '🔉',
        position: { side: 'right', top: '33%' },
        color: '#06b6d4',
        height: '38px',
        description: 'Bouton volume bas',
      },
    },
  },
};

/**
 * Récupère une configuration de boutons par son ID
 * @param {string} configId - ID de la configuration (ex: 'samsung', 'iphone')
 * @returns {object} Configuration des boutons
 */
export const getButtonConfig = (configId = 'samsung') => {
  return phoneButtonConfigs[configId] || phoneButtonConfigs.samsung;
};

/**
 * Liste toutes les configurations disponibles pour le sélecteur
 * @returns {array} Liste des configurations {id, name, description}
 */
export const getButtonConfigsList = () => {
  return Object.values(phoneButtonConfigs).map((config) => ({
    id: config.id,
    name: config.name,
    description: config.description,
  }));
};

/**
 * Configuration par défaut
 */
export const DEFAULT_BUTTON_CONFIG = 'samsung';

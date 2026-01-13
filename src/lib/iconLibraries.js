/**
 * Gestionnaire des bibliothèques d'icônes disponibles
 * Intègre react-icons avec Lucide et autres sources
 */

export const ICON_LIBRARIES = {
  lucide: {
    name: 'Lucide React',
    description: 'Icônes minimalistes et nettes',
    color: '#F97316',
    enabled: true,
  },
  fa6: {
    name: 'Font Awesome 6',
    description: 'Large collection (4000+)',
    color: '#228AE6',
    enabled: true,
  },
  bs: {
    name: 'Bootstrap Icons',
    description: 'Icônes officielles Bootstrap (2000+)',
    color: '#7952B3',
    enabled: true,
  },
  md: {
    name: 'Material Design Icons',
    description: 'Icônes Material Design de Google (1000+)',
    color: '#0175C2',
    enabled: true,
  },
  fi: {
    name: 'Feather Icons',
    description: 'Icônes minimalistes (290)',
    color: '#F0DB4F',
    enabled: true,
  },
  hi2: {
    name: 'Heroicons v2',
    description: 'Icônes Tailwind Labs (v2)',
    color: '#06B6D4',
    enabled: true,
  },
  ai: {
    name: 'Ant Design Icons',
    description: 'Icônes du design system Ant (800+)',
    color: '#1890FF',
    enabled: true,
  },
};

/**
 * Obtenir les icônes par bibliothèque
 * Utilisé pour les sélecteurs et gestionnaires
 */
export const getIconLibraryInfo = (libraryId) => {
  return ICON_LIBRARIES[libraryId] || null;
};

export const getEnabledLibraries = () => {
  return Object.entries(ICON_LIBRARIES)
    .filter(([, lib]) => lib.enabled)
    .map(([id, lib]) => ({ id, ...lib }));
};

/**
 * Categories d'icônes par bibliothèque
 * Permet une meilleure organisation
 */
export const ICON_CATEGORIES = {
  lucide: ['Statut', 'Contact', 'Actions', 'Navigation', 'Utilisateurs', 'Fichiers', 'Média', 'Outils', 'Évaluation', 'Divers'],
  fa6: ['Interface', 'Médias', 'Affaires', 'Médecine', 'Objets', 'Symboles', 'Marques'],
  bs: ['Interface', 'Graphiques', 'Lettres', 'Notation', 'Météo'],
  md: ['Interface', 'Navigation', 'Actions', 'Édition', 'Fichiers', 'Formulaires'],
  fi: ['Interface', 'Médias', 'Editeurs', 'Navigation'],
  hi2: ['Solide', 'Outline', 'Mini'],
  ai: ['Fill', 'Outline', 'Twotone'],
};

/**
 * Format de stockage pour les icônes favoris
 * Permet de sauvegarder les sélections utilisateur
 */
export const createIconReference = (libraryId, iconName, category = null, displayName = null) => {
  return {
    id: `${libraryId}-${iconName}`,
    libraryId,
    iconName,
    category,
    displayName: displayName || iconName,
    createdAt: new Date().toISOString(),
  };
};

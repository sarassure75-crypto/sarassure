/**
 * Configuration rapide pour ajouter des icônes react-icons
 * Importez et utilisez ces configurations pour enrichir vos QCM
 */

// ============ IMPORTS ============
// Ajouter ces imports à QuestionnaireCreation.jsx ou AdminQuestionnaireEditor.jsx

// Font Awesome 6 (4000+ icônes)
// import * as FA from 'react-icons/fa6';

// Bootstrap Icons (2000+ icônes)
// import * as BI from 'react-icons/bi';

// Material Design Icons (1000+ icônes)
// import * as MD from 'react-icons/md';

// Feather Icons (290 icônes)
// import * as FI from 'react-icons/fi';

// Heroicons (300+ icônes)
// import * as HI from 'react-icons/hi2';

// Ant Design Icons (800+ icônes)
// import * as AI from 'react-icons/ai';

// ============ EXEMPLES DE COLLECTIONS ============

/**
 * Collection: Émotions et Sentiments
 * Utilité: Questions portant sur les émotions, satisfaction, ressenti
 */
export const EMOTION_ICONS = [
  { id: 'fa-FaceSmile', name: '😊 Heureux', component: null, category: 'Émotions', library: 'fa' },
  { id: 'fa-FaceFrown', name: '😞 Triste', component: null, category: 'Émotions', library: 'fa' },
  { id: 'fa-FaceAngry', name: '😠 Fâché', component: null, category: 'Émotions', library: 'fa' },
  { id: 'fa-FaLaugh', name: '😄 Rire', component: null, category: 'Émotions', library: 'fa' },
  { id: 'fa-Heart', name: '❤ Amour', component: null, category: 'Émotions', library: 'fa' },
];

/**
 * Collection: Communication et Contact
 * Utilité: Questions sur les modes de communication
 */
export const COMMUNICATION_ICONS = [
  { id: 'fa-Phone', name: '☎ Téléphone', component: null, category: 'Communication', library: 'fa' },
  { id: 'fa-Envelope', name: '✉ Email', component: null, category: 'Communication', library: 'fa' },
  { id: 'fa-MessageDots', name: '💬 Chat', component: null, category: 'Communication', library: 'fa' },
  { id: 'fa-Share', name: '↗ Partager', component: null, category: 'Communication', library: 'fa' },
  { id: 'bi-Telephone', name: '☎ Appel', component: null, category: 'Communication', library: 'bi' },
];

/**
 * Collection: Médicale et Santé
 * Utilité: Formation santé, premiers secours, bien-être
 */
export const MEDICAL_ICONS = [
  { id: 'fa-HeartPulse', name: '💓 Cœur', component: null, category: 'Médical', library: 'fa' },
  { id: 'fa-Hospital', name: '🏥 Hôpital', component: null, category: 'Médical', library: 'fa' },
  { id: 'fa-Stethoscope', name: '🩺 Stéthoscope', component: null, category: 'Médical', library: 'fa' },
  { id: 'fa-Pill', name: '💊 Médicament', component: null, category: 'Médical', library: 'fa' },
  { id: 'fa-Syringe', name: '💉 Injection', component: null, category: 'Médical', library: 'fa' },
];

/**
 * Collection: Transport et Déplacement
 * Utilité: Logistique, mobilité, géolocalisation
 */
export const TRANSPORT_ICONS = [
  { id: 'fa-Car', name: '🚗 Voiture', component: null, category: 'Transport', library: 'fa' },
  { id: 'fa-Bus', name: '🚌 Bus', component: null, category: 'Transport', library: 'fa' },
  { id: 'fa-Train', name: '🚂 Train', component: null, category: 'Transport', library: 'fa' },
  { id: 'fa-Plane', name: '✈ Avion', component: null, category: 'Transport', library: 'fa' },
  { id: 'fa-MapLocation', name: '📍 Localisation', component: null, category: 'Transport', library: 'fa' },
];

/**
 * Collection: Commerce et Achat
 * Utilité: E-commerce, shopping, paiement
 */
export const COMMERCE_ICONS = [
  { id: 'fa-ShoppingCart', name: '🛒 Panier', component: null, category: 'Commerce', library: 'fa' },
  { id: 'fa-CreditCard', name: '💳 Carte', component: null, category: 'Commerce', library: 'fa' },
  { id: 'fa-DollarSign', name: '💰 Prix', component: null, category: 'Commerce', library: 'fa' },
  { id: 'fa-Barcode', name: '📦 Code barre', component: null, category: 'Commerce', library: 'fa' },
  { id: 'fa-Store', name: '🏪 Magasin', component: null, category: 'Commerce', library: 'fa' },
];

/**
 * Collection: Éducation et Apprentissage
 * Utilité: Formations, cours, apprentissage
 */
export const EDUCATION_ICONS = [
  { id: 'fa-BookOpen', name: '📖 Livre', component: null, category: 'Éducation', library: 'fa' },
  { id: 'fa-Graduation', name: '🎓 Diplôme', component: null, category: 'Éducation', library: 'fa' },
  { id: 'fa-Pencil', name: '✏ Crayon', component: null, category: 'Éducation', library: 'fa' },
  { id: 'fa-Lightbulb', name: '💡 Idée', component: null, category: 'Éducation', library: 'fa' },
  { id: 'fa-Brain', name: '🧠 Intelligence', component: null, category: 'Éducation', library: 'fa' },
];

/**
 * Collection: Sécurité et Protection
 * Utilité: Sécurité informatique, données, protection
 */
export const SECURITY_ICONS = [
  { id: 'fa-Lock', name: '🔒 Verrouillé', component: null, category: 'Sécurité', library: 'fa' },
  { id: 'fa-Unlock', name: '🔓 Déverrouillé', component: null, category: 'Sécurité', library: 'fa' },
  { id: 'fa-Shield', name: '🛡 Bouclier', component: null, category: 'Sécurité', library: 'fa' },
  { id: 'fa-Eye', name: '👁 Visible', component: null, category: 'Sécurité', library: 'fa' },
  { id: 'fa-Fingerprint', name: '👆 Empreinte', component: null, category: 'Sécurité', library: 'fa' },
];

// ============ HELPER POUR COMBINER ============

/**
 * Combiner Lucide avec react-icons
 * Usage: 
 *   const allIcons = combineIconLibraries(LUCIDE_ICONS, EMOTION_ICONS);
 */
export const combineIconLibraries = (...libraries) => {
  return libraries.flat();
};

/**
 * Obtenir les icônes par catégorie
 * Usage:
 *   const emotionIcons = filterByCategory(allIcons, 'Émotions');
 */
export const filterByCategory = (icons, category) => {
  return icons.filter(icon => icon.category === category);
};

/**
 * Obtenir les icônes par bibliothèque
 * Usage:
 *   const fontAwesomeIcons = filterByLibrary(allIcons, 'fa');
 */
export const filterByLibrary = (icons, libraryId) => {
  return icons.filter(icon => icon.library === libraryId);
};

/**
 * Rechercher dans les icônes
 * Usage:
 *   const results = searchIcons(allIcons, 'heart');
 */
export const searchIcons = (icons, keyword) => {
  const lower = keyword.toLowerCase();
  return icons.filter(icon =>
    icon.name.toLowerCase().includes(lower) ||
    icon.id.toLowerCase().includes(lower) ||
    (icon.category?.toLowerCase().includes(lower) || false)
  );
};

// ============ GUIDE D'INTÉGRATION ============

/**
 * ÉTAPE 1 : Ajouter les imports dans QuestionnaireCreation.jsx
 * 
 * import * as FA from 'react-icons/fa6';
 * import { EMOTION_ICONS, COMMUNICATION_ICONS } from '@/lib/iconConfigs';
 */

/**
 * ÉTAPE 2 : Créer une liste combinée
 * 
 * const ALL_ICONS = [
 *   ...LUCIDE_ICONS,
 *   ...EMOTION_ICONS.map(icon => ({
 *     ...icon,
 *     component: FA[icon.id.split('-')[1]]
 *   })),
 * ];
 */

/**
 * ÉTAPE 3 : Utiliser dans le rendu des onglets icônes
 * Voir ICON_MANAGER_GUIDE.md pour les exemples complets
 */


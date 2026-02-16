import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';

/**
 * Sélecteur d'icônes réutilisable avec support des icônes colorées
 *
 * Props:
 * - selectedIcon: { library, name, component, displayName } (optionnel)
 * - onSelect: fonction appelée quand l'utilisateur sélectionne une icône
 * - onRemove: fonction appelée quand on supprime l'icône
 * - libraries: ['lucide', 'fa6', 'bs', 'md', 'fi', 'hi2', 'ai', 'logos', 'skill', 'devicon'] ou tous
 * - defaultCategory: catégorie à afficher par défaut
 * - showSearch: afficher la barre de recherche (défaut: true)
 *
 * Exemple:
 * <IconSelector
 *   selectedIcon={selectedIcon}
 *   onSelect={(icon) => setSelectedIcon(icon)}
 *   onRemove={() => setSelectedIcon(null)}
 *   libraries={['fa6', 'logos']}
 * />
 */

// Liste des icônes colorées Iconify disponibles (logos d'applications populaires sur Android)
const ICONIFY_LOGOS = [
  'logos:whatsapp-icon',
  'logos:google-chrome',
  'logos:firefox',
  'logos:youtube-icon',
  'logos:facebook',
  'logos:instagram-icon',
  'logos:twitter',
  'logos:tiktok-icon',
  'logos:spotify-icon',
  'logos:netflix-icon',
  'logos:gmail',
  'logos:google-maps',
  'logos:android-icon',
  'logos:apple',
  'logos:microsoft',
  'logos:zoom-icon',
  'logos:slack-icon',
  'logos:telegram',
  'logos:skype',
  'logos:linkedin-icon',
  'logos:pinterest',
  'logos:reddit-icon',
  'logos:snapchat-icon',
  'logos:twitch',
  'logos:amazon',
  'logos:ebay',
  'logos:paypal',
  'logos:uber',
  'logos:airbnb',
  'devicon:chrome',
  'devicon:firefox',
  'devicon:android',
  'skill-icons:gmail-light',
  'skill-icons:instagram',
  'skill-icons:linkedin',
  'skill-icons:twitter',
];

const IconLibraryMap = {
  lucide: {
    module: LucideIcons || {},
    prefix: '',
    color: '#181818',
    label: 'Lucide',
    colored: false,
  },
  fa6: {
    module: FontAwesome6 || {},
    prefix: 'fa',
    color: '#0184BC',
    label: 'Font Awesome 6',
    colored: false,
  },
  bs: {
    module: BootstrapIcons || {},
    prefix: 'bs',
    color: '#7952B3',
    label: 'Bootstrap Icons',
    colored: false,
  },
  md: {
    module: MaterialIcons || {},
    prefix: 'md',
    color: '#00BCD4',
    label: 'Material Design',
    colored: false,
  },
  fi: {
    module: FeatherIcons || {},
    prefix: 'fi',
    color: '#000000',
    label: 'Feather',
    colored: false,
  },
  hi2: {
    module: HeroiconsIcons || {},
    prefix: 'hi',
    color: '#6366F1',
    label: 'Heroicons',
    colored: false,
  },
  ai: {
    module: AntIcons || {},
    prefix: 'ai',
    color: '#1890FF',
    label: 'Ant Design',
    colored: false,
  },
  logos: {
    module: null,
    prefix: 'iconify',
    color: '#FF6B35',
    label: '🎨 Logos Colorés (Apps Android)',
    colored: true,
  },
  skill: {
    module: null,
    prefix: 'iconify',
    color: '#4CAF50',
    label: '🎨 Skill Icons',
    colored: true,
  },
  devicon: {
    module: null,
    prefix: 'iconify',
    color: '#9C27B0',
    label: '🎨 Devicon Colorés',
    colored: true,
  },
};

const ICON_CATEGORIES = {
  // Catégories uniquement pour Lucide - déprécié
};

export default function IconSelector({
  selectedIcon = null,
  onSelect = () => {},
  onRemove = () => {},
  libraries = ['fa6', 'bs', 'md', 'fi', 'hi2', 'ai'],
  defaultCategory = 'Statut',
  showSearch = true,
  showLibraryTabs = true,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState(libraries[0] || 'lucide');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [isOpen, setIsOpen] = useState(false);

  // Synchroniser selectedLibrary quand libraries prop change
  useEffect(() => {
    if (libraries && libraries.length > 0) {
      // Si la bibliothèque sélectionnée n'existe plus dans la nouvelle liste, changer vers la première
      if (!libraries.includes(selectedLibrary)) {
        setSelectedLibrary(libraries[0]);
      }
    }
  }, [libraries, selectedLibrary]);

  // Vérifier si c'est vraiment un composant React valide
  const isValidReactComponent = (component) => {
    if (!component || typeof component !== 'function') return false;

    // Exclure les HOCs et les utilitaires
    const name = component.name || component.displayName || '';
    if (name.includes('createLucideIcon') || name.includes('forwardRef') || name === 'Component') {
      return false;
    }

    // Pour lucide-react, vérifier que c'est bien une fonction de composant
    // Les vrais composants d'icônes ont une structure spécifique
    try {
      // Tenter de créer un élément pour vérifier si c'est rendable
      React.createElement(component);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Récupérer les icônes disponibles pour la bibliothèque sélectionnée
  const getAvailableIcons = () => {
    const libraryData = IconLibraryMap[selectedLibrary];
    if (!libraryData) return [];

    // Pour les bibliothèques Iconify (logos, skill, devicon)
    if (libraryData.colored && libraryData.prefix === 'iconify') {
      if (selectedLibrary === 'logos') {
        return ICONIFY_LOGOS.filter((iconName) => iconName.startsWith('logos:'))
          .filter(
            (iconName) => !searchTerm || iconName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((iconName) => ({
            id: iconName,
            library: 'logos',
            name: iconName,
            component: (props) => <IconifyIcon icon={iconName} {...props} />,
            displayName: iconName.replace('logos:', '').replace(/-/g, ' '),
            isIconify: true,
          }));
      }

      if (selectedLibrary === 'skill') {
        return ICONIFY_LOGOS.filter((iconName) => iconName.startsWith('skill-icons:'))
          .filter(
            (iconName) => !searchTerm || iconName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((iconName) => ({
            id: iconName,
            library: 'skill',
            name: iconName,
            component: (props) => <IconifyIcon icon={iconName} {...props} />,
            displayName: iconName.replace('skill-icons:', '').replace(/-/g, ' '),
            isIconify: true,
          }));
      }

      if (selectedLibrary === 'devicon') {
        return ICONIFY_LOGOS.filter((iconName) => iconName.startsWith('devicon:'))
          .filter(
            (iconName) => !searchTerm || iconName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((iconName) => ({
            id: iconName,
            library: 'devicon',
            name: iconName,
            component: (props) => <IconifyIcon icon={iconName} {...props} />,
            displayName: iconName.replace('devicon:', '').replace(/-/g, ' '),
            isIconify: true,
          }));
      }

      return [];
    }

    // Pour les bibliothèques React Icons classiques
    const module = libraryData.module;

    // Defensive check to ensure module is a valid object
    if (!module || typeof module !== 'object') return [];

    try {
      return Object.entries(module)
        .filter(([name, component]) => {
          // Vérifier que c'est une fonction
          if (typeof component !== 'function') return false;

          // Ne pas afficher les icônes non visuelles et les utilitaires
          if (name.startsWith('use') || name === 'IconContext') return false;

          // Exclure les patterns problématiques
          if (name.startsWith('create') || name === 'Fragment' || name === 'StrictMode')
            return false;

          // Pour Lucide, exclure les utilitaires et fonctions non-icon
          if (selectedLibrary === 'lucide' && name === 'createLucideIcon') return false;

          // Filtre de recherche
          if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

          return true;
        })
        .map(([name, component]) => ({
          id: `${selectedLibrary}-${name}`,
          library: selectedLibrary,
          name,
          component,
          displayName: name.replace(/([A-Z])/g, ' $1').trim(),
          isIconify: false,
        }))
        .slice(0, 500); // Limiter à 500 pour les performances
    } catch (error) {
      console.error(`Error loading icons for library ${selectedLibrary}:`, error);
      return [];
    }
  };

  const availableIcons = useMemo(() => getAvailableIcons(), [selectedLibrary, searchTerm]);

  // Catégories pour Lucide
  const getCategoriesForLibrary = () => {
    if (selectedLibrary === 'lucide') {
      return ICON_CATEGORIES.lucide || {};
    }
    // Pour les autres bibliothèques, pas de catégories
    return {};
  };

  const categories = useMemo(() => {
    const result = getCategoriesForLibrary();
    // Ensure categories is always a valid object
    return result && typeof result === 'object' ? result : {};
  }, [selectedLibrary]);

  // Filtrer les icônes par catégorie sélectionnée
  const filteredIcons = useMemo(() => {
    // Safety check: ensure categories is a valid object
    const safeCategories = categories && typeof categories === 'object' ? categories : {};

    // Si pas de catégories (non-Lucide), retourner toutes les icônes
    if (Object.keys(safeCategories).length === 0) {
      return availableIcons;
    }

    // Si Lucide et une catégorie est sélectionnée
    if (selectedLibrary === 'lucide' && selectedCategory && safeCategories[selectedCategory]) {
      const categoryIcons = safeCategories[selectedCategory];
      const filtered = availableIcons.filter((icon) => categoryIcons.includes(icon.name));
      // Si aucune icône trouvée dans la catégorie, retourner toutes les icônes
      if (filtered.length === 0) {
        console.warn(
          `Aucune icône trouvée pour la catégorie "${selectedCategory}". Affichage de toutes les icônes.`
        );
        return availableIcons;
      }
      return filtered;
    }
    return availableIcons;
  }, [availableIcons, selectedLibrary, selectedCategory, categories]);

  return (
    <div className="space-y-4">
      {/* Affichage de l'icône sélectionnée */}
      {selectedIcon && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded">
              {selectedIcon.svg ? (
                // Afficher le SVG stocké directement
                <div dangerouslySetInnerHTML={{ __html: selectedIcon.svg }} />
              ) : selectedIcon.component ? (
                selectedIcon.isIconify ? (
                  <selectedIcon.component
                    style={{ width: '32px', height: '32px', fontSize: '32px' }}
                  />
                ) : (
                  <selectedIcon.component className="w-8 h-8" />
                )
              ) : null}
            </div>
            <div>
              <p className="font-semibold text-sm">{selectedIcon.displayName}</p>
              <p className="text-xs text-gray-600">
                {IconLibraryMap[selectedIcon.library]?.label || 'Icône personnalisée'}
                {selectedIcon.isIconify && ' (Couleur)'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Bouton pour ouvrir/fermer */}
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between"
      >
        <span>{selectedIcon ? 'Changer' : 'Sélectionner'} une icône</span>
        <Search className="w-4 h-4" />
      </Button>

      {/* Panel de sélection */}
      {isOpen && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          {/* Barre de recherche */}
          {showSearch && (
            <div>
              <Input
                placeholder="Chercher une icône..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Sélecteur de bibliothèque */}
          {showLibraryTabs && libraries.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {libraries.map((lib) => (
                <Button
                  type="button"
                  key={lib}
                  variant={selectedLibrary === lib ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedLibrary(lib);
                    setSearchTerm('');
                    setSelectedCategory(defaultCategory);
                  }}
                  className="text-xs"
                >
                  {IconLibraryMap[lib]?.label || lib}
                </Button>
              ))}
            </div>
          )}

          {/* Sélecteur de catégorie (pour Lucide) */}
          {selectedLibrary === 'lucide' && Object.keys(categories).length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Catégorie</label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(categories).map((cat) => (
                  <Button
                    type="button"
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="text-xs"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Grille d'icônes */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-96 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((icon) => {
                // Les icônes ont déjà été validées, simple guard par sécurité
                if (!icon.component) {
                  return null;
                }

                const isColoredIcon = icon.isIconify || false;

                return (
                  <button
                    type="button"
                    key={icon.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(icon);
                      setIsOpen(false);
                    }}
                    className={`p-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center border border-transparent hover:border-blue-300 ${
                      isColoredIcon ? 'bg-white' : ''
                    }`}
                    title={icon.displayName}
                  >
                    {isColoredIcon ? (
                      <icon.component className="w-6 h-6" style={{ fontSize: '24px' }} />
                    ) : (
                      <icon.component className="w-5 h-5" />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-500 py-4">Aucune icône trouvée</p>
            )}
          </div>

          {/* Stats */}
          <div className="text-xs text-gray-600 text-center">
            {filteredIcons.length} icône{filteredIcons.length > 1 ? 's' : ''} disponible
            {searchTerm && ` (filtrées: "${searchTerm}")`}
          </div>
        </div>
      )}
    </div>
  );
}

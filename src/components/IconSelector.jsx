import React, { useState, useMemo } from 'react';
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

/**
 * Sélecteur d'icônes réutilisable
 * 
 * Props:
 * - selectedIcon: { library, name, component, displayName } (optionnel)
 * - onSelect: fonction appelée quand l'utilisateur sélectionne une icône
 * - onRemove: fonction appelée quand on supprime l'icône
 * - libraries: ['lucide', 'fa6', 'bs', 'md', 'fi', 'hi2', 'ai'] ou tous
 * - defaultCategory: catégorie à afficher par défaut
 * - showSearch: afficher la barre de recherche (défaut: true)
 * 
 * Exemple:
 * <IconSelector
 *   selectedIcon={selectedIcon}
 *   onSelect={(icon) => setSelectedIcon(icon)}
 *   onRemove={() => setSelectedIcon(null)}
 *   libraries={['lucide', 'fa6']}
 * />
 */

const IconLibraryMap = {
  lucide: { module: LucideIcons || {}, prefix: '', color: '#181818', label: 'Lucide' },
  fa6: { module: FontAwesome6 || {}, prefix: 'fa', color: '#0184BC', label: 'Font Awesome 6' },
  bs: { module: BootstrapIcons || {}, prefix: 'bs', color: '#7952B3', label: 'Bootstrap Icons' },
  md: { module: MaterialIcons || {}, prefix: 'md', color: '#00BCD4', label: 'Material Design' },
  fi: { module: FeatherIcons || {}, prefix: 'fi', color: '#000000', label: 'Feather' },
  hi2: { module: HeroiconsIcons || {}, prefix: 'hi', color: '#6366F1', label: 'Heroicons' },
  ai: { module: AntIcons || {}, prefix: 'ai', color: '#1890FF', label: 'Ant Design' },
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
    if (!libraryData || !libraryData.module) return [];

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
          if (name.startsWith('create') || name === 'Fragment' || name === 'StrictMode') return false;
          
          // Filtre de recherche
          if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          
          // Validation stricte pour les composants rendables
          try {
            React.createElement(component);
            return true;
          } catch (e) {
            return false;
          }
        })
        .map(([name, component]) => ({
          id: `${selectedLibrary}-${name}`,
          library: selectedLibrary,
          name,
          component,
          displayName: name.replace(/([A-Z])/g, ' $1').trim(),
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
      const filtered = availableIcons.filter(icon => categoryIcons.includes(icon.name));
      // Si aucune icône trouvée dans la catégorie, retourner toutes les icônes
      if (filtered.length === 0) {
        console.warn(`Aucune icône trouvée pour la catégorie "${selectedCategory}". Affichage de toutes les icônes.`);
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
            <div className="w-12 h-12 flex items-center justify-center">
              {selectedIcon.component && (
                <selectedIcon.component className="w-8 h-8" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{selectedIcon.displayName}</p>
              <p className="text-xs text-gray-600">
                {IconLibraryMap[selectedIcon.library]?.label}
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
              ))}}
            </div>
          )}

          {/* Sélecteur de catégorie (pour Lucide) */}
          {selectedLibrary === 'lucide' && Object.keys(categories).length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Catégorie
              </label>
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
                ))}}
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
                return (
                  <button
                    type="button"
                    key={icon.id}
                    onClick={() => {
                      onSelect(icon);
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center border border-transparent hover:border-blue-300"
                    title={icon.displayName}
                  >
                    <icon.component className="w-5 h-5" />
                  </button>
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-500 py-4">
                Aucune icône trouvée
              </p>
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

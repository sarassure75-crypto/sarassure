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
  lucide: { module: LucideIcons, prefix: '', color: '#181818', label: 'Lucide' },
  fa6: { module: FontAwesome6, prefix: 'fa', color: '#0184BC', label: 'Font Awesome 6' },
  bs: { module: BootstrapIcons, prefix: 'bs', color: '#7952B3', label: 'Bootstrap Icons' },
  md: { module: MaterialIcons, prefix: 'md', color: '#00BCD4', label: 'Material Design' },
  fi: { module: FeatherIcons, prefix: 'fi', color: '#000000', label: 'Feather' },
  hi2: { module: HeroiconsIcons, prefix: 'hi', color: '#6366F1', label: 'Heroicons' },
  ai: { module: AntIcons, prefix: 'ai', color: '#1890FF', label: 'Ant Design' },
};

const ICON_CATEGORIES = {
  lucide: {
    'Statut': ['CheckCircle', 'Check', 'XCircle', 'AlertCircle', 'AlertTriangle', 'Info', 'Circle'],
    'Contact': ['Phone', 'PhoneCall', 'PhoneOff', 'Mail', 'MessageSquare', 'Send', 'AtSign'],
    'Actions': ['Plus', 'Minus', 'Edit', 'Copy', 'Trash', 'Download', 'Upload', 'Search'],
    'Navigation': ['ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'Home', 'Map'],
    'Utilisateurs': ['User', 'Users', 'Lock', 'Unlock', 'Eye', 'EyeOff'],
    'Fichiers': ['FileText', 'File', 'Folder', 'FolderOpen', 'Archive'],
    'Média': ['Image', 'Music', 'Volume2', 'Mic'],
    'Outils': ['Settings', 'Filter', 'Sliders', 'Package'],
    'Évaluation': ['Star', 'Heart', 'Trophy', 'Award', 'Flag'],
  },
};

export default function IconSelector({
  selectedIcon = null,
  onSelect = () => {},
  onRemove = () => {},
  libraries = ['lucide', 'fa6', 'bs', 'md'],
  defaultCategory = 'Statut',
  showSearch = true,
  showLibraryTabs = true,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState(libraries[0] || 'lucide');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [isOpen, setIsOpen] = useState(false);

  // Récupérer les icônes disponibles pour la bibliothèque sélectionnée
  const getAvailableIcons = () => {
    const libraryData = IconLibraryMap[selectedLibrary];
    if (!libraryData) return [];

    const module = libraryData.module;
    return Object.entries(module)
      .filter(([name]) => {
        // Ne pas afficher les icônes non visuelles
        if (name.startsWith('use') || name === 'IconContext') return false;
        if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      })
      .map(([name, component]) => ({
        id: `${selectedLibrary}-${name}`,
        library: selectedLibrary,
        name,
        component,
        displayName: name.replace(/([A-Z])/g, ' $1').trim(),
      }))
      .slice(0, 500); // Limiter à 500 pour les performances
  };

  const availableIcons = useMemo(() => getAvailableIcons(), [selectedLibrary, searchTerm]);

  // Catégories pour Lucide
  const getCategoriesForLibrary = () => {
    if (selectedLibrary === 'lucide') {
      return ICON_CATEGORIES.lucide;
    }
    // Pour les autres bibliothèques, pas de catégories
    return {};
  };

  const categories = useMemo(() => getCategoriesForLibrary(), [selectedLibrary]);

  // Filtrer les icônes par catégorie sélectionnée
  const filteredIcons = useMemo(() => {
    if (selectedLibrary === 'lucide' && selectedCategory && categories[selectedCategory]) {
      const categoryIcons = categories[selectedCategory];
      return availableIcons.filter(icon => categoryIcons.includes(icon.name));
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
              <selectedIcon.component className="w-8 h-8" />
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
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Catégorie
              </label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(categories).map((cat) => (
                  <Button
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
              filteredIcons.map((icon) => (
                <button
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
              ))
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

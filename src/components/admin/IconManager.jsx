import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Copy, Check, Plus, Loader } from 'lucide-react';
import * as FA from 'react-icons/fa6';
import * as BI from 'react-icons/bi';
import * as MD from 'react-icons/md';
import * as FI from 'react-icons/fi';
import * as HI from 'react-icons/hi2';
import * as AI from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';
import { ICON_LIBRARIES, getEnabledLibraries } from '@/lib/iconLibraries';
import { useToast } from '@/components/ui/use-toast';

// Liste des icônes Iconify populaires (logos Android)
const ICONIFY_LOGOS = [
  'logos:whatsapp-icon',
  'logos:google-chrome',
  'logos:firefox',
  'logos:youtube-icon',
  'logos:gmail',
  'logos:google-maps',
  'logos:instagram-icon',
  'logos:facebook',
  'logos:messenger',
  'logos:twitter',
  'logos:linkedin-icon',
  'logos:tiktok-icon',
  'logos:snapchat-icon',
  'logos:telegram',
  'logos:spotify-icon',
  'logos:netflix-icon',
  'logos:amazon',
  'logos:ebay',
  'logos:paypal',
  'logos:uber-icon',
  'logos:airbnb-icon',
  'logos:dropbox',
  'logos:skype',
  'logos:zoom-icon',
  'logos:microsoft-teams',
  'logos:slack-icon',
  'logos:discord-icon',
  'logos:reddit-icon',
  'logos:pinterest',
  'logos:twitch',
  'logos:soundcloud',
  'logos:shazam',
  'logos:waze',
  'logos:tripadvisor',
  'logos:booking-icon',
  'logos:google-drive',
  'logos:google-photos',
  'logos:google-play-icon',
  'logos:apple',
  'logos:microsoft-icon',
  'logos:android-icon',
];

/**
 * Gestionnaire d'icônes
 * Interface pour explorer, rechercher et sélectionner des icônes
 * Permet d'enrichir la bibliothèque personnalisée
 */
const IconManager = ({ onSelectIcon }) => {
  const [selectedLibrary, setSelectedLibrary] = useState('lucide');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIcon, setCopiedIcon] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customCollections, setCustomCollections] = useState([]);
  const { toast } = useToast();

  // Obtenir les icônes disponibles par bibliothèque
  const getLibraryIcons = () => {
    const icons = [];

    // Bibliothèque Iconify (logos colorés)
    if (selectedLibrary === 'logos') {
      ICONIFY_LOGOS.forEach((iconName) => {
        icons.push({
          name: iconName.replace('logos:', ''),
          fullName: iconName,
          component: (props) => <IconifyIcon icon={iconName} {...props} />,
          library: 'logos',
          isIconify: true,
        });
      });
      return icons;
    }

    switch (selectedLibrary) {
      case 'fa':
        // Font Awesome - parcourir les icônes disponibles
        Object.entries(FA).forEach(([name, component]) => {
          if (typeof component === 'function') {
            icons.push({ name, component, library: 'fa' });
          }
        });
        break;
      case 'bi':
        Object.entries(BI).forEach(([name, component]) => {
          if (typeof component === 'function') {
            icons.push({ name, component, library: 'bi' });
          }
        });
        break;
      case 'md':
        Object.entries(MD).forEach(([name, component]) => {
          if (typeof component === 'function') {
            icons.push({ name, component, library: 'md' });
          }
        });
        break;
      case 'fi':
        Object.entries(FI).forEach(([name, component]) => {
          if (typeof component === 'function') {
            icons.push({ name, component, library: 'fi' });
          }
        });
        break;
      case 'hi':
        Object.entries(HI).forEach(([name, component]) => {
          if (typeof component === 'function') {
            icons.push({ name, component, library: 'hi' });
          }
        });
        break;
      case 'ai':
        Object.entries(AI).forEach(([name, component]) => {
          if (typeof component === 'function') {
            icons.push({ name, component, library: 'ai' });
          }
        });
        break;
      default:
        break;
    }

    return icons;
  };

  // Filtrer les icônes selon la recherche
  const filteredIcons = useMemo(() => {
    const allIcons = getLibraryIcons();
    if (!searchTerm) return allIcons;
    return allIcons.filter(icon =>
      icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedLibrary, searchTerm]);

  // Copier la référence de l'icône
  const copyIconReference = (icon) => {
    // Pour Iconify, utiliser le format complet (ex: logos:whatsapp-icon)
    const reference = icon.isIconify ? icon.fullName : `${icon.library}-${icon.name}`;
    navigator.clipboard.writeText(reference);
    setCopiedIcon(reference);
    toast({
      title: 'Copié !',
      description: `Référence: ${reference}`,
      duration: 2000,
    });
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  const enabledLibraries = getEnabledLibraries();
  const currentLibrary = ICON_LIBRARIES[selectedLibrary];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎨 Gestionnaire d'Icônes</CardTitle>
          <CardDescription>
            Explorez et sélectionnez des icônes parmi plusieurs bibliothèques pour enrichir votre collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection de la bibliothèque */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Bibliothèques d'icônes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Bibliothèque Iconify Logos */}
              <button
                onClick={() => {
                  setSelectedLibrary('logos');
                  setSearchTerm('');
                }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedLibrary === 'logos'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm">🎨 Logos Colorés (Android)</div>
                <div className="text-xs text-gray-600">Logos d'applications officiels</div>
                <div className="text-xs text-orange-600 font-medium mt-1">
                  {ICONIFY_LOGOS.length} icônes colorées
                </div>
              </button>

              {/* Bibliothèques existantes */}
              {enabledLibraries.map((lib) => (
                <button
                  key={lib.id}
                  onClick={() => {
                    setSelectedLibrary(lib.id);
                    setSearchTerm('');
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedLibrary === lib.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{lib.name}</div>
                  <div className="text-xs text-gray-600">{lib.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {lib.id === 'lucide' ? '65+ icônes' : filteredIcons.length + ' icônes disponibles'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Barre de recherche */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              🔍 Rechercher {selectedLibrary === 'logos' ? 'dans les Logos Colorés' : `dans ${currentLibrary?.name}`}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={selectedLibrary === 'logos' ? "Tapez le nom d'une app (ex: whatsapp, gmail, chrome)..." : "Tapez un mot clé (ex: phone, home, star)..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {filteredIcons.length} icône{filteredIcons.length > 1 ? 's' : ''} trouvée{filteredIcons.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Grille d'icônes */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Icônes disponibles {filteredIcons.length > 0 && `(${filteredIcons.length})`}
            </h3>
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {filteredIcons.slice(0, 500).map((icon) => {
                  const IconComponent = icon.component;
                  const reference = icon.isIconify ? icon.fullName : `${icon.library}-${icon.name}`;
                  const isCopied = copiedIcon === reference;
                  const isColoredIcon = icon.isIconify;

                  return (
                    <div key={reference} className="flex flex-col items-center">
                      <button
                        onClick={() => copyIconReference(icon)}
                        title={icon.name}
                        className={`w-14 h-14 rounded border-2 transition-all flex items-center justify-center hover:scale-110 ${
                          isCopied
                            ? 'border-green-500 bg-green-50'
                            : isColoredIcon
                            ? 'border-orange-200 bg-white hover:border-orange-400'
                            : 'border-gray-200 bg-white hover:border-blue-400'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <IconComponent className={isColoredIcon ? "w-7 h-7" : "w-6 h-6 text-gray-700"} />
                        )}
                      </button>
                      <span className="text-xs text-gray-600 mt-1 text-center truncate w-full px-1">
                        {icon.name.substring(0, 10)}
                      </span>
                      {isColoredIcon && (
                        <span className="text-[10px] text-orange-600 font-medium">Couleur</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Loader className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Aucune icône ne correspond à votre recherche</p>
              </div>
            )}
          </div>

          {/* Guide d'utilisation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <h4 className="font-semibold text-sm mb-2">💡 Comment utiliser ?</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>1. Sélectionnez une bibliothèque d'icônes (🎨 Logos Colorés pour apps Android)</li>
                <li>2. Recherchez une icône par mot clé</li>
                <li>3. Cliquez sur une icône pour copier sa référence</li>
                <li>4. Utilisez la référence dans IconSelector, zones d'action ou questionnaires</li>
              </ul>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded border border-blue-200">
                  <span className="font-semibold">Monochromes:</span> <code>library-iconName</code> (ex: <code>fa-Heart</code>)
                </p>
                <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded border border-orange-200">
                  <span className="font-semibold">Colorés:</span> <code>logos:app-name</code> (ex: <code>logos:whatsapp-icon</code>)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <h4 className="font-semibold text-sm mb-3">📊 Statistiques</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-orange-600 font-medium">🎨 Logos Colorés</div>
                  <div className="font-bold">{ICONIFY_LOGOS.length}</div>
                </div>
                <div>
                  <div className="text-gray-600">Lucide</div>
                  <div className="font-bold">65+</div>
                </div>
                <div>
                  <div className="text-gray-600">Font Awesome 6</div>
                  <div className="font-bold">4000+</div>
                </div>
                <div>
                  <div className="text-gray-600">Bootstrap Icons</div>
                  <div className="font-bold">2000+</div>
                </div>
                <div>
                  <div className="text-gray-600">Material Design</div>
                  <div className="font-bold">1000+</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Total disponible : <span className="font-bold text-orange-600">{ICONIFY_LOGOS.length} colorées</span> + <span className="font-bold">7000+ monochromes</span>
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconManager;

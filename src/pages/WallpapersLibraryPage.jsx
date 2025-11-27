import React from 'react';
import { Download, Home, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WallpapersLibraryPage() {
  const wallpapers = [
    {
      id: 'blue-gradient',
      name: 'Dégradé Bleu Océan',
      category: 'Couleurs',
      description: 'Bleu professionnel apaisant',
      file: 'blue-gradient.png',
      preview: '/wallpapers/png/blue-gradient.png'
    },
    {
      id: 'forest-green',
      name: 'Dégradé Vert Forêt',
      category: 'Couleurs',
      description: 'Vert nature relaxant',
      file: 'forest-green.png',
      preview: '/wallpapers/png/forest-green.png'
    },
    {
      id: 'sunset-sky',
      name: 'Coucher de Soleil',
      category: 'Ciel',
      description: 'Dégradé chaleureux orange-rose',
      file: 'sunset-sky.png',
      preview: '/wallpapers/png/sunset-sky.png'
    },
    {
      id: 'soft-gray',
      name: 'Gris Doux',
      category: 'Neutres',
      description: 'Gris neutre pour apps système',
      file: 'soft-gray.png',
      preview: '/wallpapers/png/soft-gray.png'
    },
    {
      id: 'lavender',
      name: 'Lavande',
      category: 'Couleurs',
      description: 'Violet doux apaisant',
      file: 'lavender.png',
      preview: '/wallpapers/png/lavender.png'
    },
    {
      id: 'geometric-shapes',
      name: 'Formes Géométriques',
      category: 'Abstrait',
      description: 'Motifs géométriques modernes',
      file: 'geometric-shapes.png',
      preview: '/wallpapers/png/geometric-shapes.png'
    },
    {
      id: 'ocean-waves',
      name: 'Vagues Océan',
      category: 'Paysages',
      description: 'Vagues stylisées apaisantes',
      file: 'ocean-waves.png',
      preview: '/wallpapers/png/ocean-waves.png'
    },
    {
      id: 'mountain-sunrise',
      name: 'Lever de Soleil Montagne',
      category: 'Paysages',
      description: 'Silhouette montagne au lever du soleil',
      file: 'mountain-sunrise.png',
      preview: '/wallpapers/png/mountain-sunrise.png'
    },
    {
      id: 'starry-night',
      name: 'Ciel Étoilé',
      category: 'Ciel',
      description: 'Nuit étoilée avec voie lactée',
      file: 'starry-night.png',
      preview: '/wallpapers/png/starry-night.png'
    },
    {
      id: 'green-circles',
      name: 'Cercles Verts',
      category: 'Abstrait',
      description: 'Cercles géométriques sur fond vert',
      file: 'green-circles.png',
      preview: '/wallpapers/png/green-circles.png'
    },
    {
      id: 'green-hexagons',
      name: 'Hexagones Verts',
      category: 'Abstrait',
      description: 'Motifs hexagonaux vert turquoise',
      file: 'green-hexagons.png',
      preview: '/wallpapers/png/green-hexagons.png'
    },
    {
      id: 'green-waves-abstract',
      name: 'Vagues Vertes Abstraites',
      category: 'Abstrait',
      description: 'Vagues fluides dégradé vert',
      file: 'green-waves-abstract.png',
      preview: '/wallpapers/png/green-waves-abstract.png'
    },
    {
      id: 'green-hills-landscape',
      name: 'Collines Vertes',
      category: 'Paysages',
      description: 'Paysage collines avec soleil',
      file: 'green-hills-landscape.png',
      preview: '/wallpapers/png/green-hills-landscape.png'
    },
    {
      id: 'green-triangles',
      name: 'Triangles Verts',
      category: 'Abstrait',
      description: 'Formes triangulaires superposées',
      file: 'green-triangles.png',
      preview: '/wallpapers/png/green-triangles.png'
    },
    {
      id: 'green-forest-trees',
      name: 'Forêt Verte Stylisée',
      category: 'Paysages',
      description: 'Arbres géométriques vert forêt',
      file: 'green-forest-trees.png',
      preview: '/wallpapers/png/green-forest-trees.png'
    },
    {
      id: 'green-geometric-mesh',
      name: 'Grille Géométrique Verte',
      category: 'Abstrait',
      description: 'Grille circulaire design moderne',
      file: 'green-geometric-mesh.png',
      preview: '/wallpapers/png/green-geometric-mesh.png'
    }
  ];

  const handleDownload = (wallpaper) => {
    const link = document.createElement('a');
    link.href = wallpaper.preview;
    link.download = wallpaper.file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = ['Tous', ...new Set(wallpapers.map(w => w.category))];
  const [selectedCategory, setSelectedCategory] = React.useState('Tous');

  const filteredWallpapers = selectedCategory === 'Tous' 
    ? wallpapers 
    : wallpapers.filter(w => w.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <Home className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                  Bibliothèque de Fonds d'Écran
                </h1>
                <p className="text-gray-600 mt-1">
                  Téléchargez des wallpapers pour vos captures d'écran
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Comment utiliser ces fonds d'écran ?</h3>
              <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                <li>Téléchargez le fond d'écran de votre choix</li>
                <li>Définissez-le comme fond d'écran sur votre smartphone de test</li>
                <li>Faites vos captures d'écran avec l'application Android</li>
                <li>Uploadez les captures sur SARASSURE pour validation</li>
              </ol>
              <p className="text-xs text-blue-700 mt-2">
                ⚠️ N'utilisez que ces wallpapers fournis. Pas de photos personnelles ou images protégées.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wallpapers Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredWallpapers.map(wallpaper => (
            <div key={wallpaper.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Preview */}
              <div className="aspect-[9/16] bg-gray-100 relative overflow-hidden">
                <img
                  src={wallpaper.preview}
                  alt={wallpaper.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="mb-2">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{wallpaper.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{wallpaper.category}</p>
                </div>
                
                {/* Download Button */}
                <button
                  onClick={() => handleDownload(wallpaper)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📐 Format</h4>
              <p className="text-sm text-gray-600">
                Résolution : 1080x1920px<br/>
                Ratio : 9:16 (Portrait)<br/>
                Format : PNG optimisé
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📄 Licence</h4>
              <p className="text-sm text-gray-600">
                CC0 / Domaine Public<br/>
                Usage libre pour SARASSURE<br/>
                Créés spécifiquement pour contributeurs
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">❓ Besoin d'aide ?</h4>
              <p className="text-sm text-gray-600">
                Consultez les CGU Contributeurs<br/>
                ou contactez l'équipe admin<br/>
                pour plus d'informations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

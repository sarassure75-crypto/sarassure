import React, { useState, useEffect } from 'react';
import { Download, Home, Image as ImageIcon, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function WallpapersLibraryPage() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // Load wallpapers from app_images table (category = 'wallpaper')
  useEffect(() => {
    const loadWallpapers = async () => {
      try {
        setLoading(true);
        const { data, error: queryError } = await supabase
          .from('app_images')
          .select('id, name, file_path, description, category')
          .eq('category', 'wallpaper')
          .order('name');

        if (queryError) throw queryError;

        // Format data for display
        const formattedWallpapers = data.map((img) => ({
          id: img.id,
          name: img.name,
          category: "Fonds d'écran",
          description: img.description || img.name,
          file: img.file_path.split('/').pop(), // Get filename from path
          file_path: img.file_path,
          preview:
            supabase.storage.from('images').getPublicUrl(img.file_path).data?.publicUrl ||
            img.file_path,
        }));

        setWallpapers(formattedWallpapers);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement wallpapers:', err);
        setError("Impossible de charger les fonds d'écran. Veuillez réessayer.");
        // Fallback to empty array
        setWallpapers([]);
      } finally {
        setLoading(false);
      }
    };

    loadWallpapers();
  }, []);

  const handleDownload = (wallpaper) => {
    const link = document.createElement('a');
    link.href = wallpaper.preview;
    link.download = wallpaper.file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories =
    wallpapers.length > 0 ? ['Tous', ...new Set(wallpapers.map((w) => w.category))] : ['Tous'];

  const filteredWallpapers =
    selectedCategory === 'Tous'
      ? wallpapers
      : wallpapers.filter((w) => w.category === selectedCategory);

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
                ⚠️ N'utilisez que ces wallpapers fournis. Pas de photos personnelles ou images
                protégées.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">Chargement des fonds d'écran...</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && wallpapers.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
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
      )}

      {/* Empty State */}
      {!loading && wallpapers.length === 0 && !error && (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun fond d'écran disponible
            </h3>
            <p className="text-gray-600">
              Les fonds d'écran sont en cours de chargement. Veuillez réessayer.
            </p>
          </div>
        </div>
      )}

      {/* Wallpapers Grid */}
      {!loading && wallpapers.length > 0 && (
        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredWallpapers.map((wallpaper) => (
              <div
                key={wallpaper.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Preview */}
                <div className="aspect-[9/16] bg-gray-100 relative overflow-hidden">
                  <img
                    src={wallpaper.preview}
                    alt={wallpaper.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="mb-2">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {wallpaper.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{wallpaper.description}</p>
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

          {filteredWallpapers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun fond d'écran trouvé dans cette catégorie.</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📐 Format</h4>
              <p className="text-sm text-gray-600">
                Résolution : 1080x1920px
                <br />
                Ratio : 9:16 (Portrait)
                <br />
                Format : PNG optimisé
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📄 Licence</h4>
              <p className="text-sm text-gray-600">
                CC0 / Domaine Public
                <br />
                Usage libre pour SARASSURE
                <br />
                Créés spécifiquement pour contributeurs
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">❓ Besoin d'aide ?</h4>
              <p className="text-sm text-gray-600">
                Consultez les CGU Contributeurs
                <br />
                ou contactez l'équipe admin
                <br />
                pour plus d'informations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

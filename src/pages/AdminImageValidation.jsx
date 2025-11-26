import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { useAdminCounters } from '../hooks/useAdminCounters';
import AdminTabNavigation from '../components/admin/AdminTabNavigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Eye,
  Trash2,
  Image,
  Home
} from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AdminImageValidation() {
  const { currentUser } = useAuth();
  const { counters } = useAdminCounters();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [validatingId, setValidatingId] = useState(null);

  // Charger les images en attente de validation
  useEffect(() => {
    loadPendingImages();
  }, []);

  const loadPendingImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('images_metadata')
        .select(`
          *,
          uploader:uploaded_by (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('moderation_status', 'pending')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
      if (data && data.length > 0) {
        setSelectedImage(data[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveImage = async (imageId) => {
    setValidatingId(imageId);
    try {
      const { error } = await supabase
        .from('images_metadata')
        .update({ 
          moderation_status: 'approved',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', imageId);

      if (error) throw error;

      // Retirer l'image de la liste
      setImages(images.filter(img => img.id !== imageId));
      
      // Charger l'image suivante
      if (images.length > 1) {
        const newIndex = Math.min(currentIndex, images.length - 2);
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
      } else {
        setSelectedImage(null);
      }

      alert('✅ Image approuvée!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setValidatingId(null);
    }
  };

  const rejectImage = async (imageId) => {
    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    setValidatingId(imageId);
    try {
      const { error } = await supabase
        .from('images_metadata')
        .update({ 
          moderation_status: 'rejected',
          rejection_reason: reason,
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', imageId);

      if (error) throw error;

      // Retirer l'image de la liste
      setImages(images.filter(img => img.id !== imageId));
      
      // Charger l'image suivante
      if (images.length > 1) {
        const newIndex = Math.min(currentIndex, images.length - 2);
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
      } else {
        setSelectedImage(null);
      }

      alert('✅ Image rejetée');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setValidatingId(null);
    }
  };

  const deleteImage = async (imageId) => {
    if (!confirm('Êtes-vous sûr?')) return;

    setValidatingId(imageId);
    try {
      // Supprimer de la storage
      const image = images.find(img => img.id === imageId);
      if (image?.file_path) {
        await supabase.storage
          .from('images')
          .remove([image.file_path]);
      }

      // Supprimer les métadonnées
      const { error } = await supabase
        .from('images_metadata')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      // Retirer l'image de la liste
      setImages(images.filter(img => img.id !== imageId));
      
      if (images.length > 1) {
        const newIndex = Math.min(currentIndex, images.length - 2);
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
      } else {
        setSelectedImage(null);
      }

      alert('✅ Image supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setValidatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="container mx-auto p-4">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-3xl">
              <Home className="mr-3 h-8 w-8 text-primary"/>
              Validation des images
            </CardTitle>
            <CardDescription>
              Validez les images soumises par les contributeurs
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Navigation Buttons */}
        <AdminTabNavigation counters={counters} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune image à valider</h3>
          <p className="text-gray-600">Toutes les images en attente ont été validées!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-3xl">
            <Home className="mr-3 h-8 w-8 text-primary"/>
            Validation des images
          </CardTitle>
          <CardDescription>
            {images.length} image(s) en attente de validation
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Navigation Buttons */}
      <AdminTabNavigation counters={counters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prévisualisation grande */}
        {selectedImage && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Image */}
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <img
                  src={selectedImage.public_url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Infos */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedImage.title}</h2>
                  <p className="text-gray-600 mt-2">{selectedImage.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Catégorie</span>
                    <p className="font-medium text-gray-900 capitalize">{selectedImage.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date</span>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedImage.uploaded_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600 text-sm">Tags</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedImage.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contributeur */}
                {selectedImage.uploader && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Soumis par</p>
                    <p className="text-gray-900 font-medium">
                      {selectedImage.uploader.first_name} {selectedImage.uploader.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{selectedImage.uploader.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rôle: <span className="font-medium">{selectedImage.uploader.role}</span>
                    </p>
                  </div>
                )}

                {/* Avertissement */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">À vérifier avant d'approuver:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Aucune donnée personnelle visible</li>
                        <li>Qualité d'image acceptable</li>
                        <li>Contenu approprié pour l'app</li>
                        <li>Pas de contenu dupliqué</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => approveImage(selectedImage.id)}
                    disabled={validatingId === selectedImage.id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => rejectImage(selectedImage.id)}
                    disabled={validatingId === selectedImage.id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    <span>Rejeter</span>
                  </button>
                  <button
                    onClick={() => deleteImage(selectedImage.id)}
                    disabled={validatingId === selectedImage.id}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des images */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                En attente ({images.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setSelectedImage(image);
                    setCurrentIndex(index);
                  }}
                  className={`w-full p-3 text-left border-b transition-colors ${
                    selectedImage?.id === image.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={image.public_url}
                    alt={image.title}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {image.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {image.uploader?.first_name} {image.uploader?.last_name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

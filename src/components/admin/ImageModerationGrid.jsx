import React, { useState } from 'react';
import { useImageLibrary, useImageActions } from '../../hooks/useImageLibrary';
import {
  CheckCircle,
  XCircle,
  Eye,
  X,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';

export default function ImageModerationGrid() {
  const { images, loading, refresh } = useImageLibrary({ moderationStatus: 'pending' });
  const { approveImage, rejectImage, loading: actionLoading } = useImageActions();

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]); // Pour actions en masse
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [imageToReject, setImageToReject] = useState(null);

  // Sélection multiple
  const toggleImageSelection = (imageId) => {
    setSelectedImages((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  };

  const selectAll = () => {
    if (selectedImages.length === images?.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images?.map((img) => img.id) || []);
    }
  };

  // Approuver
  const handleApprove = async (imageId) => {
    const result = await approveImage(imageId);
    if (result.success) {
      refresh();
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  };

  // Approuver en masse
  const handleBulkApprove = async () => {
    if (selectedImages.length === 0) return;

    if (!window.confirm(`Approuver ${selectedImages.length} image(s) ?`)) return;

    let successCount = 0;
    for (const imageId of selectedImages) {
      const result = await approveImage(imageId);
      if (result.success) successCount++;
    }

    alert(`✅ ${successCount} image(s) approuvée(s)`);
    setSelectedImages([]);
    refresh();
  };

  // Rejeter
  const handleReject = async (imageId, reason) => {
    const result = await rejectImage(imageId, reason);
    if (result.success) {
      setShowRejectModal(false);
      setImageToReject(null);
      setRejectReason('');
      refresh();
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  };

  // Ouvrir modal rejet
  const openRejectModal = (image) => {
    setImageToReject(image);
    setShowRejectModal(true);
  };

  // Formatage date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (images?.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tout est validé !</h3>
        <p className="text-gray-600">Aucune image en attente de modération</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions en masse */}
      {selectedImages.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
          <div className="text-purple-900">
            <strong>{selectedImages.length}</strong> image(s) sélectionnée(s)
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedImages([])}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Désélectionner
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={actionLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approuver la sélection</span>
            </button>
          </div>
        </div>
      )}

      {/* Sélection globale */}
      <div className="flex items-center justify-between">
        <button
          onClick={selectAll}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {selectedImages.length === images?.length ? 'Désélectionner tout' : 'Sélectionner tout'}
        </button>
        <div className="text-sm text-gray-600">{images?.length} image(s) à modérer</div>
      </div>

      {/* Grille d'images */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden transition-all ${
              selectedImages.includes(image.id)
                ? 'border-purple-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Checkbox sélection */}
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedImages.includes(image.id)}
                onChange={() => toggleImageSelection(image.id)}
                className="absolute top-2 left-2 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer z-10"
              />

              {/* Image */}
              <div
                className="aspect-square bg-gray-100 cursor-pointer group relative"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.public_url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Infos */}
            <div className="p-3 space-y-2">
              <h4 className="font-medium text-gray-900 truncate text-sm">{image.title}</h4>

              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>ID: {image.contributor_id?.slice(0, 8)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(image.created_at)}</span>
                </div>
                {image.tags && image.tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3 h-3" />
                    <span>{image.tags.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Catégorie */}
              <div className="pt-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize">
                  {image.category}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-t">
              <button
                onClick={() => openRejectModal(image)}
                disabled={actionLoading}
                className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 text-sm"
              >
                <XCircle className="w-4 h-4" />
                <span>Rejeter</span>
              </button>
              <button
                onClick={() => handleApprove(image.id)}
                disabled={actionLoading}
                className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approuver</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Prévisualisation */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <span className="capitalize">{selectedImage.category}</span>
                  <span>•</span>
                  <span>{formatDate(selectedImage.created_at)}</span>
                  <span>•</span>
                  <span>ID: {selectedImage.contributor_id?.slice(0, 8)}</span>
                </div>
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedImage.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-white hover:text-gray-300"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <img
              src={selectedImage.public_url}
              alt={selectedImage.title}
              className="w-full h-auto rounded-lg mb-4"
            />

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  openRejectModal(selectedImage);
                  setSelectedImage(null);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
                <span>Rejeter</span>
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedImage.id);
                  setSelectedImage(null);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approuver</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejet */}
      {showRejectModal && imageToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Rejeter l'image</h3>
              <p className="text-sm text-gray-600 mt-1">{imageToReject.title}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Prévisualisation */}
              <div className="flex justify-center">
                <img
                  src={imageToReject.public_url}
                  alt={imageToReject.title}
                  className="max-h-48 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du rejet *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Image floue, données personnelles visibles, contenu inapproprié..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Critères de rejet courants</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Données personnelles visibles (nom, téléphone, email réel)</li>
                      <li>Photo identifiable d'une personne réelle</li>
                      <li>Qualité insuffisante (floue, trop sombre)</li>
                      <li>Contenu inapproprié ou offensant</li>
                      <li>Image sous droits d'auteur</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-lg border-t">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setImageToReject(null);
                  setRejectReason('');
                }}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReject(imageToReject.id, rejectReason)}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirmer le rejet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

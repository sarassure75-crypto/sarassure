import React, { useState, useCallback, useEffect } from 'react';
import { 
  useImageLibrary, 
  useImageUpload, 
  useImageActions,
  usePendingImagesCount 
} from "../hooks/useImageLibrary";
import { useAuth } from "../contexts/AuthContext";
import { useContributorStats } from "../hooks/useContributions";
import { getImageSubcategories, DEFAULT_SUBCATEGORIES } from '../data/images';
import { useNavigate } from 'react-router-dom';
import CGUWarningBanner from '../components/CGUWarningBanner';
import { createClient } from "@supabase/supabase-js";
import { 
  Upload, 
  Search, 
  Grid, 
  List, 
  X, 
  Check,
  AlertTriangle,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  BookOpen,
  Paintbrush
} from 'lucide-react';
import ImageEditor from '@/components/ImageEditor';

export default function ContributorImageLibrary() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Stats hook
  const { stats: contributorStats, loading: statsLoading } = useContributorStats(currentUser?.id);
  
  // CGU Banner
  const [showCGUBanner, setShowCGUBanner] = useState(true);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [androidVersionFilter, setAndroidVersionFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [allExercises, setAllExercises] = useState([]);
  const [adminExercises, setAdminExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  
  // Éditeur d'image
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);

  // Upload states - declared before useEffect that uses them
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState("Capture d'écran");
  const [uploadSubcategory, setUploadSubcategory] = useState('général');
  const [uploadAndroidVersion, setUploadAndroidVersion] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState(['général', 'parametres', 'first acces']);

  // Load subcategories for gallery filter when category changes
  const [gallerySubcategories, setGallerySubcategories] = useState([]);
  useEffect(() => {
    const loadGallerySubcategories = async () => {
      if (categoryFilter && categoryFilter !== 'all') {
        const subcats = await getImageSubcategories(categoryFilter, true);
        setGallerySubcategories(subcats || []);
      } else {
        setGallerySubcategories([]);
      }
    };
    loadGallerySubcategories();
    setSubcategoryFilter('all'); // Reset subcategory filter when category changes
  }, [categoryFilter]);

  // Load subcategories when upload category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (uploadCategory && uploadCategory !== 'all') {
        const subcats = await getImageSubcategories(uploadCategory, true);
        if (subcats && subcats.length > 0) {
          setAvailableSubcategories(subcats);
        } else {
          setAvailableSubcategories(DEFAULT_SUBCATEGORIES);
        }
      } else {
        setAvailableSubcategories(DEFAULT_SUBCATEGORIES);
      }
    };
    loadSubcategories();
  }, [uploadCategory]);

  // Charger TOUS les exercices (admin + contributeurs) + les images admin
  useEffect(() => {
    const loadExercisesAndAdminImages = async () => {
      setExercisesLoading(true);
      try {
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );

        // Récupérer l'ID de l'admin
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'administrateur')
          .single();

        if (adminProfile) {
          // Récupérer TOUS les exercices (admin + contributeurs)
          const { data: allExercisesData } = await supabase
            .from('versions')
            .select('*')
            .order('created_at', { ascending: false });

          setAllExercises(allExercisesData || []);

          // Récupérer les exercices créés par l'admin (pour affichage spécial)
          const adminExercisesData = (allExercisesData || []).filter(
            ex => ex.created_by === adminProfile.id
          );
          setAdminExercises(adminExercisesData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des exercices:', error);
      } finally {
        setExercisesLoading(false);
      }
    };

    loadExercisesAndAdminImages();
  }, []);

  // Hooks - Récupérer TOUTES les images approuvées + les images de l'utilisateur
  const { images: allImages, loading, refresh } = useImageLibrary({
    // Afficher les images approuvées (de tous les contributeurs + admin)
    moderationStatus: 'approved',
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    searchTerm: searchTerm || undefined
  });

  // Apply subcategory and Android version filters
  const images = (allImages || []).filter(img => {
    if (subcategoryFilter !== 'all' && img.subcategory !== subcategoryFilter) {
      return false;
    }
    if (androidVersionFilter !== 'all' && img.android_version !== androidVersionFilter) {
      return false;
    }
    return true;
  });

  // Extract unique Android versions from all images for filter
  const availableAndroidVersions = ['all', ...new Set(
    (allImages || [])
      .map(img => img.android_version)
      .filter(v => v && v !== null && v !== '')
  )].sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    return parseInt(b) - parseInt(a);
  });

  const { upload, uploading, progress: uploadProgress } = useImageUpload();
  const { deleteImage } = useImageActions();
  const { count: pendingCount } = usePendingImagesCount();

  // État UI
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Statistiques
  const stats = {
    // Images du contributeur
    total: contributorStats?.images?.total || 0,
    approved: contributorStats?.images?.approved || 0,
    pending: contributorStats?.images?.pending || 0,
    rejected: contributorStats?.images?.rejected || 0,
    // Global context
    globalTotal: contributorStats?.global?.total_images || 0,
  };

  // Gestion du drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Sélection fichier
  const handleFileSelect = (file) => {
    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB
      alert('⚠️ L\'image dépasse 1MB. Veuillez la compresser avant de l\'uploader.');
      return;
    }

    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    setShowUploadModal(true);
  };

  // Upload image
  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    const tagsArray = uploadTags.split(',').map(tag => tag.trim()).filter(Boolean);

    const result = await upload(
      uploadFile,
      {
        title: uploadTitle,
        category: uploadCategory,
        subcategory: uploadSubcategory,
        android_version: uploadAndroidVersion.trim() || null,
        tags: tagsArray,
        contributor_id: currentUser.id
      },
      currentUser.id
    );

    if (result.success) {
      alert('✅ Image uploadée avec succès ! Elle sera validée par un modérateur.');
      setShowUploadModal(false);
      resetUploadForm();
      refresh();
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadCategory("Capture d'écran");
    setUploadSubcategory('général');
    setUploadAndroidVersion('');
    setUploadTags('');
  };

  // Suppression
  const handleDelete = async (imageId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      const result = await deleteImage(imageId);
      if (result.success) {
        refresh();
      }
    }
  };

  // Téléchargement
  const handleDownload = (image) => {
    const link = document.createElement('a');
    link.href = image.public_url;
    link.download = image.title || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ouvrir l'éditeur d'image
  const openImageEditor = (image) => {
    setImageToEdit(image);
    setIsImageEditorOpen(true);
  };

  // Sauvegarder l'image éditée
  const handleSaveEditedImage = async (blob) => {
    if (!imageToEdit) return;

    try {
      // Créer un fichier à partir du blob
      const file = new File([blob], `edited-${imageToEdit.title || 'image'}.png`, { type: 'image/png' });
      
      // Upload comme nouvelle image en utilisant le hook upload
      const result = await upload(
        file,
        {
          title: `${imageToEdit.title || 'image'} (éditée)`,
          category: imageToEdit.category || 'screenshot',
          subcategory: imageToEdit.subcategory || 'général',
          android_version: imageToEdit.android_version || null,
          tags: imageToEdit.tags || [],
          contributor_id: currentUser.id
        },
        currentUser.id
      );
      
      if (result.success) {
        setIsImageEditorOpen(false);
        alert('✅ Image modifiée uploadée avec succès');
        refresh();
      } else {
        alert(`❌ Erreur : ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving edited image:", error);
      alert('Erreur lors de la sauvegarde de l\'image modifiée');
    }
  };

  // Formatage date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Badge statut
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'En attente' },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approuvée' },
      rejected: { color: 'bg-red-100 text-red-700', icon: X, label: 'Rejetée' },
    };

    const badge = badges[status];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        <span>{badge.label}</span>
      </span>
    );
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* CGU Warning Banner */}
      {showCGUBanner && (
        <CGUWarningBanner 
          onClose={() => setShowCGUBanner(false)}
          onReadMore={() => navigate('/contributeur/cgu')}
        />
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bibliothèque d'Images</h1>
          <p className="text-gray-600 mt-1">Gérez vos captures d'écran et images</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span>Uploader une image</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Mes images</div>
            </div>
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
              <div className="text-sm text-green-600">Approuvées</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-300" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              <div className="text-sm text-yellow-600">En attente</div>
            </div>
            <Clock className="w-8 h-8 text-yellow-300" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">{stats.globalTotal}</div>
              <div className="text-sm text-blue-600">Total plateforme</div>
            </div>
            <BookOpen className="w-8 h-8 text-blue-300" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              <option value="Capture d'écran">Captures d'écran</option>
              <option value="Fond d'écran">Fonds d'écran</option>
              <option value="Icône">Icônes</option>
              <option value="Autre">Autres</option>
            </select>
          </div>

          {/* Vue */}
          <div className="flex items-center justify-end mt-4 space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sous-catégorie filters */}
        {gallerySubcategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Sous-catégories:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSubcategoryFilter('all')}
                className={`px-3 py-1 rounded text-sm ${
                  subcategoryFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              {gallerySubcategories.map(subcat => (
                <button
                  key={subcat}
                  onClick={() => setSubcategoryFilter(subcat)}
                  className={`px-3 py-1 rounded text-sm ${
                    subcategoryFilter === subcat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subcat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Android version filters */}
        {availableAndroidVersions.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Version Android:</div>
            <div className="flex flex-wrap gap-2">
              {availableAndroidVersions.map(version => (
                <button
                  key={version}
                  onClick={() => setAndroidVersionFilter(version)}
                  className={`px-3 py-1 rounded text-sm ${
                    androidVersionFilter === version
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {version === 'all' ? 'Toutes' : `Android ${version}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Galerie */}
      {images?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune image</h3>
          <p className="text-gray-600 mb-6">Commencez par uploader votre première image</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Uploader une image
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-4'}>
          {images.map((image) => (
            <div 
              key={image.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'flex items-center p-4 space-x-4' : ''
              }`}
            >
              {/* Image */}
              <div 
                className={`relative group cursor-pointer ${
                  viewMode === 'grid' ? 'aspect-square' : 'w-24 h-24 flex-shrink-0'
                }`}
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
                <div className="absolute top-2 right-2">
                  {getStatusBadge(image.moderation_status)}
                </div>
              </div>

              {/* Infos */}
              <div className={viewMode === 'grid' ? 'p-3' : 'flex-1'}>
                <h3 className="font-medium text-gray-900 truncate mb-1">{image.title}</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="capitalize">{image.category}</div>
                  <div>{formatDate(image.created_at)}</div>
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {image.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className={`flex ${viewMode === 'grid' ? 'px-3 pb-3 space-x-2' : 'space-x-2'}`}>
                <button
                  onClick={() => openImageEditor(image)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="Éditer (flou, masques)"
                >
                  <Paintbrush className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(image)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>
                {image.moderation_status === 'pending' && (
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercices de l'Admin */}
      {!exercisesLoading && adminExercises.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>Exercices proposés par l'administration</span>
            </h2>
            <p className="text-gray-600">Référencez ces exercices dans vos contributions</p>
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {adminExercises.map((exercise) => (
              <div 
                key={exercise.id}
                className={`bg-blue-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden hover:shadow-md transition-shadow p-4`}
              >
                <div className="flex items-start space-x-3 mb-3">
                  <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{exercise.name || 'Exercice sans titre'}</h3>
                    <p className="text-sm text-gray-600 mt-1">{exercise.description || 'Aucune description'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-2 border-t border-blue-100">
                  <span>ID: {exercise.id.substring(0, 8)}...</span>
                  <span>{exercise.difficulty_level || 'Non défini'}</span>
                </div>

                <button
                  onClick={() => {
                    // Copier l'ID dans le presse-papiers
                    navigator.clipboard.writeText(exercise.id);
                    alert("✅ ID de l'exercice copié!");
                  }}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Copier l'ID
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">Uploader une image</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!uploadFile && (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Glissez-déposez une image ici</p>
                  <p className="text-sm text-gray-500 mb-4">ou</p>
                  <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer inline-block transition-colors">
                    Sélectionner un fichier
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-4">Maximum 1MB - JPG, PNG, WebP</p>
                </div>
              )}

              {uploadFile && (
                <>
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(uploadFile)} 
                      alt="Preview"
                      className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                    />
                    <button
                      onClick={() => setUploadFile(null)}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Ecran accueil WhatsApp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Capture d'écran">Capture d'écran</option>
                      <option value="Fond d'écran">Fond d'écran</option>
                      <option value="Icône">Icône</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-catégorie
                    </label>
                    <select
                      value={uploadSubcategory}
                      onChange={(e) => setUploadSubcategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {availableSubcategories.map(subcat => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version Android
                    </label>
                    <input
                      type="text"
                      value={uploadAndroidVersion}
                      onChange={(e) => setUploadAndroidVersion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 14, 13, 12..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: whatsapp, message, android"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Rappel important</p>
                        <p>Vérifiez qu'aucune donnée personnelle (nom, téléphone, email réel, photo identifiable) n'apparaît dans l'image.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {uploadFile && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-lg border-t sticky bottom-0">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Upload en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Uploader</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Prévisualisation */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-semibold">{selectedImage.title}</h3>
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
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Éditeur d'image */}
      <ImageEditor
        open={isImageEditorOpen}
        onOpenChange={setIsImageEditorOpen}
        imageUrl={imageToEdit?.public_url}
        onSave={handleSaveEditedImage}
      />
    </div>
  );
}


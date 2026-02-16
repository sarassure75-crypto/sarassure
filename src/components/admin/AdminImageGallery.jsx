import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trash2,
  Edit,
  Search,
  X,
  Loader2,
  AlertTriangle,
  ImageDown as ImageUp,
  FolderPlus,
  FolderMinus,
  Layers,
  Paintbrush,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { debounce } from '@/lib/performance';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  updateImage as apiUpdateImage,
  deleteImage as apiDeleteImage,
  addImage,
  getImageCategories,
  addImageCategory,
  deleteImageCategory,
  getImageSubcategories,
  DEFAULT_SUBCATEGORIES,
} from '@/data/images';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdminImageTools from './AdminImageTools';
import ImageEditor from '@/components/ImageEditor';

// IMPORTANT: Define dialog components at module scope to avoid remounts
// that reset input values on each parent re-render.
function EditDialog({ open, onOpenChange, editImage, onSubmit, isEditing, adminCategories }) {
  const [selectedCategory, setSelectedCategory] = useState(editImage?.category || '');
  const [availableSubcategories, setAvailableSubcategories] = useState(DEFAULT_SUBCATEGORIES);
  const uniqueCats = useMemo(() => Array.from(new Set(adminCategories || [])), [adminCategories]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!selectedCategory) return;
      try {
        const subcats = await getImageSubcategories(selectedCategory);
        setAvailableSubcategories(subcats);
      } catch (error) {
        console.error('Error loading subcategories:', error);
        setAvailableSubcategories(DEFAULT_SUBCATEGORIES);
      }
    };
    loadSubcategories();
  }, [selectedCategory]);

  // Update selectedCategory when editImage changes
  useEffect(() => {
    if (editImage?.category) {
      setSelectedCategory(editImage.category);
    }
  }, [editImage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'image</DialogTitle>
          <DialogDescription>
            Modifiez le nom, la description et les métadonnées de l'image.
          </DialogDescription>
        </DialogHeader>
        {editImage && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden rounded-md">
              <img
                src={editImage.publicUrl}
                alt={editImage.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Nom</Label>
              <Input id="edit-name" name="name" defaultValue={editImage.name} required />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={editImage.description}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Catégorie</Label>
              <select
                id="edit-category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {(uniqueCats || [])
                  .filter((c) => c !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-subcategory">Sous-catégorie</Label>
              <select
                id="edit-subcategory"
                name="subcategory"
                defaultValue={editImage.subcategory || 'général'}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {availableSubcategories.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-android-version">Version Android</Label>
              <Input
                id="edit-android-version"
                name="android_version"
                defaultValue={editImage.android_version || ''}
                placeholder="Ex: Android 13"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Mettre à jour
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CategoryManager({ open, onOpenChange, adminCategories, refreshImageCategories }) {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const uniqueCats = useMemo(() => Array.from(new Set(adminCategories || [])), [adminCategories]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setIsLoading(true);
    try {
      await addImageCategory(newCategory.trim());
      toast({ title: 'Catégorie ajoutée' });
      setNewCategory('');
      await refreshImageCategories();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    handleAddCategory();
  };

  const handleCategoryInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleDeleteCategory = async (category) => {
    setIsLoading(true);
    try {
      await deleteImageCategory(category);
      toast({ title: 'Catégorie supprimée', variant: 'destructive' });
      await refreshImageCategories();
    } catch (e) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Layers className="mr-2 h-4 w-4" />
          Gérer les catégories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gérer les catégories d'images</DialogTitle>
          <DialogDescription>
            Ajoutez, supprimez ou gérez les catégories utilisées pour la galerie d'images.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <form onSubmit={handleSubmitCategory} className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={handleCategoryInputKeyDown}
              placeholder="Nouvelle catégorie..."
            />
            <Button type="submit" disabled={isLoading || !newCategory.trim()}>
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <FolderPlus className="h-4 w-4" />
              )}
            </Button>
          </form>
          <ScrollArea className="h-48">
            <ul className="space-y-2">
              {uniqueCats
                .filter((c) => c !== 'all')
                .map((cat) => (
                  <li key={cat} className="flex justify-between items-center p-2 border rounded-md">
                    <span>{cat}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
            </ul>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AdminImageGallery = () => {
  const {
    images: imagesMap,
    fetchAllData,
    imageCategories: adminCategories,
    refreshImageCategories,
    deleteImage,
  } = useAdmin();
  const uniqueCategories = useMemo(
    () => Array.from(new Set(adminCategories || [])),
    [adminCategories]
  );
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');

  // Debounce search term
  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    debouncedUpdate();
  }, [searchTerm]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);

  const images = useMemo(
    () => (imagesMap instanceof Map ? Array.from(imagesMap.values()) : []),
    [imagesMap]
  );

  // Load subcategories when category filter changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (categoryFilter === 'all') {
        setAvailableSubcategories([]);
        setSubcategoryFilter('all');
        return;
      }
      try {
        const subcats = await getImageSubcategories(categoryFilter);
        setAvailableSubcategories(subcats);
        setSubcategoryFilter('all');
      } catch (error) {
        console.error('Error loading subcategories:', error);
        setAvailableSubcategories([]);
      }
    };
    loadSubcategories();
  }, [categoryFilter]);

  const filteredImages = useMemo(() => {
    return images
      .filter((image) => {
        const term = debouncedSearchTerm.toLowerCase();
        const matchesSearch =
          image.name?.toLowerCase().includes(term) ||
          image.description?.toLowerCase().includes(term);
        const matchesCategory = categoryFilter === 'all' || image.category === categoryFilter;
        const matchesSubcategory =
          subcategoryFilter === 'all' || image.subcategory === subcategoryFilter;
        return matchesSearch && matchesCategory && matchesSubcategory;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [images, debouncedSearchTerm, categoryFilter, subcategoryFilter]);

  const handleImageProcessedAndUploaded = async (filePath, metadata, category = 'default') => {
    try {
      await addImage({
        name: metadata.customName || metadata.originalName.split('.').slice(0, -1).join('.'),
        description:
          metadata.customDescription || `Téléversé le ${new Date().toLocaleDateString()}`,
        category,
        subcategory: metadata.subcategory || 'général',
        file_path: filePath,
        android_version: metadata.androidVersion || 'Non spécifiée',
        metadata: { size: metadata.size, mimeType: metadata.mimeType },
      });
      toast({ title: 'Succès', description: 'Image ajoutée à la galerie.' });
      await fetchAllData(true);
    } catch (e) {
      console.error('Error adding image to db', e);
      toast({
        title: 'Erreur Base de données',
        description: "L'image a été téléversée mais n'a pas pu être ajoutée à la base de données.",
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (image) => {
    setEditImage(image);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editImage) return;

    const formData = new FormData(event.target);
    const name = formData.get('name');
    const description = formData.get('description');
    const category = formData.get('category');
    const subcategory = formData.get('subcategory');
    const android_version = formData.get('android_version');

    setIsEditing(true);
    try {
      await apiUpdateImage(editImage.id, {
        name,
        description,
        category,
        subcategory,
        android_version,
      });
      toast({ title: 'Succès', description: 'Image mise à jour.' });
      await fetchAllData(true);
      setIsEditDialogOpen(false);
      setEditImage(null);
    } catch (error) {
      console.error('Error updating image:', error);
      toast({ title: 'Erreur de mise à jour', description: error.message, variant: 'destructive' });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (image) => {
    try {
      await deleteImage(image.id, image.file_path);
      toast({ title: 'Succès', description: 'Image supprimée.' });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({ title: 'Erreur de suppression', description: error.message, variant: 'destructive' });
    }
  };

  // Ouvrir l'éditeur d'image
  const openImageEditor = (image) => {
    console.log('🎨 Ouverture éditeur pour image:', image);
    console.log('🖼️ URL publique:', image?.publicUrl);
    setImageToEdit(image);
    setIsImageEditorOpen(true);
  };

  // Sauvegarder l'image éditée
  const handleSaveEditedImage = async (blob) => {
    if (!imageToEdit || !blob) {
      console.error('Image ou blob manquant');
      return;
    }

    try {
      toast({
        title: 'Traitement...',
        description: "Sauvegarde de l'image modifiée en cours",
      });

      // Générer un nouveau nom de fichier
      const timestamp = Date.now();
      const fileExtension = imageToEdit.file_path.split('.').pop() || 'png';
      const newFileName = `${timestamp}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExtension}`;
      const newFilePath = `public/${newFileName}`;

      // Créer un fichier à partir du blob
      const file = new File([blob], newFileName, { type: 'image/png' });

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(newFilePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Mettre à jour la référence dans la base de données
      await apiUpdateImage(imageToEdit.id, {
        file_path: newFilePath,
        updated_at: new Date().toISOString(),
      });

      // Supprimer l'ancienne image du storage (optionnel)
      if (imageToEdit.file_path) {
        await supabase.storage.from('images').remove([imageToEdit.file_path]);
      }

      toast({
        title: 'Succès',
        description: 'Image modifiée sauvegardée avec succès',
      });

      setIsImageEditorOpen(false);
      setImageToEdit(null);
      await fetchAllData(true);
    } catch (error) {
      console.error('Error saving edited image:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de sauvegarder l'image modifiée",
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold">Galerie d'images</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:w-[200px] md:w-[300px]"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <AdminImageTools
            onImageProcessedAndUploaded={handleImageProcessedAndUploaded}
            categories={adminCategories}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {uniqueCategories.map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? 'secondary' : 'outline'}
            onClick={() => setCategoryFilter(cat)}
            className="capitalize"
          >
            {cat === 'all' ? 'Toutes' : cat}
          </Button>
        ))}
        <CategoryManager
          open={isCategoryManagerOpen}
          onOpenChange={setIsCategoryManagerOpen}
          adminCategories={adminCategories}
          refreshImageCategories={refreshImageCategories}
        />
      </div>

      {/* Subcategory filter - only show when a specific category is selected */}
      {categoryFilter !== 'all' && availableSubcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 ml-4">
          <span className="text-sm text-muted-foreground self-center mr-2">Sous-catégories:</span>
          <Button
            size="sm"
            variant={subcategoryFilter === 'all' ? 'default' : 'ghost'}
            onClick={() => setSubcategoryFilter('all')}
          >
            Toutes
          </Button>
          {availableSubcategories.map((subcat) => (
            <Button
              key={subcat}
              size="sm"
              variant={subcategoryFilter === subcat ? 'default' : 'ghost'}
              onClick={() => setSubcategoryFilter(subcat)}
              className="capitalize"
            >
              {subcat}
            </Button>
          ))}
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-250px)]">
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map((image) => (
              <Card key={image.id} className="overflow-hidden flex flex-col">
                <CardHeader className="p-0">
                  <div className="aspect-square w-full bg-muted flex items-center justify-center">
                    <img
                      src={image.publicUrl}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-3 flex-grow">
                  <CardTitle className="text-base font-semibold truncate">{image.name}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">{image.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(image.metadata?.size || 0)}
                  </p>
                </CardContent>
                <CardFooter className="p-2 flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openImageEditor(image)}
                    title="Éditer l'image (flou, masques)"
                  >
                    <Paintbrush className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(image)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. L'image sera supprimée définitivement du
                          stockage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(image)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <AlertTriangle className="mx-auto h-12 w-12" />
            <p className="mt-4">Aucune image trouvée pour les critères sélectionnés.</p>
          </div>
        )}
      </ScrollArea>

      {/* Dialog d'édition des métadonnées */}
      <EditDialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditImage(null);
          setIsEditDialogOpen(isOpen);
        }}
        editImage={editImage}
        onSubmit={handleUpdate}
        isEditing={isEditing}
        adminCategories={adminCategories}
      />

      {/* Éditeur d'image avec flou et masques */}
      <ImageEditor
        open={isImageEditorOpen}
        onOpenChange={setIsImageEditorOpen}
        imageUrl={imageToEdit?.publicUrl}
        onSave={handleSaveEditedImage}
      />
    </div>
  );
};

export default AdminImageGallery;

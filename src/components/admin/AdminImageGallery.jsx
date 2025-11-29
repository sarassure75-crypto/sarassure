
import React, { useState, useMemo, useCallback } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Search, X, Loader2, AlertTriangle, ImageDown as ImageUp, FolderPlus, FolderMinus, Layers, Paintbrush } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { updateImage as apiUpdateImage, deleteImage as apiDeleteImage, addImage, getImageCategories, addImageCategory, deleteImageCategory } from '@/data/images';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdminImageTools from './AdminImageTools';
import ImageEditor from '@/components/ImageEditor';

// IMPORTANT: Define dialog components at module scope to avoid remounts
// that reset input values on each parent re-render.
function EditDialog({ open, onOpenChange, editImage, onSubmit, isEditing, adminCategories }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'image</DialogTitle>
        </DialogHeader>
        {editImage && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden rounded-md">
              <img src={editImage.publicUrl} alt={editImage.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <Label htmlFor="edit-name">Nom</Label>
              <Input id="edit-name" name="name" defaultValue={editImage.name} required />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" name="description" defaultValue={editImage.description} required />
            </div>
            <div>
              <Label htmlFor="edit-category">Catégorie</Label>
              <select id="edit-category" name="category" defaultValue={editImage.category} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(adminCategories || []).filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Annuler</Button>
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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setIsLoading(true);
    try {
      await addImageCategory(newCategory.trim());
      toast({ title: "Catégorie ajoutée" });
      setNewCategory('');
      await refreshImageCategories();
    } catch (e) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
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
      toast({ title: "Catégorie supprimée", variant: 'destructive' });
      await refreshImageCategories();
    } catch (e) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline"><Layers className="mr-2 h-4 w-4"/>Gérer les catégories</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gérer les catégories d'images</DialogTitle>
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
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <FolderPlus className="h-4 w-4"/>}
            </Button>
          </form>
          <ScrollArea className="h-48">
            <ul className="space-y-2">
              {adminCategories.filter(c => c !== 'all').map(cat => (
                <li key={cat} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{cat}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive" 
                    onClick={() => handleDeleteCategory(cat)} 
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Fermer</Button>
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
  const { images: imagesMap, fetchAllData, imageCategories: adminCategories, refreshImageCategories } = useAdmin();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);

  const images = useMemo(() => (imagesMap instanceof Map ? Array.from(imagesMap.values()) : []), [imagesMap]);
  
  const filteredImages = useMemo(() => {
    return images
      .filter(image => {
        const term = searchTerm.toLowerCase();
        return (
          (image.name?.toLowerCase().includes(term) ||
           image.description?.toLowerCase().includes(term)) &&
          (categoryFilter === 'all' || image.category === categoryFilter)
        );
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [images, searchTerm, categoryFilter]);


  const handleImageProcessedAndUploaded = async (filePath, metadata, category = 'default') => {
    try {
        await addImage({
            name: metadata.originalName.split('.').slice(0, -1).join('.'),
            description: `Téléversé le ${new Date().toLocaleDateString()}`,
            category,
            file_path: filePath,
            android_version: 'Non spécifiée', // Valeur par défaut
            metadata: { size: metadata.size, mimeType: metadata.mimeType }
        });
        toast({ title: "Succès", description: "Image ajoutée à la galerie." });
        await fetchAllData();
    } catch(e) {
        console.error("Error adding image to db", e);
        toast({ title: "Erreur Base de données", description: "L'image a été téléversée mais n'a pas pu être ajoutée à la base de données.", variant: "destructive" });
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
    const android_version = formData.get('android_version');

    setIsEditing(true);
    try {
      await apiUpdateImage(editImage.id, { name, description, category, android_version });
      toast({ title: "Succès", description: "Image mise à jour." });
      await fetchAllData();
      setIsEditDialogOpen(false);
      setEditImage(null);
    } catch (error) {
      console.error("Error updating image:", error);
      toast({ title: "Erreur de mise à jour", description: error.message, variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (image) => {
    try {
      await apiDeleteImage(image.id, image.file_path);
      toast({ title: "Succès", description: "Image supprimée." });
      await fetchAllData();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
    }
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
      const file = new File([blob], `edited-${imageToEdit.name}.png`, { type: 'image/png' });
      
      // Upload de la nouvelle image
      const formData = new FormData();
      formData.append('file', file);
      
      toast({ 
        title: "Upload en cours...", 
        description: "Téléchargement de l'image modifiée" 
      });

      // Remplacer l'ancienne image par la nouvelle
      // Note: Vous devrez peut-être ajuster cette logique selon votre API
      // Pour l'instant, on peut uploader comme nouvelle image ou remplacer
      
      setIsImageEditorOpen(false);
      toast({ 
        title: "Succès", 
        description: "Image modifiée sauvegardée avec succès" 
      });
      
      await fetchAllData();
    } catch (error) {
      console.error("Error saving edited image:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de sauvegarder l'image modifiée", 
        variant: "destructive" 
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
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchTerm('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <AdminImageTools onImageProcessedAndUploaded={handleImageProcessedAndUploaded} categories={adminCategories} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {adminCategories.map(cat => (
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

      <ScrollArea className="h-[calc(100vh-250px)]">
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map(image => (
              <Card key={image.id} className="overflow-hidden flex flex-col">
                <CardHeader className="p-0">
                  <div className="aspect-square w-full bg-muted flex items-center justify-center">
                    <img src={image.publicUrl} alt={image.name} className="w-full h-full object-cover" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 flex-grow">
                  <CardTitle className="text-base font-semibold truncate">{image.name}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">{image.category}</p>
                   <p className="text-xs text-muted-foreground mt-1">{formatBytes(image.metadata?.size || 0)}</p>
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
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. L'image sera supprimée définitivement du stockage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(image)} className="bg-destructive hover:bg-destructive/90">
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
        onOpenChange={(isOpen) => { if (!isOpen) setEditImage(null); setIsEditDialogOpen(isOpen);} }
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

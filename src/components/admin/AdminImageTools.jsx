
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Crop, Minimize, ImageDown as UploadIcon, Type, Smartphone, FileText, FolderTree } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SUBCATEGORIES, getImageSubcategories } from '@/data/images';

const AdminImageTools = ({ onImageProcessedAndUploaded, categories = [] }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [targetWidth, setTargetWidth] = useState(800);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories && categories.length > 0 ? (categories.includes('default') ? 'default' : categories[0]) : 'default');
  const [selectedSubcategory, setSelectedSubcategory] = useState('général');
  const [availableSubcategories, setAvailableSubcategories] = useState(DEFAULT_SUBCATEGORIES);
  const [imageName, setImageName] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [androidVersion, setAndroidVersion] = useState('');
  const fileInputRef = useRef(null);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        const subcats = await getImageSubcategories(selectedCategory);
        setAvailableSubcategories(subcats);
        // Reset to first available subcategory
        if (!subcats.includes(selectedSubcategory)) {
          setSelectedSubcategory(subcats[0] || 'général');
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
        setAvailableSubcategories(DEFAULT_SUBCATEGORIES);
      }
    };
    loadSubcategories();
  }, [selectedCategory]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Pré-remplir le nom basé sur le nom du fichier (sans extension)
      const nameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
      setImageName(nameWithoutExtension);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setIsDialogOpen(true);
    }
  };

  const processAndUploadImage = async (category = 'default') => {
    if (!selectedFile || !imagePreview) {
      toast({ title: "Aucune image", description: "Veuillez sélectionner une image.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      
      // Ratio cible 9:16 pour smartphone
      const targetRatio = 9 / 16;
      const sourceRatio = img.width / img.height;
      
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;
      
      // Crop pour obtenir le ratio 9:16
      if (sourceRatio > targetRatio) {
        // Image trop large, on crop les côtés
        sourceWidth = img.height * targetRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else if (sourceRatio < targetRatio) {
        // Image trop haute, on crop le haut et le bas
        sourceHeight = img.width / targetRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }
      
      // Redimensionner si nécessaire
      let width = sourceWidth;
      let height = sourceHeight;
      
      if (width > targetWidth) {
        height = (targetWidth / width) * height;
        width = targetWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Dessiner l'image croppée et redimensionnée
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const fileExtension = selectedFile.name.split('.').pop() || 'jpg';
          const fileName = `${uuidv4()}.${fileExtension}`;
          const filePath = `public/${fileName}`;
          
          const processedFile = new File([blob], fileName, {
            type: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
            lastModified: Date.now(),
          });

          try {
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('images')
              .upload(filePath, processedFile, {
                cacheControl: '3600',
                upsert: false, 
              });

            if (uploadError) throw uploadError;
            
            onImageProcessedAndUploaded(filePath, {
              originalName: selectedFile.name,
              customName: imageName.trim() || selectedFile.name.split('.').slice(0, -1).join('.'),
              customDescription: imageDescription.trim() || `Téléversé le ${new Date().toLocaleDateString()}`,
              androidVersion: androidVersion.trim() || 'Non spécifiée',
              newWidth: width,
              newHeight: height,
              quality: compressionQuality,
              size: processedFile.size,
              mimeType: processedFile.type,
              subcategory: selectedSubcategory
            }, category);
            toast({ title: "Image traitée et téléversée", description: `L'image a été ajoutée à la galerie.` });
            resetState();

          } catch (error) {
             console.error("Upload error: ", error);
             toast({ title: "Erreur de téléversement", description: error.message || "Impossible de téléverser l'image.", variant: "destructive" });
             setIsProcessing(false);
          }
        } else {
          toast({ title: "Erreur de traitement", description: "Impossible de convertir l'image (blob).", variant: "destructive" });
          setIsProcessing(false);
        }
      }, `image/${selectedFile.name.split('.').pop() === 'png' ? 'png' : 'jpeg'}`, compressionQuality);
    };
    img.onerror = () => {
        toast({ title: "Erreur de chargement", description: "Impossible de charger l'image pour traitement.", variant: "destructive" });
        setIsProcessing(false);
    };
    img.src = imagePreview;
  };
  
  const resetState = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setTargetWidth(800);
    setCompressionQuality(0.8);
    setImageName('');
    setImageDescription('');
    setAndroidVersion('');
    setSelectedSubcategory('général');
    setIsDialogOpen(false);
    setIsProcessing(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
        <UploadIcon className="mr-2 h-4 w-4" /> {isProcessing ? "Traitement..." : "Redimensionner Image"}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) resetState(); else setIsDialogOpen(true);}}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Redimensionner & Compresser</DialogTitle>
            <DialogDescription>
              Ajustez la taille et la compression de votre image avant de l'ajouter à la galerie.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {imagePreview && (
              <div className="my-4 flex justify-center max-h-[300px] overflow-hidden rounded-md border">
                <img src={imagePreview} alt="Aperçu" className="max-h-full object-contain" />
              </div>
            )}
            <div className="space-y-4 px-1">
            <div>
              <Label htmlFor="targetWidth" className="flex items-center">
                <Crop className="mr-2 h-4 w-4" /> Largeur maximale (px)
              </Label>
              <Input
                id="targetWidth"
                type="number"
                value={targetWidth}
                onChange={(e) => setTargetWidth(parseInt(e.target.value, 10) || 300)}
                min="100"
                max="4000"
                step="50"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="compressionQuality" className="flex items-center">
                <Minimize className="mr-2 h-4 w-4" /> Qualité de compression
              </Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="compressionQuality"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={[compressionQuality]}
                  onValueChange={(value) => setCompressionQuality(value[0])}
                  disabled={isProcessing}
                />
                <span className="text-sm text-muted-foreground w-12 text-right">{compressionQuality.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="imageName" className="flex items-center">
                <Type className="mr-2 h-4 w-4" /> Nom de l'image
              </Label>
              <Input
                id="imageName"
                type="text"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder="Nom de l'image"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="imageDescription" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" /> Description
              </Label>
              <Textarea
                id="imageDescription"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Description de l'image..."
                disabled={isProcessing}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="androidVersion" className="flex items-center">
                <Smartphone className="mr-2 h-4 w-4" /> Version Android
              </Label>
              <Input
                id="androidVersion"
                type="text"
                value={androidVersion}
                onChange={(e) => setAndroidVersion(e.target.value)}
                placeholder="Ex: 14, 13, 12..."
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="upload-category" className="flex items-center">Catégorie</Label>
              <select
                id="upload-category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isProcessing}
              >
                {(categories || []).filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="upload-subcategory" className="flex items-center">
                <FolderTree className="mr-2 h-4 w-4" /> Sous-catégorie
              </Label>
              <select
                id="upload-subcategory"
                name="subcategory"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isProcessing}
              >
                {availableSubcategories.map(subcat => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
            </div>
            </div>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={resetState} disabled={isProcessing}>Annuler</Button>
            <Button type="button" onClick={() => processAndUploadImage(selectedCategory)} disabled={isProcessing}>
                {isProcessing ? "En cours..." : "Traiter et Téléverser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminImageTools;

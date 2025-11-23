import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Trash2 } from 'lucide-react';
    import { getImageById } from '@/data/images';
    import { getImageUrl } from '@/lib/supabaseClient';

    const AdminFaqStepForm = ({ step, index, onStepChange, onRemoveStep, images }) => {
      const [localStep, setLocalStep] = useState(step);
      const [currentImageInfo, setCurrentImageInfo] = useState(null);
      const [currentPictogramInfo, setCurrentPictogramInfo] = useState(null);

      useEffect(() => {
        setLocalStep(step);
      }, [step]);

      useEffect(() => {
        const fetchImageInfo = async () => {
          if (localStep.image_id) {
            const imageInfo = await getImageById(localStep.image_id);
            setCurrentImageInfo(imageInfo);
          } else {
            setCurrentImageInfo(null);
          }

          if (localStep.pictogram_id) {
            const pictogramInfo = await getImageById(localStep.pictogram_id);
            setCurrentPictogramInfo(pictogramInfo);
          } else {
            setCurrentPictogramInfo(null);
          }
        };

        fetchImageInfo();
      }, [localStep.image_id, localStep.pictogram_id]);

      const handleChange = (field, value) => {
        const updatedStep = { ...localStep, [field]: value };
        setLocalStep(updatedStep);
        onStepChange(index, updatedStep);
      };
      
      const handleSelectChange = (field, value) => {
        const actualValue = value === "_none_" ? null : value;
        handleChange(field, actualValue);
      };

      const safeImages = Array.isArray(images) ? images : [];

      return (
        <div className="p-3 border rounded-md space-y-3 bg-muted/50 mb-3">
          <Label>Étape {index + 1}</Label>
          <Textarea
            placeholder="Instruction pour cette étape"
            value={localStep.instruction || ''}
            onChange={(e) => handleChange('instruction', e.target.value)}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`step-image-${index}`}>Image (optionnel)</Label>
              <Select value={localStep.image_id || "_none_"} onValueChange={(value) => handleSelectChange('image_id', value)}>
                <SelectTrigger id={`step-image-${index}`}>
                  <SelectValue placeholder="Sélectionner une image" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Aucune</SelectItem>
                  {safeImages.map(img => (
                    <SelectItem key={img.id} value={img.id}>{img.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentImageInfo && <img src={getImageUrl(currentImageInfo.file_path)} alt={currentImageInfo.description} className="mt-1 h-10 w-10 object-contain rounded border"/>}
            </div>
            <div>
              <Label htmlFor={`step-pictogram-${index}`}>Pictogramme (optionnel)</Label>
              <Select value={localStep.pictogram_id || "_none_"} onValueChange={(value) => handleSelectChange('pictogram_id', value)}>
                <SelectTrigger id={`step-pictogram-${index}`}>
                  <SelectValue placeholder="Sélectionner un pictogramme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Aucun</SelectItem>
                  {safeImages.filter(img => img.category === 'Icône' || img.category === 'Pictogramme').map(img => (
                    <SelectItem key={img.id} value={img.id}>{img.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentPictogramInfo && <img src={getImageUrl(currentPictogramInfo.file_path)} alt={currentPictogramInfo.description} className="mt-1 h-8 w-8 object-contain rounded border"/>}
            </div>
          </div>
          <Button type="button" variant="outline" size="xs" onClick={() => onRemoveStep(index)}>
            <Trash2 className="mr-1 h-3 w-3" /> Supprimer Étape
          </Button>
        </div>
      );
    };

    export default AdminFaqStepForm;
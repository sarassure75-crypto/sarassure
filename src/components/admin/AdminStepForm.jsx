
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { actionTypes } from '@/data/tasks';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2, Save, Trash2, XCircle, HelpCircle } from 'lucide-react';
import StepAreaEditor from '@/components/admin/StepAreaEditor';
import * as LucideIcons from 'lucide-react';

const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const AdminStepForm = ({ step: initialStep, onSave, onDelete, onCancel }) => {
  // Single unified zone editor - tap, double_tap, long_press, swipe_*, drag_and_drop, text_input, number_input
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isDirty } } = useForm({
    defaultValues: initialStep,
  });
  
  const { images, isLoading: isAdminLoading } = useAdmin();
  const imageArray = images instanceof Map ? Array.from(images.values()) : [];

  const selectedImageId = watch('app_image_id');
  const selectedImage = imageArray.find(img => img.id === selectedImageId);

  const selectedPictogramId = watch('pictogram_app_image_id');
  const selectedPictogram = imageArray.find(img => img.id === selectedPictogramId);

  const watchedIconName = watch('icon_name');
  const IconComponent = LucideIcons[toPascalCase(watchedIconName)] || null;

  const [editorImageDimensions, setEditorImageDimensions] = useState({ width: 0, height: 0 });
  const [hasAreaChanged, setHasAreaChanged] = useState(false);

  const handleSave = (data) => {
    let dataToSave = { ...initialStep, ...data };
    
    const selectedActionType = watch('action_type');
    const zoneKey = ['swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'scroll', 'drag_and_drop', 'tap', 'double_tap', 'long_press'].includes(selectedActionType) ? 'start_area' : 'target_area';
    
    // Convert px values from editor to percentage before saving
    if (dataToSave[zoneKey] && editorImageDimensions.width > 0 && editorImageDimensions.height > 0) {
      const { x, y, width, height, ...restOfArea } = dataToSave[zoneKey];
      // Make sure all values are numbers
      const numX = Number(x) || 0;
      const numY = Number(y) || 0;
      const numWidth = Number(width) || 0;
      const numHeight = Number(height) || 0;

      if (zoneKey === 'start_area') {
        dataToSave.start_area = {
          ...restOfArea,
          x_percent: (numX / editorImageDimensions.width) * 100,
          y_percent: (numY / editorImageDimensions.height) * 100,
          width_percent: (numWidth / editorImageDimensions.width) * 100,
          height_percent: (numHeight / editorImageDimensions.height) * 100,
          // Ajouter expected_input à la zone si présent
          ...(data.expected_input && { expected_input: data.expected_input }),
        };
      } else {
        dataToSave.target_area = {
          ...restOfArea,
          x_percent: (numX / editorImageDimensions.width) * 100,
          y_percent: (numY / editorImageDimensions.height) * 100,
          width_percent: (numWidth / editorImageDimensions.width) * 100,
          height_percent: (numHeight / editorImageDimensions.height) * 100,
          // Ajouter expected_input à la zone si présent
          ...(data.expected_input && { expected_input: data.expected_input }),
        };
      }
    }
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6 p-4 border rounded-lg bg-background mt-4">
      <h3 className="text-lg font-semibold">{initialStep.isNew ? 'Nouvelle Étape' : `Éditer l'Étape ${initialStep.step_order + 1}`}</h3>
      <div>
        <Label htmlFor="instruction">Instruction</Label>
        <Textarea
          id="instruction"
          {...register('instruction', { required: 'L\'instruction est requise' })}
          className="mt-1"
          placeholder="Ex: Appuyez sur le bouton vert..."
        />
        {errors.instruction && <p className="text-red-500 text-sm mt-1">{errors.instruction.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="action_type">Type d'action</Label>
          <Controller
            name="action_type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger id="action_type" className="mt-1"><SelectValue placeholder="Sélectionner un type d'action" /></SelectTrigger>
                <SelectContent>{actionTypes.map(type => (<SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>))}</SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="app_image_id">Capture d'écran</Label>
          <Controller
            name="app_image_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(value) => field.onChange(value === '_none_' ? null : value)} value={field.value || '_none_'}>
                <SelectTrigger id="app_image_id" className="mt-1"><SelectValue placeholder="Sélectionner une capture" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Aucune</SelectItem>
                  {imageArray.filter(img => img.category === "Capture d'écran").map(image => (<SelectItem key={image.id} value={image.id}>{image.name}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Zone éditeur visuel avec drag-drop sur la capture */}
      {watch('action_type') && selectedImage && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <Label className="text-base font-semibold mb-4 block">Configuration de la zone d'action</Label>
          <StepAreaEditor
            imageUrl={selectedImage.publicUrl}
            area={
              ['swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'scroll', 'drag_and_drop', 'tap', 'double_tap', 'long_press'].includes(watch('action_type'))
                ? watch('start_area')
                : watch('target_area')
            }
            onAreaChange={(area) => {
              const key = ['swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'scroll', 'drag_and_drop', 'tap', 'double_tap', 'long_press'].includes(watch('action_type'))
                ? 'start_area'
                : 'target_area';
              setValue(key, area);
              setHasAreaChanged(true);
            }}
            onImageLoad={setEditorImageDimensions}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="icon_name">Icône (Nom Lucide)</Label>
          <div className="flex items-center space-x-2 mt-1">
            {IconComponent ? <IconComponent className="h-5 w-5 text-muted-foreground" /> : <HelpCircle className="h-5 w-5 text-muted-foreground" />}
            <Input id="icon_name" {...register('icon_name')} placeholder="Ex: Phone, Search..." />
          </div>
        </div>
        <div>
          <Label htmlFor="pictogram_app_image_id">Pictogramme de l'étape (Image)</Label>
          <Controller
            name="pictogram_app_image_id"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                {selectedPictogram && <img src={selectedPictogram.publicUrl} alt={selectedPictogram.name} className="h-6 w-6 object-contain border rounded"/>}
                <Select onValueChange={(value) => field.onChange(value === '_none_' ? null : value)} value={field.value || '_none_'}>
                  <SelectTrigger id="pictogram_app_image_id" className="mt-1 flex-grow"><SelectValue placeholder="Sélectionner un pictogramme" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">Aucun</SelectItem>
                    {imageArray.filter(img => ['Pictogramme', 'Icône'].includes(img.category)).map(img => (
                      <SelectItem key={img.id} value={img.id}>{img.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </div>
      </div>

      {watch('action_type')?.includes('input') && (
        <div>
          <Label htmlFor="expected_input">Saisie attendue (si action de saisie)</Label>
          <Input id="expected_input" {...register('expected_input')} className="mt-1" placeholder="Texte ou numéro attendu" />
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button type="button" variant="destructive" onClick={() => onDelete(initialStep.id)} disabled={isAdminLoading}>
          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
        </Button>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isAdminLoading}>
            <XCircle className="mr-2 h-4 w-4" /> Annuler
          </Button>
          <Button type="submit" disabled={isAdminLoading || (!isDirty && !hasAreaChanged)}>
            {isAdminLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Valider l'Étape
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AdminStepForm;

import React, { useState, useEffect, useMemo } from 'react';
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
import ButtonConfigSelector from '@/components/admin/ButtonConfigSelector';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import IconSelector from '@/components/IconSelector';
import { getImageSubcategories, DEFAULT_SUBCATEGORIES } from '@/data/images';

const IconLibraryMap = {
  fa6: { module: FontAwesome6, prefix: 'fa', color: '#0184BC', label: 'Font Awesome 6' },
  bs: { module: BootstrapIcons, prefix: 'bs', color: '#7952B3', label: 'Bootstrap Icons' },
  md: { module: MaterialIcons, prefix: 'md', color: '#00BCD4', label: 'Material Design' },
  fi: { module: FeatherIcons, prefix: 'fi', color: '#000000', label: 'Feather' },
  hi2: { module: HeroiconsIcons, prefix: 'hi', color: '#6366F1', label: 'Heroicons' },
  ai: { module: AntIcons, prefix: 'ai', color: '#1890FF', label: 'Ant Design' },
};

const getIconComponent = (iconString) => {
  if (!iconString) return null;
  
  const [library, name] = iconString.split(':');
  const libraryData = IconLibraryMap[library];
  if (!libraryData) return null;
  
  const module = libraryData.module;
  return module[name] || null;
};

const parseIconString = (iconString) => {
  if (!iconString) return null;
  const [library, name] = iconString.split(':');
  return { library, name };
};

const AdminStepForm = ({ step: initialStep, onSave, onDelete, onCancel }) => {
  // Single unified zone editor - tap, double_tap, long_press, swipe_*, drag_and_drop, text_input, number_input
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isDirty } } = useForm({
    defaultValues: initialStep,
  });
  
  const { images, isLoading: isAdminLoading } = useAdmin();
  const imageArray = images instanceof Map ? Array.from(images.values()) : [];

  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [androidVersionFilter, setAndroidVersionFilter] = useState('all');
  const [availableSubcategories, setAvailableSubcategories] = useState(DEFAULT_SUBCATEGORIES);
  const [editorImageDimensions, setEditorImageDimensions] = useState({ width: 0, height: 0 });
  const [hasAreaChanged, setHasAreaChanged] = useState(false);

  const selectedImageId = watch('app_image_id');
  const selectedImage = imageArray.find(img => img.id === selectedImageId);

  const watchedIconName = watch('icon_name');
  const IconComponent = getIconComponent(watchedIconName);

  const handleIconSelect = (icon) => {
    const iconString = icon ? `${icon.library}:${icon.name}` : '';
    setValue('icon_name', iconString, { shouldDirty: true });
  };

  const handleIconRemove = () => {
    setValue('icon_name', '', { shouldDirty: true });
  };

  const selectedIcon = parseIconString(watchedIconName);

  // Load subcategories for "Capture d'écran" category
  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        const subcats = await getImageSubcategories("Capture d'écran");
        setAvailableSubcategories(subcats);
      } catch (error) {
        console.error('Error loading subcategories:', error);
        setAvailableSubcategories(DEFAULT_SUBCATEGORIES);
      }
    };
    loadSubcategories();
  }, []);

  // Get available Android versions from screenshot images
  const availableAndroidVersions = useMemo(() => {
    const versions = imageArray
      .filter(img => img.category === "Capture d'écran" && img.android_version)
      .map(img => img.android_version)
      .filter(Boolean);
    return ['all', ...new Set(versions)].sort((a, b) => {
      if (a === 'all') return -1;
      if (b === 'all') return 1;
      // Extract numeric part for proper sorting (e.g., "Android 14" -> 14)
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numB - numA; // Descending order
    });
  }, [imageArray]);

  // Filter images by "Capture d'écran" category, subcategory, and Android version
  const screenshotImages = imageArray.filter(img => {
    const isScreenshot = img.category === "Capture d'écran";
    const matchesSubcategory = subcategoryFilter === 'all' || img.subcategory === subcategoryFilter;
    const matchesAndroidVersion = androidVersionFilter === 'all' || img.android_version === androidVersionFilter;
    return isScreenshot && matchesSubcategory && matchesAndroidVersion;
  });

  const handleSave = (data) => {
    let dataToSave = { ...initialStep, ...data };
    
    const selectedActionType = watch('action_type');
    
    // Les boutons physiques ne nécessitent PAS de zone d'action
    const isPhysicalButton = ['button_power', 'button_volume_up', 'button_volume_down', 'button_power_volume_down', 'button_power_volume_up', 'button_volume_up_down'].includes(selectedActionType);
    
    const zoneKey = ['swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'scroll', 'drag_and_drop', 'tap', 'double_tap', 'long_press'].includes(selectedActionType) ? 'start_area' : 'target_area';
    
    // Convert px values from editor to percentage before saving
    // MAIS PAS pour les boutons physiques !
    if (!isPhysicalButton && dataToSave[zoneKey] && editorImageDimensions.width > 0 && editorImageDimensions.height > 0) {
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
    
    // Ajouter keyboard_auto_show pour les claviers texte
    if (data.action_type === 'text_input' && data.keyboard_auto_show !== undefined) {
      dataToSave.keyboard_auto_show = data.keyboard_auto_show;
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

        {/* Sélecteur de modèle de téléphone pour les boutons physiques */}
        {['button_power', 'button_volume_up', 'button_volume_down', 'button_power_volume_down', 'button_power_volume_up', 'button_volume_up_down'].includes(watch('action_type')) && (
          <div>
            <ButtonConfigSelector
              value={watch('button_config') || 'samsung'}
              onChange={(config) => setValue('button_config', config)}
            />
          </div>
        )}

        <div>
          <Label htmlFor="app_image_id">Capture d'écran</Label>
          {availableSubcategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Sous-cat:</span>
              <Button
                type="button"
                size="sm"
                variant={subcategoryFilter === 'all' ? 'default' : 'ghost'}
                onClick={() => setSubcategoryFilter('all')}
                className="h-7 text-xs"
              >
                Toutes
              </Button>
              {availableSubcategories.map(subcat => (
                <Button
                  key={subcat}
                  type="button"
                  size="sm"
                  variant={subcategoryFilter === subcat ? 'default' : 'ghost'}
                  onClick={() => setSubcategoryFilter(subcat)}
                  className="h-7 text-xs capitalize"
                >
                  {subcat}
                </Button>
              ))}
            </div>
          )}
          {availableAndroidVersions.length > 1 && (
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Android:</span>
              {availableAndroidVersions.map(version => (
                <Button
                  key={version}
                  type="button"
                  size="sm"
                  variant={androidVersionFilter === version ? 'default' : 'ghost'}
                  onClick={() => setAndroidVersionFilter(version)}
                  className="h-7 text-xs"
                >
                  {version === 'all' ? 'Toutes' : version}
                </Button>
              ))}
            </div>
          )}
          <Controller
            name="app_image_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(value) => field.onChange(value === '_none_' ? null : value)} value={field.value || '_none_'}>
                <SelectTrigger id="app_image_id" className="mt-1"><SelectValue placeholder="Sélectionner une capture" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Aucune</SelectItem>
                  {screenshotImages.map(image => (<SelectItem key={image.id} value={image.id}>{image.name}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Zone éditeur visuel avec drag-drop sur la capture */}
      {/* NE PAS afficher pour les boutons physiques */}
      {watch('action_type') && watch('action_type') !== 'bravo' && 
       !['button_power', 'button_volume_up', 'button_volume_down', 'button_power_volume_down', 'button_power_volume_up', 'button_volume_up_down'].includes(watch('action_type')) &&
       selectedImage && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          {watch('action_type')?.includes('input') ? (
            <>
              {/* Pour les inputs : éditer les DEUX zones séparément */}
              <div>
                <Label className="text-base font-semibold mb-2 block text-purple-700">
                  📝 Zone d'Affichage du Texte (target_area)
                </Label>
                <p className="text-sm text-purple-600 mb-3 italic">
                  Définissez où les caractères saisis apparaîtront (champ de saisie)
                </p>
                <StepAreaEditor
                  imageUrl={selectedImage.publicUrl}
                  area={watch('target_area')}
                  onAreaChange={(area) => {
                    setValue('target_area', area);
                    setHasAreaChanged(true);
                  }}
                  onImageLoad={setEditorImageDimensions}
                />
              </div>
            </>
          ) : (
            <>
              {/* Pour les autres actions : une seule zone */}
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
            </>
          )}
        </div>
      )}

      {/* Message pour l'option Bravo */}
      {watch('action_type') === 'bravo' && selectedImage && (
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            🎉 <strong>Étape de félicitations :</strong> Cette étape affichera uniquement la capture d'écran sans zone d'action à cliquer. Parfait pour montrer un message de réussite ou le résultat final.
          </p>
        </div>
      )}

      {/* Message pour les boutons physiques */}
      {['button_power', 'button_volume_up', 'button_volume_down', 'button_power_volume_down', 'button_power_volume_up', 'button_volume_up_down'].includes(watch('action_type')) && selectedImage && (
        <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
          <p className="text-sm text-purple-800 mb-2">
            📱 <strong>Bouton physique :</strong> Aucune zone d'action n'est nécessaire !
          </p>
          <ul className="text-xs text-purple-700 list-disc list-inside space-y-1">
            <li>Les boutons (Power, Volume+, Volume-) sont automatiquement positionnés sur les côtés du téléphone</li>
            <li>Leur position dépend du modèle de téléphone sélectionné</li>
            <li>L'apprenant cliquera directement sur les boutons visibles</li>
            {watch('action_type')?.includes('_') && watch('action_type') !== 'button_volume_up' && watch('action_type') !== 'button_volume_down' && (
              <li className="font-semibold text-purple-900">⚠️ Action combinée : l'apprenant devra cliquer sur 2 boutons simultanément</li>
            )}
          </ul>
        </div>
      )}

      <div>
        <Label htmlFor="icon_name">Icône</Label>
        <IconSelector
          selectedIcon={selectedIcon ? {
            library: selectedIcon.library,
            name: selectedIcon.name,
            component: IconComponent,
            displayName: selectedIcon.name
          } : null}
          onSelect={handleIconSelect}
          onRemove={handleIconRemove}
          libraries={['fa6', 'bs', 'md', 'fi', 'hi2', 'ai']}
          showSearch={true}
          showLibraryTabs={true}
        />
      </div>

      {watch('action_type')?.includes('input') && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <Label htmlFor="expected_input">Saisie attendue</Label>
            <Input id="expected_input" {...register('expected_input')} className="mt-1" placeholder="Texte ou numéro attendu" />
          </div>
          
          {watch('action_type') === 'text_input' && (
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="keyboard_auto_show" 
                {...register('keyboard_auto_show')}
                className="w-4 h-4"
              />
              <Label htmlFor="keyboard_auto_show" className="cursor-pointer">
                Afficher le clavier automatiquement (sinon apparaît au tap sur la zone)
              </Label>
            </div>
          )}
          
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-semibold">📱 Configuration des zones :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Zone d'action (start_area)</strong> : Zone où le clavier apparaîtra en overlay</li>
              <li><strong>Zone cible (target_area)</strong> : Zone où les caractères saisis s'afficheront</li>
            </ul>
            <p className="text-xs mt-2 italic">
              {watch('action_type') === 'number_input' 
                ? '⚠️ Le clavier numérique s\'affiche automatiquement' 
                : '💡 Cochez la case ci-dessus pour un affichage automatique'}
            </p>
          </div>
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

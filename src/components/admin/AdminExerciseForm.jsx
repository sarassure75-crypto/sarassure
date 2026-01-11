import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Save, Trash2, XCircle, Video, PlayCircle, ListChecks, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import IconSelector from '@/components/IconSelector';
import { useAdmin } from '@/contexts/AdminContext';

const IconLibraryMap = {
  lucide: { module: LucideIcons, prefix: '', color: '#181818', label: 'Lucide' },
  fa6: { module: FontAwesome6, prefix: 'fa', color: '#0184BC', label: 'Font Awesome 6' },
  bs: { module: BootstrapIcons, prefix: 'bs', color: '#7952B3', label: 'Bootstrap Icons' },
  md: { module: MaterialIcons, prefix: 'md', color: '#00BCD4', label: 'Material Design' },
  fi: { module: FeatherIcons, prefix: 'fi', color: '#000000', label: 'Feather' },
  hi2: { module: HeroiconsIcons, prefix: 'hi', color: '#6366F1', label: 'Heroicons' },
  ai: { module: AntIcons, prefix: 'ai', color: '#1890FF', label: 'Ant Design' },
};

const getIconComponent = (iconString) => {
  if (!iconString) return LucideIcons.ListChecks;
  
  const [library, name] = iconString.split(':');
  const libraryData = IconLibraryMap[library];
  if (!libraryData) return LucideIcons.ListChecks;
  
  const module = libraryData.module;
  return module[name] || LucideIcons.ListChecks;
};

const parseIconString = (iconString) => {
  if (!iconString) return null;
  const [library, name] = iconString.split(':');
  return { library, name };
};

const AdminExerciseForm = ({ exercise: initialExercise, onSave, onCancel, onDelete }) => {
  const [exercise, setExercise] = useState(initialExercise);
  const { adminView, imagesData } = useAdmin();

  useEffect(() => {
    setExercise(initialExercise);
  }, [initialExercise]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExercise(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    const actualValue = value === "_none_" ? null : value;
    setExercise(prev => ({ ...prev, [name]: actualValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(exercise);
  };

  const handleDuplicate = () => {
    const duplicatedExercise = {
      ...exercise,
      id: null, // Nouveau ID sera généré
      name: `${exercise.name} (Copie)`,
      isNew: true
    };
    onSave(duplicatedExercise);
  };
  
  const pictogramInfo = imagesData.find(img => img.id === exercise.pictogram_app_image_id);
  const IconComponent = getIconComponent(exercise.icon_name);

  const handleIconSelect = (icon) => {
    const iconString = icon ? `${icon.library}:${icon.name}` : '';
    setExercise(prev => ({ ...prev, icon_name: iconString }));
  };

  const handleIconRemove = () => {
    setExercise(prev => ({ ...prev, icon_name: '' }));
  };

  const selectedIcon = parseIconString(exercise.icon_name);
  const currentTaskId = adminView.selectedTask?.id;

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Éditer la Version</CardTitle>
          <CardDescription>Modifiez les détails de la version et ajoutez une vidéo explicative.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="exName">Nom de la version</Label>
            <Input id="exName" name="name" value={exercise.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="exVersion">Version Android</Label>
            <Input id="exVersion" name="version" value={exercise.version} onChange={handleChange} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exIconName">Icône</Label>
              <IconSelector
                selectedIcon={selectedIcon ? {
                  library: selectedIcon.library,
                  name: selectedIcon.name,
                  component: IconComponent,
                  displayName: selectedIcon.name
                } : null}
                onSelect={handleIconSelect}
                onRemove={handleIconRemove}
                libraries={['lucide', 'fa6', 'bs', 'md', 'fi', 'hi2', 'ai']}
                showSearch={true}
                showLibraryTabs={true}
              />
            </div>
            <div>
              <Label htmlFor="exPictogram">Pictogramme (facultatif)</Label>
              <div className="flex items-center space-x-2">
              {pictogramInfo && <img-replace src={pictogramInfo.publicUrl} alt={pictogramInfo.description} className="h-6 w-6 object-contain border rounded"/>}
              <Select value={exercise.pictogram_app_image_id || "_none_"} onValueChange={(value) => handleSelectChange('pictogram_app_image_id', value)}>
                  <SelectTrigger id="exPictogram">
                  <SelectValue placeholder="Sélectionnez un pictogramme" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="_none_">Aucun</SelectItem>
                  {imagesData.filter(img => img.category === 'Icône' || img.category === 'Pictogramme').map(img => (
                      <SelectItem key={img.id} value={img.id}>{img.name}</SelectItem>
                  ))}
                  </SelectContent>
              </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="exVideoUrl">URL Vidéo Explicative (YouTube, Vimeo)</Label>
            <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-muted-foreground" />
                <Input 
                    id="exVideoUrl" 
                    name="video_url" 
                    value={exercise.video_url || ''} 
                    onChange={handleChange} 
                    placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="exHasVariantNote"
              name="has_variant_note"
              checked={!!exercise.has_variant_note}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="exHasVariantNote" className="text-sm font-medium">
              Cette version a une note de variante (diffère du guidé)
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Button type="submit" size="sm"><Save className="mr-2 h-4 w-4" /> Sauvegarder</Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel} className="ml-2"><XCircle className="mr-2 h-4 w-4" /> Annuler</Button>
          </div>
          <div className="flex items-center gap-2">
            {!exercise.isNew && (
              <Button type="button" variant="secondary" size="sm" onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" /> Dupliquer
              </Button>
            )}
            {currentTaskId && (
                <Button type="button" variant="secondary" size="sm" asChild>
                    <Link to={`/admin/preview/tache/${currentTaskId}/version/${exercise.id}`} target="_blank" rel="noopener noreferrer">
                        <PlayCircle className="mr-2 h-4 w-4"/>Prévisualiser
                    </Link>
                </Button>
            )}
            <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(exercise.id)}><Trash2 className="mr-2 h-4 w-4" /> Supprimer</Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminExerciseForm;
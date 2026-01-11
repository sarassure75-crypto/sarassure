import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Save, Trash2, XCircle, List, Copy } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { creationStatuses } from '@/data/tasks';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';
import IconSelector from '@/components/IconSelector';

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
  if (!iconString) return List;
  
  // Support pour les icônes Iconify colorées (logos, skill-icons, devicon)
  if (iconString.includes(':') && (
    iconString.startsWith('logos:') || 
    iconString.startsWith('skill-icons:') || 
    iconString.startsWith('devicon:')
  )) {
    return (props) => <IconifyIcon icon={iconString} {...props} />;
  }
  
  const [library, name] = iconString.split(':');
  const libraryData = IconLibraryMap[library];
  if (!libraryData) return List;
  
  const module = libraryData.module;
  return module[name] || List;
};

const parseIconString = (iconString) => {
  if (!iconString) return null;
  const [library, name] = iconString.split(':');
  return { library, name };
};

const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const AdminTaskForm = ({ task: initialTask, onSave, onCancel, onDelete }) => {
  const [task, setTask] = useState(initialTask);
  const { categories, images, isLoading } = useAdmin();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const imageArray = images instanceof Map ? Array.from(images.values()) : [];

  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    const actualValue = value === "_none_" ? null : value;
    setTask(prev => ({ ...prev, [name]: actualValue }));
  };

  const handleCategoryChange = (value) => {
    const selectedCategory = categories.find(c => c.id.toString() === value);
    setTask(prev => ({
      ...prev,
      category_id: selectedCategory ? selectedCategory.id : null,
      category: selectedCategory ? selectedCategory.name : null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(task);
  };

  const handleDuplicate = () => {
    const duplicatedTask = {
      ...task,
      id: null, // Nouveau ID sera généré
      title: `${task.title} (Copie)`,
      isNew: true
    };
    onSave(duplicatedTask);
  };

  const pictogramInfo = imageArray.find(img => img.id === task.pictogram_app_image_id);
  const IconComponent = getIconComponent(task.icon_name);

  const handleIconSelect = (icon) => {
    const iconString = icon ? `${icon.library}:${icon.name}` : '';
    setTask(prev => ({ ...prev, icon_name: iconString }));
  };

  const handleIconRemove = () => {
    setTask(prev => ({ ...prev, icon_name: '' }));
  };

  const selectedIcon = parseIconString(task.icon_name);

  return (
    <Card className="mt-4 border-primary">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{task.isNew ? 'Nouvelle Tâche' : 'Éditer la Tâche'}</CardTitle>
          <CardDescription>Modifiez les détails de cette tâche et de ses versions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" name="isNew" value={String(task.isNew || false)} />
          <div>
            <Label htmlFor="title">Titre de la tâche</Label>
            <Input id="title" name="title" value={task.title || ''} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={task.description || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="video_url">URL Vidéo (YouTube, Vimeo)</Label>
            <Input id="video_url" name="video_url" value={task.video_url || ''} onChange={handleChange} placeholder="https://..."/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={task.category_id?.toString() || ''} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={task.creation_status || 'draft'} onValueChange={(value) => handleSelectChange('creation_status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {creationStatuses.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="iconName">Icône</Label>
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
            <div>
              <Label htmlFor="pictogram">Pictogramme (facultatif)</Label>
              <div className="flex items-center space-x-2">
                {pictogramInfo && <img src={pictogramInfo.publicUrl} alt={pictogramInfo.name} className="h-6 w-6 object-contain border rounded"/>}
                <Select value={task.pictogram_app_image_id || "_none_"} onValueChange={(value) => handleSelectChange('pictogram_app_image_id', value)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez un pictogramme" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">Aucun</SelectItem>
                    {imageArray.filter(img => img.category === 'Icône' || img.category === 'Pictogramme').map(img => (
                      <SelectItem key={img.id} value={img.id}>{img.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="destructive" 
            size="sm" 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading || task.isNew}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>
          <div className="flex items-center gap-2">
            {!task.isNew && (
              <Button type="button" variant="secondary" size="sm" onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" /> Dupliquer
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onCancel}><XCircle className="mr-2 h-4 w-4" /> Annuler</Button>
            <Button type="submit" size="sm" disabled={isLoading}><Save className="mr-2 h-4 w-4" /> Sauvegarder</Button>
          </div>
        </CardFooter>
      </form>

      {/* Confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous vous apprêtez à supprimer la tâche "<strong>{task.title}</strong>". Cette action la déplacera dans la corbeille mais elle pourra être restaurée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(task.id);
                setShowDeleteConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminTaskForm;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Save, Trash2, XCircle, PlayCircle, ListChecks, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';
import IconSelector from '@/components/IconSelector';
import { useAdmin } from '@/contexts/AdminContext';
import { creationStatuses } from '@/data/tasks';

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

  // Support pour les icônes Iconify colorées (logos, skill-icons, devicon)
  if (
    iconString.includes(':') &&
    (iconString.startsWith('logos:') ||
      iconString.startsWith('skill-icons:') ||
      iconString.startsWith('devicon:'))
  ) {
    return (props) => <IconifyIcon icon={iconString} {...props} />;
  }

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

const AdminVersionForm = ({ version: initialVersion, onSave, onCancel, onDelete }) => {
  const [version, setVersion] = useState(initialVersion);
  const { images, isLoading } = useAdmin();
  const imageArray = images instanceof Map ? Array.from(images.values()) : [];

  useEffect(() => {
    setVersion(initialVersion);
  }, [initialVersion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVersion((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    const actualValue = value === '_none_' ? null : value;
    setVersion((prev) => ({ ...prev, [name]: actualValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      id: version.id,
      task_id: version.task_id,
      name: version.name,
      version: version.version,
      creation_status: version.creation_status,
      has_variant_note: !!version.has_variant_note,
      pictogram_app_image_id: version.pictogram_app_image_id,
      icon_name: version.icon_name,
    };

    // Passer les flags locaux via une clé spéciale pour le post-traitement
    dataToSave._metadata = {
      isNew: version.isNew,
      originalVersionId: version.originalVersionId,
    };

    onSave(dataToSave);
  };

  const handleDuplicate = () => {
    const duplicatedVersion = {
      ...version,
      id: null, // Nouveau ID sera généré
      name: `${version.name} (Copie)`,
      isNew: true,
    };
    onSave(duplicatedVersion);
  };

  const pictogramInfo = imageArray.find((img) => img.id === version.pictogram_app_image_id);
  const IconComponent = getIconComponent(version.icon_name);

  const handleIconSelect = (icon) => {
    const iconString = icon ? `${icon.library}:${icon.name}` : '';
    setVersion((prev) => ({ ...prev, icon_name: iconString }));
  };

  const handleIconRemove = () => {
    setVersion((prev) => ({ ...prev, icon_name: '' }));
  };

  const selectedIcon = parseIconString(version.icon_name);

  return (
    <Card className="mt-4 border-primary">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{version.isNew ? 'Nouvelle Version' : 'Éditer la Version'}</CardTitle>
          <CardDescription>Modifiez les détails de cette version.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="versionName">Nom de la version</Label>
            <Input
              id="versionName"
              name="name"
              value={version.name || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="versionVersion">Version Android</Label>
              <Input
                id="versionVersion"
                name="version"
                value={version.version || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="versionStatus">Statut</Label>
              <Select
                value={version.creation_status || 'draft'}
                onValueChange={(value) => handleSelectChange('creation_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {creationStatuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="versionIconName">Icône</Label>
              <IconSelector
                selectedIcon={
                  selectedIcon
                    ? {
                        library: selectedIcon.library,
                        name: selectedIcon.name,
                        component: IconComponent,
                        displayName: selectedIcon.name,
                      }
                    : null
                }
                onSelect={handleIconSelect}
                onRemove={handleIconRemove}
                libraries={[
                  'lucide',
                  'fa6',
                  'bs',
                  'md',
                  'fi',
                  'hi2',
                  'ai',
                  'logos',
                  'skill',
                  'devicon',
                ]}
                showSearch={true}
                showLibraryTabs={true}
              />
            </div>
            <div>
              <Label htmlFor="versionPictogram">Pictogramme (facultatif)</Label>
              <div className="flex items-center space-x-2">
                {pictogramInfo && (
                  <img
                    src={pictogramInfo.publicUrl}
                    alt={pictogramInfo.name}
                    className="h-6 w-6 object-contain border rounded"
                  />
                )}
                <Select
                  value={version.pictogram_app_image_id || '_none_'}
                  onValueChange={(value) => handleSelectChange('pictogram_app_image_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un pictogramme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">Aucun</SelectItem>
                    {imageArray
                      .filter((img) => img.category === 'Icône' || img.category === 'Pictogramme')
                      .map((img) => (
                        <SelectItem key={img.id} value={img.id}>
                          {img.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="versionHasVariantNote"
              name="has_variant_note"
              checked={!!version.has_variant_note}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="versionHasVariantNote" className="text-sm font-medium">
              Cette version a une note de variante (diffère du guidé)
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(version.id)}
            disabled={isLoading || version.isNew}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>

          <div className="flex items-center gap-2">
            {!version.isNew && (
              <Button type="button" variant="secondary" size="sm" onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" /> Dupliquer
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              <XCircle className="mr-2 h-4 w-4" /> Annuler
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" /> Sauvegarder
            </Button>
            {version.task_id && !version.isNew && (
              <Button type="button" variant="secondary" size="sm" asChild>
                <Link
                  to={`/admin/preview/tache/${version.task_id}/version/${version.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Prévisualiser
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminVersionForm;

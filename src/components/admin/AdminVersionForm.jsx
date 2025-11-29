import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Save, Trash2, XCircle, PlayCircle, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { creationStatuses } from '@/data/tasks';

const AdminVersionForm = ({ version: initialVersion, onSave, onCancel, onDelete }) => {
  const [version, setVersion] = useState(initialVersion);
  const { images, isLoading } = useAdmin();
  const imageArray = images instanceof Map ? Array.from(images.values()) : [];

  useEffect(() => {
    setVersion(initialVersion);
  }, [initialVersion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVersion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    const actualValue = value === "_none_" ? null : value;
    setVersion(prev => ({ ...prev, [name]: actualValue }));
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
    onSave(dataToSave);
  };
  
  const pictogramInfo = imageArray.find(img => img.id === version.pictogram_app_image_id);
  const IconComponent = LucideIcons[version.icon_name] || LucideIcons.ListChecks;

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
            <Input id="versionName" name="name" value={version.name || ''} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="versionVersion">Version Android</Label>
              <Input id="versionVersion" name="version" value={version.version || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="versionStatus">Statut</Label>
              <Select value={version.creation_status || 'draft'} onValueChange={(value) => handleSelectChange('creation_status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {creationStatuses.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="versionIconName">Icône (Nom Lucide Icon)</Label>
              <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <Input id="versionIconName" name="icon_name" value={version.icon_name || ''} onChange={handleChange} placeholder="Ex: ListChecks" />
              </div>
            </div>
            <div>
              <Label htmlFor="versionPictogram">Pictogramme (facultatif)</Label>
              <div className="flex items-center space-x-2">
              {pictogramInfo && <img src={pictogramInfo.publicUrl} alt={pictogramInfo.name} className="h-6 w-6 object-contain border rounded"/>}
              <Select value={version.pictogram_app_image_id || "_none_"} onValueChange={(value) => handleSelectChange('pictogram_app_image_id', value)}>
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
          <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(version.id)} disabled={isLoading || version.isNew}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}><XCircle className="mr-2 h-4 w-4" /> Annuler</Button>
            <Button type="submit" size="sm" disabled={isLoading}><Save className="mr-2 h-4 w-4" /> Sauvegarder</Button>
             {version.task_id && !version.isNew && (
                <Button type="button" variant="secondary" size="sm" asChild>
                    <Link to={`/admin/preview/tache/${version.task_id}/version/${version.id}`} target="_blank" rel="noopener noreferrer">
                        <PlayCircle className="mr-2 h-4 w-4"/>Prévisualiser
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
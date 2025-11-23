import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Save, Trash2, XCircle, Video, PlayCircle, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

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
  
  const pictogramInfo = imagesData.find(img => img.id === exercise.pictogram_app_image_id);
  const IconComponent = LucideIcons[exercise.icon_name] || LucideIcons.ListChecks;
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
              <Label htmlFor="exIconName">Icône (Nom Lucide Icon)</Label>
              <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <Input id="exIconName" name="icon_name" value={exercise.icon_name || ''} onChange={handleChange} placeholder="Ex: ListChecks" />
              </div>
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
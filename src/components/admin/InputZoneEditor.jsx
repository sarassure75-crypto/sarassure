import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const InputZoneEditor = ({ 
  actionType,
  targetArea,
  onTargetAreaChange,
  selectedImage,
  isMobileLayout = false
}) => {
  if (!['number_input', 'text_input'].includes(actionType)) {
    return null;
  }

  const getActionLabel = () => {
    const labels = {
      'text_input': 'Saisir du texte',
      'number_input': 'Saisir un numéro',
    };
    return labels[actionType] || actionType;
  };

  return (
    <div className="space-y-3 p-3 border border-green-200 rounded-lg bg-green-50">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Configuration Zone d'Entrée - {getActionLabel()}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <p className="text-sm font-semibold mb-2">Instructions:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Entrez les coordonnées de la zone d'entrée (X, Y)</li>
              <li>Définissez la largeur et hauteur en pourcentage</li>
              <li>La zone s'affichera sur la capture d'écran de l'apprenant</li>
            </ol>
          </PopoverContent>
        </Popover>
      </div>

      {/* Configuration simple de la zone d'entrée */}
      <div className="space-y-2 p-3 border border-green-300 rounded bg-green-100">
        <h4 className="font-semibold text-sm text-green-700">Propriétés de la zone</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Position X (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={targetArea?.x_percent || 0}
              onChange={(e) => onTargetAreaChange({
                ...targetArea,
                x_percent: parseFloat(e.target.value),
              })}
              className="text-sm h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Position Y (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={targetArea?.y_percent || 0}
              onChange={(e) => onTargetAreaChange({
                ...targetArea,
                y_percent: parseFloat(e.target.value),
              })}
              className="text-sm h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Largeur (%)</Label>
            <Input
              type="number"
              min="1"
              max="100"
              step="1"
              value={targetArea?.width_percent || 20}
              onChange={(e) => onTargetAreaChange({
                ...targetArea,
                width_percent: parseFloat(e.target.value),
              })}
              className="text-sm h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Hauteur (%)</Label>
            <Input
              type="number"
              min="1"
              max="100"
              step="1"
              value={targetArea?.height_percent || 20}
              onChange={(e) => onTargetAreaChange({
                ...targetArea,
                height_percent: parseFloat(e.target.value),
              })}
              className="text-sm h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputZoneEditor;

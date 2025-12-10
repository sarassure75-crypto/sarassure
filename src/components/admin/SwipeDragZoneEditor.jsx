import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const SwipeDragZoneEditor = ({ 
  actionType,
  startArea,
  onStartAreaChange,
  selectedImage,
  isMobileLayout = false
}) => {
  if (!['swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'drag_and_drop', 'tap', 'long_press'].includes(actionType)) {
    return null;
  }

  const getActionLabel = () => {
    const labels = {
      'tap': 'Appuyer',
      'long_press': '← Appui prolongé',
      'swipe_left': '← Glisser vers la GAUCHE',
      'swipe_right': 'Glisser vers la DROITE →',
      'swipe_up': '↑ Glisser vers le HAUT',
      'swipe_down': '↓ Glisser vers le BAS',
      'drag_and_drop': 'Glisser en diagonal ↘',
    };
    return labels[actionType] || actionType;
  };

  return (
    <div className="space-y-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Configuration Zone d'Action - {getActionLabel()}
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
              <li>Entrez les coordonnées de la zone d'action (X, Y)</li>
              <li>Définissez la largeur et hauteur en pourcentage</li>
              <li>La zone s'affichera sur la capture d'écran de l'apprenant</li>
            </ol>
          </PopoverContent>
        </Popover>
      </div>

      {/* Configuration simple de la zone d'action */}
      <div className="space-y-2 p-3 border border-green-300 rounded bg-green-50">
        <h4 className="font-semibold text-sm text-green-700">Propriétés de la zone</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Position X (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={startArea?.x_percent || 0}
              onChange={(e) => onStartAreaChange({
                ...startArea,
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
              value={startArea?.y_percent || 0}
              onChange={(e) => onStartAreaChange({
                ...startArea,
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
              value={startArea?.width_percent || 20}
              onChange={(e) => onStartAreaChange({
                ...startArea,
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
              value={startArea?.height_percent || 20}
              onChange={(e) => onStartAreaChange({
                ...startArea,
                height_percent: parseFloat(e.target.value),
              })}
              className="text-sm h-8"
            />
          </div>
        </div>

        {/* Visibilité */}
        <div className="pt-3 mt-3 border-t border-green-300 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Affichage</Label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-green-700">
                {startArea?.is_visible !== undefined ? (startArea.is_visible ? '👁️ Visible' : '👁️‍🗨️ Invisible') : '👁️ Visible'}
              </span>
              <Switch
                checked={startArea?.is_visible !== undefined ? startArea.is_visible : true}
                onCheckedChange={(checked) => onStartAreaChange({
                  ...startArea,
                  is_visible: checked,
                })}
              />
            </div>
          </div>
          <p className="text-xs text-green-600 italic">Invisible = zone déplaçable avec poignées visibles, mais sans couleur</p>
        </div>
      </div>
    </div>
  );
};

export default SwipeDragZoneEditor;

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getButtonConfigsList, DEFAULT_BUTTON_CONFIG } from '@/data/phoneButtonConfigs';

/**
 * Sélecteur de configuration de boutons physiques
 * Permet de choisir le modèle de téléphone (Samsung, iPhone, Pixel, etc.)
 */
const ButtonConfigSelector = ({ value = DEFAULT_BUTTON_CONFIG, onChange, disabled = false }) => {
  const configs = getButtonConfigsList();

  return (
    <div className="space-y-2">
      <Label htmlFor="button-config" className="text-sm font-medium">
        📱 Modèle de téléphone
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="button-config" className="w-full">
          <SelectValue placeholder="Sélectionnez un modèle" />
        </SelectTrigger>
        <SelectContent>
          {configs.map((config) => (
            <SelectItem key={config.id} value={config.id}>
              <div className="flex flex-col">
                <span className="font-semibold">{config.name}</span>
                <span className="text-xs text-gray-500">{config.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">
        Choisissez la disposition des boutons physiques pour cet exercice
      </p>
    </div>
  );
};

export default ButtonConfigSelector;

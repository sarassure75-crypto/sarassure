import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AreaInputGroup = ({ area, onAreaChange, title }) => {
  const handleInputChange = (field, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) && value !== '') return;
    onAreaChange({ ...area, [field]: isNaN(numValue) ? 0 : numValue });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <Label htmlFor={`${title}-X`}>X</Label>
        <Input
          id={`${title}-X`}
          type="number"
          value={area?.x || 0}
          onChange={(e) => handleInputChange('x', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`${title}-Y`}>Y</Label>
        <Input
          id={`${title}-Y`}
          type="number"
          value={area?.y || 0}
          onChange={(e) => handleInputChange('y', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`${title}-Width`}>Largeur</Label>
        <Input
          id={`${title}-Width`}
          type="number"
          value={area?.width || 0}
          onChange={(e) => handleInputChange('width', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`${title}-Height`}>Hauteur</Label>
        <Input
          id={`${title}-Height`}
          type="number"
          value={area?.height || 0}
          onChange={(e) => handleInputChange('height', e.target.value)}
        />
      </div>
    </div>
  );
};

export default AreaInputGroup;

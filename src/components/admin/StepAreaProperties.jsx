import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StepAreaProperties = ({ title, icon, area, areaType, onAreaChange }) => {
  const handleInputChange = (field, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) && value !== '') return;
    onAreaChange(areaType, field, isNaN(numValue) ? 0 : numValue);
  };

  return (
    <div className="border p-4 rounded-md space-y-3 bg-muted/30">
      <h4 className="text-md font-semibold flex items-center">
        {React.cloneElement(icon, { className: 'mr-2 h-5 w-5' })} {title}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label htmlFor={`${areaType}X`}>X</Label>
          <Input
            id={`${areaType}X`}
            type="number"
            value={area?.x || 0}
            onChange={(e) => handleInputChange('x', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${areaType}Y`}>Y</Label>
          <Input
            id={`${areaType}Y`}
            type="number"
            value={area?.y || 0}
            onChange={(e) => handleInputChange('y', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${areaType}Width`}>Largeur</Label>
          <Input
            id={`${areaType}Width`}
            type="number"
            value={area?.width || 0}
            onChange={(e) => handleInputChange('width', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${areaType}Height`}>Hauteur</Label>
          <Input
            id={`${areaType}Height`}
            type="number"
            value={area?.height || 0}
            onChange={(e) => handleInputChange('height', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default StepAreaProperties;

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Convert RGB string to HEX for color input
const rgbToHex = (rgb) => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return '#3b82f6';
};

const ResizableArea = ({ area, imageDimensions, onMouseDown, onResizeMouseDown }) => {
  if (!area || !imageDimensions.width) return null;
  
  // Convert percent to px for display
  const xPx = (area.x_percent || 0) * imageDimensions.width / 100;
  const yPx = (area.y_percent || 0) * imageDimensions.height / 100;
  const widthPx = (area.width_percent || 0) * imageDimensions.width / 100;
  const heightPx = (area.height_percent || 0) * imageDimensions.height / 100;

  // Get color with opacity
  const color = area.color || "rgb(239, 68, 68)";
  const opacity = area.opacity !== undefined ? area.opacity : 0.5;
  const backgroundColor = `${color.replace(')', `, ${opacity})`)}`;
  const solidColor = color;

  const style = {
    left: `${xPx}px`,
    top: `${yPx}px`,
    width: `${widthPx}px`,
    height: `${heightPx}px`,
    backgroundColor: backgroundColor,
    borderColor: solidColor,
    borderRadius: area.shape === 'ellipse' ? '50%' : '4px',
    position: 'absolute',
    borderWidth: '2px',
    borderStyle: 'dashed',
    cursor: 'move',
    boxSizing: 'border-box',
  };

  const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <div style={style} onMouseDown={onMouseDown}>
      {handles.map(handleName => (
        <div
          key={handleName}
          className={`absolute bg-white border-2 border-primary rounded-full w-3 h-3 -m-1.5 
              ${handleName.includes('left') ? 'left-0' : 'right-0'}
              ${handleName.includes('top') ? 'top-0' : 'bottom-0'}
              cursor-${(handleName.includes('top') && handleName.includes('left')) || (handleName.includes('bottom') && handleName.includes('right')) ? 'nwse' : 'nesw'}-resize
          `}
          onMouseDown={(e) => onResizeMouseDown(e, handleName)}
        />
      ))}
    </div>
  );
};

const StepAreaEditor = ({ imageUrl, area, onAreaChange, onImageLoad }) => {
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [activeDrag, setActiveDrag] = useState(null);
  const [localArea, setLocalArea] = useState(area);

  // Create default area if none exists
  useEffect(() => {
    if (!area && imageDimensions.width > 0) {
      const defaultArea = {
        x_percent: 25,
        y_percent: 25,
        width_percent: 50,
        height_percent: 50,
        color: 'rgb(59, 130, 246)',
        opacity: 0.5,
        shape: 'rect',
      };
      setLocalArea(defaultArea);
      onAreaChange(defaultArea);
    } else if (area) {
      // Ensure color and opacity are set when loading existing area
      const areaWithDefaults = {
        ...area,
        color: area.color || 'rgb(59, 130, 246)',
        opacity: area.opacity !== undefined ? area.opacity : 0.5,
        shape: area.shape || 'rect',
      };
      setLocalArea(areaWithDefaults);
    } else if (!localArea) {
      // Force initialisation avec valeurs par défaut si pas d'image chargée encore
      const defaultArea = {
        x_percent: 25,
        y_percent: 25,
        width_percent: 50,
        height_percent: 50,
        color: 'rgb(59, 130, 246)',
        opacity: 0.5,
        shape: 'rect',
      };
      setLocalArea(defaultArea);
    }
  }, [area, imageDimensions.width, onAreaChange]);

  const updateImageDimensions = useCallback(() => {
    if (imageRef.current) {
      const dims = {
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight,
      };
      setImageDimensions(dims);
      if (onImageLoad) {
        onImageLoad(dims);
      }
    }
  }, [onImageLoad]);

  useEffect(() => {
    const img = imageRef.current;
    if (img) {
      const resizeObserver = new ResizeObserver(updateImageDimensions);
      resizeObserver.observe(img);
      
      const handleLoad = () => updateImageDimensions();
      img.addEventListener('load', handleLoad);
      if (img.complete) {
        handleLoad();
      }

      return () => {
        resizeObserver.disconnect();
        img.removeEventListener('load', handleLoad);
      }
    }
  }, [imageUrl, updateImageDimensions]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localArea) return;

    const startX = e.clientX;
    const startY = e.clientY;

    // Convert area from percent to px
    const xPx = (localArea.x_percent || 0) * imageDimensions.width / 100;
    const yPx = (localArea.y_percent || 0) * imageDimensions.height / 100;
    const widthPx = (localArea.width_percent || 0) * imageDimensions.width / 100;
    const heightPx = (localArea.height_percent || 0) * imageDimensions.height / 100;

    const initialArea = { 
      ...localArea, 
      x: xPx, 
      y: yPx, 
      width: widthPx, 
      height: heightPx 
    };

    setActiveDrag({ type: 'move', startX, startY, initialArea });
  }, [localArea, imageDimensions]);

  const handleResizeMouseDown = useCallback((e, handleName) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localArea) return;

    const startX = e.clientX;
    const startY = e.clientY;

    // Convert area from percent to px
    const xPx = (localArea.x_percent || 0) * imageDimensions.width / 100;
    const yPx = (localArea.y_percent || 0) * imageDimensions.height / 100;
    const widthPx = (localArea.width_percent || 0) * imageDimensions.width / 100;
    const heightPx = (localArea.height_percent || 0) * imageDimensions.height / 100;

    const initialArea = { 
      ...localArea, 
      x: xPx, 
      y: yPx, 
      width: widthPx, 
      height: heightPx 
    };

    setActiveDrag({ type: 'resize', handleName, startX, startY, initialArea });
  }, [localArea, imageDimensions]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!activeDrag || !imageDimensions.width) return;

      const dx = e.clientX - activeDrag.startX;
      const dy = e.clientY - activeDrag.startY;

      let newArea = { ...activeDrag.initialArea };

      if (activeDrag.type === 'move') {
        newArea.x += dx;
        newArea.y += dy;
      } else if (activeDrag.type === 'resize') {
        const { handleName } = activeDrag;
        if (handleName.includes('left')) {
            newArea.x += dx;
            newArea.width -= dx;
        }
        if (handleName.includes('top')) {
            newArea.y += dy;
            newArea.height -= dy;
        }
        if (handleName.includes('right')) {
            newArea.width += dx;
        }
        if (handleName.includes('bottom')) {
            newArea.height += dy;
        }
      }
      
      if (newArea.width < 0) {
        newArea.x = newArea.x + newArea.width;
        newArea.width = Math.abs(newArea.width);
      }
      if (newArea.height < 0) {
          newArea.y = newArea.y + newArea.height;
          newArea.height = Math.abs(newArea.height);
      }

      newArea.width = Math.max(10, newArea.width);
      newArea.height = Math.max(10, newArea.height);
      newArea.x = Math.max(0, Math.min(newArea.x, imageDimensions.width - newArea.width));
      newArea.y = Math.max(0, Math.min(newArea.y, imageDimensions.height - newArea.height));

      // Convert back to percent and pass to parent
      const updatedArea = {
        ...newArea,
        x_percent: (newArea.x / imageDimensions.width) * 100,
        y_percent: (newArea.y / imageDimensions.height) * 100,
        width_percent: (newArea.width / imageDimensions.width) * 100,
        height_percent: (newArea.height / imageDimensions.height) * 100,
        // Ensure color and opacity are preserved
        color: localArea.color || 'rgb(59, 130, 246)',
        opacity: localArea.opacity !== undefined ? localArea.opacity : 0.3,
        shape: localArea.shape || 'rect',
      };

      onAreaChange(updatedArea);
      setLocalArea(updatedArea);
    };

    const handleMouseUp = () => {
      setActiveDrag(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDrag, imageDimensions, onAreaChange]);

  const handleColorChange = (newColor) => {
    const updated = { ...localArea, color: newColor };
    setLocalArea(updated);
    onAreaChange(updated);
  };

  const handleOpacityChange = (newOpacity) => {
    const updated = { ...localArea, opacity: newOpacity };
    setLocalArea(updated);
    onAreaChange(updated);
  };

  const handleShapeChange = (newShape) => {
    const updated = { ...localArea, shape: newShape };
    setLocalArea(updated);
    onAreaChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Vérifier que localArea est initialisé */}
      {!localArea && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          Chargement de la zone d'action...
        </div>
      )}
      
      {/* Contrôles de style avec aperçu */}
      {localArea && (
        <div className="p-4 bg-white border rounded-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Couleur */}
            <div>
              <Label htmlFor="area-color" className="text-sm font-medium block mb-2">Couleur</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="area-color"
                  type="color"
                  value={rgbToHex(localArea?.color || 'rgb(59, 130, 246)')}
                  onChange={(e) => {
                    const rgb = parseInt(e.target.value.substring(1), 16);
                    const r = (rgb >> 16) & 255;
                    const g = (rgb >> 8) & 255;
                    const b = rgb & 255;
                    handleColorChange(`rgb(${r}, ${g}, ${b})`);
                  }}
                  className="h-10 w-16 cursor-pointer"
                />
                <div 
                  className="w-12 h-10 border-2 border-gray-300 rounded"
                  style={{
                    backgroundColor: `${localArea?.color || 'rgb(59, 130, 246)'}${localArea?.opacity !== undefined ? Math.round(localArea.opacity * 255).toString(16).padStart(2, '0') : '80'}`
                  }}
                />
              </div>
            </div>

            {/* Transparence */}
            <div>
              <Label htmlFor="area-opacity" className="text-sm font-medium block mb-2">
                Transparence: {Math.round((localArea?.opacity || 0.5) * 100)}%
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="area-opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localArea?.opacity || 0.5}
                  onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                  className="flex-1 h-2"
                />
                <span className="text-xs font-semibold text-gray-600 w-8">{Math.round((localArea?.opacity || 0.5) * 100)}%</span>
              </div>
              {/* Aperçu de transparence */}
              <div className="mt-2 p-2 bg-gray-100 rounded border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Aperçu:</p>
                <div className="flex gap-1">
                  {[0.2, 0.5, 0.8].map(opacity => (
                    <div 
                      key={opacity}
                      className="flex-1 h-8 border border-gray-300 rounded"
                      style={{
                        backgroundColor: `${localArea?.color || 'rgb(59, 130, 246)'}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">20% - 50% - 80%</p>
              </div>
            </div>

            {/* Forme */}
            <div>
              <Label htmlFor="area-shape" className="text-sm font-medium block mb-2">Forme</Label>
              <Select value={localArea?.shape || 'rect'} onValueChange={handleShapeChange}>
                <SelectTrigger id="area-shape" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rect">▭ Rectangle</SelectItem>
                  <SelectItem value="ellipse">◯ Ellipse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Zone dimensions info */}
      {localArea && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs font-semibold text-blue-900 mb-2">Coordonnées de la zone:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Position X:</span>
              <p className="font-mono font-bold text-blue-700">{Math.round(localArea.x_percent || 0)}%</p>
            </div>
            <div>
              <span className="text-gray-600">Position Y:</span>
              <p className="font-mono font-bold text-blue-700">{Math.round(localArea.y_percent || 0)}%</p>
            </div>
            <div>
              <span className="text-gray-600">Largeur:</span>
              <p className="font-mono font-bold text-blue-700">{Math.round(localArea.width_percent || 0)}%</p>
            </div>
            <div>
              <span className="text-gray-600">Hauteur:</span>
              <p className="font-mono font-bold text-blue-700">{Math.round(localArea.height_percent || 0)}%</p>
            </div>
          </div>
        </div>
      )}      {/* Image avec zone */}
      <div ref={containerRef} className="relative mx-auto border rounded-md bg-gray-200 aspect-[9/16] overflow-hidden" style={{ maxWidth: '360px' }}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Aperçu de l'étape"
          className="w-full h-full object-cover select-none"
          onDragStart={(e) => e.preventDefault()}
        />
        {localArea && (
          <ResizableArea
            area={localArea}
            imageDimensions={imageDimensions}
            onMouseDown={handleMouseDown}
            onResizeMouseDown={handleResizeMouseDown}
          />
        )}
      </div>
      
      <div className="space-y-2 text-xs p-3 bg-green-50 rounded border border-green-200">
        <p className="font-semibold text-green-900">
          ✓ Interaction sur la zone:
        </p>
        <ul className="list-disc list-inside space-y-1 text-green-800">
          <li><strong>Déplacer:</strong> Cliquez et glissez la zone</li>
          <li><strong>Redimensionner:</strong> Utilisez les 4 poignées blanches aux coins</li>
          <li><strong>Couleur & Transparence:</strong> Contrôlez au-dessus</li>
        </ul>
      </div>
    </div>
  );
};

export default StepAreaEditor;
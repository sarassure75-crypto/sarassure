import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import IconSelector from '@/components/IconSelector';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';

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

// Helper to get icon component from icon string
const getIconComponent = (iconString) => {
  if (!iconString) return null;
  
  // Pour les icônes Iconify (logos:, skill-icons:, devicon:)
  if (iconString.includes(':') && (
    iconString.startsWith('logos:') || 
    iconString.startsWith('skill-icons:') || 
    iconString.startsWith('devicon:')
  )) {
    return (props) => <IconifyIcon icon={iconString} {...props} />;
  }
  
  const [library, name] = iconString.split(':');
  
  // Import icon libraries
  const libraries = {
    lucide: LucideIcons,
    fa6: FontAwesome6,
    bs: BootstrapIcons,
    md: MaterialIcons,
    fi: FeatherIcons,
    hi2: HeroiconsIcons,
    ai: AntIcons,
  };
  
  const lib = libraries[library];
  return lib ? lib[name] : null;
};

const ResizableArea = ({ area, imageDimensions, imageOffset, onMouseDown, onResizeMouseDown }) => {
  if (!area || !imageDimensions.width || imageOffset === undefined) return null;
  
  // Define resize handles for corners
  const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  
  // Convert percent to px for display
  const xPx = imageOffset.x + (area.x_percent || 0) * imageDimensions.width / 100;
  const yPx = imageOffset.y + (area.y_percent || 0) * imageDimensions.height / 100;
  const widthPx = (area.width_percent || 0) * imageDimensions.width / 100;
  const heightPx = (area.height_percent || 0) * imageDimensions.height / 100;

  // Get color with opacity
  const color = area.color || "rgb(59, 130, 246)";
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
    borderRadius: area.shape === 'ellipse' ? '50%' : '8px',
    position: 'absolute',
    borderWidth: '3px',
    borderStyle: 'solid',
    cursor: 'grab',
    boxSizing: 'border-box',
    boxShadow: `0 0 0 2px rgba(59, 130, 246, 0.3), inset 0 0 0 1px rgba(255,255,255,0.4)`,
    transition: 'box-shadow 0.2s ease',
  };

  return (
    <div 
      style={style} 
      onMouseDown={onMouseDown}
      className="group hover:shadow-lg flex items-center justify-center"
      title="Cliquez et glissez pour déplacer"
    >
      {/* Afficher l'icône si présente */}
      {area.icon_name && (
        <div className="absolute pointer-events-none flex items-center justify-center" style={{ zIndex: 20 }}>
          {(() => {
            const IconComponent = getIconComponent(area.icon_name);
            return IconComponent ? <IconComponent className="text-white" style={{ fontSize: '3rem' }} /> : null;
          })()}
        </div>
      )}
      
      {/* Poignée de déplacement - uniquement si pas d'icône */}
      {!area.icon_name && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="flex flex-col items-center gap-0.5 opacity-60">
            <div className="w-6 h-1 bg-white rounded-full"></div>
            <div className="w-6 h-1 bg-white rounded-full"></div>
            <div className="w-6 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      )}

      {/* Étiquette "⋮⋮" - uniquement si pas d'icône */}
      {!area.icon_name && (
        <div className="absolute top-1 left-1 text-xs font-bold text-white opacity-75 pointer-events-none">
          ⋮⋮
        </div>
      )}

      {/* Poignées de redimensionnement - toujours visibles */}
      {handles.map(handleName => (
        <div
          key={handleName}
          className={`absolute bg-white border-2 border-blue-500 rounded-full w-4 h-4 -m-2 shadow-md z-10
              ${handleName.includes('left') ? 'left-0' : 'right-0'}
              ${handleName.includes('top') ? 'top-0' : 'bottom-0'}
              cursor-${(handleName.includes('top') && handleName.includes('left')) || (handleName.includes('bottom') && handleName.includes('right')) ? 'nwse' : 'nesw'}-resize
              hover:bg-blue-100 hover:scale-125 transition-all
          `}
          onMouseDown={(e) => onResizeMouseDown(e, handleName)}
          title={`Redimensionner: ${handleName}`}
        />
      ))}
    </div>
  );
};

const StepAreaEditor = ({ imageUrl, area, onAreaChange, onImageLoad }) => {
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
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
        is_visible: true,
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
        is_visible: area.is_visible !== undefined ? area.is_visible : true,
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
        is_visible: true,
      };
      setLocalArea(defaultArea);
    }
  }, [area, imageDimensions.width, onAreaChange]);

  const updateImageDimensions = useCallback(() => {
    if (imageRef.current && imageRef.current.complete) {
      const img = imageRef.current;
      const rect = imageRef.current.getBoundingClientRect();
      
      // ✅ Calculer les dimensions RÉELLES de l'image visible (sans les marges de object-fit: contain)
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      
      // Ratio de l'image originale
      const imageRatio = naturalWidth / naturalHeight;
      // Ratio du conteneur
      const containerRatio = containerWidth / containerHeight;
      
      let actualWidth, actualHeight, offsetX, offsetY;
      
      if (imageRatio > containerRatio) {
        // Image plus large : limitée par la largeur
        actualWidth = containerWidth;
        actualHeight = containerWidth / imageRatio;
        offsetX = 0;
        offsetY = (containerHeight - actualHeight) / 2;
      } else {
        // Image plus haute : limitée par la hauteur
        actualHeight = containerHeight;
        actualWidth = containerHeight * imageRatio;
        offsetX = (containerWidth - actualWidth) / 2;
        offsetY = 0;
      }
      
      const dims = {
        width: actualWidth,
        height: actualHeight,
      };
      setImageDimensions(dims);
        setImageOffset({ x: offsetX, y: offsetY });
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
    const xPx = (localArea.x_percent || 0) * imageDimensions.width / 100 + imageOffset.x;
    const yPx = (localArea.y_percent || 0) * imageDimensions.height / 100 + imageOffset.y;
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
  }, [localArea, imageDimensions, imageOffset]);

  const handleResizeMouseDown = useCallback((e, handleName) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localArea) return;

    const startX = e.clientX;
    const startY = e.clientY;

    // Convert area from percent to px
    const xPx = (localArea.x_percent || 0) * imageDimensions.width / 100 + imageOffset.x;
    const yPx = (localArea.y_percent || 0) * imageDimensions.height / 100 + imageOffset.y;
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
  }, [localArea, imageDimensions, imageOffset]);

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
      newArea.x = Math.max(imageOffset.x, Math.min(newArea.x, imageOffset.x + imageDimensions.width - newArea.width));
      newArea.y = Math.max(imageOffset.y, Math.min(newArea.y, imageOffset.y + imageDimensions.height - newArea.height));

      // Convert back to percent and pass to parent
      const updatedArea = {
        // ✅ Garder les propriétés essentielles de localArea (sauf x, y, width, height)
        ...(() => {
          const { x: _x, y: _y, width: _w, height: _h, ...rest } = localArea;
          return rest;
        })(),
        // ✅ Soustraire imageOffset avant de convertir en pourcentage
        x_percent: ((newArea.x - imageOffset.x) / imageDimensions.width) * 100,
        y_percent: ((newArea.y - imageOffset.y) / imageDimensions.height) * 100,
        width_percent: (newArea.width / imageDimensions.width) * 100,
        height_percent: (newArea.height / imageDimensions.height) * 100,
        // Ensure color and opacity are preserved
        color: localArea.color || 'rgb(59, 130, 246)',
        opacity: localArea.opacity !== undefined ? localArea.opacity : 0.3,
        shape: localArea.shape || 'rect',
        is_visible: localArea.is_visible !== undefined ? localArea.is_visible : true,
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

  const handleIconSelect = (icon) => {
    const iconString = icon ? `${icon.library}:${icon.name}` : null;
    const updated = { ...localArea, icon_name: iconString };
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

      {/* Section Icône */}
      {localArea && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-900">🎨 Icône de la zone (optionnel)</h3>
            {localArea.icon_name && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleIconSelect(null)}
                className="h-6 text-amber-600 hover:text-amber-700"
              >
                <X className="h-4 w-4" /> Supprimer
              </Button>
            )}
          </div>
          
          <p className="text-xs text-amber-700 italic">
            Sélectionnez une icône pour remplacer la zone transparente. L'icône s'affichera au centre de la zone.
          </p>

          {localArea.icon_name && (
            <div className="p-2 bg-white border border-amber-300 rounded flex items-center gap-2">
              <span className="text-xs font-medium text-amber-900">Icône sélectionnée:</span>
              <span className="text-sm font-mono text-amber-700">{localArea.icon_name}</span>
            </div>
          )}

          <IconSelector
            onSelect={handleIconSelect}
            onRemove={() => handleIconSelect(null)}
            libraries={['lucide', 'fa6', 'bs', 'md', 'fi', 'hi2', 'ai', 'logos', 'skill', 'devicon']}
            showSearch={true}
            showLibraryTabs={true}
          />
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
      )}

      {/* Zoom aperçu pour faciliter le placement côté admin */}
      <div className="mt-3 flex items-center gap-3">
        <label className="text-xs font-semibold text-blue-900">Zoom aperçu:</label>
        <input
          type="range"
          min="0.8"
          max="1.6"
          step="0.05"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-40"
        />
        <span className="text-xs font-mono text-blue-700">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Image avec zone */}
      <div ref={containerRef} className="relative mx-auto border-4 border-gray-400 rounded-lg bg-gray-900 overflow-auto shadow-2xl" style={{ maxWidth: '100%', maxHeight: `${Math.round(85 * zoom)}vh`, aspectRatio: '9/16' }}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Aperçu de l'étape"
          className="w-full h-full object-contain select-none"
          onDragStart={(e) => e.preventDefault()}
        />
        {localArea && (
          <ResizableArea
            area={localArea}
            imageDimensions={imageDimensions}
                        imageOffset={imageOffset}
            onMouseDown={handleMouseDown}
            onResizeMouseDown={handleResizeMouseDown}
          />
        )}
      </div>
      
      <div className="space-y-2 text-xs p-3 bg-blue-50 rounded border-l-4 border-l-blue-500 border border-blue-200">
        <p className="font-semibold text-blue-900 flex items-center gap-2">
          📱 <span>Mode Smartphone - Interaction sur la zone:</span>
        </p>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li><strong>Déplacer la zone:</strong> Cliquez et glissez la boîte bleue (comme sur votre téléphone)</li>
          <li><strong>Redimensionner:</strong> Utilisez les 4 points blancs aux coins</li>
          <li><strong>Personnaliser:</strong> Changez couleur, transparence et forme au-dessus</li>
          <li><strong>Ajouter une icône:</strong> Sélectionnez une icône pour l'afficher dans la zone (remplace les lignes ⋮⋮)</li>
          <li><strong>Texte blanc:</strong> Les trois lignes ⋮⋮ indiquent le point de saisie (disparaît avec une icône)</li>
        </ul>
      </div>
    </div>
  );
};

export default StepAreaEditor;
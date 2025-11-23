
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Square, Circle, Paintbrush } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import '@/index.css'; // Import base styles for Tailwind

function colorToRgba(color, opacity) {
    if (!color) return `rgba(0, 0, 0, ${opacity})`;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function rgbaToHex(rgba) {
    if (!rgba || typeof rgba !== 'string') return '#ef4444';
    const parts = rgba.match(/(\d+)/g);
    if (!parts || parts.length < 3) return '#ef4444';
    return "#" + parts.slice(0, 3).map(part => {
        const hex = parseInt(part, 10).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function rgbaToOpacity(rgba) {
    if (!rgba || typeof rgba !== 'string') return 0.5;
    const parts = rgba.match(/(\d\.\d+)|\d+/g);
    return parts && parts.length > 3 ? parseFloat(parts[3]) : 0.5;
}

const AreaStyleEditorClient = ({ area, onAreaChange }) => {
    if (!area) return null;

    const currentHex = rgbaToHex(area.color);
    const currentOpacity = rgbaToOpacity(area.color);

    const handleShapeChange = (shape) => {
        onAreaChange({ ...area, shape });
    };

    const handleColorChange = (newHex) => {
        onAreaChange({ ...area, color: colorToRgba(newHex, currentOpacity) });
    };

    const handleOpacityChange = (opacityArray) => {
        const opacity = opacityArray[0];
        onAreaChange({ ...area, color: colorToRgba(currentHex, opacity) });
    };

    return (
        <div className="p-3 border rounded-md bg-background space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Style de la zone</Label>
                <div className="flex items-center space-x-1">
                    <Button
                        variant={area.shape === 'rectangle' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleShapeChange('rectangle')}
                    >
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={area.shape === 'ellipse' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleShapeChange('ellipse')}
                    >
                        <Circle className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <Label className="text-sm w-16 shrink-0">Couleur</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-8 w-8 p-0 border-2" style={{ backgroundColor: area.color }}>
                            <Paintbrush className="h-4 w-4 text-white mix-blend-difference" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <HexColorPicker color={currentHex} onChange={handleColorChange} />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center space-x-4">
                <Label htmlFor="opacity-slider" className="text-sm w-16 shrink-0">Opacité</Label>
                <Slider
                    id="opacity-slider"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[currentOpacity]}
                    onValueChange={handleOpacityChange}
                    className={cn('w-full')}
                />
                <span className="text-sm font-mono w-10 text-right">{(currentOpacity * 100).toFixed(0)}%</span>
            </div>
        </div>
    );
};

export default AreaStyleEditorClient;

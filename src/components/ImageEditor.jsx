import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Square, Circle, Move, Eraser, Download, Undo, Redo } from 'lucide-react';

/**
 * ImageEditor - Éditeur d'images pour flouter ou masquer des zones
 * Permet de protéger les informations personnelles sur les captures d'écran
 */
export default function ImageEditor({ open, onOpenChange, imageUrl, onSave }) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [tool, setTool] = useState('blur'); // 'blur', 'whiteBox', 'blackBox'
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Charger l'image dans le canvas
  useEffect(() => {
    if (!open || !imageUrl || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    setCtx(context);
    
    console.log('Chargement de l\'image:', imageUrl);

    const loadImage = async () => {
      try {
        // Méthode 1: Essayer avec fetch (pour contourner CORS)
        console.log('Tentative de chargement via fetch...');
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        console.log('Blob reçu:', blob.size, 'bytes');
        
        const img = new Image();
        const objectUrl = URL.createObjectURL(blob);
        
        img.onload = () => {
          console.log('Image chargée:', img.width, 'x', img.height);
          
          // Ajuster la taille du canvas
          const maxWidth = 1920;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Dessiner l'image
          context.clearRect(0, 0, width, height);
          context.drawImage(img, 0, 0, width, height);
          
          console.log('Image dessinée sur le canvas');
          
          setOriginalImage(img);
          setImageLoaded(true);
          
          // Sauvegarder l'état initial
          setTimeout(() => saveToHistory(), 100);
          
          // Libérer l'URL object
          URL.revokeObjectURL(objectUrl);
        };
        
        img.onerror = (error) => {
          console.error('Erreur img.onload:', error);
          URL.revokeObjectURL(objectUrl);
          // Essayer la méthode 2
          tryDirectLoad();
        };
        
        img.src = objectUrl;
        
      } catch (error) {
        console.error('Erreur fetch:', error);
        // Essayer la méthode 2
        tryDirectLoad();
      }
    };
    
    // Méthode 2: Chargement direct (fallback)
    const tryDirectLoad = () => {
      console.log('Tentative de chargement direct...');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('Image chargée (direct):', img.width, 'x', img.height);
        
        const maxWidth = 1920;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.drawImage(img, 0, 0, width, height);
        
        setOriginalImage(img);
        setImageLoaded(true);
        setTimeout(() => saveToHistory(), 100);
      };
      
      img.onerror = (error) => {
        console.error('Erreur chargement direct:', error);
        alert('Impossible de charger l\'image. L\'URL peut être invalide ou inaccessible.');
      };
      
      img.src = imageUrl;
    };

    loadImage();
    
    // Cleanup
    return () => {
      setImageLoaded(false);
      setHistory([]);
      setHistoryStep(-1);
    };
  }, [open, imageUrl]);

  // Sauvegarder l'état actuel dans l'historique
  const saveToHistory = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Annuler (Undo)
  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      loadImageFromHistory(history[newStep]);
    }
  };

  // Refaire (Redo)
  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      loadImageFromHistory(history[newStep]);
    }
  };

  // Charger une image depuis l'historique
  const loadImageFromHistory = (imageDataUrl) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    img.src = imageDataUrl;
  };

  // Appliquer un flou sur une zone rectangulaire
  const applyBlur = (x, y, width, height) => {
    if (!ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Extraire la zone à flouter
    const imageData = ctx.getImageData(x, y, width, height);
    const pixels = imageData.data;

    // Appliquer un flou simple (moyenne des pixels voisins)
    const blurRadius = 10;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Utiliser le filtre CSS blur (plus performant)
    ctx.filter = 'blur(15px)';
    ctx.drawImage(tempCanvas, x, y);
    ctx.filter = 'none';
  };

  // Dessiner un rectangle (blanc ou noir)
  const drawBox = (x, y, width, height, color) => {
    if (!ctx) return;
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };

  // Gestion du début du dessin
  const handleMouseDown = (e) => {
    if (!imageLoaded) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setStartPos({ x, y });
    setIsDrawing(true);
  };

  // Gestion du dessin en cours
  const handleMouseMove = (e) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    // Redessiner l'image pour effacer le rectangle temporaire
    if (history[historyStep]) {
      loadImageFromHistory(history[historyStep]);
    }

    // Dessiner le rectangle de prévisualisation
    ctx.strokeStyle = tool === 'blur' ? '#3b82f6' : tool === 'whiteBox' ? '#fff' : '#000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      currentX - startPos.x,
      currentY - startPos.y
    );
    ctx.setLineDash([]);
  };

  // Fin du dessin
  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;
    
    const x = Math.min(startPos.x, endX);
    const y = Math.min(startPos.y, endY);
    const width = Math.abs(endX - startPos.x);
    const height = Math.abs(endY - startPos.y);

    // Appliquer l'effet selon l'outil sélectionné
    if (width > 5 && height > 5) {
      // Redessiner l'image proprement
      if (history[historyStep]) {
        loadImageFromHistory(history[historyStep]);
      }

      setTimeout(() => {
        if (tool === 'blur') {
          applyBlur(x, y, width, height);
        } else if (tool === 'whiteBox') {
          drawBox(x, y, width, height, '#ffffff');
        } else if (tool === 'blackBox') {
          drawBox(x, y, width, height, '#000000');
        }
        
        saveToHistory();
      }, 10);
    }

    setIsDrawing(false);
  };

  // Sauvegarder l'image modifiée
  const handleSave = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (blob && onSave) {
        onSave(blob);
      }
    }, 'image/png');
  };

  // Télécharger l'image modifiée
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `edited-image-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Réinitialiser les états à la fermeture
  const handleClose = () => {
    setHistory([]);
    setHistoryStep(-1);
    setImageLoaded(false);
    setIsDrawing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Éditeur d'image - Protéger les informations personnelles</DialogTitle>
        </DialogHeader>

        {/* Barre d'outils */}
        <div className="flex items-center gap-2 py-3 border-b">
          <Button
            variant={tool === 'blur' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('blur')}
            className="flex items-center gap-2"
          >
            <Circle className="w-4 h-4" />
            Flou
          </Button>
          
          <Button
            variant={tool === 'whiteBox' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('whiteBox')}
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Cadre blanc
          </Button>
          
          <Button
            variant={tool === 'blackBox' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('blackBox')}
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4 fill-current" />
            Cadre noir
          </Button>

          <div className="border-l h-6 mx-2"></div>

          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyStep <= 0}
            className="flex items-center gap-2"
          >
            <Undo className="w-4 h-4" />
            Annuler
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="flex items-center gap-2"
          >
            <Redo className="w-4 h-4" />
            Refaire
          </Button>

          <div className="border-l h-6 mx-2"></div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!imageLoaded}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </Button>
        </div>

        {/* Zone de dessin */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDrawing(false)}
            className="max-w-full max-h-full cursor-crosshair bg-white shadow-lg"
            style={{ 
              imageRendering: 'crisp-edges',
              cursor: isDrawing ? 'crosshair' : 'crosshair'
            }}
          />
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <strong>Instructions :</strong> Sélectionnez un outil, puis cliquez et glissez sur l'image pour créer une zone {tool === 'blur' ? 'floutée' : 'masquée'}.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!imageLoaded}>
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

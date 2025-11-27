import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * Composant pour visualiser les étapes d'un exercice avec zones d'action
 * Logique robuste inspirée de AdminExerciseStepEditor
 */
export default function ExerciseStepViewer({ steps = [] }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Fonction pour parser une zone d'action depuis JSON (copiée de l'éditeur)
  const parseAreaData = (areaJson) => {
    if (!areaJson) return null;
    try {
      return typeof areaJson === 'string' ? JSON.parse(areaJson) : areaJson;
    } catch (e) {
      console.error('Error parsing area data:', e);
      return null;
    }
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
        <p className="text-gray-600">Aucune étape à visualiser</p>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const hasImage = currentStep?.image_url;
  
  console.log('ExerciseStepViewer - Current step:', currentStepIndex, currentStep);
  console.log('🔍 STEP DEBUG - Zones disponibles:', {
    target_area: currentStep?.target_area,
    text_input_area: currentStep?.text_input_area,
    start_area: currentStep?.start_area,
    hasAnyArea: !!(currentStep?.target_area || currentStep?.text_input_area || currentStep?.start_area)
  });

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setZoom(1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setZoom(1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Visualisation des étapes</h3>
        <span className="text-sm text-gray-600">
          Étape {currentStepIndex + 1} / {steps.length}
        </span>
      </div>

      {/* Affichage de l'étape - NOUVELLE LOGIQUE INSPIRÉE DE L'ÉDITEUR */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Image avec zones d'action */}
        <div className="p-6">
          {hasImage ? (
            <div className="relative mx-auto" style={{ maxWidth: '400px' }}>
              <img
                src={currentStep.image_url}
                alt={`Étape ${currentStepIndex + 1}`}
                className="w-full h-auto rounded-lg border border-gray-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                onLoad={() => console.log('✅ Image chargée:', currentStep.image_url)}
                onError={(e) => {
                  console.error('❌ Erreur chargement image:', currentStep.image_url);
                  console.error('Path:', currentStep.image_path);
                }}
              />
              
              {/* Zones d'action avec logique robuste de l'éditeur */}
              {[
                { data: parseAreaData(currentStep.target_area), color: 'rgba(239, 68, 68, 0.3)', borderColor: '#ef4444' },
                { data: parseAreaData(currentStep.text_input_area), color: 'rgba(59, 130, 246, 0.3)', borderColor: '#3b82f6' },
                { data: parseAreaData(currentStep.start_area), color: 'rgba(34, 197, 94, 0.3)', borderColor: '#22c55e' }
              ].map((zone, zoneIndex) => {
                if (!zone.data) return null;
                
                const x = zone.data.x_percent ?? zone.data.x ?? 0;
                const y = zone.data.y_percent ?? zone.data.y ?? 0;
                const w = zone.data.width_percent ?? zone.data.width ?? 10;
                const h = zone.data.height_percent ?? zone.data.height ?? 10;
                
                console.log(`🎯 Zone ${zoneIndex} coords:`, { x, y, w, h, data: zone.data });
                
                return (
                  <div
                    key={zoneIndex}
                    className="absolute border-2 border-dashed"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${w}%`,
                      height: `${h}%`,
                      backgroundColor: zone.data.color ? 
                        zone.data.color.replace('rgb', 'rgba').replace(')', `, ${zone.data.opacity || 0.3})`) : 
                        zone.color,
                      borderColor: zone.data.color || zone.borderColor,
                      borderRadius: zone.data.shape === 'ellipse' ? '50%' : '4px',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left'
                    }}
                  />
                );
              })}

              {/* Message si aucune zone */}
              {!(currentStep.target_area || currentStep.text_input_area || currentStep.start_area) && (
                <div className="absolute top-2 left-2 bg-amber-100 border border-amber-300 rounded px-3 py-1 text-xs text-amber-800">
                  ℹ️ Aucune zone d'action définie
                </div>
              )}

              {/* Debug info condensé */}
              <div className="absolute top-2 right-2 bg-white/90 border border-gray-300 rounded p-2 text-xs max-w-xs">
                <p className="font-bold mb-1">🔍 ZONES</p>
                <p><strong>Target:</strong> {currentStep.target_area ? '✓' : '✗'}</p>
                <p><strong>Input:</strong> {currentStep.text_input_area ? '✓' : '✗'}</p>
                <p><strong>Start:</strong> {currentStep.start_area ? '✓' : '✗'}</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center p-8">
              <p className="font-semibold mb-2">⚠️ Image non disponible</p>
              <p className="text-xs">URL: {currentStep.image_url || 'N/A'}</p>
            </div>
          )}
        </div>

        {/* Informations sur l'étape */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium text-gray-700">Instruction:</span>
              <span className="ml-2 text-gray-900">{currentStep.instruction}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-700">Action:</span>
              <span className="ml-2 text-gray-900 font-mono bg-gray-200 px-2 py-1 rounded text-xs">
                {currentStep.action_type}
              </span>
            </p>
            {currentStep.expected_input && (
              <p className="text-sm">
                <span className="font-medium text-gray-700">Saisie attendue:</span>
                <span className="ml-2 text-gray-900">{currentStep.expected_input}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contrôles de navigation et zoom */}
      {steps.length > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédente</span>
          </button>

          <div className="flex items-center space-x-4">
            {/* Indicateurs d'étapes */}
            <div className="flex space-x-1">
              {steps.map((_, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => setCurrentStepIndex(stepIndex)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    stepIndex === currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {stepIndex + 1}
                </button>
              ))}
            </div>

            {/* Contrôles de zoom */}
            <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="text-gray-600 hover:text-gray-900"
                title="Zoom arrière"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-2">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="text-gray-600 hover:text-gray-900"
                title="Zoom avant"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Suivante</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
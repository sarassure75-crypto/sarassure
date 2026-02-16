import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

/**
 * Composant pour visualiser les étapes d'un exercice avec zones d'action
 */
export default function ExerciseStepViewer({ steps = [] }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  if (!steps || steps.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
        <p className="text-gray-600">Aucune étape à visualiser</p>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];

  console.log('ExerciseStepViewer - Current step:', currentStepIndex, currentStep);
  console.log('🔍 STEP DEBUG - Zones disponibles:', {
    target_area: currentStep?.target_area,
    text_input_area: currentStep?.text_input_area,
    start_area: currentStep?.start_area,
    hasAnyArea: !!(
      currentStep?.target_area ||
      currentStep?.text_input_area ||
      currentStep?.start_area
    ),
  });
  const hasImage = currentStep?.image_url;

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

      {/* Affichage de l'étape */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Image */}
        <div className="bg-gray-100 relative aspect-video flex items-center justify-center overflow-auto max-h-96">
          {hasImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={currentStep.image_url}
                alt={`Step ${currentStepIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                onLoad={() => console.log('Image loaded successfully:', currentStep.image_url)}
                onError={(e) => {
                  console.error('Image load error:', currentStep.image_url);
                  console.error('Image path:', currentStep.image_path);
                  e.target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'text-gray-400 text-center p-4';
                  errorDiv.innerHTML =
                    '<p class="font-semibold mb-2">⚠️ Impossible de charger l\'image</p>' +
                    '<p class="text-xs mb-1">URL: ' +
                    currentStep.image_url +
                    '</p>' +
                    '<p class="text-xs">Path: ' +
                    (currentStep.image_path || 'N/A') +
                    '</p>';
                  e.target.parentElement.appendChild(errorDiv);
                }}
              />

              {/* Zones d'action */}
              {(currentStep.target_area ||
                currentStep.text_input_area ||
                currentStep.start_area) && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Zone de clic avec couleur du contributeur */}
                  {currentStep.target_area &&
                    (() => {
                      try {
                        const area =
                          typeof currentStep.target_area === 'string'
                            ? JSON.parse(currentStep.target_area)
                            : currentStep.target_area;

                        console.log('🎯 TARGET AREA DEBUG:', {
                          raw: currentStep.target_area,
                          parsed: area,
                          type: typeof currentStep.target_area,
                        });

                        // Chercher les coordonnées avec priorité aux propriétés _percent
                        const x = area.x_percent ?? area.x ?? 0;
                        const y = area.y_percent ?? area.y ?? 0;
                        const w = area.width_percent ?? area.width ?? 10;
                        const h = area.height_percent ?? area.height ?? 10;

                        console.log('🎯 TARGET AREA COORDS:', { x, y, w, h, area });

                        // Utiliser la couleur du contributeur
                        const color = area.color || 'rgb(239, 68, 68)';
                        const opacity = area.opacity !== undefined ? area.opacity : 0.4;
                        const fillColor = color.includes('rgb')
                          ? color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
                          : `rgba(239, 68, 68, ${opacity})`;

                        return (
                          <svg
                            className="absolute inset-0 w-full h-full"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                          >
                            <rect
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill={fillColor}
                              stroke={color}
                              strokeWidth="3"
                              strokeDasharray="5,5"
                              rx={area.shape === 'ellipse' ? `${Math.min(w, h) / 2}%` : '4'}
                            />
                          </svg>
                        );
                      } catch (e) {
                        console.error('Error parsing target_area:', e);
                        return null;
                      }
                    })()}

                  {/* Zone de saisie avec couleur du contributeur */}
                  {currentStep.text_input_area &&
                    (() => {
                      try {
                        const area =
                          typeof currentStep.text_input_area === 'string'
                            ? JSON.parse(currentStep.text_input_area)
                            : currentStep.text_input_area;

                        console.log('✏️ TEXT INPUT AREA DEBUG:', {
                          raw: currentStep.text_input_area,
                          parsed: area,
                          type: typeof currentStep.text_input_area,
                        });

                        // Chercher les coordonnées avec priorité aux propriétés _percent
                        const x = area.x_percent ?? area.x ?? 0;
                        const y = area.y_percent ?? area.y ?? 0;
                        const w = area.width_percent ?? area.width ?? 10;
                        const h = area.height_percent ?? area.height ?? 10;

                        console.log('✏️ TEXT INPUT AREA COORDS:', { x, y, w, h, area });

                        // Utiliser la couleur du contributeur
                        const color = area.color || 'rgb(59, 130, 246)';
                        const opacity = area.opacity !== undefined ? area.opacity : 0.4;
                        const fillColor = color.includes('rgb')
                          ? color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
                          : `rgba(59, 130, 246, ${opacity})`;

                        return (
                          <svg
                            className="absolute inset-0 w-full h-full"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                          >
                            <rect
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill={fillColor}
                              stroke={color}
                              strokeWidth="3"
                              strokeDasharray="5,5"
                              rx={area.shape === 'ellipse' ? `${Math.min(w, h) / 2}%` : '4'}
                            />
                          </svg>
                        );
                      } catch (e) {
                        console.error('Error parsing text_input_area:', e);
                        return null;
                      }
                    })()}

                  {/* Zone de départ avec couleur du contributeur */}
                  {currentStep.start_area &&
                    (() => {
                      try {
                        const area =
                          typeof currentStep.start_area === 'string'
                            ? JSON.parse(currentStep.start_area)
                            : currentStep.start_area;

                        console.log('🚀 START AREA DEBUG:', {
                          raw: currentStep.start_area,
                          parsed: area,
                          type: typeof currentStep.start_area,
                        });

                        // Chercher les coordonnées avec priorité aux propriétés _percent
                        const x = area.x_percent ?? area.x ?? 0;
                        const y = area.y_percent ?? area.y ?? 0;
                        const w = area.width_percent ?? area.width ?? 10;
                        const h = area.height_percent ?? area.height ?? 10;

                        console.log('🚀 START AREA COORDS:', { x, y, w, h, area });

                        // Utiliser la couleur du contributeur
                        const color = area.color || 'rgb(34, 197, 94)';
                        const opacity = area.opacity !== undefined ? area.opacity : 0.4;
                        const fillColor = color.includes('rgb')
                          ? color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
                          : `rgba(34, 197, 94, ${opacity})`;

                        return (
                          <svg
                            className="absolute inset-0 w-full h-full"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                          >
                            <rect
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill={fillColor}
                              stroke={color}
                              strokeWidth="3"
                              strokeDasharray="5,5"
                              rx={area.shape === 'ellipse' ? `${Math.min(w, h) / 2}%` : '4'}
                            />
                          </svg>
                        );
                      } catch (e) {
                        console.error('Error parsing start_area:', e);
                        return null;
                      }
                    })()}
                </div>
              )}

              {/* Message si aucune zone */}
              {!(
                currentStep.target_area ||
                currentStep.text_input_area ||
                currentStep.start_area
              ) && (
                <div className="absolute top-2 left-2 bg-amber-100 border border-amber-300 rounded px-3 py-1 text-xs text-amber-800">
                  ℹ️ Aucune zone d'action définie
                </div>
              )}

              {/* DEBUG: Affichage temporaire des zones brutes */}
              <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded p-2 text-xs max-w-xs opacity-90 z-10">
                <p className="font-bold mb-1">🔍 DEBUG ZONES</p>
                <p>
                  <strong>Target:</strong> {currentStep.target_area ? '✓' : '✗'}
                </p>
                <p>
                  <strong>Text Input:</strong> {currentStep.text_input_area ? '✓' : '✗'}
                </p>
                <p>
                  <strong>Start:</strong> {currentStep.start_area ? '✓' : '✗'}
                </p>
                {currentStep.target_area && (
                  <p className="text-blue-600 mt-1">
                    <strong>Target Raw:</strong>{' '}
                    {typeof currentStep.target_area === 'string'
                      ? currentStep.target_area.substring(0, 50) + '...'
                      : JSON.stringify(currentStep.target_area).substring(0, 50) + '...'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center p-8">
              <p className="text-lg mb-2">📷 Pas d'image pour cette étape</p>
              <div className="text-xs space-y-1 text-gray-500">
                <p>Image URL: {currentStep.image_url || 'Non définie'}</p>
                <p>Image Path: {currentStep.image_path || 'Non défini'}</p>
                <p>
                  App Images:{' '}
                  {currentStep.app_images ? JSON.stringify(currentStep.app_images) : 'Aucune'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles de zoom */}
        <div className="border-t border-gray-200 p-3 flex items-center justify-center gap-2 bg-gray-50">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            className="p-1 hover:bg-gray-200 rounded"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600 min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.2))}
            className="p-1 hover:bg-gray-200 rounded"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Infos étape */}
        <div className="border-t border-gray-200 p-4 bg-white space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Action</p>
            <p className="font-medium text-gray-900 capitalize">
              {currentStep.action_type || 'Non spécifiée'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Instruction</p>
            <p className="text-gray-900">{currentStep.instruction || 'Aucune instruction'}</p>
          </div>

          {/* Debug des zones d'action - Visible uniquement en développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm font-medium text-yellow-900 mb-2">🔍 Debug des zones :</p>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Target Area:</strong>{' '}
                  {typeof currentStep.target_area === 'object'
                    ? JSON.stringify(currentStep.target_area)
                    : currentStep.target_area || 'Aucune'}
                </p>
                <p>
                  <strong>Text Input Area:</strong>{' '}
                  {typeof currentStep.text_input_area === 'object'
                    ? JSON.stringify(currentStep.text_input_area)
                    : currentStep.text_input_area || 'Aucune'}
                </p>
                <p>
                  <strong>Start Area:</strong>{' '}
                  {typeof currentStep.start_area === 'object'
                    ? JSON.stringify(currentStep.start_area)
                    : currentStep.start_area || 'Aucune'}
                </p>
              </div>
            </div>
          )}

          {/* Affichage du texte à saisir si présent */}
          {currentStep.text_value && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-blue-900 mb-1">📝 Texte à saisir</p>
              <p className="text-blue-900 font-mono">{currentStep.text_value}</p>
            </div>
          )}

          {/* Affichage du numéro à saisir si présent */}
          {currentStep.number_value && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm font-medium text-green-900 mb-1">🔢 Numéro à saisir</p>
              <p className="text-green-900 font-mono text-lg">{currentStep.number_value}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation entre étapes */}
      {steps.length > 1 && (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédente</span>
          </button>

          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setZoom(1);
                }}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                  idx === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Suivante</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

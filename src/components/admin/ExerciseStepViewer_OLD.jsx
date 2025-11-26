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

  console.log('ExerciseStepViewer - Current step:', currentStepIndex, steps[currentStepIndex]);
  
  const currentStep = steps[currentStepIndex];
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
                  errorDiv.innerHTML = '<p class="font-semibold mb-2">⚠️ Impossible de charger l\'image</p>' +
                    '<p class="text-xs mb-1">URL: ' + currentStep.image_url + '</p>' +
                    '<p class="text-xs">Path: ' + (currentStep.image_path || 'N/A') + '</p>';
                  e.target.parentElement.appendChild(errorDiv);
                }}
              />

              {/* Affichage de la zone d'action si disponible */}
              {(currentStep.target_area || currentStep.text_input_area || currentStep.start_area) ? (
                <div className="absolute inset-0 pointer-events-none">
                  {currentStep.target_area && (
                    <svg className="absolute inset-0 w-full h-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                      {(() => {
                        try {
                          const area = JSON.parse(currentStep.target_area);
                          const x = area.x || 0;
                          const y = area.y || 0;
                          const w = area.width || 10;
                          const h = area.height || 10;

                          return (
                            <rect
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill="rgba(239, 68, 68, 0.4)"
                              stroke="rgb(220, 38, 38)"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                            />
                          );
                        } catch (e) {
                          console.error('Error parsing target_area:', e);
                          return null;
                        }
                      })()}
                    </svg>
                  )}

                  {currentStep.text_input_area && (
                    <svg className="absolute inset-0 w-full h-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                      {(() => {
                        try {
                          const area = JSON.parse(currentStep.text_input_area);
                          const x = area.x || 0;
                          const y = area.y || 0;
                          const w = area.width || 10;
                          const h = area.height || 10;

                          return (
                            <rect
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill="rgba(59, 130, 246, 0.4)"
                              stroke="rgb(37, 99, 235)"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                            />
                          );
                        } catch (e) {
                          console.error('Error parsing text_input_area:', e);
                          return null;
                        }
                      })()}
                    </svg>
                  )}

                  {currentStep.start_area && (
                    <svg className="absolute inset-0 w-full h-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                      {(() => {
                        try {
                          const area = JSON.parse(currentStep.start_area);
                          const x = area.x || 0;
                          const y = area.y || 0;
                          const w = area.width || 10;
                          const h = area.height || 10;

                          return (
                            <rect
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill="rgba(34, 197, 94, 0.4)"
                              stroke="rgb(22, 163, 74)"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                            />
                          );
                        } catch (e) {
                          console.error('Error parsing start_area:', e);
                          return null;
                        }
                      })()}
                    </svg>
                  )}
                </div>
              ) : (
                /* Message informatif si aucune zone */
                <div className="absolute top-2 left-2 bg-amber-100 border border-amber-300 rounded px-3 py-1 text-xs text-amber-800">
                  ℹ️ Aucune zone d'action définie pour cette étape
                </div>
              )}
                  {currentStep.text_input_area && (
                    <svg className="absolute inset-0 w-full h-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                      {(() => {
                        try {
                          const area = JSON.parse(currentStep.text_input_area);
                          const x = area.x || 0;
                          const y = area.y || 0;
                          const w = area.width || 10;
                          const h = area.height || 10;

                          return (
                            <rect
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill="rgba(59, 130, 246, 0.3)"
                              stroke="rgb(37, 99, 235)"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                            />
                          );
                        } catch (e) {
                          console.error('Error parsing text_input_area:', e);
                          return null;
                        }
                      })()}
                    </svg>
                  )}
                  {currentStep.start_area && (
                    <svg className="absolute inset-0 w-full h-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                      {(() => {
                        try {
                          const area = JSON.parse(currentStep.start_area);
                          const x = area.x || 0;
                          const y = area.y || 0;
                          const w = area.width || 10;
                          const h = area.height || 10;

                          return (
                            <rect
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill="rgba(34, 197, 94, 0.3)"
                              stroke="rgb(22, 163, 74)"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                            />
                          );
                        } catch (e) {
                          console.error('Error parsing start_area:', e);
                          return null;
                        }
                      })()}
                    </svg>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-center p-8">
              <p className="text-lg mb-2">📷 Pas d'image pour cette étape</p>
              <div className="text-xs space-y-1 text-gray-500">
                <p>Image URL: {currentStep.image_url || 'Non définie'}</p>
                <p>Image Path: {currentStep.image_path || 'Non défini'}</p>
                <p>App Images: {JSON.stringify(currentStep.app_images) || 'Aucune'}</p>
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
          <span className="text-sm text-gray-600 min-w-12 text-center">{Math.round(zoom * 100)}%</span>
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
          
          {/* Debug des zones d'action - Temporaire */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm font-medium text-yellow-900 mb-2">🔍 Debug des zones :</p>
              <div className="text-xs space-y-1">
                <p><strong>Target Area:</strong> {currentStep.target_area || 'Aucune'}</p>
                <p><strong>Text Input Area:</strong> {currentStep.text_input_area || 'Aucune'}</p>
                <p><strong>Start Area:</strong> {currentStep.start_area || 'Aucune'}</p>
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

      {/* Légende des zones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">Légende des zones d'action:</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-red-600 bg-red-100"></div>
            <span className="text-gray-700">Zone de clic (Tap)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100"></div>
            <span className="text-gray-700">Zone de saisie (Text Input)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-600 bg-green-100"></div>
            <span className="text-gray-700">Zone de démarrage (Swipe/Scroll)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

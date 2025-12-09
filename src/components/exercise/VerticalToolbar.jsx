import React, { useState } from 'react';
import { Search, X, Eye, EyeOff, Home, FileText, FolderOpen, ChevronLeft, ChevronRight, Layers, Info, Volume2, Type, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Barre d'outils verticale verte avec icônes blanches
 */
const VerticalToolbar = ({
  isZoomActive,
  onZoomToggle,
  showInstructions,
  onInstructionsToggle,
  hideActionZone,
  onHideActionZone,
  versions,
  currentVersionId,
  onVersionChange,
  onNavigateHome,
  onViewNotes,
  onAddNote,
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
  onNavigateToTasks,
  onPlayAudio,
  currentStep,
  textZoom,
  onTextZoomChange,
  isMobileLayout,
  taskId,
  versionId,
  currentStepIndex,
  totalSteps
}) => {
  const navigate = useNavigate();
  const [showVersionMenu, setShowVersionMenu] = useState(false);
  const iconSize = isMobileLayout ? "h-5 w-5" : "h-6 w-6";
  const buttonClass = "w-full p-3 flex items-center justify-center text-white hover:bg-green-600 transition-colors border-b border-green-600";
  
  const handleReportError = () => {
    // Passer les paramètres courants au formulaire de signalement
    const params = new URLSearchParams();
    if (taskId) params.append('taskId', taskId);
    if (versionId) params.append('versionId', versionId);
    if (currentStepIndex !== undefined && currentStepIndex >= 0) params.append('stepIndex', currentStepIndex);
    navigate(`/report-error?${params.toString()}`);
  };

  return (
    <div className="flex flex-col bg-green-700 rounded-lg shadow-lg overflow-y-auto h-auto">
      {/* Zoom */}
      <button
        onClick={onZoomToggle}
        className={buttonClass}
        title={isZoomActive ? "Désactiver la loupe" : "Activer la loupe"}
        aria-label={isZoomActive ? "Désactiver la loupe" : "Activer la loupe"}
      >
        {isZoomActive ? <X className={iconSize} /> : <Search className={iconSize} />}
      </button>

      {/* Masquer instructions */}
      <button
        onClick={onInstructionsToggle}
        className={buttonClass}
        title={showInstructions ? "Masquer les instructions" : "Afficher les instructions"}
        aria-label={showInstructions ? "Masquer les instructions" : "Afficher les instructions"}
      >
        <Info className={iconSize} />
      </button>

      {/* Masquer zone d'action */}
      <button
        onClick={onHideActionZone}
        className={buttonClass}
        title={hideActionZone ? "Afficher la zone d'action" : "Masquer la zone d'action"}
        aria-label={hideActionZone ? "Afficher la zone d'action" : "Masquer la zone d'action"}
      >
        {hideActionZone ? <Eye className={iconSize} /> : <EyeOff className={iconSize} />}
      </button>

      {/* Lire les instructions */}
      {currentStep?.instruction && onPlayAudio && (
        <button
          onClick={() => onPlayAudio(currentStep.instruction)}
          className={buttonClass}
          title="Lire l'instruction audio"
          aria-label="Lire l'instruction audio"
        >
          <Volume2 className={iconSize} />
        </button>
      )}

      {/* Zoom texte (agrandir/réduire instructions et header) */}
      <div className="relative w-full">
        <button
          onClick={() => {
            // Créer un menu popup pour le zoom
            const menu = document.getElementById('text-zoom-menu');
            if (menu) {
              menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }
          }}
          className={buttonClass}
          title={`Taille du texte (${Math.round(textZoom * 100)}%)`}
        >
          <Type className={iconSize} />
        </button>

        {/* Menu déroulant zoom texte */}
        <div 
          id="text-zoom-menu"
          className="fixed bg-white border-2 border-green-700 rounded-lg shadow-2xl z-50 min-w-[180px] pointer-events-auto hidden" 
          style={{ top: '240px', right: '20px' }}
        >
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-600 mb-2 px-2">Taille du texte:</p>
            {[1, 1.25, 1.5].map((zoom) => (
              <button
                key={zoom}
                onClick={() => {
                  onTextZoomChange(zoom);
                  document.getElementById('text-zoom-menu').style.display = 'none';
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded hover:bg-green-50 transition-colors",
                  textZoom === zoom && "bg-green-100 font-semibold text-green-800"
                )}
              >
                {Math.round(zoom * 100)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Changer de version */}
      <div className="relative w-full">
        <button
          onClick={() => setShowVersionMenu(!showVersionMenu)}
          className={buttonClass}
          title="Changer de version"
        >
          <Layers className={iconSize} />
        </button>
        
        {/* Menu déroulant des versions - positionné en haut à droite */}
        {showVersionMenu && versions && versions.length > 0 && (
          <div className="fixed bg-white border-2 border-green-700 rounded-lg shadow-2xl z-50 min-w-[240px] pointer-events-auto" style={{ top: '50px', right: '20px' }}>
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2 px-2">Sélectionner une version :</p>
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => {
                    onVersionChange(version.id);
                    setShowVersionMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded hover:bg-green-50 transition-colors",
                    version.id === currentVersionId && "bg-green-100 font-semibold text-green-800"
                  )}
                >
                  {version.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mes notes personnelles */}
      <button
        onClick={onViewNotes}
        className={buttonClass}
        title="Consulter mes notes"
      >
        <FolderOpen className={iconSize} />
      </button>

      {/* Ajouter une note */}
      <button
        onClick={onAddNote}
        className={buttonClass}
        title="Ajouter une note"
      >
        <FileText className={iconSize} />
      </button>

      {/* Signaler une erreur */}
      <button
        onClick={handleReportError}
        className={buttonClass}
        title="Signaler une erreur"
      >
        <Bug className={iconSize} />
      </button>

      {/* Précédent */}
      <button
        onClick={onPrev}
        disabled={isPrevDisabled}
        className={cn(buttonClass, isPrevDisabled && "opacity-50 cursor-not-allowed")}
        title="Étape précédente"
      >
        <ChevronLeft className={iconSize} />
      </button>

      {/* Suivant */}
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className={cn(buttonClass, isNextDisabled && "opacity-50 cursor-not-allowed")}
        title="Étape suivante"
      >
        <ChevronRight className={iconSize} />
      </button>

      {/* Accueil (Tâches) */}
      <button
        onClick={onNavigateToTasks}
        className={cn(buttonClass, "border-b-0")}
        title="Retour aux tâches"
      >
        <Home className={iconSize} />
      </button>
    </div>
  );
};

export default VerticalToolbar;

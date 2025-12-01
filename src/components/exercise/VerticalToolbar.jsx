import React, { useState } from 'react';
import { Search, X, Eye, EyeOff, Home, FileText, FolderOpen, ChevronLeft, ChevronRight, Layers, Info } from 'lucide-react';
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
  isMobileLayout
}) => {
  const [showVersionMenu, setShowVersionMenu] = useState(false);
  const iconSize = isMobileLayout ? "h-5 w-5" : "h-6 w-6";
  const buttonClass = "w-full p-3 flex items-center justify-center text-white hover:bg-green-600 transition-colors border-b border-green-600";

  return (
    <div className="flex flex-col bg-green-700 rounded-lg shadow-lg overflow-y-auto h-auto">
      {/* Zoom */}
      <button
        onClick={onZoomToggle}
        className={buttonClass}
        title={isZoomActive ? "Désactiver la loupe" : "Activer la loupe"}
      >
        {isZoomActive ? <X className={iconSize} /> : <Search className={iconSize} />}
      </button>

      {/* Masquer instructions */}
      <button
        onClick={onInstructionsToggle}
        className={buttonClass}
        title={showInstructions ? "Masquer les instructions" : "Afficher les instructions"}
      >
        <Info className={iconSize} />
      </button>

      {/* Masquer zone d'action */}
      <button
        onClick={onHideActionZone}
        className={buttonClass}
        title={hideActionZone ? "Afficher la zone d'action" : "Masquer la zone d'action"}
      >
        {hideActionZone ? <Eye className={iconSize} /> : <EyeOff className={iconSize} />}
      </button>

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

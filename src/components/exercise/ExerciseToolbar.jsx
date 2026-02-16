import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Replace, Info, Eye, EyeOff, Maximize2, Bug, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ExerciseToolbar = ({
  isZoomActive,
  onZoomToggle,
  showInstructions,
  onInstructionsToggle,
  hideActionZone,
  onHideActionZone,
  versions,
  currentVersionId,
  onVersionChange,
  isMobileLayout,
  onDebugForceSave,
  onDebugDeleteProgress,
  taskId,
  versionId,
  currentStepIndex,
  hasPhoneButtonActions,
  forceShowPhoneFrame,
  onForceShowPhoneFrame,
}) => {
  const navigate = useNavigate();
  const buttonSizeClass = isMobileLayout ? 'h-7 w-7' : 'h-8 w-8';

  const handleReportError = () => {
    // Passer les paramètres courants au formulaire de signalement
    const params = new URLSearchParams();
    if (taskId) params.append('taskId', taskId);
    if (versionId) params.append('versionId', versionId);
    if (currentStepIndex !== undefined && currentStepIndex >= 0)
      params.append('stepIndex', currentStepIndex);
    navigate(`/report-error?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        'w-full flex items-center justify-center gap-2 shrink-0',
        isMobileLayout ? 'mb-1.5' : 'mb-2 sm:mb-4'
      )}
    >
      <button
        onClick={onZoomToggle}
        className={cn(
          'flex-shrink-0 rounded-md flex items-center justify-center transition-colors',
          buttonSizeClass,
          isZoomActive ? 'bg-primary/90 text-white' : 'bg-primary/80 hover:bg-primary/90 text-white'
        )}
        title="Zoom"
      >
        <Maximize2 className={isMobileLayout ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>
      <button
        onClick={onInstructionsToggle}
        className={cn(
          'flex-shrink-0 rounded-md flex items-center justify-center transition-colors',
          buttonSizeClass,
          showInstructions
            ? 'bg-primary/90 text-white'
            : 'bg-primary/80 hover:bg-primary/90 text-white'
        )}
        title="Information"
      >
        <Info className={isMobileLayout ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>
      <button
        onClick={onHideActionZone}
        className={cn(
          'flex-shrink-0 rounded-md flex items-center justify-center transition-colors',
          buttonSizeClass,
          hideActionZone
            ? 'bg-primary/90 text-white'
            : 'bg-primary/80 hover:bg-primary/90 text-white'
        )}
        title="Masquer la zone d'action"
      >
        {hideActionZone ? (
          <EyeOff className={isMobileLayout ? 'h-4 w-4' : 'h-5 w-5'} />
        ) : (
          <Eye className={isMobileLayout ? 'h-4 w-4' : 'h-5 w-5'} />
        )}
      </button>
      {hasPhoneButtonActions && (
        <button
          onClick={onForceShowPhoneFrame}
          className={cn(
            'flex-shrink-0 rounded-md flex items-center justify-center transition-colors',
            buttonSizeClass,
            forceShowPhoneFrame
              ? 'bg-blue-600 text-white'
              : 'bg-primary/80 hover:bg-primary/90 text-white'
          )}
          title="Afficher l'entourage du téléphone"
        >
          <Smartphone className={isMobileLayout ? 'h-4 w-4' : 'h-5 w-5'} />
        </button>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex-shrink-0 bg-primary/80 hover:bg-primary/90 text-white rounded-md flex items-center justify-center transition-colors',
              buttonSizeClass
            )}
            title="Versions"
          >
            <Replace className={isMobileLayout ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1">
          <div className="flex flex-col space-y-1">
            {versions.map((v) => (
              <Button
                key={v.id}
                onClick={() => onVersionChange(v.id)}
                variant={v.id === currentVersionId ? 'secondary' : 'ghost'}
                size="sm"
                className="justify-start"
              >
                {v.name}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Bouton signaler une erreur */}
      <button
        onClick={handleReportError}
        className={cn(
          'flex-shrink-0 rounded-md flex items-center justify-center transition-colors',
          buttonSizeClass,
          'bg-red-600 hover:bg-red-700 text-white'
        )}
        title="Signaler une erreur"
      >
        <Bug className={isMobileLayout ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>
      {/* Debug button (optional) */}
      {onDebugForceSave && onDebugDeleteProgress && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn('shrink-0', buttonSizeClass)}
              title="Debug"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 17a1 1 0 01-1 1H6a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4zM17 7a1 1 0 01-1 1h-4a1 1 0 01-1-1V3a1 1 0 011-1h4a1 1 0 011 1v4zM17 11a1 1 0 00-1 1v4a1 1 0 01-1 1h-4a1 1 0 00-1 1v-4a1 1 0 011-1h4a1 1 0 011-1zM11 3a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z" />
              </svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <div className="flex flex-col space-y-1">
              <Button
                onClick={onDebugForceSave}
                variant="ghost"
                size="sm"
                className="justify-start"
              >
                Forcer enregistrement
              </Button>
              <Button
                onClick={onDebugDeleteProgress}
                variant="destructive"
                size="sm"
                className="justify-start"
              >
                Supprimer progression
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default ExerciseToolbar;

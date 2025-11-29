import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, HelpCircle, AlertTriangle, CheckCircle, XCircle, Zap, Volume2, Loader2, PartyPopper, FileText, BookOpen, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import ZoomableImage from '@/components/ZoomableImage';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/contexts/AdminContext';
import * as LucideIcons from 'lucide-react';
import ExerciseToolbar from '@/components/exercise/ExerciseToolbar';
import VersionHeader from '@/components/exercise/VersionHeader';
import ExerciseControls from '@/components/exercise/ExerciseControls';
import ImageFromSupabase from '@/components/ImageFromSupabase';
import { recordCompletion } from '@/data/progress';
import { useAuth } from '@/contexts/AuthContext';
import ActionAnimator from '@/components/exercise/ActionAnimator';
import InformationPanel from '@/components/exercise/InformationPanel';
import LearnerNotesViewer from '@/components/exercise/LearnerNotesViewer';
import useDisableTouchGestures from '@/hooks/useDisableTouchGestures';
import BravoOverlay from '@/components/exercise/BravoOverlay';


const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const ExerciseHeader = ({ taskTitle, onNavigateBack, onNavigateHome, onViewNotes, isMobileLayout }) => (
  <div className={cn("flex justify-between items-center shrink-0 relative", isMobileLayout ? "py-1 px-0.5" : "mb-4 md:mb-6")}> 
    <Button variant="outline" onClick={onNavigateBack} size={isMobileLayout ? "icon_xs" : "sm"} className={isMobileLayout ? "h-7 w-7" : ""}>
      <ChevronLeft className={cn(isMobileLayout ? "h-4 w-4" : "mr-1 h-4 w-4")} /> <span className={cn(isMobileLayout ? "sr-only" : "")}>Tâches</span>
    </Button>
    <h1 className={cn("font-bold text-center text-primary truncate px-1", isMobileLayout ? "text-sm leading-tight" : "text-xl sm:text-2xl md:text-3xl")}>{taskTitle}</h1>
    <div className="flex items-center gap-1.5">
      <Button variant="outline" onClick={onNavigateHome} size={isMobileLayout ? "icon_xs" : "sm"} className={isMobileLayout ? "h-7 w-7" : ""}>
        <Home className={cn(isMobileLayout ? "h-4 w-4" : "mr-1 h-4 w-4")} /> <span className={cn(isMobileLayout ? "sr-only" : "")}>Accueil</span>
      </Button>
      {/* Bouton consulter les notes */}
      <button 
        onClick={onViewNotes} 
        className={cn("flex-shrink-0 bg-primary/80 hover:bg-primary/90 text-white rounded-md flex items-center justify-center transition-colors", isMobileLayout ? "h-7 w-7" : "h-8 w-8")}
        title="Consulter mes notes"
      >
        <FolderOpen className={isMobileLayout ? "h-4 w-4" : "h-5 w-5"} />
      </button>
      {/* Bouton ajouter une note */}
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('openNotesModal'))} 
        className={cn("flex-shrink-0 bg-primary/80 hover:bg-primary/90 text-white rounded-md flex items-center justify-center transition-colors", isMobileLayout ? "h-7 w-7" : "h-8 w-8")}
        title="Ajouter une note"
      >
        <FileText className={isMobileLayout ? "h-4 w-4" : "h-5 w-5"} />
      </button>
    </div>
  </div>
);

const ExerciseTabs = ({ versions, currentVersionId, onTabChange, isMobileLayout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const getShortName = (versionName, index) => {
    if (versionName.toLowerCase().includes('guidé')) return 'G';
    if (versionName.toLowerCase().includes('variante')) {
      const num = versionName.match(/\d+/);
      return num ? `V${num[0]}` : `V${index}`;
    }
    return `V${index + 1}`;
  };
  const currentVersion = versions.find(v => v.id === currentVersionId);

  return (
    <div className={cn("w-full", isMobileLayout ? "mb-2" : "mb-4 md:mb-6")}> 
      {/* Bloc extensible pour les versions */}
      <div className="rounded-lg border-2 border-primary bg-primary/5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full p-3 flex items-center justify-between focus:outline-none",
            isMobileLayout ? "text-sm" : "text-base"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {currentVersion?.name || 'Version'}
            </span>
            {currentVersion?.has_variant_note && (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            )}
          </div>
          <ChevronRight
            className={cn(
              "h-5 w-5 text-primary transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
        </button>

        {/* Bloc extensible: autres versions */}
        <AnimatePresence>
          {isExpanded && versions.length > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={cn("space-y-2 p-2 bg-background rounded-b-lg border-t border-muted")}> 
                {versions.map((v, index) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onTabChange(v.id);
                      setIsExpanded(false);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded transition-colors duration-150",
                      v.id === currentVersionId
                        ? "bg-primary/20 border-l-4 border-primary font-semibold text-primary"
                        : "bg-background/50 hover:bg-background text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isMobileLayout ? "text-xs" : "text-sm"}>
                        {isMobileLayout ? getShortName(v.name, index) : v.name}
                      </span>
                      {v.has_variant_note && (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StepDisplay = ({ currentStep, currentStepIndex, totalSteps, showInstructions, isMobileLayout, onPlayAudio, iconName }) => {
  if (!currentStep) return null;
  const IconComponent = LucideIcons[toPascalCase(iconName)] || null;
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className={cn("font-semibold text-accent-foreground flex items-center", isMobileLayout ? "text-xs" : "text-sm sm:text-base")}> 
            <Zap className={cn("mr-1 text-primary", isMobileLayout ? "h-3 w-3" : "h-4 sm:h-5 w-4 sm:w-5")}/>Action ({currentStepIndex + 1}/{totalSteps}):
        </h3>
        <Button variant="ghost" size="icon_xs" onClick={() => onPlayAudio(currentStep.instruction)} title="Lire l'instruction" className={isMobileLayout ? "h-5 w-5" : ""}>
            <Volume2 className={cn("text-primary", isMobileLayout ? "h-3 w-3" : "h-4 w-4")} />
        </Button>
      </div>
      <div className="flex items-start space-x-1 sm:space-x-2">
        <div className={cn("flex-shrink-0 bg-white border rounded-md flex items-center justify-center", isMobileLayout ? "h-7 w-7 p-0.5" : "h-10 w-10 sm:h-12 sm:w-12 p-0.5 sm:p-1")}> 
          {IconComponent ? (
            <IconComponent className={cn("object-contain text-primary", isMobileLayout ? "h-5 w-5" : "h-8 w-8")} />
          ) : currentStep.pictogram_app_image_id ? (
            <ImageFromSupabase imageId={currentStep.pictogram_app_image_id} alt="Pictogramme de l'étape" className={cn("object-contain", isMobileLayout ? "h-full w-full" : "h-full w-full")}/>
          ) : (
            <HelpCircle className={cn("object-contain text-muted-foreground", isMobileLayout ? "h-5 w-5" : "h-8 w-8")} />
          )}
        </div>
        <p className={cn("text-foreground leading-snug flex-grow", isMobileLayout ? "text-xs" : "text-sm sm:text-md")}> 
          {currentStep.instruction}
        </p>
      </div>
      {/* Message d'action affiché ici sous les icônes, toujours visible */}
      {currentStep.hint && (
        <div className={cn("mt-2 p-2 rounded bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold", isMobileLayout ? "text-xs" : "text-sm")}> 
          {currentStep.hint}
        </div>
      )}
    </div>
  );
};

const CompletionScreen = ({ onBackToList, isMobileLayout }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-20"
    >
        <PartyPopper className={cn("text-primary", isMobileLayout ? "h-16 w-16" : "h-24 w-24")} />
        <h2 className={cn("font-bold mt-4", isMobileLayout ? "text-2xl" : "text-4xl")}>
            Bravo !
        </h2>
        <p className={cn("text-muted-foreground mt-2", isMobileLayout ? "text-sm" : "text-lg")}>
            Vous avez terminé cet exercice avec succès.
        </p>
        <Button onClick={onBackToList} className={cn("mt-6", isMobileLayout ? " " : "text-base py-6 px-8")}>
            Retour à la liste des tâches
        </Button>
    </motion.div>
);

// Modal pour notes/captures
const NotesModal = ({ open, onClose, taskId, versionId, stepId, userId }) => {
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSave = async () => {
    if (!note.trim() && images.length === 0) {
      toast({ title: "Erreur", description: "Ajoutez au moins une note ou une image", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Insérer la note dans la base de données
      const { data: noteData, error: noteError } = await supabase
        .from('learner_notes')
        .insert({
          user_id: userId,
          task_id: taskId,
          version_id: versionId,
          step_id: stepId,
          note_text: note.trim() || null,
        })
        .select()
        .single();
      
      if (noteError) throw noteError;
      
      // Upload des images si présentes
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${noteData.id}_${Date.now()}.${fileExt}`;
          const filePath = `learner-notes/${userId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, image);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
          
          const { error: imageError } = await supabase
            .from('learner_note_images')
            .insert({
              note_id: noteData.id,
              image_url: publicUrl,
            });
          
          if (imageError) throw imageError;
        }
      }
      
      toast({ title: "Succès", description: "Note enregistrée avec succès !" });
      setNote("");
      setImages([]);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer la note", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-lg mb-4">Ajouter une note personnelle</h2>
        <textarea 
          className="w-full border rounded mb-3 p-2 text-sm" 
          rows={4} 
          placeholder="Écrivez votre note ici..." 
          value={note} 
          onChange={e => setNote(e.target.value)} 
        />
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Captures d'écran (optionnel)</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={e => setImages(Array.from(e.target.files || []))} 
            className="text-sm w-full" 
          />
          {images.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{images.length} image(s) sélectionnée(s)</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Annuler</Button>
          <Button variant="default" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExercisePage = () => {
  console.log('🔴 ExercisePage chargé - VERSION AVEC BOUTON NOTES - ' + new Date().toISOString());
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesViewerOpen, setNotesViewerOpen] = useState(false);
  useEffect(() => {
    const handler = () => setNotesModalOpen(true);
    window.addEventListener('openNotesModal', handler);
    return () => window.removeEventListener('openNotesModal', handler);
  }, []);
  const { taskId, versionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const outletContext = useOutletContext();
  const { currentUser: user } = useAuth();
  const isMobileLayout = outletContext?.isMobileView || false;
  const adminContext = useAdmin();
  const isPreviewMode = location.pathname.includes('/admin/preview');

  const [task, setTask] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [error, setError] = useState(null);
  const [showInformationPanel, setShowInformationPanel] = useState(false);
  const [hideActionZone, setHideActionZone] = useState(false);
  const [showBravoOverlay, setShowBravoOverlay] = useState(false);
  // Toggle to show debug buttons in the toolbar without removing code
  const showDebugButtons = false;

  // Désactiver les gestes tactiles natifs
  useDisableTouchGestures();

  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [versionId]);

  useEffect(() => {
    const fetchAndSetData = async () => {
      setIsLoading(true);
      setError(null);
      setShowCompletionScreen(false);
      try {
        let taskData;

        if (isPreviewMode) {
          if (!adminContext || !adminContext.tasks || adminContext.tasks.length === 0) {
            return;
          }
          taskData = adminContext.tasks.find(t => t.id === taskId);
        } else {
          const { data: taskResult, error: taskError } = await supabase
            .from('tasks')
            .select('id, title, video_url, versions(*, steps(*))')
            .eq('id', taskId)
            .maybeSingle();

          if (taskError) throw taskError;
          taskData = taskResult;
        }
        
        if (!taskData) {
          setError("Tâche non trouvée. Elle a peut-être été supprimée.");
          setIsLoading(false);
          return;
        }

        const foundVersion = taskData.versions.find(e => e.id === versionId);
        if (foundVersion) {
          foundVersion.steps = foundVersion.steps ? foundVersion.steps.sort((a, b) => a.step_order - b.step_order) : [];
        } else {
          setError("Version de l'exercice non trouvée.");
          setIsLoading(false);
          setTask(taskData);
          return;
        }

        setTask(taskData);
        setCurrentVersion(foundVersion);
        
        const queryParams = new URLSearchParams(location.search);
        const stepParam = queryParams.get('step');
        const initialStepIndex = stepParam ? parseInt(stepParam, 10) - 1 : 0;

        setCurrentStepIndex(initialStepIndex >= 0 && initialStepIndex < foundVersion.steps.length ? initialStepIndex : 0);
        setIsCompleted(false);
        setShowInstructions(foundVersion.name.toLowerCase().includes('guidé'));

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Impossible de charger les données de l'exercice.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetData();
  }, [taskId, versionId, isPreviewMode, toast, adminContext, location.search]);


  const handleTabChange = (newVersionId) => {
    const path = isPreviewMode ? `/admin/preview/tache/${taskId}/version/${newVersionId}` : `/tache/${taskId}/version/${newVersionId}`;
    navigate(path);
  };
  
  const handleCompletion = useCallback(async () => {
      setIsCompleted(true);
      setShowCompletionScreen(true);
      if (user && !isPreviewMode && startTimeRef.current) {
        const timeTaken = (Date.now() - startTimeRef.current) / 1000;
        try {
          const res = await recordCompletion(user.id, versionId, timeTaken);
          if (res && res.error) {
            console.error('recordCompletion error', res.error);
            toast({ title: 'Erreur', description: 'Impossible d\'enregistrer la progression.', variant: 'destructive' });
          } else {
            toast({ title: 'Progression sauvegardée', description: 'Votre progression a été enregistrée.' });
          }
        } catch (err) {
          console.error('recordCompletion threw', err);
          toast({ title: 'Erreur', description: 'Enregistrement échoué.', variant: 'destructive' });
        }
      }
  }, [user, isPreviewMode, versionId, toast]);
  
  const handleInteraction = useCallback((isCorrectAction) => {
    if (!currentVersion || !currentVersion.steps || currentStepIndex >= currentVersion.steps.length) return;

    if (isCorrectAction) {
      const currentStep = currentVersion.steps[currentStepIndex];
      
      // Si c'est une action "bravo", afficher l'overlay au lieu du toast
      if (currentStep?.action_type === 'bravo') {
        setShowBravoOverlay(true);
        // Marquer comme complété sans afficher l'écran de complétion classique
        if (!isCompleted) {
          handleCompletion();
        }
        return;
      }
      
      toast({
        title: "Bien joué !",
        description: "Action correcte.",
        action: <CheckCircle className="text-green-500" />,
      });
      if (currentStepIndex < currentVersion.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        handleCompletion();
      }
    } else {
      // Erreur déjà gérée par ZoomableImage
      // Ne pas afficher de toast supplémentaire
    }
  }, [currentVersion, currentStepIndex, toast, handleCompletion, isCompleted]);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const goToNextStep = () => {
    if (currentVersion && currentStepIndex < currentVersion.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentVersion && currentStepIndex === currentVersion.steps.length - 1 && !isCompleted) {
      handleCompletion();
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsCompleted(false);
      setShowCompletionScreen(false);
    }
  };

  
  
   const playInstructionAudio = (textToSpeak) => {
    if ('speechSynthesis' in window && textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.cancel(); 
        window.speechSynthesis.speak(utterance);
    } else {
        toast({
            title: "Audio non disponible",
            description: "La lecture audio n'est pas supportée par votre navigateur ou aucun texte n'est disponible.",
            variant: "destructive"
        });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (error) {
     return (
      <div className="flex flex-col items-center justify-center text-center p-4 h-full">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate('/taches')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour à la liste des tâches
        </Button>
      </div>
    );
  }

  if (!task || !currentVersion) {
    return null;
  }
  
  const currentStep = currentVersion.steps[currentStepIndex];
  const totalSteps = currentVersion.steps.length;

  const sortedVersions = task.versions ? [...task.versions].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const currentIndexInAllVersions = sortedVersions.findIndex(ex => ex.id === currentVersion.id);
  const prevVersionOverall = currentIndexInAllVersions > 0 ? sortedVersions[currentIndexInAllVersions - 1] : null;
  const nextVersionOverall = currentIndexInAllVersions < sortedVersions.length - 1 ? sortedVersions[currentIndexInAllVersions + 1] : null;
  
  const videoUrl = currentVersion.video_url || task.video_url;

  const mainContentMobile = (
    <div className="p-1 sm:p-1.5 bg-card rounded-lg shadow-xl flex flex-col h-full relative">
      <AnimatePresence>
        {showCompletionScreen && <CompletionScreen onBackToList={() => navigate('/taches')} isMobileLayout={true} />}
      </AnimatePresence>
      <VersionHeader
        versionName={currentVersion.name}
        versionNumber={currentVersion.version}
        progress={totalSteps > 0 ? ((isCompleted ? totalSteps : currentStepIndex + 1) / totalSteps) * 100 : 0}
        hasVideo={!!videoUrl}
        onVideoClick={() => setIsVideoModalOpen(true)}
        onListClick={() => navigate(`/tache/${taskId}`)}
        isMobileLayout={true}
      />
      {currentVersion.has_variant_note && (
        <div className="p-1 my-1 text-2xs bg-amber-100 border-l-4 border-amber-500 text-amber-700 rounded shrink-0">
          <div className="flex items-center"> <AlertTriangle className="mr-1 h-2.5 w-2.5"/> <p className="font-semibold">Note :</p> </div>
          <p>Cette version peut présenter des différences.</p>
        </div>
      )}
      <div className="flex items-center justify-center space-x-2 mb-2">
        {/* Icônes zoom/info/etc. ici */}
        {/* ...icônes existantes... */}
      </div>
      {/* Bloc d'action conditionnel juste sous les icônes */}
      {!showInstructions && (
        <StepDisplay 
          currentStep={currentStep} 
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          showInstructions={showInstructions}
          isMobileLayout={true}
          onPlayAudio={playInstructionAudio}
          iconName={currentStep?.icon_name}
        />
      )}
      <div className="flex-grow min-h-0 w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
        <ZoomableImage
          imageId={currentStep?.app_image_id}
          alt={`Capture d'écran pour l'étape`}
          targetArea={currentStep?.target_area}
          actionType={currentStep?.action_type}
          startArea={currentStep?.start_area}
          onInteraction={handleInteraction}
          imageContainerClassName="w-full h-full"
          isMobileLayout={true}
          isZoomActive={isZoomActive}
          hideActionZone={hideActionZone}
        />
        {/* Animation pour les swipes et drag - Mobile */}
        <ActionAnimator
          actionType={currentStep?.action_type}
          startArea={currentStep?.start_area}
          hideActionZone={hideActionZone}
          isMobileLayout={true}
        />
        {/* Overlay Bravo */}
        <BravoOverlay
          isOpen={showBravoOverlay}
          onClose={() => setShowBravoOverlay(false)}
          onReturnToTasks={() => navigate('/taches')}
        />
      </div>
      <div className="shrink-0 mt-1.5">
        <ExerciseToolbar
          isZoomActive={isZoomActive}
          onZoomToggle={() => setIsZoomActive(z => !z)}
          showInstructions={showInstructions}
          onInstructionsToggle={() => setShowInstructions(s => !s)}
          hideActionZone={hideActionZone}
          onHideActionZone={() => setHideActionZone(h => !h)}
          versions={sortedVersions}
          currentVersionId={versionId}
          onVersionChange={handleTabChange}
          isMobileLayout={true}
          onDebugForceSave={showDebugButtons ? async () => {
            if (!user) return;
            const timeTaken = 1; // debug small duration
            const res = await recordCompletion(user.id, versionId, timeTaken);
            if (res && res.error) {
              toast({ title: 'Erreur debug', description: 'Impossible d\'enregistrer la progression (debug).', variant: 'destructive' });
            } else {
              toast({ title: 'Debug', description: 'Progression debug enregistrée.' });
            }
          } : undefined}
          onDebugDeleteProgress={showDebugButtons ? async () => {
            if (!user) return;
            try {
              const { data, error } = await supabase.from('user_version_progress').delete().match({ user_id: user.id, version_id: versionId });
              if (error) {
                toast({ title: 'Erreur debug', description: 'Suppression échouée.', variant: 'destructive' });
              } else {
                toast({ title: 'Debug', description: 'Progression supprimée.' });
              }
            } catch (err) {
              toast({ title: 'Erreur', description: 'Suppression échouée.', variant: 'destructive' });
            }
          } : undefined}
        />
        <InformationPanel
          isVisible={showInformationPanel}
          onClose={() => setShowInformationPanel(false)}
          actionType={currentStep?.action_type}
          startArea={currentStep?.start_area}
        />
        <ExerciseControls
          onPrev={goToPrevStep}
          onNext={goToNextStep}
          isPrevDisabled={currentStepIndex === 0}
          isNextDisabled={currentStepIndex === totalSteps - 1 && isCompleted}
          isCompleted={isCompleted}
          isMobileLayout={true}
        />
      </div>
    </div>
  );

  const mainContentDesktop = (
    <div className="p-3 sm:p-4 md:p-6 bg-card rounded-lg shadow-xl flex flex-col relative">
      <AnimatePresence>
        {showCompletionScreen && <CompletionScreen onBackToList={() => navigate('/taches')} isMobileLayout={false} />}
      </AnimatePresence>
      <VersionHeader
        versionName={currentVersion.name}
        versionNumber={currentVersion.version}
        progress={totalSteps > 0 ? ((isCompleted ? totalSteps : currentStepIndex + 1) / totalSteps) * 100 : 0}
        hasVideo={!!videoUrl}
        onVideoClick={() => setIsVideoModalOpen(true)}
        onListClick={() => navigate(`/tache/${taskId}`)}
        isMobileLayout={false}
      />
      {currentVersion.has_variant_note && (
        <div className="my-2 sm:my-3 text-xs sm:text-sm p-1 sm:p-1.5 bg-amber-100 border-l-4 border-amber-500 text-amber-700 rounded shrink-0">
          <div className="flex items-center"> <AlertTriangle className="mr-1 h-4 w-4 sm:h-5 sm:w-5"/> <p className="font-semibold">Note :</p> </div>
          <p>Cette version peut présenter des différences.</p>
        </div>
      )}
      {/* Outils en haut juste après le titre */}
      <ExerciseToolbar
        isZoomActive={isZoomActive}
        onZoomToggle={() => setIsZoomActive(z => !z)}
        showInstructions={showInstructions}
        onInstructionsToggle={() => setShowInstructions(s => !s)}
        hideActionZone={hideActionZone}
        onHideActionZone={() => setHideActionZone(h => !h)}
        versions={sortedVersions}
        currentVersionId={versionId}
        onVersionChange={handleTabChange}
        isMobileLayout={false}
        onDebugForceSave={showDebugButtons ? async () => {
          if (!user) return;
          const timeTaken = 1;
          const res = await recordCompletion(user.id, versionId, timeTaken);
          if (res && res.error) {
            toast({ title: 'Erreur debug', description: 'Impossible d\'enregistrer la progression (debug).', variant: 'destructive' });
          } else {
            toast({ title: 'Debug', description: 'Progression debug enregistrée.' });
          }
        } : undefined}
        onDebugDeleteProgress={showDebugButtons ? async () => {
          if (!user) return;
          try {
            const { data, error } = await supabase.from('user_version_progress').delete().match({ user_id: user.id, version_id: versionId });
            if (error) {
              toast({ title: 'Erreur debug', description: 'Suppression échouée.', variant: 'destructive' });
            } else {
              toast({ title: 'Debug', description: 'Progression supprimée.' });
            }
          } catch (err) {
            toast({ title: 'Erreur', description: 'Suppression échouée.', variant: 'destructive' });
          }
        } : undefined}
      />
      <InformationPanel
        isVisible={showInformationPanel}
        onClose={() => setShowInformationPanel(false)}
        actionType={currentStep?.action_type}
        startArea={currentStep?.start_area}
      />
      <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 flex-grow min-h-0">
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {/* Icônes zoom/info/etc. ici */}
            {/* ...icônes existantes... */}
          </div>
          {/* Bloc d'action conditionnel juste sous les icônes */}
          {!showInstructions && (
            <StepDisplay 
              currentStep={currentStep} 
              currentStepIndex={currentStepIndex}
              totalSteps={totalSteps}
              showInstructions={showInstructions}
              isMobileLayout={false}
              onPlayAudio={playInstructionAudio}
              iconName={currentStep?.icon_name}
            />
          )}
          <div className="w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
            <ZoomableImage
              imageId={currentStep?.app_image_id}
              alt={`Capture d'écran pour l'étape`}
              targetArea={currentStep?.target_area}
              actionType={currentStep?.action_type}
              startArea={currentStep?.start_area}
              onInteraction={handleInteraction}
              imageContainerClassName="w-full h-full"
              isMobileLayout={false}
              isZoomActive={isZoomActive}
              hideActionZone={hideActionZone}
            />
            {/* Animation pour les swipes et drag */}
            <ActionAnimator
              actionType={currentStep?.action_type}
              startArea={currentStep?.start_area}
              hideActionZone={hideActionZone}
              isMobileLayout={false}
            />
            {/* Overlay Bravo */}
            <BravoOverlay
              isOpen={showBravoOverlay}
              onClose={() => setShowBravoOverlay(false)}
              onReturnToTasks={() => navigate('/taches')}
            />
          </div>
          <ExerciseControls
            onPrev={goToPrevStep}
            onNext={goToNextStep}
            isPrevDisabled={currentStepIndex === 0}
            isNextDisabled={currentStepIndex === totalSteps - 1 && isCompleted}
            isCompleted={isCompleted}
            isMobileLayout={false}
          />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }} 
      className={cn("mx-auto h-full flex flex-col", isMobileLayout ? "p-0.5 max-w-full" : "p-2 md:p-0 max-w-4xl")}
    >
      <div className={cn("shrink-0", isMobileLayout ? "sticky top-0 bg-background z-10" : "")}> 
        <ExerciseHeader 
          taskTitle={task.title}
          onNavigateBack={() => navigate(isPreviewMode ? `/admin/dashboard` : `/taches`)}
          onNavigateHome={() => navigate('/')}
          onViewNotes={() => setNotesViewerOpen(true)}
          isMobileLayout={isMobileLayout}
        />
        <NotesModal 
          open={notesModalOpen} 
          onClose={() => setNotesModalOpen(false)} 
          taskId={task?.id}
          versionId={currentVersion?.id}
          stepId={currentStep?.id}
          userId={user?.id}
        />
        <LearnerNotesViewer
          open={notesViewerOpen}
          onClose={() => setNotesViewerOpen(false)}
          taskId={task?.id}
          userId={user?.id}
        />
        <ExerciseTabs 
          versions={sortedVersions}
          currentVersionId={currentVersion.id}
          onTabChange={handleTabChange}
          isMobileLayout={isMobileLayout}
        />
      </div>
      
      <div className={cn("flex-grow min-h-0", isMobileLayout ? "overflow-y-auto" : "")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentVersion.id}-${currentStepIndex}`}
            initial={{ opacity: 0, x: isMobileLayout ? 5 : 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isMobileLayout ? -5 : -15 }}
            transition={{ duration: 0.2 }}
            className={cn("flex flex-col", isMobileLayout ? "h-full" : "")}
          >
            {isMobileLayout ? mainContentMobile : mainContentDesktop}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={cn("flex justify-between shrink-0", isMobileLayout ? "mt-1.5" : "mt-4 sm:mt-6 md:mt-8")}>
        {prevVersionOverall ? (
          <Button variant="outline" size={isMobileLayout ? "xs" : "sm"} onClick={() => handleTabChange(prevVersionOverall.id)} className={isMobileLayout ? "text-2xs h-7 px-1.5" : "text-xs sm:text-sm"}>
            <ChevronLeft className={cn("mr-0.5", isMobileLayout ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4")} /> V. Préc.
          </Button>
        ) : <div />}
        {nextVersionOverall ? (
          <Button variant="outline" size={isMobileLayout ? "xs" : "sm"} onClick={() => handleTabChange(nextVersionOverall.id)} className={isMobileLayout ? "text-2xs h-7 px-1.5" : "text-xs sm:text-sm"}>
            V. Suiv. <ChevronRight className={cn("ml-0.5", isMobileLayout ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4")} />
          </Button>
        ) : <div />}
      </div>
      
      <VideoPlayerModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={videoUrl}
        title={`Vidéo pour: ${currentVersion.name}`}
      />
    </motion.div>
  );
};

export default ExercisePage;

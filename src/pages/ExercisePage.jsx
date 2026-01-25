import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, ListChecks, AlertTriangle, CheckCircle, XCircle, Zap, Volume2, Loader2, PartyPopper, FileText, BookOpen, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import ZoomableImage from '@/components/ZoomableImage';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/contexts/AdminContext';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import ExerciseToolbar from '@/components/exercise/ExerciseToolbar';
import VersionHeader from '@/components/exercise/VersionHeader';
import ExerciseControls from '@/components/exercise/ExerciseControls';
import VerticalToolbar from '@/components/exercise/VerticalToolbar';
import ImageFromSupabase from '@/components/ImageFromSupabase';
import QuestionnairePlayer from '@/components/exercise/QuestionnairePlayer';
import { recordCompletion } from '@/data/progress';
import { useAuth } from '@/contexts/AuthContext';
import ActionAnimator from '@/components/exercise/ActionAnimator';
import PhoneFrame from '@/components/exercise/PhoneFrame';
import InformationPanel from '@/components/exercise/InformationPanel';
import { isPhysicalButtonAction } from '@/lib/buttonUtils';
import LearnerNotesViewer from '@/components/exercise/LearnerNotesViewer';
import useDisableTouchGestures from '@/hooks/useDisableTouchGestures';
import BravoOverlay from '@/components/exercise/BravoOverlay';
import ConfidenceBeforeModal from '@/components/exercise/ConfidenceBeforeModal';
import ConfidenceAfterModal from '@/components/exercise/ConfidenceAfterModal';
import { useConfidence } from '@/hooks/useConfidence';
import { cacheData, getCachedData } from '@/lib/retryUtils';
import { HighlightGlossaryTerms } from '@/components/GlossaryComponents';
import { InstructionTranslator, TranslatableText } from '@/components/TranslationComponents';


const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const getIconComponent = (iconString) => {
  if (!iconString) return ListChecks;
  
  if (iconString.includes(':')) {
    const [library, name] = iconString.split(':');
    const libraries = {
      lucide: LucideIcons,
      fa6: FontAwesome6,
      fa: FontAwesome6,
      bs: BootstrapIcons,
      md: MaterialIcons,
      fi: FeatherIcons,
      hi2: HeroiconsIcons,
      ai: AntIcons,
    };
    const lib = libraries[library];
    return lib && lib[name] ? lib[name] : ListChecks;
  }
  
  // Fallback: Lucide avec PascalCase
  const pascalIcon = toPascalCase(iconString);
  return LucideIcons[pascalIcon] || ListChecks;
};

const ExerciseHeader = ({ taskTitle, currentStep, onPlayAudio, showInstructions, textZoom, isMobileLayout, currentLanguage = 'fr' }) => {
  let IconComponent = ListChecks;
  try {
    if (currentStep?.icon_name) {
      IconComponent = getIconComponent(currentStep.icon_name);
    }
  } catch (e) {
    console.warn("Icon resolution error in ExerciseHeader:", e);
    IconComponent = ListChecks;
  }
  
  return (
    <div className={cn("flex justify-between items-center shrink-0 relative bg-white p-4 rounded-lg shadow", isMobileLayout ? "mb-1 p-2" : "mb-4")} data-exercise-header>
      {/* Titre à gauche */}
      <div className="flex items-center gap-1 flex-grow min-w-0">
        <div className={cn("font-bold text-primary line-clamp-3", isMobileLayout ? "text-xs" : "text-xl sm:text-2xl")} style={{ fontSize: `${100 * textZoom}%` }}>
          <TranslatableText 
            key={`title-${currentLanguage}`}
            text={taskTitle}
            language={currentLanguage}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Instructions à droite (affichées par défaut, masquées sur très petit mobile) */}
      {showInstructions && !isMobileLayout && (
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="text-gray-700 text-base" style={{ fontSize: `${100 * textZoom}%` }}>
              <TranslatableText 
                key={`instr-${currentLanguage}`}
                text={currentStep?.instruction || 'Aucune instruction'}
                language={currentLanguage}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

const StepDisplay = ({ currentStep, currentStepIndex, totalSteps, showInstructions, isMobileLayout, onPlayAudio, iconName, currentLanguage }) => {
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
            <ListChecks className={cn("object-contain text-muted-foreground", isMobileLayout ? "h-5 w-5" : "h-8 w-8")} />
          )}
        </div>
        <div className={cn("text-foreground leading-snug flex-grow", isMobileLayout ? "text-xs" : "text-sm sm:text-md")}> 
          <TranslatableText 
            key={`step-instr-${currentLanguage}`}
            text={currentStep.instruction}
            language={currentLanguage}
            className=""
          />
        </div>
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
  // HOOKS FIRST - before any conditions
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Then conditional rendering
  if (!open) return null;
  
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
  
  // ============ ALL STATES FIRST ============
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesViewerOpen, setNotesViewerOpen] = useState(false);
  const [task, setTask] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [textZoom, setTextZoom] = useState(1); // 1 = 100%, 1.25 = 125%, 1.5 = 150%
  const [error, setError] = useState(null);
  const [showInformationPanel, setShowInformationPanel] = useState(false);
  const [hideActionZone, setHideActionZone] = useState(false);
  const [showPhoneFrame, setShowPhoneFrame] = useState(false);
  const [forceShowPhoneFrame, setForceShowPhoneFrame] = useState(false); // Override to show phone frame on any step
  const [showBravoOverlay, setShowBravoOverlay] = useState(false);
  const [taskType, setTaskType] = useState('exercise'); // 'exercise' ou 'questionnaire'
  const [showConfidenceBeforeModal, setShowConfidenceBeforeModal] = useState(false);
  const [showConfidenceAfterModal, setShowConfidenceAfterModal] = useState(false);
  const [confidenceBefore, setConfidenceBefore] = useState(null);
  const [currentLanguage, setCurrentLanguageState] = useState('fr'); // Sera mis à jour après la récupération de user
  const [preferredLanguageFromProfile, setPreferredLanguageFromProfile] = useState('en'); // La vraie langue préférée du profil
  const lastToastRef = useRef(null); // Référence au dernier toast affiché

  // ============ ALL HOOKS AFTER STATES ============
  const { taskId, versionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const outletContext = useOutletContext();
  const { currentUser: user } = useAuth();
  const adminContext = useAdmin();
  const { recordConfidenceBefore, recordConfidenceAfter, fetchConfidence } = useConfidence();
  const startTimeRef = useRef(null);

  // ============ LANGUAGE MANAGEMENT (AFTER user IS DEFINED) ============
  // Wrapper pour sauvegarder la langue (dans le profil ET localStorage)
  const setCurrentLanguage = useCallback(async (lang) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem('preferredLanguage', lang);
      // Sauvegarder dans le profil utilisateur SEULEMENT si ce n'est pas le français (FR est la langue par défaut)
      if (user?.id && lang !== 'fr') {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_translation_language: lang })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error saving language to profile:', error);
        }
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [user?.id]);

  // Charger la langue préférée du profil au démarrage
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (user?.id) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('preferred_translation_language')
            .eq('id', user.id)
            .single();
          
          if (data?.preferred_translation_language) {
            // Sauvegarder la vraie langue préférée du profil
            const prefLang = data.preferred_translation_language;
            setPreferredLanguageFromProfile(prefLang);
            localStorage.setItem('preferredLanguage', prefLang);
            
            // Si la langue préférée n'est pas FR, la charger comme langue actuelle
            if (prefLang !== 'fr') {
              setCurrentLanguageState(prefLang);
            }
          }
        } catch (error) {
          console.error('Error loading user language preference:', error);
        }
      }
    };

    loadUserLanguage();
  }, [user?.id]);

  // Désactiver les gestes tactiles natifs
  useDisableTouchGestures();

  // Computed values from hooks
  const isMobileLayout = outletContext?.isMobileView || false;
  const isPreviewMode = location.pathname.includes('/admin/preview');
  const showDebugButtons = false;

  // Open notes modal on event
  useEffect(() => {
    const handler = () => setNotesModalOpen(true);
    window.addEventListener('openNotesModal', handler);
    return () => window.removeEventListener('openNotesModal', handler);
  }, []);

  // ✅ Scroller vers le header au chargement de chaque étape pour éviter les conflits de scroll clavier
  useEffect(() => {
    const scrollToHeader = () => {
      const headerElement = document.querySelector('[data-exercise-header]');
      if (headerElement) {
        headerElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    // Scroller au chargement de l'étape
    if (!isLoading && currentVersion?.steps?.length > 0) {
      scrollToHeader();
    }
  }, [currentStepIndex, isLoading, currentVersion]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalLeft = document.body.style.left;
    const originalRight = document.body.style.right;
    const originalBottom = document.body.style.bottom;
    const originalWidth = document.body.style.width;
    const originalHeight = document.body.style.height;
    const originalTouchAction = document.body.style.touchAction;
    const originalDocOverflow = document.documentElement.style.overflow;
    let scrollPosition = 0;

    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const applyFixed = () => {
      // ✅ Re-forcer le scroll vers le header juste avant de figer pour éviter le conflit avec le scroll natif du clavier
      const headerElement = document.querySelector('[data-exercise-header]');
      if (headerElement) {
        headerElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      
      // Sauvegarder la position APRÈS le scroll forcé
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100vh';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
      
      // Empêcher tous les types de scroll
      window.addEventListener('scroll', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      window.addEventListener('wheel', preventScroll, { passive: false });
    };

    const restore = () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.left = originalLeft;
      document.body.style.right = originalRight;
      document.body.style.bottom = originalBottom;
      document.body.style.width = originalWidth;
      document.body.style.height = originalHeight;
      document.body.style.touchAction = originalTouchAction;
      document.documentElement.style.overflow = originalDocOverflow;
      
      // Restaurer la position de scroll
      window.scrollTo(0, scrollPosition);
      
      // Retirer les listeners
      window.removeEventListener('scroll', preventScroll, { passive: false });
      window.removeEventListener('touchmove', preventScroll, { passive: false });
      window.removeEventListener('wheel', preventScroll, { passive: false });
    };

    const onFocusIn = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        // ✅ Scroller vers le header qui contient les instructions pour s'assurer qu'elles sont TOUTES visibles
        const headerElement = document.querySelector('[data-exercise-header]');
        if (headerElement) {
          headerElement.scrollIntoView({ behavior: 'instant', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
        // ✅ Attendre que le scroll soit complètement appliqué avant de figer
        setTimeout(() => applyFixed(), 150);
      }
    };

    const onFocusOut = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) {
        setTimeout(() => {
          restore();
          // Forcer un reflow pour mettre à jour le layout
          setTimeout(() => {
            void document.body.offsetHeight;
          }, 50);
        }, 300);
      }
    };

    window.addEventListener('focusin', onFocusIn);
    window.addEventListener('focusout', onFocusOut);

    return () => {
      restore();
      window.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [versionId]);

  // Afficher le phone frame si des boutons sont utilisés
  useEffect(() => {
    if (currentVersion && currentVersion.steps && currentVersion.steps.length > 0) {
      const hasPhoneButtonActions = currentVersion.steps.some(step => 
        isPhysicalButtonAction(step.action_type)
      );
      setShowPhoneFrame(hasPhoneButtonActions);
    }
  }, [currentVersion]);

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
          // Try cache first
          const cacheKey = `exercise:${taskId}`;
          const cached = getCachedData(cacheKey);
          
          if (cached) {
            taskData = cached;
            setTask(taskData);
            const foundVersion = taskData.versions.find(e => e.id === versionId);
            if (foundVersion) {
              foundVersion.steps = foundVersion.steps ? foundVersion.steps.sort((a, b) => a.step_order - b.step_order) : [];
              setTaskType(taskData.task_type || 'exercise');
              setCurrentVersion(foundVersion);
              
              const queryParams = new URLSearchParams(location.search);
              const stepParam = queryParams.get('step');
              const initialStepIndex = stepParam ? parseInt(stepParam, 10) - 1 : 0;
              setCurrentStepIndex(initialStepIndex >= 0 && initialStepIndex < foundVersion.steps.length ? initialStepIndex : 0);
              setIsCompleted(false);
              setIsLoading(false);
            }
            
            // Refresh in background
            (async () => {
              try {
                // Charger la task et versions SANS les steps imbriqués
                const { data: freshData, error: fetchError } = await supabase
                  .from('tasks')
                  .select('id, title, video_url, task_type, versions(*)')
                  .eq('id', taskId)
                  .maybeSingle();

                if (fetchError) throw fetchError;
                
                if (freshData && freshData.versions) {
                  // Charger les steps séparément pour chaque version
                  for (const version of freshData.versions) {
                    const { data: stepsData, error: stepsError } = await supabase
                      .from('steps')
                      .select('*')
                      .eq('version_id', version.id)
                      .order('step_order');
                    
                    version.steps = stepsData || [];
                  }
                  
                  cacheData(cacheKey, freshData, 3600000);
                  const freshVersion = freshData.versions.find(e => e.id === versionId);
                  if (freshVersion) {
                    freshVersion.steps = freshVersion.steps ? freshVersion.steps.sort((a, b) => a.step_order - b.step_order) : [];
                    setTask(freshData);
                    setCurrentVersion(freshVersion);
                  }
                }
              } catch (bgError) {
                console.warn('Background refresh failed, using cached data:', bgError);
              }
            })();
            return;
          }

          // No cache, fetch fresh data - Charger task et versions SANS steps imbriqués
          const { data: taskResult, error: taskError } = await supabase
            .from('tasks')
            .select('id, title, video_url, task_type, versions(*)')
            .eq('id', taskId)
            .maybeSingle();

          if (taskError) throw taskError;
          taskData = taskResult;
          
          if (taskData && taskData.versions) {
            // Charger les steps séparément pour chaque version
            for (const version of taskData.versions) {
              const { data: stepsData } = await supabase
                .from('steps')
                .select('*')
                .eq('version_id', version.id)
                .order('step_order');
              
              version.steps = stepsData || [];
            }
            
            cacheData(cacheKey, taskData, 3600000);
          }
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
        setTaskType(taskData.task_type || 'exercise');
        setCurrentVersion(foundVersion);
        
        const queryParams = new URLSearchParams(location.search);
        const stepParam = queryParams.get('step');
        const initialStepIndex = stepParam ? parseInt(stepParam, 10) - 1 : 0;

        setCurrentStepIndex(initialStepIndex >= 0 && initialStepIndex < foundVersion.steps.length ? initialStepIndex : 0);
        setIsCompleted(false);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Impossible de charger les données de l'exercice. Vérifiez votre connexion Internet.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetData();
  }, [taskId, versionId, isPreviewMode, location.search]);

  // Afficher le modal de confiance avant au premier chargement
  useEffect(() => {
    const checkAndShowConfidenceModal = async () => {
      if (currentVersion && user && !isPreviewMode && !isLoading) {
        try {
          // Vérifier si une confiance_before a déjà été enregistrée pour cette version
          const existingConfidence = await fetchConfidence(user.id, versionId);
          
          // Ne montrer le modal que si aucune confiance_before n'existe
          if (!existingConfidence || !existingConfidence.confidence_before) {
            setShowConfidenceBeforeModal(true);
          }
        } catch (error) {
          console.error('Error checking confidence:', error);
          // En cas d'erreur, montrer le modal par sécurité
          setShowConfidenceBeforeModal(true);
        }
      }
    };

    checkAndShowConfidenceModal();
  }, [versionId, user, isPreviewMode, isLoading, fetchConfidence]);


  const handleTabChange = (newVersionId) => {
    const path = isPreviewMode ? `/admin/preview/tache/${taskId}/version/${newVersionId}` : `/tache/${taskId}/version/${newVersionId}`;
    navigate(path);
  };
  
  const handleCompletion = useCallback(async (skipCompletionScreen = false) => {
      setIsCompleted(true);
      
      // Afficher le modal de confiance après au lieu de l'écran de complétion
      if (user && !isPreviewMode && !skipCompletionScreen) {
        setShowConfidenceAfterModal(true);
      } else if (!skipCompletionScreen) {
        setShowCompletionScreen(true);
      }
      
      if (user && !isPreviewMode && startTimeRef.current) {
        const timeTaken = (Date.now() - startTimeRef.current) / 1000;
        try {
          const res = await recordCompletion(user.id, versionId, timeTaken);
          if (res && res.error) {
            console.error('recordCompletion error', res.error);
            toast({ title: 'Erreur', description: 'Impossible d\'enregistrer la progression.', variant: 'destructive' });
          } else {
            console.log('Progression enregistrée avec succès');
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
      if (!currentStep) {
        console.error('❌ currentStep est undefined, index:', currentStepIndex);
        return;
      }
      
      // Si c'est une action "bravo", afficher l'overlay au lieu du toast
      if (currentStep?.action_type === 'bravo') {
        setShowBravoOverlay(true);
        // Marquer comme complété et enregistrer la progression (sans écran de complétion classique)
        if (currentStepIndex === currentVersion.steps.length - 1) {
          handleCompletion(true); // true = skip completion screen
        }
        return;
      }
      
      // Dismiss le toast précédent s'il existe
      if (lastToastRef.current) {
        lastToastRef.current.dismiss();
      }
      
      // Afficher le nouveau toast avec le numéro d'étape
      const toastInstance = toast({
        title: "Bien joué !",
        description: `Étape ${currentStepIndex + 1} réussie.`,
        action: <CheckCircle className="text-green-500" />,
        duration: 2000,
      });
      
      // Stocker la référence du toast
      lastToastRef.current = toastInstance;
      if (currentStepIndex < currentVersion.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        handleCompletion();
      }
    } else {
      // Erreur déjà gérée par ZoomableImage
      // Ne pas afficher de toast supplémentaire
    }
  }, [currentVersion, currentStepIndex, toast, handleCompletion]);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handlers pour la confiance
  const handleConfidenceBeforeSubmit = async (confidence) => {
    setConfidenceBefore(confidence);
    if (user && versionId) {
      await recordConfidenceBefore(user.id, versionId, confidence);
    }
    setShowConfidenceBeforeModal(false);
  };

  const handleConfidenceAfterSubmit = async (confidence) => {
    if (user && versionId) {
      await recordConfidenceAfter(user.id, versionId, confidence);
    }
    setShowConfidenceAfterModal(false);
    // Montrer l'écran de complétion après le modal
    setShowCompletionScreen(true);
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
        utterance.rate = 1;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        
        // Chercher une voix féminine française
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.lang.startsWith('fr') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => 
          voice.lang.startsWith('fr')
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        
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

  if (!task || !currentVersion || !currentVersion.steps || !Array.isArray(currentVersion.steps)) {
    console.error('❌ Données invalides:', { task: !!task, currentVersion: !!currentVersion, steps: currentVersion?.steps });
    return null;
  }
  
  if (currentStepIndex >= currentVersion.steps.length) {
    console.error('❌ Index de step invalide:', currentStepIndex, 'max:', currentVersion.steps.length);
    return null;
  }
  
  const currentStep = currentVersion.steps[currentStepIndex];
  if (!currentStep) {
    console.error('❌ currentStep est undefined');
    return null;
  }
  
  const totalSteps = currentVersion.steps.length;

  // Détecter si des actions de boutons physiques sont utilisées dans cette version
  const hasPhoneButtonActions = currentVersion.steps.some(step => 
    isPhysicalButtonAction(step.action_type)
  );

  // Déterminer si afficher le phone frame : soit parce que le step courant a un bouton, soit si l'utilisateur l'a forcé
  const shouldShowPhoneFrame = hasPhoneButtonActions && (
    isPhysicalButtonAction(currentStep?.action_type) || 
    forceShowPhoneFrame
  );
  
  // Debug log
  console.log('PhoneFrame Debug:', {
    shouldShowPhoneFrame,
    hasPhoneButtonActions,
    currentActionType: currentStep?.action_type,
    isPhysicalButton: isPhysicalButtonAction(currentStep?.action_type),
    buttonConfig: currentStep?.button_config,
    forceShowPhoneFrame
  });

  const sortedVersions = task.versions ? [...task.versions].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const currentIndexInAllVersions = sortedVersions.findIndex(ex => ex.id === currentVersion.id);
  const prevVersionOverall = currentIndexInAllVersions > 0 ? sortedVersions[currentIndexInAllVersions - 1] : null;
  const nextVersionOverall = currentIndexInAllVersions < sortedVersions.length - 1 ? sortedVersions[currentIndexInAllVersions + 1] : null;
  
  const videoUrl = currentVersion.video_url || task.video_url;

  // Si c'est un questionnaire (QCM), afficher le lecteur de questionnaire
  if (taskType === 'questionnaire') {
    return (
      <motion.div
        key={`questionnaire-${versionId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full p-4"
      >
        <QuestionnairePlayer
          versionId={versionId}
          taskId={taskId}
          learner_id={user?.id}
          onComplete={() => {
            setShowCompletionScreen(true);
            setTimeout(() => navigate('/taches'), 3000);
          }}
        />
      </motion.div>
    );
  }

  const mainContentMobile = (
    <div className="p-0.5 sm:p-1 bg-card rounded-lg shadow-xl flex flex-col h-full relative">
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
        <div className="p-1 my-0.5 text-2xs bg-amber-100 border-l-4 border-amber-500 text-amber-700 rounded shrink-0">
          <div className="flex items-center"> <AlertTriangle className="mr-1 h-2.5 w-2.5"/> <p className="font-semibold">Note :</p> </div>
          <p>Cette version peut présenter des différences.</p>
        </div>
      )}
      <div className="flex items-center justify-center space-x-2 mb-1">
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
          currentLanguage={currentLanguage}
        />
      )}
      <PhoneFrame 
        showPhoneFrame={shouldShowPhoneFrame}
        buttonConfig={currentStep?.button_config || 'samsung'}
        hideButtons={showBravoOverlay}
        onButtonClick={(buttonId) => {
          const buttonToActionMap = {
            'power': 'button_power',
            'volumeUp': 'button_volume_up',
            'volumeDown': 'button_volume_down'
          };
          if (buttonToActionMap[buttonId] === currentStep?.action_type) {
            handleInteraction(true);
          }
        }}
      >
        <div className="flex-grow min-h-0 w-full aspect-[9/16] bg-black rounded-lg overflow-hidden relative">
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
            keyboardAutoShow={currentStep?.keyboard_auto_show || false}
            expectedInput={currentStep?.expected_input || ''}
          />
        {/* Overlay Bravo */}
        <BravoOverlay
          isOpen={showBravoOverlay}
          onClose={() => setShowBravoOverlay(false)}
          onReturnToTasks={() => navigate('/taches')}
        />
        </div>
      </PhoneFrame>
      <div className="shrink-0 mt-1.5">
        <ExerciseToolbar
          isZoomActive={isZoomActive}
          onZoomToggle={() => setIsZoomActive(z => !z)}
          showInstructions={showInstructions}
          onInstructionsToggle={() => setShowInstructions(s => !s)}
          hideActionZone={hideActionZone}
          onHideActionZone={() => setHideActionZone(h => !h)}
          hasPhoneButtonActions={hasPhoneButtonActions}
          forceShowPhoneFrame={forceShowPhoneFrame}
          onForceShowPhoneFrame={() => setForceShowPhoneFrame(f => !f)}
          versions={sortedVersions}
          currentVersionId={versionId}
          onVersionChange={handleTabChange}
          isMobileLayout={true}
          taskId={taskId}
          versionId={versionId}
          currentStepIndex={currentStepIndex}
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
    <div className="bg-card rounded-lg shadow-xl">
      <AnimatePresence>
        {showCompletionScreen && <CompletionScreen onBackToList={() => navigate('/taches')} isMobileLayout={false} />}
      </AnimatePresence>

      <div className="flex gap-2 items-start p-4 pb-0">
        {/* Barre verticale verte à gauche */}
        <VerticalToolbar
          isZoomActive={isZoomActive}
          onZoomToggle={() => setIsZoomActive(z => !z)}
          showInstructions={showInstructions}
          onInstructionsToggle={() => setShowInstructions(s => !s)}
          hideActionZone={hideActionZone}
          onHideActionZone={() => setHideActionZone(h => !h)}
          versions={sortedVersions}
          currentVersionId={versionId}
          onVersionChange={handleTabChange}
          onNavigateHome={() => navigate('/')}
          onViewNotes={() => setNotesViewerOpen(true)}
          onAddNote={() => window.dispatchEvent(new CustomEvent('openNotesModal'))}
          onPrev={goToPrevStep}
          onNext={goToNextStep}
          isPrevDisabled={currentStepIndex === 0}
          isNextDisabled={currentStepIndex === totalSteps - 1 && isCompleted}
          onNavigateToTasks={() => navigate('/taches')}
          onPlayAudio={playInstructionAudio}
          currentStep={currentStep}
          textZoom={textZoom}
          onTextZoomChange={setTextZoom}
          isMobileLayout={false}
          taskId={taskId}
          versionId={versionId}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          preferredLanguage={preferredLanguageFromProfile}
        />

        {/* Zone capture d'écran avec zone d'action */}
        <div className="flex-1">
          <PhoneFrame 
            showPhoneFrame={shouldShowPhoneFrame}
            buttonConfig={currentStep?.button_config || 'samsung'}
            onButtonClick={(buttonId) => {
              const buttonToActionMap = {
                'power': 'button_power',
                'volumeUp': 'button_volume_up',
                'volumeDown': 'button_volume_down'
              };
              if (buttonToActionMap[buttonId] === currentStep?.action_type) {
                handleInteraction(true);
              }
            }}
          >
            <div className="relative w-full h-full">
              <ZoomableImage
              imageId={currentStep?.app_image_id}
              alt={`Capture d'écran pour l'étape`}
              targetArea={currentStep?.target_area}
              actionType={currentStep?.action_type}
              startArea={currentStep?.start_area}
              onInteraction={handleInteraction}
              imageContainerClassName=""
              isMobileLayout={false}
              isZoomActive={isZoomActive}
              hideActionZone={hideActionZone}
              keyboardAutoShow={currentStep?.keyboard_auto_show || false}
              expectedInput={currentStep?.expected_input || ''}
            />
            {/* Overlay Bravo */}
            <BravoOverlay
              isOpen={showBravoOverlay}
              onClose={() => setShowBravoOverlay(false)}
              onReturnToTasks={() => navigate('/taches')}
            />
            </div>
          </PhoneFrame>
        </div>
      </div>
      
      <InformationPanel
        isVisible={showInformationPanel}
        onClose={() => setShowInformationPanel(false)}
        actionType={currentStep?.action_type}
        startArea={currentStep?.start_area}
      />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }} 
      className={cn("mx-auto flex flex-col w-full h-screen", isMobileLayout ? "p-0.5 overflow-hidden" : "p-2 md:p-4 max-w-4xl mx-auto overflow-auto")}
    >
      <div className={cn("shrink-0 z-50", isMobileLayout ? "sticky top-0 bg-background pb-1" : "")}> 
        <ExerciseHeader 
          taskTitle={task.title}
          currentStep={currentStep}
          onPlayAudio={playInstructionAudio}
          showInstructions={showInstructions}
          textZoom={textZoom}
          isMobileLayout={isMobileLayout}
          currentLanguage={currentLanguage}
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
      </div>
      
      <div className={cn("flex-grow min-h-0 overflow-y-auto p-4")}>
        <AnimatePresence mode="wait">
          {taskType === 'questionnaire' ? (
            // Afficher le QuestionnairePlayer pour les QCM
            <QuestionnairePlayer
              versionId={versionId}
              taskId={taskId}
              learner_id={user?.id}
              onComplete={(result) => {
                // Enregistrer la complétion et afficher l'écran de fin
                recordCompletion(user?.id, versionId, Date.now() - (startTimeRef.current || Date.now()));
                setShowCompletionScreen(true);
              }}
            />
          ) : (
            // Afficher le contenu exercice normal
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
          )}
        </AnimatePresence>
      </div>

      <div className={cn("flex justify-between shrink-0", isMobileLayout ? "mt-1.5" : "mt-4 sm:mt-6 md:mt-8")}>
        {/* Boutons de navigation entre versions supprimés */}
      </div>
      
      <VideoPlayerModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={videoUrl}
        title={`Vidéo pour: ${currentVersion.name}`}
      />

      {/* Modals de confiance */}
      <ConfidenceBeforeModal
        isOpen={showConfidenceBeforeModal}
        onClose={() => setShowConfidenceBeforeModal(false)}
        onSubmit={handleConfidenceBeforeSubmit}
        taskTitle={task?.title || 'Cet exercice'}
      />
      
      <ConfidenceAfterModal
        isOpen={showConfidenceAfterModal}
        onClose={() => {
          setShowConfidenceAfterModal(false);
          setShowCompletionScreen(true);
        }}
        onSubmit={handleConfidenceAfterSubmit}
        taskTitle={task?.title || 'Cet exercice'}
        confidenceBefore={confidenceBefore}
      />
    </motion.div>
  );
};

export default ExercisePage;

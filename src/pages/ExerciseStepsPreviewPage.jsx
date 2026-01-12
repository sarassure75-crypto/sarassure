import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, HelpCircle, List, PlayCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import * as LucideIcons from 'lucide-react';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { cn } from '@/lib/utils';
import ImageFromSupabase from '@/components/ImageFromSupabase';
import SafetyBanner from '@/components/exercise/SafetyBanner';

const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const ExerciseStepsPreviewPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchTaskAndVersions = async () => {
      setLoading(true);
      try {
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('id, title, description, icon_name, video_url, pictogram_app_image_id, task_type')
          .eq('id', taskId)
          .single();

        if (taskError) throw taskError;

        // Si c'est un questionnaire, rediriger directement vers le player
        if (taskData.task_type === 'questionnaire') {
          // Récupérer la première version disponible
          const { data: versionsData, error: versionsError } = await supabase
            .from('versions')
            .select('id')
            .eq('task_id', taskId)
            .order('name', { ascending: true })
            .limit(1);

          if (!versionsError && versionsData && versionsData.length > 0) {
            navigate(`/tache/${taskId}/version/${versionsData[0].id}`);
            return;
          }
        }

        const { data: versionsData, error: versionsError } = await supabase
          .from('versions')
          .select('id, name, version, has_variant_note, steps(id, step_order, instruction, icon_name, pictogram_app_image_id)')
          .eq('task_id', taskId)
          .order('name', { ascending: true });

        if (versionsError) throw versionsError;

        setTask(taskData);
        setVersions(versionsData);
        if (versionsData && versionsData.length > 0) {
          setSelectedVersionId(versionsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching task or versions:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails de la tâche.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaskAndVersions();
  }, [taskId, toast]);

  const handlePlayVideo = (url) => {
    setVideoUrl(url);
    setIsVideoModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!task) {
    return <div className="text-center py-10">Tâche non trouvée.</div>;
  }

  const TaskIcon = LucideIcons[toPascalCase(task.icon_name)] || List;

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4 md:p-6">
      <Button variant="outline" onClick={() => navigate('/taches')} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Retour à la liste des tâches
      </Button>

      {/* Banneau de sécurité */}
      <SafetyBanner className="mb-6" />

      <Card className="mb-6 shadow-lg border-border/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card/80">
          <div className="flex-shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center h-16 w-16 p-2">
            {task.pictogram_app_image_id ? (
              <ImageFromSupabase imageId={task.pictogram_app_image_id} alt="Pictogramme de la tâche" className="h-full w-full object-contain" />
            ) : (
              <TaskIcon className="h-10 w-10" />
            )}
          </div>
          <div className="flex-grow">
            <CardTitle className="text-xl font-bold text-primary">{task.title}</CardTitle>
            {task.description && <CardDescription className="mt-1 text-sm">{task.description}</CardDescription>}
          </div>
          {task.video_url && (
            <Button variant="ghost" size="icon" onClick={() => handlePlayVideo(task.video_url)} className="text-primary hover:text-primary/80 flex-shrink-0">
              <PlayCircle className="h-8 w-8" />
            </Button>
          )}
        </CardHeader>
      </Card>

      {versions.length > 0 ? (
        <div className="w-full">
          {/* Sélecteur de versions en accordion */}
          <div className="rounded-lg border-2 border-primary bg-primary/5 mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-3 flex items-center justify-between focus:outline-none text-base"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">
                  {versions.find(v => v.id === selectedVersionId)?.name || 'Version'}
                </span>
                {versions.find(v => v.id === selectedVersionId)?.has_variant_note && (
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

            <AnimatePresence>
              {isExpanded && versions.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 p-2 bg-background rounded-b-lg border-t border-muted">
                    {versions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => {
                          setSelectedVersionId(version.id);
                          setIsExpanded(false);
                        }}
                        className={cn(
                          "w-full text-left p-2 rounded transition-colors duration-150",
                          version.id === selectedVersionId
                            ? "bg-primary/20 border-l-4 border-primary font-semibold text-primary"
                            : "bg-background/50 hover:bg-background text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{version.name}</span>
                          {version.has_variant_note && (
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

          {/* Contenu de la version sélectionnée */}
          {versions.filter(version => version.id === selectedVersionId).map((version) => (
            <Card key={version.id}>
                <CardHeader>
                  <CardTitle>Étapes pour : {version.name}</CardTitle>
                  <CardDescription>Version {version.version}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {version.steps && [...version.steps].sort((a, b) => (a.step_order || 0) - (b.step_order || 0)).map((step, index) => {
                      let StepIcon = HelpCircle;
                      try {
                        const iconName = step.icon_name || 'HelpCircle';
                        StepIcon = LucideIcons[toPascalCase(iconName)] || HelpCircle;
                      } catch (e) {
                        console.warn("Icon resolution error:", e);
                      }
                      
                      return (
                        <Link
                          key={step.id || index}
                          to={`/tache/${taskId}/version/${version.id}?step=${index + 1}`}
                          className="flex items-center p-3 bg-background rounded-lg border hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mr-4">
                            {index + 1}
                          </div>
                          <div className="flex-grow text-sm font-medium">{step.instruction}</div>
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary ml-4">
                            {step.pictogram_app_image_id ? (
                              <ImageFromSupabase imageId={step.pictogram_app_image_id} alt="Pictogramme" className="h-7 w-7 object-contain" />
                            ) : (
                              <StepIcon className="h-6 w-6" />
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-6 text-center">
                    <Button asChild size="lg">
                      <Link to={`/tache/${taskId}/version/${version.id}`}>
                        Commencer
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">Aucune version disponible pour cette tâche.</p>
      )}
      <VideoPlayerModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={videoUrl}
        title={`Vidéo pour: ${task.title}`}
      />
    </div>
  );
};

export default ExerciseStepsPreviewPage;
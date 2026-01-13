import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, AlertTriangle, Video, List, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as FontAwesome6 from 'react-icons/fa6';
import * as BootstrapIcons from 'react-icons/bs';
import * as MaterialIcons from 'react-icons/md';
import * as FeatherIcons from 'react-icons/fi';
import * as HeroiconsIcons from 'react-icons/hi2';
import * as AntIcons from 'react-icons/ai';
import { Icon as IconifyIcon } from '@iconify/react';
import { fetchTasks, fetchTaskCategories } from '@/data/tasks';
import { fetchImages } from '@/data/images';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/data/users';
import { Badge } from '@/components/ui/badge';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { motion } from 'framer-motion';
import SafetyBanner from '@/components/exercise/SafetyBanner';
import { cacheData, getCachedData } from '@/lib/retryUtils';

const toPascalCase = (str) => {
  if (!str) return null;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [videoUrl, setVideoUrl] = useState(null);
  const [taskForVideo, setTaskForVideo] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Try to use cache first (for offline support)
        const cachedTasks = getCachedData('tasks');
        const cachedCategories = getCachedData('task-categories');
        const cachedImages = getCachedData('images');

        if (cachedTasks && cachedCategories && cachedImages) {
          setTasks(cachedTasks);
          setCategories(cachedCategories);
          setImages(new Map(cachedImages));
          setIsLoading(false);
          
          // Refresh data in background (don't await, fire and forget)
          (async () => {
            try {
              const [tasksData, categoriesData, imagesData] = await Promise.all([
                fetchTasks(true),
                fetchTaskCategories(true),
                fetchImages(true)
              ]);
              
              setTasks(tasksData || []);
              setCategories(categoriesData || []);
              setImages(imagesData || new Map());
              
              // Cache the fresh data (updated timestamp)
              cacheData('tasks', tasksData, 3600000);
              cacheData('task-categories', categoriesData, 3600000);
              cacheData('images', Array.from(imagesData.entries()), 3600000);
            } catch (bgError) {
              console.warn('Background refresh failed, using cached data:', bgError);
            }
          })();
        } else {
          // No cache available, fetch fresh data with forceRefresh=true 
          // to ensure we don't get stale SW results on first load if cache was deleted
          const [tasksData, categoriesData, imagesData] = await Promise.all([
            fetchTasks(true),
            fetchTaskCategories(true),
            fetchImages(true)
          ]);
          
          setTasks(tasksData || []);
          setCategories(categoriesData || []);
          setImages(imagesData || new Map());
          
          // Cache the data
          cacheData('tasks', tasksData, 3600000);
          cacheData('task-categories', categoriesData, 3600000);
          cacheData('images', Array.from(imagesData.entries()), 3600000);
          
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading task list data:", err);
        setError("Impossible de charger les tâches. Les données en cache (si disponibles) seront utilisées.");
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const tasksByCategory = useMemo(() => {
    const grouped = categories.reduce((acc, cat) => {
      acc[cat.name] = [];
      return acc;
    }, {});
    
    if (!grouped['Autres']) {
      grouped['Autres'] = [];
    }

    tasks.forEach(task => {
      if (task.category && grouped[task.category]) {
        grouped[task.category].push(task);
      } else {
        grouped['Autres'].push(task);
      }
    });

    return Object.entries(grouped)
      .filter(([, tasks]) => tasks.length > 0)
      .sort(([catA], [catB]) => {
        if (catA === 'Autres') return 1;
        if (catB === 'Autres') return -1;
        return catA.localeCompare(catB);
      });
  }, [tasks, categories]);

  const handleVideoClick = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    setTaskForVideo(task);
    setVideoUrl(task.video_url);
  };

  const renderTaskCard = (task) => {
    if (!task) return null;
    
    const isQuestionnaire = task.task_type === 'questionnaire';
    let IconComponent = HelpCircle;
    
    try {
      if (isQuestionnaire) {
        IconComponent = HelpCircle;
      } else if (task.icon_name && task.icon_name.includes(':')) {
        // Format: library:name (ex: fa6:FaPhone)
        const [library, name] = task.icon_name.split(':');
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
        if (lib && lib[name]) {
          IconComponent = lib[name];
        } else {
          console.warn("Icon not found:", task.icon_name, "library:", library, "name:", name);
          IconComponent = List;
        }
      } else if (task.icon_name) {
        // Fallback: essayer Lucide avec PascalCase
        const pascalIcon = toPascalCase(task.icon_name);
        IconComponent = LucideIcons[pascalIcon] || List;
      } else {
        IconComponent = List;
      }
    } catch (e) {
      console.warn("Error resolving icon for task:", task.title, e);
      IconComponent = List;
    }

    const pictogram = task.pictogram_app_image_id && images instanceof Map ? images.get(task.pictogram_app_image_id) : null;

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={isQuestionnaire ? `/questionnaire/${task.id}` : `/tache/${task.id}`} className="block h-full">
          <Card className={`flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl ${isQuestionnaire ? 'border-blue-500/50 hover:border-blue-500' : 'hover:border-primary/50'}`}>
            <CardHeader className="flex-row items-start gap-4 space-y-0 p-4">
              <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg border ${isQuestionnaire ? 'bg-blue-50 border-blue-300' : 'bg-muted'}`}>
                {pictogram ? (
                  <img src={pictogram.publicUrl} alt={pictogram.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <IconComponent className={`w-8 h-8 ${isQuestionnaire ? 'text-blue-600' : 'text-primary'}`} />
                )}
              </div>
              <div className="flex-grow">
                <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                {currentUser.role === USER_ROLES.ADMIN && (
                  <Badge variant={task.creation_status === 'validated' ? 'default' : 'secondary'} className="mt-1">
                    {task.creation_status === 'validated' ? 'Validé' : 'En création'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
              <CardDescription className="line-clamp-3 text-sm">{task.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end items-center">
              {task.video_url && (
                <Button variant="ghost" size="icon" onClick={(e) => handleVideoClick(e, task)} className="mr-auto">
                  <Video className="h-5 w-5 text-blue-500" />
                </Button>
              )}
              <Button variant="outline" size="sm" className={isQuestionnaire ? 'border-blue-500 text-blue-600 hover:bg-blue-50' : ''}>
                {isQuestionnaire ? 'Faire le QCM' : 'Voir les étapes'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-red-800">Erreur</h2>
        <p className="mt-2 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-center mb-8">Liste des Tâches</h1>
      
      {/* Banneau de sécurité */}
      <SafetyBanner />
      
      {tasksByCategory.length > 0 ? (
        <div className="space-y-12">
          {tasksByCategory.map(([category, tasksInCategory]) => (
            <section key={category}>
              <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2 mb-6">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tasksInCategory.map(renderTaskCard)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-12">Aucune tâche n'est disponible pour le moment.</p>
      )}
      {videoUrl && taskForVideo && (
        <VideoPlayerModal 
          isOpen={!!videoUrl}
          videoUrl={videoUrl} 
          onClose={() => { setVideoUrl(null); setTaskForVideo(null); }}
          title={`Vidéo pour : ${taskForVideo.title}`}
        />
      )}
    </div>
  );
};

export default TaskListPage;
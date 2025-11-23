import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { fetchTasks, fetchAppStats } from '@/data/tasks';
import { createErrorReport } from '@/data/errorReports';
import { useAuth } from '@/contexts/AuthContext';
import { Bug, Send, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const errorCategories = [
  "Erreur d'emplacement de la zone d'action",
  "Erreur dans le texte à saisir", 
  "Lien ne fonctionnant pas",
  "Version ne se chargeant pas",
  "Version incompréhensible",
  "Pictogramme incorrect ou manquant",
  "Problème d'affichage général",
  "Autre"
];

const APP_VERSION = "1.0.0"; 

const ReportErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [selectedStep, setSelectedStep] = useState('');
  
  const [tasks, setTasks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [stepsCount, setStepsCount] = useState(0);

  const loadTasks = useCallback(async () => {
    const allTasks = await fetchTasks(true);
    setTasks(allTasks || []);
    return allTasks || [];
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const allTasks = await loadTasks();

      const queryParams = new URLSearchParams(location.search);
      const taskIdFromQuery = queryParams.get('taskId');
      const versionIdFromQuery = queryParams.get('versionId');
      const stepIndexFromQuery = queryParams.get('stepIndex');
  
      if (taskIdFromQuery) {
        setSelectedTaskId(taskIdFromQuery);
        const task = allTasks.find(t => t.id === taskIdFromQuery);
        if (task && task.versions) {
          setVersions(task.versions);
          if (versionIdFromQuery) {
            setSelectedVersionId(versionIdFromQuery);
            const version = task.versions.find(v => v.id === versionIdFromQuery);
            if (version && version.steps) {
              setStepsCount(version.steps.length);
              if (stepIndexFromQuery) {
                setSelectedStep((parseInt(stepIndexFromQuery, 10) + 1).toString());
              }
            }
          }
        }
      }
    };
    initialize();
  }, [location.search, loadTasks]);

  const handleTaskChange = (taskId) => {
    setSelectedTaskId(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task && task.versions) {
      setVersions(task.versions);
      setSelectedVersionId('');
      setStepsCount(0);
      setSelectedStep('');
    } else {
      setVersions([]);
    }
  };

  const handleVersionChange = (versionId) => {
    setSelectedVersionId(versionId);
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
      const version = task.versions.find(v => v.id === versionId);
      if (version && version.steps) {
        setStepsCount(version.steps.length);
        setSelectedStep('');
      } else {
        setStepsCount(0);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ title: "Description manquante", description: "Veuillez décrire l'erreur rencontrée.", variant: "destructive" });
      return;
    }

    const appStats = await fetchAppStats();
    const currentTasks = tasks.length > 0 ? tasks : await fetchTasks();
    const currentVersions = versions.length > 0 ? versions : (currentTasks.find(t => t.id === selectedTaskId)?.versions || []);

    const report = {
      user_id: currentUser?.id || null,
      user_first_name: currentUser?.first_name || 'N/A',
      description,
      category,
      task_id: selectedTaskId || null,
      exercise_title: currentTasks.find(t => t.id === selectedTaskId)?.title || '',
      version_id: selectedVersionId || null,
      version_name: currentVersions.find(v => v.id === selectedVersionId)?.name || '',
      version_android: currentVersions.find(v => v.id === selectedVersionId)?.version || '',
      step_index: selectedStep ? parseInt(selectedStep, 10) : null,
      app_version: APP_VERSION,
      exercise_update_date: appStats.lastUpdate,
      is_sent: false,
    };

    try {
      await createErrorReport(report);
      toast({ title: "Signalement envoyé", description: "Merci ! Votre signalement a été envoyé à l'équipe." });
      navigate(-1); 
    } catch (error) {
      toast({ title: "Erreur d'envoi", description: "Impossible d'envoyer le signalement.", variant: "destructive" });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 md:p-8"
    >
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <CardTitle className="text-2xl flex items-center"><Bug className="mr-3 h-6 w-6" /> Signaler une Erreur</CardTitle>
          <CardDescription className="text-primary-foreground/90">
            Aidez-nous à améliorer SARASSURE en signalant les problèmes que vous rencontrez.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="description" className="text-lg font-medium">Description de l'erreur *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Veuillez décrire le problème le plus précisément possible..."
                rows={5}
                required
                className="mt-1 text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category">Catégorie du problème</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="mt-1 text-base">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {errorCategories.map((cat, index) => (
                      <SelectItem key={index} value={cat} className="text-base">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task">Tâche concernée</Label>
                <Select value={selectedTaskId} onValueChange={handleTaskChange}>
                  <SelectTrigger id="task" className="mt-1 text-base">
                    <SelectValue placeholder="Sélectionnez une tâche" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id} className="text-base">{task.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedTaskId && versions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="version">Version concernée</Label>
                  <Select value={selectedVersionId} onValueChange={handleVersionChange}>
                    <SelectTrigger id="version" className="mt-1 text-base">
                      <SelectValue placeholder="Sélectionnez une version" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((v) => (
                        <SelectItem key={v.id} value={v.id} className="text-base">{v.name} ({v.version})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedVersionId && stepsCount > 0 && (
                  <div>
                    <Label htmlFor="step">Étape concernée (numéro)</Label>
                    <Input
                      id="step"
                      type="number"
                      value={selectedStep}
                      onChange={(e) => setSelectedStep(e.target.value)}
                      placeholder={`1 à ${stepsCount}`}
                      min="1"
                      max={stepsCount}
                      className="mt-1 text-base"
                    />
                  </div>
                )}
              </div>
            )}
            <CardFooter className="px-0 pt-6">
              <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white text-lg">
                <Send className="mr-2 h-5 w-5" /> Envoyer le signalement
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportErrorPage;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getLearnersByTrainer, USER_ROLES } from '@/data/users';
import { fetchVisibilityForLearner, setVisibilityForLearner } from '@/data/visibility';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTasks } from '@/data/tasks';

const TrainerDashboardPage = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [learners, setLearners] = useState([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState(null);
  const [visibilityMap, setVisibilityMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingLearner, setIsSwitchingLearner] = useState(false);

  const fetchLearnerData = useCallback(async (learnerId) => {
    if (!learnerId) return;
    setIsSwitchingLearner(true);
    try {
      const visibility = await fetchVisibilityForLearner(learnerId);
      setVisibilityMap(visibility);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les données de visibilité de l'apprenant.", variant: "destructive" });
    } finally {
      setIsSwitchingLearner(false);
    }
  }, [toast]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, learnersData] = await Promise.all([
          fetchTasks(),
          getLearnersByTrainer(currentUser.id),
        ]);
        
        setTasks(tasksData || []);
        setLearners(learnersData || []);

        if (learnersData && learnersData.length > 0) {
          const firstLearnerId = learnersData[0].id;
          setSelectedLearnerId(firstLearnerId);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({ title: "Erreur de chargement", description: "Impossible de charger les données du tableau de bord.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      loadInitialData();
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (selectedLearnerId) {
      fetchLearnerData(selectedLearnerId);
    }
  }, [selectedLearnerId, fetchLearnerData]);

  const handleVisibilityChange = async (taskId, versionId, isVisible) => {
    if (!selectedLearnerId) return;
    
    const key = `${taskId}-${versionId}`;
    const originalValue = visibilityMap.get(key) !== false;

    setVisibilityMap(prev => {
      const newMap = new Map(prev);
      newMap.set(key, isVisible);
      return newMap;
    });

    try {
      await setVisibilityForLearner(selectedLearnerId, taskId, versionId, isVisible);
      toast({ title: `Visibilité de l'exercice modifiée.` });
    } catch (error) {
      setVisibilityMap(prev => {
        const newMap = new Map(prev);
        newMap.set(key, originalValue);
        return newMap;
      });
      toast({ title: "Erreur", description: "Impossible de modifier la visibilité.", variant: "destructive" });
    }
  };

  const groupedTasks = useMemo(() => {
    return (tasks || []).reduce((acc, task) => {
        const category = task.category || 'Non Catégorisé';
        if (!acc[category]) acc[category] = [];
        acc[category].push(task);
        return acc;
    }, {});
  }, [tasks]);

  if (!currentUser || (currentUser.role !== USER_ROLES.TRAINER && currentUser.role !== USER_ROLES.ADMIN)) {
    return <p className="p-4 text-center text-destructive">Accès non autorisé.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tableau de Bord Formateur</CardTitle>
        <CardDescription>Suivez les progrès et gérez la visibilité des exercices pour chaque apprenant.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label htmlFor="learner-select" className="text-sm font-medium">Sélectionner un apprenant</label>
          <Select value={selectedLearnerId || ''} onValueChange={setSelectedLearnerId}>
            <SelectTrigger id="learner-select" className="w-full sm:w-[300px]">
              <SelectValue placeholder="Choisissez un apprenant..." />
            </SelectTrigger>
            <SelectContent>
              {learners.length > 0 ? learners.map(learner => (
                <SelectItem key={learner.id} value={learner.id}>{learner.first_name || `Apprenant ${learner.learner_code}`}</SelectItem>
              )) : <SelectItem value="none" disabled>Aucun apprenant lié</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="h-[600px] w-full">
          {isSwitchingLearner ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !selectedLearnerId ? (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <Users className="h-12 w-12 mb-4" />
              <p>Veuillez sélectionner un apprenant pour gérer la visibilité des exercices.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Tâche / Version</TableHead>
                  <TableHead className="text-center">Visibilité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(groupedTasks).length > 0 ? Object.entries(groupedTasks).map(([category, tasksInCategory]) => (
                  <React.Fragment key={category}>
                    <TableRow className="bg-muted/50 hover:bg-muted/60">
                      <TableCell colSpan={2} className="font-semibold text-primary">
                        {category}
                      </TableCell>
                    </TableRow>
                    {tasksInCategory.map((task) => (
                      (task.versions || []).map((version, exIndex) => {
                        const visibilityKey = `${task.id}-${version.id}`;
                        const isVisible = visibilityMap.get(visibilityKey) !== false;

                        return (
                          <TableRow key={version.id} className={`border-l-4 ${isVisible ? 'border-green-200' : 'border-red-200'} hover:bg-slate-50`}>
                            <TableCell className="pl-6 text-sm">
                              {exIndex === 0 && <div className="font-medium pb-1">{task.title}</div>}
                              <div className="pl-4 text-muted-foreground">{version.name}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <Switch
                                  checked={isVisible}
                                  onCheckedChange={(checked) => handleVisibilityChange(task.id, version.id, checked)}
                                  aria-label={`Visibilité de l'exercice ${version.name}`}
                                />
                                {isVisible ? <Eye className="h-4 w-4 text-green-500"/> : <EyeOff className="h-4 w-4 text-red-500"/>}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ))}
                  </React.Fragment>
                )) : (
                  <TableRow>
                    <TableCell colSpan="2" className="text-center text-muted-foreground h-48">
                      Aucune tâche à afficher.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TrainerDashboardPage;
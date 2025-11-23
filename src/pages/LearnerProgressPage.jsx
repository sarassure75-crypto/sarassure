import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserProgressDetails } from '@/data/progress';
import { fetchTasks } from '@/data/tasks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Link, BarChart, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getUserById, unassignTrainerFromLearner } from '@/data/users';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
};

const LearnerProgressPage = () => {
    const { currentUser, refetchUser } = useAuth();
    const { toast } = useToast();
    const [progress, setProgress] = useState(null);
    const [progressError, setProgressError] = useState(false);
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [trainerProfile, setTrainerProfile] = useState(null);
    const [isLoadingTrainer, setIsLoadingTrainer] = useState(true);

    const fetchProgressData = useCallback(async () => {
        if (!currentUser?.id) {
            setIsLoading(false);
            setProgress([]);
            return;
        }
        setIsLoading(true);
        try {
            const tasks = await fetchTasks();
            let progressData = [];
            setAllTasks(tasks || []);
            try {
                progressData = await fetchUserProgressDetails(currentUser.id);
                setProgressError(false);
            } catch (error) {
                setProgressError(true);
                progressData = [];
            }
            // Crée une map pour retrouver la progression par version
            const progressMap = new Map();
            (progressData || []).forEach(p => {
                progressMap.set(`${p.task_id}-${p.version_id}`, p);
            });
            // Construit la liste complète à afficher
            const fullProgress = [];
            tasks.forEach(task => {
                (task.versions || []).forEach(version => {
                    const key = `${task.id}-${version.id}`;
                    const p = progressMap.get(key);
                    fullProgress.push({
                        id: key,
                        task_title: task.title,
                        version_name: version.name,
                        attempts: p ? p.attempts : 0,
                        first_time_seconds: p ? p.first_time_seconds : null,
                        best_time_seconds: p ? p.best_time_seconds : null,
                        completed_steps_history: p ? p.completed_steps_history : null
                    });
                });
            });
            setProgress(fullProgress);
            if (!progressError) {
                toast({ title: "Progression mise à jour", description: "Vos données de suivi sont à jour." });
            }
        } catch (error) {
            setProgressError(true);
            setProgress([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, toast]);

    const fetchAndSetTrainerProfile = useCallback(async () => {
        if (currentUser && currentUser.assigned_trainer_id) {
            setIsLoadingTrainer(true);
            try {
                const profile = await getUserById(currentUser.assigned_trainer_id);
                setTrainerProfile(profile);
            } catch (error) {
                console.error("Error fetching trainer profile:", error);
                toast({ title: "Erreur", description: "Impossible de charger les informations du formateur.", variant: "destructive" });
            } finally {
                setIsLoadingTrainer(false);
            }
        } else {
             setIsLoadingTrainer(false);
             setTrainerProfile(null);
        }
    }, [currentUser, toast]);

    useEffect(() => {
        fetchAndSetTrainerProfile();
    }, [fetchAndSetTrainerProfile]);
    
    useEffect(() => {
        fetchProgressData();
    }, [currentUser?.id]); // Removed fetchProgressData from dependency array

    const handleUnlink = async () => {
        if (!currentUser) return;
        try {
            await unassignTrainerFromLearner(currentUser.id);
            toast({ title: "Dissociation réussie", description: "Vous n'êtes plus lié à ce formateur." });
            setTrainerProfile(null);
            if (refetchUser) {
              await refetchUser();
            }
        } catch (error) {
             toast({ title: "Erreur", description: "La dissociation a échoué.", variant: "destructive" });
        }
    }

    const getTrainerDisplayName = () => {
      if (!trainerProfile) return "";
      const parts = [trainerProfile.first_name, trainerProfile.last_name, trainerProfile.pseudo ? `(${trainerProfile.pseudo})` : ''].filter(Boolean);
      return parts.join(' ');
    };

    if (!currentUser) {
        return <div className="flex justify-center items-center h-full pt-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="mb-6 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl flex items-center"><BarChart className="mr-3 h-8 w-8 text-primary"/>Mon Suivi d'Apprentissage</CardTitle>
                    <CardDescription>Bonjour {currentUser.first_name} ! Suivez vos progrès et gérez votre liaison avec un formateur.</CardDescription>
                </CardHeader>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center"><Link className="mr-2 h-5 w-5"/>Liaison Formateur</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingTrainer ? (
                        <div className="flex items-center space-x-2">
                           <Loader2 className="h-5 w-5 animate-spin" />
                           <span>Chargement du profil formateur...</span>
                        </div>
                    ) : trainerProfile ? (
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Lié au formateur :</p>
                                <p className="font-semibold text-lg">{getTrainerDisplayName()}</p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <XCircle className="mr-2 h-4 w-4" /> Modifier la liaison
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Voulez-vous vraiment vous délier ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. Vous devrez contacter votre formateur pour être lié à nouveau.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleUnlink} className="bg-destructive hover:bg-destructive/80">Confirmer la dissociation</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                        </div>
                    ) : (
                        <p className="text-muted-foreground">Vous n'êtes actuellement lié à aucun formateur. Partagez votre code apprenant (<strong className="text-primary">{currentUser.learner_code}</strong>) avec votre formateur pour qu'il puisse vous lier.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Progression des Versions</CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchProgressData} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Rafraîchir
                    </Button>
                </CardHeader>
                <CardContent>
                    {progressError && (
                        <div className="text-red-600 mb-2">Erreur : Impossible de charger la progression. Les tâches sont affichées sans suivi.</div>
                    )}
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tâche / Version</TableHead>
                                    <TableHead>Tentatives</TableHead>
                                    <TableHead>1er Temps</TableHead>
                                    <TableHead>Meilleur Temps</TableHead>
                                    <TableHead>Progrès</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && progress === null ? (
                                    <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                                ) : progress && progress.length > 0 ? (
                                    progress.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <p className="font-medium">{p.task_title}</p>
                                                <p className="text-sm text-muted-foreground">{p.version_name}</p>
                                            </TableCell>
                                            <TableCell>{p.attempts}</TableCell>
                                            <TableCell>{formatTime(p.first_time_seconds)}</TableCell>
                                            <TableCell>{formatTime(p.best_time_seconds)}</TableCell>
                                            <TableCell>{p.completed_steps_history ? 'Terminé' : 'En cours'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune tâche disponible ou progression.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default LearnerProgressPage;
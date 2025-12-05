import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserProgressDetails } from '@/data/progress';
import { fetchTasks } from '@/data/tasks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Link, BarChart, XCircle, RefreshCw, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getUserById, unassignTrainerFromLearner } from '@/data/users';
import { Button } from '@/components/ui/button';
import ConfidenceSelector from '@/components/exercise/ConfidenceSelector';
import { useConfidence } from '@/hooks/useConfidence';
import { supabase } from '@/lib/supabaseClient';
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

/**
 * Vérifie si un temps est valide (pas trop court, ce qui indiquerait une triche ou saut d'étapes)
 * Un temps est considéré comme suspect s'il est inférieur à 10% du temps moyen des tentatives
 */
const isValidTime = (time, allTimes) => {
  if (!time || !allTimes || allTimes.length === 0) return false;
  
  // Calcule la moyenne des temps
  const avgTime = allTimes.reduce((sum, t) => sum + t, 0) / allTimes.length;
  
  // Un temps est valide s'il est au moins 10% du temps moyen (ou > 5 secondes minimum)
  const minValidTime = Math.max(avgTime * 0.1, 5);
  
  return time >= minValidTime;
};

/**
 * Calcule les statistiques pour une période donnée en filtrant les temps suspects
 */
const calculatePeriodStats = (progressItems, confidenceMap, startDate, endDate) => {
  const itemsInPeriod = progressItems.filter(p => {
    const date = new Date(p.created_at || new Date());
    return date >= startDate && date <= endDate;
  });

  if (itemsInPeriod.length === 0) {
    return {
      totalExercises: 0,
      avgAttempts: 0,
      speedProgress: 0,
      avgConfidenceBefore: 0,
      avgConfidenceAfter: 0
    };
  }

  const totalAttempts = itemsInPeriod.reduce((sum, p) => sum + (p.attempts || 0), 0);
  const avgAttempts = (totalAttempts / itemsInPeriod.length).toFixed(1);

  // Calcul progrès vitesse avec filtrage des temps suspects
  const itemsWithTimes = itemsInPeriod.filter(p => p.first_time_seconds && p.best_time_seconds);
  
  // Collecte tous les temps pour calculer le seuil de validité
  const allTimes = itemsWithTimes.flatMap(p => [p.first_time_seconds, p.best_time_seconds]);
  
  // Filtre les temps valides
  const validItems = itemsWithTimes.filter(p => {
    const firstTimeValid = isValidTime(p.first_time_seconds, allTimes);
    const bestTimeValid = isValidTime(p.best_time_seconds, allTimes);
    return firstTimeValid && bestTimeValid;
  });

  let speedProgress = 0;
  if (validItems.length > 0) {
    speedProgress = validItems.reduce((sum, p) => {
      const improvement = ((p.first_time_seconds - p.best_time_seconds) / p.first_time_seconds) * 100;
      return sum + improvement;
    }, 0) / validItems.length;
  }

  // Moyenne confiance
  const confidencesInPeriod = itemsInPeriod.map(p => confidenceMap.get(p.id)).filter(Boolean);
  const avgConfidenceBefore = confidencesInPeriod.length > 0
    ? (confidencesInPeriod.reduce((sum, c) => sum + (c.confidence_before || 0), 0) / confidencesInPeriod.length).toFixed(1)
    : 0;
  const avgConfidenceAfter = confidencesInPeriod.length > 0
    ? (confidencesInPeriod.reduce((sum, c) => sum + (c.confidence_after || 0), 0) / confidencesInPeriod.length).toFixed(1)
    : 0;

  return {
    totalExercises: itemsInPeriod.length,
    avgAttempts,
    speedProgress: speedProgress.toFixed(1),
    avgConfidenceBefore,
    avgConfidenceAfter
  };
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
    const [confidenceData, setConfidenceData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('last-week');
    const [questionnaireAttempts, setQuestionnaireAttempts] = useState([]);
    const { fetchConfidenceHistory, recordConfidenceAfter } = useConfidence();

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
            let confidenceHistory = [];
            let questionnaireData = [];
            setAllTasks(tasks || []);
            try {
                progressData = await fetchUserProgressDetails(currentUser.id);
                confidenceHistory = await fetchConfidenceHistory(currentUser.id);
                
                // Récupérer les tentatives de questionnaires
                const { data: qcmAttempts, error: qcmError } = await supabase
                    .from('questionnaire_attempts')
                    .select('*')
                    .eq('learner_id', currentUser.id)
                    .eq('status', 'completed')
                    .order('attempted_at', { ascending: false });
                
                if (!qcmError && qcmAttempts) {
                    questionnaireData = qcmAttempts;
                    console.log('QCM attempts loaded:', qcmAttempts);
                }
                
                setProgressError(false);
            } catch (error) {
                console.error('Error fetching progress:', error);
                setProgressError(true);
                progressData = [];
                confidenceHistory = [];
                questionnaireData = [];
            }
            
            // Crée une map pour retrouver la progression par version
            const progressMap = new Map();
            (progressData || []).forEach(p => {
                progressMap.set(`${p.task_id}-${p.version_id}`, p);
            });
            
            // Crée une map pour retrouver la confiance par version
            const confidenceMap = new Map();
            (confidenceHistory || []).forEach(c => {
                confidenceMap.set(`${c.versionId}`, c);
            });
            
            // Séparer exercices et questionnaires
            const exerciseProgress = [];
            const qcmProgress = [];
            
            tasks.forEach(task => {
                // Si c'est un questionnaire
                if (task.task_type === 'questionnaire') {
                    // Récupérer toutes les tentatives pour ce questionnaire
                    const attempts = questionnaireData.filter(qa => qa.questionnaire_id === task.id);
                    
                    if (attempts.length > 0) {
                        // Trier par date (plus récent d'abord)
                        const sortedAttempts = [...attempts].sort((a, b) => 
                            new Date(b.attempted_at) - new Date(a.attempted_at)
                        );
                        
                        // Calculer les métriques
                        const firstAttempt = sortedAttempts[sortedAttempts.length - 1]; // Plus ancienne
                        const bestAttempt = sortedAttempts.reduce((best, current) => 
                            current.percentage > best.percentage ? current : best
                        , sortedAttempts[0]);
                        
                        qcmProgress.push({
                            id: task.id,
                            task_title: task.title,
                            totalAttempts: attempts.length,
                            firstAttemptScore: firstAttempt.percentage,
                            bestScore: bestAttempt.percentage,
                            lastAttemptDate: sortedAttempts[0].attempted_at
                        });
                    }
                } else {
                    // Exercice normal - avec versions
                    (task.versions || []).forEach(version => {
                        const key = `${task.id}-${version.id}`;
                        const p = progressMap.get(key);
                        const c = confidenceMap.get(version.id);
                        
                        exerciseProgress.push({
                            id: key,
                            versionId: version.id,
                            task_title: task.title,
                            version_name: version.name,
                            attempts: p ? p.attempts : 0,
                            first_time_seconds: p ? p.first_time_seconds : null,
                            best_time_seconds: p ? p.best_time_seconds : null,
                            completed_steps_history: p ? p.completed_steps_history : null,
                            created_at: p ? p.created_at : new Date().toISOString(),
                            confidence_before: c?.confidenceBefore || null,
                            confidence_after: c?.confidenceAfter || null
                        });
                    });
                }
            });
            
            setProgress(exerciseProgress);
            setQuestionnaireAttempts(qcmProgress);
            setConfidenceData(confidenceHistory);
            
            if (!progressError) {
                toast({ title: "Progression mise à jour", description: "Vos données de suivi sont à jour." });
            }
        } catch (error) {
            console.error('Error in fetchProgressData:', error);
            setProgressError(true);
            setProgress([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, toast, fetchConfidenceHistory]);

    useEffect(() => {
        fetchProgressData();
    }, [fetchProgressData]);

    useEffect(() => {
        const loadTrainerProfile = async () => {
            setIsLoadingTrainer(true);
            try {
                if (currentUser?.trainer_id) {
                    const trainer = await getUserById(currentUser.trainer_id);
                    setTrainerProfile(trainer);
                }
            } catch (error) {
                console.error('Error loading trainer profile:', error);
            } finally {
                setIsLoadingTrainer(false);
            }
        };
        loadTrainerProfile();
    }, [currentUser?.trainer_id]);

    const handleUnlink = async () => {
        try {
            await unassignTrainerFromLearner(currentUser.id);
            setTrainerProfile(null);
            toast({ title: "Succès", description: "Vous avez été délié du formateur." });
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

    // Calcule les 3 périodes de temps
    const getPeriodDates = () => {
        if (!currentUser?.created_at) return null;
        const userCreated = new Date(currentUser.created_at);
        const today = new Date();
        
        return {
            period1: {
                label: 'Ma première semaine',
                startDate: userCreated,
                endDate: new Date(userCreated.getTime() + 7 * 24 * 60 * 60 * 1000)
            },
            period2: {
                label: 'Mon premier mois',
                startDate: userCreated,
                endDate: new Date(userCreated.getTime() + 30 * 24 * 60 * 60 * 1000)
            },
            period3: {
                label: 'Ma dernière semaine',
                startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
                endDate: today
            }
        };
    };

    // Gestionnaire pour modifier la confiance après
    const handleConfidenceAfterChange = async (versionId, newValue) => {
        try {
            await recordConfidenceAfter(currentUser.id, versionId, newValue);
            // Réactualise les données
            await fetchProgressData();
            toast({ title: "Confiance mise à jour", description: "Votre confiance a été enregistrée." });
        } catch (error) {
            console.error('Error updating confidence:', error);
            toast({ title: "Erreur", description: "Impossible de mettre à jour la confiance.", variant: "destructive" });
        }
    };

    const periodDates = getPeriodDates();

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

            {/* Cartes de récapitulatif par période */}
            {!isLoading && progress && progress.length > 0 && periodDates && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[periodDates.period1, periodDates.period2, periodDates.period3].map((period, idx) => {
                        const stats = calculatePeriodStats(progress, new Map(), period.startDate, period.endDate);
                        return (
                            <Card key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-blue-900">{period.label}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-700">Exercices réalisés</span>
                                        <span className="font-bold text-blue-900">{stats.totalExercises}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-700">Moyenne tentatives</span>
                                        <span className="font-bold text-blue-900">{parseFloat(stats.avgAttempts).toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-blue-700">Progression vitesse</span>
                                        <span className="font-bold text-green-600">+{parseFloat(stats.speedProgress).toFixed(1)}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Section Exercices */}
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl flex items-center">
                        <Zap className="mr-2 h-5 w-5 text-primary" />
                        Détail de vos exercices
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchProgressData} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Rafraîchir
                    </Button>
                </CardHeader>
                <CardContent>
                    {progressError && (
                        <div className="text-red-600 mb-2">Erreur : Impossible de charger la progression. Les tâches sont affichées sans suivi.</div>
                    )}
                    <ScrollArea className="h-[600px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tâche / Version</TableHead>
                                    <TableHead className="text-center">Tentatives</TableHead>
                                    <TableHead className="text-center">Progression vitesse</TableHead>
                                    <TableHead className="text-center">Confiance Avant</TableHead>
                                    <TableHead className="text-center">Confiance Après</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && progress === null ? (
                                    <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                                ) : progress && progress.length > 0 ? (
                                    progress.map((p, idx) => {
                                        // Valide les temps avant de calculer la progression
                                        const isValidFirstTime = isValidTime(p.first_time_seconds, progress.flatMap(item => [item.first_time_seconds, item.best_time_seconds]).filter(Boolean));
                                        const isValidBestTime = isValidTime(p.best_time_seconds, progress.flatMap(item => [item.first_time_seconds, item.best_time_seconds]).filter(Boolean));
                                        
                                        const speedProgress = (isValidFirstTime && isValidBestTime && p.first_time_seconds && p.best_time_seconds)
                                            ? ((p.first_time_seconds - p.best_time_seconds) / p.first_time_seconds * 100)
                                            : 0;
                                        
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <p className="font-medium">{p.task_title}</p>
                                                    <p className="text-sm text-muted-foreground">{p.version_name}</p>
                                                </TableCell>
                                                <TableCell className="text-center">{p.attempts}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`font-semibold ${speedProgress > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {speedProgress > 0 ? '+' : ''}{speedProgress.toFixed(1)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <ConfidenceSelector
                                                        value={p.confidence_before}
                                                        editable={false}
                                                        size="sm"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <ConfidenceSelector
                                                        value={p.confidence_after}
                                                        onChange={(value) => handleConfidenceAfterChange(p.versionId, value)}
                                                        editable={true}
                                                        size="sm"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune tâche disponible ou progression.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Section QCM */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        <HelpCircle className="mr-2 h-5 w-5 text-blue-600" />
                        Détail de vos QCM
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {progressError && (
                        <div className="text-red-600 mb-2">Erreur : Impossible de charger les QCM.</div>
                    )}
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-blue-50">
                                    <TableHead>QCM / Version</TableHead>
                                    <TableHead className="text-center">Nombre de tentatives</TableHead>
                                    <TableHead className="text-center">Taux bonne réponse 1ère fois</TableHead>
                                    <TableHead className="text-center">Meilleur taux bonne réponse</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && questionnaireAttempts.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                                ) : questionnaireAttempts.length > 0 ? (
                                    questionnaireAttempts.map((qcm, idx) => (
                                        <TableRow key={idx} className="hover:bg-blue-50/50">
                                            <TableCell>
                                                <p className="font-medium text-blue-900">{qcm.task_title}</p>
                                                <p className="text-sm text-muted-foreground">{qcm.version_name}</p>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">{qcm.totalAttempts}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-semibold px-3 py-1 rounded-full ${
                                                    qcm.firstAttemptScore >= 80 ? 'bg-green-100 text-green-700' :
                                                    qcm.firstAttemptScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {qcm.firstAttemptScore}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-semibold px-3 py-1 rounded-full ${
                                                    qcm.bestScore >= 80 ? 'bg-green-100 text-green-700' :
                                                    qcm.bestScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {qcm.bestScore}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Aucun QCM complété pour le moment.</TableCell></TableRow>
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

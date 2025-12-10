import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrainerLearnersProgressReport({ trainerId, learners }) {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExercisesCompleted: 0,
    averageCompletionRate: 0,
    totalLearningTime: 0,
    mostActiveLearner: null,
    totalQCMCompleted: 0,
    averageQCMScore: 0,
  });

  useEffect(() => {
    loadProgressData();
  }, [trainerId, learners]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Si learners n'est pas fourni, charger depuis la BD
      let learnerIds = [];
      if (learners && learners.length > 0) {
        learnerIds = learners.map(l => l.id);
      } else if (trainerId) {
        // Charger les apprenants du formateur
        const { data: learnersData } = await supabase
          .from('profiles')
          .select('id, first_name, email')
          .eq('assigned_trainer_id', trainerId)
          .eq('role', 'apprenant');
        learnerIds = learnersData?.map(l => l.id) || [];
      }
      
      if (learnerIds.length === 0) {
        setProgressData([]);
        setStats({
          totalExercisesCompleted: 0,
          averageCompletionRate: 0,
          totalLearningTime: 0,
          mostActiveLearner: null,
        });
        setLoading(false);
        return;
      }

      // Récupérer la progression pour chaque apprenant
      const { data: progressList, error } = await supabase
        .from('user_version_progress')
        .select('user_id, version_id, first_time_seconds, best_time_seconds, attempts, last_attempted_at')
        .in('user_id', learnerIds)
        .order('last_attempted_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération de la progression:', error);
        throw error;
      }

      // Récupérer les apprenants si non fourni
      let learnersToUse = learners || [];
      if (!learners || learners.length === 0) {
        const { data: learnersData } = await supabase
          .from('profiles')
          .select('id, first_name, email')
          .eq('assigned_trainer_id', trainerId)
          .eq('role', 'apprenant');
        learnersToUse = learnersData || [];
      }

      // Récupérer les versions pour avoir le nombre total
      const { data: versions, error: versionsError } = await supabase
        .from('versions')
        .select('id, name, task_id');

      if (versionsError) {
        console.error('Erreur lors de la récupération des versions:', versionsError);
        throw versionsError;
      }

      const totalVersions = versions?.length || 0;

      // Organiser les données par apprenant
      const dataByLearner = {};
      learnersToUse.forEach(learner => {
        dataByLearner[learner.id] = {
          id: learner.id,
          name: learner.first_name || 'Apprenant',
          email: learner.email,
          completedExercises: 0,
          attempts: 0,
          totalTime: 0,
          lastActivity: null,
          completionRate: 0,
          qcmAttempts: 0,
          qcmBestScore: 0,
          qcmAverageScore: 0,
        };
      });

      // Remplir les données d'exercices
      progressList?.forEach(progress => {
        if (dataByLearner[progress.user_id]) {
          dataByLearner[progress.user_id].completedExercises += 1;
          dataByLearner[progress.user_id].attempts += progress.attempts || 1;
          dataByLearner[progress.user_id].totalTime += (progress.best_time_seconds || 0);
          
          const lastActivity = new Date(progress.last_attempted_at);
          if (!dataByLearner[progress.user_id].lastActivity || 
              lastActivity > new Date(dataByLearner[progress.user_id].lastActivity)) {
            dataByLearner[progress.user_id].lastActivity = progress.last_attempted_at;
          }
        }
      });

      // Récupérer les données QCM
      const { data: qcmList, error: qcmError } = await supabase
        .from('questionnaire_responses')
        .select('learner_id, score, max_score, percentage, best_percentage, attempted_at')
        .in('learner_id', learnerIds);

      if (!qcmError && qcmList) {
        // Traiter les données QCM
        qcmList.forEach(qcm => {
          if (dataByLearner[qcm.learner_id]) {
            dataByLearner[qcm.learner_id].qcmAttempts += 1;
            const percentage = qcm.best_percentage || qcm.percentage || 0;
            dataByLearner[qcm.learner_id].qcmBestScore = Math.max(
              dataByLearner[qcm.learner_id].qcmBestScore,
              percentage
            );
            dataByLearner[qcm.learner_id].qcmAverageScore += (percentage || 0);
            
            const qcmActivity = new Date(qcm.attempted_at);
            if (!dataByLearner[qcm.learner_id].lastActivity || 
                qcmActivity > new Date(dataByLearner[qcm.learner_id].lastActivity)) {
              dataByLearner[qcm.learner_id].lastActivity = qcm.attempted_at;
            }
          }
        });

        // Calculer la moyenne des QCM
        Object.keys(dataByLearner).forEach(learnerId => {
          if (dataByLearner[learnerId].qcmAttempts > 0) {
            dataByLearner[learnerId].qcmAverageScore = Math.round(
              dataByLearner[learnerId].qcmAverageScore / dataByLearner[learnerId].qcmAttempts
            );
          }
        });
      }

      // Calculer les taux de complétion
      const progressArray = Object.values(dataByLearner).map(learner => ({
        ...learner,
        completionRate: totalVersions > 0 ? Math.round((learner.completedExercises / totalVersions) * 100) : 0,
      }));

      // Calculer les stats globales
      const totalCompleted = progressArray.reduce((sum, l) => sum + l.completedExercises, 0);
      const averageRate = progressArray.length > 0 
        ? Math.round(progressArray.reduce((sum, l) => sum + l.completionRate, 0) / progressArray.length)
        : 0;
      const totalTime = progressArray.reduce((sum, l) => sum + l.totalTime, 0);
      const mostActive = progressArray.reduce((max, l) => 
        l.completedExercises > (max?.completedExercises || 0) ? l : max, null);

      const totalQCM = progressArray.reduce((sum, l) => sum + l.qcmAttempts, 0);
      const averageQCMScore = progressArray.length > 0 && totalQCM > 0
        ? Math.round(progressArray.reduce((sum, l) => sum + l.qcmAverageScore, 0) / progressArray.filter(l => l.qcmAttempts > 0).length)
        : 0;

      setProgressData(progressArray);
      setStats({
        totalExercisesCompleted: totalCompleted,
        averageCompletionRate: averageRate,
        totalLearningTime: totalTime,
        mostActiveLearner: mostActive,
        totalQCMCompleted: totalQCM,
        averageQCMScore: averageQCMScore,
      });
    } catch (error) {
      console.error('Erreur lors du chargement du suivi:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getProgressColor = (rate) => {
    if (rate >= 75) return 'bg-green-100 text-green-700';
    if (rate >= 50) return 'bg-blue-100 text-blue-700';
    if (rate >= 25) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Total Exercices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalExercisesCompleted}</div>
            <p className="text-xs text-gray-500 mt-1">Par tous les apprenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Taux Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.averageCompletionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Complétion moyenne</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Temps Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatTime(stats.totalLearningTime)}</div>
            <p className="text-xs text-gray-500 mt-1">Apprentissage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              Plus Actif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 truncate">
              {stats.mostActiveLearner?.name || '-'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.mostActiveLearner ? `${stats.mostActiveLearner.completedExercises} exercices` : 'Aucune donnée'}
            </p>
          </CardContent>
        </Card>

        {/* QCM Stats */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
              📝 Total QCM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{stats.totalQCMCompleted}</div>
            <p className="text-xs text-indigo-700 mt-1">QCM tentés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-violet-700 flex items-center gap-2">
              ✓ Score Moyen QCM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-900">{stats.averageQCMScore}%</div>
            <p className="text-xs text-violet-700 mt-1">Score moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rapport Détaillé par Apprenant</CardTitle>
              <CardDescription>Suivi de la progression de chaque apprenant</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadProgressData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement des données...</div>
          ) : progressData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun apprenant n'a encore commencé les exercices
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left font-semibold text-gray-700 p-3">Apprenant</th>
                    <th className="text-center font-semibold text-gray-700 p-3">Exercices</th>
                    <th className="text-center font-semibold text-gray-700 p-3">Taux</th>
                    <th className="text-center font-semibold text-gray-700 p-3">Tentatives</th>
                    <th className="text-center font-semibold text-gray-700 p-3">Temps</th>
                    <th className="text-center font-semibold text-gray-700 p-3">Dernière Activité</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.map((learner, index) => (
                    <tr key={learner.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-gray-900">{learner.name}</p>
                          <p className="text-xs text-gray-500">{learner.email || 'Pas d\'email'}</p>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-semibold text-gray-900">{learner.completedExercises}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getProgressColor(learner.completionRate)}`}>
                          {learner.completionRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-700">
                        {learner.attempts}
                      </td>
                      <td className="p-3 text-center text-gray-700">
                        {formatTime(learner.totalTime)}
                      </td>
                      <td className="p-3 text-center text-gray-600 text-xs">
                        {formatDate(learner.lastActivity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

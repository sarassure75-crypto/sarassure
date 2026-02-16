import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function TrainerExercisesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadExercises();
    }
  }, [currentUser]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('contributor_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice?')) {
      try {
        const { error } = await supabase.from('contributions').delete().eq('id', id);

        if (error) throw error;
        setExercises(exercises.filter((e) => e.id !== id));
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-primary" />
              Mes Exercices
            </h1>
            <p className="text-gray-600 mt-1">Gérez vos exercices créés</p>
          </div>
          <Button
            onClick={() => navigate('/formateur/creer-exercice')}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            Créer un exercice
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : exercises.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun exercice créé</h3>
              <p className="text-gray-600 mb-6">Commencez par créer votre premier exercice</p>
              <Button
                onClick={() => navigate('/formateur/creer-exercice')}
                className="bg-primary hover:bg-primary/90"
              >
                Créer un exercice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exercise.exercise_name}
                      </h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {exercise.exercise_description}
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            exercise.status
                          )}`}
                        >
                          {exercise.status === 'pending' && 'En attente'}
                          {exercise.status === 'approved' && 'Approuvé'}
                          {exercise.status === 'rejected' && 'Rejeté'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Niveau: {exercise.difficulty_level || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(exercise.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/formateur/mes-exercices/${exercise.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteExercise(exercise.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { useAdminCounters } from '../hooks/useAdminCounters';
import AdminTabNavigation from '../components/admin/AdminTabNavigation';
import ExerciseStepViewer from '../components/admin/ExerciseStepViewer';
// import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Check, 
  X, 
  Eye,
  Trash2,
  AlertTriangle,
  BookOpen,
  Home
} from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AdminExerciseValidation() {
  const { currentUser } = useAuth();
  const { counters } = useAdminCounters();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [validatingId, setValidatingId] = useState(null);

  // Charger les contributions en attente
  useEffect(() => {
    loadPendingContributions();
  }, []);

  const loadPendingContributions = async () => {
    setLoading(true);
    try {
      // Requête les versions en attente de validation avec les étapes et images
      const { data, error } = await supabase
        .from('versions')
        .select(`
          *,
          task:task_id (
            id,
            title,
            description,
            category,
            owner_id,
            created_at
          ),
          steps (
            id,
            instruction,
            action_type,
            app_image_id,
            target_area,
            text_input_area,
            start_area,
            step_order,
            app_images:app_image_id (
              id,
              file_path,
              name
            )
          )
        `)
        .eq('creation_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Récupérer les infos des contributeurs (propriétaires des tasks)
      const ownerIds = [...new Set(data?.map(v => v.task?.owner_id).filter(Boolean))] || [];
      
      let profiles = {};
      if (ownerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role')
          .in('id', ownerIds);
        
        if (profilesData) {
          profilesData.forEach(p => {
            profiles[p.id] = p;
          });
        }
      }
      
      // Mapper les données et enrichir les étapes avec les URLs des images
      const mappedData = data?.map(version => {
        const ownerProfile = profiles[version.task?.owner_id] || {};
        
        // Mapper les étapes avec les URLs des images
        const stepsWithImages = version.steps?.map(step => {
          let imageUrl = null;
          // app_images peut être un objet ou un tableau selon la requête JOIN
          const appImage = Array.isArray(step.app_images) ? step.app_images[0] : step.app_images;
          const imagePath = appImage?.file_path;
          
          console.log('Processing step:', {
            stepId: step.id,
            instruction: step.instruction,
            app_images: step.app_images,
            appImage: appImage,
            imagePath: imagePath
          });
          
          if (imagePath) {
            // Générer l'URL publique Supabase pour l'image depuis le bucket 'images'
            const { data: urlData } = supabase.storage
              .from('images')
              .getPublicUrl(imagePath);
            imageUrl = urlData?.publicUrl || null;
            console.log('Generated URL for path:', imagePath, '→', imageUrl);
          }
          
          return {
            ...step,
            image_url: imageUrl,
            image_path: imagePath,
            app_image: appImage
          };
        }) || [];
        
        return {
          id: version.id,
          version_id: version.id,
          task_id: version.task_id,
          exercise_name: version.task?.title || 'Exercice sans titre',
          exercise_description: version.task?.description || 'Aucune description',
          name: version.name,
          difficulty_level: version.task?.creation_status?.difficulty || 'Non spécifiée',
          status: 'pending',
          steps: stepsWithImages,
          images: [],
          contributor: {
            id: version.task?.owner_id,
            first_name: ownerProfile.first_name || 'Utilisateur',
            last_name: ownerProfile.last_name || 'Anonyme',
            email: ownerProfile.email || 'N/A',
            role: ownerProfile.role || 'contributor'
          },
          created_at: version.created_at,
          task: version.task,
          version: version
        };
      }) || [];
      
      setContributions(mappedData);
      if (mappedData.length > 0) {
        setSelectedContribution(mappedData[0]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveContribution = async (contributionId) => {
    setValidatingId(contributionId);
    try {
      // Mettre à jour le statut de la version
      const { error } = await supabase
        .from('versions')
        .update({ 
          creation_status: 'validated'
        })
        .eq('id', contributionId);

      if (error) throw error;

      // Retirer de la liste
      setContributions(contributions.filter(c => c.id !== contributionId));
      
      if (contributions.length > 1) {
        setSelectedContribution(contributions.find(c => c.id !== contributionId));
      } else {
        setSelectedContribution(null);
      }

      alert('✅ Contribution approuvée!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setValidatingId(null);
    }
  };

  const rejectContribution = async (contributionId) => {
    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    setValidatingId(contributionId);
    try {
      const { error } = await supabase
        .from('versions')
        .update({ 
          creation_status: 'rejected'
        })
        .eq('id', contributionId);

      if (error) throw error;

      // Retirer de la liste
      setContributions(contributions.filter(c => c.id !== contributionId));
      
      if (contributions.length > 1) {
        setSelectedContribution(contributions.find(c => c.id !== contributionId));
      } else {
        setSelectedContribution(null);
      }

      alert('✅ Contribution rejetée');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setValidatingId(null);
    }
  };

  const deleteContribution = async (contributionId) => {
    if (!confirm('Êtes-vous sûr?')) return;

    setValidatingId(contributionId);
    try {
      const { error } = await supabase
        .from('versions')
        .delete()
        .eq('id', contributionId);

      if (error) throw error;

      // Retirer de la liste
      setContributions(contributions.filter(c => c.id !== contributionId));
      
      if (contributions.length > 1) {
        setSelectedContribution(contributions.find(c => c.id !== contributionId));
      } else {
        setSelectedContribution(null);
      }

      alert('✅ Contribution supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setValidatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="flex items-center text-3xl font-semibold leading-none tracking-tight">
              <Home className="mr-3 h-8 w-8 text-primary"/>
              Validation des exercices
            </h3>
            <p className="text-sm text-muted-foreground">
              Validez les exercices soumis par les contributeurs
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <AdminTabNavigation counters={counters} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune contribution à valider</h3>
          <p className="text-gray-600">Toutes les contributions en attente ont été validées!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="flex items-center text-3xl font-semibold leading-none tracking-tight">
            <Home className="mr-3 h-8 w-8 text-primary"/>
            Validation des exercices
          </h3>
          <p className="text-sm text-muted-foreground">
            {contributions.length} contribution(s) en attente de validation
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <AdminTabNavigation counters={counters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Détails grande */}
        {selectedContribution && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedContribution.exercise_name || 'Exercice sans titre'}
                </h2>
                <p className="text-gray-600">
                  {selectedContribution.exercise_description || 'Aucune description'}
                </p>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-6">
                {/* Infos exercice */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <span className="text-sm text-blue-600 font-medium">Difficulté</span>
                    <p className="text-lg font-bold text-blue-900">
                      {selectedContribution.difficulty_level || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <span className="text-sm text-green-600 font-medium">Statut</span>
                    <p className="text-lg font-bold text-green-900 capitalize">
                      {selectedContribution.status}
                    </p>
                  </div>
                </div>

                {/* Étapes avec visualisation */}
                {selectedContribution.steps && Array.isArray(selectedContribution.steps) && selectedContribution.steps.length > 0 && (
                  <div>
                    <ExerciseStepViewer steps={selectedContribution.steps} />
                  </div>
                )}

                {/* Images */}
                {selectedContribution.images && Array.isArray(selectedContribution.images) && selectedContribution.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Images ({selectedContribution.images.length})</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedContribution.images.map((img, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                          {img.url && (
                            <img src={img.url} alt={`Image ${idx + 1}`} className="w-full h-40 object-cover" />
                          )}
                          <div className="p-2">
                            <p className="text-xs text-gray-600">{img.name || `Image ${idx + 1}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contributeur */}
                {selectedContribution.contributor && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm text-indigo-600 font-medium">Soumis par</p>
                    <p className="text-gray-900 font-medium">
                      {selectedContribution.contributor.first_name} {selectedContribution.contributor.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{selectedContribution.contributor.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rôle: <span className="font-medium">{selectedContribution.contributor.role}</span>
                    </p>
                  </div>
                )}

                {/* Date */}
                <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                  <p>Soumis le: {new Date(selectedContribution.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>

                {/* Avertissement */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">À vérifier avant d'approuver:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>La contribution est pertinente</li>
                        <li>Les étapes sont claires</li>
                        <li>Pas de contenu dupliqué</li>
                        <li>Contenu approprié pour l'app</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => approveContribution(selectedContribution.id)}
                    disabled={validatingId === selectedContribution.id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => rejectContribution(selectedContribution.id)}
                    disabled={validatingId === selectedContribution.id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                    <span>Rejeter</span>
                  </button>
                  <button
                    onClick={() => deleteContribution(selectedContribution.id)}
                    disabled={validatingId === selectedContribution.id}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des contributions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                En attente ({contributions.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {contributions.map((contribution) => (
                <button
                  key={contribution.id}
                  onClick={() => setSelectedContribution(contribution)}
                  className={`w-full p-3 text-left border-b transition-colors ${
                    selectedContribution?.id === contribution.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {contribution.exercise_name || 'Sans titre'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {contribution.contributor?.first_name} {contribution.contributor?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(contribution.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

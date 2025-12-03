import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useAdminCounters } from '../../hooks/useAdminCounters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Eye,
  Trash2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminQuestionnaireValidation() {
  const { currentUser } = useAuth();
  const { counters } = useAdminCounters();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [validatingId, setValidatingId] = useState(null);
  const [adminComments, setAdminComments] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  useEffect(() => {
    loadPendingQuestionnaires();
  }, []);

  const loadPendingQuestionnaires = async () => {
    setLoading(true);
    try {
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
            step_order,
            expected_input
          )
        `)
        .eq('creation_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrer uniquement les questionnaires (pas les exercices)
      // Pour maintenant, on prend toutes les versions en attente
      const questionnaireVersions = data || [];

      // Récupérer les profils des contributeurs
      const ownerIds = [...new Set(questionnaireVersions.map(v => v.task?.owner_id).filter(Boolean))];
      
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

      // Enrichir les données
      const mappedData = questionnaireVersions.map(version => {
        const ownerProfile = profiles[version.task?.owner_id] || {};
        
        return {
          ...version,
          ownerProfile,
          questionCount: version.steps?.length || 0
        };
      });

      setQuestionnaires(mappedData);
    } catch (error) {
      console.error('Erreur chargement QCM:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (versionId) => {
    setValidatingId(versionId);
    try {
      const { error } = await supabase
        .from('versions')
        .update({ creation_status: 'approved' })
        .eq('id', versionId);

      if (error) throw error;

      setQuestionnaires(questionnaires.filter(q => q.id !== versionId));
      
      // Ajouter des points au contributeur
      const version = questionnaires.find(q => q.id === versionId);
      if (version?.task?.owner_id) {
        await supabase
          .from('contributor_points')
          .insert([{
            user_id: version.task.owner_id,
            points: 5,
            reason: 'Questionnaire approuvé',
            task_id: version.task.id
          }]);
      }

      alert('QCM approuvé et 5 points attribués!');
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setValidatingId(null);
    }
  };

  const handleReject = async (versionId) => {
    if (!adminComments.trim()) {
      alert('Veuillez ajouter des commentaires pour justifier le rejet');
      return;
    }

    setValidatingId(versionId);
    try {
      const version = questionnaires.find(q => q.id === versionId);
      
      const { error } = await supabase
        .from('versions')
        .update({ 
          creation_status: 'rejected',
          admin_comments: adminComments
        })
        .eq('id', versionId);

      if (error) throw error;

      setQuestionnaires(questionnaires.filter(q => q.id !== versionId));
      setAdminComments('');
      setShowCommentsModal(false);
      
      alert('QCM rejeté. Commentaires envoyés au contributeur.');
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setValidatingId(null);
    }
  };

  const handleDelete = async (versionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce QCM?')) return;

    try {
      // Supprimer les steps
      await supabase
        .from('steps')
        .delete()
        .eq('version_id', versionId);

      // Supprimer la version
      const { error } = await supabase
        .from('versions')
        .delete()
        .eq('id', versionId);

      if (error) throw error;

      setQuestionnaires(questionnaires.filter(q => q.id !== versionId));
      alert('QCM supprimé');
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const renderQuestion = (step, idx) => {
    return (
      <div key={step.id} className="border rounded-lg p-4 mb-3 bg-gray-50">
        <h4 className="font-semibold text-sm mb-2">Question {idx + 1}: {step.instruction}</h4>
        <p className="text-xs text-gray-600">{step.expected_input}</p>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des QCM en attente...</div>;
  }

  if (questionnaires.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <HelpCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucun QCM en attente de validation</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedQuestionnaire) {
    return (
      <div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedQuestionnaire(null)}
          className="mb-4"
        >
          ← Retour à la liste
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{selectedQuestionnaire.task.title}</CardTitle>
            <CardDescription>
              {selectedQuestionnaire.task.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Infos contributeur */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">
                Contributeur: {selectedQuestionnaire.ownerProfile?.first_name} {selectedQuestionnaire.ownerProfile?.last_name}
              </p>
              <p className="text-xs text-blue-700">{selectedQuestionnaire.ownerProfile?.email}</p>
            </div>

            {/* Infos questionnaire */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Catégorie</p>
                <p className="font-semibold">{selectedQuestionnaire.task.category}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Nombre de questions</p>
                <p className="font-semibold">{selectedQuestionnaire.questionCount}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Date</p>
                <p className="font-semibold text-sm">
                  {new Date(selectedQuestionnaire.task.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Questions */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4">Questions du QCM</h3>
              {selectedQuestionnaire.steps?.map((step, idx) => renderQuestion(step, idx))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => handleApprove(selectedQuestionnaire.id)}
                disabled={validatingId === selectedQuestionnaire.id}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approuver
              </Button>
              <Button
                onClick={() => setShowCommentsModal(true)}
                variant="outline"
                disabled={validatingId === selectedQuestionnaire.id}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Rejeter
              </Button>
              <Button
                onClick={() => handleDelete(selectedQuestionnaire.id)}
                variant="destructive"
                disabled={validatingId === selectedQuestionnaire.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal Commentaires */}
        {showCommentsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Raison du rejet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  placeholder="Expliquez pourquoi ce QCM est rejeté..."
                  className="w-full p-2 border rounded-lg min-h-32 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleReject(selectedQuestionnaire.id)}
                    variant="destructive"
                    disabled={validatingId === selectedQuestionnaire.id}
                    className="flex-1"
                  >
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCommentsModal(false);
                      setAdminComments('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {questionnaires.map(questionnaire => (
          <Card key={questionnaire.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{questionnaire.task.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{questionnaire.task.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>📁 {questionnaire.task.category}</span>
                    <span>❓ {questionnaire.questionCount} questions</span>
                    <span>👤 {questionnaire.ownerProfile?.first_name} {questionnaire.ownerProfile?.last_name}</span>
                    <span>📅 {new Date(questionnaire.task.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setSelectedQuestionnaire(questionnaire)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir
                  </Button>
                  <Button
                    onClick={() => handleApprove(questionnaire.id)}
                    disabled={validatingId === questionnaire.id}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedQuestionnaire(questionnaire);
                      setShowCommentsModal(true);
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

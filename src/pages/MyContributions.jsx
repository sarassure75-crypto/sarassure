import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContributionActions, useContributorStats } from "../hooks/useContributions";
import { useAuth } from "../contexts/AuthContext";
import { useContributorRevenue } from "../hooks/useContributorRevenue";
import { createClient } from "@supabase/supabase-js";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function MyContributions() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { deleteContribution } = useContributionActions();
  const { revenue } = useContributorRevenue(currentUser?.id);
  const { stats: contributorStats, loading: statsLoading } = useContributorStats(currentUser?.id);

  // Load exercises and images directly
  const [exercises, setExercises] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Default to 'all'
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Load data from actual tables
  useEffect(() => {
    loadContributions();
  }, [currentUser?.id]);

  const loadContributions = async () => {
    try {
      setLoading(true);

      // Fetch exercises (tasks) with their versions
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          owner_id,
          creation_status,
          created_at,
          updated_at,
          versions (
            id,
            creation_status,
            name,
            created_at,
            updated_at,
            admin_comments,
            reviewer_id,
            reviewed_at,
            modification_count
          )
        `)
        .eq('owner_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Transform tasks into individual versions (flatten)
      const allVersions = [];
      if (tasksData) {
        tasksData.forEach(task => {
          if (task.versions && task.versions.length > 0) {
            // For each version, create a contribution entry
            task.versions.forEach(version => {
              allVersions.push({
                id: version.id,
                taskId: task.id,
                title: task.title,
                versionName: version.name,
                description: task.description,
                status: version.creation_status,
                created_at: version.created_at,
                updated_at: version.updated_at || version.created_at,
                admin_comments: version.admin_comments,
                reviewer_id: version.reviewer_id,
                reviewed_at: version.reviewed_at,
                modification_count: version.modification_count,
                type: 'version'
              });
            });
          } else {
            // Task without versions (draft)
            allVersions.push({
              id: task.id,
              taskId: task.id,
              title: task.title,
              versionName: null,
              description: task.description,
              status: 'draft',
              created_at: task.created_at,
              updated_at: task.updated_at || task.created_at,
              type: 'draft'
            });
          }
        });
      }

      // Fetch images from images_metadata table
      const { data: imagesData, error: imagesError } = await supabase
        .from('images_metadata')
        .select('id,title,moderation_status,uploaded_by,created_at,updated_at')
        .eq('uploaded_by', currentUser?.id)
        .order('created_at', { ascending: false });

      if (imagesError) throw imagesError;

      setExercises(allVersions || []);
      setImages(imagesData || []);
      
      // Debug logs
      console.log('Tasks loaded:', tasksData?.length || 0);
      console.log('All versions:', allVersions?.length || 0);
      console.log('Images loaded:', imagesData?.length || 0);
      console.log('Sample version:', allVersions?.[0]);
      console.log('Sample image:', imagesData?.[0]);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine exercises (versions) and images with type
  const allContributions = [
    ...(exercises || []).map(ex => ({
      ...ex,
      type: ex.type, // 'version' or 'draft'
      status: ex.status || 'draft',
      displayTitle: ex.versionName 
        ? `${ex.title} - ${ex.versionName}` 
        : ex.title,
      date: ex.updated_at || ex.created_at
    })),
    ...(images || []).map(img => ({
      ...img,
      type: 'image',
      status: img.moderation_status || 'pending',
      displayTitle: img.title || `Image ${img.id?.slice(0, 8)}`,
      date: img.updated_at || img.created_at
    }))
  ];

  // Debug: Log combined contributions
  console.log('All contributions combined:', allContributions.length);
  console.log('Sample contribution:', allContributions[0]);

  // Statistiques - Use the hook data for accurate counts
  const stats = {
    // Exercices
    exercisesTotal: contributorStats?.exercises?.total || 0,
    exercisesApproved: contributorStats?.exercises?.approved || 0,
    exercisesPending: contributorStats?.exercises?.pending || 0,
    exercisesRejected: contributorStats?.exercises?.rejected || 0,
    // Images
    imagesTotal: contributorStats?.images?.total || 0,
    imagesApproved: contributorStats?.images?.approved || 0,
    imagesPending: contributorStats?.images?.pending || 0,
    imagesRejected: contributorStats?.images?.rejected || 0,
    // Total contributions (all types)
    totalContributions: (contributorStats?.exercises?.total || 0) + (contributorStats?.images?.total || 0),
  };

  // Filtrage et tri
  const filteredContributions = allContributions
    ?.filter(contrib => {
      // Filtre recherche
      if (searchTerm && !contrib.displayTitle?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtre statut
      if (statusFilter !== 'all') {
        // Map filter values to actual status values
        if (statusFilter === 'approved' && contrib.status !== 'validated' && contrib.status !== 'approved') {
          return false;
        } else if (statusFilter === 'draft' && contrib.status !== 'draft') {
          return false;
        } else if (statusFilter === 'pending' && contrib.status !== 'pending') {
          return false;
        } else if (statusFilter === 'rejected' && contrib.status !== 'rejected') {
          return false;
        } else if (statusFilter === 'needs_changes' && contrib.status !== 'needs_changes') {
          return false;
        }
      }

      // Filtre type
      if (typeFilter !== 'all' && contrib.type !== typeFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'title':
          return (a.displayTitle || '').localeCompare(b.displayTitle || '');
        default:
          return 0;
      }
    });

  // Debug: Log filtered results
  console.log('Filtered contributions:', filteredContributions?.length || 0);
  console.log('Status filter:', statusFilter);
  console.log('Search term:', searchTerm);

  // Actions
  const handleDelete = async (contrib) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette contribution ?')) {
      try {
        // Déterminer le type de contribution et l'ID approprié
        let contributionId = contrib.id;
        let contributionType = contrib.type;

        // Pour les versions, utiliser l'ID de la version
        // Pour les drafts, utiliser l'ID de la task
        // Pour les images, utiliser l'ID de l'image
        
        const result = await deleteContribution(
          contributionId, 
          contributionType, 
          contributionType === 'image' ? currentUser?.id : null
        );
        
        if (result.success) {
          // Recharger la liste
          loadContributions();
        } else {
          alert('Erreur lors de la suppression: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting contribution:', error);
        alert('Erreur lors de la suppression: ' + error.message);
      }
    }
  };

  const handleEdit = (contrib) => {
    if (contrib.status === 'needs_changes') {
      // Version à corriger - rediriger vers le formulaire de correction
      navigate(`/contributeur/nouvelle-contribution?correction=${contrib.id}`);
    } else {
      // Édition normale - utiliser l'ID de la tâche
      const taskId = contrib.taskId || contrib.id;
      navigate(`/contributeur/nouvelle-contribution?edit=${taskId}`);
    }
  };

  // Status badge
  const getStatusBadge = (status, type) => {
    let badges = {
      validated: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approuvée' },
      approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approuvée' },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'En attente' },
      needs_changes: { color: 'bg-orange-100 text-orange-700', icon: Edit, label: 'À corriger' },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejetée' },
      draft: { color: 'bg-gray-100 text-gray-700', icon: Edit, label: 'Brouillon' },
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        <span>{badge.label}</span>
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Contributions</h1>
        <p className="text-gray-600 mt-1">Gérez et suivez l'état de vos contributions</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.exercisesTotal}</div>
          <div className="text-sm text-gray-600">Exercices: nombre de versions</div>
          <div className="text-xs text-gray-500 mt-2">
            ✓ {stats.exercisesApproved} | ⏱ {stats.exercisesPending}
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{stats.imagesTotal}</div>
          <div className="text-sm text-purple-600">Images</div>
          <div className="text-xs text-purple-500 mt-2">
            ✓ {stats.imagesApproved} | ⏱ {stats.imagesPending}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.totalContributions}</div>
          <div className="text-sm text-blue-600">Total contributions</div>
          <div className="text-xs text-blue-500 mt-2">
            ✓ {stats.exercisesApproved + stats.imagesApproved}
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 shadow-sm border border-emerald-200">
          <div className="flex items-center space-x-3">
            <div>
              <div className="text-2xl font-bold text-emerald-700">{stats.exercisesRejected + stats.imagesRejected}</div>
              <div className="text-sm text-emerald-600">Rejetées</div>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre statut */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="pending">En attente</option>
              <option value="needs_changes">À corriger</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="title">Titre A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des contributions */}
      {filteredContributions?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune contribution</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aucun résultat ne correspond à vos critères.'
              : 'Vous n\'avez pas encore créé de contribution.'}
          </p>
          <button
            onClick={() => navigate('/contributeur/nouvelle-contribution')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Créer ma première contribution
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContributions.map((contrib) => (
            <div 
              key={contrib.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {contrib.type === 'image' ? (
                        <ImageIcon className="w-5 h-5 text-purple-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contrib.displayTitle || 'Sans titre'}
                      </h3>
                    </div>
                    {getStatusBadge(contrib.status, contrib.type)}
                  </div>

                  {contrib.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {contrib.description}
                    </p>
                  )}

                  {/* Commentaires admin pour les exercices à corriger */}
                  {contrib.status === 'needs_changes' && contrib.admin_comments && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-orange-800 mb-1">
                            Commentaires de l'admin :
                          </p>
                          <p className="text-sm text-orange-700 whitespace-pre-wrap">
                            {contrib.admin_comments}
                          </p>
                          {contrib.reviewed_at && (
                            <p className="text-xs text-orange-600 mt-2">
                              Révisé le {formatDate(contrib.reviewed_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500 flex-wrap">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(contrib.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                        {contrib.type === 'image' ? 'Image' : contrib.type === 'draft' ? 'Brouillon' : 'Version'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {(contrib.type === 'version' || contrib.type === 'draft') && (
                    <button
                      onClick={() => handleEdit(contrib)}
                      className={`p-2 rounded-lg transition-colors ${
                        contrib.status === 'needs_changes' 
                          ? 'text-orange-600 hover:bg-orange-50' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title={contrib.status === 'needs_changes' ? 'Corriger' : 'Modifier'}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(contrib)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

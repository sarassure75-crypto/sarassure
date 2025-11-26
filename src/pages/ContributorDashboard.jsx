import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useContributorStats } from "../hooks/useContributions";
import { useContributorRevenue } from "../hooks/useContributorRevenue";
import { 
  FileText, 
  Image, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Award,
  Upload,
  Eye,
  DollarSign,
  Trophy
} from 'lucide-react';

export default function ContributorDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { stats, loading, error } = useContributorStats(currentUser?.id);
  const { revenue, loading: revenueLoading } = useContributorRevenue(currentUser?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Erreur lors du chargement des statistiques: {error}
        </div>
      </div>
    );
  }

  const approvalRate = stats?.approval_rate || 0;
  const totalContributions = stats?.total_contributions || 0;
  const approvedContributions = stats?.approved_contributions || 0;
  const pendingContributions = stats?.pending_contributions || 0;
  const rejectedContributions = stats?.rejected_contributions || 0;
  const imagesUploaded = stats?.images_uploaded || 0;
  const imagesApproved = stats?.images_approved || 0;

  // Nouvelles stats séparées
  const exercises = stats?.exercises || { total: 0, approved: 0, pending: 0, rejected: 0 };
  const images = stats?.images || { total: 0, approved: 0, pending: 0, rejected: 0 };
  const global = stats?.global || { total_exercises: 0, total_images: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Espace Contributeur
        </h1>
        <p className="text-gray-600">
          Bienvenue {currentUser?.first_name} ! Créez et partagez des exercices pour enrichir la plateforme.
        </p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/contributeur/nouvelle-contribution')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center space-x-3"
        >
          <FileText className="w-6 h-6" />
          <span className="text-lg font-semibold">Créer un exercice</span>
        </button>

        <button
          onClick={() => navigate('/contributeur/bibliotheque')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center space-x-3"
        >
          <Image className="w-6 h-6" />
          <span className="text-lg font-semibold">Bibliothèque d'images</span>
        </button>

        <button
          onClick={() => navigate('/contributeur/mes-contributions')}
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center space-x-3"
        >
          <Eye className="w-6 h-6" />
          <span className="text-lg font-semibold">Mes contributions</span>
        </button>

        {/* Masqué pour le moment - sera affiché quand les ventes commenceront */}
        {/* <button
          onClick={() => navigate('/contributeur/ventes')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center space-x-3"
        >
          <DollarSign className="w-6 h-6" />
          <span className="text-lg font-semibold">Historique des ventes</span>
        </button> */}
      </div>

      {/* Statistiques principales - Exercices et Images séparés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Exercices (versions) */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Exercices: nombre de versions</h3>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{exercises.total}</p>
          <p className="text-xs text-gray-500 mt-2">
            {exercises.approved} approuvés • {exercises.pending} en attente
          </p>
        </div>

        {/* Total Images */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Images</h3>
            <Image className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{images.total}</p>
          <p className="text-xs text-gray-500 mt-2">
            {images.approved} approuvées • {images.pending} en attente
          </p>
        </div>

        {/* Total Contributions (exercices + images) */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total Contributions</h3>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{exercises.total + images.total}</p>
          <p className="text-xs text-gray-500 mt-2">
            {exercises.approved + images.approved} approuvées
          </p>
        </div>

        {/* Contexte global */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Sur la plateforme</h3>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{global.total_exercises + global.total_images}</p>
          <p className="text-xs text-gray-500 mt-2">
            {global.total_exercises} exercices • {global.total_images} images
          </p>
        </div>
      </div>

      {/* Statistiques images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Images uploadées */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900">Images uploadées</h3>
            <Upload className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex items-end space-x-4">
            <p className="text-4xl font-bold text-purple-900">{imagesUploaded}</p>
            <p className="text-sm text-purple-700 mb-1">
              {imagesApproved} approuvées
            </p>
          </div>
        </div>

        {/* Taux d'acceptation */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900">Taux d'acceptation</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex items-end space-x-2">
            <p className="text-4xl font-bold text-green-900">{approvalRate.toFixed(0)}%</p>
            <p className="text-sm text-green-700 mb-1">
              {totalContributions > 0 ? 'des contributions validées' : 'Aucune contribution encore'}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue & Milestones Section */}
      {!revenueLoading && revenue && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Revenus et Paliers</h2>
          
          {/* Bandeau informatif - Application gratuite */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Information :</span> Pour le moment, l'application est gratuite donc aucun revenu n'est généré. Cette section affichera vos gains une fois que les licences commenceront à être vendues.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Licences vendues */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Licences vendues</h3>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{revenue.total_sales_count}</p>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>📚 Exercices: {revenue.exercise_sales_count}</p>
                <p>🖼️ Images: {revenue.image_sales_count}</p>
              </div>
            </div>

            {/* Revenus totaux */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-6 rounded-lg shadow border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-emerald-900">Revenus générés</h3>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-900">
                €{(revenue.total_revenue_cents / 100).toFixed(2)}
              </p>
              <div className="text-xs text-emerald-600 mt-2 space-y-1">
                <p>📚 €{(revenue.exercise_revenue_cents / 100).toFixed(2)}</p>
                <p>🖼️ €{(revenue.image_revenue_cents / 100).toFixed(2)}</p>
              </div>
            </div>

            {/* Palier actuel */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-lg shadow border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-amber-900">Palier atteint</h3>
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-amber-900">
                Palier {revenue.milestone_count}
              </p>
              <p className="text-xs text-amber-600 mt-2">
                {revenue.milestone_count > 0 ? `${revenue.milestone_count} × €1000` : 'Aucun palier atteint'}
              </p>
            </div>
          </div>

          {/* Reversement acquis et progression */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reversement acquis (commission 20%) */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg shadow border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-900">Reversement acquis (20%)</h3>
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-green-900">
                  €{((revenue.total_revenue_cents * 0.20) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Sur €{(revenue.total_revenue_cents / 100).toFixed(2)} de ventes totales
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  💡 Vous recevez 20% des revenus générés par vos contributions. La plateforme conserve 80% pour la maintenance et l'hébergement.
                </p>
              </div>
            </div>

            {/* Progression vers prochain palier */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg shadow border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">Prochain palier (€1000)</h3>
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mb-4">
                <div className="w-full bg-purple-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-purple-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.min(((revenue.total_revenue_cents % 100000) / 100000) * 100, 100)}%`
                    }}
                  >
                    {((revenue.total_revenue_cents % 100000) / 100000) * 100 > 10 && (
                      <span className="text-xs font-bold text-white">
                        {Math.round(((revenue.total_revenue_cents % 100000) / 100000) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700 font-medium">
                    €{((revenue.total_revenue_cents % 100000) / 100).toFixed(2)}
                  </span>
                  <span className="text-purple-600">
                    Restant: €{(((revenue.milestone_count + 1) * 100000 - revenue.total_revenue_cents) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-purple-600">
                {revenue.milestone_count === 0 
                  ? "🎯 Atteignez €1000 pour débloquer votre premier palier!"
                  : `🚀 Continuez pour atteindre le palier ${revenue.milestone_count + 1}!`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Récompenses (placeholder pour futur système) */}
      {approvedContributions > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg shadow border border-yellow-200">
          <div className="flex items-start space-x-4">
            <Award className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Merci pour vos contributions ! 🎉
              </h3>
              <p className="text-gray-700">
                Vous avez déjà {approvedContributions} {approvedContributions === 1 ? 'contribution approuvée' : 'contributions approuvées'}. 
                Continuez ainsi !
              </p>
              {approvalRate >= 80 && (
                <p className="text-sm text-green-700 mt-2 font-medium">
                  ⭐ Excellent taux d'acceptation ! Vous êtes un contributeur de qualité.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucune contribution */}
      {totalContributions === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Commencez votre première contribution
          </h3>
          <p className="text-blue-800 mb-4">
            Vous n'avez pas encore créé de contribution. C'est le moment de commencer !
          </p>
          <button
            onClick={() => navigate('/contributeur/nouvelle-contribution')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Créer mon premier exercice
          </button>
        </div>
      )}
    </div>
  );
}

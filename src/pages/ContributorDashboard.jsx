import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useContributorStats } from "../hooks/useContributions";
import { useContributorRevenue } from "../hooks/useContributorRevenue";
import { useContributorPoints } from "../hooks/useContributorPoints";
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
  Trophy,
  ClipboardList,
  Zap
} from 'lucide-react';

export default function ContributorDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { stats, loading, error } = useContributorStats(currentUser?.id);
  const { revenue, loading: revenueLoading } = useContributorRevenue(currentUser?.id);
  const { points, loading: pointsLoading } = useContributorPoints(currentUser?.id);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <button
          onClick={() => navigate('/contributeur/liste-demandes')}
          className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl flex items-center justify-center space-x-3"
        >
          <ClipboardList className="w-6 h-6" />
          <span className="text-lg font-semibold">Liste des demandes</span>
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
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Licences vendues</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Plateforme totale</p>
                </div>
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
                <div>
                  <h3 className="text-sm font-medium text-emerald-900">Revenus générés</h3>
                  <p className="text-xs text-emerald-700 mt-0.5">Plateforme totale</p>
                </div>
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
            {/* Reversement acquis (commission 20%) - VOTRE PART PERSONNELLE */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg shadow border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Reversement acquis</h3>
                  <p className="text-xs text-green-700 mt-1">✨ Votre part personnelle (20%)</p>
                </div>
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-green-900">
                  €{((revenue.total_revenue_cents * 0.20) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  💰 VOS revenus personnels générés par vos contributions
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

      {/* POINTS DISPLAY - Contributor and Platform totals */}
      {!pointsLoading && points && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ Vos Points</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contributeur Points */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-100 p-6 rounded-lg shadow border border-violet-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-violet-900">Vos Points</h3>
                  <p className="text-xs text-violet-700 mt-1">Depuis votre création</p>
                </div>
                <Zap className="w-6 h-6 text-violet-600" />
              </div>
              <p className="text-4xl font-bold text-violet-900">
                {points.contributorTotal.toFixed(1)}
              </p>
              <div className="mt-4 bg-violet-100 rounded-lg p-3">
                <p className="text-xs text-violet-800">
                  📈 Vos points augmentent avec chaque image et exercice que vous créez
                </p>
              </div>
            </div>

            {/* Platform Total Points */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-6 rounded-lg shadow border border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900">Total Plateforme</h3>
                  <p className="text-xs text-emerald-700 mt-1">Tous contributeurs réunis</p>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-4xl font-bold text-emerald-900">
                {points.platformTotal.toFixed(1)}
              </p>
              <div className="mt-4 bg-emerald-100 rounded-lg p-3">
                <p className="text-xs text-emerald-800">
                  🌱 La plateforme grandit grâce aux contributions de tous les créateurs
                </p>
                {points.platformTotal > 0 && (
                  <p className="text-xs text-emerald-700 mt-2 font-semibold">
                    Votre part: {((points.contributorTotal / points.platformTotal) * 100).toFixed(2)}% des points
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SYSTÈME DE POINTS - Guide complet */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Système de Points</h2>
        
        {/* Explication générale */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow border border-blue-200 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Comment fonctionnent les points ?</h3>
          <p className="text-blue-800 mb-3">
            Vos points représentent votre contribution à la communauté. Ils sont utilisés pour calculer votre part des revenus générés par la plateforme 
            (20% de la chiffre d'affaires réparti proportionnellement aux points). <strong>Plus vous contribuez, plus vous avez de points, plus vous générez de revenus.</strong>
          </p>
          <p className="text-sm text-blue-700 italic">
            💡 C'est un modèle d'économie solidaire où les revenus sont partagés équitablement selon la contribution de chacun, pas selon les ventes individuelles.
          </p>
        </div>

        {/* Attribution des points */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Attribution des Points</h3>
          
          <div className="space-y-4">
            {/* Images */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900 flex items-center mb-2">
                <Image className="w-5 h-5 mr-2 text-purple-600" /> Images
              </h4>
              <ul className="text-sm text-gray-700 space-y-1 ml-7">
                <li>✅ <strong>1 point</strong> par image validée</li>
                <li className="text-gray-600 italic">Note : Pas de bonus pour la qualité (les images sont compressées au maximum)</li>
              </ul>
            </div>

            {/* Exercices */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 flex items-center mb-2">
                <FileText className="w-5 h-5 mr-2 text-blue-600" /> Exercices
              </h4>
              <ul className="text-sm text-gray-700 space-y-1 ml-7">
                <li>✅ <strong>5 points</strong> de base pour un exercice (pour chaque version)</li>
                <li>✅ <strong>+2 points</strong> si l'exercice a 5 tâches ou plus</li>
                <li>✅ <strong>+3 points</strong> par version additionnelle significative</li>
                <li className="text-gray-600 italic">Note : Pas de bonus d'engagement (les points sont basés sur la création, pas l'utilisation)</li>
              </ul>
            </div>

            {/* Formule totale */}
            <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-4">
              <p className="text-sm font-mono text-gray-800">
                <strong>Exemple :</strong> Exercice avec 6 tâches + 2 variantes = 5 + 2 + (3 × 2) = <span className="text-blue-700 font-bold">13 points</span>
              </p>
            </div>
          </div>
        </div>

        {/* Pénalités */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg shadow border border-red-200 mb-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Pénalités</h3>
          
          <p className="text-red-800 mb-4">
            Les contributions non conformes entraînent des pénalités en points :
          </p>

          <div className="space-y-3">
            <div className="flex gap-4 text-sm">
              <div className="bg-red-200 text-red-900 px-3 py-2 rounded font-semibold min-w-max">-2 pts</div>
              <div className="text-red-800">Rejet simple (contenu non conforme)</div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="bg-orange-200 text-orange-900 px-3 py-2 rounded font-semibold min-w-max">-5 pts</div>
              <div className="text-orange-800">Données personnelles détectées dans le contenu</div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="bg-red-300 text-red-900 px-3 py-2 rounded font-semibold min-w-max">-10 pts</div>
              <div className="text-red-800">Contenu répété, plagié ou très similaire à un contenu existant</div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="bg-orange-200 text-orange-900 px-3 py-2 rounded font-semibold min-w-max">-3 pts</div>
              <div className="text-orange-800">Erreur détectée par les apprenants (par erreur au-delà de 2)</div>
            </div>
          </div>

          <p className="text-sm text-red-700 mt-4 italic">
            💡 Conseil : Vérifiez bien vos contributions avant de les soumettre pour éviter les pénalités !
          </p>
        </div>

        {/* Répartition des revenus */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg shadow border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">💵 Répartition des Revenus</h3>
          
          <p className="text-green-800 mb-4">
            Quand la plateforme atteint des jalons de 1000€, 20% des revenus sont distribués aux contributeurs :
          </p>

          <div className="bg-white p-4 rounded border border-green-200 mb-4">
            <p className="text-sm font-mono text-gray-800">
              <strong>Votre part = (Vos Points ÷ Total Points Communauté) × (CA × 20%)</strong>
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded text-sm text-green-800">
            <p className="mb-2"><strong>Exemple concret :</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Vous avez : 150 points</li>
              <li>Communauté totale : 500 points</li>
              <li>Chiffre d'affaires atteint : 1000€</li>
              <li><strong>Votre revenu = (150/500) × (1000 × 20%) = (150/500) × 200€ = 60€</strong></li>
            </ul>
          </div>
        </div>
      </div>

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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminRevenue } from '../hooks/useAdminRevenue';
import { useAdminCounters } from '../hooks/useAdminCounters';
import AdminTabNavigation from '../components/admin/AdminTabNavigation';
// import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  FileText,
  Image,
  TrendingUp,
  Award,
  DollarSign,
  Trophy,
  Eye,
  Upload,
  Home,
} from 'lucide-react';

export default function AdminRevenueDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { stats, revenue, loading } = useAdminRevenue(currentUser?.id);
  const { counters } = useAdminCounters();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="flex items-center text-3xl font-semibold leading-none tracking-tight">
            <Home className="mr-3 h-8 w-8 text-primary" />
            Administration - Revenus
          </h3>
          <p className="text-sm text-muted-foreground">
            Statistiques de vos contributions et revenus générés par la plateforme
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <AdminTabNavigation counters={counters} />

      {/* Statistiques principales - Exercices et Images séparés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Exercices (versions admin) */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Exercices: nombre de versions</h3>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.exercises?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Créées par l'administration</p>
        </div>

        {/* Total Images admin */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Images</h3>
            <Image className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.images?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Créées par l'administration</p>
        </div>

        {/* Total Contributions (exercices + images) */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total Contributions Admin</h3>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(stats?.exercises?.total || 0) + (stats?.images?.total || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Créées par l'administration</p>
        </div>

        {/* Contexte global */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Sur la plateforme</h3>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.global?.total_content || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats?.global?.total_exercises || 0} exercices • {stats?.global?.total_images || 0}{' '}
            images
          </p>
        </div>

        {/* Nombre de contributeurs */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg shadow border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-blue-900 text-sm font-medium">Contributeurs</h3>
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats?.contributors?.count || 0}</p>
          <p className="text-xs text-blue-700 mt-2">Actifs sur la plateforme</p>
        </div>

        {/* Versions contributeurs */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg shadow border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-purple-900 text-sm font-medium">Exercices contributeurs</h3>
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">{stats?.contributors?.versions || 0}</p>
          <p className="text-xs text-purple-700 mt-2">Versions validées</p>
        </div>

        {/* Images contributeurs */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg shadow border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-green-900 text-sm font-medium">Images contributeurs</h3>
            <Image className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{stats?.contributors?.images || 0}</p>
          <p className="text-xs text-green-700 mt-2">Images créées par contributeurs</p>
        </div>
      </div>

      {/* Revenue & Milestones Section */}
      {revenue && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Revenus Plateforme</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Licences vendues */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Licences vendues</h3>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{revenue.total_sales_count || 0}</p>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>📚 Exercices: {revenue.exercise_sales_count || 0}</p>
                <p>🖼️ Images: {revenue.image_sales_count || 0}</p>
              </div>
            </div>

            {/* Revenus totaux */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-6 rounded-lg shadow border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-emerald-900">Revenus générés</h3>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-900">
                €{((revenue.total_revenue_cents || 0) / 100).toFixed(2)}
              </p>
              <div className="text-xs text-emerald-600 mt-2 space-y-1">
                <p>📚 €{((revenue.exercise_revenue_cents || 0) / 100).toFixed(2)}</p>
                <p>🖼️ €{((revenue.image_revenue_cents || 0) / 100).toFixed(2)}</p>
              </div>
            </div>

            {/* Palier actuel */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-lg shadow border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-amber-900">Palier atteint</h3>
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-amber-900">
                Palier {revenue.milestone_count || 0}
              </p>
              <p className="text-xs text-amber-600 mt-2">
                {(revenue.milestone_count || 0) > 0
                  ? `${revenue.milestone_count} × €1000`
                  : 'Aucun palier atteint'}
              </p>
            </div>
          </div>

          {/* Reversement plateforme et progression */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reversement plateforme (80%) */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg shadow border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-900">Revenus Plateforme (80%)</h3>
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-blue-900">
                  €{(((revenue.total_revenue_cents || 0) * 0.8) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Sur €{((revenue.total_revenue_cents || 0) / 100).toFixed(2)} de ventes totales
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 La plateforme conserve 80% des revenus pour la maintenance, l'hébergement et le
                  développement. 20% sont reversés aux contributeurs.
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
                      width: `${Math.min(
                        (((revenue.total_revenue_cents || 0) % 100000) / 100000) * 100,
                        100
                      )}%`,
                    }}
                  >
                    {(((revenue.total_revenue_cents || 0) % 100000) / 100000) * 100 > 10 && (
                      <span className="text-xs font-bold text-white">
                        {Math.round((((revenue.total_revenue_cents || 0) % 100000) / 100000) * 100)}
                        %
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700 font-medium">
                    €{(((revenue.total_revenue_cents || 0) % 100000) / 100).toFixed(2)}
                  </span>
                  <span className="text-purple-600">
                    Restant: €
                    {(
                      (((revenue.milestone_count || 0) + 1) * 100000 -
                        (revenue.total_revenue_cents || 0)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-purple-600">
                {(revenue.milestone_count || 0) === 0
                  ? '🎯 Atteignez €1000 pour débloquer le premier palier!'
                  : `🚀 Continuez pour atteindre le palier ${(revenue.milestone_count || 0) + 1}!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques détaillées */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow border border-blue-200">
        <div className="flex items-start space-x-4">
          <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion de la plateforme</h3>
            <p className="text-gray-700">
              En tant qu'administrateur, vous gérez{' '}
              {(stats?.exercises?.total || 0) + (stats?.images?.total || 0)} contributions. La
              plateforme génère €{((revenue?.total_revenue_cents || 0) / 100).toFixed(2)} de revenus
              dont €{(((revenue?.total_revenue_cents || 0) * 0.8) / 100).toFixed(2)} pour la
              plateforme et €{(((revenue?.total_revenue_cents || 0) * 0.2) / 100).toFixed(2)}{' '}
              reversés aux contributeurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

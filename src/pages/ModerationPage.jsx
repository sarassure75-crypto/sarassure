import React, { useState } from "react";
import { usePendingContributions, usePendingCount } from "../hooks/useContributions";
import { usePendingImagesCount } from "../hooks/useImageLibrary";
import ContributionReviewCard from "../components/admin/ContributionReviewCard";
import ImageModerationGrid from "../components/admin/ImageModerationGrid";
import { 
  Clock, 
  Image as ImageIcon, 
  FileText, 
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter
} from 'lucide-react';

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState('contributions'); // 'contributions' ou 'images'
  const [filterType, setFilterType] = useState('all'); // 'all', 'exercise', 'screenshot'

  // Hooks
  const { contributions, loading: loadingContributions, refresh: refreshContributions } = usePendingContributions();
  const { count: pendingContributionsCount } = usePendingCount();
  const { count: pendingImagesCount } = usePendingImagesCount();

  // Filtrer les contributions
  const filteredContributions = contributions?.filter(contrib => {
    if (filterType === 'all') return true;
    return contrib.type === filterType;
  });

  // Statistiques globales
  const stats = {
    totalPending: (pendingContributionsCount || 0) + (pendingImagesCount || 0),
    contributions: pendingContributionsCount || 0,
    images: pendingImagesCount || 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modération</h1>
        <p className="text-gray-600 mt-1">Validez ou rejetez les contributions des utilisateurs</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 rounded-lg p-6 shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-yellow-700">{stats.totalPending}</div>
              <div className="text-sm text-yellow-600 mt-1">En attente de modération</div>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-700">{stats.contributions}</div>
              <div className="text-sm text-blue-600 mt-1">Contributions</div>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-700">{stats.images}</div>
              <div className="text-sm text-purple-600 mt-1">Images</div>
            </div>
            <ImageIcon className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('contributions')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'contributions'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Contributions</span>
              {stats.contributions > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                  {stats.contributions}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'images'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Images</span>
              {stats.images > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                  {stats.images}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Contenu onglet Contributions */}
        {activeTab === 'contributions' && (
          <div className="p-6">
            {/* Filtres */}
            <div className="mb-6 flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="exercise">Exercices</option>
                <option value="screenshot">Captures d'écran</option>
              </select>

              <div className="text-sm text-gray-600">
                {filteredContributions?.length || 0} contribution{(filteredContributions?.length || 0) > 1 ? 's' : ''}
              </div>
            </div>

            {/* Liste des contributions */}
            {loadingContributions ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
              </div>
            ) : filteredContributions?.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tout est à jour !</h3>
                <p className="text-gray-600">Aucune contribution en attente de validation</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredContributions.map((contribution) => (
                  <ContributionReviewCard
                    key={contribution.id}
                    contribution={contribution}
                    onReviewed={refreshContributions}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenu onglet Images */}
        {activeTab === 'images' && (
          <div className="p-6">
            <ImageModerationGrid />
          </div>
        )}
      </div>

      {/* Aide / Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Critères de validation</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li><strong>Données personnelles :</strong> Aucune information identifiable (nom réel, téléphone, email, photo)</li>
              <li><strong>Qualité pédagogique :</strong> Instructions claires, progression logique</li>
              <li><strong>Images :</strong> Captures d'écran nettes, fonds d'écran appropriés uniquement</li>
              <li><strong>Contenu :</strong> Pas de contenu offensant, violent ou inapproprié</li>
              <li><strong>Originalité :</strong> Pas de duplication d'exercices existants</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Award, Star, Trophy, Zap, Crown, Shield } from 'lucide-react';

// Badge visuel pour contributeur
export function ContributorBadge({ badge, size = 'md' }) {
  if (!badge) return null;

  const badges = {
    novice: {
      icon: Star,
      color: 'text-gray-500',
      bg: 'bg-gray-100',
      label: 'Novice',
      description: '1-10 contributions',
    },
    apprenti: {
      icon: Zap,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      label: 'Apprenti',
      description: '11-50 contributions',
    },
    expert: {
      icon: Award,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
      label: 'Expert',
      description: '51-100 contributions',
    },
    maitre: {
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100',
      label: 'Maître',
      description: '101-200 contributions',
    },
    legende: {
      icon: Crown,
      color: 'text-red-500',
      bg: 'bg-red-100',
      label: 'Légende',
      description: '200+ contributions',
    },
    modérateur: {
      icon: Shield,
      color: 'text-green-500',
      bg: 'bg-green-100',
      label: 'Modérateur',
      description: 'Rôle spécial',
    },
  };

  const badgeInfo = badges[badge.toLowerCase()] || badges.novice;
  const Icon = badgeInfo.icon;

  const sizeClasses = {
    sm: { icon: 'w-4 h-4', text: 'text-xs', padding: 'px-2 py-1' },
    md: { icon: 'w-5 h-5', text: 'text-sm', padding: 'px-3 py-1.5' },
    lg: { icon: 'w-6 h-6', text: 'text-base', padding: 'px-4 py-2' },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center space-x-2 ${badgeInfo.bg} rounded-full ${sizes.padding}`}
      title={badgeInfo.description}
    >
      <Icon className={`${sizes.icon} ${badgeInfo.color}`} />
      <span className={`font-medium ${badgeInfo.color} ${sizes.text}`}>{badgeInfo.label}</span>
    </div>
  );
}

// Badge de statut simple
export function StatusBadge({ status, size = 'md' }) {
  const statuses = {
    draft: { color: 'bg-gray-100 text-gray-700', label: 'Brouillon' },
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
    approved: { color: 'bg-green-100 text-green-700', label: 'Approuvé' },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rejeté' },
    published: { color: 'bg-blue-100 text-blue-700', label: 'Publié' },
  };

  const statusInfo = statuses[status] || statuses.draft;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-block rounded-full font-medium ${statusInfo.color} ${sizeClasses[size]}`}
    >
      {statusInfo.label}
    </span>
  );
}

// Points avec badge coloré
export function PointsBadge({ points, showLabel = true, size = 'md' }) {
  const getColor = (points) => {
    if (points < 0) return 'bg-red-100 text-red-700';
    if (points < 50) return 'bg-gray-100 text-gray-700';
    if (points < 200) return 'bg-blue-100 text-blue-700';
    if (points < 500) return 'bg-purple-100 text-purple-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-full font-bold ${getColor(points)} ${
        sizeClasses[size]
      }`}
    >
      {showLabel && <span>Points:</span>}
      <span>{points}</span>
    </span>
  );
}

// Badge de catégorie
export function CategoryBadge({ category, size = 'md' }) {
  const categories = {
    Communication: { color: 'bg-blue-100 text-blue-700', emoji: '💬' },
    'Réseaux sociaux': { color: 'bg-purple-100 text-purple-700', emoji: '👥' },
    Paramètres: { color: 'bg-gray-100 text-gray-700', emoji: '⚙️' },
    Applications: { color: 'bg-green-100 text-green-700', emoji: '📱' },
    Sécurité: { color: 'bg-red-100 text-red-700', emoji: '🔒' },
    'Photo & Vidéo': { color: 'bg-pink-100 text-pink-700', emoji: '📸' },
    Navigation: { color: 'bg-indigo-100 text-indigo-700', emoji: '🗺️' },
  };

  const categoryInfo = categories[category] || { color: 'bg-gray-100 text-gray-700', emoji: '📁' };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded ${categoryInfo.color} ${sizeClasses[size]} font-medium`}
    >
      <span>{categoryInfo.emoji}</span>
      <span>{category}</span>
    </span>
  );
}

// Badge de difficulté
export function DifficultyBadge({ difficulty, size = 'md' }) {
  const difficulties = {
    facile: { color: 'bg-green-100 text-green-700', label: 'Facile' },
    moyen: { color: 'bg-yellow-100 text-yellow-700', label: 'Moyen' },
    difficile: { color: 'bg-red-100 text-red-700', label: 'Difficile' },
  };

  const difficultyInfo = difficulties[difficulty.toLowerCase()] || difficulties.facile;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-block rounded ${difficultyInfo.color} ${sizeClasses[size]} font-medium`}
    >
      {difficultyInfo.label}
    </span>
  );
}

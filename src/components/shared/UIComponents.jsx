import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Message d'avertissement données personnelles
export function PersonalDataWarning({ onViewResources }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Interdiction stricte de données personnelles</p>
          <p className="mb-2">Utilisez uniquement les ressources fournies par la plateforme :</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onViewResources?.('contacts')}
              className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded font-medium transition-colors"
            >
              📇 Contacts fictifs
            </button>
            <button
              onClick={() => onViewResources?.('wallpapers')}
              className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded font-medium transition-colors"
            >
              🖼️ Fonds d'écran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Carte de statistiques
export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div className={`rounded-lg p-4 shadow-sm border ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm mt-1">{title}</div>
          {subtitle && <div className="text-xs mt-0.5 opacity-75">{subtitle}</div>}
        </div>
        {Icon && <Icon className="w-10 h-10 opacity-50" />}
      </div>
    </div>
  );
}

// Zone de drag & drop pour upload
export function DropZone({ onDrop, onFileSelect, accept = 'image/*', maxSizeMB = 1, children }) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    if (files && files[0]) {
      validateAndHandle(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndHandle(e.target.files[0]);
    }
  };

  const validateAndHandle = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`⚠️ L'image dépasse ${maxSizeMB}MB. Veuillez la compresser.`);
      return;
    }

    onFileSelect?.(file);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      {children || (
        <>
          <p className="text-gray-600 mb-2">Glissez-déposez une image ici</p>
          <p className="text-sm text-gray-500 mb-4">ou</p>
          <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer inline-block transition-colors">
            Sélectionner un fichier
            <input type="file" accept={accept} onChange={handleFileInput} className="hidden" />
          </label>
          <p className="text-xs text-gray-500 mt-4">Maximum {maxSizeMB}MB</p>
        </>
      )}
    </div>
  );
}

// État de chargement
export function LoadingSpinner({ size = 'md', text = 'Chargement...' }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizes[size]}`}
        ></div>
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  );
}

// État vide
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Barre de progression
export function ProgressBar({ progress, color = 'blue', showLabel = true }) {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && <span className="text-sm font-medium text-gray-700">{progress}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${colors[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
}

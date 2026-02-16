import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Archive, Clock } from 'lucide-react';

export default function MyDrafts() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, draftId: null });

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    try {
      const draftsList = JSON.parse(localStorage.getItem('contributionDrafts') || '[]');
      setDrafts(draftsList.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
    } catch (err) {
      console.error('Erreur chargement brouillons:', err);
    }
  };

  const handleDelete = () => {
    if (deleteConfirm.draftId) {
      const filtered = drafts.filter((d) => d.id !== deleteConfirm.draftId);
      localStorage.setItem('contributionDrafts', JSON.stringify(filtered));
      setDrafts(filtered);
    }
    setDeleteConfirm({ isOpen: false, draftId: null });
  };

  const handleEdit = (draftId) => {
    navigate(`/contributeur/nouvelle-contribution?draft=${draftId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Archive className="w-8 h-8" />
          Mes brouillons
        </h1>
        <p className="text-gray-600 mt-2">
          Vos contributions non soumises sont sauvegardées automatiquement ici
        </p>
      </div>

      {/* Drafts List */}
      {drafts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Archive className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun brouillon</h3>
          <p className="text-gray-600 mb-6">
            Vos contributions en cours de création seront sauvegardées ici
          </p>
          <button
            onClick={() => navigate('/contributeur/nouvelle-contribution')}
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Créer une nouvelle contribution
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {draft.title || '(Sans titre)'}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Modifié {formatDate(draft.savedAt)}</span>
                    </div>

                    {draft.category && (
                      <div className="flex items-center gap-1">
                        <span className="inline-block px-2 py-1 bg-gray-200 rounded text-xs">
                          {draft.category}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="font-medium">{draft.versions?.length || 0}</span>
                      <span> version{draft.versions?.length !== 1 ? 's' : ''}</span>
                    </div>

                    {draft.versions?.some((v) => v.steps?.length > 0) && (
                      <div>
                        <span className="font-medium">
                          {draft.versions.reduce((acc, v) => acc + (v.steps?.length || 0), 0)}
                        </span>
                        <span>
                          {' '}
                          étape
                          {draft.versions.reduce((acc, v) => acc + (v.steps?.length || 0), 0) !== 1
                            ? 's'
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {draft.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{draft.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(draft.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                    title="Reprendre ce brouillon"
                  >
                    <Edit className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Continuer</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, draftId: draft.id })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                    title="Supprimer ce brouillon"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Supprimer le brouillon ?</h3>
            <p className="text-gray-600 mb-6">
              Cette action est irréversible. Le brouillon sera définitivement supprimé.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, draftId: null })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={() => navigate('/contributeur')}
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}

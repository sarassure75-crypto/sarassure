import React, { useState } from 'react';
import { useAdminPoints } from '@/hooks/useAdminPoints';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, AlertTriangle, CheckCircle, Edit2, Save, X } from 'lucide-react';

export default function AdminPointsManager() {
  const { contributors, adminPoints, loading, error, refresh, updateContributorPoints } =
    useAdminPoints();
  const [editingId, setEditingId] = useState(null);
  const [editPoints, setEditPoints] = useState('');
  const [editReason, setEditReason] = useState('');
  const [message, setMessage] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleEdit = (contributor) => {
    setEditingId(contributor.id);
    setEditPoints('');
    setEditReason('');
  };

  const handleSave = async (contributorId) => {
    const points = parseFloat(editPoints);
    if (isNaN(points)) {
      setMessage({ type: 'error', text: 'Veuillez entrer un nombre valide' });
      return;
    }

    if (!editReason.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer une raison' });
      return;
    }

    const result = await updateContributorPoints(contributorId, points, editReason);
    if (result.success) {
      setMessage({ type: 'success', text: 'Points mis à jour avec succès' });
      setEditingId(null);
      setEditPoints('');
      setEditReason('');
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const totalContributorPoints = contributors.reduce((sum, c) => sum + (c.total_points || 0), 0);
  const totalSystemPoints = totalContributorPoints + adminPoints;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Contributors */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contributeurs</p>
                <p className="text-3xl font-bold text-blue-600">{contributors.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Total Contributor Points */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points Contributeurs</p>
                <p className="text-3xl font-bold text-violet-600">
                  {totalContributorPoints.toFixed(1)}
                </p>
              </div>
              <Zap className="w-8 h-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>

        {/* Admin Points */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points Admin (non-pénalisables)</p>
                <p className="text-3xl font-bold text-emerald-600">{adminPoints.toFixed(1)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Total Info */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">Points Totaux du Système</p>
            <p className="text-4xl font-bold text-slate-900">{totalSystemPoints.toFixed(1)}</p>
            <div className="text-xs text-slate-600 mt-3 space-y-1">
              <p>
                📊 Contribution Points: {totalContributorPoints.toFixed(1)} (
                {((totalContributorPoints / totalSystemPoints) * 100).toFixed(2)}%)
              </p>
              <p>
                👨‍💼 Admin Points: {adminPoints.toFixed(1)} (
                {((adminPoints / totalSystemPoints) * 100).toFixed(2)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Contributors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestion des Points des Contributeurs</span>
            <Button onClick={refresh} size="sm" variant="outline">
              Rafraîchir
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Contributeur</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">
                    Points Totaux
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">% du Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Dernière Mise à Jour
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                      Aucun contributeur trouvé
                    </td>
                  </tr>
                ) : (
                  contributors.map((contributor) => (
                    <tr key={contributor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{contributor.username}</div>
                        <div className="text-xs text-gray-500">{contributor.id}</div>
                      </td>
                      <td className="text-center px-4 py-3">
                        {editingId === contributor.id ? (
                          <input
                            type="number"
                            step="0.1"
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            placeholder="Points à ajouter/retirer"
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                        ) : (
                          <span className="font-bold text-violet-600">
                            {(contributor.total_points || 0).toFixed(1)}
                          </span>
                        )}
                      </td>
                      <td className="text-center px-4 py-3 text-gray-600">
                        {totalContributorPoints > 0
                          ? (
                              ((contributor.total_points || 0) / totalContributorPoints) *
                              100
                            ).toFixed(2) + '%'
                          : '0%'}
                      </td>
                      <td className="text-left px-4 py-3 text-xs text-gray-500">
                        {contributor.last_updated
                          ? new Date(contributor.last_updated).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </td>
                      <td className="text-center px-4 py-3">
                        {editingId === contributor.id ? (
                          <div className="flex gap-2 justify-center">
                            <input
                              type="text"
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              placeholder="Raison"
                              className="w-40 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSave(contributor.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(contributor)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Notes sur la Gestion des Points
            </h4>
            <ul className="text-sm text-blue-800 space-y-2 ml-6 list-disc">
              <li>
                <strong>Points Contributeurs :</strong> Peuvent être augmentés (bonus) ou diminués
                (pénalités) manuellement
              </li>
              <li>
                <strong>Points Admin :</strong> Sont comptés dans le total du système mais{' '}
                <strong>ne peuvent PAS avoir de pénalités</strong>
              </li>
              <li>
                <strong>Bonus/Pénalités Automatiques :</strong> Les points sont automatiquement
                ajoutés/retirés par le système lors de validations/rejets
              </li>
              <li>
                <strong>Ajustements Manuels :</strong> Utilisez ce formulaire pour corriger les
                points qui n'auraient pas été appliqués correctement
              </li>
              <li>
                <strong>Historique :</strong> Tous les changements sont enregistrés dans{' '}
                <code>contributor_points_history</code>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

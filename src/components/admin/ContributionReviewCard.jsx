import React, { useState } from 'react';
import { useContributionActions } from '../../hooks/useContributions';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  FileText,
  AlertTriangle,
  Edit,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ContributionReviewCard({ contribution, onReviewed }) {
  const { approve, reject, loading } = useContributionActions();
  
  const [expanded, setExpanded] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Extraction des données
  const content = contribution.content || {};
  const title = content.title || 'Sans titre';
  const description = content.description || 'Pas de description';
  const tasks = content.tasks || [];
  const category = content.category || 'Non catégorisé';
  const difficulty = content.difficulty || 'facile';

  // Formatage date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Validation données personnelles
  const checkForPersonalData = () => {
    const suspiciousPatterns = [
      { pattern: /\b0[67]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\b/, type: 'Téléphone français' },
      { pattern: /\b\+?\d{1,3}\s?\d{9,}\b/, type: 'Numéro de téléphone' },
      { pattern: /\b[\w\.-]+@(?!exemple\.fr|example\.)(gmail|outlook|hotmail|yahoo|orange|free|wanadoo)\.com\b/i, type: 'Email réel' },
      { pattern: /\b(rue|avenue|boulevard|chemin|place)\s+[a-zA-ZÀ-ÿ\s]+\d+/i, type: 'Adresse postale' },
    ];

    const allText = `${title} ${description} ${tasks.map(t => t.instruction).join(' ')}`;
    const findings = [];

    suspiciousPatterns.forEach(({ pattern, type }) => {
      const matches = allText.match(pattern);
      if (matches) {
        findings.push({ type, matches: matches.slice(0, 3) });
      }
    });

    return findings;
  };

  const personalDataWarnings = checkForPersonalData();
  const hasWarnings = personalDataWarnings.length > 0;

  // Approuver
  const handleApprove = async () => {
    const result = await approve(contribution.id, approveNotes || undefined);
    if (result.success) {
      alert('✅ Contribution approuvée avec succès !');
      setShowApproveModal(false);
      onReviewed?.();
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  };

  // Rejeter
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Veuillez indiquer une raison pour le rejet');
      return;
    }

    const result = await reject(contribution.id, rejectReason);
    if (result.success) {
      alert('❌ Contribution rejetée');
      setShowRejectModal(false);
      onReviewed?.();
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
        hasWarnings ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>

            <div className="ml-4 flex flex-col items-end space-y-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {contribution.type === 'exercise' ? '📝 Exercice' : '📸 Capture'}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {category}
              </span>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>ID: {contribution.contributor_id?.slice(0, 8)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(contribution.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>{tasks.length} étape{tasks.length > 1 ? 's' : ''}</span>
            </div>
            <div className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium capitalize">
              {difficulty}
            </div>
          </div>

          {/* Avertissements données personnelles */}
          {hasWarnings && (
            <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">⚠️ Données personnelles détectées !</h4>
                  <ul className="space-y-1 text-sm text-red-800">
                    {personalDataWarnings.map((warning, i) => (
                      <li key={i}>
                        <strong>{warning.type} :</strong> {warning.matches.join(', ')}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-red-700">
                    ⚠️ Cette contribution doit être rejetée sauf si les données sont fictives et proviennent des ressources fournies.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Détails (collapsible) */}
        <div className={`border-b transition-all ${expanded ? 'block' : 'hidden'}`}>
          <div className="p-6 space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Étapes de l'exercice</h4>
            {tasks.map((task, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{task.instruction}</p>
                    {task.image_url && (
                      <div className="mt-3">
                        <img 
                          src={task.image_url} 
                          alt={`Étape ${index + 1}`}
                          className="max-w-xs rounded border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {content.versions && content.versions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Versions alternatives ({content.versions.length})
                </h4>
                <div className="space-y-2">
                  {content.versions.map((version, i) => (
                    <div key={i} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="font-medium text-purple-900">{version.name || `Version ${i + 1}`}</div>
                      <div className="text-sm text-purple-700">{version.tasks?.length || 0} étapes</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-5 h-5" />
                <span>Masquer les détails</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                <span>Voir les détails</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Rejeter</span>
            </button>

            <button
              onClick={() => setShowApproveModal(true)}
              disabled={loading || hasWarnings}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approuver</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Approbation */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Approuver la contribution</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Cette contribution sera publiée et le contributeur recevra des points.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Ex: Excellent exercice, très pédagogique !"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmer l'approbation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Rejeter la contribution</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Indiquez la raison du rejet pour aider le contributeur à s'améliorer.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du rejet *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Données personnelles détectées (numéro de téléphone réel dans la capture)"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {hasWarnings && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                  💡 Suggestion : Mentionnez les données personnelles détectées ci-dessus
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirmer le rejet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

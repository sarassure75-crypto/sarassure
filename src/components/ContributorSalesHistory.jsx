import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getContributorExerciseSales, 
  getContributorImageSales,
  formatRevenue 
} from '../data/contributorRevenue';
import { 
  Calendar,
  FileText,
  Image as ImageIcon,
  DollarSign,
  User,
  TrendingUp,
  Download
} from 'lucide-react';

export default function ContributorSalesHistory() {
  const { currentUser } = useAuth();
  const [exerciseSales, setExerciseSales] = useState([]);
  const [imageSales, setImageSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'exercises', 'images'

  useEffect(() => {
    if (currentUser?.id) {
      loadSalesHistory();
    }
  }, [currentUser?.id]);

  const loadSalesHistory = async () => {
    try {
      setLoading(true);
      const [exercises, images] = await Promise.all([
        getContributorExerciseSales(currentUser.id, 100),
        getContributorImageSales(currentUser.id, 100)
      ]);
      
      setExerciseSales(exercises || []);
      setImageSales(images || []);
    } catch (error) {
      console.error('Error loading sales history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine and sort all sales
  const allSales = [
    ...exerciseSales.map(sale => ({ ...sale, type: 'exercise' })),
    ...imageSales.map(sale => ({ ...sale, type: 'image' }))
  ].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));

  const filteredSales = filter === 'all' 
    ? allSales 
    : allSales.filter(sale => 
        filter === 'exercises' ? sale.type === 'exercise' : sale.type === 'image'
      );

  const totalRevenue = allSales.reduce((sum, sale) => sum + sale.price_cents, 0);
  const totalSales = allSales.length;
  const contributorEarnings = totalRevenue * 0.20; // 20% commission

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Ventes</h1>
        <p className="text-gray-600">Détail de toutes vos ventes et revenus générés</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Ventes totales</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalSales}</p>
          <p className="text-xs text-gray-500 mt-2">
            {exerciseSales.length} exercices • {imageSales.length} images
          </p>
        </div>

        <div className="bg-emerald-50 p-6 rounded-lg shadow border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-emerald-900">Revenus générés</h3>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-900">{formatRevenue(totalRevenue)}</p>
          <p className="text-xs text-emerald-600 mt-2">Revenus bruts</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg shadow border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-900">Vos gains (20%)</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{formatRevenue(contributorEarnings)}</p>
          <p className="text-xs text-green-600 mt-2">Commission contributeur</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filtrer:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tout ({allSales.length})
          </button>
          <button
            onClick={() => setFilter('exercises')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'exercises'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Exercices ({exerciseSales.length})
          </button>
          <button
            onClick={() => setFilter('images')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'images'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Images ({imageSales.length})
          </button>
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune vente pour le moment</h3>
          <p className="text-gray-600">
            Vos contributions n'ont pas encore été achetées. Continuez à créer du contenu de qualité !
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acheteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Votre part
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale, index) => (
                  <tr key={`${sale.type}-${sale.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {sale.type === 'exercise' ? (
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Exercice</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">Image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {sale.type === 'exercise' 
                          ? sale.task?.title || sale.version?.name || 'Sans titre'
                          : sale.image?.title || sale.image?.name || 'Sans titre'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {sale.buyer?.first_name} {sale.buyer?.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(sale.purchase_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatRevenue(sale.price_cents)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {formatRevenue(sale.price_cents * 0.20)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Button */}
      {filteredSales.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              // TODO: Implement CSV export
              alert('Export CSV à implémenter');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter en CSV</span>
          </button>
        </div>
      )}
    </div>
  );
}

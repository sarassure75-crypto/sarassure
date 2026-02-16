import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Filter, Download, TrendingUp } from 'lucide-react';

export default function AdminLearnerReviews({ currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    fetchReviews();
  }, [currentUser]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('learner_reviews')
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          learner:learner_id(id, email, first_name),
          task:task_id(id, title),
          trainer:trainer_id(id, email, first_name)
        `
        )
        .order('created_at', { ascending: false });

      // Formateurs voient seulement leurs avis
      // Admins voient tous les avis
      if (currentUser?.role === 'formateur') {
        query = query.eq('trainer_id', currentUser.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReviews(data || []);
      calculateStats(data || []);
      filterReviews(data || [], searchTerm, filterRating);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviewsData.forEach((review) => {
      if (review.rating) {
        distribution[review.rating]++;
        totalRating += review.rating;
      }
    });

    const average = reviewsData.length > 0 ? (totalRating / reviewsData.length).toFixed(1) : 0;

    setStats({
      totalReviews: reviewsData.length,
      averageRating: average,
      ratingDistribution: distribution,
    });
  };

  const filterReviews = (reviewsData, search, rating) => {
    let filtered = reviewsData;

    if (search.trim()) {
      filtered = filtered.filter(
        (review) =>
          review.learner?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
          review.learner?.email?.toLowerCase().includes(search.toLowerCase()) ||
          review.task?.title?.toLowerCase().includes(search.toLowerCase()) ||
          review.comment?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (rating !== 'all') {
      filtered = filtered.filter((review) => review.rating === parseInt(rating));
    }

    setFilteredReviews(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterReviews(reviews, value, filterRating);
  };

  const handleRatingFilter = (value) => {
    setFilterRating(value);
    filterReviews(reviews, searchTerm, value);
  };

  const downloadReviews = () => {
    const csv = [
      ['Apprenant', 'Email', 'Tâche', 'Note', 'Commentaire', 'Date'],
      ...filteredReviews.map((review) => [
        review.learner?.first_name || 'N/A',
        review.learner?.email || 'N/A',
        review.task?.title || 'N/A',
        review.rating || 'N/A',
        review.comment || '',
        new Date(review.created_at).toLocaleDateString('fr-FR'),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avis_apprenants_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const StarRating = ({ rating, size = 'sm' }) => {
    const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des avis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total et moyenne */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Avis reçus</h3>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.totalReviews}</p>
        </div>

        {/* Note moyenne */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200">
          <h3 className="text-sm font-medium text-amber-900 mb-2">Note moyenne</h3>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-amber-600">{stats.averageRating}</p>
            <StarRating rating={Math.round(stats.averageRating)} size="lg" />
          </div>
        </div>

        {/* Distribution des notes */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-900 mb-3">Distribution</h3>
          <div className="space-y-1 text-xs">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-4 text-green-700 font-bold">{star}★</span>
                <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{
                      width:
                        stats.totalReviews > 0
                          ? `${(stats.ratingDistribution[star] / stats.totalReviews) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
                <span className="w-6 text-right text-green-700 font-bold">
                  {stats.ratingDistribution[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par apprenant, tâche ou commentaire..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={filterRating}
            onChange={(e) => handleRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">Toutes les notes</option>
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
            <option value="2">⭐⭐ (2)</option>
            <option value="1">⭐ (1)</option>
          </select>
          <Button onClick={downloadReviews} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {filteredReviews.length} avis trouvé{filteredReviews.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
            Aucun avis à afficher
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.learner?.first_name || 'Apprenant'} ({review.learner?.email || 'N/A'})
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tâche: <span className="font-medium">{review.task?.title || 'N/A'}</span>
                  </p>
                </div>
                <div className="text-right">
                  <StarRating rating={review.rating || 0} />
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {review.comment && (
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-gray-700 italic">
                  "{review.comment}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

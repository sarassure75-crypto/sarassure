import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

export default function LearnerReviewForm({ taskId, trainerId, onSubmitSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkExistingReview();
  }, [taskId, trainerId]);

  const checkExistingReview = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return;

      const { data: review } = await supabase
        .from('learner_reviews')
        .select('id, rating, comment')
        .eq('learner_id', data.session.user.id)
        .eq('task_id', taskId)
        .eq('trainer_id', trainerId)
        .single();

      if (review) {
        setHasReview(true);
        setRating(review.rating || 0);
        setComment(review.comment || '');
      }
    } catch (err) {
      // Pas de review existante
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.user) {
        setError('Vous devez être connecté');
        return;
      }

      if (hasReview) {
        // Mise à jour
        const { error: updateError } = await supabase
          .from('learner_reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString(),
          })
          .eq('learner_id', authData.session.user.id)
          .eq('task_id', taskId)
          .eq('trainer_id', trainerId);

        if (updateError) throw updateError;
      } else {
        // Insertion
        const { error: insertError } = await supabase.from('learner_reviews').insert({
          learner_id: authData.session.user.id,
          task_id: taskId,
          trainer_id: trainerId,
          rating,
          comment,
        });

        if (insertError) throw insertError;
        setHasReview(true);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg border border-gray-200 space-y-4"
    >
      <h3 className="font-semibold text-lg">Donner votre avis</h3>

      {/* Sélection de la note */}
      <div>
        <label className="block text-sm font-medium mb-2">Votre note</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Commentaire */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Votre commentaire (optionnel)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience avec cet exercice..."
          className="w-full"
          rows={4}
        />
      </div>

      {/* Messages */}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">✓ Avis enregistré avec succès</div>}

      {/* Bouton */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Envoi...' : hasReview ? 'Mettre à jour mon avis' : 'Donner mon avis'}
      </Button>
    </form>
  );
}

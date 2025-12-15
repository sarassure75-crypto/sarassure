import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const SatisfactionSurvey = ({ onSubmitted, taskId = null, trainerId = null }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
  }, [currentUser]);

  const submit = async (e) => {
    e && e.preventDefault();
    if (!currentUser) {
      toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour envoyer votre avis.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('learner_reviews')
        .insert({ 
          learner_id: currentUser.id, 
          rating: parseInt(rating, 10), 
          comment: comment || null,
          task_id: taskId || null,
          trainer_id: trainerId || null
        });

      if (error) throw error;

      toast({ title: 'Merci !', description: 'Votre avis a bien été enregistré.' });
      setComment('');
      setRating(5);
      onSubmitted && onSubmitted();
    } catch (err) {
      console.error('Satisfaction submit error:', err);
      toast({ title: 'Erreur', description: err.message || 'Impossible d\'envoyer l\'avis.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Votre satisfaction (1-5)</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`px-3 py-2 rounded-lg border ${rating===n ? 'bg-primary text-white' : 'bg-white text-muted-foreground'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Commentaire (optionnel)</label>
        <Textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Dites-nous ce que vous avez aimé ou pas..." />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer mon avis'}</Button>
        <Button type="button" variant="outline" onClick={()=>{setComment(''); setRating(5);}}>Annuler</Button>
      </div>
    </form>
  );
};

export default SatisfactionSurvey;

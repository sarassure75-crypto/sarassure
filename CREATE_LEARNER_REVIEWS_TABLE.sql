-- Créer la table des avis des apprenants
CREATE TABLE IF NOT EXISTS learner_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_learner_reviews_learner_id ON learner_reviews(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_reviews_task_id ON learner_reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_learner_reviews_trainer_id ON learner_reviews(trainer_id);
CREATE INDEX IF NOT EXISTS idx_learner_reviews_created_at ON learner_reviews(created_at);

-- Activer RLS
ALTER TABLE learner_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- Les apprenants peuvent lire leurs propres avis
CREATE POLICY "learner_read_own_reviews" ON learner_reviews
  FOR SELECT
  USING (auth.uid() = learner_id);

-- Les formateurs peuvent lire les avis de leurs apprenants
CREATE POLICY "trainer_read_learner_reviews" ON learner_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('formateur', 'administrateur')
        AND (
          learner_reviews.trainer_id = auth.uid()
          OR p.role = 'administrateur'
        )
    )
  );

-- Les apprenants peuvent créer des avis
CREATE POLICY "learner_insert_reviews" ON learner_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = learner_id);

-- Les apprenants peuvent modifier leurs avis
CREATE POLICY "learner_update_own_reviews" ON learner_reviews
  FOR UPDATE
  USING (auth.uid() = learner_id)
  WITH CHECK (auth.uid() = learner_id);

-- Les apprenants peuvent supprimer leurs avis
CREATE POLICY "learner_delete_own_reviews" ON learner_reviews
  FOR DELETE
  USING (auth.uid() = learner_id);

-- Vérification
SELECT 'Table learner_reviews créée avec succès' as status;

-- Migration: Ajouter les licences pour les apprenants

-- Table pour les licences des apprenants
CREATE TABLE IF NOT EXISTS learner_category_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES task_categories(id) ON DELETE CASCADE,
  assigned_by_trainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(learner_id, category_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_learner_licenses_learner ON learner_category_licenses(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_licenses_category ON learner_category_licenses(category_id);
CREATE INDEX IF NOT EXISTS idx_learner_licenses_trainer ON learner_category_licenses(assigned_by_trainer_id);

-- RLS (Row Level Security)
ALTER TABLE learner_category_licenses ENABLE ROW LEVEL SECURITY;

-- Politique: Les apprenants peuvent voir leurs propres licences
CREATE POLICY "Learners can view their own licenses"
  ON learner_category_licenses
  FOR SELECT
  USING (auth.uid() = learner_id);

-- Politique: Les formateurs peuvent voir les licences de leurs apprenants
CREATE POLICY "Trainers can view their learners licenses"
  ON learner_category_licenses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = auth.uid()
      AND p1.role = 'formateur'
      AND EXISTS (
        SELECT 1 FROM profiles p2
        WHERE p2.id = learner_category_licenses.learner_id
        AND p2.assigned_trainer_id = p1.id
      )
    )
  );

-- Politique: Les formateurs peuvent gérer les licences de leurs apprenants
CREATE POLICY "Trainers can manage their learners licenses"
  ON learner_category_licenses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = auth.uid()
      AND p1.role = 'formateur'
      AND EXISTS (
        SELECT 1 FROM profiles p2
        WHERE p2.id = learner_category_licenses.learner_id
        AND p2.assigned_trainer_id = p1.id
      )
    )
  );

-- Politique: Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all learner licenses"
  ON learner_category_licenses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrateur'
    )
  );

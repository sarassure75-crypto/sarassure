-- Migration: Ajouter la table pour les notes personnelles des apprenants

-- Table pour stocker les notes et captures d'écran des apprenants
CREATE TABLE IF NOT EXISTS learner_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES steps(id) ON DELETE CASCADE,
  note_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les images associées aux notes
CREATE TABLE IF NOT EXISTS learner_note_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES learner_notes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_learner_notes_user_id ON learner_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_learner_notes_task_id ON learner_notes(task_id);
CREATE INDEX IF NOT EXISTS idx_learner_notes_version_id ON learner_notes(version_id);
CREATE INDEX IF NOT EXISTS idx_learner_note_images_note_id ON learner_note_images(note_id);

-- RLS (Row Level Security)
ALTER TABLE learner_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_note_images ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent lire leurs propres notes
CREATE POLICY "Users can read their own notes"
  ON learner_notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent créer leurs propres notes
CREATE POLICY "Users can create their own notes"
  ON learner_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres notes
CREATE POLICY "Users can update their own notes"
  ON learner_notes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres notes
CREATE POLICY "Users can delete their own notes"
  ON learner_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent lire les images de leurs notes
CREATE POLICY "Users can read images of their own notes"
  ON learner_note_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learner_notes
      WHERE learner_notes.id = learner_note_images.note_id
      AND learner_notes.user_id = auth.uid()
    )
  );

-- Politique: Les utilisateurs peuvent créer des images pour leurs notes
CREATE POLICY "Users can create images for their own notes"
  ON learner_note_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM learner_notes
      WHERE learner_notes.id = learner_note_images.note_id
      AND learner_notes.user_id = auth.uid()
    )
  );

-- Politique: Les utilisateurs peuvent supprimer les images de leurs notes
CREATE POLICY "Users can delete images of their own notes"
  ON learner_note_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM learner_notes
      WHERE learner_notes.id = learner_note_images.note_id
      AND learner_notes.user_id = auth.uid()
    )
  );

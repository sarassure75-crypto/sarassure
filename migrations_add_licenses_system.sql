-- Migration: Système de licences par catégorie pour les formateurs

-- Table pour les licences de catégories
CREATE TABLE IF NOT EXISTS trainer_category_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES task_categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = licence à vie
  UNIQUE(trainer_id, category_id)
);

-- Table pour les messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_trainer_licenses_trainer ON trainer_category_licenses(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_licenses_category ON trainer_category_licenses(category_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read);

-- RLS (Row Level Security)
ALTER TABLE trainer_category_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Politique: Les formateurs peuvent voir leurs propres licences
CREATE POLICY "Trainers can view their own licenses"
  ON trainer_category_licenses
  FOR SELECT
  USING (auth.uid() = trainer_id);

-- Politique: Les admins peuvent tout gérer sur les licences
CREATE POLICY "Admins can manage all licenses"
  ON trainer_category_licenses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrateur'
    )
  );

-- Politique: Les admins peuvent voir tous les messages
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrateur'
    )
  );

-- Politique: Les admins peuvent marquer les messages comme lus
CREATE POLICY "Admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrateur'
    )
  );

-- Politique: Tout le monde peut envoyer un message (INSERT public)
CREATE POLICY "Anyone can send contact messages"
  ON contact_messages
  FOR INSERT
  WITH CHECK (true);

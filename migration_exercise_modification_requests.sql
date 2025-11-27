-- Migration: Ajouter support des demandes de modification pour les exercices
-- Date: 2025-11-27

-- Ajouter les champs pour gérer les commentaires admin et le suivi des modifications
ALTER TABLE versions 
ADD COLUMN IF NOT EXISTS admin_comments TEXT,
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS modification_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_submission_id UUID REFERENCES versions(id);

-- Nettoyer les données existantes avant d'appliquer la contrainte
-- Convertir les valeurs non conformes vers des valeurs valides
UPDATE versions 
SET creation_status = CASE 
  WHEN creation_status IS NULL THEN 'draft'
  WHEN creation_status = 'created' THEN 'draft'
  WHEN creation_status = 'published' THEN 'validated'
  WHEN creation_status = 'approved' THEN 'validated'
  WHEN creation_status IN ('draft', 'pending', 'validated', 'rejected') THEN creation_status
  ELSE 'draft'
END
WHERE creation_status NOT IN ('draft', 'pending', 'needs_changes', 'validated', 'rejected') 
   OR creation_status IS NULL;

-- Modifier les valeurs possibles pour creation_status
-- Les statuts possibles seront :
-- 'draft' = brouillon (contributeur travaille dessus)
-- 'pending' = en attente de validation (soumis par contributeur)
-- 'needs_changes' = à corriger (renvoyé par admin avec commentaires) 
-- 'validated' = approuvé par admin
-- 'rejected' = rejeté définitivement par admin

-- Ajouter une contrainte pour les statuts valides
ALTER TABLE versions 
ADD CONSTRAINT versions_creation_status_check 
CHECK (creation_status IN ('draft', 'pending', 'needs_changes', 'validated', 'rejected'));

-- Index pour optimiser les requêtes sur le statut et le reviewer
CREATE INDEX IF NOT EXISTS idx_versions_creation_status ON versions(creation_status);
CREATE INDEX IF NOT EXISTS idx_versions_reviewer_id ON versions(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_versions_original_submission ON versions(original_submission_id);

-- Commentaire pour expliquer la logique
COMMENT ON COLUMN versions.admin_comments IS 'Commentaires de l''admin lors de la demande de modification';
COMMENT ON COLUMN versions.reviewer_id IS 'ID de l''admin qui a fait la review';
COMMENT ON COLUMN versions.reviewed_at IS 'Timestamp de la review admin';
COMMENT ON COLUMN versions.modification_count IS 'Nombre de fois que la version a été modifiée suite aux commentaires admin';
COMMENT ON COLUMN versions.original_submission_id IS 'Référence vers la première soumission pour le suivi';
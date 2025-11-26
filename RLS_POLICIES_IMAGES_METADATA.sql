-- ============================================================================
-- RLS POLICIES - Table: images_metadata
-- Pour permettre aux contributeurs d'insérer leurs propres images
-- ============================================================================

-- 1. Activer RLS sur la table
ALTER TABLE images_metadata ENABLE ROW LEVEL SECURITY;

-- 2. POLICY: Les contributeurs peuvent lire les images approuvées
CREATE POLICY "Contributors can read approved images"
ON images_metadata
FOR SELECT
USING (
  moderation_status = 'approved'
  OR uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- 3. POLICY: Les contributeurs peuvent insérer leurs propres images
CREATE POLICY "Contributors can insert their own images"
ON images_metadata
FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'contributor'
  )
);

-- 4. POLICY: Les contributeurs peuvent mettre à jour leurs propres images
CREATE POLICY "Contributors can update their own images"
ON images_metadata
FOR UPDATE
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- 5. POLICY: Les contributeurs peuvent supprimer leurs propres images
CREATE POLICY "Contributors can delete their own images"
ON images_metadata
FOR DELETE
USING (uploaded_by = auth.uid());

-- 6. POLICY: Les admins peuvent tout faire
CREATE POLICY "Admins can do everything"
ON images_metadata
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- Vérification
SELECT tablename FROM pg_tables WHERE tablename = 'images_metadata';

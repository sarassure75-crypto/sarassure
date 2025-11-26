-- ============================================================================
-- RLS POLICIES - Table: contributions
-- Pour permettre aux contributeurs de voir/créer/modifier leurs contributions
-- ============================================================================

-- 1. Activer RLS sur la table
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- 2. POLICY: Les contributeurs peuvent lire leurs propres contributions
CREATE POLICY "Contributors can read own contributions"
ON contributions
FOR SELECT
USING (
  contributor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- 3. POLICY: Les contributeurs peuvent créer des contributions
CREATE POLICY "Contributors can create contributions"
ON contributions
FOR INSERT
WITH CHECK (
  contributor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'contributor'
  )
);

-- 4. POLICY: Les contributeurs peuvent modifier leurs propres contributions
CREATE POLICY "Contributors can update own contributions"
ON contributions
FOR UPDATE
USING (contributor_id = auth.uid())
WITH CHECK (contributor_id = auth.uid());

-- 5. POLICY: Les contributeurs peuvent supprimer leurs propres contributions
CREATE POLICY "Contributors can delete own contributions"
ON contributions
FOR DELETE
USING (contributor_id = auth.uid());

-- 6. POLICY: Les admins peuvent tout faire
CREATE POLICY "Admins can manage all contributions"
ON contributions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- Vérification
SELECT tablename FROM pg_tables WHERE tablename = 'contributions';

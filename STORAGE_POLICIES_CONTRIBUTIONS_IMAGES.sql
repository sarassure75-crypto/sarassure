-- ============================================================================
-- STORAGE POLICIES - Bucket: contributions-images
-- Pour gérer l'accès aux images uploadées par les contributeurs
-- ============================================================================

-- 1. POLICY: Permettre aux contributeurs de lire leurs propres images
CREATE POLICY "Contributors can read own images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'contributions-images'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrateur'
    )
  )
);

-- 2. POLICY: Permettre aux contributeurs d'uploader des images
CREATE POLICY "Contributors can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'contributions-images'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'contributor'
    )
  )
);

-- 3. POLICY: Permettre aux contributeurs de supprimer leurs propres images
CREATE POLICY "Contributors can delete own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'contributions-images'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrateur'
    )
  )
);

-- 4. POLICY: Permettre aux administrateurs de lire toutes les images
CREATE POLICY "Admins can read all images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'contributions-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- 5. POLICY: Permettre aux administrateurs de supprimer n'importe quelle image
CREATE POLICY "Admins can delete any image"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'contributions-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- 6. POLICY: Permettre la lecture publique des images approuvées (optionnel)
-- Décommente si tu veux que les images approuvées soient publiques
/*
CREATE POLICY "Public can read approved images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'contributions-images'
);
*/

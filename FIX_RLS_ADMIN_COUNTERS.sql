-- ============================================================================
-- FIX RLS POLICIES - Permettre aux administrateurs de lire les compteurs
-- À exécuter dans Supabase SQL Editor
-- ============================================================================

-- 1. Policy pour images_metadata - Admins peuvent tout lire
DROP POLICY IF EXISTS "Admins can read all images_metadata" ON public.images_metadata;
CREATE POLICY "Admins can read all images_metadata" 
ON public.images_metadata
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- 2. Policy pour versions - Admins peuvent tout lire
DROP POLICY IF EXISTS "Admins can read all versions" ON public.versions;
CREATE POLICY "Admins can read all versions" 
ON public.versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- 3. Policy pour contact_messages - Admins peuvent tout lire
DROP POLICY IF EXISTS "Admins can read all contact_messages" ON public.contact_messages;
CREATE POLICY "Admins can read all contact_messages" 
ON public.contact_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- 4. Policy pour faq_items - Admins peuvent tout lire
DROP POLICY IF EXISTS "Admins can read all faq_items" ON public.faq_items;
CREATE POLICY "Admins can read all faq_items" 
ON public.faq_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'administrateur'
  )
);

-- Vérifier que RLS est activé sur ces tables
ALTER TABLE public.images_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Vérifier les policies créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('images_metadata', 'versions', 'contact_messages', 'faq_items')
ORDER BY tablename, policyname;

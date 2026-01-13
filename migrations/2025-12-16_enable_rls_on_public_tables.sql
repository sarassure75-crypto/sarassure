-- ================================================================
-- ACTIVER LE RLS SUR LES TABLES PUBLIQUES LABELISÉES
-- ================================================================
-- Cette migration s'assure que les tables exposées via PostgREST
-- utilisent bien le Row Level Security aligné avec les politiques
-- déjà existantes dans le projet.
-- ================================================================

-- ===== 1. CONTACT_MESSAGES =====
-- RLS Activation (les politiques existent déjà dans schema.sql)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ===== 2. FAQ_ITEMS =====
-- RLS Activation (les politiques existent déjà dans schema.sql)
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- ===== 3. GLOSSARY =====
-- RLS Activation (les politiques existent dans 2025-12-15_create_glossary.sql)
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;

-- ===== 4. IMAGES_METADATA =====
-- RLS Activation (les politiques existent déjà dans schema.sql)
ALTER TABLE public.images_metadata ENABLE ROW LEVEL SECURITY;

-- ===== 5. PROFILES =====
-- RLS Activation (les politiques existent déjà dans schema.sql)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== 6. STEPS =====
-- RLS Activation (les politiques existent déjà dans schema.sql)
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;

-- ===== 7. TASKS =====
-- RLS Activation (les politiques existent déjà dans schema.sql)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ===== 8. VERSIONS =====
-- RLS Activation (les politiques existent déjà dans schema.sql)
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;

-- ===== 9. TRANSLATION_SETTINGS =====
-- Créer les politiques RLS pour translation_settings
ALTER TABLE public.translation_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS translation_settings_read ON public.translation_settings;
DROP POLICY IF EXISTS translation_settings_admin ON public.translation_settings;

-- Politique 1: Lecture pour tous les utilisateurs authentifiés
CREATE POLICY translation_settings_read ON public.translation_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique 2: Modification/insertion seulement pour les admins
CREATE POLICY translation_settings_admin ON public.translation_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'administrateur'))
  );

CREATE POLICY translation_settings_update_admin ON public.translation_settings
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'administrateur'))
  )
  WITH CHECK (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'administrateur'))
  );

CREATE POLICY translation_settings_delete_admin ON public.translation_settings
  FOR DELETE
  TO authenticated
  USING (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'administrateur'))
  );

-- ================================================================
-- VÉRIFICATION - Lister toutes les tables publiques et leur RLS
-- ================================================================
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

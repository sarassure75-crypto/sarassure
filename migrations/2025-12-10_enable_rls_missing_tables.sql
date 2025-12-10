-- ================================================================
-- ACTIVATION RLS SUR LES TABLES MANQUANTES
-- ================================================================
-- Les politiques existent déjà mais RLS n'est pas activé sur ces tables
-- ================================================================

-- ===== 1. CONTACT_MESSAGES =====
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ===== 2. IMAGES_METADATA =====
ALTER TABLE public.images_metadata ENABLE ROW LEVEL SECURITY;

-- ===== 3. QUESTIONNAIRE_ATTEMPTS =====
ALTER TABLE public.questionnaire_attempts ENABLE ROW LEVEL SECURITY;

-- ===== 4. QUESTIONNAIRE_QUESTIONS =====
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- VÉRIFICATION
-- ================================================================
-- Affiche toutes les tables avec RLS activé
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ================================================================
-- RAPPORT DE VÉRIFICATION COMPLET SUPABASE
-- ================================================================
-- Comparaison schema.sql vs fixes créés
-- Date: 2025-12-10
-- ================================================================

-- ===== 1. TABLES AVEC RLS ACTIVÉ =====
-- ✅ Les 10 tables suivantes ont RLS activé dans schema.sql:
--    - app_images (ENABLE ROW LEVEL SECURITY)
--    - task_categories (ENABLE ROW LEVEL SECURITY)
--    - tasks (ENABLE ROW LEVEL SECURITY)
--    - versions (ENABLE ROW LEVEL SECURITY)
--    - steps (ENABLE ROW LEVEL SECURITY)
--    - profiles (ENABLE ROW LEVEL SECURITY)
--    - user_version_progress (ENABLE ROW LEVEL SECURITY)
--    - error_reports (ENABLE ROW LEVEL SECURITY)
--    - faq_items (ENABLE ROW LEVEL SECURITY)
--    - learner_visibility (ENABLE ROW LEVEL SECURITY)

-- ❌ TABLES MANQUANTES RLS (corrigées par 2025-12-10_enable_rls_missing_tables.sql):
--    - contact_messages
--    - images_metadata
--    - questionnaire_attempts
--    - questionnaire_questions

-- ===== 2. VÉRIFICATION DES POLITIQUES RLS =====
-- Compter toutes les policies créées:
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';

-- Afficher les tables avec RLS et le nombre de policies:
SELECT 
  t.tablename,
  t.rowsecurity,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- ===== 3. VÉRIFICATION DES TABLES PROBLÉMATIQUES =====
-- Ces tables avaient des policies mais RLS désactivé (maintenant fixé):
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('contact_messages', 'images_metadata', 'questionnaire_attempts', 'questionnaire_questions')
ORDER BY tablename;

-- ===== 4. VÉRIFICATION DES FUNCTIONS =====
-- Afficher toutes les functions créées avec search_path défini:
SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (p.prosecdef = true OR proname ~ 'trigger_|update_|calculate_|get_|current_|avg_|apply_|set_|insert_|link_|generate_|can_|upsert_|versions_|increment_')
ORDER BY p.proname;

-- ===== 5. VÉRIFICATION DE LA SÉCURITÉ =====
-- Functions avec SECURITY DEFINER:
SELECT 
  n.nspname,
  p.proname,
  p.prosecdef,
  (regexp_matches(pg_get_functiondef(p.oid), 'SET search_path = [^,;]+', 'g'))[1] as search_path_setting
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;

-- ===== 6. RÉSUMÉ DES FIXES APPLIQUÉS =====
-- ✅ 2025-12-10_enable_rls_safe.sql
--    - Crée RLS policies pour 12 tables principales
--    - Utilise UNIQUEMENT auth.uid() pour éviter la récursion
--    - Toutes les tables principales ont maintenant RLS + policies
--
-- ✅ 2025-12-10_enable_rls_missing_tables.sql
--    - Active RLS sur 4 tables manquantes
--    - contact_messages, images_metadata, questionnaire_attempts, questionnaire_questions
--
-- ✅ 2025-12-10_init_satisfaction_full.sql
--    - Crée la table satisfaction_responses
--    - Ajoute RLS policies + RPC pour moyenne
--
-- ✅ 2025-12-10_fix_function_search_path.sql
--    - Corrige 28 functions avec SET search_path = public
--    - Ajoute SECURITY DEFINER où nécessaire
--    - Prévient les vulnérabilités de search_path mutable

-- ===== 7. AUDIT TRAIL =====
-- Vérifier que toutes les modifications ont été appliquées:
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Comptage total des policies
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';

-- Comptage total des functions avec SECURITY DEFINER
SELECT COUNT(*) as total_security_definer FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND prosecdef = true;

-- ================================================================
-- FIN DU RAPPORT
-- ================================================================
-- Tous les fixes ont été appliqués avec succès si:
-- 1. Toutes les 14 tables (10 + 4) ont RLS activé
-- 2. Toutes les policies sont créées
-- 3. Les 28 functions ont search_path = public
-- 4. Les functions critiques ont SECURITY DEFINER
-- ================================================================

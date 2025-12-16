-- ================================================================
-- CORRIGER LES PROBLÈMES DE SÉCURITÉ DÉTECTÉS PAR LE LINTER
-- ================================================================
-- Cette migration corrige :
-- 1. security_definer_view: Enlever SECURITY DEFINER de glossary_with_variants
-- 2. function_search_path_mutable: Ajouter SET search_path aux 4 fonctions trigger
-- ================================================================

-- ===== 1. CORRIGER LES VUES glossary_with_variant* =====
-- Enlever SECURITY DEFINER (les utilisateurs respecteront leurs propres RLS)
-- Supprimer TOUTES les vues existantes (variant/variants singulier/pluriel)
DROP VIEW IF EXISTS public.glossary_with_variant CASCADE;
DROP VIEW IF EXISTS public.glossary_with_variants CASCADE;

-- Recréer la vue sans SECURITY DEFINER
CREATE VIEW public.glossary_with_variants AS
SELECT 
  g.id,
  g.term,
  g.definition,
  g.example,
  g.category,
  g.related_terms,
  g.variants,
  g.is_active,
  g.created_at,
  g.updated_at,
  g.created_by,
  (
    SELECT json_agg(json_build_object('id', gv.id, 'variant', gv.variant))
    FROM public.glossary_variants gv
    WHERE gv.glossary_id = g.id
  ) as variants_list
FROM public.glossary g
WHERE g.is_active = true;

-- Ajouter un commentaire
COMMENT ON VIEW public.glossary_with_variants IS 'Vue publique du lexique avec variantes (RLS standard)';

-- ===== 2. CORRIGER LES FONCTIONS TRIGGER - AJOUTER SET search_path =====

-- 1. update_glossary_updated_at
DROP FUNCTION IF EXISTS public.update_glossary_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_glossary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_catalog';

-- Recréer le trigger
DROP TRIGGER IF EXISTS update_glossary_updated_at_trigger ON public.glossary;
CREATE TRIGGER update_glossary_updated_at_trigger
    BEFORE UPDATE ON public.glossary
    FOR EACH ROW
    EXECUTE FUNCTION public.update_glossary_updated_at();

-- 2. update_glossary_translations_updated_at
DROP FUNCTION IF EXISTS public.update_glossary_translations_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_glossary_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_catalog';

-- Recréer le trigger
DROP TRIGGER IF EXISTS update_glossary_translations_updated_at_trigger ON public.glossary_translations;
CREATE TRIGGER update_glossary_translations_updated_at_trigger
    BEFORE UPDATE ON public.glossary_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_glossary_translations_updated_at();

-- 3. update_questionnaire_question_translations_updated_at
DROP FUNCTION IF EXISTS public.update_questionnaire_question_translations_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_questionnaire_question_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_catalog';

-- Recréer le trigger
DROP TRIGGER IF EXISTS update_questionnaire_question_translations_updated_at_trigger ON public.questionnaire_question_translations;
CREATE TRIGGER update_questionnaire_question_translations_updated_at_trigger
    BEFORE UPDATE ON public.questionnaire_question_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_questionnaire_question_translations_updated_at();

-- 4. update_questionnaire_choice_translations_updated_at
DROP FUNCTION IF EXISTS public.update_questionnaire_choice_translations_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_questionnaire_choice_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_catalog';

-- Recréer le trigger
DROP TRIGGER IF EXISTS update_questionnaire_choice_translations_updated_at_trigger ON public.questionnaire_choice_translations;
CREATE TRIGGER update_questionnaire_choice_translations_updated_at_trigger
    BEFORE UPDATE ON public.questionnaire_choice_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_questionnaire_choice_translations_updated_at();

-- ================================================================
-- VÉRIFICATION
-- ================================================================
-- Lister les fonctions avec leur search_path
SELECT 
  routines.routine_schema,
  routines.routine_name,
  routines.routine_definition
FROM information_schema.routines
WHERE routines.routine_schema = 'public'
  AND (
    routines.routine_name LIKE 'update_%_updated_at'
    OR routines.routine_name LIKE 'glossary_%'
  )
ORDER BY routines.routine_name;

-- Vérifier la vue
SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'glossary_with_variants';

-- ================================================================
-- FIX IMAGE DELETION CONSTRAINT
-- ================================================================
-- Date: 2025-01-12
-- Objectif: Permettre la suppression d'images sans erreur de contrainte FK
-- 
-- Problème: 
-- L'erreur "update or delete on table 'app_images' violates foreign key constraint
-- 'questionnaire_questions_image_id_fkey' on table 'questionnaire_questions'"
-- empêche la suppression d'images référencées dans les questions de questionnaires.
--
-- Solution:
-- Modifier la contrainte FK pour SET NULL au lieu de RESTRICT
-- Ainsi, quand une image est supprimée, image_id devient NULL dans les questions
-- ================================================================

-- 1. Supprimer l'ancienne contrainte FK sur questionnaire_questions
ALTER TABLE public.questionnaire_questions
DROP CONSTRAINT IF EXISTS questionnaire_questions_image_id_fkey;

-- 2. Recréer la contrainte avec ON DELETE SET NULL
ALTER TABLE public.questionnaire_questions
ADD CONSTRAINT questionnaire_questions_image_id_fkey
FOREIGN KEY (image_id)
REFERENCES public.app_images(id)
ON DELETE SET NULL;

-- 3. Faire la même chose pour questionnaire_choices (les réponses aux questions)
ALTER TABLE public.questionnaire_choices
DROP CONSTRAINT IF EXISTS questionnaire_choices_image_id_fkey;

ALTER TABLE public.questionnaire_choices
ADD CONSTRAINT questionnaire_choices_image_id_fkey
FOREIGN KEY (image_id)
REFERENCES public.app_images(id)
ON DELETE SET NULL;

-- 4. Vérification optionnelle : lister toutes les contraintes FK vers app_images
-- (pour s'assurer qu'on n'a rien oublié)
DO $$
DECLARE
    i RECORD;
BEGIN
    RAISE NOTICE '=== CONTRAINTES FK VERS APP_IMAGES ===';
    FOR i IN
        SELECT
            tc.table_schema,
            tc.table_name,
            tc.constraint_name,
            rc.update_rule,
            rc.delete_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'app_images'
          AND tc.table_schema = 'public'
    LOOP
        RAISE NOTICE 'Table: %.% | Constraint: % | ON UPDATE: % | ON DELETE: %',
            i.table_schema, i.table_name, i.constraint_name, i.update_rule, i.delete_rule;
    END LOOP;
END $$;

-- ================================================================
-- COMMENTAIRES
-- ================================================================

COMMENT ON CONSTRAINT questionnaire_questions_image_id_fkey ON public.questionnaire_questions IS 
'FK vers app_images avec ON DELETE SET NULL - permet la suppression d''images sans casser les questions';

COMMENT ON CONSTRAINT questionnaire_choices_image_id_fkey ON public.questionnaire_choices IS 
'FK vers app_images avec ON DELETE SET NULL - permet la suppression d''images sans casser les réponses';

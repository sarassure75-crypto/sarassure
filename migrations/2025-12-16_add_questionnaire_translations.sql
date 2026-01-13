-- Migration: Créer les tables de traductions pour les QCM
-- Date: 2025-12-16
-- Description: Stocke les traductions des questions et réponses des QCM dans différentes langues

-- Créer la table questionnaire_question_translations
CREATE TABLE IF NOT EXISTS public.questionnaire_question_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    question_id uuid NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
    language_code text NOT NULL, -- 'fr', 'en', 'es', 'de', 'it', etc.
    translated_instruction text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    translated_by uuid DEFAULT auth.uid(),
    UNIQUE(question_id, language_code)
);

-- Créer des indexes pour questionnaire_question_translations
CREATE INDEX IF NOT EXISTS idx_questionnaire_question_translations_question_id ON public.questionnaire_question_translations USING btree (question_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_question_translations_language ON public.questionnaire_question_translations USING btree (language_code);

-- Ajouter des commentaires
COMMENT ON TABLE public.questionnaire_question_translations IS 'Traductions des instructions des questions de QCM dans différentes langues';
COMMENT ON COLUMN public.questionnaire_question_translations.language_code IS 'Code ISO de la langue (fr, en, es, de, it, etc.)';

-- Créer la table questionnaire_choice_translations
CREATE TABLE IF NOT EXISTS public.questionnaire_choice_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    choice_id uuid NOT NULL REFERENCES public.questionnaire_choices(id) ON DELETE CASCADE,
    language_code text NOT NULL, -- 'fr', 'en', 'es', 'de', 'it', etc.
    translated_choice_text text NOT NULL,
    translated_feedback text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    translated_by uuid DEFAULT auth.uid(),
    UNIQUE(choice_id, language_code)
);

-- Créer des indexes pour questionnaire_choice_translations
CREATE INDEX IF NOT EXISTS idx_questionnaire_choice_translations_choice_id ON public.questionnaire_choice_translations USING btree (choice_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_choice_translations_language ON public.questionnaire_choice_translations USING btree (language_code);

-- Ajouter des commentaires
COMMENT ON TABLE public.questionnaire_choice_translations IS 'Traductions des réponses et retours des QCM dans différentes langues';
COMMENT ON COLUMN public.questionnaire_choice_translations.language_code IS 'Code ISO de la langue (fr, en, es, de, it, etc.)';

-- Ajouter les fonctions de mise à jour du timestamp
CREATE OR REPLACE FUNCTION public.update_questionnaire_question_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_questionnaire_choice_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
DROP TRIGGER IF EXISTS update_questionnaire_question_translations_updated_at_trigger ON public.questionnaire_question_translations;
CREATE TRIGGER update_questionnaire_question_translations_updated_at_trigger
    BEFORE UPDATE ON public.questionnaire_question_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_questionnaire_question_translations_updated_at();

DROP TRIGGER IF EXISTS update_questionnaire_choice_translations_updated_at_trigger ON public.questionnaire_choice_translations;
CREATE TRIGGER update_questionnaire_choice_translations_updated_at_trigger
    BEFORE UPDATE ON public.questionnaire_choice_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_questionnaire_choice_translations_updated_at();

-- Activer RLS
ALTER TABLE public.questionnaire_question_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_choice_translations ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS questionnaire_question_translations_read ON public.questionnaire_question_translations;
DROP POLICY IF EXISTS questionnaire_question_translations_admin ON public.questionnaire_question_translations;
DROP POLICY IF EXISTS questionnaire_choice_translations_read ON public.questionnaire_choice_translations;
DROP POLICY IF EXISTS questionnaire_choice_translations_admin ON public.questionnaire_choice_translations;

-- Ajouter les politiques RLS (lectures publiques pour les traductions)

-- questionnaire_question_translations policies
CREATE POLICY questionnaire_question_translations_read
    ON public.questionnaire_question_translations
    FOR SELECT
    USING (true);

CREATE POLICY questionnaire_question_translations_insert
    ON public.questionnaire_question_translations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY questionnaire_question_translations_update
    ON public.questionnaire_question_translations
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY questionnaire_question_translations_delete
    ON public.questionnaire_question_translations
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- questionnaire_choice_translations policies
CREATE POLICY questionnaire_choice_translations_read
    ON public.questionnaire_choice_translations
    FOR SELECT
    USING (true);

CREATE POLICY questionnaire_choice_translations_insert
    ON public.questionnaire_choice_translations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY questionnaire_choice_translations_update
    ON public.questionnaire_choice_translations
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY questionnaire_choice_translations_delete
    ON public.questionnaire_choice_translations
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

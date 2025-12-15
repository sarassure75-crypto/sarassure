-- Migration: Créer la table de traductions du lexique
-- Date: 2025-12-15
-- Description: Stocke les traductions des termes du lexique dans différentes langues

-- Créer la table glossary_translations
CREATE TABLE IF NOT EXISTS public.glossary_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    glossary_id uuid NOT NULL REFERENCES public.glossary(id) ON DELETE CASCADE,
    language_code text NOT NULL, -- 'fr', 'en', 'es', 'de', 'it', etc.
    translated_term text NOT NULL,
    translated_definition text NOT NULL,
    translated_example text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    translated_by uuid DEFAULT auth.uid(),
    UNIQUE(glossary_id, language_code)
);

-- Créer des indexes
CREATE INDEX IF NOT EXISTS idx_glossary_translations_glossary_id ON public.glossary_translations USING btree (glossary_id);
CREATE INDEX IF NOT EXISTS idx_glossary_translations_language ON public.glossary_translations USING btree (language_code);
CREATE INDEX IF NOT EXISTS idx_glossary_translations_term ON public.glossary_translations USING btree (translated_term);

-- Ajouter un commentaire
COMMENT ON TABLE public.glossary_translations IS 'Traductions des termes du lexique dans différentes langues';
COMMENT ON COLUMN public.glossary_translations.language_code IS 'Code ISO de la langue (fr, en, es, de, it, etc.)';

-- Ajouter la fonction de mise à jour du timestamp
CREATE OR REPLACE FUNCTION public.update_glossary_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS update_glossary_translations_updated_at_trigger ON public.glossary_translations;
CREATE TRIGGER update_glossary_translations_updated_at_trigger
    BEFORE UPDATE ON public.glossary_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_glossary_translations_updated_at();

-- Activer RLS
ALTER TABLE public.glossary_translations ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS glossary_translations_read ON public.glossary_translations;
DROP POLICY IF EXISTS glossary_translations_admin ON public.glossary_translations;

-- Politique RLS: Lecture publique
CREATE POLICY glossary_translations_read ON public.glossary_translations
    FOR SELECT
    USING (true);

-- Politique RLS: Modification admin seulement
CREATE POLICY glossary_translations_admin ON public.glossary_translations
    FOR ALL
    USING (
        (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
    );

-- Créer une table pour les paramètres de traduction
CREATE TABLE IF NOT EXISTS public.translation_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    language_code text NOT NULL UNIQUE,
    language_name text NOT NULL,
    is_active boolean DEFAULT true,
    auto_translate boolean DEFAULT false, -- Utiliser traduction automatique
    translator_api text, -- 'google', 'deepl', 'custom'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_translation_settings_language ON public.translation_settings USING btree (language_code);

-- Ajouter les commentaires
COMMENT ON TABLE public.translation_settings IS 'Configuration des langues de traduction disponibles';

-- Insérer les langues de base
INSERT INTO public.translation_settings (language_code, language_name, is_active, auto_translate, translator_api)
VALUES
    ('fr', 'Français', true, false, 'custom'),
    ('en', 'Anglais', true, false, 'custom'),
    ('es', 'Espagnol', true, false, 'custom'),
    ('de', 'Allemand', true, false, 'custom'),
    ('it', 'Italien', true, false, 'custom'),
    ('pt', 'Portugais', true, false, 'custom'),
    ('nl', 'Néerlandais', false, false, 'custom')
ON CONFLICT (language_code) DO NOTHING;

-- Ajouter les traductions de base pour les 10 termes (exemple pour l'anglais)
INSERT INTO public.glossary_translations (glossary_id, language_code, translated_term, translated_definition, translated_example)
SELECT 
    g.id, 
    'en',
    CASE g.term
        WHEN 'Scroll' THEN 'Scroll'
        WHEN 'Paramètres' THEN 'Settings'
        WHEN 'Icônes' THEN 'Icons'
        WHEN 'Glissement' THEN 'Swipe'
        WHEN 'Défilement' THEN 'Scrolling'
        WHEN 'Bouton Power' THEN 'Power Button'
        WHEN 'Volume' THEN 'Volume'
        WHEN 'Écran d''accueil' THEN 'Home Screen'
        WHEN 'Application' THEN 'Application'
        WHEN 'Notification' THEN 'Notification'
    END,
    CASE g.term
        WHEN 'Scroll' THEN 'The action of moving content on the screen up or down by sliding your finger.'
        WHEN 'Paramètres' THEN 'Menu where you can configure options and preferences of your phone or application.'
        WHEN 'Icônes' THEN 'Small images or symbols representing applications, actions or features.'
        WHEN 'Glissement' THEN 'The action of moving your finger across the screen in a direction (up, down, left, right).'
        WHEN 'Défilement' THEN 'Movement of content on screen to see more information beyond visible limits.'
        WHEN 'Bouton Power' THEN 'Physical button on the side of the phone used to turn the device on/off or lock the screen.'
        WHEN 'Volume' THEN 'Sound intensity of your phone, adjusted via the volume buttons on the side of the device.'
        WHEN 'Écran d''accueil' THEN 'First screen you see when you turn on your phone, displaying apps and widgets.'
        WHEN 'Application' THEN 'Software program installed on your phone that performs a specific function.'
        WHEN 'Notification' THEN 'Message or alert that appears on your screen to inform you of an event or update.'
    END,
    CASE g.term
        WHEN 'Scroll' THEN 'Slide your finger down to scroll to the bottom of the page.'
        WHEN 'Paramètres' THEN 'Open Settings to change your screen brightness.'
        WHEN 'Icônes' THEN 'Tap the camera icon to take a photo.'
        WHEN 'Glissement' THEN 'Swipe right to return to the previous screen.'
        WHEN 'Défilement' THEN 'Use scrolling to see all messages.'
        WHEN 'Bouton Power' THEN 'Press the Power Button to lock your phone.'
        WHEN 'Volume' THEN 'Use the Volume buttons to increase the music sound.'
        WHEN 'Écran d''accueil' THEN 'Long press on the Home Screen to add a widget.'
        WHEN 'Application' THEN 'Open an Application to check your emails.'
        WHEN 'Notification' THEN 'A Notification will alert you when you receive a message.'
    END
FROM public.glossary g
WHERE g.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM public.glossary_translations gt 
    WHERE gt.glossary_id = g.id AND gt.language_code = 'en'
);

-- Afficher les résultats
SELECT 'Langues configurées:' as info;
SELECT language_code, language_name FROM public.translation_settings ORDER BY language_name;

SELECT 'Traductions ajoutées:' as info;
SELECT gt.language_code, COUNT(*) as count 
FROM public.glossary_translations gt 
GROUP BY gt.language_code;

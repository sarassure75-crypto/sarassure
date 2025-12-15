-- Migration: Créer la table du lexique (glossaire)
-- Date: 2025-12-15
-- Description: Table pour stocker les termes et définitions du lexique utilisés dans les exercices

-- Créer la table glossary
CREATE TABLE IF NOT EXISTS public.glossary (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    term text NOT NULL UNIQUE,
    definition text NOT NULL,
    category text NOT NULL DEFAULT 'general',
    example text,
    related_terms text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    is_active boolean DEFAULT true
);

-- Ajouter un commentaire à la table
COMMENT ON TABLE public.glossary IS 'Lexique/Glossaire des termes utilisés dans les exercices (scroll, paramètres, icônes, etc.)';
COMMENT ON COLUMN public.glossary.term IS 'Le terme du lexique (ex: scroll, paramètres, icônes)';
COMMENT ON COLUMN public.glossary.definition IS 'La définition complète du terme';
COMMENT ON COLUMN public.glossary.category IS 'Catégorie du terme (general, gestion, interaction, etc.)';
COMMENT ON COLUMN public.glossary.example IS 'Exemple d''utilisation optionnel';
COMMENT ON COLUMN public.glossary.related_terms IS 'Tableau des termes connexes';

-- Créer un index sur le terme pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_glossary_term ON public.glossary USING btree (term);
CREATE INDEX IF NOT EXISTS idx_glossary_category ON public.glossary USING btree (category);
CREATE INDEX IF NOT EXISTS idx_glossary_active ON public.glossary USING btree (is_active);

-- Ajouter la fonction de mise à jour du timestamp
CREATE OR REPLACE FUNCTION public.update_glossary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour la mise à jour du timestamp
DROP TRIGGER IF EXISTS update_glossary_updated_at_trigger ON public.glossary;
CREATE TRIGGER update_glossary_updated_at_trigger
    BEFORE UPDATE ON public.glossary
    FOR EACH ROW
    EXECUTE FUNCTION public.update_glossary_updated_at();

-- Activer RLS
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Tout le monde peut lire les termes actifs
CREATE POLICY glossary_read_active ON public.glossary
    FOR SELECT
    USING (is_active = true);

-- Politique RLS: Seulement les admins peuvent créer/modifier/supprimer
CREATE POLICY glossary_admin_all ON public.glossary
    FOR ALL
    USING (
        (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
    );

-- Insérer des termes de lexique de base
INSERT INTO public.glossary (term, definition, category, example, related_terms, is_active)
VALUES
    ('Scroll', 'Action de faire défiler le contenu de l''écran vers le haut ou vers le bas en glissant le doigt sur l''écran.', 'interaction', 'Faites glisser votre doigt vers le bas pour scroll jusqu''en bas de la page.', ARRAY['Glissement', 'Défilement'], true),
    ('Paramètres', 'Menu où vous pouvez configurer les options et préférences de votre téléphone ou application.', 'gestion', 'Ouvrez les Paramètres pour modifier la luminosité de votre écran.', ARRAY['Réglages', 'Préférences'], true),
    ('Icônes', 'Petites images ou symboles qui représentent des applications, des actions ou des fonctionnalités.', 'interface', 'Appuyez sur l''icône de la caméra pour prendre une photo.', ARRAY['Symbole', 'Logo'], true),
    ('Glissement', 'Action de faire passer votre doigt sur l''écran dans une direction (haut, bas, gauche, droite).', 'interaction', 'Faites un glissement vers la droite pour revenir à l''écran précédent.', ARRAY['Scroll', 'Swipe'], true),
    ('Défilement', 'Mouvement du contenu à l''écran pour voir plus d''informations au-delà des limites visibles.', 'interaction', 'Utilisez le défilement pour voir toutes les messages.', ARRAY['Scroll'], true),
    ('Bouton Power', 'Bouton physique sur le côté du téléphone qui sert à allumer/éteindre l''appareil ou verrouiller l''écran.', 'matériel', 'Appuyez sur le Bouton Power pour verrouiller votre téléphone.', ARRAY['Bouton d''alimentation'], true),
    ('Volume', 'Intensité du son de votre téléphone, ajustée via les boutons de volume sur le côté du téléphone.', 'audio', 'Utilisez les boutons de Volume pour augmenter le son de la musique.', ARRAY['Intensité sonore'], true),
    ('Écran d''accueil', 'Premier écran que vous voyez quand vous allumez votre téléphone, affichant les applications et widgets.', 'interface', 'Maintenez appuyé sur l''Écran d''accueil pour ajouter un widget.', ARRAY['Home', 'Accueil'], true),
    ('Application', 'Programme logiciel installé sur votre téléphone qui effectue une fonction spécifique.', 'general', 'Ouvrez une Application pour consulter vos emails.', ARRAY['App', 'Logiciel'], true),
    ('Notification', 'Message ou alerte qui apparaît sur votre écran pour vous informer d''un événement ou d''une mise à jour.', 'interface', 'Une Notification vous avertira quand vous recevez un message.', ARRAY['Alerte'], true);

-- Afficher les données insérées
SELECT term, definition, category FROM public.glossary WHERE is_active = true ORDER BY term;

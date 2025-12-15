-- Migration: Ajouter langue de traduction préférée au profil
-- Date: 2025-12-15
-- Description: Ajoute un champ pour stocker la langue de traduction préférée de l'apprenant

-- Ajouter colonne si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_translation_language text DEFAULT 'fr';

-- Ajouter un commentaire
COMMENT ON COLUMN public.profiles.preferred_translation_language IS 'Langue de traduction préférée de l''apprenant (fr, en, es, de, it, pt, nl)';

-- Vérifier les résultats
SELECT 'Colonne ajoutée au profil' as info;
SELECT COUNT(*) as total_profiles, 
       COUNT(preferred_translation_language) as with_language
FROM public.profiles;

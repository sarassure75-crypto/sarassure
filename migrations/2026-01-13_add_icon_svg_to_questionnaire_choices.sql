-- Migration: Ajouter icon_svg à questionnaire_choices
-- Date: 2026-01-13
-- Description: Permet de stocker le SVG des icônes pour les réponses des QCM

-- Ajouter la colonne icon_svg à questionnaire_choices
ALTER TABLE public.questionnaire_choices 
ADD COLUMN IF NOT EXISTS icon_svg text;

-- Commentaire sur la colonne
COMMENT ON COLUMN public.questionnaire_choices.icon_svg IS 
'SVG string de l''icône utilisée pour la réponse (optionnel). Permet d''afficher l''icône sans avoir à regénérer le SVG depuis le composant React.';

-- Note: Cette colonne est optionnelle et peut être NULL si la réponse n'utilise pas d'icône
-- Elle complète les champs image_id et image_name existants

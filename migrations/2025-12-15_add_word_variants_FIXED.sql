-- Migration CORRIGÉE: Ajouter support des variantes de mots au lexique
-- FIX: glossary_id doit être UUID (pas bigint) pour correspondre à glossary.id

-- 1. Ajouter colonne variants à la table glossary
ALTER TABLE public.glossary
ADD COLUMN IF NOT EXISTS variants TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN public.glossary.variants IS 'Variantes du terme (ex: [glisse, glisser, glissement])';

-- 2. Créer une table de variantes avec type UUID correct
CREATE TABLE IF NOT EXISTS public.glossary_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  glossary_id UUID NOT NULL REFERENCES public.glossary(id) ON DELETE CASCADE,
  variant TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT glossary_variants_glossary_id_fkey FOREIGN KEY (glossary_id) REFERENCES public.glossary(id) ON DELETE CASCADE
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_glossary_variants_variant ON public.glossary_variants(variant);
CREATE INDEX IF NOT EXISTS idx_glossary_variants_glossary_id ON public.glossary_variants(glossary_id);

-- 3. Mettre à jour les termes existants avec leurs variantes

-- Terme: Glissement
UPDATE public.glossary 
SET variants = ARRAY['glisse', 'glisser', 'glissant', 'glissements']
WHERE term = 'Glissement' AND is_active = true;

-- Insérer les variantes dans la table associée
INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Glissement'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Scroll (variantes: scroller, scrolling)
UPDATE public.glossary 
SET variants = ARRAY['scroller', 'scrolling', 'scroll']
WHERE term = 'Scroll' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Scroll'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Paramètres (variantes: paramètre, paramétrer, paramétrages)
UPDATE public.glossary 
SET variants = ARRAY['paramètre', 'paramétrer', 'paramétrages', 'paramétrés']
WHERE term = 'Paramètres' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Paramètres'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Icônes (variantes: icône)
UPDATE public.glossary 
SET variants = ARRAY['icône', 'icones']
WHERE term = 'Icônes' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Icônes'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Bouton Power (variantes: boutons power, bouton puissance)
UPDATE public.glossary 
SET variants = ARRAY['boutons power', 'bouton puissance', 'puissance', 'power']
WHERE term = 'Bouton Power' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Bouton Power'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Volume (variantes: augmenter, diminuer, sons, audio)
UPDATE public.glossary 
SET variants = ARRAY['augmenter', 'diminuer', 'sons', 'audio', 'bruit']
WHERE term = 'Volume' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Volume'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Notification (variantes: notifications, notifier, alertes, alerte)
UPDATE public.glossary 
SET variants = ARRAY['notifications', 'notifier', 'alertes', 'alerte', 'messages']
WHERE term = 'Notification' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Notification'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Application (variantes: appli, logiciel, programme, apps)
UPDATE public.glossary 
SET variants = ARRAY['appli', 'applis', 'logiciel', 'logiciels', 'programme', 'programmes', 'apps', 'software']
WHERE term = 'Application' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Application'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Écran d'accueil (variantes: accueil, écran, home, écrans)
UPDATE public.glossary 
SET variants = ARRAY['accueil', 'écran', 'home', 'écrans', 'd''accueil']
WHERE term = 'Écran d''accueil' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Écran d''accueil'
ON CONFLICT (variant) DO NOTHING;

-- Terme: Défilement (variantes: dérouler, scroller, faire défiler, déroulé, défileuse)
UPDATE public.glossary 
SET variants = ARRAY['dérouler', 'scroller', 'faire défiler', 'déroulé', 'défileuse', 'déroulable']
WHERE term = 'Défilement' AND is_active = true;

INSERT INTO public.glossary_variants (glossary_id, variant)
SELECT g.id, variant FROM public.glossary g, UNNEST(g.variants) as variant
WHERE g.term = 'Défilement'
ON CONFLICT (variant) DO NOTHING;

-- 4. Créer une vue pour faciliter la recherche
DROP VIEW IF EXISTS public.glossary_with_variants CASCADE;

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
  COALESCE(
    ARRAY_AGG(DISTINCT gv.variant) FILTER (WHERE gv.variant IS NOT NULL),
    ARRAY[]::TEXT[]
  ) as all_variants
FROM public.glossary g
LEFT JOIN public.glossary_variants gv ON g.id = gv.glossary_id
WHERE g.is_active = true
GROUP BY g.id, g.term, g.definition, g.example, g.category, g.related_terms, g.variants, g.is_active, g.created_at;

-- 5. RLS pour la table variants (lecture seule, modification admin)
ALTER TABLE public.glossary_variants ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "glossary_variants_select_public" ON public.glossary_variants;
DROP POLICY IF EXISTS "glossary_variants_insert_admin" ON public.glossary_variants;
DROP POLICY IF EXISTS "glossary_variants_update_admin" ON public.glossary_variants;
DROP POLICY IF EXISTS "glossary_variants_delete_admin" ON public.glossary_variants;

-- Créer les nouvelles policies
CREATE POLICY "glossary_variants_select_public" ON public.glossary_variants
  FOR SELECT USING (true);

CREATE POLICY "glossary_variants_insert_admin" ON public.glossary_variants
  FOR INSERT 
  WITH CHECK (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
        AND au.raw_user_meta_data ->> 'role' = 'admin'
    )
  );

CREATE POLICY "glossary_variants_update_admin" ON public.glossary_variants
  FOR UPDATE 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
        AND au.raw_user_meta_data ->> 'role' = 'admin'
    )
  );

CREATE POLICY "glossary_variants_delete_admin" ON public.glossary_variants
  FOR DELETE 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
        AND au.raw_user_meta_data ->> 'role' = 'admin'
    )
  );

-- 6. Afficher résumé
SELECT 'Migration complétée avec succès!' as status;

-- Vérifier les variantes ajoutées
SELECT 'Variantes ajoutées:' as info,
  COUNT(DISTINCT glossary_id) as nombre_termes,
  COUNT(*) as total_variantes
FROM public.glossary_variants;

-- Afficher les termes avec variantes
SELECT term, array_length(variants, 1) as nb_variantes
FROM public.glossary
WHERE is_active = true
  AND (variants IS NOT NULL AND array_length(variants, 1) > 0)
ORDER BY term;

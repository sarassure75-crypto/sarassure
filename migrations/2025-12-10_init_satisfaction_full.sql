-- Initialisation: table de satisfaction + RPC + politiques RLS
-- Exécuter dans Supabase SQL Editor (un seul script)

-- 1) Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.satisfaction_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2) Index utiles
CREATE INDEX IF NOT EXISTS idx_satisfaction_learner_id ON public.satisfaction_responses(learner_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_created_at ON public.satisfaction_responses(created_at);

-- 3) Activer RLS pour cette table (sécurisé par politiques ci-dessous)
ALTER TABLE public.satisfaction_responses ENABLE ROW LEVEL SECURITY;

-- 4) Politiques RLS
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "authenticated_read_satisfaction" ON public.satisfaction_responses;
DROP POLICY IF EXISTS "authenticated_insert_own_satisfaction" ON public.satisfaction_responses;
DROP POLICY IF EXISTS "authenticated_update_own_satisfaction" ON public.satisfaction_responses;

-- Allow authenticated users to read ratings (read-only)
CREATE POLICY "authenticated_read_satisfaction"
ON public.satisfaction_responses FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert their own response
CREATE POLICY "authenticated_insert_own_satisfaction"
ON public.satisfaction_responses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = learner_id);

-- Allow users to update their own response (optional)
CREATE POLICY "authenticated_update_own_satisfaction"
ON public.satisfaction_responses FOR UPDATE
TO authenticated
USING (auth.uid() = learner_id)
WITH CHECK (auth.uid() = learner_id);

-- Deny deletes by default (no policy for DELETE)

-- 5) RPC: fonction d'agrégation moyenne (retourne numeric moyenne)
DROP FUNCTION IF EXISTS public.avg_satisfaction_rating();

CREATE OR REPLACE FUNCTION public.avg_satisfaction_rating()
RETURNS numeric
LANGUAGE sql STABLE
AS $$
  SELECT AVG(rating)::numeric FROM public.satisfaction_responses;
$$;

-- Grant execute to authenticated role (facultatif mais utile)
GRANT EXECUTE ON FUNCTION public.avg_satisfaction_rating() TO authenticated;

-- 6) Vérification rapide (affiche 0 lignes si table vide)
SELECT id, learner_id, rating, comment, created_at
FROM public.satisfaction_responses
ORDER BY created_at DESC
LIMIT 10;

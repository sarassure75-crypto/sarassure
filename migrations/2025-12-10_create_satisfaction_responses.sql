-- Migration: create satisfaction_responses table
-- Exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.satisfaction_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index pour requêtes d'agrégation
CREATE INDEX IF NOT EXISTS idx_satisfaction_created_at ON public.satisfaction_responses(created_at);

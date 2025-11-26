-- Script pour synchroniser le statut CGU des utilisateurs existants
-- À exécuter dans l'interface SQL de Supabase

-- D'abord, vérifier la structure de la table versions
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'versions';

-- Version simplifiée : mettre à jour tous les contributeurs qui ont au moins une version
UPDATE profiles 
SET 
  cgu_accepted = TRUE,
  cgu_accepted_date = CURRENT_TIMESTAMP
WHERE role = 'contributor' 
  AND cgu_accepted = FALSE
  AND id IN (
    SELECT DISTINCT user_id 
    FROM versions 
    WHERE user_id IS NOT NULL
  );

-- Vérifier le résultat
SELECT 
  id, 
  email, 
  first_name, 
  last_name,
  cgu_accepted, 
  cgu_accepted_date,
  created_at
FROM profiles 
WHERE role = 'contributor' 
ORDER BY cgu_accepted DESC, created_at DESC;
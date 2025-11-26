-- Migration: Ajouter colonnes CGU à la table profiles
-- Cela permettra de gérer le statut d'acceptation des CGU facilement

-- Ajouter les colonnes CGU
ALTER TABLE profiles 
ADD COLUMN cgu_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN cgu_accepted_date TIMESTAMP WITH TIME ZONE;

-- Ajouter un index pour les requêtes
CREATE INDEX idx_profiles_cgu_accepted ON profiles(cgu_accepted);

-- Ajouter des commentaires
COMMENT ON COLUMN profiles.cgu_accepted IS 'Indique si l\'utilisateur a accepté les CGU contributeur';
COMMENT ON COLUMN profiles.cgu_accepted_date IS 'Date d\'acceptation des CGU contributeur';

-- Mettre à jour les utilisateurs existants qui ont peut-être accepté via localStorage
-- (cette partie sera gérée par l'interface admin)

-- Vérification
SELECT id, email, role, cgu_accepted, cgu_accepted_date 
FROM profiles 
WHERE role = 'contributor';
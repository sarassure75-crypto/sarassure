-- Insérer les catégories de base pour tester les licences
-- À exécuter dans Supabase SQL Editor après la migration principale

INSERT INTO task_categories (name) VALUES
  ('Tactile'),
  ('Communication'),
  ('Électronique'),
  ('Cybersécurité')
ON CONFLICT (name) DO NOTHING;

-- Vérifier que les catégories ont bien été ajoutées
SELECT id, name FROM task_categories ORDER BY name;

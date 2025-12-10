-- Voir la structure de user_version_progress
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_version_progress'
ORDER BY ordinal_position;

-- Voir des exemples de données
SELECT * FROM user_version_progress LIMIT 5;

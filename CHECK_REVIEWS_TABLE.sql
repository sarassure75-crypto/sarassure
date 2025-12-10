-- Vérifier les tables de reviews/avis
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE '%review%' OR tablename LIKE '%avis%' OR tablename LIKE '%feedback%' OR tablename LIKE '%rating%')
ORDER BY tablename;

-- Vérifier les colonnes si la table existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('reviews', 'avis', 'feedback', 'learner_reviews', 'task_reviews')
ORDER BY table_name, ordinal_position;

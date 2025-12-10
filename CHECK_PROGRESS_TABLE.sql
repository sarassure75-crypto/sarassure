-- Vérifier s'il existe une table de suivi des apprenants
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE '%progress%' OR tablename LIKE '%completion%' OR tablename LIKE '%learner_stats%')
ORDER BY tablename;

-- Si elle existe, voir sa structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('learner_progress', 'exercise_completion', 'learner_stats', 'task_completion')
ORDER BY table_name, ordinal_position;

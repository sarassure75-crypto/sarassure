-- Vérifier s'il existe une table de suivi QCM
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE '%questionnaire%' OR tablename LIKE '%qcm%')
ORDER BY tablename;

-- Si elle existe, voir sa structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('questionnaire_responses', 'questionnaire_attempts', 'user_questionnaire_progress', 'qcm_responses')
ORDER BY table_name, ordinal_position;

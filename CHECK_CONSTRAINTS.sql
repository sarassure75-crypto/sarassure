-- FIND_UNIQUE_CONSTRAINTS.sql
-- Get exact constraint details

SELECT 
  t.constraint_name,
  t.constraint_type,
  string_agg(kcu.column_name, ', ') as columns
FROM information_schema.table_constraints t
JOIN information_schema.key_column_usage kcu 
  ON t.constraint_name = kcu.constraint_name 
  AND t.table_schema = kcu.table_schema
WHERE t.table_name = 'app_images'
  AND (t.constraint_type = 'UNIQUE' OR t.constraint_type = 'PRIMARY KEY')
GROUP BY t.constraint_name, t.constraint_type;

-- If there is a name_key constraint, show all duplicate names
SELECT 
  name,
  category,
  COUNT(*) as count,
  ARRAY_AGG(id) as ids
FROM app_images
GROUP BY name, category
HAVING COUNT(*) > 1
ORDER BY count DESC;

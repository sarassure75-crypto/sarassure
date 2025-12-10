-- Vérifier les doublons sur TOUTES les tables
SELECT tablename, policyname, COUNT(*) as count
FROM pg_policies
GROUP BY tablename, policyname
HAVING COUNT(*) > 1
ORDER BY tablename, count DESC;

-- Voir toutes les policies pour versions
SELECT policyname, tablename, qual, with_check
FROM pg_policies
WHERE tablename = 'versions'
ORDER BY policyname;

-- Voir toutes les policies pour tasks
SELECT policyname, tablename, qual, with_check
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY policyname;

-- Voir toutes les policies pour steps
SELECT policyname, tablename, qual, with_check
FROM pg_policies
WHERE tablename = 'steps'
ORDER BY policyname;

-- Voir toutes les policies pour images_metadata
SELECT policyname, tablename, qual, with_check
FROM pg_policies
WHERE tablename = 'images_metadata'
ORDER BY policyname;

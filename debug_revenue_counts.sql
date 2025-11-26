-- CORRECTION: Vérifier les images admin dans app_images (user_id = NULL)
SELECT 
    COUNT(*) as admin_images_count,
    user_id,
    'app_images' as table_name
FROM app_images 
WHERE user_id IS NULL
GROUP BY user_id;

-- Vérifier les images contributeurs dans images_metadata
SELECT 
    COUNT(*) as contributor_images_count,
    uploaded_by,
    moderation_status,
    'images_metadata' as table_name
FROM images_metadata 
WHERE uploaded_by IS NOT NULL
GROUP BY uploaded_by, moderation_status
ORDER BY uploaded_by;

-- Vérifier les exercices/versions et leur statut
SELECT 
    v.creation_status,
    t.owner_id,
    COUNT(*) as count
FROM versions v
JOIN tasks t ON v.task_id = t.id
GROUP BY v.creation_status, t.owner_id
ORDER BY t.owner_id, v.creation_status;

-- Vérifier qui sont les contributeurs
SELECT role, COUNT(*) as count 
FROM profiles 
GROUP BY role;
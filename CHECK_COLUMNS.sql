-- Vérifier les colonnes de contact_messages
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contact_messages'
ORDER BY ordinal_position;

-- Vérifier les colonnes de faq_items
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'faq_items'
ORDER BY ordinal_position;

--- Migration: Fonction RPC pour insérer les messages de contact
-- Cette fonction contourne les problèmes de RLS en étant exécutée côté serveur

-- Créer la fonction RPC
CREATE OR REPLACE FUNCTION insert_contact_message(
  p_name TEXT,
  p_email TEXT,
  p_subject TEXT,
  p_message TEXT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  is_read BOOLEAN,
  replied BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO contact_messages (name, email, subject, message)
  VALUES (p_name, p_email, p_subject, p_message)
  RETURNING 
    contact_messages.id,
    contact_messages.name,
    contact_messages.email,
    contact_messages.subject,
    contact_messages.message,
    contact_messages.is_read,
    contact_messages.replied,
    contact_messages.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions pour exécuter cette fonction
GRANT EXECUTE ON FUNCTION insert_contact_message(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION insert_contact_message(TEXT, TEXT, TEXT, TEXT) TO authenticated;

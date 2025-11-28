-- Migration: Système de gestion des demandes d'exercices
-- Permet aux admins et contributeurs de planifier et suivre les exercices à créer

-- Table principale: exercise_requests
CREATE TABLE IF NOT EXISTS exercise_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- Code unique pour référencer la demande (ex: "EX-2025-001")
    category_id INTEGER, -- Référence optionnelle vers categories (pas de FK pour éviter dépendances)
    category_name VARCHAR(100), -- Nom de catégorie en texte libre si categories n'existe pas
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
    
    -- Compteurs de versions
    validated_versions_count INTEGER DEFAULT 0,
    pending_versions_count INTEGER DEFAULT 0,
    
    -- Métadonnées
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Liens vers les exercices créés
    linked_task_ids INTEGER[] DEFAULT '{}',
    
    -- Notes et commentaires
    notes TEXT
);

-- Index pour recherche et filtres
CREATE INDEX IF NOT EXISTS idx_exercise_requests_code ON exercise_requests(code);
CREATE INDEX IF NOT EXISTS idx_exercise_requests_category ON exercise_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_exercise_requests_priority ON exercise_requests(priority);
CREATE INDEX IF NOT EXISTS idx_exercise_requests_status ON exercise_requests(status);
CREATE INDEX IF NOT EXISTS idx_exercise_requests_created_by ON exercise_requests(created_by);

-- Fonction pour générer un code unique automatiquement
CREATE OR REPLACE FUNCTION generate_exercise_request_code()
RETURNS TRIGGER AS $$
DECLARE
    year_suffix VARCHAR(4);
    sequence_num INTEGER;
    new_code VARCHAR(20);
BEGIN
    -- Si le code est déjà fourni, le garder
    IF NEW.code IS NOT NULL AND NEW.code != '' THEN
        RETURN NEW;
    END IF;
    
    -- Sinon, générer un code automatique
    year_suffix := TO_CHAR(NOW(), 'YYYY');
    
    -- Trouver le prochain numéro de séquence pour cette année
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(code FROM 'EX-' || year_suffix || '-(\d+)') AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM exercise_requests
    WHERE code LIKE 'EX-' || year_suffix || '-%';
    
    -- Formater le code (ex: EX-2025-001)
    new_code := 'EX-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 3, '0');
    NEW.code := new_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer le code
DROP TRIGGER IF EXISTS trg_generate_exercise_request_code ON exercise_requests;
CREATE TRIGGER trg_generate_exercise_request_code
    BEFORE INSERT ON exercise_requests
    FOR EACH ROW
    EXECUTE FUNCTION generate_exercise_request_code();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_exercise_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Si le status passe à "completed", enregistrer la date
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_exercise_request_timestamp ON exercise_requests;
CREATE TRIGGER trg_update_exercise_request_timestamp
    BEFORE UPDATE ON exercise_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_exercise_request_timestamp();

-- RLS Policies: Admins et contributeurs peuvent lire, seuls les admins peuvent créer/modifier
ALTER TABLE exercise_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde authentifié peut lire
CREATE POLICY "Authenticated users can read exercise requests"
    ON exercise_requests
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy: Admins et contributeurs peuvent créer
CREATE POLICY "Admins and contributors can create exercise requests"
    ON exercise_requests
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'contributor')
        )
    );

-- Policy: Admins peuvent tout modifier, contributeurs peuvent modifier leurs propres demandes
CREATE POLICY "Admins can update all, contributors their own"
    ON exercise_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'admin'
                OR (profiles.role = 'contributor' AND exercise_requests.created_by = auth.uid())
            )
        )
    );

-- Policy: Seuls les admins peuvent supprimer
CREATE POLICY "Only admins can delete exercise requests"
    ON exercise_requests
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Fonction pour lier un exercice (task/version) à une demande
CREATE OR REPLACE FUNCTION link_exercise_to_request(
    p_request_code VARCHAR(20),
    p_task_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_request_id UUID;
BEGIN
    -- Trouver la demande par code
    SELECT id INTO v_request_id
    FROM exercise_requests
    WHERE code = p_request_code;
    
    IF v_request_id IS NULL THEN
        RAISE EXCEPTION 'Exercise request with code % not found', p_request_code;
    END IF;
    
    -- Ajouter le task_id au tableau linked_task_ids (si pas déjà présent)
    UPDATE exercise_requests
    SET 
        linked_task_ids = array_append(linked_task_ids, p_task_id),
        status = CASE 
            WHEN status = 'pending' THEN 'in_progress'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = v_request_id
    AND NOT (p_task_id = ANY(linked_task_ids));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour les compteurs de versions d'une demande
CREATE OR REPLACE FUNCTION update_exercise_request_counters(p_request_code VARCHAR(20))
RETURNS BOOLEAN AS $$
DECLARE
    v_request_id UUID;
    v_task_ids INTEGER[];
    v_validated_count INTEGER := 0;
    v_pending_count INTEGER := 0;
BEGIN
    -- Trouver la demande
    SELECT id, linked_task_ids INTO v_request_id, v_task_ids
    FROM exercise_requests
    WHERE code = p_request_code;
    
    IF v_request_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Compter les versions validées et en attente pour tous les tasks liés
    SELECT 
        COALESCE(SUM(CASE WHEN moderation_status = 'validated' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN moderation_status = 'pending' THEN 1 ELSE 0 END), 0)
    INTO v_validated_count, v_pending_count
    FROM versions
    WHERE task_id = ANY(v_task_ids);
    
    -- Mettre à jour les compteurs
    UPDATE exercise_requests
    SET 
        validated_versions_count = v_validated_count,
        pending_versions_count = v_pending_count,
        updated_at = NOW()
    WHERE id = v_request_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Données d'exemple (optionnel, à supprimer en production)
INSERT INTO exercise_requests (code, category_name, title, description, priority, status) VALUES
('EX-2025-001', 'Paramètres', 'Paramétrer le Wi-Fi', 'Exercice complet pour connecter un smartphone au Wi-Fi avec captures d''écran', 'high', 'pending'),
('EX-2025-002', 'Communication', 'Envoyer un SMS', 'Créer un exercice simple pour envoyer un premier SMS', 'high', 'in_progress'),
('EX-2025-003', 'Applications', 'Configurer Gmail', 'Guide pas-à-pas pour ajouter un compte Gmail', 'normal', 'pending')
ON CONFLICT (code) DO NOTHING;

-- Commentaire final
COMMENT ON TABLE exercise_requests IS 'Système de gestion des demandes d''exercices pour coordination admin-contributeurs';
COMMENT ON COLUMN exercise_requests.code IS 'Code unique de référence (ex: EX-2025-001), auto-généré si non fourni';
COMMENT ON COLUMN exercise_requests.priority IS 'Priorité: high (urgent), normal (standard), low (optionnel)';
COMMENT ON COLUMN exercise_requests.status IS 'État: pending (à faire), in_progress (en cours), completed (terminé), cancelled (annulé)';

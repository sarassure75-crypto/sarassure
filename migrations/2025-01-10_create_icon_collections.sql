-- Migration: Créer tables pour collections d'icônes personnalisées
-- Date: 2025-01-10
-- Purpose: Permettre aux administrateurs de gérer des collections d'icônes

-- Table pour les collections d'icônes
CREATE TABLE IF NOT EXISTS icon_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les icônes dans les collections
CREATE TABLE IF NOT EXISTS custom_icon_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES icon_collections(id) ON DELETE CASCADE,
  library_id VARCHAR(50) NOT NULL, -- lucide, fa, bi, md, fi, hi, ai
  icon_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  category VARCHAR(100),
  notes TEXT,
  tags TEXT[], -- array de tags pour la recherche
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, library_id, icon_name)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_icon_collections_user ON icon_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_icons_collection ON custom_icon_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_custom_icons_library ON custom_icon_collections(library_id);
CREATE INDEX IF NOT EXISTS idx_custom_icons_name ON custom_icon_collections(icon_name);

-- RLS Policies
ALTER TABLE icon_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_icon_collections ENABLE ROW LEVEL SECURITY;

-- Politique: Users can only see their own collections
CREATE POLICY icon_collections_user_policy 
  ON icon_collections 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR is_public = true
  );

CREATE POLICY icon_collections_insert_policy 
  ON icon_collections 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY icon_collections_update_policy 
  ON icon_collections 
  FOR UPDATE 
  USING (
    auth.uid() = user_id
  );

CREATE POLICY icon_collections_delete_policy 
  ON icon_collections 
  FOR DELETE 
  USING (
    auth.uid() = user_id
  );

-- Custom icons are accessible via the collection owner
CREATE POLICY custom_icons_select_policy 
  ON custom_icon_collections 
  FOR SELECT 
  USING (
    collection_id IN (
      SELECT id FROM icon_collections 
      WHERE user_id = auth.uid() OR is_public = true
    )
  );

CREATE POLICY custom_icons_insert_policy 
  ON custom_icon_collections 
  FOR INSERT 
  WITH CHECK (
    collection_id IN (
      SELECT id FROM icon_collections 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY custom_icons_delete_policy 
  ON custom_icon_collections 
  FOR DELETE 
  USING (
    collection_id IN (
      SELECT id FROM icon_collections 
      WHERE user_id = auth.uid()
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_icon_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_icon_collections_timestamp ON icon_collections;
CREATE TRIGGER update_icon_collections_timestamp
  BEFORE UPDATE ON icon_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_icon_collections_updated_at();

-- Données par défaut: Collection "Favorites"
-- Cette collection sera créée automatiquement pour les nouveaux users via trigger
CREATE OR REPLACE FUNCTION create_default_icon_collection()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO icon_collections (user_id, name, description)
  VALUES (NEW.id, 'Favorites', 'My favorite icons');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_default_collection_on_auth ON auth.users;
-- Note: Ce trigger doit être créé avec les permissions nécessaires
-- Alternatif: créer la collection lors du premier accès à l'interface

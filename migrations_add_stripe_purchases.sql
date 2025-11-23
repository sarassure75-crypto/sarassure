-- Migration: Système de paiement Stripe pour les licences

-- Table des forfaits de licences
CREATE TABLE IF NOT EXISTS license_packages (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL, -- Prix en centimes (ex: 4900 = 49€)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les forfaits de licences
INSERT INTO license_packages (id, name, quantity, price_cents, description) VALUES
  (1, '5 Licences', 5, 4900, 'Pack de 5 licences pour vos apprenants'),
  (2, '10 Licences', 10, 8900, 'Pack de 10 licences pour vos apprenants'),
  (3, '25 Licences', 25, 19900, 'Pack de 25 licences pour vos apprenants'),
  (4, '50 Licences', 50, 39900, 'Pack de 50 licences pour vos apprenants')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  quantity = EXCLUDED.quantity,
  price_cents = EXCLUDED.price_cents,
  description = EXCLUDED.description;

-- Table pour tracer les achats
CREATE TABLE IF NOT EXISTS license_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id INTEGER NOT NULL REFERENCES license_packages(id),
  quantity INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Table pour tracer les licences attribuées à partir d'un achat
CREATE TABLE IF NOT EXISTS purchased_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES license_purchases(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id),
  category_id INTEGER NOT NULL REFERENCES task_categories(id),
  learner_id UUID,
  is_assigned BOOLEAN DEFAULT false,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_purchases_trainer ON license_purchases(trainer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON license_purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON license_purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_purchased_licenses_purchase ON purchased_licenses(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchased_licenses_trainer ON purchased_licenses(trainer_id);
CREATE INDEX IF NOT EXISTS idx_purchased_licenses_assigned ON purchased_licenses(is_assigned);

-- RLS (Row Level Security)
ALTER TABLE license_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_licenses ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut voir les forfaits
CREATE POLICY "Anyone can view license packages"
  ON license_packages
  FOR SELECT
  USING (true);

-- Politique: Les formateurs peuvent voir leurs propres achats
CREATE POLICY "Trainers can view their own purchases"
  ON license_purchases
  FOR SELECT
  USING (auth.uid() = trainer_id);

-- Politique: Les admins peuvent voir tous les achats
CREATE POLICY "Admins can view all purchases"
  ON license_purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrateur'
    )
  );

-- Politique: Insertion d'achats par les formateurs
CREATE POLICY "Trainers can create purchases"
  ON license_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = trainer_id);

-- Politique: Admins peuvent mettre à jour les achats
CREATE POLICY "Admins can update purchases"
  ON license_purchases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrateur'
    )
  );

-- Politique: Les formateurs peuvent voir leurs propres licences achetées
CREATE POLICY "Trainers can view their purchased licenses"
  ON purchased_licenses
  FOR SELECT
  USING (auth.uid() = trainer_id);

-- Politique: Les formateurs peuvent mettre à jour leurs licences achetées
CREATE POLICY "Trainers can update their purchased licenses"
  ON purchased_licenses
  FOR UPDATE
  USING (auth.uid() = trainer_id);

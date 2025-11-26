# Guide d'Installation - Système Contributeur sur Supabase

## 🎯 Vue d'ensemble

Ce guide vous explique comment installer le système contributeur dans votre base de données Supabase en **4 étapes simples**.

---

## 📋 Prérequis

- ✅ Compte Supabase actif
- ✅ Projet Supabase existant (votre base actuelle)
- ✅ Accès SQL Editor dans Supabase
- ✅ Base de données avec tables `users` et `tasks` existantes

---

## 🚀 Étape 1 : Accéder au SQL Editor

1. Connectez-vous à [https://supabase.com](https://supabase.com)
2. Sélectionnez votre projet **sarassure**
3. Dans le menu latéral gauche, cliquez sur **SQL Editor** (icône 📝)
4. Cliquez sur **New query** (Nouvelle requête)

---

## 📦 Étape 2 : Exécuter la migration du système contributeur

### Migration 1 : Tables de base du système contributeur

1. Ouvrez le fichier `migrations_add_contributor_system.sql`
2. **Copiez TOUT le contenu** (528 lignes)
3. Collez dans le SQL Editor de Supabase
4. Cliquez sur **Run** (▶️ Exécuter) en bas à droite
5. ✅ **Vérification** : Vous devriez voir "Success. No rows returned"

**Ce que cette migration crée :**
- ✅ Table `contributor_requests` (demandes d'accès contributeur)
- ✅ Table `contributions` (exercices soumis)
- ✅ Table `images_metadata` (bibliothèque d'images)
- ✅ Table `contributor_stats` (statistiques temps réel)
- ✅ Policies RLS (Row Level Security) pour la sécurité
- ✅ Index pour performance

**En cas d'erreur :**
- Si "relation already exists" : La table existe déjà, pas de problème
- Si "permission denied" : Vérifiez que vous êtes connecté en tant qu'administrateur
- Si autre erreur : Copiez le message et vérifiez la syntaxe

---

## 💰 Étape 3 : Exécuter la migration du système de récompenses

### Migration 2 : Système de points et paiements

1. Ouvrez le fichier `migrations_add_rewards_system.sql`
2. **Copiez TOUT le contenu** (600+ lignes)
3. Collez dans une **nouvelle requête** SQL Editor
4. Cliquez sur **Run** (▶️ Exécuter)
5. ✅ **Vérification** : "Success. No rows returned"

**Ce que cette migration crée :**
- ✅ Table `contribution_points` (historique des points)
- ✅ Table `reward_distributions` (calculs de paiements)
- ✅ Table `reward_payments` (versements effectués)
- ✅ Table `contributor_badges` (système de badges)
- ✅ Table `error_reports` (signalements erreurs par learners)
- ✅ Fonction SQL `calculate_contribution_points()` (calcul automatique 0-25 points)
- ✅ Fonction SQL `apply_error_penalty()` (pénalités -3 à -100)
- ✅ Fonction SQL `calculate_reward_distribution()` (répartition proportionnelle)
- ✅ Triggers automatiques (attribution points, application pénalités)
- ✅ Vue `public_leaderboard` (classement public avec pseudonymes)

**En cas d'erreur :**
- "function already exists" : Supprimez d'abord avec `DROP FUNCTION IF EXISTS nom_fonction CASCADE;`
- "trigger already exists" : Idem avec `DROP TRIGGER IF EXISTS nom_trigger ON nom_table;`

---

## 🖼️ Étape 4 : Configurer Supabase Storage

### Créer les buckets pour les images

1. Dans Supabase, allez dans **Storage** (menu gauche, icône 🗂️)
2. Cliquez sur **Create a new bucket**

#### Bucket 1 : contributions-images

```
Name: contributions-images
Public: ✅ Oui (cochez "Public bucket")
File size limit: 1 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

3. Cliquez sur **Create bucket**
4. Une fois créé, cliquez sur le bucket → **Policies** → **New policy**
5. Template : **Custom** → Collez ce code :

```sql
-- Policy 1: Les contributeurs peuvent uploader
CREATE POLICY "Contributors can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contributions-images'
  AND (auth.uid() IN (SELECT id FROM users WHERE role = 'contributor' OR role = 'admin'))
);

-- Policy 2: Lecture publique pour images approuvées
CREATE POLICY "Public read approved images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'contributions-images');

-- Policy 3: Les contributeurs peuvent supprimer leurs propres images
CREATE POLICY "Contributors can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contributions-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Bucket 2 (optionnel) : wallpapers

```
Name: wallpapers
Public: ✅ Oui
File size limit: 2 MB
```

**Policy :**
```sql
-- Lecture publique
CREATE POLICY "Public read wallpapers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wallpapers');

-- Admin upload
CREATE POLICY "Admin upload wallpapers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wallpapers'
  AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

---

## ✅ Étape 5 : Vérification de l'installation

### Test 1 : Vérifier les tables

Dans SQL Editor, exécutez :

```sql
-- Lister toutes les nouvelles tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'contributor_requests',
  'contributions',
  'images_metadata',
  'contributor_stats',
  'contribution_points',
  'reward_distributions',
  'reward_payments',
  'contributor_badges',
  'error_reports'
);
```

✅ **Résultat attendu** : 9 lignes (9 tables trouvées)

### Test 2 : Vérifier les fonctions

```sql
-- Lister les fonctions créées
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'calculate_contribution_points',
  'apply_error_penalty',
  'calculate_reward_distribution'
);
```

✅ **Résultat attendu** : 3 lignes (3 fonctions trouvées)

### Test 3 : Vérifier les triggers

```sql
-- Lister les triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%contribution%' OR trigger_name LIKE '%error%';
```

✅ **Résultat attendu** : Au moins 2 triggers

### Test 4 : Vérifier Storage

1. Allez dans **Storage** → Vous devez voir :
   - ✅ `contributions-images` (public)
   - ✅ `wallpapers` (optionnel)

2. Testez upload :
   - Cliquez sur `contributions-images`
   - **Upload file** → Choisissez une image (<1MB)
   - ✅ L'upload doit fonctionner

---

## 🔧 Configuration supplémentaire

### Ajouter le rôle "contributor" aux utilisateurs

Pour transformer un utilisateur en contributeur :

```sql
-- Méthode 1: Approuver automatiquement une demande existante
UPDATE contributor_requests
SET status = 'approved', approved_at = NOW()
WHERE user_id = 'USER_UUID_ICI'
AND status = 'pending';

-- Méthode 2: Créer directement la demande approuvée
INSERT INTO contributor_requests (user_id, motivation, status, approved_at)
VALUES (
  'USER_UUID_ICI',
  'Accès administrateur',
  'approved',
  NOW()
);
```

### Créer votre premier contributeur de test

```sql
-- Trouver votre UUID utilisateur
SELECT id, email FROM auth.users LIMIT 5;

-- Créer une demande approuvée
INSERT INTO contributor_requests (user_id, motivation, status, approved_at)
VALUES (
  'COLLER_VOTRE_UUID_ICI', -- Remplacez par votre UUID
  'Test système contributeur',
  'approved',
  NOW()
);
```

---

## 🎨 Uploader les ressources (optionnel)

### Fonds d'écran recommandés

1. Consultez `WALLPAPERS_LIST.md` pour les 50+ wallpapers CC0
2. Téléchargez depuis Unsplash/Pexels/Pixabay
3. Uploadez dans le bucket `wallpapers` via interface Supabase

### Contacts fictifs

Les 30 contacts fictifs sont dans `FAKE_CONTACTS_LIST.md`. Vous pouvez :

**Option 1 : Table séparée** (recommandé)

```sql
CREATE TABLE fake_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les contacts (exemple)
INSERT INTO fake_contacts (name, phone, email, country) VALUES
('Sophie Martin', '+33 6 12 34 56 78', 'sophie.martin@exemple.fr', 'France'),
('Thomas Dubois', '+33 6 23 45 67 89', 'thomas.dubois@exemple.fr', 'France'),
-- ... (ajouter les 30 contacts)
;

-- Policy lecture publique
ALTER TABLE fake_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fake contacts"
ON fake_contacts FOR SELECT
TO public
USING (true);
```

**Option 2 : Fichier JSON côté frontend** (plus simple)

Créez `src/data/fakeContacts.js` :

```javascript
export const FAKE_CONTACTS = [
  { name: 'Sophie Martin', phone: '+33 6 12 34 56 78', email: 'sophie.martin@exemple.fr', country: 'FR' },
  // ... tous les contacts
];
```

---

## 🚨 Dépannage

### Erreur : "permission denied for table"

**Solution :**
```sql
-- Activer RLS et créer policy publique
ALTER TABLE nom_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all users" ON nom_table FOR SELECT TO public USING (true);
```

### Erreur : "function does not exist"

**Solution :** Réexécutez la migration 2 (rewards_system.sql) complètement

### Erreur : Storage upload échoue

**Solution :**
1. Vérifiez que le bucket est **Public**
2. Vérifiez les policies (SELECT/INSERT/DELETE)
3. Testez avec un fichier <500KB d'abord

### Rollback (annuler les migrations)

**⚠️ ATTENTION : Cela supprime TOUTES les données contributeur !**

```sql
-- Supprimer dans l'ordre inverse
DROP VIEW IF EXISTS public_leaderboard CASCADE;
DROP TABLE IF EXISTS error_reports CASCADE;
DROP TABLE IF EXISTS contributor_badges CASCADE;
DROP TABLE IF EXISTS reward_payments CASCADE;
DROP TABLE IF EXISTS reward_distributions CASCADE;
DROP TABLE IF EXISTS contribution_points CASCADE;
DROP TABLE IF EXISTS contributor_stats CASCADE;
DROP TABLE IF EXISTS images_metadata CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS contributor_requests CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS calculate_reward_distribution CASCADE;
DROP FUNCTION IF EXISTS apply_error_penalty CASCADE;
DROP FUNCTION IF EXISTS calculate_contribution_points CASCADE;
```

---

## 📊 Monitoring après installation

### Voir les statistiques

```sql
-- Nombre de contributions par statut
SELECT status, COUNT(*) 
FROM contributions 
GROUP BY status;

-- Top 5 contributeurs
SELECT 
  u.email,
  cs.total_contributions,
  cs.approved_contributions,
  cs.total_points
FROM contributor_stats cs
JOIN auth.users u ON cs.contributor_id = u.id
ORDER BY cs.total_points DESC
LIMIT 5;

-- Chiffre d'affaires total
SELECT SUM(revenue_amount) as total_revenue
FROM reward_distributions;
```

---

## ✅ Checklist finale

Avant de mettre en production, vérifiez :

- [ ] ✅ Migration 1 exécutée sans erreur (9 tables créées)
- [ ] ✅ Migration 2 exécutée sans erreur (fonctions + triggers actifs)
- [ ] ✅ Bucket `contributions-images` créé avec policies
- [ ] ✅ Au moins 1 utilisateur test avec statut contributeur
- [ ] ✅ Test upload image fonctionne
- [ ] ✅ Routes React ajoutées dans App.jsx
- [ ] ✅ Frontend build sans erreur (`npm run build`)
- [ ] ✅ Test workflow complet : créer contribution → approuver → points attribués

---

## 🎉 Installation terminée !

Votre système contributeur est maintenant opérationnel. Les contributeurs peuvent :

- ✅ Soumettre des exercices
- ✅ Uploader des images
- ✅ Gagner des points automatiquement
- ✅ Voir leur position au leaderboard

Les admins peuvent :
- ✅ Modérer contributions et images
- ✅ Approuver/rejeter avec commentaires
- ✅ Gérer les paiements à 1000€

**Support :** Si vous rencontrez un problème, vérifiez d'abord les logs Supabase (Database → Logs).

---

**Temps d'installation estimé :** 15-20 minutes

**Difficulté :** ⭐⭐ Facile (copier-coller SQL)

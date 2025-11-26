# 🔧 INSTRUCTIONS DE DÉPLOIEMENT - EXÉCUTION DE LA MIGRATION SQL

## Prérequis
- ✅ Compte Supabase actif
- ✅ Accès admin au projet
- ✅ Fichier migration: `migrations_add_moderation_status_admin_images.sql`

## 📋 Étapes à Suivre

### ÉTAPE 1: Ouvrir Supabase SQL Editor

1. Aller sur: https://supabase.com/dashboard
2. Sélectionner votre projet
3. Cliquer sur **"SQL Editor"** (menu gauche)
4. Cliquer sur **"+ New Query"**

### ÉTAPE 2: Copier la Migration

Copier le contenu du fichier `migrations_add_moderation_status_admin_images.sql`:

```sql
-- Migration: Add moderation_status to app_images for auto-validation of admin images
-- Purpose: Allow admin images to be visible to contributors by setting moderation_status to 'approved' automatically
-- Date: 2025-11-25

-- Add moderation_status column to app_images table if it doesn't exist
ALTER TABLE public.app_images 
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved' NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.app_images.moderation_status IS 'Status of image moderation - admin images are auto-approved';

-- Update all existing app_images to have 'approved' status (they are admin images)
UPDATE public.app_images 
SET moderation_status = 'approved' 
WHERE moderation_status IS NULL OR moderation_status = '';

-- Create index for faster filtering by moderation_status
CREATE INDEX IF NOT EXISTS idx_app_images_moderation_status 
ON public.app_images(moderation_status);
```

### ÉTAPE 3: Coller dans l'Éditeur SQL

1. Dans Supabase SQL Editor, coller le code complet
2. **NE PAS AJOUTER DE POINT-VIRGULE SUPPLÉMENTAIRE à la fin**

### ÉTAPE 4: Exécuter la Migration

Cliquer sur le bouton **"RUN"** (en haut à droite, bouton vert)

### ÉTAPE 5: Vérifier les Résultats

Vous devez voir dans le panel de résultats:

```
✓ ALTER TABLE (0 rows)
✓ COMMENT (0 rows)
✓ UPDATE (X rows) ← X = nombre d'images admin existantes
✓ CREATE INDEX (0 rows)
```

## ✅ Vérification Post-Déploiement

### Test 1: Vérifier la Colonne

Exécuter dans Supabase SQL Editor:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'app_images' 
AND column_name = 'moderation_status';
```

**Résultat attendu:**
```
column_name          | data_type | column_default
moderation_status    | text      | 'approved'::text
```

### Test 2: Vérifier les Données

```sql
SELECT COUNT(*) as total, moderation_status FROM app_images 
GROUP BY moderation_status;
```

**Résultat attendu:**
```
total | moderation_status
  5   | approved
  (ou le nombre d'images admin que vous avez)
```

### Test 3: Vérifier l'Index

```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'app_images' 
AND indexname LIKE '%moderation%';
```

**Résultat attendu:**
```
indexname
idx_app_images_moderation_status
```

## 🚀 Après la Migration SQL

### Étape 1: Mettre à Jour le Code

Assurer que `src/data/imagesMetadata.js` contient la nouvelle fonction `searchImages()` qui inclut `app_images`.

**Vérifier:** Le fichier doit avoir environ 200 lignes pour `searchImages()` (au lieu de 90 avant)

### Étape 2: Build et Déploiement

```bash
cd /path/to/sarassure
npm run build
# Vérifier: ✅ dist/assets/index-*.js SUCCESS

npm run dev
# Vérifier: ✅ Server running on http://localhost:3000
```

### Étape 3: Test Manuel

1. Aller sur http://localhost:3000/contributeur/new-exercise
2. Cliquer sur "Choisir une image" pour une étape
3. **Vérifier que les images admin s'affichent** dans le modal

## ⚠️ Troubleshooting

### Erreur: "relation 'app_images' does not exist"

**Cause:** La table n'existe pas ou a un nom différent

**Solution:** Vérifier le nom exact dans Supabase:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%image%';
```

Si le nom est différent, modifier la migration avant d'exécuter.

### Erreur: "column moderation_status already exists"

**Cause:** La colonne a déjà été ajoutée

**Solution:** C'est normal ! La migration utilise `IF NOT EXISTS`, donc elle skip l'étape.

**Vérifier:** Exécuter Test 1 ci-dessus pour confirmer.

### Images admin toujours invisibles

**Cause:** Possibilement un cache ou la nouvelle fonction `searchImages()` n'est pas déployée

**Solution:**
1. Hard refresh du navigateur: `Ctrl+Shift+Suppr`
2. Vérifier que `src/data/imagesMetadata.js` a bien 200+ lignes pour `searchImages()`
3. Vérifier les logs navigateur (F12 → Console) pour erreurs
4. Redémarrer le serveur: `npm run dev`

## 📊 Résumé des Changements en Base de Données

### Avant
```
app_images:
  - id
  - name
  - description
  - file_path
  - created_at
  ❌ moderation_status (n'existe pas)
```

### Après
```
app_images:
  - id
  - name
  - description
  - file_path
  - created_at
  - moderation_status ✅ (valeur par défaut: 'approved')
  - INDEX sur moderation_status ✅
```

## 🔄 Rollback (Si Nécessaire)

Si vous devez annuler la migration:

```sql
-- Supprimer l'index
DROP INDEX IF EXISTS idx_app_images_moderation_status;

-- Supprimer la colonne
ALTER TABLE public.app_images 
DROP COLUMN IF EXISTS moderation_status;
```

Puis, exécuter l'ancienne version du code sans la modification de `searchImages()`.

## ✨ Après Succès

Vous pouvez maintenant:
- ✅ Les contributeurs voient les images admin
- ✅ Les images admin sont auto-validées
- ✅ Aucun besoin d'approbation manuelle pour les images admin
- ✅ Les contributeurs peuvent créer des exercices avec images admin

## 📞 Support

En cas de problème:
1. Exécuter les tests de vérification ci-dessus
2. Vérifier les logs Supabase (Dashboard → Logs → Database)
3. Vérifier les erreurs en frontend (F12 → Console)

---

**Duration:** ~2 minutes  
**Risque:** Très faible (migration sûre avec IF NOT EXISTS)  
**Reversible:** Oui (voir section Rollback)  
**Status:** Prêt à exécuter ✅

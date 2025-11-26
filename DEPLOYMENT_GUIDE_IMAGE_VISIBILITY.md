# 📋 GUIDE DE DÉPLOIEMENT - Images Admin Visibility Fix

## ✅ RÉSUMÉ DES CHANGEMENTS

### Problème Initial
- ❌ Les images admin n'étaient **pas visibles** aux contributeurs
- ❌ Les images admin n'avaient **pas de validation automatique**
- ❌ Deux tables d'images séparées créaient une **fragmentation des données**

### Solution Implémentée

#### 1. **Migration SQL** 
**Fichier:** `migrations_add_moderation_status_admin_images.sql`

```sql
-- Ajoute la colonne moderation_status à app_images (images admin)
ALTER TABLE public.app_images 
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved' NOT NULL;

-- Met à jour TOUTES les images admin existantes comme approuvées
UPDATE public.app_images 
SET moderation_status = 'approved' 
WHERE moderation_status IS NULL OR moderation_status = '';

-- Crée un index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_app_images_moderation_status 
ON public.app_images(moderation_status);
```

**Action requise:** Exécuter cette migration dans Supabase SQL Editor

#### 2. **Mise à jour du code**
**Fichier:** `src/data/imagesMetadata.js`

- ✅ Fonction `searchImages()` **MISE À JOUR**
- ✅ Inclut maintenant images admin ET images contributeurs
- ✅ Combine les résultats des deux tables automatiquement
- ✅ Filtre par `moderation_status = 'approved'` pour les deux sources
- ✅ Ajoute des champs `source` pour différencier admin/contributor

**Résultat:** Les contributeurs voient TOUTES les images approuvées (admin + contributeurs)

#### 3. **Impact sur les Pages Contributeurs**

Pages affectées **POSITIVEMENT:**
- ✅ `NewContribution.jsx` - Voir images admin dans l'éditeur d'exercices
- ✅ `ContributorImageLibrary.jsx` - Voir images admin dans la bibliothèque
- ✅ Tout formulaire utilisant `useImageLibrary` hook

## 🚀 ÉTAPES DE DÉPLOIEMENT

### Étape 1: Exécuter la Migration SQL
1. Aller sur **Supabase → SQL Editor**
2. Copier le contenu de `migrations_add_moderation_status_admin_images.sql`
3. **Exécuter** le script SQL

**Résultat attendu:**
```
✓ Column added
✓ 5 rows updated (ou plus selon nombre d'images admin)
✓ Index created
```

### Étape 2: Déployer le Code Frontend
1. Les fichiers modifiés:
   - `src/data/imagesMetadata.js` ✅ Déjà modifié
   
2. Faire un commit et push:
```bash
git add src/data/imagesMetadata.js migrations_add_moderation_status_admin_images.sql
git commit -m "feat: Allow contributors to see approved admin images"
git push origin main
```

3. La build compile ✅ (confirmée: 1,417.90 kB JS, 67.34 kB CSS)

### Étape 3: Tester
1. **Créer une nouvelle contribution** (`/contributeur/new-exercise`)
2. **Cliquer sur "Choisir une image"**
3. **Vérifier que les images admin apparaissent** (avec label "source: admin")
4. **Pouvoir les sélectionner normalement**

## 📊 VÉRIFICATION TECHNIQUE

### Schéma de Données Finalisé

**Table: app_images (images admin)**
```sql
id            UUID PRIMARY KEY
name          TEXT
description   TEXT
category      TEXT
file_path     TEXT
moderation_status TEXT DEFAULT 'approved'  ← NOUVEAU
created_at    TIMESTAMP
user_id       UUID
```

**Table: images_metadata (images contributeurs)**
```sql
id                  UUID PRIMARY KEY
title               TEXT
description         TEXT
category            TEXT
tags                JSONB
storage_path        TEXT
storage_bucket      TEXT
moderation_status   TEXT ('pending'|'approved'|'rejected')
uploaded_by         UUID
```

### Logique de Recherche `searchImages(filters)`

```
Inputs: filters (category, searchText, etc.)
  ↓
┌─────────────────────────────────────────┐
│ Query images_metadata (contributeurs)   │
│ WHERE moderation_status = 'approved'    │
│ AND filters...                          │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ Query app_images (admin)                │
│ WHERE moderation_status = 'approved'    │
│ AND filters...                          │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ COMBINE results                         │
│ - Transform app_images format to match  │
│ - Add 'source' field (admin/contributor)│
└─────────────────────────────────────────┘
  ↓
Output: Array de toutes les images approuvées
```

## ⚙️ CONFIGURATION

### Bucket de stockage
- ✅ **Une seule bucket:** `images`
- ✅ Toutes les images utilisent: `storage.from('images')`
- ✅ Pas de séparation admin/contributeur dans le bucket

### Base de données
- ✅ **Deux tables de métadonnées:** app_images + images_metadata
- ✅ Les deux ont maintenant le champ `moderation_status`
- ✅ Les contributeurs voient les deux sources fusionnées

## 📝 FICHIERS MODIFIÉS

```
✅ src/data/imagesMetadata.js
   └─ Fonction searchImages() remplacée pour inclure app_images

✅ migrations_add_moderation_status_admin_images.sql (NOUVEAU)
   └─ Migration à exécuter dans Supabase

❌ Aucun autre fichier modifié (backward compatible)
```

## 🔍 VÉRIFICATION FINALE

Après déploiement, vérifier dans la console Supabase:

```sql
-- Vérifier que app_images a la colonne
SELECT column_name FROM information_schema.columns 
WHERE table_name='app_images';
-- Devrait inclure: moderation_status

-- Vérifier les données
SELECT COUNT(*), moderation_status FROM app_images GROUP BY moderation_status;
-- Devrait montrer: COUNT(*) | approved

-- Vérifier images_metadata
SELECT COUNT(*), moderation_status FROM images_metadata GROUP BY moderation_status;
-- Devrait montrer: COUNT(*) | pending|approved|rejected
```

## ✨ RÉSULTATS ATTENDUS

### Avant le déploiement
```
Contributeur crée un exercice
  ↓
Voir images contributeurs SEULEMENT (images_metadata approuvées)
  ↓
Pas d'images admin disponibles ❌
```

### Après le déploiement  
```
Contributeur crée un exercice
  ↓
Voir TOUTES les images approuvées:
  - Images admin (approuvées par défaut) ✅
  - Images contributeurs (approuvées) ✅
  ↓
Peut sélectionner n'importe quelle image ✅
```

## 🐛 TROUBLESHOOTING

### Problème: Images admin ne s'affichent pas

**Solution 1:** Vérifier la migration SQL
```sql
SELECT moderation_status FROM app_images LIMIT 1;
-- Doit retourner: approved
```

**Solution 2:** Rafraîchir le navigateur avec cache vidé
```
Ctrl+Shift+Suppr → Clear all data
```

**Solution 3:** Vérifier les logs du navigateur (F12)
```javascript
// Dans la console:
import { searchImages } from './src/data/imagesMetadata.js';
searchImages({}).then(r => console.log(r));
// Doit retourner les deux sources
```

### Problème: Erreur "no such table"

**Cause:** app_images table n'existe pas
**Solution:** Créer la table avec:
```sql
CREATE TABLE public.app_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    category text,
    file_path text NOT NULL,
    moderation_status text DEFAULT 'approved',
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);
```

## 📞 SUPPORT

En cas de problème après déploiement:
1. Vérifier les logs Supabase (Functions → Logs)
2. Vérifier les erreurs navigateur (Console F12)
3. Exécuter la requête SQL de vérification ci-dessus
4. Redéployer si nécessaire: `npm run build && npm run dev`

---

**Date:** 2025-11-25  
**Build Status:** ✅ Success (1,417.90 kB JS)  
**Backward Compatible:** ✅ Yes  
**Migration Required:** ✅ Yes (1 SQL script)

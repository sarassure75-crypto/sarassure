# Migration: Wallpapers → App Images Library

**Date:** 2025-12-05  
**Objectif:** Centraliser tous les fonds d'écran dans la table `app_images` avec la catégorie `'wallpaper'` et supprimer le dossier `/public/wallpapers`

## 📋 Résumé de la Migration

### Avant
- **Structure:** 32 fichiers wallpaper dans `/public/wallpapers/` (16 SVG + 16 PNG)
- **Référencement:** Array statique en dur dans `WallpapersLibraryPage.jsx`
- **Accès:** Chemin relatif `/wallpapers/...`
- **Maintenance:** Difficile à ajouter/modifier sans toucher au code React

### Après
- **Structure:** 32 entrées dans la table `app_images` avec `category = 'wallpaper'`
- **Référencement:** Chargement dynamique depuis Supabase
- **Accès:** URLs publiques via Supabase Storage
- **Maintenance:** Simple ajout/modification via l'admin panel (future)

## 🛠️ Étapes de Migration

### 1. Exécuter la migration SQL
```sql
-- Fichier: migrate_wallpapers_to_app_images.sql
-- Ajoute 32 entrées wallpaper à la table app_images
```

**Impact:** 
- ✅ Ajoute les métadonnées des wallpapers dans `app_images`
- ✅ Catégorie: `'wallpaper'`
- ✅ `file_path` pointe vers `/wallpapers/` et `/wallpapers/png/`

### 2. Mettre à jour le code React
**Fichier:** `src/pages/WallpapersLibraryPage.jsx`

**Changements:**
- ❌ Suppression de l'array statique (16 éléments)
- ✅ Ajout de `useEffect` pour charger depuis Supabase
- ✅ Gestion des états: `loading`, `error`
- ✅ URLs publiques via `supabase.storage.from('images').getPublicUrl()`

**Code clé:**
```javascript
useEffect(() => {
  const { data } = await supabase
    .from('app_images')
    .select('*')
    .eq('category', 'wallpaper')
    .order('name');
  
  // Format et affichage
  const formattedWallpapers = data.map(img => ({
    ...img,
    preview: supabase.storage.from('images').getPublicUrl(img.file_path).data?.publicUrl
  }));
}, []);
```

### 3. Supprimer le dossier `/public/wallpapers`
```bash
rm -rf public/wallpapers/
```

**Raison:** Les fichiers doivent être hébergés dans Supabase Storage, pas en tant que fichiers statiques

### 4. Mettre à jour `.gitignore` (optionnel)
Si `/wallpapers/` était ignoré, nettoyer le `.gitignore`

## 📊 Données Migrées

**Total:** 32 wallpapers

### Par type:
- **SVG:** 16 fichiers (wallpapers/*.svg)
- **PNG:** 16 fichiers (wallpapers/png/*.png)

### Par nom:
1. Blue Gradient
2. Forest Green
3. Geometric Shapes
4. Green Circles
5. Green Forest Trees
6. Green Geometric Mesh
7. Green Hexagons
8. Green Hills Landscape
9. Green Triangles
10. Green Waves Abstract
11. Lavender
12. Mountain Sunrise
13. Ocean Waves
14. Soft Gray
15. Starry Night
16. Sunset Sky

(Chacun en version SVG et PNG)

## ✅ Checklist de Vérification

- [ ] Exécuter `migrate_wallpapers_to_app_images.sql` en base
- [ ] Vérifier les 32 entrées dans `app_images` avec `SELECT * FROM app_images WHERE category = 'wallpaper'`
- [ ] Déployer la mise à jour `WallpapersLibraryPage.jsx`
- [ ] Tester la page `/ressources/wallpapers` en local
- [ ] Vérifier que les images s'affichent (URL Supabase Storage valide)
- [ ] Vérifier le téléchargement fonctionne
- [ ] Supprimer `/public/wallpapers/` et builder le projet
- [ ] Vérifier que la page fonctionne toujours (pas de fichiers static manquants)
- [ ] Git commit et push
- [ ] Déployer en production
- [ ] Tester en production

## 🔗 Références

- **Fichiers modifiés:**
  - `src/pages/WallpapersLibraryPage.jsx` - Refactoring React complet
  - `migrate_wallpapers_to_app_images.sql` - Migration SQL

- **Fichiers créés:**
  - `migrate-wallpapers-to-images.cjs` - Script Node.js de migration (pour audit)
  - `wallpapers_migration.json` - Données migrées (pour reference)
  - `WALLPAPERS_MIGRATION.md` - Ce document

- **À supprimer:**
  - `/public/wallpapers/` - Dossier entier

## 🚀 Bénéfices

✅ **Centralisation:** Tous les images au même endroit  
✅ **Maintenance:** Ajout facile via UI admin (futur)  
✅ **Performance:** Supabase Storage avec CDN  
✅ **Scalabilité:** Pas de limites de fichiers statiques  
✅ **Sécurité:** RLS policies possibles (futur)  
✅ **Audit:** Traçabilité via métadonnées  

## ⚠️ Notes Importantes

1. **Les fichiers PNG/SVG doivent exister dans Supabase Storage** au chemin `/wallpapers/...`
   - Sinon, les URLs publiques retourneront une erreur 404
   - Vérifier avant de supprimer `/public/wallpapers/`

2. **Les URLs Supabase Storage sont permanentes** - pas besoin de synchroniser

3. **Fallback gracieux** - Si les images n'existent pas, l'UI affiche un placeholder gris

4. **La catégorie 'wallpaper'** peut être utilisée pour d'autres pages dans le futur

## 📝 Git Commit Message

```
feat: Migrate wallpapers from /public to app_images table

- Move 32 wallpaper metadata to app_images (category='wallpaper')
- Refactor WallpapersLibraryPage to load dynamically from Supabase
- Add loading and error states
- Support both SVG and PNG formats
- Enable future admin management of wallpapers
- Remove static /public/wallpapers directory

Migration file: migrate_wallpapers_to_app_images.sql
Related files: WallpapersLibraryPage.jsx
```

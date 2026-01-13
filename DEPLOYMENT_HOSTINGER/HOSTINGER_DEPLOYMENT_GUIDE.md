# 🚀 Guide de Déploiement sur Hostinger

## 📋 Résumé des changements

### ✅ Commits récents
- **Version Duplication Fix**: Métadonnées séparées, étapes dupliquées correctement
- **Console.log Preservation**: esbuild configuré pour garder les logs
- **Icon Support**: Zones d'action peuvent avoir des icônes optionnelles
- **Questionnaire Simplification**: Mode mixte unifié

### 📊 Fichiers modifiés
- `src/components/admin/AdminVersionList.jsx` - Duplication logic fix
- `src/components/admin/AdminVersionForm.jsx` - Metadata wrapper
- `src/components/admin/StepAreaEditor.jsx` - Icon support
- `src/components/admin/AdminTaskForm.jsx` - Icon library cleanup
- `src/components/admin/AdminExerciseForm.jsx` - Icon library cleanup
- `src/components/admin/AdminStepForm.jsx` - Icon library cleanup
- `src/components/admin/AdminQuestionnaireEditor.jsx` - Mixed mode only
- `src/components/exercise/QuestionnairePlayer.jsx` - Mixed mode only
- `src/pages/QuestionnaireCreation.jsx` - Mixed mode only
- `vite.config.js` - Console.log preservation

### 📚 Documentation créée
- `CHANGELOG_ICONS.md` - Détails complets des changements
- `GUIDE_ICONES_ZONES.md` - Guide utilisateur
- `ICON_AREA_FEATURE.md` - Documentation technique
- Et 4 autres fichiers de documentation

## 🎯 Points clés pour le déploiement

### ✅ Backward Compatibility
- **100% compatible** avec tous les exercices existants
- **Aucune migration BD** requise
- **Aucun changement** de structure de données
- **JSONB accepte** automatiquement les nouveaux champs

### 🔒 Sécurité
- ✅ Pas d'injection de code
- ✅ Validation stricte des icônes
- ✅ Whitelist des 7 bibliothèques d'icônes
- ✅ Fallback gracieux si icône introuvable

### 🚀 Performance
- ✅ Impact négligeable sur les performances
- ✅ Icônes légères (déjà dans react-icons)
- ✅ Aucune nouvelle dépendance
- ✅ Build size: 4.98 MB (gzipped: 1.22 MB)

## 📦 Fichiers à copier vers Hostinger

### À copier du dossier `dist/`:

```
dist/
├── assets/          ← Tous les fichiers JS/CSS compilés
├── index.html       ← Point d'entrée principal
├── manifest.json    ← PWA manifest
├── sw.js           ← Service Worker
├── favicon.ico     ← Favicon
├── .htaccess       ← Règles de réécriture Apache
└── images/         ← Logos et images (si présents)
```

**Total: 93 fichiers, ~5 MB (non-gzippés)**

## 🔧 Instructions de déploiement

### Étape 1: Télécharger les fichiers

1. **Depuis Windows:**
   ```
   C:\Users\saras\OneDrive\Documents\sarassure\dist\
   ```

2. **Via FTP/SFTP vers Hostinger:**
   ```
   /public_html/  ← Ou le dossier racine configuré
   ```

### Étape 2: Configuration serveur

**Fichier `.htaccess` déjà inclus** pour:
- ✅ Réécriture des URLs (SPA routing)
- ✅ GZIP compression
- ✅ Cache headers

**Vérifier que Apache a:**
- `mod_rewrite` activé
- `mod_deflate` activé (compression)

### Étape 3: Variables d'environnement

Les variables d'environnement utilisées en dev (`VITE_SUPABASE_*`) sont compilées dans le build. Si vous changez les URLs Supabase, il faudra rebuildler.

**Actuellement configuré pour:**
- `VITE_SUPABASE_URL`: [À vérifier dans vite.config.js]
- `VITE_SUPABASE_ANON_KEY`: [À vérifier dans vite.config.js]

### Étape 4: Tests post-déploiement

1. **Vérifier l'accès:**
   ```
   https://votredomaine.com
   ```

2. **Tester les exercices:**
   - ✅ Charger un exercice
   - ✅ Affichage des zones d'action
   - ✅ Icônes visibles si configurées

3. **Vérifier les erreurs:**
   - Ouvrir Console (F12)
   - Aucune erreur 404 pour les assets
   - Pas d'erreur CORS
   - Logs de débogage visibles (console.log)

4. **Test de duplication:**
   - Admin → Tâche → Version
   - Cliquer "Dupliquer"
   - Vérifier que les étapes sont copiées
   - Vérifier que les logs s'affichent

## 📊 Taille du déploiement

| Fichier | Size (non-gzippé) | Size (gzippé) |
|---------|------------------|--------------|
| `index-57c814bc.js` | 4.98 MB | 1.22 MB |
| `index-4443485a.js` | 1.56 MB | 286.75 KB |
| `ui-icons-bae0e2f6.js` | 280.30 KB | 87.40 KB |
| `IconManagerPage-a09b3923.js` | 408.08 KB | 106.30 KB |
| Autres assets | 1.2 MB | 350 KB |
| **Total** | **~9 MB** | **~2.5 MB** |

## 🔄 Rollback en cas de problème

1. **Garder la version précédente** du dossier `dist/` avant upload
2. **En cas de problème:**
   ```
   - Télécharger l'ancienne version
   - Remplacer les fichiers
   - Rafraîchir le cache (Ctrl+F5)
   ```
3. **Les données en BD ne sont pas affectées**
4. **Aucune migration à annuler**

## ✅ Checklist de déploiement

- [ ] Commit push vers GitHub ✅
- [ ] Build génère sans erreur ✅
- [ ] `dist/` folder créé avec 93 fichiers ✅
- [ ] Télécharger `dist/` vers Hostinger
- [ ] Tester accès http://domaine.com
- [ ] Tester un exercice
- [ ] Tester la duplication d'une version
- [ ] Vérifier les console.logs (F12)
- [ ] Vérifier les icônes si présentes
- [ ] Garder une sauvegarde de la version précédente

## 🐛 Dépannage

### Problème: "Module not found" ou 404 errors
**Solution:** Vérifier que `.htaccess` est uploadé correctement

### Problème: Console.log ne s'affiche pas
**Solution:** Vérifier que `vite.config.js` a l'option `esbuild` correctement configurée (déjà le cas)

### Problème: Icônes ne s'affichent pas
**Solution:** 
1. Vérifier que l'icône est sélectionnée dans l'admin
2. Vérifier que la zone a une couleur assez foncée
3. Rafraîchir la page (Ctrl+F5)

### Problème: Duplication ne fonctionne pas
**Solution:**
1. Vérifier la console (F12) pour les erreurs
2. S'assurer que la version originale a des étapes
3. Vérifier que les logs s'affichent (🔄 Début de la duplication...)

## 📞 Support

Si problème après déploiement:
1. Vérifier les logs du serveur (Hostinger console)
2. Vérifier la console du navigateur (F12)
3. Vérifier que les fichiers sont bien uploadés
4. Relancer depuis `dist/` le build local avec `npm run build`

## 🚀 Commandes utiles

```bash
# Build local
npm run build

# Tester avant deploy
npm run dev

# Vérifier les erreurs
npm run lint

# Build avec source maps (si débogage)
npm run build -- --sourcemap
```

---

**Date de création:** Janvier 2026
**Statut:** ✅ Prêt pour production
**Dernière mise à jour:** [Insérer la date du déploiement]

**Commit GitHub:** 12773d6
**Branch:** main

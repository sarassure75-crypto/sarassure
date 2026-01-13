# ✅ Checklist de déploiement Hostinger

## 📝 Avant le déploiement

### Code et Build
- [x] Tous les changements commitées vers GitHub
- [x] Build génère sans erreurs (`npm run build`)
- [x] Dossier `dist/` créé avec 93 fichiers
- [x] Aucune erreur ESLint ou TypeScript
- [x] Tests locaux passent (`npm run dev`)

### Documentation
- [x] Guide de déploiement créé
- [x] Liste des fichiers à copier créé
- [x] Cette checklist créée
- [x] Tous les changements documentés

## 🚀 Étapes de déploiement

### 1. Préparation
- [ ] Sauvegarde locale de `dist/` folder
- [ ] Vérifier les identifiants Hostinger
- [ ] Choisir la méthode de upload (FTP, Panel, Git)
- [ ] Décider du chemin de déploiement (`/public_html/` ou sous-dossier)

### 2. Upload des fichiers
- [ ] Télécharger TOUS les fichiers de `dist/` vers Hostinger
- [ ] ⚠️ Vérifier que `.htaccess` est uploadé (fichier caché)
- [ ] Vérifier que le dossier `assets/` est complet
- [ ] Vérifier que `index.html` est présent
- [ ] Vérifier que `sw.js` est présent
- [ ] Vérifier que `manifest.json` est présent

### 3. Configuration serveur
- [ ] Vérifier que Apache `mod_rewrite` est activé
- [ ] Vérifier que Apache `mod_deflate` est activé (compression)
- [ ] Configurer le domaine pour pointer vers le dossier

### 4. Tests d'accès
- [ ] Accéder à `https://mondomaine.com` → Page charger sans erreur
- [ ] Ouvrir F12 → Console → Pas d'erreur 404
- [ ] Pas de message "Module not found"
- [ ] CSS et JS charger correctement
- [ ] Logo et images affichés

### 5. Tests fonctionnels
- [ ] Tester un exercice
  - [ ] Charger la page d'accueil
  - [ ] Sélectionner une tâche
  - [ ] Lancer un exercice
  - [ ] Affichage du step fonctionne
  - [ ] Zones d'action visibles
  - [ ] Icônes visibles (si configurées)

- [ ] Tester la duplication de version (Admin)
  - [ ] Aller à Admin → Tâche → Versions
  - [ ] Cliquer "Dupliquer" sur une version
  - [ ] Vérifier que le formulaire s'ouvre
  - [ ] Cliquer "Sauvegarder"
  - [ ] Vérifier que la version est dupliquée
  - [ ] Vérifier que les étapes sont copiées
  - [ ] Ouvrir F12 → Console → Logs visibles:
    - [ ] `🔄 Début de la duplication...`
    - [ ] `📋 Version originale trouvée`
    - [ ] `📝 X étape(s) trouvée(s)`
    - [ ] `✅ X étape(s) dupliquée(s)`

- [ ] Tester les questionnaires
  - [ ] Créer/tester un questionnaire
  - [ ] Mode mixte fonctionne
  - [ ] Images et texte s'affichent
  - [ ] Checkboxes pour sélection multiple

- [ ] Mode offline (PWA)
  - [ ] Service Worker enregistré
  - [ ] Peut fonctionner sans connexion
  - [ ] Cache mis à jour correctement

### 6. Vérifications de sécurité
- [ ] Pas de credentials exposées dans le code
- [ ] Pas d'erreur CORS (console)
- [ ] API Supabase accessible
- [ ] Rate limiting ne bloque pas

### 7. Vérifications de performance
- [ ] Page charge en <3 secondes (local)
- [ ] Pas de rechargements infinis
- [ ] GZIP compression activée (F12 → Network → check response headers)
- [ ] Assets cachés correctement

### 8. Tests multi-appareils
- [ ] Téléphone mobile
  - [ ] Accès: OK
  - [ ] Exercice: OK
  - [ ] Zones d'action: OK

- [ ] Tablette
  - [ ] Accès: OK
  - [ ] Exercice: OK
  - [ ] Layout: OK

- [ ] Ordinateur desktop
  - [ ] Accès: OK
  - [ ] Tous les tests: OK

### 9. Tests multi-navigateurs
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## ⚠️ Points critiques

### Ces fichiers sont ESSENTIELS
- `.htaccess` - Sans lui, routing React ne fonctionne pas
- `index.html` - Point d'entrée
- Dossier `assets/` - Code compilé
- `sw.js` - Service Worker

### Ces changements ne casse RIEN
- ✅ Tous les exercices existants fonctionnent
- ✅ Aucune migration BD
- ✅ Icônes sont optionnelles
- ✅ Rollback facile en 1 commit

## 🐛 Si problème détecté

### Problème 1: Page blanche ou 404
**Cause:** `.htaccess` manquant ou Apache mod_rewrite désactivé
**Solution:** 
1. Vérifier que `.htaccess` est uploadé
2. Vérifier avec Hostinger support que mod_rewrite est activé
3. Réupload les fichiers avec `.htaccess`

### Problème 2: Assets manquent (404 errors)
**Cause:** Dossier `assets/` incomplet
**Solution:**
1. Vérifier que le dossier `assets/` est complet (93 fichiers total dans dist)
2. Réupload le dossier `assets/`
3. Rafraîchir avec Ctrl+F5

### Problème 3: Duplication ne fonctionne pas
**Cause:** Erreur dans AdminVersionList ou AdminVersionForm
**Solution:**
1. Vérifier la console (F12) pour l'erreur exacte
2. Vérifier que la version originale a des étapes
3. Si erreur "isNew column not found", il faut le build le plus récent

### Problème 4: Console.log ne s'affiche pas
**Cause:** esbuild a supprimé les console.log (old build)
**Solution:**
1. Vérifier que vous utilisez le commit 12773d6 ou plus récent
2. Si ancien commit, faire `npm run build` avec le vite.config.js actuel
3. Réupload les fichiers

## 📊 Informations de déploiement

| Information | Valeur |
|-------------|--------|
| Commit | 12773d6 |
| Date | Janvier 2026 |
| Fichiers | 93 dans dist/ |
| Size | ~5 MB (non-gzippé) |
| Size | ~1.2 MB (gzippé) |
| Node version | v18+ |
| NPM version | v9+ |

## 🔄 Rollback en cas de problème

1. **Garder ancien dist/ en sauvegarde**
2. **Si problème:**
   - Télécharger l'ancien dist/
   - Réupload sur Hostinger
   - Vider le cache du navigateur (Ctrl+F5)
3. **Les données en BD ne sont pas affectées**
4. **Aucune migration à annuler**

## 📞 Contacts et support

### Si vous avez besoin:
- [ ] Documentation: Lire les fichiers `.md` dans `DEPLOYMENT_HOSTINGER/`
- [ ] Erreur technique: Vérifier la console F12
- [ ] Support Hostinger: https://support.hostinger.com/
- [ ] GitHub repo: https://github.com/sarassure75-crypto/sarassure

## ✨ Après déploiement réussi

### À faire
- [ ] Tester avec de vrais utilisateurs
- [ ] Collecter les retours
- [ ] Monitorer les erreurs en production
- [ ] Garder une sauvegarde de la version déployée

### À ne pas faire
- [ ] ❌ Supprimer les backups
- [ ] ❌ Modifier les fichiers compilés directement
- [ ] ❌ Vider le cache sans raison

## 🎉 Félicitations!

Si tous les tests passent, vous pouvez considérer le déploiement comme réussi!

---

**Statut final:** ✅ Prêt à déployer
**Dernière vérification:** Janvier 2026
**Commit:** 12773d6
**Branch:** main

Bonne chance pour le déploiement! 🚀

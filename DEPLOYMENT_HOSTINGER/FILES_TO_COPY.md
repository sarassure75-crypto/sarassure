# 📋 Fichiers à copier vers Hostinger

## 🎯 Structure à copier

Copier le contenu **complet** du dossier:
```
C:\Users\saras\OneDrive\Documents\sarassure\dist\
```

Vers votre serveur Hostinger (généralement `/public_html/`)

## 📦 Contenu du dossier dist/

```
dist/
├── assets/
│   ├── index-20879ad3.css          (89.71 KB) - Styles compilés
│   ├── stripe-227bc905.js          (0.04 KB) - Stripe integration
│   ├── logger-63a193df.js          (0.06 KB) - Logger
│   ├── index-d203b311.js           (0.06 KB) - Autre code
│   └── [87 autres fichiers JS/CSS]  - Assets compilés
├── index.html                       (6.53 KB) - Point d'entrée HTML
├── manifest.json                    - PWA manifest
├── sw.js                           - Service Worker (cache offline)
├── favicon.ico                     - Icône du site
├── .htaccess                       - Configuration Apache
├── logo-large.png                  - Logo grande version
├── logo.jpg                        - Logo JPG
├── logo.svg                        - Logo SVG
├── logo_192.png                    - Logo PWA 192x192
├── logo_512.png                    - Logo PWA 512x512
├── logo_maskable_192.png          - Logo maskable PWA
└── logo_maskable_512.png          - Logo maskable PWA
```

## ✅ Points importants

### 1. Fichier `.htaccess`
**⚠️ IMPORTANT:** Ce fichier est caché sur Windows mais **DOIT** être uploadé
- Permet le routing SPA (React Router)
- Active GZIP compression
- Configure le cache

### 2. Fichier `sw.js`
- Service Worker pour mode offline
- Cache v6 (mise à jour automatique en prod)
- Ne supprimez pas ce fichier!

### 3. Dossier `assets/`
- Contient tout le code compilé
- Chaque fichier a un hash pour cache-busting
- **Ne pas modifier les noms de fichiers**

### 4. Images/Logos
- `favicon.ico` - Icône dans le navigateur
- `logo*.png` - Logos PWA et affichage
- Utiles pour l'installation PWA

## 🔧 Comment copier (3 options)

### Option 1: FTP via Hostinger Panel (Recommandé)
1. Ouvrir le File Manager Hostinger
2. Naviguer vers `/public_html/`
3. Créer un dossier `app` ou similaire (optionnel)
4. Upload tous les fichiers de `dist/`
5. ✅ Fait!

### Option 2: FTP client (FileZilla, WinSCP)
```
Local: C:\Users\saras\OneDrive\Documents\sarassure\dist\
Remote: /public_html/ ou /home/user/public_html/
```
1. Connecter avec les identifiants Hostinger
2. Drag & drop tous les fichiers de dist/
3. ✅ Fait!

### Option 3: Git deployment (Si Hostinger supporte)
```bash
git clone https://github.com/sarassure75-crypto/sarassure.git
cd sarassure
npm install
npm run build
# Upload le dossier dist/
```

## 🌐 Configuration du domaine

### Si vous voulez que l'app soit à `https://mondomaine.com/`

**Chez Hostinger:**
1. Domain → Select Domain
2. Point vers `/public_html/`
3. ✅ Accès à https://mondomaine.com/

### Si vous voulez sous-domaine `https://app.mondomaine.com/`

**Chez Hostinger:**
1. Créer sous-domaine `app`
2. Point vers `/public_html/app/` (où vous avez copié dist)
3. ✅ Accès à https://app.mondomaine.com/

## 📊 Informations de fichiers

| Fichier/Dossier | Taille | Gzippé | Important? |
|-----------------|--------|--------|-----------|
| `index.html` | 6.53 KB | 2.37 KB | ⭐⭐⭐ ESSENTIEL |
| `assets/` | ~3.5 MB | ~900 KB | ⭐⭐⭐ ESSENTIEL |
| `.htaccess` | <1 KB | <1 KB | ⭐⭐⭐ ESSENTIEL |
| `sw.js` | Petite | - | ⭐⭐⭐ ESSENTIEL |
| `manifest.json` | 2 KB | 1 KB | ⭐⭐ PWA |
| Logos | 200 KB | 50 KB | ⭐ PWA |
| `favicon.ico` | 15 KB | - | ⭐ Esthétique |

## ⚠️ Erreurs courantes à éviter

### ❌ NE PAS
- ❌ Télécharger uniquement `index.html`
- ❌ Oublier le dossier `assets/`
- ❌ Oublier `.htaccess` (fichier caché)
- ❌ Modifier les noms des fichiers
- ❌ Mettre en sous-dossier sans mettre à jour l'URL de base

### ✅ À FAIRE
- ✅ Copier le dossier **complet** `dist/`
- ✅ Garder la structure exacte
- ✅ Vérifier que `.htaccess` est là
- ✅ Vérifier qu'aucun fichier ne manque
- ✅ Tester après upload

## 🔍 Vérification après upload

1. **Vérifier que tous les fichiers sont présents:**
   ```
   https://mondomaine.com/assets/index-*.js (doit exister)
   https://mondomaine.com/index.html (doit exister)
   https://mondomaine.com/sw.js (doit exister)
   ```

2. **Tester l'accès:**
   - Ouvrir https://mondomaine.com
   - Appuyer sur F5 pour rafraîchir
   - Appuyer sur Ctrl+F5 pour vider le cache
   - Vérifier qu'aucune erreur 404

3. **Vérifier la console:**
   - Ouvrir F12
   - Aller à Console
   - Aucune erreur 404 ou CORS
   - Les `console.log` doivent s'afficher

4. **Test complet:**
   - Tester un exercice
   - Admin: tester duplication de version
   - Vérifier que les logs s'affichent
   - Vérifier que les icônes sont visibles

## 🎯 Résumé rapide

```
1. Récupérer le dossier dist/ (C:\Users\saras\...\dist\)
2. Copier TOUS les fichiers vers Hostinger /public_html/
3. Tester avec: https://mondomaine.com
4. Vérifier F12 console pour erreurs
5. ✅ Fait!
```

## 🆘 Besoin d'aide?

### Si 404 errors ou page blanche:
1. Vérifier que `.htaccess` est uploadé
2. Vérifier que Apache `mod_rewrite` est activé
3. Vérifier que le dossier `assets/` est complet

### Si console.log n'apparaît pas:
1. C'est normal si vous utilisez un old vite.config.js
2. Le build actuel (12773d6) a configuré esbuild correctement
3. Les logs doivent apparaître dans F12 → Console

### Si icônes ne s'affichent pas:
1. Vérifier que vous avez sélectionné une icône dans l'admin
2. Vérifier que la zone a une couleur (pas transparente totale)
3. Rafraîchir avec Ctrl+F5

---

**Commit:** 12773d6
**Date:** Janvier 2026
**Statut:** ✅ Prêt pour production

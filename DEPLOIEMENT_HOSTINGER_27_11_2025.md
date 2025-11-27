# Déploiement Hostinger - 27/11/2025

## ✅ GitHub déployé
- **Commit:** `71a718d`
- **Message:** fix(admin): optimisation cache, formulaires et affichage zones d'action
- **Branch:** main
- **Status:** ✅ Poussé avec succès

## 📦 Build Production
- **Status:** ✅ Construit avec succès
- **Taille:** 1,518.73 kB (JS) + 72.26 kB (CSS)
- **Dossier:** `dist/`

## 🚀 Déploiement Hostinger

### Méthode 1 : FTP (Recommandé)

#### Étapes :

1. **Ouvrir FileZilla (ou autre client FTP)**
   - Hôte : `ftp.sarassure.net` ou votre FTP Hostinger
   - Nom d'utilisateur : votre_user@sarassure.net
   - Mot de passe : votre_mot_de_passe_ftp
   - Port : 21

2. **Naviguer vers public_html**
   ```
   /home/username/public_html
   ou
   /public_html
   ```

3. **Vider le dossier public_html**
   - Sélectionner tous les fichiers (sauf .htaccess si important)
   - Supprimer

4. **Uploader le contenu de dist/**
   - Sélectionner TOUT le contenu du dossier `dist/`
   - Glisser-déposer dans `public_html/`
   - Attendre la fin du transfert

#### Fichiers à uploader :
```
✅ index.html
✅ assets/ (dossier complet)
✅ .htaccess
✅ manifest.json
✅ sw.js
✅ logo*.png, logo.svg, logo.jpg
```

### Méthode 2 : Git Auto-Deploy (Hostinger)

Si vous avez configuré Git sur Hostinger :

1. **Connecter SSH Hostinger**
   ```bash
   ssh username@sarassure.net
   ```

2. **Naviguer vers le repo**
   ```bash
   cd ~/public_html
   ```

3. **Pull et Build**
   ```bash
   git pull origin main
   npm install
   npm run build
   cp -r dist/* .
   ```

### Méthode 3 : File Manager Hostinger

1. Connexion à **hpanel.hostinger.com**
2. Aller dans **File Manager**
3. Naviguer vers `public_html`
4. Supprimer les anciens fichiers
5. Upload le zip de `dist/` et extraire

## 🔍 Vérification Post-Déploiement

### Tests à effectuer sur https://sarassure.net

1. **Page Admin Images**
   - [ ] Ouvrir https://sarassure.net/admin/images
   - [ ] Vérifier que les images se chargent
   - [ ] Tester approbation d'une image
   - [ ] Tester rejet avec raison
   - [ ] Vérifier que l'index se met à jour correctement

2. **Page Admin Exercices**
   - [ ] Ouvrir https://sarassure.net/admin/validation/exercices
   - [ ] Vérifier l'affichage des zones d'action
   - [ ] Basculer en mode édition
   - [ ] Vérifier les labels colorés (Cible/Saisie/Départ)
   - [ ] Tester navigation entre étapes
   - [ ] Vérifier le zoom

3. **Console Navigateur**
   - [ ] Ouvrir F12 → Console
   - [ ] Vérifier qu'il n'y a PAS de logs debug excessifs
   - [ ] Vérifier qu'il n'y a pas d'erreurs

4. **Performance**
   - [ ] Tester clics multiples rapides (doivent être bloqués)
   - [ ] Vérifier que les actions ne créent pas de requêtes multiples
   - [ ] Navigation fluide entre items

## 📋 Checklist Déploiement

- [x] Build production créé
- [x] Git commit et push réussis
- [ ] Fichiers uploadés sur Hostinger
- [ ] Tests fonctionnels admin/images
- [ ] Tests fonctionnels admin/validation/exercices
- [ ] Console sans erreurs
- [ ] Cache et chargement optimisés
- [ ] Zones d'action affichées correctement

## 🔧 Configuration .htaccess

Assurez-vous que `.htaccess` contient :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>
```

## 📝 Commandes Rapides

### Build local
```bash
npm run build
```

### Upload FTP (si lftp installé)
```bash
lftp -u username,password ftp.sarassure.net <<EOF
mirror -R dist/ /public_html/
bye
EOF
```

### Upload via SSH (si accès)
```bash
scp -r dist/* username@sarassure.net:~/public_html/
```

## 🐛 Troubleshooting

### Problème : Pages blanches après déploiement
**Solution :** Vérifier que tous les fichiers du dossier `assets/` ont été uploadés

### Problème : Erreur 404 sur les routes
**Solution :** Vérifier que `.htaccess` est présent avec les règles de rewrite

### Problème : Zones d'action invisibles
**Solution :** Vider le cache du navigateur (Ctrl+Shift+Delete)

### Problème : Images ne chargent pas
**Solution :** Vérifier les permissions Supabase et les URLs publiques

## 📊 Statistiques Build

```
Fichier                          Taille      Gzip
─────────────────────────────────────────────────
index.html                      6.27 kB     2.30 kB
assets/index-b7d9554e.css      72.26 kB    12.06 kB
assets/index-8b490f87.js    1,518.73 kB   417.99 kB
─────────────────────────────────────────────────
TOTAL                        ~1,597 kB    ~432 kB
```

## ✅ Modifications Déployées

1. **AdminImageValidation.jsx**
   - useRef pour protection requêtes multiples
   - Index correctement géré après suppressions
   - Protection clics multiples

2. **ExerciseStepViewer.jsx**
   - Affichage zones d'action corrigé
   - Labels visuels colorés
   - Suppression logs debug

3. **AdminExerciseStepEditor.jsx**
   - Cohérence visuelle
   - Labels sur zones
   - Meilleur positionnement

---

**Date:** 27 novembre 2025  
**Développeur:** GitHub Copilot  
**Status GitHub:** ✅ Déployé  
**Status Hostinger:** ⏳ En attente d'upload FTP

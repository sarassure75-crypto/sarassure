# Guide de déploiement Hostinger

## 📦 Fichiers prêts pour le déploiement

Les fichiers de production sont dans le dossier **`dist/`** après avoir exécuté `npm run build`.

---

## 🚀 Étapes de déploiement sur Hostinger

### 1. Préparer les fichiers
✅ **Fait** - Le build de production a été créé dans le dossier `dist/`

### 2. Se connecter à Hostinger
1. Connectez-vous à votre compte Hostinger
2. Accédez au **File Manager** (Gestionnaire de fichiers)
3. Naviguez vers le dossier `public_html` (ou le dossier racine de votre domaine)

### 3. Nettoyer le dossier de destination (si nécessaire)
- Supprimez les anciens fichiers si c'est une mise à jour
- **ATTENTION** : Sauvegardez d'abord toute configuration spécifique (ex: `.htaccess`)

### 4. Uploader les fichiers
Uploadez **TOUT le contenu** du dossier `dist/` vers `public_html` :
- `index.html`
- Dossier `assets/` (tous les fichiers JS et CSS)
- Tous les autres fichiers présents dans `dist/`

### 5. Configuration `.htaccess` (Important pour React Router)

Créez ou modifiez le fichier `.htaccess` dans `public_html` avec ce contenu :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Forcer HTTPS (optionnel mais recommandé)
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Ne pas rediriger les fichiers existants
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  
  # Rediriger toutes les requêtes vers index.html
  RewriteRule . /index.html [L]
</IfModule>

# Cache headers pour optimiser les performances
<IfModule mod_expires.c>
  ExpiresActive On
  
  # Images
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  
  # CSS et JavaScript
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  
  # HTML
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
  AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>
```

---

## 🔐 Variables d'environnement

### Important : Configuration Supabase

Les variables d'environnement sont compilées dans le build. Assurez-vous que ces variables sont correctement configurées dans votre fichier `.env` **AVANT** de faire `npm run build` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
```

Si vous devez changer les variables :
1. Modifiez le fichier `.env` localement
2. Relancez `npm run build`
3. Re-uploadez les fichiers du dossier `dist/`

---

## ✅ Vérifications post-déploiement

### 1. Tester l'application
- [ ] Page d'accueil charge correctement
- [ ] Navigation entre les pages fonctionne
- [ ] Connexion/inscription fonctionnent
- [ ] Images s'affichent depuis Supabase
- [ ] Les filtres (sous-catégories, version Android) fonctionnent

### 2. Vérifier la console du navigateur
- Ouvrez les DevTools (F12)
- Vérifiez qu'il n'y a pas d'erreurs 404
- Vérifiez que les appels API Supabase fonctionnent

### 3. Tester les URLs directes
- Testez des URLs comme `/contributeur/bibliotheque`
- Testez des URLs comme `/admin`
- Ces URLs doivent fonctionner grâce au `.htaccess`

---

## 📊 Structure des fichiers uploadés

```
public_html/
├── index.html                 (Point d'entrée)
├── .htaccess                  (Configuration Apache)
└── assets/
    ├── *.js                   (Fichiers JavaScript)
    ├── *.css                  (Fichiers CSS)
    └── *.svg, *.png          (Assets)
```

---

## 🔧 Dépannage

### Erreur 404 sur les routes
**Problème** : Les routes React (ex: `/contributeur/bibliotheque`) retournent 404  
**Solution** : Vérifiez que le fichier `.htaccess` est présent et correctement configuré

### Images ne chargent pas
**Problème** : Les images Supabase ne s'affichent pas  
**Solution** : 
- Vérifiez les variables d'environnement dans le build
- Vérifiez les règles CORS dans Supabase
- Vérifiez que les images ont le statut `moderation_status = 'approved'`

### Performance lente
**Solution** :
- Activez la compression Gzip (voir `.htaccess`)
- Activez le cache navigateur (voir `.htaccess`)
- Utilisez un CDN si disponible avec Hostinger

### Erreurs de connexion Supabase
**Problème** : Erreurs d'authentification  
**Solution** :
- Vérifiez que l'URL du site est dans les "Authorized redirect URLs" de Supabase
- Ajoutez votre domaine Hostinger dans Supabase Dashboard → Authentication → URL Configuration

---

## 🗄️ Migration de la base de données

### Ne pas oublier d'exécuter la migration !

Le fichier `migration_add_image_subcategories.sql` doit être exécuté dans Supabase :

1. Connectez-vous à Supabase Dashboard
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de `migration_add_image_subcategories.sql`
4. Exécutez la requête

Cette migration ajoute :
- Colonne `subcategory` à la table `app_images`
- Fonction RPC `get_distinct_image_subcategories`
- Index sur `(category, subcategory)`

---

## 📝 Checklist finale

- [x] `npm run build` exécuté avec succès
- [x] Commit et push vers GitHub effectués
- [ ] Fichiers du dossier `dist/` uploadés sur Hostinger
- [ ] Fichier `.htaccess` configuré
- [ ] Migration SQL exécutée dans Supabase
- [ ] Tests de l'application en production
- [ ] Vérification des filtres sous-catégories
- [ ] Vérification des filtres version Android

---

## 🎉 Nouvelles fonctionnalités déployées

Cette version inclut :
- ✅ Système de sous-catégories pour les images
- ✅ Filtres par version Android
- ✅ Parité complète admin/contributeur
- ✅ Support YouTube Shorts
- ✅ Corrections de bugs et optimisations

---

**Date de build** : 2025-12-01  
**Commit** : 97202fc  
**Message** : feat: Ajout filtres sous-catégories et version Android + parité contributeur/admin

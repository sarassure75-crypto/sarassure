
# Guide de Déploiement : De Horizons à Hostinger

Félicitations pour avoir construit votre application ! Ce guide vous expliquera comment exporter votre projet depuis la plateforme Horizons, le préparer et le déployer sur votre hébergement Hostinger.

## Étape 1 : Exporter le Code de l'Application

La première étape consiste à récupérer tous les fichiers de votre projet.

1.  Dans l'interface de Horizons, cliquez sur le menu **"Hostinger Horizons"** en haut à gauche de l'écran.
2.  Sélectionnez l'option **"Exporter le projet"**.
3.  Un fichier `.zip` contenant l'intégralité de votre code sera téléchargé sur votre ordinateur. Décompressez-le dans un dossier de votre choix.

## Étape 2 : Préparer le Projet pour le Déploiement

Avant de pouvoir mettre votre site en ligne, vous devez "construire" la version de production. Cela consiste à transformer votre code de développement en fichiers statiques optimisés (HTML, CSS, JavaScript) que les navigateurs peuvent lire.

1.  **Ouvrez un terminal** ou une invite de commande sur votre ordinateur.
2.  **Naviguez jusqu'au dossier** où vous avez décompressé le projet.

---

## Guide complet de préparation et déploiement (PWA + Supabase)

Les instructions ci-dessous couvrent : vérification PWA, préparation de l'application (variables d'environnement, build), upload sur Hostinger, configuration serveur (.htaccess) et liaison avec votre projet Supabase.

### Vérifier que l'application est PWA-ready
- Vérifiez la présence des fichiers principaux dans le projet :
	- `public/manifest.json` (icônes 192/512, `start_url`, `display: standalone`).
	- `public/sw.js` (service worker) et son enregistrement dans `src/main.jsx`.
	- `index.html` référence le `manifest.json` et contient les meta tags PWA (`theme-color`, apple-touch-icon, etc.).
- Pour tester localement :
	1. Démarrez le serveur de dev (voir section build si besoin).
	2. Ouvrez DevTools → Application : vérifiez que le Manifest est chargé et que le Service Worker est enregistré.
	3. Test offline : DevTools → Network → Offline → rechargez la page; l'application doit afficher la page depuis le cache si le SW fonctionne.

### Préparer les variables d'environnement (Supabase)
- Le client utilise `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` injectées au build. Copiez le fichier d'exemple et remplissez :

```
# à la racine du projet
copy .env.example .env
# Éditez .env et mettez vos valeurs Supabase
VITE_SUPABASE_URL=https://votre-projet-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (clé anon du projet)
```

Remarques :
- N'incluez jamais la `service_role` key dans le front-end.
- Ces variables sont lues au moment du `vite build`.

### Construire la version de production
1. Installer les dépendances et lancer la build (PowerShell):

```powershell
cd c:\Users\saras\Downloads\sarassure.v21.11.25
npm ci
npm run build
```

2. Le dossier `dist/` est créé par Vite. Il contient `index.html`, `sw.js`, `manifest.json`, `assets/`.

### Préparer Hostinger
- Assurez-vous que votre domaine (ou sous-domaine) pointe vers Hostinger et que l'hébergement est actif.
- Activez SSL (Let's Encrypt) dans l'hPanel : le site doit être servi en HTTPS pour que la PWA soit installable.

### Uploader les fichiers sur Hostinger
Option 1 — File Manager (hPanel):
- Ouvrez hPanel → File Manager → `public_html` du domaine.
- Uploadez le contenu du dossier `dist` (gardez `sw.js` et `manifest.json` à la racine).

Option 2 — FTP/SFTP (FileZilla):
- Connectez-vous et transférez le contenu du dossier `dist` vers `public_html`.

Option 3 — Git Deploy (si configuré sur Hostinger)
- Poussez le build vers le repo Git lié à l'hébergement.

### Configurer `.htaccess` (SPA + service worker)
Créez (ou mettez à jour) `public_html/.htaccess` pour réécrire les routes côté client et réduire la mise en cache du service worker :

```
# Serve existing files directly
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Rewrite everything else to index.html (SPA routing)
RewriteRule ^ /index.html [L]

# Ensure service worker not aggressively cached
<Files "sw.js">
	Header set Cache-Control "no-cache, no-store, must-revalidate"
</Files>

# Caching for static assets (optional)
<IfModule mod_expires.c>
	ExpiresActive On
	ExpiresByType text/html "access"
	ExpiresByType image/* "access plus 1 month"
	ExpiresByType application/javascript "access plus 1 year"
	ExpiresByType text/css "access plus 1 year"
</IfModule>
```

> Note : Hostinger utilise Apache sur la plupart des plans; `.htaccess` fonctionne généralement. Si vous êtes sur un autre serveur (NGINX), adaptez la configuration de réécriture.

### Lier l'app à Supabase (configuration côté Supabase)
1. Dans Supabase Console → Authentication → Settings :
	 - Ajoutez votre domaine `https://votre-domaine.tld` aux `Site URL` et `Allowed Redirect URLs` si vous utilisez OAuth.
	 - Ajoutez l'URL aux `Allowed Origins` / CORS si nécessaire.
2. Vérifiez les Row Level Security (RLS) et policies :
	 - Les clés anon sont publiques — protégez les tables sensibles avec des policies qui autorisent uniquement `auth.uid()` à manipuler ses propres lignes.

### Tester en production
1. Accédez à votre domaine en HTTPS.
2. DevTools → Application :
	 - Le Manifest doit être chargé et afficher les icônes.
	 - Service Worker (`sw.js`) doit être enregistré.
3. Test offline : mettez le navigateur en offline et recharger la page (le SW doit servir la page cachée si elle est dans le cache).
4. Tester la fonctionnalité Supabase (login, insert) et monitorer la console / Network (notamment les requêtes vers `*.supabase.co`).

### Bonnes pratiques & remarques de sécurité
- Ne stockez pas de clés secrètes (service_role) côté client.
- Si vous avez besoin de variables différentes entre staging et production, rebuild pour chaque cible avec les `.env` appropriés.
- Surveillez la validité des clés et rotatez-les si nécessaire.

### Options supplémentaires que je peux vous préparer
- Ajouter `.htaccess` prêt à copier dans le repo (fichier `deploy/.htaccess`).
- Préparer un script PowerShell pour builder + uploader via FTP (il faudra vos identifiants FTP si vous voulez l'automatiser).
- Déployer via Git/CI (je peux fournir un exemple GitHub Actions qui build et déploie via FTP ou rsync).

---

Si vous voulez, je peux maintenant :
- ajouter le fichier `.htaccess` dans le repo (prêt à être copié dans `dist`),
- ou créer un script PowerShell automatique pour build + upload sur Hostinger (préparez les identifiants FTP si oui),
- ou vous guider pas-à-pas pendant que vous faites l'upload.

Dites-moi quelle option vous préférez et je m'en occupe.
    
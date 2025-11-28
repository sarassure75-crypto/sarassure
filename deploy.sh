#!/bin/bash

# Script de déploiement automatique pour Hostinger
# Exécuté à chaque push sur GitHub via Git

set -e  # Arrête le script si une erreur survient

echo "=== Début du déploiement ==="
echo "Répertoire courant : $(pwd)"

# 1. Installer les dépendances
echo "Installation des dépendances..."
npm install --production

# 2. Construire le projet
echo "Construction du projet..."
npm run build

# 2.5. Copier le .htaccess racine vers dist/ (écrase celui de public/)
echo "Copie du .htaccess principal..."
cp .htaccess dist/.htaccess

# 3. Copier le contenu de dist vers public_html
echo "Déploiement du dossier dist..."

# Déterminer le chemin de public_html (Hostinger)
# Généralement : /home/username/public_html ou ~/public_html
PUBLIC_HTML="${HOME}/public_html"

# Si public_html existe, vider et copier
if [ -d "$PUBLIC_HTML" ]; then
    echo "Suppression des anciens fichiers dans $PUBLIC_HTML..."
    rm -rf "$PUBLIC_HTML"/*
    echo "Copie des nouveaux fichiers..."
    cp -r dist/* "$PUBLIC_HTML/"
else
    echo "Erreur : $PUBLIC_HTML n'existe pas"
    exit 1
fi

echo "=== Déploiement réussi ! ==="
echo "Fichiers déployés dans : $PUBLIC_HTML"

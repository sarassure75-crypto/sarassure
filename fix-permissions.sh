#!/bin/bash
# Script pour corriger les permissions sur Hostinger
# À exécuter via SSH : bash fix-permissions.sh

cd ~/public_html

# Définir les permissions des dossiers à 755
find . -type d -exec chmod 755 {} \;

# Définir les permissions des fichiers à 644
find . -type f -exec chmod 644 {} \;

# .htaccess doit être en 644
chmod 644 .htaccess

echo "✓ Permissions corrigées !"
echo "Dossiers : 755"
echo "Fichiers : 644"

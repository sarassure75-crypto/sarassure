# Script de préparation pour Hostinger
# Usage: .\prepare-hostinger.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Préparation pour Hostinger" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le dossier dist existe
if (-Not (Test-Path "dist")) {
    Write-Host "❌ Le dossier 'dist' n'existe pas!" -ForegroundColor Red
    Write-Host "   Exécutez d'abord: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Dossier dist trouvé" -ForegroundColor Green

# Créer un dossier pour le déploiement
$deployFolder = "deploy-hostinger"
if (Test-Path $deployFolder) {
    Remove-Item $deployFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deployFolder | Out-Null

Write-Host "📁 Création du dossier de déploiement..." -ForegroundColor Yellow

# Copier le contenu de dist
Copy-Item -Path "dist\*" -Destination $deployFolder -Recurse

Write-Host "✅ Fichiers copiés vers $deployFolder\" -ForegroundColor Green

# Créer un fichier ZIP
$zipPath = "sarassure-hostinger.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "📦 Création du fichier ZIP..." -ForegroundColor Yellow

Compress-Archive -Path "$deployFolder\*" -DestinationPath $zipPath

Write-Host "✅ Archive créée: $zipPath" -ForegroundColor Green

# Statistiques
$zipSize = (Get-Item $zipPath).Length / 1MB
$fileCount = (Get-ChildItem -Path $deployFolder -Recurse -File).Count

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Statistiques" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Nombre de fichiers: $fileCount" -ForegroundColor White
Write-Host "📦 Taille du ZIP: $([math]::Round($zipSize, 2)) MB" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Prêt pour le déploiement!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Dossier: $deployFolder\" -ForegroundColor Yellow
Write-Host "📦 Archive: $zipPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Options de déploiement:" -ForegroundColor Cyan
Write-Host "  1. Uploadez le contenu de '$deployFolder\' via FTP" -ForegroundColor White
Write-Host "  2. Uploadez '$zipPath' via File Manager Hostinger et extrayez-le" -ForegroundColor White
Write-Host ""
Write-Host "N'oubliez pas d'executer la migration SQL dans Supabase!" -ForegroundColor Yellow
Write-Host "Fichier: migration_add_image_subcategories.sql" -ForegroundColor Yellow
Write-Host ""
Write-Host "Voir PRET_POUR_HOSTINGER.md pour les details" -ForegroundColor Cyan

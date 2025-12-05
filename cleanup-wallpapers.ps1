#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Script de nettoyage du dossier /public/wallpapers après migration vers app_images
.DESCRIPTION
  Ce script supprime le dossier /public/wallpapers une fois que les wallpapers
  ont été migrés vers la table app_images et stockés dans Supabase Storage.
.PARAMETER DryRun
  Si True, affiche ce qui serait supprimé sans vraiment supprimer
#>

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

Write-Host "🧹 Cleanup Wallpapers Script" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

$wallpapersPath = Join-Path (Get-Location) "public" "wallpapers"

Write-Host "📍 Target path: $wallpapersPath" -ForegroundColor Yellow

if (-not (Test-Path $wallpapersPath)) {
    Write-Host "✅ Le dossier /public/wallpapers n'existe pas ou a déjà été supprimé" -ForegroundColor Green
    exit 0
}

# Count files
$fileCount = (Get-ChildItem -Path $wallpapersPath -Recurse -File | Measure-Object).Count
$dirCount = (Get-ChildItem -Path $wallpapersPath -Recurse -Directory | Measure-Object).Count

Write-Host "`n📊 Contenu à supprimer:" -ForegroundColor Yellow
Write-Host "  - Fichiers: $fileCount" -ForegroundColor Yellow
Write-Host "  - Dossiers: $dirCount" -ForegroundColor Yellow

# List files
Write-Host "`n📋 Fichiers dans le dossier:" -ForegroundColor Yellow
Get-ChildItem -Path $wallpapersPath -Recurse -File | ForEach-Object {
    Write-Host "  - $($_.FullName)" -ForegroundColor Gray
}

# Warning
Write-Host "`n⚠️  AVERTISSEMENT:" -ForegroundColor Red
Write-Host "  Cette action est IRRÉVERSIBLE" -ForegroundColor Red
Write-Host "  Vérifiez que:" -ForegroundColor Red
Write-Host "    1. Les 32 wallpapers sont dans la table app_images" -ForegroundColor Red
Write-Host "    2. Les fichiers sont dans Supabase Storage (/wallpapers/)" -ForegroundColor Red
Write-Host "    3. La page /ressources/wallpapers charge correctement les images" -ForegroundColor Red
Write-Host "    4. Vous avez un backup (Git commit)" -ForegroundColor Red

if (-not $DryRun) {
    Write-Host "`n🤔 Êtes-vous sûr de vouloir supprimer /public/wallpapers ?" -ForegroundColor Yellow
    $response = Read-Host "Tapez 'OUI' pour confirmer"
    
    if ($response -ne "OUI") {
        Write-Host "❌ Suppression annulée" -ForegroundColor Red
        exit 1
    }
}

# Perform deletion
if ($DryRun) {
    Write-Host "`n🔍 MODE DRY-RUN: Affichage uniquement (aucune suppression)" -ForegroundColor Cyan
    Write-Host "Suppression de: $wallpapersPath" -ForegroundColor Gray
} else {
    Write-Host "`n🗑️  Suppression en cours..." -ForegroundColor Yellow
    
    try {
        Remove-Item -Path $wallpapersPath -Recurse -Force -ErrorAction Stop
        Write-Host "✅ Suppression réussie!" -ForegroundColor Green
        Write-Host "✅ Le dossier /public/wallpapers a été supprimé" -ForegroundColor Green
        
        # Verify deletion
        if (Test-Path $wallpapersPath) {
            Write-Host "❌ ERREUR: Le dossier existe toujours!" -ForegroundColor Red
            exit 1
        } else {
            Write-Host "✅ Vérification: Le dossier n'existe plus" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Erreur lors de la suppression: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Exécuter 'npm run build' pour vérifier que rien n'est cassé" -ForegroundColor Cyan
Write-Host "  2. Tester la page /ressources/wallpapers en local" -ForegroundColor Cyan
Write-Host "  3. Git add, commit et push les changements" -ForegroundColor Cyan
Write-Host "  4. Déployer en production" -ForegroundColor Cyan
Write-Host "  5. Tester à nouveau en production" -ForegroundColor Cyan

Write-Host "`n✨ Cleanup terminé!" -ForegroundColor Green

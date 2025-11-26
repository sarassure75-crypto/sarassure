#!/usr/bin/env pwsh
# VALIDATION TEST SCRIPT - Verify both critical fixes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CRITICAL FIXES VALIDATION" -ForegroundColor Cyan
Write-Host "========================================`n"

# 1. Check searchImages function exists and is properly exported
Write-Host "1. Checking searchImages() function..." -ForegroundColor Yellow
$imageMetadata = Get-Content "src/data/imagesMetadata.js"
if ($imageMetadata -match "export async function searchImages") {
    Write-Host "✅ searchImages() is exported" -ForegroundColor Green
} else {
    Write-Host "❌ searchImages() not found" -ForegroundColor Red
}

if ($imageMetadata -match "getImageUrl\(img\.file_path\)") {
    Write-Host "✅ Admin images use getImageUrl() for URL formatting" -ForegroundColor Green
} else {
    Write-Host "❌ Admin images not using getImageUrl()" -ForegroundColor Red
}

if ($imageMetadata -match "try.*app_images" -or $imageMetadata -match "catch.*adminError") {
    Write-Host "✅ app_images fetch has error handling" -ForegroundColor Green
} else {
    Write-Host "⚠️  app_images error handling unclear" -ForegroundColor Yellow
}

# 2. Check NewContribution.jsx has new interface structure
Write-Host "`n2. Checking NewContribution.jsx interface..." -ForegroundColor Yellow
$newContrib = Get-Content "src/pages/NewContribution.jsx"

if ($newContrib -match "function VersionForm\(") {
    Write-Host "✅ VersionForm component exists" -ForegroundColor Green
} else {
    Write-Host "❌ VersionForm component missing" -ForegroundColor Red
}

if ($newContrib -match "function StepForm\(") {
    Write-Host "✅ StepForm component exists" -ForegroundColor Green
} else {
    Write-Host "❌ StepForm component missing" -ForegroundColor Red
}

if ($newContrib -match "versions.*state|setVersions|editingVersion") {
    Write-Host "✅ Version management state exists" -ForegroundColor Green
} else {
    Write-Host "❌ Version management missing" -ForegroundColor Red
}

if ($newContrib -match "action_type|creation_status|video_url") {
    Write-Host "✅ Admin-like fields present (action_type, creation_status, video_url)" -ForegroundColor Green
} else {
    Write-Host "❌ Admin fields missing" -ForegroundColor Red
}

if ($newContrib -match "searchImages\(") {
    Write-Host "✅ Uses searchImages() for image loading" -ForegroundColor Green
} else {
    Write-Host "❌ Not using searchImages()" -ForegroundColor Red
}

# 3. Check imports
Write-Host "`n3. Checking imports..." -ForegroundColor Yellow
if ($newContrib -match "import.*searchImages.*from.*imagesMetadata") {
    Write-Host "✅ searchImages import present" -ForegroundColor Green
} else {
    Write-Host "❌ searchImages import missing" -ForegroundColor Red
}

if ($newContrib -match "import.*uuidv4.*uuid") {
    Write-Host "✅ uuid import present" -ForegroundColor Green
} else {
    Write-Host "❌ uuid import missing" -ForegroundColor Red
}

if ($newContrib -match "createClient.*supabase") {
    Write-Host "✅ Supabase client initialized" -ForegroundColor Green
} else {
    Write-Host "❌ Supabase client missing" -ForegroundColor Red
}

# 4. Check database submission structure
Write-Host "`n4. Checking database submission logic..." -ForegroundColor Yellow
if ($newContrib -match "contributions.*insert|versions.*insert") {
    Write-Host "✅ Data insertion to contributions and versions tables" -ForegroundColor Green
} else {
    Write-Host "❌ Database insertion missing" -ForegroundColor Red
}

if ($newContrib -match "steps.*insert") {
    Write-Host "✅ Steps data insertion present" -ForegroundColor Green
} else {
    Write-Host "❌ Steps insertion missing" -ForegroundColor Red
}

# 5. Build check
Write-Host "`n5. Checking build status..." -ForegroundColor Yellow
Write-Host "Running npm build..." -ForegroundColor Gray
$buildOutput = npm run build 2>&1 | Out-String
if ($buildOutput -match "error" -or $buildOutput -match "Error") {
    Write-Host "❌ Build has errors" -ForegroundColor Red
    Write-Host $buildOutput
} else {
    Write-Host "✅ Build successful" -ForegroundColor Green
    if ($buildOutput -match "dist/assets/.*\.js\s+([\d,]+)\s+kB") {
        Write-Host "   JS bundle size: $($matches[1]) kB" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "VALIDATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n"

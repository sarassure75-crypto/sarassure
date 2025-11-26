# DEPLOYMENT CHECKLIST - Version 2025-01-23

## 🔴 RAISONS COURANTES DE PAGE BLANCHE EN PRODUCTION

### #1: Variables d'environnement manquantes (80%)
```
❌ VITE_SUPABASE_URL not set
❌ VITE_SUPABASE_ANON_KEY not set
❌ VITE_STRIPE_PUBLIC_KEY not set
```
→ AuthContext fails to initialize → Page renders nothing

**FIX**: Set env vars in Hostinger control panel OR create `.env.production`

### #2: .htaccess missing for SPA routing (10%)
```
❌ Routes like /contributeur return 404
❌ /admin page not found
❌ React Router breaks on direct navigation
```
→ Rewrite rules needed to serve index.html for all routes

**FIX**: Add .htaccess with React Router rewrite rules

### #3: Old Service Worker cache (5%)
```
❌ Browser cached old sw.js
❌ Old assets in Service Worker cache
❌ JavaScript hash mismatch
```
→ Browser serving stale code

**FIX**: Clear browser cache + Ctrl+Shift+R

### #4: Assets not deployed (4%)
```
❌ dist/ folder incomplete
❌ Missing CSS files (404 in Network tab)
❌ Missing JS chunks
```
→ Network tab shows 404 errors

**FIX**: Re-upload complete dist/ folder

### #5: HTTPS/Certificate issues (1%)
```
❌ Service Worker requires HTTPS
❌ Supabase requests blocked by CORS
❌ Certificate expired
```
→ Mixed content warnings or CORS errors

**FIX**: Verify HTTPS is enabled and certificate valid

---

## ✅ STEPS TO DEPLOY

### STEP 1: Verify Local Build ✓
```bash
npm run build

# Check output:
# ✓ dist/index.html exists
# ✓ dist/assets/index-*.js exists
# ✓ dist/assets/index-*.css exists
# ✓ No errors in console
# ✓ Bundle size ~1.4 MB
```

**Current Build Status**: ✅ PASSED
- Time: 7.19s
- JS Bundle: 1,426.59 kB (gzip: 397.17 kB)
- CSS: 67.14 kB (gzip: 11.40 kB)
- Errors: 0

### STEP 2: Prepare Files for Upload
```
Files to upload to Hostinger:
1. dist/ folder (complete - all files)
2. .htaccess file (for SPA routing)
3. public/sw.js (copy to root)
4. public/manifest.json (copy to root)
```

**Files Ready**: YES ✓

### STEP 3: Set Environment Variables
```
Location: Hostinger Control Panel → Environment Variables
OR: Create .env.production in public_html/

VITE_SUPABASE_URL=https://vkvreculoijplklylpsz.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_STRIPE_PUBLIC_KEY=pk_live_<your-key> OR pk_test_<your-key>
```

**Note**: These variables are REQUIRED. Without them:
- Supabase auth fails
- Database queries fail
- App shows blank page

### STEP 4: Access Hostinger File Manager
```
1. Hostinger Dashboard
2. Files → File Manager
3. Navigate to public_html/
4. (This is your web root)
```

### STEP 5: Backup Current Version
```
1. Create folder: backups/
2. Or download current version first
3. Keep as safety net
```

### STEP 6: Upload New Build
```
Method A (Recommended - ZIP upload):
1. Compress dist/ → dist.zip
2. Upload dist.zip to public_html/
3. Right-click extract
4. Delete dist.zip
5. Move files from dist/ to public_html/ root

Method B (Direct file upload):
1. Upload all files from dist/ directly
2. To public_html/ root

Result should be:
public_html/
├── index.html
├── favicon.ico
├── manifest.json
├── .htaccess
├── sw.js (copy from public/)
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [chunk files]
└── [other static files]
```

### STEP 7: Add/Update .htaccess
```
Create or edit public_html/.htaccess

Content:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files/directories that exist
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite all other requests to index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

**Why**: React Router needs all routes to serve index.html
```

### STEP 8: Verify Deployment
```
1. Open browser: https://sarassure.com
2. Open DevTools (F12)
3. Console tab: Check for errors
4. Network tab: Verify:
   ✓ index.html loads (200)
   ✓ assets/index-*.js loads (200)
   ✓ assets/index-*.css loads (200)
   ✓ No 404 errors
   ✓ No CORS errors
   
5. If errors exist → See troubleshooting below
```

---

## 🔍 TROUBLESHOOTING

### Console Error: "Supabase connection failed"
```
Cause: Missing or invalid VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY
Fix:
1. Check Hostinger environment variables set correctly
2. Copy exact keys from Supabase dashboard
3. No extra spaces or quotes
4. Restart app after setting variables
```

### Network Tab: Assets return 404
```
Cause: dist/ not uploaded correctly OR hash mismatch
Fix:
1. Delete all files from public_html/
2. Re-upload dist/ folder completely
3. Verify folder structure matches above
4. Clear browser cache (Ctrl+Shift+R)
```

### Error: "Service Worker registration failed"
```
Cause: HTTPS not enabled or certificate invalid
Fix:
1. Hostinger → SSL/TLS Certificates
2. Ensure valid certificate is active
3. Force HTTPS redirect
4. Check certificate not expired
```

### Routes like /admin return 404
```
Cause: .htaccess missing or malformed
Fix:
1. Create .htaccess in public_html/
2. Copy exact content from STEP 7
3. Save with correct name (.htaccess not .htaccess.txt)
4. Verify it's readable by server
5. Test: https://sarassure.com/admin → should load
```

### Images not loading
```
Cause: Supabase storage bucket not public
Fix:
1. Supabase Dashboard → Storage
2. Select app_images bucket
3. Check privacy: Should allow public downloads
4. Test image URL directly in browser
```

### Page loads but styles missing (white page)
```
Cause: CSS file returns 404
Fix:
1. Check dist/assets/index-*.css exists
2. Verify file uploaded to public_html/assets/
3. Check file permissions (644 or 755)
4. Clear browser cache
```

---

## 📋 FINAL CHECKLIST

### Before Deployment
- [ ] Local build successful: `npm run build` (0 errors)
- [ ] dist/ folder exists with all files
- [ ] .env values verified correct
- [ ] HTTPS enabled on Hostinger
- [ ] Current version backed up
- [ ] .htaccess content ready

### During Deployment
- [ ] Logged into Hostinger File Manager
- [ ] public_html/ emptied (except .htaccess)
- [ ] All dist/ files uploaded
- [ ] .htaccess created/updated
- [ ] Environment variables set
- [ ] public/sw.js copied to root
- [ ] public/manifest.json copied to root

### After Deployment
- [ ] Website loads: https://sarassure.com
- [ ] Console clean (no errors)
- [ ] Assets load (Network tab: all 200 OK)
- [ ] Routes work (/admin, /contributeur, /exercices, etc)
- [ ] Login works (Supabase auth)
- [ ] Images load (exercise thumbnails, uploads)
- [ ] PWA install button visible
- [ ] Service Worker active (Application tab)

---

## 🎯 QUICK SUMMARY

**3 Most Important Things**:
1. **Environment Variables**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
2. **.htaccess file**: Rewrite rules for React Router
3. **Clear Cache**: Browser cache + Service Worker cache

**If page still blank after deploy**:
1. Open DevTools → Console
2. Look for first error message
3. Search that error in troubleshooting section above
4. Apply fix
5. Test again

**Build Status**: READY FOR PRODUCTION ✅
**Last Update**: 2025-01-23 
**Next Component Update**: StepForm with StepAreaEditor integration ✅

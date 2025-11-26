# 📋 QUICK REFERENCE CARD

## Blank Page - Instant Diagnosis

| Symptom | Probable Cause | Fix |
|---------|---|---|
| Blank page, white screen | Missing env vars | Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY |
| Page loads but routes 404 | No .htaccess | Upload .htaccess with rewrite rules |
| Page loaded then broke | Service Worker cache | Ctrl+Shift+R (hard refresh) |
| Missing styles/images | Assets not deployed | Re-upload complete dist/ |
| Mixed content warnings | HTTPS issue | Check certificate in Hostinger |

---

## API Keys Needed

```
FROM SUPABASE DASHBOARD:
□ VITE_SUPABASE_URL = Project URL (Settings → API)
□ VITE_SUPABASE_ANON_KEY = "anon public" key (Settings → API)
  ⚠️ NOT service_role key

FROM STRIPE DASHBOARD:
□ VITE_STRIPE_PUBLIC_KEY = pk_test_* or pk_live_*
  (Developers → API Keys → Publishable key)
```

---

## 3-File Deployment

```
File 1: dist/ folder
        Upload all 14 files to public_html/

File 2: .htaccess
        Create in public_html/
        Content: Use .htaccess-template
        Purpose: SPA routing

File 3: .env.production
        Create in public_html/ OR use control panel
        Content: 3 VITE_* variables from above
        Purpose: Authentication & payments
```

---

## Hostinger File Structure (After Deploy)

```
public_html/                    ← Web root
├── index.html ✓
├── manifest.json ✓
├── favicon.ico ✓
├── .htaccess ✓               ← CRITICAL
├── .env.production ✓         ← CRITICAL
├── sw.js ✓
└── assets/ ✓
    ├── index-*.js
    └── index-*.css
```

---

## Test Checklist

```
After uploading to Hostinger:

□ Open https://sarassure.com → page loads
□ F12 → Console → no red errors
□ F12 → Network → all assets 200 OK
□ Test login with Supabase
□ Navigate to /admin → works
□ Navigate to /contributeur → works
□ Create new exercise → works
□ Upload image → works
```

---

## If Something's Wrong

**Step 1**: Open F12 (DevTools)
**Step 2**: Go to Console tab
**Step 3**: Look for red error message
**Step 4**: Search that error below:

```
Error: "Supabase" undefined
→ VITE_SUPABASE_URL or KEY not set

Error: 404 on /admin
→ .htaccess missing or malformed

Error: Cannot find sw.js
→ sw.js not uploaded to root

Error: CSS not loading
→ dist/ not deployed or incomplete

Error: CORS error from Supabase
→ Check HTTPS enabled + certificate valid
```

---

## Deployment Timeline

```
Prepare (10 min)
├── Gather API keys
└── Read DEPLOYMENT_CHECKLIST_2025.md

Upload (10 min)
├── Zip & upload dist/
├── Upload .htaccess
└── Upload .env.production

Configure (5 min)
├── Set env variables
└── Copy sw.js

Test (5 min)
├── Open site
├── Check console
└── Test functionality

Total: ~30 minutes
```

---

## Critical Files You MUST Have

```
✓ dist/index.html (if missing → page blank)
✓ dist/assets/index-*.js (if missing → page blank)
✓ .htaccess (if missing → routes 404)
✓ VITE_SUPABASE_URL env (if missing → page blank)
✓ VITE_SUPABASE_ANON_KEY env (if missing → page blank)
```

---

## Files You DON'T Need (Don't Upload)

```
✗ node_modules/ (too big, not needed)
✗ .git/ folder (not needed)
✗ src/ folder (not needed, only dist/)
✗ vite.config.js (not needed)
✗ package.json (not needed)
✗ .ts/.tsx files (not needed)
✗ .map files (optional, for debugging)
```

---

## Environment Variables Format

```
Copy exactly as shown:

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx

⚠️ No quotes
⚠️ No spaces
⚠️ No comments
⚠️ Exact values from dashboards
```

---

## .htaccess Minimum Content

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

Save as: `.htaccess` (not `.htaccess.txt`)

---

## Success Indicators

```
✓ https://sarassure.com loads → Page visible
✓ F12 Console → Only blue/gray messages, no red
✓ F12 Network → index.html returns 200
✓ F12 Network → assets/index-*.js returns 200
✓ F12 Network → No 404 errors
✓ Can login → Auth context working
✓ Can navigate → React Router working
✓ Can create exercise → Database working
✓ Can upload image → Storage working
```

---

## Document Reading Order

```
1️⃣  00-START-HERE-DEPLOYMENT-PACKAGE.md
    ↓ (Overview - 5 min read)

2️⃣  DEPLOYMENT_CHECKLIST_2025.md
    ↓ (Step-by-step - 15 min read)

3️⃣  HOSTINGER_UPLOAD_MANIFEST.md
    ↓ (File reference - 5 min read)

4️⃣  Templates
    ↓ (Copy & paste to Hostinger)
    ├── .env.production-template
    └── .htaccess-template

Then: Deploy!
```

---

## Contact Points If Stuck

**Before deploying:**
- Read DEPLOYMENT_CHECKLIST_2025.md completely
- Gather all API keys
- Verify Hostinger access

**While deploying:**
- Follow HOSTINGER_UPLOAD_MANIFEST.md exactly
- Don't skip the .htaccess step
- Verify file structure matches

**After deploying:**
- Check console for errors (F12)
- Look up error in troubleshooting section
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache if needed

**If still stuck:**
- Check all 3 env variables are set correctly
- Verify .htaccess exists and is readable
- Confirm dist/ folder is complete
- Test HTTPS works on domain

---

## Build Status

```
✅ 0 errors
✅ 0 warnings
✅ Production optimized
✅ 1,426.59 kB JS (397.17 kB gzipped)
✅ 67.14 kB CSS (11.40 kB gzipped)
✅ Service Worker ready
✅ PWA manifest included
✅ All routes configured
✅ Supabase client ready
✅ Stripe integration ready
```

**Status: READY FOR PRODUCTION** ✅

---

Print this card. Keep it handy during deployment.

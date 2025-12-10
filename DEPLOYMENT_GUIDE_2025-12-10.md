# 🚀 GUIDE DE DÉPLOIEMENT - 2025-12-10

## État Actuel
✅ **GitHub**: Tous les changements committés et pushés
✅ **Supabase**: Toutes les corrections appliquées en base de données
⏳ **Hostinger**: En attente de déploiement

---

## Changements à Déployer

### 1. **Fichiers React/Frontend** (NPM Build)
```
src/components/
  - Header.jsx (amélioré)
  - OfflineIndicator.jsx
  - ProtectedRoute.jsx (rôles/sécurité)
  - PwaInstallButton.jsx
  - AuthDebugPanel.jsx (NOUVEAU)
  - ProfileSyncTool.jsx (NOUVEAU)
  - SatisfactionSurvey.jsx (NOUVEAU)
  - ui/ThemeSwitcher.jsx (NOUVEAU)
  - admin/ (20+ fichiers améliorés)
    * StepAreaEditor.jsx (DRAG ZONES avec visibility toggle)
    * InputZoneEditor.jsx (visibility toggle)
    * SwipeDragZoneEditor.jsx (visibility toggle)
    * AreaEditor.jsx (opacity logic)
    * AdminLearnerManager.jsx
    * AdminExerciseList.jsx
    * AdminTaskForm.jsx
    * + autres composants

src/contexts/
  - AuthContext.jsx (gestion rôles améliorée)

src/pages/
  - HomePage.jsx
  - LearnerLoginPage.jsx
  - LearnerAccountPage.jsx
  - LearnerProgressPage.jsx (optimisée)
  - DashboardRedirector.jsx (amélioré)
  - ContributorInfoPage.jsx

src/
  - index.css (ajustements)
```

### 2. **Schéma Database** (Schema.sql)
```
schema.sql (MISE À JOUR 2025-12-10)
  - RLS activé sur 4 tables manquantes
  - Toutes les 40+ functions sécurisées
  - SET search_path = 'public', 'pg_catalog'
  - SECURITY DEFINER sur functions sensibles
```

### 3. **Migrations SQL** (À appliquer après déploiement si nouveau DB)
```
migrations/2025-12-10_COMPLETE_FIX_ALL.sql (COMPLÈTE - recommandée)
migrations/2025-12-10_enable_rls_missing_tables.sql
migrations/2025-12-10_enable_rls_safe.sql
migrations/2025-12-10_fix_function_search_path.sql
migrations/2025-12-10_VERIFICATION_COMPLETE.sql (pour tester)
```

---

## Étapes de Déploiement

### Option A: Déploiement Full (Recommandé)
```bash
# 1. SSH vers Hostinger
ssh user@hostinger.com

# 2. Aller dans le répertoire d'application
cd /home/your-user/your-app

# 3. Récupérer les derniers changements
git pull origin main

# 4. Installer les dépendances
npm install

# 5. Build la version production
npm run build

# 6. Redémarrer le service (si PM2)
pm2 restart app
# OU (si systemd)
sudo systemctl restart your-app

# 7. Vérifier
curl https://your-domain.com
```

### Option B: Déploiement Incremental (Si DB déjà synchronisée)
```bash
# Juste redéployer le frontend:
git pull origin main
npm install
npm run build
# Redémarrer le service
```

---

## Vérifications Post-Déploiement

### Frontend
- [ ] Page d'accueil charge
- [ ] Authentification fonctionne (apprenant + formateur)
- [ ] Drag zones visibles avec nouveau styling
- [ ] Visibility toggle (Affichage/Invisible) sur les zones
- [ ] Rôles utilisateurs affichés correctement

### Database (Si nouveau DB)
- [ ] Exécuter: `migrations/2025-12-10_COMPLETE_FIX_ALL.sql`
- [ ] Vérifier les 4 tables RLS:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE tablename IN ('contact_messages', 'images_metadata', 
                      'questionnaire_attempts', 'questionnaire_questions');
  ```
- [ ] Vérifier les functions:
  ```sql
  SELECT COUNT(*) FROM pg_proc WHERE pronamespace = 'public'::regnamespace;
  ```

### Sécurité
- [ ] `get_user_profile()` retourne les données correctement
- [ ] Authentification utilisateur fonctionne (trigger `handle_new_user`)
- [ ] Tous les rôles (apprenant, formateur, administrateur) fonctionnent
- [ ] RLS bloque l'accès non autorisé

---

## Commandes Utiles

### Voir le statut du déploiement
```bash
# Vérifier la branche
git branch -a
git log --oneline -5

# Vérifier les changements
git status
git diff origin/main
```

### Rollback si problème
```bash
# Revenir au commit précédent
git revert HEAD
git push origin main

# OU hard reset (attention!)
git reset --hard origin/main~1
git push -f origin main
```

### Tester Supabase localement (optionnel)
```bash
# Avec Supabase CLI
supabase db pull --schema-only
# Comparer avec le schema.sql
```

---

## Documentation Créée

- `SECURITY_AUDIT_REPORT_2025-12-10.md` - Audit complet de sécurité
- `AMELIORATIONS_UI_UX.md` - Liste des améliorations UI/UX
- `CORRECTIFS_PRODUCTION.md` - Correctifs appliqués
- `OPTIMISATIONS_IMPORTANTES_RESUME.md` - Optimisations

---

## Support

**Changements critiques**:
1. Zone visibilité toggle (UI) ✅ Testé
2. Authentification utilisateur (handle_new_user) ✅ Corrigé
3. Accès profil utilisateur (get_user_profile) ✅ Sécurisé
4. RLS sur toutes les tables ✅ Activé
5. Search path sécurisé sur functions ✅ Appliqué

**À vérifier après déploiement**:
- Les utilisateurs peuvent se connecter (test avec compte apprenant)
- Les formateurs peuvent voir les exercices
- Les administrateurs voient tout
- Les zones d'action sont visibles et interactives

---

## Commits à Suivre

```
ae93366 - feat: synchronisation complète - Corrections Supabase + améliorations React
4224827 - feat: mise à jour schema.sql avec toutes les corrections
```

Bonne chance avec le déploiement ! 🚀

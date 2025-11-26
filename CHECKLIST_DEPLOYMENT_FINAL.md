# ✅ CHECKLIST DÉPLOIEMENT FINAL - SarAssure.net

## 🔄 PRÉ-DÉPLOIEMENT

### Base de Données
- [ ] Migration CGU exécutée sur Supabase production
- [ ] Colonnes `cgu_accepted` et `cgu_accepted_date` créées dans `profiles`
- [ ] Index `idx_profiles_cgu_accepted` créé
- [ ] Test requête : `SELECT cgu_accepted FROM profiles LIMIT 1;`

### Code
- [ ] Tous les logs de debug supprimés (console.log)
- [ ] Variables d'environnement configurées pour production
- [ ] Build de production testé en local : `npm run build && npm run preview`

## 🚀 DÉPLOIEMENT

### Build et Upload
- [ ] Exécuter `npm run build`
- [ ] Vérifier que le dossier `dist/` est créé
- [ ] Vider le dossier `public_html/` de Hostinger
- [ ] Upload de tout le contenu de `dist/` vers `public_html/`
- [ ] Vérifier que `index.html` est à la racine de `public_html/`

### Configuration Serveur
- [ ] Créer/modifier `.htaccess` pour SPA React
- [ ] Configuration SSL activée sur Hostinger
- [ ] DNS pointé vers sarassure.net (pas .com)
- [ ] Test accès : https://sarassure.net

## 🧪 TESTS POST-DÉPLOIEMENT

### Tests Fonctionnels CGU
- [ ] **Admin CGU** :
  - [ ] https://sarassure.net/admin → Utilisateurs → Contributeurs
  - [ ] Badges CGU visibles (vert/rouge) ✅
  - [ ] Bouton "Marquer CGU acceptées" fonctionne
  - [ ] Bouton "Révoquer CGU" fonctionne
  - [ ] Rechargement page conserve les statuts

- [ ] **Contributeur CGU** :
  - [ ] https://sarassure.net/cgu-contributeur accessible
  - [ ] Page charge sans erreur
  - [ ] Checkbox acceptation fonctionne
  - [ ] Bouton "Accepter" actif après checkbox
  - [ ] Redirection vers /contributeur après acceptation
  - [ ] Statut persistant après rechargement (affiche "déjà acceptées")

### Tests Dashboard Admin
- [ ] **Page Revenus** :
  - [ ] https://sarassure.net/admin/revenus charge
  - [ ] Compteur images admin correct (actuellement 10)
  - [ ] Compteur exercices contributeurs correct
  - [ ] Pas d'erreurs console

- [ ] **Page Validation** :
  - [ ] https://sarassure.net/admin/validation/exercices charge
  - [ ] Liste des exercices visible
  - [ ] Boutons d'action fonctionnels

### Tests Généraux
- [ ] Page d'accueil https://sarassure.net charge
- [ ] Navigation entre pages fonctionne
- [ ] Authentification Supabase fonctionne
- [ ] PWA installable (optionnel)
- [ ] Performance acceptable (< 3s chargement)

## 🔧 DÉPANNAGE

### Si badges CGU n'apparaissent pas :
1. Console navigateur → erreurs JavaScript ?
2. Network tab → requête profiles échoue ?
3. Supabase → colonnes CGU créées ?
4. Vérifier : `SELECT * FROM profiles WHERE role = 'contributor' LIMIT 1;`

### Si pages admin ne chargent pas :
1. Erreur 404 → vérifier .htaccess SPA
2. Erreur 500 → vérifier logs Hostinger
3. Page blanche → erreur JavaScript, voir console

### Si authentification échoue :
1. Variables d'environnement correctes ?
2. URL Supabase accessible ?
3. Clés API valides ?

## 📊 MÉTRIQUES SUCCÈS

### Fonctionnalités CGU ✅
- [ ] Badges visuels admin fonctionnels
- [ ] Acceptation contributeur persistante
- [ ] Interface admin complète

### Performance ✅
- [ ] Pages < 3s de chargement
- [ ] Pas d'erreurs console
- [ ] Navigation fluide

### Sécurité ✅
- [ ] HTTPS activé
- [ ] RLS Supabase actif
- [ ] Variables sensibles masquées

---

## 🎯 VALIDATION FINALE

**Quand tous les points sont cochés** :
✅ Le système est PRÊT et FONCTIONNEL sur https://sarassure.net

**Date de déploiement** : _______________
**Validé par** : _______________
**Version** : v21.11.25-CGU-Complete
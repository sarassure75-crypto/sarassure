# 🧪 GUIDE DE TEST - BADGES CGU CONTRIBUTEURS

## ✅ Implémentation complétée

### 🎯 Ce qui a été ajouté

**1. Badges visuels** 
- ✅ Badge vert "CGU acceptées" avec icône CheckCircle 
- ✅ Badge rouge "CGU non acceptées" avec icône XCircle
- ✅ Affichage conditionnel basé sur `raw_user_meta_data.cgu_accepted`

**2. Boutons de gestion admin**
- ✅ Bouton vert "Marquer CGU acceptées" (quand non acceptées)
- ✅ Bouton orange "Révoquer CGU" (quand acceptées)  
- ✅ Icônes conditionnelles (CheckCircle/XCircle)
- ✅ Couleurs adaptatives selon l'action

**3. Persistance en base**
- ✅ Sauvegarde dans `profiles.raw_user_meta_data`
- ✅ Fonction `toggleCGUStatus()` pour admin
- ✅ Fonction `handleAccept()` pour contributeurs

---

## 🧪 Procédure de test

### Test 1: Interface admin
1. **Se connecter en admin**
2. **Aller à Admin → Utilisateurs → Contributeurs**
3. **Vérifier l'affichage:**
   - Voir le contributeur `sara_semhoun@yahoo.fr`
   - Voir le badge rouge "CGU non acceptées" 
   - Voir le bouton vert "Marquer CGU acceptées"

### Test 2: Action admin (simulation)
1. **Cliquer "Marquer CGU acceptées"**
2. **Vérifier les changements:**
   - Badge devient vert "CGU acceptées"
   - Bouton devient orange "Révoquer CGU" 
   - Toast de confirmation apparaît

### Test 3: Révocation admin
1. **Cliquer "Révoquer CGU"**  
2. **Vérifier le retour:**
   - Badge redevient rouge "CGU non acceptées"
   - Bouton redevient vert "Marquer CGU acceptées"
   - Toast de confirmation

### Test 4: Acceptation vraie contributeur
1. **Se connecter comme contributeur** 
2. **Aller sur `/contributeur/cgu`**
3. **Accepter les conditions:**
   - Cocher "J'accepte"
   - Cliquer "Accepter et continuer"
   - Voir "Enregistrement..." puis redirection
4. **Retourner sur admin pour vérifier le badge vert**

---

## 📋 Checklist finale

- [ ] Badge rouge affiché pour contributeurs sans CGU
- [ ] Badge vert affiché pour contributeurs avec CGU  
- [ ] Bouton vert "Marquer CGU acceptées" fonctionnel
- [ ] Bouton orange "Révoquer CGU" fonctionnel
- [ ] Changement de badge en temps réel après action
- [ ] Toast notifications fonctionnelles
- [ ] Page `/contributeur/cgu` sauvegarde en BDD
- [ ] État de chargement "Enregistrement..." visible

---

**Status:** ✅ **IMPLÉMENTATION COMPLÈTE**  
**Prêt pour test:** ✅ OUI  
**Date:** 26 Novembre 2025

---

## 🐛 Dépannage

**Si les badges ne s'affichent pas:**
- Vérifier que `raw_user_meta_data` est bien chargé dans la requête
- Vérifier la console pour erreurs JavaScript

**Si les boutons ne fonctionnent pas:**
- Vérifier les permissions Supabase pour modifier la table `profiles`
- Vérifier les logs de la console réseau
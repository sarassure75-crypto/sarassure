# 🎯 GUIDE COMPLET : Système de Licences et Nouveautés Espace Formateur

## 📋 Vue d'ensemble des changements

### ✅ Nouveautés implémentées

1. **Système de licences par catégorie** (remplace la visibilité par exercice)
2. **Changement de mot de passe par le formateur**
3. **Formulaire de contact** dans la page de connexion
4. **Gestionnaire de messages de contact** (remplace BDD)

---

## 🗄️ 1. Base de données

### Migration à exécuter

**Fichier:** `migrations_add_licenses_system.sql`

Cette migration crée :
- **Table `trainer_category_licenses`** : Licences de catégories pour formateurs
- **Table `contact_messages`** : Messages envoyés via formulaire de contact
- **Politiques RLS** : Sécurité au niveau des lignes

### Exécution
```sql
-- À exécuter dans Supabase SQL Editor
-- Le fichier contient toutes les tables, index et politiques nécessaires
```

### Structure des licences

```
trainer_category_licenses
├── id (UUID)
├── trainer_id (UUID) → auth.users
├── category_id (UUID) → task_categories
├── is_active (BOOLEAN)
├── purchased_at (TIMESTAMP)
└── expires_at (TIMESTAMP) -- NULL = licence à vie
```

### Structure des messages

```
contact_messages
├── id (UUID)
├── name (TEXT)
├── email (TEXT)
├── subject (TEXT)
├── message (TEXT)
├── is_read (BOOLEAN)
├── replied (BOOLEAN)
└── created_at (TIMESTAMP)
```

---

## 🔐 2. Gestion des licences

### Concept

- **Gratuit par défaut** : Catégorie "Tactile"
- **Payant** : Toutes les autres catégories
- **Admin** : Active/désactive les licences pour chaque formateur
- **Formateur** : Voit ses licences actives dans son espace

### API disponible

**Fichier:** `src/data/licenses.js`

```javascript
// Récupérer les licences d'un formateur
await getTrainerLicenses(trainerId)

// Vérifier si le formateur a une licence pour une catégorie
await hasLicenseForCategory(trainerId, categoryId)

// Activer une licence (Admin)
await activateLicense(trainerId, categoryId, expiresAt)

// Désactiver une licence
await deactivateLicense(trainerId, categoryId)

// Récupérer toutes les catégories avec statut de licence
await getCategoriesWithLicenseStatus(trainerId)
```

### Utilisation dans l'admin

**Composant:** `AdminLicenseManager.jsx`
- Accessible depuis **Admin → Utilisateurs → Onglet Licences**
- Sélection du formateur
- Liste des catégories avec switch on/off
- Badge "Gratuit" pour Tactile
- Badge "Actif" pour les licences actives

---

## 🔑 3. Changement de mot de passe

### Pour le formateur

**Page:** `TrainerAccountPage.jsx`

Le formateur peut maintenant **changer son propre mot de passe** :
1. Accéder à son espace compte
2. Section "Changer mon mot de passe"
3. Entrer nouveau mot de passe (min 6 caractères)
4. Confirmer le mot de passe
5. Cliquer sur "Modifier"

**Code utilisé :**
```javascript
await supabase.auth.updateUser({ password: newPassword })
```

### Pour l'admin (bouton de secours)

L'admin conserve le bouton **KeyRound** (réinitialisation) qui remet le mot de passe au `trainer_code`.

**Utilisation :**
- Admin → Utilisateurs → Formateurs
- Cliquer sur l'icône 🔑 à côté du formateur
- Le mot de passe est réinitialisé au code formateur

---

## 📧 4. Formulaire de contact

### Dans la page de connexion

**Page:** `LoginPage.jsx`

La page de connexion contient maintenant **deux onglets** :
1. **Connexion** : Formulaire de login classique
2. **Contact** : Formulaire de contact

### Utilisation

**Composant:** `ContactForm.jsx`

Champs du formulaire :
- **Nom** (requis)
- **Email** (requis, validé)
- **Sujet** (optionnel)
- **Message** (requis)

Après envoi :
- Message enregistré en base
- Toast de confirmation
- Redirection automatique vers l'onglet Connexion

### API des messages

**Fichier:** `src/data/contactMessages.js`

```javascript
// Envoyer un message (public)
await sendContactMessage({ name, email, subject, message })

// Récupérer tous les messages (Admin)
await getContactMessages(unreadOnly)

// Marquer comme lu
await markMessageAsRead(messageId)

// Marquer comme répondu
await markMessageAsReplied(messageId)

// Supprimer un message
await deleteContactMessage(messageId)

// Compter les non lus
await getUnreadCount()
```

---

## 💬 5. Gestionnaire de messages (remplace BDD)

### Dans l'admin

**Composant:** `AdminContactManager.jsx`
- Accessible depuis **Admin → Messages** (remplace l'ancien onglet BDD)
- Liste tous les messages reçus
- Badge indiquant le nombre de nouveaux messages
- Bouton refresh

### Fonctionnalités

Pour chaque message :
- **Icône Mail/MailOpen** : État lu/non lu
- **Badge "Répondu"** : Si le message a été traité
- **Affichage complet** : Nom, email, sujet, message, date
- **Actions** :
  - ✉️ Marquer comme lu
  - ↩️ Marquer comme répondu
  - 🗑️ Supprimer

### Interface

- Messages non lus : **fond bleu** et bordure bleue
- Messages lus : fond blanc
- Tri par date (plus récent en premier)
- Confirmation avant suppression

---

## 👨‍🏫 6. Espace formateur amélioré

**Page:** `TrainerAccountPage.jsx`

### Nouvelle disposition (3 colonnes)

1. **Changement de mot de passe**
   - Nouveau mot de passe
   - Confirmation
   - Validation

2. **Lier un apprenant**
   - Code apprenant
   - Bouton de liaison

3. **Mes licences**
   - Liste des catégories
   - Badge Gratuit/Actif/Non actif
   - ScrollArea (si beaucoup de catégories)

### Tableau des apprenants (pleine largeur)

En dessous des 3 colonnes :
- Liste complète des apprenants liés
- Actions de suppression

---

## 🎨 7. Modifications de l'interface admin

### Navigation mise à jour

**Fichier:** `AdminPage.jsx`

Onglets :
1. Tâches
2. Catégories
3. Images
4. **Utilisateurs** (contient maintenant 4 sous-onglets)
5. FAQ
6. Rapports
7. Corbeille
8. **Messages** (remplace BDD) 📧

### Section Utilisateurs

**Fichier:** `AdminUserManagement.jsx`

4 onglets :
1. **Apprenants**
2. **Formateurs** (avec création et reset password)
3. **Associations** (liaison formateur-apprenant)
4. **Licences** (nouveau ! gestion des licences par catégorie)

---

## 📝 8. Checklist de déploiement

### Avant de tester

- [ ] **Exécuter la migration SQL** dans Supabase
- [ ] Vérifier que les tables sont créées
- [ ] Vérifier les politiques RLS

### Tests à effectuer

#### Admin
- [ ] Créer un formateur
- [ ] Réinitialiser le mot de passe d'un formateur
- [ ] Aller dans Utilisateurs → Licences
- [ ] Activer/désactiver des licences pour un formateur
- [ ] Aller dans Messages
- [ ] Voir les messages de contact

#### Formateur
- [ ] Se connecter avec le code formateur
- [ ] Changer son mot de passe
- [ ] Vérifier que les nouvelles licences s'affichent
- [ ] Tester le changement de mot de passe
- [ ] Se déconnecter et se reconnecter avec le nouveau mot de passe

#### Public
- [ ] Aller sur la page de connexion
- [ ] Cliquer sur l'onglet Contact
- [ ] Remplir et envoyer un message
- [ ] Vérifier qu'il apparaît dans Admin → Messages

---

## 🚀 9. Prochaines étapes suggérées

### Filtrage par licence

Implémenter la logique de visibilité basée sur les licences :
- Dans `TrainerDashboardPage.jsx` : Filtrer les exercices selon les catégories sous licence
- Dans `TaskListPage.jsx` : Afficher seulement les catégories accessibles
- Ajouter un message "Cette catégorie nécessite une licence" pour les catégories verrouillées

### Exemple de code à ajouter

```javascript
// Dans TrainerDashboardPage.jsx
const filteredTasks = tasks.filter(task => {
  // Tactile toujours visible
  if (task.category?.toLowerCase() === 'tactile') return true;
  
  // Vérifier la licence
  return userLicenses.some(license => 
    license.category_id === task.category_id && 
    license.is_active
  );
});
```

### Notifications

- Afficher un badge sur l'onglet Messages si messages non lus
- Email de notification quand un nouveau message arrive (Supabase Edge Function)

### Paiement (optionnel)

- Intégrer Stripe pour l'achat de licences
- Créer une page boutique pour les formateurs
- Webhooks Stripe → activation automatique de licence

---

## 🆘 10. Dépannage

### La migration échoue

- Vérifier que la table `task_categories` existe
- Vérifier que la table `profiles` existe avec le champ `role`

### Les licences ne s'affichent pas

- Vérifier que le formateur est bien authentifié
- Vérifier les politiques RLS dans Supabase
- Console du navigateur : erreurs réseau ?

### Les messages de contact ne fonctionnent pas

- Vérifier la politique RLS "Anyone can send contact messages"
- Vérifier que la table `contact_messages` existe

### Le changement de mot de passe échoue

- Vérifier que le mot de passe fait au moins 6 caractères
- Vérifier la configuration Supabase Auth (longueur minimale)

---

## 📚 11. Fichiers créés/modifiés

### Nouveaux fichiers

```
migrations_add_licenses_system.sql
src/data/licenses.js
src/data/contactMessages.js
src/components/admin/AdminLicenseManager.jsx
src/components/admin/AdminContactManager.jsx
src/components/ContactForm.jsx (existe déjà mais mis à jour)
```

### Fichiers modifiés

```
src/pages/AdminPage.jsx
src/pages/LoginPage.jsx
src/pages/TrainerAccountPage.jsx
src/components/admin/AdminUserManagement.jsx
src/components/admin/AdminTrainerManager.jsx
```

---

## ✨ Résumé des avantages

### Pour l'admin
- ✅ Gestion centralisée des licences
- ✅ Réception et traitement des messages de contact
- ✅ Interface simplifiée (plus de BDD technique)

### Pour le formateur
- ✅ Autonomie pour changer son mot de passe
- ✅ Visibilité claire de ses licences
- ✅ Interface épurée et organisée

### Pour les utilisateurs
- ✅ Formulaire de contact accessible facilement
- ✅ Retour rapide après envoi

---

**Date de création :** 2025-11-23  
**Version :** 1.0  
**Auteur :** GitHub Copilot

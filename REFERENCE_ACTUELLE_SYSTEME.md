# 📖 Référence Actuelle du Système SARASSURE
**Date de mise à jour :** 9 décembre 2025  
**Version :** 1.0.6

---

## 🎯 Vue d'ensemble

**SARASSURE** est une plateforme d'apprentissage numérique pour seniors permettant d'apprendre à utiliser un smartphone Android pas à pas. Le système comprend :

- **Exercices guidés** avec versions multiples et étapes détaillées
- **Questionnaires QCM** avec images
- **Système de contribution** collaborative
- **Gestion de licences** pour formateurs
- **Système de points** et revenus pour contributeurs
- **Application PWA** installable

---

## 👥 Rôles Utilisateurs

### 1. **Apprenant** (`learner`)
- Accès aux exercices et questionnaires
- Suivi de progression
- Signalement d'erreurs
- Demande d'accès contributeur

### 2. **Formateur** (`trainer`)
- Toutes les fonctions apprenant
- Gestion de groupe d'apprenants
- Achat et attribution de licences
- Accès FAQ formateur
- Création de contenu (optionnel)

### 3. **Contributeur** (`contributor`)
- Création d'exercices (soumis à validation)
- Création de questionnaires (soumis à validation)
- Upload d'images
- Bibliothèque d'images personnelle
- Suivi des contributions et revenus
- Acceptation des CGU obligatoire

### 4. **Administrateur** (`admin`)
- Tous les privilèges
- Validation/modération du contenu
- Gestion des catégories
- Statistiques globales
- Gestion des revenus contributeurs

---

## 🗂️ Structure de la Base de Données

### Tables Principales

#### **Utilisateurs & Profils**
- `auth.users` : Authentification Supabase
- `profiles` : Profils utilisateurs (first_name, last_name, role, etc.)
- `learner_visibility` : Visibilité des apprenants pour les formateurs

#### **Contenu Pédagogique**
- `task_categories` : Catégories d'exercices
- `tasks` : Exercices (titre, description, type, statut)
- `versions` : Versions multiples par exercice
- `steps` : Étapes détaillées avec zones cliquables
- `app_images` : Images (pictogrammes, fonds d'écran, QCM)

#### **Questionnaires (QCM)**
- `questionnaire_questions` : Questions avec image optionnelle
- `questionnaire_choices` : Choix de réponses avec image optionnelle
- `questionnaire_attempts` : Tentatives des utilisateurs
- `questionnaire_answers` : Réponses individuelles

#### **Système de Contribution**
- `contributions` : Exercices soumis par contributeurs
- `exercise_requests` : Demandes d'exercices par la communauté
- `contributor_points` : Points accumulés par contributeur
- `contributor_points_history` : Historique des points
- `contributor_exercise_sales` : Ventes d'exercices
- `contributor_image_sales` : Ventes d'images
- `revenue_distributions` : Distributions globales de revenus
- `contributor_distributions` : Distributions individuelles

#### **Progression & Feedback**
- `user_version_progress` : Progression par exercice/version
- `user_exercise_confidence` : Niveau de confiance de l'utilisateur
- `error_reports` : Signalements d'erreurs
- `error_reports_log` : Log des actions admin sur les erreurs

#### **Autres**
- `faq_items` : Items de la FAQ formateur
- `contact_messages` : Messages de contact (page publique)

---

## 🛣️ Routes de l'Application

### **Routes Publiques**
- `/` : Page d'accueil
- `/login` : Connexion admin/formateur
- `/learner-login` : Connexion apprenant
- `/register` : Inscription
- `/presentation` : Présentation de l'application
- `/devenir-contributeur` : Informations pour devenir contributeur
- `/wallpapers` ou `/ressources/wallpapers` : Bibliothèque de fonds d'écran

### **Routes Apprenant** (`learner`)
- `/pwa-home` : Accueil PWA (mode standalone)
- `/taches` : Liste des exercices
- `/tache/:taskId` : Preview d'un exercice
- `/tache/:taskId/version/:versionId` : Exercice complet
- `/questionnaire/:taskId` : Questionnaire
- `/mon-suivi` : Suivi de progression
- `/compte-apprenant` : Compte et paramètres
- `/report-error` : Signaler une erreur

### **Routes Formateur** (`trainer`)
- `/formateur` : Dashboard formateur
- `/formateur/apprenants` : Gestion des apprenants
- `/formateur/gestion-licences` : Gestion des licences
- `/formateur/acheter-licences` : Achat de licences (Stripe)
- `/formateur/faq` : FAQ formateur
- `/formateur/profil` : Profil formateur
- `/compte-formateur` : Compte et paramètres

### **Routes Contributeur** (`contributor`)
- `/contributeur` : Dashboard contributeur
- `/contributeur/nouvelle-contribution` : Créer un exercice
- `/contributeur/questionnaire` : Créer un questionnaire
- `/contributeur/mes-contributions` : Liste des contributions
- `/contributeur/liste-demandes` : Demandes d'exercices de la communauté
- `/contributeur/bibliotheque` : Bibliothèque d'images
- `/contributeur/ventes` : Historique des ventes
- `/contributeur/profil` : Profil contributeur
- `/contributeur/cgu` : CGU contributeurs

### **Routes Admin** (`admin`)
- `/admin/dashboard` : Dashboard général
- `/admin/moderation` : Modération du contenu
- `/admin/validation/exercices` : Validation des exercices
- `/admin/validation/images` : Validation des images
- `/admin/revenus` : Dashboard des revenus
- `/admin/preview/tache/:taskId/version/:versionId` : Preview admin

---

## 🎨 Composants Principaux

### **Pages**
```
src/pages/
├── HomePage.jsx                    # Accueil public
├── LoginPage.jsx                   # Connexion admin/formateur
├── LearnerLoginPage.jsx            # Connexion apprenant
├── RegisterPage.jsx                # Inscription
├── PwaHomePage.jsx                 # Accueil PWA
├── AppPresentationPage.jsx         # Présentation publique
├── TaskListPage.jsx                # Liste des exercices
├── ExercisePage.jsx                # Exercice avec étapes
├── ExerciseStepsPreviewPage.jsx   # Preview exercice
├── QuestionnairePlayerPage.jsx    # Interface de questionnaire
├── LearnerProgressPage.jsx        # Progression apprenant
├── LearnerAccountPage.jsx         # Compte apprenant
├── ReportErrorPage.jsx            # Signalement d'erreur
├── WallpapersLibraryPage.jsx      # Bibliothèque fonds d'écran
│
├── TrainerDashboardPage.jsx       # Dashboard formateur
├── TrainerFaqPage.jsx             # FAQ formateur
├── TrainerAccountPage.jsx         # Compte formateur
│
├── ContributorDashboard.jsx       # Dashboard contributeur
├── NewContribution.jsx            # Créer exercice
├── QuestionnaireCreation.jsx      # Créer questionnaire
├── MyContributions.jsx            # Liste contributions
├── ContributorImageLibrary.jsx    # Bibliothèque images contributeur
├── ContributorProfilePage.jsx     # Profil contributeur
├── ContributorInfoPage.jsx        # Info publique contributeur
├── TermsOfServicePage.jsx         # CGU contributeurs
├── ExerciseRequestsList.jsx       # Demandes d'exercices
│
├── AdminPage.jsx                  # Interface admin principale
├── ModerationPage.jsx             # Modération
├── AdminExerciseValidation.jsx    # Validation exercices
├── AdminImageValidation.jsx       # Validation images
└── AdminRevenueDashboard.jsx      # Dashboard revenus

src/pages/Formateur/
├── TrainerLearnersPage.jsx        # Gestion apprenants
├── BuyLicensesPage.jsx            # Achat licences
├── TrainerProfilePage.jsx         # Profil formateur
└── TrainerLicensesManagementPage.jsx  # Gestion licences
```

### **Composants Admin**
```
src/components/admin/
├── AdminQuestionnaireEditor.jsx   # Éditeur QCM (avec fix stale closure)
├── AdminQuestionnaireValidation.jsx  # Validation QCM
├── AdminTabNavigation.jsx         # Navigation onglets admin
└── [autres composants admin...]
```

### **Composants Contributeur**
```
src/components/
├── ContributorSalesHistory.jsx    # Historique ventes
├── ImageFromSupabase.jsx          # Affichage images Supabase
└── [autres composants...]
```

---

## 🔧 Système Technique

### **Frontend**
- **Framework :** React 18 + Vite
- **Routing :** React Router v6
- **UI Library :** Shadcn/ui (Radix UI + Tailwind)
- **State Management :** Context API (AuthContext, AdminContext)
- **Icons :** Lucide React
- **Animations :** Framer Motion (optionnel)

### **Backend**
- **BaaS :** Supabase (PostgreSQL + Storage + Auth)
- **Storage :** Bucket 'images' pour toutes les images
- **Auth :** Supabase Auth avec RLS (Row Level Security)
- **Edge Functions :** Aucune (logique côté client)

### **PWA**
- **Service Worker :** `public/sw.js` (cache v6)
- **Manifest :** `public/manifest.json` (version 1.0.6)
- **Icônes :**
  - `/logo_192.png` (192×192)
  - `/logo_512.png` (512×512)
  - `/logo_maskable_192.png` (192×192 maskable)
  - `/logo_maskable_512.png` (512×512 maskable)
- **Mode :** Standalone avec détection automatique

### **Build & Déploiement**
- **Build :** `npm run build` → dossier `dist/`
- **Hébergement :** Hostinger (prévu)
- **Variables d'environnement :**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_PUBLIC_KEY` (si Stripe activé)

---

## 📊 Fonctionnalités Implémentées

### ✅ **Système d'Exercices**
- Catégories multiples avec sous-catégories
- Versions multiples par exercice (Android 13, 14, 15...)
- Étapes avec zones cliquables interactives
- Pictogrammes et images d'illustration
- Progression sauvegardée automatiquement
- Niveau de confiance utilisateur

### ✅ **Système de Questionnaires (QCM)**
- **3 types de questions :**
  1. `image_choice` : Réponses en images uniquement
  2. `image_text` : Réponses en texte uniquement
  3. `mixed` : Image obligatoire sur question + Image+Texte sur réponses
- Images stockées dans `app_images` avec UUID
- Validation stricte (AND logic pour type mixed)
- Sauvegarde avec contrainte NOT NULL sur champ text (toujours chaîne vide si vide)
- Interface admin avec toggle d'images (fix stale closure appliqué)
- Interface contributeur avec même logique
- Suivi des tentatives et réponses

### ✅ **Système de Contribution**
- Demande d'accès contributeur (validation admin)
- Création d'exercices (workflow brouillon → validation → publié)
- Création de questionnaires (même workflow)
- Upload d'images avec redimensionnement (max 1 Mo)
- Bibliothèque d'images personnelle + images admin partagées
- Filtres avancés (catégorie, sous-catégorie, version Android, recherche)
- Stats en temps réel (contributions, ventes, revenus)

### ✅ **Système de Points & Revenus**
- Attribution de points automatique :
  - Exercice approuvé : 100 points
  - Image approuvée : 10 points
  - Exercice utilisé : 5 points
  - Image utilisée : 1 point
- Calcul de revenus basé sur les points
- Historique complet des transactions
- Dashboard revenus pour admin
- Dashboard ventes pour contributeur

### ✅ **Système de Licences (Formateurs)**
- Achat de licences via Stripe
- Attribution de licences aux apprenants
- Gestion de la visibilité des apprenants
- Suivi de l'utilisation des licences

### ✅ **Modération Admin**
- Validation/rejet d'exercices avec feedback
- Validation/rejet d'images avec feedback
- Détection automatique de données personnelles (RGPD)
- Actions en masse sur les images
- Édition avant publication
- Statistiques globales

### ✅ **Système de Gestion d'Images**
- Upload avec drag & drop
- Redimensionnement automatique
- Catégories : 'QCM', 'fond d'écran', 'pictogramme', 'illustration'
- Recherche avec filtres multiples
- Preview avec getImageUrl()
- Stockage dans bucket Supabase 'images'
- Référence par UUID (jamais par file_path directement)

### ✅ **PWA (Progressive Web App)**
- Installable sur mobile et desktop
- Mode offline avec cache intelligent
- Détection automatique mode standalone
- Icônes optimisées (logo_192.png, logo_512.png)
- Service worker v6 avec cache versioning

### ✅ **UX/UI**
- Design responsive (mobile-first)
- Animations fluides
- Feedback visuel immédiat (toasts)
- Loading states
- Empty states
- Modals de confirmation
- Badges colorés par statut

---

## 🐛 Correctifs Récents (Session Actuelle)

### **Fix #1 : Stale Closure dans QuestionnaireCreation.jsx**
**Problème :** Les images ne se sauvegardaient pas malgré le clic (logs montraient "Updated" mais state restait null)

**Cause :** Stale closure - tous les handlers capturaient l'ancien state `questions` au lieu du current

**Solution :** Changé tous les `setQuestions(questions.map(...))` en `setQuestions(prevQuestions => prevQuestions.map(...))`

**Fonctions fixées (8) :**
- handleDeleteQuestion
- handleUpdateQuestionText
- handleAddChoice
- handleDeleteChoice
- handleUpdateChoiceText
- handleToggleCorrect
- handleChangeQuestionType
- handleSelectImageForQuestion

**Commit :** 2d05b9c, 889e801, eaed88c, 6424dc5

---

### **Fix #2 : Stale Closure dans AdminQuestionnaireEditor.jsx**
**Problème :** Même bug dans l'interface admin - impossible de modifier les images des questionnaires existants

**Solution :** Appliqué le même pattern de fix

**Fonctions fixées (6) :**
- removeQuestion
- updateQuestion
- addChoice
- removeChoice
- updateChoice
- toggleCorrectAnswer

**Commit :** 5f5987f

---

### **Fix #3 : Contrainte NOT NULL sur questionnaire_choices.text**
**Problème :** Erreur SQL `null value in column "text" violates not-null constraint`

**Cause :** Pour le type `image_choice`, les réponses n'ont que des images (pas de texte), mais le code envoyait parfois `null` au lieu de chaîne vide

**Solution :**
1. Changé `text: choice.text || ''` en `text: (choice.text && choice.text.trim()) || ''`
2. Lors du changement vers type `image_choice`, réinitialiser tous les `text` à chaîne vide

**Commit :** 5504295

---

### **Fix #4 : Logo PWA ne s'affichait pas**
**Problème :** Logo ne s'affichait pas sur l'app PWA après installation

**Cause :** Cache du service worker

**Solution :**
1. Incrémenté version cache : `v5` → `v6` dans `sw.js`
2. Ajouté `"version": "1.0.6"` dans `manifest.json`
3. Hard refresh (Ctrl+Shift+R) pour forcer mise à jour

**Commit :** 5504295

---

### **Fix #5 : Redirection après création de questionnaire**
**Problème :** Redirection vers `/contributeur/mes-contributions` (liste exercices) au lieu du dashboard

**Solution :** Changé redirection vers `/contributeur` (dashboard contributeur)

**Commit :** Inclus dans les commits précédents

---

### **Fix #6 : Logo dans AppBanner et Header**
**Problème :** 
- AppBanner utilisait `/logo.svg` (1.98 Mo, cassé)
- Header utilisait `/logo.png` (404, n'existe pas)

**Solution :** Les deux utilisent maintenant `/logo_192.png` (0.06 Mo, optimisé)

**Commit :** 7bfc521

---

### **Fix #7 : Validation Logic pour type "mixed"**
**Problème :** Le type `mixed` acceptait image OU texte au lieu de image ET texte

**Solution :** Changé validation de `c.imageId || c.text.trim()` à `c.imageId && c.text.trim()`

**Commit :** Inclus dans les commits précédents

---

## 🔐 Sécurité & RLS

### **Row Level Security (RLS)**
Toutes les tables ont des politiques RLS :
- **Lecture :** Selon le rôle et l'ownership
- **Écriture :** Uniquement propriétaire ou admin
- **Modération :** Admin uniquement

### **Authentification**
- Supabase Auth avec JWT
- Refresh tokens automatiques
- Session persistante
- Protection CSRF

---

## 📁 Structure des Fichiers

### **Dossiers Principaux**
```
sarassure.v21.11.25/
├── public/                 # Assets statiques
│   ├── manifest.json       # Manifest PWA v1.0.6
│   ├── sw.js               # Service Worker v6
│   ├── logo_192.png
│   ├── logo_512.png
│   ├── logo_maskable_192.png
│   ├── logo_maskable_512.png
│   └── favicon.ico
│
├── src/
│   ├── App.jsx             # Routes principales
│   ├── main.jsx            # Point d'entrée
│   │
│   ├── components/         # Composants réutilisables
│   │   ├── admin/          # Composants admin
│   │   ├── ui/             # Composants UI (shadcn)
│   │   └── ...
│   │
│   ├── pages/              # Pages de l'app
│   │   ├── Formateur/      # Pages formateur
│   │   └── ...
│   │
│   ├── contexts/           # Context API
│   │   ├── AuthContext.jsx
│   │   └── AdminContext.jsx
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useContributions.js
│   │   ├── useImageLibrary.js
│   │   └── useContributorRevenue.js
│   │
│   ├── data/               # API Supabase
│   │   ├── tasks.js
│   │   ├── contributions.js
│   │   ├── imagesMetadata.js
│   │   ├── contributorRevenue.js
│   │   └── ...
│   │
│   ├── lib/                # Utilitaires
│   │   └── supabaseClient.js
│   │
│   └── styles/             # Styles globaux
│
├── dist/                   # Build de production
│
├── *.sql                   # Migrations SQL
├── *.md                    # Documentation (93 fichiers)
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🧪 Tests & Validation

### **Tests Manuels Requis**

#### **Contributeur - Créer un Questionnaire**
1. Aller sur `/contributeur/questionnaire`
2. Créer une question de type `image_choice`
3. Sélectionner 2+ images pour les réponses
4. Marquer une comme correcte
5. Cliquer "Créer et soumettre"
6. ✅ Devrait rediriger vers `/contributeur`
7. ✅ Devrait apparaître dans "Mes contributions"

#### **Admin - Modifier un Questionnaire**
1. Aller sur `/admin/dashboard`
2. Sélectionner un QCM existant
3. Essayer de changer les images des questions/réponses
4. Cliquer "Enregistrer"
5. ✅ Les modifications devraient persister

#### **PWA - Vérifier le Logo**
1. Installer l'app PWA (si pas déjà fait)
2. Vérifier que le logo s'affiche sur l'écran d'accueil
3. Ouvrir l'app en mode standalone
4. ✅ Le logo devrait s'afficher dans l'interface

#### **Type "mixed" - Validation**
1. Créer question type `mixed`
2. Ajouter image à la question
3. Ajouter image + texte aux réponses
4. ✅ Devrait valider et sauvegarder
5. Essayer sans texte sur une réponse
6. ✅ Devrait empêcher la soumission

---

## 🚀 Déploiement

### **Checklist de Déploiement**

1. **Build**
   ```bash
   npm run build
   ```

2. **Vérifier dist/**
   - index.html existe
   - Assets dans dist/assets/
   - manifest.json et sw.js copiés

3. **Variables d'environnement (Hostinger)**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLIC_KEY` (optionnel)

4. **Upload vers Hostinger**
   - Upload contenu de `dist/` vers racine web
   - Vérifier .htaccess pour SPA routing

5. **Configuration Supabase**
   - Ajouter domaine Hostinger dans "Allowed redirect URLs"
   - Vérifier RLS activé sur toutes les tables
   - Vérifier bucket 'images' public

6. **Post-Déploiement**
   - Tester connexion
   - Tester création d'exercice
   - Tester création de questionnaire
   - Tester PWA install
   - Vérifier service worker actif

---

## 📚 Documentation Complémentaire

### **Fichiers de Référence**
- `ARCHITECTURE_DETAILED_SCHEMA.md` : Architecture détaillée
- `TERMINOLOGIE_PROJET.md` : Terminologie du projet
- `APPLICATION_PRESENTATION.md` : Présentation de l'application
- `DEPLOYMENT_GUIDE.md` : Guide de déploiement
- `CONTRIBUTOR_REVENUE_SYSTEM.md` : Système de revenus
- `LICENSES_SYSTEM_GUIDE.md` : Système de licences
- `CGU_CONTRIBUTEURS.md` : CGU pour contributeurs

### **Guides Techniques**
- `FIX_QCM_IMAGES_COMPLETE_GUIDE.md` : Guide système images QCM
- `CODE_REVIEW_QCM_IMAGES.md` : Review du code QCM
- `VISUAL_OVERVIEW_QCM_IMAGES.md` : Vue d'ensemble visuelle
- `REACT_COMPONENTS_SUMMARY.md` : Résumé des composants React

### **Migrations SQL**
- `schema.sql` : Schéma complet de base
- `migration_points_system.sql` : Système de points
- `migrations_add_contributor_revenue.sql` : Système de revenus
- `create_questionnaire_questions_table.sql` : Tables questionnaires
- `migrations_add_confidence.sql` : Système de confiance
- `migrations_exercise_requests.sql` : Demandes d'exercices

---

## 🎯 Prochaines Étapes Potentielles

### **En Attente de Tests Utilisateur**
- [ ] Validation complète du système de questionnaires
- [ ] Test de la modération admin sur images
- [ ] Test du système de revenus contributeurs
- [ ] Test des licences formateurs

### **Améliorations Futures Possibles**
- [ ] Système de badges et gamification
- [ ] Classement des contributeurs
- [ ] Notifications push PWA
- [ ] Mode sombre
- [ ] Traduction multilingue
- [ ] Export PDF des exercices
- [ ] Statistiques avancées pour formateurs
- [ ] API publique pour intégrations tierces

---

## 📞 Support

### **Contacts Techniques**
- **Repository :** sarassure75-crypto/sarassure
- **Branch :** main
- **Derniers commits :**
  - `5504295` : Fix text constraint + PWA logo
  - `5f5987f` : Fix stale closure AdminQuestionnaireEditor
  - `6424dc5` : Fix stale closure QuestionnaireCreation

### **Problèmes Connus**
Aucun problème bloquant actuellement connu après les derniers fixes.

---

**FIN DU DOCUMENT DE RÉFÉRENCE**

*Ce document résume uniquement les fonctionnalités **réellement implémentées** dans le code actuel. Il exclut toute fonctionnalité planifiée ou documentée mais non codée.*

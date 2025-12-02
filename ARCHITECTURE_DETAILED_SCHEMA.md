# 🏗️ SCHÉMA DÉTAILLÉ - Architecture et Flux de l'Application

## 1. Architecture Générale du Système

```
╔════════════════════════════════════════════════════════════════════════════╗
║                     ARCHITECTURE SARASSURE COMPLÈTE                        ║
╚════════════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────────────────┐
│                             CLIENTS                                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🌐 WEB BROWSER              📱 MOBILE RESPONSIVE         🖥️ DESKTOP PWA   │
│  └─ React 18 + Vite          └─ Tailwind CSS             └─ Offline Mode  │
│     ├─ Pages Apprenant        ├─ Responsive Design       ├─ Service Worker
│     ├─ Pages Contributeur     ├─ Touch-friendly          └─ Cache Strategy
│     ├─ Pages Formateur        └─ Optimisé pour mobiles
│     └─ Pages Admin
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
                                    ↓↑
                           (API Calls HTTP/HTTPS)
                                    ↓↑
┌────────────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🔐 Supabase Client (JS SDK)                                               │
│  ├─ Authentication (Auth0)                                                 │
│  ├─ Real-time Subscriptions                                               │
│  ├─ Query Builder                                                         │
│  └─ File Storage (Buckets)                                                │
│                                                                              │
│  ↓↓↓ REST API / GraphQL ↓↓↓                                               │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
                                    ↓↑
┌────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📊 SUPABASE POSTGRESQL                                                    │
│  ├─ Database Tables (voir schéma détaillé plus bas)                       │
│  ├─ Row Level Security (RLS Policies)                                     │
│  ├─ Triggers (Automatisation)                                             │
│  ├─ Functions RPC (Logique métier)                                        │
│  └─ Indexes (Performance)                                                 │
│                                                                              │
│  🔧 Cloud Functions / Storage                                             │
│  ├─ Image Processing (si besoin)                                          │
│  ├─ File Storage Buckets                                                  │
│  └─ Metadata Management                                                   │
│                                                                              │
│  🔐 Authentication                                                         │
│  ├─ JWT Tokens                                                            │
│  ├─ Session Management                                                    │
│  ├─ Role-based Access Control                                             │
│  └─ Permission Matrix                                                     │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
                                    ↓↑
┌────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT                                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🌍 HOSTINGER (Production)                                                │
│  ├─ Static Files (dist/)                                                  │
│  ├─ CDN for Images                                                        │
│  ├─ SSL/TLS Encryption                                                    │
│  └─ Performance Optimization                                              │
│                                                                              │
│  ☁️ SUPABASE CLOUD                                                        │
│  ├─ Database Hosting                                                      │
│  ├─ Auth Service                                                          │
│  ├─ Real-time Engine                                                      │
│  └─ Monitoring & Analytics                                                │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Schéma de Base de Données

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    STRUCTURE DE LA BASE DE DONNÉES                         ║
╚════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│ USERS & AUTHENTICATION                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  auth.users (managed by Supabase Auth)                                   │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ email                                                                │
│  ├─ email_confirmed_at                                                  │
│  └─ created_at                                                           │
│                                                                           │
│  profiles (public table)                                                 │
│  ├─ id (UUID) [PRIMARY KEY] → references auth.users.id                  │
│  ├─ username (unique)                                                    │
│  ├─ first_name                                                           │
│  ├─ last_name                                                            │
│  ├─ role (apprenant|contributeur|formateur|admin)                       │
│  ├─ created_at                                                           │
│  └─ updated_at                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ CONTENU PÉDAGOGIQUE                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  task_categories                                                         │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ name (unique)                                                        │
│  ├─ description                                                          │
│  └─ created_at                                                           │
│         ↑                                                                │
│         │ (1:N)                                                          │
│         │                                                                │
│  tasks (Exercices)                                                       │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ category_id (FK) → task_categories                                  │
│  ├─ title                                                                │
│  ├─ description                                                          │
│  ├─ icon_name (lucide icon name)                                        │
│  ├─ video_url                                                            │
│  ├─ pictogram_app_image_id (FK) → app_images                            │
│  ├─ status (active|inactive)                                            │
│  ├─ created_by (FK) → profiles                                          │
│  ├─ created_at                                                           │
│  └─ updated_at                                                           │
│         ↓                                                                │
│         │ (1:N)                                                          │
│         ↓                                                                │
│  task_versions (Variantes d'exercice)                                    │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ task_id (FK) → tasks                                                │
│  ├─ name (ex: "Android 12", "iOS 15")                                   │
│  ├─ version                                                              │
│  ├─ status (pending|approved|rejected)                                  │
│  ├─ moderation_notes                                                     │
│  ├─ contributor_id (FK) → profiles                                      │
│  ├─ created_at                                                           │
│  └─ updated_at                                                           │
│         ↓                                                                │
│         │ (1:N)                                                          │
│         ↓                                                                │
│  task_steps (Étapes)                                                     │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ version_id (FK) → task_versions                                     │
│  ├─ step_index (ordre)                                                   │
│  ├─ instruction (texte)                                                  │
│  ├─ app_image_id (FK) → app_images                                      │
│  ├─ action_type (click|drag|scroll|text_input|swipe)                    │
│  ├─ target_area (JSON: {x, y, width, height})                           │
│  ├─ start_area (JSON: optionnel pour drag/swipe)                        │
│  ├─ expected_input (pour text_input)                                    │
│  ├─ keyboard_auto_show (booléen)                                        │
│  └─ created_at                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ IMAGES (DEUX TYPES)                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  app_images (créées par ADMIN)                                           │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ storage_path                                                         │
│  ├─ file_name                                                            │
│  ├─ size_bytes                                                           │
│  ├─ mime_type                                                            │
│  ├─ description                                                          │
│  ├─ created_by (FK) → profiles (admin)                                  │
│  ├─ created_at                                                           │
│  └─ updated_at                                                           │
│         ↑                                                                │
│         └── Utilisées par task_steps                                     │
│                                                                           │
│  images_metadata (créées par CONTRIBUTEURS)                              │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ contributor_id (FK) → profiles                                      │
│  ├─ storage_path                                                         │
│  ├─ file_name                                                            │
│  ├─ size_bytes                                                           │
│  ├─ mime_type                                                            │
│  ├─ description                                                          │
│  ├─ status (pending|approved|rejected)                                  │
│  ├─ moderation_status (not_reviewed|reviewed)                           │
│  ├─ approved_by (FK) → profiles (formateur/admin)                       │
│  ├─ moderation_notes                                                     │
│  ├─ created_at                                                           │
│  └─ updated_at                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ SYSTÈME DE POINTS                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  contributor_points                                                      │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ contributor_id (FK) → profiles (UNIQUE)                             │
│  ├─ total_points (DECIMAL 10,1)                                         │
│  ├─ last_updated                                                         │
│  └─ created_at                                                           │
│         ↓                                                                │
│         │ (1:N)                                                          │
│         ↓                                                                │
│  contributor_points_history (AUDIT TRAIL)                               │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ contributor_id (FK) → profiles                                      │
│  ├─ points_change (DECIMAL 10,1) [peut être négatif]                    │
│  ├─ contribution_type (image|exercise|penalty|manual_adjustment)        │
│  ├─ contribution_id (FK optionnel)                                      │
│  ├─ description (raison du changement)                                  │
│  └─ created_at                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ REVENUS & DISTRIBUTION                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  contributor_revenue_summary                                             │
│  ├─ contributor_id (UUID) [PRIMARY KEY] → profiles                      │
│  ├─ exercise_sales_count                                                │
│  ├─ exercise_revenue_cents (€ en centimes)                              │
│  ├─ image_sales_count                                                   │
│  ├─ image_revenue_cents                                                 │
│  ├─ total_revenue_cents                                                 │
│  ├─ total_sales_count                                                   │
│  ├─ milestone_count                                                      │
│  └─ last_updated                                                         │
│         ↓                                                                │
│         │ (1:N)                                                          │
│         ↓                                                                │
│  revenue_distributions (DISTRIBUTIONS)                                   │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ distribution_date                                                    │
│  ├─ total_platform_revenue_cents                                        │
│  ├─ distribution_pool_cents (20% du total)                              │
│  ├─ total_contributor_points                                            │
│  ├─ status (pending|distributed|paid)                                   │
│  └─ created_at                                                           │
│         ↓                                                                │
│         │ (1:N)                                                          │
│         ↓                                                                │
│  contributor_distributions (PAIEMENTS INDIVIDUELS)                       │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ distribution_id (FK) → revenue_distributions                        │
│  ├─ contributor_id (FK) → profiles                                      │
│  ├─ contributor_points (à cette date)                                   │
│  ├─ amount_cents (€ à recevoir)                                         │
│  ├─ status (pending|paid)                                               │
│  ├─ payment_date                                                         │
│  └─ created_at                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ APPRENTISSAGE & PROGRESSION                                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  learner_completion_history                                              │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ learner_id (FK) → profiles                                          │
│  ├─ version_id (FK) → task_versions                                     │
│  ├─ time_taken_seconds                                                  │
│  ├─ completed_at                                                         │
│  └─ created_at                                                           │
│                                                                           │
│  learner_notes                                                           │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ learner_id (FK) → profiles                                          │
│  ├─ version_id (FK) → task_versions                                     │
│  ├─ note_text                                                            │
│  ├─ created_at                                                           │
│  └─ updated_at                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ SUPPORT & MODÉRATION                                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  error_reports                                                           │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ user_id (FK) → profiles                                             │
│  ├─ category (zone|texte|lien|pictogramme|affichage|autre)             │
│  ├─ description                                                          │
│  ├─ version_id (FK optionnel) → task_versions                           │
│  ├─ step_index                                                           │
│  ├─ app_version                                                          │
│  ├─ status (open|resolved)                                              │
│  ├─ created_at                                                           │
│  └─ updated_at                                                           │
│                                                                           │
│  contact_messages                                                        │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ visitor_email                                                        │
│  ├─ visitor_name                                                         │
│  ├─ message                                                              │
│  ├─ status (new|read|resolved)                                          │
│  └─ created_at                                                           │
│                                                                           │
│  faqs                                                                     │
│  ├─ id (UUID) [PRIMARY KEY]                                             │
│  ├─ question                                                             │
│  ├─ answer                                                               │
│  ├─ category                                                             │
│  ├─ order_index                                                          │
│  ├─ is_pinned                                                            │
│  ├─ status (draft|published|archived)                                   │
│  ├─ created_by (FK) → profiles                                          │
│  ├─ created_at                                                           │
│  └─ updated_at                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Flux de Données - APPRENANT

```
┌──────────────────────────────────────────────────────────────────────────┐
│ APPRENANT - FLUX DE DONNÉES                                              │
└──────────────────────────────────────────────────────────────────────────┘

ÉTAPE 1: AUTHENTIFICATION
└─ Utilisateur login
   ├─ Email + Password
   ├─ → auth.users (Supabase Auth)
   ├─ ← JWT Token
   ├─ → profiles table (load user info)
   └─ ✅ Connecté avec rôle 'apprenant'

ÉTAPE 2: EXPLORER EXERCICES
└─ User accède à /taches
   ├─ SELECT * FROM tasks WHERE status = 'active'
   ├─ JOIN task_versions WHERE status = 'approved'
   ├─ JOIN task_categories
   ├─ FILTER par catégorie (optionnel)
   ├─ Affiche: Card pour chaque exercice
   │  ├─ Titre + Description
   │  ├─ Icône
   │  ├─ Pictogramme
   │  ├─ Lien vidéo (optionnel)
   │  └─ Bouton "Démarrer"
   └─ ✅ Liste à l'écran

ÉTAPE 3: DÉMARRER UN EXERCICE
└─ User clique sur exercice
   ├─ GET /exercise/:taskId/:versionId
   ├─ SELECT * FROM task_steps WHERE version_id = ?
   ├─ SELECT * FROM app_images (pour chaque step)
   ├─ Affiche: Première étape
   │  ├─ Image de la première étape
   │  ├─ Instruction texte
   │  ├─ Bouton audio (si texte)
   │  ├─ Zone d'action surlignée
   │  └─ Barre de progression
   └─ ✅ Interface prête

ÉTAPE 4: EFFECTUER LES ACTIONS
└─ User clique/tape/swipe sur zone d'action
   ├─ Validation JS côté client
   │  ├─ Vérifie: position click vs target_area
   │  ├─ Si action = 'text_input': vérifie expected_input
   │  └─ Si action = 'bravo': pas de validation (zone spéciale)
   ├─ Si ✅ CORRECT:
   │  ├─ Affiche "Bravo!" overlay
   │  ├─ Sound effect
   │  ├─ À l'étape suivante (ou fin)
   │  └─ Met à jour progress bar
   ├─ Si ❌ INCORRECT:
   │  ├─ Affiche indication
   │  ├─ Offre de réessayer
   │  └─ Compte tentative
   └─ Répète pour chaque étape

ÉTAPE 5: TERMINER L'EXERCICE
└─ User complète toutes les étapes
   ├─ INSERT INTO learner_completion_history
   │  ├─ learner_id (du user)
   │  ├─ version_id (exercice complété)
   │  ├─ time_taken_seconds (durée)
   │  └─ completed_at (timestamp)
   ├─ Affiche écran de félicitations
   │  ├─ "Félicitations!"
   │  ├─ Temps écoulé
   │  ├─ Badges gagnés (si applicable)
   │  ├─ Bouton "Retour à la liste"
   │  └─ Bouton "Exercice suivant"
   └─ ✅ Progression sauvegardée

ÉTAPE 6: VOIR SON DASHBOARD
└─ User accède à /compte
   ├─ SELECT FROM learner_completion_history
   │  └─ WHERE learner_id = auth.uid()
   ├─ COUNT exercices complétés
   ├─ SUM temps total
   ├─ SELECT learner_notes
   │  └─ WHERE learner_id = auth.uid()
   ├─ Affiche:
   │  ├─ Exercices complétés (total)
   │  ├─ Badges gagnés
   │  ├─ Temps d'apprentissage total
   │  ├─ Notes personnelles
   │  ├─ Historique récent
   │  └─ Statistiques
   └─ ✅ Dashboard à jour

OPTIONNEL: AJOUTER UNE NOTE
└─ User clique "Ajouter une note"
   ├─ INSERT INTO learner_notes
   │  ├─ learner_id
   │  ├─ version_id
   │  ├─ note_text
   │  └─ created_at
   ├─ Note sauvegardée
   └─ ✅ Note visible au prochain chargement

OPTIONNEL: SIGNALER UNE ERREUR
└─ User clique "Signaler une erreur"
   ├─ INSERT INTO error_reports
   │  ├─ user_id
   │  ├─ category (type d'erreur)
   │  ├─ description
   │  ├─ version_id
   │  ├─ step_index
   │  ├─ app_version
   │  └─ status = 'open'
   ├─ Confirmation
   └─ ✅ Admin notifié
```

---

## 4. Flux de Données - CONTRIBUTEUR

```
┌──────────────────────────────────────────────────────────────────────────┐
│ CONTRIBUTEUR - FLUX DE DONNÉES                                           │
└──────────────────────────────────────────────────────────────────────────┘

ÉTAPE 1: ACCÉDER À SON DASHBOARD
└─ User (contributor) accède à /contributeur
   ├─ SELECT * FROM profiles WHERE id = auth.uid()
   ├─ Vérifier role = 'contributor'
   ├─ SELECT SUM exercices, SUM images, taux acceptation
   ├─ SELECT FROM contributor_points WHERE contributor_id = ?
   ├─ SELECT FROM contributor_revenue_summary WHERE contributor_id = ?
   ├─ SELECT FROM contributor_points_history (historique)
   └─ ✅ Dashboard affiché

ÉTAPE 2: CRÉER UN EXERCICE
└─ User clique "Créer un exercice"
   ├─ Affiche formulaire:
   │  ├─ Titre + Description
   │  ├─ Sélectionner catégorie
   │  ├─ Upload pictogramme
   │  ├─ Ajouter étapes (form répétable)
   │  └─ Créer variantes
   ├─ User remplit première étape:
   │  ├─ Instruction
   │  ├─ Upload image (via bucket storage)
   │  ├─ Configurer zone d'action (draw rectangle)
   │  ├─ Sélectionner type action
   │  └─ Sauvegarder étape
   ├─ Ajoute autres étapes (repeat)
   ├─ Crée variantes (version 2, 3, etc.)
   └─ ✅ Exercice saisi

ÉTAPE 3: VALIDER AVANT SOUMISSION
└─ User clique "Prévisualiser"
   ├─ Affiche exercice comme apprenant le verrait
   ├─ User teste chaque étape
   ├─ User vérifie instructions
   ├─ User teste zones d'action
   └─ Si OK: User clique "Soumettre"

ÉTAPE 4: SOUMETTRE POUR VALIDATION
└─ User clique "Soumettre pour validation"
   ├─ INSERT INTO tasks
   │  ├─ title, description, icon_name
   │  ├─ category_id
   │  └─ created_by = auth.uid()
   ├─ INSERT INTO task_versions
   │  ├─ task_id (créé à l'étape précédente)
   │  ├─ name (ex: "Android 12")
   │  ├─ contributor_id = auth.uid()
   │  └─ status = 'pending'
   ├─ INSERT INTO task_steps (pour chaque étape)
   │  ├─ version_id
   │  ├─ step_index
   │  ├─ instruction
   │  ├─ app_image_id
   │  └─ action_type, target_area, etc.
   ├─ INSERT INTO images_metadata (pour images contributeur)
   │  ├─ contributor_id
   │  ├─ storage_path
   │  ├─ status = 'pending'
   │  └─ moderation_status = 'not_reviewed'
   ├─ Confirmation à l'écran
   └─ ✅ Soumission enregistrée

ÉTAPE 5: SUIVI DE LA VALIDATION
└─ User revient sur dashboard
   ├─ SELECT FROM task_versions WHERE contributor_id = ?
   ├─ Affiche statut (pending, approved, rejected)
   ├─ Si rejected: affiche commentaires du modérateur
   └─ ✅ Suivi visible

ÉTAPE 6: ÉDITER ET RESOUMETTTRE (si rejet)
└─ User clique "Éditer" sur rejet
   ├─ Peut modifier l'exercice
   ├─ Voit commentaires du modérateur
   ├─ Fait les corrections
   ├─ Clique "Resoumetttre"
   ├─ UPDATE task_versions SET status = 'pending'
   └─ ✅ Resoumission enregistrée

ÉTAPE 7: VER SES POINTS
└─ User voit section "Vos Points"
   ├─ SELECT FROM contributor_points
   │  └─ WHERE contributor_id = auth.uid()
   ├─ SELECT SUM FROM contributor_points (tous)
   ├─ Calcul: vos_points / total_points * 100 = %
   ├─ Affiche:
   │  ├─ Vos points actuels
   │  ├─ Points plateforme
   │  ├─ Votre % du total
   │  └─ Historique (points_history table)
   └─ ✅ Points visibles

ÉTAPE 8: VER SES REVENUS
└─ User voit section "Revenus et Paliers"
   ├─ SELECT FROM contributor_revenue_summary
   │  └─ WHERE contributor_id = auth.uid()
   ├─ Affiche:
   │  ├─ Licences vendues (plateforme)
   │  ├─ Revenus générés (plateforme)
   │  ├─ Reversement acquis (20%)
   │  ├─ Palier atteint
   │  └─ Progression vers prochain palier
   ├─ Formule visible: (vos_points/total) × (CA × 20%)
   └─ ✅ Revenus transparents

ÉTAPE 9: VER LE SYSTÈME DE POINTS
└─ User voit section "Système de Points"
   ├─ Explanation générale
   ├─ Règles d'attribution:
   │  ├─ Images: +1 point
   │  ├─ Exercices: +5 base, +2 bonus, +3/variante
   │  └─ Pénalités (si rejet):
   │     ├─ Rejet simple: -2
   │     ├─ Données perso: -5
   │     ├─ Plagiat: -10
   │     └─ Erreur: -3
   ├─ Formule d'attribution
   ├─ Exemple concret
   └─ ✅ Education du contributeur
```

---

## 5. Flux de Données - MODÉRATEUR

```
┌──────────────────────────────────────────────────────────────────────────┐
│ MODÉRATEUR/FORMATEUR - FLUX DE DONNÉES                                   │
└──────────────────────────────────────────────────────────────────────────┘

ÉTAPE 1: ACCÉDER AU PANEL
└─ User (role=formateur) accède à /admin
   ├─ Vérifier role = 'formateur' ou 'admin'
   ├─ Affiche AdminTabNavigation avec onglets
   ├─ Counters de tâches en attente
   └─ ✅ Panel affiché

ÉTAPE 2: VALIDER LES EXERCICES
└─ User clique "Valider exercices"
   ├─ SELECT FROM task_versions WHERE status = 'pending'
   ├─ Affiche liste des versions en attente
   ├─ User clique sur une version
   ├─ SELECT * FROM task_steps WHERE version_id = ?
   ├─ SELECT * FROM tasks, task_categories (infos complètes)
   ├─ Prévisualisation interactive:
   │  ├─ Voir comme apprenant le verrait
   │  ├─ Vérifier chaque étape
   │  ├─ Tester les zones d'action
   │  └─ Lire instructions
   ├─ Vérifier critères:
   │  ├─ ☑️ Contenu cohérent
   │  ├─ ☑️ Images qualité
   │  ├─ ☑️ Instructions claires
   │  ├─ ☑️ Pas de données perso
   │  ├─ ☑️ Pas de duplicat
   │  └─ ☑️ Approprié
   └─ ✅ Vérification complète

ÉTAPE 3: APPROUVER
└─ Si OK: User clique "Approuver"
   ├─ UPDATE task_versions
   │  └─ SET status = 'approved'
   ├─ SELECT add_contributor_points()
   │  ├─ RPC call pour ajouter points
   │  ├─ +5 points (base)
   │  ├─ +2 points si ≥5 tâches
   │  ├─ +3 points par variante
   │  └─ contribution_type = 'exercise'
   ├─ INSERT INTO contributor_points_history
   │  ├─ points_change = +points
   │  ├─ description = "Exercice approuvé"
   │  └─ contribution_type = 'exercise'
   ├─ Confirmation affichée
   └─ ✅ Exercice publié

ÉTAPE 4: REJETER AVEC FEEDBACK
└─ Si NON OK: User clique "Rejeter"
   ├─ Affiche modal pour commentaires
   │  ├─ Sélectionner raison:
   │  │  ├─ "Rejet simple"
   │  │  ├─ "Données personnelles"
   │  │  ├─ "Plagiat/répétition"
   │  │  └─ "Erreur détectée"
   │  └─ Ajouter commentaires personnalisés
   ├─ UPDATE task_versions
   │  ├─ SET status = 'rejected'
   │  ├─ SET moderation_notes = commentaires
   │  └─ SET reviewer_id = auth.uid()
   ├─ SELECT apply_rejection_penalty()
   │  ├─ RPC call selon raison
   │  ├─ -2 points (simple)
   │  ├─ -5 points (données perso)
   │  ├─ -10 points (plagiat)
   │  └─ -3 points (erreur)
   ├─ INSERT INTO contributor_points_history
   │  ├─ points_change = -points
   │  ├─ contribution_type = 'penalty'
   │  ├─ description = raison
   │  └─ contribution_id = version_id
   ├─ Notification contributeur (email optionnel)
   └─ ✅ Rejet enregistré

ÉTAPE 5: VALIDER LES IMAGES
└─ User clique "Valider images"
   ├─ SELECT FROM images_metadata
   │  └─ WHERE status = 'pending'
   ├─ Affiche galerie des images
   ├─ User clique sur image
   ├─ Affiche image haute qualité
   ├─ Vérifier:
   │  ├─ Contenu approprié
   │  ├─ Format correct
   │  ├─ Pas de données perso
   │  ├─ Pas de contenu inapproprié
   │  └─ Qualité acceptable
   └─ ✅ Vérification image

ÉTAPE 6: APPROUVER IMAGE
└─ Si OK: User clique "Approuver"
   ├─ UPDATE images_metadata
   │  ├─ SET status = 'approved'
   │  ├─ SET moderation_status = 'reviewed'
   │  ├─ SET approved_by = auth.uid()
   │  └─ SET approved_at = NOW()
   ├─ SELECT add_contributor_points()
   │  ├─ +1 point par image
   │  └─ contribution_type = 'image'
   ├─ INSERT INTO contributor_points_history
   │  ├─ points_change = +1
   │  ├─ contribution_type = 'image'
   │  └─ description = "Image approuvée"
   └─ ✅ Image publiée

ÉTAPE 7: REJETER IMAGE
└─ Si NON OK: User clique "Rejeter"
   ├─ UPDATE images_metadata
   │  ├─ SET status = 'rejected'
   │  ├─ SET moderation_status = 'reviewed'
   │  └─ SET moderation_notes = raison
   ├─ SELECT apply_rejection_penalty()
   │  └─ -2 points (image rejetée)
   ├─ INSERT INTO contributor_points_history
   │  ├─ points_change = -2
   │  ├─ contribution_type = 'penalty'
   │  └─ description = "Image rejetée"
   └─ ✅ Image rejetée

ÉTAPE 8: VER LES STATISTIQUES
└─ User clique "Dashboard"
   ├─ SELECT COUNT FROM task_versions WHERE status = 'approved'
   ├─ SELECT COUNT FROM images_metadata WHERE status = 'approved'
   ├─ Calcul taux d'acceptation par contributeur
   ├─ Affiche:
   │  ├─ Exercices validés
   │  ├─ Images validées
   │  ├─ Taux d'acceptation
   │  ├─ Contributeurs par qualité
   │  └─ Pénalités appliquées
   └─ ✅ Analytics visibles
```

---

## 6. Flux de Données - ADMINISTRATEUR

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ADMINISTRATEUR - FLUX DE DONNÉES                                         │
└──────────────────────────────────────────────────────────────────────────┘

ÉTAPE 1: VOIR LE DASHBOARD GLOBAL
└─ User (role=admin) accède à /admin/dashboard
   ├─ SELECT COUNT(DISTINCT learner_id) FROM learner_completion_history
   ├─ SELECT COUNT(DISTINCT contributor_id) FROM contributors
   ├─ SELECT COUNT FROM tasks WHERE status = 'active'
   ├─ SELECT COUNT FROM task_versions WHERE status = 'pending'
   ├─ SELECT COUNT FROM images_metadata WHERE status = 'pending'
   ├─ SELECT SUM(total_revenue_cents) FROM contributor_revenue_summary
   ├─ Affiche:
   │  ├─ Statistiques globales
   │  ├─ Contenus à modérer
   │  ├─ Utilisateurs actifs
   │  ├─ CA généré
   │  └─ État du système
   └─ ✅ Vue d'ensemble

ÉTAPE 2: GÉRER LES POINTS
└─ User clique "Points"
   ├─ SELECT * FROM profiles WHERE role = 'contributor'
   ├─ SELECT FROM contributor_points FOR EACH contributor
   ├─ Calcul total des points
   ├─ Affiche tableau:
   │  ├─ Contributeur (nom + ID)
   │  ├─ Points totaux
   │  ├─ % du total
   │  ├─ Dernière mise à jour
   │  └─ Bouton "Modifier"
   ├─
   ├─ Admin points:
   │  ├─ SELECT FROM profiles WHERE role = 'admin'
   │  ├─ SELECT FROM contributor_points
   │  └─ Affiche (NON pénalisable)
   └─ ✅ Gestion visible

ÉTAPE 3: AJUSTER LES POINTS MANUELLEMENT
└─ User clique "Modifier" sur contributeur
   ├─ Affiche formulaire:
   │  ├─ Points à ajouter/retirer (nombre)
   │  ├─ Raison (texte)
   │  └─ Bouton "Enregistrer"
   ├─ User entre:
   │  ├─ +10 (correction erreur système)
   │  └─ Raison: "Correction: points non appliqués"
   ├─ User clique "Enregistrer"
   ├─ SELECT add_contributor_points()
   │  ├─ RPC call
   │  ├─ points_change = +10
   │  ├─ contribution_type = 'manual_adjustment'
   │  └─ description = raison saisie
   ├─ UPDATE contributor_points
   │  └─ total_points += 10
   ├─ INSERT INTO contributor_points_history
   │  └─ Trace complète
   ├─ Confirmation affichée
   └─ ✅ Points ajustés

ÉTAPE 4: VOIR LES REVENUS
└─ User clique "Revenus"
   ├─ SELECT FROM contributor_revenue_summary
   ├─ SELECT SUM(total_revenue_cents) (CA total)
   ├─ Calcul pool 20%
   ├─ Affiche:
   │  ├─ CA total généré
   │  ├─ Pool contributeurs (20%)
   │  ├─ Pool admin (80%)
   │  ├─ Distribution par contributeur
   │  ├─ Licences vendues par type
   │  └─ Milestones atteints
   ├─ Peut voir détails par contributeur
   │  ├─ Points à cette date
   │  ├─ % du total
   │  ├─ Montant à recevoir
   │  └─ Historique paiements
   └─ ✅ Transparence complète

ÉTAPE 5: VALIDER CONTENUS (COMME MODÉRATEUR)
└─ User peut aussi:
   ├─ Valider exercices (/admin/validation/exercices)
   ├─ Valider images (/admin/validation/images)
   ├─ Même flux que modérateur
   └─ Avec pouvoirs supplémentaires

ÉTAPE 6: GÉRER LES UTILISATEURS
└─ User clique "Utilisateurs"
   ├─ SELECT * FROM profiles
   ├─ Affiche liste complète:
   │  ├─ Nom + Email
   │  ├─ Rôle
   │  ├─ Date création
   │  └─ Statut (actif/suspendu)
   ├─ User peut:
   │  ├─ Voir détails d'un utilisateur
   │  ├─ Changer le rôle
   │  ├─ Suspendre le compte
   │  └─ Voir historique
   └─ ✅ Gestion complète

ÉTAPE 7: GÉRER LA CONFIGURATION
└─ User clique "Catégories"
   ├─ SELECT * FROM task_categories
   ├─ Peut:
   │  ├─ Ajouter catégorie
   │  ├─ Éditer
   │  ├─ Supprimer
   │  └─ Réordonner
   └─ Changements appliqués en temps réel

ÉTAPE 8: GÉRER LA FAQ
└─ User clique "FAQ"
   ├─ SELECT * FROM faqs
   ├─ Peut:
   │  ├─ Ajouter question/réponse
   │  ├─ Éditer existantes
   │  ├─ Supprimer
   │  ├─ Épingler important
   │  └─ Archiver anciennes
   └─ ✅ FAQ à jour

ÉTAPE 9: VER LES ERREURS SIGNALÉES
└─ User clique "Rapports"
   ├─ SELECT FROM error_reports WHERE status = 'open'
   ├─ Affiche:
   │  ├─ Catégorie erreur
   │  ├─ Description
   │  ├─ Exercice/Étape
   │  ├─ Signalé par qui
   │  └─ Date
   ├─ User peut:
   │  ├─ Voir détails
   │  ├─ Assigner à modérateur
   │  ├─ Marquer comme résolu
   │  └─ Ajouter notes
   └─ ✅ Tracking des problèmes

ÉTAPE 10: GÉRER LES MESSAGES
└─ User clique "Messages"
   ├─ SELECT FROM contact_messages WHERE status = 'new'
   ├─ Affiche:
   │  ├─ Email visiteur
   │  ├─ Message
   │  ├─ Date
   │  └─ Statut (new/read/resolved)
   ├─ User peut:
   │  ├─ Lire message
   │  ├─ Répondre (email)
   │  ├─ Marquer comme résolu
   │  └─ Archiver
   └─ ✅ Support géré
```

---

## 7. Logique des Pénalités - Détail

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SYSTÈME DE PÉNALITÉS - DÉTAIL                                            │
└──────────────────────────────────────────────────────────────────────────┘

FONCTION: apply_rejection_penalty(contributor_id, version_id, reason)

Entrée: reason = raison du rejet
   ├─ "Rejet simple"
   ├─ "Données personnelles"
   ├─ "Plagiat/répétition"
   ├─ "Erreur détectée"
   └─ Autres (default)

Processus:
   ├─ Vérifier role contributeur (pas admin!)
   ├─ Déterminer pénalité selon reason:
   │  ├─ "simple" → -2 points
   │  ├─ "données personn*" → -5 points
   │  ├─ "plagiat|répét*" → -10 points
   │  ├─ "erreur" → -3 points
   │  └─ default → -2 points
   │
   ├─ Appeler add_contributor_points()
   │  ├─ contributor_id
   │  ├─ points_change (négatif)
   │  ├─ contribution_type = 'penalty'
   │  └─ description = raison
   │
   ├─ UPDATE contributor_points
   │  └─ total_points = total_points + penalty
   │
   ├─ INSERT contributor_points_history
   │  ├─ points_change = penalty (négatif)
   │  ├─ contribution_type = 'penalty'
   │  └─ description avec détails
   │
   └─ RETURN new_total_points

RÈGLES IMPORTANTES:
   ├─ ❌ JAMAIS pénaliser un admin
   ├─ ✅ TOUJOURS laisser au minimum 0 points (ne pas aller négatif)
   ├─ ✅ TOUJOURS enregistrer l'historique
   ├─ ✅ TOUJOURS avoir une raison documentée
   └─ ✅ TOUJOURS notifier le contributeur (optionnel)

EXEMPLE:
   ├─ Contributor A: 50 points
   ├─ Soumet exercice avec données personnelles
   ├─ Modérateur: Rejette + raison "Données personnelles"
   ├─ apply_rejection_penalty() appelée
   │  ├─ Détecte "données personnelles"
   │  ├─ Applique -5 points
   │  └─ new_total = 50 - 5 = 45 points
   ├─ INSERT history (traçable)
   ├─ Dashboard contributeur:
   │  ├─ Points: 45 (était 50)
   │  ├─ Historique: -5 (Données personnelles)
   │  └─ Message modérateur visible
   └─ Contributeur peut rééditer et resoumetttre
```

---

## 8. Logique de Distribution des Revenus - Détail

```
┌──────────────────────────────────────────────────────────────────────────┐
│ DISTRIBUTION DES REVENUS - FORMULE ET LOGIQUE                            │
└──────────────────────────────────────────────────────────────────────────┘

FORMULE PRINCIPALE:
   Revenu Contributeur = (Points Contributeur / Points Totaux) × (CA × 20%)

EXEMPLE DÉTAILLÉ:
   ├─ Situation:
   │  ├─ CA généré ce mois: €1000
   │  ├─ Total points système: 800 (tous contributeurs + admin)
   │  │  ├─ Contributor A: 400 points (50%)
   │  │  ├─ Contributor B: 200 points (25%)
   │  │  └─ Contributor C: 200 points (25%)
   │  └─ Admin points: déjà inclus dans total
   │
   ├─ Calcul Pool:
   │  ├─ Total CA: €1000
   │  ├─ Pool contributeurs: 20% de €1000 = €200
   │  └─ Pool admin/plateforme: 80% de €1000 = €800
   │
   ├─ Distribution sur €200:
   │  ├─ Contributor A: (400/800) × €200 = 50% × €200 = €100
   │  ├─ Contributor B: (200/800) × €200 = 25% × €200 = €50
   │  └─ Contributor C: (200/800) × €200 = 25% × €200 = €50
   │
   └─ Total distribué: €100 + €50 + €50 = €200 ✅

DASHBOARD CONTRIBUTEUR AFFICHE:
   ├─ Licences vendues: 10 (plateforme)
   ├─ Revenus générés: €1000 (plateforme)
   ├─ Reversement acquis (20%): €200 (pour tous contributeurs)
   ├─
   ├─ MON REVENU PERSONNEL:
   │  ├─ Mes points: 400
   │  ├─ Points totaux: 800
   │  ├─ Ma part: 50%
   │  ├─ Formula: (400/800) × (€1000 × 20%) = €100
   │  └─ Je reçois: €100
   │
   └─ Palier: Palier 1 atteint (€1000 généré)

TIMING & PROCESSUS:
   ├─ Distribution automatique: mensuelle (ou configurée)
   ├─ Calcul: le dernier jour du mois à 23:59 UTC
   ├─ Paiement: 10 jours après calcul
   ├─
   ├─ Étapes:
   │  1. CALCULATE: Total points, CA, allocation
   │  2. INSERT revenue_distributions (new record)
   │  3. INSERT contributor_distributions (per contributor)
   │  4. UPDATE contributor_revenue_summary
   │  5. SEND email notifications
   │  6. UPDATE status = 'paid'
   │
   └─ Historique complet: traçable dans DB

TRANSPARENCY:
   ├─ Chaque contributeur voit:
   │  ├─ Sa part de points
   │  ├─ % du total
   │  ├─ Montant €€€
   │  ├─ Historique des distributions
   │  ├─ Paiements effectués
   │  └─ Prochain palier
   │
   ├─ Admin voit:
   │  ├─ Tous les calculs
   │  ├─ Audit trail complet
   │  ├─ Chaque distribution
   │  ├─ Chaque paiement
   │  └─ Peut vérifier/corriger si anomalie
   │
   └─ Zéro manipulation possible
       └─ Tout dans la DB, tracé, vérifiable

PALIERS/MILESTONES:
   ├─ Tous les €1000 gagnés (CA):
   │  ├─ Palier 1: €0-€1000
   │  ├─ Palier 2: €1000-€2000
   │  ├─ Palier 3: €2000-€3000
   │  └─ ...
   │
   ├─ Dashboard affiche:
   │  ├─ Palier atteint (ex: 3)
   │  ├─ Progress bar vers prochain
   │  ├─ Montant restant pour prochain
   │  └─ Exemple: "€250 restant pour palier 4"
   │
   └─ Utilisé pour gamification/motivation
```

---

**Version**: 2.0  
**Status**: Architecture Complète et Validée ✅  
**Dernière mise à jour**: Décembre 2025

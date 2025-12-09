# 👨‍💻 SARASSURE - Guide Développeur
**Guide Technique pour Reprendre et Développer le Projet**

---

## 🎯 Introduction

Bienvenue sur SARASSURE, une plateforme d'apprentissage numérique pour seniors. Ce guide vous aidera à :
- Comprendre l'architecture du projet
- Installer et configurer l'environnement de développement
- Naviguer dans le code
- Contribuer efficacement

**Niveau requis :** Intermédiaire à avancé  
**Stack :** React 18, Vite, Supabase, Tailwind CSS

---

## 📋 Table des Matières

1. [Installation & Configuration](#installation--configuration)
2. [Architecture du Projet](#architecture-du-projet)
3. [Base de Données](#base-de-données)
4. [Structure des Fichiers](#structure-des-fichiers)
5. [Concepts Clés](#concepts-clés)
6. [Workflows Principaux](#workflows-principaux)
7. [Bonnes Pratiques](#bonnes-pratiques)
8. [Debugging & Troubleshooting](#debugging--troubleshooting)
9. [Déploiement](#déploiement)
10. [Contribution](#contribution)

---

## 🚀 Installation & Configuration

### **Prérequis**
```bash
Node.js >= 18.x
npm >= 9.x
Git
Compte Supabase (gratuit)
```

### **1. Cloner le Repository**
```bash
git clone https://github.com/sarassure75-crypto/sarassure.git
cd sarassure.v21.11.25
```

### **2. Installer les Dépendances**
```bash
npm install
```

### **3. Configuration Environnement**

Créer `.env` à la racine :
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_test_... # Optionnel
```

**Obtenir les clés Supabase :**
1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans `Settings > API`
3. Copier `Project URL` et `anon public` key

### **4. Setup Base de Données**

Exécuter les migrations dans l'ordre :
```sql
-- Dans Supabase SQL Editor
1. schema.sql                               -- Schéma de base
2. create_questionnaire_questions_table.sql -- Tables questionnaires
3. migration_points_system.sql              -- Système de points
4. migrations_add_contributor_revenue.sql   -- Système de revenus
5. migrations_add_confidence.sql            -- Système de confiance
6. migrations_exercise_requests.sql         -- Demandes d'exercices
```

**Note :** Les fichiers SQL sont à la racine du projet.

### **5. Configurer le Storage**

Dans Supabase Dashboard :
1. Aller dans `Storage`
2. Créer un bucket nommé `images`
3. Le rendre **public**
4. Policies RLS : autoriser lecture publique

### **6. Lancer en Dev**
```bash
npm run dev
```

Application disponible sur `http://localhost:5173`

### **7. Build Production**
```bash
npm run build
```

Fichiers générés dans `dist/`

---

## 🏗️ Architecture du Projet

### **Stack Technique**

#### **Frontend**
- **React 18** : UI library
- **Vite** : Build tool (rapide, HMR)
- **React Router v6** : Routing SPA
- **Tailwind CSS** : Styling utility-first
- **Shadcn/ui** : Composants UI (Radix + Tailwind)
- **Lucide React** : Icons
- **Framer Motion** : Animations (optionnel)

#### **Backend**
- **Supabase** : BaaS (Backend as a Service)
  - PostgreSQL : Base de données
  - Auth : Authentification JWT
  - Storage : Stockage fichiers
  - Realtime : Subscriptions (non utilisé actuellement)

#### **Déploiement**
- **Hostinger** : Hébergement web (prévu)
- **PWA** : Service Worker + Manifest

### **Architecture Générale**

```
┌─────────────┐
│   Browser   │
│  (React SPA)│
└──────┬──────┘
       │
       ├─── Supabase Auth (JWT)
       │
       ├─── Supabase Database (PostgreSQL + RLS)
       │
       └─── Supabase Storage (Images bucket)
```

### **Patterns Utilisés**

1. **Context API** : State management global (Auth, Admin)
2. **Custom Hooks** : Logique réutilisable (useContributions, useImageLibrary)
3. **Lazy Loading** : Code splitting par route
4. **Protected Routes** : HOC pour vérifier authentification/rôles
5. **Row Level Security (RLS)** : Sécurité au niveau base de données

---

## 🗄️ Base de Données

### **Schéma Relationnel**

```
profiles
├─ id (FK auth.users)
├─ role (learner, trainer, contributor, admin)
└─ first_name, last_name, email

tasks (exercices)
├─ id
├─ title, description
├─ task_type (exercise, questionnaire)
├─ category_id (FK task_categories)
└─ owner_id (FK profiles)

versions
├─ id
├─ task_id (FK tasks)
├─ version_name (Android 13, 14, 15...)
└─ is_default

steps
├─ id
├─ version_id (FK versions)
├─ step_order
├─ title, description
└─ areas (JSON zones cliquables)

questionnaire_questions
├─ id
├─ task_id (FK tasks)
├─ question_text
├─ question_order
├─ image_id (FK app_images) -- NULLABLE
└─ question_type (image_choice, image_text, mixed)

questionnaire_choices
├─ id
├─ question_id (FK questionnaire_questions)
├─ text (NOT NULL, empty string si vide)
├─ image_id (FK app_images) -- NULLABLE
├─ is_correct
└─ choice_order

app_images
├─ id (UUID)
├─ name
├─ file_path (chemin dans Storage)
├─ category (QCM, fond d'écran, pictogramme)
└─ uploaded_by (FK profiles)

contributions
├─ id
├─ contributor_id (FK profiles)
├─ content_type (exercise, image, questionnaire)
├─ status (draft, pending, approved, rejected)
└─ admin_feedback

contributor_points
├─ contributor_id (FK profiles)
├─ total_points
├─ exercises_created
└─ images_uploaded

user_version_progress
├─ user_id (FK profiles)
├─ version_id (FK versions)
├─ completed_steps (JSON array)
└─ completed_at
```

### **RLS Policies**

Toutes les tables ont Row Level Security activé :

**Lecture :**
- Public : tâches publiées, images approuvées
- User : ses propres données
- Admin : tout

**Écriture :**
- User : ses propres données
- Admin : tout

**Exemple (table `contributions`) :**
```sql
-- Lecture : voir ses propres contributions
CREATE POLICY "Users can view own contributions"
ON contributions FOR SELECT
USING (auth.uid() = contributor_id);

-- Lecture admin : voir toutes les contributions
CREATE POLICY "Admins can view all contributions"
ON contributions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## 📁 Structure des Fichiers

```
sarassure.v21.11.25/
│
├── public/                    # Assets statiques
│   ├── manifest.json          # Manifest PWA (v1.0.6)
│   ├── sw.js                  # Service Worker (cache v6)
│   ├── logo_192.png           # Logo PWA 192×192
│   ├── logo_512.png           # Logo PWA 512×512
│   └── favicon.ico
│
├── src/
│   ├── main.jsx               # Point d'entrée React
│   ├── App.jsx                # Routes principales
│   │
│   ├── components/            # Composants réutilisables
│   │   ├── admin/             # Composants admin
│   │   │   ├── AdminQuestionnaireEditor.jsx
│   │   │   ├── AdminQuestionnaireValidation.jsx
│   │   │   └── AdminTabNavigation.jsx
│   │   ├── ui/                # Composants UI (shadcn)
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   └── ... (20+ composants)
│   │   ├── ProtectedRoute.jsx # HOC pour routes protégées
│   │   ├── Header.jsx
│   │   ├── AppBanner.jsx
│   │   └── ImageFromSupabase.jsx
│   │
│   ├── pages/                 # Pages de l'application
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── TaskListPage.jsx
│   │   ├── ExercisePage.jsx
│   │   ├── QuestionnairePlayerPage.jsx
│   │   ├── ContributorDashboard.jsx
│   │   ├── NewContribution.jsx
│   │   ├── QuestionnaireCreation.jsx
│   │   ├── AdminPage.jsx
│   │   ├── ModerationPage.jsx
│   │   └── Formateur/
│   │       ├── TrainerDashboardPage.jsx
│   │       └── BuyLicensesPage.jsx
│   │
│   ├── contexts/              # React Context
│   │   ├── AuthContext.jsx    # Gestion auth + user
│   │   └── AdminContext.jsx   # État global admin
│   │
│   ├── hooks/                 # Custom Hooks
│   │   ├── useContributions.js
│   │   ├── useImageLibrary.js
│   │   └── useContributorRevenue.js
│   │
│   ├── data/                  # API Supabase
│   │   ├── tasks.js           # CRUD exercices
│   │   ├── contributions.js   # CRUD contributions
│   │   ├── imagesMetadata.js  # Gestion images
│   │   ├── users.js           # CRUD utilisateurs
│   │   └── contributorRevenue.js
│   │
│   ├── lib/                   # Utilitaires
│   │   └── supabaseClient.js  # Client Supabase + getImageUrl()
│   │
│   └── styles/                # Styles globaux
│       └── index.css          # Tailwind + custom CSS
│
├── *.sql                      # Migrations SQL (racine)
├── *.md                       # Documentation
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env                       # Variables d'environnement (à créer)
```

---

## 🔑 Concepts Clés

### **1. Authentification & Rôles**

**AuthContext** (`src/contexts/AuthContext.jsx`) :
```jsx
const { currentUser, userRole, signIn, signUp, signOut } = useAuth();

// Rôles disponibles
USER_ROLES = {
  LEARNER: 'learner',
  TRAINER: 'trainer',
  CONTRIBUTOR: 'contributor',
  ADMIN: 'admin'
}
```

**ProtectedRoute** :
```jsx
<ProtectedRoute roles={[USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR]}>
  <ContributorDashboard />
</ProtectedRoute>
```

### **2. Gestion des Images**

**❌ MAUVAISE PRATIQUE :**
```jsx
// Ne JAMAIS faire
const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${filePath}`;
```

**✅ BONNE PRATIQUE :**
```jsx
import { getImageUrl } from '@/lib/supabaseClient';

// TOUJOURS utiliser getImageUrl()
const imageUrl = getImageUrl(filePath);
```

**Stockage :**
- Toutes les images dans bucket `images` (public)
- Table `app_images` stocke les métadonnées
- Référencer par `image_id` (UUID), jamais par `file_path` directement

**Upload :**
```jsx
// Exemple simplifié
const file = event.target.files[0];
const filePath = `qcm/${Date.now()}-${file.name}`;

const { data, error } = await supabase.storage
  .from('images')
  .upload(filePath, file);

// Puis insérer dans app_images
const { data: imageData } = await supabase
  .from('app_images')
  .insert({
    name: file.name,
    file_path: filePath,
    category: 'QCM',
    uploaded_by: userId
  })
  .select()
  .single();

// Utiliser imageData.id dans les FK
```

### **3. Questionnaires - 3 Types**

```jsx
// QuestionnaireCreation.jsx ligne 12-27

// TYPE 1: image_choice
// - Question: TEXTE uniquement
// - Réponses: IMAGES uniquement (pas de texte)
// - Validation: au moins 2 réponses avec imageId

// TYPE 2: image_text
// - Question: TEXTE uniquement
// - Réponses: TEXTE uniquement (pas d'images)
// - Validation: au moins 2 réponses avec texte

// TYPE 3: mixed
// - Question: IMAGE OBLIGATOIRE + texte
// - Réponses: IMAGE + TEXTE obligatoires (les deux)
// - Validation stricte: imageId AND text (logic AND pas OR)
```

**⚠️ IMPORTANT - Stale Closure :**
```jsx
// ❌ MAUVAIS : Stale closure bug
const handleUpdateChoice = (questionId, choiceId, value) => {
  setQuestions(questions.map(q => ...)); // 'questions' est old state
};

// ✅ BON : Utiliser callback
const handleUpdateChoice = (questionId, choiceId, value) => {
  setQuestions(prevQuestions => prevQuestions.map(q => ...)); // Always current
};
```

**Voir commits :** `2d05b9c`, `5f5987f`, `5504295`

### **4. Système de Contribution**

**Workflow :**
```
Contributeur crée exercice
    ↓
Status: draft (brouillon)
    ↓
Contributeur soumet → status: pending
    ↓
Admin review
    ↓
Admin approuve → status: approved → publié comme task
    OU
Admin rejette → status: rejected + feedback
```

**Points automatiques :**
- Exercice approuvé : +100 points
- Image approuvée : +10 points
- Exercice utilisé par user : +5 points
- Image utilisée : +1 point

### **5. PWA (Progressive Web App)**

**Service Worker** (`public/sw.js`) :
```js
const CACHE_NAME = 'sarassure-pwa-cache-v6'; // Incrémenter à chaque deploy

// Stratégies de cache :
// - Network-first: HTML, JS, CSS (toujours fresh)
// - Cache-first: Images, fonts (performance)
// - Supabase API: Network avec fallback cache (offline)
```

**Installation :**
1. Utilisateur visite le site
2. Service worker s'installe automatiquement
3. Navigateur propose "Ajouter à l'écran d'accueil"
4. App devient standalone

**Détection mode PWA :**
```jsx
const isPwaMode = window.matchMedia('(display-mode: standalone)').matches;
```

---

## 🔄 Workflows Principaux

### **Workflow 1 : Créer un Exercice (Contributeur)**

**Fichier :** `src/pages/NewContribution.jsx`

```
1. Utilisateur clique "Nouvelle contribution"
   ↓
2. Formulaire : titre, description, catégorie
   ↓
3. Ajouter version (ex: Android 14)
   ↓
4. Ajouter étapes avec zones cliquables
   ↓
5. Upload/sélection d'images (pictogrammes)
   ↓
6. Auto-save (draft) toutes les 30s
   ↓
7. "Soumettre à validation" → status: pending
   ↓
8. Admin reçoit notification (badge)
   ↓
9. Admin approuve → publié dans catalogue
```

**Fonctions clés :**
- `createContribution()` dans `src/data/contributions.js`
- `submitForReview()` change status à pending
- `approveContribution()` (admin) publie l'exercice

### **Workflow 2 : Créer un Questionnaire (Contributeur)**

**Fichier :** `src/pages/QuestionnaireCreation.jsx`

```
1. Choisir type de question (image_choice, image_text, mixed)
   ↓
2. Saisir question
   ↓
3. Si type mixed → sélectionner image pour question
   ↓
4. Ajouter réponses (2 minimum, 6 maximum)
   ↓
5. Pour chaque réponse :
   - Si type image_choice ou mixed : sélectionner image
   - Si type image_text ou mixed : saisir texte
   ↓
6. Marquer la réponse correcte
   ↓
7. Validation stricte avant soumission
   ↓
8. Sauvegarde dans tables :
   - tasks (type='questionnaire')
   - questionnaire_questions
   - questionnaire_choices
```

**Validation :**
```jsx
// QuestionnaireCreation.jsx ligne 223-296

if (questionType === 'image_choice') {
  // Au moins 2 réponses avec imageId
  const valid = choices.filter(c => c.imageId).length >= 2;
}

if (questionType === 'image_text') {
  // Au moins 2 réponses avec texte
  const valid = choices.filter(c => c.text.trim()).length >= 2;
}

if (questionType === 'mixed') {
  // Image sur question obligatoire
  // ET au moins 2 réponses avec imageId AND text
  const valid = question.imageId && 
    choices.filter(c => c.imageId && c.text.trim()).length >= 2;
}
```

### **Workflow 3 : Modération Admin**

**Fichier :** `src/pages/AdminExerciseValidation.jsx`

```
1. Admin accède à /admin/validation/exercices
   ↓
2. Liste des contributions pending
   ↓
3. Clic sur contribution → preview
   ↓
4. Admin peut :
   - Éditer titre/description
   - Modifier étapes
   - Changer images
   ↓
5. Actions :
   - Approuver → status: approved, publié comme task
   - Rejeter → status: rejected, envoyer feedback
   ↓
6. Contributor reçoit notification
   ↓
7. Si rejeté : contributor peut modifier et resoumettre
```

---

## ✅ Bonnes Pratiques

### **1. État React - Éviter Stale Closure**

**Toujours utiliser la forme callback pour setState sur objets/arrays :**

```jsx
// ❌ MAUVAIS
const handleUpdate = () => {
  setItems(items.map(item => ...)); // 'items' peut être stale
};

// ✅ BON
const handleUpdate = () => {
  setItems(prevItems => prevItems.map(item => ...)); // Toujours current
};
```

### **2. Supabase Queries**

**Utiliser select() avec colonnes spécifiques :**
```jsx
// ❌ MAUVAIS (over-fetching)
const { data } = await supabase.from('tasks').select('*');

// ✅ BON
const { data } = await supabase
  .from('tasks')
  .select('id, title, description, category_id');
```

**Utiliser JOINs pour relations :**
```jsx
// ✅ BON
const { data } = await supabase
  .from('questionnaire_questions')
  .select(`
    *,
    app_images:image_id (id, name, file_path),
    questionnaire_choices (
      *,
      app_images:image_id (id, name, file_path)
    )
  `)
  .eq('task_id', taskId);
```

### **3. Gestion d'Erreurs**

**Toujours gérer les erreurs Supabase :**
```jsx
const { data, error } = await supabase
  .from('tasks')
  .insert(newTask)
  .select()
  .single();

if (error) {
  console.error('Error creating task:', error);
  toast({
    title: "Erreur",
    description: error.message,
    variant: "destructive"
  });
  return null;
}

return data;
```

### **4. Sécurité**

**Jamais exposer de clés privées :**
```jsx
// ❌ JAMAIS faire
const supabase = createClient(url, SERVICE_ROLE_KEY); // DANGER !

// ✅ Toujours utiliser anon key côté client
const supabase = createClient(url, ANON_KEY);
```

**Compter sur RLS pour la sécurité :**
- Ne jamais faire confiance au client
- RLS policies valident toutes les opérations
- Tester les policies avec différents utilisateurs

### **5. Performance**

**Lazy Loading des routes :**
```jsx
// App.jsx ligne 20-65
const ExercisePage = lazy(() => import('@/pages/ExercisePage'));
```

**Optimiser les images :**
- Redimensionner avant upload (max 1920px)
- Format WebP quand possible
- Lazy loading avec `loading="lazy"`

**Mémoïsation :**
```jsx
import { useMemo } from 'react';

const filteredTasks = useMemo(() => {
  return tasks.filter(t => t.category === selectedCategory);
}, [tasks, selectedCategory]);
```

### **6. Accessibilité**

**ARIA labels :**
```jsx
<button aria-label="Supprimer la question">
  <Trash2 />
</button>
```

**Keyboard navigation :**
- Toutes les actions accessibles au clavier
- Focus visible
- Tab order logique

---

## 🐛 Debugging & Troubleshooting

### **Problèmes Courants**

#### **1. Images ne s'affichent pas**

**Symptôme :** 404 ou 422 sur URLs d'images

**Causes possibles :**
- Bucket 'images' non public
- RLS policies trop restrictives
- Utilisation de file_path au lieu de getImageUrl()
- Cache du service worker

**Solutions :**
```bash
# 1. Vérifier bucket public (Supabase Dashboard)
# Storage > images > Settings > Public bucket: ON

# 2. Vérifier RLS sur app_images
SELECT * FROM app_images; -- Doit être accessible

# 3. Utiliser getImageUrl() partout
import { getImageUrl } from '@/lib/supabaseClient';
const url = getImageUrl(filePath);

# 4. Clear cache service worker
# Chrome DevTools > Application > Service Workers > Unregister
# Puis refresh (Ctrl+Shift+R)
```

#### **2. Erreur "null value violates not-null constraint"**

**Symptôme :** Erreur SQL lors de la sauvegarde de questionnaire

**Cause :** Champ `text` de `questionnaire_choices` est NOT NULL

**Solution :**
```jsx
// QuestionnaireCreation.jsx ligne 417
const choicesForQuestion = filledChoices.map(choice => ({
  text: (choice.text && choice.text.trim()) || '', // Toujours string, jamais null
  // ...
}));
```

#### **3. State ne se met pas à jour**

**Symptôme :** Console logs montrent "Updated" mais UI ne change pas

**Cause :** Stale closure (voir section Bonnes Pratiques)

**Solution :**
```jsx
// Utiliser callback form
setQuestions(prevQuestions => prevQuestions.map(...));
```

#### **4. Service Worker ne se met pas à jour**

**Symptôme :** Changements de code non visibles après deploy

**Solution :**
```js
// 1. Incrémenter version dans sw.js
const CACHE_NAME = 'sarassure-pwa-cache-v7'; // v6 → v7

// 2. Hard refresh (Ctrl+Shift+R)
// 3. Ou désinstaller service worker dans DevTools
```

### **Outils de Debug**

**React DevTools :**
- Inspecter state/props des composants
- Profiler les performances

**Supabase Dashboard :**
- SQL Editor : tester queries
- Table Editor : vérifier données
- Storage : vérifier fichiers
- Auth : gérer utilisateurs

**Console Logs Strategiques :**
```jsx
console.log('=== DEBUG: Component mounted ===');
console.log('State:', questions);
console.log('Props:', { taskId, userId });
```

**Network Tab :**
- Vérifier requêtes Supabase (200 vs 404 vs 422)
- Vérifier headers (Authorization, Content-Type)
- Vérifier payloads

---

## 🚀 Déploiement

### **Checklist Pre-Deploy**

```bash
# 1. Tests locaux
npm run dev
# Tester toutes les fonctionnalités critiques

# 2. Build production
npm run build

# 3. Vérifier dist/
ls dist/
# Doit contenir : index.html, assets/, manifest.json, sw.js, logos

# 4. Test build local
npm run preview
# Tester sur http://localhost:4173

# 5. Incrémenter version
# - sw.js : CACHE_NAME v6 → v7
# - manifest.json : "version": "1.0.7"

# 6. Commit & Push
git add -A
git commit -m "feat: Deploy v1.0.7"
git push origin main
```

### **Déploiement Hostinger**

**1. Configuration FTP/SFTP :**
- Host: ftp.votredomaine.com
- User: votre-username
- Port: 21 (FTP) ou 22 (SFTP)

**2. Upload :**
```bash
# Uploader TOUT le contenu de dist/ vers public_html/
# Structure :
public_html/
├── index.html
├── manifest.json
├── sw.js
├── logo_192.png
├── logo_512.png
└── assets/
    ├── index-xxxxx.js
    ├── index-xxxxx.css
    └── ...
```

**3. Configuration Apache (.htaccess) :**

Créer `public_html/.htaccess` :
```apache
# SPA Routing - Redirect all to index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache headers
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

**4. Configuration Supabase :**

Dans Supabase Dashboard > Authentication > URL Configuration :
- Ajouter `https://votredomaine.com` dans Site URL
- Ajouter `https://votredomaine.com/**` dans Redirect URLs

**5. Variables d'environnement :**

Les variables sont compilées dans le build, pas besoin de les mettre sur le serveur.

**6. Test Post-Deploy :**
- Vérifier connexion/déconnexion
- Tester création exercice
- Tester création questionnaire
- Tester PWA install
- Vérifier service worker (DevTools > Application)

---

## 🤝 Contribution

### **Workflow Git**

```bash
# 1. Créer une branche feature
git checkout -b feature/nom-feature

# 2. Développer
# ... faire vos changements

# 3. Commit avec message descriptif
git add .
git commit -m "feat: Add new contributor dashboard widget"

# 4. Push
git push origin feature/nom-feature

# 5. Pull Request sur GitHub
# Décrire les changements, ajouter screenshots si UI
```

### **Convention de Commits**

```
feat: Nouvelle fonctionnalité
fix: Correction de bug
docs: Documentation
style: Formatting, linting
refactor: Refactoring sans changement fonctionnel
test: Ajout de tests
chore: Tâches diverses (build, config)

Exemples :
feat: Add dark mode support
fix: Resolve stale closure in QuestionnaireCreation
docs: Update installation guide
refactor: Extract ImagePicker to separate component
```

### **Code Review Checklist**

- [ ] Code formaté (Prettier/ESLint)
- [ ] Pas de console.log oubliés (sauf debug intentionnel)
- [ ] Variables d'environnement pas en dur
- [ ] Gestion d'erreurs présente
- [ ] État React avec callback form (pas de stale closure)
- [ ] Images avec getImageUrl()
- [ ] Composants réutilisables si logique dupliquée
- [ ] Accessibilité (aria-labels, keyboard nav)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Tests manuels effectués

---

## 📚 Ressources Complémentaires

### **Documentation Externe**

- **React :** [react.dev](https://react.dev)
- **Vite :** [vitejs.dev](https://vitejs.dev)
- **Supabase :** [supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS :** [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Shadcn/ui :** [ui.shadcn.com](https://ui.shadcn.com)
- **Lucide Icons :** [lucide.dev](https://lucide.dev)

### **Documentation Interne**

- `REFERENCE_ACTUELLE_SYSTEME.md` : État actuel complet du système
- `TERMINOLOGIE_PROJET.md` : Glossaire des termes
- `ARCHITECTURE_DETAILED_SCHEMA.md` : Architecture détaillée
- Fichiers `.sql` : Schémas de base de données

### **Exemples de Code**

**Créer un nouveau composant UI :**
```bash
# Utiliser shadcn CLI
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

**Créer un custom hook :**
```jsx
// src/hooks/useMyFeature.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useMyFeature(param) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('param', param);

      if (error) {
        setError(error);
      } else {
        setData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [param]);

  return { data, loading, error };
}
```

---

## 💡 Tips & Astuces

### **1. Hot Module Replacement (HMR)**

Vite recharge automatiquement lors des changements. Si ça ne fonctionne pas :
```bash
# Redémarrer le serveur dev
Ctrl+C
npm run dev
```

### **2. Debugging Supabase RLS**

```sql
-- Tester une policy en tant qu'utilisateur spécifique
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM tasks WHERE owner_id = 'user-uuid-here';
```

### **3. Performance Monitoring**

```jsx
// React DevTools Profiler
import { Profiler } from 'react';

<Profiler id="MyComponent" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}}>
  <MyComponent />
</Profiler>
```

### **4. Vite Aliases**

```js
// vite.config.js déjà configuré
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}

// Utilisation
import Button from '@/components/ui/button';
```

### **5. Environment Variables**

```jsx
// Accès aux variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Vérifier si en production
const isProd = import.meta.env.PROD;
```

---

## 🎯 Prochaines Fonctionnalités Suggérées

### **Facile (1-2 jours)**
- [ ] Mode sombre
- [ ] Export PDF d'un exercice
- [ ] Recherche globale (exercices + questionnaires)
- [ ] Tri et filtres avancés dans listes

### **Moyen (3-5 jours)**
- [ ] Système de badges pour apprenants
- [ ] Statistiques avancées pour formateurs
- [ ] Notifications push PWA
- [ ] Système de commentaires sur exercices

### **Difficile (1-2 semaines)**
- [ ] Application mobile native (React Native)
- [ ] IA pour personnalisation des parcours
- [ ] Intégration visio (pour support en direct)
- [ ] Marketplace contributeurs avec paiements

---

## 📧 Contact

**Questions Techniques :**
- GitHub Issues : [github.com/sarassure75-crypto/sarassure/issues](https://github.com/sarassure75-crypto/sarassure/issues)
- Email : dev@sarassure.net

**Contribution :**
- Pull Requests bienvenues !
- Lire ce guide avant de contribuer
- Respecter les conventions de code

---

**Bon développement ! 🚀**

*Dernière mise à jour : 9 décembre 2025*

# 🌟 SARASSURE - Plateforme d'Apprentissage Numérique pour Seniors

[![Version](https://img.shields.io/badge/version-1.0.6-blue.svg)](https://github.com/sarassure75-crypto/sarassure)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646cff.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **Réduire la fracture numérique en permettant aux seniors de maîtriser leur smartphone Android pas à pas.**

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Démo](#-démo)
- [Installation](#-installation)
- [Documentation](#-documentation)
- [Technologies](#-technologies)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 🎯 À Propos

**SARASSURE** est une plateforme web progressive (PWA) conçue pour aider les seniors à apprendre l'utilisation de leur smartphone Android de manière intuitive et progressive.

### 🎓 Pour qui ?

- **Seniors** : Exercices guidés avec captures d'écran annotées
- **Formateurs** : Outils de gestion de groupe et suivi de progression
- **Contributeurs** : Système collaboratif pour créer du contenu pédagogique

### 🌟 Pourquoi SARASSURE ?

- ✅ **Interface adaptée** : Design épuré et accessible
- ✅ **Apprentissage progressif** : Du simple au complexe
- ✅ **Mode hors-ligne** : Fonctionne sans connexion (PWA)
- ✅ **Contenu collaboratif** : Enrichi en continu par la communauté
- ✅ **Suivi personnalisé** : Progression sauvegardée automatiquement

---

## ✨ Fonctionnalités

### 🎓 Pour les Apprenants

- **Exercices guidés** avec étapes détaillées et zones cliquables interactives
- **Questionnaires QCM** pour valider les acquis
- **Progression sauvegardée** automatiquement
- **Niveau de confiance** auto-évalué
- **Mode hors-ligne** via PWA installable
- **Fonds d'écran** personnalisés gratuits

### 👨‍🏫 Pour les Formateurs

- **Système de licences** : achat et attribution aux apprenants
- **Suivi de progression** individuel et de groupe
- **Gestion des apprenants** (visibilité, activation)
- **Bibliothèque de contenu** complète
- **FAQ dédiée** avec tutoriels

### 🖊️ Pour les Contributeurs

- **Création d'exercices** avec workflow de validation
- **Création de questionnaires** (3 types : images, texte, mixte)
- **Upload d'images** avec redimensionnement automatique
- **Système de points** et rémunération basée sur l'usage
- **Dashboard personnel** avec statistiques

### 🛡️ Pour les Administrateurs

- **Modération du contenu** (exercices, images, questionnaires)
- **Gestion des catégories** et sous-catégories
- **Validation des contributions** avec feedback
- **Dashboard des revenus** contributeurs
- **Statistiques globales** de la plateforme

---

## 🎬 Démo

> **Note :** Démo en préparation. Screenshots à venir.

### Captures d'écran

**Interface Apprenant**
![Exercice guidé](docs/screenshots/exercise-preview.png)

**Interface Contributeur**
![Dashboard contributeur](docs/screenshots/contributor-dashboard.png)

**Interface Admin**
![Modération](docs/screenshots/admin-moderation.png)

---

## 🚀 Installation

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Compte Supabase** (gratuit sur [supabase.com](https://supabase.com))

### Installation Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/sarassure75-crypto/sarassure.git
cd sarassure.v21.11.25

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 4. Setup base de données
# Exécuter les migrations SQL dans Supabase (voir GUIDE_DEVELOPPEUR.md)

# 5. Lancer en développement
npm run dev

# 6. Build production
npm run build
```

### Configuration Supabase

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STRIPE_PUBLIC_KEY=pk_test_... # Optionnel
```

**📖 Guide complet :** Voir [GUIDE_DEVELOPPEUR.md](GUIDE_DEVELOPPEUR.md)

---

## 📚 Documentation

### Pour Développeurs

- **[GUIDE_DEVELOPPEUR.md](GUIDE_DEVELOPPEUR.md)** - Guide technique complet
  - Installation détaillée
  - Architecture du projet
  - Concepts clés (auth, images, questionnaires)
  - Bonnes pratiques
  - Debugging & déploiement

- **[REFERENCE_ACTUELLE_SYSTEME.md](REFERENCE_ACTUELLE_SYSTEME.md)** - État actuel du système
  - Fonctionnalités implémentées
  - Structure de la base de données
  - Routes de l'application
  - Correctifs récents

### Pour Investisseurs

- **[PRESENTATION_INVESTISSEURS.md](PRESENTATION_INVESTISSEURS.md)** - Présentation business
  - Vision & marché
  - Modèle économique
  - Projections financières
  - Demande de financement

### Migrations SQL

Les fichiers SQL sont à la racine du projet. Exécuter dans l'ordre :

1. `schema.sql` - Schéma de base
2. `create_questionnaire_questions_table.sql` - Tables questionnaires
3. `migration_points_system.sql` - Système de points
4. `migrations_add_contributor_revenue.sql` - Système de revenus
5. `migrations_add_confidence.sql` - Système de confiance
6. `migrations_exercise_requests.sql` - Demandes d'exercices

---

## 🛠️ Technologies

### Frontend

- **React 18** - UI library
- **Vite** - Build tool ultra-rapide
- **React Router v6** - Routing SPA
- **Tailwind CSS** - Styling utility-first
- **Shadcn/ui** - Composants UI modernes (Radix + Tailwind)
- **Lucide React** - Icons
- **Framer Motion** - Animations fluides

### Backend

- **Supabase** - Backend as a Service
  - PostgreSQL - Base de données
  - Auth - Authentification JWT
  - Storage - Stockage fichiers
  - Row Level Security (RLS)

### DevOps

- **PWA** - Progressive Web App
  - Service Worker (cache v6)
  - Manifest (v1.0.6)
  - Mode offline
- **Git** - Version control
- **Hostinger** - Hébergement (prévu)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment procéder :

### Workflow

```bash
# 1. Fork le projet

# 2. Créer une branche feature
git checkout -b feature/ma-nouvelle-fonctionnalite

# 3. Commiter les changements
git commit -m "feat: Ajouter nouvelle fonctionnalité X"

# 4. Push vers la branche
git push origin feature/ma-nouvelle-fonctionnalite

# 5. Ouvrir une Pull Request
```

### Convention de Commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatting, linting
- `refactor:` Refactoring
- `test:` Ajout de tests
- `chore:` Tâches diverses

### Code Review

Avant de soumettre une PR, vérifier :

- [ ] Code formaté (Prettier/ESLint)
- [ ] Pas de `console.log` oubliés
- [ ] Gestion d'erreurs présente
- [ ] État React avec callback form (éviter stale closure)
- [ ] Tests manuels effectués
- [ ] Documentation mise à jour si nécessaire

---

## 📊 Statut du Projet

### ✅ Fonctionnalités Complètes

- [x] Système d'authentification multi-rôles
- [x] Exercices avec versions multiples
- [x] Questionnaires (3 types : images, texte, mixte)
- [x] Système de contribution collaborative
- [x] Système de points et revenus
- [x] Système de licences formateurs
- [x] PWA installable avec mode offline
- [x] Interface admin complète
- [x] Modération du contenu

### 🚧 En Cours

- [ ] Tests utilisateurs beta
- [ ] Optimisations performance
- [ ] Enrichissement catalogue de base

### 🎯 Roadmap

**Q1 2025**
- [ ] Lancement commercial
- [ ] Campagne marketing ciblée
- [ ] 5 partenariats pilotes

**Q2 2025**
- [ ] Application mobile native
- [ ] Système de badges
- [ ] Notifications push

**Q3 2025**
- [ ] IA pour personnalisation des parcours
- [ ] Gamification avancée
- [ ] Export PDF des exercices

**Q4 2025**
- [ ] Internationalisation (ES, IT)
- [ ] Marketplace contributeurs
- [ ] API publique

---

## 🐛 Signaler un Bug

Vous avez trouvé un bug ? Merci de :

1. Vérifier qu'il n'a pas déjà été signalé dans les [Issues](https://github.com/sarassure75-crypto/sarassure/issues)
2. Ouvrir une nouvelle issue avec :
   - Description claire du problème
   - Steps to reproduce
   - Comportement attendu vs actuel
   - Screenshots si applicable
   - Environnement (OS, navigateur, version)

---

## 📧 Contact

- **Email :** contact@sarassure.net
- **GitHub Issues :** [github.com/sarassure75-crypto/sarassure/issues](https://github.com/sarassure75-crypto/sarassure/issues)
- **LinkedIn :** [linkedin.com/company/sarassure](https://linkedin.com/company/sarassure)

---

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

Merci à tous les contributeurs, beta-testeurs, et partenaires qui rendent ce projet possible !

### Technologies Open Source Utilisées

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide](https://lucide.dev/)

---

## 🌟 Soutenez le Projet

Si vous trouvez ce projet utile, n'hésitez pas à :

- ⭐ Mettre une étoile sur GitHub
- 🐦 Partager sur les réseaux sociaux
- 💬 Parler du projet autour de vous
- 🤝 Devenir contributeur

---

**Fait avec ❤️ pour réduire la fracture numérique**

*SARASSURE - Connecter les générations, un clic à la fois* 🌟

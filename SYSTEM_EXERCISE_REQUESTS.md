# Système de Gestion des Demandes d'Exercices

## Vue d'ensemble

Ce système permet de coordonner la création d'exercices entre les administrateurs et les contributeurs. Les admins créent des "demandes d'exercices" que les contributeurs peuvent consulter et réaliser.

## Fonctionnalités

### Pour les Administrateurs

**Page : `/admin/requests`**

- ✅ Créer des demandes d'exercices avec :
  - Titre et description
  - Catégorie
  - Priorité (Prioritaire / Normal / Optionnel)
  - Notes et consignes
- ✅ Modifier et supprimer des demandes
- ✅ Suivre l'état (À faire / En cours / Terminé / Annulé)
- ✅ Visualiser les statistiques (compteurs de versions validées/en attente)
- ✅ Rechercher et filtrer par statut/priorité
- ✅ Code unique auto-généré (ex: `EX-2025-001`)

### Pour les Contributeurs

**Page : `/contributeur/liste-demandes`**

- ✅ Consulter la liste des exercices à créer
- ✅ Voir les priorités et catégories
- ✅ Rechercher par titre, code, catégorie
- ✅ Noter le code de référence
- ✅ Affichage groupé par priorité

**Page : `/contributeur/nouvelle-contribution`**

- ✅ Checkbox "Cet exercice correspond à une demande de la liste"
- ✅ Champ pour entrer le code de référence (ex: `EX-2025-001`)
- ✅ Liaison automatique lors de la soumission
- ✅ Exercice lié visible dans la demande admin

## Architecture Technique

### Base de données

**Table : `exercise_requests`**

```sql
- id (UUID, primary key)
- code (VARCHAR, unique, auto-généré)
- title (VARCHAR)
- description (TEXT)
- category_id (INTEGER, FK vers categories)
- priority (VARCHAR: high/normal/low)
- status (VARCHAR: pending/in_progress/completed/cancelled)
- validated_versions_count (INTEGER)
- pending_versions_count (INTEGER)
- linked_task_ids (INTEGER[]) -- Array des exercices liés
- notes (TEXT)
- created_by (UUID, FK vers auth.users)
- created_at, updated_at, completed_at
```

**Fonctions SQL**

- `generate_exercise_request_code()` : Génère codes auto (EX-YYYY-NNN)
- `link_exercise_to_request(code, task_id)` : Lie exercice à demande
- `update_exercise_request_counters(code)` : MAJ compteurs versions

**Politiques RLS**

- Lecture : Tous les utilisateurs authentifiés
- Création : Admins et contributeurs
- Modification : Admins (tout), contributeurs (leurs propres demandes)
- Suppression : Admins uniquement

### Code JavaScript

**Fichiers créés**

- `migrations_exercise_requests.sql` : Migration complète
- `src/data/exerciseRequests.js` : Couche d'accès données (API)
- `src/components/admin/ExerciseRequestsManager.jsx` : Interface admin
- `src/pages/ExerciseRequestsList.jsx` : Interface contributeur
- `src/pages/NewContribution.jsx` : Intégration formulaire création

**Modifications**

- `src/pages/AdminPage.jsx` : Ajout route `/admin/requests`
- `src/components/admin/AdminTabNavigation.jsx` : Onglet "Demandes"
- `src/App.jsx` : Route `/contributeur/liste-demandes`
- `src/components/AppBanner.jsx` : Lien menu contributeur

## Workflow d'utilisation

### 1. Admin crée une demande

```
Admin → /admin/requests → "Nouvelle demande"
Titre: "Paramétrer le Wi-Fi"
Catégorie: Paramètres
Priorité: Prioritaire
Description: "Exercice complet avec captures d'écran Android"
→ Code généré automatiquement: EX-2025-001
```

### 2. Contributeur consulte la liste

```
Contributeur → /contributeur/liste-demandes
Voir la demande EX-2025-001 dans section "Prioritaire"
Noter le code: EX-2025-001
```

### 3. Contributeur crée l'exercice

```
Contributeur → /contributeur/nouvelle-contribution
☑ Cet exercice correspond à une demande de la liste
Code: EX-2025-001
Titre: "Paramétrer le Wi-Fi"
[Créer versions et étapes]
→ Soumettre pour validation
→ L'exercice est automatiquement lié à la demande
```

### 4. Admin vérifie le lien

```
Admin → /admin/requests
Demande EX-2025-001:
- Status: "En cours" (auto-passé)
- 1 exercice lié
- Compteurs mis à jour après validation
```

## Déploiement

### 1. Appliquer la migration SQL

Dans Supabase SQL Editor :

```sql
-- Coller tout le contenu de migrations_exercise_requests.sql
-- Exécuter
```

### 2. Vérifier les tables

```sql
-- Vérifier table créée
SELECT * FROM exercise_requests LIMIT 5;

-- Vérifier fonctions
SELECT proname FROM pg_proc WHERE proname LIKE '%exercise_request%';
```

### 3. Tester les permissions

```sql
-- En tant qu'admin
INSERT INTO exercise_requests (title, category_id, priority)
VALUES ('Test', 1, 'normal');

-- Vérifier code auto-généré
SELECT code, title FROM exercise_requests ORDER BY created_at DESC LIMIT 1;
```

### 4. Déployer le frontend

```bash
npm run build
# Uploader dist/ vers Hostinger
```

## Tests recommandés

### ✅ Tests Admin

1. Créer demande → Vérifier code auto-généré
2. Modifier demande → Vérifier updated_at
3. Supprimer demande → Confirmer suppression
4. Filtrer par priorité/statut → Résultats corrects
5. Rechercher par code/titre → Trouvé

### ✅ Tests Contributeur

1. Voir liste demandes → Toutes visibles
2. Rechercher demande → Trouvée
3. Créer exercice avec code → Lien établi
4. Créer exercice sans code → Pas de lien
5. Code invalide → Exercice créé quand même (pas bloquant)

### ✅ Tests Intégration

1. Admin crée demande → Contributeur la voit immédiatement
2. Contributeur crée exercice → Demande passe "en cours"
3. Admin valide version → Compteur "validé" incrémenté
4. Plusieurs exercices liés → Compteurs cumulés

## Améliorations futures possibles

- 🔄 Auto-complétion du code dans le formulaire contributeur
- 📊 Graphiques évolution demandes dans temps
- 🔔 Notifications quand demande prioritaire ajoutée
- 🏷️ Tags personnalisés sur demandes
- 💬 Système commentaires sur demandes
- 📋 Export CSV/PDF liste demandes
- 🔍 Recherche avancée multi-critères
- 📝 Templates de demandes récurrentes

## Support

Pour questions ou bugs :
- Vérifier logs SQL dans Supabase Dashboard
- Console navigateur pour erreurs frontend
- Vérifier permissions RLS si accès refusé

---

**Créé le :** 28 novembre 2025  
**Version :** 1.0.0

-- ============================================================================
-- TERMINOLOGIE OFFICIELLE DU PROJET SARASSURE
-- À utiliser dans le code, les variables et les données
-- ============================================================================

## RÔLES UTILISATEURS (roles) - EN FRANÇAIS dans Supabase, EN ANGLAIS dans le code

| Français (Supabase) | Anglais (Code) | Constante React | Description |
|---|---|---|---|
| apprenant | learner | USER_ROLES.LEARNER | Utilisateur qui suit les exercices |
| formateur | trainer | USER_ROLES.TRAINER | Crée et gère les exercices |
| administrateur | admin | USER_ROLES.ADMIN | Gère toute la plateforme |
| **contributor** | **contributor** | USER_ROLES.CONTRIBUTOR | Crée et partage du contenu |

## CHEMINS DE ROUTE (Routes React) - FRANÇAIS

### Routes Contributor
- `/contributeur` → Dashboard
- `/contributeur/nouvelle-contribution` → Créer un exercice
- `/contributeur/bibliotheque` → Bibliothèque d'images
- `/contributeur/mes-contributions` → Mes contributions
- `/contributeur/profil` → Profil

### Routes Trainer
- `/formateur` → Dashboard
- `/formateur/faq` → FAQ
- `/compte-formateur` → Compte

### Routes Learner
- `/mon-suivi` → Suivi de progression
- `/compte-apprenant` → Compte
- `/report-error` → Signaler une erreur

## BASE DE DONNÉES (Supabase)

### Colonnes profiles.role - EN FRANÇAIS
```
'apprenant'
'formateur'
'administrateur'
'contributor'  ⚠️ EXCEPTION: EN ANGLAIS comme dans la table contributors
```

### Tables pour Contributors
- `contributors` (table principale - pas profiles)
- `contribution_requests` (demandes de contribution)
- `images_metadata` (métadonnées des images)
- `contributor_stats` (statistiques)
- `contribution_points` (points gagnés)
- `reward_distributions` (récompenses)

### Storage Buckets
- `contributions-images` (1 MB) - Images des contributeurs
- `wallpapers` (1 MB) - Fonds d'écran
- `images` (5 MB) - Images générales (public)

## VARIABLES JAVASCRIPT

### Énumération des rôles (src/data/users.js)
```javascript
export const USER_ROLES = {
  LEARNER: 'apprenant',
  TRAINER: 'formateur',
  ADMIN: 'administrateur',
  CONTRIBUTOR: 'contributor'  // ⚠️ EXCEPTION
};
```

### Noms de variables
- `currentUser` (utilisateur connecté)
- `currentUserRole` (rôle de l'utilisateur)
- `contributorId` (ID du contributeur)
- `contributionId` (ID de la contribution)

## LABELS UI (Interface Utilisateur) - FRANÇAIS

### Menus
- "Dashboard" (générique)
- "Créer un exercice" (contributeur)
- "Bibliothèque d'images" (contributeur)
- "Mes contributions" (contributeur)
- "Mon Profil" (contributeur)

### Boutons
- "Enregistrer"
- "Annuler"
- "Supprimer"
- "Télécharger"

## RÉSUMÉ DES CONVERSIONS

❌ INCORRECT:
```
profiles.role = 'contributeur'
USER_ROLES.CONTRIBUTOR = 'contributeur'
path: /contributeur/...  (OK, ce chemin est bon)
```

✅ CORRECT:
```
profiles.role = 'contributor'
USER_ROLES.CONTRIBUTOR = 'contributor'
path: /contributeur/...  (OK, les URLs restent en français)
```

## À VÉRIFIER EN PRIORITÉ

1. **Supabase profiles table**
   - Colonne `role` avec valeur `'contributor'` (pas `'contributeur'`)

2. **Code React - USER_ROLES**
   - `USER_ROLES.CONTRIBUTOR = 'contributor'` (pas `'contributeur'`)

3. **Routes React**
   - `/contributeur/...` (français - OK)
   - `<ProtectedRoute roles={[USER_ROLES.CONTRIBUTOR]}>` (utiliser la constante)

4. **Bucket Storage**
   - `contributions-images` (français avec traits d'union)

5. **ProtectedRoute, Header, AuthRedirect**
   - Vérifier qu'ils comparent avec `USER_ROLES.CONTRIBUTOR`
   - Pas avec des strings hardcodées comme `'contributeur'` ou `'contributor'`

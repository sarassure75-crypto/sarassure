# Point de restauration - 23 novembre 2025

## État actuel de l'application

### Fonctionnalités implémentées
- ✅ Système d'exercices avec versions multiples
- ✅ Sélecteur de versions en accordion
- ✅ Notes personnelles des apprenants avec captures d'écran
- ✅ Boutons stylisés avec fond vert (primary)
- ✅ Service worker désactivé en développement
- ✅ Sous-catégories pour les exercices

### Fichiers modifiés récemment
- `src/pages/ExercisePage.jsx` - Ajout des notes + boutons stylisés
- `src/pages/ExerciseStepsPreviewPage.jsx` - Accordion pour versions
- `src/components/exercise/ExerciseToolbar.jsx` - Boutons stylisés
- `src/components/exercise/LearnerNotesViewer.jsx` - Visualisation des notes
- `src/main.jsx` - Service worker conditionnel
- `vite.config.js` - Plugins désactivés temporairement
- `migrations_add_learner_notes.sql` - Tables pour les notes

### Tables Supabase créées
- `learner_notes` - Notes texte des apprenants
- `learner_note_images` - Images associées aux notes

### Configuration
- Port dev: 3001
- Service worker: Désactivé en développement
- Plugins Vite: Désactivés temporairement

### Prochaines étapes
- Système de licences payantes par catégorie
- Gestion des comptes formateurs
- Réinitialisation de mot de passe formateur

---

**Pour restaurer cet état :**
1. Utiliser `git` si disponible
2. Copier les fichiers modifiés depuis ce point
3. Exécuter les migrations SQL listées ci-dessus

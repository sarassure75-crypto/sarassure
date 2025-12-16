# Guide d'Utilisation - Auto-traduction des QCM

## Vue d'ensemble

L'auto-traduction des QCM est maintenant complètement intégrée dans l'interface d'administration. Elle fonctionne exactement comme pour les exercices, en utilisant les services de traduction API (DeepL, Google Translate, etc.).

## 🎯 Fonctionnalités principales

### 1. **Bouton d'auto-traduction**
- Visible uniquement quand :
  - ✅ Un questionnaire est sélectionné
  - ✅ Une langue cible est sélectionnée (autre que FR)
  - ✅ Aucune traduction n'est en cours

### 2. **Dialog de confirmation**
Avant de lancer la traduction, un dialog affiche :
- ⚠️ Nombre de questions à traduire
- 📋 Actions qui vont être effectuées
  - Traduction automatique de toutes les questions
  - Traduction automatique de toutes les réponses
  - Remplacement des traductions existantes
  - Application des termes du glossaire

### 3. **Barre de progression en temps réel**
Pendant la traduction :
- 📊 Nombre de questions traduites (ex: 15/45)
- ⏱️ Message de statut
- 📈 Barre de progression animée

### 4. **Gestion des erreurs**
- Toast de notification en cas d'erreur
- Possibilité de réessayer
- Enregistrement des erreurs par élément

## 🚀 Processus d'auto-traduction

```
Utilisateur clique "Traduction Auto"
    ↓
Dialog de confirmation apparaît
    ↓
Utilisateur valide
    ↓
Récupération des questions et réponses
    ↓
Boucle sur chaque question :
    - Traduction de l'instruction (avec glossaire)
    - Sauvegarde en base de données
    - Callback de progression
    - Délai de 500ms (rate limiting)
    ↓
Boucle sur chaque réponse :
    - Traduction du texte et du feedback (avec glossaire)
    - Sauvegarde en base de données
    - Callback de progression
    - Délai de 500ms
    ↓
Notification de succès
↓
Rechargement automatique des traductions
```

## 📁 Fichiers modifiés

### 1. **`src/components/admin/AdminQuestionnaireTranslationManager.jsx`**

#### État ajouté :
```javascript
const [isAutoTranslating, setIsAutoTranslating] = useState(false);
const [autoTranslationProgress, setAutoTranslationProgress] = useState(null);
const [showAutoTranslateConfirm, setShowAutoTranslateConfirm] = useState(false);
```

#### Fonction handler :
```javascript
const handleAutoTranslate = async () => {
  // Validation
  // Boucle sur autoTranslateQuestionnaire()
  // Gestion des erreurs et notifications
  // Rechargement des traductions
}
```

#### UI ajoutée :
- 🔘 Bouton "✨ Traduction Auto"
- 📊 Barre de progression avec statut
- 🪟 Dialog de confirmation modal

### 2. **`src/data/translation.js`** (fonctions déjà existantes)

#### Trois nouvelles fonctions :

**`autoTranslateQuestionnaireQuestion()`**
- Entrée : `questionId`, `instruction`, `targetLanguage`
- Sortie : Texte traduit avec glossaire appliqué
- Inclut: Fusion avec traductions du glossaire

**`autoTranslateQuestionnaireChoice()`**
- Entrée : `choiceId`, `choiceText`, `targetLanguage`
- Sortie : Texte traduit + feedback traduit avec glossaire
- Inclut: Fusion avec traductions du glossaire

**`autoTranslateQuestionnaire()`**
- Entrée : `taskId`, `languageCode`, `onProgress` callback
- Sortie : `{ success, message, translatedCount, totalCount }`
- Fonctionnalités :
  - Récupère toutes les questions et réponses
  - Traduit chaque élément individuellement
  - Sauvegarde en base automatiquement
  - Appelle le callback pour la progression
  - Délai de 500ms entre les appels API (rate limiting)
  - Gestion d'erreurs par élément

## 🔧 Configuration des services de traduction

Les services de traduction utilisés (dans cet ordre de priorité) :

1. **DeepL** (Premium, plus précis)
   - Variable : `VITE_DEEPL_API_KEY`

2. **Google Translate** (Gratuit, polyvalent)
   - Variable : `VITE_GOOGLE_TRANSLATE_KEY`

3. **MyMemory** (Gratuit, limité)
   - Pas de clé requise
   - Limite: 500 appels/jour

4. **LibreTranslate** (Auto-hébergeable, CORS OK)
   - Serveur local ou publique
   - Parfait pour développement

## 📊 Exemple de flux complet

### Administrateur accède à "QCM → Traductions" :
```
1. Sélectionne questionnaire : "Leçon 1 : Les animaux"
2. Sélectionne langue : "English (EN)"
3. Clique bouton "✨ Traduction Auto"
4. Dialog confirme : "Êtes-vous sûr ? 8 questions seront traduites..."
5. Clique "Traduire automatiquement"
6. Progression apparaît : "0/24 questions..." (questions + réponses)
7. Pendant quelques secondes : Barre se remplit progressivement
8. Terminé : "Traduction automatique terminée" ✅
9. Les traductions s'affichent dans le tableau
```

## ⚠️ Points importants

### Performance
- **Délais** : 500ms entre chaque appel API pour éviter le rate limiting
- **Temps estimé** : ~5-10 secondes pour 10 questions (20 appels)
- **Fond** : Les traductions se font une par une avec progression visible

### Glossaire
- Les traductions automatiques sont **fusionnées** avec le glossaire
- Exemple :
  - API traduit "chat" → "cat"
  - Glossaire dit "chat" → "kitten"
  - Résultat final → "kitten" (glossaire prioritaire)

### Erreurs
- Erreurs par élément n'arrêtent pas le processus global
- Si API indisponible → Essaye le service suivant
- Toast d'erreur final si problème majeur

## 🎓 Intégration pédagogique

### Pour les apprenants :
```javascript
// Dans QuestionnairePlayerPage
const getQuestionText = (question) => {
  const translation = questionTranslations[question.id];
  return translation?.translated_instruction || question.instruction;
};
```

### Pour les formateurs :
- Peuvent choisir de pré-traduire les QCM automatiquement
- Puis affiner manuellement les traductions si besoin
- Ou traduire intégralement manuellement

### Glossaire d'apprentissage
- Chaque terme traduit automatiquement est vérifié contre le glossaire
- Assure que la terminologie de "smartphone" est respectée
- Permet aux apprenants de voir les mêmes termes partout

## 📝 Futures améliorations possibles

- [ ] Édition batch après auto-traduction
- [ ] Historique des traductions automatiques
- [ ] Comparaison avant/après traduction
- [ ] Validation manuelle avant sauvegarde
- [ ] Export/Import de traductions
- [ ] Support de plus de 2 niveaux de langue

## 🐛 Dépannage

### Le bouton "Traduction Auto" ne s'affiche pas
- Vérifiez qu'un questionnaire est sélectionné
- Vérifiez qu'une langue autre que "FR" est sélectionnée

### La traduction prend trop longtemps
- C'est normal, il y a 500ms entre chaque appel
- Pour 20 questions = ~20 secondes minimum

### Erreur "API quota exceeded"
- DeepL/Google Translate peut avoir un quota limité
- Attendez quelques minutes avant de réessayer
- Vérifiez votre clé API en variables d'environnement

### Les traductions ne s'affichent pas chez les apprenants
- Vérifiez que les traductions ont bien été sauvegardées en base
- Vérifiez que l'apprenant a choisi une langue autre que FR
- Vérifiez que QuestionnairePlayerPage charge les traductions

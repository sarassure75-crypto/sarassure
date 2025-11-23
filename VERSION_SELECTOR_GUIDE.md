# Nouvelle Interface de Sélection des Versions (Accordéon)

## Vue d'ensemble
La présentation des versions pour les apprenants a été améliorée avec un système **accordéon**. Au lieu d'afficher toutes les versions à la fois, seule la version courante est visible initialement. Les autres versions apparaissent quand on clique pour les sélectionner.

## Comportement

### Affichage par défaut
- **Un bouton principal** affiche la version actuellement sélectionnée
- Le bouton est cliquable pour développer/replier la liste des autres versions
- Une **flèche chevron** indique l'état (fermé ▶ ou ouvert ▼)

### Au clic sur le bouton
1. Les autres versions se déploient avec une animation fluide
2. Elles s'affichent dans une zone déroulante sous le bouton principal
3. Les étapes du bloc principal **descendent progressivement** grâce à l'animation
4. Cliquer sur une autre version la sélectionne et ferme automatiquement l'accordéon

### Avantages
✅ **Meilleure lisibilité** : les versions ne bloquent pas l'écran d'accueil  
✅ **Moins de surcharge visuelle** : une seule version visible au départ  
✅ **Navigation intuitive** : chevron indique l'état (fermé/ouvert)  
✅ **Animation fluide** : les étapes descendent naturellement quand la liste s'ouvre  

## Implémentation Technique

### Composant modifié
- `src/pages/ExercisePage.jsx` — Composant `ExerciseTabs`

### Changements
- Remplacement du système d'onglets Shadcn `<Tabs>` par un système **accordéon personnalisé**
- Utilisation de `useState` pour gérer l'état `isExpanded`
- Animation via `Framer Motion` (`AnimatePresence`, `motion.div`)
- Classe Tailwind pour les styles dynamiques

### Code clé
```jsx
const [isExpanded, setIsExpanded] = useState(false);

// Bouton principal
<button onClick={() => setIsExpanded(!isExpanded)} ... >
  {currentVersion?.name}
  <ChevronRight className={cn(..., isExpanded && "rotate-90")} />
</button>

// Versions replier  avec animation
<AnimatePresence>
  {isExpanded && versions.length > 1 && (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} ... >
      {/* Liste des autres versions */}
    </motion.div>
  )}
</AnimatePresence>
```

## Design Visuel

### Bouton principal (fermé)
```
┌────────────────────────────────────┐
│ Version 1 (Guidée)              ▶  │
└────────────────────────────────────┘
```

### Après clic (ouvert)
```
┌────────────────────────────────────┐
│ Version 1 (Guidée)              ▼  │
├────────────────────────────────────┤
│ ▢ Version 2 (Variante 1)           │
│ ▢ Version 3 (Variante 2)           │
│ ▢ Version 4 (Autonome)             │
└────────────────────────────────────┘

    [Les étapes descendent ici...]
```

## Responsive
- **Desktop** : Bouton et liste pleine largeur, font normal
- **Mobile** : Bouton et liste adaptés, texte réduit
- Les "short names" (G, V1, V2, etc.) s'affichent uniquement sur très petit écran

## États visuels

| État | Apparence |
|------|-----------|
| **Fermé** | Bouton vert clair, chevron → |
| **Ouvert** | Chevron ↓, liste déroulante visible |
| **Version active** | Surlignage bleu, barre gauche |
| **Version inactive** | Fond gris clair, texte noir |

## Interactions

### Événements
- **Clic sur le bouton principal** : bascule l'accordéon (ouvert/fermé)
- **Clic sur une version** : sélectionne et ferme l'accordéon
- **Clic ailleurs** : aucun fermeture automatique (volontaire)

### Animations
- Ouverture : `opacity: 0 → 1`, `height: 0 → auto`, durée 200ms
- Fermeture : même animation en inverse
- Chevron : rotation 0° → 90°, transitition smooth

## Cas limites
- ✅ Une seule version → bouton affiché, liste cachée
- ✅ Plusieurs versions → liste déroulante visible
- ✅ Version avec note⚠️ → icône AlertTriangle affichée

## Tests à effectuer
1. Cliquer sur le bouton pour développer/replier
2. Sélectionner une autre version (accordéon ferme automatiquement)
3. Vérifier que les étapes descendent fluidement
4. Tester sur mobile et desktop
5. Vérifier les notes de variante (icône ⚠️)

## Prochaines améliorations (optionnelles)
- [ ] Fermer l'accordéon en cliquant ailleurs
- [ ] Fermer l'accordéon avec la touche Échap
- [ ] Bouton "Replier" explicite
- [ ] Clavier shortcut (flèches haut/bas pour naviguer versions)

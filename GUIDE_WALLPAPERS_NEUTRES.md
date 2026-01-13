# 📱 Fonds d'écran Smartphone Neutres SARASSURE

## Vue d'ensemble

Neuf fonds d'écran de haute qualité (540x960px) ont été générés dans le thème de couleurs SARASSURE pour utilisation dans les exercices. Ces images offrent un arrière-plan neutre pour les zones d'action et facilitent la concentration des apprenants.

## 📁 Emplacement

```
public/wallpapers_neutral/
├── bg_white_neutral.png           # Blanc pur
├── bg_light_muted.png             # Gris-vert très clair
├── bg_muted.png                   # Gris-vert clair
├── bg_gradient_white_muted.png    # Dégradé blanc → gris clair
├── bg_gradient_light_accent.png   # Dégradé gris clair → kaki
├── bg_pattern_grid_subtle.png     # Motif grille subtile
├── bg_pattern_dots.png            # Motif points kaki
├── bg_circles_accent.png          # Cercles géométriques (kaki)
└── bg_circles_muted.png           # Cercles géométriques (gris-vert)
```

## 🎨 Description détaillée

### 1. **bg_white_neutral.png** - Blanc Neutre
- **Couleur** : #F5F8F7 (blanc du thème SARASSURE)
- **Usage** : Fond ultra minimaliste pour maximum de clarté
- **Contexte** : Exercices nécessitant peu de distraction
- **Public** : Idéal pour apprenants avec sensibilité visuelle

### 2. **bg_light_muted.png** - Gris-vert Très Clair
- **Couleur** : #E8EDE8 (très léger gris-vert)
- **Usage** : Légèrement moins blanc que le fond neutre
- **Contexte** : Exercices standards
- **Contraste** : Excellent pour icônes et texte foncés

### 3. **bg_muted.png** - Gris-vert Clair
- **Couleur** : #C8CEC2 (gris-vert du thème)
- **Usage** : Fond plus marqué mais toujours neutre
- **Contexte** : Exercices avec beaucoup d'éléments interactifs
- **Contraste** : Bonne séparation entre zones

### 4. **bg_gradient_white_muted.png** - Dégradé Blanc → Gris
- **Gradation** : De #F5F8F7 (haut) à #E8EDE8 (bas)
- **Usage** : Effet de profondeur subtil
- **Contexte** : Exercices visuellement enrichis
- **Effet** : Moins "plat" que fond uni

### 5. **bg_gradient_light_accent.png** - Dégradé Gris → Kaki
- **Gradation** : De #E8EDE8 (haut) à #A3B18A (bas)
- **Usage** : Dégradé avec plus de couleur (kaki du thème)
- **Contexte** : Exercices "nature" ou avec thème kaki
- **Effet** : Très élégant et thématique

### 6. **bg_pattern_grid_subtle.png** - Motif Grille Subtile
- **Base** : Blanc
- **Motif** : Grille légère de carrés (opacité 15%)
- **Usage** : Structure géométrique discrète
- **Contexte** : Exercices de calcul/grille, organisation visuelle
- **Effet** : Structure sans être distrayant

### 7. **bg_pattern_dots.png** - Motif Points Kaki
- **Base** : Blanc
- **Motif** : Points espacés en kaki (#A3B18A)
- **Usage** : Motif ornamental minimaliste
- **Contexte** : Exercices ludiques pour enfants/apprentis
- **Effet** : Visuellement plaisant sans surcharge

### 8. **bg_circles_accent.png** - Cercles Géométriques (Kaki)
- **Base** : Blanc
- **Formes** : Grands cercles décalés (kaki, floutés)
- **Usage** : Design moderne et épuré
- **Contexte** : Exercices contemporains
- **Effet** : Sophistiqué, avec flou pour douceur

### 9. **bg_circles_muted.png** - Cercles Géométriques (Gris-vert)
- **Base** : Gris-vert clair
- **Formes** : Grands cercles (gris-vert foncé)
- **Usage** : Variation du design cerclé avec plus de contraste
- **Contexte** : Exercices demandant meilleur contraste
- **Effet** : Géométrie discrète mais visible

## 🎯 Recommandations d'utilisation

### Par type d'exercice

| Type d'exercice | Fond recommandé | Raison |
|-----------------|-----------------|--------|
| **Reconnaître une application** | bg_white_neutral | Maximum de clarté |
| **Navigation dans zones** | bg_light_muted | Neutralité avec légère teinte |
| **Lecture de contenu** | bg_gradient_white_muted | Profondeur subtile |
| **Calcul/Grille** | bg_pattern_grid_subtle | Structure et organisation |
| **Enfants/Ludique** | bg_pattern_dots ou bg_circles_* | Amusant et engageant |
| **Moderne/Design** | bg_circles_accent ou bg_gradient_light_accent | Visuel contemporain |
| **Haute accessibilité** | bg_white_neutral | Contraste maximal |
| **Thème nature** | bg_gradient_light_accent | Couleurs naturelles |

### Par public

| Public | Fond recommandé |
|--------|-----------------|
| **Seniors** | bg_white_neutral ou bg_light_muted |
| **Enfants** | bg_pattern_dots ou bg_circles_* |
| **Déficient visuel** | bg_white_neutral (ultra claire) |
| **Apprenant normal** | bg_light_muted ou bg_gradient_white_muted |
| **Public général** | Mélanger pour variété |

## 🚀 Intégration dans SARASSURE

### Uploader les images

1. Aller sur `/contributor-dashboard` (tableau de bord contributeur)
2. Accéder à la **Bibliothèque d'images**
3. Créer une nouvelle catégorie : **"Wallpapers Neutres"** ou **"Fonds d'écran"**
4. Uploader les 9 fichiers PNG
5. Tagger comme : `wallpaper`, `background`, `neutral`, `smartphone`

### Utiliser dans un exercice

#### Dans IconSelector (version précédente)
```javascript
// Sélectionner l'image comme fond
<ImageFromSupabase 
  imageId="bg_white_neutral"  // ID après upload
  alt="Fond blanc neutre"
/>
```

#### Dans ZoomableImage (exercice)
```javascript
<ZoomableImage
  imageId="bg_white_neutral"
  actionType="tap"
  startArea={{
    x: 100, y: 200, width: 80, height: 80,
    icon: "logos:whatsapp-icon",
    text: "Taper ici"
  }}
/>
```

#### Dans StepAreaEditor (admin panel)
1. Éditer un exercice
2. Sélectionner une étape
3. Dans "Image du téléphone" → Choisir l'image wallpaper
4. Ajouter les zones d'action par-dessus

## 📊 Caractéristiques techniques

### Spécifications
- **Résolution** : 540x960 pixels
- **Ratio** : 9:16 (standard mobile)
- **Format** : PNG RGB
- **Taille fichier** : 5-40 KB (selon complexité)
- **Compression** : Optimisée pour web

### Palette de couleurs
Basée sur `tailwind.config.js` de SARASSURE :
- **Blanc** : #F5F8F7
- **Primaire** : #3A5A40 (vert foncé)
- **Secondaire** : #588157 (vert moyen)
- **Accent** : #A3B18A (kaki/vert clair)
- **Muted** : #C8CEC2 (gris-vert)

### Compatibilité
- ✅ Tous les navigateurs modernes
- ✅ PWA offline (inclus dans cache)
- ✅ Responsive sur tous les appareils
- ✅ Accessible aux lecteurs d'écran (images étiquetées)

## 💡 Bonnes pratiques

### Pour les administrateurs

1. **Cohérence visuelle** : Utiliser les mêmes fonds pour une même série d'exercices
2. **Contraste** : Pour apprenants avec basse vision, utiliser bg_white_neutral
3. **Variété** : Alterner motifs pour éviter monotonie (exercices longs)
4. **Thème** : Utiliser bg_gradient_light_accent pour exercices "nature"

### Pour les contributeurs

1. **Nommage** : Uploader avec noms clairs (bg_white_neutral.png)
2. **Catégorie** : Créer catégorie dédiée "Fonds d'écran neutres"
3. **Tags** : Ajouter tags comme `wallpaper`, `background`, `neutral`
4. **Descriptions** : Fournir description en français et anglais

### Pour les apprenants (indirectement)

1. **Clarté** : Fonds non distrayants permettent meilleure concentration
2. **Reconnaissance** : Couleurs familières du thème SARASSURE
3. **Accessibilité** : Options pour tous les types de vision

## 🔄 Mise à jour future

### Peut être amélioré avec :
- [ ] Dégradés plus complexes
- [ ] Motifs supplémentaires (vagues, zigzag, etc.)
- [ ] Versions "dark mode"
- [ ] Fonds avec photos (nature, ville, etc.)
- [ ] Variations saisonnières
- [ ] Fonds spécialisés pour troubles visuels

## 📝 Metadata pour upload

Quand vous uploader les images, utiliser ces informations :

```json
{
  "category": "Fonds d'écran neutres",
  "subcategory": "Backgrounds",
  "tags": ["wallpaper", "background", "neutral", "smartphone", "exercice"],
  "language": "fr",
  "license": "SARASSURE Internal Use"
}
```

## 🎓 Exemples d'utilisation

### Exercice 1 : "Reconnaître WhatsApp"
```
Fond : bg_white_neutral.png
Zone : Icône WhatsApp colorée (logos:whatsapp-icon)
Instruction : "Appuyez sur WhatsApp"
```

### Exercice 2 : "Navigation mobile"
```
Fond : bg_light_muted.png
Zones : 
  - Gmail (logos:gmail)
  - Chrome (logos:google-chrome)
  - Photos (logos:google-photos)
Instruction : "Trouvez l'application pour lire vos emails"
```

### Exercice 3 : "Questionnaire apps"
```
Fond : bg_gradient_light_accent.png (thème nature)
Motif : Motif dots subtils
Question : "Quelle app pour les messages?"
Réponses : WhatsApp, Messenger, Signal
```

## 🆘 Dépannage

### L'image ne s'affiche pas
- Vérifier que le fichier PNG est correctement uploadé
- Vérifier l'ID de l'image dans ZoomableImage
- Consulter la console navigateur (F12)

### L'image est distordue
- Utiliser une image avec ratio exact 9:16
- S'assurer que la résolution est au minimum 540x960

### Contraste insuffisant
- Utiliser bg_white_neutral pour meilleur contraste
- Ajouter border à la zone d'action

### Trop monotone
- Alterner entre différents fonds
- Utiliser motifs ou dégradés pour variation

## 📚 Fichiers associés

- **generate_wallpapers.py** : Script de génération (peut être réexécuté)
- **public/wallpapers_neutral/** : Dossier avec les 9 images
- **tailwind.config.js** : Définition des couleurs du thème

---

**Date de création** : 12 janvier 2026  
**Auteur** : GitHub Copilot  
**Version** : 1.0.0  
**Format** : 540x960px (9:16 mobile)  
**Total** : 9 fonds d'écran prêts à l'emploi

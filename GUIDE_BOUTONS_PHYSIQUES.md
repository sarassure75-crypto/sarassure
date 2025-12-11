# 📱 Guide : Configurer les Boutons Physiques (Volume, Power)

## 🆕 NOUVEAU : Configurations Multiples & Actions Combinées

### ✨ Nouveautés
- **6 modèles de téléphones** différents (Samsung, iPhone, Pixel, Xiaomi, OnePlus, Huawei)
- **Actions combinées** : appuyez sur 2 boutons simultanément (ex: Power + Volume-)
- **Positions personnalisées** selon chaque marque de téléphone
- **Entraînement réaliste** sur différentes configurations

---

## 🎯 Types de boutons et actions disponibles

### Actions simples (1 bouton)
1. **⏻ Bouton Power** (`button_power`)
2. **🔊 Bouton Volume+** (`button_volume_up`)
3. **🔉 Bouton Volume-** (`button_volume_down`)

### 🆕 Actions combinées (2 boutons simultanés)
4. **⏻+🔉 Power + Volume-** (`button_power_volume_down`)
   - Usage: Capture d'écran, redémarrage forcé
5. **⏻+🔊 Power + Volume+** (`button_power_volume_up`)
   - Usage: Mode recovery, maintenance
6. **🔊+🔉 Volume+ + Volume-** (`button_volume_up_down`)
   - Usage: Mode sécurisé, diagnostics

---

## 📱 Modèles de téléphones disponibles

### 1. Samsung / Android Standard (par défaut)
```
Côté gauche       Côté droit
    🔊 25%           
    🔉 40%          ⏻ 35%
```
- Configuration la plus courante
- Volume à gauche, Power à droite

### 2. iPhone Style
```
Côté gauche       Côté droit
    🔊 18%          ⏻ 20%
    🔉 28%          
```
- Power haut à droite (plus grand)
- Boutons volume séparés à gauche

### 3. Google Pixel
```
Côté gauche       Côté droit
                  ⏻ 22%
                  🔊 35%
                  🔉 47%
```
- **TOUS les boutons à droite**
- Configuration unique à Google

### 4. Xiaomi / Redmi
```
Côté gauche       Côté droit
                  🔊 22%
                  🔉 30%
                  ⏻ 38%
```
- Volume haut, Power bas
- Tous à droite

### 5. OnePlus
```
Côté gauche       Côté droit
    🔊 28%          ⏻ 40%
    🔉 42%          
```
- Configuration symétrique
- Switch alerte en haut (décoratif)

### 6. Huawei / Honor
```
Côté gauche       Côté droit
                  🔊 24%
                  🔉 33%
                  ⏻ 42%
```
- Disposition Huawei classique
- Power en bas

---

## 📋 Comment configurer une étape avec bouton physique

### Étape 1 : Créer/Éditer une étape
1. Allez dans **Admin** → **Gestion des Tâches**
2. Sélectionnez ou créez une version d'exercice
3. Ajoutez ou éditez une étape

### Étape 2 : 🆕 Choisir le modèle de téléphone
Dans le nouveau champ **"📱 Modèle de téléphone"** :
- Sélectionnez le modèle souhaité (Samsung, iPhone, Pixel, etc.)
- La disposition des boutons s'adaptera automatiquement
- **Conseil** : Variez les modèles pour entraîner sur différentes configurations

### Étape 3 : Sélectionner le type d'action
Dans le champ **"Type d'action"**, choisissez :

**Actions simples** :
- `⏻ Bouton Power`
- `🔊 Bouton Volume+`
- `🔉 Bouton Volume-`

**🆕 Actions combinées** :
- `⏻+🔉 Power + Volume-` (capture d'écran)
- `⏻+🔊 Power + Volume+` (mode recovery)
- `🔊+🔉 Volume+ + Volume-` (mode sécurisé)

### Étape 4 : Upload de la capture d'écran
1. Uploadez une capture d'écran montrant l'état de l'écran
2. Cette image sera affichée dans le cadre du téléphone avec la bonne configuration

### Étape 5 : Pas besoin de zone d'action ! ✅
**Important** : Pour les boutons physiques :
- ❌ **Vous n'avez PAS besoin** de définir de zone d'action (target_area)
- ✅ Les boutons sont **automatiquement positionnés** selon le modèle choisi
- ✅ Le système détecte automatiquement que c'est un bouton physique

### Étape 6 : Rédiger l'instruction
Écrivez une instruction claire, par exemple :

**Actions simples** :
- "Appuyez sur le bouton Volume+ pour augmenter le son"
- "Maintenez le bouton Power pendant 3 secondes"

**Actions combinées** :
- "Appuyez simultanément sur Power + Volume- pour prendre une capture d'écran"
- "Maintenez Power + Volume+ pendant 10 secondes pour entrer en mode recovery"

---

## 🎨 Configuration de la zone d'action (optionnel)

Même si **ce n'est pas nécessaire** pour les boutons physiques, vous pouvez quand même configurer une zone visuelle sur l'écran si vous voulez :

### Couleur
- Choisissez une couleur pour la zone overlay (par défaut : bleu)
- La couleur apparaîtra avec la transparence définie

### Transparence
- Ajustez de 0% (invisible) à 100% (opaque)
- Recommandé : **50%** pour une bonne visibilité

### Forme
- **Rectangle** : Zone carrée/rectangulaire
- **Ellipse** : Zone circulaire/ovale

⚠️ **Note** : Ces réglages n'affectent que la zone overlay sur l'écran, pas les boutons physiques qui restent fixes.

---

## 🎬 Résultat pendant l'exercice

Quand l'apprenant fait l'exercice :

1. **Le nom du modèle s'affiche en haut**
   - "📱 Samsung / Android Standard"
   - "📱 Google Pixel"
   - etc.

2. **Le cadre du téléphone s'affiche automatiquement**
   - Un beau cadre noir avec bordure arrondie
   - Encoche (notch) en haut
   
3. **Les boutons physiques apparaissent aux bonnes positions**
   - Positions adaptées au modèle choisi
   - Couleurs : Rouge (Power), Bleu (Volume+), Cyan (Volume-)
   - Au survol, les boutons s'agrandissent avec un effet lumineux

4. **🆕 Pour les actions combinées** :
   - Un bandeau jaune indique "Appuyez sur 2 boutons simultanément"
   - Les boutons requis clignotent avec un contour jaune
   - L'apprenant doit cliquer sur les 2 boutons
   - Quand les 2 sont pressés, ils deviennent verts
   - L'étape est validée automatiquement

5. **Validation et passage à l'étape suivante**
   - Le bouton réagit visuellement (scale 0.9)
   - L'étape est validée
   - Passage automatique à l'étape suivante

---

## 💡 Exemples d'utilisation

### Exemple 1 : 🆕 Capture d'écran (action combinée)
```
Modèle: Samsung / Android Standard

Étape 1: "Appuyez simultanément sur Power + Volume- pour prendre une capture"
Type: button_power_volume_down
Image: Écran d'accueil

Étape 2: "L'écran clignote - capture réussie!"
Type: bravo
Image: Notification de capture
```

### Exemple 2 : Entraînement multi-modèles
```
Version 1 - Samsung:
Étape 1: "Sur Samsung, Power est à droite. Appuyez dessus"
Type: button_power
Modèle: samsung

Version 2 - Pixel:
Étape 1: "Sur Pixel, Power est à droite en haut. Appuyez dessus"
Type: button_power
Modèle: pixel

Version 3 - iPhone:
Étape 1: "Sur iPhone, Power est à droite très haut. Appuyez dessus"
Type: button_power
Modèle: iphone
```

### Exemple 3 : Mode Recovery (action combinée)
```
Modèle: Xiaomi / Redmi

Étape 1: "Éteignez le téléphone"
Type: button_power
Image: Menu d'alimentation → Éteindre

Étape 2: "Maintenez Power + Volume+ pendant 10 secondes"
Type: button_power_volume_up
Image: Logo Xiaomi

Étape 3: "Vous êtes en mode recovery!"
Type: bravo
Image: Menu recovery
```

### Exemple 4 : Régler le volume
```
Modèle: OnePlus

Étape 1: "Appuyez sur Volume+ pour augmenter le son"
Type: button_volume_up
Image: Écran avec curseur de volume

Étape 2: "Appuyez encore une fois sur Volume+"
Type: button_volume_up
Image: Volume à 80%
```

---

## 🔧 Détails techniques

### Structure de données (base de données)

Pour ajouter le support des configurations dans votre base de données, ajoutez ce champ à la table `steps` :

```sql
ALTER TABLE steps 
ADD COLUMN button_config VARCHAR(50) DEFAULT 'samsung';
```

### Validation automatique
Le système vérifie automatiquement :
- ✅ Instruction présente
- ✅ Image uploadée
- ✅ Type d'action valide
- ✅ Modèle de téléphone valide
- ✅ **PAS de zone d'action requise** pour les boutons physiques
- ✅ Pour les actions combinées : boutons requis cohérents

### Code de référence

**Types d'actions** (`src/data/tasks.js`) :
```javascript
// Actions simples
{ id: 'button_power', label: '⏻ Bouton Power' }
{ id: 'button_volume_up', label: '🔊 Bouton Volume+' }
{ id: 'button_volume_down', label: '🔉 Bouton Volume-' }

// Actions combinées
{ id: 'button_power_volume_down', label: '⏻+🔉 Power + Volume-', combo: true }
{ id: 'button_power_volume_up', label: '⏻+🔊 Power + Volume+', combo: true }
{ id: 'button_volume_up_down', label: '🔊+🔉 Volume+ + Volume-', combo: true }
```

**Configurations** (`src/data/phoneButtonConfigs.js`) :
```javascript
export const phoneButtonConfigs = {
  samsung: { /* ... */ },
  iphone: { /* ... */ },
  pixel: { /* ... */ },
  xiaomi: { /* ... */ },
  oneplus: { /* ... */ },
  huawei: { /* ... */ }
};
```

**Utilitaires** (`src/lib/buttonUtils.js`) :
```javascript
isPhysicalButtonAction(actionType)
isComboButtonAction(actionType)
getRequiredButtons(actionType)
getComboInstructionText(actionType)
```

### Composants

1. **PhoneFrame** (`src/components/exercise/PhoneFrame.jsx`)
   - Affiche le cadre du téléphone
   - Props : `buttonConfig`, `showPhoneFrame`, `onButtonClick`

2. **PhoneButtonsOverlay** (`src/components/exercise/PhoneButtonsOverlay.jsx`)
   - Gère les overlays animés
   - Props : `buttonConfig`, `isComboAction`, `requiredButtons`

3. **ButtonConfigSelector** (`src/components/admin/ButtonConfigSelector.jsx`)
   - Sélecteur pour l'admin
   - Props : `value`, `onChange`, `disabled`

---

## 🚨 Problèmes courants

### Le cadre du téléphone ne s'affiche pas
**Solution** : Le cadre s'affiche automatiquement dès qu'une étape utilise un bouton physique. Vérifiez que le type d'action est bien `button_*`.

### Les boutons ne sont pas aux bonnes positions
**Vérifications** :
1. Le bon modèle de téléphone est sélectionné
2. Le champ `button_config` est bien enregistré en base
3. Pas d'erreur dans la console navigateur

### Les boutons ne sont pas cliquables
**Vérification** :
1. Le type d'action est correct
2. L'image est bien chargée
3. Pas d'erreur dans la console navigateur
4. Pour actions combinées : les 2 boutons doivent être cliqués

### L'action combinée ne se valide pas
**Vérifications** :
1. Les 2 boutons requis sont bien cliqués
2. Le `isComboAction` est true
3. Le `requiredButtons` contient les bons IDs
4. Voir dans la console : les clics sont bien détectés

### Je veux créer ma propre configuration
**Solution** : Éditez `src/data/phoneButtonConfigs.js` et ajoutez :
```javascript
mycustom: {
  id: 'mycustom',
  name: 'Mon Téléphone Custom',
  description: 'Ma configuration personnalisée',
  buttons: {
    power: {
      id: 'power',
      icon: '⏻',
      position: { side: 'right', top: '30%' },
      color: '#ef4444',
      height: '45px',
      description: 'Bouton power'
    },
    // ... autres boutons
  }
}
```

---

## 📱 Interface visuelle dans l'admin

Voici comment configurer dans l'admin :

```
┌─────────────────────────────────────┐
│ 📱 Modèle de téléphone             │
│ ▼ [Samsung / Android Standard]     │  ← 🆕 NOUVEAU : Sélectionnez le modèle
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Type d'action                       │
│ ▼ [🔉 Bouton Volume-]              │  ← Sélectionnez l'action
│                                     │
│ Ou pour action combinée :           │
│ ▼ [⏻+🔉 Power + Volume-]          │  ← 🆕 Action combinée
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Configuration de la zone d'action   │
│                                     │
│ Couleur: [●] [○]                   │
│ Transparence: ━━━━●━━━ 50%         │
│ Forme: [▭ Rectangle ▼]            │
└─────────────────────────────────────┘
                ↑
        (Optionnel pour overlay)

┌─────────────────────────────────────┐
│ Aperçu avec le modèle sélectionné   │
│                                     │
│   📱 Samsung / Android Standard     │  ← Nom du modèle
│   ┌──────────────────┐             │
│ 🔊│                  │⏻            │  ← Boutons aux bonnes positions
│ 🔉│   Votre écran    │              │
│   └──────────────────┘             │
└─────────────────────────────────────┘
```

---

## ✅ Checklist avant validation

### Pour actions simples
- [ ] Modèle de téléphone sélectionné
- [ ] Type d'action = `button_power`, `button_volume_up`, ou `button_volume_down`
- [ ] Capture d'écran uploadée
- [ ] Instruction claire et précise
- [ ] Testé en mode preview

### 🆕 Pour actions combinées
- [ ] Modèle de téléphone sélectionné
- [ ] Type d'action = `button_power_volume_down`, `button_power_volume_up`, ou `button_volume_up_down`
- [ ] Capture d'écran uploadée (montrant le résultat de l'action combinée)
- [ ] Instruction indiquant "simultanément" ou "en même temps"
- [ ] Testé : vérifier que les 2 boutons doivent être pressés
- [ ] Testé en mode preview

### 🆕 Pour entraînement multi-modèles
- [ ] Plusieurs versions créées avec différents modèles
- [ ] Instructions adaptées à chaque modèle
- [ ] Tests sur tous les modèles
- [ ] Instructions précisent le modèle ("Sur Samsung...", "Sur iPhone...")

---

## 🆘 Support

Pour toute question sur la configuration des boutons physiques, consultez :
- **Configurations** : `src/data/phoneButtonConfigs.js`
- **Composant cadre** : `src/components/exercise/PhoneFrame.jsx`
- **Overlays animés** : `src/components/exercise/PhoneButtonsOverlay.jsx`
- **Sélecteur admin** : `src/components/admin/ButtonConfigSelector.jsx`
- **Utilitaires** : `src/lib/buttonUtils.js`
- **Validation** : `src/lib/validation.js`
- **Logique exercice** : `src/pages/ExercisePage.jsx`

### 🆕 Fichiers ajoutés pour cette fonctionnalité
- `src/data/phoneButtonConfigs.js` - Toutes les configurations de téléphones
- `src/lib/buttonUtils.js` - Fonctions utilitaires pour boutons
- `src/components/admin/ButtonConfigSelector.jsx` - Sélecteur de modèle

---

**Dernière mise à jour** : 11 décembre 2025 - Version 2.0 avec configurations multiples et actions combinées

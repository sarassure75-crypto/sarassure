# 🚀 Quick Start : Boutons Physiques Multi-Configurations

## ✨ Ce qui a été ajouté

### 1. **6 Modèles de téléphones**
- Samsung / Android Standard (défaut)
- iPhone Style
- Google Pixel
- Xiaomi / Redmi
- OnePlus
- Huawei / Honor

### 2. **Actions combinées (2 boutons simultanés)**
- Power + Volume- (capture d'écran)
- Power + Volume+ (mode recovery)
- Volume+ + Volume- (mode sécurisé)

### 3. **Nouveaux composants**
- `ButtonConfigSelector` : sélecteur de modèle dans l'admin
- Configurations dans `phoneButtonConfigs.js`
- Utilitaires dans `buttonUtils.js`

---

## 📝 Usage rapide

### Dans l'admin (création d'étape)

```jsx
import ButtonConfigSelector from '@/components/admin/ButtonConfigSelector';

// Dans votre formulaire
<ButtonConfigSelector 
  value={step.button_config || 'samsung'} 
  onChange={(config) => setStep({...step, button_config: config})}
/>
```

### Dans l'exercice (affichage)

```jsx
import PhoneFrame from '@/components/exercise/PhoneFrame';
import { isPhysicalButtonAction, isComboButtonAction, getRequiredButtons } from '@/lib/buttonUtils';

const isButtonAction = isPhysicalButtonAction(step.action_type);
const isCombo = isComboButtonAction(step.action_type);
const required = getRequiredButtons(step.action_type);

<PhoneFrame
  showPhoneFrame={isButtonAction}
  buttonConfig={step.button_config || 'samsung'}
  onButtonClick={handleButtonClick}
>
  <img src={step.image_url} />
</PhoneFrame>
```

---

## 🗄️ Base de données

Ajoutez ce champ à votre table `steps` :

```sql
ALTER TABLE steps 
ADD COLUMN button_config VARCHAR(50) DEFAULT 'samsung';
```

Valeurs possibles : `'samsung'`, `'iphone'`, `'pixel'`, `'xiaomi'`, `'oneplus'`, `'huawei'`

---

## 🎯 Types d'actions (ajoutés dans tasks.js)

```javascript
{ id: 'button_power_volume_down', label: '⏻+🔉 Power + Volume-', combo: true }
{ id: 'button_power_volume_up', label: '⏻+🔊 Power + Volume+', combo: true }
{ id: 'button_volume_up_down', label: '🔊+🔉 Volume+ + Volume-', combo: true }
```

---

## 📦 Fichiers créés

1. **`src/data/phoneButtonConfigs.js`** ⭐
   - Définitions des 6 modèles de téléphones
   - Positions, couleurs, hauteurs des boutons
   - Fonctions `getButtonConfig()` et `getButtonConfigsList()`

2. **`src/lib/buttonUtils.js`** ⭐
   - `isPhysicalButtonAction()` : détecte les actions de boutons
   - `isComboButtonAction()` : détecte les actions combinées
   - `getRequiredButtons()` : retourne les boutons requis pour une combo
   - `getComboInstructionText()` : texte d'aide pour combo

3. **`src/components/admin/ButtonConfigSelector.jsx`** ⭐
   - Composant de sélection de modèle pour l'admin
   - Dropdown avec descriptions

---

## 📖 Documentation complète

Voir **GUIDE_BOUTONS_PHYSIQUES.md** pour :
- Détails sur chaque modèle de téléphone
- Exemples d'utilisation
- Configuration pas à pas
- Troubleshooting
- Schémas visuels

---

## ✅ Tests à faire

1. **Créer une étape simple** avec chaque modèle
2. **Créer une action combinée** (Power + Volume-)
3. **Vérifier les positions** des boutons pour chaque modèle
4. **Tester le clic** sur les boutons
5. **Tester l'action combinée** : les 2 boutons doivent être pressés

---

## 🎨 Exemple complet

```jsx
// Dans AdminStepForm.jsx ou équivalent
import ButtonConfigSelector from '@/components/admin/ButtonConfigSelector';
import { actionTypes } from '@/data/tasks';

function AdminStepForm({ step, onChange }) {
  return (
    <div>
      {/* Sélecteur de modèle */}
      <ButtonConfigSelector
        value={step.button_config || 'samsung'}
        onChange={(config) => onChange({ ...step, button_config: config })}
      />

      {/* Sélecteur d'action */}
      <Select
        value={step.action_type}
        onValueChange={(action) => onChange({ ...step, action_type: action })}
      >
        {actionTypes.map(type => (
          <SelectItem key={type.id} value={type.id}>
            {type.label}
          </SelectItem>
        ))}
      </Select>

      {/* ... reste du formulaire */}
    </div>
  );
}
```

---

**Version** : 2.0 - Configurations multiples et actions combinées  
**Date** : 11 décembre 2025

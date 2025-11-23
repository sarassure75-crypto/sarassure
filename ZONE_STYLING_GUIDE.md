# Guide de Personnalisation des Zones d'Action

## Comment ça fonctionne?

Les couleurs et styles des zones d'action sont **directement contrôlés depuis le panel admin** lors de la création/édition d'une étape.

## Configuration dans l'admin

### 1. **Couleur de la zone**
- Ouvre le panel admin
- Va à "Configuration de la zone d'action"
- Clique sur le sélecteur de couleur
- Choisit ta couleur (ou clique sur la palette)

**Résultat:**
- Zone avec fond semi-transparent dans ta couleur
- Bordure pointillée de la même couleur

### 2. **Transparence**
- Dans le même panel, utilise le slider "Transparence: 50%"
- Glisse pour ajuster de 0% (invisible) à 100% (opaque)

**Résultat:**
- Zone plus ou moins transparente
- Plus le pourcentage est bas, plus c'est transparent

### 3. **Forme**
- Choisis "Rectangle" ou "Ellipse"
- La zone s'adapte automatiquement

## Exemple visuel

```
Admin Panel:
├─ Couleur: Vert (#00ff00)
├─ Transparence: 80%
└─ Forme: Rectangle

Résultat sur l'app:
└─ Zone verte avec 80% de transparence
   └─ Bordure pointillée verte
```

## Comportement sur l'écran

Quand un apprenant voit la zone:
1. **Zone avec couleur et opacité** définie dans l'admin
2. **Animation de clignotement** avec la même couleur
3. **Bordure pointillée** grise légère (pour les zones sans couleur)

## Pas besoin de code!

Tu n'as plus besoin de modifier de code JSON. Le système prend **automatiquement** la couleur et l'opacité que tu définis dans l'admin.

### Avant (JSON):
```json
{
  "background_color": "#00ff00",
  "background_opacity": 0.8,
  "border_color": "#808080"
}
```

### Maintenant (Admin Panel):
```
✓ Couleur: [Sélecteur vert]
✓ Transparence: [Slider à 80%]
✓ Forme: [Rectangle]
```

## Les modifications s'appliquent immédiatement

1. Change la couleur dans l'admin ✓
2. Enregistre ✓
3. Vide le cache de ton téléphone ✓
4. Recharge la page ✓
5. La zone a la nouvelle couleur! ✓


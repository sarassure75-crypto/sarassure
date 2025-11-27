# 📱 Fonds d'écran SARASSURE

## Collection de wallpapers pour captures d'écran

Cette collection contient des fonds d'écran optimisés pour smartphone (1080x1920px) à utiliser dans les captures d'écran des exercices.

### ✅ Fonds d'écran disponibles

1. **blue-gradient.svg** - Dégradé bleu océan (Catégorie: Couleurs)
2. **forest-green.svg** - Dégradé vert forêt (Catégorie: Couleurs)
3. **sunset-sky.svg** - Dégradé coucher de soleil (Catégorie: Ciel)
4. **soft-gray.svg** - Gris doux neutre (Catégorie: Couleurs neutres)
5. **lavender.svg** - Dégradé lavande (Catégorie: Couleurs)
6. **geometric-shapes.svg** - Formes géométriques abstraites (Catégorie: Abstrait)
7. **ocean-waves.svg** - Vagues océan stylisées (Catégorie: Paysages)
8. **mountain-sunrise.svg** - Lever de soleil montagne (Catégorie: Paysages)
9. **starry-night.svg** - Ciel étoilé (Catégorie: Ciel)

### 📐 Caractéristiques

- **Format** : SVG vectoriel (convertible en PNG)
- **Résolution** : 1080x1920px (9:16 portrait)
- **Taille** : Ultra-léger (< 10 Ko)
- **Licence** : Domaine public / CC0
- **Usage** : Captures d'écran exercices uniquement

### 🎨 Catégories

#### Couleurs unies & dégradés
- `blue-gradient.svg` - Bleu professionnel
- `forest-green.svg` - Vert nature
- `lavender.svg` - Violet doux
- `soft-gray.svg` - Gris neutre

#### Paysages stylisés
- `ocean-waves.svg` - Mer et vagues
- `mountain-sunrise.svg` - Montagne au lever du soleil

#### Ciel & Météo
- `sunset-sky.svg` - Coucher de soleil
- `starry-night.svg` - Nuit étoilée

#### Abstraits
- `geometric-shapes.svg` - Formes géométriques

### 🔧 Conversion en PNG

Pour convertir en PNG (si nécessaire) :

```bash
# Avec Inkscape (ligne de commande)
inkscape blue-gradient.svg --export-filename=blue-gradient.png --export-width=1080 --export-height=1920

# Avec ImageMagick
convert -density 300 blue-gradient.svg -resize 1080x1920 blue-gradient.png

# Avec Node.js (sharp)
npm install sharp
node -e "require('sharp')('blue-gradient.svg').resize(1080, 1920).png().toFile('blue-gradient.png')"
```

### 📱 Comment utiliser

1. **Choisir un wallpaper** adapté au contexte de l'exercice
2. **Définir comme fond d'écran** sur votre smartphone de test
3. **Faire la capture** d'écran avec l'application Android
4. **Uploader** sur SARASSURE pour validation

### ⚠️ Règles d'usage

✅ **À FAIRE**
- Utiliser uniquement ces wallpapers fournis
- Choisir un fond neutre et professionnel
- Vérifier que le texte reste lisible sur le fond

❌ **À NE PAS FAIRE**
- Utiliser des photos personnelles
- Utiliser des images avec des personnes
- Utiliser des logos ou marques protégées
- Utiliser des images trouvées sur Internet sans vérification

### 🎯 Recommandations par type d'exercice

**Applications système** → `soft-gray.svg` ou `blue-gradient.svg`  
**Applications sociales** → `lavender.svg` ou `sunset-sky.svg`  
**Applications photo** → `mountain-sunrise.svg` ou `ocean-waves.svg`  
**Applications productivité** → `blue-gradient.svg` ou `soft-gray.svg`  
**Applications jeux** → `starry-night.svg` ou `geometric-shapes.svg`

### 🔄 Mises à jour

Cette collection sera enrichie régulièrement. Consultez `WALLPAPERS_LIST.md` pour la liste complète des 50+ wallpapers recommandés.

### 📄 Licence

Tous les wallpapers de ce dossier sont sous licence **CC0** (Domaine Public). Vous pouvez les utiliser librement dans vos contributions SARASSURE.

---

**Version** : 1.0  
**Dernière mise à jour** : 27 novembre 2025  
**Contributeurs SARASSURE** - Bibliothèque de ressources libres

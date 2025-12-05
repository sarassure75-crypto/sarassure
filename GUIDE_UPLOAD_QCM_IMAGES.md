# 📸 Guide Upload Images QCM

## Problème
Les images QCM ne s'affichent pas car les fichiers ne sont pas uploadés dans Supabase Storage.

## Solution

### Étape 1: Préparer les images
- Préparer vos images PNG/JPG pour les QCM
- Taille recommandée: 1080x1920px (format téléphone)
- Taille fichier: < 500KB pour performances

### Étape 2: Uploader vers Supabase Storage

**Via Supabase Dashboard:**

1. Aller à: https://app.supabase.com → Votre Projet
2. Menu "Storage" → Bucket "images"
3. Créer un dossier "qcm" (optionnel mais recommandé)
4. Upload vos fichiers: `qcm/mon-image.png`

**Via Supabase CLI (si disponible):**
```bash
supabase storage upload images qcm/screenshot-1.png --file ~/my-screenshot.png
```

### Étape 3: Créer les entrées en base

Après upload, exécuter en Supabase SQL:

```sql
INSERT INTO app_images (name, category, file_path, description) 
VALUES 
  ('Mon Questionnaire - Étape 1', 'QCM', 'qcm/screenshot-1.png', 'Première capture écran'),
  ('Mon Questionnaire - Étape 2', 'QCM', 'qcm/screenshot-2.png', 'Deuxième capture écran');
```

## Vérifier que ça marche

1. Aller en admin → Nouveau QCM
2. L'image doit apparaître dans la liste "Image de la question"
3. Sélectionner et cliquer "Créer"
4. Vérifier que l'image s'affiche

## Format du file_path

```
'qcm/nom-de-limage.png'    ← Chemin relatif dans le bucket 'images'
```

### Exemples valides:
- `qcm/phone-menu.png`
- `qcm/settings-screen.jpg`
- `qcm/example-1.png`

### Exemples invalides ❌:
- `phone-menu.png` (pas le dossier qcm)
- `/qcm/image.png` (slash au début)
- `qcm/image.png.bak` (format non supporté)

## Résolution de problèmes

**Image s'affiche en admin mais pas chez apprenant:**
- Vérifier que le file_path est correct dans app_images
- Vérifier que le fichier existe réellement dans Supabase Storage

**"Image non disponible" chez apprenant:**
- Le fichier n'existe pas dans Supabase Storage
- Vérifier le chemin (case-sensitive!)
- Re-uploader le fichier

**404 dans console:**
- Le bucket est "images" (pas "app-images")
- Assurer que le fichier est public (PUBLIC ACL)

## Structure recommandée

```
Supabase Storage (bucket 'images')
└── qcm/
    ├── questionnaire-1-q1.png     (Question 1)
    ├── questionnaire-1-q2.png     (Question 2)
    ├── questionnaire-1-choice-a.png (Choix A)
    ├── questionnaire-1-choice-b.png (Choix B)
    └── ...
```

## Automatisation future

Un jour, on pourra créer une interface admin pour uploader directement depuis le dashboard:

```javascript
// Future feature
const uploadQCMImage = async (file) => {
  const path = `qcm/${Date.now()}-${file.name}`;
  
  // 1. Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file);
  
  // 2. Créer l'entrée app_images
  await supabase.from('app_images').insert({
    name: file.name,
    category: 'QCM',
    file_path: path,
    description: ''
  });
};
```

## Checklist

- [ ] Images préparées (PNG/JPG)
- [ ] Images uploadées dans `images/qcm/`
- [ ] Entrées créées dans `app_images` (category='QCM')
- [ ] Admin → Nouveau QCM → Images visibles
- [ ] Apprenant → QCM → Images s'affichent
- [ ] Les réponses avec images fonctionnent

---

**Note:** Cette solution est temporaire. Une UI d'upload est recommandée à long terme.

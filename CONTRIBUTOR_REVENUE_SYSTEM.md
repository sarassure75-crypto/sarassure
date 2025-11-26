# 💰 Système de Revenus des Contributeurs

## Vue d'ensemble

Le système de revenus permet de suivre les ventes des contributions (exercices et images) et de calculer les gains des contributeurs avec une commission de 20%.

## 📊 Fonctionnalités implémentées

### 1. **Tables de base de données** (migrations_add_contributor_revenue.sql)

#### `contributor_exercise_sales`
Enregistre chaque vente d'exercice:
- `exercise_id`: Référence à l'exercice (tasks)
- `version_id`: Version spécifique vendue (optionnel)
- `contributor_id`: Propriétaire de l'exercice
- `buyer_id`: Acheteur (formateur)
- `price_cents`: Prix en centimes (défaut: 1000 = €10)
- `purchase_date`: Date de l'achat

#### `contributor_image_sales`
Enregistre chaque vente d'image:
- `image_id`: Référence à l'image (images_metadata)
- `contributor_id`: Propriétaire de l'image
- `buyer_id`: Acheteur
- `price_cents`: Prix en centimes (défaut: 500 = €5)
- `purchase_date`: Date de l'achat

#### `contributor_revenue_summary` (Vue)
Vue agrégée qui calcule automatiquement:
- Nombre de ventes par type (exercices/images)
- Revenus par type en centimes
- Revenus totaux
- Nombre de paliers de €1000 atteints

### 2. **Fonctions de gestion** (src/data/contributorRevenue.js)

#### Récupération de données
- `getContributorRevenue(contributorId)`: Statistiques de revenus d'un contributeur
- `getContributorExerciseSales(contributorId, limit)`: Liste des ventes d'exercices
- `getContributorImageSales(contributorId, limit)`: Liste des ventes d'images
- `getTopContributorsByRevenue(limit)`: Top contributeurs par revenus (Admin)
- `getPlatformRevenueStats()`: Statistiques globales de la plateforme

#### Enregistrement de ventes
- `recordExerciseSale({exerciseId, versionId, contributorId, buyerId, priceCents})`
- `recordImageSale({imageId, contributorId, buyerId, priceCents})`

#### Utilitaires
- `calculateMilestoneProgress(totalRevenueCents)`: Calcul de progression vers paliers
- `formatRevenue(cents)`: Formatage en devise (€10.50)

### 3. **Hook React** (src/hooks/useContributorRevenue.js)

```javascript
const { revenue, loading, error, refresh } = useContributorRevenue(userId);
```

Retourne:
```javascript
{
  exercise_sales_count: 5,
  exercise_revenue_cents: 5000,
  image_sales_count: 10,
  image_revenue_cents: 5000,
  total_revenue_cents: 10000,
  total_sales_count: 15,
  milestone_count: 10  // Nombre de paliers de €1000 atteints
}
```

### 4. **Affichage Dashboard** (src/pages/ContributorDashboard.jsx)

Le tableau de bord affiche 5 cartes principales:

#### a) Licences vendues
- Nombre total de licences vendues
- Détail: exercices vs images

#### b) Revenus générés
- Montant total en euros
- Détail par type (exercices/images)

#### c) Palier atteint
- Numéro du palier actuel (paliers de €1000)
- Valeur totale des paliers atteints

#### d) Reversement acquis (20%)
- **Montant que le contributeur va recevoir**
- Calcul: `revenus_totaux × 0.20`
- Note explicative sur le partage 20/80

#### e) Progression vers prochain palier
- Barre de progression visuelle
- Montant actuel dans le palier
- Montant restant pour atteindre le prochain palier
- Pourcentage de progression

### 5. **Page Historique des Ventes** (src/components/ContributorSalesHistory.jsx)

Accessible via `/contributeur/ventes`

#### Cartes de résumé
- **Ventes totales**: Nombre total avec détail exercices/images
- **Revenus générés**: Montant brut total
- **Vos gains (20%)**: Montant net pour le contributeur

#### Filtres
- Tout afficher
- Exercices seulement
- Images seulement

#### Tableau détaillé des ventes
Colonnes:
- Type (Exercice/Image avec icône)
- Contenu (titre)
- Acheteur (nom du formateur)
- Date d'achat
- Prix de vente
- **Votre part (20%)**

#### Fonctionnalités
- Tri par date (plus récent d'abord)
- Export CSV (bouton prévu, à implémenter)
- Responsive design

## 🎯 Système de paliers

### Concept
- Palier = €1000 de revenus générés
- Les paliers sont automatiquement calculés
- Déblocage de récompenses/badges (système à étendre)

### Calcul
```javascript
milestone_count = Math.floor(total_revenue_cents / 100000)
// Exemple: 15 500€ → 15 paliers
```

### Progression affichée
- Palier actuel: `milestone_count × €1000`
- Prochain palier: `(milestone_count + 1) × €1000`
- Progression: `(total_revenue_cents % 100000) / 100000 × 100%`

## 💶 Commission et reversement

### Règle actuelle
- **20% pour le contributeur**
- **80% pour la plateforme**

### Affichage
```javascript
const contributorEarnings = totalRevenueCents * 0.20;
```

### Exemple
- Ventes totales: €1000
- Reversement contributeur: €200
- Commission plateforme: €800

## 📈 Exemples de données

### Vente d'exercice
```javascript
await recordExerciseSale({
  exerciseId: 'uuid-exercise',
  versionId: 'uuid-version',  // optionnel
  contributorId: 'uuid-contributor',
  buyerId: 'uuid-trainer',
  priceCents: 1000  // €10
});
```

### Vente d'image
```javascript
await recordImageSale({
  imageId: 'uuid-image',
  contributorId: 'uuid-contributor',
  buyerId: 'uuid-trainer',
  priceCents: 500  // €5
});
```

## 🔧 Intégration avec Stripe

### À implémenter
Lorsqu'un formateur achète une licence qui inclut du contenu de contributeur:

```javascript
// Dans le webhook Stripe après paiement réussi
async function onStripePaymentSuccess(paymentIntent) {
  const { exerciseIds, imageIds, trainerId } = paymentIntent.metadata;
  
  // Pour chaque exercice acheté
  for (const exerciseId of exerciseIds) {
    const exercise = await getExercise(exerciseId);
    await recordExerciseSale({
      exerciseId,
      contributorId: exercise.owner_id,
      buyerId: trainerId,
      priceCents: 1000
    });
  }
  
  // Pour chaque image achetée
  for (const imageId of imageIds) {
    const image = await getImage(imageId);
    await recordImageSale({
      imageId,
      contributorId: image.uploaded_by,
      buyerId: trainerId,
      priceCents: 500
    });
  }
}
```

## 🎨 Interface utilisateur

### Accès rapide depuis Dashboard
Bouton "Historique des ventes" (vert émeraude) dans les 4 actions rapides

### Navigation
- `/contributeur` → Dashboard principal avec résumé
- `/contributeur/ventes` → Historique détaillé complet

### Responsive
- Mobile: Affichage en colonnes verticales
- Desktop: Grilles et tableaux optimisés

## 📊 Statistiques Admin (à implémenter)

Fonctions disponibles mais interface à créer:

```javascript
// Top contributeurs
const topContributors = await getTopContributorsByRevenue(10);

// Stats plateforme
const platformStats = await getPlatformRevenueStats();
// Retourne: {
//   exercise_revenue_cents,
//   exercise_count,
//   image_revenue_cents,
//   image_count,
//   total_revenue_cents,
//   total_sales
// }
```

## ✅ Checklist d'implémentation

### ✅ Complété
- [x] Tables de base de données
- [x] Vue agrégée `contributor_revenue_summary`
- [x] Fonctions CRUD pour ventes
- [x] Hook React `useContributorRevenue`
- [x] Affichage dashboard avec toutes les métriques
- [x] Page historique des ventes détaillée
- [x] Calcul commission 70%
- [x] Système de paliers de €1000
- [x] Barre de progression vers paliers
- [x] Filtres par type (exercices/images)
- [x] Route et navigation
- [x] Design responsive

### ⏳ À faire (extensions futures)
- [ ] Intégration webhook Stripe pour enregistrer automatiquement les ventes
- [ ] Export CSV de l'historique des ventes
- [ ] Système de badges/récompenses par palier
- [ ] Page admin pour gérer les commissions
- [ ] Notifications email lors d'une vente
- [ ] Graphiques de revenus (charts.js ou recharts)
- [ ] Historique des paiements effectués au contributeur
- [ ] Système de retrait des gains (PayPal, virement)

## 🔐 Sécurité et permissions

### RLS Policies à ajouter
```sql
-- Contributeur peut voir uniquement ses ventes
CREATE POLICY "contributor_see_own_sales"
ON contributor_exercise_sales
FOR SELECT
USING (contributor_id = auth.uid());

-- Admin peut tout voir
CREATE POLICY "admin_see_all_sales"
ON contributor_exercise_sales
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'administrateur'
  )
);
```

## 📝 Notes importantes

1. **Centimes**: Tous les montants sont stockés en centimes pour éviter les problèmes de virgule flottante
2. **Commission**: Le taux de 20% est en dur dans le code - prévoir une table de configuration si besoin de flexibilité
3. **Paliers**: Actuellement €1000, modifiable via la constante `milestoneCents = 100000`
4. **Prix par défaut**: Exercice = €10, Image = €5 (modifiables lors de l'enregistrement)

## 🎓 Exemple d'utilisation complète

```javascript
// 1. Un contributeur crée un exercice
const exercise = await createExercise({...});

// 2. Un formateur achète une licence incluant cet exercice
const purchase = await processPurchase({...});

// 3. Enregistrer la vente
await recordExerciseSale({
  exerciseId: exercise.id,
  contributorId: exercise.owner_id,
  buyerId: trainerId,
  priceCents: 1000
});

// 4. Le contributeur voit ses stats mises à jour automatiquement
// via la vue contributor_revenue_summary
```

---

**Status**: ✅ Système complet et fonctionnel  
**Version**: 1.0  
**Date**: 26 novembre 2025

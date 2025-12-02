# 🎯 Système de Points - Documentation Technique

## Vue d'ensemble

Le système de points implémente un modèle d'économie solidaire où :
- Les contributeurs accumulent des **points** selon leurs contributions
- À chaque palier de 1000€ de CA plateforme, **20% du CA sont distribués**
- Chaque contributeur reçoit une part proportionnelle à ses points
- **Aucune vente individuelle** : c'est un modèle de dividendes collectifs

## Structure de base de données

### Tables principales

#### `contributor_points`
Suivi total des points par contributeur.

```sql
id UUID PRIMARY KEY
contributor_id UUID UNIQUE -- Lien au profil contributeur
total_points DECIMAL(10,1) -- Total cumulé des points
last_updated TIMESTAMP
created_at TIMESTAMP
```

#### `contributor_points_history`
Historique détaillé de chaque transaction de points.

```sql
id UUID PRIMARY KEY
contributor_id UUID
points_change DECIMAL(10,1) -- Positif (gain) ou négatif (pénalité)
contribution_type VARCHAR(20) -- 'image', 'exercise', 'penalty'
contribution_id UUID -- Référence à la contribution (optionnel)
description TEXT
created_at TIMESTAMP
```

#### `revenue_distributions`
Enregistrement de chaque distribution de revenus.

```sql
id UUID PRIMARY KEY
distribution_date TIMESTAMP
total_platform_revenue_cents INTEGER -- CA plateforme total
distribution_pool_cents INTEGER -- 20% du CA à distribuer
total_contributor_points DECIMAL(10,1) -- Somme des points à ce moment
status VARCHAR(20) -- 'pending', 'distributed', 'paid'
created_at TIMESTAMP
```

#### `contributor_distributions`
Parts individuelles pour chaque distribution.

```sql
id UUID PRIMARY KEY
distribution_id UUID -- Lien à la distribution
contributor_id UUID
contributor_points DECIMAL(10,1) -- Points du contributeur au moment
amount_cents INTEGER -- Montant calculé pour ce contributeur
status VARCHAR(20) -- 'pending', 'paid'
payment_date TIMESTAMP
created_at TIMESTAMP
```

## Attribution des Points

### Points de base

#### Images/Captures d'écran
- **1 point** : Nouvelle capture d'écran

#### Exercices
- **5 points** : Exercice de base (1 version, <5 tâches)
- **+2 points** : Complexité (≥5 tâches)
- **+3 points** : Par version supplémentaire (différence substantielle)

### Pénalités

- **-2 points** : Contribution rejetée
- **-5 points** : Inclusion de données personnelles
- **-10 points** : Violation répétée
- **-3 points** : Par erreur signalée (au-delà de 2)

### Sans bonus

❌ **Bonus de qualité image** : Supprimé (images compressées)
❌ **Bonus d'engagement** : Supprimé (pas de calcul basé sur usage)

## Fonctions RPC

### `add_contributor_points()`

Ajoute des points à un contributeur et enregistre la transaction.

```typescript
function add_contributor_points(
  p_contributor_id: UUID,
  p_points: number,
  p_contribution_type: 'image' | 'exercise' | 'penalty',
  p_description?: string
): number // Retourne le total de points
```

**Utilisation** :
```sql
-- Créer un exercice : +5 points
SELECT add_contributor_points(
  'uuid-contributeur',
  5,
  'exercise',
  'Exercise: "Ouvrir un email"'
);

-- Pénalité pour erreur
SELECT add_contributor_points(
  'uuid-contributeur',
  -3,
  'penalty',
  'Erreur signalée dans exercice XYZ'
);
```

### `calculate_and_distribute_revenue()`

Calcule et enregistre une distribution de revenus.

```typescript
function calculate_and_distribute_revenue(
  p_total_revenue_cents: number
): {
  distribution_id: UUID,
  total_pool_cents: number,
  distribution_count: number
}
```

**Utilisation** :
```sql
-- Quand CA plateforme atteint 1000€ (100000 cents)
SELECT calculate_and_distribute_revenue(100000);

-- Cela crée :
-- 1. Un enregistrement revenue_distributions
-- 2. Une ligne contributor_distributions par contributeur actif
-- 3. Montants calculés : (points/total_points) × 20000 cents (200€)
```

**Exemple de résultat** :

Si CA = 1000€ et 500 points totaux :
- Pool de distribution = 200€
- Contributeur A : 150 points → (150/500) × 200€ = 60€
- Contributeur B : 200 points → (200/500) × 200€ = 80€
- Contributeur C : 150 points → (150/500) × 200€ = 60€

## Intégration avec le code

### React Hook (à créer)

```typescript
// src/hooks/useContributorPoints.js
const useContributorPoints = (userId: string) => {
  const [points, setPoints] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch from RLS-protected tables
    const fetchPoints = async () => {
      const { data: pointsData } = await supabase
        .from('contributor_points')
        .select('*')
        .eq('contributor_id', userId)
        .single();
      
      const { data: distData } = await supabase
        .from('contributor_distributions')
        .select(`
          *,
          revenue_distributions (
            distribution_date,
            total_platform_revenue_cents
          )
        `)
        .eq('contributor_id', userId);
      
      setPoints(pointsData);
      setDistributions(distData);
      setLoading(false);
    };
    
    fetchPoints();
  }, [userId]);
  
  return { points, distributions, loading };
};
```

### Dashboard Contributeur

```jsx
// Afficher les points
<div className="card">
  <h2>Vos Points: {points.total_points}</h2>
  <p>Classement: {getRanking(points.total_points)}</p>
</div>

// Afficher les distributions reçues
<div className="card">
  <h3>Distributions reçues</h3>
  {distributions.map(dist => (
    <div key={dist.id}>
      <p>Distribution du {formatDate(dist.revenue_distributions.distribution_date)}</p>
      <p>Montant: {formatEuro(dist.amount_cents)}</p>
      <p>Vos points à ce moment: {dist.contributor_points}</p>
      <p>Statut: {dist.status}</p>
    </div>
  ))}
</div>
```

## Workflow de contribution

### Création d'un exercice

1. Contributeur crée exercice (5 points)
   ```
   → add_contributor_points(user_id, 5, 'exercise', 'Exercise: ...')
   ```

2. Admin valide
   - Si approuvé : Points restent
   - Si rejeté : Points -2 (application automatique via trigger)

3. Si exercice a +5 tâches
   ```
   → add_contributor_points(user_id, 2, 'exercise', 'Bonus complexité')
   ```

4. Si version supplémentaire
   ```
   → add_contributor_points(user_id, 3, 'exercise', 'Version: Variante 2')
   ```

### Erreur signalée

1. Apprenant signale erreur
2. Admin confirme (après vérification)
   ```
   → add_contributor_points(user_id, -3, 'penalty', 'Erreur confirmée: ...')
   ```

## Distribution de revenus

### Processus mensuel

1. **Vérifier CA** : Est-ce qu'on atteint 1000€?
   - 1000€ → 1er palier
   - 2000€ → 2e palier
   - etc.

2. **Déclencher distribution**
   ```sql
   SELECT calculate_and_distribute_revenue(100000); -- 1000€
   ```

3. **Système génère**
   - revenue_distributions record
   - contributor_distributions pour chaque actif
   - Calculs proportionnels aux points

4. **Vérifier seuil minimum**
   - Si montant < 10€ : Reporter au palier suivant
   - Si montant ≥ 10€ : Marquer comme 'pending'

5. **Paiement PayPal**
   - Administrateur initie paiements
   - Mise à jour status → 'paid'
   - Enregistrer payment_date

## Sécurité (RLS)

- ✅ Contributeur voit ses points uniquement
- ✅ Contributeur voit ses distributions uniquement
- ✅ Admin voit tous les points et distributions
- ✅ Pas d'accès direct aux calculs de revenus

## Limitations actuelles

- ❌ Pas de trigger automatique pour rejets
- ❌ Pas d'interface admin pour ajouter/retirer points
- ❌ Pas d'intégration webhook Stripe pour distributions
- ❌ Pas de notification d'erreur signalée
- ❌ Pas de paiement automatique PayPal

## Migration d'installation

Exécuter en Supabase SQL Editor :
```bash
# Copier-coller le contenu de migration_points_system.sql
```

---

**Status** : ✅ Tables créées et testées
**Version** : 1.0
**Date** : 2 décembre 2025

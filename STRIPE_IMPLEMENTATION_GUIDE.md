# Système de Paiement Stripe - Guide d'intégration complète

## 📋 Résumé du système

Le système permet aux **formateurs** d'acheter des forfaits de licences via **Stripe** :
- 5 licences pour 49€
- 10 licences pour 89€
- 25 licences pour 199€
- 50 licences pour 399€

Les formateurs peuvent ensuite assigner ces licences à leurs apprenants.

## 🗄️ Structure de la base de données

### Tables créées :

1. **license_packages** - Forfaits disponibles
   ```sql
   id, name, quantity, price_cents, description
   ```

2. **license_purchases** - Achats effectués
   ```sql
   id, trainer_id, package_id, quantity, amount_cents, 
   stripe_payment_intent_id, status, created_at, completed_at
   ```

3. **purchased_licenses** - Licences achetées (une par licence)
   ```sql
   id, purchase_id, trainer_id, category_id, learner_id, 
   is_assigned, assigned_at, created_at
   ```

## 🎯 Flux de paiement

```
1. Formateur clic "Acheter des licences" (onglet nouveau)
   ↓
2. Affichage des 4 forfaits disponibles
   ↓
3. Sélection d'un forfait
   ↓
4. Création d'un achat pending en BDD
   ↓
5. Appel au backend pour créer session Stripe
   ↓
6. Redirection vers Stripe Checkout
   ↓
7. Paiement (réussi ou échoué)
   ↓
8. Webhook Stripe → Confirmation au backend
   ↓
9. Mise à jour de l'achat (completed/failed)
   ↓
10. Génération des licences individuelles
    ↓
11. Formateur peut assigner aux apprenants
```

## 📦 Composants frontend créés

### 1. **PurchaseLicensesModal.jsx**
- Affiche les forfaits disponibles
- Gère la sélection et l'achat
- Redirige vers Stripe Checkout
- **Props** : `trainerId`, `onSuccess`

### 2. **PurchaseHistory.jsx**
- Affiche l'historique des achats
- Montre le statut (pending, completed, failed, refunded)
- **Props** : `trainerId`

### 3. **TrainerAccountPage.jsx** (modifié)
- Ajout de 3 onglets :
  - **Apprenants** : Gestion des apprenants et assignation de licences
  - **Acheter des licences** : Nouvelle section pour acheter des licences
  - **Paramètres** : Changement mot de passe et vue des licences

## 💾 Fonctions de données (stripePurchases.js)

- `getLicensePackages()` - Récupère les forfaits
- `createLicensePurchase(packageId, trainerId)` - Crée un achat pending
- `updatePurchaseStatus(purchaseId, updateData)` - Met à jour le statut après paiement
- `getTrainerPurchases(trainerId)` - Historique des achats
- `getAvailablePurchasedLicenses(trainerId)` - Licences non assignées
- `assignPurchasedLicense(purchasedLicenseId, learnerId)` - Assigne une licence
- `getAvailableLicensesByCategory(trainerId)` - Compte par catégorie

## 🚀 Prochaines étapes

### 1. ✅ Migration SQL
Exécuter `migrations_add_stripe_purchases.sql` dans Supabase

### 2. ⏳ Configuration Stripe (IMPORTANT)

#### A. Créer un compte Stripe
- https://stripe.com
- Accès gratuit pour développement

#### B. Récupérer les clés API
- Dashboard → API Keys
- Copier clé publique (pk_test_...)
- Copier clé secrète (sk_test_...)

#### C. Configurer les variables
**Frontend (.env.local)** :
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
```

**Backend** :
```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

### 3. ⏳ Installer dépendances Stripe

```bash
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
```

### 4. ⏳ Créer l'endpoint backend

**Route**: `/api/create-checkout-session`

```javascript
// POST /api/create-checkout-session
{
  purchaseId: "uuid",
  packageId: 1,
  trainerId: "uuid",
  successUrl: "string",
  cancelUrl: "string"
}
```

Doit :
1. Récupérer les détails d'achat en BDD
2. Créer une session Stripe Checkout
3. Retourner `{ sessionId }`

### 5. ⏳ Créer le webhook Stripe

**Route**: `/api/webhooks/stripe`

Doit traiter les événements :
- `payment_intent.succeeded` → Mettre à jour achat en "completed"
- `payment_intent.payment_failed` → Mettre à jour achat en "failed"
- Générer les licences achetées dans `purchased_licenses`

### 6. ⏳ Configurer webhooks Stripe
- Dashboard → Webhooks
- Ajouter endpoint: `https://votreserveur.com/api/webhooks/stripe`
- Sélectionner les événements à écouter
- Copier le secret et l'ajouter à `.env`

### 7. ⏳ Ajouter composant Stripe au main.jsx

```jsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

<Elements stripe={stripePromise}>
  <App />
</Elements>
```

### 8. ✅ Tester le workflow
1. Se connecter comme formateur
2. Aller dans "Mon Compte" → onglet "Acheter des licences"
3. Sélectionner un forfait
4. Cliquer sur "Procéder au paiement"
5. Utiliser les données de test Stripe:
   - Email: tout
   - Carte: `4242 4242 4242 4242`
   - Expiration: `12/25`
   - CVC: `123`
6. Vérifier que l'achat est créé avec le statut "completed"
7. Retour à "Apprenants" et assignation des licences

## 🔐 RLS Policies

Toutes les tables ont des RLS policies :
- ✅ `license_packages` : Lecture publique
- ✅ `license_purchases` : Formateurs voient leurs propres achats, admins voient tous
- ✅ `purchased_licenses` : Formateurs peuvent voir/mettre à jour leurs licences

## 📊 Tarification

| Forfait | Quantité | Prix | Par licence |
|---------|----------|------|------------|
| Basic | 5 | 49€ | 9.80€ |
| Standard | 10 | 89€ | 8.90€ |
| Pro | 25 | 199€ | 7.96€ |
| Premium | 50 | 399€ | 7.98€ |

*À modifier dans `migrations_add_stripe_purchases.sql` si besoin*

## 🆘 Troubleshooting

### Le bouton de paiement ne fait rien
→ Vérifier que Stripe SDK est chargé
→ Vérifier les logs de la console
→ Vérifier que la clé publique est correcte

### "Function not found" pour create-checkout-session
→ L'endpoint backend n'existe pas encore
→ À créer avec le framework backend (Node.js, Python, etc.)

### Les achats restent en "pending"
→ Le webhook Stripe n'a pas confirmé le paiement
→ Vérifier la configuration du webhook
→ Vérifier les logs de Stripe Dashboard

### RLS policy "Permission denied"
→ Vérifier que les policies sont correctement appliquées
→ Vérifier que l'utilisateur est authentifié
→ Vérifier les statuts des policies dans Supabase

# Guide d'intégration Stripe

## Configuration Stripe

### 1. Créer un compte Stripe
- Accéder à https://stripe.com
- Créer un compte (gratuit pour le développement)

### 2. Récupérer les clés API
- Aller dans Dashboard → API Keys
- Copier la clé publique (commence par `pk_`)
- Copier la clé secrète (commence par `sk_`) - À GARDER SECRET

### 3. Configurer les variables d'environnement

**Frontend (.env.local) :**
```
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
```

**Backend (.env ou variable serveur) :**
```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 4. Installer Stripe SDK
```bash
npm install stripe @stripe/react-stripe-js
```

### 5. Créer un endpoint backend pour les sessions Stripe

C'est la prochaine étape. Il faudra créer une route API qui :
1. Reçoit les détails de l'achat
2. Crée une session Stripe Checkout
3. Retourne le sessionId au frontend

### 6. Configurer les Webhooks Stripe

Pour traiter les confirmations de paiement :
- Dashboard → Webhooks
- Ajouter un endpoint (URL de votre serveur + `/api/webhooks/stripe`)
- Copier le secret et l'ajouter à `.env`

## Architecture du flux de paiement

```
1. Formateur clique "Acheter des licences"
2. Frontend affiche les forfaits disponibles
3. Formateur sélectionne un forfait
4. Créer un achat pending en base de données
5. Frontend envoie détails d'achat au backend
6. Backend crée une session Stripe
7. Frontend redirige vers Stripe Checkout
8. Après paiement (succès/échec)
9. Stripe envoie un webhook au backend
10. Backend met à jour l'achat (completed/failed)
11. Backend génère les licences achetées
12. Formateur peut assigner les licences à ses apprenants
```

## Librairies nécessaires

- `stripe` - SDK serveur (Node.js)
- `@stripe/react-stripe-js` - SDK React
- `@stripe/stripe-js` - SDK JS

## Prochaines étapes

1. ✅ Créer les tables de base de données
2. ✅ Créer les composants React
3. ⏳ Créer l'endpoint backend `/api/create-checkout-session`
4. ⏳ Créer le webhook `/api/webhooks/stripe` pour confirmer les paiements
5. ⏳ Ajouter les onglets à TrainerAccountPage
6. ⏳ Tester le workflow complet

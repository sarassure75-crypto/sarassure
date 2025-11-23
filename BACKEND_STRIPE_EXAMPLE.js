// Exemple de backend pour créer une session Stripe Checkout
// À adapter à votre framework backend (Express, Django, etc.)

// ====================
// EXPRESS.JS EXEMPLE
// ====================

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Utiliser la clé service pour les opérations serveur
);

// Endpoint pour créer une session Stripe Checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { purchaseId, packageId, trainerId, successUrl, cancelUrl } = req.body;

    // 1. Récupérer les détails d'achat et du forfait
    const { data: purchase } = await supabase
      .from('license_purchases')
      .select(`
        *,
        license_packages (
          name,
          quantity,
          price_cents
        )
      `)
      .eq('id', purchaseId)
      .single();

    if (!purchase) {
      return res.status(404).json({ error: 'Achat non trouvé' });
    }

    // 2. Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: purchase.license_packages.name,
              description: `${purchase.license_packages.quantity} licences pour vos apprenants`
            },
            unit_amount: purchase.amount_cents // En centimes
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      
      // Données supplémentaires associées à la session
      metadata: {
        purchaseId,
        trainerId
      },

      // Email facultatif (pré-remplir le formulaire)
      customer_email: req.user?.email // À adapter selon votre contexte d'auth
    });

    // 3. Retourner le sessionId
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    res.status(500).json({ 
      error: error.message || 'Erreur lors de la création de la session de paiement'
    });
  }
});

// ====================
// WEBHOOK STRIPE
// ====================

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur de signature webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Gérer les différents types d'événements
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { purchaseId, trainerId } = paymentIntent.metadata;

        // 1. Mettre à jour l'achat en "completed"
        const { error: updateError } = await supabase
          .from('license_purchases')
          .update({
            status: 'completed',
            stripe_payment_intent_id: paymentIntent.id
          })
          .eq('id', purchaseId);

        if (updateError) throw updateError;

        // 2. Récupérer le nombre de licences à créer
        const { data: purchase } = await supabase
          .from('license_purchases')
          .select(`
            quantity,
            license_packages (
              quantity
            )
          `)
          .eq('id', purchaseId)
          .single();

        // 3. Créer les licences individuelles dans purchased_licenses
        // Pour chaque catégorie (sauf Tactile qui est gratuite)
        const categories = [2, 3, 4]; // Communication, Électronique, Cybersécurité
        const licensesToCreate = [];

        for (let i = 0; i < purchase.license_packages.quantity; i++) {
          for (const categoryId of categories) {
            licensesToCreate.push({
              purchase_id: purchaseId,
              trainer_id: trainerId,
              category_id: categoryId,
              is_assigned: false
            });
          }
        }

        const { error: licenseError } = await supabase
          .from('purchased_licenses')
          .insert(licensesToCreate);

        if (licenseError) throw licenseError;

        console.log(`✅ Achat ${purchaseId} complété avec ${licensesToCreate.length} licences créées`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const { purchaseId } = paymentIntent.metadata;

        // Mettre à jour l'achat en "failed"
        await supabase
          .from('license_purchases')
          .update({
            status: 'failed',
            stripe_payment_intent_id: paymentIntent.id
          })
          .eq('id', purchaseId);

        console.log(`❌ Achat ${purchaseId} échoué`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        if (charge.payment_intent_id) {
          // Trouver et mettre à jour l'achat en "refunded"
          await supabase
            .from('license_purchases')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', charge.payment_intent_id);

          console.log(`💰 Remboursement traité`);
        }
        break;
      }

      default:
        console.log(`Événement Stripe non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Erreur lors du traitement du webhook:', err);
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

module.exports = app;

// ====================
// VARIABLES D'ENVIRONNEMENT REQUISES
// ====================
/*
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
*/

// ====================
// TESTS AVEC CURL
// ====================

/*
// Tester la création de session
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": "550e8400-e29b-41d4-a716-446655440000",
    "packageId": 1,
    "trainerId": "550e8400-e29b-41d4-a716-446655440001",
    "successUrl": "http://localhost:5173/compte-formateur?success=true",
    "cancelUrl": "http://localhost:5173/compte-formateur"
  }'

// Tester le webhook (utiliser Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
*/

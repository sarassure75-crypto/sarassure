import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getLicensePackages, createLicensePurchase } from '@/data/stripePurchases';
import { ShoppingCart, Loader2, Check } from 'lucide-react';

export default function PurchaseLicensesModal({ trainerId, onSuccess }) {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await getLicensePackages();
      setPackages(data);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les forfaits',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    if (!trainerId) {
      toast({
        title: 'Erreur',
        description: 'ID formateur manquant',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Créer l'achat en base (statut pending)
      const purchase = await createLicensePurchase({
        packageId,
        trainerId
      });

      // Rediriger vers Stripe Checkout
      // TODO: Intégrer avec la route backend qui crée la session Stripe
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseId: purchase.id,
          packageId,
          trainerId,
          successUrl: `${window.location.origin}/compte-formateur?tab=licenses&success=true`,
          cancelUrl: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Stripe');
      }

      const { sessionId } = await response.json();

      // Rediriger vers Stripe
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error('Erreur lors de l\'achat:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Erreur lors du traitement du paiement',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acheter des licences</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Acheter des licences
          </CardTitle>
          <CardDescription>
            Sélectionnez un forfait pour attribuer des licences à vos apprenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {selectedPackage?.id === pkg.id && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500">Sélectionné</Badge>
                  </div>
                )}

                <h3 className="font-semibold text-lg">{pkg.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {(pkg.price_cents / 100).toFixed(2)}
                  </span>
                  <span className="text-gray-600">€</span>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {(pkg.price_cents / pkg.quantity / 100).toFixed(2)}€ par licence
                </p>
              </div>
            ))}
          </div>

          <Button
            className="w-full mt-6"
            size="lg"
            disabled={!selectedPackage || isProcessing}
            onClick={() => handlePurchase(selectedPackage.id)}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirection vers le paiement...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Procéder au paiement
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

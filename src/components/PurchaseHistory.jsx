import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { getTrainerPurchases } from '@/data/stripePurchases';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé'
};

export default function PurchaseHistory({ trainerId }) {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, [trainerId]);

  const loadPurchases = async () => {
    try {
      const data = await getTrainerPurchases(trainerId);
      setPurchases(data);
    } catch (err) {
      console.error('Erreur lors du chargement des achats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des achats</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des achats</CardTitle>
        <CardDescription>
          {purchases.length === 0 ? 'Aucun achat pour le moment' : `${purchases.length} achat(s)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Vous n'avez pas encore acheté de licences.
          </p>
        ) : (
          <div className="space-y-4">
            {purchases.map(purchase => (
              <div
                key={purchase.id}
                className="border rounded-lg p-4 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {purchase.license_packages?.name || 'Forfait'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(purchase.created_at).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(purchase.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {purchase.quantity} licences - {(purchase.amount_cents / 100).toFixed(2)}€
                  </p>
                </div>
                <Badge className={statusColors[purchase.status]}>
                  {statusLabels[purchase.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

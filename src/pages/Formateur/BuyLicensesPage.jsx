import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import PurchaseLicensesModal from '@/components/PurchaseLicensesModal';

export default function BuyLicensesPage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ShoppingCart className="text-primary" />
            Acheter des Licences
          </h1>
          <p className="text-gray-600 mt-2">
            Sélectionnez un forfait pour attribuer des licences à vos apprenants
          </p>
        </div>

        {/* Contenu */}
        <Card>
          <CardContent className="pt-6">
            <PurchaseLicensesModal 
              trainerId={currentUser?.id}
              onSuccess={() => {
                // Vous pouvez ajouter une logique de succès ici
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

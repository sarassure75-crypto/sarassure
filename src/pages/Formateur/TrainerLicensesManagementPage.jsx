import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TrainerLicensesOverview from '@/components/TrainerLicensesOverview';

export default function TrainerLicensesManagementPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Veuillez vous connecter</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <TrainerLicensesOverview trainerId={currentUser.id} />
      </div>
    </div>
  );
}

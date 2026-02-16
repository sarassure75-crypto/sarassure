import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES } from '@/data/users';
import IconManager from '@/components/admin/IconManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Page de gestion des icônes
 * Permet aux administrateurs d'explorer et sélectionner des icônes
 */
const IconManagerPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur a les droits admin
  if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions pour accéder à cette page.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Gestionnaire d'Icônes</h1>
          <p className="text-gray-600 mt-2">
            Explorez et intégrez des milliers d'icônes pour enrichir vos QCM
          </p>
        </div>

        {/* Contenu principal */}
        <IconManager />
      </div>
    </div>
  );
};

export default IconManagerPage;

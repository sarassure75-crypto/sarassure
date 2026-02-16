import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/data/users';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

const DashboardRedirector = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        switch (currentUser.role) {
          case USER_ROLES.ADMIN:
            navigate('/admin/dashboard');
            break;
          case USER_ROLES.TRAINER:
            navigate('/compte-formateur');
            break;
          case USER_ROLES.LEARNER:
            navigate('/taches');
            break;
          case USER_ROLES.CONTRIBUTOR:
            navigate('/contributeur');
            break;
          default:
            navigate('/');
            break;
        }
      } else {
        navigate('/login');
      }
    }
  }, [currentUser, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Redirection en cours...</p>
    </div>
  );
};

export default DashboardRedirector;

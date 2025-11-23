import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/data/users';

const AuthRedirect = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from?.pathname;

      if (from && from !== '/login' && from !== '/learner-login' && from !== '/') {
        navigate(from, { replace: true });
        return;
      }

      let redirectTo = '/';
      switch (currentUser.role) {
        case USER_ROLES.LEARNER:
          redirectTo = '/taches';
          break;
        case USER_ROLES.TRAINER:
          redirectTo = '/formateur';
          break;
        case USER_ROLES.ADMIN:
          redirectTo = '/admin/dashboard';
          break;
        default:
          redirectTo = '/';
      }
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, navigate, location.state]);

  return children;
};

export default AuthRedirect;
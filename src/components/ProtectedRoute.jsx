import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Chargement...</div>; 
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Vérifier le rôle seulement si roles est défini et est un array
    if (roles && Array.isArray(roles) && roles.length > 0) {
        const userRole = currentUser?.role;
        
        // Simple check sans conversion
        if (!userRole || !roles.includes(userRole)) {
            return <Navigate to="/" state={{ from: location }} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
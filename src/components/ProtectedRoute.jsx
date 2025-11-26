import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    console.log('🛡️ ProtectedRoute - Loading:', loading, 'User:', currentUser, 'Required roles:', roles); // DEBUG

    if (loading) {
        return <div>Chargement...</div>; 
    }

    if (!currentUser) {
        console.log('❌ Pas d\'utilisateur - Redirection vers /login'); // DEBUG
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(currentUser.role)) {
        console.log('❌ Rôle non autorisé:', currentUser.role, 'requis:', roles); // DEBUG
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    console.log('✅ Accès autorisé'); // DEBUG
    return children;
};    export default ProtectedRoute;
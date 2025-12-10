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

    if (roles && !roles.includes(currentUser.role)) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};    export default ProtectedRoute;
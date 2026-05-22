import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-deepBlue flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (requireAuth && !currentUser) {
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!requireAuth && currentUser) {
    // If user is already logged in and tries to access /auth, redirect to dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

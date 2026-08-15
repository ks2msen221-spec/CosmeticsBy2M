import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      console.warn("Unauthorized access attempt to admin console:", {
        isAuthenticated: !!user,
        role: profile?.role
      });
    }
  }, [loading, user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream">
        <div className="w-10 h-10 border-2 border-brand-taupe border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-brand-noir/40 font-mono">Vérification des accès administrateur...</p>
      </div>
    );
  }

  if (!user) {
    // Save previous path in state so we can redirect back if they sign in as admin
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" state={{ unauthorized: true }} replace />;
  }

  return <>{children}</>;
}

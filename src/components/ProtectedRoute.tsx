import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-2 border-[#9A8C73] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-mono">Chargement de votre session...</p>
      </div>
    );
  }

  if (!user) {
    // Keep track of the location they wanted to visit to redirect back after login if helpful
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading, requireAuth } = useAuth();

  useEffect(() => {
    requireAuth();
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <LoadingSpinner />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>
            Cargando aplicación...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El hook useAuth se encarga de redirigir
  }

  return <>{children}</>;
}
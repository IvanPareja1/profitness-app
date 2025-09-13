// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isReloading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirigir al login, guardando la ubicación actual para volver después
        navigate('/login', { 
          state: { from: location },
          replace: true 
        });
      } else {
        setShowContent(true);
      }
    }

    // Permitir mostrar contenido durante recarga
    if (isReloading && user) {
      setShowContent(true);
    }
  }, [user, loading, isReloading, navigate, location]);

  // Mostrar spinner mientras se verifica la autenticación (solo si no es recarga)
  if (loading && !isReloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de la verificación (ya se debería haber redirigido)
  if (!user) {
    return null;
  }

  // Renderizar children si está autenticado
  return (
    <>
      {showContent && children}
      {isReloading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
}
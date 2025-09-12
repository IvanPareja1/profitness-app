// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Solo procesar cuando la autenticación haya terminado de cargar
    if (!loading) {
      setIsChecking(false);
      
      if (!user) {
        // Redirigir al login, guardando la ubicación actual para volver después
        navigate('/login', { 
          state: { from: location },
          replace: true 
        });
      }
    }
  }, [user, loading, navigate, location]);

  useEffect(() => {
    // Timeout de seguridad para evitar loops infinitos
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing check completion');
        setIsChecking(false);
        
        if (!user) {
          navigate('/login', { replace: true });
        }
      }
    }, 8000); // 8 segundos es más que suficiente

    return () => clearTimeout(timer);
  }, [loading, user, navigate]);

  // Mostrar spinner mientras se verifica la autenticación
  if (loading || isChecking) {
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
  return <>{children}</>;
}
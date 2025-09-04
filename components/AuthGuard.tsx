
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Verificar sesión actual primero
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error obteniendo sesión:', error);
          setUser(null);
        } else {
          console.log('Sesión actual:', session?.user ? 'Autenticado' : 'No autenticado');
          setUser(session?.user || null);
        }

        if (isMounted) {
          setInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
        if (isMounted) {
          setUser(null);
          setInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth event:', event);

        if (!isMounted) return;

        if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
          if (pathname === '/login' || pathname === '/auth/callback') {
            router.push('/');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          if (pathname !== '/login' && pathname !== '/auth/callback') {
            router.push('/login');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  // Manejar redirecciones cuando se inicializa
  useEffect(() => {
    if (!initialized || isLoading) return;

    const handleRedirections = () => {
      const isAuthPage = pathname === '/login' || pathname === '/auth/callback';

      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/');
      }
    };

    handleRedirections();
  }, [user, initialized, isLoading, pathname, router]);

  if (isLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="ri-heart-pulse-line text-white text-2xl"></i>
          </div>
          <h1 className="text-xl font-[\'Pacifico\'] text-blue-600 mb-2">ProFitness</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Permitir acceso a páginas de auth
  if (pathname === '/login' || pathname === '/auth/callback') {
    return <>{children}</>;
  }

  // Para todas las demás páginas, verificar autenticación
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

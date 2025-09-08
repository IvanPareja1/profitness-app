// app/components/AuthProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Primero verificar si hay sesión activa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Sesión encontrada:', session.user.id);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(session.user));
        } else {
          console.log('No hay sesión activa');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 2. Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento auth:', event, session?.user?.id);
        
        if (session) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(session.user));
          
          if (event === 'SIGNED_IN') {
            router.push('/');
          }
        } else {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
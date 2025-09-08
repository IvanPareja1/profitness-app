// app/components/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión existente al cargar
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && !error) {
          console.log('Session found:', session.user.id);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(session.user));
        } else {
          console.log('No active session');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        
        if (session) {
          // Guardar en localStorage
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(session.user));
          
          if (event === 'SIGNED_IN') {
            // Redirigir después de login exitoso
            router.push('/');
          }
        } else {
          // Limpiar localStorage en logout
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
          
          if (event === 'SIGNED_OUT') {
            router.push('/login');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return <>{children}</>;
}
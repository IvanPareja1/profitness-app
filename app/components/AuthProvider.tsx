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
        
        if (session && !error && session.user) {
          console.log('Session found:', session.user.id);
          
          // Guardar datos CORRECTAMENTE
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email,
            picture: session.user.user_metadata?.avatar_url || '',
            sub: session.user.user_metadata?.sub || '',
            email_verified: session.user.user_metadata?.email_verified || false
          };
          
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(userData));
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
        
        if (session && session.user) {
          // Guardar en localStorage CORRECTAMENTE
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email,
            picture: session.user.user_metadata?.avatar_url || '',
            sub: session.user.user_metadata?.sub || '',
            email_verified: session.user.user_metadata?.email_verified || false
          };
          
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(userData));
          
          if (event === 'SIGNED_IN') {
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
// app/components/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Primero verificar si hay sesión activa en Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
          console.log('✅ Sesión de Supabase encontrada:', session.user.id);
          
          // Guardar información CORRECTA con ID de Supabase
          const userData = {
            id: session.user.id, // ← ID de Supabase
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email,
            picture: session.user.user_metadata?.avatar_url || '',
            sub: session.user.user_metadata?.sub || '',
            email_verified: session.user.user_metadata?.email_verified || false
          };
          
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          console.log('ℹ️ No hay sesión activa en Supabase');
          // Limpiar datos viejos
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
      }
    };

    initializeAuth();

    // 2. Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        
        if (session && session.user) {
          // Guardar información CORRECTA
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
          // Limpiar en logout
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return <>{children}</>;
}
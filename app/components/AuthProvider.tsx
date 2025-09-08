// app/components/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(session.user));
          
          if (event === 'SIGNED_IN') {
            // Redirigir a la página principal después de login
            router.push('/');
          }
        } else {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
          // No redirigir automáticamente para evitar loops
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return <>{children}</>;
}
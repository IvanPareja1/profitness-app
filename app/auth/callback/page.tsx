// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AuthCallback() {
  const router = useRouter();

 useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Esperar a que Supabase procese la sesión
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Callback session:', session?.user?.id);
        
        if (session && !error) {
          // Guardar información correctamente
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email,
            picture: session.user.user_metadata?.avatar_url || ''
          }));
          
          // Redirigir a la página principal
          router.push('/');
        } else {
          console.error('Error in callback:', error);
          router.push('/login?error=auth_failed');
        }
      } catch (err) {
        console.error('Unexpected error in callback:', err);
        router.push('/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
}

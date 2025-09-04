
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackContent() {
  const [status, setStatus] = useState('Procesando autenticación...');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Verificando autenticación...');
        
        // Verificar si hay código de autorización en la URL
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        
        if (errorParam) {
          console.error('Error en OAuth:', errorParam);
          setError('Error en la autenticación con Google');
          setStatus('Error en la autenticación. Redirigiendo...');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (code) {
          setStatus('Intercambiando código de autorización...');
          
          // Intercambiar código por sesión
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Error intercambiando código:', exchangeError);
            setError('Error procesando la autenticación');
            setStatus('Error en la autenticación. Redirigiendo...');
            setTimeout(() => router.push('/login'), 3000);
            return;
          }
          
          if (data.session) {
            setStatus('¡Autenticación exitosa! Creando perfil...');
            
            const { user } = data.session;
            
            // Crear o actualizar perfil de usuario
            const { error: profileError } = await supabase
              .from('user_profiles')
              .upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              });

            if (profileError) {
              console.log('Info: Error actualizando perfil:', profileError.message);
              // No es crítico, continuar de todas formas
            }

            setStatus('¡Bienvenido! Redirigiendo al dashboard...');
            setTimeout(() => router.push('/'), 1500);
          }
        } else {
          // Intentar obtener sesión actual
          setStatus('Verificando sesión actual...');
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error obteniendo sesión:', sessionError);
            setError('Error verificando la sesión');
            setStatus('Error verificando sesión. Redirigiendo...');
            setTimeout(() => router.push('/login'), 3000);
            return;
          }
          
          if (sessionData.session) {
            setStatus('¡Sesión encontrada! Redirigiendo...');
            setTimeout(() => router.push('/'), 1000);
          } else {
            setStatus('No se encontró sesión activa. Redirigiendo...');
            setTimeout(() => router.push('/login'), 2000);
          }
        }
        
      } catch (error: any) {
        console.error('Error procesando callback:', error);
        setError('Error inesperado durante la autenticación');
        setStatus('Error inesperado. Redirigiendo...');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
          <i className="ri-heart-pulse-line text-white text-2xl"></i>
        </div>
        <h1 className="text-2xl font-['Pacifico'] text-blue-600 mb-4">ProFitness</h1>
        
        {error ? (
          <div className="mb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              <i className="ri-error-warning-line mr-2"></i>
              {error}
            </div>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        )}
        
        <p className="text-gray-600 text-lg">{status}</p>
        
        {error && (
          <p className="text-sm text-gray-500 mt-4">
            Serás redirigido al login en unos segundos...
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-heart-pulse-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-['Pacifico'] text-blue-600 mb-4">ProFitness</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkCurrentUser();
  }, [router]);

  const checkCurrentUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error verificando sesión:', error);
      } else if (session?.user) {
        console.log('Usuario ya autenticado, redirigiendo...');
        setUser(session.user);
        router.push('/');
        return;
      }
      
    } catch (error) {
      console.error('Error verificando usuario:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Limpiar cualquier sesión existente primero
      await supabase.auth.signOut();
      
      // Obtener la URL base actual
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/auth/callback`;
      
      console.log('Iniciando OAuth con redirect a:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Error de OAuth:', error);
        setError(`Error de autenticación: ${error.message}`);
        setIsLoading(false);
      } else {
        console.log('Redirección OAuth iniciada correctamente');
        // No establecer isLoading = false aquí porque vamos a ser redirigidos
      }
      
    } catch (error: any) {
      console.error('Error general:', error);
      setError('Error de conexión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo y Marca */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-heart-pulse-line text-white text-4xl"></i>
          </div>
          <h1 className="text-4xl font-['Pacifico'] text-blue-600 mb-2">ProFitness</h1>
          <p className="text-gray-600 text-lg">Tu compañero de fitness personal</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-sm mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              <div className="flex items-center">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-2xl p-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
              <i className="ri-restaurant-line text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Nutrición Inteligente</p>
              <p className="text-sm text-gray-600">Registra y monitorea tu alimentación</p>
            </div>
          </div>

          <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-2xl p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
              <i className="ri-run-line text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Entrenamientos</p>
              <p className="text-sm text-gray-600">Registra tus ejercicios y progreso</p>
            </div>
          </div>

          <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-2xl p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <i className="ri-bar-chart-line text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Progreso Detallado</p>
              <p className="text-sm text-gray-600">Visualiza tus estadísticas y metas</p>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="w-full max-w-sm">
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="w-full bg-white text-gray-800 py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-gray-100"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                <span>Conectando con Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6 leading-relaxed">
            Al continuar, aceptas nuestros{' '}
            <span className="text-blue-600 underline cursor-pointer">Términos de Servicio</span> y{' '}
            <span className="text-blue-600 underline cursor-pointer">Política de Privacidad</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-xs text-gray-400">ProFitness v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">Hecho con ❤️ para tu salud</p>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { signInWithGoogle, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        router.push('/profile');
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setMessage('Redirigiendo a Google...');
      
      await signInWithGoogle();
      
    } catch (error) {
      console.error('Error with Google sign in:', error);
      setMessage('Error al conectar con Google. Intenta nuevamente.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="ri-heart-pulse-line text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-['Pacifico'] text-gray-800 mb-2">ProFitness</h1>
          <p className="text-gray-600 leading-relaxed">Nutre tu progreso, domina tus resultados</p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl text-center text-sm bg-blue-100 text-blue-700 border border-blue-200">
            <div className="flex items-center justify-center space-x-2">
              <i className="ri-information-line"></i>
              <span>{message}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-gray-300 rounded-xl p-4 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span className="font-medium text-gray-700">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  <span>Conectando...</span>
                </div>
              ) : (
                'Iniciar sesión con Google'
              )}
            </span>
          </button>
        </div>

        <div className="mt-8 space-y-3">
          <h4 className="font-semibold text-gray-800 text-center mb-4">¿Qué incluye ProFitness?</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-green-500 text-xs"></i>
              </div>
              <span>Seguimiento nutricional completo</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-green-500 text-xs"></i>
              </div>
              <span>Escáner de código de barras</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-green-500 text-xs"></i>
              </div>
              <span>Análisis de progreso detallado</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-green-500 text-xs"></i>
              </div>
              <span>Sincronización en la nube</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Al continuar, aceptas nuestros <strong>Términos de Servicio</strong> y <strong>Política de Privacidad</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

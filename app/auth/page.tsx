
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithGoogle, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // Usuario ya autenticado, redirigir
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error checking user:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-leaf-fill text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-['Pacifico'] text-green-600 mb-2">ProFitness</h1>
          <p className="text-gray-600">Inicia sesión con Google para continuar</p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl text-center text-sm bg-blue-100 text-blue-700">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-gray-300 rounded-xl p-4 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
              {loading ? 'Conectando...' : 'Continuar con Google'}
            </span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Al continuar, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
}

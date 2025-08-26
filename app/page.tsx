'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    checkAuth();

    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        // No hay usuario, redirigir a auth
        router.push('/auth');
        return;
      }

      setUser(currentUser);
      
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Iniciando ProFitness...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-leaf-fill text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-[\'Pacifico\'] text-green-600">ProFitness</h1>
          </div>
          <div className="text-sm font-medium text-gray-600" suppressHydrationWarning={true}>
            {currentTime}
          </div>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Bienvenido de nuevo!
          </h2>
          <p className="text-gray-600">Tu compañero personal de nutrición y fitness</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/nutrition" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <i className="ri-restaurant-fill text-orange-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Nutrición</h3>
            <p className="text-xs text-gray-500 mt-1">Registra alimentos</p>
          </Link>

          <Link href="/exercise" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <i className="ri-run-fill text-blue-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Ejercicio</h3>
            <p className="text-xs text-gray-500 mt-1">Rutinas y progreso</p>
          </Link>

          <Link href="/hydration" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-3">
              <i className="ri-drop-fill text-cyan-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Hidratación</h3>
            <p className="text-xs text-gray-500 mt-1">Control diario</p>
          </Link>

          <Link href="/profile" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <i className="ri-user-fill text-purple-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Perfil</h3>
            <p className="text-xs text-gray-500 mt-1">Datos personales</p>
          </Link>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">¡Comencemos!</h3>
              <p className="text-sm text-green-100">Registra tu primera comida o actividad</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-trophy-fill text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-fill text-green-500 text-lg"></i>
            </div>
            <span className="text-xs text-green-500 mt-1">Inicio</span>
          </Link>

          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Comida</span>
          </Link>

          <Link href="/scan" className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-qr-scan-2-line text-white text-lg"></i>
            </div>
          </Link>

          <Link href="/reports" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Reportes</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface QuickStats {
  todayCalories: number;
  targetCalories: number;
  hydration: number;
  targetHydration: number;
  streak: number;
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    todayCalories: 0,
    targetCalories: 2000,
    hydration: 0,
    targetHydration: 2500,
    streak: 0
  });
  const router = useRouter();

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        router.push('/auth');
        return;
      }

      setUser(currentUser);
      await loadQuickStats(currentUser.id);
    } catch (error) {
      console.error('Error initializing user:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadQuickStats = async (userId: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/nutrition-tracker?date=${today}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuickStats({
          todayCalories: data.dailyNutrition?.total_calories || 0,
          targetCalories: data.targets?.target_calories || 2000,
          hydration: data.dailyNutrition?.total_hydration || 0,
          targetHydration: data.targets?.target_hydration || 2500,
          streak: data.streak || 0
        });
      }
    } catch (error) {
      console.error('Error loading quick stats:', error);
    }
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ProFitness...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold font-['Pacifico'] text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 font-['Pacifico']">ProFitness</h1>
              <p className="text-xs text-gray-500">Nutre tu progreso</p>
            </div>
          </div>
          <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <i className="ri-user-line text-gray-500"></i>
              </div>
            )}
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-20 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {getCurrentGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
          </h2>
          <p className="text-gray-600">¿Listo para un día saludable?</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Progreso de Hoy</h3>
            <div className="flex items-center space-x-1">
              <i className="ri-fire-line text-orange-500"></i>
              <span className="text-sm font-medium text-orange-600">{quickStats.streak} días</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Calorías</span>
                <span className="text-sm font-bold text-gray-800">
                  {quickStats.todayCalories} / {quickStats.targetCalories}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(quickStats.todayCalories, quickStats.targetCalories)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Hidratación</span>
                <span className="text-sm font-bold text-gray-800">
                  {quickStats.hydration} / {quickStats.targetHydration}ml
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(quickStats.hydration, quickStats.targetHydration)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/nutrition"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
              <i className="ri-pie-chart-line text-blue-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Nutrición</h3>
            <p className="text-xs text-gray-500">Seguimiento diario</p>
          </Link>

          <Link
            href="/food-search"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
              <i className="ri-add-line text-green-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Agregar</h3>
            <p className="text-xs text-gray-500">Buscar alimentos</p>
          </Link>

          <Link
            href="/scan"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
              <i className="ri-qr-scan-2-line text-purple-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Escanear</h3>
            <p className="text-xs text-gray-500">Código de barras</p>
          </Link>

          <Link
            href="/reports"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
              <i className="ri-line-chart-line text-orange-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Progreso</h3>
            <p className="text-xs text-gray-500">Reportes y análisis</p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          
          <div className="space-y-3">
            <Link
              href="/hydration"
              className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 rounded-xl hover:bg-cyan-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                  <i className="ri-drop-line text-cyan-500"></i>
                </div>
                <span className="font-medium text-cyan-800">Registrar Hidratación</span>
              </div>
              <i className="ri-arrow-right-s-line text-cyan-600"></i>
            </Link>

            <Link
              href="/exercise"
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-heart-pulse-line text-green-500"></i>
                </div>
                <span className="font-medium text-green-800">Registrar Ejercicio</span>
              </div>
              <i className="ri-arrow-right-s-line text-green-600"></i>
            </Link>

            <Link
              href="/reminders"
              className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-alarm-line text-purple-500"></i>
                </div>
                <span className="font-medium text-purple-800">Configurar Recordatorios</span>
              </div>
              <i className="ri-arrow-right-s-line text-purple-600"></i>
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">¡Mantén tu racha!</h3>
              <p className="text-blue-100 text-sm">
                Llevas {quickStats.streak} días consecutivos registrando tus comidas
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-trophy-line text-yellow-300 text-2xl"></i>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-fill text-blue-500 text-lg"></i>
            </div>
            <span className="text-xs text-blue-500 mt-1">Inicio</span>
          </Link>
          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-pie-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Nutrición</span>
          </Link>
          <Link href="/food-search" className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="ri-add-line text-white text-lg"></i>
            </div>
          </Link>
          <Link href="/reports" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-line-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

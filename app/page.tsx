
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ActivityItem {
  type: string;
  name: string;
  calories: number | null;
  time: string;
  icon: string;
  color: string;
}

interface Profile {
  full_name: string;
  daily_protein_goal?: number;
  daily_carbs_goal?: number;
  daily_fats_goal?: number;
  daily_calories_goal?: number;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyStats, setDailyStats] = useState({
    calories: { consumed: 0, target: 2100 },
    protein: { consumed: 0, target: 120 },
    carbs: { consumed: 0, target: 230 },
    fats: { consumed: 0, target: 80 },
    water: { consumed: 0, target: 8 },
    fiber: { consumed: 0, target: 25 }
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadDailyStats();
      loadRecentActivity();
    }
    setIsLoading(false);
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadProfile = async () => {
    try {
      if (!user) return;

      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          daily_calories_goal: 2100,
          daily_protein_goal: 120,
          daily_carbs_goal: 230,
          daily_fats_goal: 80
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creando perfil:', createError);
        } else {
          setProfile(createdProfile);
        }
      } else if (!error && profileData) {
        setProfile(profileData);
      } else {
        console.error('Error cargando perfil:', error);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const loadDailyStats = async () => {
    try {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data: nutritionData, error } = await supabase
        .from('daily_nutrition')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (!error && nutritionData) {
        setDailyStats({
          calories: { consumed: nutritionData.total_calories || 0, target: profile?.daily_calories_goal || 2100 },
          protein: { consumed: nutritionData.total_protein || 0, target: profile?.daily_protein_goal || 120 },
          carbs: { consumed: nutritionData.total_carbs || 0, target: profile?.daily_carbs_goal || 230 },
          fats: { consumed: nutritionData.total_fats || 0, target: profile?.daily_fats_goal || 80 },
          water: { consumed: 0, target: 8 },
          fiber: { consumed: 0, target: 25 }
        });
      } else {
        setDailyStats({
          calories: { consumed: 0, target: profile?.daily_calories_goal || 2100 },
          protein: { consumed: 0, target: profile?.daily_protein_goal || 120 },
          carbs: { consumed: 0, target: profile?.daily_carbs_goal || 230 },
          fats: { consumed: 0, target: profile?.daily_fats_goal || 80 },
          water: { consumed: 0, target: 8 },
          fiber: { consumed: 0, target: 25 }
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      if (!user) return;

      const activities: ActivityItem[] = [];
      const today = new Date().toISOString().split('T')[0];

      const { data: foodEntries, error: foodError } = await supabase
        .from('food_entries')
        .select(`
          *,
          foods_database (name, calories_per_100g)
        `)
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!foodError && foodEntries) {
        foodEntries.forEach((entry: any) => {
          const calories = Math.round((entry.quantity / 100) * (entry.foods_database?.calories_per_100g || 0));
          activities.push({
            type: 'meal',
            name: entry.foods_database?.name || 'Alimento',
            calories: calories,
            time: new Date(entry.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            icon: 'ri-restaurant-line',
            color: 'bg-green-100 text-green-600'
          });
        });
      }

      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(2);

      if (!workoutError && workouts) {
        workouts.forEach((workout: any) => {
          activities.push({
            type: 'workout',
            name: workout.workout_name || 'Entrenamiento',
            calories: workout.calories_burned,
            time: new Date(workout.workout_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            icon: 'ri-run-line',
            color: 'bg-purple-100 text-purple-600'
          });
        });
      }

      if (activities.length < 3) {
        activities.push({
          type: 'water',
          name: 'Hidratación',
          calories: null,
          time: 'Hace 1 hora',
          icon: 'ri-drop-line',
          color: 'bg-blue-100 text-blue-600'
        });
      }

      setRecentActivity(activities.slice(0, 3));
    } catch (error) {
      console.error('Error cargando actividad reciente:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-[\'Pacifico\'] text-blue-600">ProFitness</h1>
          <Link href="/profile" className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || <i className="ri-user-line"></i>}
            </span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            ¡Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'}!
          </h2>
          <p className="text-gray-600">Continúa con tus metas de hoy</p>
        </div>

        {/* Daily Progress Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-fire-line text-orange-500 text-sm"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">Calorías</p>
                <p className="text-lg font-bold text-gray-800">{Math.round(dailyStats.calories.consumed)}</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full"
                style={{ width: `${Math.min((dailyStats.calories.consumed / dailyStats.calories.target) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Meta: {dailyStats.calories.target} kcal</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-drop-line text-blue-500 text-sm"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">Agua</p>
                <p className="text-lg font-bold text-gray-800">{dailyStats.water.consumed} vasos</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                style={{ width: `${(dailyStats.water.consumed / dailyStats.water.target) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Meta: {dailyStats.water.target} vasos</p>
          </div>
        </div>

        {/* Macros Overview */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Macronutrientes de hoy</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Proteínas</span>
                <span className="text-sm font-medium">{dailyStats.protein.consumed.toFixed(1)}g / {dailyStats.protein.target}g</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full"
                  style={{ width: `${Math.min((dailyStats.protein.consumed / dailyStats.protein.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Carbohidratos</span>
                <span className="text-sm font-medium">{dailyStats.carbs.consumed.toFixed(1)}g / {dailyStats.carbs.target}g</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min((dailyStats.carbs.consumed / dailyStats.carbs.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Grasas</span>
                <span className="text-sm font-medium">{dailyStats.fats.consumed.toFixed(1)}g / {dailyStats.fats.target}g</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                  style={{ width: `${Math.min((dailyStats.fats.consumed / dailyStats.fats.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/food" className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-restaurant-line text-green-600 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-800">Agregar Comida</p>
            </div>
          </Link>

          <Link href="/hydration" className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-drop-line text-blue-600 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-800">Registrar Hidratación</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/workout" className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-run-line text-purple-600 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-800">Registrar Ejercicio</p>
            </div>
          </Link>

          <Link href="/weight" className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-scales-3-line text-indigo-600 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-800">Registrar Peso</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">No hay actividad reciente</p>
              <p className="text-gray-400 text-xs">Empieza registrando tu primera comida</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 ${activity.color} rounded-lg flex items-center justify-center mr-3`}>
                    <i className={`${activity.icon} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.name}</p>
                    <p className="text-xs text-gray-500">
                      {activity.time} {activity.calories && `• ${activity.calories} kcal`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-0 py-0">
        <div className="grid grid-cols-5 h-16">
          <Link href="/" className="flex flex-col items-center justify-center bg-blue-50">
            <i className="ri-home-fill text-blue-600 text-lg"></i>
            <span className="text-xs text-blue-600 mt-1">Inicio</span>
          </Link>
          <Link href="/food" className="flex flex-col items-center justify-center">
            <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Comida</span>
          </Link>
          <Link href="/workout" className="flex flex-col items-center justify-center">
            <i className="ri-run-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Ejercicio</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center justify-center">
            <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center">
            <i className="ri-user-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </div>

      {/* FAB for Quick Add */}
      <Link href="/food/add" className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
        <i className="ri-add-fill text-white text-xl"></i>
      </Link>
    </div>
  );
}

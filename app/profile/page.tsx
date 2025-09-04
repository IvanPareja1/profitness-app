'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    email: '',
    age: 0,
    height: 0,
    current_weight: 0,
    target_weight: 0,
    goal_type: '',
    activity_level: '',
    daily_calories_goal: 2100
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Días activos', value: '0', icon: 'ri-calendar-check-line', color: 'bg-green-100 text-green-600' },
    { label: 'Peso perdido', value: '0 kg', icon: 'ri-scales-3-line', color: 'bg-blue-100 text-blue-600' },
    { label: 'Entrenamientos', value: '0', icon: 'ri-run-line', color: 'bg-purple-100 text-purple-600' },
    { label: 'Calorías', value: '0k', icon: 'ri-fire-line', color: 'bg-orange-100 text-orange-600' }
  ]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadProfile();
    }
    setIsLoading(false);
  };

  const loadProfile = async () => {
    try {
      if (!user) return;

      // Consultar directamente la tabla user_profiles
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // El perfil no existe, crearlo con datos del usuario
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          daily_calories_goal: 2100,
          daily_protein_goal: 120,
          daily_carbs_goal: 230,
          daily_fats_goal: 80,
          age: user.user_metadata?.age || 25,
          height: user.user_metadata?.height || 170,
          current_weight: user.user_metadata?.weight || 70,
          target_weight: user.user_metadata?.target_weight || 65,
          goal_type: 'lose_weight',
          activity_level: 'moderate',
          gender: user.user_metadata?.gender || 'other'
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creando perfil:', createError);
        } else {
          setUserProfile(createdProfile);
          loadStats();
        }
      } else if (!error && profileData) {
        setUserProfile(profileData);
        loadStats();
      } else {
        console.error('Error cargando perfil:', error);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const loadStats = async () => {
    try {
      if (!user) return;

      // Cargar estadísticas reales de la base de datos
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user?.id);

      const { data: weightRecords } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('recorded_at', { ascending: true });

      const { data: dailyNutrition } = await supabase
        .from('daily_nutrition')
        .select('total_calories')
        .eq('user_id', user?.id);

      // Calcular estadísticas
      const totalWorkouts = workouts?.length || 0;
      const totalCalories = dailyNutrition?.reduce((sum, day) => sum + (day.total_calories || 0), 0) || 0;
      const weightLost = (weightRecords && weightRecords.length >= 2) 
        ? (weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight).toFixed(1)
        : '0.0';

      // Días activos (aproximado basado en registros)
      const activeDays = Math.min(23, Math.max(totalWorkouts, dailyNutrition?.length || 0));

      setStats([
        { label: 'Días activos', value: activeDays.toString(), icon: 'ri-calendar-check-line', color: 'bg-green-100 text-green-600' },
        { label: 'Peso perdido', value: `${weightLost} kg`, icon: 'ri-scales-3-line', color: 'bg-blue-100 text-blue-600' },
        { label: 'Entrenamientos', value: totalWorkouts.toString(), icon: 'ri-run-line', color: 'bg-purple-100 text-purple-600' },
        { label: 'Calorías', value: `${(totalCalories / 1000).toFixed(1)}k`, icon: 'ri-fire-line', color: 'bg-orange-100 text-orange-600' }
      ]);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const getGoalText = (goalType: string) => {
    switch (goalType) {
      case 'lose_weight': return 'Perder peso';
      case 'gain_muscle': return 'Ganar músculo';
      case 'maintain_weight': return 'Mantener peso';
      default: return 'Sin objetivo definido';
    }
  };

  const getActivityText = (activityLevel: string) => {
    switch (activityLevel) {
      case 'sedentary': return 'Sedentario';
      case 'light': return 'Ligeramente activo';
      case 'moderate': return 'Moderadamente activo';
      case 'active': return 'Muy activo';
      case 'very_active': return 'Extremadamente activo';
      default: return 'No definido';
    }
  };

  // Calcular IMC
  const calculateBMI = () => {
    if (userProfile.height > 0 && userProfile.current_weight > 0) {
      return (userProfile.current_weight / Math.pow(userProfile.height / 100, 2)).toFixed(1);
    }
    return '0.0';
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  };

  const menuItems = [
    { icon: 'ri-user-settings-line', title: 'Editar Perfil', subtitle: 'Actualizar información personal', href: '/profile/edit' },
    { icon: 'ri-target-line', title: 'Objetivos', subtitle: 'Configurar metas nutricionales', href: '/profile/goals' },
    { icon: 'ri-scales-3-line', title: 'Control de Peso', subtitle: 'Registrar y seguir peso', href: '/weight' },
    { icon: 'ri-drop-line', title: 'Hidratación', subtitle: 'Registrar consumo de líquidos', href: '/hydration' },
    { icon: 'ri-zzz-line', title: 'Días de Descanso', subtitle: 'Configurar días sin entrenamiento', href: '/rest-day' },
    { icon: 'ri-notification-line', title: 'Notificaciones', subtitle: 'Recordatorios y alertas', href: '/profile/notifications' },
    { icon: 'ri-pie-chart-line', title: 'Exportar Datos', subtitle: 'Descargar tu información', href: '/profile/export' },
    { icon: 'ri-shield-check-line', title: 'Privacidad', subtitle: 'Configuración de privacidad', href: '/profile/privacy' },
    { icon: 'ri-question-line', title: 'Ayuda y Soporte', subtitle: 'FAQ y contacto', href: '/profile/help' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-line text-pink-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-4">Para acceder a tu perfil necesitas una cuenta</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const bmiValue = parseFloat(calculateBMI());

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Mi Perfil</h1>
          <Link href="/profile/edit" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-settings-line text-gray-600 text-lg"></i>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl font-bold">
                {userProfile.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{userProfile.full_name || 'Usuario'}</h2>
              <p className="text-sm text-gray-600">{userProfile.email || user.email}</p>
              <p className="text-xs text-gray-500">Miembro activo</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{userProfile.current_weight || 0} kg</p>
              <p className="text-xs text-gray-500">Peso Actual</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{userProfile.height || 0} cm</p>
              <p className="text-xs text-gray-500">Altura</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{calculateBMI()}</p>
              <p className="text-xs text-gray-500">IMC</p>
            </div>
          </div>

          {bmiValue > 0 && (
            <div className="mt-4 p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">IMC: {getBMICategory(bmiValue)}</p>
                  <p className="text-xs text-gray-600">Valor: {calculateBMI()}</p>
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${Math.min((bmiValue / 35) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-pink-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Meta Actual</p>
                <p className="text-xs text-gray-600">
                  {getGoalText(userProfile.goal_type)} • {getActivityText(userProfile.activity_level)}
                </p>
              </div>
              <Link href="/profile/goals" className="text-pink-600 text-xs font-medium">
                Cambiar
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mr-3`}>
                  <i className={`${stat.icon} text-sm`}></i>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className={`flex items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <i className={`${item.icon} text-gray-600 text-sm`}></i>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>
          ))}
        </div>

        {/* Sign Out */}
        <div className="mt-6">
          <button 
            onClick={handleSignOut}
            className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-medium"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">ProFitness v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Hecho con ❤️ para tu salud</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-0 py-0">
        <div className="grid grid-cols-5 h-16">
          <Link href="/" className="flex flex-col items-center justify-center">
            <i className="ri-home-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Inicio</span>
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
          <Link href="/profile" className="flex flex-col items-center justify-center bg-pink-50">
            <i className="ri-user-fill text-pink-600 text-lg"></i>
            <span className="text-xs text-pink-600 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
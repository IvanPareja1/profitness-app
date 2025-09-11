import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '../../hooks/useAuth';

interface DayTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  quantity: number;
  unit: string;
  meal_type: string;
  created_at: string;
}

interface TodayGoals {
  daily_calories: number;
  daily_exercise_minutes: number;
  is_rest_day: boolean;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayTotals, setDayTotals] = useState<DayTotals>({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);
  const [exerciseStats, setExerciseStats] = useState({ totalDuration: 0, totalCalories: 0, totalExercises: 0 });
  const [todayGoals, setTodayGoals] = useState<TodayGoals>({ daily_calories: 2200, daily_exercise_minutes: 60, is_rest_day: false });
  const [loading, setLoading] = useState(false);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

    useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const callSupabaseFunction = async (functionName: string, options: any = {}) => {
    console.log('🔍 Llamando a:', functionName);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No authenticated session');

    const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };


 const loadDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    // Cargar datos del perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.warn('Error cargando perfil:', profileError);
    }

    let goalsData, mealsData, exercisesData;

    try {
      goalsData = await callSupabaseFunction(`goals/today?date=${selectedDate}`);
      setTodayGoals(goalsData.goals);
    } catch (e) {
      console.warn('Error cargando goals:', e);
    }

    try {
      mealsData = await callSupabaseFunction(`meals?date=${selectedDate}`);
      setDayTotals(mealsData?.totals || { calories: 0, carbs: 0, protein: 0, fat: 0 });
      setRecentMeals((mealsData?.meals || []).slice(0, 3));
    } catch (e) {
      console.warn('Error cargando meals:', e);
    }

    try {
      exercisesData = await callSupabaseFunction(`exercises?date=${selectedDate}`);
      setExerciseStats({
        totalDuration: exercisesData?.totals?.totalDuration || 0,
        totalCalories: exercisesData?.totals?.totalCalories || 0,
        totalExercises: exercisesData?.totals?.totalExercises || 0
      });
    } catch (e) {
      console.warn('Error cargando exercises:', e);
    }

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    setError('Error cargando datos: ' + (error as Error).message);
  } finally {
    setLoading(false);
  }
};


  const debouncedLoadDashboard = debounce(loadDashboardData, 500);

      // ✅ useEffect para user.id
  useEffect(() => {
    if (user?.id) {
      debouncedLoadDashboard();
    }
  }, [user?.id]);

  // ✅ useEffect para selectedDate
  useEffect(() => {
    if (user?.id) {
      debouncedLoadDashboard();
    }
  }, [selectedDate, user?.id]);


useEffect(() => {
  if (user && (dayTotals.calories > 0 || exerciseStats.totalDuration > 0)) {
    console.log('📊 Actualizando achievements...');
    
    const updateAchievements = async () => {
      try {
        await callSupabaseFunction('goals/achievement', {
          method: 'PUT',
          body: {
            date: selectedDate,
            calories_achieved: dayTotals.calories,
            protein_achieved: dayTotals.protein,
            carbs_achieved: dayTotals.carbs,
            fat_achieved: dayTotals.fat,
            exercise_achieved: exerciseStats.totalDuration,
            water_achieved: 0,
            streak_maintained: true
          }
        });
        console.log('✅ Achievements actualizados');
      } catch (error) {
        console.error('Error updating achievements:', error);
      }
    };
    
    updateAchievements(); 
  }
}, [dayTotals, exerciseStats.totalDuration, selectedDate, user]);

  const calorieProgress = Math.min((dayTotals.calories / todayGoals.daily_calories) * 100, 100);
  const exerciseProgress = Math.min((exerciseStats.totalDuration / todayGoals.daily_exercise_minutes) * 100, 100);

  const getMealTypeIcon = (mealTime: string) => {
    const hour = new Date(mealTime).getHours();
    if (hour >= 5 && hour < 12) return 'ri-sun-line';
    if (hour >= 12 && hour < 17) return 'ri-sun-fill';
    return 'ri-moon-line';
  };

  const getMealTypeName = (mealTime: string) => {
    const hour = new Date(mealTime).getHours();
    if (hour >= 5 && hour < 12) return 'Desayuno';
    if (hour >= 12 && hour < 17) return 'Almuerzo';
    return 'Cena';
  };

 if (authLoading) {
  return (
    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  );
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {error && (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
    <span className="block sm:inline">{error}</span>
    <button onClick={() => setError(null)} className="ml-4">×</button>
  </div>
)}
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800" style={{fontFamily: 'Pacifico, serif'}}>ProFitness</h1>
              <p className="text-xs text-gray-600">Tu progreso diario</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-white text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* Date Selector */}
        <div className="mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 bg-white rounded-xl shadow-sm border-none text-gray-700"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            {/* Progress Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-restaurant-line text-green-600"></i>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Calorías</span>
                    {todayGoals.is_rest_day && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full" title="Día de descanso - Meta ajustada"></div>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-lg font-bold text-gray-800">{dayTotals.calories.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    de {todayGoals.daily_calories.toLocaleString()} kcal
                    {todayGoals.is_rest_day && <span className="text-purple-600 ml-1">(ajustado)</span>}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${calorieProgress}%`}}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-run-line text-blue-600"></i>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Ejercicio</span>
                    {todayGoals.is_rest_day && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full" title="Día de descanso - Meta ajustada"></div>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-lg font-bold text-gray-800">{exerciseStats.totalDuration}</div>
                  <div className="text-xs text-gray-500">
                    de {todayGoals.daily_exercise_minutes} min
                    {todayGoals.is_rest_day && <span className="text-purple-600 ml-1">(descanso)</span>}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${todayGoals.is_rest_day ? 'bg-purple-400' : 'bg-blue-500'}`} 
                    style={{width: `${exerciseProgress}%`}}
                  ></div>
                </div>
              </div>
            </div>

            {/* Rest Day Indicator */}
            {todayGoals.is_rest_day && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="ri-calendar-check-line text-purple-600"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-purple-800 text-sm">Día de descanso</div>
                    <div className="text-xs text-purple-600 mt-1">
                      Tus metas se han ajustado automáticamente. Enfócate en la recuperación.
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/goals')}
                    className="text-purple-600 text-xs font-medium"
                  >
                    Configurar
                  </button>
                </div>
              </div>
            )}

            {/* Stats Overview */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Resumen del día</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="ri-fire-line text-orange-600 text-sm"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{exerciseStats.totalCalories}</div>
                  <div className="text-xs text-gray-500">kcal quemadas</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="ri-trophy-line text-purple-600 text-sm"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{exerciseStats.totalExercises}</div>
                  <div className="text-xs text-gray-500">ejercicios</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="ri-restaurant-line text-green-600 text-sm"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{recentMeals.length}</div>
                  <div className="text-xs text-gray-500">comidas</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="ri-heart-pulse-line text-blue-600 text-sm"></i>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{Math.round(calorieProgress)}%</div>
                  <div className="text-xs text-gray-500">objetivo</div>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Macronutrientes</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-red-600 font-bold text-sm">C</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{dayTotals.carbs.toFixed(1)}g</div>
                  <div className="text-xs text-gray-500">Carbohidratos</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-yellow-600 font-bold text-sm">P</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{dayTotals.protein.toFixed(1)}g</div>
                  <div className="text-xs text-gray-500">Proteínas</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold text-sm">G</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{dayTotals.fat.toFixed(1)}g</div>
                  <div className="text-xs text-gray-500">Grasas</div>
                </div>
              </div>
            </div>

            {/* Recent Meals */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Comidas de hoy</h3>
                <button 
                  onClick={() => navigate('/nutrition')}
                  className="text-green-600 text-sm font-medium"
                >
                  Ver todas
                </button>
              </div>
              
              {recentMeals.length === 0 ? (
                <div className="text-center py-6">
                  <i className="ri-restaurant-line text-3xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500 text-sm">No hay comidas registradas</p>
                  <button 
                    onClick={() => navigate('/nutrition')}
                    className="text-green-600 text-sm font-medium mt-2"
                  >
                    Añadir primera comida
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMeals.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <i className={`${getMealTypeIcon(meal.created_at)} text-green-600`}></i>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{meal.name}</div>
                          <div className="text-xs text-gray-500">
                            {getMealTypeName(meal.created_at)} • {new Date(meal.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">{meal.calories} kcal</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/nutrition')}
                className="bg-gradient-to-r from-green-400 to-green-5    00 text-white p-4 rounded-xl shadow-sm flex items-center justify-center space-x-2"
              >
                <i className="ri-add-line text-lg"></i>
                <span className="font-medium">Añadir comida</span>
              </button>
              <button 
                onClick={() => navigate('/exercise')}
                className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-xl shadow-sm flex items-center justify-center space-x-2"
              >
                <i className="ri-play-line text-lg"></i>
                <span className="font-medium">Nuevo ejercicio</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button className="flex flex-col items-center justify-center space-y-1 bg-green-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-dashboard-3-fill text-green-600 text-lg"></i>
            </div>
            <span className="text-xs text-green-600 font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => navigate('/nutrition')}
            className="flex flex-col items-center justify-center space-y-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Nutrición</span>
          </button>
          <button 
            onClick={() => navigate('/exercise')}
            className="flex flex-col items-center justify-center space-y-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-run-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Ejercicio</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center justify-center space-y-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

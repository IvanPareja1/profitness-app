'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WorkoutHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    avgDuration: 0
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadWorkoutHistory();
    }
  }, [user, selectedPeriod]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadWorkoutHistory();
    }
    setIsLoading(false);
  };

  const loadWorkoutHistory = async () => {
    try {
      if (!user) return;

      let query = supabase
        .from('workouts')
        .select('*, workout_exercises(*)')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false });

      // Filtrar por período
      if (selectedPeriod !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (selectedPeriod) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3months':
            startDate.setMonth(now.getMonth() - 3);
            break;
        }

        query = query.gte('workout_date', startDate.toISOString().split('T')[0]);
      }

      const { data: workoutsData, error } = await query;

      if (error) {
        console.error('Error cargando entrenamientos:', error);
        return;
      }

      setWorkouts(workoutsData || []);

      // Calcular estadísticas
      const totalWorkouts = workoutsData?.length || 0;
      const totalMinutes = workoutsData?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
      const totalCalories = workoutsData?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0;
      const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

      setTotalStats({
        totalWorkouts,
        totalMinutes,
        totalCalories,
        avgDuration
      });

    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm('¿Estás seguro de eliminar este entrenamiento?')) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) {
        throw error;
      }

      alert('✅ Entrenamiento eliminado correctamente');
      loadWorkoutHistory();
    } catch (error) {
      console.error('Error eliminando entrenamiento:', error);
      alert('❌ Error al eliminar entrenamiento');
    }
  };

  const periods = [
    { id: 'all', name: 'Todo' },
    { id: 'week', name: 'Última semana' },
    { id: 'month', name: 'Último mes' },
    { id: '3months', name: 'Últimos 3 meses' }
  ];

  const getWorkoutIcon = (workoutName: string) => {
    const name = workoutName.toLowerCase();
    if (name.includes('cardio') || name.includes('hiit')) return 'ri-heart-pulse-line';
    if (name.includes('fuerza') || name.includes('peso')) return 'ri-dumbbell-line';
    if (name.includes('yoga') || name.includes('estiramiento')) return 'ri-leaf-line';
    return 'ri-run-line';
  };

  const getWorkoutColor = (workoutName: string) => {
    const name = workoutName.toLowerCase();
    if (name.includes('cardio') || name.includes('hiit')) return 'bg-red-100 text-red-600';
    if (name.includes('fuerza') || name.includes('peso')) return 'bg-purple-100 text-purple-600';
    if (name.includes('yoga') || name.includes('estiramiento')) return 'bg-green-100 text-green-600';
    return 'bg-blue-100 text-blue-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-history-line text-purple-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-4">Para ver tu historial necesitas una cuenta</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/workout" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Historial de Entrenamientos</h1>
          <div className="w-8 h-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Period Filter */}
        <div className="bg-white rounded-2xl p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-4 gap-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedPeriod === period.id
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen de Entrenamientos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-trophy-line text-purple-600 text-sm"></i>
              </div>
              <p className="text-xl font-bold text-gray-800">{totalStats.totalWorkouts}</p>
              <p className="text-xs text-gray-600">Entrenamientos</p>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-timer-line text-blue-600 text-sm"></i>
              </div>
              <p className="text-xl font-bold text-gray-800">{totalStats.totalMinutes}</p>
              <p className="text-xs text-gray-600">Minutos totales</p>
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-fire-line text-orange-600 text-sm"></i>
              </div>
              <p className="text-xl font-bold text-gray-800">{totalStats.totalCalories.toLocaleString()}</p>
              <p className="text-xs text-gray-600">kcal quemadas</p>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-bar-chart-line text-green-600 text-sm"></i>
              </div>
              <p className="text-xl font-bold text-gray-800">{totalStats.avgDuration}</p>
              <p className="text-xs text-gray-600">min promedio</p>
            </div>
          </div>
        </div>

        {/* Workout History List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Entrenamientos Registrados</h3>
          </div>

          {workouts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-run-line text-gray-400 text-2xl"></i>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Sin entrenamientos</h4>
              <p className="text-gray-600 mb-4">No tienes entrenamientos registrados en este período</p>
              <Link 
                href="/workout"
                className="inline-block bg-purple-500 text-white px-6 py-3 rounded-xl font-medium"
              >
                Iniciar Entrenamiento
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {workouts.map((workout, index) => (
                <div key={workout.id} className="p-5 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${getWorkoutColor(workout.workout_name)} rounded-2xl flex items-center justify-center mr-4`}>
                        <i className={`${getWorkoutIcon(workout.workout_name)} text-lg`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{workout.workout_name}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(workout.workout_date).toLocaleDateString('es-ES', { 
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            <i className="ri-timer-line mr-1"></i>
                            {workout.duration_minutes} min
                          </span>
                          <span className="text-xs text-gray-500">
                            <i className="ri-fire-line mr-1"></i>
                            {workout.calories_burned} kcal
                          </span>
                          {workout.workout_exercises && workout.workout_exercises.length > 0 && (
                            <span className="text-xs text-gray-500">
                              <i className="ri-list-check mr-1"></i>
                              {workout.workout_exercises.length} ejercicios
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => deleteWorkout(workout.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </div>

                  {/* Workout Exercises */}
                  {workout.workout_exercises && workout.workout_exercises.length > 0 && (
                    <div className="mt-4 pl-16">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Ejercicios realizados:</h5>
                        <div className="space-y-1">
                          {workout.workout_exercises.slice(0, 3).map((exercise: any, idx: any) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-gray-600">
                              <span>{exercise.exercise_name}</span>
                              <span>
                                {exercise.sets && exercise.reps && `${exercise.sets} × ${exercise.reps}`}
                                {exercise.duration_minutes && ` • ${exercise.duration_minutes} min`}
                              </span>
                            </div>
                          ))}
                          {workout.workout_exercises.length > 3 && (
                            <div className="text-xs text-gray-500 text-center mt-1">
                              +{workout.workout_exercises.length - 3} ejercicios más
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
          <Link href="/workout" className="flex flex-col items-center justify-center bg-purple-50">
            <i className="ri-run-fill text-purple-600 text-lg"></i>
            <span className="text-xs text-purple-600 mt-1">Ejercicio</span>
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
    </div>
  );
}
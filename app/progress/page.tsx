
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [progressData, setProgressData] = useState({
    weight: { current: 70, change: 0, unit: 'kg', data: [70, 69.8, 69.5, 69.3, 69.1, 69.0, 68.8], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] },
    calories: { current: 0, change: 0, unit: 'kcal', data: [0, 0, 0, 0, 0, 0, 0], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] },
    workouts: { current: 0, change: 0, unit: 'entrenamientos', data: [0, 0, 0, 0, 0, 0, 0], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] },
    water: { current: 2.1, change: +0.2, unit: 'L', data: [1.8, 2.0, 2.2, 1.9, 2.1, 2.3, 2.1], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] }
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [weeklyStats] = useState({
    activeDays: 5,
    totalCalories: 2450,
    totalMinutes: 180,
    avgHeartRate: 145
  });

  const [monthlyGoals] = useState([
    { name: 'Perder peso', current: 2.5, target: 5, unit: 'kg', color: 'blue' },
    { name: 'Entrenamientos', current: 12, target: 16, unit: '', color: 'purple' },
    { name: 'Minutos activos', current: 520, target: 800, unit: ' min', color: 'green' }
  ]);

  const [achievements] = useState([
    {
      title: 'Primera semana completa',
      description: '7 días consecutivos de ejercicio',
      completed: true,
      date: '15 Ene',
      icon: 'ri-trophy-line',
      color: 'bg-yellow-100 text-yellow-600',
      progress: 100
    },
    {
      title: 'Meta de peso',
      description: 'Perder 5kg en 2 meses',
      completed: false,
      icon: 'ri-scales-3-line',
      color: 'bg-blue-100 text-blue-600',
      progress: 60
    },
    {
      title: '1000 kcal quemadas',
      description: 'En un solo día',
      completed: false,
      icon: 'ri-fire-line',
      color: 'bg-red-100 text-red-600',
      progress: 45
    }
  ]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user, selectedPeriod]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadProgressData();
    }
    setIsLoading(false);
  };

  const loadProgressData = async () => {
    try {
      if (!user) return;

      // Cargar peso directamente
      const { data: weightData } = await supabase
        .from('weight_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(7);

      // Cargar calorías diarias
      const { data: nutritionData } = await supabase
        .from('daily_nutrition')
        .select('total_calories, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      // Cargar entrenamientos
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(30);

      // Procesar datos de peso
      let weightStats = { current: 70, change: 0, unit: 'kg', data: [70, 69.8, 69.5, 69.3, 69.1, 69.0, 68.8], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] };

      if (weightData && weightData.length > 0) {
        const weights = weightData.slice(0, 7).reverse();
        const current = weightData[0].weight;
        const previous = weightData[1]?.weight || current;

        weightStats = {
          current,
          change: current - previous,
          unit: 'kg',
          data: weights.map((w: any) => w.weight),
          labels: weights.map((w: any) => new Date(w.recorded_at).toLocaleDateString('es-ES', { weekday: 'short' }))
        };
      }

      // Procesar datos de calorías
      let caloriesStats = { current: 0, change: 0, unit: 'kcal', data: [0, 0, 0, 0, 0, 0, 0], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] };

      if (nutritionData && nutritionData.length > 0) {
        const current = nutritionData[0]?.total_calories || 0;
        caloriesStats.current = current;

        const caloriesArray = nutritionData.slice(0, 7).reverse();
        caloriesStats.data = caloriesArray.map((n: any) => n.total_calories || 0);
        caloriesStats.labels = caloriesArray.map((n: any) => new Date(n.date).toLocaleDateString('es-ES', { weekday: 'short' }));
      }

      // Procesar datos de entrenamientos
      let workoutsStats = { current: 0, change: 0, unit: 'entrenamientos', data: [0, 0, 0, 0, 0, 0, 0], labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] };

      if (workoutData && workoutData.length > 0) {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const thisWeekWorkouts = workoutData.filter((w: any) =>
          new Date(w.workout_date) >= weekAgo
        );

        workoutsStats.current = thisWeekWorkouts.length;

        // Distribuir entrenamientos por día
        const workoutsByDay = Array(7).fill(0);
        thisWeekWorkouts.forEach((workout: any) => {
          const dayIndex = new Date(workout.workout_date).getDay();
          workoutsByDay[dayIndex === 0 ? 6 : dayIndex - 1]++; // Ajustar para que lunes sea 0
        });

        workoutsStats.data = workoutsByDay;
      }

      // Datos de hidratación (placeholder - sin datos reales aún)
      const waterStats = {
        current: 2.1,
        change: +0.2,
        unit: 'L',
        data: [1.8, 2.0, 2.2, 1.9, 2.1, 2.3, 2.1],
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      };

      setProgressData({
        weight: weightStats,
        calories: caloriesStats,
        workouts: workoutsStats,
        water: waterStats
      });

    } catch (error) {
      console.error('Error cargando datos de progreso:', error);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);

    try {
      // Simular proceso de exportación
      await new Promise(resolve => setTimeout(resolve, 2000));

      // En una implementación real, aquí generarías y descargarías el archivo
      const dataToExport = {
        user_profile: user.user_metadata,
        progress_data: progressData,
        export_date: new Date().toISOString(),
        weekly_stats: weeklyStats,
        monthly_goals: monthlyGoals,
        achievements: achievements
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `profitness-data-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      alert('✅ Datos exportados correctamente');
    } catch (error) {
      console.error('Error exportando datos:', error);
      alert('❌ Error al exportar datos. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const periods = [
    { id: 'week', name: '7 días' },
    { id: 'month', name: '30 días' },
    { id: 'year', name: '1 año' }
  ];

  const metrics = [
    { id: 'weight', name: 'Peso', icon: 'ri-scales-3-line', color: 'text-blue-600' },
    { id: 'calories', name: 'Calorías', icon: 'ri-fire-line', color: 'text-orange-600' },
    { id: 'workouts', name: 'Ejercicios', icon: 'ri-run-line', color: 'text-purple-600' },
    { id: 'water', name: 'Hidratación', icon: 'ri-drop-line', color: 'text-cyan-600' }
  ];

  const currentStats = progressData[selectedMetric as keyof typeof progressData];

  const renderChart = () => {
    const maxValue = Math.max(...currentStats.data);
    const minValue = Math.min(...currentStats.data);

    return (
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">{metrics.find(m => m.id === selectedMetric)?.name}</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              {typeof currentStats.current === 'number' ? currentStats.current.toFixed(selectedMetric === 'weight' ? 1 : 0) : currentStats.current}
            </p>
            <p className={`text-sm ${currentStats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentStats.change >= 0 ? '+' : ''}{currentStats.change.toFixed(1)} {currentStats.unit}
            </p>
          </div>
        </div>

        {/* Simple Chart */}
        <div className="h-32 flex items-end justify-between mb-2">
          {currentStats.data.map((value, index) => {
            const height = maxValue > 0 ? ((value - minValue) / (maxValue - minValue)) * 100 : 10;
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-8 bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-md"
                  style={{ height: `${Math.max(height, 10)}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {currentStats.labels[index] || `D${index + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-bar-chart-line text-indigo-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-4">Para ver tu progreso necesitas una cuenta</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Mi Progreso</h1>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="w-8 h-8 flex items-center justify-center"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <i className="ri-download-line text-gray-600 text-lg"></i>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Period Selection */}
        <div className="bg-white rounded-2xl p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-3 gap-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedPeriod === period.id
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-3 rounded-2xl border transition-all ${
                selectedMetric === metric.id
                  ? 'bg-white border-indigo-200 shadow-sm'
                  : 'bg-white/50 border-gray-100 hover:bg-white'
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  selectedMetric === metric.id ? 'bg-indigo-100' : 'bg-gray-100'
                }`}
              >
                <i
                  className={`${metric.icon} text-sm ${
                    selectedMetric === metric.id ? 'text-indigo-600' : 'text-gray-600'
                  }`}
                ></i>
              </div>
              <p className="text-xs font-medium text-gray-800">{metric.name}</p>
            </button>
          ))}
        </div>

        {/* Chart */}
        {renderChart()}

        {/* Weekly Summary */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen Semanal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-trophy-line text-green-600 text-sm"></i>
              </div>
              <p className="text-lg font-bold text-gray-800">{weeklyStats.activeDays}/7</p>
              <p className="text-xs text-gray-600">Días activos</p>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-fire-line text-blue-600 text-sm"></i>
              </div>
              <p className="text-lg font-bold text-gray-800">{weeklyStats.totalCalories.toLocaleString()}</p>
              <p className="text-xs text-gray-600">kcal quemadas</p>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-timer-line text-purple-600 text-sm"></i>
              </div>
              <p className="text-lg font-bold text-gray-800">{weeklyStats.totalMinutes}</p>
              <p className="text-xs text-gray-600">min ejercicio</p>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <i className="ri-heart-pulse-line text-orange-600 text-sm"></i>
              </div>
              <p className="text-lg font-bold text-gray-800">{weeklyStats.avgHeartRate}</p>
              <p className="text-xs text-gray-600">bpm promedio</p>
            </div>
          </div>
        </div>

        {/* Progress Goals */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Metas del Mes</h3>
            <Link href="/profile/goals" className="text-indigo-600 text-sm font-medium">
              Editar
            </Link>
          </div>

          <div className="space-y-4">
            {monthlyGoals.map((goal, index) => {
              const percentage = Math.min((goal.current / goal.target) * 100, 100);
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">{goal.name}</span>
                    <span className={`text-sm text-${goal.color}-600`}>
                      {goal.current.toFixed(1)}{goal.unit} / {goal.target}{goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${goal.color}-500 h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Logros</h3>
            <span className="text-sm text-gray-500">
              {achievements.filter(a => a.completed).length}/{achievements.length}
            </span>
          </div>

          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-xl">
                <div
                  className={`w-10 h-10 ${achievement.color} rounded-lg flex items-center justify-center mr-3`}
                >
                  <i className={`${achievement.icon} text-sm`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{achievement.title}</p>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                  {!achievement.completed && achievement.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-indigo-500 h-1 rounded-full"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {achievement.completed ? (
                    <div>
                      <i className="ri-check-line text-green-600 text-lg"></i>
                      <p className="text-xs text-gray-500">{achievement.date}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">{Math.round(achievement.progress)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
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
          <Link href="/progress" className="flex flex-col items-center justify-center bg-indigo-50">
            <i className="ri-bar-chart-fill text-indigo-600 text-lg"></i>
            <span className="text-xs text-indigo-600 mt-1">Progreso</span>
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


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '../../hooks/useAuth';

interface ProgressData {
  date: string;
  calories_achieved: number;
  calories_goal: number;
  exercise_achieved: number;
  exercise_goal: number;
  protein_achieved: number;
  protein_goal: number;
  carbs_achieved: number;
  carbs_goal: number;
  fat_achieved: number;
  fat_goal: number;
  water_achieved: number;
  water_goal: number;
  is_rest_day: boolean;
  streak_maintained: boolean;
}

interface WeeklyStats {
  week_start: string;
  avg_calories_completion: number;
  avg_exercise_completion: number;
  active_days: number;
  rest_days: number;
  streak_days: number;
}

export default function Progress() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'calories' | 'exercise' | 'nutrients'>('calories');
  const [showTrends, setShowTrends] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

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

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      const today = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      const data = await callSupabaseFunction(`goals/progress?start_date=${startDate.toISOString().split('T')[0]}&end_date=${today.toISOString().split('T')[0]}`);
      setProgressData(data.achievements || []);

      // Cargar estadísticas semanales para vista de tendencias
      if (timeRange === 'month' || timeRange === 'quarter') {
        const weeklyData = await callSupabaseFunction(`goals/weekly-stats?start_date=${startDate.toISOString().split('T')[0]}&end_date=${today.toISOString().split('T')[0]}`);
        setWeeklyStats(weeklyData.weeks || []);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [timeRange, user]);

  const getCompletionPercentage = (achieved: number, goal: number) => {
    return goal > 0 ? Math.min((achieved / goal) * 100, 100) : 0;
  };

  const getAverageCompletion = (metric: string) => {
    if (progressData.length === 0) return 0;
    
    const sum = progressData.reduce((acc, day) => {
      switch (metric) {
        case 'calories':
          return acc + getCompletionPercentage(day.calories_achieved, day.calories_goal);
        case 'exercise':
          return acc + getCompletionPercentage(day.exercise_achieved, day.exercise_goal);
        case 'protein':
          return acc + getCompletionPercentage(day.protein_achieved, day.protein_goal);
        default:
          return acc;
      }
    }, 0);
    
    return Math.round(sum / progressData.length);
  };

  const getBestStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    progressData.forEach(day => {
      if (day.streak_maintained) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  };

  const getProgressTrend = (metric: string) => {
    if (progressData.length < 3) return 'stable';
    
    const recent = progressData.slice(-3);
    const older = progressData.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((acc, day) => {
      switch (metric) {
        case 'calories':
          return acc + getCompletionPercentage(day.calories_achieved, day.calories_goal);
        case 'exercise':
          return acc + getCompletionPercentage(day.exercise_achieved, day.exercise_goal);
        default:
          return acc;
      }
    }, 0) / recent.length;
    
    const olderAvg = older.reduce((acc, day) => {
      switch (metric) {
        case 'calories':
          return acc + getCompletionPercentage(day.calories_achieved, day.calories_goal);
        case 'exercise':
          return acc + getCompletionPercentage(day.exercise_achieved, day.exercise_goal);
        default:
          return acc;
      }
    }, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return 'ri-arrow-up-line text-green-600';
      case 'declining': return 'ri-arrow-down-line text-red-600';
      default: return 'ri-subtract-line text-gray-500';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando gráficos de progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/profile')}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <i className="ri-arrow-left-line text-gray-600"></i>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Progreso</h1>
                <p className="text-xs text-gray-600">Visualiza tu evolución</p>
              </div>
            </div>
            <button 
              onClick={() => setShowTrends(!showTrends)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                showTrends ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {showTrends ? 'Gráficos' : 'Tendencias'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* Time Range Selector */}
        <div className="bg-white rounded-xl p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-3">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === 'week'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              7 días
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === 'month'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              30 días
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === 'quarter'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              90 días
            </button>
          </div>
        </div>

        {!showTrends ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-restaurant-line text-green-600"></i>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(getProgressTrend('calories'))}`}>
                    <i className={getTrendIcon(getProgressTrend('calories'))}></i>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{getAverageCompletion('calories')}%</div>
                <div className="text-xs text-gray-600">Promedio calorías</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-run-line text-blue-600"></i>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(getProgressTrend('exercise'))}`}>
                    <i className={getTrendIcon(getProgressTrend('exercise'))}></i>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{getAverageCompletion('exercise')}%</div>
                <div className="text-xs text-gray-600">Promedio ejercicio</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-fire-line text-orange-600"></i>
                  </div>
                  <div className="text-xs text-gray-500">Mejor racha</div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{getBestStreak()}</div>
                <div className="text-xs text-gray-600">días consecutivos</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="ri-heart-pulse-line text-purple-600"></i>
                  </div>
                  <div className="text-xs text-gray-500">Días activos</div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {progressData.filter(d => !d.is_rest_day).length}
                </div>
                <div className="text-xs text-gray-600">de {progressData.length} días</div>
              </div>
            </div>

            {/* Metric Selector */}
            <div className="bg-white rounded-xl p-1 mb-6 shadow-sm">
              <div className="grid grid-cols-3">
                <button
                  onClick={() => setSelectedMetric('calories')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMetric === 'calories'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Calorías
                </button>
                <button
                  onClick={() => setSelectedMetric('exercise')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMetric === 'exercise'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Ejercicio
                </button>
                <button
                  onClick={() => setSelectedMetric('nutrients')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMetric === 'nutrients'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Nutrientes
                </button>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  Progreso {selectedMetric === 'calories' ? 'de calorías' : selectedMetric === 'exercise' ? 'de ejercicio' : 'de nutrientes'}
                </h3>
                <div className="text-xs text-gray-500">Últimos {timeRange === 'week' ? '7' : timeRange === 'month' ? '30' : '90'} días</div>
              </div>

              {progressData.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-bar-chart-line text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500 text-sm">No hay datos suficientes</p>
                  <p className="text-xs text-gray-400 mt-1">Usa la app por algunos días para ver tu progreso</p>
                </div>
              ) : (
                <>
                  {/* Bar Chart */}
                  <div className="mb-4">
                    <div className="flex items-end justify-between space-x-1 h-32 mb-2">
                      {progressData.slice(-7).map((day, index) => {
                        const percentage = selectedMetric === 'calories' 
                          ? getCompletionPercentage(day.calories_achieved, day.calories_goal)
                          : selectedMetric === 'exercise'
                          ? getCompletionPercentage(day.exercise_achieved, day.exercise_goal)
                          : getCompletionPercentage(day.protein_achieved, day.protein_goal);
                        
                        const height = Math.max((percentage / 100) * 100, 4);
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex flex-col items-center mb-1">
                              <div 
                                className={`w-6 rounded-t transition-all duration-500 ${
                                  selectedMetric === 'calories' ? 'bg-green-500' :
                                  selectedMetric === 'exercise' ? 'bg-blue-500' : 'bg-purple-500'
                                } ${day.is_rest_day ? 'opacity-50' : ''}`}
                                style={{ height: `${height}px` }}
                              ></div>
                              {day.is_rest_day && (
                                <div className="w-2 h-2 bg-purple-400 rounded-full -mt-1"></div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Y-axis labels */}
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded ${
                        selectedMetric === 'calories' ? 'bg-green-500' :
                        selectedMetric === 'exercise' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-gray-600">Cumplimiento</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-600">Día de descanso</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Detailed Metrics */}
            {selectedMetric === 'nutrients' && (
              <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Macronutrientes promedio</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Proteínas</span>
                      <span className="text-sm font-semibold text-gray-800">{getAverageCompletion('protein')}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${getAverageCompletion('protein')}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Carbohidratos</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {Math.round(progressData.reduce((acc, day) => 
                          acc + getCompletionPercentage(day.carbs_achieved, day.carbs_goal), 0) / Math.max(progressData.length, 1))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${Math.round(progressData.reduce((acc, day) => 
                          acc + getCompletionPercentage(day.carbs_achieved, day.carbs_goal), 0) / Math.max(progressData.length, 1))}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Grasas</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {Math.round(progressData.reduce((acc, day) => 
                          acc + getCompletionPercentage(day.fat_achieved, day.fat_goal), 0) / Math.max(progressData.length, 1))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${Math.round(progressData.reduce((acc, day) => 
                          acc + getCompletionPercentage(day.fat_achieved, day.fat_goal), 0) / Math.max(progressData.length, 1))}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Calendar */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Calendario de logros</h3>
              <div className="grid grid-cols-7 gap-2">
                {progressData.slice(-21).map((day, index) => {
                  const caloriesCompletion = getCompletionPercentage(day.calories_achieved, day.calories_goal);
                  const exerciseCompletion = getCompletionPercentage(day.exercise_achieved, day.exercise_goal);
                  const overallCompletion = (caloriesCompletion + exerciseCompletion) / 2;
                  
                  return (
                    <div key={index} className="aspect-square relative">
                      <div 
                        className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-medium ${
                          overallCompletion >= 80 ? 'bg-green-500 text-white' :
                          overallCompletion >= 60 ? 'bg-yellow-500 text-white' :
                          overallCompletion >= 40 ? 'bg-orange-500 text-white' :
                          overallCompletion > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                        } ${day.is_rest_day ? 'ring-2 ring-purple-400' : ''}`}
                      >
                        {new Date(day.date).getDate()}
                      </div>
                      {day.streak_maintained && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                          <i className="ri-fire-fill text-white text-xs"></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between mt-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Excelente (&gt;80%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600">Bueno (60-80%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Racha</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Trends View */
          <div className="space-y-6">
            {/* Trend Analysis */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Análisis de tendencias</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-restaurant-line text-green-600"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Calorías</div>
                      <div className="text-xs text-gray-500">Últimos 7 días vs anteriores</div>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(getProgressTrend('calories'))}`}>
                    <i className={getTrendIcon(getProgressTrend('calories'))}></i>
                    <span>
                      {getProgressTrend('calories') === 'improving' ? 'Mejorando' :
                       getProgressTrend('calories') === 'declining' ? 'Bajando' : 'Estable'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-run-line text-blue-600"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Ejercicio</div>
                      <div className="text-xs text-gray-500">Últimos 7 días vs anteriores</div>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(getProgressTrend('exercise'))}`}>
                    <i className={getTrendIcon(getProgressTrend('exercise'))}></i>
                    <span>
                      {getProgressTrend('exercise') === 'improving' ? 'Mejorando' :
                       getProgressTrend('exercise') === 'declining' ? 'Bajando' : 'Estable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Comparison */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Comparación semanal</h3>
              
              <div className="space-y-4">
                {progressData.length >= 14 && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Esta semana</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {Math.round(progressData.slice(-7).reduce((acc, day) => 
                            acc + getCompletionPercentage(day.calories_achieved, day.calories_goal), 0) / 7)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                          style={{width: `${Math.round(progressData.slice(-7).reduce((acc, day) => 
                            acc + getCompletionPercentage(day.calories_achieved, day.calories_goal), 0) / 7)}%`}}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Semana anterior</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {Math.round(progressData.slice(-14, -7).reduce((acc, day) => 
                            acc + getCompletionPercentage(day.calories_achieved, day.calories_goal), 0) / 7)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gray-400 h-3 rounded-full transition-all duration-500" 
                          style={{width: `${Math.round(progressData.slice(-14, -7).reduce((acc, day) => 
                            acc + getCompletionPercentage(day.calories_achieved, day.calories_goal), 0) / 7)}%`}}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 text-sm mb-3">Recomendaciones personalizadas</h4>
              <div className="space-y-2">
                {getAverageCompletion('calories') < 70 && (
                  <div className="flex items-start space-x-2">
                    <i className="ri-lightbulb-line text-blue-600 text-sm mt-0.5"></i>
                    <div className="text-xs text-blue-700">
                      Tu promedio de calorías está por debajo del 70%. Considera planificar comidas con más frecuencia.
                    </div>
                  </div>
                )}
                
                {getAverageCompletion('exercise') < 60 && (
                  <div className="flex items-start space-x-2">
                    <i className="ri-lightbulb-line text-blue-600 text-sm mt-0.5"></i>
                    <div className="text-xs text-blue-700">
                      Intenta ejercicios más cortos pero más frecuentes para mejorar la consistencia.
                    </div>
                  </div>
                )}

                {getBestStreak() >= 7 && (
                  <div className="flex items-start space-x-2">
                    <i className="ri-trophy-line text-orange-600 text-sm mt-0.5"></i>
                    <div className="text-xs text-orange-700">
                      ¡Excelente! Mantuviste una racha de {getBestStreak()} días. Sigue así para formar hábitos duraderos.
                    </div>
                  </div>
                )}

                {progressData.filter(d => d.is_rest_day).length === 0 && progressData.length >= 7 && (
                  <div className="flex items-start space-x-2">
                    <i className="ri-calendar-line text-purple-600 text-sm mt-0.5"></i>
                    <div className="text-xs text-purple-700">
                      Considera programar días de descanso para una mejor recuperación y sostenibilidad.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center space-y-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-dashboard-3-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Dashboard</span>
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
            className="flex flex-col items-center justify-center space-y-1 bg-blue-50"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-fill text-blue-600 text-lg"></i>
            </div>
            <span className="text-xs text-blue-600 font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

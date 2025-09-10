
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '../../hooks/useAuth';

interface UserGoals {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  daily_exercise_minutes: number;
  daily_water_glasses: number;
  weekly_exercise_days: number;
  rest_days: string[];
  auto_adjust_rest_days: boolean;
}

interface ProgressStats {
  total_days: number;
  active_days: number;
  rest_days: number;
  calories_avg_completion: number;
  exercise_avg_completion: number;
  streak_maintained: number;
}

export default function Goals() {
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [originalGoals, setOriginalGoals] = useState<UserGoals | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('goals');
  const [selectedRestDays, setSelectedRestDays] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  
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

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await callSupabaseFunction('goals');
      setGoals(data.goals);
      setOriginalGoals(data.goals);
      setSelectedRestDays(data.goals.rest_days || []);
      
      // Cargar estadísticas de la semana actual
       const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
      
      setTimeout(async () => {
        try {
          const progressData = await callSupabaseFunction(`goals/progress?start_date=${startOfWeek.toISOString().split('T')[0]}&end_date=${endOfWeek.toISOString().split('T')[0]}`);
          setProgressStats(progressData.stats);
        } catch (error) {
          console.error('Error loading progress:', error);
        }
      }, 300);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };
    const debouncedLoadGoals = debounce(loadGoals, 500);

   useEffect(() => {
    if (user) {
      debouncedLoadGoals();
    }
  }, [user?.id]);

  const handleSaveGoals = async () => {
    if (!goals) return;
    
    try {
      setSaving(true);
      await callSupabaseFunction('goals', {
        method: 'PUT',
        body: {
          ...goals,
          rest_days: selectedRestDays
        }
      });
      
      setOriginalGoals({ ...goals, rest_days: selectedRestDays });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRestDayToggle = (day: string) => {
    setSelectedRestDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const resetToDefaults = () => {
    setGoals({
      daily_calories: 2200,
      daily_protein: 100,
      daily_carbs: 275,
      daily_fat: 73,
      daily_exercise_minutes: 60,
      daily_water_glasses: 8,
      weekly_exercise_days: 5,
      rest_days: [],
      auto_adjust_rest_days: true
    });
    setSelectedRestDays([]);
  };

  const cancelEdit = () => {
    if (originalGoals) {
      setGoals(originalGoals);
      setSelectedRestDays(originalGoals.rest_days || []);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando metas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
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
                <h1 className="text-lg font-bold text-gray-800">Mis Metas</h1>
                <p className="text-xs text-gray-600">Personaliza tus objetivos</p>
              </div>
            </div>
            {isEditing && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={cancelEdit}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveGoals}
                  disabled={saving}
                  className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm flex items-center space-x-1"
                >
                  {saving ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <i className="ri-check-line"></i>
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* Tab Switcher */}
        <div className="bg-white rounded-full p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-3">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'goals'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Metas
            </button>
            <button
              onClick={() => setActiveTab('rest')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'rest'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Descanso
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'progress'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Progreso
            </button>
          </div>
        </div>

        {goals && (
          <>
            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                {/* Action Buttons */}
                {!isEditing && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-purple-400 to-purple-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <i className="ri-edit-line"></i>
                        <span>Editar metas</span>
                      </button>
                      <button 
                        onClick={resetToDefaults}
                        className="bg-gray-100 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <i className="ri-restart-line"></i>
                        <span>Restaurar</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Nutrition Goals */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-restaurant-line text-green-600"></i>
                    <span>Metas de Nutrición</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">Calorías diarias</div>
                        <div className="text-xs text-gray-500">Meta energética total</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={goals.daily_calories}
                            onChange={(e) => setGoals({ ...goals, daily_calories: parseInt(e.target.value) || 0 })}
                            className="w-20 p-2 bg-gray-50 rounded-lg border-none text-sm text-right"
                          />
                        ) : (
                          <span className="font-bold text-gray-800">{goals.daily_calories}</span>
                        )}
                        <span className="text-sm text-gray-500">kcal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xs text-red-600 font-medium mb-1">Carbohidratos</div>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={goals.daily_carbs}
                            onChange={(e) => setGoals({ ...goals, daily_carbs: parseFloat(e.target.value) || 0 })}
                            className="w-full p-1 bg-white rounded text-sm text-center border-none"
                          />
                        ) : (
                          <div className="font-bold text-red-600">{goals.daily_carbs}g</div>
                        )}
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xs text-yellow-600 font-medium mb-1">Proteínas</div>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={goals.daily_protein}
                            onChange={(e) => setGoals({ ...goals, daily_protein: parseFloat(e.target.value) || 0 })}
                            className="w-full p-1 bg-white rounded text-sm text-center border-none"
                          />
                        ) : (
                          <div className="font-bold text-yellow-600">{goals.daily_protein}g</div>
                        )}
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xs text-purple-600 font-medium mb-1">Grasas</div>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={goals.daily_fat}
                            onChange={(e) => setGoals({ ...goals, daily_fat: parseFloat(e.target.value) || 0 })}
                            className="w-full p-1 bg-white rounded text-sm text-center border-none"
                          />
                        ) : (
                          <div className="font-bold text-purple-600">{goals.daily_fat}g</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise Goals */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-run-line text-blue-600"></i>
                    <span>Metas de Ejercicio</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">Ejercicio diario</div>
                        <div className="text-xs text-gray-500">Tiempo de actividad física</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={goals.daily_exercise_minutes}
                            onChange={(e) => setGoals({ ...goals, daily_exercise_minutes: parseInt(e.target.value) || 0 })}
                            className="w-20 p-2 bg-gray-50 rounded-lg border-none text-sm text-right"
                          />
                        ) : (
                          <span className="font-bold text-gray-800">{goals.daily_exercise_minutes}</span>
                        )}
                        <span className="text-sm text-gray-500">min</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">Días activos por semana</div>
                        <div className="text-xs text-gray-500">Días con ejercicio</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            max="7"
                            value={goals.weekly_exercise_days}
                            onChange={(e) => setGoals({ ...goals, weekly_exercise_days: parseInt(e.target.value) || 1 })}
                            className="w-16 p-2 bg-gray-50 rounded-lg border-none text-sm text-right"
                          />
                        ) : (
                          <span className="font-bold text-gray-800">{goals.weekly_exercise_days}</span>
                        )}
                        <span className="text-sm text-gray-500">días</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hydration Goals */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-drop-line text-cyan-600"></i>
                    <span>Meta de Hidratación</span>
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Vasos de agua al día</div>
                      <div className="text-xs text-gray-500">Aproximadamente 2 litros</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={goals.daily_water_glasses}
                          onChange={(e) => setGoals({ ...goals, daily_water_glasses: parseInt(e.target.value) || 0 })}
                          className="w-16 p-2 bg-gray-50 rounded-lg border-none text-sm text-right"
                        />
                      ) : (
                        <span className="font-bold text-gray-800">{goals.daily_water_glasses}</span>
                      )}
                      <span className="text-sm text-gray-500">vasos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest Days Tab */}
            {activeTab === 'rest' && (
              <div className="space-y-6">
                {/* Auto Adjust Toggle */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Ajuste automático</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Reduce automáticamente las metas en días de descanso
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={goals.auto_adjust_rest_days}
                        onChange={(e) => setGoals({ ...goals, auto_adjust_rest_days: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                </div>

                {/* Rest Days Selection */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-calendar-line text-purple-600"></i>
                    <span>Días de descanso</span>
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Selecciona los días donde no planeas hacer ejercicio intenso
                  </p>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map((day, index) => (
                      <button
                        key={day}
                        onClick={() => handleRestDayToggle(day)}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all ${
                          selectedRestDays.includes(day)
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{dayLabels[index]}</div>
                        <div className="text-xs mt-1 leading-tight text-center">
                          {day.substring(0, 3)}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <i className="ri-information-line text-gray-500"></i>
                      <div className="text-xs text-gray-600">
                        {selectedRestDays.length === 0 
                          ? 'No hay días de descanso seleccionados'
                          : `${selectedRestDays.length} día${selectedRestDays.length > 1 ? 's' : ''} de descanso seleccionado${selectedRestDays.length > 1 ? 's' : ''}`
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rest Day Benefits */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <h4 className="font-medium text-purple-800 text-sm mb-3">¿Por qué días de descanso?</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <i className="ri-heart-line text-purple-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-purple-700">Permite la recuperación muscular</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="ri-trophy-line text-purple-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-purple-700">Mantiene la motivación a largo plazo</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="ri-shield-check-line text-purple-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-purple-700">Previene el sobreentrenamiento</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="ri-scales-line text-purple-600 text-sm mt-0.5"></i>
                      <div className="text-xs text-purple-700">Ajusta metas automáticamente para mantener el progreso</div>
                    </div>
                  </div>
                </div>

                {/* Save Button for Rest Days */}
                <button 
                  onClick={handleSaveGoals}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-400 to-purple-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <i className="ri-save-line"></i>
                      <span>Guardar configuración</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && progressStats && (
              <div className="space-y-6">
                {/* Weekly Summary */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <i className="ri-bar-chart-line text-green-600"></i>
                    <span>Resumen semanal</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{progressStats.active_days}</div>
                      <div className="text-xs text-gray-500">Días activos</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{progressStats.rest_days}</div>
                      <div className="text-xs text-gray-500">Días de descanso</div>
                    </div>
                  </div>
                </div>

                {/* Completion Rates */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Cumplimiento de metas</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Calorías</span>
                        <span className="text-sm font-semibold text-gray-800">{progressStats.calories_avg_completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${Math.min(progressStats.calories_avg_completion, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Ejercicio</span>
                        <span className="text-sm font-semibold text-gray-800">{progressStats.exercise_avg_completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${Math.min(progressStats.exercise_avg_completion, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Racha mantenida</div>
                      <div className="text-xs text-gray-500">Días consecutivos cumpliendo objetivos</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">{progressStats.streak_maintained}</div>
                      <div className="text-xs text-gray-500">días</div>
                    </div>
                  </div>
                </div>

                {/* Progress Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-800 text-sm mb-3">Consejos para mejorar</h4>
                  <div className="space-y-2">
                    {progressStats.calories_avg_completion < 80 && (
                      <div className="flex items-start space-x-2">
                        <i className="ri-restaurant-line text-blue-600 text-sm mt-0.5"></i>
                        <div className="text-xs text-blue-700">Intenta planificar tus comidas con anticipación</div>
                      </div>
                    )}
                    {progressStats.exercise_avg_completion < 70 && (
                      <div className="flex items-start space-x-2">
                        <i className="ri-run-line text-blue-600 text-sm mt-0.5"></i>
                        <div className="text-xs text-blue-700">Considera reducir tu meta de ejercicio para ser más consistente</div>
                      </div>
                    )}
                    {progressStats.rest_days === 0 && (
                      <div className="flex items-start space-x-2">
                        <i className="ri-calendar-line text-blue-600 text-sm mt-0.5"></i>
                        <div className="text-xs text-blue-700">Programa días de descanso para una mejor recuperación</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
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
            className="flex flex-col items-center justify-center space-y-1 bg-purple-50"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-fill text-purple-600 text-lg"></i>
            </div>
            <span className="text-xs text-purple-600 font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

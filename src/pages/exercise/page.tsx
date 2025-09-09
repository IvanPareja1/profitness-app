
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '../../hooks/useAuth';

interface Exercise {
  id: string;
  name: string;
  type: string;
  duration: number;
  weight?: number;
  reps?: number;
  sets?: number;
  calories_burned: number;
  notes?: string;
  created_at: string;
}

interface CompletedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  completed_at: string;
}

interface ExerciseTotals {
  totalExercises: number;
  totalDuration: number;
  totalCalories: number;
  totalSets: number;
  totalReps: number;
}

interface ExerciseTemplate {
  name: string;
  type: string;
  category: string;
  calories_per_min: number;
}


export default function Exercise() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [totals, setTotals] = useState<ExerciseTotals>({ totalExercises: 0, totalDuration: 0, totalCalories: 0, totalSets: 0, totalReps: 0 });
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExerciseTemplate[]>([]);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    type: '',
    weight: '',
    reps: '',
    sets: '',
    duration: '',
    notes: ''
  });
  
  // Hydration states
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal] = useState(2500); // 2.5L daily goal
  const [showHydrationForm, setShowHydrationForm] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [lastReminder, setLastReminder] = useState<Date | null>(null);

  const [activeTab, setActiveTab] = useState('workout');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [todayStats, setTodayStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    totalDuration: 0,
    caloriesBurned: 0
  });
  const [loading, setLoading] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  
  // Configuración de recordatorios
  const [reminderEnabled] = useState(true);
  const [reminderInterval] = useState(60); // minutes

  const navigate = useNavigate();
  const { user } = useAuth();

  const callSupabaseFunction = async (functionName: string, options: any = {}) => {
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await callSupabaseFunction(`exercises?date=${selectedDate}`);
      setExercises(data.exercises || []);
      setTotals(data.totals || { totalExercises: 0, totalDuration: 0, totalCalories: 0, totalSets: 0, totalReps: 0 });
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchExercises = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const data = await callSupabaseFunction('exercises/templates', {
        method: 'POST',
        body: { query }
      });
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching exercises:', error);
    }
  };

  const selectExerciseTemplate = (template: ExerciseTemplate) => {
    setExerciseForm({
      name: template.name,
      type: template.type,
      weight: template.type === 'fuerza' ? '50' : '',
      reps: template.type === 'fuerza' ? '12' : '',
      sets: template.type === 'fuerza' ? '3' : '',
      duration: template.type === 'cardio' ? '30' : template.type === 'fuerza' ? '45' : '20',
      notes: ''
    });
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddExercise = async () => {
    if (!exerciseForm.name || !exerciseForm.type) return;

    try {
      await callSupabaseFunction('exercises', {
        method: 'POST',
        body: {
          name: exerciseForm.name,
          type: exerciseForm.type,
          duration: parseInt(exerciseForm.duration) || 0,
          weight: exerciseForm.weight ? parseFloat(exerciseForm.weight) : null,
          reps: exerciseForm.reps ? parseInt(exerciseForm.reps) : null,
          sets: exerciseForm.sets ? parseInt(exerciseForm.sets) : null,
          notes: exerciseForm.notes || null
        }
      });

      setExerciseForm({
        name: '',
        type: '',
        weight: '',
        reps: '',
        sets: '',
        duration: '',
        notes: ''
      });
      setShowAddForm(false);
      loadExercises();
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    try {
      await callSupabaseFunction(`exercises/${exerciseId}`, {
        method: 'DELETE'
      });
      loadExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadExercises();
    }
  }, [selectedDate, user]);

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => searchExercises(searchQuery), 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Water reminder effect
  useEffect(() => {
    if (!reminderEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      if (!lastReminder || (now.getTime() - lastReminder.getTime()) >= reminderInterval * 60 * 1000) {
        showWaterReminder();
        setLastReminder(now);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminderEnabled, reminderInterval, lastReminder]);

  const showWaterReminder = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('💧 Hora de hidratarte', {
          body: 'No olvides tomar agua para mantener tu rendimiento óptimo',
          icon: '/icon-192x192.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('💧 Hora de hidratarte', {
              body: 'No olvides tomar agua para mantener tu rendimiento óptimo',
              icon: '/icon-192x192.png'
            });
          }
        });
      }
    }
    
    // Visual reminder
    const reminder = document.createElement('div');
    reminder.className = 'fixed top-20 left-4 right-4 bg-blue-500 text-white p-4 rounded-xl shadow-lg z-50 animate-pulse';
    reminder.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="ri-drop-line text-2xl"></i>
        <div>
          <div class="font-semibold">¡Hora de hidratarte! 💧</div>
          <div class="text-sm opacity-90">Toma un vaso de agua para mantener tu energía</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">
          <i class="ri-close-line text-xl"></i>
        </button>
      </div>
    `;
    document.body.appendChild(reminder);
    
    setTimeout(() => {
      if (reminder.parentElement) {
        reminder.remove();
      }
    }, 5000);
  };

  const addWater = (amount: number) => {
    setWaterIntake(prev => Math.min(prev + amount, dailyGoal + 1000));
    setLastReminder(new Date()); // Reset reminder timer
  };

  const addCustomWater = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      addWater(amount);
      setCustomAmount('');
      setShowHydrationForm(false);
    }
  };

  const resetWaterIntake = () => {
    setWaterIntake(0);
  };

  const handleInputChange = (field: string, value: string) => {
    setExerciseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'cardio': return 'ri-heart-pulse-line';
      case 'fuerza': return 'ri-sword-line';
      case 'resistencia': return 'ri-fire-line';
      case 'flexibilidad': return 'ri-leaf-line';
      default: return 'ri-run-line';
    }
  };

  const getExerciseColor = (type: string) => {
    switch (type) {
      case 'cardio': return 'text-red-600 bg-red-100';
      case 'fuerza': return 'text-purple-600 bg-purple-100';
      case 'resistencia': return 'text-orange-600 bg-orange-100';
      case 'flexibilidad': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">Ejercicio</h1>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm bg-gray-100 rounded-lg px-3 py-2 border-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* Daily Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Resumen del día</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{totals.totalExercises}</div>
              <div className="text-xs text-gray-600">Ejercicios</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{totals.totalDuration}</div>
              <div className="text-xs text-gray-600">Minutos</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{totals.totalCalories}</div>
              <div className="text-xs text-gray-600">Calorías</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{totals.totalSets}</div>
              <div className="text-xs text-gray-600">Series</div>
            </div>
          </div>
        </div>

        {/* Hydration Section */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="ri-drop-line text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold">Hidratación diaria</h3>
                <p className="text-blue-100 text-sm">Meta: {(dailyGoal/1000).toFixed(1)}L</p>
              </div>
            </div>
            <button 
              onClick={() => setShowHydrationForm(!showHydrationForm)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            >
              <i className={`ri-${showHydrationForm ? 'close' : 'add'}-line`}></i>
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Progreso</span>
              <span className="font-semibold">{waterIntake}ml / {dailyGoal}ml</span>
            </div>
            <div className="w-full bg-blue-400/30 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500" 
                style={{width: `${Math.min((waterIntake / dailyGoal) * 100, 100)}%`}}
              ></div>
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-blue-100">
                {Math.round((waterIntake / dailyGoal) * 100)}% completado
              </span>
            </div>
          </div>

          {/* Quick Add Buttons */}
          {!showHydrationForm && (
            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={() => addWater(250)}
                className="bg-white/20 py-2 rounded-lg text-center"
              >
                <div className="text-sm font-medium">250ml</div>
                <div className="text-xs text-blue-100">Vaso</div>
              </button>
              <button 
                onClick={() => addWater(500)}
                className="bg-white/20 py-2 rounded-lg text-center"
              >
                <div className="text-sm font-medium">500ml</div>
                <div className="text-xs text-blue-100">Botella</div>
              </button>
              <button 
                onClick={() => addWater(750)}
                className="bg-white/20 py-2 rounded-lg text-center"
              >
                <div className="text-sm font-medium">750ml</div>
                <div className="text-xs text-blue-100">Deportiva</div>
              </button>
              <button 
                onClick={() => addWater(1000)}
                className="bg-white/20 py-2 rounded-lg text-center"
              >
                <div className="text-sm font-medium">1L</div>
                <div className="text-xs text-blue-100">Grande</div>
              </button>
            </div>
          )}

          {/* Custom Amount Form */}
          {showHydrationForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-100 mb-2">Cantidad personalizada (ml)</label>
                <input
                  type="number"
                  placeholder="Ej: 350"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 text-sm"
                />
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={addCustomWater}
                  className="flex-1 bg-white/20 py-2 rounded-lg font-medium"
                >
                  Agregar agua
                </button>
                <button 
                  onClick={resetWaterIntake}
                  className="px-4 bg-red-400/20 py-2 rounded-lg font-medium"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Workout Status */}
        {activeWorkout && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Entrenamiento activo</h3>
                <p className="text-blue-100 text-sm">Entrenamiento de fuerza</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}</div>
                <p className="text-blue-100 text-xs">tiempo transcurrido</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button className="flex-1 bg-white/20 py-2 rounded-lg font-medium">
                Pausar
              </button>
              <button 
                onClick={() => setActiveWorkout(false)}
                className="flex-1 bg-white/20 py-2 rounded-lg font-medium"
              >
                Finalizar
              </button>
            </div>
          </div>
        )}

        {/* Quick Start */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Inicio rápido</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveWorkout(true)}
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-xl flex flex-col items-center space-y-2"
            >
              <i className="ri-timer-line text-2xl"></i>
              <span className="font-medium text-sm">Entrenar ahora</span>
            </button>
            <button className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 rounded-xl flex flex-col items-center space-y-2">
              <i className="ri-walk-line text-2xl"></i>
              <span className="font-medium text-sm">Caminar</span>
            </button>
          </div>
        </div>

        {/* Add Exercise Form */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Agregar ejercicio</h3>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <i className={`ri-${showAddForm ? 'close' : 'add'}-line text-blue-600`}></i>
            </button>
          </div>
          
          {showAddForm && (
            <div className="space-y-4">
              {/* Search Toggle */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    showSearch ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Buscar ejercicio
                </button>
                <button
                  onClick={() => setShowSearch(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    !showSearch ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Manual
                </button>
              </div>

              {/* Search Section */}
              {showSearch && (
                <div>
                  <input
                    type="text"
                    placeholder="Buscar ejercicios (ej: flexiones, correr...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm mb-3"
                  />
                  
                  {searchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => selectExerciseTemplate(result)}
                          className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-800 text-sm">{result.name}</div>
                              <div className="text-xs text-gray-500">{result.category} • {result.type}</div>
                            </div>
                            <div className="text-xs text-blue-600">
                              ~{result.calories_per_min} kcal/min
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del ejercicio</label>
                <input
                  type="text"
                  placeholder="Ej: Press de banca, Sentadillas..."
                  value={exerciseForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de ejercicio</label>
                <select
                  value={exerciseForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="fuerza">Fuerza</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibilidad">Flexibilidad</option>
                  <option value="resistencia">Resistencia</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duración (min)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={exerciseForm.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={exerciseForm.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Series</label>
                  <input
                    type="number"
                    placeholder="3"
                    value={exerciseForm.sets}
                    onChange={(e) => handleInputChange('sets', e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeticiones</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={exerciseForm.reps}
                    onChange={(e) => handleInputChange('reps', e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea
                  placeholder="Observaciones sobre el ejercicio..."
                  value={exerciseForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm h-20 resize-none"
                />
              </div>

              <button 
                onClick={handleAddExercise}
                disabled={!exerciseForm.name || !exerciseForm.type}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar ejercicio
              </button>
            </div>
          )}
        </div>

        {/* Today's Exercises */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Ejercicios del día</h3>
          
          {loading ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Cargando ejercicios...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-6">
              <i className="ri-run-line text-3xl text-gray-300 mb-2"></i>
              <p className="text-gray-500 text-sm">No hay ejercicios registrados</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="text-blue-600 text-sm font-medium mt-2"
              >
                Añadir primer ejercicio
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getExerciseColor(exercise.type)} rounded-full flex items-center justify-center`}>
                      <i className={getExerciseIcon(exercise.type)}></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{exercise.name}</div>
                      <div className="text-xs text-gray-500">
                        {exercise.duration}min
                        {exercise.sets && exercise.reps && ` • ${exercise.sets}x${exercise.reps}`}
                        {exercise.weight && ` • ${exercise.weight}kg`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">{exercise.calories_burned} kcal</div>
                      <div className="text-xs text-gray-500">
                        {new Date(exercise.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteExercise(exercise.id)}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"
                    >
                      <i className="ri-delete-bin-line text-red-600 text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise Programs */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Programas recomendados</h3>
          <div className="space-y-3">
            {[
              {
                name: 'Rutina de principiante',
                duration: '4 semanas',
                exercises: '12 ejercicios',
                difficulty: 'Fácil',
                image: 'beginner workout routine with basic exercises, gym setting, clean professional photography, motivational fitness atmosphere'
              },
              {
                name: 'Cardio intensivo',
                duration: '6 semanas',
                exercises: '15 ejercicios',
                difficulty: 'Intermedio',
                image: 'intensive cardio workout equipment and setup, dynamic fitness environment, high energy professional photography'
              },
              {
                name: 'Fuerza avanzada',
                duration: '8 semanas',
                exercises: '20 ejercicios',
                difficulty: 'Avanzado',
                image: 'advanced strength training equipment heavy weights, professional gym setup, serious fitness atmosphere'
              }
            ].map((program, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={`https://readdy.ai/api/search-image?query=$%7Bprogram.image%7D&width=80&height=60&seq=program${index}&orientation=landscape`}
                  alt={program.name}
                  className="w-16 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">{program.name}</div>
                  <div className="text-xs text-gray-500">{program.duration} • {program.exercises}</div>
                </div>
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {program.difficulty}
                </div>
              </div>
            ))}
          </div>
        </div>
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
          <button className="flex flex-col items-center justify-center space-y-1 bg-blue-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-run-fill text-blue-600 text-lg"></i>
            </div>
            <span className="text-xs text-blue-600 font-medium">Ejercicio</span>
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

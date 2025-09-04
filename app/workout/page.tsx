
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WorkoutPage() {
  const [activeCategory, setActiveCategory] = useState('todo');
  const [user, setUser] = useState<any>(null);
  const [todaysWorkouts, setTodaysWorkouts] = useState<any[]>([]);
  const [todaysSummary, setTodaysSummary] = useState({
    workouts: 0,
    calories: 0,
    minutes: 0,
    exercises: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTodaysWorkouts();
    }
    setIsLoading(false);
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadTodaysWorkouts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/profile-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'get_recent_workouts'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Filtrar entrenamientos de hoy
        const today = new Date().toISOString().split('T')[0];
        const todaysOnly = result.data.filter((workout: any) => 
          new Date(workout.workout_date).toISOString().split('T')[0] === today
        );

        setTodaysWorkouts(todaysOnly);

        // Calcular resumen de hoy
        const summary = todaysOnly.reduce((acc: any, workout: any) => ({
          workouts: acc.workouts + 1,
          calories: acc.calories + (workout.calories_burned || 0),
          minutes: acc.minutes + (workout.duration_minutes || 0),
          exercises: acc.exercises + (workout.workout_exercises?.length || 0)
        }), { workouts: 0, calories: 0, minutes: 0, exercises: 0 });

        setTodaysSummary(summary);
      }
    } catch (error) {
      console.error('Error cargando entrenamientos:', error);
    }
  };

  const startWorkout = async (workout: any) => {

    if (!user) {
      alert('Debes iniciar sesión para registrar entrenamientos');
      return;
    }

    // Crear entrenamientos básicos predefinidos
    const workoutTemplates: any = {
      1: { // Cardio Explosivo
        exercises: [
          { name: 'Saltos de tijera', sets: 3, reps: 30, duration: 1 },
          { name: 'Burpees', sets: 3, reps: 15, duration: 2 },
          { name: 'Mountain climbers', sets: 3, reps: 30, duration: 1 },
          { name: 'High knees', sets: 3, reps: 30, duration: 1 }
        ]
      },
      2: { // Fuerza Superior
        exercises: [
          { name: 'Flexiones', sets: 3, reps: 15, weight: 0 },
          { name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
          { name: 'Dips', sets: 3, reps: 12, weight: 0 },
          { name: 'Plancha', sets: 3, reps: 1, duration: 1 }
        ]
      }
    };

    const template = workoutTemplates[workout.id] || { exercises: [] };

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/profile-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'add_workout',
          workout_name: workout.name,
          exercises: template.exercises,
          duration_minutes: workout.duration,
          calories_burned: workout.calories
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(` Entrenamiento "${workout.name}" registrado correctamente`);
        loadTodaysWorkouts(); // Recargar entrenamientos
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar entrenamiento. Intenta de nuevo.');
    }
  };

  const workoutCategories = [
    { id: 'todo', name: 'Todo', icon: 'ri-grid-line' },
    { id: 'cardio', name: 'Cardio', icon: 'ri-heart-pulse-line' },
    { id: 'strength', name: 'Fuerza', icon: 'ri-dumbbell-line' },
    { id: 'flexibility', name: 'Flexibilidad', icon: 'ri-body-scan-line' },
    { id: 'yoga', name: 'Yoga', icon: 'ri-leaf-line' }
  ];

  const workoutPlans = [
    {
      id: 1,
      name: 'Cardio Explosivo',
      duration: 30,
      difficulty: 'Intermedio',
      exercises: 8,
      calories: 350,
      type: 'cardio',
      image: 'https://readdy.ai/api/search-image?query=High-intensity%20cardio%20workout%20in%20modern%20gym%2C%20people%20exercising%20with%20energy%2C%20dynamic%20movement%2C%20bright%20lighting%2C%20motivational%20atmosphere%2C%20fitness%20equipment%20visible%2C%20colorful%20athletic%20wear%2C%20action%20shots&width=300&height=200&seq=cardio1&orientation=landscape'
    },
    {
      id: 2,
      name: 'Fuerza Superior',
      duration: 45,
      difficulty: 'Avanzado',
      exercises: 10,
      calories: 280,
      type: 'strength',
      image: 'https://readdy.ai/api/search-image?query=Upper%20body%20strength%20training%2C%20dumbbells%20and%20barbells%2C%20gym%20environment%2C%20focused%20athlete%20lifting%20weights%2C%20professional%20fitness%20equipment%2C%20clean%20modern%20gym%20interior&width=300&height=200&seq=strength1&orientation=landscape'
    },
    {
      id: 3,
      name: 'Yoga Relajante',
      duration: 25,
      difficulty: 'Principiante',
      exercises: 12,
      calories: 120,
      type: 'yoga',
      image: 'https://readdy.ai/api/search-image?query=Peaceful%20yoga%20session%2C%20meditation%20pose%2C%20serene%20studio%20environment%2C%20soft%20natural%20lighting%2C%20calm%20atmosphere%2C%20yoga%20mat%2C%20minimalist%20setting%2C%20relaxation%20and%20wellness&width=300&height=200&seq=yoga1&orientation=landscape'
    },
    {
      id: 4,
      name: 'HIIT Intenso',
      duration: 20,
      difficulty: 'Avanzado',
      exercises: 6,
      calories: 300,
      type: 'cardio',
      image: 'https://readdy.ai/api/search-image?query=High-intensity%20interval%20training%20HIIT%2C%20dynamic%20exercises%2C%20jumping%20and%20movement%2C%20energetic%20workout%20session%2C%20modern%20fitness%20studio%2C%20athletic%20performance&width=300&height=200&seq=hiit1&orientation=landscape'
    },
    {
      id: 5,
      name: 'Estiramiento Total',
      duration: 15,
      difficulty: 'Principiante',
      exercises: 8,
      calories: 60,
      type: 'flexibility',
      image: 'https://readdy.ai/api/search-image?query=Full%20body%20stretching%20routine%2C%20flexibility%20exercises%2C%20peaceful%20environment%2C%20stretching%20poses%2C%20wellness%20and%20recovery%2C%20soft%20lighting%2C%20health%20and%20mobility%20focus&width=300&height=200&seq=stretch1&orientation=landscape'
    },
    {
      id: 6,
      name: 'Piernas de Acero',
      duration: 40,
      difficulty: 'Intermedio',
      exercises: 9,
      calories: 340,
      type: 'strength',
      image: 'https://readdy.ai/api/search-image?query=Leg%20workout%20training%2C%20squats%20and%20leg%20exercises%2C%20gym%20equipment%20for%20lower%20body%2C%20strength%20training%20focus%2C%20athletic%20performance%2C%20professional%20fitness%20environment&width=300&height=200&seq=legs1&orientation=landscape'
    }
  ];

  const quickWorkouts = [
    { name: '5 min Cardio', duration: 5, calories: 50, icon: 'ri-flashlight-line', color: 'bg-red-100 text-red-600' },
    { name: 'Abdominales', duration: 10, calories: 80, icon: 'ri-body-scan-line', color: 'bg-orange-100 text-orange-600' },
    { name: 'Estiramiento', duration: 8, calories: 40, icon: 'ri-leaf-line', color: 'bg-green-100 text-green-600' },
    { name: 'Respiración', duration: 3, calories: 20, icon: 'ri-lungs-line', color: 'bg-blue-100 text-blue-600' }
  ];

  const filteredWorkouts = activeCategory === 'todo' 
    ? workoutPlans 
    : workoutPlans.filter((w: any) => w.type === activeCategory);

  const getDifficultyColor = (difficulty: any) => {
    switch (difficulty) {
      case 'Principiante': return 'text-green-600 bg-green-100';
      case 'Intermedio': return 'text-orange-600 bg-orange-100';
      case 'Avanzado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
            <i className="ri-run-line text-purple-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-4">Para registrar entrenamientos necesitas una cuenta</p>
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

  const currentDate = new Date().toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Entrenamientos</h1>
          <Link href="/workout/history" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-history-line text-gray-600 text-lg"></i>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Today's Summary */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Hoy, {currentDate}</h2>
              <p className="text-sm text-gray-600">{todaysSummary.workouts} entrenamientos completados</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{todaysSummary.calories}</p>
              <p className="text-xs text-gray-500">kcal quemadas</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">{todaysSummary.minutes}</p>
              <p className="text-xs text-gray-500">Minutos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{todaysSummary.exercises}</p>
              <p className="text-xs text-gray-500">Ejercicios</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{todaysSummary.workouts > 0 ? 156 : 0}</p>
              <p className="text-xs text-gray-500">Pulsaciones</p>
            </div>
          </div>
        </div>

        {/* Today's Workouts */}
        {todaysWorkouts.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Entrenamientos Completados Hoy</h3>
            <div className="space-y-3">
              {todaysWorkouts.map((workout: any, index: any) => (
                <div key={index} className="flex items-center p-3 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-check-line text-purple-600 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{workout.workout_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(workout.workout_date).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} • {workout.duration_minutes} min • {workout.calories_burned} kcal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Workouts */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Entrenamientos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickWorkouts.map((workout: any, index: any) => (
              <button
                key={index}
                onClick={() => startWorkout(workout)}
                className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 ${workout.color} rounded-lg flex items-center justify-center mr-3`}>
                  <i className={`${workout.icon} text-sm`}></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800 text-sm">{workout.name}</p>
                  <p className="text-xs text-gray-500">{workout.duration} min</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-2xl p-1 mb-6 shadow-sm">
          <div className="flex space-x-1 overflow-x-auto">
            {workoutCategories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={`${category.icon} mr-2`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Workout Plans */}
        <div className="space-y-4">
          {filteredWorkouts.map((workout: any) => (
            <div key={workout.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={workout.image} 
                  alt={workout.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                    {workout.difficulty}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white mb-1">{workout.name}</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <i className="ri-time-line mr-1"></i>
                    <span className="mr-4">{workout.duration} min</span>
                    <i className="ri-fire-line mr-1"></i>
                    <span className="mr-4">{workout.calories} kcal</span>
                    <i className="ri-list-check mr-1"></i>
                    <span>{workout.exercises} ejercicios</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => startWorkout(workout)}
                    className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors"
                  >
                    Iniciar Entrenamiento
                  </button>
                  <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
                    <i className="ri-heart-line text-gray-600"></i>
                  </button>
                  <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
                    <i className="ri-share-line text-gray-600"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
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

      {/* FAB for Quick Start */}
      <button 
        onClick={() => startWorkout({ name: 'Entrenamiento Aleatorio', duration: 15, calories: 120 })}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <i className="ri-play-fill text-white text-xl"></i>
      </button>
    </div>
  );
}

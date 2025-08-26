'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ExercisePage() {
  const [selectedTab, setSelectedTab] = useState('workouts');
  const [todayWorkout, setTodayWorkout] = useState(null);

  const workoutCategories = [
    { id: 'cardio', name: 'Cardio', icon: 'ri-heart-pulse-line', color: 'bg-red-100 text-red-500' },
    { id: 'strength', name: 'Fuerza', icon: 'ri-fitness-line', color: 'bg-blue-100 text-blue-500' },
    { id: 'flexibility', name: 'Flexibilidad', icon: 'ri-stretch-line', color: 'bg-green-100 text-green-500' },
    { id: 'yoga', name: 'Yoga', icon: 'ri-leaf-line', color: 'bg-purple-100 text-purple-500' }
  ];

  const myRoutines = [
    { 
      id: 1, 
      name: 'Rutina Matutina', 
      duration: '30 min', 
      exercises: 8, 
      difficulty: 'Intermedio',
      category: 'strength'
    },
    { 
      id: 2, 
      name: 'Cardio Intenso', 
      duration: '45 min', 
      exercises: 6, 
      difficulty: 'Avanzado',
      category: 'cardio'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Ejercicio</h1>
          </div>
          <Link href="/workout-create" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-add-line text-blue-500 text-xl"></i>
          </Link>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Progreso de Hoy</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">45</div>
              <div className="text-xs text-gray-500">Minutos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">320</div>
              <div className="text-xs text-gray-500">Calorías</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">2</div>
              <div className="text-xs text-gray-500">Rutinas</div>
            </div>
          </div>

          {!todayWorkout ? (
            <button 
              onClick={() => setTodayWorkout('started')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-xl font-semibold"
            >
              Comenzar Entrenamiento
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">Entrenamiento Activo</h3>
                  <p className="text-sm text-green-600">Rutina Matutina - 15 min restantes</p>
                </div>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex space-x-1 mb-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setSelectedTab('workouts')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'workouts'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Entrenamientos
            </button>
            <button
              onClick={() => setSelectedTab('routines')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'routines'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Mis Rutinas
            </button>
          </div>

          {selectedTab === 'workouts' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Categorías</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {workoutCategories.map((category) => (
                  <Link 
                    key={category.id}
                    href={`/workouts/${category.id}`}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${category.color}`}>
                      <i className={`${category.icon} text-xl`}></i>
                    </div>
                    <h4 className="font-semibold text-gray-800 text-sm">{category.name}</h4>
                  </Link>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Entrenamientos Rápidos</h4>
                <div className="space-y-2">
                  <Link href="/quick-workout/1" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <i className="ri-time-line text-orange-500"></i>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">Entrenamiento de 7 minutos</div>
                        <div className="text-xs text-gray-500">Ejercicios básicos</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">7 min</div>
                  </Link>

                  <Link href="/quick-workout/2" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="ri-pulse-line text-purple-500"></i>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">HIIT Intenso</div>
                        <div className="text-xs text-gray-500">Alta intensidad</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">15 min</div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'routines' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Mis Rutinas</h3>
                <Link href="/routine-create" className="text-blue-500 text-sm font-medium">
                  + Crear Nueva
                </Link>
              </div>

              <div className="space-y-3">
                {myRoutines.map((routine) => (
                  <Link key={routine.id} href={`/routine/${routine.id}`} className="block p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{routine.name}</h4>
                      <span className="text-sm text-gray-500">{routine.duration}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">{routine.exercises} ejercicios</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{routine.difficulty}</span>
                    </div>
                  </Link>
                ))}

                {myRoutines.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <i className="ri-add-line text-gray-400 text-2xl"></i>
                    </div>
                    <p className="text-gray-500">No tienes rutinas creadas</p>
                    <Link href="/routine-create" className="text-blue-500 text-sm font-medium mt-2 inline-block">
                      Crear tu primera rutina
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Estadísticas Semanales</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiempo total</span>
              <span className="font-semibold text-gray-800">4h 20min</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Calorías quemadas</span>
              <span className="font-semibold text-gray-800">1,850 kcal</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Días activos</span>
              <span className="font-semibold text-gray-800">5/7 días</span>
            </div>
            
            <div className="mt-4 bg-gray-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-2 rounded-full" style={{ width: '71%' }}></div>
            </div>
            <p className="text-xs text-gray-500 text-center">71% de tu meta semanal</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Inicio</span>
          </Link>
          
          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Comida</span>
          </Link>
          
          <Link href="/scan" className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-qr-scan-2-line text-white text-lg"></i>
            </div>
          </Link>
          
          <Link href="/reports" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Reportes</span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RemindersPage() {
  const [mealReminders, setMealReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(false);
  const [waterInterval, setWaterInterval] = useState(60);
  
  const [mealTimes, setMealTimes] = useState({
    breakfast: '08:00',
    lunch: '13:00',
    snack: '16:00',
    dinner: '20:00'
  });

  const [workoutTime, setWorkoutTime] = useState('18:00');

  const handleMealTimeChange = (meal: string, time: string) => {
    setMealTimes(prev => ({
      ...prev,
      [meal]: time
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Recordatorios</h1>
          </div>
          <button className="text-sm font-medium text-yellow-500 hover:text-yellow-600">
            Guardar
          </button>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-restaurant-line text-orange-500"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Recordatorios de comida</h3>
                <p className="text-sm text-gray-500">Notificaciones para tus comidas</p>
              </div>
            </div>
            <button
              onClick={() => setMealReminders(!mealReminders)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mealReminders ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mealReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {mealReminders && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <i className="ri-sun-line text-yellow-500"></i>
                  <span className="text-sm font-medium text-gray-700">Desayuno</span>
                </div>
                <input
                  type="time"
                  value={mealTimes.breakfast}
                  onChange={(e) => handleMealTimeChange('breakfast', e.target.value)}
                  className="text-sm text-gray-600 bg-transparent border-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <i className="ri-sun-fill text-orange-500"></i>
                  <span className="text-sm font-medium text-gray-700">Almuerzo</span>
                </div>
                <input
                  type="time"
                  value={mealTimes.lunch}
                  onChange={(e) => handleMealTimeChange('lunch', e.target.value)}
                  className="text-sm text-gray-600 bg-transparent border-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <i className="ri-apple-line text-red-500"></i>
                  <span className="text-sm font-medium text-gray-700">Snack</span>
                </div>
                <input
                  type="time"
                  value={mealTimes.snack}
                  onChange={(e) => handleMealTimeChange('snack', e.target.value)}
                  className="text-sm text-gray-600 bg-transparent border-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <i className="ri-moon-line text-indigo-500"></i>
                  <span className="text-sm font-medium text-gray-700">Cena</span>
                </div>
                <input
                  type="time"
                  value={mealTimes.dinner}
                  onChange={(e) => handleMealTimeChange('dinner', e.target.value)}
                  className="text-sm text-gray-600 bg-transparent border-none focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <i className="ri-drop-line text-cyan-500"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Recordatorios de hidratación</h3>
                <p className="text-sm text-gray-500">Mantente hidratado durante el día</p>
              </div>
            </div>
            <button
              onClick={() => setWaterReminders(!waterReminders)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                waterReminders ? 'bg-cyan-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  waterReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {waterReminders && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Intervalo de recordatorio</label>
                  <span className="text-sm text-gray-600">Cada {waterInterval} minutos</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="15"
                  value={waterInterval}
                  onChange={(e) => setWaterInterval(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30 min</span>
                  <span>180 min</span>
                </div>
              </div>

              <div className="bg-cyan-50 rounded-xl p-4">
                <h4 className="font-medium text-cyan-800 mb-2">Horario de hidratación recomendado</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cyan-700">Al despertar</span>
                    <span className="text-cyan-600">500ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">Antes de cada comida</span>
                    <span className="text-cyan-600">250ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">Durante ejercicio</span>
                    <span className="text-cyan-600">150-250ml cada 15-20 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">Antes de dormir</span>
                    <span className="text-cyan-600">200ml (2h antes)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-run-line text-blue-500"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Recordatorios de ejercicio</h3>
                <p className="text-sm text-gray-500">No olvides tu rutina diaria</p>
              </div>
            </div>
            <button
              onClick={() => setWorkoutReminders(!workoutReminders)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                workoutReminders ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  workoutReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {workoutReminders && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <i className="ri-time-line text-blue-500"></i>
                  <span className="text-sm font-medium text-gray-700">Hora de ejercicio</span>
                </div>
                <input
                  type="time"
                  value={workoutTime}
                  onChange={(e) => setWorkoutTime(e.target.value)}
                  className="text-sm text-gray-600 bg-transparent border-none focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <button
                    key={day}
                    className="aspect-square bg-blue-100 rounded-xl flex items-center justify-center text-sm font-medium text-blue-600"
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Configuración de notificaciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-sound-line text-gray-500"></i>
                <span className="text-sm font-medium text-gray-700">Sonido</span>
              </div>
              <button className="text-sm text-blue-500">Cambiar</button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-vibration-line text-gray-500"></i>
                <span className="text-sm font-medium text-gray-700">Vibración</span>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-moon-clear-line text-gray-500"></i>
                <span className="text-sm font-medium text-gray-700">No molestar (22:00 - 07:00)</span>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
              </button>
            </div>
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
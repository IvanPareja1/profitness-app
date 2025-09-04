'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState({
    meals: true,
    workouts: true,
    hydration: false,
    progress: true,
    achievements: true,
    tips: false,
    social: true,
    marketing: false
  });

  const [timeSettings, setTimeSettings] = useState({
    breakfastTime: '08:00',
    lunchTime: '13:00',
    dinnerTime: '20:00',
    workoutTime: '18:00',
    bedtimeReminder: '22:00'
  });

  const [frequency, setFrequency] = useState({
    hydration: 'hourly',
    progress: 'weekly',
    tips: 'daily'
  });

  const toggleNotification = (type: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };

  const updateTimeSettings = (type: string, value: string) => {
    setTimeSettings(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const updateFrequency = (type: string, value: string) => {
    setFrequency(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const saveSettings = () => {
    alert('Configuración de notificaciones guardada exitosamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Notificaciones</h1>
          <button 
            onClick={saveSettings}
            className="text-sm font-medium text-purple-600"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        
        {/* Notification Types */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tipos de Notificaciones</h2>
          
          <div className="space-y-4">
            {/* Meals */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-restaurant-line text-orange-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Recordatorios de Comidas</p>
                  <p className="text-xs text-gray-500">Desayuno, almuerzo y cena</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('meals')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.meals ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.meals ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Workouts */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-run-line text-blue-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Recordatorios de Ejercicio</p>
                  <p className="text-xs text-gray-500">Entrenamientos programados</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('workouts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.workouts ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.workouts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Hydration */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-drop-line text-cyan-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Recordatorios de Hidratación</p>
                  <p className="text-xs text-gray-500">Beber agua regularmente</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('hydration')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.hydration ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.hydration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-bar-chart-line text-green-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Actualizaciones de Progreso</p>
                  <p className="text-xs text-gray-500">Resúmenes semanales</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('progress')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.progress ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.progress ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Achievements */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-award-line text-yellow-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Logros y Metas</p>
                  <p className="text-xs text-gray-500">Cuando alcances objetivos</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('achievements')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.achievements ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.achievements ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tips */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-lightbulb-line text-indigo-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Consejos Diarios</p>
                  <p className="text-xs text-gray-500">Tips de salud y bienestar</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('tips')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.tips ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.tips ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Social */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-group-line text-pink-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Actividad Social</p>
                  <p className="text-xs text-gray-500">Likes, comentarios y seguidores</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('social')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.social ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.social ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-megaphone-line text-red-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Promociones y Ofertas</p>
                  <p className="text-xs text-gray-500">Noticias y descuentos especiales</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotification('marketing')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.marketing ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Time Settings */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Horarios de Recordatorios</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-sun-line text-orange-600 text-sm"></i>
                </div>
                <span className="font-medium text-gray-800">Desayuno</span>
              </div>
              <input
                type="time"
                value={timeSettings.breakfastTime}
                onChange={(e) => updateTimeSettings('breakfastTime', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-sun-fill text-yellow-600 text-sm"></i>
                </div>
                <span className="font-medium text-gray-800">Almuerzo</span>
              </div>
              <input
                type="time"
                value={timeSettings.lunchTime}
                onChange={(e) => updateTimeSettings('lunchTime', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-moon-line text-purple-600 text-sm"></i>
                </div>
                <span className="font-medium text-gray-800">Cena</span>
              </div>
              <input
                type="time"
                value={timeSettings.dinnerTime}
                onChange={(e) => updateTimeSettings('dinnerTime', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-run-line text-blue-600 text-sm"></i>
                </div>
                <span className="font-medium text-gray-800">Ejercicio</span>
              </div>
              <input
                type="time"
                value={timeSettings.workoutTime}
                onChange={(e) => updateTimeSettings('workoutTime', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-moon-clear-line text-indigo-600 text-sm"></i>
                </div>
                <span className="font-medium text-gray-800">Recordatorio de descanso</span>
              </div>
              <input
                type="time"
                value={timeSettings.bedtimeReminder}
                onChange={(e) => updateTimeSettings('bedtimeReminder', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Frecuencia</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-drop-line text-cyan-600 text-sm"></i>
                  </div>
                  <span className="font-medium text-gray-800">Hidratación</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['30min', 'hourly', '2hrs'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => updateFrequency('hydration', freq)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      frequency.hydration === freq
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {freq === '30min' ? '30 min' : freq === 'hourly' ? 'Cada hora' : 'Cada 2h'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-bar-chart-line text-green-600 text-sm"></i>
                  </div>
                  <span className="font-medium text-gray-800">Progreso</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['daily', 'weekly', 'monthly'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => updateFrequency('progress', freq)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      frequency.progress === freq
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {freq === 'daily' ? 'Diario' : freq === 'weekly' ? 'Semanal' : 'Mensual'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-lightbulb-line text-indigo-600 text-sm"></i>
                  </div>
                  <span className="font-medium text-gray-800">Consejos</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['daily', '3days', 'weekly'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => updateFrequency('tips', freq)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      frequency.tips === freq
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {freq === 'daily' ? 'Diario' : freq === '3days' ? 'Cada 3 días' : 'Semanal'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">No Molestar</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">Desde:</span>
              <input
                type="time"
                defaultValue="22:00"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">Hasta:</span>
              <input
                type="time"
                defaultValue="07:00"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-gray-800">Activar modo silencioso</span>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Durante estas horas no recibirás notificaciones, excepto las marcadas como urgentes.
            </p>
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

'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RestSchedulePage() {
  const [schedule, setSchedule] = useState<any>({
    monday: { type: 'workout', activity: 'Cardio' },
    tuesday: { type: 'workout', activity: 'Fuerza' },
    wednesday: { type: 'rest', activity: 'Descanso' },
    thursday: { type: 'workout', activity: 'Yoga' },
    friday: { type: 'workout', activity: 'HIIT' },
    saturday: { type: 'workout', activity: 'Cardio' },
    sunday: { type: 'rest', activity: 'Descanso' }
  });

  const [restFrequency, setRestFrequency] = useState('2'); // días por semana
  const [autoSchedule, setAutoSchedule] = useState(true);

  const daysOfWeek = [
    { id: 'monday', name: 'Lunes', short: 'Lun' },
    { id: 'tuesday', name: 'Martes', short: 'Mar' },
    { id: 'wednesday', name: 'Miércoles', short: 'Mié' },
    { id: 'thursday', name: 'Jueves', short: 'Jue' },
    { id: 'friday', name: 'Viernes', short: 'Vie' },
    { id: 'saturday', name: 'Sábado', short: 'Sáb' },
    { id: 'sunday', name: 'Domingo', short: 'Dom' }
  ];

  const workoutTypes = [
    'Cardio',
    'Fuerza',
    'HIIT',
    'Yoga',
    'Pilates',
    'Funcional',
    'Natación',
    'Ciclismo'
  ];

  const toggleDayType = (dayId: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        type: prev[dayId].type === 'workout' ? 'rest' : 'workout',
        activity: prev[dayId].type === 'workout' ? 'Descanso' : 'Cardio'
      }
    }));
  };

  const updateActivity = (dayId: string, activity: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        activity
      }
    }));
  };

  const generateAutoSchedule = () => {
    const restDays = parseInt(restFrequency);
    const newSchedule = { ...schedule };

    // Reset all to workout first
    Object.keys(newSchedule).forEach((day: any) => {
      newSchedule[day] = { type: 'workout', activity: 'Cardio' };
    });

    // Distribute rest days evenly
    const dayKeys = Object.keys(newSchedule);
    const interval = Math.floor(7 / restDays);

    for (let i = 0; i < restDays; i++) {
      const dayIndex = (i * interval + 2) % 7; // Start from Wednesday
      const dayKey = dayKeys[dayIndex];
      newSchedule[dayKey] = { type: 'rest', activity: 'Descanso' };
    }

    setSchedule(newSchedule);
  };

  const saveSchedule = () => {
    alert('Planificación guardada correctamente');
    // Aquí se guardaría en la base de datos
  };

  const restDaysCount = Object.values(schedule).filter((day: any) => day.type === 'rest').length;
  const workoutDaysCount = 7 - restDaysCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/rest-day" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Planificar Descanso</h1>
          <button 
            onClick={saveSchedule}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Schedule Summary */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen Semanal</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{restDaysCount}</p>
              <p className="text-sm text-gray-600">Días de descanso</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{workoutDaysCount}</p>
              <p className="text-sm text-gray-600">Días de entrenamiento</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 font-medium">💡 Recomendación</p>
            <p className="text-xs text-blue-700">
              Se recomienda 1-2 días de descanso por semana para recuperación óptima
            </p>
          </div>
        </div>

        {/* Auto Schedule */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Planificación Automática</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSchedule}
                onChange={(e) => setAutoSchedule(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {autoSchedule && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de descanso por semana
                </label>
                <select
                  value={restFrequency}
                  onChange={(e) => setRestFrequency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="1">1 día</option>
                  <option value="2">2 días</option>
                  <option value="3">3 días</option>
                </select>
              </div>

              <button
                onClick={generateAutoSchedule}
                className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
              >
                Generar Planificación Automática
              </button>
            </div>
          )}
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Planificación Semanal</h3>

          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day.id} className="p-4 border border-gray-100 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      schedule[day.id].type === 'rest' 
                        ? 'bg-green-100' 
                        : 'bg-purple-100'
                    }`}>
                      {schedule[day.id].type === 'rest' ? (
                        <i className="ri-zzz-line text-green-600 text-sm"></i>
                      ) : (
                        <i className="ri-run-line text-purple-600 text-sm"></i>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{day.name}</p>
                      <p className="text-sm text-gray-600">{schedule[day.id].activity}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDayType(day.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      schedule[day.id].type === 'rest'
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}
                  >
                    {schedule[day.id].type === 'rest' ? 'Descanso' : 'Entrenar'}
                  </button>
                </div>

                {/* Activity Selection for Workout Days */}
                {schedule[day.id].type === 'workout' && (
                  <div className="ml-13">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Tipo de entrenamiento
                    </label>
                    <select
                      value={schedule[day.id].activity}
                      onChange={(e) => updateActivity(day.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {workoutTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rest Day Activities */}
                {schedule[day.id].type === 'rest' && (
                  <div className="ml-13">
                    <p className="text-xs text-gray-600 mb-2">Actividades sugeridas:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Estiramientos', 'Meditación', 'Caminata', 'Masajes'].map((activity) => (
                        <span 
                          key={activity}
                          className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-medium text-blue-800 mb-2">💡 Consejos para planificar</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Evita entrenamientos intensos consecutivos</li>
              <li>• Programa descanso después de entrenamientos de fuerza</li>
              <li>• Los domingos son ideales para descanso completo</li>
              <li>• Escucha a tu cuerpo y ajusta según sea necesario</li>
            </ul>
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
          <Link href="/profile" className="flex flex-col items-center justify-center">
            <i className="ri-user-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

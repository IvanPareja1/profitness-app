
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RestDayPage() {
  const [isRestDay, setIsRestDay] = useState(true);
  const [restActivities, setRestActivities] = useState<any[]>([
    { id: 1, name: 'Meditación', duration: 15, completed: true, time: '09:00' },
    { id: 2, name: 'Estiramiento suave', duration: 20, completed: false, time: '16:00' },
    { id: 3, name: 'Caminata ligera', duration: 30, completed: false, time: '18:00' }
  ]);

  const recoveryTips = [
    {
      icon: 'ri-zzz-line',
      title: 'Descanso de calidad',
      description: 'Duerme 7-9 horas para recuperación muscular',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: 'ri-drop-line',
      title: 'Hidratación extra',
      description: 'Bebe más agua para eliminar toxinas',
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      icon: 'ri-restaurant-line',
      title: 'Nutrición adecuada',
      description: 'Consume proteínas para reparar músculos',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: 'ri-body-scan-line',
      title: 'Actividad suave',
      description: 'Yoga o estiramientos ligeros',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const weekSchedule = [
    { day: 'Lun', isRest: false, workout: 'Cardio' },
    { day: 'Mar', isRest: false, workout: 'Fuerza' },
    { day: 'Mié', isRest: true, workout: 'Descanso' },
    { day: 'Jue', isRest: false, workout: 'Yoga' },
    { day: 'Vie', isRest: false, workout: 'HIIT' },
    { day: 'Sáb', isRest: false, workout: 'Cardio' },
    { day: 'Dom', isRest: true, workout: 'Descanso' }
  ];

  const toggleActivityComplete = (id: number) => {
    setRestActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, completed: !activity.completed }
          : activity
      )
    );
  };

  const completedActivities = restActivities.filter(a => a.completed).length;
  const totalActivities = restActivities.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Día de Descanso</h1>
          <Link href="/rest-day/schedule" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-calendar-line text-gray-600 text-lg"></i>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Rest Day Status */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-zzz-fill text-white text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {isRestDay ? '¡Es tu día de descanso!' : 'Día de entrenamiento'}
            </h2>
            <p className="text-sm text-gray-600">
              {isRestDay 
                ? 'Relájate y permite que tu cuerpo se recupere'
                : 'Tienes entrenamientos programados hoy'
              }
            </p>
          </div>

          {isRestDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-lg font-bold text-green-600">{completedActivities}/{totalActivities}</p>
                <p className="text-xs text-gray-600">Actividades</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-lg font-bold text-blue-600">2</p>
                <p className="text-xs text-gray-600">Días seguidos</p>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Planificación Semanal</h3>
            <Link href="/rest-day/schedule" className="text-green-600 text-sm font-medium">
              Editar
            </Link>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekSchedule.map((day, index) => (
              <div key={index} className="text-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 mx-auto ${
                  day.isRest 
                    ? 'bg-green-100' 
                    : index === 1 ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {day.isRest ? (
                    <i className="ri-zzz-line text-green-600 text-sm"></i>
                  ) : (
                    <i className="ri-run-line text-gray-600 text-sm"></i>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-800">{day.day}</p>
                <p className="text-xs text-gray-500">{day.workout}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rest Day Activities */}
        {isRestDay && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Actividades de Recuperación</h3>
            
            <div className="space-y-3">
              {restActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`p-4 border rounded-xl transition-all ${
                    activity.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleActivityComplete(activity.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          activity.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {activity.completed && (
                          <i className="ri-check-line text-white text-sm"></i>
                        )}
                      </button>
                      <div>
                        <p className={`font-medium ${
                          activity.completed ? 'text-green-800 line-through' : 'text-gray-800'
                        }`}>
                          {activity.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.time} • {activity.duration} min
                        </p>
                      </div>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600">
                      <i className="ri-play-circle-line text-lg"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors">
              <i className="ri-add-line mr-2"></i>
              Agregar actividad
            </button>
          </div>
        )}

        {/* Recovery Tips */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Consejos de Recuperación</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {recoveryTips.map((tip, index) => (
              <div key={index} className="p-3 border border-gray-100 rounded-xl">
                <div className={`w-10 h-10 ${tip.color} rounded-lg flex items-center justify-center mb-3`}>
                  <i className={`${tip.icon} text-sm`}></i>
                </div>
                <h4 className="font-medium text-gray-800 text-sm mb-1">{tip.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-sm">
          <div className="text-center">
            <i className="ri-double-quotes-l text-2xl opacity-60 mb-3 block"></i>
            <p className="text-lg font-medium mb-2">
              "El descanso no es pereza, es parte del entrenamiento"
            </p>
            <p className="text-sm opacity-80">
              Tu cuerpo se fortalece durante el descanso, no durante el ejercicio
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
          <Link href="/profile" className="flex flex-col items-center justify-center">
            <i className="ri-user-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

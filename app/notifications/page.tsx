
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Notifications() {
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailReminders: false,
    weeklyReports: true,
    mealReminders: true,
    weightReminders: true,
    goalAchievements: true,
    socialUpdates: false,
    appUpdates: true
  });

  const [reminderTimes, setReminderTimes] = useState({
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:00',
    weigh: '07:00'
  });

  const [showCustomTime, setShowCustomTime] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState('');
  const [showMarkAllModal, setShowMarkAllModal] = useState(false);

  const [recentNotifications, setRecentNotifications] = useState([
    {
      id: 1,
      type: 'meal',
      title: '¡Hora del almuerzo!',
      message: 'No olvides registrar tu comida',
      time: '13:00',
      date: 'Hoy',
      read: false
    },
    {
      id: 2,
      type: 'achievement',
      title: '¡Meta alcanzada! ',
      message: 'Has cumplido tu objetivo de proteínas',
      time: '10:30',
      date: 'Hoy',
      read: true
    },
    {
      id: 3,
      type: 'weight',
      title: 'Recordatorio de pesaje',
      message: 'Es hora de registrar tu peso',
      time: '07:00',
      date: 'Hoy',
      read: true
    },
    {
      id: 4,
      type: 'weekly',
      title: 'Reporte semanal',
      message: 'Tu progreso de la semana está listo',
      time: '09:00',
      date: 'Ayer',
      read: true
    }
  ]);

  const handleToggle = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleTimeChange = (reminder: string, time: string) => {
    setReminderTimes(prev => ({
      ...prev,
      [reminder]: time
    }));
  };

  const openTimeSelector = (reminderType: string) => {
    setSelectedReminder(reminderType);
    setShowCustomTime(true);
  };

  const handleMarkAllAsRead = () => {
    setRecentNotifications(prev => 
      prev.map(notification => ({ 
        ...notification, 
        read: true 
      }))
    );
    setShowMarkAllModal(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return 'ri-restaurant-line';
      case 'achievement':
        return 'ri-trophy-line';
      case 'weight':
        return 'ri-scales-3-line';
      case 'weekly':
        return 'ri-file-chart-line';
      default:
        return 'ri-notification-line';
    }
  };

  const unreadCount = recentNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
          </Link>
          <h1 className="text-lg font-semibold">Notificaciones</h1>
          <button 
            onClick={() => setShowMarkAllModal(true)}
            className="text-blue-600 text-sm font-medium"
            disabled={unreadCount === 0}
          >
            Marcar leídas
          </button>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4">
        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Notificaciones</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Recibe alertas en tu dispositivo</p>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Recordatorios de comida</p>
                <p className="text-sm text-gray-500">Alertas para registrar comidas</p>
              </div>
              <button
                onClick={() => handleToggle('mealReminders')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationSettings.mealReminders ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationSettings.mealReminders ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Recordatorio de pesaje</p>
                <p className="text-sm text-gray-500">Alerta diaria para registrar peso</p>
              </div>
              <button
                onClick={() => handleToggle('weightReminders')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationSettings.weightReminders ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationSettings.weightReminders ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Logros y metas</p>
                <p className="text-sm text-gray-500">Celebra tus objetivos cumplidos</p>
              </div>
              <button
                onClick={() => handleToggle('goalAchievements')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationSettings.goalAchievements ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationSettings.goalAchievements ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Reportes semanales</p>
                <p className="text-sm text-gray-500">Resumen de tu progreso</p>
              </div>
              <button
                onClick={() => handleToggle('weeklyReports')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationSettings.weeklyReports ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationSettings.weeklyReports ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Times */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Horarios de Recordatorios</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="ri-sun-line text-yellow-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Desayuno</p>
                  <p className="text-sm text-gray-500">Recordatorio matutino</p>
                </div>
              </div>
              <button
                onClick={() => openTimeSelector('breakfast')}
                className="text-blue-600 font-medium"
              >
                {reminderTimes.breakfast}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="ri-sun-fill text-orange-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Almuerzo</p>
                  <p className="text-sm text-gray-500">Recordatorio del mediodía</p>
                </div>
              </div>
              <button
                onClick={() => openTimeSelector('lunch')}
                className="text-blue-600 font-medium"
              >
                {reminderTimes.lunch}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-moon-line text-purple-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Cena</p>
                  <p className="text-sm text-gray-500">Recordatorio nocturno</p>
                </div>
              </div>
              <button
                onClick={() => openTimeSelector('dinner')}
                className="text-blue-600 font-medium"
              >
                {reminderTimes.dinner}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-scales-3-line text-blue-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Pesaje diario</p>
                  <p className="text-sm text-gray-500">Registro de peso</p>
                </div>
              </div>
              <button
                onClick={() => openTimeSelector('weigh')}
                className="text-blue-600 font-medium"
              >
                {reminderTimes.weigh}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Notificaciones Recientes</h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-xl transition-colors ${
                  !notification.read ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.type === 'meal' ? 'bg-green-100' :
                  notification.type === 'achievement' ? 'bg-yellow-100' :
                  notification.type === 'weight' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  <i className={`${getNotificationIcon(notification.type)} ${
                    notification.type === 'meal' ? 'text-green-600' :
                    notification.type === 'achievement' ? 'text-yellow-600' :
                    notification.type === 'weight' ? 'text-blue-600' :
                    'text-purple-600'
                  } text-lg`}></i>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${!notification.read ? 'text-blue-800' : 'text-gray-800'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.date} • {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mark All as Read Modal */}
      {showMarkAllModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-notification-line text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Marcar como Leídas</h3>
            <p className="text-gray-600 mb-6">
              ¿Quieres marcar todas las notificaciones como leídas? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMarkAllModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl !rounded-button"
              >
                Marcar Todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Selector Modal */}
      {showCustomTime && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Seleccionar Hora</h3>
              <button 
                onClick={() => setShowCustomTime(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>
            
            <div className="mb-6">
              <input
                type="time"
                value={reminderTimes[selectedReminder as keyof typeof reminderTimes]}
                onChange={(e) => handleTimeChange(selectedReminder, e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onClick={() => handleTimeChange(selectedReminder, '07:00')}
                className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium !rounded-button"
              >
                07:00
              </button>
              <button
                onClick={() => handleTimeChange(selectedReminder, '13:00')}
                className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium !rounded-button"
              >
                13:00
              </button>
              <button
                onClick={() => handleTimeChange(selectedReminder, '19:00')}
                className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium !rounded-button"
              >
                19:00
              </button>
            </div>

            <button
              onClick={() => setShowCustomTime(false)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium !rounded-button"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-home-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Inicio</span>
          </Link>
          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-pie-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Nutrición</span>
          </Link>
          <Link href="/add-food" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-1">
              <i className="ri-add-line text-white text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Agregar</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-line-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-user-line text-blue-600 text-lg"></i>
            </div>
            <span className="text-xs text-blue-600 font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

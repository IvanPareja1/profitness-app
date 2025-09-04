'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DevicesPage() {
  const [connectedDevices, setConnectedDevices] = useState([
    {
      id: 1,
      name: 'Apple Watch Series 9',
      type: 'smartwatch',
      connected: true,
      battery: 78,
      lastSync: '2 min ago'
    }
  ]);

  const [availableDevices] = useState([
    {
      id: 2,
      name: 'Fitbit Charge 5',
      type: 'fitness_tracker',
      connected: false
    },
    {
      id: 3,
      name: 'Garmin Forerunner 245',
      type: 'smartwatch',
      connected: false
    },
    {
      id: 4,
      name: 'Xiaomi Mi Band 7',
      type: 'fitness_tracker',
      connected: false
    },
    {
      id: 5,
      name: 'Báscula Inteligente',
      type: 'scale',
      connected: false
    }
  ]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch':
        return 'ri-device-line';
      case 'fitness_tracker':
        return 'ri-fitness-line';
      case 'scale':
        return 'ri-scales-3-line';
      default:
        return 'ri-bluetooth-line';
    }
  };

  const connectDevice = (deviceId: number) => {
    // Simular conexión de dispositivo
    alert('Conectando dispositivo...');
  };

  const disconnectDevice = (deviceId: number) => {
    setConnectedDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Dispositivos</h1>
          </div>
          <button className="w-8 h-8 flex items-center justify-center">
            <i className="ri-refresh-line text-gray-600 text-xl"></i>
          </button>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dispositivos Conectados</h2>
          
          {connectedDevices.length > 0 ? (
            <div className="space-y-4">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <i className={`${getDeviceIcon(device.type)} text-green-500 text-xl`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{device.name}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-4">
                        <span>Sincronizado {device.lastSync}</span>
                        {device.battery && (
                          <span className="flex items-center space-x-1">
                            <i className="ri-battery-line text-xs"></i>
                            <span>{device.battery}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <button 
                      onClick={() => disconnectDevice(device.id)}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-bluetooth-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500">No hay dispositivos conectados</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dispositivos Disponibles</h2>
          
          <div className="space-y-4">
            {availableDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <i className={`${getDeviceIcon(device.type)} text-gray-500 text-xl`}></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{device.name}</div>
                    <div className="text-sm text-gray-500">Disponible para conexión</div>
                  </div>
                </div>
                <button 
                  onClick={() => connectDevice(device.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Conectar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Datos que se sincronizan</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-heart-pulse-line text-blue-500"></i>
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Frecuencia cardíaca</div>
                <div className="text-xs text-gray-500">Monitoreo continuo durante ejercicio</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-footprint-line text-orange-500"></i>
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Pasos y distancia</div>
                <div className="text-xs text-gray-500">Actividad diaria y caminatas</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-fire-line text-purple-500"></i>
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Calorías quemadas</div>
                <div className="text-xs text-gray-500">Gasto energético total</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <i className="ri-moon-line text-indigo-500"></i>
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Calidad del sueño</div>
                <div className="text-xs text-gray-500">Fases y duración del descanso</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-scales-3-line text-green-500"></i>
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Peso y composición</div>
                <div className="text-xs text-gray-500">Masa grasa, muscular y ósea</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Configuración de privacidad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-800 text-sm">Compartir datos con terceros</div>
                <div className="text-xs text-gray-500">Para análisis y mejoras</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-800 text-sm">Sincronización automática</div>
                <div className="text-xs text-gray-500">Actualizar datos en segundo plano</div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-800 text-sm">Notificaciones de dispositivo</div>
                <div className="text-xs text-gray-500">Alertas de batería baja y conexión</div>
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
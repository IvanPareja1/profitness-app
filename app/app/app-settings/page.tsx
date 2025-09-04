'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AppSettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('es');
  const [units, setUnits] = useState('metric');
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Configuración</h1>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Apariencia</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-moon-line text-gray-500"></i>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Modo oscuro</div>
                  <div className="text-xs text-gray-500">Cambiar tema de la aplicación</div>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Idioma y Región</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm appearance-none"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sistema de unidades</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm appearance-none"
              >
                <option value="metric">Métrico (kg, cm, °C)</option>
                <option value="imperial">Imperial (lb, ft, °F)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos y Sincronización</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-refresh-line text-gray-500"></i>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Sincronización automática</div>
                  <div className="text-xs text-gray-500">Actualizar datos en segundo plano</div>
                </div>
              </div>
              <button
                onClick={() => setAutoSync(!autoSync)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoSync ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-download-cloud-line text-gray-500"></i>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Exportar datos</div>
                  <div className="text-xs text-gray-500">Descargar información personal</div>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-delete-bin-line text-red-500"></i>
                <div>
                  <div className="font-medium text-red-600 text-sm">Borrar todos los datos</div>
                  <div className="text-xs text-gray-500">Esta acción no se puede deshacer</div>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Rendimiento</h2>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-delete-bin-6-line text-gray-500"></i>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Limpiar caché</div>
                  <div className="text-xs text-gray-500">Liberar espacio de almacenamiento</div>
                </div>
              </div>
              <span className="text-sm text-gray-500">124 MB</span>
            </button>

            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-information-line text-blue-500"></i>
                <span className="text-sm font-medium text-blue-600">Uso de almacenamiento</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Datos de la app</span>
                  <span className="text-blue-600">45 MB</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Imágenes y caché</span>
                  <span className="text-blue-600">124 MB</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Base de datos</span>
                  <span className="text-blue-600">12 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Avanzado</h2>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-bug-line text-gray-500"></i>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Modo desarrollador</div>
                  <div className="text-xs text-gray-500">Opciones de depuración</div>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <i className="ri-shield-check-line text-gray-500"></i>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Diagnósticos</div>
                  <div className="text-xs text-gray-500">Enviar reportes de errores</div>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </button>

            <div className="border-t border-gray-100 pt-4">
              <div className="text-center text-xs text-gray-500">
                <p>ProFitness v2.1.0</p>
                <p>Build 2024.01.15</p>
              </div>
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
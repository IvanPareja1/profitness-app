'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PrivacyPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('friends');
  const [workoutVisibility, setWorkoutVisibility] = useState('private');
  const [progressVisibility, setProgressVisibility] = useState('friends');

  const privacyLevels = [
    { id: 'public', name: 'Público', description: 'Visible para todos los usuarios', icon: 'ri-earth-line' },
    { id: 'friends', name: 'Solo Amigos', description: 'Solo tus contactos pueden ver', icon: 'ri-user-line' },
    { id: 'private', name: 'Privado', description: 'Solo tú puedes ver', icon: 'ri-lock-line' }
  ];

  const dataTypes = [
    { 
      id: 'personal', 
      name: 'Información Personal', 
      description: 'Nombre, email, teléfono, edad',
      retention: '2 años',
      icon: 'ri-user-3-line'
    },
    { 
      id: 'health', 
      name: 'Datos de Salud', 
      description: 'Peso, altura, condiciones médicas',
      retention: '5 años',
      icon: 'ri-heart-pulse-line'
    },
    { 
      id: 'activity', 
      name: 'Actividad Física', 
      description: 'Ejercicios, rutinas, progreso',
      retention: '3 años',
      icon: 'ri-run-line'
    },
    { 
      id: 'nutrition', 
      name: 'Nutrición', 
      description: 'Comidas, calorías, macronutrientes',
      retention: '1 año',
      icon: 'ri-restaurant-line'
    }
  ];

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos permanentemente.'
    );
    
    if (confirmDelete) {
      const finalConfirm = window.confirm(
        'ÚLTIMA ADVERTENCIA: Se eliminarán todos tus datos, progreso, fotos y conexiones. Escribe "ELIMINAR" para confirmar.'
      );
      
      if (finalConfirm) {
        alert('Proceso de eliminación iniciado. Recibirás un email de confirmación.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Privacidad y Seguridad</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Security Settings */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
              <i className="ri-shield-check-line text-red-600 text-lg"></i>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Configuración de Seguridad</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <i className="ri-smartphone-line text-gray-400 text-lg mr-3"></i>
                <div>
                  <p className="font-medium text-gray-800">Autenticación de Dos Factores</p>
                  <p className="text-sm text-gray-600">Protección adicional para tu cuenta</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <i className="ri-fingerprint-line text-gray-400 text-lg mr-3"></i>
                <div>
                  <p className="font-medium text-gray-800">Acceso Biométrico</p>
                  <p className="text-sm text-gray-600">Huella dactilar o reconocimiento facial</p>
                </div>
              </div>
              <button
                onClick={() => setBiometricEnabled(!biometricEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  biometricEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <Link href="/profile/change-password" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <i className="ri-lock-password-line text-gray-400 text-lg mr-3"></i>
                <div>
                  <p className="font-medium text-gray-800">Cambiar Contraseña</p>
                  <p className="text-sm text-gray-600">Actualiza tu contraseña actual</p>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <i className="ri-eye-line text-blue-600 text-lg"></i>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Visibilidad del Perfil</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-800 mb-2">Información del Perfil</p>
              <div className="space-y-2">
                {privacyLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setProfileVisibility(level.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      profileVisibility === level.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className={`${level.icon} text-gray-600 text-lg mr-3`}></i>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{level.name}</p>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                    </div>
                    {profileVisibility === level.id && (
                      <i className="ri-check-line text-purple-600 text-lg"></i>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-800 mb-2">Rutinas de Ejercicio</p>
              <div className="grid grid-cols-3 gap-2">
                {privacyLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setWorkoutVisibility(level.id)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      workoutVisibility === level.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-800 mb-2">Progreso y Estadísticas</p>
              <div className="grid grid-cols-3 gap-2">
                {privacyLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setProgressVisibility(level.id)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      progressVisibility === level.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
              <i className="ri-database-2-line text-green-600 text-lg"></i>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Gestión de Datos</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <i className="ri-map-pin-line text-gray-400 text-lg mr-3"></i>
                <div>
                  <p className="font-medium text-gray-800">Datos de Ubicación</p>
                  <p className="text-sm text-gray-600">Para encontrar gimnasios cercanos</p>
                </div>
              </div>
              <button
                onClick={() => setLocationEnabled(!locationEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  locationEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    locationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <i className="ri-bar-chart-line text-gray-400 text-lg mr-3"></i>
                <div>
                  <p className="font-medium text-gray-800">Análisis y Métricas</p>
                  <p className="text-sm text-gray-600">Para mejorar la experiencia</p>
                </div>
              </div>
              <button
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  analyticsEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    analyticsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {dataTypes.map((dataType) => (
              <div key={dataType.id} className="flex items-center justify-between py-3 border-t border-gray-100">
                <div className="flex items-center">
                  <i className={`${dataType.icon} text-gray-400 text-lg mr-3`}></i>
                  <div>
                    <p className="font-medium text-gray-800">{dataType.name}</p>
                    <p className="text-sm text-gray-600">{dataType.description}</p>
                    <p className="text-xs text-gray-500">Retención: {dataType.retention}</p>
                  </div>
                </div>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">
                  Gestionar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Links */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
              <i className="ri-file-text-line text-amber-600 text-lg"></i>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Información Legal</h2>
          </div>

          <div className="space-y-3">
            <Link href="/legal/privacy-policy" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <i className="ri-shield-check-line text-gray-400 text-lg mr-3"></i>
                <p className="font-medium text-gray-800">Política de Privacidad</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>

            <Link href="/legal/terms" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <i className="ri-file-list-line text-gray-400 text-lg mr-3"></i>
                <p className="font-medium text-gray-800">Términos de Servicio</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>

            <Link href="/legal/cookies" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <i className="ri-cookie-line text-gray-400 text-lg mr-3"></i>
                <p className="font-medium text-gray-800">Política de Cookies</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-red-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
              <i className="ri-error-warning-line text-red-600 text-lg"></i>
            </div>
            <h2 className="text-lg font-bold text-red-600">Zona de Peligro</h2>
          </div>

          <div className="space-y-4">
            <Link href="/profile/export" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <i className="ri-download-line text-gray-400 text-lg mr-3"></i>
                <div>
                  <p className="font-medium text-gray-800">Descargar Mis Datos</p>
                  <p className="text-sm text-gray-600">Exporta toda tu información</p>
                </div>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
            </Link>

            <button 
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center py-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              <i className="ri-delete-bin-line text-lg mr-2"></i>
              Eliminar Cuenta Permanentemente
            </button>

            <div className="bg-red-50 p-4 rounded-xl">
              <p className="text-xs text-red-700 text-center">
                ⚠️ La eliminación de cuenta es irreversible. Se perderán todos tus datos, progreso y conexiones de forma permanente.
              </p>
            </div>
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
          <Link href="/profile" className="flex flex-col items-center justify-center bg-purple-50">
            <i className="ri-user-fill text-purple-600 text-lg"></i>
            <span className="text-xs text-purple-600 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Modal from '../../components/ui/Modal';

export default function Profile() {
  const { userProfile, profilePhoto, mounted } = useUserProfile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const getGoalText = (goal: string) => {
    const goalTexts: { [key: string]: string } = {
      'fat_loss': 'Pérdida de grasa',
      'muscle_gain': 'Ganancia muscular',
      'recomposition': 'Recomposición corporal',
      'maintenance': 'Mantenimiento'
    };
    return goalTexts[goal] || 'Objetivo personal';
  };

  const getActivityLevelText = (level: string) => {
    const activityTexts: { [key: string]: string } = {
      'sedentary': 'Sedentaria',
      'light': 'Ligeramente activa',
      'moderate': 'Moderadamente activa',
      'very': 'Muy activa',
      'extra': 'Extremadamente activa'
    };
    return activityTexts[level] || 'Moderadamente activa';
  };

  const handleShareApp = (platform: string) => {
    const appName = "Profitness";
    const appDescription = "Nutre tu progreso, domina tus resultados";
    const downloadLink = "https://profitness.app/download";
    const message = `¡Hola! Te recomiendo ${appName} - ${appDescription}. Descárgala aquí: ${downloadLink}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(downloadLink)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Te recomiendo ${appName}`)}&body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(downloadLink).then(() => {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        });
        break;
    }
    setShowShareModal(false);
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Perfil</h1>
          <Link href="/settings" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-settings-line text-gray-600 text-lg"></i>
          </Link>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 mt-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">MG</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{userProfile.name}</h2>
              <p className="text-gray-600">{userProfile.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {getGoalText(userProfile.goal)}
                </span>
              </div>
            </div>
          </div>

          <Link href="/edit-profile">
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold !rounded-button">
              Editar Perfil
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-calendar-check-line text-blue-600 text-lg"></i>
            </div>
            <p className="text-xl font-bold text-gray-800">52</p>
            <p className="text-sm text-gray-500">Días activos</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-scales-3-line text-green-600 text-lg"></i>
            </div>
            <p className="text-xl font-bold text-gray-800">-3.3 kg</p>
            <p className="text-sm text-gray-500">Peso perdido</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-fire-line text-orange-600 text-lg"></i>
            </div>
            <p className="text-xl font-bold text-gray-800">12</p>
            <p className="text-sm text-gray-500">Días seguidos</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-restaurant-line text-purple-600 text-lg"></i>
            </div>
            <p className="text-xl font-bold text-gray-800">234</p>
            <p className="text-sm text-gray-500">Comidas registradas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="ri-cake-line text-gray-600 text-sm"></i>
                </div>
                <span className="text-gray-700">Edad</span>
              </div>
              <span className="font-medium text-gray-800">{userProfile.age} años</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="ri-ruler-line text-gray-600 text-sm"></i>
                </div>
                <span className="text-gray-700">Altura</span>
              </div>
              <span className="font-medium text-gray-800">{userProfile.height} cm</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="ri-scales-3-line text-gray-600 text-sm"></i>
                </div>
                <span className="text-gray-700">Peso actual</span>
              </div>
              <span className="font-medium text-gray-800">{userProfile.currentWeight} kg</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="ri-flag-line text-gray-600 text-sm"></i>
                </div>
                <span className="text-gray-700">Peso objetivo</span>
              </div>
              <span className="font-medium text-gray-800">{userProfile.goalWeight} kg</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="ri-run-line text-gray-600 text-sm"></i>
                </div>
                <span className="text-gray-700">Nivel de actividad</span>
              </div>
              <span className="font-medium text-gray-800">{getActivityLevelText(userProfile.activityLevel)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <Link href="/notifications">
            <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-notification-line text-blue-600 text-sm"></i>
                </div>
                <span className="text-gray-700">Notificaciones</span>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400 text-lg"></i>
            </button>
          </Link>

          <button
            onClick={() => setShowShareModal(true)}
            className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-share-line text-green-600 text-sm"></i>
              </div>
              <span className="text-gray-700">Compartir app</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-lg"></i>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-logout-box-line text-red-600 text-sm"></i>
              </div>
              <span className="text-red-600">Cerrar sesión</span>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-lg"></i>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Profitness v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Nutre tu progreso, domina tus resultados</p>
        </div>
      </main>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Compartir Profitness"
        size="sm"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="ri-share-line text-white text-2xl"></i>
          </div>
          <p className="text-gray-600 text-sm">
            Comparte Profitness con tus amigos y familiares para que también puedan llevar un estilo de vida saludable
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleShareApp('whatsapp')}
            className="w-full flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors !rounded-button"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <i className="ri-whatsapp-line text-white text-lg"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">WhatsApp</p>
              <p className="text-sm text-gray-500">Compartir por mensaje</p>
            </div>
          </button>

          <button
            onClick={() => handleShareApp('copy')}
            className="w-full flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors !rounded-button"
          >
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-4">
              <i className="ri-file-copy-line text-white text-lg"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Copiar enlace</p>
              <p className="text-sm text-gray-500">Copiar al portapapeles</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Cerrar Sesión"
        size="sm"
        showCloseButton={false}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="ri-logout-box-line text-red-600 text-xl"></i>
          </div>
          <p className="text-gray-600">¿Estás seguro que quieres cerrar sesión?</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors !rounded-button"
          >
            Cancelar
          </button>
          <button className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors !rounded-button">
            Cerrar Sesión
          </button>
        </div>
      </Modal>

      {/* Success Message */}
      {showCopySuccess && (
        <div className="fixed top-20 left-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 max-w-sm mx-auto">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <i className="ri-check-line text-white text-sm"></i>
            </div>
            <span className="text-sm font-medium">Enlace copiado al portapapeles</span>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

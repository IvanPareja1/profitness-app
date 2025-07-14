
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Modal from '../../components/ui/Modal';

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentario', description: 'Poco o ningún ejercicio' },
  { id: 'light', label: 'Ligero', description: '1-3 días por semana' },
  { id: 'moderate', label: 'Moderado', description: '3-5 días por semana' },
  { id: 'very', label: 'Activo', description: '6-7 días por semana' },
  { id: 'extra', label: 'Muy Activo', description: '2 veces al día' }
];

const GOALS = [
  { id: 'fat_loss', label: 'Perder Peso', icon: 'ri-scales-3-line' },
  { id: 'muscle_gain', label: 'Ganar Músculo', icon: 'ri-fitness-line' },
  { id: 'recomposition', label: 'Recomposición', icon: 'ri-exchange-line' },
  { id: 'maintenance', label: 'Mantenimiento', icon: 'ri-heart-pulse-line' }
];

export default function EditProfile() {
  const { userProfile, profilePhoto, mounted, updateProfile, updateProfilePhoto } = useUserProfile();
  const [formData, setFormData] = useState(userProfile);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(profilePhoto);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoOption = (option: string) => {
    setShowPhotoModal(false);

    switch (option) {
      case 'camera':
        setTimeout(() => {
          const cameraPhotoUrl = 'https://readdy.ai/api/search-image?query=Professional%20female%20portrait%20photo%2C%20business%20headshot%2C%20clean%20white%20background%2C%20natural%20lighting%2C%20friendly%20smile%2C%20modern%20professional%20photography%20style%2C%20high%20quality&width=96&height=96&seq=camera1&orientation=squarish';
          setCurrentPhoto(cameraPhotoUrl);
        }, 1000);
        break;
      case 'gallery':
        setTimeout(() => {
          const galleryPhotoUrl = 'https://readdy.ai/api/search-image?query=Professional%20female%20portrait%20photo%2C%20business%20headshot%2C%20clean%20white%20background%2C%20natural%20lighting%2C%20friendly%20smile%2C%20modern%20professional%20photography%20style%2C%20high%20quality&width=96&height=96&seq=gallery1&orientation=squarish';
          setCurrentPhoto(galleryPhotoUrl);
        }, 1000);
        break;
      case 'remove':
        setCurrentPhoto('');
        break;
    }
  };

  const handleSave = () => {
    try {
      updateProfile(formData);
      updateProfilePhoto(currentPhoto);

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
    }
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
          </Link>
          <h1 className="text-lg font-semibold">Editar Perfil</h1>
          <button 
            onClick={handleSave}
            className="text-blue-600 font-medium"
          >
            Guardar
          </button>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4">
        {/* Profile Photo */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 mt-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
              {currentPhoto ? (
                <img 
                  src={currentPhoto}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">MG</span>
              )}
            </div>
            <button 
              onClick={() => setShowPhotoModal(true)}
              className="text-blue-600 font-medium"
            >
              Cambiar foto
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleInputChange('gender', 'female')}
                  className={`p-4 rounded-xl border-2 transition-all text-center !rounded-button ${
                    formData.gender === 'female'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    formData.gender === 'female' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <i className={`ri-women-line text-lg ${
                      formData.gender === 'female' ? 'text-blue-600' : 'text-gray-600'
                    }`}></i>
                  </div>
                  <p className={`text-sm font-medium ${
                    formData.gender === 'female' ? 'text-blue-800' : 'text-gray-800'
                  }`}>
                    Mujer
                  </p>
                </button>

                <button
                  onClick={() => handleInputChange('gender', 'male')}
                  className={`p-4 rounded-xl border-2 transition-all text-center !rounded-button ${
                    formData.gender === 'male'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    formData.gender === 'male' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <i className={`ri-men-line text-lg ${
                      formData.gender === 'male' ? 'text-blue-600' : 'text-gray-600'
                    }`}></i>
                  </div>
                  <p className={`text-sm font-medium ${
                    formData.gender === 'male' ? 'text-blue-800' : 'text-gray-800'
                  }`}>
                    Hombre
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas Corporales</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso actual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.currentWeight}
                onChange={(e) => handleInputChange('currentWeight', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso objetivo (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.goalWeight}
                onChange={(e) => handleInputChange('goalWeight', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Activity Level */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nivel de Actividad</h3>
          
          <div className="space-y-3">
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => handleInputChange('activityLevel', level.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all !rounded-button ${
                  formData.activityLevel === level.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{level.label}</p>
                    <p className="text-sm text-gray-500">{level.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    formData.activityLevel === level.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.activityLevel === level.id && (
                      <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Goal Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Objetivo</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleInputChange('goal', goal.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center !rounded-button ${
                  formData.goal === goal.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  formData.goal === goal.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <i className={`${goal.icon} text-lg ${
                    formData.goal === goal.id ? 'text-blue-600' : 'text-gray-600'
                  }`}></i>
                </div>
                <p className={`text-sm font-medium ${
                  formData.goal === goal.id ? 'text-blue-800' : 'text-gray-800'
                }`}>
                  {goal.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg !rounded-button"
        >
          Guardar Cambios
        </button>
      </main>

      {/* Photo Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="Cambiar Foto"
        size="sm"
      >
        <div className="space-y-3">
          <button
            onClick={() => handlePhotoOption('camera')}
            className="w-full flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors !rounded-button"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <i className="ri-camera-line text-blue-600 text-lg"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Tomar foto</p>
              <p className="text-sm text-gray-500">Usar la cámara</p>
            </div>
          </button>

          <button
            onClick={() => handlePhotoOption('gallery')}
            className="w-full flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors !rounded-button"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <i className="ri-image-line text-green-600 text-lg"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Seleccionar de galería</p>
              <p className="text-sm text-gray-500">Elegir foto existente</p>
            </div>
          </button>

          {currentPhoto && (
            <button
              onClick={() => handlePhotoOption('remove')}
              className="w-full flex items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors !rounded-button"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <i className="ri-delete-bin-line text-red-600 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Eliminar foto</p>
                <p className="text-sm text-gray-500">Volver a iniciales</p>
              </div>
            </button>
          )}
        </div>

        <button
          onClick={() => setShowPhotoModal(false)}
          className="w-full mt-4 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
        >
          Cancelar
        </button>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
        size="sm"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-600 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Perfil Actualizado!</h3>
          <p className="text-gray-600">Tus cambios han sido guardados exitosamente</p>
        </div>
      </Modal>

      <BottomNavigation />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function GoalsPage() {
  const [goalType, setGoalType] = useState('automatic');
  const [automaticGoals] = useState({
    goal: 'Perder peso',
    activityLevel: 'Moderadamente activa',
    calories: 2100,
    protein: 120,
    carbs: 230,
    fats: 80
  });

  const [customGoals, setCustomGoals] = useState({
    calories: 1800,
    protein: 140,
    carbs: 150,
    fats: 60
  });

  const [isEditing, setIsEditing] = useState(false);

  const goalOptions = [
    { id: 'lose', name: 'Perder peso', description: 'Déficit calórico para pérdida de grasa' },
    { id: 'maintain', name: 'Mantener peso', description: 'Equilibrio calórico para mantenimiento' },
    { id: 'gain', name: 'Ganar músculo', description: 'Superávit calórico para ganancia muscular' }
  ];

  const activityLevels = [
    { id: 'sedentary', name: 'Sedentaria', description: 'Poco o ningún ejercicio' },
    { id: 'light', name: 'Ligeramente activa', description: 'Ejercicio ligero 1-3 días/semana' },
    { id: 'moderate', name: 'Moderadamente activa', description: 'Ejercicio moderado 3-5 días/semana' },
    { id: 'very', name: 'Muy activa', description: 'Ejercicio intenso 6-7 días/semana' },
    { id: 'extra', name: 'Extremadamente activa', description: 'Ejercicio muy intenso + trabajo físico' }
  ];

  const handleCustomGoalChange = (macro: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCustomGoals(prev => ({
      ...prev,
      [macro]: numValue
    }));
  };

  const saveGoals = () => {
    setIsEditing(false);
    // Aquí se guardarían las metas en la base de datos
    alert(`Metas ${goalType === 'automatic' ? 'automáticas' : 'personalizadas'} guardadas correctamente`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Objetivos Nutricionales</h1>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-8 h-8 flex items-center justify-center"
          >
            <i className={`${isEditing ? 'ri-close-line' : 'ri-edit-line'} text-gray-600 text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Goal Type Selection */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tipo de Configuración</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => setGoalType('automatic')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                goalType === 'automatic' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Automático</p>
                  <p className="text-sm text-gray-600">Calculado según tu perfil y objetivos</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  goalType === 'automatic' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {goalType === 'automatic' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </button>

            <button
              onClick={() => setGoalType('custom')}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                goalType === 'custom' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Personalizado</p>
                  <p className="text-sm text-gray-600">Valores recomendados por especialista</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  goalType === 'custom' ? 'border-purple-500' : 'border-gray-300'
                }`}>
                  {goalType === 'custom' && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </button>
          </div>

          {goalType === 'custom' && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl">
              <div className="flex items-start">
                <i className="ri-information-line text-purple-600 text-sm mr-2 mt-0.5"></i>
                <div>
                  <p className="text-sm font-medium text-purple-800">Recomendación Profesional</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Ingresa los valores exactos que te haya proporcionado tu nutricionista, dietista o entrenador personal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Automatic Goals Configuration */}
        {goalType === 'automatic' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Objetivo Principal</h3>
              <div className="space-y-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal.id}
                    className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100"
                  >
                    <p className="font-medium text-gray-800">{goal.name}</p>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Nivel de Actividad</h3>
              <div className="space-y-3">
                {activityLevels.map((level) => (
                  <button
                    key={level.id}
                    className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100"
                  >
                    <p className="font-medium text-gray-800">{level.name}</p>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Automatic Results */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Metas Calculadas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-fire-line text-orange-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Calorías</p>
                      <p className="text-sm text-gray-600">Energía diaria</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{automaticGoals.calories} kcal</p>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-heart-pulse-line text-red-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Proteínas</p>
                      <p className="text-sm text-gray-600">Construcción muscular</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{automaticGoals.protein}g</p>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-leaf-line text-green-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Carbohidratos</p>
                      <p className="text-sm text-gray-600">Energía rápida</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{automaticGoals.carbs}g</p>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-drop-line text-yellow-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Grasas</p>
                      <p className="text-sm text-gray-600">Hormonas y vitaminas</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{automaticGoals.fats}g</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Goals Configuration */}
        {goalType === 'custom' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Metas Personalizadas</h3>
              <div className="flex items-center space-x-1">
                <i className="ri-user-star-line text-purple-600 text-sm"></i>
                <span className="text-xs text-purple-600 font-medium">Especialista</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calorías diarias (kcal)
                </label>
                <div className="flex items-center p-3 border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-fire-line text-orange-600 text-sm"></i>
                  </div>
                  <input
                    type="number"
                    value={customGoals.calories}
                    onChange={(e) => handleCustomGoalChange('calories', e.target.value)}
                    disabled={!isEditing}
                    className="flex-1 text-lg font-bold text-gray-800 bg-transparent border-none outline-none"
                    placeholder="1800"
                  />
                  <span className="text-sm text-gray-500">kcal</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proteínas (gramos)
                </label>
                <div className="flex items-center p-3 border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-heart-pulse-line text-red-600 text-sm"></i>
                  </div>
                  <input
                    type="number"
                    value={customGoals.protein}
                    onChange={(e) => handleCustomGoalChange('protein', e.target.value)}
                    disabled={!isEditing}
                    className="flex-1 text-lg font-bold text-gray-800 bg-transparent border-none outline-none"
                    placeholder="140"
                  />
                  <span className="text-sm text-gray-500">g</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbohidratos (gramos)
                </label>
                <div className="flex items-center p-3 border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-leaf-line text-green-600 text-sm"></i>
                  </div>
                  <input
                    type="number"
                    value={customGoals.carbs}
                    onChange={(e) => handleCustomGoalChange('carbs', e.target.value)}
                    disabled={!isEditing}
                    className="flex-1 text-lg font-bold text-gray-800 bg-transparent border-none outline-none"
                    placeholder="150"
                  />
                  <span className="text-sm text-gray-500">g</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grasas (gramos)
                </label>
                <div className="flex items-center p-3 border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-drop-line text-yellow-600 text-sm"></i>
                  </div>
                  <input
                    type="number"
                    value={customGoals.fats}
                    onChange={(e) => handleCustomGoalChange('fats', e.target.value)}
                    disabled={!isEditing}
                    className="flex-1 text-lg font-bold text-gray-800 bg-transparent border-none outline-none"
                    placeholder="60"
                  />
                  <span className="text-sm text-gray-500">g</span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">
                  💡 <strong>Tip:</strong> Asegúrate de ingresar los valores exactos proporcionados por tu especialista.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveGoals}
                    className="py-2 px-4 bg-purple-500 text-white rounded-lg font-medium"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Macros Distribution Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución de Macronutrientes</h3>
          
          <div className="mb-4">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="bg-red-400 flex-1"></div>
              <div className="bg-green-400 flex-1"></div>
              <div className="bg-yellow-400 flex-1"></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-4 h-4 bg-red-400 rounded-full mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Proteínas</p>
              <p className="text-sm font-bold text-gray-800">
                {goalType === 'automatic' ? '23%' : '31%'}
              </p>
            </div>
            <div>
              <div className="w-4 h-4 bg-green-400 rounded-full mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Carbohidratos</p>
              <p className="text-sm font-bold text-gray-800">
                {goalType === 'automatic' ? '44%' : '33%'}
              </p>
            </div>
            <div>
              <div className="w-4 h-4 bg-yellow-400 rounded-full mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Grasas</p>
              <p className="text-sm font-bold text-gray-800">
                {goalType === 'automatic' ? '34%' : '30%'}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {!isEditing && (
          <button
            onClick={saveGoals}
            className={`w-full py-4 rounded-2xl font-medium ${
              goalType === 'automatic' 
                ? 'bg-blue-500 text-white' 
                : 'bg-purple-500 text-white'
            }`}
          >
            Aplicar Configuración
          </button>
        )}
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
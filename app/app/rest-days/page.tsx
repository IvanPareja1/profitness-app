'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RestDaysPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>(['sunday']);
  const [reducedCalories, setReducedCalories] = useState(true);
  const [calorieReduction, setCalorieReduction] = useState(200);
  const [proteinReduction, setProteinReduction] = useState(10);
  const [carbReduction, setCarbReduction] = useState(15);

  const days = [
    { id: 'monday', name: 'Lun', fullName: 'Lunes' },
    { id: 'tuesday', name: 'Mar', fullName: 'Martes' },
    { id: 'wednesday', name: 'Mié', fullName: 'Miércoles' },
    { id: 'thursday', name: 'Jue', fullName: 'Jueves' },
    { id: 'friday', name: 'Vie', fullName: 'Viernes' },
    { id: 'saturday', name: 'Sáb', fullName: 'Sábado' },
    { id: 'sunday', name: 'Dom', fullName: 'Domingo' }
  ];

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSave = () => {
    // Aquí se guardarían los días de descanso
    alert('Días de descanso guardados correctamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Días de Descanso</h1>
          </div>
          <button 
            onClick={handleSave}
            className="text-sm font-medium text-blue-500 hover:text-blue-600"
          >
            Guardar
          </button>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Selecciona tus días de descanso</h2>
          <p className="text-sm text-gray-600 mb-6">Los días de descanso ayudan a la recuperación muscular y previenen el sobreentrenamiento</p>
          
          <div className="grid grid-cols-7 gap-2 mb-6">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`aspect-square rounded-xl font-medium text-sm transition-all ${
                  selectedDays.includes(day.id)
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day.name}
              </button>
            ))}
          </div>

          {selectedDays.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-calendar-check-line text-blue-500"></i>
                <span className="text-sm font-medium text-blue-600">Días seleccionados:</span>
              </div>
              <p className="text-sm text-blue-600">
                {selectedDays.map(dayId => days.find(d => d.id === dayId)?.fullName).join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Ajuste de macronutrientes</h3>
              <p className="text-sm text-gray-500">Reduce automáticamente las metas en días de descanso</p>
            </div>
            <button
              onClick={() => setReducedCalories(!reducedCalories)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                reducedCalories ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  reducedCalories ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {reducedCalories && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Reducción de calorías</label>
                  <span className="text-sm text-gray-600">-{calorieReduction} kcal</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="50"
                  value={calorieReduction}
                  onChange={(e) => setCalorieReduction(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Reducción de proteínas</label>
                  <span className="text-sm text-gray-600">-{proteinReduction}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="5"
                  value={proteinReduction}
                  onChange={(e) => setProteinReduction(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Reducción de carbohidratos</label>
                  <span className="text-sm text-gray-600">-{carbReduction}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="5"
                  value={carbReduction}
                  onChange={(e) => setCarbReduction(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Beneficios de los días de descanso</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <i className="ri-check-line text-green-500 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Recuperación muscular</p>
                <p className="text-xs text-gray-600">Permite que los músculos se reparen y crezcan</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <i className="ri-check-line text-green-500 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Prevención de lesiones</p>
                <p className="text-xs text-gray-600">Reduce el riesgo de sobreentrenamiento</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <i className="ri-check-line text-green-500 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Equilibrio hormonal</p>
                <p className="text-xs text-gray-600">Mantiene niveles óptimos de cortisol y testosterona</p>
              </div>
            </div>
          </div>
        </div>

        <Link 
          href="/manual-macros"
          className="block w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-xl font-medium text-center"
        >
          Ajuste Manual de Macronutrientes
        </Link>
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
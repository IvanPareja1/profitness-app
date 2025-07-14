
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AddFood() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showCreateFood, setShowCreateFood] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    serving: ''
  });

  const [recentFoods, setRecentFoods] = useState([
    { name: 'Pollo a la plancha', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
    { name: 'Aguacate', calories: 160, protein: 2, carbs: 9, fats: 15 },
    { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3 }
  ]);

  const popularFoods = [
    { name: 'Huevos revueltos', calories: 155, protein: 13, carbs: 1.1, fats: 11 },
    { name: 'Avena', calories: 68, protein: 2.4, carbs: 12, fats: 1.4 },
    { name: 'Pechuga de pollo', calories: 231, protein: 43.5, carbs: 0, fats: 5 },
    { name: 'Salmón', calories: 208, protein: 20, carbs: 0, fats: 13 }
  ];

  const mealTypes = [
    { id: 'breakfast', name: 'Desayuno', icon: 'ri-sun-line' },
    { id: 'lunch', name: 'Almuerzo', icon: 'ri-sun-fill' },
    { id: 'dinner', name: 'Cena', icon: 'ri-moon-line' },
    { id: 'snack', name: 'Snack', icon: 'ri-apple-line' }
  ];

  const handleCreateFood = () => {
    if (newFood.name && newFood.calories) {
      const foodToAdd = {
        name: newFood.name,
        calories: parseFloat(newFood.calories) || 0,
        protein: parseFloat(newFood.protein) || 0,
        carbs: parseFloat(newFood.carbs) || 0,
        fats: parseFloat(newFood.fats) || 0,
        serving: newFood.serving || '1 porción'
      };

      // Agregar el nuevo alimento a la lista de recientes
      setRecentFoods(prev => [foodToAdd, ...prev]);

      // Limpiar el formulario
      setNewFood({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        serving: ''
      });

      // Cerrar el modal
      setShowCreateFood(false);

      // Mostrar mensaje de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const addFoodToMeal = (food: any) => {
    // Aquí se agregaría la lógica para agregar el alimento a la comida seleccionada
    console.log(`Agregando ${food.name} a ${selectedMeal}`);
    
    // Mostrar mensaje de éxito
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setNewFood(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center">
          <div className="w-6 h-6 flex items-center justify-center mr-3">
            <i className="ri-check-line text-lg"></i>
          </div>
          <span className="text-sm font-medium">¡Alimento agregado exitosamente!</span>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
          </Link>
          <h1 className="text-lg font-semibold">Agregar Comida</h1>
          <Link href="/scan-barcode" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-qr-scan-line text-blue-600 text-xl"></i>
          </Link>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4">
        {/* Search Bar */}
        <div className="mt-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400 text-lg"></i>
            </div>
            <input
              type="text"
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-sm"
            />
          </div>
        </div>

        {/* Meal Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Seleccionar comida</h3>
          <div className="grid grid-cols-4 gap-3">
            {mealTypes.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className={`p-3 rounded-xl text-center transition-all !rounded-button ${
                  selectedMeal === meal.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 shadow-sm'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center mx-auto mb-1">
                  <i className={`${meal.icon} text-lg`}></i>
                </div>
                <span className="text-xs font-medium">{meal.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/scan-barcode" className="bg-white rounded-xl p-4 shadow-md !rounded-button">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-qr-scan-line text-purple-600 text-xl"></i>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Escanear</h4>
            <p className="text-xs text-gray-500">Código de barras</p>
          </Link>
          <button
            onClick={() => setShowCreateFood(true)}
            className="bg-white rounded-xl p-4 shadow-md !rounded-button"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-add-circle-line text-green-600 text-xl"></i>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Crear</h4>
            <p className="text-xs text-gray-500">Alimento personalizado</p>
          </button>
        </div>

        {/* Recent Foods */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recientes</h3>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {recentFoods.map((food, index) => (
              <button
                key={index}
                onClick={() => addFoodToMeal(food)}
                className="w-full flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-800">{food.name}</h4>
                  <p className="text-sm text-gray-500">
                    {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • G: {food.fats}g
                  </p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-add-line text-blue-600 text-xl"></i>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Foods */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Populares</h3>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {popularFoods.map((food, index) => (
              <button
                key={index}
                onClick={() => addFoodToMeal(food)}
                className="w-full flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-800">{food.name}</h4>
                  <p className="text-sm text-gray-500">
                    {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • G: {food.fats}g
                  </p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-add-line text-blue-600 text-xl"></i>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Create Food Modal */}
      {showCreateFood && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Crear Alimento</h3>
              <button
                onClick={() => setShowCreateFood(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del alimento *
                </label>
                <input
                  type="text"
                  value={newFood.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Mi receta especial"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porción
                </label>
                <input
                  type="text"
                  value={newFood.serving}
                  onChange={(e) => handleInputChange('serving', e.target.value)}
                  placeholder="Ej: 1 taza, 100g, 1 unidad"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calorías *
                  </label>
                  <input
                    type="number"
                    value={newFood.calories}
                    onChange={(e) => handleInputChange('calories', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proteínas (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.protein}
                    onChange={(e) => handleInputChange('protein', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carbohidratos (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.carbs}
                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grasas (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFood.fats}
                    onChange={(e) => handleInputChange('fats', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateFood(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFood}
                disabled={!newFood.name || !newFood.calories}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
              >
                Crear
              </button>
            </div>
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
            <span className="text-xs text-blue-600 font-medium">Agregar</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-line-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

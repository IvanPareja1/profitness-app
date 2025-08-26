'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Food {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface NutrientCalculation {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function FoodSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(100);

  const categories = [
    { id: 'all', name: 'Todos', icon: 'ri-apps-line' },
    { id: 'fruits', name: 'Frutas', icon: 'ri-apple-line' },
    { id: 'vegetables', name: 'Verduras', icon: 'ri-leaf-line' },
    { id: 'proteins', name: 'Proteínas', icon: 'ri-restaurant-line' },
    { id: 'grains', name: 'Cereales', icon: 'ri-seedling-line' },
    { id: 'dairy', name: 'Lácteos', icon: 'ri-cup-line' }
  ];

  const foods: Food[] = [
    { id: 1, name: 'Manzana', category: 'fruits', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving: '100g' },
    { id: 2, name: 'Plátano', category: 'fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: '100g' },
    { id: 3, name: 'Pollo pechuga', category: 'proteins', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
    { id: 4, name: 'Arroz blanco', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: '100g' },
    { id: 5, name: 'Brócoli', category: 'vegetables', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving: '100g' },
    { id: 6, name: 'Yogur natural', category: 'dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: '100g' },
    { id: 7, name: 'Avena', category: 'grains', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, serving: '100g' },
    { id: 8, name: 'Salmón', category: 'proteins', calories: 208, protein: 25, carbs: 0, fat: 12, serving: '100g' }
  ];

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const calculateNutrients = (food: Food, qty: number): NutrientCalculation => {
    const multiplier = qty / 100;
    return {
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10
    };
  };

  const handleAddFood = () => {
    console.log('Agregando alimento:', selectedFood, quantity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/nutrition" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Agregar Alimento</h1>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar alimento..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <i className="ri-search-line text-gray-400"></i>
            </div>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <i className={`${category.icon} text-sm`}></i>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Resultados</h3>
          
          <div className="space-y-3">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedFood?.id === food.id
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{food.name}</h4>
                    <span className="text-sm text-gray-500">{food.serving}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-orange-600">{food.calories}</div>
                      <div className="text-gray-500">kcal</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{food.protein}g</div>
                      <div className="text-gray-500">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{food.carbs}g</div>
                      <div className="text-gray-500">Carbohidratos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-yellow-600">{food.fat}g</div>
                      <div className="text-gray-500">Grasas</div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-500">No se encontraron alimentos</p>
                <p className="text-sm text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </div>
        </div>

        {selectedFood && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Configurar Cantidad</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad (gramos)
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(quantity - 25, 25))}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <i className="ri-subtract-line text-gray-600"></i>
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(parseInt(e.target.value) || 0, 1))}
                  min="1"
                  className="flex-1 text-center py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={() => setQuantity(quantity + 25)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <i className="ri-add-line text-gray-600"></i>
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-3">
                {selectedFood.name} - {quantity}g
              </h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {calculateNutrients(selectedFood, quantity).calories}
                  </div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {calculateNutrients(selectedFood, quantity).protein}g
                  </div>
                  <div className="text-xs text-gray-500">Proteína</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {calculateNutrients(selectedFood, quantity).carbs}g
                  </div>
                  <div className="text-xs text-gray-500">Carbohidratos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {calculateNutrients(selectedFood, quantity).fat}g
                  </div>
                  <div className="text-xs text-gray-500">Grasas</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <Link
                href="/nutrition"
                onClick={handleAddFood}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium text-center"
              >
                Agregar Alimento
              </Link>
            </div>
          </div>
        )}
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
              <i className="ri-restaurant-fill text-green-500 text-lg"></i>
            </div>
            <span className="text-xs text-green-500 mt-1">Comida</span>
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
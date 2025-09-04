
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddFoodPage() {
  const [selectedMeal, setSelectedMeal] = useState('desayuno');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [availableFoods, setAvailableFoods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    loadFoods();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadFoods = async () => {
    try {
      const { data: foods, error } = await supabase
        .from('foods_database')
        .select('*')
        .limit(20);

      if (error) throw error;
      setAvailableFoods(foods || []);
    } catch (error) {
      console.error('Error cargando alimentos:', error);
    }
  };

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      loadFoods();
      return;
    }

    try {
      const { data: foods, error } = await supabase
        .from('foods_database')
        .select('*')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      setAvailableFoods(foods || []);
    } catch (error) {
      console.error('Error buscando alimentos:', error);
    }
  };

  const mealTypes = [
    { id: 'desayuno', name: 'Desayuno', icon: 'ri-sun-line' },
    { id: 'almuerzo', name: 'Almuerzo', icon: 'ri-sun-fill' },
    { id: 'cena', name: 'Cena', icon: 'ri-moon-line' },
    { id: 'snacks', name: 'Snacks', icon: 'ri-cake-line' }
  ];

  const recentFoods = [
    { id: 7, name: 'Ensalada César', calories: 320, time: 'Ayer' },
    { id: 8, name: 'Salmón a la plancha', calories: 280, time: 'Hace 2 días' },
    { id: 9, name: 'Batido de proteínas', calories: 180, time: 'Hace 3 días' }
  ];

  const addFoodToMeal = async (food: any) => {
    if (!user) {
      alert('Debes iniciar sesión para guardar alimentos');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/food-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'add_food_entry',
          meal_type: selectedMeal,
          food_id: food.id,
          quantity: quantity
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(` ${quantity} porción(es) de ${food.name} agregado a ${selectedMeal}`);
        setSelectedFood(null);
        setQuantity(1);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar alimento. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomFood = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      alert('Debes iniciar sesión para agregar alimentos');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const customFood = {
        name: formData.get('foodName'),
        calories: Number(formData.get('calories')),
        protein: Number(formData.get('protein')),
        carbs: Number(formData.get('carbs')),
        fats: Number(formData.get('fats'))
      };

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/food-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'add_food_entry',
          meal_type: selectedMeal,
          custom_food: customFood,
          quantity: 1
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(` ${customFood.name} agregado exitosamente a ${selectedMeal}`);
        setShowCustomForm(false);
        loadFoods(); // Recargar lista de alimentos
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar alimento personalizado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFoods = availableFoods.filter((food: any) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/food" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Agregar Comida</h1>
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="w-8 h-8 flex items-center justify-center"
          >
            <i className="ri-add-circle-line text-gray-600 text-lg"></i>
          </button>
        </div>
      </div>

      {/* Custom Food Form Modal */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Agregar Alimento Personalizado</h2>
              <button
                onClick={() => setShowCustomForm(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <form onSubmit={addCustomFood} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del alimento</label>
                <input
                  type="text"
                  name="foodName"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: Quinoa con verduras"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calorías (por 100g)</label>
                  <input
                    type="number"
                    name="calories"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proteínas (g)</label>
                  <input
                    type="number"
                    name="protein"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carbohidratos (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grasas (g)</label>
                  <input
                    type="number"
                    name="fats"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="8"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Alimento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Meal Selection */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Seleccionar comida</h2>
          <div className="grid grid-cols-4 gap-2">
            {mealTypes.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className={`py-3 px-2 rounded-xl text-xs font-medium transition-all ${
                  selectedMeal === meal.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className={`${meal.icon} text-sm block mb-1`}></i>
                {meal.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchFoods(e.target.value);
              }}
              className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Buscar alimentos..."
            />
            <i className="ri-search-line text-gray-400 text-lg absolute left-4 top-1/2 transform -translate-y-1/2"></i>
          </div>
        </div>

        {/* Quick Add Methods */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Métodos Rápidos</h3>
          <div className="grid grid-cols-3 gap-4">
            <Link href="/food/camera" className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <i className="ri-camera-line text-blue-600 text-xl"></i>
              </div>
              <p className="text-xs font-medium text-gray-800">Cámara IA</p>
            </Link>

            <Link href="/food/barcode" className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <i className="ri-qr-code-line text-purple-600 text-xl"></i>
              </div>
              <p className="text-xs font-medium text-gray-800">Código</p>
            </Link>

            <button onClick={() => setShowCustomForm(true)} className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <i className="ri-add-line text-green-600 text-xl"></i>
              </div>
              <p className="text-xs font-medium text-gray-800">Manual</p>
            </button>
          </div>
        </div>

        {/* Food Results */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Alimentos Disponibles'}
          </h3>

          {filteredFoods.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">No se encontraron alimentos</p>
              <button
                onClick={() => setShowCustomForm(true)}
                className="mt-3 text-green-600 text-sm font-medium"
              >
                Agregar alimento personalizado
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFoods.map((food: any) => (
                <div key={food.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-800">{food.name}</p>
                      <p className="text-sm text-gray-600">100g • {food.calories_per_100g} kcal</p>
                      <p className="text-xs text-gray-500">
                        P: {food.protein_per_100g}g • C: {food.carbs_per_100g}g • G: {food.fats_per_100g}g
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFood(food)}
                      className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium"
                    >
                      Agregar
                    </button>
                  </div>

                  {selectedFood?.id === food.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Cantidad:</span>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border"
                          >
                            <i className="ri-subtract-line text-gray-600"></i>
                          </button>
                          <span className="text-lg font-bold min-w-[50px] text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 0.5)}
                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border"
                          >
                            <i className="ri-add-line text-gray-600"></i>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-orange-600">{Math.round(food.calories_per_100g * quantity)}</p>
                          <p className="text-xs text-gray-500">kcal</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-600">{(food.protein_per_100g * quantity).toFixed(1)}</p>
                          <p className="text-xs text-gray-500">Proteína</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{(food.carbs_per_100g * quantity).toFixed(1)}</p>
                          <p className="text-xs text-gray-500">Carbohidratos</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-yellow-600">{(food.fats_per_100g * quantity).toFixed(1)}</p>
                          <p className="text-xs text-gray-500">Grasas</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedFood(null)}
                          className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => addFoodToMeal(food)}
                          disabled={isLoading}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50"
                        >
                          {isLoading ? 'Guardando...' : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Foods */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Alimentos Recientes</h3>
          <div className="space-y-3">
            {recentFoods.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-restaurant-line text-green-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{food.name}</p>
                    <p className="text-xs text-gray-500">{food.time} • {food.calories} kcal</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm">
                  Agregar
                </button>
              </div>
            ))}
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
          <Link href="/food" className="flex flex-col items-center justify-center bg-green-50">
            <i className="ri-restaurant-fill text-green-600 text-lg"></i>
            <span className="text-xs text-green-600 mt-1">Comida</span>
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

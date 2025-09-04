'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, callEdgeFunction, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Food {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  serving_size?: string;
  barcode?: string;
}

export default function FoodSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [selectedMeal, setSelectedMeal] = useState('desayuno');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const mealTypes = [
    { id: 'desayuno', name: 'Desayuno' },
    { id: 'almuerzo', name: 'Almuerzo' },
    { id: 'cena', name: 'Cena' },
    { id: 'snacks', name: 'Snacks' }
  ];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Error initializing user:', error);
      router.push('/auth');
    }
  };

  const searchFoods = async () => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const result = await callEdgeFunction('openfoodfacts-lookup', {
        query: searchQuery
      }, token);

      if (result.foods) {
        setSearchResults(result.foods.map((food: any) => ({
          id: food.id || food.code,
          name: food.product_name || food.name,
          brand: food.brands,
          calories: food.nutriments?.['energy-kcal_100g'] || food.calories || 0,
          protein: food.nutriments?.proteins_100g || food.protein || 0,
          carbs: food.nutriments?.carbohydrates_100g || food.carbs || 0,
          fat: food.nutriments?.fat_100g || food.fat || 0,
          fiber: food.nutriments?.fiber_100g || food.fiber || 0,
          serving_size: food.serving_size || '100g',
          barcode: food.code
        })));
      }
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFood = async (food: Food) => {
    if (!user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      await callEdgeFunction('nutrition-tracker', {
        action: 'add_food',
        userId: user.id,
        foodData: {
          food_name: food.name,
          brand: food.brand || '',
          meal_type: selectedMeal,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber || 0,
          consumed_at: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0]
        }
      }, token);

      router.push('/nutrition?added=success');
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/nutrition" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Buscar Alimentos</h1>
          </div>
          <Link href="/scan" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-qr-scan-2-line text-green-500 text-xl"></i>
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar alimentos..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800"
                onKeyPress={(e) => e.key === 'Enter' && searchFoods()}
              />
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button
              onClick={searchFoods}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium disabled:bg-gray-300"
            >
              {loading ? <i className="ri-loader-line animate-spin"></i> : 'Buscar'}
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de comida:</label>
            <div className="flex flex-wrap gap-2">
              {mealTypes.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedMeal === meal.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {meal.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((food, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{food.name}</h3>
                    {food.brand && (
                      <p className="text-sm text-gray-500 mb-2">{food.brand}</p>
                    )}
                    <p className="text-xs text-gray-400">Por {food.serving_size}</p>
                  </div>
                  <button
                    onClick={() => addFood(food)}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"
                  >
                    Agregar
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{Math.round(food.calories)}</div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-500">{Math.round(food.protein)}g</div>
                    <div className="text-xs text-gray-500">Proteína</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-500">{Math.round(food.carbs)}g</div>
                    <div className="text-xs text-gray-500">Carbohidratos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-500">{Math.round(food.fat)}g</div>
                    <div className="text-xs text-gray-500">Grasas</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && searchResults.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-600 font-medium mb-1">No se encontraron resultados</p>
            <p className="text-gray-400 text-sm">Intenta con otro término de búsqueda</p>
            <Link 
              href="/custom-food"
              className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium"
            >
              <i className="ri-add-line"></i>
              <span>Crear Alimento Personalizado</span>
            </Link>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
          <h3 className="font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/scan"
              className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-qr-scan-2-line text-green-500 text-xl"></i>
              </div>
              <h4 className="font-medium text-green-800 text-sm">Escanear Código</h4>
              <p className="text-xs text-green-600 mt-1">Información automática</p>
            </Link>

            <Link
              href="/custom-food"
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-add-line text-blue-500 text-xl"></i>
              </div>
              <h4 className="font-medium text-blue-800 text-sm">Crear Personalizado</h4>
              <p className="text-xs text-blue-600 mt-1">Alimento manual</p>
            </Link>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Inicio</span>
          </Link>
          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-pie-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Nutrición</span>
          </Link>
          <Link href="/food-search" className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-add-line text-white text-lg"></i>
            </div>
          </Link>
          <Link href="/reports" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-line-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
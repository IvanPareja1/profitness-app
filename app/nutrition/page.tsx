
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, callEdgeFunction, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target_calories: number;
}

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  meal_type: string;
  consumed_at: string;
}

export default function NutritionPage() {
  const [selectedMeal, setSelectedMeal] = useState<string>('desayuno');
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    target_calories: 2200
  });
  const [todayFoods, setTodayFoods] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const meals = [
    { id: 'desayuno', name: 'Desayuno', icon: 'ri-sun-line', calories: 450 },
    { id: 'almuerzo', name: 'Almuerzo', icon: 'ri-sun-fill', calories: 680 },
    { id: 'cena', name: 'Cena', icon: 'ri-moon-line', calories: 520 },
    { id: 'snacks', name: 'Snacks', icon: 'ri-apple-line', calories: 200 }
  ];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const currentUser = await getCurrentUser();  
      if (!currentUser) {
        // Redirigir a autenticación si no hay usuario
        router.push('/auth');
        return;
      }

      setUser(currentUser);
      await loadTodayNutrition(currentUser.id);
    } catch (error) {
      console.error('Error initializing user:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayNutrition = async (userId: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const today = new Date().toISOString().split('T')[0];

      const response = await callEdgeFunction('nutrition-tracker', {
        action: 'get_daily_nutrition',
        userId,
        date: today
      }, token);

      if (response.nutrition) {
        setNutritionData(response.nutrition);
      }

      if (response.foods) {
        setTodayFoods(response.foods);
      }
    } catch (error) {
      console.error('Error loading nutrition:', error);
    }
  };

  const addFood = async (foodData: any) => {
    if (!user) return;

    // Validar campos requeridos antes de enviar al edge function
    const requiredFields = ['food_name', 'calories', 'protein', 'carbs', 'fat', 'meal_type'];
    const fd = { ...foodData, meal_type: selectedMeal, consumed_at: new Date().toISOString() };
    const missing = requiredFields.filter(field => !(field in fd) || fd[field] === undefined || fd[field] === null || fd[field] === '');
    if (missing.length > 0) {
      alert('Faltan campos requeridos: ' + missing.join(', '));
      return;
    }

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      await callEdgeFunction('nutrition-tracker', {
        action: 'add_food',
        userId: user.id,
        foodData: fd
      }, token);

      // Recargar datos
      await loadTodayNutrition(user.id);
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const progressPercentage = (nutritionData.calories / nutritionData.target_calories) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información nutricional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Nutrición</h1>
          </div>
          <Link href="/scan" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-qr-scan-2-line text-orange-500 text-xl"></i>
          </Link>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Progreso Diario</h2>
            <span className="text-sm text-gray-500">Hoy</span>
          </div>

          <div className="relative mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">{nutritionData.calories} kcal</span>
              <span className="text-sm text-gray-600">{nutritionData.target_calories} kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-500">{nutritionData.protein}g</div>
              <div className="text-xs text-gray-500">Proteínas</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-500">{nutritionData.carbs}g</div>
              <div className="text-xs text-gray-500">Carbohidratos</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-500">{nutritionData.fat}g</div>
              <div className="text-xs text-gray-500">Grasas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Comidas del Día</h2>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {meals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  selectedMeal === meal.id
                    ? 'bg-orange-100 border-2 border-orange-300'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center mb-2 ${
                    selectedMeal === meal.id ? 'text-orange-500' : 'text-gray-400'
                  }`}
                >
                  <i className={`${meal.icon} text-lg`}></i>
                </div>
                <span
                  className={`text-xs font-medium ${
                    selectedMeal === meal.id ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  {meal.name}
                </span>
                <span className="text-xs text-gray-400">{meal.calories} kcal</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {todayFoods
              .filter((food) => food.meal_type === selectedMeal)
              .slice(-4)
              .map((food, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <i className="ri-restaurant-line text-orange-500"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{food.food_name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(food.consumed_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">{food.calories} kcal</div>
                </div>
              ))}

            {todayFoods.filter((food) => food.meal_type === selectedMeal).length === 0 && (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <i className="ri-restaurant-line text-gray-400"></i>
                </div>
                <p className="text-gray-500 text-sm">
                  No hay alimentos registrados para {meals.find((m) => m.id === selectedMeal)?.name}
                </p>
              </div>
            )}
          </div>

          <Link
            href="/food-search"
            className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-medium text-center block"
          >
            + Agregar Alimento
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/meal-plans"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-calendar-line text-green-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Planes de Comida</h3>
          </Link>

          <Link
            href="/recipes"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-book-open-line text-purple-500 text-xl"></i>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Recetas</h3>
          </Link>
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

          <Link
            href="/nutrition"
            className="flex flex-col items-center justify-center py-2"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-fill text-orange-500 text-lg"></i>
            </div>
            <span className="text-xs text-orange-500 mt-1">Comida</span>
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


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
  fiber: number;
  hydration: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  target_fiber: number;
  target_hydration: number;
}

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meal_type: string;
  consumed_at: string;
}

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    hydration: 0,
    target_calories: 2000,
    target_protein: 120,
    target_carbs: 250,
    target_fat: 67,
    target_fiber: 25,
    target_hydration: 2500
  });
  const [todayFoods, setTodayFoods] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadNutritionData(user.id, selectedDate);
    }
  }, [selectedDate, user]);

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
    } finally {
      setLoading(false);
    }
  };

  const loadNutritionData = async (userId: string, date: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/nutrition-tracker?date=${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error loading nutrition data');

      const data = await response.json();

      if (data.dailyNutrition) {
        setNutritionData({
          calories: data.dailyNutrition.total_calories || 0,
          protein: data.dailyNutrition.total_protein || 0,
          carbs: data.dailyNutrition.total_carbs || 0,
          fat: data.dailyNutrition.total_fat || 0,
          fiber: data.dailyNutrition.total_fiber || 0,
          hydration: data.dailyNutrition.total_hydration || 0,
          target_calories: data.targets?.target_calories || 2000,
          target_protein: data.targets?.target_protein || 120,
          target_carbs: data.targets?.target_carbs || 250,
          target_fat: data.targets?.target_fat || 67,
          target_fiber: data.targets?.target_fiber || 25,
          target_hydration: data.targets?.target_hydration || 2500
        });
      }

      if (data.foodEntries) {
        setTodayFoods(data.foodEntries.map((entry: any) => ({
          id: entry.id,
          food_name: entry.food_name,
          calories: entry.calories,
          protein: entry.protein || 0,
          carbs: entry.carbs || 0,
          fat: entry.fat || 0,
          fiber: entry.fiber || 0,
          meal_type: entry.meal_type,
          consumed_at: entry.created_at
        })));
      }
    } catch (error) {
      console.error('Error loading nutrition:', error);
    }
  };

  const updateHydration = async (amount: number) => {
    if (!user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      await callEdgeFunction('hydration-tracker', {
        action: amount > 0 ? 'add' : 'subtract',
        amount: Math.abs(amount),
        date: selectedDate
      }, token);

      await loadNutritionData(user.id, selectedDate);
    } catch (error) {
      console.error('Error updating hydration:', error);
    }
  };

  const updateFiber = async (amount: number) => {
    if (!user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      await callEdgeFunction('nutrition-tracker', {
        action: 'update_fiber',
        amount: amount,
        date: selectedDate
      }, token);

      await loadNutritionData(user.id, selectedDate);
    } catch (error) {
      console.error('Error updating fiber:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getProgressWidth = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información nutricional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Nutrición</h1>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-800"
          />
          <p className="text-xs text-gray-500 mt-2 capitalize">
            {formatDate(selectedDate)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Resumen Nutricional</h2>
            <Link href="/manual-macros" className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100">
              <i className="ri-settings-line"></i>
              <span>Ajustar Metas</span>
            </Link>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Calorías</span>
              <span className="font-bold text-gray-800">{nutritionData.calories} / {nutritionData.target_calories}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressWidth(nutritionData.calories, nutritionData.target_calories)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-bread-line text-green-600"></i>
              </div>
              <p className="text-xs text-gray-500 mb-1">Proteínas</p>
              <p className="font-bold text-green-600">{nutritionData.protein}g</p>
              <p className="text-xs text-gray-400">de {nutritionData.target_protein}g</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-restaurant-line text-yellow-600"></i>
              </div>
              <p className="text-xs text-gray-500 mb-1">Carbohidratos</p>
              <p className="font-bold text-yellow-600">{nutritionData.carbs}g</p>
              <p className="text-xs text-gray-400">de {nutritionData.target_carbs}g</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-drop-line text-purple-600"></i>
              </div>
              <p className="text-xs text-gray-500 mb-1">Grasas</p>
              <p className="font-bold text-purple-600">{nutritionData.fat}g</p>
              <p className="text-xs text-gray-400">de {nutritionData.target_fat}g</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <i className="ri-drop-line text-cyan-500"></i>
                <span className="font-medium text-gray-700">Hidratación</span>
              </div>
              <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                <i className="ri-settings-line text-gray-600"></i>
              </button>
            </div>
            <p className="text-xl font-bold text-cyan-600 mb-1">{nutritionData.hydration}ml</p>
            <p className="text-sm text-gray-500 mb-3">de {nutritionData.target_hydration}ml</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressWidth(nutritionData.hydration, nutritionData.target_hydration)}%` }}
              ></div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => updateHydration(250)}
                className="flex-1 bg-cyan-500 text-white py-2 rounded-xl text-sm font-medium"
              >
                +250ml
              </button>
              <button 
                onClick={() => updateHydration(-250)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm font-medium"
              >
                -250ml
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <i className="ri-plant-line text-green-500"></i>
              <span className="font-medium text-gray-700">Fibra</span>
            </div>
            <p className="text-xl font-bold text-green-600 mb-1">{nutritionData.fiber}g</p>
            <p className="text-sm text-gray-500 mb-3">de {nutritionData.target_fiber}g</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressWidth(nutritionData.fiber, nutritionData.target_fiber)}%` }}
              ></div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => updateFiber(5)}
                className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-medium"
              >
                +5g
              </button>
              <button 
                onClick={() => updateFiber(-5)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm font-medium"
              >
                -5g
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Comidas del Día</h2>
            <Link 
              href="/food-search"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium"
            >
              <i className="ri-add-line"></i>
              <span>Agregar</span>
            </Link>
          </div>

          {todayFoods.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="ri-restaurant-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-600 font-medium mb-1">No hay comidas registradas</p>
              <p className="text-gray-400 text-sm">Agrega tu primera comida para ver el resumen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayFoods.map((food, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-restaurant-line text-blue-500"></i>
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
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-600">{food.calories} kcal</div>
                    <div className="text-xs text-gray-400">
                      P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Home</span>
          </Link>
          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-pie-chart-fill text-blue-500 text-lg"></i>
            </div>
            <span className="text-xs text-blue-500 mt-1">Nutrition</span>
          </Link>
          <Link href="/food-search" className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="ri-add-line text-white text-lg"></i>
            </div>
            <span className="text-xs text-transparent mt-1">Add</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-line-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Progress</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

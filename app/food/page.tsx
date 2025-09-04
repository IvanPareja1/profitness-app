
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FoodPage() {
  const [selectedMeal, setSelectedMeal] = useState('desayuno');
  const [todaysMeals, setTodaysMeals] = useState({
    desayuno: [],
    almuerzo: [],
    cena: [],
    snacks: []
  });
  const [dailySummary, setDailySummary] = useState({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
    calories_goal: 2100,
    percentage: 0
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTodaysMeals();
      loadDailySummary();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setIsLoading(false);
  };

  const loadTodaysMeals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/food-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'get_daily_meals'
        })
      });

      const result = await response.json();

      if (result.success) {
        setTodaysMeals(result.data);
      }
    } catch (error) {
      console.error('Error cargando comidas:', error);
    }
  };

  const loadDailySummary = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/food-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'get_daily_summary'
        })
      });

      const result = await response.json();

      if (result.success) {
        setDailySummary(result.data);
      }
    } catch (error) {
      console.error('Error cargando resumen:', error);
    }
  };

  const removeFoodItem = async (mealType: string, itemId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/food-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'delete_food_entry',
          entry_id: itemId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar estado local
        setTodaysMeals(prev => ({
          ...prev,
          [mealType]: prev[mealType as keyof typeof prev].filter((item: any) => item.id !== itemId)
        }));
        // Recargar resumen
        loadDailySummary();
      }
    } catch (error) {
      console.error('Error eliminando alimento:', error);
      alert('Error al eliminar alimento');
    }
  };

  const mealTabs = [
    { id: 'desayuno', name: 'Desayuno', icon: 'ri-sun-line' },
    { id: 'almuerzo', name: 'Almuerzo', icon: 'ri-sun-fill' },
    { id: 'cena', name: 'Cena', icon: 'ri-moon-line' },
    { id: 'snacks', name: 'Snacks', icon: 'ri-cake-line' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-restaurant-line text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-4">Para registrar tus comidas necesitas una cuenta</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Registro de Comidas</h1>
          <Link href="/food/search" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-search-line text-gray-600 text-lg"></i>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Daily Summary */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Hoy, {currentDate}</h2>
              <p className="text-sm text-gray-600">
                {dailySummary.total_calories} / {dailySummary.calories_goal} kcal
              </p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - dailySummary.percentage / 100)}`}
                  className="text-green-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">{dailySummary.percentage}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Proteínas</p>
              <p className="text-sm font-bold text-red-500">{dailySummary.total_protein.toFixed(1)}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Carbohidratos</p>
              <p className="text-sm font-bold text-green-500">{dailySummary.total_carbs.toFixed(1)}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Grasas</p>
              <p className="text-sm font-bold text-yellow-500">{dailySummary.total_fats.toFixed(1)}g</p>
            </div>
          </div>
        </div>

        {/* Meal Tabs */}
        <div className="bg-white rounded-2xl p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-4 gap-1">
            {mealTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMeal(tab.id)}
                className={`py-3 px-1 rounded-xl text-xs font-medium transition-all ${
                  selectedMeal === tab.id
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={`${tab.icon} text-sm block mb-1`}></i>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Content */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 capitalize">{selectedMeal}</h3>
            <Link
              href="/food/add"
              className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <i className="ri-add-line text-green-600 text-sm"></i>
            </Link>
          </div>

          {todaysMeals[selectedMeal as keyof typeof todaysMeals].length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-restaurant-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">No has registrado comidas para {selectedMeal}</p>
              <Link
                href="/food/add"
                className="inline-block mt-3 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium"
              >
                Agregar {selectedMeal}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysMeals[selectedMeal as keyof typeof todaysMeals].map((meal: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-restaurant-line text-green-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{meal.name}</p>
                      <p className="text-xs text-gray-500">{meal.time} • {meal.calories} kcal</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600">
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => removeFoodItem(selectedMeal, meal.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Options */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Agregar Rápido</h3>
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
              <p className="text-xs font-medium text-gray-800">Código de Barras</p>
            </Link>

            <Link href="/food/search" className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <i className="ri-search-line text-orange-600 text-xl"></i>
              </div>
              <p className="text-xs font-medium text-gray-800">Buscar Manual</p>
            </Link>
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

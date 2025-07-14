'use client';

import Link from 'next/link';
import { useUserProfile } from '../hooks/useUserProfile';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BottomNavigation from '../components/ui/BottomNavigation';
import MacroCard from '../components/ui/MacroCard';

export default function Home() {
  const { userProfile, profilePhoto, mounted, dailyCalories, dailyMacros } = useUserProfile();

  // Datos simulados de consumo actual
  const consumedCalories = 1456;
  const consumedMacros = {
    protein: { consumed: 89 },
    carbs: { consumed: 165 },
    fats: { consumed: 52 }
  };

  const remainingCalories = dailyCalories - consumedCalories;
  const calorieProgress = (consumedCalories / dailyCalories) * 100;

  const getGoalText = (goal: string) => {
    const goalTexts: { [key: string]: string } = {
      'fat_loss': 'Pérdida de Grasa',
      'muscle_gain': 'Ganancia Muscular',
      'recomposition': 'Recomposición',
      'maintenance': 'Mantenimiento'
    };
    return goalTexts[goal] || 'Objetivo Personal';
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <i className="ri-nutrition-line text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold" style={{fontFamily: "Pacifico, serif"}}>Profitness</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-user-line text-gray-600 text-lg"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4">
        {/* Welcome Section */}
        <div className="mt-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">¡Hola, {userProfile.name.split(' ')[0]}!</h2>
          <p className="text-gray-600">Nutre tu progreso, domina tus resultados</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {getGoalText(userProfile.goal)}
            </span>
            <span className="text-xs text-gray-500">
              Meta: {userProfile.goalWeight}kg
            </span>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Progreso Diario</h3>
            <span className="text-sm text-gray-500">Hoy</span>
          </div>

          {/* Calories Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Calorías</span>
              <span className="text-sm text-gray-600">{consumedCalories} / {dailyCalories}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {remainingCalories > 0 ? `${remainingCalories} calorías restantes` : `${Math.abs(remainingCalories)} calorías excedidas`}
            </p>
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-4">
            <MacroCard 
              label="Proteínas"
              consumed={consumedMacros.protein.consumed}
              target={dailyMacros.protein.target}
              color="red"
            />
            <MacroCard 
              label="Carbohidratos"
              consumed={consumedMacros.carbs.consumed}
              target={dailyMacros.carbs.target}
              color="yellow"
            />
            <MacroCard 
              label="Grasas"
              consumed={consumedMacros.fats.consumed}
              target={dailyMacros.fats.target}
              color="green"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/add-food" className="bg-white rounded-xl p-4 shadow-md !rounded-button">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-add-line text-blue-600 text-xl"></i>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Agregar Comida</h4>
            <p className="text-xs text-gray-500">Registra tus alimentos</p>
          </Link>
          <Link href="/scan-barcode" className="bg-white rounded-xl p-4 shadow-md !rounded-button">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-qr-scan-line text-purple-600 text-xl"></i>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Escanear</h4>
            <p className="text-xs text-gray-500">Código de barras</p>
          </Link>
        </div>

        {/* Weight Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Peso Actual</h3>
            <Link href="/weight-tracking" className="text-blue-600 text-sm">Ver historial</Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-3xl font-bold text-gray-800">{userProfile.currentWeight} kg</p>
              <p className="text-sm text-green-600">-0.8 kg esta semana</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${((userProfile.currentWeight - userProfile.goalWeight) / (75.2 - userProfile.goalWeight)) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(userProfile.currentWeight - userProfile.goalWeight).toFixed(1)} kg restantes
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-arrow-down-line text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Comidas Recientes</h3>
            <Link href="/meal-history" className="text-blue-600 text-sm">Ver todas</Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="https://readdy.ai/api/search-image?query=Realistic%20grilled%20chicken%20breast%20with%20vegetables%2C%20high-quality%20food%20photography%2C%20appetizing%20presentation%2C%20natural%20lighting%2C%20clean%20white%20background%2C%20professional%20food%20styling&width=60&height=60&seq=meal1&orientation=squarish"
                alt="Pollo a la plancha"
                className="w-12 h-12 rounded-lg object-cover object-top"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Pollo a la plancha</p>
                <p className="text-sm text-gray-500">Almuerzo • 450 kcal</p>
              </div>
              <span className="text-sm text-gray-400">14:30</span>
            </div>
            <div className="flex items-center space-x-3">
              <img 
                src="https://readdy.ai/api/search-image?query=Greek%20yogurt%20with%20berries%20and%20granola%2C%20healthy%20breakfast%20bowl%2C%20fresh%20fruits%2C%20clean%20food%20photography%2C%20white%20background%2C%20natural%20lighting&width=60&height=60&seq=meal2&orientation=squarish"
                alt="Yogur con frutos rojos"
                className="w-12 h-12 rounded-lg object-cover object-top"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">Yogur con frutos rojos</p>
                <p className="text-sm text-gray-500">Desayuno • 280 kcal</p>
              </div>
              <span className="text-sm text-gray-400">08:15</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
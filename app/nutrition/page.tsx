
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Nutrition() {
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [mounted, setMounted] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showHydrationModal, setShowHydrationModal] = useState(false);
  const [showHydrationSettings, setShowHydrationSettings] = useState(false);
  const [hydrationGoal, setHydrationGoal] = useState(2.5);
  const [currentHydration, setCurrentHydration] = useState(2.1);
  const [hydrationReminders, setHydrationReminders] = useState({
    enabled: false,
    interval: 3, // horas
    amount: 250, // ml
    startTime: '07:00',
    endTime: '22:00'
  });
  const [tempHydrationGoal, setTempHydrationGoal] = useState(2.5);
  const [tempReminders, setTempReminders] = useState({
    enabled: false,
    interval: 3,
    amount: 250,
    startTime: '07:00',
    endTime: '22:00'
  });

  const [showLiquidIntakeModal, setShowLiquidIntakeModal] = useState(false);
  const [liquidIntake, setLiquidIntake] = useState([
    { type: 'water', name: 'Agua', amount: 1500, icon: 'ri-drop-line', color: 'blue' },
    { type: 'coffee', name: 'Café', amount: 300, icon: 'ri-cup-line', color: 'orange' },
    { type: 'tea', name: 'Té', amount: 200, icon: 'ri-cup-line', color: 'green' },
    { type: 'juice', name: 'Jugos', amount: 150, icon: 'ri-glass-line', color: 'purple' }
  ]);
  const [selectedLiquidType, setSelectedLiquidType] = useState('water');
  const [customAmount, setCustomAmount] = useState('');
  const [showFiberModal, setShowFiberModal] = useState(false);
  const [fiberGoal, setFiberGoal] = useState(30);
  const [currentFiber, setCurrentFiber] = useState(28);
  const [fiberFoods, setFiberFoods] = useState([
    { name: 'Avena', fiber: 10, icon: 'ri-bowl-line', category: 'Cereales' },
    { name: 'Manzana', fiber: 4, icon: 'ri-apple-line', category: 'Frutas' },
    { name: 'Brócoli', fiber: 8, icon: 'ri-leaf-line', category: 'Verduras' },
    { name: 'Lentejas', fiber: 6, icon: 'ri-bowl-line', category: 'Legumbres' }
  ]);

  const dailyMacros = {
    protein: { consumed: 89, target: 140, percentage: 64 },
    carbs: { consumed: 165, target: 215, percentage: 77 },
    fats: { consumed: 52, target: 72, percentage: 72 }
  };

  const mealBreakdown = [
    { 
      name: 'Desayuno', 
      calories: 420, 
      protein: 25, 
      carbs: 45, 
      fats: 18,
      foods: ['Yogur griego', 'Granola', 'Frutos rojos']
    },
    { 
      name: 'Almuerzo', 
      calories: 650, 
      protein: 42, 
      carbs: 58, 
      fats: 22,
      foods: ['Pollo a la plancha', 'Arroz integral', 'Ensalada']
    },
    { 
      name: 'Merienda', 
      calories: 180, 
      protein: 8, 
      carbs: 25, 
      fats: 6,
      foods: ['Manzana', 'Mantequilla de maní']
    },
    { 
      name: 'Cena', 
      calories: 520, 
      protein: 35, 
      carbs: 42, 
      fats: 18,
      foods: ['Salmón', 'Quinoa', 'Brócoli']
    }
  ];

  const totalCalories = mealBreakdown.reduce((sum, meal) => sum + meal.calories, 0);
  const calorieTarget = 2150;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleExportData = () => {
    setShowOptionsMenu(false);
    console.log('Exportando datos de nutrición...');
  };

  const handleShareProgress = () => {
    setShowOptionsMenu(false);
    console.log('Compartiendo progreso...');
  };

  const handlePrintReport = () => {
    setShowOptionsMenu(false);
    console.log('Imprimiendo reporte...');
  };

  const handleHydrationClick = () => {
    setShowHydrationModal(true);
  };

  const handleAddWater = (amount: number) => {
    const newAmount = Math.min(currentHydration + amount / 1000, hydrationGoal);
    setCurrentHydration(parseFloat(newAmount.toFixed(1)));
  };

  const handleHydrationSettings = () => {
    setTempHydrationGoal(hydrationGoal);
    setTempReminders(hydrationReminders);
    setShowHydrationModal(false);
    setShowHydrationSettings(true);
  };

  const handleSaveHydrationSettings = () => {
    setHydrationGoal(tempHydrationGoal);
    setHydrationReminders(tempReminders);

    // Calcular recordatorios automáticos
    if (tempReminders.enabled) {
      const totalHours = calculateTotalActiveHours(tempReminders.startTime, tempReminders.endTime);
      const reminderCount = Math.floor(totalHours / tempReminders.interval);
      const calculatedAmount = Math.round((tempHydrationGoal * 1000) / reminderCount);

      setTempReminders(prev => ({ 
        ...prev, 
        amount: calculatedAmount 
      }));
      setHydrationReminders(prev => ({ 
        ...prev, 
        amount: calculatedAmount 
      }));

      console.log(`Configurado: ${calculatedAmount}ml cada ${tempReminders.interval} horas`);
      console.log(`Total de recordatorios: ${reminderCount} durante ${totalHours} horas`);
    }

    setShowHydrationSettings(false);
  };

  const calculateTotalActiveHours = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const totalMinutes = endMinutes > startMinutes ? 
      endMinutes - startMinutes : 
      (24 * 60) - startMinutes + endMinutes;

    return Math.round(totalMinutes / 60);
  };

  const getHydrationPercentage = () => {
    return Math.min((currentHydration / hydrationGoal) * 100, 100);
  };

  const handleAddLiquid = (amount: number, type: string = 'water') => {
    // Solo actualizar la meta de hidratación si es agua
    if (type === 'water') {
      const newAmount = Math.min(currentHydration + amount / 1000, hydrationGoal);
      setCurrentHydration(parseFloat(newAmount.toFixed(1)));
    }

    // Actualizar el registro de líquidos
    setLiquidIntake(prev => 
      prev.map(liquid => 
        liquid.type === type 
          ? { ...liquid, amount: liquid.amount + amount }
          : liquid
      )
    );
  };

  const handleCustomAmountAdd = () => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0 && amount <= 2000) {
      handleAddLiquid(amount, selectedLiquidType);
      setCustomAmount('');
    }
  };

  const getTotalLiquidIntake = () => {
    return liquidIntake.reduce((total, liquid) => total + liquid.amount, 0);
  };

  const getFiberPercentage = () => {
    return Math.min((currentFiber / fiberGoal) * 100, 100);
  };

  const handleAddFiber = (fiberAmount) => {
    const newAmount = Math.min(currentFiber + fiberAmount, fiberGoal * 1.5);
    setCurrentFiber(newAmount);
  };

  const getFiberRecommendations = () => {
    const remaining = fiberGoal - currentFiber;
    if (remaining <= 0) return [];

    const recommendations = [
      { name: '1 taza de frambuesas', fiber: 8, icon: 'ri-apple-line' },
      { name: '1 pera mediana', fiber: 6, icon: 'ri-apple-line' },
      { name: '1/2 taza de frijoles', fiber: 7, icon: 'ri-bowl-line' },
      { name: '1 rebanada de pan integral', fiber: 3, icon: 'ri-cake-line' },
      { name: '1 taza de espinacas', fiber: 4, icon: 'ri-leaf-line' },
      { name: '2 cucharadas de semillas de chía', fiber: 10, icon: 'ri-seedling-line' }
    ];

    return recommendations.filter(rec => rec.fiber <= remaining + 3);
  };

  useEffect(() => {
    setMounted(true);

    // Cargar configuraciones guardadas
    const savedHydrationGoal = localStorage.getItem('hydrationGoal');
    const savedCurrentHydration = localStorage.getItem('currentHydration');
    const savedReminders = localStorage.getItem('hydrationReminders');

    if (savedHydrationGoal) {
      setHydrationGoal(parseFloat(savedHydrationGoal));
    }
    if (savedCurrentHydration) {
      setCurrentHydration(parseFloat(savedCurrentHydration));
    }
    if (savedReminders) {
      setHydrationReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Guardar configuraciones
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hydrationGoal', hydrationGoal.toString());
      localStorage.setItem('currentHydration', currentHydration.toString());
      localStorage.setItem('hydrationReminders', JSON.stringify(hydrationReminders));
    }
  }, [hydrationGoal, currentHydration, hydrationReminders, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Nutrición</h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowDatePicker(true)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <i className="ri-calendar-line text-gray-600 text-lg"></i>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-more-line text-gray-600 text-lg"></i>
              </button>

              {/* Options Menu Dropdown */}
              {showOptionsMenu && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-48 z-50">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-download-line text-blue-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700">Exportar datos</span>
                  </button>

                  <button
                    onClick={handleShareProgress}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-share-line text-green-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700">Compartir progreso</span>
                  </button>

                  <button
                    onClick={handlePrintReport}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-printer-line text-purple-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700">Imprimir reporte</span>
                  </button>

                  <div className="border-t border-gray-100 my-2"></div>

                  <Link href="/nutrition-settings" className="block">
                    <button className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-settings-line text-gray-600 text-sm"></i>
                      </div>
                      <span className="text-gray-700">Configuración</span>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4">
        {/* Selected Date Display */}
        <div className="mt-6 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Fecha seleccionada</p>
            <p className="text-lg font-semibold text-gray-800">{formatDate(selectedDate)}</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-1 shadow-sm">
            <div className="grid grid-cols-3 gap-1">
              {[ 
                { id: 'day', label: 'Día' },
                { id: 'week', label: 'Semana' },
                { id: 'month', label: 'Mes' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all !rounded-button ${ 
                    selectedPeriod === period.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calories Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{totalCalories} kcal</h2>
            <p className="text-gray-600">de {calorieTarget} kcal objetivo</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((totalCalories / calorieTarget) * 100, 100)}%` }} 
              ></div>
            </div>
          </div>

          {/* Macros Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${dailyMacros.protein.percentage}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">{dailyMacros.protein.percentage}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">Proteínas</p>
              <p className="text-xs text-gray-500">{dailyMacros.protein.consumed}g / {dailyMacros.protein.target}g</p>
            </div>

            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray={`${dailyMacros.carbs.percentage}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-600">{dailyMacros.carbs.percentage}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">Carbohidratos</p>
              <p className="text-xs text-gray-500">{dailyMacros.carbs.consumed}g / {dailyMacros.carbs.target}g</p>
            </div>

            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${dailyMacros.fats.percentage}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">{dailyMacros.fats.percentage}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">Grasas</p>
              <p className="text-xs text-gray-500">{dailyMacros.fats.consumed}g / {dailyMacros.fats.target}g</p>
            </div>
          </div>
        </div>

        {/* Meal Breakdown */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Desglose por comidas</h3>
            <Link href="/add-food" className="text-blue-600 text-sm">Agregar comida</Link>
          </div>

          <div className="space-y-4">
            {mealBreakdown.map((meal, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">{meal.name}</h4>
                  <span className="text-sm font-medium text-gray-600">{meal.calories} kcal</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Proteínas</p>
                    <p className="text-sm font-semibold text-red-600">{meal.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Carbohidratos</p>
                    <p className="text-sm font-semibold text-yellow-600">{meal.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Grasas</p>
                    <p className="text-sm font-semibold text-green-600">{meal.fats}g</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {meal.foods.map((food, foodIndex) => (
                    <span 
                      key={foodIndex}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleHydrationClick}
            className="bg-white rounded-xl p-4 shadow-md text-center hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-drop-line text-blue-600 text-lg"></i>
            </div>
            <p className="text-xs text-gray-500 mb-1">Hidratación</p>
            <p className="text-lg font-bold text-gray-800">{currentHydration}L</p>
            <p className="text-xs text-gray-400">Meta: {hydrationGoal}L</p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${getHydrationPercentage()}%` }} 
              ></div>
            </div>
          </button>

          <button 
            onClick={() => setShowFiberModal(true)}
            className="bg-white rounded-xl p-4 shadow-md text-center hover:bg-green-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-leaf-line text-green-600 text-lg"></i>
            </div>
            <p className="text-xs text-gray-500 mb-1">Fibra</p>
            <p className="text-lg font-bold text-gray-800">{currentFiber}g</p>
            <p className="text-xs text-gray-400">Meta: {fiberGoal}g</p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${getFiberPercentage()}%` }} 
              ></div>
            </div>
          </button>
        </div>

        {/* Liquid Intake Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Ingesta de Líquidos</h3>
            <button 
              onClick={() => setShowLiquidIntakeModal(true)}
              className="text-blue-600 text-sm font-medium"
            >
              + Agregar
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Total del día</p>
                <p className="text-xl font-bold text-gray-800">{(getTotalLiquidIntake() / 1000).toFixed(1)}L</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-glass-line text-blue-600 text-lg"></i>
              </div>
            </div>

            <div className="space-y-3">
              {liquidIntake.map((liquid, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-${liquid.color}-100 rounded-full flex items-center justify-center`}>
                      <i className={`${liquid.icon} text-${liquid.color}-600 text-sm`}></i>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{liquid.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{liquid.amount}ml</span>
                </div>
              ))}
            </div>

            {liquidIntake.find(l => l.type === 'water')?.amount > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Solo agua cuenta para la meta de hidratación</span>
                  <span className="text-blue-600 font-medium">
                    {liquidIntake.find(l => l.type === 'water')?.amount}ml
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Hydration Modal */}
      {showHydrationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Hidratación</h3>
              <button 
                onClick={() => setShowHydrationModal(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeDasharray={`${getHydrationPercentage()}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{Math.round(getHydrationPercentage())}%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{currentHydration}L</p>
              <p className="text-gray-600">de {hydrationGoal}L objetivo</p>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[100, 200, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAddWater(amount)}
                  className="py-3 px-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors !rounded-button"
                >
                  +{amount}ml
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleHydrationSettings}
                className="w-full flex items-center justify-center py-3 px-4 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors !rounded-button"
              >
                <i className="ri-settings-line mr-2"></i>
                Configurar Meta y Recordatorios
              </button>

              <button
                onClick={() => setCurrentHydration(0)}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
              >
                Reiniciar Día
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hydration Settings Modal */}
      {showHydrationSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Configuración de Hidratación</h3>
              <button 
                onClick={() => setShowHydrationSettings(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="p-6">
              {/* Meta de Hidratación */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Meta diaria de hidratación</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={tempHydrationGoal}
                    onChange={(e) => setTempHydrationGoal(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((tempHydrationGoal - 1) / 4) * 100}%, #e5e7eb ${((tempHydrationGoal - 1) / 4) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <span className="text-lg font-bold text-blue-600 min-w-[60px]">{tempHydrationGoal}L</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1L</span>
                  <span>2.5L</span>
                  <span>5L</span>
                </div>
              </div>

              {/* Recordatorios */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-800">Recordatorios automáticos</p>
                    <p className="text-sm text-gray-500">Recibe alertas para mantenerte hidratado</p>
                  </div>
                  <button
                    onClick={() => setTempReminders(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${ 
                      tempReminders.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${ 
                        tempReminders.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {tempReminders.enabled && (
                  <div className="space-y-4 bg-blue-50 rounded-xl p-4">
                    {/* Intervalo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de recordatorios</label>
                      <select
                        value={tempReminders.interval}
                        onChange={(e) => setTempReminders(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value={1}>Cada 1 hora</option>
                        <option value={2}>Cada 2 horas</option>
                        <option value={3}>Cada 3 horas</option>
                        <option value={4}>Cada 4 horas</option>
                      </select>
                    </div>

                    {/* Horario activo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora de inicio</label>
                        <input
                          type="time"
                          value={tempReminders.startTime}
                          onChange={(e) => setTempReminders(prev => ({ ...prev, startTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora de fin</label>
                        <input
                          type="time"
                          value={tempReminders.endTime}
                          onChange={(e) => setTempReminders(prev => ({ ...prev, endTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {/* Vista previa de configuración */}
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <i className="ri-information-line text-blue-600"></i>
                        <span className="text-sm font-medium text-blue-800">Vista previa de recordatorios</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Recibirás recordatorios cada {tempReminders.interval} hora{tempReminders.interval > 1 ? 's' : ''} 
                        de {tempReminders.startTime} a {tempReminders.endTime}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Cantidad sugerida por recordatorio: ~{Math.round((tempHydrationGoal * 1000) / Math.floor(calculateTotalActiveHours(tempReminders.startTime, tempReminders.endTime) / tempReminders.interval))}ml
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metas preestablecidas */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Metas recomendadas</p>
                <div className="grid grid-cols-3 gap-2">
                  {[ 
                    { amount: 2.0, label: 'Básica' },
                    { amount: 2.5, label: 'Estándar' },
                    { amount: 3.0, label: 'Activa' }
                  ].map((preset) => (
                    <button
                      key={preset.amount}
                      onClick={() => setTempHydrationGoal(preset.amount)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors !rounded-button ${ 
                        tempHydrationGoal === preset.amount 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset.amount}L
                      <div className="text-xs opacity-75">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowHydrationSettings(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveHydrationSettings}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl !rounded-button"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liquid Intake Modal */}
      {showLiquidIntakeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Agregar Líquidos</h3>
              <button 
                onClick={() => setShowLiquidIntakeModal(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="p-6">
              {/* Tipo de líquido */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de líquido</label>
                <div className="grid grid-cols-2 gap-3">
                  {[ 
                    { type: 'water', name: 'Agua', icon: 'ri-drop-line', color: 'blue' },
                    { type: 'coffee', name: 'Café', icon: 'ri-cup-line', color: 'orange' },
                    { type: 'tea', name: 'Té', icon: 'ri-cup-line', color: 'green' },
                    { type: 'juice', name: 'Jugo', icon: 'ri-glass-line', color: 'purple' },
                    { type: 'soda', name: 'Refresco', icon: 'ri-glass-line', color: 'red' },
                    { type: 'sports', name: 'Bebida deportiva', icon: 'ri-glass-line', color: 'yellow' }
                  ].map((liquid) => (
                    <button
                      key={liquid.type}
                      onClick={() => setSelectedLiquidType(liquid.type)}
                      className={`p-3 rounded-xl border-2 transition-all !rounded-button ${ 
                        selectedLiquidType === liquid.type
                          ? `border-${liquid.color}-500 bg-${liquid.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 bg-${liquid.color}-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <i className={`${liquid.icon} text-${liquid.color}-600 text-sm`}></i>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{liquid.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedLiquidType === 'water' && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <i className="ri-information-line text-blue-600"></i>
                    <span className="text-sm text-blue-800">Solo el agua cuenta para tu meta de hidratación</span>
                  </div>
                </div>
              )}

              {/* Cantidades rápidas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Cantidades rápidas</label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 200, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAddLiquid(amount, selectedLiquidType)}
                      className="py-3 px-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors !rounded-button"
                    >
                      {amount}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* Cantidad personalizada */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Cantidad personalizada</label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="ml"
                    min="1"
                    max="2000"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCustomAmountAdd}
                    disabled={!customAmount || parseInt(customAmount) <= 0}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
                  >
                    Agregar
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Máximo 2000ml por vez</p>
              </div>

              {/* Resumen del día */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-3">Resumen del día</h4>
                <div className="space-y-2">
                  {liquidIntake.filter(l => l.amount > 0).map((liquid, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 bg-${liquid.color}-100 rounded-full flex items-center justify-center`}>
                          <i className={`${liquid.icon} text-${liquid.color}-600 text-xs`}></i>
                        </div>
                        <span className="text-gray-700">{liquid.name}</span>
                      </div>
                      <span className="font-medium text-gray-800">{liquid.amount}ml</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>{(getTotalLiquidIntake() / 1000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fiber Modal */}
      {showFiberModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Seguimiento de Fibra</h3>
              <button 
                onClick={() => setShowFiberModal(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="p-6">
              {/* Progreso actual */}
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeDasharray={`${getFiberPercentage()}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{Math.round(getFiberPercentage())}%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{currentFiber}g</p>
                <p className="text-gray-600">de {fiberGoal}g objetivo</p>
                {currentFiber >= fiberGoal && (
                  <div className="mt-2 text-green-600 text-sm font-medium">
                    ¡Meta alcanzada!
                  </div>
                )}
              </div>

              {/* Alimentos consumidos hoy */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Alimentos ricos en fibra consumidos hoy</h4>
                <div className="space-y-2">
                  {fiberFoods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <i className={`${food.icon} text-green-600 text-sm`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{food.name}</p>
                          <p className="text-xs text-gray-500">{food.category}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{food.fiber}g</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agregar fibra rápido */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Agregar fibra</h4>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[2, 4, 6, 8].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAddFiber(amount)}
                      className="py-2 px-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium !rounded-button"
                    >
                      +{amount}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Recomendaciones */}
              {getFiberRecommendations().length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">Sugerencias para completar tu meta</h4>
                  <div className="space-y-2">
                    {getFiberRecommendations().slice(0, 3).map((rec, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddFiber(rec.fiber)}
                        className="w-full flex items-center justify-between bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <i className={`${rec.icon} text-green-600 text-xs`}></i>
                          </div>
                          <span className="text-sm text-gray-700">{rec.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-green-600">+{rec.fiber}g</span>
                          <i className="ri-add-circle-line text-green-600"></i>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Información sobre fibra */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-information-line text-blue-600 text-sm"></i>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">Beneficios de la fibra</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Mejora la digestión</li>
                      <li>• Ayuda a controlar el peso</li>
                      <li>• Reduce el colesterol</li>
                      <li>• Regula el azúcar en sangre</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Configurar meta */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Meta diaria de fibra</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setFiberGoal(Math.max(20, fiberGoal - 5))}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                    >
                      <i className="ri-subtract-line text-gray-600"></i>
                    </button>
                    <span className="text-lg font-bold text-gray-800 min-w-[50px] text-center">{fiberGoal}g</span>
                    <button
                      onClick={() => setFiberGoal(Math.min(50, fiberGoal + 5))}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                    >
                      <i className="ri-add-line text-gray-600"></i>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Recomendado: 25-35g/día</span>
                  <span>Rango: 20-50g</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentFiber(0)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
                >
                  Reiniciar Día
                </button>
                <button
                  onClick={() => setShowFiberModal(false)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl !rounded-button"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Seleccionar Fecha</h3>
              <button 
                onClick={() => setShowDatePicker(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="mb-6">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium !rounded-button"
              >
                Hoy
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  handleDateChange(yesterday.toISOString().split('T')[0]);
                }}
                className="py-2 px-3 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium !rounded-button"
              >
                Ayer
              </button>
              <button
                onClick={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  handleDateChange(lastWeek.toISOString().split('T')[0]);
                }}
                className="py-2 px-3 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium !rounded-button"
              >
                Hace 7 días
              </button>
            </div>

            <button
              onClick={() => setShowDatePicker(false)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium !rounded-button"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {showOptionsMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptionsMenu(false)}
        ></div>
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
              <i className="ri-pie-chart-line text-blue-600 text-lg"></i>
            </div>
            <span className="text-xs text-blue-600 font-medium">Nutrición</span>
          </Link>
          <Link href="/add-food" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-1">
              <i className="ri-add-line text-white text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Agregar</span>
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

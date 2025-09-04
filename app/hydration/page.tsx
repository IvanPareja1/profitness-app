
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HydrationPage() {
  const [user, setUser] = useState<any>(null);
  const [todayWater, setTodayWater] = useState(0);
  const [dailyGoal] = useState(8);
  const [showHistory, setShowHistory] = useState(false);
  const [hydrationHistory, setHydrationHistory] = useState<any[]>([]);
  const [customAmount, setCustomAmount] = useState('250');

  // Historial completamente vacío - sin datos precargados
  const [weeklyHistory, setWeeklyHistory] = useState<any[]>([
    { date: 'Hoy', total: 0, goal: 2000, percentage: 0 },
    { date: 'Ayer', total: 0, goal: 2000, percentage: 0 },
    { date: 'Anteayer', total: 0, goal: 2000, percentage: 0 },
    { date: 'Hace 3 días', total: 0, goal: 2000, percentage: 0 },
    { date: 'Hace 4 días', total: 0, goal: 2000, percentage: 0 },
    { date: 'Hace 5 días', total: 0, goal: 2000, percentage: 0 },
    { date: 'Hace 6 días', total: 0, goal: 2000, percentage: 0 }
  ]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTodayHydration();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadTodayHydration = async () => {
    // Inicializar completamente en 0
    setTodayWater(0);
    setHydrationHistory([]);
    
    // Actualizar el historial de hoy también en 0
    setWeeklyHistory(prev => prev.map((day, index) => 
      index === 0 ? { ...day, total: 0, percentage: 0 } : day
    ));
  };

  const drinkTypes = [
    { id: 'water', name: 'Agua', icon: 'ri-drop-line', amount: 250, color: 'bg-blue-100 text-blue-600' },
    { id: 'juice', name: 'Jugo', icon: 'ri-goblet-line', amount: 300, color: 'bg-orange-100 text-orange-600' },
    { id: 'coffee', name: 'Café', icon: 'ri-cup-line', amount: 200, color: 'bg-amber-100 text-amber-600' },
    { id: 'tea', name: 'Té', icon: 'ri-leaf-line', amount: 200, color: 'bg-green-100 text-green-600' }
  ];

  const addDrink = (type: string, amount: number) => {
    const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Agregar al historial del día
    const newEntry = {
      id: Date.now(),
      time: currentTime,
      amount: amount,
      type: type.toLowerCase()
    };
    
    setHydrationHistory(prev => [newEntry, ...prev]);
    
    // Si es agua, aumentar contador de vasos
    if (type.toLowerCase() === 'agua') {
      const newWaterCount = todayWater + 1;
      setTodayWater(newWaterCount);
      
      // Actualizar historial semanal
      const newTotal = newWaterCount * 250;
      const newPercentage = (newWaterCount / dailyGoal) * 100;
      
      setWeeklyHistory(prev => prev.map((day, index) => 
        index === 0 ? { ...day, total: newTotal, percentage: newPercentage } : day
      ));
    }
    
    // Aquí se guardaría en la base de datos en el futuro
    alert(`✅ Registrado: ${amount}ml de ${type} a las ${currentTime}`);
  };

  const addCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      addDrink('Agua', amount);
      setCustomAmount('250'); // Reset to default
    }
  };

  const removeHydration = (id: number) => {
    const entryToRemove = hydrationHistory.find(item => item.id === id);
    
    setHydrationHistory(prev => prev.filter(item => item.id !== id));
    
    // Si era agua, reducir contador
    if (entryToRemove && entryToRemove.type === 'agua') {
      const newWaterCount = Math.max(0, todayWater - 1);
      setTodayWater(newWaterCount);
      
      // Actualizar historial semanal
      const newTotal = newWaterCount * 250;
      const newPercentage = (newWaterCount / dailyGoal) * 100;
      
      setWeeklyHistory(prev => prev.map((day, index) => 
        index === 0 ? { ...day, total: newTotal, percentage: newPercentage } : day
      ));
    }
    
    alert('📝 Registro eliminado');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-drop-line text-blue-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-4">Para registrar tu hidratación necesitas una cuenta</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Hidratación</h1>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-8 h-8 flex items-center justify-center"
          >
            <i className="ri-history-line text-gray-600 text-lg"></i>
          </button>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Historial de Hidratación</h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            {/* Weekly Progress */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Últimos 7 días</h3>
              {weeklyHistory.every(day => day.total === 0) ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="ri-drop-line text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">Sin historial de hidratación</p>
                  <p className="text-xs text-gray-400">¡Empieza a registrar tu hidratación!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weeklyHistory.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${ 
                          day.percentage >= 100 ? 'bg-green-100' : 
                          day.percentage >= 75 ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <i className={`ri-drop-line text-sm ${ 
                            day.percentage >= 100 ? 'text-green-600' : 
                            day.percentage >= 75 ? 'text-blue-600' : 'text-gray-400'
                          }`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{day.date}</p>
                          <p className="text-sm text-gray-600">{day.total}ml / {day.goal}ml</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${ 
                          day.percentage >= 100 ? 'text-green-600' : 
                          day.percentage >= 75 ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {Math.round(day.percentage)}%
                        </p>
                        <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className={`h-2 rounded-full ${ 
                              day.percentage >= 100 ? 'bg-green-500' : 
                              day.percentage >= 75 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${Math.min(day.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Stats - Solo mostrar si hay datos */}
            {todayWater > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
                <h3 className="text-lg font-bold mb-4">Estadísticas del Mes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Math.round((todayWater / dailyGoal) * 100)}%</p>
                    <p className="text-sm opacity-80">Meta de Hoy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{(todayWater * 0.25).toFixed(1)}L</p>
                    <p className="text-sm opacity-80">Consumido Hoy</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Daily Progress */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Progreso de Hoy</h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  className="text-gray-200" 
                />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - (todayWater / dailyGoal))}`}
                  className="text-blue-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{todayWater}</span>
                <span className="text-sm text-gray-500">/ {dailyGoal} vasos</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {todayWater >= dailyGoal ? '¡Felicitaciones! Meta alcanzada' : 
               todayWater === 0 ? '¡Empieza a hidratarte!' : 
               `Te faltan ${dailyGoal - todayWater} vasos`}
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {drinkTypes.map((drink) => (
              <button
                key={drink.id}
                onClick={() => addDrink(drink.name, drink.amount)}
                className="flex flex-col items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 ${drink.color} rounded-2xl flex items-center justify-center mb-2`}>
                  <i className={`${drink.icon} text-lg`}></i>
                </div>
                <p className="text-xs font-medium text-gray-800">{drink.name}</p>
                <p className="text-xs text-gray-500">{drink.amount}ml</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Cantidad Personalizada</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="250"
                step="50"
                min="50"
                max="1000"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">ml</span>
            </div>
            <button 
              onClick={addCustomAmount}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Today's Hydration Log */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Registro de Hoy</h3>
            <span className="text-sm text-blue-600 font-medium">
              {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </span>
          </div>

          {hydrationHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-drop-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm mb-4">No has registrado líquidos hoy</p>
              <p className="text-xs text-gray-400">¡Empieza hidratándote ahora!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hydrationHistory.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${ 
                      entry.type === 'agua' ? 'bg-blue-100' : 
                      entry.type === 'jugo' ? 'bg-orange-100' :
                      entry.type === 'café' ? 'bg-amber-100' : 'bg-green-100'
                    }`}>
                      <i className={`${ 
                        entry.type === 'agua' ? 'ri-drop-line text-blue-600' :
                        entry.type === 'jugo' ? 'ri-goblet-line text-orange-600' :
                        entry.type === 'café' ? 'ri-cup-line text-amber-600' : 'ri-leaf-line text-green-600'
                      } text-sm`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{entry.type}</p>
                      <p className="text-xs text-gray-500">{entry.time} • {entry.amount}ml</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => removeHydration(entry.id)}
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
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-0 py-0">
        <div className="grid grid-cols-5 h-16">
          <Link href="/" className="flex flex-col items-center justify-center">
            <i className="ri-home-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Inicio</span>
          </Link>
          <Link href="/food" className="flex flex-col items-center justify-center">
            <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Comida</span>
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

      {/* FAB for Quick Water */}
      <button 
        onClick={() => addDrink('Agua', 250)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <i className="ri-drop-fill text-white text-xl"></i>
      </button>
    </div>
  );
}

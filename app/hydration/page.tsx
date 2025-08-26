
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';


export default function HydrationPage() {
  const [dailyIntake, setDailyIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [selectedAmount, setSelectedAmount] = useState(250);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [todayEntries, setTodayEntries] = useState([]);

  const waterAmounts = [
    { amount: 100, label: '100ml', icon: 'ri-drop-line' },
    { amount: 250, label: '250ml', icon: 'ri-cup-line' },
    { amount: 500, label: '500ml', icon: 'ri-glass-line' },
    { amount: 750, label: '750ml', icon: 'ri-bottle-line' }
  ];

  const addWater = async (amount) => {
    if (!user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      await callEdgeFunction('hydration-tracker', {
        action: 'log_hydration',
        userId: user.id,
        amount,
        loggedAt: new Date().toISOString()
      }, token);

      setDailyIntake(prev => Math.min(prev + amount, dailyGoal + 1000));

      // Actualizar datos
      await loadTodayHydration(user.id);
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  const removeWater = async () => {
    if (!user || dailyIntake === 0) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      await callEdgeFunction('hydration-tracker', {
        action: 'remove_hydration',
        userId: user.id,
        amount: selectedAmount
      }, token);

      setDailyIntake(prev => Math.max(prev - selectedAmount, 0));

      // Actualizar datos
      await loadTodayHydration(user.id);
    } catch (error) {
      console.error('Error removing water:', error);
    }
  };

  const progressPercentage = Math.min((dailyIntake / dailyGoal) * 100, 100);

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'from-green-400 to-green-500';
    if (progressPercentage >= 75) return 'from-blue-400 to-cyan-400';
    if (progressPercentage >= 50) return 'from-cyan-400 to-blue-400';
    return 'from-blue-300 to-cyan-300';
  };

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      let currentUser = await getCurrentUser();

      if (!currentUser) {
        const { user: newUser } = await signInAnonymously();
        currentUser = newUser;
      }

      setUser(currentUser);

      if (currentUser) {
        await loadTodayHydration(currentUser.id);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayHydration = async (userId: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await callEdgeFunction('hydration-tracker', {
        action: 'get_daily_hydration',
        userId,
        date: new Date().toISOString().split('T')[0]
      }, token);

      if (response.hydration) {
        setDailyIntake(response.hydration.total_amount || 0);
        setTodayEntries(response.hydration.entries || []);
      }
    } catch (error) {
      console.error('Error loading hydration:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de hidratación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Hidratación</h1>
          </div>
          <button className="w-8 h-8 flex items-center justify-center">
            <i className="ri-history-line text-cyan-500 text-xl"></i>
          </button>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Progreso Diario</h2>
            <p className="text-sm text-gray-500">Meta: {dailyGoal}ml</p>
          </div>

          <div className="relative mb-6">
            <div className="w-32 h-32 mx-auto relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercentage * 2.51} 251`}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{dailyIntake}</div>
                  <div className="text-xs text-gray-500">ml</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-lg font-semibold text-cyan-600">
              {Math.round(progressPercentage)}% completado
            </div>
            <div className="text-sm text-gray-500">
              Faltan {Math.max(dailyGoal - dailyIntake, 0)}ml para tu meta
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {waterAmounts.map((item) => (
              <button
                key={item.amount}
                onClick={() => setSelectedAmount(item.amount)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedAmount === item.amount
                    ? 'border-cyan-300 bg-cyan-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div
                  className={`w-8 h-8 mx-auto mb-2 flex items-center justify-center ${
                    selectedAmount === item.amount ? 'text-cyan-500' : 'text-gray-400'
                  }`}
                >
                  <i className={`${item.icon} text-lg`}></i>
                </div>
                <div
                  className={`text-xs font-medium ${
                    selectedAmount === item.amount ? 'text-cyan-600' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </div>
              </button>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={removeWater}
              disabled={dailyIntake === 0}
              className="flex-1 border-2 border-red-200 text-red-500 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              - Quitar
            </button>
            <button
              onClick={() => addWater(selectedAmount)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold"
            >
              + Agregar {selectedAmount}ml
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recordatorios</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="ri-alarm-line text-yellow-500 text-sm"></i>
                </div>
                <span className="text-sm font-medium text-gray-800">Cada 2 horas</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-sun-line text-blue-500 text-sm"></i>
                </div>
                <span className="text-sm font-medium text-gray-800">Al despertar</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="ri-restaurant-line text-orange-500 text-sm"></i>
                </div>
                <span className="text-sm font-medium text-gray-800">Antes de comer</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Historial de Hoy</h3>
          <div className="space-y-3">
            {todayEntries.length > 0 ? (
              <div>
                {todayEntries.slice(-3).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <i className="ri-drop-fill text-cyan-500 text-sm"></i>
                      </div>
                      <span className="text-sm text-gray-700">{entry.amount}ml</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.logged_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
                <div className="text-center py-2">
                  <p className="text-cyan-600 font-medium">Total: {dailyIntake}ml</p>
                  <p className="text-sm text-gray-500">¡Sigue así!</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <i className="ri-drop-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-500">Aún no has registrado agua hoy</p>
                <p className="text-sm text-gray-400 mt-1">¡Comienza a hidratarte!</p>
              </div>
            )}
          </div>
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

          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Comida</span>
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

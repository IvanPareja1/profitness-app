
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WeightPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadWeightHistory();
    }
    setIsLoading(false);
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/profile-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'get_profile'
        })
      });

      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
        setCurrentWeight(result.data.current_weight || 70);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const loadWeightHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/profile-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'get_weight_history'
        })
      });

      const result = await response.json();

      if (result.success) {
        const formattedHistory = result.data.map((record: any, index: any, array: any) => {
          const prevRecord = array[index + 1];
          const change = prevRecord ? record.weight - prevRecord.weight : 0;

          return {
            id: record.id,
            date: new Date(record.recorded_at).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'short' 
            }),
            weight: record.weight,
            change: change,
            notes: record.notes
          };
        });

        setWeightHistory(formattedHistory);

        if (formattedHistory.length > 0) {
          setCurrentWeight(formattedHistory[0].weight);
        }
      }
    } catch (error) {
      console.error('Error cargando historial de peso:', error);
    }
  };

  const addWeight = async () => {
    if (!newWeight || parseFloat(newWeight) <= 0 || !user) return;

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/supabase/functions/v1/profile-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'add_weight_record',
          weight: parseFloat(newWeight),
          notes: notes
        })
      });

      const result = await response.json();

      if (result.success) {
        setCurrentWeight(parseFloat(newWeight));
        setNewWeight('');
        setNotes('');
        setShowAddWeight(false);
        loadWeightHistory(); // Recargar historial
        alert(` Peso registrado: ${newWeight}kg`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar peso. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const bmiCalculation = () => {
    if (!profile?.height || !currentWeight) {
      return { value: '0.0', category: 'N/A', color: 'text-gray-600' };
    }

    const heightInMeters = profile.height / 100;
    const bmi = currentWeight / (heightInMeters * heightInMeters);
    let category = '';
    let color = '';

    if (bmi < 18.5) {
      category = 'Bajo peso';
      color = 'text-blue-600';
    } else if (bmi < 25) {
      category = 'Normal';
      color = 'text-green-600';
    } else if (bmi < 30) {
      category = 'Sobrepeso';
      color = 'text-orange-600';
    } else {
      category = 'Obesidad';
      color = 'text-red-600';
    }

    return { value: bmi.toFixed(1), category, color };
  };

  const periods = [
    { id: 'week', name: '7 días' },
    { id: 'month', name: '30 días' },
    { id: 'year', name: '1 año' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-scales-3-line text-blue-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-4">Para registrar tu peso necesitas una cuenta</p>
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

  const bmi = bmiCalculation();
  const goalWeight = profile?.target_weight || 65;
  const startWeight = profile ? Math.max(profile.current_weight + 5, goalWeight + 5) : 75;
  const weightLost = Math.max(0, startWeight - currentWeight);
  const weightToGo = Math.max(0, currentWeight - goalWeight);
  const progressPercentage = weightToGo > 0 ? Math.min((weightLost / (startWeight - goalWeight)) * 100, 100) : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Control de Peso</h1>
          <button 
            onClick={() => setShowAddWeight(!showAddWeight)}
            className="w-8 h-8 flex items-center justify-center"
          >
            <i className="ri-add-circle-line text-gray-600 text-lg"></i>
          </button>
        </div>
      </div>

      {/* Add Weight Modal */}
      {showAddWeight && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Registrar Peso</h2>
              <button 
                onClick={() => setShowAddWeight(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Peso actual</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-4 py-4 text-center text-2xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentWeight.toString()}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">kg</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                placeholder="Ej: Después del desayuno, con ropa..."
                maxLength={200}
              />
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Fecha y hora</p>
              <p className="text-lg font-medium text-gray-800" suppressHydrationWarning={true}>
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <button
              onClick={addWeight}
              disabled={!newWeight || parseFloat(newWeight) <= 0 || isSaving}
              className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar Peso'}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Current Weight Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Peso Actual</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-800">{currentWeight}</span>
              <span className="text-lg text-gray-600 ml-2">kg</span>
            </div>
            <p className="text-sm text-gray-600">
              {weightHistory.length > 0 
                ? `Última actualización: ${weightHistory[0].date}` 
                : 'Sin registros previos'
              }
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-600">-{weightLost.toFixed(1)}kg</p>
              <p className="text-xs text-gray-600">Perdido</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-lg font-bold text-blue-600">{weightToGo.toFixed(1)}kg</p>
              <p className="text-xs text-gray-600">Por perder</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-lg font-bold text-purple-600">{goalWeight}kg</p>
              <p className="text-xs text-gray-600">Meta</p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Progreso hacia la Meta</h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm text-blue-600">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Inicio: {startWeight}kg</span>
            <span className="text-gray-600">Meta: {goalWeight}kg</span>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Índice de Masa Corporal</h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-gray-800">{bmi.value}</p>
              <p className={`text-sm font-medium ${bmi.color}`}>{bmi.category}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center">
              <i className="ri-heart-pulse-line text-green-600 text-2xl"></i>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            <p>• Bajo peso: &lt; 18.5</p>
            <p>• Normal: 18.5 - 24.9</p>
            <p>• Sobrepeso: 25.0 - 29.9</p>
            <p>• Obesidad: ≥ 30.0</p>
          </div>
        </div>

        {/* Period Selection */}
        <div className="bg-white rounded-2xl p-1 mb-6 shadow-sm">
          <div className="grid grid-cols-3 gap-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedPeriod === period.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>
        </div>

        {/* Weight Chart Placeholder */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Gráfico de Peso</h3>
          <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
            <img 
              src="https://readdy.ai/api/search-image?query=Simple%20weight%20loss%20progress%20chart%20with%20downward%20trend%20line%2C%20clean%20data%20visualization%2C%20blue%20color%20scheme%2C%20minimalist%20design%2C%20fitness%20tracking%20graph%2C%20health%20monitoring%20display&width=300&height=200&seq=weightchart1&orientation=landscape"
              alt="Gráfico de progreso de peso"
              className="w-full h-full object-cover object-top rounded-xl"
            />
          </div>
        </div>

        {/* Weight History */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Historial de Peso</h3>

          {weightHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-scales-3-line text-gray-400 text-2xl"></i>
              </div>
              <p className="text-gray-500 text-sm">No hay registros de peso</p>
              <p className="text-gray-400 text-xs">Comienza registrando tu peso actual</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weightHistory.map((entry: any, index: any) => (
                <div key={entry.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-scales-3-line text-blue-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{entry.weight} kg</p>
                      <p className="text-xs text-gray-500">
                        {entry.date}
                        {entry.notes && ` • ${entry.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {Math.abs(entry.change) > 0.05 && (
                      <span className={`text-sm font-medium ${
                        entry.change >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {entry.change >= 0 ? '+' : ''}{entry.change.toFixed(1)}kg
                      </span>
                    )}
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

      {/* FAB for Quick Add */}
      <button 
        onClick={() => setShowAddWeight(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <i className="ri-scales-3-line text-white text-xl"></i>
      </button>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function WeightTracking() {
  const [weightData] = useState([
    { date: '2024-01-15', weight: 76.8, change: 0 },
    { date: '2024-01-16', weight: 76.5, change: -0.3 },
    { date: '2024-01-17', weight: 76.2, change: -0.3 },
    { date: '2024-01-18', weight: 75.9, change: -0.3 },
    { date: '2024-01-19', weight: 75.6, change: -0.3 },
    { date: '2024-01-20', weight: 75.4, change: -0.2 },
    { date: '2024-01-21', weight: 75.2, change: -0.2 }
  ]);

  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const handleAddWeight = () => {
    if (newWeight) {
      setNewWeight('');
      setShowAddWeight(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
            </Link>
            <h1 className="text-lg font-semibold text-gray-800">Historial de Peso</h1>
          </div>
          <button 
            onClick={() => setShowAddWeight(true)}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center !rounded-button"
          >
            <i className="ri-add-line text-white text-lg"></i>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4">
        {/* Current Weight Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 mt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Peso Actual</p>
            <p className="text-4xl font-bold text-gray-800 mb-2">75.2 kg</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-arrow-down-line text-green-600 text-sm"></i>
              </div>
              <span className="text-green-600 font-medium">-0.8 kg esta semana</span>
            </div>
          </div>
        </div>

        {/* Weight Chart Visualization */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Peso</h3>
          <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
            <img 
              src="https://readdy.ai/api/search-image?query=Clean%20weight%20loss%20progress%20chart%20with%20declining%20trend%20line%2C%20blue%20and%20purple%20gradient%20colors%2C%20minimalist%20design%2C%20data%20visualization%2C%20mobile%20app%20interface%20style%2C%20weight%20tracking%20graph%2C%20smooth%20curved%20line%20showing%20downward%20trend%2C%20simple%20background&width=300&height=180&seq=weightchart1&orientation=landscape"
              alt="Gráfico de progreso de peso"
              className="w-full h-full object-cover object-top rounded-xl"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Ene 15</span>
            <span>Hoy</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-speed-line text-blue-600 text-lg"></i>
            </div>
            <p className="text-sm text-gray-500 mb-1">Promedio Semanal</p>
            <p className="text-xl font-bold text-gray-800">-0.4 kg</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-target-line text-purple-600 text-lg"></i>
            </div>
            <p className="text-sm text-gray-500 mb-1">Meta</p>
            <p className="text-xl font-bold text-gray-800">72.0 kg</p>
          </div>
        </div>

        {/* Weight History */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial Detallado</h3>
          <div className="space-y-3">
            {weightData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="ri-scales-3-line text-gray-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{entry.weight} kg</p>
                    <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  {entry.change !== 0 && (
                    <span className={`text-sm font-medium ${entry.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.change > 0 ? '+' : ''}{entry.change} kg
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Weight Modal */}
      {showAddWeight && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Registrar Peso</h3>
              <button 
                onClick={() => setShowAddWeight(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="75.2"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddWeight(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddWeight}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl !rounded-button"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
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
              <i className="ri-pie-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Nutrición</span>
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const weightData = [
    { date: 'Lun', weight: 75.2 },
    { date: 'Mar', weight: 75.0 },
    { date: 'Mié', weight: 74.8 },
    { date: 'Jue', weight: 74.9 },
    { date: 'Vie', weight: 74.7 },
    { date: 'Sáb', weight: 74.5 },
    { date: 'Dom', weight: 74.6 }
  ];

  const caloriesData = [
    { date: 'Lun', calories: 1850, burned: 320 },
    { date: 'Mar', calories: 2100, burned: 450 },
    { date: 'Mié', calories: 1920, burned: 280 },
    { date: 'Jue', calories: 1780, burned: 380 },
    { date: 'Vie', calories: 2050, burned: 520 },
    { date: 'Sáb', calories: 2200, burned: 410 },
    { date: 'Dom', calories: 1900, burned: 290 }
  ];

  const macroData = [
    { name: 'Proteínas', value: 25, color: '#3B82F6' },
    { name: 'Carbohidratos', value: 50, color: '#10B981' },
    { name: 'Grasas', value: 25, color: '#F59E0B' }
  ];

  const hydrationData = [
    { date: 'Lun', amount: 2.1 },
    { date: 'Mar', amount: 2.5 },
    { date: 'Mié', amount: 1.9 },
    { date: 'Jue', amount: 2.3 },
    { date: 'Vie', amount: 2.7 },
    { date: 'Sáb', amount: 2.2 },
    { date: 'Dom', amount: 2.0 }
  ];

  const periods = [
    { id: 'week', name: '7 días' },
    { id: 'month', name: '30 días' },
    { id: 'quarter', name: '3 meses' }
  ];

  const metrics = [
    { id: 'weight', name: 'Peso', icon: 'ri-scales-line', color: 'text-purple-500' },
    { id: 'calories', name: 'Calorías', icon: 'ri-fire-line', color: 'text-orange-500' },
    { id: 'hydration', name: 'Hidratación', icon: 'ri-drop-line', color: 'text-blue-500' },
    { id: 'exercise', name: 'Ejercicio', icon: 'ri-run-line', color: 'text-green-500' }
  ];

  const getCurrentData = () => {
    switch (selectedMetric) {
      case 'weight': return weightData;
      case 'calories': return caloriesData;
      case 'hydration': return hydrationData;
      default: return weightData;
    }
  };

  const getChartColor = () => {
    switch (selectedMetric) {
      case 'weight': return '#8B5CF6';
      case 'calories': return '#F97316';
      case 'hydration': return '#3B82F6';
      case 'exercise': return '#10B981';
      default: return '#8B5CF6';
    }
  };

  const getDataKey = () => {
    switch (selectedMetric) {
      case 'weight': return 'weight';
      case 'calories': return 'calories';
      case 'hydration': return 'amount';
      case 'exercise': return 'minutes';
      default: return 'weight';
    }
  };

  const handleDownload = (format: string) => {
    setShowDownloadMenu(false);

    const data = {
      period: selectedPeriod,
      metric: selectedMetric,
      weightData,
      caloriesData,
      macroData,
      hydrationData,
      summary: {
        currentWeight: '74.6 kg',
        bmi: '22.1',
        avgCalories: '1,971',
        avgHydration: '2.2L',
        weightLoss: '-0.6 kg esta semana'
      },
      achievements: [
        'Meta de peso alcanzada - Perdiste 0.6 kg esta semana',
        'Hidratación perfecta - 5 días seguidos cumpliendo tu meta',
        'Racha de ejercicio - 7 días consecutivos entrenando'
      ]
    };

    if (format === 'pdf') {
      // Simular descarga PDF
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg z-50 text-sm font-medium';
      notification.textContent = '✅ Reporte PDF descargado correctamente';

      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);

    } else if (format === 'csv') {
      // Crear CSV con datos de peso y calorías
      const csvContent = [
        'Fecha,Peso (kg),Calorías Consumidas,Calorías Quemadas,Hidratación (L)',
        ...weightData.map((item, index) => {
          const calorieItem = caloriesData[index];
          const hydrationItem = hydrationData[index];
          return `${item.date},${item.weight},${calorieItem?.calories || ''},${calorieItem?.burned || ''},${hydrationItem?.amount || ''}`;
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `profitness-reporte-${selectedPeriod}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } else if (format === 'image') {
      // Simular descarga de imagen
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-4 right-4 bg-blue-500 text-white p-4 rounded-xl shadow-lg z-50 text-sm font-medium';
      notification.textContent = '📊 Gráfico guardado en Galería';

      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Reportes</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <i className="ri-download-line text-indigo-500 text-xl"></i>
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-48 z-20">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <i className="ri-file-pdf-line text-red-500"></i>
                  <span className="text-sm text-gray-700">Descargar PDF</span>
                </button>

                <button
                  onClick={() => handleDownload('csv')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <i className="ri-file-excel-line text-green-500"></i>
                  <span className="text-sm text-gray-700">Exportar CSV</span>
                </button>

                <button
                  onClick={() => handleDownload('image')}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <i className="ri-image-line text-blue-500"></i>
                  <span className="text-sm text-gray-700">Guardar Gráfico</span>
                </button>

                <div className="border-t border-gray-100 my-2"></div>

                <button
                  onClick={() => {
                    setShowDownloadMenu(false);
                    navigator.share && navigator.share({
                      title: 'Mi Reporte de ProFitness',
                      text: `He perdido 0.6 kg esta semana con ProFitness! 💪\nPeso actual: 74.6 kg\nIMC: 22.1`,
                      url: window.location.href
                    });
                  }}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <i className="ri-share-line text-purple-500"></i>
                  <span className="text-sm text-gray-700">Compartir Progreso</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {showDownloadMenu && (
          <div
            className="fixed inset-0 bg-transparent z-10"
            onClick={() => setShowDownloadMenu(false)}
          ></div>
        )}
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen General</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-scales-line text-purple-500"></i>
                <span className="text-sm font-medium text-purple-700">Peso Actual</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">74.6 kg</div>
              <div className="text-xs text-purple-500">-0.6 kg esta semana</div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-target-line text-blue-500"></i>
                <span className="text-sm font-medium text-blue-700">IMC</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">22.1</div>
              <div className="text-xs text-blue-500">Normal</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-fire-line text-green-500"></i>
                <span className="text-sm font-medium text-green-700">Calorías/día</span>
              </div>
              <div className="text-2xl font-bold text-green-600">1,971</div>
              <div className="text-xs text-green-500">Promedio semanal</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-drop-line text-orange-500"></i>
                <span className="text-sm font-medium text-orange-700">Hidratación</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">2.2L</div>
              <div className="text-xs text-orange-500">Promedio diario</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Tendencias</h3>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedPeriod === period.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  {period.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedMetric === metric.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 mx-auto mb-2 flex items-center justify-center ${
                  selectedMetric === metric.id ? metric.color : 'text-gray-400'
                }`}>
                  <i className={`${metric.icon} text-sm`}></i>
                </div>
                <div className={`text-xs font-medium ${
                  selectedMetric === metric.id ? 'text-indigo-600' : 'text-gray-600'
                }`}>
                  {metric.name}
                </div>
              </button>
            ))}
          </div>

          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getCurrentData()}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis hide />
                <Line
                  type="monotone"
                  dataKey={getDataKey()}
                  stroke={getChartColor()}
                  strokeWidth={3}
                  dot={{ fill: getChartColor(), strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: getChartColor() }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {selectedMetric === 'calories' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Calorías Consumidas vs Quemadas</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caloriesData}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis hide />
                  <Bar dataKey="calories" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="burned" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Consumidas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Quemadas</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Distribución de Macronutrientes</h3>
          <div className="flex items-center justify-center">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {macroData.map((macro) => (
              <div key={macro.name} className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }}></div>
                  <span className="text-xs font-medium text-gray-700">{macro.value}%</span>
                </div>
                <div className="text-xs text-gray-500">{macro.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Logros de la Semana</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-trophy-line text-green-500"></i>
              </div>
              <div>
                <div className="font-medium text-green-800 text-sm">Meta de peso alcanzada</div>
                <div className="text-xs text-green-600">Perdiste 0.6 kg esta semana</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-drop-fill text-blue-500"></i>
              </div>
              <div>
                <div className="font-medium text-blue-800 text-sm">Hidratación perfecta</div>
                <div className="text-xs text-blue-600">5 días seguidos cumpliendo tu meta</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-fire-line text-orange-500"></i>
              </div>
              <div>
                <div className="font-medium text-orange-800 text-sm">Racha de ejercicio</div>
                <div className="text-xs text-orange-600">7 días consecutivos entrenando</div>
              </div>
            </div>
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
              <i className="ri-bar-chart-fill text-indigo-500 text-lg"></i>
            </div>
            <span className="text-xs text-indigo-500 mt-1">Reportes</span>
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

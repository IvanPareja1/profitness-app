
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Progress() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [mounted, setMounted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalSettings, setGoalSettings] = useState({
    weightGoal: 68,
    weeklyLossGoal: 0.5,
    deadline: '2024-06-01'
  });

  const weightData = [
    { date: '2024-01-01', weight: 78.5 },
    { date: '2024-01-08', weight: 78.1 },
    { date: '2024-01-15', weight: 77.6 },
    { date: '2024-01-22', weight: 77.2 },
    { date: '2024-01-29', weight: 76.8 },
    { date: '2024-02-05', weight: 76.3 },
    { date: '2024-02-12', weight: 75.9 },
    { date: '2024-02-19', weight: 75.2 }
  ];

  const progressStats = {
    totalWeightLoss: 3.3,
    avgWeeklyLoss: 0.4,
    daysTracked: 52,
    streakDays: 12
  };

  const bodyMetrics = [
    { name: 'Peso', value: '75.2 kg', change: '-3.3 kg', trend: 'down' },
    { name: 'IMC', value: '22.8', change: '-1.2', trend: 'down' },
    { name: 'Grasa Corporal', value: '18.5%', change: '-2.1%', trend: 'down' },
    { name: 'Masa Muscular', value: '61.3 kg', change: '+0.8 kg', trend: 'up' }
  ];

  const handleShareProgress = (platform: string) => {
    const progressMessage = `¡Mi progreso en Profitness!\\\\\\\\n\\\\\\\\n💪 Peso perdido: -${progressStats.totalWeightLoss} kg\\\\\\\\n📊 Peso actual: 75.2 kg\\\\\\\\n🔥 Racha: ${progressStats.streakDays} días\\\\\\\\n📅 Días activos: ${progressStats.daysTracked}\\\\\\\\n\\\\\\\\n#Profitness #ProgresoSaludable`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(progressMessage)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://profitness.app')}&quote=${encodeURIComponent(progressMessage)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(progressMessage)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(progressMessage).then(() => {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        });
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Mi progreso fitness')}&body=${encodeURIComponent(progressMessage)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(progressMessage).then(() => {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        });
        break;
    }
    setShowShareModal(false);
  };

  const handleExportData = () => {
    setShowMoreOptions(false);
    setShowExportModal(true);
  };

  const handleActualExport = (format: string) => {
    console.log(`Exportando datos en formato ${format}...`);
    setShowExportModal(false);

    // Simular descarga
    setTimeout(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }, 1000);
  };

  const handleResetProgress = () => {
    setShowMoreOptions(false);
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    console.log('Reiniciando datos de progreso...');
    setShowResetModal(false);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const handleEditGoals = () => {
    setShowMoreOptions(false);
    setShowGoalModal(true);
  };

  const handleSaveGoals = () => {
    console.log('Guardando nuevas metas:', goalSettings);
    setShowGoalModal(false);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const handleGoalInputChange = (field: string, value: string | number) => {
    setGoalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePrintReport = () => {
    setShowMoreOptions(false);
    console.log('Imprimiendo reporte de progreso...');
    window.print();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
      {showCopySuccess && (
        <div className="fixed top-20 left-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 max-w-sm mx-auto">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <i className="ri-check-line text-white text-sm"></i>
            </div>
            <span className="text-sm font-medium">¡Progreso copiado al portapapeles!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Progreso</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="w-8 h-8 flex items-center justify-center"
            >
              <i className="ri-share-line text-gray-600 text-lg"></i>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-more-line text-gray-600 text-lg"></i>
              </button>

              {/* More Options Dropdown */}
              {showMoreOptions && (
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
                    onClick={handleEditGoals}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-target-line text-purple-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700">Editar metas</span>
                  </button>

                  <button
                    onClick={handlePrintReport}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-printer-line text-green-600 text-sm"></i>
                    </div>
                    <span className="text-gray-700">Imprimir reporte</span>
                  </button>

                  <Link href="/progress-analytics" className="block">
                    <button className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-line-chart-line text-orange-600 text-sm"></i>
                      </div>
                      <span className="text-gray-700">Analytics avanzados</span>
                    </button>
                  </Link>

                  <div className="border-t border-gray-100 my-2"></div>

                  <button
                    onClick={handleResetProgress}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-refresh-line text-red-600 text-sm"></i>
                    </div>
                    <span className="text-red-600">Reiniciar progreso</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4">
        {/* Period Selector */}
        <div className="mt-6 mb-6">
          <div className="bg-white rounded-xl p-1 shadow-sm">
            <div className="grid grid-cols-4 gap-1">
              {[{ id: 'week', label: 'Semana' }, { id: 'month', label: 'Mes' }, { id: 'quarter', label: '3 Meses' }, { id: 'year', label: 'Año' }].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all !rounded-button ${
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

        {/* Progress Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Evolución del Peso</h3>
            <Link href="/weight-tracking">
              <button className="text-blue-600 text-sm">Agregar peso</button>
            </Link>
          </div>

          {/* Chart Placeholder */}
          <div className="relative h-48 mb-4">
            <img
              src="https://readdy.ai/api/search-image?query=Weight%20loss%20progress%20chart%20graph%20showing%20downward%20trend%2C%20clean%20minimalist%20design%2C%20blue%20and%20purple%20gradient%20colors%2C%20data%20visualization%2C%20weight%20tracking%20app%20interface%2C%20professional%20dashboard%20design&width=300&height=180&seq=chart1&orientation=landscape"
              alt="Gráfico de progreso"
              className="w-full h-full rounded-lg object-cover object-top"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">-{progressStats.totalWeightLoss} kg</p>
              <p className="text-sm text-gray-500">Total perdido</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">-{progressStats.avgWeeklyLoss} kg</p>
              <p className="text-sm text-gray-500">Promedio semanal</p>
            </div>
          </div>
        </div>

        {/* Body Metrics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas Corporales</h3>
          <div className="grid grid-cols-2 gap-4">
            {bodyMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">{metric.name}</h4>
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full ${
                      metric.trend === 'down' ? 'bg-green-100' : 'bg-blue-100'
                    }`}
                  >
                    <i
                      className={`${metric.trend === 'down' ? 'ri-arrow-down-line text-green-600' : 'ri-arrow-up-line text-blue-600'} text-sm`}
                    ></i>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-1">{metric.value}</p>
                <p
                  className={`text-xs font-medium ${metric.trend === 'down' ? 'text-green-600' : 'text-blue-600'}`}
                >
                  {metric.change}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Logros</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-calendar-check-line text-blue-600 text-lg"></i>
              </div>
              <p className="text-xl font-bold text-gray-800">{progressStats.daysTracked}</p>
              <p className="text-sm text-gray-500">Días registrados</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-fire-line text-orange-600 text-lg"></i>
              </div>
              <p className="text-xl font-bold text-gray-800">{progressStats.streakDays}</p>
              <p className="text-sm text-gray-500">Días consecutivos</p>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen Semanal</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-restaurant-line text-green-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Objetivo calórico</p>
                  <p className="text-sm text-gray-500">6 de 7 días cumplidos</p>
                </div>
              </div>
              <span className="text-green-600 font-semibold">86%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-scales-3-line text-blue-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Pesaje diario</p>
                  <p className="text-sm text-gray-500">7 de 7 días cumplidos</p>
                </div>
              </div>
              <span className="text-green-600 font-semibold">100%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-drop-line text-purple-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Hidratación</p>
                  <p className="text-sm text-gray-500">5 de 7 días cumplidos</p>
                </div>
              </div>
              <span className="text-yellow-600 font-semibold">71%</span>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Compartir Progreso</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-trophy-line text-white text-2xl"></i>
              </div>
              <p className="text-gray-600 text-sm">
                ¡Comparte tus logros y motiva a otros a alcanzar sus metas!
              </p>
            </div>

            {/* Preview del progreso */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Tu progreso:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <i className="ri-scales-3-line text-blue-600"></i>
                  <span>-{progressStats.totalWeightLoss} kg perdido</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-fire-line text-orange-600"></i>
                  <span>{progressStats.streakDays} días seguidos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-calendar-check-line text-green-600"></i>
                  <span>{progressStats.daysTracked} días activos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-target-line text-purple-600"></i>
                  <span>75.2 kg actual</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleShareProgress('whatsapp')}
                className="w-full flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-whatsapp-line text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <p className="text-sm text-gray-500">Compartir por mensaje</p>
                </div>
              </button>

              <button
                onClick={() => handleShareProgress('facebook')}
                className="w-full flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-facebook-fill text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Facebook</p>
                  <p className="text-sm text-gray-500">Publicar en tu muro</p>
                </div>
              </button>

              <button
                onClick={() => handleShareProgress('twitter')}
                className="w-full flex items-center p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-twitter-line text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Twitter</p>
                  <p className="text-sm text-gray-500">Compartir tweet</p>
                </div>
              </button>

              <button
                onClick={() => handleShareProgress('instagram')}
                className="w-full flex items-center p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-instagram-line text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Instagram</p>
                  <p className="text-sm text-gray-500">Copiar para Stories</p>
                </div>
              </button>

              <button
                onClick={() => handleShareProgress('email')}
                className="w-full flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-mail-line text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-sm text-gray-500">Enviar por correo</p>
                </div>
              </button>

              <button
                onClick={() => handleShareProgress('copy')}
                className="w-full flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-file-copy-line text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Copiar texto</p>
                  <p className="text-sm text-gray-500">Copiar al portapapeles</p>
                </div>
              </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <i className="ri-heart-line text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">¡Motiva a otros!</p>
                  <p className="text-xs text-blue-700">
                    Compartir tu progreso puede inspirar a amigos y familiares a comenzar su propio viaje fitness
                  </p>
                </div>
              </div>
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
              <i className="ri-line-chart-line text-blue-600 text-lg"></i>
            </div>
            <span className="text-xs text-blue-600 font-medium">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center py-2 px-1">
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Perfil</span>
          </Link>
        </div>
      </nav>

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Exportar Datos</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-database-line text-blue-600 text-2xl"></i>
              </div>
              <p className="text-gray-600 text-sm">
                Selecciona el formato en el que deseas exportar tus datos de progreso
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleActualExport('pdf')}
                className="w-full flex items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-file-pdf-line text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Reporte PDF</p>
                  <p className="text-sm text-gray-500">Gráficos y estadísticas completas</p>
                </div>
              </button>

              <button
                onClick={() => handleActualExport('excel')}
                className="w-full flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-file-excel-line text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Archivo Excel</p>
                  <p className="text-sm text-gray-500">Datos tabulares para análisis</p>
                </div>
              </button>

              <button
                onClick={() => handleActualExport('csv')}
                className="w-full flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors !rounded-button"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-file-text-line text-white text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Archivo CSV</p>
                  <p className="text-sm text-gray-500">Datos sin formato, compatible</p>
                </div>
              </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <i className="ri-information-line text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Datos incluidos</p>
                  <p className="text-xs text-blue-700">
                    Peso, medidas corporales, calorías, macros, hidratación y progreso fotográfico
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goals Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Editar Metas</h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-target-line text-purple-600 text-2xl"></i>
                </div>
                <p className="text-gray-600 text-sm">
                  Ajusta tus metas para mantener tu motivación y progreso
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso objetivo (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalSettings.weightGoal}
                    onChange={(e) => handleGoalInputChange('weightGoal', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pérdida semanal objetivo (kg)
                  </label>
                  <select
                    value={goalSettings.weeklyLossGoal}
                    onChange={(e) => handleGoalInputChange('weeklyLossGoal', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={0.25}>0.25 kg/semana (lento)</option>
                    <option value={0.5}>0.5 kg/semana (moderado)</option>
                    <option value={0.75}>0.75 kg/semana (rápido)</option>
                    <option value={1.0}>1.0 kg/semana (muy rápido)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={goalSettings.deadline}
                    onChange={(e) => handleGoalInputChange('deadline', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                    <i className="ri-lightbulb-line text-purple-600"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-800 mb-1">Recomendación</p>
                    <p className="text-xs text-purple-700">
                      Una pérdida de 0.5 kg por semana es saludable y sostenible para la mayoría de personas
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGoals}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-medium rounded-xl !rounded-button"
                >
                  Guardar Metas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Progress Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-alert-line text-red-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Reiniciar Progreso?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción eliminará todo tu historial de peso, medidas y progreso. Esta acción no se puede deshacer.
            </p>

            <div className="space-y-3">
              <div className="bg-red-50 rounded-xl p-3 mb-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <i className="ri-information-line text-red-600"></i>
                  <span className="text-sm font-medium">Se perderán todos los datos</span>
                </div>
                <ul className="text-xs text-red-600 mt-2 ml-5">
                  <li>• Historial de peso (52 registros)</li>
                  <li>Medidas corporales</li>
                  <li>Fotos de progreso</li>
                  <li>Estadísticas y logros</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium !rounded-button"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors !rounded-button"
                >
                  Confirmar Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {showMoreOptions && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMoreOptions(false)}></div>
      )}
    </div>
  );
}

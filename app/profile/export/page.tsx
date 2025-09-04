'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProfileExportPage() {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedData, setSelectedData] = useState({
    profile: true,
    nutrition: true,
    workouts: true,
    progress: false,
    hydration: false,
    weight: false
  });
  const [dateRange, setDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const formats = [
    { id: 'pdf', name: 'PDF', icon: 'ri-file-pdf-line', description: 'Documento con formato' },
    { id: 'csv', name: 'CSV', icon: 'ri-file-excel-line', description: 'Datos para Excel' },
    { id: 'json', name: 'JSON', icon: 'ri-file-code-line', description: 'Formato técnico' }
  ];

  const dataTypes = [
    { id: 'profile', name: 'Información Personal', icon: 'ri-user-line', size: '2 KB' },
    { id: 'nutrition', name: 'Registro de Comidas', icon: 'ri-restaurant-line', size: '150 KB' },
    { id: 'workouts', name: 'Ejercicios y Rutinas', icon: 'ri-run-line', size: '85 KB' },
    { id: 'progress', name: 'Progreso y Metas', icon: 'ri-bar-chart-line', size: '25 KB' },
    { id: 'hydration', name: 'Registro de Hidratación', icon: 'ri-drop-line', size: '12 KB' },
    { id: 'weight', name: 'Historial de Peso', icon: 'ri-scales-3-line', size: '8 KB' }
  ];

  const dateRanges = [
    { id: 'week', name: 'Última semana' },
    { id: 'month', name: 'Último mes' },
    { id: '3months', name: 'Últimos 3 meses' },
    { id: '6months', name: 'Últimos 6 meses' },
    { id: 'year', name: 'Último año' },
    { id: 'all', name: 'Todos los datos' }
  ];

  const handleDataToggle = (dataType: string) => {
    setSelectedData(prev => ({
      ...prev,
      [dataType]: !prev[dataType as keyof typeof prev]
    }));
  };

  const handleExport = () => {
    setIsExporting(true);
    
    // Simular exportación
    setTimeout(() => {
      setIsExporting(false);
      const selectedCount = Object.values(selectedData).filter(Boolean).length;
      alert(`Exportación completada! ${selectedCount} tipos de datos exportados en formato ${selectedFormat.toUpperCase()}`);
    }, 2000);
  };

  const getTotalSize = () => {
    let total = 0;
    Object.entries(selectedData).forEach(([key, selected]) => {
      if (selected) {
        const dataType = dataTypes.find(d => d.id === key);
        if (dataType) {
          const size = parseFloat(dataType.size.replace(/[^0-9.]/g, ''));
          total += size;
        }
      }
    });
    return total > 1000 ? `${(total/1000).toFixed(1)} MB` : `${total.toFixed(0)} KB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Exportar Datos</h1>
          <div className="w-8 h-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Export Info */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mr-4">
              <i className="ri-download-cloud-line text-purple-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Exportar mis Datos</h2>
              <p className="text-sm text-gray-600">Descarga tu información personal</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <i className="ri-information-line text-blue-600 text-lg mr-3 mt-0.5"></i>
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">Privacidad y Seguridad</p>
                <p className="text-xs text-blue-700">
                  Tus datos se exportan de forma segura. El archivo solo estará disponible para descarga durante 24 horas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Formato de Exportación</h3>
          <div className="space-y-3">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`w-full p-4 border-2 rounded-xl transition-all ${
                  selectedFormat === format.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      selectedFormat === format.id 
                        ? 'bg-purple-100' 
                        : 'bg-gray-100'
                    }`}>
                      <i className={`${format.icon} text-lg ${
                        selectedFormat === format.id 
                          ? 'text-purple-600' 
                          : 'text-gray-600'
                      }`}></i>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">{format.name}</p>
                      <p className="text-xs text-gray-600">{format.description}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedFormat === format.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedFormat === format.id && (
                      <i className="ri-check-line text-white text-xs flex items-center justify-center h-full"></i>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Selection */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Seleccionar Datos</h3>
          <div className="space-y-3">
            {dataTypes.map((dataType) => (
              <div
                key={dataType.id}
                className={`p-4 border rounded-xl transition-all ${
                  selectedData[dataType.id as keyof typeof selectedData]
                    ? 'border-purple-200 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <i className={`${dataType.icon} text-gray-600 text-sm`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{dataType.name}</p>
                      <p className="text-xs text-gray-500">Tamaño: {dataType.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDataToggle(dataType.id)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      selectedData[dataType.id as keyof typeof selectedData]
                        ? 'bg-purple-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      selectedData[dataType.id as keyof typeof selectedData]
                        ? 'transform translate-x-6'
                        : 'transform translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Rango de Fechas</h3>
          <div className="grid grid-cols-2 gap-2">
            {dateRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  dateRange === range.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.name}
              </button>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen de Exportación</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600">Tipos de datos</p>
              <p className="text-xl font-bold text-purple-600">
                {Object.values(selectedData).filter(Boolean).length}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600">Tamaño total</p>
              <p className="text-xl font-bold text-blue-600">{getTotalSize()}</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Formato:</span>
              <span className="font-medium text-gray-800">{selectedFormat.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Período:</span>
              <span className="font-medium text-gray-800">
                {dateRanges.find(r => r.id === dateRange)?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="space-y-4">
            <button
              onClick={handleExport}
              disabled={isExporting || Object.values(selectedData).every(v => !v)}
              className={`w-full py-4 rounded-xl font-medium transition-all ${
                isExporting || Object.values(selectedData).every(v => !v)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
              }`}
            >
              {isExporting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Exportando datos...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <i className="ri-download-line text-lg mr-2"></i>
                  Iniciar Exportación
                </div>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Recibirás un email cuando la exportación esté lista
              </p>
              <Link 
                href="/profile"
                className="text-sm text-purple-600 font-medium"
              >
                Volver al perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 mt-6">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <i className="ri-question-line text-blue-600 text-lg"></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">¿Necesitas ayuda?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Si tienes problemas con la exportación, consulta nuestras preguntas frecuentes o contacta soporte.
              </p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-white text-blue-600 rounded-lg text-xs font-medium">
                  FAQ
                </button>
                <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium">
                  Contactar
                </button>
              </div>
            </div>
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
          <Link href="/profile" className="flex flex-col items-center justify-center bg-purple-50">
            <i className="ri-user-fill text-purple-600 text-lg"></i>
            <span className="text-xs text-purple-600 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
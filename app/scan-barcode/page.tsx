'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ScanBarcode() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');

  const handleStartScan = () => {
    setIsScanning(true);
    // Simular escaneo después de 3 segundos
    setTimeout(() => {
      setScannedCode('7501234567890');
      setIsScanning(false);
    }, 3000);
  };

  const recentScans = [
    { code: '7501234567890', name: 'Cereal Fitness Original', brand: 'Nestlé', calories: 110 },
    { code: '7506174507234', name: 'Yogurt Griego Natural', brand: 'Alpura', calories: 100 },
    { code: '7501000673209', name: 'Atún en Agua', brand: 'Dolores', calories: 120 },
    { code: '7501030485739', name: 'Pan Integral', brand: 'Bimbo', calories: 80 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/add-food" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
          </Link>
          <h1 className="text-lg font-semibold">Escanear Código</h1>
          <div className="w-8 h-8"></div>
        </div>
      </header>

      <main className="pt-16 pb-20 px-4">
        {/* Scanner Area */}
        <div className="mt-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            {!isScanning && !scannedCode && (
              <>
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-qr-scan-2-line text-white text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Escanear Código de Barras</h3>
                <p className="text-gray-500 mb-6">Apunta la cámara hacia el código de barras del producto</p>
                <button
                  onClick={handleStartScan}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg !rounded-button"
                >
                  Iniciar Escaneo
                </button>
              </>
            )}

            {isScanning && (
              <>
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <i className="ri-qr-scan-2-line text-white text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Escaneando...</h3>
                <p className="text-gray-500 mb-6">Mantén el código centrado en la pantalla</p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                </div>
              </>
            )}

            {scannedCode && (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-green-600 text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Código Escaneado!</h3>
                <p className="text-gray-500 mb-2">Código: {scannedCode}</p>
                <p className="text-sm text-gray-400 mb-6">Cereal Fitness Original - Nestlé</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setScannedCode('');
                      setIsScanning(false);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium !rounded-button"
                  >
                    Escanear Otro
                  </button>
                  <Link href="/add-food" className="flex-1">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium !rounded-button">
                      Agregar
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Manual Input */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingreso Manual</h3>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ingresa el código manualmente"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium !rounded-button">
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Escaneos Recientes</h3>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {recentScans.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-qr-code-line text-white text-lg"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.brand} • {item.calories} kcal</p>
                    <p className="text-xs text-gray-400">{item.code}</p>
                  </div>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-add-line text-blue-600 text-xl"></i>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <i className="ri-lightbulb-line text-blue-600 text-lg"></i>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Consejos para escanear</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Asegúrate de tener buena iluminación</li>
                <li>• Mantén el código centrado en la pantalla</li>
                <li>• Limpia la lente de la cámara si es necesario</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

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
            <span className="text-xs text-blue-600 font-medium">Agregar</span>
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
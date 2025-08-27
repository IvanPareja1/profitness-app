
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase, callEdgeFunction, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

declare global {
  interface Window { Quagga: any; }
}

type BarcodeScannedData = {
  name: string;
  brand?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  barcode?: string;
  image_url?: string;
  ingredients?: string;
  serving_size?: string;
  categories?: string;
  error?: boolean;
  message?: string;
};

type AIScannedData = {
  name: string;
  items: string[];
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function ScanPage() {
  const [scanMode, setScanMode] = useState<'barcode' | 'ai'>('barcode');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedData, setScannedData] = useState<BarcodeScannedData | AIScannedData | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>('desayuno');
  const [cameraError, setCameraError] = useState<string>('');
  const [quaggaLoaded, setQuaggaLoaded] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const mealTypes = ['desayuno', 'almuerzo', 'cena', 'snacks'] as const;


  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/auth');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing user:', error);
        router.push('/auth');
      }
    };

    const loadQuagga = () => {
      if (typeof window !== 'undefined' && !window.Quagga) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/quagga@0.12.1/dist/quagga.min.js';
        script.onload = () => setQuaggaLoaded(true);
        script.onerror = () => setCameraError('Error cargando QuaggaJS');
        document.head.appendChild(script);
      } else if (window.Quagga) {
        setQuaggaLoaded(true);
      }
    };

    initializeUser();
    loadQuagga();
    return () => { stopBarcodeScanner(); };
  }, []);


  function isBarcodeScannedData(data: BarcodeScannedData | AIScannedData | null): data is BarcodeScannedData {
    return data !== null && typeof data === 'object' && 'barcode' in data;
  }

  const startBarcodeScanner = async () => {
    if (!quaggaLoaded || !scannerRef.current) {
      setCameraError('El escáner aún no está listo. Espera un momento.');
      return;
    }
    setIsScanning(true);
    setCameraError('');
    try {
      window.Quagga.init({
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: { width: 640, height: 480, facingMode: 'environment' }
        },
        decoder: { readers: ['ean_reader', 'upc_reader', 'code_128_reader'] },
        locate: true
      }, (err: any) => {
        if (err) {
          setCameraError('No se pudo inicializar el escáner. Verifica los permisos de cámara.');
          setIsScanning(false);
          return;
        }
        window.Quagga.start();
        window.Quagga.onDetected((result: any) => {
          const code = result.codeResult.code;
          if (code && code.length >= 8) {
            handleBarcodeDetected(code);
          }
        });
      });
    } catch (error) {
      setCameraError('Error al acceder a la cámara. Verifica los permisos.');
      setIsScanning(false);
    }
  };

  const stopBarcodeScanner = () => {
    if (window.Quagga) {
      window.Quagga.stop();
      window.Quagga.offDetected();
    }
    setIsScanning(false);
  };


  const handleBarcodeDetected = async (barcode: string) => {
    stopBarcodeScanner();
    setIsLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      if (!response.ok || data.status === 0) throw new Error('Producto no encontrado');
      const product = data.product;
      setScannedData({
        name: product.product_name || 'Producto sin nombre',
        brand: product.brands,
        calories: product.nutriments?.['energy-kcal_100g'] || 0,
        protein: product.nutriments?.['proteins_100g'] || 0,
        carbs: product.nutriments?.['carbohydrates_100g'] || 0,
        fat: product.nutriments?.['fat_100g'] || 0,
        barcode,
        image_url: product.image_front_url,
        ingredients: product.ingredients_text,
        serving_size: product.serving_size,
        categories: product.categories
      });
    } catch (error) {
      setScannedData({
        name: 'Producto no encontrado',
        error: true,
        barcode,
        message: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar stopScanning, ya no se usa html5QrCode

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    setCameraError('');

    try {
      // Simular análisis de IA para detección de alimentos
      setTimeout(() => {
        const mockAIData: AIScannedData = {
          name: "Comida Detectada por IA",
          items: ["Manzana", "Pan integral", "Queso"],
          totalCalories: 320,
          protein: 12,
          carbs: 45,
          fat: 8
        };
        
        setScannedData(mockAIData);
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Error processing image:', error);
      setCameraError('Error al procesar la imagen');
      setIsLoading(false);
    }
  };

  const saveScannedFood = async () => {
    if (!scannedData || !user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const foodData = {
        food_name: scannedData.name,
        brand: isBarcodeScannedData(scannedData) ? scannedData.brand : '',
        meal_type: selectedMeal,
        calories: isBarcodeScannedData(scannedData) ? scannedData.calories : scannedData.totalCalories,
        protein: scannedData.protein || 0,
        carbs: scannedData.carbs || 0,
        fat: scannedData.fat || 0,
        scan_method: scanMode === 'barcode' ? 'barcode' : 'ai_vision',
        date: new Date().toISOString().split('T')[0]
      };

      await callEdgeFunction('nutrition-tracker', foodData, token);
      
      // Redirigir a nutrition con mensaje de éxito
      router.push('/nutrition?added=success');
    } catch (error) {
      console.error('Error saving food:', error);
      setCameraError('Error al guardar el alimento');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/nutrition" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Escanear</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setScanMode('barcode');
                if (isScanning) stopBarcodeScanner();
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                scanMode === 'barcode'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              Código
            </button>
            <button
              onClick={() => {
                setScanMode('ai');
                if (isScanning) stopBarcodeScanner();
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                scanMode === 'ai'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              IA
            </button>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        {!scannedData && !isScanning && !isLoading && (
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              scanMode === 'barcode' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              <i className={`text-3xl ${
                scanMode === 'barcode' ? 'ri-qr-code-line text-blue-500' : 'ri-camera-ai-line text-purple-500'
              }`}></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {scanMode === 'barcode' ? 'Escáner de Código de Barras' : 'Escáner IA Visual'}
            </h2>
            <p className="text-gray-600">
              {scanMode === 'barcode' ? 'Escanea un código de barras' : 'Toma una foto de tu comida'}
            </p>
            <p className="text-sm text-gray-500">
              {scanMode === 'barcode'
                ? 'Información nutricional de OpenFoodFacts'
                : 'La IA identificará automáticamente los alimentos'}
            </p>
            {!quaggaLoaded && scanMode === 'barcode' && (
              <p className="text-xs text-yellow-600 mt-2">
                Cargando escáner...
              </p>
            )}
          </div>
        )}

        {/* Scanner Container */}
        {isScanning && scanMode === 'barcode' && (
          <div className="mb-6">
            <div id="scanner-container" ref={scannerRef} className="w-full max-w-md mx-auto"></div>
            <div className="text-center mt-4">
              <button
                onClick={stopBarcodeScanner}
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-medium"
              >
                Detener Escáner
              </button>
            </div>
          </div>
        )}

        {!scannedData && !isScanning && !isLoading && (
          <div className="space-y-4">
            {scanMode === 'barcode' ? (
              <button
                onClick={startBarcodeScanner}
                disabled={!quaggaLoaded}
                className={`w-full py-4 rounded-xl font-semibold ${
                  quaggaLoaded
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <i className="ri-camera-line mr-2"></i>
                {quaggaLoaded ? 'Iniciar Escáner de Cámara' : 'Cargando...'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-semibold"
                >
                  <i className="ri-camera-line mr-2"></i>
                  Tomar Foto
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-purple-300 text-purple-600 py-4 rounded-xl font-semibold"
                >
                  <i className="ri-image-line mr-2"></i>
                  Subir desde Galería
                </button>
              </>
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center">
            <div className={`w-64 h-64 mx-auto mb-6 rounded-2xl border-4 border-dashed relative overflow-hidden ${
              scanMode === 'barcode' ? 'border-blue-300 bg-blue-50' : 'border-purple-300 bg-purple-50'
            }`}>
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin ${
                    scanMode === 'barcode' ? 'border-blue-500' : 'border-purple-500'
                  }`}></div>
                  <p className={`font-medium ${
                    scanMode === 'barcode' ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                    {scanMode === 'barcode' ? 'Consultando OpenFoodFacts...' : 'Analizando imagen...'}
                  </p>
                </div>
              </div>
            </div>

            {cameraError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-600 text-sm">{cameraError}</p>
              </div>
            )}

            <p className="text-gray-600 font-medium">
              {scanMode === 'barcode'
                ? 'Obteniendo información nutricional...'
                : 'Procesando imagen...'}
            </p>
          </div>
        )}

        {scannedData && (
          <div className="space-y-4">
            {/* Selector de tipo de comida */}
            {!isBarcodeScannedData(scannedData) || !scannedData.error && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de comida:</label>
                <div className="flex gap-2">
                  {mealTypes.map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setSelectedMeal(meal)}
                      className={`px-3 py-1 rounded-lg border text-sm font-medium transition-all ${
                        selectedMeal === meal
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render para datos escaneados */}
            <div className={`border rounded-xl p-4 ${
              isBarcodeScannedData(scannedData) && scannedData.error 
                ? 'bg-red-50 border-red-200' 
                : isBarcodeScannedData(scannedData)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-start space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isBarcodeScannedData(scannedData) && scannedData.error 
                    ? 'bg-red-100' 
                    : isBarcodeScannedData(scannedData)
                      ? 'bg-green-100'
                      : 'bg-purple-100'
                }`}>
                  <i className={`text-lg ${
                    isBarcodeScannedData(scannedData) && scannedData.error
                      ? 'ri-close-line text-red-500'
                      : isBarcodeScannedData(scannedData)
                        ? 'ri-check-line text-green-500'
                        : 'ri-camera-ai-line text-purple-500'
                  }`}></i>
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    isBarcodeScannedData(scannedData) && scannedData.error 
                      ? 'text-red-800' 
                      : isBarcodeScannedData(scannedData)
                        ? 'text-green-800'
                        : 'text-purple-800'
                  }`}>{scannedData.name}</h3>
                  {isBarcodeScannedData(scannedData) && scannedData.brand && (
                    <p className={`text-sm ${
                      scannedData.error ? 'text-red-600' : 'text-green-600'
                    }`}>{scannedData.brand}</p>
                  )}
                  {isBarcodeScannedData(scannedData) && scannedData.barcode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Código: {scannedData.barcode}
                    </p>
                  )}
                  {isBarcodeScannedData(scannedData) && scannedData.error && scannedData.message && (
                    <p className="text-sm text-red-600 mt-2">{scannedData.message}</p>
                  )}
                </div>
                {isBarcodeScannedData(scannedData) && scannedData.image_url && (
                  <img
                    src={scannedData.image_url}
                    alt={scannedData.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              {/* Mostrar alimentos detectados para IA */}
              {!isBarcodeScannedData(scannedData) && 'items' in scannedData && (
                <div className="mb-4">
                  <p className="font-medium text-gray-800 mb-2">Alimentos detectados:</p>
                  <ul className="space-y-1">
                    {scannedData.items.map((item: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <i className="ri-arrow-right-s-line text-xs"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Información nutricional solo si no hay error */}
              {!(isBarcodeScannedData(scannedData) && scannedData.error) && (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {isBarcodeScannedData(scannedData) ? scannedData.calories : scannedData.totalCalories}
                      </div>
                      <div className="text-xs text-gray-500">kcal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-500">{scannedData.protein || 0}g</div>
                      <div className="text-xs text-gray-500">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-500">{scannedData.carbs || 0}g</div>
                      <div className="text-xs text-gray-500">Carbohidratos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-500">{scannedData.fat || 0}g</div>
                      <div className="text-xs text-gray-500">Grasas</div>
                    </div>
                  </div>

                  {/* Información adicional para código de barras exitoso */}
                  {isBarcodeScannedData(scannedData) && !scannedData.error && (
                    <>
                      {((scannedData.fiber && scannedData.fiber > 0) ||
                       (scannedData.sugar && scannedData.sugar > 0) ||
                       (scannedData.sodium && scannedData.sodium > 0)) && (
                        <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t border-gray-200">
                          {scannedData.fiber && scannedData.fiber > 0 && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-green-600">{scannedData.fiber}g</div>
                              <div className="text-xs text-gray-500">Fibra</div>
                            </div>
                          )}
                          {scannedData.sugar && scannedData.sugar > 0 && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-red-500">{scannedData.sugar}g</div>
                              <div className="text-xs text-gray-500">Azúcar</div>
                            </div>
                          )}
                          {scannedData.sodium && scannedData.sodium > 0 && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-purple-500">{scannedData.sodium}g</div>
                              <div className="text-xs text-gray-500">Sodio</div>
                            </div>
                          )}
                        </div>
                      )}
                      {scannedData.ingredients && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 mb-1">Ingredientes:</p>
                          <p className="text-xs text-gray-600">{scannedData.ingredients}</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setScannedData(null);
                    setCameraError('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
                >
                  Escanear Otro
                </button>
                {!(isBarcodeScannedData(scannedData) && scannedData.error) && (
                  <button
                    onClick={saveScannedFood}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium"
                  >
                    Agregar a Diario
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageUpload}
        />

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
          <h3 className="font-semibold text-gray-800 mb-4">Información OpenFoodFacts</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-database-2-line text-blue-500 text-sm"></i>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Base de Datos Global</h4>
                <p className="text-sm text-blue-600">Más de 2 millones de productos</p>
              </div>
            </div>
            <p className="text-xs text-blue-700">
              Los datos nutricionales se obtienen automáticamente de OpenFoodFacts, 
              una base de datos colaborativa y gratuita de productos alimentarios de todo el mundo.
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <i className="ri-camera-line text-green-500"></i>
              <h4 className="font-medium text-green-800">Escáner Real Activado</h4>
            </div>
            <p className="text-xs text-green-700">
              ✅ Cámara funcional<br/>
              ✅ Detección de códigos reales<br/>
              ✅ Datos nutricionales automáticos<br/>
              ✅ Integración con OpenFoodFacts
            </p>
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
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
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

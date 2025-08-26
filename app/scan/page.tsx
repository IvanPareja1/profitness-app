// Type guard para BarcodeScannedData
function isBarcodeScannedData(data: ScannedData): data is BarcodeScannedData {
  return data !== null && typeof data === 'object' && ('barcode' in data || 'error' in data);
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase, callEdgeFunction, getCurrentUser } from '@/lib/supabase';

// Define a minimal User type if not imported from elsewhere
type User = {
  id: string;
  // Add other fields as needed
};

// Tipos para los datos escaneados
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
};
type AIScannedData = {
  name: string;
  items: string[];
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
};
type ScannedData = BarcodeScannedData | AIScannedData | null;

export default function ScanPage() {
  const [scanMode, setScanMode] = useState<'barcode' | 'ai'>('barcode');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<ScannedData>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scanInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeUser();
    return () => {
      stopCamera();
    };
  }, []);

  const initializeUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        videoRef.current.onloadedmetadata = () => {
          if (scanMode === 'barcode') {
            startBarcodeDetection();
          }
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }

    setIsScanning(false);
  };

  const startBarcodeDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    scanInterval.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simular detección de código de barras
        // En una implementación real, usarías una librería como ZXing o QuaggaJS
        detectMockBarcode();
      }
    }, 500);
  };

  const detectMockBarcode = () => {
    // Simular detección exitosa después de 3 segundos
    setTimeout(() => {
      if (isScanning) {
        // Códigos de barras reales para testing
        const testBarcodes = [
          '3017620422003', // Nutella
          '8076800195057', // Barilla Pasta
          '3560070013906', // Evian Water
          '7622210951083', // Oreo
          '8714100770238'  // Magnum Ice Cream
        ];
        const randomBarcode = testBarcodes[Math.floor(Math.random() * testBarcodes.length)];
        handleBarcodeDetected(randomBarcode);
      }
    }, 3000);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    stopCamera();
    setIsLoading(true);

    try {
      const productData = await fetchProductFromOpenFoodFacts(barcode);
      setScannedData(productData);
    } catch (error) {
      console.error('Error fetching product data:', error);
      setScannedData({
        name: 'Producto no encontrado',
        brand: 'Código: ' + barcode,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        error: true,
        barcode: barcode
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductFromOpenFoodFacts = async (barcode: string): Promise<BarcodeScannedData> => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (!response.ok || data.status === 0) {
        throw new Error('Producto no encontrado en OpenFoodFacts');
      }

      const product = data.product;
      const nutriments = product.nutriments || {};

      // Extraer información nutricional por 100g
      return {
        name: product.product_name || product.generic_name || 'Producto sin nombre',
        brand: product.brands || 'Marca desconocida',
        calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
        protein: Math.round((nutriments['proteins_100g'] || nutriments['proteins'] || 0) * 10) / 10,
        carbs: Math.round((nutriments['carbohydrates_100g'] || nutriments['carbohydrates'] || 0) * 10) / 10,
        fat: Math.round((nutriments['fat_100g'] || nutriments['fat'] || 0) * 10) / 10,
        fiber: Math.round((nutriments['fiber_100g'] || nutriments['fiber'] || 0) * 10) / 10,
        sugar: Math.round((nutriments['sugars_100g'] || nutriments['sugars'] || 0) * 10) / 10,
        sodium: Math.round((nutriments['sodium_100g'] || nutriments['sodium'] || 0) * 1000) / 1000,
        barcode: barcode,
        image_url: product.image_front_url || product.image_url,
        ingredients: product.ingredients_text,
        serving_size: product.serving_size,
        categories: product.categories
      };
    } catch (error) {
      console.error('Error calling OpenFoodFacts API:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setScanMode('ai');
      setIsScanning(true);
      setIsLoading(true);

      // Simular análisis de IA
      setTimeout(() => {
        setScannedData({
          name: 'Plato detectado por IA',
          items: ['Pollo a la plancha - 180g', 'Arroz integral - 100g', 'Brócoli - 80g'],
          totalCalories: 420,
          protein: 35,
          carbs: 45,
          fat: 8
        });
        setIsScanning(false);
        setIsLoading(false);
      }, 2000);
    }
  };

  const saveScannedFood = async () => {
    if (!user || !scannedData) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const foodData = {
        food_name: scannedData.name,
        brand: 'brand' in scannedData ? scannedData.brand : undefined,
        calories: 'calories' in scannedData ? scannedData.calories : ('totalCalories' in scannedData ? scannedData.totalCalories : undefined),
        protein: scannedData.protein,
        carbs: scannedData.carbs,
        fat: scannedData.fat,
        quantity: 100,
        meal_type: 'snacks',
        scan_method: scanMode,
        barcode: 'barcode' in scannedData ? scannedData.barcode : undefined,
        ingredients: 'ingredients' in scannedData ? scannedData.ingredients : undefined,
        fiber: 'fiber' in scannedData ? scannedData.fiber : undefined,
        sugar: 'sugar' in scannedData ? scannedData.sugar : undefined,
        sodium: 'sodium' in scannedData ? scannedData.sodium : undefined
      };

      await callEdgeFunction('nutrition-tracker', {
        action: 'add_food',
        userId: user.id,
        foodData
      }, token);

      // Mostrar confirmación y redireccionar
      alert('Alimento agregado correctamente');

    } catch (error) {
      console.error('Error saving food:', error);
      alert('Error al guardar el alimento');
    }
  };

  const handleBarcodeClick = () => {
    setScanMode('barcode');
    setScannedData(null);
    setCameraError(null);
    if (isScanning) {
      stopCamera();
    }
  };

  const handleAIClick = () => {
    setScanMode('ai');
    setScannedData(null);
    setCameraError(null);
    if (isScanning) {
      stopCamera();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Escanear Alimentos</h1>
          </div>
          {isScanning && (
            <button
              onClick={stopCamera}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium"
            >
              Detener
            </button>
          )}
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Método de Escaneo</h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => {
                setScanMode('barcode');
                setScannedData(null);
                setCameraError(null);
                if (isScanning) stopCamera();
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                scanMode === 'barcode'
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                scanMode === 'barcode' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <i className={`ri-qr-code-line text-xl ${
                  scanMode === 'barcode' ? 'text-blue-500' : 'text-gray-400'
                }`}></i>
              </div>
              <h3 className={`font-semibold text-sm ${
                scanMode === 'barcode' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Código de Barras
              </h3>
              <p className="text-xs text-gray-500 mt-1">Escanea productos empaquetados</p>
            </button>

            <button
              onClick={() => {
                setScanMode('ai');
                setScannedData(null);
                setCameraError(null);
                if (isScanning) stopCamera();
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                scanMode === 'ai'
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                scanMode === 'ai' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <i className={`ri-camera-ai-line text-xl ${
                  scanMode === 'ai' ? 'text-purple-500' : 'text-gray-400'
                }`}></i>
              </div>
              <h3 className={`font-semibold text-sm ${
                scanMode === 'ai' ? 'text-purple-600' : 'text-gray-600'
              }`}>
                IA Visual
              </h3>
              <p className="text-xs text-gray-500 mt-1">Detecta alimentos en tu plato</p>
            </button>
          </div>

          {!scannedData && !isScanning && !isLoading && (
            <div className="text-center">
              <div className={`w-64 h-64 mx-auto mb-6 rounded-2xl border-4 border-dashed flex items-center justify-center ${
                scanMode === 'barcode' ? 'border-blue-300 bg-blue-50' : 'border-purple-300 bg-purple-50'
              }`}>
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    scanMode === 'barcode' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <i className={`text-2xl ${
                      scanMode === 'barcode'
                        ? 'ri-qr-scan-2-line text-blue-500'
                        : 'ri-camera-line text-purple-500'
                    }`}></i>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    {scanMode === 'barcode' ? 'Escanea un código de barras' : 'Toma una foto de tu comida'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {scanMode === 'barcode'
                      ? 'La información nutricional se obtendrá automáticamente'
                      : 'La IA identificará automáticamente los alimentos'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {scanMode === 'barcode' ? (
                  <button
                    onClick={startCamera}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold"
                  >
                    <i className="ri-camera-line mr-2"></i>
                    Iniciar Escáner
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
            </div>
          )}

          {(isScanning || isLoading) && (
            <div className="text-center">
              <div className={`w-64 h-64 mx-auto mb-6 rounded-2xl border-4 border-dashed relative overflow-hidden ${
                scanMode === 'barcode' ? 'border-blue-300 bg-blue-50' : 'border-purple-300 bg-purple-50'
              }`}>
                {scanMode === 'barcode' && isScanning && !isLoading ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover rounded-xl"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-32 border-2 border-red-400 rounded-lg bg-transparent">
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-red-400"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-red-400"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-red-400"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-red-400"></div>

                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-400 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin ${
                        scanMode === 'barcode' ? 'border-blue-500' : 'border-purple-500'
                      }`}></div>
                      <p className={`font-medium ${
                        scanMode === 'barcode' ? 'text-blue-600' : 'text-purple-600'
                      }`}>
                        {isLoading ? 'Obteniendo información nutricional...' : 'Analizando imagen...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-red-600 text-sm">{cameraError}</p>
                </div>
              )}

              <p className="text-gray-600 font-medium">
                {isLoading
                  ? 'Consultando base de datos OpenFoodFacts...'
                  : scanMode === 'barcode'
                    ? 'Apunta al código de barras...'
                    : 'Procesando imagen...'}
              </p>
            </div>
          )}

          {scannedData && (
            <div className="space-y-4">
              {/* Type guard para BarcodeScannedData */}
              {isBarcodeScannedData(scannedData) ? (
                <div className={`border rounded-xl p-4 ${
                  (scannedData as BarcodeScannedData).error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      (scannedData as BarcodeScannedData).error ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <i className={`text-lg ${
                        (scannedData as BarcodeScannedData).error ? 'ri-close-line text-red-500' : 'ri-check-line text-green-500'
                      }`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        (scannedData as BarcodeScannedData).error ? 'text-red-800' : 'text-green-800'
                      }`}>{scannedData.name}</h3>
                      {(scannedData as BarcodeScannedData).brand && <p className={`text-sm ${
                        (scannedData as BarcodeScannedData).error ? 'text-red-600' : 'text-green-600'
                      }`}>{(scannedData as BarcodeScannedData).brand}</p>}
                      {(scannedData as BarcodeScannedData).barcode && (
                        <p className="text-xs text-gray-500 mt-1">
                          Código: {(scannedData as BarcodeScannedData).barcode}
                        </p>
                      )}
                    </div>
                    {(scannedData as BarcodeScannedData).image_url && (
                      <img
                        src={(scannedData as BarcodeScannedData).image_url}
                        alt={scannedData.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  {/* Nutrición */}
                  {!(scannedData as BarcodeScannedData).error && (
                    <>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">{(scannedData as BarcodeScannedData).calories}</div>
                          <div className="text-xs text-gray-500">kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-500">{(scannedData as BarcodeScannedData).protein}g</div>
                          <div className="text-xs text-gray-500">Proteína</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-500">{(scannedData as BarcodeScannedData).carbs}g</div>
                          <div className="text-xs text-gray-500">Carbohidratos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-500">{(scannedData as BarcodeScannedData).fat}g</div>
                          <div className="text-xs text-gray-500">Grasas</div>
                        </div>
                      </div>

                      {(typeof scannedData.fiber === 'number' && scannedData.fiber > 0) ||
                       (typeof scannedData.sugar === 'number' && scannedData.sugar > 0) ||
                       (typeof scannedData.sodium === 'number' && scannedData.sodium > 0) ? (
                        <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t border-gray-200">
                          {typeof scannedData.fiber === 'number' && scannedData.fiber > 0 && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-green-600">{scannedData.fiber}g</div>
                              <div className="text-xs text-gray-500">Fibra</div>
                            </div>
                          )}
                          {typeof scannedData.sugar === 'number' && scannedData.sugar > 0 && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-red-500">{scannedData.sugar}g</div>
                              <div className="text-xs text-gray-500">Azúcar</div>
                            </div>
                          )}
                          {typeof scannedData.sodium === 'number' && scannedData.sodium > 0 && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-purple-500">{scannedData.sodium}g</div>
                              <div className="text-xs text-gray-500">Sodio</div>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {(scannedData as BarcodeScannedData).ingredients && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 mb-1">Ingredientes:</p>
                          <p className="text-xs text-gray-600 line-clamp-3">{(scannedData as BarcodeScannedData).ingredients}</p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setScannedData(null)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
                    >
                      Escanear Otro
                    </button>
                    {!((scannedData as BarcodeScannedData).error) && (
                      <button
                        onClick={saveScannedFood}
                        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium"
                      >
                        Agregar a Diario
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // IA Visual
                <div className="border rounded-xl p-4 bg-purple-50 border-purple-200">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100">
                      <i className="text-lg ri-camera-ai-line text-purple-500"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-800">{scannedData.name}</h3>
                    </div>
                  </div>
                  {'items' in scannedData && (
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
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{('totalCalories' in scannedData ? scannedData.totalCalories : '')}</div>
                      <div className="text-xs text-gray-500">kcal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-500">{scannedData.protein}g</div>
                      <div className="text-xs text-gray-500">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-500">{scannedData.carbs}g</div>
                      <div className="text-xs text-gray-500">Carbohidratos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-500">{scannedData.fat}g</div>
                      <div className="text-xs text-gray-500">Grasas</div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setScannedData(null)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
                    >
                      Escanear Otro
                    </button>
                    <button
                      onClick={saveScannedFood}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium"
                    >
                      Agregar a Diario
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            // @ts-ignore
            capture="camera"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

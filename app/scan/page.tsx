
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase, callEdgeFunction, getCurrentUser } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

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
  items: Array<{
    name: string;
    confidence: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
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
  const [scannerLibraryLoaded, setScannerLibraryLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [html5QrCode, setHtml5QrCode] = useState<any>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');

  const scannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const mealTypes = ['desayuno', 'almuerzo', 'cena', 'snacks'];

  useEffect(() => {
    initializeUser();
    loadScannerLibrary();
    loadStoredApiKey();
    
    return () => {
      cleanupScanner();
    };
  }, []);

  const loadStoredApiKey = () => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('openai_api_key');
      if (storedKey) {
        setOpenaiApiKey(storedKey);
      }
    }
  };

  const saveApiKey = () => {
    if (openaiApiKey.trim() && typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', openaiApiKey.trim());
      setShowApiKeyModal(false);
    }
  };

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

  const loadScannerLibrary = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      setScannerLibraryLoaded(true);
    } catch (error) {
      console.error('Error loading scanner library:', error);
      setCameraError('Error al cargar el escáner. Por favor, recarga la página.');
    }
  };

  const cleanupScanner = () => {
    if (html5QrCode) {
      try {
        if (html5QrCode.getState() === 2) {
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
          }).catch(console.error);
        }
      } catch (error) {
        console.error('Error cleaning up scanner:', error);
      }
      setHtml5QrCode(null);
    }
  };

  const isBarcodeScannedData = (data: any): data is BarcodeScannedData => {
    return data && typeof data === 'object' && ('barcode' in data || 'error' in data);
  };

  const startBarcodeScanner = async () => {
    if (!scannerLibraryLoaded) return;
    
    setIsScanning(true);
    setCameraError('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      const scannerElement = document.getElementById("scanner-container");
      if (scannerElement) {
        scannerElement.innerHTML = '';
      }
      
      const scanner = new Html5Qrcode("scanner-container");
      setHtml5QrCode(scanner);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 100 },
        aspectRatio: 1.0
      };

      await scanner.start(
        { facingMode: "environment" },
        config,
        async (decodedText: string) => {
          setIsLoading(true);
          stopScanning();
          await lookupBarcodeInOpenFoodFacts(decodedText);
        },
        (error: any) => {
          // Error de escaneo continuo - se puede ignorar
        }
      );

    } catch (error) {
      console.error('Error starting barcode scanner:', error);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
      setIsScanning(false);
    }
  };

  const lookupBarcodeInOpenFoodFacts = async (barcode: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const result = await callEdgeFunction('openfoodfacts-lookup', { barcode }, token);
      
      setScannedData(result);
      setIsLoading(false);
    } catch (error) {
      console.error('Error looking up barcode:', error);
      setScannedData({
        name: 'Error al buscar producto',
        error: true,
        message: 'No se pudo obtener información del producto. Intenta de nuevo.',
        barcode
      });
      setIsLoading(false);
    }
  };

  const stopScanning = () => {
    if (html5QrCode) {
      try {
        if (html5QrCode.getState() === 2) {
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
            setIsScanning(false);
            setHtml5QrCode(null);
          }).catch(() => {
            setIsScanning(false);
            setHtml5QrCode(null);
          });
        } else {
          setIsScanning(false);
          setHtml5QrCode(null);
        }
      } catch (error) {
        setIsScanning(false);
        setHtml5QrCode(null);
      }
    } else {
      setIsScanning(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!openaiApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    setCameraError('');

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const base64Image = await convertToBase64(file);
      
      const result = await callEdgeFunction('ai-food-detection', {
        image: base64Image,
        apiKey: openaiApiKey
      }, token);
      
      setScannedData(result);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing image:', error);
      setCameraError('Error al procesar la imagen. Verifica tu conexión y la API key.');
      setIsLoading(false);
    }

    if (event.target) {
      event.target.value = '';
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const saveScannedFood = async () => {
    if (!scannedData || !user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      if (isBarcodeScannedData(scannedData)) {
        const foodData = {
          food_name: scannedData.name,
          brand: scannedData.brand || '',
          meal_type: selectedMeal,
          calories: scannedData.calories || 0,
          protein: scannedData.protein || 0,
          carbs: scannedData.carbs || 0,
          fat: scannedData.fat || 0,
          scan_method: 'barcode',
          date: new Date().toISOString().split('T')[0]
        };

        await callEdgeFunction('nutrition-tracker', foodData, token);
      } else {
        for (const item of scannedData.items) {
          const foodData = {
            food_name: item.name,
            brand: '',
            meal_type: selectedMeal,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            scan_method: 'ai_vision',
            date: new Date().toISOString().split('T')[0]
          };

          await callEdgeFunction('nutrition-tracker', foodData, token);
        }
      }
      
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
                if (html5QrCode) stopScanning();
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
                if (html5QrCode) stopScanning();
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                scanMode === 'ai'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              IA
            </button>
            {scanMode === 'ai' && (
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-full"
              >
                <i className={`ri-key-line text-sm ${openaiApiKey ? 'text-green-500' : 'text-gray-400'}`}></i>
              </button>
            )}
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
              {scanMode === 'barcode' ? 'Escáner de Código de Barras' : 'Detección IA de Alimentos'}
            </h2>
            <p className="text-gray-600">
              {scanMode === 'barcode' ? 'Escanea un código de barras' : 'IA avanzada con GPT-4 Vision'}
            </p>
            <p className="text-sm text-gray-500">
              {scanMode === 'barcode'
                ? 'Información nutricional de OpenFoodFacts'
                : 'Detección automática de múltiples alimentos'}
            </p>
            {!scannerLibraryLoaded && scanMode === 'barcode' && (
              <p className="text-xs text-yellow-600 mt-2">
                Cargando escáner...
              </p>
            )}
            {scanMode === 'ai' && !openaiApiKey && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm text-orange-700 font-medium">⚠️ API Key requerida</p>
                <p className="text-xs text-orange-600 mt-1">
                  Necesitas una API key de OpenAI para usar la detección IA
                </p>
              </div>
            )}
          </div>
        )}

        {isScanning && scanMode === 'barcode' && (
          <div className="mb-6">
            <div id="scanner-container" ref={scannerRef} className="w-full max-w-md mx-auto"></div>
            <div className="text-center mt-4">
              <button
                onClick={stopScanning}
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
                disabled={!scannerLibraryLoaded}
                className={`w-full py-4 rounded-xl font-semibold ${
                  scannerLibraryLoaded
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <i className="ri-camera-line mr-2"></i>
                {scannerLibraryLoaded ? 'Iniciar Escáner de Cámara' : 'Cargando...'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!openaiApiKey}
                  className={`w-full py-4 rounded-xl font-semibold ${
                    openaiApiKey
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <i className="ri-camera-line mr-2"></i>
                  Tomar Foto con IA
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!openaiApiKey}
                  className={`w-full py-4 rounded-xl font-semibold ${
                    openaiApiKey
                      ? 'border-2 border-purple-300 text-purple-600'
                      : 'border-2 border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
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
                    {scanMode === 'barcode' ? 'Consultando OpenFoodFacts...' : 'Analizando con GPT-4 Vision...'}
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
                : 'Procesando imagen con IA...'}
            </p>
          </div>
        )}

        {scannedData && (
          <div className="space-y-4">
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

              {!isBarcodeScannedData(scannedData) && 'items' in scannedData && (
                <div className="mb-4">
                  <p className="font-medium text-gray-800 mb-3">Alimentos detectados por IA:</p>
                  <div className="space-y-2">
                    {scannedData.items.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="font-medium text-gray-800">{item.name}</span>
                          </div>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {Math.round(item.confidence * 100)}% confianza
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-gray-800">{item.calories}</div>
                            <div className="text-gray-500">kcal</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-blue-500">{item.protein}g</div>
                            <div className="text-gray-500">Proteína</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-500">{item.carbs}g</div>
                            <div className="text-gray-500">Carbohidratos</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-yellow-500">{item.fat}g</div>
                            <div className="text-gray-500">Grasas</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Configurar OpenAI API</h3>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
                >
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Para usar la detección IA necesitas una API key de OpenAI:
                </p>
                <ol className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>1. Visita <span className="font-mono bg-gray-100 px-1 rounded">platform.openai.com</span></li>
                  <li>2. Crea una cuenta o inicia sesión</li>
                  <li>3. Ve a API Keys y crea una nueva</li>
                  <li>4. Copia y pega la key aquí</li>
                </ol>
                <input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm font-mono"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveApiKey}
                  disabled={!openaiApiKey.trim()}
                  className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-medium disabled:bg-gray-300"
                >
                  Guardar
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-700">
                  <i className="ri-shield-check-line mr-1"></i>
                  Tu API key se guarda localmente en tu dispositivo y nunca se comparte.
                </p>
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
          <h3 className="font-semibold text-gray-800 mb-4">Tecnologías Integradas</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-database-2-line text-blue-500 text-sm"></i>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">OpenFoodFacts</h4>
                  <p className="text-sm text-blue-600">Más de 2 millones de productos</p>
                </div>
              </div>
              <p className="text-xs text-blue-700">
                Base de datos colaborativa mundial de productos alimentarios con información nutricional completa.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-camera-ai-line text-purple-500 text-sm"></i>
                </div>
                <div>
                  <h4 className="font-medium text-purple-800">GPT-4 Vision</h4>
                  <p className="text-sm text-purple-600">IA avanzada para imágenes</p>
                </div>
              </div>
              <p className="text-xs text-purple-700">
                Tecnología de visión por computadora que identifica automáticamente múltiples alimentos en una imagen con alta precisión.
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${openaiApiKey ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-purple-700">
                  {openaiApiKey ? 'Configurado y listo' : 'Requiere configuración'}
                </span>
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

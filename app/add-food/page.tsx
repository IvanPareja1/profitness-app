
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../components/BottomNavigation';
import { deviceTime } from '../../lib/device-time-utils';
import { 
  initializeBarcodeScanner, 
  stopBarcodeScanner, 
  getProductByBarcode, 
  BarcodeResult 
} from '../../lib/simple-barcode-scanner';

interface FoodItem {
  id: string;
  name: string;
  brand: string;
  barcode?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export default function AddFood() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('es');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [mealType, setMealType] = useState('desayuno');
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState<NutritionInfo>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0
  });
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string>('');
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Referencias para el escáner - MEJORADAS
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Verificar autenticación
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      router.push('/login');
      return;
    }

    // Obtener idioma del perfil
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        setLanguage(profile.language || 'es');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }

    // Inicializar mealType basado en la hora actual del dispositivo
    try {
      const currentTime = deviceTime.getCurrentTime({ use24Hour: true });
      const hour = parseInt(currentTime.split(':')[0]);

      // Sugerir tipo de comida basado en la hora del dispositivo
      if (hour >= 6 && hour < 12) {
        setMealType('desayuno');
      } else if (hour >= 12 && hour < 17) {
        setMealType('almuerzo');
      } else if (hour >= 17 && hour < 22) {
        setMealType('cena');
      } else {
        setMealType('snack');
      }
    } catch (error) {
      console.warn('Error detectando hora del dispositivo para meal type:', error);
      // Mantener valor por defecto si hay error
    }

    // Limpiar recursos al desmontar el componente
    return () => {
      if (scannerRef.current) {
        stopBarcodeScanner(scannerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [router]);

  const translations = {
    es: {
      addFood: 'Agregar Comida',
      searchFood: 'Buscar alimento',
      searchPlaceholder: 'Escribe el nombre del alimento...',
      scanBarcode: 'Escanear código',
      quantity: 'Cantidad',
      grams: 'gramos',
      mealType: 'Tipo de comida',
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      snack: 'Snack',
      addToLog: 'Agregar al registro',
      nutrition: 'Información nutricional',
      calories: 'Calorías',
      protein: 'Proteínas',
      carbs: 'Carbohidratos',
      fats: 'Grasas',
      fiber: 'Fibra',
      per100g: 'por 100g',
      noResults: 'No se encontraron resultados',
      searchSomething: 'Busca un alimento para comenzar',
      cancel: 'Cancelar',
      save: 'Guardar',
      close: 'Cerrar',
      searching: 'Buscando...',
      scanning: 'Escaneando...',
      scanInstructions: 'Apunta la cámara hacia el código de barras',
      foodAdded: 'Alimento agregado correctamente',
      errorAdding: 'Error al agregar alimento',
      popular: 'Alimentos populares',
      recent: 'Agregados recientemente',
      // Nuevas traducciones para el escáner
      startCamera: 'Iniciar cámara',
      stopScanning: 'Detener escaneo',
      cameraError: 'Error al acceder a la cámara',
      scannerNotSupported: 'Escáner no soportado en este dispositivo',
      productNotFound: 'Producto no encontrado',
      productFound: 'Producto encontrado',
      loadingProduct: 'Buscando producto...',
      retryScanning: 'Reintentar escaneo',
      scannerInstructions: 'Mantén el código centrado y espera a que se detecte automáticamente',
      lastScanned: 'Último código escaneado',
      allowCamera: 'Por favor permite el acceso a la cámara para escanear códigos',
      invalidBarcode: 'Código de barras inválido'
    },
    en: {
      addFood: 'Add Food',
      searchFood: 'Search food',
      searchPlaceholder: 'Type food name...',
      scanBarcode: 'Scan barcode',
      quantity: 'Quantity',
      grams: 'grams',
      mealType: 'Meal type',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      addToLog: 'Add to log',
      nutrition: 'Nutrition information',
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fats: 'Fats',
      fiber: 'Fiber',
      per100g: 'per 100g',
      noResults: 'No results found',
      searchSomething: 'Search for a food to get started',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      searching: 'Searching...',
      scanning: 'Scanning...',
      scanInstructions: 'Point the camera at the barcode',
      foodAdded: 'Food added successfully',
      errorAdding: 'Error adding food',
      popular: 'Popular foods',
      recent: 'Recently added',
      // New translations for scanner
      startCamera: 'Start camera',
      stopScanning: 'Stop scanning',
      cameraError: 'Error accessing camera',
      scannerNotSupported: 'Scanner not supported on this device',
      productNotFound: 'Product not found',
      productFound: 'Product found',
      loadingProduct: 'Searching product...',
      retryScanning: 'Retry scanning',
      scannerInstructions: 'Keep the code centered and wait for automatic detection',
      lastScanned: 'Last scanned code',
      allowCamera: 'Please allow camera access to scan barcodes',
      invalidBarcode: 'Invalid barcode'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.es;

  // Función para manejar errores del escáner - AGREGAR
  const handleScannerError = (error: Error) => {
    console.error('❌ Error del escáner:', error);
    setScannerError(error.message || t.cameraError);
    setIsScanning(false);
  };

  // Función para detener el escáner - AGREGAR
  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      stopBarcodeScanner(scannerRef.current);
      scannerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Función mejorada para iniciar el escáner de códigos
  const startBarcodeScanner = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setScannerError('');
      setLastScannedCode('');

      // Solicitar acceso a la cámara con configuración optimizada
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Cámara trasera preferida
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve();
        }
      });

      await videoRef.current.play();

      // Inicializar el escáner de códigos con configuración avanzada
      scannerRef.current = await initializeBarcodeScanner(
        videoRef.current,
        handleBarcodeDetected,
        handleScannerError,
        {
          continuous: true,
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
          scanArea: {
            x: 0.1,  // 10% desde el borde izquierdo
            y: 0.3,  // 30% desde arriba
            width: 0.8,  // 80% del ancho
            height: 0.4  // 40% del alto (área optimizada para códigos)
          }
        }
      );

      console.log('✅ Escáner de códigos Ultra Pro iniciado correctamente');
    } catch (error) {
      console.error('❌ Error starting barcode scanner:', error);
      setScannerError(t.cameraError);
      setIsScanning(false);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setScannerError(t.allowCamera);
        } else if (error.name === 'NotSupportedError') {
          setScannerError(t.scannerNotSupported);
        } else if (error.name === 'NotFoundError') {
          setScannerError('No se encontró cámara disponible');
        } else if (error.name === 'NotReadableError') {
          setScannerError('Error al acceder a la cámara. Verifica que no esté en uso por otra aplicación.');
        }
      }
    }
  };

  // Manejar código detectado - MEJORADO
  const handleBarcodeDetected = async (result: BarcodeResult) => {
    console.log('📱 Código detectado:', result);
    setLastScannedCode(result.code);
    setIsLoadingProduct(true);

    try {
      // Buscar producto por código de barras con API mejorada
      const product = await getProductByBarcode(result.code);

      if (product && product.product_name) {
        // Convertir producto encontrado al formato FoodItem
        const foodItem: FoodItem = {
          id: result.code,
          name: product.product_name,
          brand: product.brands || 'Desconocido',
          barcode: result.code,
          calories_per_100g: Math.max(0, product.nutriments?.['energy-kcal_100g'] || 0),
          protein_per_100g: Math.max(0, product.nutriments?.['proteins_100g'] || 0),
          carbs_per_100g: Math.max(0, product.nutriments?.['carbohydrates_100g'] || 0),
          fats_per_100g: Math.max(0, product.nutriments?.['fat_100g'] || 0),
          fiber_per_100g: Math.max(0, product.nutriments?.['fiber_100g'] || 0),
          sugar_per_100g: Math.max(0, product.nutriments?.['sugars_100g'] || 0),
          sodium_per_100g: Math.max(0, product.nutriments?.['salt_100g'] * 400 || 0) // Convertir sal a sodio
        };

        // Mostrar información adicional del producto si está disponible
        let successMessage = `${t.productFound}: ${foodItem.name}`;
        if (product.brands) {
          successMessage += ` - ${product.brands}`;
        }
        if (product.source) {
          console.log(`📊 Fuente de datos: ${product.source}`);
        }

        showSuccessMessage(successMessage);

        // Cerrar escáner y abrir modal de nutrición
        setShowBarcodeScanner(false);
        stopScanning();

        // Seleccionar el producto encontrado
        handleFoodSelect(foodItem);
      } else {
        showErrorMessage(`${t.productNotFound}: ${result.code}`);
        // No cerrar el escáner para permitir escanear otro código
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      let errorMessage = `${t.productNotFound}: ${result.code}`;

      if (error instanceof Error) {
        if (error.message.includes('inválido')) {
          errorMessage = `${t.invalidBarcode}: ${result.code}`;
        } else if (error.message.includes('límite')) {
          errorMessage = 'Límite de consultas alcanzado. Intenta más tarde.';
        }
      }

      showErrorMessage(errorMessage);
      // No cerrar el escáner para permitir reintentar
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const popularFoods: FoodItem[] = [
    {
      id: '1',
      name: 'Arroz blanco cocido',
      brand: 'Genérico',
      calories_per_100g: 130,
      protein_per_100g: 2.7,
      carbs_per_100g: 28,
      fats_per_100g: 0.3,
      fiber_per_100g: 0.4
    },
    {
      id: '2',
      name: 'Pechuga de pollo cocida',
      brand: 'Genérico',
      calories_per_100g: 165,
      protein_per_100g: 31,
      carbs_per_100g: 0,
      fats_per_100g: 3.6,
      fiber_per_100g: 0
    },
    {
      id: '3',
      name: 'Huevo entero',
      brand: 'Genérico',
      calories_per_100g: 155,
      protein_per_100g: 13,
      carbs_per_100g: 1.1,
      fats_per_100g: 11,
      fiber_per_100g: 0
    },
    {
      id: '4',
      name: 'Banana',
      brand: 'Genérico',
      calories_per_100g: 89,
      protein_per_100g: 1.1,
      carbs_per_100g: 23,
      fats_per_100g: 0.3,
      fiber_per_100g: 2.6
    },
    {
      id: '5',
      name: 'Avena',
      brand: 'Genérico',
      calories_per_100g: 389,
      protein_per_100g: 16.9,
      carbs_per_100g: 66,
      fats_per_100g: 6.9,
      fiber_per_100g: 10.6
    },
    {
      id: '6',
      name: 'Leche entera',
      brand: 'Genérico',
      calories_per_100g: 61,
      protein_per_100g: 3.2,
      carbs_per_100g: 4.8,
      fats_per_100g: 3.3,
      fiber_per_100g: 0
    },
    {
      id: '7',
      name: 'Pan integral',
      brand: 'Genérico',
      calories_per_100g: 247,
      protein_per_100g: 13,
      carbs_per_100g: 41,
      fats_per_100g: 4.2,
      fiber_per_100g: 7
    },
    {
      id: '8',
      name: 'Yogur griego natural',
      brand: 'Genérico',
      calories_per_100g: 59,
      protein_per_100g: 10,
      carbs_per_100g: 3.6,
      fats_per_100g: 0.4,
      fiber_per_100g: 0
    }
  ];

  const searchFood = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const filteredFoods = popularFoods.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        food.brand.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filteredFoods);
    } catch (error) {
      console.error('Error searching food:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchFood(value);
  };

  const calculateNutrition = (food: FoodItem, quantity: number) => {
    const factor = quantity / 100;
    return {
      calories: Math.round(food.calories_per_100g * factor),
      protein: Math.round(food.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
      fats: Math.round(food.fats_per_100g * factor * 10) / 10,
      fiber: Math.round((food.fiber_per_100g || 0) * factor * 10) / 10
    };
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    const nutrition = calculateNutrition(food, parseFloat(quantity) || 100);
    setCalculatedNutrition(nutrition);
    setShowNutritionModal(true);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value);

    if (selectedFood) {
      const nutrition = calculateNutrition(selectedFood, parseFloat(value) || 100);
      setCalculatedNutrition(nutrition);
    }
  };

  const addFoodToLog = () => {
    if (!selectedFood) return;

    try {
      const today = deviceTime.getCurrentDate();
      const nutritionKey = `nutrition_${today}`;

      const existingData = localStorage.getItem(nutritionKey);
      let dayData = existingData ? JSON.parse(existingData) : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        water: 0,
        meals: []
      };

      const newMeal = {
        id: Date.now().toString(),
        name: selectedFood.name,
        brand: selectedFood.brand,
        mealType: mealType,
        quantity: parseFloat(quantity),
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fats: calculatedNutrition.fats,
        fiber: calculatedNutrition.fiber,
        barcode: selectedFood.barcode, // Guardar código de barras si existe
        timestamp: deviceTime.createTimestamp()
      };

      dayData.calories += calculatedNutrition.calories;
      dayData.protein += calculatedNutrition.protein;
      dayData.carbs += calculatedNutrition.carbs;
      dayData.fats += calculatedNutrition.fats;
      dayData.fiber += calculatedNutrition.fiber;
      dayData.meals.push(newMeal);

      localStorage.setItem(nutritionKey, JSON.stringify(dayData));

      window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
        detail: { date: today, data: dayData }
      }));

      showSuccessMessage();

      setShowNutritionModal(false);
      setSelectedFood(null);
      setQuantity('100');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding food:', error);
      showErrorMessage();
    }
  };

  const showSuccessMessage = (message?: string) => {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      border: 1px solid #16a34a;
      border-radius: 12px;
      padding: 16px 24px;
      z-index: 3000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 320px;
      width: 90%;
    `;
    msgDiv.innerHTML = `
      <div style="width: 24px; height: 24px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <i class="ri-check-line" style="color: white; font-size: 14px;"></i>
      </div>
      <div>
        <p style="font-size: 14px; font-weight: 600; color: #15803d; margin: 0;">${message || t.foodAdded}</p>
      </div>
    `;
    document.body.appendChild(msgDiv);

    setTimeout(() => {
      if (document.body.contains(msgDiv)) {
        document.body.removeChild(msgDiv);
      }
    }, 3000);
  };

  const showErrorMessage = (message?: string) => {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
      border: 1px solid #ef4444;
      border-radius: 12px;
      padding: 16px 24px;
      z-index: 3000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 320px;
      width: 90%;
    `;
    msgDiv.innerHTML = `
      <div style="width: 24px; height: 24px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <i class="ri-close-line" style="color: white; font-size: 14px;"></i>
      </div>
      <div>
        <p style="font-size: 14px; font-weight: 600; color: #dc2626; margin: 0;">${message || t.errorAdding}</p>
      </div>
    `;
    document.body.appendChild(msgDiv);

    setTimeout(() => {
      if (document.body.contains(msgDiv)) {
        document.body.removeChild(msgDiv);
      }
    }, 3000);
  };

  const formatNumber = (value: number): string => {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        padding: '20px 16px',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Link href="/" className="!rounded-button" style={{
            width: '40px',
            height: '40px',
            background: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}>
            <i className="ri-arrow-left-line" style={{ color: '#374151', fontSize: '18px' }}></i>
          </Link>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            {t.addFood}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px 16px' }}>
        {/* Search Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 16px 0'
          }}>
            {t.searchFood}
          </h2>

          {/* Search Input */}
          <div style={{
            position: 'relative',
            marginBottom: '16px'
          }}>
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="ri-search-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t.searchPlaceholder}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white',
                boxSizing: 'border-box'
              }}
            />
            {isSearching && (
              <div style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            )}
          </div>

          {/* Barcode Scanner Button */}
          <button
            onClick={() => {
              setShowBarcodeScanner(true);
              // Iniciar el escáner después de un pequeño delay para que el modal se renderice
              setTimeout(() => {
                startBarcodeScanner();
              }, 100);
            }}
            className="!rounded-button"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#f0f9ff',
              border: '1px solid #e0e7ff',
              borderRadius: '12px',
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <i className="ri-barcode-line" style={{ fontSize: '18px' }}></i>
            {t.scanBarcode}
          </button>
        </div>

        {/* Search Results */}
        {searchQuery ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px'
          }}>
            {isSearching ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px auto'
                }}></div>
                <p style={{ fontSize: '14px', margin: 0 }}>{t.searching}</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 16px 0'
                }}>
                  Resultados de búsqueda
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map((food) => (
                    <div
                      key={food.id}
                      onClick={() => handleFoodSelect(food)}
                      style={{
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f9ff';
                        e.currentTarget.style.borderColor = '#e0e7ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {food.name}
                        </h4>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#3b82f6'
                        }}>
                          {food.calories_per_100g} cal
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 8px 0'
                      }}>
                        {food.brand} • {t.per100g}
                      </p>
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '12px',
                        color: '#374151'
                      }}>
                        <span>P: {formatNumber(food.protein_per_100g)}g</span>
                        <span>C: {formatNumber(food.carbs_per_100g)}g</span>
                        <span>G: {formatNumber(food.fats_per_100g)}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <i className="ri-search-line" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  margin: '0 0 8px 0'
                }}>
                  {t.noResults}
                </p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  Intenta con otro término de búsqueda
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Popular Foods */
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.popular}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {popularFoods.slice(0, 6).map((food) => (
                <div
                  key={food.id}
                  onClick={() => handleFoodSelect(food)}
                  style={{
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f9ff';
                    e.currentTarget.style.borderColor = '#e0e7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {food.name}
                    </h4>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#3b82f6'
                    }}>
                      {food.calories_per_100g} cal
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '0 0 8px 0'
                  }}>
                    {food.brand} • {t.per100g}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#374151'
                  }}>
                    <span>P: {formatNumber(food.protein_per_100g)}g</span>
                    <span>C: {formatNumber(food.carbs_per_100g)}g</span>
                    <span>G: {formatNumber(food.fats_per_100g)}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <>
          <div
            onClick={() => {
              stopScanning();
              setShowBarcodeScanner(false);
              setScannerError('');
              setLastScannedCode('');
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.9)',
              zIndex: 2000
            }}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000',
            zIndex: 2001,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Scanner Header */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              padding: '20px 16px',
              zIndex: 2002,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                margin: 0
              }}>
                {t.scanBarcode}
              </h3>
              <button
                onClick={() => {
                  stopScanning();
                  setShowBarcodeScanner(false);
                  setScannerError('');
                  setLastScannedCode('');
                }}
                className="!rounded-button"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Scanner Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '200px',
              zIndex: 2002,
              pointerEvents: 'none'
            }}>
              {/* Área de enfoque principal */}
              <div style={{
                width: '100%',
                height: '100%',
                border: '3px solid #3b82f6',
                borderRadius: '16px',
                position: 'relative',
                background: 'rgba(59, 130, 246, 0.1)',
                backdropFilter: 'blur(1px)'
              }}>
                {/* Línea de escaneo animada */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                  animation: 'scan-line 2s infinite',
                  borderRadius: '1px'
                }} />
                {/* Esquinas de enfoque */}
                {[
                  { top: '-3px', left: '-3px', borderTop: '6px solid #3b82f6', borderLeft: '6px solid #3b82f6' },
                  { top: '-3px', right: '-3px', borderTop: '6px solid #3b82f6', borderRight: '6px solid #3b82f6' },
                  { bottom: '-3px', left: '-3px', borderBottom: '6px solid #3b82f6', borderLeft: '6px solid #3b82f6' },
                  { bottom: '-3px', right: '-3px', borderBottom: '6px solid #3b82f6', borderRight: '6px solid #3b82f6' }
                ].map((corner, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      ...corner,
                      borderRadius: '8px'
                    }}
                  />
                ))}
                {/* Indicador de área óptima */}
                <div style={{
                  position: 'absolute',
                  bottom: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap'
                }}>
                  📱 Área óptima de escaneo
                </div>
              </div>
            </div>

            {/* Scanner Status */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 100%)',
              padding: '60px 16px 20px 16px',
              zIndex: 2002,
              textAlign: 'center'
            }}>
              {scannerError ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <i className="ri-error-warning-line" style={{ color: '#ef4444', fontSize: '24px' }}></i>
                      <p style={{
                        color: '#ef4444',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0
                      }}>
                        Error de Escaneo
                      </p>
                    </div>
                    <p style={{
                      color: '#fca5a5',
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {scannerError}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setScannerError('');
                      startBarcodeScanner();
                    }}
                    className="!rounded-button"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '500',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      margin: '0 auto',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <i className="ri-refresh-line" style={{ fontSize: '18px' }}></i>
                    {t.retryScanning}
                  </button>
                </div>
              ) : isLoadingProduct ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '12px',
                    padding: '20px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid rgba(59, 130, 246, 0.3)',
                      borderTop: '3px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <div>
                      <p style={{
                        color: '#3b82f6',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0'
                      }}>
                        {t.loadingProduct}
                      </p>
                      <p style={{
                        color: '#93c5fd',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Consultando bases de datos...
                      </p>
                    </div>
                  </div>
                </div>
              ) : isScanning ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        background: '#10b981',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s infinite'
                      }}></div>
                      <p style={{
                        color: '#10b981',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0
                      }}>
                        Escáner Activo
                      </p>
                    </div>
                    <p style={{
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      margin: '0 0 8px 0'
                    }}>
                      {t.scanInstructions}
                    </p>
                    <p style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '13px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {t.scannerInstructions}
                    </p>
                  </div>

                  <button
                    onClick={stopScanning}
                    className="!rounded-button"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      margin: '0 auto',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <i className="ri-stop-line" style={{ fontSize: '16px' }}></i>
                    {t.stopScanning}
                  </button>
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <button
                    onClick={startBarcodeScanner}
                    className="!rounded-button"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '500',
                      padding: '16px 32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      margin: '0 auto',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                      transform: 'translateY(0)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                    }}
                  >
                    <i className="ri-camera-line" style={{ fontSize: '24px' }}></i>
                    {t.startCamera}
                  </button>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <p style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '13px',
                      margin: 0,
                      textAlign: 'center',
                      lineHeight: '1.4'
                    }}>
                      💡 Tip: Asegúrate de tener buena iluminación para mejores resultados
                    </p>
                  </div>
                </div>
              )}
              {lastScannedCode && (
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  backdropFilter: 'blur(10px)',
                  marginTop: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <i className="ri-qr-code-line" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}></i>
                    <p style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '12px',
                      margin: 0
                    }}>
                      {t.lastScanned}:
                    </p>
                  </div>
                  <p style={{
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: 0,
                    fontFamily: 'monospace',
                    letterSpacing: '1px'
                  }}>
                    {lastScannedCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>)
      }

      {/* Nutrition Modal */}
      {showNutritionModal && selectedFood && (
        <>
          <div
            onClick={() => setShowNutritionModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1000
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 1001
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {selectedFood.name}
              </h3>
              <button
                onClick={() => setShowNutritionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              {selectedFood.brand} {selectedFood.barcode && `• ${selectedFood.barcode}`}
            </p>

            {/* Quantity Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t.quantity}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 60px 12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {t.grams}
                </span>
              </div>
            </div>

            {/* Meal Type */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t.mealType}
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="desayuno">{t.breakfast}</option>
                <option value="almuerzo">{t.lunch}</option>
                <option value="cena">{t.dinner}</option>
                <option value="snack">{t.snack}</option>
              </select>
            </div>

            {/* Nutrition Info */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 12px 0'
              }}>
                {t.nutrition}
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto'
                  }}>
                    <i className="ri-fire-line" style={{ color: '#f59e0b', fontSize: '16px' }}></i>
                  </div>
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {calculatedNutrition.calories}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {t.calories}
                  </p>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto'
                  }}>
                    <i className="ri-bread-line" style={{ color: '#16a34a', fontSize: '16px' }}></i>
                  </div>
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {formatNumber(calculatedNutrition.protein)}g
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {t.protein}
                  </p>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto'
                  }}>
                    <i className="ri-restaurant-line" style={{ color: '#f59e0b', fontSize: '16px' }}></i>
                  </div>
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {formatNumber(calculatedNutrition.carbs)}g
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {t.carbs}
                  </p>
                </div>

                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#e0e7ff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto'
                  }}>
                    <i className="ri-drop-line" style={{ color: '#6366f1', fontSize: '16px' }}></i>
                  </div>
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {formatNumber(calculatedNutrition.fats)}g
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {t.fats}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowNutritionModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={addFoodToLog}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {t.addToLog}
              </button>
            </div>
          </div>
        </>)
      }

      <BottomNavigation />

      {/* Agregar estilos CSS mejorados */}
      <style jsx>{`
        @keyframes scan-line {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(100px); opacity: 0.8; }
          100% { transform: translateY(200px); opacity: 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

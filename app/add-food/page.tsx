
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
import { detectFoodInImage, captureImageFromVideo } from '../../lib/vision-api';

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

interface DetectedFoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  confidence: number;
  detected: boolean;
  source: string;
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

  // Estados para escáner de códigos
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string>('');
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // NUEVOS Estados para cámara de fotos de comida
  const [showFoodCamera, setShowFoodCamera] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFoodItem[]>([]);
  const [showFoodResults, setShowFoodResults] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string>('');

  // NUEVO estado para formulario manual
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualFood, setManualFood] = useState({
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: ''
  });

  // Referencias para escáner y cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // NUEVA referencia para cámara de comida
  const foodVideoRef = useRef<HTMLVideoElement>(null);
  const foodStreamRef = useRef<MediaStream | null>(null);

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
    }

    // Limpiar recursos al desmontar el componente
    return () => {
      if (scannerRef.current) {
        stopBarcodeScanner(scannerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (foodStreamRef.current) {
        foodStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [router]);

  const translations = {
    es: {
      addFood: 'Agregar Comida',
      searchFood: 'Buscar alimento',
      searchPlaceholder: 'Escribe el nombre del alimento...',
      scanBarcode: 'Escanear código',
      takePhoto: 'Fotografiar comida',
      photoFood: 'Foto del plato',
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
      // Nuevas traducciones para análisis de fotos
      takingPhoto: 'Tomando foto...',
      analyzingFood: 'Analizando alimentos...',
      foodDetected: 'Alimentos detectados',
      noFoodDetected: 'No se detectaron alimentos',
      retryPhoto: 'Tomar otra foto',
      capturePhoto: 'Capturar foto',
      startCamera: 'Iniciar cámara',
      stopCamera: 'Detener cámara',
      photoInstructions: 'Apunta la cámara hacia tu plato de comida',
      photoTips: 'Asegúrate de tener buena iluminación y que los alimentos sean visibles',
      analysisError: 'Error al analizar la imagen',
      selectFood: 'Seleccionar alimento',
      confidence: 'Confianza',
      detected: 'Detectado',
      suggested: 'Sugerido',
      addSelected: 'Agregar seleccionados',
      selectAll: 'Seleccionar todos',
      deselectAll: 'Deseleccionar todos',
      cameraError: 'Error al acceder a la cámara',
      allowCameraFood: 'Por favor permite el acceso a la cámara para fotografiar comida',
      // NUEVAS traducciones para formulario manual
      addManual: 'Agregar manual',
      manualFood: 'Alimento personalizado',
      foodName: 'Nombre del alimento',
      brandName: 'Marca (opcional)',
      nutritionPer100g: 'Información nutricional por 100g',
      caloriesPlaceholder: 'Calorías (ej: 250)',
      proteinPlaceholder: 'Proteínas en gramos (ej: 12.5)',
      carbsPlaceholder: 'Carbohidratos en gramos (ej: 30)',
      fatsPlaceholder: 'Grasas en gramos (ej: 8.2)',
      fiberPlaceholder: 'Fibra en gramos (opcional)',
      createFood: 'Crear alimento',
      fillRequired: 'Por favor completa los campos requeridos',
      invalidNumbers: 'Por favor ingresa números válidos',
    },
    en: {
      addFood: 'Add Food',
      searchFood: 'Search food',
      searchPlaceholder: 'Type food name...',
      scanBarcode: 'Scan barcode',
      takePhoto: 'Take food photo',
      photoFood: 'Photo dish',
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
      // New translations for photo analysis
      takingPhoto: 'Taking photo...',
      analyzingFood: 'Analyzing food...',
      foodDetected: 'Food detected',
      noFoodDetected: 'No food detected',
      retryPhoto: 'Take another photo',
      capturePhoto: 'Capture photo',
      startCamera: 'Start camera',
      stopCamera: 'Stop camera',
      photoInstructions: 'Point the camera at your food plate',
      photoTips: 'Make sure you have good lighting and food is clearly visible',
      analysisError: 'Error analyzing image',
      selectFood: 'Select food',
      confidence: 'Confidence',
      detected: 'Detected',
      suggested: 'Suggested',
      addSelected: 'Add selected',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      cameraError: 'Error accessing camera',
      allowCameraFood: 'Please allow camera access to take food photos',
      // NEW translations for manual form
      addManual: 'Add manual',
      manualFood: 'Custom food',
      foodName: 'Food name',
      brandName: 'Brand (optional)',
      nutritionPer100g: 'Nutrition information per 100g',
      caloriesPlaceholder: 'Calories (e.g: 250)',
      proteinPlaceholder: 'Protein in grams (e.g: 12.5)',
      carbsPlaceholder: 'Carbs in grams (e.g: 30)',
      fatsPlaceholder: 'Fats in grams (e.g: 8.2)',
      fiberPlaceholder: 'Fiber in grams (optional)',
      createFood: 'Create food',
      fillRequired: 'Please fill required fields',
      invalidNumbers: 'Please enter valid numbers',
    }
  };

  const t = translations[language as keyof typeof translations] || translations.es;

  // NUEVA función para iniciar cámara de comida - CORREGIDA
  const startFoodCamera = async () => {
    if (!foodVideoRef.current) return;

    try {
      setIsTakingPhoto(false);
      setAnalysisError('');
      setCapturedImage('');

      // Configuración de cámara compatible con TypeScript
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 15 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      foodStreamRef.current = stream;
      foodVideoRef.current.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (foodVideoRef.current) {
          foodVideoRef.current.onloadedmetadata = () => resolve();
        }
      });

      await foodVideoRef.current.play();

      console.log('Cámara de comida iniciada correctamente');
    } catch (error) {
      console.error('Error starting food camera:', error);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setAnalysisError(t.allowCameraFood);
        } else if (error.name === 'NotFoundError') {
          setAnalysisError('No se encontró cámara disponible');
        } else {
          setAnalysisError(t.cameraError);
        }
      }
    }
  };

  // NUEVA función para detener cámara de comida
  const stopFoodCamera = () => {
    if (foodStreamRef.current) {
      foodStreamRef.current.getTracks().forEach(track => track.stop());
      foodStreamRef.current = null;
    }
    if (foodVideoRef.current) {
      foodVideoRef.current.srcObject = null;
    }
  };

  // NUEVA función para capturar y analizar foto de comida
  const captureAndAnalyzeFood = async () => {
    if (!foodVideoRef.current || !foodStreamRef.current) return;

    try {
      setIsTakingPhoto(true);
      setAnalysisError('');

      // Capturar imagen desde el video
      const imageFile = await captureImageFromVideo(foodVideoRef.current);

      // Crear URL para vista previa
      const imageUrl = URL.createObjectURL(imageFile);
      setCapturedImage(imageUrl);

      setIsTakingPhoto(false);
      setIsAnalyzing(true);

      // Analizar la imagen con Google Vision API
      console.log('Analizando imagen de comida...');
      const detectedFoodItems = await detectFoodInImage(imageFile);

      if (detectedFoodItems && detectedFoodItems.length > 0) {
        // Convertir a formato DetectedFoodItem
        const foodItems: DetectedFoodItem[] = detectedFoodItems.map(item => ({
          name: item.name || 'Alimento detectado',
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fats: item.fats || 0,
          fiber: item.fiber || 0,
          confidence: item.confidence || 0.5,
          detected: item.detected !== false,
          source: item.source || 'vision_api'
        }));

        setDetectedFoods(foodItems);
        setShowFoodResults(true);

        console.log(`Se detectaron ${foodItems.length} alimentos:`, foodItems);
      } else {
        setAnalysisError(t.noFoodDetected);
        setDetectedFoods([]);
      }

      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error capturing and analyzing food:', error);
      setAnalysisError(t.analysisError);
      setIsTakingPhoto(false);
      setIsAnalyzing(false);
    }
  };

  // NUEVA función para agregar alimentos detectados
  const addDetectedFoodToLog = async (foodItem: DetectedFoodItem, customQuantity: number = 100) => {
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

      // Calcular nutrición basada en cantidad
      const factor = customQuantity / 100;
      const calculatedCalories = Math.round(foodItem.calories * factor);
      const calculatedProtein = Math.round(foodItem.protein * factor * 10) / 10;
      const calculatedCarbs = Math.round(foodItem.carbs * factor * 10) / 10;
      const calculatedFats = Math.round(foodItem.fats * factor * 10) / 10;
      const calculatedFiber = Math.round((foodItem.fiber || 0) * factor * 10) / 10;

      const newMeal = {
        id: Date.now().toString(),
        name: foodItem.name,
        brand: `Detectado (${Math.round(foodItem.confidence * 100)}% confianza)`,
        mealType: mealType,
        quantity: customQuantity,
        calories: calculatedCalories,
        protein: calculatedProtein,
        carbs: calculatedCarbs,
        fats: calculatedFats,
        fiber: calculatedFiber,
        source: 'food_photo_analysis',
        confidence: foodItem.confidence,
        timestamp: deviceTime.createTimestamp()
      };

      dayData.calories += calculatedCalories;
      dayData.protein += calculatedProtein;
      dayData.carbs += calculatedCarbs;
      dayData.fats += calculatedFats;
      dayData.fiber += calculatedFiber;
      dayData.meals.push(newMeal);

      localStorage.setItem(nutritionKey, JSON.stringify(dayData));

      window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
        detail: { date: today, data: dayData }
      }));

      return true;
    } catch (error) {
      console.error('Error adding detected food:', error);
      return false;
    }
  };

  // Función para manejar errores del escáner - MEJORADA
  const handleScannerError = (error: Error) => {
    console.error('Error del escáner:', error);
    setScannerError(error.message || t.cameraError);
    setIsScanning(false);
  };

  // Función para detener el escáner - MEJORADA
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

  // Función mejorada para iniciar el escáner de códigos - CORREGIDA
  const startBarcodeScanner = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setScannerError('');
      setLastScannedCode('');

      // Configuración de cámara compatible con TypeScript
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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

      console.log('Escáner de códigos Ultra Pro iniciado correctamente');
    } catch (error) {
      console.error('Error starting barcode scanner:', error);
      setScannerError(t.cameraError);
      setIsScanning(false);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setScannerError('Por favor permite el acceso a la cámara para escanear códigos');
        } else if (error.name === 'NotSupportedError') {
          setScannerError('Escáner no soportado en este dispositivo');
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
    console.log('Código detectado:', result);
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
          sodium_per_100g: Math.max(0, (product.nutriments?.['salt_100g'] || 0) * 400) // Convertir sal a sodio
        };

        // Mostrar información adicional del producto si está disponible
        let successMessage = `Producto encontrado: ${foodItem.name}`;
        if (product.brands) {
          successMessage += ` - ${product.brands}`;
        }
        if (product.source) {
          console.log(`Fuente de datos: ${product.source}`);
        }

        // Cerrar escáner y abrir modal de nutrición
        setShowBarcodeScanner(false);
        stopScanning();

        // Seleccionar el producto encontrado
        handleFoodSelect(foodItem);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      let errorMessage = `Producto no encontrado: ${result.code}`;

      if (error instanceof Error) {
        if (error.message.includes('inválido')) {
          errorMessage = `Código de barras inválido: ${result.code}`;
        } else if (error.message.includes('límite')) {
          errorMessage = 'Límite de consultas alcanzado. Intenta más tarde.';
        }
      }

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
    }
  ];

  // Base de datos expandida de alimentos para búsqueda manual
  const extendedFoodDatabase: FoodItem[] = [
    ...popularFoods,
    // Frutas
    {
      id: '7',
      name: 'Manzana',
      brand: 'Genérico',
      calories_per_100g: 52,
      protein_per_100g: 0.3,
      carbs_per_100g: 14,
      fats_per_100g: 0.2,
      fiber_per_100g: 2.4
    },
    {
      id: '8',
      name: 'Naranja',
      brand: 'Genérico',
      calories_per_100g: 47,
      protein_per_100g: 0.9,
      carbs_per_100g: 12,
      fats_per_100g: 0.1,
      fiber_per_100g: 2.4
    },
    {
      id: '9',
      name: 'Fresa',
      brand: 'Genérico',
      calories_per_100g: 32,
      protein_per_100g: 0.7,
      carbs_per_100g: 8,
      fats_per_100g: 0.3,
      fiber_per_100g: 2
    },
    {
      id: '10',
      name: 'Piña',
      brand: 'Genérico',
      calories_per_100g: 50,
      protein_per_100g: 0.5,
      carbs_per_100g: 13,
      fats_per_100g: 0.1,
      fiber_per_100g: 1.4
    },
    {
      id: '11',
      name: 'Sandía',
      brand: 'Genérico',
      calories_per_100g: 30,
      protein_per_100g: 0.6,
      carbs_per_100g: 8,
      fats_per_100g: 0.2,
      fiber_per_100g: 0.4
    },
    {
      id: '12',
      name: 'Uvas',
      brand: 'Genérico',
      calories_per_100g: 69,
      protein_per_100g: 0.7,
      carbs_per_100g: 18,
      fats_per_100g: 0.2,
      fiber_per_100g: 0.9
    },
    // Verduras
    {
      id: '13',
      name: 'Brócoli',
      brand: 'Genérico',
      calories_per_100g: 34,
      protein_per_100g: 2.8,
      carbs_per_100g: 7,
      fats_per_100g: 0.4,
      fiber_per_100g: 2.6
    },
    {
      id: '14',
      name: 'Zanahoria',
      brand: 'Genérico',
      calories_per_100g: 41,
      protein_per_100g: 0.9,
      carbs_per_100g: 10,
      fats_per_100g: 0.2,
      fiber_per_100g: 2.8
    },
    {
      id: '15',
      name: 'Espinaca',
      brand: 'Genérico',
      calories_per_100g: 23,
      protein_per_100g: 2.9,
      carbs_per_100g: 4,
      fats_per_100g: 0.4,
      fiber_per_100g: 2.2
    },
    {
      id: '16',
      name: 'Tomate',
      brand: 'Genérico',
      calories_per_100g: 18,
      protein_per_100g: 0.9,
      carbs_per_100g: 4,
      fats_per_100g: 0.2,
      fiber_per_100g: 1.2
    },
    {
      id: '17',
      name: 'Lechuga',
      brand: 'Genérico',
      calories_per_100g: 15,
      protein_per_100g: 1.4,
      carbs_per_100g: 3,
      fats_per_100g: 0.2,
      fiber_per_100g: 1.3
    },
    {
      id: '18',
      name: 'Pepino',
      brand: 'Genérico',
      calories_per_100g: 16,
      protein_per_100g: 0.7,
      carbs_per_100g: 4,
      fats_per_100g: 0.1,
      fiber_per_100g: 0.5
    },
    // Proteínas
    {
      id: '19',
      name: 'Salmón',
      brand: 'Genérico',
      calories_per_100g: 208,
      protein_per_100g: 25,
      carbs_per_100g: 0,
      fats_per_100g: 12,
      fiber_per_100g: 0
    },
    {
      id: '20',
      name: 'Atún',
      brand: 'Genérico',
      calories_per_100g: 144,
      protein_per_100g: 30,
      carbs_per_100g: 0,
      fats_per_100g: 1,
      fiber_per_100g: 0
    },
    {
      id: '21',
      name: 'Carne de res',
      brand: 'Genérico',
      calories_per_100g: 250,
      protein_per_100g: 26,
      carbs_per_100g: 0,
      fats_per_100g: 15,
      fiber_per_100g: 0
    },
    {
      id: '22',
      name: 'Cerdo',
      brand: 'Genérico',
      calories_per_100g: 242,
      protein_per_100g: 27,
      carbs_per_100g: 0,
      fats_per_100g: 14,
      fiber_per_100g: 0
    },
    // Carbohidratos
    {
      id: '23',
      name: 'Papa',
      brand: 'Genérico',
      calories_per_100g: 77,
      protein_per_100g: 2,
      carbs_per_100g: 17,
      fats_per_100g: 0.1,
      fiber_per_100g: 2.2
    },
    {
      id: '24',
      name: 'Pasta',
      brand: 'Genérico',
      calories_per_100g: 131,
      protein_per_100g: 5,
      carbs_per_100g: 25,
      fats_per_100g: 1.1,
      fiber_per_100g: 1.8
    },
    {
      id: '25',
      name: 'Pan integral',
      brand: 'Genérico',
      calories_per_100g: 247,
      protein_per_100g: 13,
      carbs_per_100g: 41,
      fats_per_100g: 4.2,
      fiber_per_100g: 7
    },
    {
      id: '26',
      name: 'Quinoa',
      brand: 'Genérico',
      calories_per_100g: 120,
      protein_per_100g: 4.4,
      carbs_per_100g: 22,
      fats_per_100g: 1.9,
      fiber_per_100g: 2.8
    },
    // Lácteos
    {
      id: '27',
      name: 'Queso',
      brand: 'Genérico',
      calories_per_100g: 113,
      protein_per_100g: 7,
      carbs_per_100g: 1,
      fats_per_100g: 9,
      fiber_per_100g: 0
    },
    {
      id: '28',
      name: 'Yogur natural',
      brand: 'Genérico',
      calories_per_100g: 61,
      protein_per_100g: 3.5,
      carbs_per_100g: 4.7,
      fats_per_100g: 3.3,
      fiber_per_100g: 0
    },
    {
      id: '29',
      name: 'Mantequilla',
      brand: 'Genérico',
      calories_per_100g: 717,
      protein_per_100g: 0.9,
      carbs_per_100g: 0.1,
      fats_per_100g: 81,
      fiber_per_100g: 0
    },
    // Frutos secos
    {
      id: '30',
      name: 'Almendras',
      brand: 'Genérico',
      calories_per_100g: 579,
      protein_per_100g: 21,
      carbs_per_100g: 22,
      fats_per_100g: 50,
      fiber_per_100g: 12
    },
    {
      id: '31',
      name: 'Nueces',
      brand: 'Genérico',
      calories_per_100g: 654,
      protein_per_100g: 15,
      carbs_per_100g: 14,
      fats_per_100g: 65,
      fiber_per_100g: 7
    },
    {
      id: '32',
      name: 'Cacahuates',
      brand: 'Genérico',
      calories_per_100g: 567,
      protein_per_100g: 26,
      carbs_per_100g: 16,
      fats_per_100g: 49,
      fiber_per_100g: 8.5
    },
    // Legumbres
    {
      id: '33',
      name: 'Frijoles negros',
      brand: 'Genérico',
      calories_per_100g: 132,
      protein_per_100g: 8.9,
      carbs_per_100g: 23,
      fats_per_100g: 0.5,
      fiber_per_100g: 8.7
    },
    {
      id: '34',
      name: 'Lentejas',
      brand: 'Genérico',
      calories_per_100g: 116,
      protein_per_100g: 9,
      carbs_per_100g: 20,
      fats_per_100g: 0.4,
      fiber_per_100g: 7.9
    },
    {
      id: '35',
      name: 'Garbanzos',
      brand: 'Genérico',
      calories_per_100g: 164,
      protein_per_100g: 8.9,
      carbs_per_100g: 27,
      fats_per_100g: 2.6,
      fiber_per_100g: 8
    }
  ];

  const searchFood = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Simular delay de búsqueda para mejor UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const queryLower = query.toLowerCase().trim();

      // Buscar en la base de datos expandida
      const filteredFoods = extendedFoodDatabase.filter(food =>
        food.name.toLowerCase().includes(queryLower) ||
        food.brand.toLowerCase().includes(queryLower) ||
        // Búsqueda parcial por palabras
        queryLower.split(' ').some(word =>
          food.name.toLowerCase().includes(word) && word.length > 2
        )
      );

      // Ordenar por relevancia
      const sortedResults = filteredFoods.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().indexOf(queryLower);
        const bNameMatch = b.name.toLowerCase().indexOf(queryLower);

        // Priorizar coincidencias exactas al inicio
        if (aNameMatch === 0 && bNameMatch !== 0) return -1;
        if (bNameMatch === 0 && aNameMatch !== 0) return 1;

        // Luego por longitud de nombre (más específico primero)
        if (aNameMatch !== -1 && bNameMatch !== -1) {
          return a.name.length - b.name.length;
        }

        return aNameMatch === -1 ? 1 : -1;
      });

      // Limitar resultados para mejor rendimiento
      setSearchResults(sortedResults.slice(0, 15));

      if (sortedResults.length === 0) {
        // Si no hay resultados, sugerir alimento personalizable
        const customFood: FoodItem = {
          id: 'custom',
          name: `"${query}" - Personalizar`,
          brand: 'Alimento personalizado',
          calories_per_100g: 100,
          protein_per_100g: 5,
          carbs_per_100g: 15,
          fats_per_100g: 3,
          fiber_per_100g: 2
        };
        setSearchResults([customFood]);
      }

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

      setShowNutritionModal(false);
      setSelectedFood(null);
      setQuantity('100');
      setSearchQuery('');
      setSearchResults([]);

      // Mostrar mensaje de éxito
      showSuccessMessage();
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

  const handleManualFoodChange = (field: string, value: string) => {
    setManualFood(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createManualFood = () => {
    // Validar campos requeridos
    if (!manualFood.name.trim() || !manualFood.calories || !manualFood.protein || !manualFood.carbs || !manualFood.fats) {
      showErrorMessage(t.fillRequired);
      return;
    }

    // Validar que los números sean válidos
    const calories = parseFloat(manualFood.calories);
    const protein = parseFloat(manualFood.protein);
    const carbs = parseFloat(manualFood.carbs);
    const fats = parseFloat(manualFood.fats);
    const fiber = parseFloat(manualFood.fiber || '0');

    if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fats) || (manualFood.fiber && isNaN(fiber))) {
      showErrorMessage(t.invalidNumbers);
      return;
    }

    // Crear el objeto FoodItem
    const customFoodItem: FoodItem = {
      id: `manual_${Date.now()}`,
      name: manualFood.name.trim(),
      brand: manualFood.brand.trim() || 'Personalizado',
      calories_per_100g: Math.max(0, calories),
      protein_per_100g: Math.max(0, protein),
      carbs_per_100g: Math.max(0, carbs),
      fats_per_100g: Math.max(0, fats),
      fiber_per_100g: Math.max(0, fiber)
    };

    // Cerrar formulario manual
    setShowManualForm(false);

    // Limpiar formulario
    setManualFood({
      name: '',
      brand: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      fiber: ''
    });

    // Abrir modal de nutrición con el alimento creado
    handleFoodSelect(customFoodItem);
  };

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

          {/* Action Buttons - MEJORADO con botón de foto */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px'
          }}>
            <button
              onClick={() => {
                setShowBarcodeScanner(true);
                setTimeout(() => {
                  startBarcodeScanner();
                }, 100);
              }}
              className="!rounded-button"
              style={{
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

            {/* NUEVO: Botón para tomar foto de comida */}
            <button
              onClick={() => {
                setShowFoodCamera(true);
                setTimeout(() => {
                  startFoodCamera();
                }, 100);
              }}
              className="!rounded-button"
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <i className="ri-camera-line" style={{ fontSize: '18px' }}></i>
              {t.takePhoto}
            </button>

            {/* NUEVO: Botón para agregar manual */}
            <button
              onClick={() => setShowManualForm(true)}
              className="!rounded-button"
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            >
              <i className="ri-add-line" style={{ fontSize: '18px' }}></i>
              {t.addManual}
            </button>
          </div>
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

      {/* NUEVO: Food Camera Modal */}
      {showFoodCamera && (
        <>
          <div
            onClick={() => {
              stopFoodCamera();
              setShowFoodCamera(false);
              setAnalysisError('');
              setCapturedImage('');
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
            {/* Camera Header */}
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
                {t.takePhoto}
              </h3>
              <button
                onClick={() => {
                  stopFoodCamera();
                  setShowFoodCamera(false);
                  setAnalysisError('');
                  setCapturedImage('');
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

            {/* Video Stream o Imagen Capturada */}
            {capturedImage ? (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000'
              }}>
                <img
                  src={capturedImage}
                  alt="Comida capturada"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            ) : (
              <video
                ref={foodVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            )}

            {/* Camera Overlay */}
            {!capturedImage && (
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
                {/* Área de enfoque para comida */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  border: '3px solid #16a34a',
                  borderRadius: '16px',
                  position: 'relative',
                  background: 'rgba(16, 185, 129, 0.1)',
                  backdropFilter: 'blur(1px)'
                }}>
                  {/* Esquinas de enfoque */}
                  {[{
                    top: '-3px',
                    left: '-3px',
                    borderTop: '6px solid #16a34a',
                    borderLeft: '6px solid #16a34a'
                  }, {
                    top: '-3px',
                    right: '-3px',
                    borderTop: '6px solid #16a34a',
                    borderRight: '6px solid #16a34a'
                  }, {
                    bottom: '-3px',
                    left: '-3px',
                    borderBottom: '6px solid #16a34a',
                    borderLeft: '6px solid #16a34a'
                  }, {
                    bottom: '-3px',
                    right: '-3px',
                    borderBottom: '6px solid #16a34a',
                    borderRight: '6px solid #16a34a'
                  }].map((corner, index) => (
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
                  {/* Indicador para comida */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-50px',
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
                    Centra tu plato de comida
                  </div>
                </div>
              </div>
            )}

            {/* Camera Controls */}
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
              {analysisError ? (
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
                        Error de Cámara
                      </p>
                    </div>
                    <p style={{
                      color: '#fca5a5',
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {analysisError}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAnalysisError('');
                      startFoodCamera();
                    }}
                    className="!rounded-button"
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
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
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <i className="ri-refresh-line" style={{ fontSize: '18px' }}></i>
                    Reintentar
                  </button>
                </div>
              ) : isAnalyzing ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '12px',
                    padding: '20px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid rgba(16, 185, 129, 0.3)',
                      borderTop: '3px solid #16a34a',
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
                        {t.analyzingFood}
                      </p>
                      <p style={{
                        color: '#10b981',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Usando inteligencia artificial...
                      </p>
                    </div>
                  </div>
                </div>
              ) : isTakingPhoto ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <p style={{
                      color: '#3b82f6',
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      {t.takingPhoto}
                    </p>
                  </div>
                </div>
              ) : capturedImage ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setCapturedImage('');
                        URL.revokeObjectURL(capturedImage);
                        startFoodCamera();
                      }}
                      className="!rounded-button"
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <i className="ri-camera-line" style={{ fontSize: '16px' }}></i>
                      {t.retryPhoto}
                    </button>
                    <button
                      onClick={captureAndAnalyzeFood}
                      className="!rounded-button"
                      style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                        border: 'none',
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
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <i className="ri-search-eye-line" style={{ fontSize: '16px' }}></i>
                      Analizar comida
                    </button>
                  </div>
                </div>
              ) : (
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
                      <i className="ri-camera-line" style={{ color: '#16a34a', fontSize: '24px' }}></i>
                      <p style={{
                        color: '#16a34a',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: 0
                      }}>
                        Cámara Lista
                      </p>
                    </div>
                    <p style={{
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '500',
                      margin: '0 0 8px 0'
                    }}>
                      {t.photoInstructions}
                    </p>
                    <p style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '13px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {t.photoTips}
                    </p>
                  </div>

                  <button
                    onClick={captureAndAnalyzeFood}
                    className="!rounded-button"
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      fontSize: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                      transform: 'translateY(0)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                    }}
                  >
                    <i className="ri-camera-fill" style={{ fontSize: '32px' }}></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>

      )}

      {/* NUEVO: Food Results Modal */}
      {showFoodResults && (
        <>
          <div
            onClick={() => setShowFoodResults(false)}
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
            maxWidth: '500px',
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
                {t.foodDetected} ({detectedFoods.length})
              </h3>
              <button
                onClick={() => setShowFoodResults(false)}
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

            {capturedImage && (
              <div style={{
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <img
                  src={capturedImage}
                  alt="Imagen analizada"
                  style={{
                    maxWidth: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {detectedFoods.map((food, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: `2px solid ${food.detected ? '#16a34a' : '#f59e0b'}`,
                    position: 'relative'
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        background: food.detected ? '#dcfce7' : '#fef3c7',
                        color: food.detected ? '#16a34a' : '#f59e0b',
                        fontWeight: '500'
                      }}>
                        {food.detected ? t.detected : t.suggested}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#3b82f6'
                      }}>
                        {Math.round(food.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#374151'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#6b7280' }}>Cal:</span><br />
                      <strong>{food.calories}</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#6b7280' }}>P:</span><br />
                      <strong>{formatNumber(food.protein)}g</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#6b7280' }}>C:</span><br />
                      <strong>{formatNumber(food.carbs)}g</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#6b7280' }}>G:</span><br />
                      <strong>{formatNumber(food.fats)}g</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Convertir DetectedFoodItem a FoodItem
                      const foodItem: FoodItem = {
                        id: `detected_${index}`,
                        name: food.name,
                        brand: `IA Detectado (${Math.round(food.confidence * 100)}% confianza)`,
                        calories_per_100g: food.calories,
                        protein_per_100g: food.protein,
                        carbs_per_100g: food.carbs,
                        fats_per_100g: food.fats,
                        fiber_per_100g: food.fiber
                      };

                      setShowFoodResults(false);
                      setShowFoodCamera(false);
                      stopFoodCamera();
                      if (capturedImage) {
                        URL.revokeObjectURL(capturedImage);
                        setCapturedImage('');
                      }
                      handleFoodSelect(foodItem);
                    }}
                    className="!rounded-button"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="ri-add-line" style={{ fontSize: '16px' }}></i>
                    {t.selectFood}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowFoodResults(false);
                  setCapturedImage('');
                  startFoodCamera();
                }}
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
                <i className="ri-camera-line" style={{ fontSize: '16px' }}></i>
                {t.retryPhoto}
              </button>
              <button
                onClick={() => {
                  setShowFoodResults(false);
                  setShowFoodCamera(false);
                  stopFoodCamera();
                  if (capturedImage) {
                    URL.revokeObjectURL(capturedImage);
                    setCapturedImage('');
                  }
                }}
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
            </div>
          </div>
        </>

      )}

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
                {[{
                  top: '-3px',
                  left: '-3px',
                  borderTop: '6px solid #3b82f6',
                  borderLeft: '6px solid #3b82f6'
                }, {
                  top: '-3px',
                  right: '-3px',
                  borderTop: '6px solid #3b82f6',
                  borderRight: '6px solid #3b82f6'
                }, {
                  bottom: '-3px',
                  left: '-3px',
                  borderBottom: '6px solid #3b82f6',
                  borderLeft: '6px solid #3b82f6'
                }, {
                  bottom: '-3px',
                  right: '-3px',
                  borderBottom: '6px solid #3b82f6',
                  borderRight: '6px solid #3b82f6'
                }].map((corner, index) => (
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
                  Área óptima de escaneo
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
                    Reintentar escaneo
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
                        Buscando producto...
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
                      Mantén el código centrado y espera a que se detecte automáticamente
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
                    Detener escaneo
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
                    Iniciar cámara
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
                      Tip: Asegúrate de tener buena iluminación para mejores resultados
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
                      Último código escaneado:
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
        </>

      )}

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ textAlign: 'center' }}>
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

                <div style={{ textAlign: 'center' }}>
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

                <div style={{ textAlign: 'center' }}>
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

                <div style={{ textAlign: 'center' }}>
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
        </>

      )}

      {/* NUEVO: Manual Food Form Modal */}
      {showManualForm && (
        <>
          <div
            onClick={() => setShowManualForm(false)}
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
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {t.manualFood}
              </h3>
              <button
                onClick={() => setShowManualForm(false)}
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

            {/* Nombre del alimento */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t.foodName} *
              </label>
              <input
                type="text"
                value={manualFood.name}
                onChange={(e) => handleManualFoodChange('name', e.target.value)}
                placeholder="Ej: Pizza casera"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Marca */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t.brandName}
              </label>
              <input
                type="text"
                value={manualFood.brand}
                onChange={(e) => handleManualFoodChange('brand', e.target.value)}
                placeholder="Ej: Casera"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Título de información nutricional */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>
                {t.nutritionPer100g}
              </h4>
            </div>

            {/* Grid de campos nutricionales */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Calorías */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.calories} *
                </label>
                <input
                  type="number"
                  value={manualFood.calories}
                  onChange={(e) => handleManualFoodChange('calories', e.target.value)}
                  placeholder="250"
                  min="0"
                  step="1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Proteínas */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.protein} *
                </label>
                <input
                  type="number"
                  value={manualFood.protein}
                  onChange={(e) => handleManualFoodChange('protein', e.target.value)}
                  placeholder="12.5"
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Carbohidratos */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.carbs} *
                </label>
                <input
                  type="number"
                  value={manualFood.carbs}
                  onChange={(e) => handleManualFoodChange('carbs', e.target.value)}
                  placeholder="30.0"
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Grasas */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.fats} *
                </label>
                <input
                  type="number"
                  value={manualFood.fats}
                  onChange={(e) => handleManualFoodChange('fats', e.target.value)}
                  placeholder="8.2"
                  min="0"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Fibra (campo completo) */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t.fiber} (opcional)
              </label>
              <input
                type="number"
                value={manualFood.fiber}
                onChange={(e) => handleManualFoodChange('fiber', e.target.value)}
                placeholder="2.5"
                min="0"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Nota informativa */}
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #e0e7ff',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-information-line" style={{ color: 'white', fontSize: '14px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    Información nutricional
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Ingresa los valores nutricionales por cada 100 gramos del alimento. Los campos marcados con * son obligatorios.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowManualForm(false)}
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
                onClick={createManualFood}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="ri-add-line" style={{ fontSize: '16px' }}></i>
                {t.createFood}
              </button>
            </div>
          </div>
        </>

      )}

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

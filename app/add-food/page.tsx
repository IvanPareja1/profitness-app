
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../components/BottomNavigation';
import { deviceTime } from '../../lib/device-time-utils';

// Interfaces para TypeScript
interface FoodItem {
  id: string;
  name: string;
  brand: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  barcode?: string;
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
}

interface ManualFoodData {
  name: string;
  brand: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  fiber: string;
  quantity: string;
  mealType: string;
}

interface CalculatedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export default function AddFood() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('es');

  // Estados para escáner de códigos de barras
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string>('');
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Estados para cámara de comida
  const [showFoodCamera, setShowFoodCamera] = useState(false);
  const [showFoodResults, setShowFoodResults] = useState(false);
  const [capturedImage, setCapturedImage] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFoodItem[]>([]);

  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);

  // Estados para modal de nutrición
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState('almuerzo');
  const [calculatedNutrition, setCalculatedNutrition] = useState<CalculatedNutrition>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0
  });

  // Estados para formulario manual
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualFood, setManualFood] = useState<ManualFoodData>({
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    quantity: '100',
    mealType: 'almuerzo'
  });

  // Referencias de video
  const videoRef = useRef<HTMLVideoElement>(null);
  const foodVideoRef = useRef<HTMLVideoElement>(null);

  // Traducciones
  const translations = {
    es: {
      addFood: 'Agregar Comida',
      searchFood: 'Buscar Alimento',
      searchPlaceholder: 'Buscar alimentos...',
      scanBarcode: 'Escanear',
      takePhoto: 'Fotografiar',
      addManual: 'Manual',
      searching: 'Buscando...',
      noResults: 'Sin resultados',
      popular: 'Alimentos Populares',
      per100g: 'por 100g',
      nutrition: 'Información Nutricional',
      quantity: 'Cantidad',
      grams: 'gramos',
      mealType: 'Tipo de Comida',
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      snack: 'Snack',
      calories: 'Calorías',
      protein: 'Proteínas',
      carbs: 'Carbohidratos',
      fats: 'Grasas',
      fiber: 'Fibra',
      cancel: 'Cancelar',
      addToLog: 'Agregar al Registro',
      manualFood: 'Alimento Manual',
      foodName: 'Nombre del Alimento',
      brandName: 'Marca',
      nutritionPer100g: 'Información Nutricional por 100g',
      createFood: 'Crear Alimento',
      customQuantity: 'Cantidad a Consumir',
      scanInstructions: 'Mantén el código de barras centrado en el área marcada',
      photoInstructions: 'Centra tu plato de comida en el área marcada',
      photoTips: 'Asegúrate de tener buena iluminación para mejores resultados',
      analyzingFood: 'Analizando comida...',
      takingPhoto: 'Capturando imagen...',
      retryPhoto: 'Tomar otra foto',
      foodDetected: 'Alimentos Detectados',
      detected: 'Detectado',
      suggested: 'Sugerido',
      selectFood: 'Seleccionar'
    },
    en: {
      addFood: 'Add Food',
      searchFood: 'Search Food',
      searchPlaceholder: 'Search foods...',
      scanBarcode: 'Scan',
      takePhoto: 'Photo',
      addManual: 'Manual',
      searching: 'Searching...',
      noResults: 'No results',
      popular: 'Popular Foods',
      per100g: 'per 100g',
      nutrition: 'Nutrition Information',
      quantity: 'Quantity',
      grams: 'grams',
      mealType: 'Meal Type',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fats: 'Fats',
      fiber: 'Fiber',
      cancel: 'Cancel',
      addToLog: 'Add to Log',
      manualFood: 'Manual Food',
      foodName: 'Food Name',
      brandName: 'Brand',
      nutritionPer100g: 'Nutrition per 100g',
      createFood: 'Create Food',
      customQuantity: 'Quantity to Consume',
      scanInstructions: 'Keep the barcode centered in the marked area',
      photoInstructions: 'Center your food plate in the marked area',
      photoTips: 'Make sure you have good lighting for better results',
      analyzingFood: 'Analyzing food...',
      takingPhoto: 'Capturing image...',
      retryPhoto: 'Retry Photo',
      foodDetected: 'Detected Foods',
      detected: 'Detected',
      suggested: 'Suggested',
      selectFood: 'Select Food'
    }
  };

  useEffect(() => {
    setMounted(true);

    // Verificar autenticación
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (!isAuthenticated || isAuthenticated !== 'true') {
        router.push('/login');
        return;
      }

      // Cargar idioma
      try {
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
          const profile = JSON.parse(userProfile);
          setLanguage(profile.language || 'es');
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }

      // Cargar alimentos populares
      loadPopularFoods();
    }
  }, [router]);

  // Cargar alimentos populares
  const loadPopularFoods = () => {
    const foods: FoodItem[] = [
      {
        id: '1',
        name: 'Arroz blanco cocido',
        brand: 'Genérico',
        calories_per_100g: 130,
        protein_per_100g: 2.7,
        carbs_per_100g: 28.2,
        fats_per_100g: 0.3,
        fiber_per_100g: 0.4
      },
      {
        id: '2',
        name: 'Pechuga de pollo',
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
        name: 'Pan integral',
        brand: 'Genérico',
        calories_per_100g: 247,
        protein_per_100g: 13,
        carbs_per_100g: 41,
        fats_per_100g: 4.2,
        fiber_per_100g: 7
      },
      {
        id: '5',
        name: 'Banana',
        brand: 'Genérico',
        calories_per_100g: 89,
        protein_per_100g: 1.1,
        carbs_per_100g: 23,
        fats_per_100g: 0.3,
        fiber_per_100g: 2.6
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
    setPopularFoods(foods);
  };

  // Manejar cambio de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      setIsSearching(true);
      // Simular búsqueda con delay
      setTimeout(() => {
        const filtered = popularFoods.filter(food =>
          food.name.toLowerCase().includes(query.toLowerCase()) ||
          food.brand.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Manejar selección de alimento
  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(100);
    calculateNutrition(food, 100);
    setShowNutritionModal(true);
  };

  // Calcular nutrición basada en cantidad
  const calculateNutrition = (food: FoodItem, qty: number) => {
    const factor = qty / 100;
    setCalculatedNutrition({
      calories: Math.round(food.calories_per_100g * factor),
      protein: Math.round(food.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
      fats: Math.round(food.fats_per_100g * factor * 10) / 10,
      fiber: Math.round(food.fiber_per_100g * factor * 10) / 10
    });
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 0;
    setQuantity(qty);
    if (selectedFood) {
      calculateNutrition(selectedFood, qty);
    }
  };

  // Iniciar escáner de código de barras
  const startBarcodeScanner = async () => {
    try {
      setScannerError('');
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setScannerError('No se pudo acceder a la cámara');
      setIsScanning(false);
      console.error('Error accessing camera:', error);
    }
  };

  // Detener escaneado
  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Iniciar cámara de comida
  const startFoodCamera = async () => {
    try {
      setAnalysisError('');
      setIsTakingPhoto(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (foodVideoRef.current) {
        foodVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      setAnalysisError('No se pudo acceder a la cámara');
      console.error('Error accessing food camera:', error);
    }
  };

  // Detener cámara de comida
  const stopFoodCamera = () => {
    if (foodVideoRef.current?.srcObject) {
      const stream = foodVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      foodVideoRef.current.srcObject = null;
    }
  };

  // Capturar y analizar comida
  const captureAndAnalyzeFood = async () => {
    if (!foodVideoRef.current) return;

    try {
      setIsTakingPhoto(true);

      // Crear canvas para capturar imagen
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = foodVideoRef.current.videoWidth;
        canvas.height = foodVideoRef.current.videoHeight;
        context.drawImage(foodVideoRef.current, 0, 0);

        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        setIsTakingPhoto(false);

        // Simular análisis de IA
        setIsAnalyzing(true);
        setTimeout(() => {
          const mockDetectedFoods: DetectedFoodItem[] = [
            {
              name: 'Ensalada mixta',
              calories: 150,
              protein: 8,
              carbs: 12,
              fats: 5,
              fiber: 4,
              confidence: 0.85,
              detected: true
            },
            {
              name: 'Pollo a la plancha',
              calories: 200,
              protein: 25,
              carbs: 2,
              fats: 8,
              fiber: 0,
              confidence: 0.75,
              detected: true
            }
          ];

          setDetectedFoods(mockDetectedFoods);
          setIsAnalyzing(false);
          setShowFoodResults(true);
        }, 2000);
      }
    } catch (error) {
      setAnalysisError('Error al capturar la imagen');
      setIsTakingPhoto(false);
      setIsAnalyzing(false);
    }
  };

  // Agregar comida al registro
  const addFoodToLog = async () => {
    if (!selectedFood) return;

    try {
      const today = deviceTime.getCurrentDate();
      const savedData = localStorage.getItem(`nutrition_${today}`);
      const currentData = savedData ? JSON.parse(savedData) : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        meals: []
      };

      // Crear nuevo meal
      const newMeal = {
        id: Date.now().toString(),
        name: selectedFood.name,
        brand: selectedFood.brand,
        quantity: quantity,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fats: calculatedNutrition.fats,
        fiber: calculatedNutrition.fiber,
        mealType: mealType,
        timestamp: deviceTime.createTimestamp()
      };

      // Actualizar totales
      const updatedData = {
        ...currentData,
        calories: currentData.calories + calculatedNutrition.calories,
        protein: currentData.protein + calculatedNutrition.protein,
        carbs: currentData.carbs + calculatedNutrition.carbs,
        fats: currentData.fats + calculatedNutrition.fats,
        fiber: currentData.fiber + calculatedNutrition.fiber,
        meals: [...currentData.meals, newMeal]
      };

      // Guardar datos
      localStorage.setItem(`nutrition_${today}`, JSON.stringify(updatedData));

      // Disparar evento para actualizar otras páginas
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
          detail: { date: today, data: updatedData }
        }));
      }

      // Cerrar modal y mostrar éxito
      setShowNutritionModal(false);
      setSelectedFood(null);

      // Mostrar mensaje de éxito
      setTimeout(() => {
        alert(`¡${selectedFood.name} agregado exitosamente!\\n${calculatedNutrition.calories} calorías registradas.`);
      }, 100);

    } catch (error) {
      console.error('Error adding food to log:', error);
      alert('Error al agregar el alimento');
    }
  };

  // Manejar cambios en formulario manual
  const handleManualFoodChange = (field: keyof ManualFoodData, value: string) => {
    setManualFood(prev => ({ ...prev, [field]: value }));
  };

  // Crear alimento manual
  const createManualFood = async () => {
    // Validaciones
    if (!manualFood.name.trim()) {
      alert('El nombre del alimento es obligatorio');
      return;
    }

    if (!manualFood.calories || !manualFood.protein || !manualFood.carbs || !manualFood.fats || !manualFood.quantity) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const calories = parseFloat(manualFood.calories);
    const protein = parseFloat(manualFood.protein);
    const carbs = parseFloat(manualFood.carbs);
    const fats = parseFloat(manualFood.fats);
    const quantity = parseFloat(manualFood.quantity);
    const fiber = parseFloat(manualFood.fiber) || 0;

    if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fats) || isNaN(quantity)) {
      alert('Por favor ingresa valores numéricos válidos');
      return;
    }

    try {
      const today = deviceTime.getCurrentDate();
      const savedData = localStorage.getItem(`nutrition_${today}`);
      const currentData = savedData ? JSON.parse(savedData) : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        meals: []
      };

      // Calcular nutrición según la cantidad
      const factor = quantity / 100;
      const calculatedCalories = Math.round(calories * factor);
      const calculatedProtein = Math.round(protein * factor * 10) / 10;
      const calculatedCarbs = Math.round(carbs * factor * 10) / 10;
      const calculatedFats = Math.round(fats * factor * 10) / 10;
      const calculatedFiber = Math.round(fiber * factor * 10) / 10;

      // Crear nuevo meal
      const newMeal = {
        id: Date.now().toString(),
        name: manualFood.name,
        brand: manualFood.brand || 'Personalizado',
        quantity: quantity,
        calories: calculatedCalories,
        protein: calculatedProtein,
        carbs: calculatedCarbs,
        fats: calculatedFats,
        fiber: calculatedFiber,
        mealType: manualFood.mealType,
        timestamp: deviceTime.createTimestamp()
      };

      // Actualizar totales
      const updatedData = {
        ...currentData,
        calories: currentData.calories + calculatedCalories,
        protein: currentData.protein + calculatedProtein,
        carbs: currentData.carbs + calculatedCarbs,
        fats: currentData.fats + calculatedFats,
        fiber: currentData.fiber + calculatedFiber,
        meals: [...currentData.meals, newMeal]
      };

      // Guardar datos
      localStorage.setItem(`nutrition_${today}`, JSON.stringify(updatedData));

      // Disparar evento para actualizar otras páginas
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
          detail: { date: today, data: updatedData }
        }));
      }

      // Limpiar formulario y cerrar modal
      setManualFood({
        name: '',
        brand: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        fiber: '',
        quantity: '100',
        mealType: 'almuerzo'
      });
      setShowManualForm(false);

      // Mostrar mensaje de éxito
      setTimeout(() => {
        alert(`¡${manualFood.name} creado y agregado exitosamente!\\n${calculatedCalories} calorías registradas.`);
      }, 100);

    } catch (error) {
      console.error('Error creating manual food:', error);
      alert('Error al crear el alimento personalizado');
    }
  };

  // Formatear números
  const formatNumber = (num: number): string => {
    return (Math.round(num * 10) / 10).toString();
  };

  const t = translations[language as keyof typeof translations] || translations.es;

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

          {/* Action Buttons */}
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

      {/* Food Camera Modal */}
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
        </>)
      }

      {/* Food Results Modal */}
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
              <div style={{
                width: '100%',
                height: '100%',
                border: '3px solid #3b82f6',
                borderRadius: '16px',
                position: 'relative',
                background: 'rgba(59, 130, 246, 0.1)',
                backdropFilter: 'blur(1px)'
              }}>
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

      {/* Manual Food Form Modal */}
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

            {/* Cantidad personalizada */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t.customQuantity} *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={manualFood.quantity}
                  onChange={(e) => handleManualFoodChange('quantity', e.target.value)}
                  placeholder="150"
                  min="1"
                  step="1"
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

            {/* Tipo de comida */}
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
                value={manualFood.mealType}
                onChange={(e) => handleManualFoodChange('mealType', e.target.value)}
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
                    Creación de alimento personalizado
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Ingresa los valores nutricionales por cada 100g y especifica la cantidad que vas a consumir. El alimento se agregará directamente a tu registro diario.
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

      {/* Estilos CSS */}
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

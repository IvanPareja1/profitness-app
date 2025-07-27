
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNavigation from '../../components/BottomNavigation';
import { detectFoodInImage, captureImageFromVideo } from '../../lib/vision-api';
import { 
  initializeBarcodeScanner, 
  stopBarcodeScanner, 
  getProductByBarcode, 
  isValidBarcode,
  BarcodeResult 
} from '../../lib/simple-barcode-scanner';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  category: string;
}

interface LiquidItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
}

interface CustomFoodState {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  fiber: string;
}

interface CustomLiquidState {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export default function AddFoodPage() {
  const [currentTab, setCurrentTab] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedLiquid, setSelectedLiquid] = useState<LiquidItem | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [showCustomLiquid, setShowCustomLiquid] = useState(false);
  const [customFood, setCustomFood] = useState<CustomFoodState>({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: ''
  });
  const [customLiquid, setCustomLiquid] = useState<CustomLiquidState>({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });
  const [selectedMealType, setSelectedMealType] = useState('desayuno');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [language, setLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [scanMode, setScanMode] = useState<'vision' | 'barcode'>('vision');
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [barcodeScanner, setBarcodeScanner] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      router.push('/login');
      return;
    }

    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        setLanguage(profile.language || 'es');
      }
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (barcodeScanner) {
        stopBarcodeScanner(barcodeScanner);
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [barcodeScanner, cameraStream]);

  const translations = {
    es: {
      addFood: 'Agregar Comida',
      food: 'Comida',
      liquid: 'Líquido',
      searchFood: 'Buscar alimento...',
      searchLiquid: 'Buscar líquido...',
      quantity: 'Cantidad',
      grams: 'gramos',
      ml: 'ml',
      mealType: 'Tipo de comida',
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      snack: 'Snack',
      nutritionInfo: 'Información Nutricional',
      calories: 'Calorías',
      protein: 'Proteínas',
      carbs: 'Carbohidratos',
      fats: 'Grasas',
      fiber: 'Fibra',
      addToLog: 'Agregar al Registro',
      scanBarcode: 'Escanear Código',
      addCustomFood: 'Agregar Comida Personalizada',
      addCustomLiquid: 'Agregar Líquido Personalizado',
      customFood: 'Comida Personalizada',
      customLiquid: 'Líquido Personalizado',
      name: 'Nombre',
      save: 'Guardar',
      cancel: 'Cancelar',
      nutritionPer100g: 'Nutrición por 100g',
      nutritionPer100ml: 'Nutrición por 100ml',
      selectFood: 'Selecciona un alimento',
      selectLiquid: 'Selecciona un líquido',
      enterQuantity: 'Ingresa la cantidad',
      enterName: 'Ingresa el nombre',
      enterCalories: 'Ingresa las calorías',
      enterProtein: 'Ingresa las proteínas',
      enterCarbs: 'Ingresa los carbohidratos',
      enterFats: 'Ingresa las grasas',
      enterFiber: 'Ingresa la fibra',
      addedSuccessfully: 'Agregado exitosamente',
      errorAdding: 'Error al agregar'
    },
    en: {
      addFood: 'Add Food',
      food: 'Food',
      liquid: 'Liquid',
      searchFood: 'Search food...',
      searchLiquid: 'Search liquid...',
      quantity: 'Quantity',
      grams: 'grams',
      ml: 'ml',
      mealType: 'Meal Type',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      nutritionInfo: 'Nutrition Information',
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fats: 'Fats',
      fiber: 'Fiber',
      addToLog: 'Add to Log',
      scanBarcode: 'Scan Barcode',
      addCustomFood: 'Add Custom Food',
      addCustomLiquid: 'Add Custom Liquid',
      customFood: 'Custom Food',
      customLiquid: 'Custom Liquid',
      name: 'Name',
      save: 'Save',
      cancel: 'Cancel',
      nutritionPer100g: 'Nutrition per 100g',
      nutritionPer100ml: 'Nutrition per 100ml',
      selectFood: 'Select a food',
      selectLiquid: 'Select a liquid',
      enterQuantity: 'Enter quantity',
      enterName: 'Enter name',
      enterCalories: 'Enter calories',
      enterProtein: 'Enter protein',
      enterCarbs: 'Enter carbs',
      enterFats: 'Enter fats',
      enterFiber: 'Enter fiber',
      addedSuccessfully: 'Added successfully',
      errorAdding: 'Error adding'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.es;

  const foodDatabase: FoodItem[] = [
    { id: '1', name: 'Pollo a la plancha', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, category: 'protein' },
    { id: '2', name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, category: 'carbs' },
    { id: '3', name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, category: 'vegetables' },
    { id: '4', name: 'Huevo', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, category: 'protein' },
    { id: '5', name: 'Avena', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, fiber: 10.6, category: 'carbs' },
    { id: '6', name: 'Salmón', calories: 208, protein: 22, carbs: 0, fats: 12, fiber: 0, category: 'protein' },
    { id: '7', name: 'Espinaca', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, category: 'vegetables' },
    { id: '8', name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, category: 'fruits' },
    { id: '9', name: 'Almendras', calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12, category: 'nuts' },
    { id: '10', name: 'Yogur griego', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0, category: 'dairy' }
  ];

  const liquidDatabase: LiquidItem[] = [
    { id: '1', name: 'Agua', calories: 0, protein: 0, carbs: 0, fats: 0, category: 'water' },
    { id: '2', name: 'Leche entera', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, category: 'dairy' },
    { id: '3', name: 'Jugo de naranja', calories: 45, protein: 0.7, carbs: 10.4, fats: 0.2, category: 'juice' },
    { id: '4', name: 'Café negro', calories: 2, protein: 0.3, carbs: 0.5, fats: 0, category: 'coffee' },
    { id: '5', name: 'Té verde', calories: 1, protein: 0.2, carbs: 0.2, fats: 0, category: 'tea' },
    { id: '6', name: 'Coca Cola', calories: 42, protein: 0, carbs: 10.6, fats: 0, category: 'soda' },
    { id: '7', name: 'Cerveza', calories: 43, protein: 0.5, carbs: 3.6, fats: 0, category: 'alcohol' },
    { id: '8', name: 'Vino tinto', calories: 85, protein: 0.1, carbs: 2.6, fats: 0, category: 'alcohol' },
    { id: '9', name: 'Protein Shake', calories: 103, protein: 20, carbs: 3, fats: 1.5, category: 'supplement' },
    { id: '10', name: 'Leche de almendras', calories: 17, protein: 0.6, carbs: 1.5, fats: 1.4, category: 'plant-milk' }
  ];

  const safeNumber = (value: string | number, defaultValue: number = 0): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
  };

  const formatNumber = (value: number): string => {
    return isNaN(value) ? '0' : value.toFixed(1);
  };

  const calculateNutrition = (food: FoodItem, quantity: number): NutritionResult => {
    const factor = quantity / 100;
    return {
      calories: Math.round(food.calories * factor),
      protein: Math.round(food.protein * factor * 10) / 10,
      carbs: Math.round(food.carbs * factor * 10) / 10,
      fats: Math.round(food.fats * factor * 10) / 10,
      fiber: Math.round(food.fiber * factor * 10) / 10
    };
  };

  const calculateLiquidNutrition = (liquid: LiquidItem, quantity: number): NutritionResult => {
    const factor = quantity / 100;
    return {
      calories: Math.round(liquid.calories * factor),
      protein: Math.round(liquid.protein * factor * 10) / 10,
      carbs: Math.round(liquid.carbs * factor * 10) / 10,
      fats: Math.round(liquid.fats * factor * 10) / 10,
      fiber: 0
    };
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = foodDatabase.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setSuggestions([]);
  };

  const handleLiquidSelect = (liquid: LiquidItem) => {
    setSelectedLiquid(liquid);
    setSearchQuery(liquid.name);
    setSuggestions([]);
  };

  const handleAddFood = () => {
    if (!selectedFood && !showCustomFood) {
      alert(t.selectFood);
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      alert(t.enterQuantity);
      return;
    }

    setIsLoading(true);

    try {
      let nutrition: NutritionResult;
      let foodName: string;

      if (showCustomFood) {
        if (!customFood.name || !customFood.calories) {
          alert(t.enterName + ' y ' + t.enterCalories);
          setIsLoading(false);
          return;
        }

        const customFoodItem: FoodItem = {
          id: Date.now().toString(),
          name: customFood.name,
          calories: safeNumber(customFood.calories),
          protein: safeNumber(customFood.protein),
          carbs: safeNumber(customFood.carbs),
          fats: safeNumber(customFood.fats),
          fiber: safeNumber(customFood.fiber),
          category: 'custom'
        };

        nutrition = calculateNutrition(customFoodItem, parseFloat(quantity));
        foodName = customFood.name;
      } else if (selectedFood) {
        nutrition = calculateNutrition(selectedFood, parseFloat(quantity));
        foodName = selectedFood.name;
      } else {
        setIsLoading(false);
        return;
      }

      const meal = {
        id: Date.now().toString(),
        name: foodName,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fats,
        fiber: nutrition.fiber,
        quantity: parseFloat(quantity),
        mealType: selectedMealType,
        timestamp: new Date().toISOString()
      };

      const today = new Date().toISOString().split('T')[0];
      const existingData = localStorage.getItem(`nutrition_${today}`);
      const currentData = existingData ? JSON.parse(existingData) : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        meals: []
      };

      const updatedData = {
        calories: currentData.calories + nutrition.calories,
        protein: currentData.protein + nutrition.protein,
        carbs: currentData.carbs + nutrition.carbs,
        fats: currentData.fats + nutrition.fats,
        fiber: currentData.fiber + nutrition.fiber,
        meals: [...currentData.meals, meal]
      };

      localStorage.setItem(`nutrition_${today}`, JSON.stringify(updatedData));

      window.dispatchEvent(new CustomEvent('nutritionDataUpdated'));

      resetForm();
      router.push('/');
    } catch (error) {
      console.error('Error adding food:', error);
      alert(t.errorAdding);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLiquid = () => {
    if (!selectedLiquid && !showCustomLiquid) {
      alert(t.selectLiquid);
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      alert(t.enterQuantity);
      return;
    }

    setIsLoading(true);

    try {
      let nutrition: NutritionResult;
      let liquidName: string;

      if (showCustomLiquid) {
        if (!customLiquid.name || !customLiquid.calories) {
          alert(t.enterName + ' y ' + t.enterCalories);
          setIsLoading(false);
          return;
        }

        const customLiquidItem: LiquidItem = {
          id: Date.now().toString(),
          name: customLiquid.name,
          calories: safeNumber(customLiquid.calories),
          protein: safeNumber(customLiquid.protein),
          carbs: safeNumber(customLiquid.carbs),
          fats: safeNumber(customLiquid.fats),
          category: 'custom'
        };

        nutrition = calculateLiquidNutrition(customLiquidItem, parseFloat(quantity));
        liquidName = customLiquid.name;
      } else if (selectedLiquid) {
        nutrition = calculateLiquidNutrition(selectedLiquid, parseFloat(quantity));
        liquidName = selectedLiquid.name;
      } else {
        setIsLoading(false);
        return;
      }

      const meal = {
        id: Date.now().toString(),
        name: liquidName,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fats,
        fiber: 0,
        quantity: parseFloat(quantity),
        mealType: selectedMealType,
        timestamp: new Date().toISOString()
      };

      const today = new Date().toISOString().split('T')[0];
      const existingData = localStorage.getItem(`nutrition_${today}`);
      const currentData = existingData ? JSON.parse(existingData) : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        meals: []
      };

      const updatedData = {
        calories: currentData.calories + nutrition.calories,
        protein: currentData.protein + nutrition.protein,
        carbs: currentData.carbs + nutrition.carbs,
        fats: currentData.fats + nutrition.fats,
        fiber: currentData.fiber + nutrition.fiber,
        meals: [...currentData.meals, meal]
      };

      localStorage.setItem(`nutrition_${today}`, JSON.stringify(updatedData));

      window.dispatchEvent(new CustomEvent('nutritionDataUpdated'));

      resetForm();
      router.push('/');
    } catch (error) {
      console.error('Error adding liquid:', error);
      alert(t.errorAdding);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFood(null);
    setSelectedLiquid(null);
    setSearchQuery('');
    setQuantity('100');
    setSuggestions([]);
    setShowCustomFood(false);
    setShowCustomLiquid(false);
    setCustomFood({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      fiber: ''
    });
    setCustomLiquid({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: ''
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (barcodeScanner) {
      stopBarcodeScanner(barcodeScanner);
      setBarcodeScanner(null);
    }
    setShowCamera(false);
    setIsScanning(false);
  };

  const handleVisionScan = async () => {
    if (!videoRef.current || !cameraStream) return;

    setIsScanning(true);
    try {
      const imageFile = await captureImageFromVideo(videoRef.current);

      const detectedFoods = await detectFoodInImage(imageFile);

      if (detectedFoods.length > 0) {
        const topFood = detectedFoods[0];
        setDetectedProduct({
          product_name: topFood.name,
          brands: 'Detectado visualmente',
          quantity: '100g',
          image_url: `https://readdy.ai/api/search-image?query=food%20${topFood.name}%20realistic%20healthy&width=200&height=200&seq=food_detected&orientation=squarish`,
          nutriments: {
            'energy-kcal_100g': topFood.calories,
            'proteins_100g': topFood.protein,
            'carbohydrates_100g': topFood.carbs,
            'fat_100g': topFood.fats,
            'fiber_100g': topFood.fiber
          },
          detected_type: 'vision'
        });
        setShowProductModal(true);
      } else {
        alert('No se detectaron alimentos en la imagen');
      }
    } catch (error) {
      console.error('Error in vision scan:', error);
      alert('Error al detectar alimentos');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeDetected = async (result: BarcodeResult) => {
    if (!isValidBarcode(result.code)) {
      return;
    }

    setIsScanning(true);
    try {
      const product = await getProductByBarcode(result.code);
      setDetectedProduct({
        ...product,
        detected_type: 'barcode'
      });
      setShowProductModal(true);
    } catch (error) {
      console.error('Error getting product:', error);
      alert('No se encontró información del producto');
    } finally {
      setIsScanning(false);
    }
  };

  const startCameraWithMode = async (mode: 'vision' | 'barcode') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      setScanMode(mode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        if (mode === 'barcode') {
          videoRef.current.addEventListener('loadedmetadata', async () => {
            try {
              const scanner = await initializeBarcodeScanner(
                videoRef.current!,
                handleBarcodeDetected,
                (error) => {
                  console.error('Error en escáner:', error);
                  alert('Error al inicializar el escáner');
                }
              );
              setBarcodeScanner(scanner);
            } catch (error) {
              console.error('Error inicializando escáner:', error);
              alert('Error al inicializar el escáner de códigos');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara');
    }
  };

  const displayProductModal = (product: any) => {
    const modal = document.createElement('div');

    if (!modal || !modal.style) {
      console.error('Error: No se pudo crear el modal');
      return;
    }

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const handleCloseModal = () => {
      if (modal && document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
      setShowProductModal(false);
      setDetectedProduct(null);
      stopCamera();
    };

    const handleAddProduct = () => {
      setCustomFood({
        name: product.product_name,
        calories: product.nutriments['energy-kcal_100g'].toString(),
        protein: product.nutriments['proteins_100g'].toString(),
        carbs: product.nutriments['carbohydrates_100g'].toString(),
        fats: product.nutriments['fat_100g'].toString(),
        fiber: product.nutriments['fiber_100g'].toString()
      });

      setShowCustomFood(true);
      setCurrentTab('food');
      handleCloseModal();
    };

    const detectionBadge = product.detected_type === 'barcode' ? 
      `<i class="ri-qr-code-line" style="color: #3b82f6; font-size: 14px;"></i><span style="font-size: 11px; color: #3b82f6; font-weight: 500;">Código de Barras</span>` :
      `<i class="ri-eye-line" style="color: #10b981; font-size: 14px;"></i><span style="font-size: 11px; color: #10b981; font-weight: 500;">Detección Visual</span>`;

    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; padding: 24px; max-width: 340px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 12px; overflow: hidden;">
            <img src="${product.image_url}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div>
            <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">${product.product_name}</h3>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">${product.brands} • ${product.quantity}</p>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
              ${detectionBadge}
            </div>
          </div>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Información Nutricional (100g)</h4>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #dc2626;">${product.nutriments['energy-kcal_100g']}</div>
              <div style="font-size: 11px; color: #6b7280;">Calorías</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #059669;">${product.nutriments['proteins_100g']}g</div>
              <div style="font-size: 11px; color: #6b7280;">Proteínas</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #d97706;">${product.nutriments['carbohydrates_100g']}g</div>
              <div style="font-size: 11px; color: #6b7280;">Carbohidratos</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: 700; color: #7c3aed;">${product.nutriments['fat_100g']}g</div>
              <div style="font-size: 11px; color: #6b7280;">Grasas</div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="cancel-btn" style="flex: 1; padding: 12px; background: #f3f4f6; color: #6b7280; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Cancelar</button>
          <button class="add-btn" style="flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Agregar Producto</button>
        </div>
      </div>
    `;

    if (document.body) {
      document.body.appendChild(modal);
    }

    const cancelBtn = modal.querySelector('.cancel-btn');
    const addBtn = modal.querySelector('.add-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', handleCloseModal);
    }
    if (addBtn) {
      addBtn.addEventListener('click', handleAddProduct);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        handleCloseModal();
      }
    });
  };

  useEffect(() => {
    if (detectedProduct && showProductModal) {
      displayProductModal(detectedProduct);
    }
  }, [detectedProduct, showProductModal]);

  const getCurrentNutrition = () => {
    if (currentTab === 'food') {
      if (showCustomFood) {
        const customFoodItem: FoodItem = {
          id: 'custom',
          name: customFood.name,
          calories: safeNumber(customFood.calories),
          protein: safeNumber(customFood.protein),
          carbs: safeNumber(customFood.carbs),
          fats: safeNumber(customFood.fats),
          fiber: safeNumber(customFood.fiber),
          category: 'custom'
        };
        return calculateNutrition(customFoodItem, parseFloat(quantity) || 100);
      } else if (selectedFood) {
        return calculateNutrition(selectedFood, parseFloat(quantity) || 100);
      }
    } else {
      if (showCustomLiquid) {
        const customLiquidItem: LiquidItem = {
          id: 'custom',
          name: customLiquid.name,
          calories: safeNumber(customLiquid.calories),
          protein: safeNumber(customLiquid.protein),
          carbs: safeNumber(customLiquid.carbs),
          fats: safeNumber(customLiquid.fats),
          category: 'custom'
        };
        return calculateLiquidNutrition(customLiquidItem, parseFloat(quantity) || 100);
      } else if (selectedLiquid) {
        return calculateLiquidNutrition(selectedLiquid, parseFloat(quantity) || 100);
      }
    }
    return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
  };

  const nutrition = getCurrentNutrition();

  if (showCamera) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'black',
        zIndex: 2000
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {scanMode === 'barcode' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '250px',
            height: '120px',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              background: 'rgba(0,0,0,0.7)',
              padding: '6px 12px',
              borderRadius: '6px'
            }}>
              Escanea el código de barras
            </div>
          </div>
        )}

        {scanMode === 'vision' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            border: '2px solid #10b981',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              background: 'rgba(0,0,0,0.7)',
              padding: '6px 12px',
              borderRadius: '6px'
            }}>
              Apunta hacia el alimento
            </div>
          </div>
        )}

        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={stopCamera}
            className="!rounded-button"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className="ri-close-line" style={{ fontSize: '20px' }}></i>
          </button>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            <h3 style={{
              color: 'white',
              margin: 0,
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {scanMode === 'barcode' ? 'Código de Barras' : 'Detección Visual'}
            </h3>
            <div style={{
              display: 'flex',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '2px'
            }}>
              <button
                onClick={() => setScanMode('vision')}
                className="!rounded-button"
                style={{
                  padding: '6px 12px',
                  backgroundColor: scanMode === 'vision' ? 'white' : 'transparent',
                  color: scanMode === 'vision' ? '#1f2937' : 'white',
                  border: 'none',
                  borderRadius: '18px',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <i className="ri-eye-line" style={{ fontSize: '12px' }}></i>
                Visual
              </button>
              <button
                onClick={() => setScanMode('barcode')}
                className="!rounded-button"
                style={{
                  padding: '6px 12px',
                  backgroundColor: scanMode === 'barcode' ? 'white' : 'transparent',
                  color: scanMode === 'barcode' ? '#1f2937' : 'white',
                  border: 'none',
                  borderRadius: '18px',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <i className="ri-qr-code-line" style={{ fontSize: '12px' }}></i>
                Código
              </button>
            </div>
          </div>

          <div style={{ width: '48px' }}></div>
        </div>

        {scanMode === 'vision' && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <button
              onClick={handleVisionScan}
              disabled={isScanning}
              className="!rounded-button"
              style={{
                width: '70px',
                height: '70px',
                backgroundColor: isScanning ? 'rgba(255,255,255,0.5)' : 'white',
                color: isScanning ? '#9ca3af' : '#1f2937',
                border: '4px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: isScanning ? 'not-allowed' : 'pointer'
              }}
            >
              {isScanning ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #9ca3af',
                  borderTop: '2px solid #1f2937',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <i className="ri-camera-line"></i>
              )}
            </button>
          </div>
        )}

        {scanMode === 'barcode' && isScanning && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(59, 130, 246, 0.9)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Procesando...
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/" style={{
            color: '#6b7280',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            <i className="ri-arrow-left-line" style={{ fontSize: '20px' }}></i>
          </Link>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            {t.addFood}
          </h1>
          <div style={{ width: '20px' }}></div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        paddingTop: '80px',
        padding: '80px 16px 20px 16px'
      }}>
        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f3f4f6',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => {
              setCurrentTab('food');
              resetForm();
            }}
            className="!rounded-button"
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: currentTab === 'food' ? 'white' : 'transparent',
              color: currentTab === 'food' ? '#1f2937' : '#6b7280',
              boxShadow: currentTab === 'food' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {t.food}
          </button>
          <button
            onClick={() => {
              setCurrentTab('liquid');
              resetForm();
            }}
            className="!rounded-button"
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: currentTab === 'liquid' ? 'white' : 'transparent',
              color: currentTab === 'liquid' ? '#1f2937' : '#6b7280',
              boxShadow: currentTab === 'liquid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {t.liquid}
          </button>
        </div>

        {/* Search Section */}
        {!showCustomFood && !showCustomLiquid && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '20px'
          }}>
            <div style={{
              position: 'relative',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  position: 'relative',
                  flex: 1
                }}>
                  <i className="ri-search-line" style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '16px'
                  }}></i>
                  <input
                    type="text"
                    placeholder={currentTab === 'food' ? t.searchFood : t.searchLiquid}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  onClick={() => startCameraWithMode('vision')}
                  className="!rounded-button"
                  style={{
                    padding: '12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px'
                  }}
                >
                  <i className="ri-eye-line" style={{ fontSize: '16px' }}></i>
                </button>

                <button
                  onClick={() => startCameraWithMode('barcode')}
                  className="!rounded-button"
                  style={{
                    padding: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px'
                  }}
                >
                  <i className="ri-qr-code-line" style={{ fontSize: '16px' }}></i>
                </button>
              </div>

              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => currentTab === 'food' ? handleFoodSelect(item) : handleLiquidSelect(item as any)}
                      className="!rounded-button"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: 'none',
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: 'white',
                        textAlign: 'left',
                        fontSize: '14px',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <i className="ri-restaurant-line" style={{ color: '#6b7280' }}></i>
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scan Methods */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => startCameraWithMode('vision')}
                className="!rounded-button"
                style={{
                  padding: '10px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <i className="ri-eye-line" style={{ fontSize: '14px' }}></i>
                Detectar Alimento
              </button>

              <button
                onClick={() => startCameraWithMode('barcode')}
                className="!rounded-button"
                style={{
                  padding: '10px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <i className="ri-qr-code-line" style={{ fontSize: '14px' }}></i>
                Código de Barras
              </button>
            </div>

            {/* Custom Food/Liquid Button */}
            <button
              onClick={() => {
                if (currentTab === 'food') {
                  setShowCustomFood(true);
                } else {
                  setShowCustomLiquid(true);
                }
                setSearchQuery('');
                setSuggestions([]);
              }}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#f0f9ff',
                color: '#3b82f6',
                border: '1px solid #e0e7ff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="ri-add-line"></i>
              {currentTab === 'food' ? t.addCustomFood : t.addCustomLiquid}
            </button>
          </div>
        )}

        {/* Custom Food Form */}
        {showCustomFood && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.customFood}
            </h3>

            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  {t.name}
                </label>
                <input
                  type="text"
                  placeholder={t.enterName}
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t.calories}
                  </label>
                  <input
                    type="number"
                    placeholder={t.enterCalories}
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t.protein} (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t.enterProtein}
                    value={customFood.protein}
                    onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t.carbs} (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t.enterCarbs}
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t.fats} (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t.enterFats}
                    value={customFood.fats}
                    onChange={(e) => setCustomFood({ ...customFood, fats: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  {t.fiber} (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={t.enterFiber}
                  value={customFood.fiber}
                  onChange={(e) => setCustomFood({ ...customFood, fiber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}>
              <button
                onClick={() => setShowCustomFood(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => setShowCustomFood(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {t.save}
              </button>
            </div>
          </div>
        )}

        {/* Custom Liquid Form */}
        {showCustomLiquid && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.customLiquid}
            </h3>

            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  {t.name}
                </label>
                <input
                  type="text"
                  placeholder={t.enterName}
                  value={customLiquid.name}
                  onChange={(e) => setCustomLiquid({ ...customLiquid, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t.calories}
                  </label>
                  <input
                    type="number"
                    placeholder={t.enterCalories}
                    value={customLiquid.calories}
                    onChange={(e) => setCustomLiquid({ ...customLiquid, calories: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t.protein} (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t.enterProtein}
                    value={customLiquid.protein}
                    onChange={(e) => setCustomLiquid({ ...customLiquid, protein: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t.carbs} (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t.enterCarbs}
                    value={customLiquid.carbs}
                    onChange={(e) => setCustomLiquid({ ...customLiquid, carbs: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {t.fats} (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={t.enterFats}
                    value={customLiquid.fats}
                    onChange={(e) => setCustomLiquid({ ...customLiquid, fats: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}>
              <button
                onClick={() => setShowCustomLiquid(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => setShowCustomLiquid(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {t.save}
              </button>
            </div>
          </div>
        )}

        {/* Quantity and Meal Type */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                {t.quantity}
              </label>
              <div style={{
                position: 'relative'
              }}>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {currentTab === 'food' ? t.grams : t.ml}
                </span>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                {t.mealType}
              </label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="desayuno">{t.breakfast}</option>
                <option value="almuerzo">{t.lunch}</option>
                <option value="cena">{t.dinner}</option>
                <option value="snack">{t.snack}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nutrition Preview */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 16px 0'
          }}>
            {t.nutritionInfo}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              border: '1px solid #fecaca'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#dc2626',
                marginBottom: '4px'
              }}>
                {nutrition.calories}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {t.calories}
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#16a34a',
                marginBottom: '4px'
              }}>
                {formatNumber(nutrition.protein)}g
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {t.protein}
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#fffbeb',
              borderRadius: '12px',
              border: '1px solid #fed7aa'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#d97706',
                marginBottom: '4px'
              }}>
                {formatNumber(nutrition.carbs)}g
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {t.carbs}
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f5f3ff',
              borderRadius: '12px',
              border: '1px solid #c4b5fd'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#7c3aed',
                marginBottom: '4px'
              }}>
                {formatNumber(nutrition.fats)}g
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {t.fats}
              </div>
            </div>
          </div>

          {currentTab === 'food' && (
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '4px'
              }}>
                {formatNumber(nutrition.fiber)}g
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {t.fiber}
              </div>
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={currentTab === 'food' ? handleAddFood : handleAddLiquid}
          disabled={isLoading}
          className="!rounded-button"
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: isLoading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </>
          ) : (
            <>
              <i className="ri-add-line"></i>
              {t.addToLog}
            </>
          )}
        </button>
      </main>

      <BottomNavigation />
    </div>
  );
}

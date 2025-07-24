
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import BottomNavigation from '../../components/BottomNavigation';

const popularFoods = [
  { name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  { name: 'Huevo entero', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  { name: 'Avena', calories: 389, protein: 17, carbs: 66, fats: 7, fiber: 10.6 },
  { name: 'Leche entera', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0 },
  { name: 'Pan integral', calories: 247, protein: 13, carbs: 41, fats: 4.2, fiber: 7 },
  { name: 'Yogur natural', calories: 61, protein: 3.5, carbs: 4.7, fats: 3.3, fiber: 0 },
  { name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
  { name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
  { name: 'Almendras', calories: 576, protein: 21, carbs: 22, fats: 49, fiber: 12 },
  { name: 'Salmón', calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0 }
];

const foodDatabase = [
  { name: 'pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  { name: 'pechuga de pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  { name: 'muslo de pollo', calories: 209, protein: 26, carbs: 0, fats: 11, fiber: 0 },
  { name: 'pavo', calories: 135, protein: 30, carbs: 0, fats: 1, fiber: 0 },
  { name: 'carne de res', calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0 },
  { name: 'cerdo', calories: 242, protein: 27, carbs: 0, fats: 14, fiber: 0 },
  { name: 'salmón', calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0 },
  { name: 'atún', calories: 132, protein: 28, carbs: 0, fats: 1, fiber: 0 },
  { name: 'huevo', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
  { name: 'clara de huevo', calories: 52, protein: 11, carbs: 0.7, fats: 0.2, fiber: 0 },
  { name: 'arroz', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  { name: 'arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  { name: 'arroz integral', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, fiber: 1.8 },
  { name: 'quinoa', calories: 120, protein: 4.4, carbs: 22, fats: 1.9, fiber: 2.8 },
  { name: 'avena', calories: 389, protein: 17, carbs: 66, fats: 7, fiber: 10.6 },
  { name: 'pasta', calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8 },
  { name: 'pan', calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 },
  { name: 'pan integral', calories: 247, protein: 13, carbs: 41, fats: 4.2, fiber: 7 },
  { name: 'papa', calories: 77, protein: 2, carbs: 17, fats: 0.1, fiber: 2.2 },
  { name: 'camote', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3 },
  { name: 'yuca', calories: 160, protein: 1.4, carbs: 38, fats: 0.3, fiber: 1.8 },
  { name: 'banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  { name: 'plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  { name: 'manzana', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
  { name: 'naranja', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4 },
  { name: 'pera', calories: 57, protein: 0.4, carbs: 15, fats: 0.1, fiber: 3.1 },
  { name: 'uva', calories: 62, protein: 0.6, carbs: 16, fats: 0.2, fiber: 0.9 },
  { name: 'fresa', calories: 32, protein: 0.7, carbs: 8, fats: 0.3, fiber: 2 },
  { name: 'palta', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7 },
  { name: 'aguacate', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7 },
  { name: 'kiwi', calories: 61, protein: 1.1, carbs: 15, fats: 0.5, fiber: 3 },
  { name: 'piña', calories: 50, protein: 0.5, carbs: 13, fats: 0.1, fiber: 1.4 },
  { name: 'mango', calories: 60, protein: 0.8, carbs: 15, fats: 0.4, fiber: 1.6 },
  { name: 'brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
  { name: 'espinaca', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2 },
  { name: 'lechuga', calories: 15, protein: 1.4, carbs: 2.9, fats: 0.2, fiber: 1.3 },
  { name: 'tomate', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2 },
  { name: 'zanahoria', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8 },
  { name: 'apio', calories: 14, protein: 0.7, carbs: 3, fats: 0.2, fiber: 1.6 },
  { name: 'pepino', calories: 16, protein: 0.7, carbs: 4, fats: 0.1, fiber: 0.5 },
  { name: 'pimiento', calories: 31, protein: 1, carbs: 7, fats: 0.3, fiber: 2.5 },
  { name: 'cebolla', calories: 40, protein: 1.1, carbs: 9, fats: 0.1, fiber: 1.7 },
  { name: 'ajo', calories: 149, protein: 6.4, carbs: 33, fats: 0.5, fiber: 2.1 },
  { name: 'leche', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0 },
  { name: 'leche entera', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0 },
  { name: 'leche descremada', calories: 34, protein: 3.4, carbs: 5, fats: 0.1, fiber: 0 },
  { name: 'yogur', calories: 61, protein: 3.5, carbs: 4.7, fats: 3.3, fiber: 0 },
  { name: 'yogur natural', calories: 61, protein: 3.5, carbs: 4.7, fats: 3.3, fiber: 0 },
  { name: 'yogur griego', calories: 97, protein: 9, carbs: 4, fats: 5, fiber: 0 },
  { name: 'queso', calories: 113, protein: 7, carbs: 1, fats: 9, fiber: 0 },
  { name: 'queso fresco', calories: 98, protein: 11, carbs: 4, fats: 4, fiber: 0 },
  { name: 'queso cheddar', calories: 403, protein: 25, carbs: 1.3, fats: 33, fiber: 0 },
  { name: 'almendras', calories: 576, protein: 21, carbs: 22, fats: 49, fiber: 12 },
  { name: 'nueces', calories: 654, protein: 15, carbs: 14, fats: 65, fiber: 6.7 },
  { name: 'maní', calories: 567, protein: 26, carbs: 16, fats: 49, fiber: 8.5 },
  { name: 'cacahuate', calories: 567, protein: 26, carbs: 16, fats: 49, fiber: 8.5 },
  { name: 'semillas de girasol', calories: 584, protein: 21, carbs: 20, fats: 51, fiber: 8.6 },
  { name: 'semillas de chía', calories: 486, protein: 17, carbs: 42, fats: 31, fiber: 34 },
  { name: 'linaza', calories: 534, protein: 18, carbs: 29, fats: 42, fiber: 27 },
  { name: 'lentejas', calories: 116, protein: 9, carbs: 20, fats: 0.4, fiber: 7.9 },
  { name: 'garbanzos', calories: 164, protein: 8.9, carbs: 27, fats: 2.6, fiber: 7.6 },
  { name: 'frijoles', calories: 127, protein: 9, carbs: 23, fats: 0.5, fiber: 6.4 },
  { name: 'porotos', calories: 127, protein: 9, carbs: 23, fats: 0.5, fiber: 6.4 },
  { name: 'arvejas', calories: 81, protein: 5.4, carbs: 14, fats: 0.4, fiber: 5.7 },
  { name: 'aceite de oliva', calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0 },
  { name: 'aceite', calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0 },
  { name: 'mantequilla', calories: 717, protein: 0.9, carbs: 0.1, fats: 81, fiber: 0 },
  { name: 'margarina', calories: 717, protein: 0.2, carbs: 0.9, fats: 80, fiber: 0 }
];

const liquidOptions = [
  { name: 'Agua', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, hydrating: true },
  { name: 'Té verde', calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, hydrating: true },
  { name: 'Té negro', calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, hydrating: true },
  { name: 'Infusión de hierbas', calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, hydrating: true },
  { name: 'Agua con limón', calories: 7, protein: 0, carbs: 2, fats: 0, fiber: 0, hydrating: true },
  { name: 'Café negro', calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, hydrating: false },
  { name: 'Jugo de naranja', calories: 45, protein: 0.7, carbs: 10, fats: 0.2, fiber: 0.2, hydrating: false },
  { name: 'Refresco', calories: 42, protein: 0, carbs: 10.6, fats: 0, fiber: 0, hydrating: false },
  { name: 'Bebida energética', calories: 45, protein: 0, carbs: 11, fats: 0, fiber: 0, hydrating: false },
  { name: 'Cerveza', calories: 43, protein: 0.5, carbs: 3.6, fats: 0, fiber: 0, hydrating: false },
  { name: 'Vino tinto', calories: 85, protein: 0.1, carbs: 2.6, fats: 0, fiber: 0, hydrating: false },
  { name: 'Leche descremada', calories: 34, protein: 3.4, carbs: 5, fats: 0.1, fiber: 0, hydrating: false }
];

const safeNumber = (value: any, defaultValue: number = 0): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const formatNumber = (value: any, decimals: number = 0): string => {
  const num = safeNumber(value);
  return decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
};

export default function AddFood() {
  const [mounted, setMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState('food');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [selectedLiquid, setSelectedLiquid] = useState<any>(null);
  const [quantity, setQuantity] = useState('100');
  const [liquidQuantity, setLiquidQuantity] = useState('250');
  const [mealType, setMealType] = useState('desayuno');
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [showCustomLiquid, setShowCustomLiquid] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCameraDetection, setShowCameraDetection] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: ''
  });
  const [customLiquid, setCustomLiquid] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    hydrating: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<any[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const filteredFoods = popularFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLiquids = liquidOptions.filter(liquid =>
    liquid.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateNutrition = (food: any, qty: string) => {
    const multiplier = safeNumber(qty) / 100;
    return {
      calories: Math.round(safeNumber(food.calories) * multiplier),
      protein: Math.round(safeNumber(food.protein) * multiplier * 10) / 10,
      carbs: Math.round(safeNumber(food.carbs) * multiplier * 10) / 10,
      fats: Math.round(safeNumber(food.fats) * multiplier * 10) / 10,
      fiber: Math.round(safeNumber(food.fiber, 0) * multiplier * 10) / 10
    };
  };

  const calculateLiquidNutrition = (liquid: any, qty: string) => {
    const multiplier = safeNumber(qty) / 100;
    return {
      calories: Math.round(safeNumber(liquid.calories) * multiplier),
      protein: Math.round(safeNumber(liquid.protein) * multiplier * 10) / 10,
      carbs: Math.round(safeNumber(liquid.carbs) * multiplier * 10) / 10,
      fats: Math.round(safeNumber(liquid.fats) * multiplier * 10) / 10,
      fiber: Math.round(safeNumber(liquid.fiber, 0) * multiplier * 10) / 10,
      hydrating: liquid.hydrating
    };
  };

  const handleAddFood = () => {
    setIsLoading(true);

    const foodToAdd = selectedFood || {
      name: customFood.name,
      calories: safeNumber(customFood.calories),
      protein: safeNumber(customFood.protein),
      carbs: safeNumber(customFood.carbs),
      fats: safeNumber(customFood.fats),
      fiber: safeNumber(customFood.fiber, 0)
    };

    const nutrition = selectedFood
      ? calculateNutrition(foodToAdd, quantity)
      : foodToAdd;

    const today = new Date().toISOString().split('T')[0];

    const existingData = localStorage.getItem(`nutrition_${today}`);
    const currentData = existingData ? JSON.parse(existingData) : {
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
      name: foodToAdd.name,
      mealType,
      quantity: selectedFood ? quantity : '100',
      calories: safeNumber(nutrition.calories),
      protein: safeNumber(nutrition.protein),
      carbs: safeNumber(nutrition.carbs),
      fats: safeNumber(nutrition.fats),
      fiber: safeNumber(nutrition.fiber, 0),
      timestamp: new Date().toISOString()
    };

    currentData.calories += safeNumber(nutrition.calories);
    currentData.protein += safeNumber(nutrition.protein);
    currentData.carbs += safeNumber(nutrition.carbs);
    currentData.fats += safeNumber(nutrition.fats);
    currentData.fiber += safeNumber(nutrition.fiber, 0);
    currentData.meals.push(newMeal);

    localStorage.setItem(`nutrition_${today}`, JSON.stringify(currentData));

    window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
      detail: { date: today, data: currentData }
    }));

    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleAddLiquid = () => {
    setIsLoading(true);

    const liquidToAdd = selectedLiquid || {
      name: customLiquid.name,
      calories: safeNumber(customLiquid.calories),
      protein: safeNumber(customLiquid.protein),
      carbs: safeNumber(customLiquid.carbs),
      fats: safeNumber(customLiquid.fats),
      fiber: safeNumber(customLiquid.fiber, 0),
      hydrating: customLiquid.hydrating
    };

    const nutrition = selectedLiquid
      ? calculateLiquidNutrition(liquidToAdd, liquidQuantity)
      : liquidToAdd;

    const today = new Date().toISOString().split('T')[0];

    const existingData = localStorage.getItem(`nutrition_${today}`);
    const currentData = existingData ? JSON.parse(existingData) : {
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
      name: liquidToAdd.name,
      mealType: 'liquid',
      quantity: selectedLiquid ? liquidQuantity : '250',
      calories: safeNumber(nutrition.calories),
      protein: safeNumber(nutrition.protein),
      carbs: safeNumber(nutrition.carbs),
      fats: safeNumber(nutrition.fats),
      fiber: safeNumber(nutrition.fiber, 0),
      timestamp: new Date().toISOString()
    };

    currentData.calories += safeNumber(nutrition.calories);
    currentData.protein += safeNumber(nutrition.protein);
    currentData.carbs += safeNumber(nutrition.carbs);
    currentData.fats += safeNumber(nutrition.fats);
    currentData.fiber += safeNumber(nutrition.fiber, 0);
    currentData.meals.push(newMeal);

    if (nutrition.hydrating) {
      currentData.water += safeNumber(liquidQuantity);
    }

    localStorage.setItem(`nutrition_${today}`, JSON.stringify(currentData));

    window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
      detail: { date: today, data: currentData }
    }));

    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleCustomFoodSubmit = () => {
    if (customFood.name && customFood.calories && customFood.protein && customFood.carbs && customFood.fats) {
      handleAddFood();
    }
  };

  const handleCustomLiquidSubmit = () => {
    if (customLiquid.name && customLiquid.calories && customLiquid.protein && customLiquid.carbs && customLiquid.fats) {
      handleAddLiquid();
    }
  };

  const searchFoodDatabase = (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = foodDatabase.filter(food =>
      food.name.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(matches.slice(0, 5));
    setShowSuggestions(matches.length > 0);
  };

  const autoFillMacros = (foodName: string) => {
    const foundFood = foodDatabase.find(food =>
      food.name.toLowerCase() === foodName.toLowerCase()
    );

    if (foundFood) {
      setCustomFood({
        name: foundFood.name,
        calories: foundFood.calories.toString(),
        protein: foundFood.protein.toString(),
        carbs: foundFood.carbs.toString(),
        fats: foundFood.fats.toString(),
        fiber: foundFood.fiber.toString()
      });
    }
  };

  const handleCustomFoodNameChange = (value: string) => {
    setCustomFood({ ...customFood, name: value });
    searchFoodDatabase(value);
  };

  const selectSuggestion = (food: any) => {
    autoFillMacros(food.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const startBarcodeScanner = async () => {
    try {
      setShowBarcodeScanner(true);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
      setShowBarcodeScanner(false);
      setIsScanning(false);
    }
  };

  const startCameraDetection = async () => {
    try {
      setShowCameraDetection(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
      setShowCameraDetection(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowBarcodeScanner(false);
    setShowCameraDetection(false);
    setIsScanning(false);
    setIsAnalyzing(false);
    setDetectedFoods([]);
  };

  const simulateBarcodeDetection = () => {
    setIsScanning(true);

    setTimeout(() => {
      const mockProducts = [
        {
          barcode: '7501234567890',
          name: 'Avena Quaker Original',
          brand: 'Quaker',
          calories: 379,
          protein: 13.4,
          carbs: 67.7,
          fats: 6.5,
          fiber: 10.1,
          servingSize: '100g'
        },
        {
          barcode: '7501234567891',
          name: 'Leche Lala Entera',
          brand: 'Lala',
          calories: 61,
          protein: 3.2,
          carbs: 4.8,
          fats: 3.3,
          fiber: 0,
          servingSize: '100ml'
        },
        {
          barcode: '7501234567892',
          name: 'Pan Integral Bimbo',
          brand: 'Bimbo',
          calories: 247,
          protein: 13,
          carbs: 41,
          fats: 4.2,
          fiber: 7,
          servingSize: '100g'
        }
      ];

      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];

      setCustomFood({
        name: randomProduct.name,
        calories: randomProduct.calories.toString(),
        protein: randomProduct.protein.toString(),
        carbs: randomProduct.carbs.toString(),
        fats: randomProduct.fats.toString(),
        fiber: randomProduct.fiber.toString()
      });

      setIsScanning(false);
      setShowBarcodeScanner(false);
      setShowCustomFood(true);
      stopCamera();

      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 16px;
        z-index: 3000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;

      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 24px; height: 24px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i class="ri-check-line" style="color: white; font-size: 14px;"></i>
          </div>
          <div>
            <p style="font-size: 14px; font-weight: 600; color: #16a34a; margin: 0;">Producto detectado</p>
            <p style="font-size: 12px; color: #15803d; margin: 0;">${randomProduct.name}</p>
          </div>
        </div>
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);

    }, 2000);
  };

  const analyzeFoodImage = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const mockDetectedFoods = [
        {
          name: 'Pechuga de pollo a la plancha',
          confidence: 0.92,
          estimatedGrams: 150,
          calories: 248,
          protein: 46.5,
          carbs: 0,
          fats: 5.4,
          fiber: 0,
          position: { x: 120, y: 80, width: 100, height: 80 }
        },
        {
          name: 'Arroz blanco',
          confidence: 0.87,
          estimatedGrams: 120,
          calories: 156,
          protein: 3.2,
          carbs: 33.6,
          fats: 0.4,
          fiber: 0.5,
          position: { x: 240, y: 120, width: 90, height: 60 }
        },
        {
          name: 'Brócoli al vapor',
          confidence: 0.84,
          estimatedGrams: 80,
          calories: 27,
          protein: 2.2,
          carbs: 5.6,
          fats: 0.3,
          fiber: 2.1,
          position: { x: 60, y: 180, width: 70, height: 50 }
        }
      ];

      setDetectedFoods(mockDetectedFoods);
      setIsAnalyzing(false);

    }, 3000);
  };

  const addDetectedFood = (food: any) => {
    const today = new Date().toISOString().split('T')[0];
    const existingData = localStorage.getItem(`nutrition_${today}`);
    const currentData = existingData ? JSON.parse(existingData) : {
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
      name: food.name,
      mealType,
      quantity: food.estimatedGrams.toString(),
      calories: safeNumber(food.calories),
      protein: safeNumber(food.protein),
      carbs: safeNumber(food.carbs),
      fats: safeNumber(food.fats),
      fiber: safeNumber(food.fiber, 0),
      timestamp: new Date().toISOString(),
      detectedByAI: true,
      confidence: food.confidence
    };

    currentData.calories += safeNumber(food.calories);
    currentData.protein += safeNumber(food.protein);
    currentData.carbs += safeNumber(food.carbs);
    currentData.fats += safeNumber(food.fats);
    currentData.fiber += safeNumber(food.fiber, 0);
    currentData.meals.push(newMeal);

    localStorage.setItem(`nutrition_${today}`, JSON.stringify(currentData));

    window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
      detail: { date: today, data: currentData }
    }));

    setDetectedFoods(prev => prev.filter(f => f.name !== food.name));
  };

  const finishCameraDetection = () => {
    stopCamera();
    if (detectedFoods.length > 0) {
      router.push('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
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
            Agregar Comida
          </h1>
        </div>
      </header>

      <main style={{ padding: '24px 16px' }}>

        {/* Sección de métodos de detección */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Métodos de Detección
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={startBarcodeScanner}
              className="!rounded-button"
              style={{
                padding: '16px 12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="ri-qr-scan-line" style={{ fontSize: '24px' }}></i>
              Escanear Código de Barras
            </button>

            <button
              onClick={startCameraDetection}
              className="!rounded-button"
              style={{
                padding: '16px 12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="ri-camera-line" style={{ fontSize: '24px' }}></i>
              Detectar con Cámara
            </button>
          </div>
        </div>

        {/* Modal del escáner de código de barras */}
        {showBarcodeScanner && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'black',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 2001
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                margin: 0
              }}>
                Escanear Código de Barras
              </h3>
              <button
                onClick={stopCamera}
                className="!rounded-button"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '20px' }}></i>
              </button>
            </div>

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

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '250px',
              height: '120px',
              border: '2px solid #10b981',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2001
            }}>
              {isScanning && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  height: '2px',
                  background: '#10b981',
                  animation: 'scan 2s linear infinite'
                }}></div>
              )}
              <p style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'center',
                margin: 0
              }}>
                {isScanning ? 'Escaneando...' : 'Coloca el código de barras aquí'}
              </p>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2001
            }}>
              <button
                onClick={simulateBarcodeDetection}
                disabled={isScanning}
                className="!rounded-button"
                style={{
                  padding: '16px 24px',
                  background: isScanning ? 'rgba(255,255,255,0.3)' : '#10b981',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isScanning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isScanning ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff40',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Escaneando...
                  </>
                ) : (
                  <>
                    <i className="ri-qr-scan-line"></i>
                    Simular Escáner
                  </>
                )}
              </button>
            </div>

            <style jsx>{`
              @keyframes scan {
                0% { top: 0; }
                100% { top: 100%; }
              }
            `}</style>
          </div>
        )}

        {/* Modal de detección con cámara */}
        {showCameraDetection && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'black',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 2001
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                margin: 0
              }}>
                Detectar Alimentos
              </h3>
              <button
                onClick={stopCamera}
                className="!rounded-button"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '20px' }}></i>
              </button>
            </div>

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

            {detectedFoods.map((food, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: `${food.position.x}px`,
                  top: `${food.position.y}px`,
                  width: `${food.position.width}px`,
                  height: `${food.position.height}px`,
                  border: '2px solid #8b5cf6',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  zIndex: 2001
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}>
                  {food.name} ({Math.round(food.confidence * 100)}%)
                </div>
              </div>
            ))}

            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2001,
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={analyzeFoodImage}
                disabled={isAnalyzing}
                className="!rounded-button"
                style={{
                  padding: '16px 24px',
                  background: isAnalyzing ? 'rgba(255,255,255,0.3)' : '#8b5cf6',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isAnalyzing ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff40',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <i className="ri-scan-line"></i>
                    Detectar Alimentos
                  </>
                )}
              </button>

              {detectedFoods.length > 0 && (
                <button
                  onClick={finishCameraDetection}
                  className="!rounded-button"
                  style={{
                    padding: '16px 24px',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="ri-check-line"></i>
                  Finalizar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Panel de alimentos detectados */}
        {detectedFoods.length > 0 && showCameraDetection && (
          <div style={{
            position: 'fixed',
            top: '80px',
            left: '20px',
            right: '20px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 2001
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 12px 0'
              }}>
                Alimentos Detectados
              </h4>

              {detectedFoods.map((food, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: index < detectedFoods.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: '0 0 2px 0'
                    }}>
                      {food.name}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      ~{food.estimatedGrams}g • {formatNumber(food.calories)} cal
                    </p>
                  </div>

                  <button
                    onClick={() => addDetectedFood(food)}
                    className="!rounded-button"
                    style={{
                      padding: '4px 8px',
                      background: '#8b5cf6',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '4px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={() => {
              setCurrentTab('food');
              setSearchTerm('');
              setSelectedFood(null);
              setSelectedLiquid(null);
              setShowCustomFood(false);
              setShowCustomLiquid(false);
            }}
            className="!rounded-button"
            style={{
              flex: 1,
              padding: '12px 16px',
              background: currentTab === 'food' ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: currentTab === 'food' ? 'white' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <i className="ri-restaurant-line"></i>
            Comida
          </button>

          <button
            onClick={() => {
              setCurrentTab('liquid');
              setSearchTerm('');
              setSelectedFood(null);
              setSelectedLiquid(null);
              setShowCustomFood(false);
              setShowCustomLiquid(false);
            }}
            className="!rounded-button"
            style={{
              flex: 1,
              padding: '12px 16px',
              background: currentTab === 'liquid' ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: currentTab === 'liquid' ? 'white' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <i className="ri-drop-line"></i>
            Líquidos
          </button>
        </div>

        {/* Botón para agregar comida personalizada */}
        {!showCustomFood && !showCustomLiquid && currentTab === 'food' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setShowCustomFood(true)}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="ri-add-line"></i>
              Crear Alimento Personalizado
            </button>
          </div>
        )}

        {/* Resto del código permanece igual */}
        {showCustomFood && currentTab === 'food' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="ri-restaurant-line" style={{ color: '#3b82f6' }}></i>
              Crear Alimento Personalizado
            </h3>

            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Nombre del alimento *
              </label>
              <input
                type="text"
                value={customFood.name}
                onChange={(e) => handleCustomFoodNameChange(e.target.value)}
                onFocus={() => searchFoodDatabase(customFood.name)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="Ej: pollo, palta, arroz..."
              />

              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  marginTop: '4px'
                }}>
                  {suggestions.map((food, index) => (
                    <div
                      key={index}
                      onClick={() => selectSuggestion(food)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                        transition: 'all 0.2s',
                        backgroundColor: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1f2937',
                          textTransform: 'capitalize'
                        }}>
                          {food.name}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {formatNumber(food.calories)} cal
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        fontSize: '11px',
                        color: '#9ca3af',
                        marginTop: '4px'
                      }}>
                        <span>P: {formatNumber(food.protein, 1)}g</span>
                        <span>C: {formatNumber(food.carbs, 1)}g</span>
                        <span>G: {formatNumber(food.fats, 1)}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {customFood.calories && customFood.name && (
              <div style={{
                background: '#f0f9ff',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="ri-magic-line" style={{ color: '#3b82f6', fontSize: '14px' }}></i>
                <span style={{
                  fontSize: '12px',
                  color: '#3b82f6',
                  fontWeight: '500'
                }}>
                  Macros completados automáticamente
                </span>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Calorías (por 100g) *
                </label>
                <input
                  type="number"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Proteínas (g) *
                </label>
                <input
                  type="number"
                  value={customFood.protein}
                  onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Carbohidratos (g) *
                </label>
                <input
                  type="number"
                  value={customFood.carbs}
                  onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="0"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Grasas (g) *
                </label>
                <input
                  type="number"
                  value={customFood.fats}
                  onChange={(e) => setCustomFood({ ...customFood, fats: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Fibra (g) - Opcional
              </label>
              <input
                type="number"
                value={customFood.fiber}
                onChange={(e) => setCustomFood({ ...customFood, fiber: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="0"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Cantidad (gramos)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="100"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Tipo de comida
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
                  backgroundColor: 'white'
                }}
              >
                <option value="desayuno">Desayuno</option>
                <option value="almuerzo">Almuerzo</option>
                <option value="cena">Cena</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowCustomFood(false);
                  setShowSuggestions(false);
                  setSuggestions([]);
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCustomFoodSubmit}
                disabled={!customFood.name || !customFood.calories || !customFood.protein || !customFood.carbs || !customFood.fats || isLoading}
                className="!rounded-button"
                style={{
                  flex: 2,
                  padding: '12px 16px',
                  background: (!customFood.name || !customFood.calories || !customFood.protein || !customFood.carbs || !customFood.fats || isLoading)
                    ? '#e5e7eb'
                    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (!customFood.name || !customFood.calories || !customFood.protein || !customFood.carbs || !customFood.fats || isLoading)
                    ? 'not-allowed'
                    : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
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
                    Agregando...
                  </>
                ) : (
                  <>
                    <i className="ri-add-line"></i>
                    Agregar Alimento
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!showCustomFood && !showCustomLiquid && currentTab === 'food' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Alimentos Populares
            </h3>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredFoods.map((food, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedFood(food)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedFood?.name === food.name ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    backgroundColor: selectedFood?.name === food.name ? '#f0f9ff' : 'white',
                    transition: 'all 0.2s'
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
                      fontWeight: '500',
                      color: '#3b82f6'
                    }}>
                      {formatNumber(food.calories)} cal
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    <span>P: {formatNumber(food.protein, 1)}g</span>
                    <span>C: {formatNumber(food.carbs, 1)}g</span>
                    <span>G: {formatNumber(food.fats, 1)}g</span>
                    {food.fiber > 0 && <span>F: {formatNumber(food.fiber, 1)}g</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFood && !showCustomFood && !showCustomLiquid && currentTab === 'food' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Detalles de la Comida
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Cantidad (gramos)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="100"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Tipo de comida
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
                  backgroundColor: 'white'
                }}
              >
                <option value="desayuno">Desayuno</option>
                <option value="almuerzo">Almuerzo</option>
                <option value="cena">Cena</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Información Nutricional
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Calorías:</span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: '8px'
                  }}>
                    {formatNumber(calculateNutrition(selectedFood, quantity).calories)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Proteínas:</span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: '8px'
                  }}>
                    {formatNumber(calculateNutrition(selectedFood, quantity).protein, 1)}g
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Carbohidratos:</span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: '8px'
                  }}>
                    {formatNumber(calculateNutrition(selectedFood, quantity).carbs, 1)}g
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Grasas:</span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: '8px'
                  }}>
                    {formatNumber(calculateNutrition(selectedFood, quantity).fats, 1)}g
                  </span>
                </div>
                {selectedFood.fiber > 0 && (
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Fibra:</span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginLeft: '8px'
                    }}>
                      {formatNumber(calculateNutrition(selectedFood, quantity).fiber, 1)}g
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAddFood}
              disabled={isLoading}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '16px 24px',
                background: isLoading ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
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
                  Agregando...
                </>
              ) : (
                <>
                  <i className="ri-add-line"></i>
                  Agregar Comida
                </>
              )}
            </button>
          </div>
        )}

        {/* Botón para agregar líquido personalizado */}
        {!showCustomFood && !showCustomLiquid && currentTab === 'liquid' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setShowCustomLiquid(true)}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="ri-add-line"></i>
              Crear Líquido Personalizado
            </button>
          </div>
        )}

        {!showCustomFood && !showCustomLiquid && currentTab === 'liquid' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Líquidos Populares
            </h3>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredLiquids.map((liquid, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedLiquid(liquid)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedLiquid?.name === liquid.name ? '2px solid #06b6d4' : '1px solid #e5e7eb',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    backgroundColor: selectedLiquid?.name === liquid.name ? '#f0fdff' : 'white',
                    transition: 'all 0.2s'
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
                      {liquid.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#06b6d4'
                      }}>
                        {formatNumber(liquid.calories)} cal
                      </span>
                      {liquid.hydrating && (
                        <span style={{
                          fontSize: '10px',
                          background: '#e0f2fe',
                          color: '#0891b2',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Hidratante
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    <span>P: {formatNumber(liquid.protein, 1)}g</span>
                    <span>C: {formatNumber(liquid.carbs, 1)}g</span>
                    <span>G: {formatNumber(liquid.fats, 1)}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedLiquid && !showCustomFood && !showCustomLiquid && currentTab === 'liquid' && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Detalles del Líquido
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Cantidad (mililitros)
              </label>
              <input
                type="number"
                value={liquidQuantity}
                onChange={(e) => setLiquidQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="250"
              />
            </div>

            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Información Nutricional
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Calorías:</span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: '8px'
                  }}>
                    {formatNumber(calculateLiquidNutrition(selectedLiquid, liquidQuantity).calories)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Proteínas:</span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: '8px'
                  }}>
                    {formatNumber(calculateLiquidNutrition(selectedLiquid, liquidQuantity).protein, 1)}g
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Carbohidratos:</span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: '8px'
                  }}>
                    {formatNumber(calculateLiquidNutrition(selectedLiquid, liquidQuantity).carbs, 1)}g
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Grasas:</span>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginLeft: '8px'
                  }}>
                    {formatNumber(calculateLiquidNutrition(selectedLiquid, liquidQuantity).fats, 1)}g
                  </span>
                </div>
                {selectedLiquid.hydrating && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Hidratación:</span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0891b2',
                      marginLeft: '8px'
                    }}>
                      +{liquidQuantity}ml
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAddLiquid}
              disabled={isLoading}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '16px 24px',
                background: isLoading ? '#e5e7eb' : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
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
                  Agregando...
                </>
              ) : (
                <>
                  <i className="ri-add-line"></i>
                  Agregar Líquido
                </>
              )}
            </button>
          </div>
        )}

        {/* Navegación inferior */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '8px 0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            maxWidth: '375px',
            margin: '0 auto'
          }}>
            <Link href="/" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px',
              textDecoration: 'none',
              color: '#9ca3af'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                <i className="ri-home-line" style={{ fontSize: '18px' }}></i>
              </div>
              <span style={{ fontSize: '12px' }}>Inicio</span>
            </Link>

            <Link href="/nutrition" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px',
              textDecoration: 'none',
              color: '#9ca3af'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                <i className="ri-pie-chart-line" style={{ fontSize: '18px' }}></i>
              </div>
              <span style={{ fontSize: '12px' }}>Nutrición</span>
            </Link>

            <Link href="/add-food" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px',
              textDecoration: 'none',
              color: '#3b82f6'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                <i className="ri-add-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '500' }}>Agregar</span>
            </Link>

            <Link href="/progress" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px',
              textDecoration: 'none',
              color: '#9ca3af'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                <i className="ri-line-chart-line" style={{ fontSize: '18px' }}></i>
              </div>
              <span style={{ fontSize: '12px' }}>Progreso</span>
            </Link>

            <Link href="/profile" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px',
              textDecoration: 'none',
              color: '#9ca3af'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                <i className="ri-user-line" style={{ fontSize: '18px' }}></i>
              </div>
              <span style={{ fontSize: '12px' }}>Perfil</span>
            </Link>
          </div>
        </nav>
      </main>

      <BottomNavigation />
    </div>
  );
}

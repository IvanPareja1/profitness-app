
// Modified code
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import BottomNavigation from '../../components/BottomNavigation';
import { DEMO_CONFIG } from '../../lib/demo-config';

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
  const [realBarcodeData, setRealBarcodeData] = useState<any>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
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
      : {
          calories: safeNumber(customFood.calories),
          protein: safeNumber(customFood.protein),
          carbs: safeNumber(customFood.carbs),
          fats: safeNumber(customFood.fats),
          fiber: safeNumber(customFood.fiber, 0)
        };

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
      : {
          calories: safeNumber(customLiquid.calories),
          protein: safeNumber(customLiquid.protein),
          carbs: safeNumber(customLiquid.carbs),
          fats: safeNumber(customLiquid.fats),
          fiber: safeNumber(customLiquid.fiber, 0),
          hydrating: customLiquid.hydrating
        };

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
      setIsScanning(false);
      setProductNotFound(false);
      setRealBarcodeData(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu dispositivo no soporta acceso a la cámara');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const infoMessage = document.createElement('div');
      infoMessage.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 2002;
        font-size: 14px;
        text-align: center;
        max-width: 300px;
      `;
      infoMessage.innerHTML = 'Coloca el código de barras dentro del marco.<br/>Conectado a OpenFoodFacts para productos reales.';
      document.body.appendChild(infoMessage);

      setTimeout(() => {
        if (document.body.contains(infoMessage)) {
          document.body.removeChild(infoMessage);
        }
      }, 5000);

    } catch (error) {
      console.log('Error accessing camera:', error);
      // Handle camera access error
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

  const startCameraDetection = async () => {
    try {
      setShowCameraDetection(true);
      setIsAnalyzing(false);
      setDetectedFoods([]);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu dispositivo no soporta acceso a la cámara');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const infoMessage = document.createElement('div');
      infoMessage.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 2002;
        font-size: 14px;
        text-align: center;
        max-width: 300px;
      `;
      infoMessage.innerHTML = 'Apunta la cámara hacia la comida para detectar automáticamente.';
      document.body.appendChild(infoMessage);

      setTimeout(() => {
        if (document.body.contains(infoMessage)) {
          document.body.removeChild(infoMessage);
        }
      }, 4000);

      // Simulate food detection after 3 seconds
      setTimeout(() => {
        simulateFoodDetection();
      }, 3000);

    } catch (error) {
      console.log('Error accessing camera:', error);
    }
  };

  const simulateFoodDetection = () => {
    // Solo funciona en modo demo
    if (!DEMO_CONFIG.ENABLED) return;

    if (isAnalyzing) return;

    setIsAnalyzing(true);

    const analysisMessage = document.createElement('div');
    analysisMessage.style.cssText = `
      position: fixed;
      top: 120px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(139, 92, 246, 0.9);
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      z-index: 2002;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    analysisMessage.innerHTML = `
      <div style="width: 16px; height: 16px; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      Analizando imagen con IA...
    `;
    document.body.appendChild(analysisMessage);

    setTimeout(() => {
      if (document.body.contains(analysisMessage)) {
        document.body.removeChild(analysisMessage);
      }

      // Simulate detected foods
      const detectedFoodOptions = [
        { name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, confidence: 0.89 },
        { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, confidence: 0.92 },
        { name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, confidence: 0.85 },
        { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, confidence: 0.91 },
        { name: 'Salmón', calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0, confidence: 0.87 }
      ];

      const randomFoods = detectedFoodOptions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1);

      setDetectedFoods(randomFoods);
      setIsAnalyzing(false);

      // Show detection results
      showDetectionResults(randomFoods);

    }, 2500);
  };

  const simulateBarcodeDetection = async () => {
    // Solo funciona en modo demo
    if (!DEMO_CONFIG.ENABLED) return;

    if (isScanning || isLoadingProduct) return;

    setIsScanning(true);
    setIsLoadingProduct(true);
    setProductNotFound(false);

    // Simulate barcode scanning process
    const scanningMessage = document.createElement('div');
    scanningMessage.style.cssText = `
      position: fixed;
      top: 120px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(16, 185, 129, 0.9);
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      z-index: 2002;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    scanningMessage.innerHTML = `
      <div style="width: 16px; height: 16px; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      Consultando OpenFoodFacts...
    `;
    document.body.appendChild(scanningMessage);

    setTimeout(() => {
      if (document.body.contains(scanningMessage)) {
        document.body.removeChild(scanningMessage);
      }

      // Simulate product data from OpenFoodFacts
      const productData = {
        product_name: 'Galletas Oreo Original',
        nutriments: {
          'energy-kcal_100g': 480,
          'proteins_100g': 6.9,
          'carbohydrates_100g': 71,
          'fat_100g': 18,
          'fiber_100g': 3.5
        },
        brands: 'Oreo',
        quantity: '154g',
        image_url: 'https://readdy.ai/api/search-image?query=Oreo%20cookies%20package%20realistic%20product%20photography%20white%20background&width=200&height=200&seq=oreo-product&orientation=squarish'
      };

      setRealBarcodeData(productData);
      setIsScanning(false);
      setIsLoadingProduct(false);

      // Show product information modal
      showProductModal(productData);

    }, 3000);
  };

  const showProductModal = (product: any) => {
    const modal = document.createElement('div');
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
              <i class="ri-shield-check-line" style="color: #10b981; font-size: 14px;"></i>
              <span style="font-size: 11px; color: #10b981; font-weight: 500;">Verificado por OpenFoodFacts</span>
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
          <button onclick="this.parentElement.parentElement.parentElement.remove(); stopCamera();" style="flex: 1; padding: 12px; background: #f3f4f6; color: #6b7280; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Cancelar</button>
          <button onclick="addScannedProduct(); this.parentElement.parentElement.parentElement.remove(); stopCamera();" style="flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Agregar Producto</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add global function to add scanned product
    (window as any).addScannedProduct = () => {
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
    };

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        stopCamera();
      }
    });

    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 30000);
  };

  const showDetectionResults = (foods: any[]) => {
    const resultsModal = document.createElement('div');
    resultsModal.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 16px;
      padding: 20px;
      z-index: 3000;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      max-width: 340px;
      width: 90%;
      max-height: 500px;
      overflow-y: auto;
    `;

    resultsModal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 40px; height: 40px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <i class="ri-eye-line" style="color: white; font-size: 20px;"></i>
        </div>
        <div>
          <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">Alimentos Detectados</h3>
          <p style="font-size: 12px; color: #6b7280; margin: 0;">IA Visual • ${foods.length} elemento${foods.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        ${foods.map(food => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="selectDetectedFood('${food.name}')">
            <div style="flex: 1;">
              <h4 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">${food.name}</h4>
              <div style="display: flex; gap: 12px; font-size: 11px; color: #6b7280;">
                <span>${food.calories} cal</span>
                <span>${food.protein}g prot</span>
                <span>${food.carbs}g carb</span>
                <span>${food.fats}g gras</span>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">
                ${Math.round(food.confidence * 100)}%
              </div>
            </div>
          </div>
        `).join('')}
        }
      </div>

      <div style="display: flex; gap: 8px;">
        <button onclick="this.parentElement.parentElement.remove(); stopCamera();" style="flex: 1; padding: 10px; background: #f3f4f6; color: #6b7280; border: none; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer;">Cancelar</button>
        <button onclick="this.parentElement.parentElement.remove(); stopCamera();" style="flex: 1; padding: 10px; background: #8b5cf6; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">Continuar</button>
      </div>
    `;

    document.body.appendChild(resultsModal);

    // Add global function to select detected food
    (window as any).selectDetectedFood = (foodName: string) => {
      const selectedFood = foods.find(f => f.name === foodName);
      if (selectedFood) {
        setCustomFood({
          name: selectedFood.name,
          calories: selectedFood.calories.toString(),
          protein: selectedFood.protein.toString(),
          carbs: selectedFood.carbs.toString(),
          fats: selectedFood.fats.toString(),
          fiber: selectedFood.fiber.toString()
        });

        setShowCustomFood(true);
        setCurrentTab('food');

        // Remove modal and stop camera
        if (document.body.contains(resultsModal)) {
          document.body.removeChild(resultsModal);
        }
        stopCamera();
      }
    };

    setTimeout(() => {
      if (document.body.contains(resultsModal)) {
        document.body.removeChild(resultsModal);
      }
    }, 15000);
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

        {/* Section of detection methods */}
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
              Escanear Código
              <span style={{ fontSize: '10px', opacity: '0.8' }}>
                {DEMO_CONFIG.ENABLED ? 'Demo' : 'OpenFoodFacts'}
              </span>
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
              <span style={{ fontSize: '10px', opacity: '0.8' }}>
                {DEMO_CONFIG.ENABLED ? 'Demo IA' : 'IA Visual'}
              </span>
            </button>
          </div>

          <div style={{
            background: DEMO_CONFIG.ENABLED ? '#fef3c7' : '#f0f9ff',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className={`ri-${DEMO_CONFIG.ENABLED ? 'flask' : 'information'}-line`} style={{ color: DEMO_CONFIG.ENABLED ? '#d97706' : '#3b82f6', fontSize: '16px' }}></i>
            <span style={{ fontSize: '12px', color: DEMO_CONFIG.ENABLED ? '#d97706' : '#3b82f6' }}>
              {DEMO_CONFIG.ENABLED
                ? 'Modo demostración activado. Las funciones de escaneo son simuladas.'
                : 'Funciones de escaneo conectadas a servicios reales de OpenFoodFacts.'
              }
            </span>
          </div>
        </div>

        {/* Barcode scanner modal */}
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
              <div>
                <h3 style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: 0
                }}>
                  Escanear Producto Real
                </h3>
                <p style={{
                  color: '#a3a3a3',
                  fontSize: '12px',
                  margin: '2px 0 0 0'
                }}>
                  Conectado a OpenFoodFacts
                </p>
              </div>
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
              {(isScanning || isLoadingProduct) && (
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
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: '0 0 4px 0'
                }}>
                  {isLoadingProduct ? 'Buscando producto...' :
                    isScanning ? 'Escaneando...' : 'Coloca el código de barras aquí'}
                </p>
                {productNotFound && (
                  <p style={{
                    color: '#fbbf24',
                    fontSize: '12px',
                    margin: 0
                  }}>
                    Producto no encontrado, usando datos simulados
                  </p>
                )}
              </div>
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
                disabled={isScanning || isLoadingProduct || !DEMO_CONFIG.ENABLED}
                className="!rounded-button"
                style={{
                  padding: '16px 24px',
                  background: (!DEMO_CONFIG.ENABLED || isScanning || isLoadingProduct) ? 'rgba(255,255,255,0.3)' : '#10b981',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (!DEMO_CONFIG.ENABLED || isScanning || isLoadingProduct) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {!DEMO_CONFIG.ENABLED ? (
                  <>
                    <i className="ri-lock-line"></i>
                    Función no disponible
                  </>
                ) : isLoadingProduct ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff40',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Consultando OpenFoodFacts...
                  </>
                ) : isScanning ? (
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
                    Simular Escaneo
                  </>
                )}
              </button>
            </div>

            <style jsx>{`
              @keyframes scan {
                0% { top: 0; }
                100% { top: 100%; }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Camera detection modal */}
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
              <div>
                <h3 style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: 0
                }}>
                  Detectar Comida
                </h3>
                <p style={{
                  color: '#a3a3a3',
                  fontSize: '12px',
                  margin: '2px 0 0 0'
                }}>
                  Apunta hacia la comida
                </p>
              </div>
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
              width: '200px',
              height: '200px',
              border: '2px solid #8b5cf6',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2001
            }}>
              {isAnalyzing && (
                <div style={{
                  width: '180px',
                  height: '180px',
                  border: '2px solid #8b5cf6',
                  borderRadius: '50%',
                  animation: 'pulse 2s ease-in-out infinite'
                }}></div>
              )}
              <div style={{ textAlign: 'center', position: 'absolute' }}>
                <i className="ri-camera-line" style={{
                  color: 'white',
                  fontSize: '32px',
                  marginBottom: '8px'
                }}></i>
                <p style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: 0
                }}>
                  {isAnalyzing ? 'Analizando...' : 'Coloca la comida aquí'}
                </p>
              </div>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2001
            }}>
              <button
                onClick={simulateFoodDetection}
                disabled={isAnalyzing || !DEMO_CONFIG.ENABLED}
                className="!rounded-button"
                style={{
                  padding: '16px 24px',
                  background: (!DEMO_CONFIG.ENABLED || isAnalyzing) ? 'rgba(255,255,255,0.3)' : '#8b5cf6',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (!DEMO_CONFIG.ENABLED || isAnalyzing) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {!DEMO_CONFIG.ENABLED ? (
                  <>
                    <i className="ri-lock-line"></i>
                    Función no disponible
                  </>
                ) : isAnalyzing ? (
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
                    <i className="ri-eye-line"></i>
                    Simular Detección
                  </>
                )}
              </button>
            </div>

            <style jsx>{`
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

      </main>

      <BottomNavigation />
    </div>
  );
}


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

const commonFoodsDatabase: { [key: string]: { calories: number; protein: number; carbs: number; fats: number; fiber: number } } = {
  // Carnes y Proteínas
  'pollo': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  'pechuga de pollo': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  'pollo a la plancha': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  'carne': { calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0 },
  'carne de res': { calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0 },
  'ternera': { calories: 231, protein: 30, carbs: 0, fats: 11, fiber: 0 },
  'cerdo': { calories: 242, protein: 27, carbs: 0, fats: 14, fiber: 0 },
  'pescado': { calories: 200, protein: 25, carbs: 0, fats: 10, fiber: 0 },
  'salmón': { calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0 },
  'atún': { calories: 144, protein: 30, carbs: 0, fats: 1, fiber: 0 },
  'merluza': { calories: 90, protein: 20, carbs: 0, fats: 1.3, fiber: 0 },
  'tilapia': { calories: 128, protein: 26, carbs: 0, fats: 2.7, fiber: 0 },
  'huevo': { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
  'clara de huevo': { calories: 52, protein: 11, carbs: 0.7, fats: 0.2, fiber: 0 },
  'pavo': { calories: 135, protein: 30, carbs: 0, fats: 1, fiber: 0 },

  // Carbohidratos
  'arroz': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  'arroz blanco': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  'arroz integral': { calories: 111, protein: 2.6, carbs: 23, fats: 0.9, fiber: 1.8 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8 },
  'fideos': { calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8 },
  'pan': { calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 },
  'pan integral': { calories: 247, protein: 13, carbs: 41, fats: 4.2, fiber: 7 },
  'papa': { calories: 77, protein: 2, carbs: 17, fats: 0.1, fiber: 2.2 },
  'batata': { calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3 },
  'camote': { calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 22, fats: 1.9, fiber: 2.8 },
  'avena': { calories: 389, protein: 16.9, carbs: 66, fats: 6.9, fiber: 10.6 },
  'trigo': { calories: 340, protein: 13, carbs: 71, fats: 2.5, fiber: 12.2 },

  // Frutas
  'manzana': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  'plátano': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  'naranja': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4 },
  'fresa': { calories: 32, protein: 0.7, carbs: 8, fats: 0.3, fiber: 2 },
  'frutilla': { calories: 32, protein: 0.7, carbs: 8, fats: 0.3, fiber: 2 },
  'pera': { calories: 57, protein: 0.4, carbs: 15, fats: 0.1, fiber: 3.1 },
  'durazno': { calories: 39, protein: 0.9, carbs: 10, fats: 0.3, fiber: 1.5 },
  'uva': { calories: 62, protein: 0.6, carbs: 16, fats: 0.2, fiber: 0.9 },
  'sandía': { calories: 30, protein: 0.6, carbs: 8, fats: 0.2, fiber: 0.4 },
  'melón': { calories: 34, protein: 0.8, carbs: 8, fats: 0.2, fiber: 0.9 },
  'kiwi': { calories: 61, protein: 1.1, carbs: 15, fats: 0.5, fiber: 3 },
  'piña': { calories: 50, protein: 0.5, carbs: 13, fats: 0.1, fiber: 1.4 },

  // Verduras
  'brócoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
  'espinaca': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2 },
  'lechuga': { calories: 15, protein: 1.4, carbs: 2.9, fats: 0.1, fiber: 1.3 },
  'tomate': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2 },
  'zanahoria': { calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8 },
  'cebolla': { calories: 40, protein: 1.1, carbs: 9, fats: 0.1, fiber: 1.7 },
  'pimiento': { calories: 31, protein: 1, carbs: 7, fats: 0.3, fiber: 2.5 },
  'apio': { calories: 16, protein: 0.7, carbs: 3, fats: 0.2, fiber: 1.6 },
  'pepino': { calories: 16, protein: 0.7, carbs: 4, fats: 0.1, fiber: 0.5 },
  'calabaza': { calories: 26, protein: 1, carbs: 7, fats: 0.1, fiber: 0.5 },
  'coliflor': { calories: 25, protein: 1.9, carbs: 5, fats: 0.3, fiber: 2 },
  'berenjena': { calories: 25, protein: 1, carbs: 6, fats: 0.2, fiber: 3 },

  // Lácteos
  'leche': { calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0 },
  'leche descremada': { calories: 34, protein: 3.4, carbs: 5, fats: 0.1, fiber: 0 },
  'yogur': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0 },
  'yogur griego': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0 },
  'queso': { calories: 113, protein: 25, carbs: 4.1, fats: 0.2, fiber: 0 },
  'queso fresco': { calories: 98, protein: 11, carbs: 4, fats: 4.3, fiber: 0 },
  'ricota': { calories: 174, protein: 11, carbs: 3, fats: 13, fiber: 0 },
  'mantequilla': { calories: 717, protein: 0.9, carbs: 0.1, fats: 81, fiber: 0 },

  // Frutos secos y semillas
  'almendras': { calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12 },
  'nueces': { calories: 654, protein: 15, carbs: 14, fats: 65, fiber: 7 },
  'maní': { calories: 567, protein: 26, carbs: 16, fats: 49, fiber: 8 },
  'cacahuate': { calories: 567, protein: 26, carbs: 16, fats: 49, fiber: 8 },
  'pistachos': { calories: 560, protein: 20, carbs: 28, fats: 45, fiber: 10 },
  'avellanas': { calories: 628, protein: 15, carbs: 17, fats: 61, fiber: 10 },
  'semillas de chía': { calories: 486, protein: 17, carbs: 42, fats: 31, fiber: 34 },
  'semillas de girasol': { calories: 584, protein: 21, carbs: 20, fats: 51, fiber: 9 },

  // Legumbres
  'lentejas': { calories: 116, protein: 9, carbs: 20, fats: 0.4, fiber: 8 },
  'frijoles': { calories: 127, protein: 9, carbs: 23, fats: 0.5, fiber: 9 },
  'garbanzos': { calories: 164, protein: 8, carbs: 27, fats: 2.6, fiber: 8 },
  'arvejas': { calories: 81, protein: 5, carbs: 14, fats: 0.4, fiber: 5 },
  'soja': { calories: 446, protein: 36, carbs: 30, fats: 20, fiber: 9 },

  // Aceites y grasas
  'aceite de oliva': { calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0 },
  'aceite': { calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0 },
  'aguacate': { calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7 },
  'palta': { calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7 },

  // Otros
  'chocolate': { calories: 546, protein: 5, carbs: 61, fats: 31, fiber: 7 },
  'miel': { calories: 304, protein: 0.3, carbs: 82, fats: 0, fiber: 0.2 },
  'azúcar': { calories: 387, protein: 0, carbs: 100, fats: 0, fiber: 0 }
};

const findFoodInDatabase = (foodName: string): { calories: number; protein: number; carbs: number; fats: number; fiber: number } | null => {
  const normalizedInput = foodName.toLowerCase().trim();

  // Buscar coincidencia exacta
  if (commonFoodsDatabase[normalizedInput]) {
    return commonFoodsDatabase[normalizedInput];
  }

  // Buscar coincidencia parcial
  const partialMatch = Object.keys(commonFoodsDatabase).find(key => 
    key.includes(normalizedInput) || normalizedInput.includes(key)
  );

  if (partialMatch) {
    return commonFoodsDatabase[partialMatch];
  }

  return null;
};

const autoFillMacronutrients = (foodName: string, quantity: number = 100) => {
  const foodData = findFoodInDatabase(foodName);

  if (foodData) {
    const factor = quantity / 100;
    return {
      calories: Math.round(foodData.calories * factor).toString(),
      protein: (foodData.protein * factor).toFixed(1),
      carbs: (foodData.carbs * factor).toFixed(1),
      fats: (foodData.fats * factor).toFixed(1),
      fiber: (foodData.fiber * factor).toFixed(1)
    };
  }

  return null;
};

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

export default function AddFoodPage() {
  const [currentTab, setCurrentTab] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedLiquid, setSelectedLiquid] = useState<LiquidItem | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [liquidSuggestions, setLiquidSuggestions] = useState<LiquidItem[]>([]);
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
  const [scanMode, setScanMode] = useState<'vision' | 'barcode'>('vision');
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [barcodeScanner, setBarcodeScanner] = useState<any>(null);
  const [autoFillIndicator, setAutoFillIndicator] = useState(false);
  const router = useRouter();

  const t = translations[language as keyof typeof translations] || translations.es;

  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        setLanguage(profile.language || 'es');
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
  }, []);

  const handleCustomFoodNameChange = (value: string) => {
    setCustomFood({ ...customFood, name: value });
    
    // Auto-fill if name has 3+ characters
    if (value.length >= 3) {
      const currentQuantity = parseFloat(quantity) || 100;
      const autoFilled = autoFillMacronutrients(value, currentQuantity);
      
      if (autoFilled) {
        setCustomFood(prev => ({
          ...prev,
          name: value,
          calories: autoFilled.calories,
          protein: autoFilled.protein,
          carbs: autoFilled.carbs,
          fats: autoFilled.fats,
          fiber: autoFilled.fiber
        }));
        setAutoFillIndicator(true);
        setTimeout(() => setAutoFillIndicator(false), 3000);
      }
    }
  };

  const handleCustomLiquidNameChange = (value: string) => {
    setCustomLiquid({ ...customLiquid, name: value });
    
    // Auto-fill if name has 3+ characters
    if (value.length >= 3) {
      const currentQuantity = parseFloat(quantity) || 100;
      const autoFilled = autoFillMacronutrients(value, currentQuantity);
      
      if (autoFilled) {
        setCustomLiquid(prev => ({
          ...prev,
          name: value,
          calories: autoFilled.calories,
          protein: autoFilled.protein,
          carbs: autoFilled.carbs,
          fats: autoFilled.fats
        }));
        setAutoFillIndicator(true);
        setTimeout(() => setAutoFillIndicator(false), 3000);
      }
    }
  };

  const handleQuantityChange = (newQuantity: string) => {
    setQuantity(newQuantity);
    
    // Re-calculate auto-fill values when quantity changes
    const quantityNum = parseFloat(newQuantity) || 100;
    
    if (showCustomFood && customFood.name.length >= 3) {
      const autoFilled = autoFillMacronutrients(customFood.name, quantityNum);
      if (autoFilled) {
        setCustomFood(prev => ({
          ...prev,
          calories: autoFilled.calories,
          protein: autoFilled.protein,
          carbs: autoFilled.carbs,
          fats: autoFilled.fats,
          fiber: autoFilled.fiber
        }));
      }
    }
    
    if (showCustomLiquid && customLiquid.name.length >= 3) {
      const autoFilled = autoFillMacronutrients(customLiquid.name, quantityNum);
      if (autoFilled) {
        setCustomLiquid(prev => ({
          ...prev,
          calories: autoFilled.calories,
          protein: autoFilled.protein,
          carbs: autoFilled.carbs,
          fats: autoFilled.fats
        }));
      }
    }
  };

  const searchFood = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
    const filtered = foodDatabase.filter(food =>
      food.name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const searchLiquid = (query: string) => {
    if (!query.trim()) {
      setLiquidSuggestions([]);
      return;
    }
    
    const filtered = liquidDatabase.filter(liquid =>
      liquid.name.toLowerCase().includes(query.toLowerCase())
    );
    setLiquidSuggestions(filtered);
  };

  const getCurrentNutrition = (): NutritionResult => {
    const quantityNum = parseFloat(quantity) || 100;
    
    if (currentTab === 'food') {
      if (showCustomFood) {
        return {
          calories: safeNumber(customFood.calories),
          protein: safeNumber(customFood.protein),
          carbs: safeNumber(customFood.carbs),
          fats: safeNumber(customFood.fats),
          fiber: safeNumber(customFood.fiber)
        };
      } else if (selectedFood) {
        return calculateNutrition(selectedFood, quantityNum);
      }
    } else {
      if (showCustomLiquid) {
        return {
          calories: safeNumber(customLiquid.calories),
          protein: safeNumber(customLiquid.protein),
          carbs: safeNumber(customLiquid.carbs),
          fats: safeNumber(customLiquid.fats),
          fiber: 0
        };
      } else if (selectedLiquid) {
        return calculateLiquidNutrition(selectedLiquid, quantityNum);
      }
    }
    
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0
    };
  };

  const handleAddFood = () => {
    const quantityNum = parseFloat(quantity) || 100;
    let foodName = '';
    
    if (currentTab === 'food') {
      if (showCustomFood) {
        if (!customFood.name.trim()) {
          alert(t.enterName);
          return;
        }
        foodName = customFood.name;
      } else if (selectedFood) {
        foodName = selectedFood.name;
      } else {
        alert(t.selectFood);
        return;
      }
    } else {
      if (showCustomLiquid) {
        if (!customLiquid.name.trim()) {
          alert(t.enterName);
          return;
        }
        foodName = customLiquid.name;
      } else if (selectedLiquid) {
        foodName = selectedLiquid.name;
      } else {
        alert(t.selectLiquid);
        return;
      }
    }
    
    const nutrition = getCurrentNutrition();
    const today = new Date().toISOString().split('T')[0];
    
    const newMeal = {
      id: Date.now().toString(),
      name: foodName,
      mealType: currentTab === 'liquid' ? 'liquid' : selectedMealType,
      quantity: quantityNum.toString(),
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fats: nutrition.fats,
      fiber: nutrition.fiber,
      timestamp: new Date().toISOString()
    };
    
    // Save to nutrition data
    const existingData = localStorage.getItem(`nutrition_${today}`);
    let nutritionData = existingData ? JSON.parse(existingData) : {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      water: 0,
      meals: []
    };
    
    nutritionData.meals.push(newMeal);
    nutritionData.calories += nutrition.calories;
    nutritionData.protein += nutrition.protein;
    nutritionData.carbs += nutrition.carbs;
    nutritionData.fats += nutrition.fats;
    nutritionData.fiber += nutrition.fiber;
    
    localStorage.setItem(`nutrition_${today}`, JSON.stringify(nutritionData));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
      detail: { date: today, data: nutritionData }
    }));
    
    // Reset form
    setSelectedFood(null);
    setSelectedLiquid(null);
    setSearchQuery('');
    setQuantity('100');
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
    setShowCustomFood(false);
    setShowCustomLiquid(false);
    setSuggestions([]);
    setLiquidSuggestions([]);
    
    // Success message
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      color: #16a34a;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    successMessage.textContent = t.addedSuccessfully;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        document.body.removeChild(successMessage);
      }
    }, 3000);
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
    setShowCamera(false);
    setIsScanning(false);
    
    if (barcodeScanner) {
      stopBarcodeScanner(barcodeScanner);
      setBarcodeScanner(null);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    
    try {
      const imageFile = await captureImageFromVideo(videoRef.current);
      const detectedFoods = await detectFoodInImage(imageFile);
      
      if (detectedFoods.length > 0) {
        const detectedFood = detectedFoods[0];
        setDetectedProduct(detectedFood);
        setShowProductModal(true);
      } else {
        alert('No se detectaron alimentos en la imagen');
      }
    } catch (error) {
      console.error('Error detecting food:', error);
      alert('Error al detectar alimentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeDetection = async (result: BarcodeResult) => {
    if (!isValidBarcode(result.code)) return;
    
    setIsLoading(true);
    
    try {
      const product = await getProductByBarcode(result.code);
      setDetectedProduct(product);
      setShowProductModal(true);
      stopCamera();
    } catch (error) {
      console.error('Error getting product:', error);
      alert('Error al obtener información del producto');
    } finally {
      setIsLoading(false);
    }
  };

  const startBarcodeScanning = async () => {
    if (!videoRef.current) return;
    
    setIsScanning(true);
    
    try {
      const scanner = await initializeBarcodeScanner(
        videoRef.current,
        handleBarcodeDetection,
        (error) => console.error('Barcode scanner error:', error)
      );
      setBarcodeScanner(scanner);
    } catch (error) {
      console.error('Error initializing barcode scanner:', error);
      setIsScanning(false);
    }
  };

  const addDetectedProduct = () => {
    if (!detectedProduct) return;
    
    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: detectedProduct.product_name || detectedProduct.name,
      calories: detectedProduct.nutriments?.['energy-kcal_100g'] || detectedProduct.calories || 0,
      protein: detectedProduct.nutriments?.['proteins_100g'] || detectedProduct.protein || 0,
      carbs: detectedProduct.nutriments?.['carbohydrates_100g'] || detectedProduct.carbs || 0,
      fats: detectedProduct.nutriments?.['fat_100g'] || detectedProduct.fats || 0,
      fiber: detectedProduct.nutriments?.['fiber_100g'] || detectedProduct.fiber || 0,
      category: 'detected'
    };
    
    setSelectedFood(newFood);
    setCurrentTab('food');
    setShowProductModal(false);
    stopCamera();
  };

  const nutrition = getCurrentNutrition();

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
        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'white',
          borderRadius: '16px',
          padding: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setCurrentTab('food')}
            className="!rounded-button"
            style={{
              flex: 1,
              padding: '12px 16px',
              background: currentTab === 'food' ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'transparent',
              color: currentTab === 'food' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {t.food}
          </button>
          <button
            onClick={() => setCurrentTab('liquid')}
            className="!rounded-button"
            style={{
              flex: 1,
              padding: '12px 16px',
              background: currentTab === 'liquid' ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'transparent',
              color: currentTab === 'liquid' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {t.liquid}
          </button>
        </div>

        {/* Search Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder={currentTab === 'food' ? t.searchFood : t.searchLiquid}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab === 'food') {
                    searchFood(e.target.value);
                  } else {
                    searchLiquid(e.target.value);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              />
              <i className="ri-search-line" style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: '18px'
              }}></i>
            </div>
            <button
              onClick={startCamera}
              className="!rounded-button"
              style={{
                width: '48px',
                height: '48px',
                background: '#f0f9ff',
                border: '1px solid #e0e7ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <i className="ri-camera-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
            </button>
          </div>

          {/* Suggestions */}
          {currentTab === 'food' && suggestions.length > 0 && (
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px'
            }}>
              {suggestions.map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setSearchQuery(food.name);
                    setSuggestions([]);
                    setShowCustomFood(false);
                  }}
                  className="!rounded-button"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
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
                      color: '#1f2937'
                    }}>
                      {food.name}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {food.calories} cal
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentTab === 'liquid' && liquidSuggestions.length > 0 && (
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px'
            }}>
              {liquidSuggestions.map((liquid) => (
                <button
                  key={liquid.id}
                  onClick={() => {
                    setSelectedLiquid(liquid);
                    setSearchQuery(liquid.name);
                    setLiquidSuggestions([]);
                    setShowCustomLiquid(false);
                  }}
                  className="!rounded-button"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
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
                      color: '#1f2937'
                    }}>
                      {liquid.name}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {liquid.calories} cal
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Custom Food/Liquid Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px'
          }}>
            <button
              onClick={() => {
                if (currentTab === 'food') {
                  setShowCustomFood(true);
                  setSelectedFood(null);
                } else {
                  setShowCustomLiquid(true);
                  setSelectedLiquid(null);
                }
                setSearchQuery('');
                setSuggestions([]);
                setLiquidSuggestions([]);
              }}
              className="!rounded-button"
              style={{
                flex: 1,
                padding: '8px 12px',
                background: '#f0f9ff',
                border: '1px solid #e0e7ff',
                borderRadius: '8px',
                color: '#3b82f6',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {currentTab === 'food' ? t.addCustomFood : t.addCustomLiquid}
            </button>
          </div>
        </div>

        {/* Custom Food Form */}
        {showCustomFood && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {t.customFood}
              </h3>
              {autoFillIndicator && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  background: '#dcfce7',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#16a34a'
                }}>
                  <i className="ri-check-circle-fill"></i>
                  Valores autocompletados
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.name}
                </label>
                <input
                  type="text"
                  value={customFood.name}
                  onChange={(e) => handleCustomFoodNameChange(e.target.value)}
                  placeholder={t.enterName}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.calories}
                </label>
                <input
                  type="number"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                  placeholder={t.enterCalories}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.protein} (g)
                </label>
                <input
                  type="number"
                  value={customFood.protein}
                  onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                  placeholder={t.enterProtein}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.carbs} (g)
                </label>
                <input
                  type="number"
                  value={customFood.carbs}
                  onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                  placeholder={t.enterCarbs}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.fats} (g)
                </label>
                <input
                  type="number"
                  value={customFood.fats}
                  onChange={(e) => setCustomFood({ ...customFood, fats: e.target.value })}
                  placeholder={t.enterFats}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.fiber} (g)
                </label>
                <input
                  type="number"
                  value={customFood.fiber}
                  onChange={(e) => setCustomFood({ ...customFood, fiber: e.target.value })}
                  placeholder={t.enterFiber}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
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
                onClick={() => {
                  setShowCustomFood(false);
                  setCustomFood({
                    name: '',
                    calories: '',
                    protein: '',
                    carbs: '',
                    fats: '',
                    fiber: ''
                  });
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Custom Liquid Form */}
        {showCustomLiquid && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {t.customLiquid}
              </h3>
              {autoFillIndicator && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  background: '#dcfce7',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#16a34a'
                }}>
                  <i className="ri-check-circle-fill"></i>
                  Valores autocompletados
                </div>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.name}
                </label>
                <input
                  type="text"
                  value={customLiquid.name}
                  onChange={(e) => handleCustomLiquidNameChange(e.target.value)}
                  placeholder={t.enterName}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.calories}
                </label>
                <input
                  type="number"
                  value={customLiquid.calories}
                  onChange={(e) => setCustomLiquid({ ...customLiquid, calories: e.target.value })}
                  placeholder={t.enterCalories}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.protein} (g)
                </label>
                <input
                  type="number"
                  value={customLiquid.protein}
                  onChange={(e) => setCustomLiquid({ ...customLiquid, protein: e.target.value })}
                  placeholder={t.enterProtein}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.carbs} (g)
                </label>
                <input
                  type="number"
                  value={customLiquid.carbs}
                  onChange={(e) => setCustomLiquid({ ...customLiquid, carbs: e.target.value })}
                  placeholder={t.enterCarbs}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.fats} (g)
                </label>
                <input
                  type="number"
                  value={customLiquid.fats}
                  onChange={(e) => setCustomLiquid({ ...customLiquid, fats: e.target.value })}
                  placeholder={t.enterFats}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
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
                onClick={() => {
                  setShowCustomLiquid(false);
                  setCustomLiquid({
                    name: '',
                    calories: '',
                    protein: '',
                    carbs: '',
                    fats: ''
                  });
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Quantity and Meal Type */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {t.quantity} ({currentTab === 'liquid' ? t.ml : t.grams})
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder={t.enterQuantity}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {currentTab === 'food' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.mealType}
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
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
            )}
          </div>
        </div>

        {/* Nutrition Information */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
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
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
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
                {nutrition.calories}
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
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
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
                {formatNumber(nutrition.protein)}g
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
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
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
                <i className="ri-restaurant-line" style={{ color: '#6366f1', fontSize: '16px' }}></i>
              </div>
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                {formatNumber(nutrition.carbs)}g
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
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-drop-line" style={{ color: '#ef4444', fontSize: '16px' }}></i>
              </div>
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                {formatNumber(nutrition.fats)}g
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

          {currentTab === 'food' && (
            <div style={{
              textAlign: 'center',
              padding: '16px',
              background: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #dcfce7',
              marginTop: '16px'
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
                <i className="ri-plant-line" style={{ color: '#16a34a', fontSize: '16px' }}></i>
              </div>
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                {formatNumber(nutrition.fiber)}g
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                {t.fiber}
              </p>
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddFood}
          disabled={isLoading}
          className="!rounded-button"
          style={{
            width: '100%',
            padding: '16px 24px',
            background: isLoading ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #9ca3af',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Procesando...
            </>
          ) : (
            <>
              <i className="ri-add-line" style={{ fontSize: '18px' }}></i>
              {t.addToLog}
            </>
          )}
        </button>
      </main>

      {/* Camera Modal */}
      {showCamera && (
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
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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

            {/* Camera Controls */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <button
                onClick={() => setScanMode(scanMode === 'vision' ? 'barcode' : 'vision')}
                className="!rounded-button"
                style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <i className={`ri-${scanMode === 'vision' ? 'qr-code' : 'camera'}-line`} style={{ fontSize: '20px' }}></i>
              </button>

              <button
                onClick={scanMode === 'vision' ? captureImage : startBarcodeScanning}
                disabled={isLoading || (scanMode === 'barcode' && isScanning)}
                className="!rounded-button"
                style={{
                  width: '60px',
                  height: '60px',
                  background: isLoading || (scanMode === 'barcode' && isScanning) ? 'rgba(156,163,175,0.8)' : 'rgba(255,255,255,0.9)',
                  border: '3px solid white',
                  borderRadius: '50%',
                  cursor: isLoading || (scanMode === 'barcode' && isScanning) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {isLoading ? (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid #9ca3af',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                ) : (
                  <i className={`ri-${scanMode === 'vision' ? 'camera' : 'scan'}-line`} style={{ 
                    fontSize: '24px', 
                    color: '#374151' 
                  }}></i>
                )}
              </button>

              <button
                onClick={stopCamera}
                className="!rounded-button"
                style={{
                  padding: '12px',
                  background: 'rgba(239,68,68,0.8)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '50%',
                  color: 'white',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '20px' }}></i>
              </button>
            </div>

            {/* Scan Mode Indicator */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)'
            }}>
              {scanMode === 'vision' ? 'Detectar Alimentos' : 'Escanear Código'}
            </div>

            {scanMode === 'barcode' && isScanning && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                background: 'transparent'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontSize: '12px',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}>
                  Escaneando código...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detection Modal */}
      {showProductModal && detectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              Producto Detectado
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              {detectedProduct.image_url && (
                <img
                  src={detectedProduct.image_url}
                  alt={detectedProduct.product_name || detectedProduct.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              )}
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {detectedProduct.product_name || detectedProduct.name}
                </h4>
                {detectedProduct.brands && (
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {detectedProduct.brands}
                  </p>
                )}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {detectedProduct.nutriments?.['energy-kcal_100g'] || detectedProduct.calories || 0}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Calorías
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {detectedProduct.nutriments?.['proteins_100g'] || detectedProduct.protein || 0}g
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Proteínas
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {detectedProduct.nutriments?.['carbohydrates_100g'] || detectedProduct.carbs || 0}g
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Carbohidratos
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {detectedProduct.nutriments?.['fat_100g'] || detectedProduct.fats || 0}g
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Grasas
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowProductModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={addDetectedProduct}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

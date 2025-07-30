
// Google Vision API Configuration - VERSIÓN ULTRA AVANZADA
export const VISION_API_KEY = "AIzaSyBhYkIRJN8BX450AX8YZEg_drHlfWYf8No";

// Verificar que la configuración esté presente
if (!VISION_API_KEY || VISION_API_KEY.includes("TU_API_KEY")) {
  console.warn('⚠️  Google Vision API Key no está configurado. Agrega tu API Key a las variables de entorno.');
}

// Configuración de seguridad y rendimiento ultra optimizada
const RATE_LIMIT = {
  maxRequests: 300, // Incrementado para máxima funcionalidad
  timeWindow: 60 * 60 * 1000, // 1 hora
  requests: [] as number[]
};

// Cache inteligente multinivel para detecciones previas
const DETECTION_CACHE = new Map<string, any>();
const CACHE_DURATION = 8 * 60 * 1000; // 8 minutos para mejor rendimiento
const NUTRITIONAL_CACHE = new Map<string, any>();

// FUNCIONES DE SEGURIDAD Y CACHE MEJORADAS
function checkRateLimit(): boolean {
  try {
    const now = Date.now();
    // Limpiar requests antiguos
    RATE_LIMIT.requests = RATE_LIMIT.requests.filter(time => now - time < RATE_LIMIT.timeWindow);

    if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
      console.warn('Rate limit alcanzado, esperando...');
      return false;
    }

    RATE_LIMIT.requests.push(now);
    return true;
  } catch (error) {
    console.warn('Error verificando rate limit:', error);
    return true; // Permitir en caso de error para no bloquear la app
  }
}

function getCacheKey(base64Image: string): string {
  try {
    // Crear hash simple y rápido de la imagen
    let hash = 0;
    const str = base64Image.substring(0, 1000); // Usar solo los primeros 1000 caracteres
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.warn('Error creando cache key:', error);
    return Date.now().toString();
  }
}

function getCachedResult(cacheKey: string): any | null {
  try {
    const cached = DETECTION_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  } catch (error) {
    console.warn('Error obteniendo cache:', error);
    return null;
  }
}

function setCachedResult(cacheKey: string, data: any): void {
  try {
    DETECTION_CACHE.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Limpiar cache antiguo si es muy grande
    if (DETECTION_CACHE.size > 50) {
      const entries = Array.from(DETECTION_CACHE.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 10; i++) {
        DETECTION_CACHE.delete(entries[i][0]);
      }
    }
  } catch (error) {
    console.warn('Error guardando en cache:', error);
  }
}

function calculateAdvancedSimilarity(str1: string, str2: string): number {
  try {
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  } catch (error) {
    console.warn('Error calculando similitud:', error);
    return 0;
  }
}

function levenshteinDistance(str1: string, str2: string): number {
  try {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  } catch (error) {
    console.warn('Error calculando distancia Levenshtein:', error);
    return Math.max(str1.length, str2.length);
  }
}

// FUNCIÓN SEGURA PARA PRE-PROCESAR IMAGEN
async function preprocessImageAdvanced(imageFile: File): Promise<File> {
  try {
    // Si el archivo es pequeño y en formato correcto, devolverlo sin cambios
    if (imageFile.size < 2 * 1024 * 1024 && imageFile.type === 'image/jpeg') {
      return imageFile;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(imageFile); // Fallback al archivo original
        return;
      }

      img.onload = () => {
        try {
          // Calcular dimensiones optimizadas
          const maxSize = 1280;
          let { width, height } = img;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Aplicar mejoras de imagen
          ctx.filter = 'contrast(1.1) brightness(1.02) saturate(1.05)';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob], 'processed-food-image.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(processedFile);
            } else {
              resolve(imageFile); // Fallback
            }
          }, 'image/jpeg', 0.85);
        } catch (error) {
          console.warn('Error procesando imagen:', error);
          resolve(imageFile); // Fallback
        }
      };

      img.onerror = () => {
        console.warn('Error cargando imagen para procesamiento');
        resolve(imageFile); // Fallback
      };

      // Timeout para evitar bloqueos
      setTimeout(() => {
        console.warn('Timeout procesando imagen');
        resolve(imageFile); // Fallback
      }, 5000);

      img.src = URL.createObjectURL(imageFile);

    });
  } catch (error) {
    console.warn('Error en preprocessImageAdvanced:', error);
    return imageFile; // Fallback seguro
  }
}

// FUNCIÓN SEGURA PARA BUSCAR ALIMENTOS
function findBestFoodMatch(query: string): any | null {
  try {
    if (!query || query.length < 2) return null;

    const queryLower = query.toLowerCase().trim();
    let bestMatch: any = null;
    let bestScore = 0;

    // Buscar en base de datos de alimentos
    for (const [key, food] of Object.entries(enhancedFoodDatabase)) {
      try {
        // Verificar nombres exactos primero
        const exactMatch = food.names.some((name: string) =>
          name.toLowerCase() === queryLower
        );

        if (exactMatch) {
          return {
            ...food.data,
            confidence: food.confidence || 0.9,
            source: 'exact_match'
          };
        }

        // Buscar coincidencias parciales
        const partialMatches = food.names.filter((name: string) =>
          name.toLowerCase().includes(queryLower) ||
          queryLower.includes(name.toLowerCase())
        );

        if (partialMatches.length > 0) {
          const score = food.confidence || 0.8;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = {
              ...food.data,
              confidence: score * 0.9,
              source: 'partial_match'
            };
          }
        }

        // Buscar similitudes por algoritmo
        for (const name of food.names) {
          const similarity = calculateAdvancedSimilarity(queryLower, name.toLowerCase());
          if (similarity > 0.8) {
            const score = similarity * (food.confidence || 0.7);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = {
                ...food.data,
                confidence: score,
                source: 'similarity_match'
              };
            }
          }
        }
      } catch (error) {
        console.warn(`Error procesando alimento ${key}:`, error);
        continue;
      }
    }

    return bestMatch;
  } catch (error) {
    console.warn('Error en findBestFoodMatch:', error);
    return null;
  }
}

// Base de datos SÚPER expandida de alimentos con categorización avanzada
const enhancedFoodDatabase = {
  // === FRUTAS COMPLETAS ===
  'apple': {
    names: ['apple', 'manzana', 'mela', 'pomme', 'apfel', 'red apple', 'green apple'],
    category: 'fruta',
    confidence: 0.96,
    seasonality: ['autumn', 'winter'],
    data: { name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, sugar: 10.4, vitamin_c: 4.6 }
  },
  'banana': {
    names: ['banana', 'plátano', 'banano', 'cambur', 'guineo', 'yellow banana'],
    category: 'fruta',
    confidence: 0.98,
    seasonality: ['all_year'],
    data: { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, sugar: 12.2, potassium: 358 }
  },
  'orange': {
    names: ['orange', 'naranja', 'arance', 'laranja', 'citrus'],
    category: 'fruta',
    confidence: 0.96,
    seasonality: ['winter', 'spring'],
    data: { name: 'Naranja', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4, vitamin_c: 53.2 }
  },
  'avocado': {
    names: ['avocado', 'aguacate', 'palta'],
    category: 'fruta',
    confidence: 0.94,
    seasonality: ['spring', 'summer'],
    data: { name: 'Aguacate', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, potassium: 485 }
  },
  'strawberry': {
    names: ['strawberry', 'fresa', 'fragola', 'fraise'],
    category: 'fruta',
    confidence: 0.93,
    seasonality: ['spring', 'summer'],
    data: { name: 'Fresa', calories: 32, protein: 0.7, carbs: 8, fats: 0.3, fiber: 2, vitamin_c: 58.8 }
  },
  'grape': {
    names: ['grape', 'uva', 'grapes', 'bunch of grapes'],
    category: 'fruta',
    confidence: 0.91,
    seasonality: ['autumn'],
    data: { name: 'Uvas', calories: 69, protein: 0.7, carbs: 18, fats: 0.2, fiber: 0.9, antioxidants: 'high' }
  },
  'pineapple': {
    names: ['pineapple', 'piña', 'ananas'],
    category: 'fruta',
    confidence: 0.95,
    seasonality: ['summer'],
    data: { name: 'Piña', calories: 50, protein: 0.5, carbs: 13, fats: 0.1, fiber: 1.4, vitamin_c: 47.8 }
  },

  // === VERDURAS EXPANDIDAS ===
  'broccoli': {
    names: ['broccoli', 'brócoli', 'brocoli'],
    category: 'verdura',
    confidence: 0.97,
    seasonality: ['winter', 'spring'],
    data: { name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, vitamin_k: 101.6 }
  },
  'carrot': {
    names: ['carrot', 'zanahoria', 'cenoura', 'carrots'],
    category: 'verdura',
    confidence: 0.95,
    seasonality: ['autumn', 'winter'],
    data: { name: 'Zanahoria', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8, beta_carotene: 8285 }
  },
  'spinach': {
    names: ['spinach', 'espinaca', 'espinafre'],
    category: 'verdura',
    confidence: 0.92,
    seasonality: ['spring', 'autumn'],
    data: { name: 'Espinaca', calories: 23, protein: 2.9, carbs: 4, fats: 0.4, fiber: 2.2, iron: 2.7 }
  },
  'tomato': {
    names: ['tomato', 'tomate', 'pomodoro', 'red tomato'],
    category: 'verdura',
    confidence: 0.94,
    seasonality: ['summer'],
    data: { name: 'Tomate', calories: 18, protein: 0.9, carbs: 4, fats: 0.2, fiber: 1.2, lycopene: 'high' }
  },
  'cucumber': {
    names: ['cucumber', 'pepino', 'cetriolo'],
    category: 'verdura',
    confidence: 0.89,
    seasonality: ['summer'],
    data: { name: 'Pepino', calories: 16, protein: 0.7, carbs: 4, fats: 0.1, fiber: 0.5, water_content: 95 }
  },
  'lettuce': {
    names: ['lettuce', 'lechuga', 'lattuga', 'salad'],
    category: 'verdura',
    confidence: 0.87,
    seasonality: ['spring', 'summer'],
    data: { name: 'Lechuga', calories: 15, protein: 1.4, carbs: 3, fats: 0.2, fiber: 1.3, folate: 38 }
  },

  // === PROTEÍNAS COMPLETAS ===
  'chicken': {
    names: ['chicken', 'pollo', 'frango', 'chicken breast', 'pechuga', 'grilled chicken'],
    category: 'proteina',
    confidence: 0.92,
    cooking_methods: ['grilled', 'baked', 'fried'],
    data: { name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, selenium: 22.5 }
  },
  'salmon': {
    names: ['salmon', 'salmón', 'salmao', 'grilled salmon'],
    category: 'proteina',
    confidence: 0.90,
    cooking_methods: ['grilled', 'baked', 'raw'],
    data: { name: 'Salmón', calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0, omega3: 'high' }
  },
  'egg': {
    names: ['egg', 'huevo', 'ovo', 'eggs', 'boiled egg', 'fried egg'],
    category: 'proteina',
    confidence: 0.95,
    cooking_methods: ['boiled', 'fried', 'scrambled'],
    data: { name: 'Huevo', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, choline: 147 }
  },
  'beef': {
    names: ['beef', 'carne', 'steak', 'meat'],
    category: 'proteina',
    confidence: 0.88,
    cooking_methods: ['grilled', 'roasted', 'fried'],
    data: { name: 'Carne de res', calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0, iron: 2.6 }
  },
  'tuna': {
    names: ['tuna', 'atún', 'tonno'],
    category: 'proteina',
    confidence: 0.91,
    cooking_methods: ['grilled', 'canned', 'raw'],
    data: { name: 'Atún', calories: 144, protein: 30, carbs: 0, fats: 1, fiber: 0, omega3: 'high' }
  },

  // === CARBOHIDRATOS AVANZADOS ===
  'rice': {
    names: ['rice', 'arroz', 'riz', 'white rice', 'brown rice'],
    category: 'carbohidrato',
    confidence: 0.87,
    cooking_methods: ['boiled', 'steamed'],
    data: { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, thiamine: 0.07 }
  },
  'bread': {
    names: ['bread', 'pan', 'pao', 'brot', 'slice of bread'],
    category: 'carbohidrato',
    confidence: 0.84,
    varieties: ['white', 'whole_wheat', 'sourdough'],
    data: { name: 'Pan', calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7, folate: 43 }
  },
  'pasta': {
    names: ['pasta', 'spaghetti', 'noodles', 'fideos', 'macarrones'],
    category: 'carbohidrato',
    confidence: 0.82,
    varieties: ['white', 'whole_wheat', 'gluten_free'],
    data: { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8, manganese: 0.9 }
  },
  'potato': {
    names: ['potato', 'papa', 'patata', 'baked potato'],
    category: 'carbohidrato',
    confidence: 0.93,
    cooking_methods: ['baked', 'boiled', 'fried'],
    data: { name: 'Papa', calories: 77, protein: 2, carbs: 17, fats: 0.1, fiber: 2.2, potassium: 425 }
  },
  'quinoa': {
    names: ['quinoa', 'quinua'],
    category: 'carbohidrato',
    confidence: 0.79,
    cooking_methods: ['boiled'],
    data: { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fats: 1.9, fiber: 2.8, complete_protein: true }
  },

  // === LÁCTEOS EXPANDIDOS ===
  'milk': {
    names: ['milk', 'leche', 'leite', 'lait', 'glass of milk'],
    category: 'lacteo',
    confidence: 0.77,
    varieties: ['whole', 'skim', 'almond', 'oat'],
    data: { name: 'Leche entera', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0, calcium: 113 }
  },
  'cheese': {
    names: ['cheese', 'queso', 'queijo', 'fromage'],
    category: 'lacteo',
    confidence: 0.80,
    varieties: ['cheddar', 'mozzarella', 'parmesan'],
    data: { name: 'Queso', calories: 113, protein: 7, carbs: 1, fats: 9, fiber: 0, calcium: 200 }
  },
  'yogurt': {
    names: ['yogurt', 'yogur', 'iogurte'],
    category: 'lacteo',
    confidence: 0.83,
    varieties: ['greek', 'regular', 'low_fat'],
    data: { name: 'Yogur', calories: 85, protein: 8, carbs: 12, fats: 2.5, fiber: 0, probiotics: 'high' }
  },

  // === SNACKS Y PROCESADOS ===
  'pizza': {
    names: ['pizza', 'pizzas', 'slice of pizza'],
    category: 'comida_procesada',
    confidence: 0.87,
    varieties: ['margherita', 'pepperoni', 'vegetarian'],
    data: { name: 'Pizza', calories: 266, protein: 11, carbs: 33, fats: 10, fiber: 2, sodium: 598 }
  },
  'burger': {
    names: ['burger', 'hamburguesa', 'hamburguer', 'hamburger'],
    category: 'comida_procesada',
    confidence: 0.85,
    varieties: ['beef', 'chicken', 'veggie'],
    data: { name: 'Hamburguesa', calories: 295, protein: 17, carbs: 31, fats: 14, fiber: 2, sodium: 497 }
  },
  'french_fries': {
    names: ['french fries', 'papas fritas', 'fries'],
    category: 'comida_procesada',
    confidence: 0.91,
    cooking_methods: ['fried', 'baked'],
    data: { name: 'Papas fritas', calories: 365, protein: 4, carbs: 63, fats: 17, fiber: 4, sodium: 246 }
  },

  // === BEBIDAS ===
  'coffee': {
    names: ['coffee', 'café', 'cappuccino', 'espresso'],
    category: 'bebida',
    confidence: 0.89,
    varieties: ['black', 'with_milk', 'with_sugar'],
    data: { name: 'Café', calories: 2, protein: 0.3, carbs: 0, fats: 0, fiber: 0, caffeine: 95 }
  },
  'orange_juice': {
    names: ['orange juice', 'jugo de naranja', 'fresh juice'],
    category: 'bebida',
    confidence: 0.86,
    varieties: ['fresh', 'concentrated', 'with_pulp'],
    data: { name: 'Jugo de naranja', calories: 45, protein: 0.7, carbs: 10, fats: 0.2, fiber: 0.2, vitamin_c: 50 }
  },

  // === NUECES Y FRUTOS SECOS ===
  'almonds': {
    names: ['almonds', 'almendras', 'mandorle'],
    category: 'fruto_seco',
    confidence: 0.88,
    data: { name: 'Almendras', calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12, vitamin_e: 25.6 }
  },
  'walnuts': {
    names: ['walnuts', 'nueces', 'noci'],
    category: 'fruto_seco',
    confidence: 0.85,
    data: { name: 'Nueces', calories: 654, protein: 15, carbs: 14, fats: 65, fiber: 7, omega3: 'high' }
  }
};

// Sistema ULTRA avanzado de detección con IA - CON MANEJO SEGURO DE ERRORES
class UltraEnhancedFoodDetector {
  private confidenceThreshold = 0.65;
  private detectionHistory: string[] = [];
  private contextAnalysis: Map<string, number> = new Map();
  private nutritionalPatterns: Map<string, any> = new Map();
  private seasonalityBoost = 0.05;

  // Análisis de contexto SÚPER avanzado CON MANEJO DE ERRORES
  analyzeImageContext(labels: any[], objects: any[], textAnnotations: any[]): string {
    try {
      const contextClues = [];

      // Contexto de cocina/comida EXPANDIDO con validación
      const kitchenKeywords = ['plate', 'bowl', 'table', 'kitchen', 'dining', 'restaurant', 'fork', 'knife', 'spoon', 'cutting board', 'pan', 'oven'];

      const hasKitchenContext = Array.isArray(labels) && labels.some((label: any) =>
        label && label.description && typeof label.description === 'string' &&
        kitchenKeywords.some(keyword =>
          label.description.toLowerCase().includes(keyword)
        )
      );

      if (hasKitchenContext) {
        contextClues.push('kitchen_context');
      }

      // Análizar hora del día para contexto de comidas
      try {
        const currentHour = new Date().getHours();
        if (currentHour >= 6 && currentHour < 11) {
          contextClues.push('breakfast_time');
        } else if (currentHour >= 11 && currentHour < 15) {
          contextClues.push('lunch_time');
        } else if (currentHour >= 17 && currentHour < 22) {
          contextClues.push('dinner_time');
        }
      } catch (timeError) {
        console.warn('Error analizando hora:', timeError);
      }

      // Analizar colores para determinar tipo de alimento
      try {
        const colorAnalysis = this.analyzeColors(labels);
        if (colorAnalysis) {
          contextClues.push(colorAnalysis);
        }
      } catch (colorError) {
        console.warn('Error analizando colores:', colorError);
      }

      // Análisis de texto para ingredientes
      try {
        const textAnalysis = this.analyzeTextForIngredients(textAnnotations);
        if (textAnalysis) {
          contextClues.push(textAnalysis);
        }
      } catch (textError) {
        console.warn('Error analizando texto:', textError);
      }

      return contextClues.join(',');
    } catch (error) {
      console.warn('Error en analyzeImageContext:', error);
      return 'default_context';
    }
  }

  private analyzeColors(labels: any[]): string {
    try {
      if (!Array.isArray(labels)) return 'color_mixed';

      const colorKeywords = {
        red: ['red', 'rojo', 'tomato', 'apple', 'strawberry'],
        green: ['green', 'verde', 'broccoli', 'spinach', 'lettuce'],
        yellow: ['yellow', 'amarillo', 'banana', 'corn'],
        orange: ['orange', 'naranja', 'carrot', 'pumpkin'],
        brown: ['brown', 'marrón', 'bread', 'meat', 'coffee']
      };

      for (const [color, keywords] of Object.entries(colorKeywords)) {
        const hasColor = labels.some((label: any) =>
          label && label.description && typeof label.description === 'string' &&
          keywords.some(keyword =>
            label.description.toLowerCase().includes(keyword)
          )
        );
        if (hasColor) return `color_${color}`;
      }
      return 'color_mixed';
    } catch (error) {
      console.warn('Error en analyzeColors:', error);
      return 'color_mixed';
    }
  }

  private analyzeTextForIngredients(textAnnotations: any[]): string | null {
    try {
      if (!Array.isArray(textAnnotations) || textAnnotations.length === 0) return null;

      const firstAnnotation = textAnnotations[0];
      if (!firstAnnotation || !firstAnnotation.description) return null;

      const text = firstAnnotation.description.toLowerCase() || '';

      const ingredientKeywords = ['ingredients', 'ingredientes', 'contains', 'contiene', 'nutrition', 'nutrición'];

      if (ingredientKeywords.some(keyword => text.includes(keyword))) {
        return 'ingredient_text_detected';
      }
      return null;
    } catch (error) {
      console.warn('Error en analyzeTextForIngredients:', error);
      return null;
    }
  }

  // Verificar temporada actual para boost CON MANEJO DE ERRORES
  private getSeasonalBoost(food: any): number {
    try {
      if (!food || !food.seasonality || !Array.isArray(food.seasonality)) return 1;

      const currentMonth = new Date().getMonth();
      const seasons = {
        winter: [11, 0, 1, 2],
        spring: [2, 3, 4, 5],
        summer: [5, 6, 7, 8],
        autumn: [8, 9, 10, 11]
      };

      for (const [season, months] of Object.entries(seasons)) {
        if (food.seasonality.includes(season) && Array.isArray(months) && months.includes(currentMonth)) {
          return 1 + this.seasonalityBoost;
        }
      }
      return 1;
    } catch (error) {
      console.warn('Error en getSeasonalBoost:', error);
      return 1;
    }
  }

  // Mejorar detección con SÚPER contexto CON MANEJO SEGURO
  enhanceDetectionWithContext(detections: any[], context: string): any[] {
    try {
      if (!Array.isArray(detections)) {
        console.warn('Detections no es un array:', detections);
        return [];
      }

      const enhanced = detections.map(detection => {
        try {
          let confidence = detection.confidence || 0.5;

          // Múltiples boosts contextuales con validación
          if (typeof context === 'string') {
            if (context.includes('kitchen_context')) confidence *= 1.3;
            if (context.includes('ingredient_text_detected')) confidence *= 1.4;

            // Boost por tiempo de comida
            if (context.includes('breakfast_time') && this.isBreakfastFood(detection.name)) confidence *= 1.2;
            if (context.includes('lunch_time') && this.isLunchFood(detection.name)) confidence *= 1.2;
            if (context.includes('dinner_time') && this.isDinnerFood(detection.name)) confidence *= 1.2;

            // Boost por colores
            if (context.includes('color_')) {
              const colorBoost = this.getColorBoost(detection.name, context);
              confidence *= colorBoost;
            }
          }

          // Boost temporal con validación
          try {
            const foodData = Object.values(enhancedFoodDatabase).find(food =>
              food && food.names && Array.isArray(food.names) &&
              food.names.some(name =>
                typeof name === 'string' && detection.name &&
                name.toLowerCase().includes(detection.name.toLowerCase())
              )
            );
            if (foodData) {
              confidence *= this.getSeasonalBoost(foodData);
            }
          } catch (boostError) {
            console.warn('Error aplicando boost temporal:', boostError);
          }

          return {
            ...detection,
            confidence: Math.min(confidence, 0.99)
          };
        } catch (detectionError) {
          console.warn('Error procesando detección individual:', detectionError);
          return detection; // Devolver original en caso de error
        }
      });

      return enhanced.filter(detection => {
        try {
          return detection && detection.confidence > this.confidenceThreshold;
        } catch (filterError) {
          console.warn('Error filtrando detección:', filterError);
          return false;
        }
      });
    } catch (error) {
      console.warn('Error en enhanceDetectionWithContext:', error);
      return Array.isArray(detections) ? detections : [];
    }
  }

  private isBreakfastFood(name: string): boolean {
    try {
      if (!name || typeof name !== 'string') return false;
      const breakfastFoods = ['egg', 'huevo', 'cereal', 'bread', 'pan', 'coffee', 'café', 'milk', 'leche', 'banana'];
      return breakfastFoods.some(food => name.toLowerCase().includes(food));
    } catch (error) {
      console.warn('Error en isBreakfastFood:', error);
      return false;
    }
  }

  private isLunchFood(name: string): boolean {
    try {
      if (!name || typeof name !== 'string') return false;
      const lunchFoods = ['chicken', 'pollo', 'rice', 'arroz', 'salad', 'ensalada', 'sandwich'];
      return lunchFoods.some(food => name.toLowerCase().includes(food));
    } catch (error) {
      console.warn('Error en isLunchFood:', error);
      return false;
    }
  }

  private isDinnerFood(name: string): boolean {
    try {
      if (!name || typeof name !== 'string') return false;
      const dinnerFoods = ['salmon', 'salmón', 'beef', 'carne', 'pasta', 'vegetables', 'verduras'];
      return dinnerFoods.some(food => name.toLowerCase().includes(food));
    } catch (error) {
      console.warn('Error en isDinnerFood:', error);
      return false;
    }
  }

  private getColorBoost(name: string, context: string): number {
    try {
      if (!name || typeof name !== 'string' || !context || typeof context !== 'string') return 1;

      const colorMappings = {
        'color_red': ['tomato', 'apple', 'strawberry', 'meat', 'beef'],
        'color_green': ['broccoli', 'spinach', 'lettuce', 'cucumber'],
        'color_yellow': ['banana', 'corn', 'cheese'],
        'color_orange': ['carrot', 'orange', 'pumpkin'],
        'color_brown': ['bread', 'coffee', 'chocolate', 'meat']
      };

      for (const [color, foods] of Object.entries(colorMappings)) {
        if (context.includes(color) && Array.isArray(foods) && foods.some(food => name.toLowerCase().includes(food))) {
          return 1.15;
        }
      }
      return 1;
    } catch (error) {
      console.warn('Error en getColorBoost:', error);
      return 1;
    }
  }

  // Actualizar historial con análisis nutricional SEGURO
  updateDetectionHistory(detections: any[]): void {
    try {
      if (!Array.isArray(detections)) return;

      detections.forEach(detection => {
        try {
          if (detection && detection.name && typeof detection.name === 'string') {
            if (!this.detectionHistory.includes(detection.name)) {
              this.detectionHistory.push(detection.name);

              // Guardar patrones nutricionales
              if (detection.calories && typeof detection.calories === 'number') {
                this.nutritionalPatterns.set(detection.name, {
                  calories: detection.calories,
                  protein: detection.protein || 0,
                  carbs: detection.carbs || 0,
                  fats: detection.fats || 0,
                  category: detection.category || 'unknown'
                });
              }
            }
          }
        } catch (detectionError) {
          console.warn('Error procesando detección en historial:', detectionError);
        }
      });

      // Mantener historial más extenso con límite seguro
      if (this.detectionHistory.length > 50) {
        this.detectionHistory = this.detectionHistory.slice(-50);
      }
    } catch (error) {
      console.warn('Error en updateDetectionHistory:', error);
    }
  }

  // Obtener sugerencias nutricionales basadas en historial SEGURAS
  getNutritionalSuggestions(): any[] {
    try {
      const recentDetections = Array.from(this.nutritionalPatterns.entries()).slice(-10);
      const suggestions = [];

      // Analizar balance nutricional
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;

      recentDetections.forEach(([name, nutrition]) => {
        try {
          if (nutrition && typeof nutrition === 'object') {
            totalCalories += nutrition.calories || 0;
            totalProtein += nutrition.protein || 0;
            totalCarbs += nutrition.carbs || 0;
          }
        } catch (nutritionError) {
          console.warn('Error procesando nutrición:', nutritionError);
        }
      });

      // Sugerir alimentos complementarios
      if (totalProtein < 50) {
        suggestions.push('Considera agregar más proteínas como pollo o huevos');
      }
      if (totalCarbs < 100) {
        suggestions.push('Podrías incluir más carbohidratos como arroz o pasta');
      }

      return suggestions;
    } catch (error) {
      console.warn('Error en getNutritionalSuggestions:', error);
      return [];
    }
  }
}

const ultraFoodDetector = new UltraEnhancedFoodDetector();

// NUEVA función para capturar imagen desde video CON MANEJO SEGURO
export async function captureImageFromVideo(videoElement: HTMLVideoElement): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      if (!videoElement) {
        reject(new Error('Elemento de video no válido'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo crear contexto de canvas'));
        return;
      }

      // Configurar dimensiones del canvas
      canvas.width = videoElement.videoWidth || 1920;
      canvas.height = videoElement.videoHeight || 1080;

      // Capturar frame actual del video
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convertir a blob y luego a File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `food-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(file);
        } else {
          reject(new Error('Error capturando imagen del video'));
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      reject(error);
    }
  });
}

// Función PRINCIPAL ULTRA MEJORADA para detectar alimentos CON MANEJO COMPLETO DE ERRORES
export async function detectFoodInImage(imageFile: File): Promise<any[]> {
  try {
    console.log(' Iniciando detección de alimentos...');

    // Validación inicial robusta
    if (!imageFile || !(imageFile instanceof File)) {
      console.warn('Archivo de imagen inválido');
      return getErrorFallbackSuggestions(new Error('Archivo inválido'));
    }

    // Verificar cache primero
    let base64Image: string;
    let cacheKey: string;
    try {
      base64Image = await fileToBase64(imageFile);
      cacheKey = getCacheKey(base64Image);
      const cachedResult = getCachedResult(cacheKey);

      if (cachedResult && Array.isArray(cachedResult)) {
        console.log(' Usando resultado de cache');
        return cachedResult;
      }
    } catch (cacheError) {
      console.warn('Error con cache, continuando sin cache:', cacheError);
    }

    // Validaciones de seguridad
    if (!checkRateLimit()) {
      console.warn('Rate limit alcanzado');
      return getIntelligentSuggestions();
    }

    if (!validateOrigin()) {
      console.warn('Origen no autorizado, continuando con modo limitado');
      return getIntelligentSuggestions();
    }

    // Validar archivo
    if (imageFile.size > 8 * 1024 * 1024) {
      console.warn('Archivo demasiado grande');
      return getErrorFallbackSuggestions(new Error('Archivo demasiado grande (máximo 8MB)'));
    }

    if (!imageFile.type.startsWith('image/')) {
      console.warn('Tipo de archivo no válido');
      return getErrorFallbackSuggestions(new Error('Tipo de archivo no válido'));
    }

    // Pre-procesar imagen con filtros ULTRA avanzados
    let processedImage: File;
    let processedBase64: string;
    try {
      processedImage = await preprocessImageAdvanced(imageFile);
      processedBase64 = await fileToBase64(processedImage);
    } catch (processError) {
      console.warn('Error procesando imagen, usando original:', processError);
      processedImage = imageFile;
      processedBase64 = base64Image!;
    }

    // Preparar solicitud SÚPER avanzada a Google Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: processedBase64
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 20
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 15
            },
            {
              type: 'TEXT_DETECTION',
              maxResults: 10
            },
            {
              type: 'WEB_DETECTION',
              maxResults: 12
            },
            {
              type: 'SAFE_SEARCH_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    };

    // Realizar solicitud con timeout ultra mejorado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let response: Response;
    try {
      response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error de conexión con Vision API:', fetchError);
      return getErrorFallbackSuggestions(fetchError);
    }

    if (!response.ok) {
      console.error('Error de API:', response.status, response.statusText);
      return getErrorFallbackSuggestions(new Error(`API Error: ${response.status} - ${response.statusText}`));
    }

    const data = await response.json();

    if (data.responses && Array.isArray(data.responses) && data.responses[0]) {
      const apiResponse = data.responses[0];

      // Verificar si hay errores en la respuesta
      if (apiResponse.error) {
        console.error('Vision API Error:', apiResponse.error);
        return getErrorFallbackSuggestions(new Error(`Vision API Error: ${apiResponse.error.message}`));
      }

      const labels = Array.isArray(apiResponse.labelAnnotations) ? apiResponse.labelAnnotations : [];
      const objects = Array.isArray(apiResponse.localizedObjectAnnotations) ? apiResponse.localizedObjectAnnotations : [];
      const textAnnotations = Array.isArray(apiResponse.textAnnotations) ? apiResponse.textAnnotations : [];
      const webDetection = apiResponse.webDetection || {};

      console.log(' Análisis completo:', {
        labels: labels.length,
        objects: objects.length,
        textDetections: textAnnotations.length,
        webEntities: webDetection.webEntities?.length || 0
      });

      // Analizar contexto SÚPER avanzado
      const context = ultraFoodDetector.analyzeImageContext(labels, objects, textAnnotations);
      console.log(' Contexto detectado:', context);

      // Combinar TODAS las detecciones
      let allDetections = [...labels, ...objects];

      // Procesar texto detectado MEJORADO
      if (textAnnotations.length > 0) {
        try {
          const detectedText = textAnnotations[0].description || '';

          const textWords = detectedText.toLowerCase().split(/\s+/);

          console.log(' Texto detectado:', detectedText);

          textWords.forEach((word: string) => {
            try {
              if (word && word.length > 3) {
                const foodMatch = findBestFoodMatch(word);
                if (foodMatch && foodMatch.confidence > 0.75) {
                  allDetections.push({
                    description: word,
                    score: foodMatch.confidence,
                    source: 'text_detection',
                    foodData: foodMatch
                  });
                }
              }
            } catch (wordError) {
              console.warn('Error procesando palabra:', word, wordError);
            }
          });
        } catch (textProcessError) {
          console.warn('Error procesando texto:', textProcessError);
        }
      }

      // Procesar web detection con MÁXIMA inteligencia
      if (webDetection.webEntities && Array.isArray(webDetection.webEntities)) {
        console.log(' Entidades web encontradas:', webDetection.webEntities.length);

        webDetection.webEntities.forEach((entity: any) => {
          try {
            if (entity && entity.description && entity.score > 0.5) {
              const foodMatch = findBestFoodMatch(entity.description);
              if (foodMatch) {
                allDetections.push({
                  description: entity.description,
                  score: entity.score * 0.95,
                  source: 'web_detection',
                  foodData: foodMatch
                });
              }
            }
          } catch (entityError) {
            console.warn('Error procesando entidad web:', entityError);
          }
        });
      }

      // Filtrar solo elementos relacionados con comida
      const foodItems = filterFoodItemsAdvanced(allDetections);
      console.log(' Alimentos filtrados:', foodItems.length);

      // Aplicar mejoras basadas en SÚPER contexto
      const enhancedFoodItems = ultraFoodDetector.enhanceDetectionWithContext(foodItems, context);
      console.log(' Alimentos mejorados:', enhancedFoodItems.length);

      // Mapear a nuestro formato ULTRA avanzado
      const finalResults = mapToAdvancedFoodFormat(enhancedFoodItems);

      // Actualizar historial con análisis nutricional
      ultraFoodDetector.updateDetectionHistory(finalResults);

      // Obtener sugerencias nutricionales
      try {
        const nutritionalSuggestions = ultraFoodDetector.getNutritionalSuggestions();
        if (nutritionalSuggestions.length > 0) {
          console.log(' Sugerencias nutricionales:', nutritionalSuggestions);
        }
      } catch (suggestionsError) {
        console.warn('Error obteniendo sugerencias nutricionales:', suggestionsError);
      }

      // Guardar en cache de manera segura
      try {
        if (cacheKey! && Array.isArray(finalResults)) {
          setCachedResult(cacheKey!, finalResults);
        }
      } catch (cacheError) {
        console.warn('Error guardando en cache:', cacheError);
      }

      if (Array.isArray(finalResults) && finalResults.length > 0) {
        console.log(' Detección exitosa:', finalResults.length, 'alimentos encontrados');
        return finalResults;
      }
    }

    // Si no se detectó nada, devolver sugerencias SÚPER inteligentes
    console.log(' No se detectaron alimentos, devolviendo sugerencias inteligentes');
    const suggestions = getIntelligentSuggestions();
    try {
      if (cacheKey!) {
        setCachedResult(cacheKey!, suggestions);
      }
    } catch (cacheError) {
      console.warn('Error guardando sugerencias en cache:', cacheError);
    }
    return suggestions;

  } catch (error) {
    console.error(' Error crítico detecting food:', error);
    return getErrorFallbackSuggestions(error);
  }
}

// NUEVA función para detectar información nutricional en etiquetas
export async function detectNutritionalLabel(imageFile: File): Promise<any> {
  try {
    if (!imageFile || !(imageFile instanceof File)) {
      console.warn('Archivo inválido para detección de etiqueta nutricional');
      return null;
    }

    const base64Image = await fileToBase64(imageFile);

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      console.warn('Error en API para detección de etiqueta nutricional:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
      const text = data.responses[0].textAnnotations[0].description;
      return parseNutritionalLabel(text);
    }

    return null;
  } catch (error) {
    console.error('Error detecting nutritional label:', error);
    return null;
  }
}

// Función para parsear etiquetas nutricionales CON MANEJO SEGURO
function parseNutritionalLabel(text: string): any {
  try {
    if (!text || typeof text !== 'string') return null;

    const nutritionInfo: any = {
      calories: null,
      protein: null,
      carbs: null,
      fats: null,
      fiber: null,
      sugar: null,
      sodium: null,
      servingSize: null
    };

    const lines = text.split('\n');

    lines.forEach(line => {
      try {
        if (!line || typeof line !== 'string') return;

        const lowerLine = line.toLowerCase();

        // Buscar calorías
        const caloriesMatch = lowerLine.match(/calories?[\\s:]*([\\d,]+)/i);
        if (caloriesMatch) {
          nutritionInfo.calories = parseInt(caloriesMatch[1].replace(',', ''));
        }

        // Buscar proteína
        const proteinMatch = lowerLine.match(/protein[\\s:]*([\\d.]+)\\s*g/i);
        if (proteinMatch) {
          nutritionInfo.protein = parseFloat(proteinMatch[1]);
        }

        // Buscar carbohidratos
        const carbsMatch = lowerLine.match(/carbohydrat[\\w]*[\\s:]*([\\d.]+)\\s*g/i);
        if (carbsMatch) {
          nutritionInfo.carbs = parseFloat(carbsMatch[1]);
        }

        // Buscar grasas
        const fatsMatch = lowerLine.match(/fat[\\s:]*([\\d.]+)\\s*g/i);
        if (fatsMatch) {
          nutritionInfo.fats = parseFloat(fatsMatch[1]);
        }

        // Buscar fibra
        const fiberMatch = lowerLine.match(/fiber[\\s:]*([\\d.]+)\\s*g/i);
        if (fiberMatch) {
          nutritionInfo.fiber = parseFloat(fiberMatch[1]);
        }

        // Buscar tamaño de porción
        const servingMatch = lowerLine.match(/serving size[\\s:]*(.*?)(?:\\n|$)/i);
        if (servingMatch) {
          nutritionInfo.servingSize = servingMatch[1].trim();
        }
      } catch (lineError) {
        console.warn('Error procesando línea de etiqueta:', lineError);
      }
    });

    return nutritionInfo;
  } catch (error) {
    console.error('Error parseando etiqueta nutricional:', error);
    return null;
  }
}

// Función mejorada para filtrar elementos de comida CON MANEJO SEGURO
function filterFoodItemsAdvanced(items: any[]): any[] {
  try {
    if (!Array.isArray(items)) {
      console.warn('Items no es un array válido:', items);
      return [];
    }

    const enhancedFoodKeywords = [
      // Español expandido
      'comida', 'alimento', 'fruta', 'verdura', 'carne', 'pollo', 'pescado', 'pan', 'arroz', 'pasta',
      'manzana', 'plátano', 'naranja', 'tomate', 'papa', 'cebolla', 'huevo', 'leche', 'queso',
      'ensalada', 'sándwich', 'hamburguesa', 'pizza', 'sopa', 'yogur', 'galleta', 'torta', 'café',
      'aguacate', 'brócoli', 'zanahoria', 'espinaca', 'salmón', 'atún', 'quinoa', 'avena',

      // Inglés expandido
      'food', 'meal', 'fruit', 'vegetable', 'meat', 'chicken', 'fish', 'bread', 'rice', 'pasta',
      'apple', 'banana', 'orange', 'tomato', 'potato', 'onion', 'egg', 'milk', 'cheese',
      'salad', 'sandwich', 'hamburger', 'pizza', 'soup', 'yogurt', 'cookie', 'cake', 'coffee',
      'avocado', 'broccoli', 'carrot', 'spinach', 'salmon', 'tuna', 'quinoa', 'oats',

      // Categorías de cocina
      'ingredient', 'dish', 'cuisine', 'snack', 'dessert', 'beverage', 'drink', 'nutrition',
      'organic', 'fresh', 'cooked', 'raw', 'healthy', 'protein', 'vitamin', 'mineral'
    ];

    return items.filter(item => {
      try {
        if (!item) return false;

        const description = (item.description || item.name || '').toLowerCase();
        if (!description) return false;

        const hasKeyword = enhancedFoodKeywords.some(keyword =>
          description.includes(keyword) ||
          keyword.includes(description) ||
          calculateAdvancedSimilarity(description, keyword) > 0.7
        );

        const confidence = item.score || item.confidence || 0.5;
        const hasGoodConfidence = confidence > 0.4;

        // Verificar si ya tenemos datos de alimento procesados
        const hasFoodData = item.foodData !== undefined;

        return (hasKeyword && hasGoodConfidence) || hasFoodData;
      } catch (itemError) {
        console.warn('Error filtrando item:', itemError);
        return false;
      }
    }).sort((a, b) => {
      try {
        // Priorizar items con datos de alimento
        const aHasFoodData = a.foodData ? 1 : 0;
        const bHasFoodData = b.foodData ? 1 : 0;

        if (aHasFoodData !== bHasFoodData) {
          return bHasFoodData - aHasFoodData;
        }

        // Luego ordenar por confianza
        return (b.score || b.confidence || 0) - (a.score || a.confidence || 0);
      } catch (sortError) {
        console.warn('Error ordenando items:', sortError);
        return 0;
      }
    });
  } catch (error) {
    console.warn('Error en filterFoodItemsAdvanced:', error);
    return [];
  }
}

// Función mejorada para mapear a formato avanzado CON MANEJO SEGURO
function mapToAdvancedFoodFormat(items: any[]): any[] {
  try {
    if (!Array.isArray(items)) {
      console.warn('Items no es un array válido para mapeo:', items);
      return [];
    }

    const mappedFoods: any[] = [];
    const processedNames = new Set<string>();

    items.slice(0, 8).forEach(item => { // Procesar máximo 8 items
      try {
        if (!item) return;

        const description = (item.description || item.name || '').toLowerCase().trim();
        const confidence = item.score || item.confidence || 0.6;

        if (!description || processedNames.has(description)) return;
        processedNames.add(description);

        // Si ya tenemos datos de alimento procesados, usarlos
        if (item.foodData && typeof item.foodData === 'object') {
          mappedFoods.push({
            ...item.foodData,
            confidence: Math.min(confidence, 0.98),
            detected: true,
            source: item.source || 'vision_api',
            originalDescription: description
          });
          return;
        }

        // Buscar coincidencia en nuestra base de datos
        const foodMatch = findBestFoodMatch(description);

        if (foodMatch && foodMatch.confidence > 0.65) {
          mappedFoods.push({
            ...foodMatch,
            confidence: Math.min(foodMatch.confidence * confidence, 0.98),
            detected: true,
            source: 'database_match',
            originalDescription: description
          });
        } else if (confidence > 0.7) {
          // Crear entrada genérica solo para detecciones con alta confianza
          const genericFood = createAdvancedGenericFood(description, confidence);
          if (genericFood) {
            mappedFoods.push(genericFood);
          }
        }
      } catch (itemError) {
        console.warn('Error mapeando item:', itemError);
      }
    });

    // Eliminar duplicados y ordenar por confianza
    const uniqueFoods = mappedFoods
      .filter((food, index, self) => {
        try {
          return food && food.name &&
            index === self.findIndex(f =>
              f && f.name &&
              f.name.toLowerCase() === food.name.toLowerCase()
            );
        } catch (filterError) {
          console.warn('Error filtrando duplicados:', filterError);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return (b.confidence || 0) - (a.confidence || 0);
        } catch (sortError) {
          console.warn('Error ordenando por confianza:', sortError);
          return 0;
        }
      });

    return uniqueFoods.slice(0, 6); // Máximo 6 alimentos detectados
  } catch (error) {
    console.warn('Error en mapToAdvancedFoodFormat:', error);
    return [];
  }
}

// Función mejorada para crear alimento genérico CON VALIDACIÓN
function createAdvancedGenericFood(description: string, confidence: number): any | null {
  try {
    if (!description || typeof description !== 'string' || description.length < 3 || confidence < 0.6) return null;

    const name = description.charAt(0).toUpperCase() + description.slice(1);

    // Valores nutricionales más precisos por categoría
    const advancedCategoryDefaults = {
      fruta: { calories: 65, protein: 1.2, carbs: 16, fats: 0.3, fiber: 3.5 },
      verdura: { calories: 30, protein: 2.5, carbs: 6, fats: 0.2, fiber: 3 },
      proteina: { calories: 220, protein: 28, carbs: 2, fats: 12, fiber: 0 },
      carbohidrato: { calories: 160, protein: 6, carbs: 32, fats: 1.5, fiber: 3 },
      lacteo: { calories: 85, protein: 6, carbs: 6, fats: 4.5, fiber: 0 },
      procesado: { calories: 250, protein: 8, carbs: 35, fats: 10, fiber: 2 },
      bebida: { calories: 45, protein: 0.5, carbs: 11, fats: 0.1, fiber: 0 },
      default: { calories: 120, protein: 6, carbs: 18, fats: 4, fiber: 2.5 }
    };

    // Determinar categoría con mayor precisión
    let category = 'default';
    const desc = description.toLowerCase();

    if (/frut|fruit|berry|apple|banana|orange|grape/.test(desc)) category = 'fruta';
    else if (/veget|verdur|green|leaf|carrot|broccoli|spinach/.test(desc)) category = 'verdura';
    else if (/meat|carne|chicken|pollo|fish|pescado|protein|beef|pork/.test(desc)) category = 'proteina';
    else if (/bread|pan|rice|arroz|pasta|cereal|grain|oat/.test(desc)) category = 'carbohidrato';
    else if (/milk|leche|cheese|queso|yogur|dairy/.test(desc)) category = 'lacteo';
    else if (/pizza|burger|processed|packaged|snack/.test(desc)) category = 'procesado';
    else if (/juice|drink|beverage|soda|coffee|tea/.test(desc)) category = 'bebida';

    const defaults = advancedCategoryDefaults[category as keyof typeof advancedCategoryDefaults] || advancedCategoryDefaults.default;

    return {
      name,
      ...defaults,
      confidence: Math.min(confidence * 0.8, 0.85), // Penalizar un poco los genéricos
      detected: true,
      source: 'advanced_generic',
      category,
      originalDescription: description
    };
  } catch (error) {
    console.warn('Error creando alimento genérico:', error);
    return null;
  }
}

// Función mejorada para sugerencias inteligentes CON MANEJO SEGURO
function getIntelligentSuggestions(): any[] {
  try {
    const now = new Date();
    const hour = now.getHours();

    let suggestions = [];

    if (hour >= 6 && hour < 11) {
      // Desayuno mejorado
      suggestions = [
        { ...enhancedFoodDatabase['banana'].data, confidence: 0.7, source: 'morning_suggestion', detected: false },
        { ...enhancedFoodDatabase['egg'].data, confidence: 0.7, source: 'morning_suggestion', detected: false },
        { name: 'Avena con frutas', calories: 150, protein: 5, carbs: 27, fats: 3, fiber: 4, confidence: 0.65, source: 'morning_suggestion', detected: false }
      ];
    } else if (hour >= 11 && hour < 15) {
      // Almuerzo mejorado
      suggestions = [
        { ...enhancedFoodDatabase['chicken'].data, confidence: 0.7, source: 'lunch_suggestion', detected: false },
        { ...enhancedFoodDatabase['rice'].data, confidence: 0.7, source: 'lunch_suggestion', detected: false },
        { ...enhancedFoodDatabase['broccoli'].data, confidence: 0.7, source: 'lunch_suggestion', detected: false }
      ];
    } else if (hour >= 15 && hour < 19) {
      // Snack mejorado
      suggestions = [
        { ...enhancedFoodDatabase['apple'].data, confidence: 0.7, source: 'snack_suggestion', detected: false },
        { name: 'Yogur griego', calories: 100, protein: 10, carbs: 6, fats: 4, fiber: 0, confidence: 0.65, source: 'snack_suggestion', detected: false },
        { name: 'Nueces mixtas', calories: 180, protein: 6, carbs: 5, fats: 16, fiber: 3, confidence: 0.65, source: 'snack_suggestion', detected: false }
      ];
    } else {
      // Cena mejorada
      suggestions = [
        { ...enhancedFoodDatabase['salmon'].data, confidence: 0.7, source: 'dinner_suggestion', detected: false },
        { name: 'Batata asada', calories: 112, protein: 2, carbs: 26, fats: 0.1, fiber: 3.9, confidence: 0.65, source: 'dinner_suggestion', detected: false },
        { ...enhancedFoodDatabase['spinach'].data, confidence: 0.7, source: 'dinner_suggestion', detected: false }
      ];
    }

    return suggestions.filter(food => food && food.name); // Filtrar elementos válidos
  } catch (error) {
    console.warn('Error en getIntelligentSuggestions:', error);
    return [
      {
        name: 'Alimento sugerido',
        calories: 100,
        protein: 5,
        carbs: 15,
        fats: 3,
        fiber: 2,
        confidence: 0.5,
        detected: false,
        source: 'error_fallback'
      }
    ];
  }
}

// Función para sugerencias de error más útiles CON MANEJO COMPLETO
function getErrorFallbackSuggestions(error: any): any[] {
  try {
    console.log('Providing error fallback suggestions for:', error?.message || 'Unknown error');

    return [
      {
        name: 'Alimento personalizado',
        calories: 100,
        protein: 5,
        carbs: 15,
        fats: 3,
        fiber: 2,
        confidence: 0.5,
        detected: false,
        source: 'error_fallback',
        note: 'Edita los valores nutricionales según tu alimento'
      },
      {
        name: 'Fruta genérica',
        calories: 60,
        protein: 1,
        carbs: 15,
        fats: 0.3,
        fiber: 3,
        confidence: 0.5,
        detected: false,
        source: 'error_fallback'
      },
      {
        name: 'Proteína genérica',
        calories: 200,
        protein: 25,
        carbs: 0,
        fats: 10,
        fiber: 0,
        confidence: 0.5,
        detected: false,
        source: 'error_fallback'
      }
    ];
  } catch (fallbackError) {
    console.error('Error crítico en fallback suggestions:', fallbackError);
    return [{ name: 'Alimento de emergencia', calories: 100, protein: 5, carbs: 15, fats: 3, fiber: 2, confidence: 0.3, detected: false, source: 'emergency_fallback' }];
  }
}

// Función para validar origen CON MANEJO SEGURO
function validateOrigin(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const allowedOrigins = [
        'localhost',
        'readdy.ai',
        '127.0.0.1'
      ];

      const currentOrigin = window.location.hostname;
      return allowedOrigins.some(origin => currentOrigin.includes(origin));
    }
    return true;
  } catch (error) {
    console.warn('Error validando origen:', error);
    return true; // Permitir en caso de error para no bloquear la app
  }
}

// Función para convertir File a base64 CON MANEJO SEGURO
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (!file || !(file instanceof File)) {
        reject(new Error('Archivo inválido'));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        try {
          const result = reader.result as string;
          if (!result || typeof result !== 'string') {
            reject(new Error('Error leyendo archivo'));
            return;
          }
          const base64 = result.split(',')[1];
          if (!base64) {
            reject(new Error('Error extrayendo base64'));
            return;
          }
          resolve(base64);
        } catch (loadError) {
          reject(loadError);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error en FileReader'));
      };

      // Timeout para evitar bloqueos
      setTimeout(() => {
        reject(new Error('Timeout convirtiendo archivo'));
      }, 10000);

      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

// Exportar la instancia del detector para uso avanzado
export { ultraFoodDetector as advancedFoodDetector };

// NUEVAS exportaciones para funcionalidades avanzadas
export { detectNutritionalLabel };

// Limpiar cache periódicamente de manera segura
if (typeof window !== 'undefined') {
  try {
    setInterval(() => {
      try {
        const now = Date.now();
        for (const [key, value] of DETECTION_CACHE.entries()) {
          try {
            if (value && value.timestamp && now - value.timestamp > CACHE_DURATION) {
              DETECTION_CACHE.delete(key);
            }
          } catch (entryError) {
            console.warn('Error limpiando entrada de cache:', entryError);
            DETECTION_CACHE.delete(key); // Eliminar entrada problemática
          }
        }
      } catch (cleanupError) {
        console.warn('Error en limpieza de cache:', cleanupError);
      }
    }, 5 * 60 * 1000); // Cada 5 minutos
  } catch (intervalError) {
    console.warn('Error configurando limpieza de cache:', intervalError);
  }
}

console.log(' Ultra Vision API Pro con Manejo Seguro de Errores inicializado correctamente');

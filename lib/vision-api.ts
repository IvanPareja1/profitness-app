
// Google Vision API Configuration - VERSIÓN MEJORADA Y OPTIMIZADA
export const VISION_API_KEY = "AIzaSyBhYkIRJN8BX450AX8YZEg_drHlfWYf8No";

// Verificar que la configuración esté presente
if (!VISION_API_KEY || VISION_API_KEY.includes("TU_API_KEY")) {
  console.warn('⚠️  Google Vision API Key no está configurado. Agrega tu API Key a las variables de entorno.');
}

// Configuración de seguridad y rendimiento mejorada
const RATE_LIMIT = {
  maxRequests: 200, // Aumentado para mejor funcionalidad
  timeWindow: 60 * 60 * 1000, // 1 hora
  requests: [] as number[]
};

// Cache inteligente para detecciones previas
const DETECTION_CACHE = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Base de datos expandida de alimentos con mejor categorización
const enhancedFoodDatabase = {
  // Frutas con más variedad
  'apple': { 
    names: ['apple', 'manzana', 'mela', 'pomme', 'apfel'], 
    category: 'fruta',
    confidence: 0.95,
    data: { name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 }
  },
  'banana': { 
    names: ['banana', 'plátano', 'banano', 'cambur', 'guineo'], 
    category: 'fruta',
    confidence: 0.98,
    data: { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 }
  },
  'orange': { 
    names: ['orange', 'naranja', 'arance', 'laranja'], 
    category: 'fruta',
    confidence: 0.96,
    data: { name: 'Naranja', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4 }
  },
  'avocado': {
    names: ['avocado', 'aguacate', 'palta'],
    category: 'fruta',
    confidence: 0.94,
    data: { name: 'Aguacate', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7 }
  },

  // Verduras con más opciones
  'broccoli': { 
    names: ['broccoli', 'brócoli', 'brocoli'], 
    category: 'verdura',
    confidence: 0.97,
    data: { name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 }
  },
  'carrot': {
    names: ['carrot', 'zanahoria', 'cenoura'],
    category: 'verdura',
    confidence: 0.95,
    data: { name: 'Zanahoria', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8 }
  },
  'spinach': {
    names: ['spinach', 'espinaca', 'espinafre'],
    category: 'verdura',
    confidence: 0.92,
    data: { name: 'Espinaca', calories: 23, protein: 2.9, carbs: 4, fats: 0.4, fiber: 2.2 }
  },

  // Proteínas mejoradas
  'chicken': { 
    names: ['chicken', 'pollo', 'frango', 'chicken breast', 'pechuga'], 
    category: 'proteina',
    confidence: 0.90,
    data: { name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 }
  },
  'salmon': { 
    names: ['salmon', 'salmón', 'salmao'], 
    category: 'proteina',
    confidence: 0.88,
    data: { name: 'Salmón', calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0 }
  },
  'egg': { 
    names: ['egg', 'huevo', 'ovo', 'eggs'], 
    category: 'proteina',
    confidence: 0.93,
    data: { name: 'Huevo', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 }
  },

  // Carbohidratos
  'rice': { 
    names: ['rice', 'arroz', 'riz'], 
    category: 'carbohidrato',
    confidence: 0.85,
    data: { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 }
  },
  'bread': { 
    names: ['bread', 'pan', 'pao', 'brot'], 
    category: 'carbohidrato',
    confidence: 0.82,
    data: { name: 'Pan', calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 }
  },
  'pasta': {
    names: ['pasta', 'spaghetti', 'noodles', 'fideos', 'macarrones'],
    category: 'carbohidrato',
    confidence: 0.80,
    data: { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8 }
  },

  // Lácteos
  'milk': { 
    names: ['milk', 'leche', 'leite', 'lait'], 
    category: 'lacteo',
    confidence: 0.75,
    data: { name: 'Leche entera', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0 }
  },
  'cheese': {
    names: ['cheese', 'queso', 'queijo', 'fromage'],
    category: 'lacteo',
    confidence: 0.78,
    data: { name: 'Queso', calories: 113, protein: 7, carbs: 1, fats: 9, fiber: 0 }
  },

  // Snacks y procesados
  'pizza': {
    names: ['pizza', 'pizzas'],
    category: 'comida_procesada',
    confidence: 0.85,
    data: { name: 'Pizza', calories: 266, protein: 11, carbs: 33, fats: 10, fiber: 2 }
  },
  'burger': {
    names: ['burger', 'hamburguesa', 'hamburguer'],
    category: 'comida_procesada',
    confidence: 0.83,
    data: { name: 'Hamburguesa', calories: 295, protein: 17, carbs: 31, fats: 14, fiber: 2 }
  }
};

// Sistema de detección mejorado con IA
class EnhancedFoodDetector {
  private confidenceThreshold = 0.7;
  private detectionHistory: string[] = [];
  private contextAnalysis: Map<string, number> = new Map();

  // Analizar contexto de la imagen para mejor detección
  analyzeImageContext(labels: any[], objects: any[]): string {
    const contextClues = [];


    // Buscar contexto de cocina/comida
    const kitchenKeywords = ['plate', 'bowl', 'table', 'kitchen', 'dining', 'restaurant'];
    const hasKitchenContext = labels.some((label: any) => 
      kitchenKeywords.some(keyword => 
        label.description.toLowerCase().includes(keyword)
      )
    );

    if (hasKitchenContext) {
      contextClues.push('kitchen_context');
    }

    // Analizar objetos detectados
    const foodObjects = objects.filter((obj: any) => 
      obj.name && this.isFoodRelated(obj.name)
    );

    if (foodObjects.length > 0) {
      contextClues.push('food_objects_detected');
    }

    return contextClues.join(',');
  }

  // Verificar si un objeto está relacionado con comida
  private isFoodRelated(objectName: string): boolean {
    const foodRelatedTerms = [
      'food', 'meal', 'dish', 'ingredient', 'fruit', 'vegetable', 
      'meat', 'dairy', 'grain', 'snack', 'beverage'
    ];

    const name = objectName.toLowerCase();
    return foodRelatedTerms.some(term => name.includes(term));
  }

  // Mejorar detección basada en contexto
  enhanceDetectionWithContext(detections: any[], context: string): any[] {
    const enhanced = detections.map(detection => {
      let confidence = detection.confidence || 0.5;


      // Aumentar confianza si hay contexto de cocina
      if (context.includes('kitchen_context')) {
        confidence *= 1.2;
      }


      // Aumentar confianza si hay objetos de comida detectados
      if (context.includes('food_objects_detected')) {
        confidence *= 1.15;
      }


      // Aplicar boost basado en historial
      if (this.detectionHistory.includes(detection.name)) {
        confidence *= 1.1;
      }


      return {
        ...detection,
        confidence: Math.min(confidence, 0.98)
      };
    });

    return enhanced.filter(detection => detection.confidence > this.confidenceThreshold);
  }

  // Actualizar historial de detecciones
  updateDetectionHistory(detections: any[]): void {
    detections.forEach(detection => {
      if (!this.detectionHistory.includes(detection.name)) {
        this.detectionHistory.push(detection.name);
      }
    });

    // Mantener solo los últimos 20 elementos
    if (this.detectionHistory.length > 20) {
      this.detectionHistory = this.detectionHistory.slice(-20);
    }
  }
}

const foodDetector = new EnhancedFoodDetector();

// Función para verificar límite de requests con mejor manejo
function checkRateLimit(): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.timeWindow;


  // Limpiar requests antiguos
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(time => time > windowStart);


  // Verificar si excede el límite
  if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
    console.warn('⚠️  Límite de requests excedido. Intenta más tarde.');
    return false;
  }


  // Registrar nuevo request
  RATE_LIMIT.requests.push(now);
  return true;
}

// Cache inteligente para imágenes
function getCacheKey(imageData: string): string {
  // Crear hash simple del contenido de la imagen
  let hash = 0;
  for (let i = 0; i < Math.min(imageData.length, 1000); i++) {
    const char = imageData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

function getCachedResult(cacheKey: string): any | null {
  const cached = DETECTION_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  return null;
}

function setCachedResult(cacheKey: string, result: any): void {
  DETECTION_CACHE.set(cacheKey, {
    result,
    timestamp: Date.now()
  });

  // Limpiar cache antiguo
  if (DETECTION_CACHE.size > 50) {
    const entries = Array.from(DETECTION_CACHE.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    entries.slice(0, 25).forEach(([key]) => DETECTION_CACHE.delete(key));
  }
}

// Función mejorada para calcular similitud entre strings
function calculateAdvancedSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;


  // Verificar inclusión exacta
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;


  // Verificar palabras en común
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));


  if (commonWords.length > 0) {
    const commonRatio = commonWords.length / Math.max(words1.length, words2.length);
    if (commonRatio > 0.5) return 0.8;
  }


  // Algoritmo de distancia Levenshtein mejorado
  const matrix = [];
  const n = s1.length;
  const m = s2.length;

  if (n === 0) return m === 0 ? 1.0 : 0.0;
  if (m === 0) return 0.0;


  for (let i = 0; i <= m; i++) {
    matrix[i] = [i];
  }


  for (let j = 0; j <= n; j++) {
    matrix[0][j] = j;
  }


  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
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


  const distance = matrix[m][n];
  const maxLength = Math.max(n, m);
  const similarity = 1 - (distance / maxLength);


  // Bonus por longitud similar
  const lengthDiff = Math.abs(n - m);
  const lengthBonus = 1 - (lengthDiff / maxLength);


  return (similarity + lengthBonus) / 2;
}

// Función mejorada para encontrar alimentos con fuzzy matching avanzado
function findBestFoodMatch(description: string): any | null {
  let bestMatch = null;
  let bestScore = 0;


  const cleanDescription = description.toLowerCase().trim();


  // Buscar coincidencias exactas primero
  for (const [key, food] of Object.entries(enhancedFoodDatabase)) {
    for (const name of food.names) {
      if (cleanDescription === name.toLowerCase()) {
        return { 
          ...food.data, 
          confidence: food.confidence, 
          method: 'exact',
          category: food.category 
        };
      }
    }
  }


  // Buscar coincidencias por inclusión
  for (const [key, food] of Object.entries(enhancedFoodDatabase)) {
    for (const name of food.names) {
      const similarity = calculateAdvancedSimilarity(cleanDescription, name";


      if (similarity > 0.8) {
        const confidence = Math.min(similarity * food.confidence, 0.98);
        if (confidence > bestScore) {
          bestMatch = { 
            ...food.data, 
            confidence, 
            method: 'fuzzy',
            category: food.category,
            similarity
          };
          bestScore = confidence;
        }
      }
    }
  }


  return bestMatch;
}

// Función mejorada para pre-procesar imagen
async function preprocessImageAdvanced(imageFile: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();


    img.onload = () => {
      // Optimizar tamaño manteniendo calidad
      const maxSize = 1280;
      let { width, height } = img;


      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width *= ratio;
        height *= ratio;
      }


      canvas.width = width;
      canvas.height = height;


      if (ctx) {
        // Aplicar filtros avanzados para mejorar detección
        ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.1)';
        ctx.drawImage(img, 0, 0, width, height);


        // Opcional: aplicar sharpening
        const imageData = ctx.getImageData(0, 0, width, height);
        const sharpened = applySharpeningFilter(imageData);
        ctx.putImageData(sharpened, 0, 0);


        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], imageFile.name, { type: 'image/jpeg' });
            resolve(optimizedFile);
          } else {
            resolve(imageFile);
          }
        }, 'image/jpeg', 0.9);
      } else {
        resolve(imageFile);
      }
    }


    img.onerror = () => resolve(imageFile);
    img.src = URL.createObjectURL(imageFile);
  });
}

// Filtro de sharpening para mejorar detección
function applySharpeningFilter(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data);


  // Kernel de sharpening
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
  ]


  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels
        let sum = 0;
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pixelIndex = ((y + ky - 1) * width + (x + kx - 1)) * 4 + c;
            sum += data[pixelIndex] * kernel[ky][kx];
          }
        }
        const outputIndex = (y * width + x) * 4 + c;
        output[outputIndex] = Math.max(0, Math.min(255, sum));
      }
    }
  }


  return new ImageData(output, width, height);
}

// Función principal mejorada para detectar alimentos
export async function detectFoodInImage(imageFile: File): Promise<any[]> {
  try {
    // Verificar cache primero
    const base64Image = await fileToBase64(imageFile);
    const cacheKey = getCacheKey(base64Image);
    const cachedResult = getCachedResult(cacheKey);


    if (cachedResult) {
      console.log('Usando resultado de cache');
      return cachedResult;
    }


    // Validaciones de seguridad
    if (!checkRateLimit()) {
      throw new Error('Límite de requests excedido');
    }


    if (!validateOrigin()) {
      throw new Error('Origen no autorizado');
    }


    // Validar archivo
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Archivo demasiado grande (máximo 5MB)');
    }


    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Tipo de archivo no válido');
    }


    // Pre-procesar imagen con filtros avanzados
    const processedImage = await preprocessImageAdvanced(imageFile);
    const processedBase64 = await fileToBase64(processedImage);


    // Preparar solicitud avanzada a Google Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: processedBase64
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 15
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 10
            },
            {
              type: 'TEXT_DETECTION',
              maxResults: 8
            },
            {
              type: 'WEB_DETECTION',
              maxResults: 8
            },
            {
              type: 'SAFE_SEARCH_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    }


    // Realizar solicitud con timeout mejorado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);


    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }
    )


    clearTimeout(timeoutId)


    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }


    const data = await response.json()


    if (data.responses && data.responses[0]) {
      const apiResponse = data.responses[0]


      // Verificar si hay errores en la respuesta
      if (apiResponse.error) {
        throw new Error(`Vision API Error: ${apiResponse.error.message}`);
      }


      const labels = apiResponse.labelAnnotations || [];
      const objects = apiResponse.localizedObjectAnnotations || [];
      const textAnnotations = apiResponse.textAnnotations || [];
      const webDetection = apiResponse.webDetection || {}


      // Analizar contexto de la imagen
      const context = foodDetector.analyzeImageContext(labels, objects)


      // Combinar todas las detecciones
      let allDetections = [...labels, ...objects]


      // Procesar texto detectado para encontrar nombres de alimentos
      if (textAnnotations.length > 0) {
        const detectedText = textAnnotations[0].description || '';
        const textWords = detectedText.toLowerCase().split(/\s+/)


        textWords.forEach((word: string) => {
          if (word.length > 3) {
            const foodMatch = findBestFoodMatch(word);
            if (foodMatch && foodMatch.confidence > 0.8) {
              allDetections.push({
                description: word,
                score: foodMatch.confidence,
                source: 'text_detection',
                foodData: foodMatch
              });
            }
          }
        });
      }


      // Procesar web detection con mayor inteligencia
      if (webDetection.webEntities) {
        webDetection.webEntities.forEach((entity: any) => {
          if (entity.description && entity.score > 0.6) {
            const foodMatch = findBestFoodMatch(entity.description);
            if (foodMatch) {
              allDetections.push({
                description: entity.description,
                score: entity.score * 0.9,
                source: 'web_detection',
                foodData: foodMatch
              });
            }
          }
        });
      }


      // Filtrar solo elementos relacionados con comida
      const foodItems = filterFoodItemsAdvanced(allDetections)


      // Aplicar mejoras basadas en contexto
      const enhancedFoodItems = foodDetector.enhanceDetectionWithContext(foodItems, context)


      // Mapear a nuestro formato final
      const finalResults = mapToAdvancedFoodFormat(enhancedFoodItems)


      // Actualizar historial
      foodDetector.updateDetectionHistory(finalResults)


      // Guardar en cache
      setCachedResult(cacheKey, finalResults)


      if (finalResults.length > 0) {
        return finalResults;
      }
    }


    // Si no se detectó nada, devolver sugerencias inteligentes
    const suggestions = getIntelligentSuggestions();
    setCachedResult(cacheKey, suggestions);
    return suggestions


  } catch (error) {
    console.error('Error detecting food:', error)


    // Devolver sugerencias de error más útiles
    return getErrorFallbackSuggestions(error)
  }
}


// Función mejorada para filtrar elementos de comida
function filterFoodItemsAdvanced(items: any[]): any[] {
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
  ]


  return items.filter(item => {
    const description = (item.description || item.name || '').toLowerCase();
    const hasKeyword = enhancedFoodKeywords.some(keyword => 
      description.includes(keyword) || 
      keyword.includes(description) ||
      calculateAdvancedSimilarity(description, keyword) > 0.7
    )


    const confidence = item.score || item.confidence || 0.5;
    const hasGoodConfidence = confidence > 0.4


    // Verificar si ya tenemos datos de alimento procesados
    const hasFoodData = item.foodData !== undefined


    return (hasKeyword && hasGoodConfidence) || hasFoodData;
  }).sort((a, b) => {
    // Priorizar items con datos de alimento
    const aHasFoodData = a.foodData ? 1 : 0;
    const bHasFoodData = b.foodData ? 1 : 0


    if (aHasFoodData !== bHasFoodData) {
      return bHasFoodData - aHasFoodData;
    }


    // Luego ordenar por confianza
    return (b.score || b.confidence || 0) - (a.score || a.confidence || 0);
  });
}


// Función mejorada para mapear a formato avanzado
function mapToAdvancedFoodFormat(items: any[]): any[] {
  const mappedFoods: any[] = []
  const processedNames = new Set<string>


  items.slice(0, 8).forEach(item => { // Procesar máximo 8 items
    const description = (item.description || item.name || '').toLowerCase().trim();
    const confidence = item.score || item.confidence || 0.6


    if (processedNames.has(description)) return;
    processedNames.add(description)


    // Si ya tenemos datos de alimento procesados, usarlos
    if (item.foodData) {
      mappedFoods.push({
        ...item.foodData,
        confidence: Math.min(confidence, 0.98),
        detected: true,
        source: item.source || 'vision_api',
        originalDescription: description
      });
      return
    }


    // Buscar coincidencia en nuestra base de datos
    const foodMatch = findBestFoodMatch(description)


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
  })


  // Eliminar duplicados y ordenar por confianza
  const uniqueFoods = mappedFoods
    .filter((food, index, self) => 
      index === self.findIndex(f => 
        f.name.toLowerCase() === food.name.toLowerCase()
      )
    )
    .sort((a, b) => b.confidence - a.confidence)


  return uniqueFoods.slice(0, 6); // Máximo 6 alimentos detectados
}


// Función mejorada para crear alimento genérico
function createAdvancedGenericFood(description: string, confidence: number): any | null {
  if (description.length < 3 || confidence < 0.6) return null


  const name = description.charAt(0).toUpperCase() + description.slice(1)


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
  }


  // Determinar categoría con mayor precisión
  let category = 'default';
  const desc = description.toLowerCase()


  if (/frut|fruit|berry|apple|banana|orange|grape/.test(desc)) category = 'fruta';
  else if (/veget|verdur|green|leaf|carrot|broccoli|spinach/.test(desc)) category = 'verdura';
  else if (/meat|carne|chicken|pollo|fish|pescado|protein|beef|pork/.test(desc)) category = 'proteina';
  else if (/bread|pan|rice|arroz|pasta|cereal|grain|oat/.test(desc)) category = 'carbohidrato';
  else if (/milk|leche|cheese|queso|yogur|dairy/.test(desc)) category = 'lacteo';
  else if (/pizza|burger|processed|packaged|snack/.test(desc)) category = 'procesado';
  else if (/juice|drink|beverage|soda|coffee|tea/.test(desc)) category = 'bebida'


  const defaults = advancedCategoryDefaults[category as keyof typeof advancedCategoryDefaults] || advancedCategoryDefaults.default


  return {
    name,
    ...defaults,
    confidence: Math.min(confidence * 0.8, 0.85), // Penalizar un poco los genéricos
    detected: true,
    source: 'advanced_generic',
    category,
    originalDescription: description
  }
}


// Función mejorada para sugerencias inteligentes
function getIntelligentSuggestions(): any[] {
  const now = new Date();
  const hour = now.getHours()


  let suggestions = []


  if (hour >= 6 && hour < 11) {
    // Desayuno mejorado
    suggestions = [
      { ...enhancedFoodDatabase['banana'].data, confidence: 0.7, source: 'morning_suggestion' },
      { ...enhancedFoodDatabase['egg'].data, confidence: 0.7, source: 'morning_suggestion' },
      { name: 'Avena con frutas', calories: 150, protein: 5, carbs: 27, fats: 3, fiber: 4, confidence: 0.65, source: 'morning_suggestion' }
    ];
  } else if (hour >= 11 && hour < 15) {
    // Almuerzo mejorado
    suggestions = [
      { ...enhancedFoodDatabase['chicken'].data, confidence: 0.7, source: 'lunch_suggestion' },
      { ...enhancedFoodDatabase['rice'].data, confidence: 0.7, source: 'lunch_suggestion' },
      { ...enhancedFoodDatabase['broccoli'].data, confidence: 0.7, source: 'lunch_suggestion' }
    ];
  } else if (hour >= 15 && hour < 19) {
    // Snack mejorado
    suggestions = [
      { ...enhancedFoodDatabase['apple'].data, confidence: 0.7, source: 'snack_suggestion' },
      { name: 'Yogur griego', calories: 100, protein: 10, carbs: 6, fats: 4, fiber: 0, confidence: 0.65, source: 'snack_suggestion' },
      { name: 'Nueces mixtas', calories: 180, protein: 6, carbs: 5, fats: 16, fiber: 3, confidence: 0.65, source: 'snack_suggestion' }
    ];
  } else {
    // Cena mejorada
    suggestions = [
      { ...enhancedFoodDatabase['salmon'].data, confidence: 0.7, source: 'dinner_suggestion' },
      { name: 'Batata asada', calories: 112, protein: 2, carbs: 26, fats: 0.1, fiber: 3.9, confidence: 0.65, source: 'dinner_suggestion' },
      { ...enhancedFoodDatabase['spinach'].data, confidence: 0.7, source: 'dinner_suggestion' }
    ];
  }


  return suggestions.map(food => ({
    ...food,
    detected: false,
    source: food.source
  }));
}


// Función para sugerencias de error más útiles
function getErrorFallbackSuggestions(error: any): any[] {
  console.log('Providing error fallback suggestions for:', error.message)


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
}


// Función para validar origen
function validateOrigin(): boolean {
  if (typeof window !== 'undefined') {
    const allowedOrigins = [
      'localhost',
      'readdy.ai',
      '127.0.0.1'
    ]


    const currentOrigin = window.location.hostname;
    return allowedOrigins.some(origin => currentOrigin.includes(origin));
  }
  return true;
}


// Función para convertir File a base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


// Función para capturar imagen desde video - MEJORADA
export async function captureImageFromVideo(videoElement: HTMLVideoElement): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');


      if (!context) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }


      // Configurar el tamaño óptimo del canvas
      const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
      const targetWidth = Math.min(1280, videoElement.videoWidth);
      const targetHeight = targetWidth / aspectRatio;


      canvas.width = targetWidth;
      canvas.height = targetHeight;


      // Aplicar filtros antes de capturar
      context.filter = 'contrast(1.15) brightness(1.05) saturate(1.1)';
      context.drawImage(videoElement, 0, 0, targetWidth, targetHeight);


      // Convertir a blob con calidad optimizada
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo crear el blob de la imagen'));
          return;
        }


        const file = new File([blob], 'captured-food-image.jpg', { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(file);
      }, 'image/jpeg', 0.92);


    } catch (error) {
      reject(error);
    }
  });
}


// Exportar la instancia del detector para uso avanzado
export { foodDetector as advancedFoodDetector };

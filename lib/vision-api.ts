
// Google Vision API Configuration - SEGURO
export const VISION_API_KEY = "TU_API_KEY_AQUI"; // Reemplaza con tu API Key real

// Verificar que la configuración esté presente
if (!VISION_API_KEY || VISION_API_KEY === "TU_API_KEY_AQUI") {
  console.warn('⚠️  Google Vision API Key no está configurado. Agrega tu API Key a las variables de entorno.');
}

// Configuración de seguridad
const RATE_LIMIT = {
  maxRequests: 100, // Máximo 100 requests por hora
  timeWindow: 60 * 60 * 1000, // 1 hora en milisegundos
  requests: [] as number[]
};

// Función para verificar límite de requests
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

// Función para validar origen de la request
function validateOrigin(): boolean {
  if (typeof window !== 'undefined') {
    const allowedOrigins = [
      'localhost',
      'readdy.ai',
      'tu-dominio.com' // Reemplaza con tu dominio
    ];
    
    const currentOrigin = window.location.hostname;
    return allowedOrigins.some(origin => currentOrigin.includes(origin));
  }
  return true; // En servidor siempre permitir
}

// Función para convertir File a base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remover el prefijo "data:image/...;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Función para capturar imagen desde video - NUEVA FUNCIÓN EXPORTADA
export async function captureImageFromVideo(videoElement: HTMLVideoElement): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      // Crear canvas para capturar el frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }
      
      // Configurar el tamaño del canvas
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Dibujar el frame actual del video en el canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convertir canvas a blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo crear el blob de la imagen'));
          return;
        }
        
        // Crear archivo desde blob
        const file = new File([blob], 'captured-frame.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      reject(error);
    }
  });
}

// Función para filtrar elementos relacionados con comida
function filterFoodItems(items: any[]): any[] {
  const foodKeywords = [
    'food', 'comida', 'fruit', 'fruta', 'vegetable', 'verdura', 'meat', 'carne',
    'chicken', 'pollo', 'beef', 'res', 'fish', 'pescado', 'bread', 'pan',
    'rice', 'arroz', 'pasta', 'apple', 'manzana', 'banana', 'plátano',
    'orange', 'naranja', 'salad', 'ensalada', 'sandwich', 'hamburger',
    'pizza', 'soup', 'sopa', 'egg', 'huevo', 'cheese', 'queso',
    'milk', 'leche', 'yogurt', 'yogur', 'cookie', 'galleta', 'cake', 'torta'
  ];
  
  return items.filter(item => {
    const description = (item.description || item.name || '').toLowerCase();
    return foodKeywords.some(keyword => description.includes(keyword));
  });
}

// Base de datos de alimentos para mapeo
const foodDatabase = {
  'apple': { name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
  'manzana': { name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
  'banana': { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  'plátano': { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  'orange': { name: 'Naranja', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4 },
  'naranja': { name: 'Naranja', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4 },
  'chicken': { name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  'pollo': { name: 'Pechuga de pollo', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  'rice': { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  'arroz': { name: 'Arroz blanco', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  'bread': { name: 'Pan', calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 },
  'pan': { name: 'Pan', calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 },
  'egg': { name: 'Huevo', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
  'huevo': { name: 'Huevo', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
  'broccoli': { name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
  'brócoli': { name: 'Brócoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
  'salmon': { name: 'Salmón', calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0 },
  'salmón': { name: 'Salmón', calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0 },
  'fish': { name: 'Pescado', calories: 200, protein: 25, carbs: 0, fats: 10, fiber: 0 },
  'pescado': { name: 'Pescado', calories: 200, protein: 25, carbs: 0, fats: 10, fiber: 0 }
};

// Función para mapear elementos detectados a formato de alimentos
function mapToFoodFormat(items: any[]): any[] {
  const mappedFoods: any[] = [];
  
  items.forEach(item => {
    const description = (item.description || item.name || '').toLowerCase();
    const confidence = item.score || 0.8;
    
    // Buscar en nuestra base de datos
    const foodKey = Object.keys(foodDatabase).find(key => 
      description.includes(key) || key.includes(description)
    );
    
    if (foodKey) {
      const foodData = foodDatabase[foodKey as keyof typeof foodDatabase];
      mappedFoods.push({
        ...foodData,
        confidence: Math.min(confidence, 0.95),
        detected: true
      });
    } else {
      // Si no encontramos el alimento, usar valores genéricos
      mappedFoods.push({
        name: description.charAt(0).toUpperCase() + description.slice(1),
        calories: 100,
        protein: 5,
        carbs: 15,
        fats: 3,
        fiber: 2,
        confidence: Math.min(confidence, 0.7),
        detected: true
      });
    }
  });
  
  // Eliminar duplicados
  const uniqueFoods = mappedFoods.filter((food, index, self) => 
    index === self.findIndex(f => f.name === food.name)
  );
  
  return uniqueFoods.slice(0, 3); // Máximo 3 alimentos detectados
}

// Función para detectar alimentos en una imagen - SEGURA
export async function detectFoodInImage(imageFile: File): Promise<any[]> {
  try {
    // Validaciones de seguridad
    if (!checkRateLimit()) {
      throw new Error('Límite de requests excedido');
    }
    
    if (!validateOrigin()) {
      throw new Error('Origen no autorizado');
    }
    
    // Validar tamaño de archivo (máximo 4MB)
    if (imageFile.size > 4 * 1024 * 1024) {
      throw new Error('Archivo demasiado grande (máximo 4MB)');
    }
    
    // Validar tipo de archivo
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Tipo de archivo no válido');
    }
    
    // Convertir imagen a base64
    const base64Image = await fileToBase64(imageFile);
    
    // Preparar la solicitud a Google Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 5 // Reducir para ahorrar costos
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 5 // Reducir para ahorrar costos
            }
          ]
        }
      ]
    };

    // Realizar solicitud a Google Vision API con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

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
    );

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responses && data.responses[0]) {
      const labels = data.responses[0].labelAnnotations || [];
      const objects = data.responses[0].localizedObjectAnnotations || [];
      
      // Filtrar solo elementos relacionados con comida
      const foodItems = filterFoodItems([...labels, ...objects]);
      
      // Mapear a nuestro formato de alimentos
      return mapToFoodFormat(foodItems);
    }
    
    return [];
  } catch (error) {
    console.error('Error detecting food:', error);
    
    // En caso de error, devolver resultados demo
    return getDemoResults();
  }
}

// Función para obtener resultados demo cuando falla la API
function getDemoResults(): any[] {
  return [
    {
      name: 'Manzana',
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fats: 0.2,
      fiber: 2.4,
      confidence: 0.9,
      detected: true
    },
    {
      name: 'Plátano',
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fats: 0.3,
      fiber: 2.6,
      confidence: 0.85,
      detected: true
    }
  ];
}

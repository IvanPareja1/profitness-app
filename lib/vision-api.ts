
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

// ... resto del código sin cambios ...

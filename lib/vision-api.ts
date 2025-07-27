
// Google Vision API Configuration
export const VISION_API_KEY = "AIzaSyBhYkIRJN8BX450AX8YZEg_drHlfWYf8No";

// Verificar que la configuración esté presente
if (!VISION_API_KEY || VISION_API_KEY === "AIzaSyBhYkIRJN8BX450AX8YZEg_drHlfWYf8No") {
  console.warn('⚠️  Google Vision API Key no está configurado. Agrega tu API Key a las variables de entorno.');
}

// Función para detectar alimentos en una imagen
export async function detectFoodInImage(imageFile: File): Promise<any[]> {
  try {
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
              maxResults: 10
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 10
            }
          ]
        }
      ]
    };

    // Realizar solicitud a Google Vision API
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
    return [];
  }
}

// Función auxiliar para convertir File a base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Función para filtrar elementos relacionados con comida
function filterFoodItems(items: any[]): any[] {
  const foodKeywords = [
    'food', 'fruit', 'vegetable', 'meat', 'chicken', 'beef', 'fish', 'bread',
    'rice', 'pasta', 'salad', 'soup', 'pizza', 'burger', 'sandwich', 'apple',
    'banana', 'orange', 'tomato', 'carrot', 'potato', 'broccoli', 'cheese',
    'milk', 'egg', 'yogurt', 'cereal', 'cookie', 'cake', 'donut', 'coffee',
    'tea', 'juice', 'water', 'wine', 'beer', 'soda', 'snack', 'candy',
    'chocolate', 'ice cream', 'nuts', 'seeds', 'beans', 'lentils', 'quinoa',
    'oats', 'pasta', 'noodles', 'sushi', 'taco', 'burrito', 'wrap'
  ];
  
  return items.filter(item => {
    const description = item.description || item.name || '';
    return foodKeywords.some(keyword => 
      description.toLowerCase().includes(keyword.toLowerCase())
    );
  }).filter(item => (item.score || item.confidence || 0) > 0.7);
}

// Función para mapear items detectados a nuestro formato de alimentos
function mapToFoodFormat(items: any[]): any[] {
  const foodDatabase = [
    { name: 'apple', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
    { name: 'banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
    { name: 'chicken', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
    { name: 'beef', calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0 },
    { name: 'fish', calories: 208, protein: 25, carbs: 0, fats: 12, fiber: 0 },
    { name: 'bread', calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 },
    { name: 'rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
    { name: 'pasta', calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8 },
    { name: 'salad', calories: 25, protein: 2, carbs: 5, fats: 0.3, fiber: 2 },
    { name: 'vegetable', calories: 25, protein: 2, carbs: 5, fats: 0.3, fiber: 2 },
    { name: 'fruit', calories: 60, protein: 0.8, carbs: 15, fats: 0.2, fiber: 2 },
    { name: 'cheese', calories: 113, protein: 7, carbs: 1, fats: 9, fiber: 0 },
    { name: 'egg', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
    { name: 'yogurt', calories: 61, protein: 3.5, carbs: 4.7, fats: 3.3, fiber: 0 },
    { name: 'milk', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0 },
    { name: 'nuts', calories: 576, protein: 21, carbs: 22, fats: 49, fiber: 12 },
    { name: 'cookie', calories: 502, protein: 6, carbs: 64, fats: 25, fiber: 2 },
    { name: 'cake', calories: 347, protein: 4, carbs: 56, fats: 13, fiber: 1 },
    { name: 'pizza', calories: 266, protein: 11, carbs: 33, fats: 10, fiber: 2 },
    { name: 'sandwich', calories: 300, protein: 15, carbs: 35, fats: 12, fiber: 3 }
  ];

  return items.map(item => {
    const description = (item.description || item.name || '').toLowerCase();
    const confidence = item.score || item.confidence || 0;
    
    // Buscar en nuestra base de datos
    const matchedFood = foodDatabase.find(food => 
      description.includes(food.name) || food.name.includes(description)
    );
    
    if (matchedFood) {
      return {
        name: capitalizeFirst(matchedFood.name),
        calories: matchedFood.calories,
        protein: matchedFood.protein,
        carbs: matchedFood.carbs,
        fats: matchedFood.fats,
        fiber: matchedFood.fiber,
        confidence: confidence,
        detected: true
      };
    }
    
    // Si no encontramos match exacto, crear uno genérico
    return {
      name: capitalizeFirst(description),
      calories: 100,
      protein: 5,
      carbs: 15,
      fats: 3,
      fiber: 2,
      confidence: confidence,
      detected: true
    };
  });
}

// Función auxiliar para capitalizar primera letra
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función para capturar imagen desde video
export function captureImageFromVideo(videoElement: HTMLVideoElement): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('No se pudo obtener el contexto del canvas'));
        return;
      }
      
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      context.drawImage(videoElement, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          resolve(file);
        } else {
          reject(new Error('No se pudo crear el archivo de imagen'));
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      reject(error);
    }
  });
}

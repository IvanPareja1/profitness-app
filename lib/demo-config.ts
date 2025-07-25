
// Configuración del modo demo
export const DEMO_CONFIG = {
  // Cambiar a false para deshabilitar el modo demo en producción
  ENABLED: process.env.NODE_ENV === 'development',
  
  // Datos del usuario demo
  DEMO_USER: {
    name: 'María González',
    email: 'maria.gonzalez@demo.com',
    picture: '',
    sub: 'demo_user',
    email_verified: true
  },
  
  // Perfil demo
  DEMO_PROFILE: {
    age: '28',
    weight: '65',
    height: '165',
    activityLevel: 'moderate',
    workActivity: 'sedentary',
    goal: 'maintain',
    language: 'es',
    targetCalories: 1800,
    targetProtein: 110,
    targetCarbs: 220,
    targetFats: 60,
    targetWater: 2500,
    targetFiber: 25,
    syncEnabled: false,
    lastSyncTime: null,
    avgDailySteps: 0,
    avgActiveMinutes: 0,
    avgCaloriesBurned: 0
  },
  
  // Datos nutricionales demo
  DEMO_NUTRITION: {
    calories: 1200,
    protein: 75,
    carbs: 150,
    fats: 45,
    fiber: 18,
    water: 1800,
    meals: [
      {
        id: 'demo_1',
        name: 'Avena con frutas',
        mealType: 'desayuno',
        quantity: '100',
        calories: 350,
        protein: 12,
        carbs: 55,
        fats: 8,
        fiber: 6
      },
      {
        id: 'demo_2',
        name: 'Ensalada de pollo',
        mealType: 'almuerzo',
        quantity: '200',
        calories: 480,
        protein: 35,
        carbs: 25,
        fats: 28,
        fiber: 8
      },
      {
        id: 'demo_3',
        name: 'Yogur griego',
        mealType: 'snack',
        quantity: '150',
        calories: 120,
        protein: 15,
        carbs: 8,
        fats: 4,
        fiber: 2
      }
    ]
  },
  
  // Configuración de funciones simuladas
  FEATURES: {
    BARCODE_SCANNER: true,
    CAMERA_DETECTION: true,
    OPENAI_INTEGRATION: true,
    GOOGLE_HEALTH_SYNC: true
  }
};

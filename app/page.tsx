
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from './components/BottomNavigation';
import InstallPrompt from './components/InstallPrompt';
import UpdateNotification from './components/UpdateNotification';
import CloudSyncManager from './components/CloudSyncManager';
import { deviceTime } from './lib/device-time-utils';
import { supabase } from './lib/supabase'; // Importar Supabase

// Declarar tipos globales para ventana
declare global {
  interface Window {
    showDataRestorePrompt?: () => void;
  }
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quantity: number;
  mealType: string;
  timestamp: string;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  meals: Meal[];
}

type MealType = 'desayuno' | 'almuerzo' | 'cena' | 'snack';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [language, setLanguage] = useState('es');
  const [userData, setUserData] = useState<any>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    targetCalories: 2000,
    targetProtein: 120,
    targetCarbs: 250,
    targetFats: 67,
    meals: [],
  });
  const router = useRouter();

   // Función para cargar datos de nutrición desde Supabase
  const loadNutritionDataFromSupabase = async (userId: string, date: string) => {
    try {
      const { data, error } = await supabase
        .from('nutrition_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (!error && data) {
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error cargando datos de nutrición:', error);
      return null;
    }
  };

   // Función para guardar datos de nutrición en Supabase
  const saveNutritionDataToSupabase = async (userId: string, date: string, data: any) => {
    try {
      const { error } = await supabase
        .from('nutrition_data')
        .upsert({
          user_id: userId,
          date: date,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error guardando datos de nutrición:', error);
    }
  };


  useEffect(() => {
    setMounted(true);

    // Verificar si estamos en el cliente antes de acceder a localStorage
    if (typeof window === 'undefined') return;

    // Verificar autenticación antes de cargar datos
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      router.push('/login');
      return;
    }

    // Configurar función global para mostrar prompt de restauración
    window.showDataRestorePrompt = () => {
      setShowRestorePrompt(true);
    };

    try {
      const userDataStored = localStorage.getItem('userData');
      if (userDataStored) {
        const user = JSON.parse(userDataStored);
        setUserData(user);
      }

      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        setLanguage(profile.language || 'es');

        // Actualizar targets desde el perfil
        setNutritionData((prev) => ({
          ...prev,
          targetCalories: profile.targetCalories || 2000,
          targetProtein: profile.targetProtein || 120,
          targetCarbs: profile.targetCarbs || 250,
          targetFats: profile.targetFats || 67,
        }));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }

    // Usar el nuevo sistema de fecha y hora del dispositivo
    const updateDateTime = () => {
      try {
        const today = deviceTime.getCurrentDate();
        const formattedDate = deviceTime.getFormattedDate({
          includeWeekday: true,
          format: 'long'
        });
        const currentTimeStr = deviceTime.getCurrentTime({ use24Hour: true });

        setCurrentDate(formattedDate);
        setCurrentTime(currentTimeStr);

        return today;
      } catch (error) {
        console.warn('Error obteniendo fecha/hora del dispositivo:', error);
        // Fallback seguro
        const fallbackDate = new Date().toISOString().split('T')[0];
        const fallbackFormatted = new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        setCurrentDate(fallbackFormatted);
        setCurrentTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
        return fallbackDate;
      }
    };

    const today = updateDateTime();

    // Actualizar fecha/hora cada minuto
    const timeInterval = setInterval(() => {
      updateDateTime();
    }, 60000);

        const loadTodayData = async (): Promise<void> => {
      if (typeof window === 'undefined') return;

      try {
        const todayKey = today;

        // Intentar cargar desde Supabase primero
        if (userData?.id) {
          const supabaseData = await loadNutritionDataFromSupabase(userData.id, todayKey);
          if (supabaseData) {
            setNutritionData((prev) => ({
              ...prev,
              calories: supabaseData.calories || 0,
              protein: supabaseData.protein || 0,
              carbs: supabaseData.carbs || 0,
              fats: supabaseData.fats || 0,
              meals: supabaseData.meals || [],
              targetCalories: supabaseData.targetCalories || prev.targetCalories,
              targetProtein: supabaseData.targetProtein || prev.targetProtein,
              targetCarbs: supabaseData.targetCarbs || prev.targetCarbs,
              targetFats: supabaseData.targetFats || prev.targetFats,
            }));
            return;
          }
        }

        // Fallback a localStorage si no hay datos en Supabase
        const savedData = localStorage.getItem(`nutrition_${todayKey}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setNutritionData((prev) => ({
            ...prev,
            calories: parsed.calories || 0,
            protein: parsed.protein || 0,
            carbs: parsed.carbs || 0,
            fats: parsed.fats || 0,
            meals: parsed.meals || [],
            targetCalories: parsed.targetCalories || prev.targetCalories,
            targetProtein: parsed.targetProtein || prev.targetProtein,
            targetCarbs: parsed.targetCarbs || prev.targetCarbs,
            targetFats: parsed.targetFats || prev.targetFats,
          }));

          // Guardar en Supabase para futuras sesiones
          if (userData?.id) {
            await saveNutritionDataToSupabase(userData.id, todayKey, parsed);
          }
        }
      } catch (error) {
        console.log('Error loading data:', error);
      }
    };

    loadTodayData();

    const handleNutritionUpdate = (): void => {
      loadTodayData();
    };

    const handleLanguageChange = () => {
      if (typeof window === 'undefined') return;

      try {
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
          const profile = JSON.parse(userProfile);
          setLanguage(profile.language || 'es');
        }
      } catch (error) {
        console.log('Error updating language:', error);
      }
    };

    window.addEventListener('nutritionDataUpdated', handleNutritionUpdate);
    window.addEventListener('profileUpdated', handleLanguageChange);

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('nutritionDataUpdated', handleNutritionUpdate);
      window.removeEventListener('profileUpdated', handleLanguageChange);
    };
  }, [router]);

  const handleAutoRestore = async () => {
    try {
      // Mostrar mensaje de éxito
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        border: 1px solid #16a34a;
        border-radius: 12px;
        padding: 16px 24px;
        z-index: 3000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 320px;
        width: 90%;
      `;
      successMessage.innerHTML = `
        <div style="width: 24px; height: 24px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <i class="ri-check-line" style="color: white; font-size: 14px;"></i>
        </div>
        <div>
          <p style="font-size: 14px; font-weight: 600; color: #15803d; margin: 0;">Datos restaurados</p>
          <p style="font-size: 12px; color: #16a34a; margin: 0;">Recargando aplicación...</p>
        </div>
      `;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error al restaurar datos:', error);
    }
  };

  const translations = {
    es: {
      dailyProgress: 'Progreso del Día',
      add: 'Agregar',
      calories: 'Calorías',
      protein: 'Proteínas',
      carbs: 'Carbohidratos',
      fats: 'Grasas',
      of: 'de',
      quickActions: 'Acciones Rápidas',
      addFood: 'Agregar Comida',
      registerFood: 'Registrar alimento',
      viewNutrition: 'Ver Nutrición',
      dailyDetails: 'Detalles diarios',
      todayMeals: 'Comidas de Hoy',
      noMealsRegistered: 'No hay comidas registradas',
      startAdding: 'Comienza agregando tu primera comida del día',
      addFirstMeal: 'Agregar Primera Comida',
      addMoreFood: 'Agregar Más Comida',
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      snack: 'Snack',
      dataRestoreTitle: 'Datos Disponibles en la Nube',
      dataRestoreMessage: 'Hemos detectado que tienes datos guardados en la nube. ¿Quieres restaurarlos?',
      restore: 'Restaurar',
      continueWithoutRestore: 'Continuar sin restaurar',
    },
    en: {
      dailyProgress: 'Daily Progress',
      add: 'Add',
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fats: 'Fats',
      of: 'of',
      quickActions: 'Quick Actions',
      addFood: 'Add Food',
      registerFood: 'Register food',
      viewNutrition: 'View Nutrition',
      dailyDetails: 'Daily details',
      todayMeals: 'Today\'s Meals',
      noMealsRegistered: 'No meals registered',
      startAdding: 'Start by adding your first meal of the day',
      addFirstMeal: 'Add First Meal',
      addMoreFood: 'Add More Food',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      dataRestoreTitle: 'Cloud Data Available',
      dataRestoreMessage: 'We detected that you have data saved in the cloud. Do you want to restore it?',
      restore: 'Restore',
      continueWithoutRestore: 'Continue without restoring',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.es;

  if (!mounted) {
    return (
      <>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
        </div>
      </>
    );
  }

  const getPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#10b981';
    if (percentage >= 75) return '#3b82f6';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getMealTypeLabel = (mealType: string): string => {
    const labels: Record<MealType, string> = {
      'desayuno': t.breakfast,
      'almuerzo': t.lunch,
      'cena': t.dinner,
      'snack': t.snack,
    };
    return labels[mealType as MealType] || mealType;
  };

  const getMealTypeIcon = (mealType: string): string => {
    const icons: Record<MealType, string> = {
      'desayuno': 'ri-sun-line',
      'almuerzo': 'ri-restaurant-line',
      'cena': 'ri-moon-line',
      'snack': 'ri-cake-line',
    };
    return icons[mealType as MealType] || 'ri-restaurant-line';
  };

  const getMealTypeColor = (mealType: string): string => {
    const colors: Record<MealType, string> = {
      'desayuno': '#fbbf24',
      'almuerzo': '#10b981',
      'cena': '#6366f1',
      'snack': '#f59e0b',
    };
    return colors[mealType as MealType] || '#6b7280';
  };

  const formatTime = (timestamp: string): string => {
    try {
      return deviceTime.formatTimestamp(timestamp, {
        includeDate: false,
        includeTime: true,
        timeOptions: { use24Hour: true }
      });
    } catch (error) {
      // Fallback seguro
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const groupMealsByType = (meals: Meal[]): Record<string, Meal[]> => {
    const grouped = meals.reduce((acc, meal) => {
      if (!acc[meal.mealType]) {
        acc[meal.mealType] = [];
      }
      acc[meal.mealType].push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);
    return grouped;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 16px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 4px 0',
                fontFamily: 'Pacifico, serif',
              }}
            >
              ProFitness
            </h1>
            <p
              style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0,
                textTransform: 'capitalize',
              }}
              suppressHydrationWarning={true}
            >
              {currentDate}
              {currentTime && (
                <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.8 }}>
                  {currentTime}
                </span>
              )}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CloudSyncManager />
            <Link
              href="/profile"
              className="!rounded-button"
              style={{
                textDecoration: 'none',
                width: '48px',
                height: '48px',
                background: userData?.picture
                  ? `url(${userData.picture})`
                  : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!userData?.picture && (
                <span
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '16px',
                  }}
                >
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: '24px 16px 100px 16px',
        }}
      >
        {/* Progress Summary */}
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
              }}
            >
              {t.dailyProgress}
            </h2>
            <Link
              href="/add-food"
              className="!rounded-button"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="ri-add-line" style={{ fontSize: '16px' }}></i>
              {t.add}
            </Link>
          </div>

          {/* Calories Progress */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {t.calories}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {nutritionData.calories} / {nutritionData.targetCalories}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${getPercentage(
                    nutritionData.calories,
                    nutritionData.targetCalories
                  )}%`,
                  height: '100%',
                  backgroundColor: getProgressColor(
                    getPercentage(nutritionData.calories, nutritionData.targetCalories)
                  ),
                  transition: 'width 0.3s ease',
                }}
              ></div>
            </div>
          </div>

          {/* Macros Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {/* Proteínas */}
            <div
              style={{
                textAlign: 'center',
                padding: '12px 8px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px auto',
                }}
              >
                <i
                  className="ri-bread-line"
                  style={{ color: '#16a34a', fontSize: '16px' }}
                ></i>
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                }}
              >
                {t.protein}
              </p>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0',
                }}
              >
                {Math.round(nutritionData.protein * 10) / 10}g
              </p>
              <p
                style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  margin: 0,
                }}
              >
                {t.of} {nutritionData.targetProtein}g
              </p>
            </div>

            {/* Carbohidratos */}
            <div
              style={{
                textAlign: 'center',
                padding: '12px 8px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px auto',
                }}
              >
                <i
                  className="ri-restaurant-line"
                  style={{ color: '#f59e0b', fontSize: '16px' }}
                ></i>
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                }}
              >
                {t.carbs}
              </p>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0',
                }}
              >
                {Math.round(nutritionData.carbs * 10) / 10}g
              </p>
              <p
                style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  margin: 0,
                }}
              >
                {t.of} {nutritionData.targetCarbs}g
              </p>
            </div>

            {/* Grasas */}
            <div
              style={{
                textAlign: 'center',
                padding: '12px 8px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#e0e7ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px auto',
                }}
              >
                <i
                  className="ri-drop-line"
                  style={{ color: '#6366f1', fontSize: '16px' }}
                ></i>
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                }}
              >
                {t.fats}
              </p>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0',
                }}
              >
                {Math.round(nutritionData.fats * 10) / 10}g
              </p>
              <p
                style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  margin: 0,
                }}
              >
                {t.of} {nutritionData.targetFats}g
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '24px',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0',
            }}
          >
            {t.quickActions}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px',
            }}
          >
            <Link
              href="/add-food"
              className="!rounded-button"
              style={{
                textDecoration: 'none',
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                border: '1px solid #e0e7ff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className="ri-add-line"
                  style={{ color: '#3b82f6', fontSize: '18px' }}
                ></i>
              </div>
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 2px 0',
                  }}
                >
                  {t.addFood}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0,
                  }}
                >
                  {t.registerFood}
                </p>
              </div>
            </Link>

            <Link
              href="/nutrition"
              className="!rounded-button"
              style={{
                textDecoration: 'none',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #dcfce7',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className="ri-pie-chart-line"
                  style={{ color: '#16a34a', fontSize: '18px' }}
                ></i>
              </div>
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 2px 0',
                  }}
                >
                  {t.viewNutrition}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0,
                  }}
                >
                  {t.dailyDetails}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Today's Meals */}
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0',
            }}
          >
            {t.todayMeals}
          </h3>
          {nutritionData.meals.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280',
              }}
            >
              <i
                className="ri-restaurant-line"
                style={{ fontSize: '48px', marginBottom: '16px' }}
              ></i>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  margin: '0 0 8px 0',
                }}
              >
                {t.noMealsRegistered}
              </p>
              <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>
                {t.startAdding}
              </p>
              <Link
                href="/add-food"
                className="!rounded-button"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="ri-add-line"></i>
                {t.addFirstMeal}
              </Link>
            </div>
          ) : (
            <div>
              {Object.entries(groupMealsByType(nutritionData.meals)).map(
                ([mealType, meals]) => (
                  <div
                    key={mealType}
                    style={{
                      marginBottom: '20px',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                        }}
                      >
                        <i
                          className={getMealTypeIcon(mealType)}
                          style={{
                            color: getMealTypeColor(mealType),
                            fontSize: '16px',
                          }}
                        ></i>
                      </div>
                      <h4
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0,
                        }}
                      >
                        {getMealTypeLabel(mealType)}
                      </h4>
                    </div>

                    {meals.map((meal) => (
                      <div
                        key={meal.id}
                        style={{
                          background: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1f2937',
                            }}
                          >
                            {meal.name}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#6b7280',
                            }}
                          >
                            {formatTime(meal.timestamp)}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              gap: '12px',
                              fontSize: '12px',
                              color: '#6b7280',
                            }}
                          >
                            <span>{meal.quantity}g</span>
                            <span>P: {Math.round(meal.protein * 10) / 10}g</span>
                            <span>C: {Math.round(meal.carbs * 10) / 10}g</span>
                            <span>G: {Math.round(meal.fats * 10) / 10}g</span>
                          </div>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#3b82f6',
                            }}
                          >
                            {meal.calories} cal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              <Link
                href="/add-food"
                className="!rounded-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px 16px',
                  background: '#f0f9ff',
                  border: '1px solid #e0e7ff',
                  borderRadius: '12px',
                  color: '#3b82f6',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                }}
              >
                <i className="ri-add-line"></i>
                {t.addMoreFood}
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Prompt de Restauración de Datos */}
      {showRestorePrompt && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 2000,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              width: '90%',
              maxWidth: '340px',
              zIndex: 2001,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <i
                  className="ri-cloud-line"
                  style={{ color: 'white', fontSize: '28px' }}
                ></i>
              </div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 8px 0',
                }}
              >
                {t.dataRestoreTitle}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0,
                }}
              >
                {t.dataRestoreMessage}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <button
                onClick={handleAutoRestore}
                className="!rounded-button"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <i className="ri-download-cloud-line"></i>
                {t.restore}
              </button>
              <button
                onClick={() => setShowRestorePrompt(false)}
                className="!rounded-button"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                {t.continueWithoutRestore}
              </button>
            </div>
          </div>
        </>
      )}

      <UpdateNotification />
      <InstallPrompt />
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

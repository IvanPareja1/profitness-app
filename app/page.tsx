
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import InstallPrompt from '../components/InstallPrompt';

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
  const [language, setLanguage] = useState('es');
  const [userData, setUserData] = useState<any>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    targetCalories: 2000,
    targetProtein: 120,
    targetCarbs: 250,
    targetFats: 67,
    meals: []
  });

  useEffect(() => {
    setMounted(true);

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
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);

    const loadTodayData = (): void => {
      try {
        const todayKey = today.toISOString().split('T')[0];
        const savedData = localStorage.getItem(`nutrition_${todayKey}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setNutritionData(prev => ({
            ...prev,
            calories: parsed.calories || 0,
            protein: parsed.protein || 0,
            carbs: parsed.carbs || 0,
            fats: parsed.fats || 0,
            meals: parsed.meals || []
          }));
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
      window.removeEventListener('nutritionDataUpdated', handleNutritionUpdate);
      window.removeEventListener('profileUpdated', handleLanguageChange);
    };
  }, []);

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
      snack: 'Snack'
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
      snack: 'Snack'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.es;

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
        }}>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
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
      'snack': t.snack
    };
    return labels[mealType as MealType] || mealType;
  };

  const getMealTypeIcon = (mealType: string): string => {
    const icons: Record<MealType, string> = {
      'desayuno': 'ri-sun-line',
      'almuerzo': 'ri-restaurant-line',
      'cena': 'ri-moon-line',
      'snack': 'ri-cake-line'
    };
    return icons[mealType as MealType] || 'ri-restaurant-line';
  };

  const getMealTypeColor = (mealType: string): string => {
    const colors: Record<MealType, string> = {
      'desayuno': '#fbbf24',
      'almuerzo': '#10b981',
      'cena': '#6366f1',
      'snack': '#f59e0b'
    };
    return colors[mealType as MealType] || '#6b7280';
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 16px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 4px 0',
              fontFamily: 'Pacifico, serif'
            }}>
              ProFitness
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0,
              textTransform: 'capitalize'
            }} suppressHydrationWarning={true}>
              {currentDate}
            </p>
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            background: userData?.picture ? `url(${userData.picture})` : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!userData?.picture && (
              <span style={{
                color: 'white',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '24px 16px 100px 16px'
      }}>
        {/* Progress Summary */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              {t.dailyProgress}
            </h2>
            <Link href="/add-food" className="!rounded-button" style={{
              textDecoration: 'none',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className="ri-add-line" style={{ fontSize: '16px' }}></i>
              {t.add}
            </Link>
          </div>

          {/* Calories Progress */}
          <div style={{
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937'
              }}>{t.calories}</span>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {nutritionData.calories} / {nutritionData.targetCalories}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${getPercentage(nutritionData.calories, nutritionData.targetCalories)}%`,
                height: '100%',
                backgroundColor: getProgressColor(getPercentage(nutritionData.calories, nutritionData.targetCalories)),
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          {/* Macros Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            {/* Proteínas */}
            <div style={{
              textAlign: 'center',
              padding: '12px 8px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
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
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.protein}</p>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                {Math.round(nutritionData.protein * 10) / 10}g
              </p>
              <p style={{
                fontSize: '10px',
                color: '#9ca3af',
                margin: 0
              }}>
                {t.of} {nutritionData.targetProtein}g
              </p>
            </div>

            {/* Carbohidratos */}
            <div style={{
              textAlign: 'center',
              padding: '12px 8px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-restaurant-line" style={{ color: '#f59e0b', fontSize: '16px' }}></i>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.carbs}</p>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                {Math.round(nutritionData.carbs * 10) / 10}g
              </p>
              <p style={{
                fontSize: '10px',
                color: '#9ca3af',
                margin: 0
              }}>
                {t.of} {nutritionData.targetCarbs}g
              </p>
            </div>

            {/* Grasas */}
            <div style={{
              textAlign: 'center',
              padding: '12px 8px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#e0e7ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-drop-line" style={{ color: '#6366f1', fontSize: '16px' }}></i>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.fats}</p>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                {Math.round(nutritionData.fats * 10) / 10}g
              </p>
              <p style={{
                fontSize: '10px',
                color: '#9ca3af',
                margin: 0
              }}>
                {t.of} {nutritionData.targetFats}g
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 16px 0'
          }}>
            {t.quickActions}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            <Link href="/add-food" className="!rounded-button" style={{
              textDecoration: 'none',
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              border: '1px solid #e0e7ff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-add-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 2px 0'
                }}>
                  {t.addFood}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {t.registerFood}
                </p>
              </div>
            </Link>

            <Link href="/nutrition" className="!rounded-button" style={{
              textDecoration: 'none',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #dcfce7',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-pie-chart-line" style={{ color: '#16a34a', fontSize: '18px' }}></i>
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 2px 0'
                }}>
                  {t.viewNutrition}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {t.dailyDetails}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Today's Meals */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 16px 0'
          }}>
            {t.todayMeals}
          </h3>
          {nutritionData.meals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <i className="ri-restaurant-line" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                margin: '0 0 8px 0'
              }}>
                {t.noMealsRegistered}
              </p>
              <p style={{
                fontSize: '14px',
                margin: '0 0 16px 0'
              }}>
                {t.startAdding}
              </p>
              <Link href="/add-food" className="!rounded-button" style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '20px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="ri-add-line"></i>
                {t.addFirstMeal}
              </Link>
            </div>
          ) : (
            <div>
              {Object.entries(groupMealsByType(nutritionData.meals)).map(([mealType, meals]) => (
                <div key={mealType} style={{
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <i className={getMealTypeIcon(mealType)} style={{
                        color: getMealTypeColor(mealType),
                        fontSize: '16px'
                      }}></i>
                    </div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {getMealTypeLabel(mealType)}
                    </h4>
                  </div>

                  {meals.map((meal) => (
                    <div key={meal.id} style={{
                      background: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1f2937'
                        }}>
                          {meal.name}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {formatTime(meal.timestamp)}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          <span>{meal.quantity}g</span>
                          <span>P: {Math.round(meal.protein * 10) / 10}g</span>
                          <span>C: {Math.round(meal.carbs * 10) / 10}g</span>
                          <span>G: {Math.round(meal.fats * 10) / 10}g</span>
                        </div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#3b82f6'
                        }}>
                          {meal.calories} cal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <Link href="/add-food" className="!rounded-button" style={{
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
                textDecoration: 'none'
              }}>
                <i className="ri-add-line"></i>
                {t.addMoreFood}
              </Link>
            </div>
          )}
        </div>
      </main>

      <InstallPrompt />
      <BottomNavigation />
    </div>
  );
}

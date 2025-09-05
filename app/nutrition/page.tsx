
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import BottomNavigation from '../../components/BottomNavigation';
import { deviceTime } from '../../lib/device-time-utils';

interface Meal {
  id: string;
  name: string;
  mealType: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  timestamp: string;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  fiber: number;
  meals: Meal[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWater: number;
  targetFiber: number;
}

interface HydrationReminder {
  enabled: boolean;
  interval: number;
  startTime: string;
  endTime: string;
}

interface TempGoals {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWater: number;
  targetFiber: number;
}

interface CustomNutritionEvent extends CustomEvent {
  detail: {
    date: string;
    data: Partial<NutritionData>;
  };
}

export default function Nutrition() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    water: 0,
    fiber: 0,
    meals: [],
    targetCalories: 2000,
    targetProtein: 120,
    targetCarbs: 250,
    targetFats: 67,
    targetWater: 2500,
    targetFiber: 25
  });
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showHydrationModal, setShowHydrationModal] = useState(false);
  const [tempGoals, setTempGoals] = useState<TempGoals>({
    targetCalories: 2000,
    targetProtein: 120,
    targetCarbs: 250,
    targetFats: 67,
    targetWater: 2500,
    targetFiber: 25
  });
  const [hydrationReminder, setHydrationReminder] = useState<HydrationReminder>({
    enabled: false,
    interval: 60,
    startTime: '08:00',
    endTime: '22:00'
  });

  useEffect(() => {
    setMounted(true);

    const initializeDate = () => {
      try {
        const today = deviceTime.getCurrentDate();
        setSelectedDate(today);
        return today;
      } catch (error) {
        console.warn('Error obteniendo fecha del dispositivo, usando fallback:', error);
        const fallbackDate = new Date().toISOString().split('T')[0];
        setSelectedDate(fallbackDate);
        return fallbackDate;
      }
    };

    const currentDate = initializeDate();

    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      try {
        const profile = JSON.parse(profileData) as Partial<NutritionData>;
        const updatedData: NutritionData = {
          ...nutritionData,
          targetCalories: profile.targetCalories || 2000,
          targetProtein: profile.targetProtein || 120,
          targetCarbs: profile.targetCarbs || 250,
          targetFats: profile.targetFats || 67,
          targetWater: profile.targetWater || 2500,
          targetFiber: profile.targetFiber || 25
        };
        setNutritionData(updatedData);
        setTempGoals({
          targetCalories: updatedData.targetCalories,
          targetProtein: updatedData.targetProtein,
          targetCarbs: updatedData.targetCarbs,
          targetFats: updatedData.targetFats,
          targetWater: updatedData.targetWater,
          targetFiber: updatedData.targetFiber
        });
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }

    const restDaySettings = localStorage.getItem('restDaySettings');
    if (restDaySettings) {
      try {
        const restDay = JSON.parse(restDaySettings) as any;
        if (restDay.enabled && restDay.todayIsRestDay && restDay.autoAdjustMacros) {
          const restDayIndicator = document.createElement('div');
          restDayIndicator.innerHTML = `
            <div style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; z-index: 999;">
              <i class="ri-pause-circle-fill" style="margin-right: 6px;"></i>
              Día de descanso - Macros ajustados
            </div>
          `;
          document.body.appendChild(restDayIndicator);
          setTimeout(() => {
            if (document.body.contains(restDayIndicator)) {
              document.body.removeChild(restDayIndicator);
            }
          }, 5000);
        }
      } catch (error) {
        console.error('Error parsing rest day settings:', error);
      }
    }

    const savedReminder = localStorage.getItem('hydrationReminder');
    if (savedReminder) {
      try {
        const reminder = JSON.parse(savedReminder) as HydrationReminder;
        setHydrationReminder(reminder);
      } catch (error) {
        console.error('Error parsing hydration reminder:', error);
      }
    }

    loadNutritionData(currentDate);

    const handleNutritionUpdate = (event: Event) => {
      const customEvent = event as CustomNutritionEvent;
      if (customEvent.detail.date === selectedDate) {
        setNutritionData(prev => ({ ...prev, ...customEvent.detail.data }));
      }
    };

    window.addEventListener('nutritionDataUpdated', handleNutritionUpdate);

    return () => {
      window.removeEventListener('nutritionDataUpdated', handleNutritionUpdate);
    };
  }, []);

  useEffect(() => {
    if (selectedDate && mounted) {
      loadNutritionData(selectedDate);
    }
  }, [selectedDate, mounted]);

  const loadNutritionData = (date: string) => {
    const savedData = localStorage.getItem(`nutrition_${date}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as Partial<NutritionData>;
        setNutritionData(prev => ({
          ...prev,
          ...parsed,
          targetCalories: prev.targetCalories,
          targetProtein: prev.targetProtein,
          targetCarbs: prev.targetCarbs,
          targetFats: prev.targetFats,
          targetWater: prev.targetWater,
          targetFiber: prev.targetFiber
        }));
      } catch (error) {
        console.error('Error parsing nutrition data:', error);
      }
    } else {
      setNutritionData(prev => ({
        ...prev,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        water: 0,
        fiber: 0,
        meals: []
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const getPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#10b981';
    if (percentage >= 75) return '#3b82f6';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      if (deviceTime.getLocale) {
        const locale = deviceTime.getLocale();
        return date.toLocaleDateString(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formateando fecha:', error);
      return dateString;
    }
  };

  const groupMealsByType = (meals: Meal[]): { [key: string]: Meal[] } => {
    const groups: { [key: string]: Meal[] } = {};
    meals.forEach(meal => {
      if (!groups[meal.mealType]) {
        groups[meal.mealType] = [];
      }
      groups[meal.mealType].push(meal);
    });
    return groups;
  };

  const deleteMeal = (mealId: string) => {
    const updatedMeals = nutritionData.meals.filter(meal => meal.id !== mealId);
    const deletedMeal = nutritionData.meals.find(meal => meal.id === mealId);

    if (deletedMeal) {
      const updatedData: NutritionData = {
        ...nutritionData,
        meals: updatedMeals,
        calories: nutritionData.calories - deletedMeal.calories,
        protein: nutritionData.protein - deletedMeal.protein,
        carbs: nutritionData.carbs - deletedMeal.carbs,
        fats: nutritionData.fats - deletedMeal.fats
      };

      setNutritionData(updatedData);
      localStorage.setItem(`nutrition_${selectedDate}`, JSON.stringify(updatedData));

      window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
        detail: { date: selectedDate, data: updatedData }
      }));
    }
  };

  const updateWaterIntake = (amount: number) => {
    const newWater = Math.max(0, nutritionData.water + amount);
    const updatedData: NutritionData = {
      ...nutritionData,
      water: newWater
    };

    setNutritionData(updatedData);
    localStorage.setItem(`nutrition_${selectedDate}`, JSON.stringify(updatedData));

    window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
      detail: { date: selectedDate, data: updatedData }
    }));
  };

  const updateFiberIntake = (amount: number) => {
    const newFiber = Math.max(0, nutritionData.fiber + amount);
    const updatedData: NutritionData = {
      ...nutritionData,
      fiber: newFiber
    };

    setNutritionData(updatedData);
    localStorage.setItem(`nutrition_${selectedDate}`, JSON.stringify(updatedData));

    window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
      detail: { date: selectedDate, data: updatedData }
    }));
  };

  const handleSaveGoals = () => {
    const updatedData: NutritionData = {
      ...nutritionData,
      targetCalories: tempGoals.targetCalories,
      targetProtein: tempGoals.targetProtein,
      targetCarbs: tempGoals.targetCarbs,
      targetFats: tempGoals.targetFats,
      targetWater: tempGoals.targetWater,
      targetFiber: tempGoals.targetFiber
    };

    setNutritionData(updatedData);

    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      try {
        const profile = JSON.parse(profileData) as any;
        profile.targetCalories = tempGoals.targetCalories;
        profile.targetProtein = tempGoals.targetProtein;
        profile.targetCarbs = tempGoals.targetCarbs;
        profile.targetFats = tempGoals.targetFats;
        profile.targetWater = tempGoals.targetWater;
        profile.targetFiber = tempGoals.targetFiber;
        localStorage.setItem('userProfile', JSON.stringify(profile));
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }

    setShowGoalsModal(false);
  };

  const handleSaveHydrationReminder = () => {
    localStorage.setItem('hydrationReminder', JSON.stringify(hydrationReminder));

    if (hydrationReminder.enabled) {
      const successMessage = document.createElement('div');
      successMessage.innerHTML = `
        <div style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #dcfce7; border: 1px solid #bbf7d0; color: #16a34a; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; z-index: 999;">
          <i class="ri-check-circle-fill" style="margin-right: 6px;"></i>
          Recordatorio de hidratación activado
        </div>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    }

    setShowHydrationModal(false);
  };

  const handleNumberInput = (
    value: string,
    setter: (goals: TempGoals) => void,
    field: keyof TempGoals
  ) => {
    const numValue = parseInt(value) || 0;
    setter({ ...tempGoals, [field]: numValue });
  };

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

  const mealGroups = groupMealsByType(nutritionData.meals);

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
            Nutrición
          </h1>
        </div>
      </header>

      <main style={{ padding: '24px 16px' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          />
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '8px',
            marginBottom: 0,
            textTransform: 'capitalize'
          }}>
            {formatDate(selectedDate)}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
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
              Resumen Nutricional
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {(() => {
                try {
                  const restDaySettings = localStorage.getItem('restDaySettings');
                  if (restDaySettings) {
                    const restDay = JSON.parse(restDaySettings) as any;
                    if (restDay.enabled && restDay.todayIsRestDay) {
                      return (
                        <div style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <i className="ri-pause-circle-fill" style={{ fontSize: '12px' }}></i>
                          Descanso
                        </div>
                      );
                    }
                  }
                } catch (error) {
                  console.error('Error checking rest day:', error);
                }
                return null;
              })()}
              <button
                onClick={() => setShowGoalsModal(true)}
                className="!rounded-button"
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #e0e7ff',
                  color: '#3b82f6',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="ri-settings-line"></i>
                Ajustar Metas
              </button>
            </div>
          </div>

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
              }}>
                Calorías
              </span>
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '24px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '12px 6px',
              backgroundColor: '#f8fafc',
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
                <i className="ri-bread-line" style={{ color: '#16a34a', fontSize: '14px' }}></i>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                Proteínas
              </p>
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
                de {nutritionData.targetProtein}g
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '12px 6px',
              backgroundColor: '#f8fafc',
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
                <i className="ri-restaurant-line" style={{ color: '#f59e0b', fontSize: '14px' }}></i>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                Carbohidratos
              </p>
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
                de {nutritionData.targetCarbs}g
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '12px 6px',
              backgroundColor: '#f8fafc',
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
                <i className="ri-drop-line" style={{ color: '#6366f1', fontSize: '14px' }}></i>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                Grasas
              </p>
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
                de {nutritionData.targetFats}g
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }}>
            <div style={{
              background: '#f0f9ff',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid #e0e7ff'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <i className="ri-drop-line" style={{ color: '#06b6d4', fontSize: '16px' }}></i>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Hidratación
                  </span>
                </div>
                <button
                  onClick={() => setShowHydrationModal(true)}
                  className="!rounded-button"
                  style={{
                    width: '24px',
                    height: '24px',
                    background: hydrationReminder.enabled ? '#06b6d4' : '#e0e7ff',
                    border: 'none',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <i className="ri-alarm-line" style={{
                    color: hydrationReminder.enabled ? 'white' : '#6b7280',
                    fontSize: '12px'
                  }}></i>
                </button>
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 6px 0'
              }}>
                {nutritionData.water}ml
              </p>
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                margin: '0 0 10px 0'
              }}>
                de {nutritionData.targetWater}ml
              </p>
              <div style={{
                width: '100%',
                height: '5px',
                backgroundColor: '#e0e7ff',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <div style={{
                  width: `${getPercentage(nutritionData.water, nutritionData.targetWater)}%`,
                  height: '100%',
                  backgroundColor: '#06b6d4',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{
                display: 'flex',
                gap: '4px'
              }}>
                <button
                  onClick={() => updateWaterIntake(250)}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    background: '#06b6d4',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  +250ml
                </button>
                <button
                  onClick={() => updateWaterIntake(-250)}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#374151',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  -250ml
                </button>
              </div>
            </div>

            <div style={{
              background: '#f0fdf4',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid #dcfce7'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px'
              }}>
                <i className="ri-plant-line" style={{ color: '#16a34a', fontSize: '16px' }}></i>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Fibra
                </span>
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 6px 0'
              }}>
                {Math.round(nutritionData.fiber * 10) / 10}g
              </p>
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                margin: '0 0 10px 0'
              }}>
                de {nutritionData.targetFiber}g
              </p>
              <div style={{
                width: '100%',
                height: '5px',
                backgroundColor: '#dcfce7',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <div style={{
                  width: `${getPercentage(nutritionData.fiber, nutritionData.targetFiber)}%`,
                  height: '100%',
                  backgroundColor: '#16a34a',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{
                display: 'flex',
                gap: '4px'
              }}>
                <button
                  onClick={() => updateFiberIntake(5)}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    background: '#16a34a',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  +5g
                </button>
                <button
                  onClick={() => updateFiberIntake(-5)}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#374151',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  -5g
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
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
              Comidas del Día
            </h2>
            <Link href="/add-food" className="!rounded-button" style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className="ri-add-line" style={{ fontSize: '16px' }}></i>
              Agregar
            </Link>
          </div>

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
                No hay comidas registradas
              </p>
              <p style={{
                fontSize: '14px',
                margin: '0 0 16px 0'
              }}>
                Agrega tu primera comida para ver el resumen
              </p>
            </div>
          ) : (
              <div>
                {Object.entries(mealGroups).map(([mealType, meals]) => (
                  <div key={mealType} style={{ marginBottom: '24px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '12px',
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {mealType === 'desayuno' && <i className="ri-sun-line" style={{ color: '#f59e0b' }}></i>}
                      {mealType === 'almuerzo' && <i className="ri-sun-fill" style={{ color: '#f97316' }}></i>}
                      {mealType === 'cena' && <i className="ri-moon-line" style={{ color: '#6366f1' }}></i>}
                      {mealType === 'snack' && <i className="ri-apple-line" style={{ color: '#10b981' }}></i>}
                      {mealType === 'liquid' && <i className="ri-drop-line" style={{ color: '#06b6d4' }}></i>}
                      {mealType === 'liquid' ? 'Líquidos' : mealType}
                    </h3>
                    {meals.map((meal) => (
                      <div key={meal.id} style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {meal.name}
                          </h4>
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="!rounded-button"
                            style={{
                              width: '32px',
                              height: '32px',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <i className="ri-delete-bin-line" style={{ color: '#dc2626', fontSize: '16px' }}></i>
                          </button>
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '8px'
                        }}>
                          {meal.quantity}{mealType === 'liquid' ? 'ml' : 'g'}
                        </p>
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          fontSize: '14px',
                          color: '#374151'
                        }}>
                          <span><strong>{meal.calories}</strong> cal</span>
                          <span>P: <strong>{Math.round(meal.protein * 10) / 10}</strong>g</span>
                          <span>C: <strong>{Math.round(meal.carbs * 10) / 10}</strong>g</span>
                          <span>G: <strong>{Math.round(meal.fats * 10) / 10}</strong>g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>

      {showHydrationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
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
            maxWidth: '350px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Recordatorio de Hidratación
              </h3>
              <button
                onClick={() => setShowHydrationModal(false)}
                className="!rounded-button"
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '16px' }}></i>
              </button>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #e0e7ff'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#06b6d4',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-drop-line" style={{ color: 'white', fontSize: '20px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    Mantente hidratado
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Configura recordatorios automáticos
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <input
                  type="checkbox"
                  id="enableReminder"
                  checked={hydrationReminder.enabled}
                  onChange={(e) => setHydrationReminder({
                    ...hydrationReminder,
                    enabled: e.target.checked
                  })}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#06b6d4'
                  }}
                />
                <label htmlFor="enableReminder" style={{
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}>
                  Activar recordatorios
                </label>
              </div>

              {hydrationReminder.enabled && (
                <div style={{
                  display: 'grid',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Recordar cada (minutos)
                    </label>
                    <select
                      value={hydrationReminder.interval}
                      onChange={(e) => setHydrationReminder({
                        ...hydrationReminder,
                        interval: parseInt(e.target.value)
                      })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1.5 horas</option>
                      <option value={120}>2 horas</option>
                      <option value={180}>3 horas</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Hora inicio
                      </label>
                      <input
                        type="time"
                        value={hydrationReminder.startTime}
                        onChange={(e) => setHydrationReminder({
                          ...hydrationReminder,
                          startTime: e.target.value
                        })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Hora fin
                      </label>
                      <input
                        type="time"
                        value={hydrationReminder.endTime}
                        onChange={(e) => setHydrationReminder({
                          ...hydrationReminder,
                          endTime: e.target.value
                        })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowHydrationModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHydrationReminder}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showGoalsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Configurar Metas
              </h3>
              <button
                onClick={() => setShowGoalsModal(false)}
                className="!rounded-button"
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '16px' }}></i>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Calorías
                </label>
                <input
                  type="number"
                  value={tempGoals.targetCalories}
                  onChange={(e) => handleNumberInput(e.target.value, setTempGoals, 'targetCalories')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Proteína (g)
                </label>
                <input
                  type="number"
                  value={tempGoals.targetProtein}
                  onChange={(e) => handleNumberInput(e.target.value, setTempGoals, 'targetProtein')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Carbohidratos (g)
                </label>
                <input
                  type="number"
                  value={tempGoals.targetCarbs}
                  onChange={(e) => handleNumberInput(e.target.value, setTempGoals, 'targetCarbs')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Grasas (g)
                </label>
                <input
                  type="number"
                  value={tempGoals.targetFats}
                  onChange={(e) => handleNumberInput(e.target.value, setTempGoals, 'targetFats')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Hidratación (ml)
                </label>
                <input
                  type="number"
                  value={tempGoals.targetWater}
                  onChange={(e) => handleNumberInput(e.target.value, setTempGoals, 'targetWater')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Fibra (g)
                </label>
                <input
                  type="number"
                  value={tempGoals.targetFiber}
                  onChange={(e) => handleNumberInput(e.target.value, setTempGoals, 'targetFiber')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowGoalsModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGoals}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Guardar Metas
              </button>
            </div>
          </div>
        </div>
      )}

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '8px 0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          maxWidth: '375px',
          margin: '0 auto'
        }}>
          <Link href="/" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 4px',
            textDecoration: 'none',
            color: '#9ca3af'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-home-line" style={{ fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px' }}>Inicio</span>
          </Link>

          <Link href="/nutrition" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 4px',
            textDecoration: 'none',
            color: '#3b82f6'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-pie-chart-fill" style={{ fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Nutrición</span>
          </Link>

          <Link href="/add-food" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 4px',
            textDecoration: 'none',
            color: '#9ca3af'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-add-line" style={{ color: 'white', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px' }}>Agregar</span>
          </Link>

          <Link href="/progress" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 4px',
            textDecoration: 'none',
            color: '#9ca3af'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-line-chart-line" style={{ fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px' }}>Progreso</span>
          </Link>

          <Link href="/profile" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 4px',
            textDecoration: 'none',
            color: '#9ca3af'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-user-line" style={{ fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px' }}>Perfil</span>
          </Link>
        </div>
      </nav>

      <BottomNavigation />
    </div>
  );
}

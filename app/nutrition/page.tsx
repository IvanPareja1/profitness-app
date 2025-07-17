
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Nutrition() {
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [mounted, setMounted] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showHydrationModal, setShowHydrationModal] = useState(false);
  const [showHydrationSettings, setShowHydrationSettings] = useState(false);
  const [hydrationGoal, setHydrationGoal] = useState(2.5);
  const [currentHydration, setCurrentHydration] = useState(0);
  const [hydrationReminders, setHydrationReminders] = useState({
    enabled: false,
    interval: 3, // horas
    amount: 250, // ml
    startTime: '07:00',
    endTime: '22:00'
  });
  const [tempHydrationGoal, setTempHydrationGoal] = useState(2.5);
  const [tempReminders, setTempReminders] = useState({
    enabled: false,
    interval: 3,
    amount: 250,
    startTime: '07:00',
    endTime: '22:00'
  });

  const [showLiquidIntakeModal, setShowLiquidIntakeModal] = useState(false);
  const [liquidIntake, setLiquidIntake] = useState([
    { type: 'water', name: 'Agua', amount: 0, icon: 'ri-drop-line', color: 'blue' },
    { type: 'coffee', name: 'Café', amount: 0, icon: 'ri-cup-line', color: 'orange' },
    { type: 'tea', name: 'Té', amount: 0, icon: 'ri-cup-line', color: 'green' },
    { type: 'juice', name: 'Jugos', amount: 0, icon: 'ri-glass-line', color: 'purple' }
  ]);
  const [selectedLiquidType, setSelectedLiquidType] = useState('water');
  const [customAmount, setCustomAmount] = useState('');
  const [showFiberModal, setShowFiberModal] = useState(false);
  const [fiberGoal, setFiberGoal] = useState(30);
  const [currentFiber, setCurrentFiber] = useState(0);
  const [showFiberSettings, setShowFiberSettings] = useState(false);
  const [tempFiberGoal, setTempFiberGoal] = useState(30);
  const [fiberFoods, setFiberFoods] = useState([
    { name: 'Avena', fiber: 10, icon: 'ri-bowl-line', category: 'Cereales' },
    { name: 'Manzana', fiber: 4, icon: 'ri-apple-line', category: 'Frutas' },
    { name: 'Brócoli', fiber: 8, icon: 'ri-leaf-line', category: 'Verduras' },
    { name: 'Lentejas', fiber: 6, icon: 'ri-bowl-line', category: 'Legumbres' }
  ]);

  const [dailyMacros, setDailyMacros] = useState({
    protein: { consumed: 0, target: 140, percentage: 0 },
    carbs: { consumed: 0, target: 215, percentage: 0 },
    fats: { consumed: 0, target: 72, percentage: 0 }
  });

  const [mealBreakdown, setMealBreakdown] = useState([
    { 
      name: 'Desayuno', 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fats: 0,
      foods: []
    },
    { 
      name: 'Almuerzo', 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fats: 0,
      foods: []
    },
    { 
      name: 'Merienda', 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fats: 0,
      foods: []
    },
    { 
      name: 'Cena', 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fats: 0,
      foods: []
    }
  ]);

  const totalCalories = mealBreakdown.reduce((sum, meal) => sum + meal.calories, 0);
  const calorieTarget = 2150;

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const checkDailyReset = () => {
    const today = getCurrentDate();
    const lastResetDate = localStorage.getItem('lastResetDate');
    
    if (lastResetDate !== today) {
      console.log('Reiniciando datos diarios - Nueva fecha:', today);
      
      if (lastResetDate && (currentHydration > 0 || currentFiber > 0 || totalCalories > 0)) {
        const historicalData = {
          date: lastResetDate,
          hydration: currentHydration,
          fiber: currentFiber,
          calories: totalCalories,
          macros: dailyMacros,
          meals: mealBreakdown
        };
        
        const existingHistory = localStorage.getItem('dailyNutritionHistory');
        let history = [];
        if (existingHistory) {
          try {
            history = JSON.parse(existingHistory);
          } catch (e) {
            history = [];
          }
        }
        
        history.push(historicalData);
        if (history.length > 30) {
          history = history.slice(-30);
        }
        
        localStorage.setItem('dailyNutritionHistory', JSON.stringify(history));
      }
      
      resetDailyData();
      
      localStorage.setItem('lastResetDate', today);
    }
  };

  const resetDailyData = () => {
    console.log('Reiniciando datos diarios a cero');
    
    setCurrentHydration(0);
    localStorage.setItem('currentHydration', '0');
    
    setCurrentFiber(0);
    localStorage.setItem('currentFiber', '0');
    
    const resetLiquids = [
      { type: 'water', name: 'Agua', amount: 0, icon: 'ri-drop-line', color: 'blue' },
      { type: 'coffee', name: 'Café', amount: 0, icon: 'ri-cup-line', color: 'orange' },
      { type: 'tea', name: 'Té', amount: 0, icon: 'ri-cup-line', color: 'green' },
      { type: 'juice', name: 'Jugos', amount: 0, icon: 'ri-glass-line', color: 'purple' }
    ];
    setLiquidIntake(resetLiquids);
    localStorage.setItem('liquidIntake', JSON.stringify(resetLiquids));
    
    const resetMacros = {
      protein: { consumed: 0, target: 140, percentage: 0 },
      carbs: { consumed: 0, target: 215, percentage: 0 },
      fats: { consumed: 0, target: 72, percentage: 0 }
    };
    setDailyMacros(resetMacros);
    localStorage.setItem('dailyMacros', JSON.stringify(resetMacros));
    
    const resetMeals = [
      { name: 'Desayuno', calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] },
      { name: 'Almuerzo', calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] },
      { name: 'Merienda', calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] },
      { name: 'Cena', calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] }
    ];
    setMealBreakdown(resetMeals);
    localStorage.setItem('mealBreakdown', JSON.stringify(resetMeals));
  };

  const loadDailyData = () => {
    try {
      const today = getCurrentDate();
      const savedDate = localStorage.getItem('currentDataDate');
      
      if (savedDate === today) {
        const savedHydration = localStorage.getItem('currentHydration');
        const savedFiber = localStorage.getItem('currentFiber');
        const savedLiquids = localStorage.getItem('liquidIntake');
        const savedMacros = localStorage.getItem('dailyMacros');
        const savedMeals = localStorage.getItem('mealBreakdown');
        
        if (savedHydration) setCurrentHydration(parseFloat(savedHydration));
        if (savedFiber) setCurrentFiber(parseFloat(savedFiber));
        if (savedLiquids) setLiquidIntake(JSON.parse(savedLiquids));
        if (savedMacros) setDailyMacros(JSON.parse(savedMacros));
        if (savedMeals) setMealBreakdown(JSON.parse(savedMeals));
      }
      
      const savedHydrationGoal = localStorage.getItem('hydrationGoal');
      const savedReminders = localStorage.getItem('hydrationReminders');
      const savedFiberGoal = localStorage.getItem('fiberGoal');

      if (savedHydrationGoal) setHydrationGoal(parseFloat(savedHydrationGoal));
      if (savedReminders) setHydrationReminders(JSON.parse(savedReminders));
      if (savedFiberGoal) setFiberGoal(parseFloat(savedFiberGoal));
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const saveDailyData = () => {
    const today = getCurrentDate();
    localStorage.setItem('currentDataDate', today);
    localStorage.setItem('currentHydration', currentHydration.toString());
    localStorage.setItem('currentFiber', currentFiber.toString());
    localStorage.setItem('liquidIntake', JSON.stringify(liquidIntake));
    localStorage.setItem('dailyMacros', JSON.stringify(dailyMacros));
    localStorage.setItem('mealBreakdown', JSON.stringify(mealBreakdown));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleExportData = () => {
    setShowOptionsMenu(false);
    console.log('Exportando datos de nutrición...');
  };

  const handleShareProgress = () => {
    setShowOptionsMenu(false);
    console.log('Compartiendo progreso...');
  };

  const handlePrintReport = () => {
    setShowOptionsMenu(false);
    console.log('Imprimiendo reporte...');
  };

  const handleHydrationClick = () => {
    setShowHydrationModal(true);
  };

  const handleAddWater = (amount: number) => {
    const newAmount = Math.min(currentHydration + amount / 1000, hydrationGoal);
    setCurrentHydration(parseFloat(newAmount.toFixed(1)));
  };

  const handleHydrationSettings = () => {
    setTempHydrationGoal(hydrationGoal);
    setTempReminders(hydrationReminders);
    setShowHydrationModal(false);
    setShowHydrationSettings(true);
  };

  const handleSaveHydrationSettings = () => {
    setHydrationGoal(tempHydrationGoal);
    setHydrationReminders(tempReminders);

    if (tempReminders.enabled) {
      const totalHours = calculateTotalActiveHours(tempReminders.startTime, tempReminders.endTime);
      const reminderCount = Math.floor(totalHours / tempReminders.interval);
      const calculatedAmount = Math.round((tempHydrationGoal * 1000) / reminderCount);

      setTempReminders(prev => ({ 
        ...prev, 
        amount: calculatedAmount 
      }));
      setHydrationReminders(prev => ({ 
        ...prev, 
        amount: calculatedAmount 
      }));

      console.log(`Configurado: ${calculatedAmount}ml cada ${tempReminders.interval} horas`);
      console.log(`Total de recordatorios: ${reminderCount} durante ${totalHours} horas`);
    }

    setShowHydrationSettings(false);
  };

  const calculateTotalActiveHours = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const totalMinutes = endMinutes > startMinutes ? 
      endMinutes - startMinutes : 
      (24 * 60) - startMinutes + endMinutes;

    return Math.round(totalMinutes / 60);
  };

  const getHydrationPercentage = () => {
    return Math.min((currentHydration / hydrationGoal) * 100, 100);
  };

  const handleAddLiquid = (amount: number, type: string = 'water') => {
    if (type === 'water') {
      const newAmount = Math.min(currentHydration + amount / 1000, hydrationGoal);
      setCurrentHydration(parseFloat(newAmount.toFixed(1)));
    }

    setLiquidIntake(prev => 
      prev.map(liquid => 
        liquid.type === type 
          ? { ...liquid, amount: liquid.amount + amount }
          : liquid
      )
    );
  };

  const handleCustomAmountAdd = () => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0 && amount <= 2000) {
      handleAddLiquid(amount, selectedLiquidType);
      setCustomAmount('');
    }
  };

  const getTotalLiquidIntake = () => {
    return liquidIntake.reduce((total, liquid) => total + liquid.amount, 0);
  };

  const getFiberPercentage = () => {
    return Math.min((currentFiber / fiberGoal) * 100, 100);
  };

  const handleAddFiber = (fiberAmount) => {
    const newAmount = Math.min(currentFiber + fiberAmount, fiberGoal * 1.5);
    setCurrentFiber(newAmount);
  };

  const handleFiberSettings = () => {
    setTempFiberGoal(fiberGoal);
    setShowFiberModal(false);
    setShowFiberSettings(true);
  };

  const handleSaveFiberSettings = () => {
    setFiberGoal(tempFiberGoal);
    setShowFiberSettings(false);
  };

  const getFiberRecommendations = () => {
    const remaining = fiberGoal - currentFiber;
    if (remaining <= 0) return [];

    const recommendations = [
      { name: '1 taza de frambuesas', fiber: 8, icon: 'ri-apple-line' },
      { name: '1 pera mediana', fiber: 6, icon: 'ri-apple-line' },
      { name: '1/2 taza de frijoles', fiber: 7, icon: 'ri-bowl-line' },
      { name: '1 rebanada de pan integral', fiber: 3, icon: 'ri-cake-line' },
      { name: '1 taza de espinacas', fiber: 4, icon: 'ri-leaf-line' },
      { name: '2 cucharadas de semillas de chía', fiber: 10, icon: 'ri-seedling-line' }
    ];

    return recommendations.filter(rec => rec.fiber <= remaining + 3);
  };

  useEffect(() => {
    setMounted(true);
    
    checkDailyReset();
    
    loadDailyData();
  }, []);

  useEffect(() => {
    if (mounted) {
      saveDailyData();
      
      localStorage.setItem('hydrationGoal', hydrationGoal.toString());
      localStorage.setItem('hydrationReminders', JSON.stringify(hydrationReminders));
      localStorage.setItem('fiberGoal', fiberGoal.toString());
    }
  }, [hydrationGoal, currentHydration, hydrationReminders, fiberGoal, currentFiber, liquidIntake, dailyMacros, mealBreakdown, mounted]);

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px'
        }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>Nutrición</h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button 
              onClick={() => setShowDatePicker(true)}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <i className="ri-calendar-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-more-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              </button>

              {/* Options Menu Dropdown */}
              {showOptionsMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  padding: '8px 0',
                  minWidth: '192px',
                  zIndex: 50
                }}>
                  <button
                    onClick={handleExportData}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <i className="ri-download-line" style={{ color: '#2563eb', fontSize: '14px' }}></i>
                    </div>
                    <span style={{ color: '#374151', fontSize: '14px' }}>Exportar datos</span>
                  </button>

                  <button
                    onClick={handleShareProgress}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <i className="ri-share-line" style={{ color: '#16a34a', fontSize: '14px' }}></i>
                    </div>
                    <span style={{ color: '#374151', fontSize: '14px' }}>Compartir progreso</span>
                  </button>

                  <button
                    onClick={handlePrintReport}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f3e8ff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <i className="ri-printer-line" style={{ color: '#9333ea', fontSize: '14px' }}></i>
                    </div>
                    <span style={{ color: '#374151', fontSize: '14px' }}>Imprimir reporte</span>
                  </button>

                  <div style={{
                    borderTop: '1px solid #f3f4f6',
                    margin: '8px 0'
                  }}></div>

                  <Link href="/nutrition-settings" style={{
                    display: 'block',
                    textDecoration: 'none'
                  }}>
                    <button style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <i className="ri-settings-line" style={{ color: '#6b7280', fontSize: '14px' }}></i>
                      </div>
                      <span style={{ color: '#374151', fontSize: '14px' }}>Configuración</span>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        padding: '64px 16px 80px 16px'
      }}>
        {/* Selected Date Display */}
        <div style={{ marginTop: '24px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 4px 0'
            }}>Fecha seleccionada</p>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>{formatDate(selectedDate)}</p>
          </div>
        </div>

        {/* Period Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px'
            }}>
              {[ 
                { id: 'day', label: 'Día' },
                { id: 'week', label: 'Semana' },
                { id: 'month', label: 'Mes' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className="!rounded-button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedPeriod === period.id 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                      : 'transparent',
                    color: selectedPeriod === period.id ? 'white' : '#6b7280'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPeriod !== period.id) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPeriod !== period.id) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calories Overview */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>{totalCalories} kcal</h2>
            <p style={{
              color: '#6b7280',
              margin: 0
            }}>de {calorieTarget} kcal objetivo</p>
            <div style={{
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '12px',
              height: '8px',
              marginTop: '12px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  height: '8px',
                  borderRadius: '12px',
                  transition: 'all 0.3s',
                  width: `${Math.min((totalCalories / calorieTarget) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>

          {/* Macros Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                margin: '0 auto 8px auto'
              }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${dailyMacros.protein.percentage}, 100`}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#ef4444'
                  }}>{dailyMacros.protein.percentage}%</span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>Proteínas</p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>{dailyMacros.protein.consumed}g / {dailyMacros.protein.target}g</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                margin: '0 auto 8px auto'
              }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray={`${dailyMacros.carbs.percentage}, 100`}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#f59e0b'
                  }}>{dailyMacros.carbs.percentage}%</span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>Carbohidratos</p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>{dailyMacros.carbs.consumed}g / {dailyMacros.carbs.target}g</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                margin: '0 auto 8px auto'
              }}>
                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${dailyMacros.fats.percentage}, 100`}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#10b981'
                  }}>{dailyMacros.fats.percentage}%</span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>Grasas</p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>{dailyMacros.fats.consumed}g / {dailyMacros.fats.target}g</p>
            </div>
          </div>
        </div>

        {/* Meal Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>Desglose por comidas</h3>
            <Link href="/add-food" style={{
              color: '#3b82f6',
              fontSize: '14px',
              textDecoration: 'none'
            }}>Agregar comida</Link>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {mealBreakdown.map((meal, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>{meal.name}</h4>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>{meal.calories} kcal</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      margin: '0 0 4px 0'
                    }}>Proteínas</p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ef4444',
                      margin: 0
                    }}>{meal.protein}g</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      margin: '0 0 4px 0'
                    }}>Carbohidratos</p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#f59e0b',
                      margin: 0
                    }}>{meal.carbs}g</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      margin: '0 0 4px 0'
                    }}>Grasas</p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#10b981',
                      margin: 0
                    }}>{meal.fats}g</p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {meal.foods.map((food, foodIndex) => (
                    <span 
                      key={foodIndex}
                      style={{
                        fontSize: '12px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        padding: '4px 8px',
                        borderRadius: '16px'
                      }}
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          <button 
            onClick={handleHydrationClick}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f9ff'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto'
            }}>
              <i className="ri-drop-line" style={{ color: '#2563eb', fontSize: '18px' }}></i>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>Hidratación</p>
            <p style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>{currentHydration}L</p>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: '4px 0 8px 0'
            }}>Meta: {hydrationGoal}L</p>
            <div style={{
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              height: '4px',
              marginTop: '8px'
            }}>
              <div 
                style={{
                  backgroundColor: '#3b82f6',
                  height: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.3s',
                  width: `${getHydrationPercentage()}%`
                }}
              ></div>
            </div>
          </button>

          <button 
            onClick={() => setShowFiberModal(true)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0fdf4'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto'
            }}>
              <i className="ri-leaf-line" style={{ color: '#16a34a', fontSize: '18px' }}></i>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>Fibra</p>
            <p style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>{currentFiber}g</p>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: '4px 0 8px 0'
            }}>Meta: {fiberGoal}g</p>
            <div style={{
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              height: '4px',
              marginTop: '8px'
            }}>
              <div 
                style={{
                  backgroundColor: '#16a34a',
                  height: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.3s',
                  width: `${getFiberPercentage()}%`
                }}
              ></div>
            </div>
          </button>
        </div>

      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          padding: '8px 0'
        }}>
          <Link href="/" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-home-line" style={{ color: '#9ca3af', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Inicio</span>
          </Link>
          <Link href="/nutrition" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-pie-chart-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>Nutrición</span>
          </Link>
          <Link href="/add-food" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            textDecoration: 'none'
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
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Agregar</span>
          </Link>
          <Link href="/progress" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-line-chart-line" style={{ color: '#9ca3af', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Progreso</span>
          </Link>
          <Link href="/profile" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <i className="ri-user-line" style={{ color: '#9ca3af', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Perfil</span>
          </Link>
        </div>
      </nav>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '320px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>Seleccionar Fecha</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              </button>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                fontSize: '16px'
              }}
            />

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hydration Modal */}
      {showHydrationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '360px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>Control de Hidratación</h3>
              <button
                onClick={() => setShowHydrationModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <i className="ri-drop-line" style={{ color: '#2563eb', fontSize: '32px' }}></i>
              </div>
              <p style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>{currentHydration}L</p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 16px 0'
              }}>de {hydrationGoal}L objetivo</p>
              <div style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                borderRadius: '12px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{
                    backgroundColor: '#3b82f6',
                    height: '8px',
                    borderRadius: '12px',
                    transition: 'all 0.3s',
                    width: `${getHydrationPercentage()}%`
                  }}
                ></div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '12px'
              }}>Agregar agua:</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {[250, 500, 750].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAddWater(amount)}
                    style={{
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
                      padding: '16px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#bfdbfe'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dbeafe'}
                  >
                    +{amount}ml
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-lightbulb-line" style={{ color: '#2563eb', fontSize: '16px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>Consejo del día</p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>Bebe agua regularmente durante el día para mantener una hidratación óptima y mejorar tu rendimiento</p>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={handleHydrationSettings}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Configurar
              </button>
              <button
                onClick={() => setShowHydrationModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hydration Settings Modal */}
      {showHydrationSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '360px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>Configuración de Hidratación</h3>
              <button
                onClick={() => setShowHydrationSettings(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              </button>
            </div>

            {/* Meta diaria */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px',
                display: 'block'
              }}>Meta diaria de hidratación (L)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={tempHydrationGoal}
                onChange={(e) => setTempHydrationGoal(parseFloat(e.target.value) || 2.5)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Recordatorios */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>Recordatorios automáticos</label>
                <button
                  onClick={() => setTempReminders(prev => ({ ...prev, enabled: !prev.enabled }))}
                  style={{
                    width: '48px',
                    height: '28px',
                    backgroundColor: tempReminders.enabled ? '#3b82f6' : '#e5e7eb',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '4px',
                    left: tempReminders.enabled ? '24px' : '4px',
                    transition: 'all 0.2s'
                  }}></div>
                </button>
              </div>

              {tempReminders.enabled && (
                <div style={{
                  backgroundColor: '#f0f9ff',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      display: 'block'
                    }}>Cada cuántas horas</label>
                    <select
                      value={tempReminders.interval}
                      onChange={(e) => setTempReminders(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px'
                      }}
                    >
                      <option value={1}>Cada hora</option>
                      <option value={2}>Cada 2 horas</option>
                      <option value={3}>Cada 3 horas</option>
                      <option value={4}>Cada 4 horas</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div>
                      <label style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '4px',
                        display: 'block'
                      }}>Desde</label>
                      <input
                        type="time"
                        value={tempReminders.startTime}
                        onChange={(e) => setTempReminders(prev => ({ ...prev, startTime: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginBottom: '4px',
                        display: 'block'
                      }}>Hasta</label>
                      <input
                        type="time"
                        value={tempReminders.endTime}
                        onChange={(e) => setTempReminders(prev => ({ ...prev, endTime: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => setShowHydrationSettings(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHydrationSettings}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
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

      {/* Fiber Modal */}
      {showFiberModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '360px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>Control de Fibra</h3>
              <button
                onClick={() => setShowFiberModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <i className="ri-leaf-line" style={{ color: '#16a34a', fontSize: '32px' }}></i>
              </div>
              <p style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>{currentFiber}g</p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 16px 0'
              }}>de {fiberGoal}g objetivo</p>
              <div style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                borderRadius: '12px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{
                    backgroundColor: '#16a34a',
                    height: '8px',
                    borderRadius: '12px',
                    transition: 'all 0.3s',
                    width: `${getFiberPercentage()}%`
                  }}
                ></div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '12px'
              }}>Fuentes de fibra:</p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {fiberFoods.map((food, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddFiber(food.fiber)}
                    style={{
                      backgroundColor: '#f0fdf4',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#dcfce7',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className={food.icon} style={{ color: '#16a34a', fontSize: '16px' }}></i>
                        </div>
                        <div>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#1f2937',
                            margin: '0 0 2px 0'
                          }}>{food.name}</p>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            margin: 0
                          }}>{food.category}</p>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#16a34a'
                      }}>+{food.fiber}g</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {getFiberRecommendations().length > 0 && (
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="ri-information-line" style={{ color: '#16a34a', fontSize: '16px' }}></i>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>Recomendaciones</p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>Te faltan {Math.max(0, fiberGoal - currentFiber)}g para alcanzar tu meta diaria</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {getFiberRecommendations().slice(0, 3).map((rec, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#1f2937'
                      }}>{rec.name}</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#16a34a'
                      }}>{rec.fiber}g</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={handleFiberSettings}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Configurar
              </button>
              <button
                onClick={() => setShowFiberModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fiber Settings Modal */}
      {showFiberSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '360px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>Configuración de Fibra</h3>
              <button
                onClick={() => setShowFiberSettings(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              </button>
            </div>

            {/* Meta diaria de fibra */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px',
                display: 'block'
              }}>Meta diaria de fibra (g)</label>
              <input
                type="number"
                min="10"
                max="60"
                step="1"
                value={tempFiberGoal}
                onChange={(e) => setTempFiberGoal(parseFloat(e.target.value) || 30)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px'
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}>Recomendado: 25-35g diarios para adultos</p>
            </div>

            {/* Info sobre fibra */}
            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-information-line" style={{ color: '#16a34a', fontSize: '16px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>Beneficios de la fibra</p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>Mejora la digestión, controla el azúcar en sangre y reduce el colesterol</p>
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                lineHeight: '1.4'
              }}>
                <p style={{ margin: '0 0 8px 0' }}>• Mujeres: 21-25g diarios</p>
                <p style={{ margin: '0 0 8px 0' }}>• Hombres: 30-38g diarios</p>
                <p style={{ margin: 0 }}>• Aumenta gradualmente para evitar molestias</p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => setShowFiberSettings(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFiberSettings}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#16a34a',
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

      {/* Overlay to close menu when clicking outside */}
      {showOptionsMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40
          }}
          onClick={() => setShowOptionsMenu(false)}
        ></div>
      )}
    </div>
  );
}

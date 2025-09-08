
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import { deviceTime } from '../lib/device-time-utils';

// Interfaces para TypeScript
interface DataPoint {
  date: string;
  value: number;
}

interface ProgressData {
  weight: DataPoint[];
  calories: DataPoint[];
  protein: DataPoint[];
  carbs: DataPoint[];
  fats: DataPoint[];
}

interface WeightData {
  weight: number;
  date: string;
  timestamp: string;
}

interface SavedNutritionData {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export default function Progress() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7');
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [newWeight, setNewWeight] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [progressData, setProgressData] = useState<ProgressData>({
    weight: [],
    calories: [],
    protein: [],
    carbs: [],
    fats: []
  });

  useEffect(() => {
    setMounted(true);
    loadProgressData();
  }, [selectedPeriod]);

  const loadProgressData = (): void => {
    const days = parseInt(selectedPeriod);
    const data: ProgressData = {
      weight: [],
      calories: [],
      protein: [],
      carbs: [],
      fats: []
    };

    // Solo cargar datos reales del usuario, sin generar datos de demostración
    for (let i = days - 1; i >= 0; i--) {
      try {
        // Usar fecha del dispositivo de forma segura
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Intentar obtener fecha usando el sistema del dispositivo
        let dateKey: string;
        try {
          // Si hay error con deviceTime, usar fallback
          if (i === 0) {
            dateKey = deviceTime.getCurrentDate();
          } else {
            dateKey = date.toISOString().split('T')[0];
          }
        } catch (error) {
          // Fallback completamente seguro
          dateKey = date.toISOString().split('T')[0];
        }

        // Intentar obtener datos reales del localStorage
        try {
          const savedData = localStorage.getItem(`nutrition_${dateKey}`);
          if (savedData) {
            const parsed: SavedNutritionData = JSON.parse(savedData);
            data.calories.push({ date: dateKey, value: parsed.calories || 0 });
            data.protein.push({ date: dateKey, value: parsed.protein || 0 });
            data.carbs.push({ date: dateKey, value: parsed.carbs || 0 });
            data.fats.push({ date: dateKey, value: parsed.fats || 0 });
          }
        } catch (error) {
          console.error('Error parsing nutrition data:', error);
        }

        // Obtener datos de peso reales del localStorage
        try {
          const savedWeight = localStorage.getItem(`weight_${dateKey}`);
          if (savedWeight) {
            const weightData: WeightData = JSON.parse(savedWeight);
            data.weight.push({ date: dateKey, value: weightData.weight });
          }
        } catch (error) {
          console.error('Error parsing weight data:', error);
        }
      } catch (error) {
        console.error('Error processing date for progress data:', error);
        // Continuar con el siguiente día si hay error
        continue;
      }
    }

    setProgressData(data);
  };

  const handleAddWeight = async (): Promise<void> => {
    if (!newWeight || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const weight = parseFloat(newWeight);
      if (isNaN(weight) || weight <= 0) {
        alert('Por favor ingresa un peso válido');
        setIsSubmitting(false);
        return;
      }

      // Usar fecha actual del dispositivo de forma segura
      let today: string;
      try {
        today = deviceTime.getCurrentDate();
      } catch (error) {
        console.warn('Error obteniendo fecha del dispositivo para peso:', error);
        // Fallback seguro
        today = new Date().toISOString().split('T')[0];
      }

      // Save weight data con timestamp del dispositivo
      const weightData: WeightData = {
        weight: weight,
        date: today,
        timestamp: (() => {
          try {
            return deviceTime.createTimestamp();
          } catch (error) {
            return new Date().toISOString();
          }
        })()
      };

      localStorage.setItem(`weight_${today}`, JSON.stringify(weightData));

      // NUEVA FUNCIONALIDAD: Actualizar también el perfil del usuario
      try {
        const userProfileStored = localStorage.getItem('userProfile');
        if (userProfileStored) {
          const currentProfile = JSON.parse(userProfileStored);

          // Actualizar el peso en el perfil
          const updatedProfile = {
            ...currentProfile,
            weight: weight.toString(),
            lastWeightUpdate: weightData.timestamp,
            lastWeightUpdateDate: today
          };

          // Guardar el perfil actualizado
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

          // Disparar evento para que otras páginas se enteren del cambio
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('profileUpdated', {
              detail: {
                weightUpdated: true,
                newWeight: weight,
                updateSource: 'progress-page'
              }
            }));
          }

          console.log('Peso actualizado en el perfil:', weight, 'kg');
        }
      } catch (profileError) {
        console.warn('Error actualizando perfil con nuevo peso:', profileError);
        // Continuar aunque falle la actualización del perfil
      }

      // Update progress data
      loadProgressData();

      // Reset form
      setNewWeight('');
      setShowWeightModal(false);

      // Show success feedback with additional info
      setTimeout(() => {
        alert('¡Peso registrado exitosamente!\\n\\n✅ Guardado en progreso diario\\n✅ Actualizado en tu perfil\\n✅ IMC recalculado automáticamente');
      }, 100);

    } catch (error) {
      console.error('Error adding weight:', error);
      alert('Error al registrar el peso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayWeight = (): number | null => {
    try {
      const today = deviceTime.getCurrentDate();
      const savedWeight = localStorage.getItem(`weight_${today}`);
      if (savedWeight) {
        const weightData: WeightData = JSON.parse(savedWeight);
        return weightData.weight;
      }
    } catch (error) {
      console.warn('Error obteniendo peso de hoy:', error);
      // Fallback seguro
      try {
        const fallbackToday = new Date().toISOString().split('T')[0];
        const savedWeight = localStorage.getItem(`weight_${fallbackToday}`);
        if (savedWeight) {
          const weightData: WeightData = JSON.parse(savedWeight);
          return weightData.weight;
        }
      } catch (fallbackError) {
        console.error('Error en fallback para peso de hoy:', fallbackError);
      }
    }
    return null;
  };

  const formatDate = (dateString: string): string => {
    try {
      // Usar formato del dispositivo si está disponible
      const date = new Date(dateString);
      const locale = deviceTime.getLocale();
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      // Fallback seguro
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getAverage = (data: DataPoint[]): number => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.value, 0);
    return Math.round(sum / data.length);
  };

  const getMaxValue = (data: DataPoint[]): number => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(item => item.value));
  };

  const getMinValue = (data: DataPoint[]): number => {
    if (data.length === 0) return 0;
    return Math.min(...data.map(item => item.value));
  };

  const createImprovedChart = (data: DataPoint[], color: string, max?: number, unit?: string): JSX.Element | null => {
    if (data.length === 0) {
      return (
        <div style={{
          marginTop: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <i className="ri-bar-chart-line" style={{
            fontSize: '32px',
            color: '#9ca3af',
            marginBottom: '12px'
          }}></i>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 8px 0'
          }}>
            No hay datos disponibles
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: 0
          }}>
            Comienza registrando tu información
          </p>
        </div>
      );
    }

    const maxValue = max || getMaxValue(data);
    const minValue = getMinValue(data);
    const range = maxValue - minValue || 1; // Evitar división por cero

    // Create scale marks
    const scaleMarks: number[] = [];
    const numMarks = 4;
    for (let i = 0; i <= numMarks; i++) {
      const value = minValue + (range * i / numMarks);
      scaleMarks.push(Math.round(value));
    }

    return (
      <div style={{ marginTop: '12px' }}>
        {/* Chart container */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Y-axis scale */}
          <div style={{
            width: '35px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingRight: '4px',
            fontSize: '10px',
            color: '#6b7280'
          }}>
            {scaleMarks.reverse().map((mark, index) => (
              <div key={index} style={{ height: '1px', lineHeight: '10px' }}>
                {mark}{unit}
              </div>
            ))}
          </div>

          {/* Chart bars */}
          <div style={{
            flex: 1,
            height: '100px',
            display: 'flex',
            alignItems: 'end',
            gap: '2px',
            padding: '8px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {data.map((item, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: `${((item.value - minValue) / range) * 80 + 10}%`,
                  backgroundColor: color,
                  borderRadius: '2px',
                  minHeight: '4px',
                  opacity: 0.8,
                  position: 'relative'
                }}
                title={`${formatDate(item.date)}: ${Math.round(item.value)}${unit || ''}`}
              />
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <div style={{ width: '35px' }}></div>
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#6b7280',
            paddingLeft: '8px',
            paddingRight: '8px'
          }}>
            <span>{formatDate(data[0]?.date)}</span>
            {data.length > 2 && (
              <span>{formatDate(data[Math.floor(data.length / 2)]?.date)}</span>
            )}
            <span>{formatDate(data[data.length - 1]?.date)}</span>
          </div>
        </div>

        {/* Chart statistics */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <div style={{ color: '#059669' }}>
            <span style={{ fontWeight: '500' }}>Mín:</span> {Math.round(minValue)}{unit}
          </div>
          <div style={{ color: '#dc2626' }}>
            <span style={{ fontWeight: '500' }}>Máx:</span> {Math.round(maxValue)}{unit}
          </div>
          <div style={{ color: '#3b82f6' }}>
            <span style={{ fontWeight: '500' }}>Prom:</span> {getAverage(data)}{unit}
          </div>
        </div>
      </div>
    );
  };

  // Función para calcular días consecutivos con datos reales
  const calculateConsecutiveDays = (): number => {
    let consecutiveDays = 0;
    let currentDate = new Date();

    while (consecutiveDays < 30) { // Máximo 30 días hacia atrás
      try {
        let dateKey: string;

        // Para el día actual, usar deviceTime si es posible
        if (consecutiveDays === 0) {
          try {
            dateKey = deviceTime.getCurrentDate();
          } catch (error) {
            dateKey = currentDate.toISOString().split('T')[0];
          }
        } else {
          dateKey = currentDate.toISOString().split('T')[0];
        }

        const savedData = localStorage.getItem(`nutrition_${dateKey}`);

        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (parsed.calories > 0 || parsed.protein > 0 || parsed.carbs > 0 || parsed.fats > 0) {
              consecutiveDays++;
            } else {
              break;
            }
          } catch (error) {
            break;
          }
        } else {
          break;
        }

        currentDate.setDate(currentDate.getDate() - 1);
      } catch (error) {
        console.error('Error calculando días consecutivos:', error);
        break;
      }
    }

    return consecutiveDays;
  };

  // Función para calcular metas alcanzadas
  const calculateMetasAlcanzadas = (): number => {
    let metasAlcanzadas = 0;
    const userProfile = localStorage.getItem('userProfile');

    if (!userProfile) return 0;

    try {
      const profile = JSON.parse(userProfile);
      const targetCalories = profile.targetCalories || 2000;
      const targetProtein = profile.targetProtein || 120;
      const targetCarbs = profile.targetCarbs || 250;
      const targetFats = profile.targetFats || 67;

      // Revisar últimos 30 días
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const savedData = localStorage.getItem(`nutrition_${dateKey}`);

        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);

            // Verificar si alcanzó al menos 80% de sus metas
            if (parsed.calories >= targetCalories * 0.8 &&
                parsed.protein >= targetProtein * 0.8 &&
                parsed.carbs >= targetCarbs * 0.8 &&
                parsed.fats >= targetFats * 0.8) {
              metasAlcanzadas++;
            }
          } catch (error) {
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Error calculating metas alcanzadas:', error);
    }

    return metasAlcanzadas;
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      {/* Header */}
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
            Progreso
          </h1>
        </div>
      </header>

      {/* Weight Modal */}
      {showWeightModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '320px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Registrar Peso
            </h3>

            {getTodayWeight() && (
              <div style={{
                backgroundColor: '#f0f9ff',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#3b82f6',
                  margin: 0
                }}>
                  Peso de hoy: {getTodayWeight()} kg
                </p>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Peso actual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ej: 70.5"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  textAlign: 'center'
                }}
                autoFocus
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowWeightModal(false)}
                disabled={isSubmitting}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddWeight}
                disabled={!newWeight || isSubmitting}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: newWeight && !isSubmitting ? '#3b82f6' : '#e5e7eb',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: newWeight && !isSubmitting ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid #ffffff40',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ padding: '24px 16px' }}>
        {/* Period Selector */}
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
            marginBottom: '12px'
          }}>
            Período
          </label>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {[{
              value: '7',
              label: '7 días'
            }, {
              value: '14',
              label: '14 días'
            }, {
              value: '30',
              label: '30 días'
            }].map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: selectedPeriod === option.value ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  backgroundColor: selectedPeriod === option.value ? '#f0f9ff' : 'white',
                  color: selectedPeriod === option.value ? '#3b82f6' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight Progress */}
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
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#e0e7ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-scales-3-line" style={{ color: '#6366f1', fontSize: '20px' }}></i>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Peso
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {progressData.weight.length > 0 ? `Promedio: ${getAverage(progressData.weight).toFixed(1)} kg` : 'Sin datos registrados'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWeightModal(true)}
              className="!rounded-button"
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="ri-add-line" style={{ fontSize: '16px' }}></i>
              Registrar
            </button>
          </div>
          {createImprovedChart(progressData.weight, '#6366f1', undefined, 'kg')}
        </div>

        {/* Calories Progress */}
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
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="ri-fire-line" style={{ color: '#f59e0b', fontSize: '20px' }}></i>
            </div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Calorías
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                {progressData.calories.length > 0 ? `Promedio: ${getAverage(progressData.calories)} cal/día` : 'Sin datos registrados'}
              </p>
            </div>
          </div>
          {createImprovedChart(progressData.calories, '#f59e0b', 2500, ' cal')}
        </div>

        {/* Macronutrients */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Macronutrientes
          </h3>

          {/* Proteins */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
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
                <i className="ri-bread-line" style={{ color: '#16a34a', fontSize: '16px' }}></i>
              </div>
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Proteínas
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {progressData.protein.length > 0 ? `Promedio: ${getAverage(progressData.protein)}g/día` : 'Sin datos registrados'}
                </p>
              </div>
            </div>
            {createImprovedChart(progressData.protein, '#16a34a', 150, 'g')}
          </div>

          {/* Carbohydrates */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-restaurant-line" style={{ color: '#f59e0b', fontSize: '16px' }}></i>
              </div>
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Carbohidratos
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {progressData.carbs.length > 0 ? `Promedio: ${getAverage(progressData.carbs)}g/día` : 'Sin datos registrados'}
                </p>
              </div>
            </div>
            {createImprovedChart(progressData.carbs, '#f59e0b', 300, 'g')}
          </div>

          {/* Fats */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#e0e7ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-drop-line" style={{ color: '#6366f1', fontSize: '16px' }}></i>
              </div>
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Grasas
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {progressData.fats.length > 0 ? `Promedio: ${getAverage(progressData.fats)}g/día` : 'Sin datos registrados'}
                </p>
              </div>
            </div>
            {createImprovedChart(progressData.fats, '#6366f1', 100, 'g')}
          </div>
        </div>

        {/* Achievements */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Logros
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #dcfce7'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-trophy-line" style={{ color: '#16a34a', fontSize: '24px' }}></i>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                Días Consecutivos
              </p>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#16a34a',
                margin: 0
              }}>
                {calculateConsecutiveDays()}
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              border: '1px solid #e0e7ff'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#e0e7ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-target-line" style={{ color: '#3b82f6', fontSize: '24px' }}></i>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>
                Metas Alcanzadas
              </p>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#3b82f6',
                margin: 0
              }}>
                {calculateMetasAlcanzadas()}
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

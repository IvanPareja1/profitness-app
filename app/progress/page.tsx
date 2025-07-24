
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Progress() {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // 7 days
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressData, setProgressData] = useState({
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

  const loadProgressData = () => {
    const days = parseInt(selectedPeriod);
    const data = {
      weight: [],
      calories: [],
      protein: [],
      carbs: [],
      fats: []
    };

    // Generate sample data for the last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      // Try to get real data from localStorage
      const savedData = localStorage.getItem(`nutrition_${dateKey}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        data.calories.push({ date: dateKey, value: parsed.calories || 0 });
        data.protein.push({ date: dateKey, value: parsed.protein || 0 });
        data.carbs.push({ date: dateKey, value: parsed.carbs || 0 });
        data.fats.push({ date: dateKey, value: parsed.fats || 0 });
      } else {
        // Generate sample data if no real data
        data.calories.push({ date: dateKey, value: Math.floor(Math.random() * 800) + 1200 });
        data.protein.push({ date: dateKey, value: Math.floor(Math.random() * 60) + 80 });
        data.carbs.push({ date: dateKey, value: Math.floor(Math.random() * 100) + 150 });
        data.fats.push({ date: dateKey, value: Math.floor(Math.random() * 30) + 40 });
      }

      // Get weight data from localStorage or use sample data
      const savedWeight = localStorage.getItem(`weight_${dateKey}`);
      if (savedWeight) {
        const weightData = JSON.parse(savedWeight);
        data.weight.push({ date: dateKey, value: weightData.weight });
      } else {
        // Generate sample weight data
        data.weight.push({ date: dateKey, value: 70 + Math.random() * 4 - 2 });
      }
    }

    setProgressData(data);
  };

  const handleAddWeight = async () => {
    if (!newWeight || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const weight = parseFloat(newWeight);
      if (isNaN(weight) || weight <= 0) {
        alert('Por favor ingresa un peso válido');
        setIsSubmitting(false);
        return;
      }

      // Get current date
      const today = new Date().toISOString().split('T')[0];

      // Save weight data
      const weightData = {
        weight: weight,
        date: today,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(`weight_${today}`, JSON.stringify(weightData));

      // Update progress data
      loadProgressData();

      // Reset form
      setNewWeight('');
      setShowWeightModal(false);

      // Show success feedback
      setTimeout(() => {
        alert('¡Peso registrado exitosamente!');
      }, 100);

    } catch (error) {
      console.error('Error adding weight:', error);
      alert('Error al registrar el peso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayWeight = () => {
    const today = new Date().toISOString().split('T')[0];
    const savedWeight = localStorage.getItem(`weight_${today}`);
    if (savedWeight) {
      const weightData = JSON.parse(savedWeight);
      return weightData.weight;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAverage = (data: any[]) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.value, 0);
    return Math.round(sum / data.length);
  };

  const getMaxValue = (data: any[]) => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(item => item.value));
  };

  const getMinValue = (data: any[]) => {
    if (data.length === 0) return 0;
    return Math.min(...data.map(item => item.value));
  };

  const createImprovedChart = (data: any[], color: string, max?: number, unit?: string) => {
    if (data.length === 0) return null;
    
    const maxValue = max || getMaxValue(data);
    const minValue = getMinValue(data);
    const range = maxValue - minValue;
    
    // Create scale marks
    const scaleMarks = [];
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
                  height: ` ${((item.value - minValue) / range) * 80 + 10}%`,
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
            {[ 
              { value: '7', label: '7 días' },
              { value: '14', label: '14 días' },
              { value: '30', label: '30 días' }
            ].map(option => (
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
                  Promedio: {getAverage(progressData.weight).toFixed(1)} kg
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
                Promedio: {getAverage(progressData.calories)} cal/día
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
                  Promedio: {getAverage(progressData.protein)}g/día
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
                  Promedio: {getAverage(progressData.carbs)}g/día
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
                  Promedio: {getAverage(progressData.fats)}g/día
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
                5
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
                12
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
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
              <i className="ri-pie-chart-line" style={{ fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px' }}>Nutrición</span>
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
              <i className="ri-line-chart-fill" style={{ fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Progreso</span>
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
    </div>
  );
}

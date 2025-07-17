
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useWeightData } from '../../hooks/useWeightData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeightTracking() {
  const { 
    weightData, 
    addWeightEntry, 
    getCurrentWeight, 
    getTotalWeightLoss, 
    getAverageWeeklyLoss, 
    getWeeklyChange,
    getWeightRange,
    mounted,
    updateWeightEntry,
    deleteWeightEntry
  } = useWeightData();

  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatDateForChart = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const handleAddWeight = () => {
    if (newWeight && parseFloat(newWeight) > 0) {
      const success = addWeightEntry(parseFloat(newWeight));
      if (success) {
        setNewWeight('');
        setShowAddWeight(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  };

  const handleEditWeight = (index: number) => {
    const actualIndex = weightData.length - 1 - index;
    setEditingIndex(actualIndex);
    setEditWeight(weightData[actualIndex].weight.toString());
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editWeight && parseFloat(editWeight) > 0) {
      const success = updateWeightEntry(editingIndex, parseFloat(editWeight));
      if (success) {
        setEditingIndex(null);
        setEditWeight('');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  };

  const handleDeleteWeight = (index: number) => {
    const actualIndex = weightData.length - 1 - index;
    const success = deleteWeightEntry(actualIndex);
    if (success) {
      setShowDeleteConfirm(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const chartData = weightData.map(item => ({
    ...item,
    formattedDate: formatDateForChart(item.date)
  }));

  const weightRange = getWeightRange();
  const currentWeight = getCurrentWeight();
  const totalLoss = getTotalWeightLoss();
  const weeklyChange = getWeeklyChange();
  const avgWeeklyLoss = getAverageWeeklyLoss();

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
          border: '4px solid #3b82f6',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
    }}>
      {/* Success Message */}
      {showSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '16px',
          right: '16px',
          zIndex: 60,
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="ri-check-line" style={{ fontSize: '14px' }}></i>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>¡Peso registrado exitosamente!</span>
          </div>
        </div>
      )}

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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Link href="/" style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}>
              <i className="ri-arrow-left-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
            </Link>
            <h1 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>Historial de Peso</h1>
          </div>
          <button 
            onClick={() => setShowAddWeight(true)}
            className="!rounded-button"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <i className="ri-add-line" style={{ color: 'white', fontSize: '18px' }}></i>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        padding: '64px 16px 80px 16px'
      }}>
        {/* Current Weight Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          marginTop: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>Peso Actual</p>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>{currentWeight} kg</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: weeklyChange >= 0 ? '#fef3c7' : '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className={weeklyChange >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} 
                   style={{ color: weeklyChange >= 0 ? '#f59e0b' : '#16a34a', fontSize: '14px' }}></i>
              </div>
              <span style={{
                color: weeklyChange >= 0 ? '#f59e0b' : '#16a34a',
                fontWeight: '500'
              }}>
                {weeklyChange >= 0 ? '+' : ''}{weeklyChange} kg esta semana
              </span>
            </div>
          </div>
        </div>

        {/* Weight Chart Visualization */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>Progreso</h3>
          
          {/* Gráfico de líneas real */}
          <div style={{ height: '200px', width: '100%', marginBottom: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="formattedDate"
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={[weightRange.min.toFixed(1), weightRange.max.toFixed(1)]}
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value, name) => [`${value} kg`, 'Peso']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="url(#colorGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px'
          }}>
            <span>Rango: {weightRange.min.toFixed(1)} - {weightRange.max.toFixed(1)} kg</span>
            <span>Últimos {weightData.length} registros</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <i className="ri-speed-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>Promedio Semanal</p>
            <p style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>-{avgWeeklyLoss} kg</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <i className="ri-arrow-down-line" style={{ color: '#16a34a', fontSize: '18px' }}></i>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '4px',
              margin: '0 0 4px 0'
            }}>Total Perdido</p>
            <p style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>-{totalLoss} kg</p>
          </div>
        </div>

        {/* Weight History */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>Historial Detallado</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {[...weightData].reverse().map((entry, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: index < weightData.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="ri-scales-3-line" style={{ color: '#6b7280', fontSize: '14px' }}></i>
                  </div>
                  <div>
                    <p style={{
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>{entry.weight} kg</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>{formatDate(entry.date)}</p>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  {entry.change !== 0 && (
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: entry.change < 0 ? '#16a34a' : '#dc2626'
                    }}>
                      {entry.change > 0 ? '+' : ''}{entry.change} kg
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleEditWeight(index)}
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: '#dbeafe',
                        borderRadius: '6px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="ri-edit-line" style={{ color: '#3b82f6', fontSize: '12px' }}></i>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(index)}
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: '#fee2e2',
                        borderRadius: '6px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="ri-delete-bin-line" style={{ color: '#dc2626', fontSize: '12px' }}></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Weight Modal */}
      {editingIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px'
          }}>
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
              }}>Editar Peso</h3>
              <button 
                onClick={() => {
                  setEditingIndex(null);
                  setEditWeight('');
                }}
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
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Nuevo peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '18px',
                  textAlign: 'center',
                  fontWeight: '500'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                autoFocus
              />
            </div>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setEditingIndex(null);
                  setEditWeight('');
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  color: '#374151',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editWeight || parseFloat(editWeight) <= 0}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: !editWeight || parseFloat(editWeight) <= 0 ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: !editWeight || parseFloat(editWeight) <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: !editWeight || parseFloat(editWeight) <= 0 ? 0.6 : 1
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px'
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
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-alert-line" style={{ color: '#dc2626', fontSize: '18px' }}></i>
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>Eliminar Registro</h3>
            </div>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              ¿Estás seguro de que quieres eliminar este registro de peso? Esta acción no se puede deshacer.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  color: '#374151',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteWeight(showDeleteConfirm)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Weight Modal */}
      {showAddWeight && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px'
          }}>
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
              }}>Registrar Peso</h3>
              <button 
                onClick={() => setShowAddWeight(false)}
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
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder={currentWeight.toString()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '18px',
                  textAlign: 'center',
                  fontWeight: '500'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                autoFocus
              />
            </div>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowAddWeight(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  color: '#374151',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddWeight}
                disabled={!newWeight || parseFloat(newWeight) <= 0}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: !newWeight || parseFloat(newWeight) <= 0 ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: !newWeight || parseFloat(newWeight) <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: !newWeight || parseFloat(newWeight) <= 0 ? 0.6 : 1
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

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
              <i className="ri-pie-chart-line" style={{ color: '#9ca3af', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Nutrición</span>
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
    </div>
  );
}

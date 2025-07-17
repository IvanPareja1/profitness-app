
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { useWeightData } from '../../hooks/useWeightData';

export default function Progress() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const { 
    weightData, 
    getCurrentWeight, 
    getTotalWeightLoss, 
    getAverageWeeklyLoss, 
    getWeightRange,
    mounted: weightDataMounted 
  } = useWeightData();

  const progressStats = {
    totalWeightLoss: getTotalWeightLoss(),
    avgWeeklyLoss: getAverageWeeklyLoss(),
    daysTracked: weightData.length,
    streakDays: 12
  };

  const bodyMetrics = [
    { name: 'Peso', value: `${getCurrentWeight()} kg`, change: `-${getTotalWeightLoss()} kg`, trend: 'down' },
    { name: 'IMC', value: '22.8', change: '-1.2', trend: 'down' },
    { name: 'Grasa Corporal', value: '18.5%', change: '-2.1%', trend: 'down' },
    { name: 'Masa Muscular', value: '61.3 kg', change: '+0.8 kg', trend: 'up' }
  ];

  const formatDateForChart = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const chartData = weightData.map(item => ({
    ...item,
    formattedDate: formatDateForChart(item.date)
  }));

  const weightRange = getWeightRange();

  const handleShareProgress = (platform) => {
    const progressMessage = `¡Mi progreso en Profitness!
    
    Peso perdido: -${progressStats.totalWeightLoss} kg
Peso actual: ${getCurrentWeight()} kg
Racha: ${progressStats.streakDays} días
Días activos: ${progressStats.daysTracked}

#Profitness #ProgresoSaludable`;

    switch (platform) {
      case 'whatsapp':
        if (typeof window !== 'undefined') {
          window.open(`https://wa.me/?text=${encodeURIComponent(progressMessage)}`, '_blank');
        }
        break;
      case 'copy':
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(progressMessage).then(() => {
            setShowCopySuccess(true);
            setTimeout(() => setShowCopySuccess(false), 2000);
          }).catch(() => {
            console.log('Error al copiar al portapapeles');
          });
        }
        break;
    }
    setShowShareModal(false);
  };

  if (!weightDataMounted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {showCopySuccess && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '16px',
          right: '16px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <i className="ri-check-line" style={{ fontSize: '18px' }}></i>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>¡Progreso copiado al portapapeles!</span>
        </div>
      )}

      <header style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        backgroundColor: 'white',
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px'
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>Progreso</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowShareModal(true)}
              className="!rounded-button"
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <i className="ri-share-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="!rounded-button"
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <i className="ri-more-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              </button>

              {showMoreOptions && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  padding: '8px 0',
                  width: '192px',
                  zIndex: 50
                }}>
                  <button
                    onClick={() => {
                      setShowMoreOptions(false);
                      console.log('Exportando datos...');
                    }}
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
                      <i className="ri-download-line" style={{ color: '#3b82f6', fontSize: '14px' }}></i>
                    </div>
                    <span style={{ color: '#111827', fontWeight: '500' }}>Exportar datos</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMoreOptions(false);
                      console.log('Editando metas...');
                    }}
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
                      <i className="ri-target-line" style={{ color: '#8b5cf6', fontSize: '14px' }}></i>
                    </div>
                    <span style={{ color: '#111827', fontWeight: '500' }}>Editar metas</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{
        paddingTop: '80px',
        paddingBottom: '96px',
        padding: '80px 16px 96px 16px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '4px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px'
            }}>
              {[
                { id: 'week', label: 'Semana' }, 
                { id: 'month', label: 'Mes' }, 
                { id: 'quarter', label: '3M' }, 
                { id: 'year', label: 'Año' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className="!rounded-button"
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: selectedPeriod === period.id ? '#3b82f6' : 'transparent',
                    color: selectedPeriod === period.id ? 'white' : '#6b7280',
                    boxShadow: selectedPeriod === period.id ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>Evolución del Peso</h3>
            <Link href="/weight-tracking" className="!rounded-button" style={{
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: '#dbeafe',
              padding: '8px 16px',
              borderRadius: '20px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}>
              + Agregar
            </Link>
          </div>
          
          <div style={{ height: '180px', width: '100%', marginBottom: '20px' }}>
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
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #fef2f2 0%, #fce7f3 100%)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#dc2626',
                margin: '0 0 8px'
              }}>-{progressStats.totalWeightLoss} kg</p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Total perdido</p>
            </div>
            <div style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#16a34a',
                margin: '0 0 8px'
              }}>-{progressStats.avgWeeklyLoss} kg</p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Promedio semanal</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>Métricas Corporales</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {bodyMetrics.map((metric, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6b7280',
                    margin: 0
                  }}>{metric.name}</h4>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: metric.trend === 'down' ? '#dcfce7' : '#dbeafe'
                  }}>
                    <i
                      className={metric.trend === 'down' ? 'ri-arrow-down-line' : 'ri-arrow-up-line'}
                      style={{
                        fontSize: '16px',
                        color: metric.trend === 'down' ? '#16a34a' : '#3b82f6'
                      }}
                    ></i>
                  </div>
                </div>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>{metric.value}</p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: metric.trend === 'down' ? '#16a34a' : '#3b82f6',
                  margin: 0
                }}>
                  {metric.change}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>Logros</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <i className="ri-calendar-check-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
              </div>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>{progressStats.daysTracked}</p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Días registrados</p>
            </div>
            <div style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#fed7aa',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <i className="ri-fire-line" style={{ color: '#ea580c', fontSize: '20px' }}></i>
              </div>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>{progressStats.streakDays}</p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Días consecutivos</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>Resumen Semanal</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-restaurant-line" style={{ color: '#16a34a', fontSize: '20px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '4px',
                    margin: '0 0 4px 0'
                  }}>Objetivo calórico</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>6 de 7 días cumplidos</p>
                </div>
              </div>
              <span style={{
                color: '#16a34a',
                fontWeight: '700',
                fontSize: '18px'
              }}>86%</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-scales-3-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '4px',
                    margin: '0 0 4px 0'
                  }}>Pesaje diario</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>7 de 7 días cumplidos</p>
                </div>
              </div>
              <span style={{
                color: '#16a34a',
                fontWeight: '700',
                fontSize: '18px'
              }}>100%</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-drop-line" style={{ color: '#8b5cf6', fontSize: '20px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '4px',
                    margin: '0 0 4px 0'
                  }}>Hidratación</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>5 de 7 días cumplidos</p>
                </div>
              </div>
              <span style={{
                color: '#eab308',
                fontWeight: '700',
                fontSize: '18px'
              }}>71%</span>
            </div>
          </div>
        </div>
      </main>

      {showShareModal && (
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
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '384px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>Compartir Progreso</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="!rounded-button"
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <i className="ri-close-line" style={{ color: '#6b7280', fontSize: '20px' }}></i>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <i className="ri-trophy-line" style={{ color: '#3b82f6', fontSize: '24px' }}></i>
              </div>
              <p style={{
                color: '#6b7280',
                margin: 0
              }}>¡Comparte tus logros y motiva a otros a alcanzar sus metas!</p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <button
                onClick={() => handleShareProgress('whatsapp')}
                className="!rounded-button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#bbf7d0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dcfce7'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#16a34a',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <i className="ri-whatsapp-line" style={{ color: 'white', fontSize: '20px' }}></i>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '4px',
                    margin: '0 0 4px 0'
                  }}>WhatsApp</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Compartir por mensaje</p>
                </div>
              </button>

              <button
                onClick={() => handleShareProgress('copy')}
                className="!rounded-button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#4b5563',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <i className="ri-file-copy-line" style={{ color: 'white', fontSize: '20px' }}></i>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '4px',
                    margin: '0 0 4px 0'
                  }}>Copiar texto</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Copiar al portapapeles</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

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
              <i className="ri-line-chart-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>Progreso</span>
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

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useNutritionData } from '../hooks/useNutritionData';
import { useUserProfile } from '../hooks/useUserProfile';
import { useWeightData } from '../hooks/useWeightData';
import AuthGuard from '../components/ui/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}

function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { totalCalories, totalProtein, totalCarbs, totalFats, mounted: nutritionMounted } = useNutritionData();
  const { userProfile, dailyCalories, dailyMacros, mounted: profileMounted } = useUserProfile();
  const { getCurrentWeight, getTotalWeightLoss, mounted: weightMounted } = useWeightData();

  // Función para formatear fecha igual que en la página de nutrición
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCurrentDateFormatted = (): string => {
    return formatDate(new Date());
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !nutritionMounted || !profileMounted || !weightMounted) {
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
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              fontFamily: 'Pacifico, serif',
              fontSize: '20px',
              fontWeight: '400',
              color: '#3b82f6'
            }}>
              logo
            </div>
          </div>
          <Link href="/profile" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'background-color 0.2s'
          }}>
            <i className="ri-user-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
          </Link>
        </div>
      </header>

      <main style={{
        paddingTop: '80px',
        paddingBottom: '96px',
        padding: '80px 16px 96px 16px'
      }}>
        {/* Welcome Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white'
              }}>MG</span>
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>¡Hola, {userProfile.name}!</h2>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '14px'
              }}>
                {getCurrentDateFormatted()}
              </p>
            </div>
          </div>
          <div style={{
            backgroundColor: '#f0f9ff',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #e0e7ff'
          }}>
            <p style={{
              color: '#1e40af',
              fontSize: '14px',
              fontWeight: '500',
              margin: 0
            }}>
              💪 ¡Sigue así! Has consumido {totalCalories} de {dailyCalories} calorías hoy
            </p>
          </div>
        </div>

        {/* Today's Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>Resumen de Hoy</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <i className="ri-flash-line" style={{ color: '#dc2626', fontSize: '20px' }}></i>
              </div>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>{totalCalories}</p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Calorías</p>
            </div>

            <div style={{
              textAlign: 'center',
              backgroundColor: '#f0fdf4',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <i className="ri-scales-3-line" style={{ color: '#16a34a', fontSize: '20px' }}></i>
              </div>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>{getCurrentWeight()}</p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Peso (kg)</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <div style={{
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#dc2626',
                margin: '0 0 4px 0'
              }}>{totalProtein}g</p>
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Proteínas</p>
            </div>
            <div style={{
              textAlign: 'center',
              backgroundColor: '#fffbeb',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#f59e0b',
                margin: '0 0 4px 0'
              }}>{totalCarbs}g</p>
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Carbohidratos</p>
            </div>
            <div style={{
              textAlign: 'center',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#16a34a',
                margin: '0 0 4px 0'
              }}>{totalFats}g</p>
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>Grasas</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>Acciones Rápidas</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <Link href="/add-food" style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '16px',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }} className="!rounded-button">
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <i className="ri-add-circle-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
              </div>
              <h4 style={{
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>Agregar Comida</h4>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>Registra tu próxima comida</p>
            </Link>

            <Link href="/weight-tracking" style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '16px',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }} className="!rounded-button">
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <i className="ri-scales-3-line" style={{ color: '#16a34a', fontSize: '20px' }}></i>
              </div>
              <h4 style={{
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>Registrar Peso</h4>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>Actualiza tu peso diario</p>
            </Link>

            <Link href="/nutrition" style={{
              backgroundColor: '#fef3c7',
              borderRadius: '16px',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }} className="!rounded-button">
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#fed7aa',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <i className="ri-pie-chart-line" style={{ color: '#f59e0b', fontSize: '20px' }}></i>
              </div>
              <h4 style={{
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>Ver Nutrición</h4>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>Revisa tus macros del día</p>
            </Link>

            <Link href="/progress" style={{
              backgroundColor: '#f3e8ff',
              borderRadius: '16px',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }} className="!rounded-button">
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#e9d5ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <i className="ri-line-chart-line" style={{ color: '#8b5cf6', fontSize: '20px' }}></i>
              </div>
              <h4 style={{
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>Ver Progreso</h4>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>Revisa tu evolución</p>
            </Link>
          </div>
        </div>

        {/* Progress Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>Tu Progreso</h3>
            <Link href="/progress" style={{
              color: '#3b82f6',
              fontSize: '14px',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Ver todo
            </Link>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <p style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#dc2626',
                margin: '0 0 4px 0'
              }}>-{getTotalWeightLoss()}</p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>kg perdidos</p>
            </div>
            <div style={{
              textAlign: 'center',
              backgroundColor: '#f0f9ff',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <p style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#3b82f6',
                margin: '0 0 4px 0'
              }}>12</p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>días seguidos</p>
            </div>
            <div style={{
              textAlign: 'center',
              backgroundColor: '#f0fdf4',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <p style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#16a34a',
                margin: '0 0 4px 0'
              }}>89%</p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>objetivo</p>
            </div>
          </div>
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
              <i className="ri-home-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>Inicio</span>
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
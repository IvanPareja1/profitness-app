
'use client';

import Link from 'next/link';
import { useUserProfile } from '../hooks/useUserProfile';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BottomNavigation from '../components/ui/BottomNavigation';
import AuthGuard from '../components/ui/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}

function HomePage() {
  const { userProfile, profilePhoto, mounted, dailyCalories, dailyMacros } = useUserProfile();

  // Datos simulados de consumo actual
  const consumedCalories = 1456;
  const consumedMacros = {
    protein: { consumed: 89 },
    carbs: { consumed: 165 },
    fats: { consumed: 52 }
  };

  const remainingCalories = dailyCalories - consumedCalories;
  const calorieProgress = (consumedCalories / dailyCalories) * 100;

  const getGoalText = (goal: string) => {
    const goalTexts: { [key: string]: string } = {
      'fat_loss': 'Pérdida de Grasa',
      'muscle_gain': 'Ganancia Muscular',
      'recomposition': 'Recomposición',
      'maintenance': 'Mantenimiento'
    };
    return goalTexts[goal] || 'Objetivo Personal';
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="ri-nutrition-line" style={{ color: 'white', fontSize: '18px' }}></i>
            </div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Pacifico, serif'
            }}>
              Profitness
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/profile" style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}>
              <i className="ri-user-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: '64px', paddingBottom: '80px', padding: '64px 16px 80px 16px' }}>
        {/* Welcome Section */}
        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            ¡Hola, {userProfile.name.split(' ')[0]}!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>
            Nutre tu progreso, domina tus resultados
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px',
              background: '#dbeafe',
              color: '#1e40af',
              padding: '4px 8px',
              borderRadius: '20px'
            }}>
              {getGoalText(userProfile.goal)}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Meta: {userProfile.goalWeight}kg
            </span>
          </div>
        </div>

        {/* Progress Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Progreso Diario
            </h3>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Hoy</span>
          </div>

          {/* Calories Progress */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Calorías
              </span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {consumedCalories} / {dailyCalories}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: '#e5e7eb',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                width: `${Math.min(calorieProgress, 100)}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              {remainingCalories > 0 ? `${remainingCalories} calorías restantes` : `${Math.abs(remainingCalories)} calorías excedidas`}
            </p>
          </div>

          {/* Macros Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            {/* Proteínas */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                margin: '0 auto 8px'
              }}>
                <svg width="64" height="64" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
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
                    strokeDasharray={`${Math.min((consumedMacros.protein.consumed / dailyMacros.protein.target) * 100, 100)}, 100`}
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
                    fontWeight: 'bold',
                    color: '#dc2626'
                  }}>
                    {Math.round((consumedMacros.protein.consumed / dailyMacros.protein.target) * 100)}%
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                Proteínas
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {consumedMacros.protein.consumed}g / {dailyMacros.protein.target}g
              </p>
            </div>

            {/* Carbohidratos */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                margin: '0 auto 8px'
              }}>
                <svg width="64" height="64" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
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
                    strokeDasharray={`${Math.min((consumedMacros.carbs.consumed / dailyMacros.carbs.target) * 100, 100)}, 100`}
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
                    fontWeight: 'bold',
                    color: '#d97706'
                  }}>
                    {Math.round((consumedMacros.carbs.consumed / dailyMacros.carbs.target) * 100)}%
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                Carbohidratos
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {consumedMacros.carbs.consumed}g / {dailyMacros.carbs.target}g
              </p>
            </div>

            {/* Grasas */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                margin: '0 auto 8px'
              }}>
                <svg width="64" height="64" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
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
                    strokeDasharray={`${Math.min((consumedMacros.fats.consumed / dailyMacros.fats.target) * 100, 100)}, 100`}
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
                    fontWeight: 'bold',
                    color: '#059669'
                  }}>
                    {Math.round((consumedMacros.fats.consumed / dailyMacros.fats.target) * 100)}%
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                Grasas
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                {consumedMacros.fats.consumed}g / {dailyMacros.fats.target}g
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <Link href="/add-food" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            textDecoration: 'none',
            display: 'block'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <i className="ri-add-line" style={{ color: '#2563eb', fontSize: '20px' }}></i>
            </div>
            <h4 style={{
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px',
              fontSize: '14px'
            }}>
              Agregar Comida
            </h4>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Registra tus alimentos
            </p>
          </Link>

          <Link href="/scan-barcode" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            textDecoration: 'none',
            display: 'block'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#f3e8ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <i className="ri-qr-scan-line" style={{ color: '#7c3aed', fontSize: '20px' }}></i>
            </div>
            <h4 style={{
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px',
              fontSize: '14px'
            }}>
              Escanear
            </h4>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Código de barras
            </p>
          </Link>
        </div>

        {/* Weight Progress */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Peso Actual
            </h3>
            <Link href="/weight-tracking" style={{
              color: '#2563eb',
              fontSize: '14px',
              textDecoration: 'none'
            }}>
              Ver historial
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '30px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {userProfile.currentWeight} kg
              </p>
              <p style={{ fontSize: '14px', color: '#059669', marginBottom: '8px' }}>
                -0.8 kg esta semana
              </p>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
                  width: `${((userProfile.currentWeight - userProfile.goalWeight) / (75.2 - userProfile.goalWeight)) * 100}%`
                }}></div>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {(userProfile.currentWeight - userProfile.goalWeight).toFixed(1)} kg restantes
              </p>
            </div>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="ri-arrow-down-line" style={{ color: '#16a34a', fontSize: '20px' }}></i>
            </div>
          </div>
        </div>

        {/* Recent Meals */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
              Comidas Recientes
            </h3>
            <Link href="/meal-history" style={{
              color: '#2563eb',
              fontSize: '14px',
              textDecoration: 'none'
            }}>
              Ver todas
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="https://readdy.ai/api/search-image?query=Realistic%20grilled%20chicken%20breast%20with%20vegetables%2C%20high-quality%20food%20photography%2C%20appetizing%20presentation%2C%20natural%20lighting%2C%20clean%20white%20background%2C%20professional%20food%20styling&width=60&height=60&seq=meal1&orientation=squarish"
                alt="Pollo a la plancha"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  objectPosition: 'top'
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>
                  Pollo a la plancha
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Almuerzo • 450 kcal
                </p>
              </div>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>14:30</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="https://readdy.ai/api/search-image?query=Greek%20yogurt%20with%20berries%20and%20granola%2C%20healthy%20breakfast%20bowl%2C%20fresh%20fruits%2C%20clean%20food%20photography%2C%20white%20background%2C%20natural%20lighting&width=60&height=60&seq=meal2&orientation=squarish"
                alt="Yogur con frutos rojos"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  objectPosition: 'top'
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>
                  Yogur con frutos rojos
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Desayuno • 280 kcal
                </p>
              </div>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>08:15</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

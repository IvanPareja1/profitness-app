
'use client';

import Link from 'next/link';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNutritionData } from '../hooks/useNutritionData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BottomNavigation from '../components/ui/BottomNavigation';
import AuthGuard from '../components/ui/AuthGuard';
import { useState, useEffect } from 'react';

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}

function HomePage() {
  const { userProfile, profilePhoto, mounted, dailyCalories, dailyMacros } = useUserProfile();
  const { totalCalories, totalProtein, totalCarbs, totalFats, getRecentMeals, mounted: nutritionMounted } = useNutritionData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMotivationModal, setShowMotivationModal] = useState(false);

  const remainingCalories = dailyCalories - totalCalories;
  const calorieProgress = (totalCalories / dailyCalories) * 100;

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const getGoalText = (goal: string) => {
    const goalTexts: { [key: string]: string } = {
      'fat_loss': 'Pérdida de Grasa',
      'muscle_gain': 'Ganancia Muscular',
      'recomposition': 'Recomposición',
      'maintenance': 'Mantenimiento'
    };
    return goalTexts[goal] || 'Objetivo Personal';
  };

  const motivationalMessages = [
    "¡Cada pequeño paso cuenta hacia tu objetivo!",
    "La constancia es la clave del éxito",
    "Hoy es un buen día para ser saludable",
    "Tu futuro yo te lo agradecerá"
  ];

  const getRandomMotivation = () => {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  };

  // Función para formatear fecha igual que en la página de nutrición
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Datos de progreso semanal
  const weeklyStats = {
    streak: 5,
    totalMeals: 18,
    avgCalories: 1850,
    waterIntake: 2.1
  };

  if (!mounted || !nutritionMounted) {
    return <LoadingSpinner />;
  }

  const recentMeals = getRecentMeals();

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
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
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
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <i className="ri-nutrition-line" style={{ color: 'white', fontSize: '20px' }}></i>
            </div>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                fontFamily: 'Pacifico, serif',
                margin: 0
              }}>
                Profitness
              </h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowMotivationModal(true)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: '#f0f9ff',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e7ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f9ff'}
            >
              <i className="ri-heart-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </button>
            <Link href="/profile" style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#f9fafb',
              textDecoration: 'none',
              overflow: 'hidden',
              transition: 'all 0.2s'
            }}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Perfil"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <i className="ri-user-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
              )}
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
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            {getTimeGreeting()}, {userProfile.name.split(' ')[0]}!
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '12px',
            margin: '0 0 12px 0',
            fontSize: '16px'
          }}>
            Nutre tu progreso, domina tus resultados
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '12px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
              color: '#1e40af',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: '600'
            }}>
              {getGoalText(userProfile.goal)}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Meta: {userProfile.goalWeight}kg
            </span>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
              {weeklyStats.streak} días seguidos
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {formatDate(currentTime)}
            </span>
          </div>
        </div>

        {/* Progress Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Progreso Diario
            </h3>
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
              padding: '6px 12px',
              borderRadius: '20px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#4338ca' }}>
                {currentTime.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          {/* Calories Progress */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
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
                  <i className="ri-fire-line" style={{ color: 'white', fontSize: '16px' }}></i>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                  Calorías
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                  {totalCalories}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  /{dailyCalories}
                </span>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: '#f1f5f9',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                width: `${Math.min(calorieProgress, 100)}%`,
                transition: 'width 0.6s ease',
                borderRadius: '8px'
              }}></div>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', margin: '8px 0 0 0' }}>
              {remainingCalories > 0 ? `${remainingCalories} calorías restantes` : `${Math.abs(remainingCalories)} calorías excedidas`}
            </p>
          </div>

          {/* Macros Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px'
          }}>
            {/* Proteínas */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '68px',
                height: '68px',
                margin: '0 auto 12px auto'
              }}>
                <svg width="68" height="68" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#fee2e2"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${Math.min((totalProtein / dailyMacros.protein.target) * 100, 100)}, 100`}
                    strokeLinecap="round"
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
                    fontWeight: '700',
                    color: '#dc2626'
                  }}>
                    {Math.round((totalProtein / dailyMacros.protein.target) * 100)}%
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                Proteínas
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {totalProtein}g / {dailyMacros.protein.target}g
              </p>
            </div>

            {/* Carbohidratos */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '68px',
                height: '68px',
                margin: '0 auto 12px auto'
              }}>
                <svg width="68" height="68" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#fef3c7"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray={`${Math.min((totalCarbs / dailyMacros.carbs.target) * 100, 100)}, 100`}
                    strokeLinecap="round"
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
                    fontWeight: '700',
                    color: '#d97706'
                  }}>
                    {Math.round((totalCarbs / dailyMacros.carbs.target) * 100)}%
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                Carbohidratos
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {totalCarbs}g / {dailyMacros.carbs.target}g
              </p>
            </div>

            {/* Grasas */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '68px',
                height: '68px',
                margin: '0 auto 12px auto'
              }}>
                <svg width="68" height="68" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#dcfce7"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${Math.min((totalFats / dailyMacros.fats.target) * 100, 100)}, 100`}
                    strokeLinecap="round"
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
                    fontWeight: '700',
                    color: '#059669'
                  }}>
                    {Math.round((totalFats / dailyMacros.fats.target) * 100)}%
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                Grasas
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {totalFats}g / {dailyMacros.fats.target}g
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
          <Link href="/add-food" className="!rounded-button" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            textDecoration: 'none',
            display: 'block',
            transition: 'all 0.2s',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
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
              fontSize: '15px',
              margin: '0 0 4px 0'
            }}>
              Agregar Comida
            </h4>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Registra tus alimentos
            </p>
          </Link>

          <Link href="/scan-barcode" className="!rounded-button" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            textDecoration: 'none',
            display: 'block',
            transition: 'all 0.2s',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)',
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
              fontSize: '15px',
              margin: '0 0 4px 0'
            }}>
              Escanear
            </h4>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Código de barras
            </p>
          </Link>
        </div>

        {/* Weekly Stats */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px', margin: '0 0 20px 0' }}>
            Resumen Semanal
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-fire-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                {weeklyStats.streak}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Días seguidos
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-restaurant-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                {weeklyStats.totalMeals}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Comidas registradas
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-bar-chart-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                {weeklyStats.avgCalories}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Kcal promedio
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <i className="ri-drop-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                {weeklyStats.waterIntake}L
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Agua diaria
              </p>
            </div>
          </div>
        </div>

        {/* Weight Progress */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Peso Actual
            </h3>
            <Link href="/weight-tracking" style={{
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              backgroundColor: '#f0f9ff',
              padding: '6px 12px',
              borderRadius: '20px',
              transition: 'all 0.2s'
            }}>
              Ver historial
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                {userProfile.currentWeight} kg
              </p>
              <p style={{ fontSize: '14px', color: '#10b981', marginBottom: '12px', margin: '0 0 12px 0' }}>
                <i className="ri-arrow-down-line" style={{ fontSize: '14px', marginRight: '4px' }}></i>
                -0.8 kg esta semana
              </p>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#f1f5f9',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
                  width: `${Math.min(((userProfile.currentWeight - userProfile.goalWeight) / (75.2 - userProfile.goalWeight)) * 100, 100)}%`,
                  borderRadius: '6px',
                  transition: 'width 0.6s ease'
                }}></div>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', margin: '8px 0 0 0' }}>
                {(userProfile.currentWeight - userProfile.goalWeight).toFixed(1)} kg para alcanzar tu meta
              </p>
            </div>
            <div style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}>
              <i className="ri-arrow-down-line" style={{ color: '#16a34a', fontSize: '24px' }}></i>
            </div>
          </div>
        </div>

        {/* Recent Meals */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Comidas Recientes
            </h3>
            <Link href="/nutrition" style={{
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              backgroundColor: '#f0f9ff',
              padding: '6px 12px',
              borderRadius: '20px',
              transition: 'all 0.2s'
            }}>
              Ver todas
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentMeals.map((meal, index) => (
              <div key={meal.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                transition: 'all 0.2s'
              }}>
                <img
                  src={`https://readdy.ai/api/search-image?query=Realistic%20${meal.name}%2C%20high-quality%20food%20photography%2C%20appetizing%20presentation%2C%20natural%20lighting%2C%20clean%20white%20background%2C%20professional%20food%20styling&width=60&height=60&seq=meal${index + 1}&orientation=squarish`}
                  alt={meal.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    objectPosition: 'top'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '500', color: '#1f2937', marginBottom: '4px', margin: '0 0 4px 0' }}>
                    {meal.name}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    {meal.mealType === 'breakfast' ? 'Desayuno' :
                      meal.mealType === 'lunch' ? 'Almuerzo' :
                        meal.mealType === 'dinner' ? 'Cena' : 'Snack'} • {meal.calories} kcal • P: {meal.protein}g C: {meal.carbs}g G: {meal.fats}g
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{meal.time}</span>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    marginTop: '4px',
                    marginLeft: 'auto'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivation Modal */}
        {showMotivationModal && (
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
              padding: '32px',
              width: '100%',
              maxWidth: '384px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <i className="ri-heart-fill" style={{ color: '#f59e0b', fontSize: '24px' }}></i>
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>
                ¡Mensaje de Motivación!
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '24px',
                margin: '0 0 24px 0',
                lineHeight: '1.6'
              }}>
                {getRandomMotivation()}
              </p>
              <button
                onClick={() => setShowMotivationModal(false)}
                className="!rounded-button"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ¡Gracias! 
              </button>
            </div>
          </div>
        )}

        <BottomNavigation />
      </main>
    </div>
  );
}

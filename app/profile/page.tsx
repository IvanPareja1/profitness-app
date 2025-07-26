
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../components/BottomNavigation';
import { NutritionCalculator } from '../../lib/nutrition-calculator';

export default function Profile() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('es');
  const [userData, setUserData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>({});
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProfile, setEditProfile] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined') return;

    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      router.push('/login');
      return;
    }

    try {
      const userDataStored = localStorage.getItem('userData');
      if (userDataStored) {
        const user = JSON.parse(userDataStored);
        setUserData(user);
      }

      const userProfileStored = localStorage.getItem('userProfile');
      if (userProfileStored) {
        const profile = JSON.parse(userProfileStored);
        setUserProfile(profile);
        setEditProfile(profile);
        setLanguage(profile.language || 'es');
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  }, [router]);

  const translations = {
    es: {
      profile: 'Perfil',
      quickActions: 'Acciones Rápidas',
      language: 'Idioma',
      changeLanguage: 'Cambiar idioma',
      sync: 'Sincronizar',
      fitnessData: 'Datos fitness',
      calculator: 'Calculadora',
      nutritionTargets: 'Objetivos nutricionales',
      rest: 'Descanso',
      configureRest: 'Configurar descanso',
      personalInfo: 'Información Personal',
      edit: 'Editar',
      name: 'Nombre',
      email: 'Email',
      age: 'Edad',
      height: 'Altura',
      weight: 'Peso',
      activity: 'Actividad',
      goal: 'Objetivo',
      goalLose: 'Perder peso',
      goalMaintain: 'Mantener peso',
      goalGain: 'Ganar peso',
      nutritionGoals: 'Objetivos Nutricionales',
      calories: 'Calorías',
      protein: 'Proteínas',
      carbs: 'Carbohidratos',
      fats: 'Grasas',
      autoCalculate: 'Cálculo automático',
      logout: 'Cerrar Sesión',
      save: 'Guardar',
      cancel: 'Cancelar',
      selectLanguage: 'Seleccionar Idioma',
      spanish: 'Español',
      english: 'English',
      syncData: 'Sincronizar Datos',
      syncDescription: 'Sincroniza tus datos con dispositivos fitness',
      syncNow: 'Sincronizar Ahora',
      nutritionCalculator: 'Calculadora Nutricional',
      calculateTargets: 'Calcular Objetivos',
      restDayConfig: 'Configuración de Descanso',
      restDayDescription: 'Configura tus días de descanso',
      configure: 'Configurar'
    },
    en: {
      profile: 'Profile',
      quickActions: 'Quick Actions',
      language: 'Language',
      changeLanguage: 'Change language',
      sync: 'Sync',
      fitnessData: 'Fitness data',
      calculator: 'Calculator',
      nutritionTargets: 'Nutrition targets',
      rest: 'Rest',
      configureRest: 'Configure rest',
      personalInfo: 'Personal Information',
      edit: 'Edit',
      name: 'Name',
      email: 'Email',
      age: 'Age',
      height: 'Height',
      weight: 'Weight',
      activity: 'Activity',
      goal: 'Goal',
      goalLose: 'Lose weight',
      goalMaintain: 'Maintain weight',
      goalGain: 'Gain weight',
      nutritionGoals: 'Nutrition Goals',
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fats: 'Fats',
      autoCalculate: 'Auto calculate',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      selectLanguage: 'Select Language',
      spanish: 'Español',
      english: 'English',
      syncData: 'Sync Data',
      syncDescription: 'Sync your data with fitness devices',
      syncNow: 'Sync Now',
      nutritionCalculator: 'Nutrition Calculator',
      calculateTargets: 'Calculate Targets',
      restDayConfig: 'Rest Day Configuration',
      restDayDescription: 'Configure your rest days',
      configure: 'Configure'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.es;

  const handleSaveProfile = () => {
    try {
      if (editProfile.autoCalculate && editProfile.age && editProfile.weight && editProfile.height) {
        const targets = NutritionCalculator.calculateNutritionTargets({
          age: editProfile.age,
          weight: editProfile.weight,
          height: editProfile.height,
          gender: editProfile.gender || 'male',
          activityLevel: editProfile.activityLevel || 'moderate',
          workActivity: editProfile.workActivity || 'moderate',
          goal: editProfile.goal || 'maintain'
        });

        const updatedProfile = {
          ...editProfile,
          targetCalories: targets.targetCalories,
          targetProtein: targets.targetProtein,
          targetCarbs: targets.targetCarbs,
          targetFats: targets.targetFats
        };

        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      } else {
        localStorage.setItem('userProfile', JSON.stringify(editProfile));
        setUserProfile(editProfile);
      }

      setShowEditModal(false);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (error) {
      console.log('Error saving profile:', error);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    const updatedProfile = { ...userProfile, language: newLanguage };
    setUserProfile(updatedProfile);
    setLanguage(newLanguage);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setShowLanguageModal(false);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profileUpdated'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    localStorage.removeItem('userProfile');
    router.push('/login');
  };

  const getGoalText = (goal: string) => {
    switch(goal) {
      case 'lose': return t.goalLose;
      case 'maintain': return t.goalMaintain;
      case 'gain': return t.goalGain;
      default: return t.goalMaintain;
    }
  };

  const getGoalIcon = (goal: string) => {
    switch(goal) {
      case 'lose': return 'ri-arrow-down-line';
      case 'maintain': return 'ri-pause-line';
      case 'gain': return 'ri-arrow-up-line';
      default: return 'ri-pause-line';
    }
  };

  const getGoalColor = (goal: string) => {
    switch(goal) {
      case 'lose': return '#ef4444';
      case 'maintain': return '#3b82f6';
      case 'gain': return '#16a34a';
      default: return '#3b82f6';
    }
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
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 16px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0
        }}>
          {t.profile}
        </h1>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '24px 16px 100px 16px'
      }}>
        {/* Profile Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: userData?.picture ? `url(${userData.picture})` : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            {!userData?.picture && (
              <span style={{
                color: 'white',
                fontWeight: '600',
                fontSize: '24px'
              }}>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            {userData?.name || 'Usuario'}
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0 0 16px 0'
          }}>
            {userData?.email || 'usuario@email.com'}
          </p>
          <button
            onClick={() => setShowEditModal(true)}
            className="!rounded-button"
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {t.edit}
          </button>
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
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%'
          }}>
            <button
              onClick={() => setShowLanguageModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: '#f0f9ff',
                border: '1px solid #e0e7ff',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="ri-translate-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.language}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.changeLanguage}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowSyncModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: '#f0fdf4',
                border: '1px solid #dcfce7',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: '#16a34a',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="ri-refresh-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.sync}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.fitnessData}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowCalculatorModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="ri-calculator-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.calculator}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.nutritionTargets}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowRestDayModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="ri-pause-circle-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.rest}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.configureRest}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Profile Info */}
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
            {t.personalInfo}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.age}</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.age || '-'} años
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.height}</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.height || '-'} cm
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.weight}</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.weight || '-'} kg
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.activity}</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.activityLevel || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Goal Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              {t.goal}
            </h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="!rounded-button"
              style={{
                padding: '6px 12px',
                background: '#f0f9ff',
                border: '1px solid #e0e7ff',
                borderRadius: '8px',
                color: '#3b82f6',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {t.edit}
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: `2px solid ${getGoalColor(userProfile.goal || 'maintain')}`
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: getGoalColor(userProfile.goal || 'maintain'),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i 
                className={getGoalIcon(userProfile.goal || 'maintain')}
                style={{ 
                  color: 'white', 
                  fontSize: '20px' 
                }}
              ></i>
            </div>
            <div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 2px 0'
              }}>
                {getGoalText(userProfile.goal || 'maintain')}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                Objetivo actual seleccionado
              </p>
            </div>
          </div>
        </div>

        {/* Nutrition Goals */}
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
            {t.nutritionGoals}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.calories}</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.targetCalories || 2000}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.protein}</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.targetProtein || 120}g
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.carbs}</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.targetCarbs || 250}g
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>{t.fats}</p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.targetFats || 67}g
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="!rounded-button"
          style={{
            width: '100%',
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <i className="ri-logout-circle-line"></i>
          {t.logout}
        </button>
      </main>

      {/* Language Modal */}
      {showLanguageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '320px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.selectLanguage}
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <button
                onClick={() => handleLanguageChange('es')}
                className="!rounded-button"
                style={{
                  padding: '12px 16px',
                  background: language === 'es' ? '#3b82f6' : '#f8fafc',
                  color: language === 'es' ? 'white' : '#1f2937',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {t.spanish}
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className="!rounded-button"
                style={{
                  padding: '12px 16px',
                  background: language === 'en' ? '#3b82f6' : '#f8fafc',
                  color: language === 'en' ? 'white' : '#1f2937',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {t.english}
              </button>
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '12px',
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#6b7280',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0'
            }}>
              {t.edit} {t.profile}
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.name}
                </label>
                <input
                  type="text"
                  value={editProfile.name || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.age}
                </label>
                <input
                  type="number"
                  value={editProfile.age || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.weight} (kg)
                </label>
                <input
                  type="number"
                  value={editProfile.weight || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, weight: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.height} (cm)
                </label>
                <input
                  type="number"
                  value={editProfile.height || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, height: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.activity}
                </label>
                <select
                  value={editProfile.activityLevel || 'moderate'}
                  onChange={(e) => setEditProfile({ ...editProfile, activityLevel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="sedentary">Sedentario</option>
                  <option value="light">Ligero</option>
                  <option value="moderate">Moderado</option>
                  <option value="active">Activo</option>
                  <option value="very-active">Muy activo</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.goal}
                </label>
                <select
                  value={editProfile.goal || 'maintain'}
                  onChange={(e) => setEditProfile({ ...editProfile, goal: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="lose">{t.goalLose}</option>
                  <option value="maintain">{t.goalMaintain}</option>
                  <option value="gain">{t.goalGain}</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <input
                  type="checkbox"
                  id="autoCalculate"
                  checked={editProfile.autoCalculate || false}
                  onChange={(e) => setEditProfile({ ...editProfile, autoCalculate: e.target.checked })}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <label
                  htmlFor="autoCalculate"
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  {t.autoCalculate}
                </label>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '320px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.syncData}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              {t.syncDescription}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowSyncModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  setShowSyncModal(false);
                  // Aquí iría la lógica de sincronización
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#16a34a',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {t.syncNow}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculatorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '320px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.nutritionCalculator}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              Calcula tus objetivos nutricionales basados en tu perfil
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowCalculatorModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  setShowCalculatorModal(false);
                  // Aquí iría la lógica de cálculo
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {t.calculateTargets}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest Day Modal */}
      {showRestDayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '320px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.restDayConfig}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              {t.restDayDescription}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowRestDayModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  setShowRestDayModal(false);
                  // Aquí iría la lógica de configuración de descanso
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {t.configure}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

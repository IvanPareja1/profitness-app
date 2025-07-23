
'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NotificationSettings {
  pushNotifications: boolean;
  emailReminders: boolean;
  weeklyReports: boolean;
  mealReminders: boolean;
}

interface PreferenceSettings {
  units: string;
  language: string;
  theme: string;
  startWeek: string;
}

interface PrivacySettings {
  profileVisibility: string;
  dataSharing: boolean;
  analytics: boolean;
}

export default function Settings() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushNotifications: true,
    emailReminders: false,
    weeklyReports: true,
    mealReminders: true
  });

  const [preferences, setPreferences] = useState<PreferenceSettings>({
    units: 'metric',
    language: 'es',
    theme: 'light',
    startWeek: 'monday'
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true
  });

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key: keyof PreferenceSettings, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyToggle = (key: keyof PrivacySettings) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = () => {
    console.log('Exportando datos...');
  };

  const handleResetData = () => {
    console.log('Reiniciando datos...');
  };

  const handleDeleteAccount = () => {
    console.log('Eliminando cuenta...');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
    }}>
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
          <Link href="/profile" style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}>
            <i className="ri-arrow-left-line" style={{ color: '#6b7280', fontSize: '20px' }}></i>
          </Link>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>Configuración</h1>
          <div style={{ width: '32px', height: '32px' }}></div>
        </div>
      </header>

      <main style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        padding: '64px 16px 80px 16px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          marginTop: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>Notificaciones</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {key === 'pushNotifications' ? 'Notificaciones Push' :
                     key === 'emailReminders' ? 'Recordatorios por Email' :
                     key === 'weeklyReports' ? 'Reportes Semanales' :
                     'Recordatorios de Comida'}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {key === 'pushNotifications' ? 'Recibe alertas en tu dispositivo' :
                     key === 'emailReminders' ? 'Recibe recordatorios vía correo' :
                     key === 'weeklyReports' ? 'Resumen de tu progreso' :
                     'Recordatorios para registrar comidas'}
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationToggle(key as keyof NotificationSettings)}
                  style={{
                    position: 'relative',
                    width: '48px',
                    height: '24px',
                    borderRadius: '24px',
                    transition: 'background-color 0.2s',
                    backgroundColor: value ? '#3b82f6' : '#d1d5db',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'transform 0.2s',
                    transform: value ? 'translateX(24px)' : 'translateX(2px)'
                  }}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

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
          }}>Preferencias</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div>
              <p style={{
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>Unidades</p>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handlePreferenceChange('units', 'metric')}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: preferences.units === 'metric' ? '#3b82f6' : '#f3f4f6',
                    color: preferences.units === 'metric' ? 'white' : '#6b7280'
                  }}
                >
                  Métrico (kg, cm)
                </button>
                <button
                  onClick={() => handlePreferenceChange('units', 'imperial')}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: preferences.units === 'imperial' ? '#3b82f6' : '#f3f4f6',
                    color: preferences.units === 'imperial' ? 'white' : '#6b7280'
                  }}
                >
                  Imperial (lbs, ft)
                </button>
              </div>
            </div>

            <div>
              <p style={{
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>Idioma</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                <button
                  onClick={() => handlePreferenceChange('language', 'es')}
                  className="!rounded-button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: preferences.language === 'es' ? '#3b82f6' : '#f3f4f6',
                    color: preferences.language === 'es' ? 'white' : '#6b7280'
                  }}
                >
                  Español
                </button>
                <button
                  onClick={() => handlePreferenceChange('language', 'en')}
                  className="!rounded-button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: preferences.language === 'en' ? '#3b82f6' : '#f3f4f6',
                    color: preferences.language === 'en' ? 'white' : '#6b7280'
                  }}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <p style={{
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>Tema</p>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handlePreferenceChange('theme', 'light')}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: preferences.theme === 'light' ? '#3b82f6' : '#f3f4f6',
                    color: preferences.theme === 'light' ? 'white' : '#6b7280'
                  }}
                >
                  Claro
                </button>
                <button
                  onClick={() => handlePreferenceChange('theme', 'dark')}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: preferences.theme === 'dark' ? '#3b82f6' : '#f3f4f6',
                    color: preferences.theme === 'dark' ? 'white' : '#6b7280'
                  }}
                >
                  Oscuro
                </button>
              </div>
            </div>
          </div>
        </div>

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
          }}>Privacidad y Datos</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>Análisis de Datos</p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>Ayudar a mejorar la aplicación</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('analytics')}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '24px',
                  borderRadius: '24px',
                  transition: 'background-color 0.2s',
                  backgroundColor: privacy.analytics ? '#3b82f6' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'transform 0.2s',
                  transform: privacy.analytics ? 'translateX(24px)' : 'translateX(2px)'
                }}></div>
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>Compartir Datos</p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>Compartir datos con socios</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('dataSharing')}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '24px',
                  borderRadius: '24px',
                  transition: 'background-color 0.2s',
                  backgroundColor: privacy.dataSharing ? '#3b82f6' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'transform 0.2s',
                  transform: privacy.dataSharing ? 'translateX(24px)' : 'translateX(2px)'
                }}></div>
              </button>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <button 
            onClick={handleExportData}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid #f3f4f6',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
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
                <i className="ri-download-line" style={{ color: '#3b82f6', fontSize: '14px' }}></i>
              </div>
              <span style={{ color: '#374151' }}>Exportar Datos</span>
            </div>
            <i className="ri-arrow-right-s-line" style={{ color: '#9ca3af', fontSize: '18px' }}></i>
          </button>
          
          <button 
            onClick={handleResetData}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid #f3f4f6',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#fed7aa',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-refresh-line" style={{ color: '#ea580c', fontSize: '14px' }}></i>
              </div>
              <span style={{ color: '#374151' }}>Reiniciar Todos los Datos</span>
            </div>
            <i className="ri-arrow-right-s-line" style={{ color: '#9ca3af', fontSize: '18px' }}></i>
          </button>
          
          <button 
            onClick={handleDeleteAccount}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-delete-bin-line" style={{ color: '#dc2626', fontSize: '14px' }}></i>
              </div>
              <span style={{ color: '#dc2626' }}>Eliminar Cuenta</span>
            </div>
            <i className="ri-arrow-right-s-line" style={{ color: '#9ca3af', fontSize: '18px' }}></i>
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 4px 0'
          }}>Profitness v1.0.0</p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: 0
          }}>Build 2024.01.21</p>
        </div>
      </main>

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
              <i className="ri-user-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

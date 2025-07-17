
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Notifications() {
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailReminders: false,
    weeklyReports: true,
    mealReminders: true,
    weightReminders: true,
    goalAchievements: true,
    socialUpdates: false,
    appUpdates: true
  });

  const [reminderTimes, setReminderTimes] = useState({
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:00',
    weigh: '07:00'
  });

  const [showCustomTime, setShowCustomTime] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState('');
  const [showMarkAllModal, setShowMarkAllModal] = useState(false);

  const [recentNotifications, setRecentNotifications] = useState([
    {
      id: 1,
      type: 'meal',
      title: '¡Hora del almuerzo!',
      message: 'No olvides registrar tu comida',
      time: '13:00',
      date: 'Hoy',
      read: false
    },
    {
      id: 2,
      type: 'achievement',
      title: '¡Meta alcanzada! ',
      message: 'Has cumplido tu objetivo de proteínas',
      time: '10:30',
      date: 'Hoy',
      read: true
    },
    {
      id: 3,
      type: 'weight',
      title: 'Recordatorio de pesaje',
      message: 'Es hora de registrar tu peso',
      time: '07:00',
      date: 'Hoy',
      read: true
    },
    {
      id: 4,
      type: 'weekly',
      title: 'Reporte semanal',
      message: 'Tu progreso de la semana está listo',
      time: '09:00',
      date: 'Ayer',
      read: true
    }
  ]);

  const handleToggle = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleTimeChange = (reminder: string, time: string) => {
    setReminderTimes(prev => ({
      ...prev,
      [reminder]: time
    }));
  };

  const openTimeSelector = (reminderType: string) => {
    setSelectedReminder(reminderType);
    setShowCustomTime(true);
  };

  const handleMarkAllAsRead = () => {
    setRecentNotifications(prev => 
      prev.map(notification => ({ 
        ...notification, 
        read: true 
      }))
    );
    setShowMarkAllModal(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return 'ri-restaurant-line';
      case 'achievement':
        return 'ri-trophy-line';
      case 'weight':
        return 'ri-scales-3-line';
      case 'weekly':
        return 'ri-file-chart-line';
      default:
        return 'ri-notification-line';
    }
  };

  const unreadCount = recentNotifications.filter(n => !n.read).length;

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
          }}>Notificaciones</h1>
          <button 
            onClick={() => setShowMarkAllModal(true)}
            disabled={unreadCount === 0}
            style={{
              color: unreadCount === 0 ? '#9ca3af' : '#3b82f6',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: unreadCount === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Marcar leídas
          </button>
        </div>
      </header>

      <main style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        padding: '64px 16px 80px 16px'
      }}>
        {/* Notification Settings */}
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
          }}>Configuración de Notificaciones</h3>
          
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
                }}>Notificaciones Push</p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>Recibe alertas en tu dispositivo</p>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '24px',
                  borderRadius: '24px',
                  transition: 'background-color 0.2s',
                  backgroundColor: notificationSettings.pushNotifications ? '#3b82f6' : '#d1d5db',
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
                  transform: notificationSettings.pushNotifications ? 'translateX(24px)' : 'translateX(2px)'
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
                }}>Recordatorios de comida</p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>Alertas para registrar comidas</p>
              </div>
              <button
                onClick={() => handleToggle('mealReminders')}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '24px',
                  borderRadius: '24px',
                  transition: 'background-color 0.2s',
                  backgroundColor: notificationSettings.mealReminders ? '#3b82f6' : '#d1d5db',
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
                  transform: notificationSettings.mealReminders ? 'translateX(24px)' : 'translateX(2px)'
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
                }}>Recordatorio de pesaje</p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>Alerta diaria para registrar peso</p>
              </div>
              <button
                onClick={() => handleToggle('weightReminders')}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '24px',
                  borderRadius: '24px',
                  transition: 'background-color 0.2s',
                  backgroundColor: notificationSettings.weightReminders ? '#3b82f6' : '#d1d5db',
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
                  transform: notificationSettings.weightReminders ? 'translateX(24px)' : 'translateX(2px)'
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
                }}>Logros y metas</p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>Celebra tus objetivos cumplidos</p>
              </div>
              <button
                onClick={() => handleToggle('goalAchievements')}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '24px',
                  borderRadius: '24px',
                  transition: 'background-color 0.2s',
                  backgroundColor: notificationSettings.goalAchievements ? '#3b82f6' : '#d1d5db',
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
                  transform: notificationSettings.goalAchievements ? 'translateX(24px)' : 'translateX(2px)'
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
                }}>Reportes semanales</p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>Resumen de tu progreso</p>
              </div>
              <button
                onClick={() => handleToggle('weeklyReports')}
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '24px',
                  borderRadius: '24px',
                  transition: 'background-color 0.2s',
                  backgroundColor: notificationSettings.weeklyReports ? '#3b82f6' : '#d1d5db',
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
                  transform: notificationSettings.weeklyReports ? 'translateX(24px)' : 'translateX(2px)'
                }}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Times */}
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
          }}>Horarios de Recordatorios</h3>
          
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
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
                  <i className="ri-sun-line" style={{ color: '#f59e0b', fontSize: '18px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>Desayuno</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Recordatorio matutino</p>
                </div>
              </div>
              <button
                onClick={() => openTimeSelector('breakfast')}
                style={{
                  color: '#3b82f6',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {reminderTimes.breakfast}
              </button>
            </div>

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
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#fed7aa',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-sun-fill" style={{ color: '#ea580c', fontSize: '18px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>Almuerzo</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Recordatorio del mediodía</p>
                </div>
              </div>
              <button
                onClick={() => openTimeSelector('lunch')}
                style={{
                  color: '#3b82f6',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {reminderTimes.lunch}
              </button>
            </div>

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
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#e9d5ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-moon-line" style={{ color: '#8b5cf6', fontSize: '18px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>Cena</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Recordatorio nocturno</p>
                </div>
              </div>
              <button
                onClick={() => openTimeSelector('dinner')}
                style={{
                  color: '#3b82f6',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {reminderTimes.dinner}
              </button>
            </div>

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
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-scales-3-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
                </div>
                <div>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>Pesaje diario</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Registro de peso</p>
                </div>
              </div>
              <button
                onClick={() => openTimeSelector('weigh')}
                style={{
                  color: '#3b82f6',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {reminderTimes.weigh}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
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
            }}>Notificaciones Recientes</h3>
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                {unreadCount} nuevas
              </span>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                  backgroundColor: !notification.read ? '#eff6ff' : 'transparent',
                  border: !notification.read ? '1px solid #dbeafe' : 'none'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 
                    notification.type === 'meal' ? '#dcfce7' :
                    notification.type === 'achievement' ? '#fef3c7' :
                    notification.type === 'weight' ? '#dbeafe' :
                    '#e9d5ff'
                }}>
                  <i className={getNotificationIcon(notification.type)} style={{
                    fontSize: '18px',
                    color: 
                      notification.type === 'meal' ? '#16a34a' :
                      notification.type === 'achievement' ? '#f59e0b' :
                      notification.type === 'weight' ? '#3b82f6' :
                      '#8b5cf6'
                  }}></i>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <p style={{
                        fontWeight: '500',
                        color: !notification.read ? '#1e40af' : '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {notification.title}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0 0 8px 0'
                      }}>{notification.message}</p>
                      <p style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        margin: 0
                      }}>
                        {notification.date} • {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%'
                      }}></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mark All as Read Modal */}
      {showMarkAllModal && (
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
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <i className="ri-notification-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>Marcar como Leídas</h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              ¿Quieres marcar todas las notificaciones como leídas? Esta acción no se puede deshacer.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowMarkAllModal(false)}
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
                onClick={handleMarkAllAsRead}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Marcar Todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Selector Modal */}
      {showCustomTime && (
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
              }}>Seleccionar Hora</h3>
              <button 
                onClick={() => setShowCustomTime(false)}
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
              <input
                type="time"
                value={reminderTimes[selectedReminder as keyof typeof reminderTimes]}
                onChange={(e) => handleTimeChange(selectedReminder, e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  textAlign: 'center',
                  fontSize: '18px',
                  fontWeight: '500'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginBottom: '24px'
            }}>
              <button
                onClick={() => handleTimeChange(selectedReminder, '07:00')}
                className="!rounded-button"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                07:00
              </button>
              <button
                onClick={() => handleTimeChange(selectedReminder, '13:00')}
                className="!rounded-button"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                13:00
              </button>
              <button
                onClick={() => handleTimeChange(selectedReminder, '19:00')}
                className="!rounded-button"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                19:00
              </button>
            </div>

            <button
              onClick={() => setShowCustomTime(false)}
              className="!rounded-button"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Confirmar
            </button>
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
              <i className="ri-user-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </div>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

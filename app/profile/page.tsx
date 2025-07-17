
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Modal from '../../components/ui/Modal';
import AuthGuard from '../../components/ui/AuthGuard';

export default function Profile() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  );
}

function ProfilePage() {
  const { userProfile, profilePhoto, mounted } = useUserProfile();
  const { signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const getGoalText = (goal: string) => {
    const goalTexts: { [key: string]: string } = {
      'fat_loss': 'Pérdida de grasa',
      'muscle_gain': 'Ganancia muscular',
      'recomposition': 'Recomposición corporal',
      'maintenance': 'Mantenimiento'
    };
    return goalTexts[goal] || 'Objetivo personal';
  };

  const getActivityLevelText = (level: string) => {
    const activityTexts: { [key: string]: string } = {
      'sedentary': 'Sedentaria',
      'light': 'Ligeramente activa',
      'moderate': 'Moderadamente activa',
      'very': 'Muy activa',
      'extra': 'Extremadamente activa'
    };
    return activityTexts[level] || 'Moderadamente activa';
  };

  const handleShareApp = (platform: string) => {
    const appName = "Profitness";
    const appDescription = "Nutre tu progreso, domina tus resultados";
    const downloadLink = "https://profitness.app/download";
    const message = `¡Hola! Te recomiendo ${appName} - ${appDescription}. Descárgala aquí: ${downloadLink}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(downloadLink).then(() => {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        });
        break;
    }
    setShowShareModal(false);
  };

  const handleLogout = () => {
    signOut();
    setShowLogoutModal(false);
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6',
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
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>Perfil</h1>
          <Link href="/settings" style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '50%',
            textDecoration: 'none',
            transition: 'background-color 0.2s'
          }}>
            <i className="ri-settings-line" style={{ color: '#6b7280', fontSize: '18px' }}></i>
          </Link>
        </div>
      </header>

      <main style={{
        paddingTop: '80px',
        paddingBottom: '96px',
        padding: '80px 16px 96px 16px'
      }}>
        {/* Profile Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: profilePhoto ? 'none' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Foto de perfil"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>MG</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>{userProfile.name}</h2>
              <p style={{
                color: '#6b7280',
                margin: '0 0 8px 0',
                fontSize: '14px'
              }}>{userProfile.email}</p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: '600'
                }}>
                  {getGoalText(userProfile.goal)}
                </span>
              </div>
            </div>
          </div>

          <Link href="/edit-profile">
            <button className="!rounded-button" style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer'
            }}>
              Editar Perfil
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#eff6ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <i className="ri-calendar-check-line" style={{ color: '#2563eb', fontSize: '20px' }}></i>
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>52</p>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              fontWeight: '500',
              margin: 0
            }}>Días activos</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f0fdf4',
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
            }}>-3.3 kg</p>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              fontWeight: '500',
              margin: 0
            }}>Peso perdido</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fff7ed',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <i className="ri-fire-line" style={{ color: '#ea580c', fontSize: '20px' }}></i>
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>12</p>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              fontWeight: '500',
              margin: 0
            }}>Días seguidos</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#faf5ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <i className="ri-restaurant-line" style={{ color: '#7c3aed', fontSize: '20px' }}></i>
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>234</p>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              fontWeight: '500',
              margin: 0
            }}>Comidas registradas</p>
          </div>
        </div>

        {/* Personal Information */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>Información Personal</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-cake-line" style={{ color: '#6b7280', fontSize: '16px' }}></i>
                </div>
                <span style={{ color: '#374151', fontWeight: '500' }}>Edad</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{userProfile.age} años</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-ruler-line" style={{ color: '#6b7280', fontSize: '16px' }}></i>
                </div>
                <span style={{ color: '#374151', fontWeight: '500' }}>Altura</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{userProfile.height} cm</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-scales-3-line" style={{ color: '#6b7280', fontSize: '16px' }}></i>
                </div>
                <span style={{ color: '#374151', fontWeight: '500' }}>Peso actual</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{userProfile.currentWeight} kg</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-flag-line" style={{ color: '#6b7280', fontSize: '16px' }}></i>
                </div>
                <span style={{ color: '#374151', fontWeight: '500' }}>Peso objetivo</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{userProfile.goalWeight} kg</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-run-line" style={{ color: '#6b7280', fontSize: '16px' }}></i>
                </div>
                <span style={{ color: '#374151', fontWeight: '500' }}>Nivel de actividad</span>
              </div>
              <span style={{
                fontWeight: 'bold',
                color: '#1f2937',
                fontSize: '13px'
              }}>{getActivityLevelText(userProfile.activityLevel)}</span>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <Link href="/notifications">
            <button style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              borderBottom: '1px solid #f9fafb',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              textDecoration: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-notification-line" style={{ color: '#2563eb', fontSize: '16px' }}></i>
                </div>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>Notificaciones</span>
              </div>
              <i className="ri-arrow-right-s-line" style={{ color: '#9ca3af', fontSize: '20px' }}></i>
            </button>
          </Link>

          <button
            onClick={() => setShowShareModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              borderBottom: '1px solid #f9fafb',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f0fdf4',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-share-line" style={{ color: '#16a34a', fontSize: '16px' }}></i>
              </div>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>Compartir app</span>
            </div>
            <i className="ri-arrow-right-s-line" style={{ color: '#9ca3af', fontSize: '20px' }}></i>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-logout-box-line" style={{ color: '#dc2626', fontSize: '16px' }}></i>
              </div>
              <span style={{ color: '#dc2626', fontWeight: '500' }}>Cerrar sesión</span>
            </div>
            <i className="ri-arrow-right-s-line" style={{ color: '#9ca3af', fontSize: '20px' }}></i>
          </button>
        </div>

        {/* App Info */}
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500',
            margin: '0 0 4px 0'
          }}>Profitness v1.0.0</p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: 0
          }}>Nutre tu progreso, domina tus resultados</p>
        </div>
      </main>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Compartir Profitness"
        size="sm"
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <i className="ri-share-line" style={{ color: 'white', fontSize: '24px' }}></i>
          </div>
          <p style={{ color: '#6b7280' }}>
            Comparte Profitness con tus amigos y familiares para que también puedan llevar un estilo de vida saludable
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => handleShareApp('whatsapp')}
            className="!rounded-button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
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
                color: '#1f2937',
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
            onClick={() => handleShareApp('copy')}
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
                color: '#1f2937',
                margin: '0 0 4px 0'
              }}>Copiar enlace</p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>Copiar al portapapeles</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Cerrar Sesión"
        size="sm"
        showCloseButton={false}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#fef2f2',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <i className="ri-logout-box-line" style={{ color: '#dc2626', fontSize: '24px' }}></i>
          </div>
          <p style={{ color: '#6b7280' }}>¿Estás seguro que quieres cerrar sesión?</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowLogoutModal(false)}
            className="!rounded-button"
            style={{
              flex: 1,
              padding: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '16px',
              color: '#374151',
              fontWeight: '600',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleLogout}
            className="!rounded-button"
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </Modal>

      {/* Success Message */}
      {showCopySuccess && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '16px',
          right: '16px',
          zIndex: 60
        }}>
          <div style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '320px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#15803d',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="ri-check-line" style={{ color: 'white', fontSize: '14px' }}></i>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Enlace copiado al portapapeles</span>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

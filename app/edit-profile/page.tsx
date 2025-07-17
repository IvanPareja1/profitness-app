
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Modal from '../../components/ui/Modal';

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentario', description: 'Poco o ningún ejercicio' },
  { id: 'light', label: 'Ligero', description: '1-3 días por semana' },
  { id: 'moderate', label: 'Moderado', description: '3-5 días por semana' },
  { id: 'very', label: 'Activo', description: '6-7 días por semana' },
  { id: 'extra', label: 'Muy Activo', description: '2 veces al día' }
];

const GOALS = [
  { id: 'fat_loss', label: 'Perder Peso', icon: 'ri-scales-3-line' },
  { id: 'muscle_gain', label: 'Ganar Músculo', icon: 'ri-fitness-line' },
  { id: 'recomposition', label: 'Recomposición', icon: 'ri-exchange-line' },
  { id: 'maintenance', label: 'Mantenimiento', icon: 'ri-heart-pulse-line' }
];

export default function EditProfile() {
  const { userProfile, profilePhoto, mounted, updateProfile, updateProfilePhoto } = useUserProfile();
  const [formData, setFormData] = useState(userProfile);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(profilePhoto);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoOption = (option: string) => {
    setShowPhotoModal(false);

    switch (option) {
      case 'camera':
        setTimeout(() => {
          const cameraPhotoUrl = 'https://readdy.ai/api/search-image?query=Professional%20female%20portrait%20photo%2C%20business%20headshot%2C%20clean%20white%20background%2C%20natural%20lighting%2C%20friendly%20smile%2C%20modern%20professional%20photography%20style%2C%20high%20quality&width=96&height=96&seq=camera1&orientation=squarish';
          setCurrentPhoto(cameraPhotoUrl);
        }, 1000);
        break;
      case 'gallery':
        setTimeout(() => {
          const galleryPhotoUrl = 'https://readdy.ai/api/search-image?query=Professional%20female%20portrait%20photo%2C%20business%20headshot%2C%20clean%20white%20background%2C%20natural%20lighting%2C%20friendly%20smile%2C%20modern%20professional%20photography%20style%2C%20high%20quality&width=96&height=96&seq=gallery1&orientation=squarish';
          setCurrentPhoto(galleryPhotoUrl);
        }, 1000);
        break;
      case 'remove':
        setCurrentPhoto('');
        break;
    }
  };

  const handleSave = () => {
    try {
      updateProfile(formData);
      updateProfilePhoto(currentPhoto);

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
    }
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

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
          }}>Editar Perfil</h1>
          <button 
            onClick={handleSave}
            style={{
              color: '#3b82f6',
              fontWeight: '500',
              fontSize: '14px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            Guardar
          </button>
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
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '96px',
              height: '96px',
              background: currentPhoto ? 'none' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {currentPhoto ? (
                <img 
                  src={currentPhoto}
                  alt="Foto de perfil"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>MG</span>
              )}
            </div>
            <button 
              onClick={() => setShowPhotoModal(true)}
              style={{
                color: '#3b82f6',
                fontWeight: '500',
                fontSize: '14px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              Cambiar foto
            </button>
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
          }}>Información Personal</h3>
          
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
                marginBottom: '8px'
              }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s'
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

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s'
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

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Género
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <button
                  onClick={() => handleInputChange('gender', 'female')}
                  className="!rounded-button"
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: formData.gender === 'female' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    backgroundColor: formData.gender === 'female' ? '#eff6ff' : 'white',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.gender !== 'female') {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.gender !== 'female') {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    backgroundColor: formData.gender === 'female' ? '#dbeafe' : '#f3f4f6'
                  }}>
                    <i className="ri-women-line" style={{
                      fontSize: '18px',
                      color: formData.gender === 'female' ? '#3b82f6' : '#6b7280'
                    }}></i>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: formData.gender === 'female' ? '#1e40af' : '#1f2937',
                    margin: 0
                  }}>
                    Mujer
                  </p>
                </button>

                <button
                  onClick={() => handleInputChange('gender', 'male')}
                  className="!rounded-button"
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: formData.gender === 'male' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    backgroundColor: formData.gender === 'male' ? '#eff6ff' : 'white',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.gender !== 'male') {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.gender !== 'male') {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    backgroundColor: formData.gender === 'male' ? '#dbeafe' : '#f3f4f6'
                  }}>
                    <i className="ri-men-line" style={{
                      fontSize: '18px',
                      color: formData.gender === 'male' ? '#3b82f6' : '#6b7280'
                    }}></i>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: formData.gender === 'male' ? '#1e40af' : '#1f2937',
                    margin: 0
                  }}>
                    Hombre
                  </p>
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Edad
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.2s'
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
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.2s'
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
          }}>Métricas Corporales</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div>
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
                value={formData.currentWeight}
                onChange={(e) => handleInputChange('currentWeight', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s'
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
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Peso objetivo (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.goalWeight}
                onChange={(e) => handleInputChange('goalWeight', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  transition: 'all 0.2s'
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
          }}>Nivel de Actividad</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => handleInputChange('activityLevel', level.id)}
                className="!rounded-button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: '12px',
                  border: formData.activityLevel === level.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  backgroundColor: formData.activityLevel === level.id ? '#eff6ff' : 'white',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (formData.activityLevel !== level.id) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.activityLevel !== level.id) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
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
                    }}>{level.label}</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>{level.description}</p>
                  </div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: formData.activityLevel === level.id ? '2px solid #3b82f6' : '2px solid #d1d5db',
                    backgroundColor: formData.activityLevel === level.id ? '#3b82f6' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {formData.activityLevel === level.id && (
                      <i className="ri-check-line" style={{
                        color: 'white',
                        fontSize: '12px'
                      }}></i>
                    )}
                  </div>
                </div>
              </button>
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
          }}>Objetivo</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleInputChange('goal', goal.id)}
                className="!rounded-button"
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: formData.goal === goal.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  backgroundColor: formData.goal === goal.id ? '#eff6ff' : 'white',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (formData.goal !== goal.id) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.goal !== goal.id) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px auto',
                  backgroundColor: formData.goal === goal.id ? '#dbeafe' : '#f3f4f6'
                }}>
                  <i className={goal.icon} style={{
                    fontSize: '18px',
                    color: formData.goal === goal.id ? '#3b82f6' : '#6b7280'
                  }}></i>
                </div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: formData.goal === goal.id ? '#1e40af' : '#1f2937',
                  margin: 0
                }}>
                  {goal.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="!rounded-button"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Guardar Cambios
        </button>
      </main>

      {showPhotoModal && (
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
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>Cambiar Foto</h3>
              <button 
                onClick={() => setShowPhotoModal(false)}
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

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                onClick={() => handlePhotoOption('camera')}
                className="!rounded-button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#eff6ff'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <i className="ri-camera-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>Tomar foto</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Usar la cámara</p>
                </div>
              </button>

              <button
                onClick={() => handlePhotoOption('gallery')}
                className="!rounded-button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f0fdf4'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <i className="ri-image-line" style={{ color: '#16a34a', fontSize: '18px' }}></i>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>Seleccionar de galería</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Elegir foto existente</p>
                </div>
              </button>

              {currentPhoto && (
                <button
                  onClick={() => handlePhotoOption('remove')}
                  className="!rounded-button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <i className="ri-delete-bin-line" style={{ color: '#dc2626', fontSize: '18px' }}></i>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>Eliminar foto</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>Volver a iniciales</p>
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowPhotoModal(false)}
              className="!rounded-button"
              style={{
                width: '100%',
                marginTop: '16px',
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
          </div>
        </div>
      )}

      {showSuccessModal && (
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
            maxWidth: '320px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <i className="ri-check-line" style={{ color: '#16a34a', fontSize: '32px' }}></i>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>¡Perfil Actualizado!</h3>
            <p style={{
              color: '#6b7280',
              margin: 0
            }}>Tus cambios han sido guardados exitosamente</p>
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

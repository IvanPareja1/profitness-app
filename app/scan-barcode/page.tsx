
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ScanBarcode() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');

  const handleStartScan = () => {
    setIsScanning(true);
    // Simular escaneo después de 3 segundos
    setTimeout(() => {
      setScannedCode('7501234567890');
      setIsScanning(false);
    }, 3000);
  };

  const recentScans = [
    { code: '7501234567890', name: 'Cereal Fitness Original', brand: 'Nestlé', calories: 110 },
    { code: '7506174507234', name: 'Yogurt Griego Natural', brand: 'Alpura', calories: 100 },
    { code: '7501000673209', name: 'Atún en Agua', brand: 'Dolores', calories: 120 },
    { code: '7501030485739', name: 'Pan Integral', brand: 'Bimbo', calories: 80 }
  ];

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
          <Link href="/add-food" style={{
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
          }}>Escanear Código</h1>
          <div style={{ width: '32px', height: '32px' }}></div>
        </div>
      </header>

      <main style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        padding: '64px 16px 80px 16px'
      }}>
        {/* Scanner Area */}
        <div style={{
          marginTop: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '24px',
            textAlign: 'center'
          }}>
            {!isScanning && !scannedCode && (
              <>
                <div style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <i className="ri-qr-scan-2-line" style={{ color: 'white', fontSize: '32px' }}></i>
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>Escanear Código de Barras</h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '24px',
                  margin: '0 0 24px 0'
                }}>Apunta la cámara hacia el código de barras del producto</p>
                <button
                  onClick={handleStartScan}
                  className="!rounded-button"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Iniciar Escaneo
                </button>
              </>
            )}

            {isScanning && (
              <>
                <div style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  animation: 'pulse 2s infinite'
                }}>
                  <i className="ri-qr-scan-2-line" style={{ color: 'white', fontSize: '32px' }}></i>
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>Escaneando...</h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '24px',
                  margin: '0 0 24px 0'
                }}>Mantén el código centrado en la pantalla</p>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '8px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '12px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                </div>
              </>
            )}

            {scannedCode && (
              <>
                <div style={{
                  width: '96px',
                  height: '96px',
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
                }}>¡Código Escaneado!</h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>Código: {scannedCode}</p>
                <p style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  marginBottom: '24px',
                  margin: '0 0 24px 0'
                }}>Cereal Fitness Original - Nestlé</p>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => {
                      setScannedCode('');
                      setIsScanning(false);
                    }}
                    className="!rounded-button"
                    style={{
                      flex: 1,
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Escanear Otro
                  </button>
                  <Link href="/add-food" style={{
                    flex: 1,
                    textDecoration: 'none'
                  }}>
                    <button
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
                      Agregar
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Manual Input */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>Ingreso Manual</h3>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <input
                type="text"
                placeholder="Ingresa el código manualmente"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px'
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
              <button
                className="!rounded-button"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px',
            margin: '0 0 12px 0'
          }}>Escaneos Recientes</h3>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {recentScans.map((item, index) => (
              <button
                key={index}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderBottom: index < recentScans.length - 1 ? '1px solid #f3f4f6' : 'none',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <i className="ri-qr-code-line" style={{ color: 'white', fontSize: '18px' }}></i>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: '0 0 4px 0'
                    }}>{item.name}</h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 4px 0'
                    }}>{item.brand} • {item.calories} kcal</p>
                    <p style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: 0
                    }}>{item.code}</p>
                  </div>
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-add-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div style={{
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              marginTop: '2px'
            }}>
              <i className="ri-lightbulb-line" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </div>
            <div>
              <h4 style={{
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>Consejos para escanear</h4>
              <ul style={{
                fontSize: '14px',
                color: '#1e40af',
                margin: 0,
                paddingLeft: '16px',
                lineHeight: '1.5'
              }}>
                <li>• Asegúrate de tener buena iluminación</li>
                <li>• Mantén el código centrado en la pantalla</li>
                <li>• Limpia la lente de la cámara si es necesario</li>
              </ul>
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
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>Agregar</span>
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

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

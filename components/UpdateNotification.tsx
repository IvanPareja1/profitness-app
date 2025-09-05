'use client';

import { useState, useEffect } from 'react';

export default function UpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado:', registration);
          
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        })
        .catch(error => {
          console.log('Error al registrar Service Worker:', error);
        });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setShowUpdatePrompt(true);
        }
      });
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Enviar mensaje al service worker para actualizar
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SKIP_WAITING'
        });
      }

      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error al actualizar:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    // Recordar que el usuario rechazó la actualización por 1 hora
    localStorage.setItem('update-dismissed', Date.now().toString());
  };

  // No mostrar si se rechazó recientemente
  const dismissed = localStorage.getItem('update-dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 3600000) { // 1 hora
    return null;
  }

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '16px',
      right: '16px',
      zIndex: 9999,
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid #e5e7eb',
      animation: 'slideDown 0.3s ease-out'
    }}>
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          <i className="ri-refresh-line" style={{ color: 'white', fontSize: '18px' }}></i>
        </div>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            Actualización disponible
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Nueva versión de ProFitness lista para instalar
          </p>
        </div>
      </div>

      <div style={{
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        border: '1px solid #dcfce7'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <i className="ri-star-line" style={{ color: '#16a34a', fontSize: '16px' }}></i>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937'
          }}>
            Mejoras incluidas:
          </span>
        </div>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '12px',
          color: '#374151'
        }}>
          <li>Escáner de códigos de barras mejorado</li>
          <li>Persistencia de datos optimizada</li>
          <li>Rendimiento general mejorado</li>
          <li>Corrección de errores menores</li>
        </ul>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="!rounded-button"
          style={{
            flex: 1,
            padding: '12px 16px',
            background: isUpdating ? '#e5e7eb' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isUpdating ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Actualizando...
            </>
          ) : (
            <>
              <i className="ri-download-line" style={{ fontSize: '16px' }}></i>
              Actualizar ahora
            </>
          )}
        </button>
        <button
          onClick={handleDismiss}
          disabled={isUpdating}
          className="!rounded-button"
          style={{
            padding: '12px 16px',
            background: '#f3f4f6',
            color: '#6b7280',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isUpdating ? 'not-allowed' : 'pointer'
          }}
        >
          Después
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
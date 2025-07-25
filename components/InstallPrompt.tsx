
'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado (modo standalone)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode || isIOSStandalone);

    // No mostrar prompt si ya está instalado
    if (isStandaloneMode || isIOSStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Mostrar el prompt inmediatamente para pruebas en móvil
      setTimeout(() => {
        const dismissed = localStorage.getItem('install-prompt-dismissed');
        if (dismissed !== 'true') {
          setShowInstallPrompt(true);
        }
      }, 3000); // Reducido a 3 segundos para pruebas
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsInstallable(false);
      localStorage.removeItem('install-prompt-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Para dispositivos Android - mostrar prompt manual si no se detecta beforeinstallprompt
    const userAgent = window.navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent);
    
    if (isAndroid && isChrome) {
      // Mostrar prompt manual después de 5 segundos si no se detectó beforeinstallprompt
      setTimeout(() => {
        if (!deferredPrompt && !isStandalone) {
          const dismissed = localStorage.getItem('install-prompt-dismissed');
          if (dismissed !== 'true') {
            setShowInstallPrompt(true);
            setIsInstallable(true);
          }
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } else {
      // Si no hay prompt nativo, mostrar instrucciones manuales
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const userAgent = window.navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    
    let instructions = '';
    
    if (isAndroid && isChrome) {
      instructions = '1. Toca los 3 puntos (⋮) en la esquina superior derecha\n2. Selecciona "Instalar app" o "Agregar a pantalla de inicio"\n3. Confirma la instalación';
    } else if (isAndroid && isFirefox) {
      instructions = '1. Toca los 3 puntos (⋮) en la barra de navegación\n2. Selecciona "Instalar"\n3. Confirma la instalación';
    } else {
      instructions = '1. Usa el menú del navegador\n2. Busca "Instalar app" o "Agregar a pantalla de inicio"\n3. Confirma la instalación';
    }
    
    alert(`Para instalar ProFitness:\n\n${instructions}`);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Recordar que el usuario rechazó la instalación por 24 horas
    localStorage.setItem('install-prompt-dismissed', 'true');
    setTimeout(() => {
      localStorage.removeItem('install-prompt-dismissed');
    }, 24 * 60 * 60 * 1000); // 24 horas
  };

  // No mostrar si ya está instalado
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '16px',
      right: '16px',
      zIndex: 9999,
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid #e5e7eb',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
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
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          <i className="ri-download-line" style={{ color: 'white', fontSize: '20px' }}></i>
        </div>
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            Instalar ProFitness
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Acceso rápido desde tu pantalla de inicio
          </p>
        </div>
      </div>

      <div style={{
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #e0e7ff'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <i className="ri-smartphone-line" style={{ color: '#3b82f6', fontSize: '16px' }}></i>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937'
          }}>
            Funciona sin conexión
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <i className="ri-notification-line" style={{ color: '#3b82f6', fontSize: '16px' }}></i>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937'
          }}>
            Notificaciones personalizadas
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="ri-speed-line" style={{ color: '#3b82f6', fontSize: '16px' }}></i>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937'
          }}>
            Acceso instantáneo
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={handleInstallClick}
          className="!rounded-button"
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <i className="ri-download-line" style={{ fontSize: '16px' }}></i>
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="!rounded-button"
          style={{
            padding: '12px 16px',
            background: '#f3f4f6',
            color: '#6b7280',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
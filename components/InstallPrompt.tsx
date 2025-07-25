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

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Mostrar el prompt después de 30 segundos o cuando el usuario haya interactuado
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Recordar que el usuario rechazó la instalación
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  // No mostrar si ya se rechazó anteriormente
  useEffect(() => {
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed === 'true') {
      setShowInstallPrompt(false);
    }
  }, []);

  if (!showInstallPrompt || !isInstallable) {
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
      border: '1px solid #e5e7eb'
    }}>
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
            cursor: 'pointer'
          }}
        >
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
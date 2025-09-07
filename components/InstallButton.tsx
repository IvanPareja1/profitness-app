'use client';

import { useState, useEffect } from 'react';

// Extender la interfaz Window para TypeScript
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

export default function InstallButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      if (typeof window !== 'undefined') {
        // Guardar el evento para usarlo después
        window.deferredPrompt = e;
      }
      setIsVisible(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (typeof window !== 'undefined' && window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      window.deferredPrompt = null;
    }
  };

  if (!isVisible) return null;

  return (
    <button
      id="install-button"
      onClick={handleInstallClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 15px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 1000,
        fontSize: '14px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >
      📲 Instalar App
    </button>
  );
}
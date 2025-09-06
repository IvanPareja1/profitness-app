'use client';

import { useEffect, useRef } from 'react';

export default function ServiceWorker() {
  const deferredPrompt = useRef(null);

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          
          console.log('SW registered successfully: ', registration.scope);
          
          // Verificar actualizaciones cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

        } catch (registrationError) {
          console.log('SW registration failed: ', registrationError);
        }
      }
    };

    // Manejar el evento de instalación de PWA
    const handleBeforeInstallPrompt = (e) => {
      // Prevenir que el mini-infobar aparezca en mobile
      e.preventDefault();
      // Guardar el evento para que pueda ser activado después
      deferredPrompt.current = e;
      
      // Opcional: Mostrar un botón de instalación personalizado
      showInstallPromotion();
    };

    const showInstallPromotion = () => {
      // Solo mostrar si no está ya instalado
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Mostrar promoción de instalación');
        // Aquí puedes mostrar un botón personalizado en tu UI
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA fue instalada');
      // Limpiar el deferredPrompt
      deferredPrompt.current = null;
      // Ocultar la promoción de instalación
    };

    // Registrar event listeners para PWA
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    registerServiceWorker();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null;
}
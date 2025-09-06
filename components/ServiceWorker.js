'use client';

import { useEffect } from 'react';

export default function ServiceWorker() {
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

          // Escuchar actualizaciones disponibles
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Mostrar notificación de actualización disponible
                  if (typeof window !== 'undefined' && window.showUpdateNotification) {
                    window.showUpdateNotification();
                  }
                }
              });
            }
          });

        } catch (registrationError) {
          console.log('SW registration failed: ', registrationError);
        }
      }
    };

    registerServiceWorker();

    // Verificar si hay datos para restaurar después de una actualización
    const checkDataRestoration = () => {
      const hasCloudSync = localStorage.getItem('google_access_token');
      const dataRestored = localStorage.getItem('dataRestored');
      
      // Si hay sincronización habilitada pero no hay datos restaurados recientemente
      if (hasCloudSync && !dataRestored) {
        // Verificar si hay pocos datos locales (posible pérdida por actualización)
        const userData = localStorage.getItem('userData');
        const nutritionKeys = Object.keys(localStorage).filter(key => key.startsWith('nutrition_'));
        
        if (!userData || nutritionKeys.length === 0) {
          // Posible pérdida de datos, ofrecer restauración
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.showDataRestorePrompt) {
              window.showDataRestorePrompt();
            }
          }, 2000);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('load', checkDataRestoration);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', checkDataRestoration);
      }
    };
  }, []);

  return null;
}
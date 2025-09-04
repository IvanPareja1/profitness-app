
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Logo from '../../components/ui/Logo';

declare global {
  interface Window {
    google: any;
    handleGoogleSignIn: (response: any) => void;
  }
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      router.push('/');
      return;
    }

    // Cargar automáticamente Google Sign-In
    loadGoogleSignIn();
  }, [router]);

  const loadGoogleSignIn = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);
  };

  const initializeGoogleSignIn = () => {
    if (window.google) {
      const CLIENT_ID = "234981966694-v0qeb0nj89mrscnn5nef6o0eddj2fi15.apps.googleusercontent.com";

      try {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            locale: 'es'
          }
        );
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        setError('Error al configurar Google Sign-In. Por favor, contacta al soporte.');
      }
    }
  };

  const handleGoogleSignIn = async (response: any) => {
    setIsLoading(true);
    setError('');

    try {
      // Decodificar el JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));

      // Validar que el token sea válido
      if (!payload || !payload.email || !payload.name) {
        throw new Error('Token inválido recibido de Google');
      }

      const userEmail = payload.email;
      
      // Verificar si el usuario ya existe
      const existingUserKey = `user_${userEmail}`;
      const existingUser = localStorage.getItem(existingUserKey);

      if (existingUser) {
        // Usuario existente - restaurar todos sus datos
        const userData = JSON.parse(existingUser);
        
        // Restaurar datos del usuario
        localStorage.setItem('userData', JSON.stringify(userData.userData));
        localStorage.setItem('userProfile', JSON.stringify(userData.userProfile));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Restaurar foto de perfil si existe
        if (userData.userProfilePhoto) {
          localStorage.setItem('userProfilePhoto', userData.userProfilePhoto);
        }

        // Restaurar todos los datos nutricionales
        if (userData.nutritionData) {
          Object.keys(userData.nutritionData).forEach(key => {
            localStorage.setItem(key, userData.nutritionData[key]);
          });
        }

        // Restaurar configuraciones adicionales
        if (userData.restDaySettings) {
          localStorage.setItem('restDaySettings', userData.restDaySettings);
        }
        if (userData.hydrationReminder) {
          localStorage.setItem('hydrationReminder', userData.hydrationReminder);
        }
        if (userData.healthData) {
          localStorage.setItem('healthData', userData.healthData);
        }

        // Mostrar mensaje de bienvenida de regreso
        showWelcomeMessage(`¡Bienvenido de vuelta, ${userData.userData.name}!`, 'Datos restaurados correctamente');
        
      } else {
        // Usuario nuevo - crear datos limpios
        const userData = {
          name: payload.name,
          email: payload.email,
          picture: payload.picture || '',
          sub: payload.sub,
          email_verified: payload.email_verified || false
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');

        // Crear perfil inicial limpio
        const newProfile = {
          name: userData.name,
          email: userData.email,
          age: '',
          weight: '',
          height: '',
          activityLevel: 'moderate',
          workActivity: 'sedentary',
          goal: 'maintain',
          language: 'es',
          targetCalories: 2000,
          targetProtein: 120,
          targetCarbs: 250,
          targetFats: 67,
          targetWater: 2500,
          targetFiber: 25,
          syncEnabled: false,
          lastSyncTime: null,
          avgDailySteps: 0,
          avgActiveMinutes: 0,
          avgCaloriesBurned: 0
        };
        localStorage.setItem('userProfile', JSON.stringify(newProfile));

        // Guardar foto de perfil
        if (userData.picture) {
          localStorage.setItem('userProfilePhoto', userData.picture);
        }

        // Guardar usuario nuevo en el almacenamiento persistente
        const newUserData = {
          userData: userData,
          userProfile: newProfile,
          userProfilePhoto: userData.picture || null,
          nutritionData: {},
          restDaySettings: null,
          hydrationReminder: null,
          healthData: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        localStorage.setItem(existingUserKey, JSON.stringify(newUserData));

        showWelcomeMessage(`¡Bienvenido, ${userData.name}!`, 'Tu cuenta ha sido creada exitosamente');
      }

      // Actualizar última conexión
      const userKey = `user_${userEmail}`;
      const userBackup = JSON.parse(localStorage.getItem(userKey) || '{}');
      userBackup.lastLogin = new Date().toISOString();
      localStorage.setItem(userKey, JSON.stringify(userBackup));

      // Redirigir después de mostrar el mensaje
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setError('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const showWelcomeMessage = (title: string, subtitle: string) => {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px 24px;
      z-index: 3000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 320px;
      width: 90%;
    `;

    successMessage.innerHTML = `
      <div style="width: 24px; height: 24px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <i class="ri-check-line" style="color: white; font-size: 14px;"></i>
      </div>
      <div>
        <p style="font-size: 14px; font-weight: 600; color: #16a34a; margin: 0;">${title}</p>
        <p style="font-size: 12px; color: #15803d; margin: 0;">${subtitle}</p>
      </div>
    `;

    document.body.appendChild(successMessage);

    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        document.body.removeChild(successMessage);
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          width: '90%',
          maxWidth: '320px'
        }}>
          <LoadingSpinner />
          <p style={{
            marginTop: '16px',
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Iniciando sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Logo y título */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Logo size="lg" />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            fontFamily: 'Pacifico, serif',
            marginBottom: '12px'
          }}>
            ProFitness
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '280px',
            margin: '0 auto'
          }}>
            Nutre tu progreso, domina tus resultados
          </p>
        </div>

        {/* Botón de Google Sign-In */}
        <div style={{ marginBottom: '24px' }}>
          <div
            id="google-signin-button"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}
          ></div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="ri-error-warning-line" style={{ color: '#dc2626', fontSize: '16px' }}></i>
            <p style={{
              color: '#dc2626',
              fontSize: '14px',
              margin: 0
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Características */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f0f9ff',
          borderRadius: '12px',
          border: '1px solid #e0e7ff'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 12px 0'
          }}>
            ¿Qué incluye ProFitness?
          </h4>
          <div style={{
            display: 'grid',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="ri-check-line" style={{ color: '#16a34a', fontSize: '14px' }}></i>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Seguimiento nutricional completo
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="ri-check-line" style={{ color: '#16a34a', fontSize: '14px' }}></i>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Escáner de código de barras
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="ri-check-line" style={{ color: '#16a34a', fontSize: '14px' }}></i>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Análisis de progreso detallado
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="ri-check-line" style={{ color: '#16a34a', fontSize: '14px' }}></i>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Sincronización en la nube
              </span>
            </div>
          </div>
        </div>

        {/* Términos y condiciones */}
        <p style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Al continuar, aceptas nuestros <strong>Términos de Servicio</strong> y <strong>Política de Privacidad</strong>
        </p>
      </div>
    </div>
  );
}


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

    // Cargar el script de Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [router]);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      // Tu Google Client ID real configurado
      const CLIENT_ID = "234981966694-v0qeb0nj89mrscnn5nef6o0eddj2fi15.apps.googleusercontent.com";

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

      // Limpiar todos los datos existentes antes de crear el nuevo usuario
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nutrition_') || key === 'userProfile' || key === 'userData' || key === 'userProfilePhoto') {
          localStorage.removeItem(key);
        }
      });

      // Guardar datos del usuario
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

      // Mostrar mensaje de éxito
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
      `;

      successMessage.innerHTML = `
        <div style="width: 24px; height: 24px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <i class="ri-check-line" style="color: white; font-size: 14px;"></i>
        </div>
        <div>
          <p style="font-size: 14px; font-weight: 600; color: #16a34a; margin: 0;">¡Bienvenido, ${userData.name}!</p>
          <p style="font-size: 12px; color: #15803d; margin: 0;">Iniciando sesión...</p>
        </div>
      `;

      document.body.appendChild(successMessage);

      // Redirigir después de mostrar el mensaje
      setTimeout(() => {
        document.body.removeChild(successMessage);
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setError('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setError('');

    // Datos de demostración
    const demoUserData = {
      name: 'María González',
      email: 'maria.gonzalez@demo.com',
      picture: '',
      sub: 'demo_user_' + Date.now(),
      email_verified: true
    };

    localStorage.setItem('userData', JSON.stringify(demoUserData));
    localStorage.setItem('isAuthenticated', 'true');

    // Crear perfil de demostración
    const demoProfile = {
      name: demoUserData.name,
      email: demoUserData.email,
      age: '28',
      weight: '65',
      height: '165',
      activityLevel: 'moderate',
      workActivity: 'sedentary',
      goal: 'maintain',
      language: 'es',
      targetCalories: 1800,
      targetProtein: 110,
      targetCarbs: 220,
      targetFats: 60,
      targetWater: 2500,
      targetFiber: 25,
      syncEnabled: false,
      lastSyncTime: null,
      avgDailySteps: 0,
      avgActiveMinutes: 0,
      avgCaloriesBurned: 0
    };

    localStorage.setItem('userProfile', JSON.stringify(demoProfile));

    // Limpiar datos nutricionales existentes antes de crear datos de demo
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('nutrition_')) {
        localStorage.removeItem(key);
      }
    });

    // Crear datos de demostración para nutrición
    const today = new Date().toISOString().split('T')[0];
    const demoNutritionData = {
      calories: 1200,
      protein: 75,
      carbs: 150,
      fats: 45,
      fiber: 18,
      water: 1800,
      targetCalories: 1800,
      targetProtein: 110,
      targetCarbs: 220,
      targetFats: 60,
      targetWater: 2500,
      targetFiber: 25,
      meals: [
        {
          id: 'demo_1',
          name: 'Avena con frutas',
          mealType: 'desayuno',
          quantity: '100',
          calories: 350,
          protein: 12,
          carbs: 55,
          fats: 8,
          fiber: 6,
          timestamp: new Date().toISOString()
        },
        {
          id: 'demo_2',
          name: 'Ensalada de pollo',
          mealType: 'almuerzo',
          quantity: '200',
          calories: 480,
          protein: 35,
          carbs: 25,
          fats: 28,
          fiber: 8,
          timestamp: new Date().toISOString()
        },
        {
          id: 'demo_3',
          name: 'Yogur griego',
          mealType: 'snack',
          quantity: '150',
          calories: 120,
          protein: 15,
          carbs: 8,
          fats: 4,
          fiber: 2,
          timestamp: new Date().toISOString()
        }
      ]
    };

    localStorage.setItem(`nutrition_${today}`, JSON.stringify(demoNutritionData));

    setTimeout(() => {
      router.push('/');
    }, 1500);
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

        {/* Información de autenticación */}
        <div style={{
          background: '#f0f9ff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #e0e7ff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <i className="ri-shield-check-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Autenticación Segura
            </h3>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Tus datos están protegidos con Google OAuth 2.0. No guardamos tu contraseña.
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

        {/* Separador */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: '#e5e7eb'
          }}></div>
          <span style={{
            padding: '0 16px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            o
          </span>
          <div style={{
            flex: 1,
            height: '1px',
            background: '#e5e7eb'
          }}></div>
        </div>

        {/* Botón de demostración - Solo mostrar si DEMO_MODE está activado */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
            className="!rounded-button"
          >
            <i className="ri-play-circle-line" style={{ fontSize: '20px' }}></i>
            Continuar con Demo
          </button>
        )}

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
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
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
                Sincronización con dispositivos
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

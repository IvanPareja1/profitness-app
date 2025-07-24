
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

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
      // IMPORTANTE: Reemplaza con tu Google Client ID real
      const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
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

      // Guardar datos del usuario
      const userData = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        sub: payload.sub
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');

      // Actualizar el perfil con los datos de Google
      const existingProfile = localStorage.getItem('userProfile');
      if (existingProfile) {
        const profile = JSON.parse(existingProfile);
        profile.name = userData.name;
        profile.email = userData.email;
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }

      // Guardar foto de perfil
      if (userData.picture) {
        localStorage.setItem('userProfilePhoto', userData.picture);
      }

      // Simular un pequeño delay para mejor UX
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);

    // Datos de demostración
    const demoUserData = {
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      picture: '',
      sub: 'demo_user'
    };

    localStorage.setItem('userData', JSON.stringify(demoUserData));
    localStorage.setItem('isAuthenticated', 'true');

    setTimeout(() => {
      router.push('/');
    }, 1000);
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
          <p style={{ marginTop: '16px', color: '#6b7280' }}>
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
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <i className="ri-nutrition-line" style={{ color: 'white', fontSize: '36px' }}></i>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            fontFamily: 'Pacifico, serif',
            marginBottom: '8px'
          }}>
            ProFitness
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: '1.5'
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

        {/* Botón de demostración */}
        <button
          onClick={handleDemoLogin}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          className="!rounded-button"
        >
          <i className="ri-play-circle-line" style={{ fontSize: '20px' }}></i>
          Continuar con Demo
        </button>

        {/* Mensaje de error */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <p style={{
              color: '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Términos y condiciones */}
        <p style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
}

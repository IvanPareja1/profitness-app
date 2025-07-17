'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authStatus = localStorage.getItem('isAuthenticated');
      const storedUserData = localStorage.getItem('userData');

      if (authStatus === 'true' && storedUserData) {
        setIsAuthenticated(true);
        setUserData(JSON.parse(storedUserData));
      } else {
        setIsAuthenticated(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userProfilePhoto');
    
    setIsAuthenticated(false);
    setUserData(null);
    
    // Cerrar sesión de Google si está disponible
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    router.push('/login');
  };

  const requireAuth = () => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  };

  return {
    isAuthenticated,
    userData,
    loading,
    signOut,
    requireAuth,
    checkAuthStatus
  };
}
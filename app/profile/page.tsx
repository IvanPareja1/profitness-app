
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../components/BottomNavigation';
import { fitnessSync, FitnessData } from '../../lib/fitness-sync';
import { NutritionCalculator } from '../../lib/nutrition-calculator';

interface UserProfile {
  name: string;
  email: string;
  age: string;
  weight: string;
  height: string;
  gender: 'male' | 'female';
  activityLevel: string;
  workActivity: string;
  goal: string;
  language: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWater: number;
  targetFiber: number;
  syncEnabled: boolean;
  lastSyncTime: string | null;
  avgDailySteps: number;
  avgActiveMinutes: number;
  avgCaloriesBurned: number;
  autoCalculate: boolean;
}

interface BMIResult {
  value: number;
  category: string;
  color: string;
  recommendation: string;
}

export default function Profile() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
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
    avgCaloriesBurned: 0,
    autoCalculate: true
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showBMIModal, setShowBMIModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
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
    avgCaloriesBurned: 0,
    autoCalculate: true
  });
  const [restDaySettings, setRestDaySettings] = useState({
    enabled: false,
    todayIsRestDay: false,
    autoAdjustMacros: false,
    calorieReduction: 15,
    proteinReduction: 10,
    carbReduction: 20,
    fatReduction: 10
  });
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [calculationDetails, setCalculationDetails] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // Verificar autenticación
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      router.push('/login');
      return;
    }

    loadUserData();
    loadUserProfile();
    loadRestDaySettings();
    loadUserPhoto();
    loadFitnessData();

    // Escuchar actualizaciones de fitness
    const handleFitnessUpdate = (event: CustomEvent) => {
      setFitnessData(event.detail);
    };

    window.addEventListener('fitnessDataUpdated', handleFitnessUpdate as EventListener);

    return () => {
      window.removeEventListener('fitnessDataUpdated', handleFitnessUpdate as EventListener);
    };
  }, [router]);

  const loadUserData = () => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      try {
        const data = JSON.parse(savedUserData);
        setUserData(data);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  const loadUserProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setTempProfile(profile);
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    } else if (userData) {
      // Crear perfil inicial si no existe
      const initialProfile = {
        name: userData.name || '',
        email: userData.email || '',
        age: '',
        weight: '',
        height: '',
        gender: 'male',
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
        avgCaloriesBurned: 0,
        autoCalculate: true
      };
      setUserProfile(initialProfile);
      setTempProfile(initialProfile);
      localStorage.setItem('userProfile', JSON.stringify(initialProfile));
    }
  };

  const loadRestDaySettings = () => {
    const savedSettings = localStorage.getItem('restDaySettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setRestDaySettings(settings);
      } catch (error) {
        console.error('Error parsing rest day settings:', error);
      }
    }
  };

  const loadUserPhoto = () => {
    const savedPhoto = localStorage.getItem('userProfilePhoto');
    if (savedPhoto) {
      setUserProfilePhoto(savedPhoto);
    } else if (userData?.picture) {
      setUserProfilePhoto(userData.picture);
    }
  };

  const loadFitnessData = () => {
    const today = new Date().toISOString().split('T')[0];
    const data = fitnessSync.getFitnessData(today);
    setFitnessData(data);
  };

  const handleSaveProfile = () => {
    let updatedProfile = {
      ...tempProfile,
      name: tempProfile.name || userData?.name || '',
      email: tempProfile.email || userData?.email || ''
    };

    // Calcular automáticamente si está habilitado
    if (updatedProfile.autoCalculate && updatedProfile.age && updatedProfile.weight && updatedProfile.height) {
      const targets = calculateNutritionTargets();
      if (targets) {
        updatedProfile = { ...updatedProfile, ...targets };
      }
    }

    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setShowEditModal(false);

    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new Event('profileUpdated'));

    // Mostrar mensaje de éxito
    if (updatedProfile.autoCalculate) {
      showSuccessMessage('Perfil actualizado y objetivos recalculados automáticamente');
    } else {
      showSuccessMessage('Perfil actualizado correctamente');
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    const updatedProfile = { ...userProfile, language: newLanguage };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setShowLanguageModal(false);

    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new Event('profileUpdated'));

    showSuccessMessage('Idioma actualizado correctamente');
  };

  const handleRestDayToggle = (enabled: boolean) => {
    const updatedSettings = { ...restDaySettings, enabled };
    setRestDaySettings(updatedSettings);
    localStorage.setItem('restDaySettings', JSON.stringify(updatedSettings));

    if (enabled) {
      showSuccessMessage('Día de descanso activado');
    } else {
      showSuccessMessage('Día de descanso desactivado');
    }
  };

  const handleLogout = () => {
    try {
      // Crear backup completo antes de cerrar sesión
      const backupData = {
        userData: JSON.parse(localStorage.getItem('userData') || '{}'),
        userProfile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
        userProfilePhoto: localStorage.getItem('userProfilePhoto'),
        nutritionData: {} as { [key: string]: string | null },
        restDaySettings: localStorage.getItem('restDaySettings'),
        hydrationReminder: localStorage.getItem('hydrationReminder'),
        healthData: localStorage.getItem('healthData'),
        lastLogin: new Date().toISOString()
      };

      // Recopilar datos nutricionales de los últimos 30 días
      const nutritionBackup: { [key: string]: string | null } = {};
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const nutritionKey = `nutrition_${dateKey}`;
        const nutritionData = localStorage.getItem(nutritionKey);
        if (nutritionData) {
          nutritionBackup[nutritionKey] = nutritionData;
        }
      }
      backupData.nutritionData = nutritionBackup;

      // Guardar backup del usuario
      if (userData?.email) {
        const userBackupKey = `user_${userData.email}`;
        localStorage.setItem(userBackupKey, JSON.stringify(backupData));
      }

      // Limpiar datos de sesión
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userProfilePhoto');

      // Limpiar datos nutricionales
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nutrition_') || key.startsWith('weight_')) {
          localStorage.removeItem(key);
        }
      });

      // Limpiar configuraciones
      localStorage.removeItem('restDaySettings');
      localStorage.removeItem('hydrationReminder');
      localStorage.removeItem('healthData');

      // Redirigir al login
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar logout incluso si hay error
      localStorage.clear();
      router.push('/login');
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 5MB');
        return;
      }

      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUserProfilePhoto(result);
        localStorage.setItem('userProfilePhoto', result);
        setIsUploading(false);
        showSuccessMessage('Foto de perfil actualizada');
      };
      reader.onerror = () => {
        setIsUploading(false);
        alert('Error al cargar la imagen');
      };
      reader.readAsDataURL(file);
    }
  };

  const showSuccessMessage = (message: string) => {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      color: #16a34a;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1001;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    successDiv.innerHTML = `
      <i class="ri-check-circle-line"></i>
      ${message}
    `;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  };

  const calculateNutritionTargets = () => {
    if (!userProfile.age || !userProfile.weight || !userProfile.height) {
      return;
    }

    const profile = {
      age: userProfile.age,
      weight: userProfile.weight,
      height: userProfile.height,
      gender: userProfile.gender,
      activityLevel: userProfile.activityLevel as any,
      workActivity: userProfile.workActivity as any,
      goal: userProfile.goal as any
    };

    const targets = NutritionCalculator.calculateNutritionTargets(profile);
    const details = NutritionCalculator.getCalculationDetails(profile);

    setCalculationDetails(details);

    return targets;
  };

  const calculateBMI = (weight: string, height: string): BMIResult | null => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
      return null;
    }

    const heightInMeters = heightNum / 100;
    const bmi = weightNum / (heightInMeters * heightInMeters);

    let category = '';
    let color = '';
    let recommendation = '';

    if (bmi < 18.5) {
      category = 'Peso insuficiente';
      color = '#3b82f6';
      recommendation = 'Considera aumentar tu ingesta calórica con alimentos nutritivos y consulta a un profesional de la salud.';
    } else if (bmi < 25) {
      category = 'Peso normal';
      color = '#10b981';
      recommendation = 'Mantén tu estilo de vida saludable con una dieta equilibrada y ejercicio regular.';
    } else if (bmi < 30) {
      category = 'Sobrepeso';
      color = '#f59e0b';
      recommendation = 'Considera reducir tu ingesta calórica y aumentar la actividad física.';
    } else if (bmi < 35) {
      category = 'Obesidad';
      color = '#ef4444';
      recommendation = 'Es recomendable consultar con un profesional de la salud para un plan personalizado.';
    } else {
      category = 'Obesidad severa';
      color = '#dc2626';
      recommendation = 'Es importante buscar ayuda médica especializada para un tratamiento adecuado.';
    }

    return {
      value: Math.round(bmi * 10) / 10,
      category,
      color,
      recommendation
    };
  };

  const getBMIData = (): BMIResult | null => {
    return calculateBMI(userProfile.weight, userProfile.height);
  };

  const translations = {
    es: {
      profile: 'Perfil',
      personalInfo: 'Información Personal',
      editProfile: 'Editar Perfil',
      name: 'Nombre',
      email: 'Email',
      age: 'Edad',
      weight: 'Peso',
      height: 'Altura',
      activityLevel: 'Nivel de Actividad',
      workActivity: 'Actividad Laboral',
      goal: 'Objetivo',
      language: 'Idioma',
      settings: 'Configuraciones',
      restDay: 'Día de Descanso',
      sync: 'Sincronización',
      logout: 'Cerrar Sesión',
      save: 'Guardar',
      cancel: 'Cancelar',
      bmi: 'IMC',
      calculateBMI: 'Calcular IMC',
      bmiCalculator: 'Calculadora de IMC',
      bmiResult: 'Resultado IMC',
      recommendations: 'Recomendaciones',
      bmiRanges: 'Rangos de IMC',
      underweight: 'Peso insuficiente',
      normal: 'Normal',
      overweight: 'Sobrepeso',
      obesity: 'Obesidad',
      severeObesity: 'Obesidad severa',
      years: 'años',
      kg: 'kg',
      cm: 'cm',
      spanish: 'Español',
      english: 'English'
    },
    en: {
      profile: 'Profile',
      personalInfo: 'Personal Information',
      editProfile: 'Edit Profile',
      name: 'Name',
      email: 'Email',
      age: 'Age',
      weight: 'Weight',
      height: 'Height',
      activityLevel: 'Activity Level',
      workActivity: 'Work Activity',
      goal: 'Goal',
      language: 'Language',
      settings: 'Settings',
      restDay: 'Rest Day',
      sync: 'Sync',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      bmi: 'BMI',
      calculateBMI: 'Calculate BMI',
      bmiCalculator: 'BMI Calculator',
      bmiResult: 'BMI Result',
      recommendations: 'Recommendations',
      bmiRanges: 'BMI Ranges',
      underweight: 'Underweight',
      normal: 'Normal',
      overweight: 'Overweight',
      obesity: 'Obesity',
      severeObesity: 'Severe Obesity',
      years: 'years',
      kg: 'kg',
      cm: 'cm',
      spanish: 'Español',
      english: 'English'
    }
  };

  const t = translations[userProfile.language as keyof typeof translations] || translations.es;

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const bmiData = getBMIData();

  const handleSyncRequest = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // Verificar permisos
      if (!fitnessSync.hasPermissions()) {
        const permissionGranted = await fitnessSync.requestFitnessPermissions();
        if (!permissionGranted) {
          setSyncStatus('error');
          showErrorMessage('No se pudieron obtener los permisos necesarios');
          return;
        }
      }

      // Sincronizar datos
      const result = await fitnessSync.syncFitnessData();

      if (result.success && result.data) {
        setFitnessData(result.data);
        setSyncStatus('success');
        showSuccessMessage('Datos sincronizados correctamente');

        // Actualizar perfil con nuevos datos
        const updatedProfile = {
          ...userProfile,
          syncEnabled: true,
          lastSyncTime: new Date().toISOString(),
          avgDailySteps: result.data.steps,
          avgActiveMinutes: result.data.activeMinutes,
          avgCaloriesBurned: result.data.calories
        };
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      } else {
        setSyncStatus('error');
        showErrorMessage(result.error || 'Error al sincronizar datos');
      }
    } catch (error) {
      setSyncStatus('error');
      showErrorMessage('Error de conexión con el smartwatch');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleDemoSync = () => {
    if (process.env.NODE_ENV === 'development') {
      setIsSyncing(true);
      setSyncStatus('syncing');

      setTimeout(() => {
        try {
          const demoData = fitnessSync.simulateFitnessData();
          setFitnessData(demoData);
          setSyncStatus('success');
          showSuccessMessage('Datos demo sincronizados');

          // Actualizar perfil
          const updatedProfile = {
            ...userProfile,
            syncEnabled: true,
            lastSyncTime: new Date().toISOString(),
            avgDailySteps: demoData.steps,
            avgActiveMinutes: demoData.activeMinutes,
            avgCaloriesBurned: demoData.calories
          };
          setUserProfile(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        } catch (error) {
          setSyncStatus('error');
          showErrorMessage('Error en modo demo');
        } finally {
          setIsSyncing(false);
          setTimeout(() => setSyncStatus('idle'), 3000);
        }
      }, 2000);
    }
  };

  const handleDisconnectSync = () => {
    fitnessSync.disconnect();
    setFitnessData(null);

    const updatedProfile = {
      ...userProfile,
      syncEnabled: false,
      lastSyncTime: null,
      avgDailySteps: 0,
      avgActiveMinutes: 0,
      avgCaloriesBurned: 0
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    showSuccessMessage('Sincronización desconectada');
  };

  const showErrorMessage = (message: string) => {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1001;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    errorDiv.innerHTML = `
      <i class="ri-error-warning-line"></i>
      ${message}
    `;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 4000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        padding: '20px 16px',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Link href="/" className="!rounded-button" style={{
            width: '40px',
            height: '40px',
            background: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}>
            <i className="ri-arrow-left-line" style={{ color: '#374151', fontSize: '18px' }}></i>
          </Link>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            {t.profile}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px 16px' }}>
        {/* Profile Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: userProfilePhoto ? `url(${userProfilePhoto})` : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {!userProfilePhoto && (
                <span style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '24px'
                }}>
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <label style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '28px',
              height: '28px',
              background: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <i className="ri-camera-line" style={{ color: 'white', fontSize: '14px' }}></i>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
            {isUploading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                background: 'rgba(0,0,0,0.7)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff40',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            )}
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            {userProfile.name || 'Usuario'}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 16px 0'
          }}>
            {userProfile.email}
          </p>
          <button
            onClick={() => setShowEditModal(true)}
            className="!rounded-button"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <i className="ri-edit-line"></i>
            {t.editProfile}
          </button>
        </div>

        {/* Personal Information */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              {t.personalInfo}
            </h3>
            <button
              onClick={() => setShowCalculatorModal(true)}
              className="!rounded-button"
              style={{
                background: '#f0f9ff',
                border: '1px solid #e0e7ff',
                color: '#3b82f6',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="ri-calculator-line"></i>
              Calculadora
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.age}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.age ? `${userProfile.age} ${t.years}` : '--'}
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.weight}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.weight ? `${userProfile.weight} ${t.kg}` : '--'}
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.height}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.height ? `${userProfile.height} ${t.cm}` : '--'}
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                Género
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.gender === 'male' ? 'Masculino' : 'Femenino'}
              </p>
            </div>
          </div>

          {/* Indicador de cálculo automático */}
          {userProfile.autoCalculate && (
            <div style={{
              padding: '12px',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #e0e7ff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="ri-refresh-line" style={{ color: '#3b82f6', fontSize: '16px' }}></i>
              <div>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0'
                }}>
                  Cálculo Automático Activado
                </p>
                <p style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Los objetivos se recalculan automáticamente basándose en tu actividad física y laboral
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Nutrition Targets */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Objetivos Nutricionales
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              background: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fde68a',
              textAlign: 'center'
            }}>
              <i className="ri-fire-line" style={{ color: '#f59e0b', fontSize: '20px' }}></i>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '4px 0 2px 0'
              }}>
                {userProfile.targetCalories}
              </p>
              <p style={{
                fontSize: '10px',
                color: '#6b7280',
                margin: 0
              }}>
                Calorías
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: '#dcfce7',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              textAlign: 'center'
            }}>
              <i className="ri-bread-line" style={{ color: '#16a34a', fontSize: '20px' }}></i>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '4px 0 2px 0'
              }}>
                {userProfile.targetProtein}g
              </p>
              <p style={{
                fontSize: '10px',
                color: '#6b7280',
                margin: 0
              }}>
                Proteínas
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fde68a',
              textAlign: 'center'
            }}>
              <i className="ri-restaurant-line" style={{ color: '#f59e0b', fontSize: '20px' }}></i>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '4px 0 2px 0'
              }}>
                {userProfile.targetCarbs}g
              </p>
              <p style={{
                fontSize: '10px',
                color: '#6b7280',
                margin: 0
              }}>
                Carbohidratos
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: '#e0e7ff',
              borderRadius: '8px',
              border: '1px solid #c7d2fe',
              textAlign: 'center'
            }}>
              <i className="ri-drop-line" style={{ color: '#6366f1', fontSize: '20px' }}></i>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '4px 0 2px 0'
              }}>
                {userProfile.targetFats}g
              </p>
              <p style={{
                fontSize: '10px',
                color: '#6b7280',
                margin: 0
              }}>
                Grasas
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            <div style={{
              padding: '12px',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #e0e7ff',
              textAlign: 'center'
            }}>
              <i className="ri-drop-line" style={{ color: '#06b6d4', fontSize: '20px' }}></i>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '4px 0 2px 0'
              }}>
                {userProfile.targetWater}ml
              </p>
              <p style={{
                fontSize: '10px',
                color: '#6b7280',
                margin: 0
              }}>
                Hidratación
              </p>
            </div>
            <div style={{
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #dcfce7',
              textAlign: 'center'
            }}>
              <i className="ri-plant-line" style={{ color: '#16a34a', fontSize: '20px' }}></i>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '4px 0 2px 0'
              }}>
                {userProfile.targetFiber}g
              </p>
              <p style={{
                fontSize: '10px',
                color: '#6b7280',
                margin: 0
              }}>
                Fibra
              </p>
            </div>
          </div>
        </div>

        {/* Rest Day */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            {t.restDay}
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <input
              type="checkbox"
              id="restDayEnabled"
              checked={restDaySettings.enabled}
              onChange={(e) => handleRestDayToggle(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#3b82f6'
              }}
            />
            <label htmlFor="restDayEnabled" style={{
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              Activar día de descanso
            </label>
          </div>

          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0 0 16px 0',
            lineHeight: '1.5'
          }}>
            Cuando esté activado, los días de descanso aparecerán con indicadores especiales en la app y se ajustarán automáticamente los macronutrientes.
          </p>

          <button
            onClick={() => setShowRestDayModal(true)}
            className="!rounded-button"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Configurar
          </button>
        </div>

        {/* Fitness Sync Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Sincronización con Smartwatch
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {userProfile.syncEnabled && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%'
                }}></div>
              )}
              <span style={{
                fontSize: '12px',
                color: userProfile.syncEnabled ? '#10b981' : '#6b7280',
                fontWeight: '500'
              }}>
                {userProfile.syncEnabled ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>

          {/* Datos de Fitness */}
          {fitnessData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #e0e7ff',
                textAlign: 'center'
              }}>
                <i className="ri-footprint-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '4px 0 2px 0'
                }}>
                  {fitnessData.steps.toLocaleString()}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Pasos
                </p>
              </div>
              <div style={{
                padding: '12px',
                background: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #dcfce7',
                textAlign: 'center'
              }}>
                <i className="ri-fire-line" style={{ color: '#16a34a', fontSize: '20px' }}></i>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '4px 0 2px 0'
                }}>
                  {fitnessData.calories}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Calorías
                </p>
              </div>
              <div style={{
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #fde68a',
                textAlign: 'center'
              }}>
                <i className="ri-heart-pulse-line" style={{ color: '#f59e0b', fontSize: '20px' }}></i>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '4px 0 2px 0'
                }}>
                  {fitnessData.heartRate}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  BPM
                </p>
              </div>
              <div style={{
                padding: '12px',
                background: '#fdf2f8',
                borderRadius: '8px',
                border: '1px solid #fce7f3',
                textAlign: 'center'
              }}>
                <i className="ri-timer-line" style={{ color: '#ec4899', fontSize: '20px' }}></i>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '4px 0 2px 0'
                }}>
                  {fitnessData.activeMinutes}
                </p>
                <p style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Min activos
                </p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          {fitnessData && (
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  Distancia recorrida
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {fitnessData.distance} km
                </span>
              </div>
              {userProfile.lastSyncTime && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    Última sincronización
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {new Date(userProfile.lastSyncTime).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            {!userProfile.syncEnabled ? (
              <>
                <button
                  onClick={handleSyncRequest}
                  disabled={isSyncing}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: isSyncing ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isSyncing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSyncing ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff40',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  ) : (
                    <i className="ri-smartphone-line"></i>
                  )}
                  {isSyncing ? 'Conectando...' : 'Conectar Smartwatch'}
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={handleDemoSync}
                    disabled={isSyncing}
                    className="!rounded-button"
                    style={{
                      padding: '12px 16px',
                      background: isSyncing ? '#e5e7eb' : '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: isSyncing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <i className="ri-play-line"></i>
                    Demo
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSyncRequest}
                  disabled={isSyncing}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: isSyncing ? '#e5e7eb' : '#f0f9ff',
                    border: '1px solid #e0e7ff',
                    borderRadius: '12px',
                    color: isSyncing ? '#6b7280' : '#3b82f6',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isSyncing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSyncing ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #e5e7eb',
                      borderTop: '2px solid #6b7280',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  ) : (
                    <i className="ri-refresh-line"></i>
                  )}
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
                <button
                  onClick={handleDisconnectSync}
                  disabled={isSyncing}
                  className="!rounded-button"
                  style={{
                    padding: '12px 16px',
                    background: isSyncing ? '#e5e7eb' : '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    color: isSyncing ? '#6b7280' : '#dc2626',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isSyncing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="ri-disconnect-line"></i>
                  Desconectar
                </button>
              </>
            )}
          </div>

          {/* Indicador de estado */}
          {syncStatus !== 'idle' && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              ...(syncStatus === 'success'
                ? { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }
                : syncStatus === 'error'
                  ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
                  : { background: '#f0f9ff', color: '#3b82f6', border: '1px solid #e0e7ff' })
            }}>
              {syncStatus === 'syncing' && <i className="ri-loader-4-line animate-spin"></i>}
              {syncStatus === 'success' && <i className="ri-check-line"></i>}
              {syncStatus === 'error' && <i className="ri-error-warning-line"></i>}
              {syncStatus === 'syncing' && 'Sincronizando datos...'}
              {syncStatus === 'success' && 'Sincronización exitosa'}
              {syncStatus === 'error' && 'Error en la sincronización'}
            </div>
          )}
        </div>

        {/* Settings */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            {t.settings}
          </h3>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            <button
              onClick={() => setShowLanguageModal(true)}
              className="!rounded-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="ri-global-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {t.language}
                </span>
              </div>
              <i className="ri-arrow-right-s-line" style={{ color: '#6b7280', fontSize: '20px' }}></i>
            </button>

            <button
              onClick={() => setShowRestDayModal(true)}
              className="!rounded-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="ri-pause-circle-line" style={{ color: '#f59e0b', fontSize: '20px' }}></i>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {t.restDay}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {restDaySettings.enabled && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%'
                  }}></div>
                )}
                <i className="ri-arrow-right-s-line" style={{ color: '#6b7280', fontSize: '20px' }}></i>
              </div>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <button
            onClick={handleLogout}
            className="!rounded-button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <i className="ri-logout-box-line" style={{ fontSize: '20px' }}></i>
            {t.logout}
          </button>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {t.editProfile}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="!rounded-button"
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '16px' }}></i>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  {t.name}
                </label>
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    {t.age}
                  </label>
                  <input
                    type="number"
                    value={tempProfile.age}
                    onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    {t.weight} (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempProfile.weight}
                    onChange={(e) => setTempProfile({ ...tempProfile, weight: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  {t.height} (cm)
                </label>
                <input
                  type="number"
                  value={tempProfile.height}
                  onChange={(e) => setTempProfile({ ...tempProfile, height: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Género
                </label>
                <select
                  value={tempProfile.gender}
                  onChange={(e) => setTempProfile({ ...tempProfile, gender: e.target.value as 'male' | 'female' })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  {t.activityLevel}
                </label>
                <select
                  value={tempProfile.activityLevel}
                  onChange={(e) => setTempProfile({ ...tempProfile, activityLevel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="sedentary">Sedentario (Sin ejercicio)</option>
                  <option value="light">Ligero (Ejercicio 1-3 días/semana)</option>
                  <option value="moderate">Moderado (Ejercicio 3-5 días/semana)</option>
                  <option value="active">Activo (Ejercicio 6-7 días/semana)</option>
                  <option value="very-active">Muy Activo (Ejercicio intenso diario)</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Actividad Laboral
                </label>
                <select
                  value={tempProfile.workActivity}
                  onChange={(e) => setTempProfile({ ...tempProfile, workActivity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="sedentary">Sedentario (Oficina, sentado)</option>
                  <option value="light">Ligero (Maestro, caminatas ocasionales)</option>
                  <option value="moderate">Moderado (Enfermero, mucha caminata)</option>
                  <option value="active">Activo (Mecánico, trabajo físico moderado)</option>
                  <option value="very-active">Muy Activo (Construcción, trabajo físico intenso)</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  {t.goal}
                </label>
                <select
                  value={tempProfile.goal}
                  onChange={(e) => setTempProfile({ ...tempProfile, goal: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="lose">Perder peso (-20% calorías)</option>
                  <option value="maintain">Mantener peso</option>
                  <option value="gain">Ganar peso (+20% calorías)</option>
                </select>
              </div>

              <div style={{
                padding: '16px',
                background: '#f0f9ff',
                borderRadius: '12px',
                border: '1px solid #e0e7ff'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <input
                    type="checkbox"
                    id="autoCalculate"
                    checked={tempProfile.autoCalculate}
                    onChange={(e) => setTempProfile({ ...tempProfile, autoCalculate: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <label htmlFor="autoCalculate" style={{
                    fontSize: '14px',
                    color: '#1f2937',
                    fontWeight: '500'
                  }}>
                    Cálculo Automático de Objetivos
                  </label>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Calcula automáticamente calorías y macronutrientes basándose en tu actividad física, trabajo y objetivos
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '320px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {t.language}
              </h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="!rounded-button"
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '16px' }}></i>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => handleLanguageChange('es')}
                className="!rounded-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: userProfile.language === 'es' ? '#f0f9ff' : '#f8fafc',
                  border: userProfile.language === 'es' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {t.spanish}
                </span>
                {userProfile.language === 'es' && (
                  <i className="ri-check-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                )}
              </button>

              <button
                onClick={() => handleLanguageChange('en')}
                className="!rounded-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: userProfile.language === 'en' ? '#f0f9ff' : '#f8fafc',
                  border: userProfile.language === 'en' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  {t.english}
                </span>
                {userProfile.language === 'en' && (
                  <i className="ri-check-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BMI Modal */}
      {showBMIModal && bmiData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {t.bmiCalculator}
              </h3>
              <button
                onClick={() => setShowBMIModal(false)}
                className="!rounded-button"
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '16px' }}></i>
              </button>
            </div>

            {/* BMI Result */}
            <div style={{
              textAlign: 'center',
              padding: '24px',
              background: '#f8fafc',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                margin: '0 0 8px 0'
              }}>
                {t.bmiResult}
              </h4>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: bmiData.color,
                margin: '0 0 8px 0'
              }}>
                {bmiData.value}
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: bmiData.color,
                marginBottom: '12px'
              }}>
                {bmiData.category}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Peso: {userProfile.weight}kg • Altura: {userProfile.height}cm
              </div>
            </div>

            {/* BMI Ranges */}
            <div style={{
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                {t.bmiRanges}
              </h4>
              <div style={{
                display: 'grid',
                gap: '8px'
              }}>
                {[{
                  range: '< 18.5',
                  label: t.underweight,
                  color: '#3b82f6'
                }, {
                  range: '18.5 - 24.9',
                  label: t.normal,
                  color: '#10b981'
                }, {
                  range: '25.0 - 29.9',
                  label: t.overweight,
                  color: '#f59e0b'
                }, {
                  range: '30.0 - 34.9',
                  label: t.obesity,
                  color: '#ef4444'
                }, {
                  range: '≥ 35.0',
                  label: t.severeObesity,
                  color: '#dc2626'
                }].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: bmiData.category === item.label ? `${item.color}20` : 'transparent'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: item.color
                    }}></div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      minWidth: '60px'
                    }}>
                      {item.range}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#1f2937',
                      fontWeight: bmiData.category === item.label ? '600' : '400'
                    }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{
              padding: '16px',
              background: '#f0f9ff',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #e0e7ff'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="ri-lightbulb-line" style={{ color: '#3b82f6' }}></i>
                {t.recommendations}
              </h4>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {bmiData.recommendation}
              </p>
            </div>

            <button
              onClick={() => setShowBMIModal(false)}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Rest Day Modal */}
      {showRestDayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '350px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {t.restDay}
              </h3>
              <button
                onClick={() => setShowRestDayModal(false)}
                className="!rounded-button"
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '16px' }}></i>
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <input
                type="checkbox"
                id="restDayEnabled"
                checked={restDaySettings.enabled}
                onChange={(e) => handleRestDayToggle(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#3b82f6'
                }}
              />
              <label htmlFor="restDayEnabled" style={{
                fontSize: '16px',
                color: '#1f2937',
                fontWeight: '500'
              }}>
                Activar día de descanso
              </label>
            </div>

            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '0 0 16px 0',
              lineHeight: '1.5'
            }}>
              Cuando esté activado, los días de descanso aparecerán con indicadores especiales en la app y se ajustarán automáticamente los macronutrientes.
            </p>

            <button
              onClick={() => setShowRestDayModal(false)}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculatorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                Calculadora Nutricional
              </h3>
              <button
                onClick={() => setShowCalculatorModal(false)}
                className="!rounded-button"
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <i className="ri-close-line" style={{ fontSize: '16px' }}></i>
              </button>
            </div>

            {userProfile.age && userProfile.weight && userProfile.height ? (
              <div>
                <div style={{
                  padding: '16px',
                  background: '#f0f9ff',
                  borderRadius: '12px',
                  border: '1px solid #e0e7ff',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '12px'
                  }}>
                    Detalles del Cálculo
                  </h4>
                  {(() => {
                    const targets = calculateNutritionTargets();
                    return (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-line'
                      }}>
                        {calculationDetails?.explanation || 'Calculando...'}
                      </div>
                    );
                  })()}
                </div>

                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '12px'
                  }}>
                    Factores Considerados
                  </h4>
                  <div style={{
                    display: 'grid',
                    gap: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        Edad, peso, altura, género
                      </span>
                      <i className="ri-check-line" style={{ color: '#10b981' }}></i>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        Actividad física ({userProfile.activityLevel})
                      </span>
                      <i className="ri-check-line" style={{ color: '#10b981' }}></i>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        Actividad laboral ({userProfile.workActivity})
                      </span>
                      <i className="ri-check-line" style={{ color: '#10b981' }}></i>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        Objetivo ({userProfile.goal})
                      </span>
                      <i className="ri-check-line" style={{ color: '#10b981' }}></i>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (userProfile.autoCalculate) {
                      const targets = calculateNutritionTargets();
                      if (targets) {
                        const updatedProfile = { ...userProfile, ...targets };
                        setUserProfile(updatedProfile);
                        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                        window.dispatchEvent(new Event('profileUpdated'));
                        showSuccessMessage('Objetivos actualizados automáticamente');
                      }
                    }
                    setShowCalculatorModal(false);
                  }}
                  className="!rounded-button"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {userProfile.autoCalculate ? 'Aplicar Cálculo' : 'Entendido'}
                </button>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <i className="ri-alert-line" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  margin: '0 0 8px 0'
                }}>
                  Datos incompletos
                </p>
                <p style={{
                  fontSize: '14px',
                  margin: '0 0 16px 0'
                }}>
                  Completa tu edad, peso y altura para ver el cálculo automático
                </p>
                <button
                  onClick={() => {
                    setShowCalculatorModal(false);
                    setShowEditModal(true);
                  }}
                  className="!rounded-button"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Completar Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

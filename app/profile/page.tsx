
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../../components/BottomNavigation';

export default function Profile() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
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
    syncEnabled: false,
    lastSyncTime: null as string | null,
    avgDailySteps: 0,
    avgActiveMinutes: 0,
    avgCaloriesBurned: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showBMIModal, setShowBMIModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [healthData, setHealthData] = useState({
    steps: 0,
    activeMinutes: 0,
    caloriesBurned: 0,
    heartRate: 0,
    isConnected: false,
    lastUpdate: null as string | null
  });
  const [restDaySettings, setRestDaySettings] = useState({
    enabled: false,
    selectedDays: [] as number[],
    todayIsRestDay: false,
    autoAdjustMacros: true,
    calorieReduction: 300,
    proteinMaintain: true,
    carbReduction: 0.4,
    fatIncrease: 0.1
  });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);

        const profileData = localStorage.getItem('userProfile');
        if (profileData) {
          const parsed = JSON.parse(profileData);

          if (!parsed.name && userObj.name) {
            parsed.name = userObj.name;
          }
          if (!parsed.email && userObj.email) {
            parsed.email = userObj.email;
          }

          if (!parsed.workActivity) {
            parsed.workActivity = 'sedentary';
          }
          if (!parsed.syncEnabled) {
            parsed.syncEnabled = false;
          }

          setProfile(parsed);

          localStorage.setItem('userProfile', JSON.stringify(parsed));
        } else {
          const newProfile = {
            ...profile,
            name: userObj.name || '',
            email: userObj.email || ''
          };
          setProfile(newProfile);
          localStorage.setItem('userProfile', JSON.stringify(newProfile));
        }
      } else {
        const defaultUser = {
          name: 'Usuario',
          email: 'email@example.com'
        };
        setUser(defaultUser);
        localStorage.setItem('userData', JSON.stringify(defaultUser));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }

    try {
      const savedHealthData = localStorage.getItem('healthData');
      if (savedHealthData) {
        setHealthData(JSON.parse(savedHealthData));
      }
    } catch (error) {
      console.log('Error loading health data:', error);
    }

    try {
      const savedRestDaySettings = localStorage.getItem('restDaySettings');
      if (savedRestDaySettings) {
        const settings = JSON.parse(savedRestDaySettings);
        setRestDaySettings(settings);

        const today = new Date().getDay();
        const isRestDay = settings.enabled && settings.selectedDays.includes(today);
        setRestDaySettings(prev => ({ ...prev, todayIsRestDay: isRestDay }));
      }
    } catch (error) {
      console.log('Error loading rest day settings:', error);
    }

    const syncInterval = setInterval(() => {
      const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (currentProfile.syncEnabled) {
        syncHealthData();
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, []);

  const handleSaveProfile = () => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('appLanguage', profile.language);

      const updatedUser = {
        ...user,
        name: profile.name,
        email: profile.email
      };

      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setIsEditing(false);

      // Emit event to update navigation language
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (error) {
      console.log('Error saving profile:', error);
    }
  };

  const translations = {
    es: {
      profile: 'Perfil',
      editProfile: 'Editar Perfil',
      cancel: 'Cancelar',
      save: 'Guardar',
      personalInfo: 'Información Personal',
      name: 'Nombre',
      email: 'Email',
      age: 'Edad',
      weight: 'Peso (kg)',
      height: 'Altura (cm)',
      activityLevel: 'Nivel de Ejercicio',
      workActivity: 'Actividad Laboral',
      goal: 'Objetivo',
      language: 'Idioma',
      nutritionGoals: 'Objetivos Nutricionales',
      calculate: 'Calcular',
      calories: 'Calorías',
      protein: 'Proteína',
      carbs: 'Carbohidratos',
      fats: 'Grasas',
      actions: 'Acciones',
      deleteData: 'Eliminar Datos Nutricionales',
      signOut: 'Cerrar Sesión',
      calculateGoals: 'Calcular Objetivos',
      calculatedCalories: 'Calorías Calculadas',
      basedOn: 'Basado en tu edad, peso, altura, actividad laboral y nivel de ejercicio',
      macroDistribution: 'Distribución de Macronutrientes',
      applyGoals: 'Aplicar Objetivos',
      deleteConfirm: '¿Estás seguro de que quieres eliminar todos los datos nutricionales?',
      dataDeleted: 'Datos eliminados exitosamente',
      restDaySettings: 'Configuración de Días de Descanso',
      restDayTitle: 'Días de Descanso',
      restDayDescription: 'Configura días con actividad reducida y ajustes automáticos de macros',
      enableRestDays: 'Activar días de descanso',
      selectDays: 'Seleccionar días',
      autoAdjustMacros: 'Ajustar macros automáticamente',
      calorieReduction: 'Reducción de calorías',
      maintainProtein: 'Mantener proteína igual',
      carbReduction: 'Reducir carbohidratos',
      fatIncrease: 'Aumentar grasas',
      restDayActive: 'Día de descanso activo',
      restDayActiveDesc: 'Hoy es tu día de descanso. Macros ajustados automáticamente.',
      none: 'Sin ejercicio',
      light: 'Ligero (1-3 días/semana)',
      moderate: 'Moderado (3-5 días/semana)',
      active: 'Activo (6-7 días/semana)',
      veryActive: 'Muy activo (2x/día)',
      sedentary: 'Sedentario (oficina/escritorio)',
      lightWork: 'Ligero (caminatas ocasionales)',
      moderateWork: 'Moderado (de pie frecuentemente)',
      activeWork: 'Activo (caminar/moverse constantemente)',
      veryActiveWork: 'Muy activo (trabajo físico intenso)',
      lose: 'Perder peso',
      maintain: 'Mantenimiento',
      gain: 'Ganar músculo',
      recomposition: 'Recomposición corporal',
      spanish: 'Español',
      english: 'English',
      french: 'Français',
      portuguese: 'Português',
      italian: 'Italiano',
      sunday: 'Domingo',
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      healthSync: 'Sincronización de Salud',
      healthSyncTitle: 'Datos de Salud',
      healthSyncDesc: 'Sincroniza automáticamente con tu smartwatch y apps de salud',
      syncWith: 'Sincronizar con',
      enableSync: 'Activar sincronización automática',
      lastSync: 'Última sincronización',
      syncNow: 'Sincronizar ahora',
      syncSuccess: 'Sincronización exitosa',
      syncError: 'Error en la sincronización',
      syncing: 'Sincronizando...',
      steps: 'Pasos',
      activeMinutes: 'Minutos activos',
      caloriesBurned: 'Calorías quemadas',
      heartRate: 'Frecuencia cardíaca',
      autoAdjustActivity: 'Ajustar actividad laboral automáticamente',
      smartWorkDetection: 'Detección inteligente de actividad laboral',
      workActivityAdjusted: 'Actividad laboral ajustada automáticamente',
      basedOnSteps: 'Basado en pasos promedio de los últimos 7 días',
      connectDevice: 'Conectar dispositivo',
      disconnect: 'Desconectar',
      healthDataOverview: 'Resumen de Actividad',
      bmiCalculator: 'Calculadora de IMC',
      bmiTitle: 'Índice de Masa Corporal',
      bmiDescription: 'Calcula tu IMC y conoce tu estado nutricional',
      yourBMI: 'Tu IMC',
      bmiCategory: 'Categoría',
      bmiUnderweight: 'Peso insuficiente',
      bmiNormal: 'Peso normal',
      bmiOverweight: 'Sobrepeso',
      bmiObese: 'Obesidad',
      bmiSevereObese: 'Obesidad severa',
      bmiRecommendation: 'Recomendación',
      bmiUnderweightRec: 'Considera aumentar tu ingesta calórica y consultar con un profesional',
      bmiNormalRec: 'Mantén tu peso actual con una alimentación equilibrada',
      bmiOverweightRec: 'Considera reducir calorías y aumentar actividad física',
      bmiObeseRec: 'Recomendamos consultar con un profesional de la salud',
      bmiSevereObeseRec: 'Es importante consultar con un médico especialista',
      bmiRanges: 'Rangos de IMC',
      bmiRange1: 'Menos de 18.5',
      bmiRange2: '18.5 - 24.9',
      bmiRange3: '25.0 - 29.9',
      bmiRange4: '30.0 - 34.9',
      bmiRange5: '35.0 o más',
      calculateBMI: 'Calcular IMC',
      enterWeightHeight: 'Ingresa tu peso y altura para calcular tu IMC'
    }
  };

  const t = translations[profile.language as keyof typeof translations] || translations.es;

  const dayNames = [
    t.sunday, t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday
  ];

  const detectWorkActivity = (avgSteps: number) => {
    if (avgSteps < 3000) return 'sedentary';
    if (avgSteps < 6000) return 'lightWork';
    if (avgSteps < 9000) return 'moderateWork';
    if (avgSteps < 12000) return 'activeWork';
    return 'veryActiveWork';
  };

  const connectToHealthApp = async (provider: string) => {
    setSyncStatus('syncing');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockHealthData = {
        steps: Math.floor(Math.random() * 8000) + 4000,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        caloriesBurned: Math.floor(Math.random() * 400) + 200,
        heartRate: Math.floor(Math.random() * 40) + 60,
        isConnected: true,
        lastUpdate: new Date().toISOString()
      };

      setHealthData(mockHealthData);

      const avgSteps = Math.floor(Math.random() * 3000) + mockHealthData.steps;
      const detectedActivity = detectWorkActivity(avgSteps);

      const updatedProfile = {
        ...profile,
        syncEnabled: true,
        lastSyncTime: new Date().toISOString(),
        avgDailySteps: avgSteps,
        avgActiveMinutes: mockHealthData.activeMinutes,
        avgCaloriesBurned: mockHealthData.caloriesBurned,
        workActivity: detectedActivity
      };

      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      localStorage.setItem('healthData', JSON.stringify(mockHealthData));

      setSyncStatus('success');

      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);

    } catch (error) {
      console.log('Error connecting to health app:', error);
      setSyncStatus('error');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  const syncHealthData = async () => {
    if (!profile.syncEnabled) return;

    setSyncStatus('syncing');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const today = new Date();
      const mockHealthData = {
        steps: Math.floor(Math.random() * 8000) + 4000,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        caloriesBurned: Math.floor(Math.random() * 400) + 200,
        heartRate: Math.floor(Math.random() * 40) + 60,
        isConnected: true,
        lastUpdate: today.toISOString()
      };

      setHealthData(mockHealthData);

      const avgSteps = Math.floor(Math.random() * 3000) + mockHealthData.steps;
      const detectedActivity = detectWorkActivity(avgSteps);

      const updatedProfile = {
        ...profile,
        lastSyncTime: today.toISOString(),
        avgDailySteps: avgSteps,
        avgActiveMinutes: mockHealthData.activeMinutes,
        avgCaloriesBurned: mockHealthData.caloriesBurned,
        workActivity: detectedActivity
      };

      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      localStorage.setItem('healthData', JSON.stringify(mockHealthData));

      setSyncStatus('success');

      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);

    } catch (error) {
      console.log('Error syncing health data:', error);
      setSyncStatus('error');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  const disconnectHealthApp = () => {
    setHealthData({
      steps: 0,
      activeMinutes: 0,
      caloriesBurned: 0,
      heartRate: 0,
      isConnected: false,
      lastUpdate: null
    });

    const updatedProfile = {
      ...profile,
      syncEnabled: false,
      lastSyncTime: null,
      avgDailySteps: 0,
      avgActiveMinutes: 0,
      avgCaloriesBurned: 0
    };

    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    localStorage.removeItem('healthData');
  };

  const calculateBMR = () => {
    if (!profile.weight || !profile.height || !profile.age) return 0;

    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    const age = parseInt(profile.age);

    const bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);

    const workMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      lightWork: 1.35,
      moderateWork: 1.5,
      activeWork: 1.65,
      veryActiveWork: 1.8
    };

    const exerciseMultipliers: { [key: string]: number } = {
      none: 0,
      light: 0.1,
      moderate: 0.2,
      active: 0.3,
      veryActive: 0.4
    };

    const workTDEE = bmr * workMultipliers[profile.workActivity];
    const exerciseBonus = bmr * exerciseMultipliers[profile.activityLevel];
    let totalTDEE = workTDEE + exerciseBonus;

    if (profile.syncEnabled && profile.avgCaloriesBurned > 0) {
      const healthBonus = profile.avgCaloriesBurned * 0.1;
      totalTDEE += healthBonus;
    }

    const goalAdjustments: { [key: string]: number } = {
      lose: -500,
      maintain: 0,
      gain: 300,
      recomposition: -200
    };

    return Math.round(totalTDEE + goalAdjustments[profile.goal]);
  };

  const calculateMacros = (calories: number) => {
    const weight = parseFloat(profile.weight) || 70;

    const macroDistributions: { [key: string]: { protein: number; carbs: number; fats: number } } = {
      lose: { protein: 0.35, carbs: 0.30, fats: 0.35 },
      maintain: { protein: 0.25, carbs: 0.45, fats: 0.30 },
      gain: { protein: 0.25, carbs: 0.50, fats: 0.25 },
      recomposition: { protein: 0.40, carbs: 0.35, fats: 0.25 }
    };

    const distribution = macroDistributions[profile.goal];

    let protein: number;
    switch (profile.goal) {
      case 'lose':
        protein = Math.round(weight * 2.2);
        break;
      case 'gain':
        protein = Math.round(weight * 1.6);
        break;
      case 'recomposition':
        protein = Math.round(weight * 2.5);
        break;
      default:
        protein = Math.round(weight * 1.4);
    }

    const proteinCalories = protein * 4;
    const remainingCalories = calories - proteinCalories;

    const fatsCalories = remainingCalories * (distribution.fats / (distribution.carbs + distribution.fats));
    const carbsCalories = remainingCalories - fatsCalories;

    const carbs = Math.round(carbsCalories / 4);
    const fats = Math.round(fatsCalories / 9);

    return { protein, carbs, fats };
  };

  const handleSaveRestDaySettings = () => {
    try {
      const today = new Date().getDay();
      const isRestDay = restDaySettings.enabled && restDaySettings.selectedDays.includes(today);

      const updatedSettings = {
        ...restDaySettings,
        todayIsRestDay: isRestDay
      };

      setRestDaySettings(updatedSettings);
      localStorage.setItem('restDaySettings', JSON.stringify(updatedSettings));
      setShowRestDayModal(false);

      if (isRestDay && restDaySettings.autoAdjustMacros) {
        applyRestDayAdjustments();
      }
    } catch (error) {
      console.log('Error saving rest day settings:', error);
    }
  };

  const applyRestDayAdjustments = () => {
    try {
      const baseCalories = profile.targetCalories;
      const baseProtein = profile.targetProtein;
      const baseCarbs = profile.targetCarbs;
      const baseFats = profile.targetFats;

      const adjustedCalories = baseCalories - restDaySettings.calorieReduction;
      const adjustedProtein = restDaySettings.proteinMaintain ? baseProtein : Math.round(baseProtein * 0.9);
      const adjustedCarbs = Math.round(baseCarbs * (1 - restDaySettings.carbReduction));

      const proteinCals = adjustedProtein * 4;
      const carbCals = adjustedCarbs * 4;
      const remainingCals = adjustedCalories - proteinCals - carbCals;
      const adjustedFats = Math.round(remainingCals / 9);

      const today = new Date().toISOString().split('T')[0];
      const todayNutrition = localStorage.getItem(`nutrition_${today}`);

      if (todayNutrition) {
        const nutrition = JSON.parse(todayNutrition);
        nutrition.targetCalories = adjustedCalories;
        nutrition.targetProtein = adjustedProtein;
        nutrition.targetCarbs = adjustedCarbs;
        nutrition.targetFats = adjustedFats;
        localStorage.setItem(`nutrition_${today}`, JSON.stringify(nutrition));
      }

      window.dispatchEvent(new CustomEvent('nutritionDataUpdated', {
        detail: {
          date: today,
          data: {
            targetCalories: adjustedCalories,
            targetProtein: adjustedProtein,
            targetCarbs: adjustedCarbs,
            targetFats: adjustedFats
          }
        }
      }));
    } catch (error) {
      console.log('Error applying rest day adjustments:', error);
    }
  };

  const toggleRestDay = (dayIndex: number) => {
    const updatedDays = restDaySettings.selectedDays.includes(dayIndex)
      ? restDaySettings.selectedDays.filter(d => d !== dayIndex)
      : [...restDaySettings.selectedDays, dayIndex];

    setRestDaySettings(prev => ({ ...prev, selectedDays: updatedDays }));
  };

  const handleLogout = () => {
    try {
      // Obtener el email del usuario actual
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userEmail = user.email;

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

        // Recopilar todos los datos nutricionales
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('nutrition_')) {
            backupData.nutritionData[key] = localStorage.getItem(key);
          }
        });

        // Guardar backup del usuario
        const userKey = `user_${userEmail}`;
        localStorage.setItem(userKey, JSON.stringify(backupData));

        // Mostrar mensaje de confirmación
        const logoutMessage = document.createElement('div');
        logoutMessage.style.cssText = `
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

        logoutMessage.innerHTML = `
          <div style="width: 24px; height: 24px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i class="ri-check-line" style="color: white; font-size: 14px;"></i>
          </div>
          <div>
            <p style="font-size: 14px; font-weight: 600; color: #16a34a; margin: 0;">Datos guardados correctamente</p>
            <p style="font-size: 12px; color: #15803d; margin: 0;">Tu progreso está seguro</p>
          </div>
        `;

        document.body.appendChild(logoutMessage);

        setTimeout(() => {
          if (document.body.contains(logoutMessage)) {
            document.body.removeChild(logoutMessage);
          }
        }, 2000);
      }

      // Limpiar datos de sesión actual (pero no el backup)
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userProfilePhoto');
      localStorage.removeItem('isAuthenticated');

      // Limpiar datos nutricionales de la sesión actual
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nutrition_')) {
          localStorage.removeItem(key);
        }
      });

      // Limpiar configuraciones de la sesión actual
      localStorage.removeItem('restDaySettings');
      localStorage.removeItem('hydrationReminder');
      localStorage.removeItem('healthData');

      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (error) {
      console.log('Error during logout:', error);
      router.push('/login');
    }
  };

  const handleUpdateGoals = () => {
    try {
      const calculatedCalories = calculateBMR();
      const macros = calculateMacros(calculatedCalories);

      const updatedProfile = {
        ...profile,
        targetCalories: calculatedCalories,
        targetProtein: macros.protein,
        targetCarbs: macros.carbs,
        targetFats: macros.fats
      };

      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setShowGoalsModal(false);
    } catch (error) {
      console.log('Error updating goals:', error);
    }
  };

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

  const calculateBMI = () => {
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);

    if (!weight || !height || weight <= 0 || height <= 0) {
      return null;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: t.bmiUnderweight, color: '#3b82f6', recommendation: t.bmiUnderweightRec };
    if (bmi < 25) return { category: t.bmiNormal, color: '#16a34a', recommendation: t.bmiNormalRec };
    if (bmi < 30) return { category: t.bmiOverweight, color: '#f59e0b', recommendation: t.bmiOverweightRec };
    if (bmi < 35) return { category: t.bmiObese, color: '#ef4444', recommendation: t.bmiObeseRec };
    return { category: t.bmiSevereObese, color: '#dc2626', recommendation: t.bmiSevereObeseRec };
  };

  const getBMIRanges = () => [
    { range: t.bmiRange1, category: t.bmiUnderweight, color: '#3b82f6' },
    { range: t.bmiRange2, category: t.bmiNormal, color: '#16a34a' },
    { range: t.bmiRange3, category: t.bmiOverweight, color: '#f59e0b' },
    { range: t.bmiRange4, category: t.bmiObese, color: '#ef4444' },
    { range: t.bmiRange5, category: t.bmiSevereObese, color: '#dc2626' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
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

      <main style={{ padding: '24px 16px' }}>
        {profile.syncEnabled && syncStatus === 'success' && (
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#16a34a',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-check-line" style={{ color: 'white', fontSize: '16px' }}></i>
              </div>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#16a34a',
                  margin: 0
                }}>
                  {t.workActivityAdjusted}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#15803d',
                  margin: 0
                }}>
                  {t.basedOnSteps}: {profile.avgDailySteps} pasos/día
                </p>
              </div>
            </div>
          </div>
        )}

        {restDaySettings.enabled && restDaySettings.todayIsRestDay && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid #fecaca'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#dc2626',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-pause-circle-fill" style={{ color: 'white', fontSize: '16px' }}></i>
              </div>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#dc2626',
                  margin: 0
                }}>
                  {t.restDayActive}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#7f1d1d',
                  margin: 0
                }}>
                  {t.restDayActiveDesc}
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: user?.picture ? `url(${user.picture})` : `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            border: '4px solid white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {!user?.picture && (
              <span style={{
                color: 'white',
                fontWeight: '600',
                fontSize: '24px'
              }}>
                {(user?.name || profile.name) ? (user?.name || profile.name).charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            {user?.name || profile.name || 'Usuario'}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 16px 0'
          }}>
            {user?.email || profile.email || 'email@example.com'}
          </p>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="!rounded-button"
            style={{
              background: '#f0f9ff',
              border: '1px solid #e0e7ff',
              color: '#3b82f6',
              padding: '8px 20px',
              borderRadius: '20px',
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
            {isEditing ? t.cancel : t.editProfile}
          </button>
        </div>

        {isEditing && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
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
              {t.personalInfo}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '16px'
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
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
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
                  {t.email}
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
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
                gridTemplateColumns: 'repeat(3, 1fr)',
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
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="25"
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
                    {t.weight}
                  </label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="70"
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
                    {t.height}
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="175"
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
                  {t.workActivity}
                </label>
                <select
                  value={profile.workActivity}
                  onChange={(e) => setProfile({ ...profile, workActivity: e.target.value })}
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
                  <option value="sedentary">{t.sedentary}</option>
                  <option value="lightWork">{t.lightWork}</option>
                  <option value="moderateWork">{t.moderateWork}</option>
                  <option value="activeWork">{t.activeWork}</option>
                  <option value="veryActiveWork">{t.veryActiveWork}</option>
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
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
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
                  <option value="none">{t.none}</option>
                  <option value="light">{t.light}</option>
                  <option value="moderate">{t.moderate}</option>
                  <option value="active">{t.active}</option>
                  <option value="veryActive">{t.veryActive}</option>
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
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
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
                  <option value="lose">{t.lose}</option>
                  <option value="maintain">{t.maintain}</option>
                  <option value="gain">{t.gain}</option>
                  <option value="recomposition">{t.recomposition}</option>
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
                  {t.language}
                </label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
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
                  <option value="es">{t.spanish}</option>
                  <option value="en">{t.english}</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setIsEditing(false)}
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
        )}

        <div style={{
          background: 'white',
          borderRadius: '16px',
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
              {t.restDaySettings}
            </h3>
            <button
              onClick={() => setShowRestDayModal(true)}
              className="!rounded-button"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
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
              <i className="ri-pause-circle-line"></i>
              Configurar
            </button>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: restDaySettings.enabled ? '#dc2626' : '#e5e7eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-pause-circle-fill" style={{
                  color: restDaySettings.enabled ? 'white' : '#9ca3af',
                  fontSize: '16px'
                }}></i>
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {restDaySettings.enabled ? 'Días de descanso activados' : 'Días de descanso desactivados'}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {restDaySettings.enabled && restDaySettings.selectedDays.length > 0
                    ? `${restDaySettings.selectedDays.length} día${restDaySettings.selectedDays.length > 1 ? 's' : ''} configurado${restDaySettings.selectedDays.length > 1 ? 's' : ''}`
                    : 'Configura días con actividad reducida'}
                </p>
              </div>
            </div>

            {restDaySettings.enabled && restDaySettings.selectedDays.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {restDaySettings.selectedDays.map(dayIndex => (
                  <span
                    key={dayIndex}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {dayNames[dayIndex]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
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
              {t.nutritionGoals}
            </h3>
            <button
              onClick={() => setShowGoalsModal(true)}
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
              <i className="ri-settings-line"></i>
              {t.calculate}
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              border: '1px solid #e0e7ff'
            }}>
              <i className="ri-fire-line" style={{ color: '#3b82f6', fontSize: '24px', marginBottom: '4px' }}></i>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.calories}
              </p>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {profile.targetCalories}
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #dcfce7'
            }}>
              <i className="ri-bread-line" style={{ color: '#16a34a', fontSize: '24px', marginBottom: '4px' }}></i>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.protein}
              </p>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {profile.targetProtein}g
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#fefce8',
              borderRadius: '12px',
              border: '1px solid #fef3c7'
            }}>
              <i className="ri-restaurant-line" style={{ color: '#f59e0b', fontSize: '24px', marginBottom: '4px' }}></i>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.carbs}
              </p>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {profile.targetCarbs}g
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#faf5ff',
              borderRadius: '12px',
              border: '1px solid #e9d5ff'
            }}>
              <i className="ri-drop-line" style={{ color: '#8b5cf6', fontSize: '24px', marginBottom: '4px' }}></i>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.fats}
              </p>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                {profile.targetFats}g
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
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
              {t.healthSync}
            </h3>
            <button
              onClick={() => setShowSyncModal(true)}
              className="!rounded-button"
              style={{
                background: healthData.isConnected ? '#f0fdf4' : '#f0f9ff',
                border: `1px solid ${healthData.isConnected ? '#dcfce7' : '#e0e7ff'}`,
                color: healthData.isConnected ? '#16a34a' : '#3b82f6',
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
              <i className={`ri-${healthData.isConnected ? 'smartphone' : 'add'}-line`}></i>
              {healthData.isConnected ? 'Conectado' : 'Conectar'}
            </button>
          </div>

          {healthData.isConnected && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: '#f0f9ff',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <i className="ri-walk-line" style={{ color: '#3b82f6', fontSize: '20px', marginBottom: '4px' }}></i>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {t.steps}
                </p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {healthData.steps.toLocaleString()}
                </p>
              </div>

              <div style={{
                background: '#f0fdf4',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <i className="ri-time-line" style={{ color: '#16a34a', fontSize: '20px', marginBottom: '4px' }}></i>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {t.activeMinutes}
                </p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {healthData.activeMinutes} min
                </p>
              </div>

              <div style={{
                background: '#fefce8',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <i className="ri-fire-line" style={{ color: '#f59e0b', fontSize: '20px', marginBottom: '4px' }}></i>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {t.caloriesBurned}
                </p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {healthData.caloriesBurned} cal
                </p>
              </div>

              <div style={{
                background: '#fef2f2',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <i className="ri-heart-pulse-line" style={{ color: '#ef4444', fontSize: '20px', marginBottom: '4px' }}></i>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {t.heartRate}
                </p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {healthData.heartRate} bpm
                </p>
              </div>
            </div>
          )}

          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: healthData.isConnected ? '#16a34a' : '#e5e7eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="ri-smartphone-line" style={{
                  color: healthData.isConnected ? 'white' : '#9ca3af',
                  fontSize: '16px'
                }}></i>
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {healthData.isConnected ? 'Dispositivo conectado' : 'Sin conexión'}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {healthData.isConnected && healthData.lastUpdate
                    ? `${t.lastSync}: ${new Date(healthData.lastUpdate).toLocaleString()}`
                    : 'Conecta tu smartwatch o app de salud'
                  }
                </p>
              </div>
            </div>

            {healthData.isConnected && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px'
              }}>
                <button
                  onClick={syncHealthData}
                  disabled={syncStatus === 'syncing'}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: syncStatus === 'syncing' ? '#f3f4f6' : '#f0f9ff',
                    border: '1px solid #e0e7ff',
                    color: syncStatus === 'syncing' ? '#6b7280' : '#3b82f6',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center'
                  }}
                >
                  <i className={`ri-${syncStatus === 'syncing' ? 'loader-4' : 'refresh'}-line`} style={{
                    animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none'
                  }}></i>
                  {syncStatus === 'syncing' ? t.syncing : t.syncNow}
                </button>

                <button
                  onClick={disconnectHealthApp}
                  className="!rounded-button"
                  style={{
                    padding: '8px 12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="ri-disconnect-line"></i>
                  {t.disconnect}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
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
            {t.actions}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px'
          }}>
            <button
              onClick={() => {
                if (confirm(t.deleteConfirm)) {
                  try {
                    Object.keys(localStorage).forEach(key => {
                      if (key.startsWith('nutrition_')) {
                        localStorage.removeItem(key);
                      }
                    });
                    alert(t.dataDeleted);
                  } catch (error) {
                    console.log('Error deleting data:', error);
                  }
                }
              }}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                color: '#dc2626',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <i className="ri-delete-bin-line" style={{ fontSize: '20px' }}></i>
              {t.deleteData}
            </button>

            <button
              onClick={handleLogout}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '16px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                color: '#374151',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <i className="ri-logout-box-line" style={{ fontSize: '20px' }}></i>
              {t.signOut}
            </button>
          </div>
        </div>

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
                  {t.restDayTitle}
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
                background: '#fef2f2',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid #fecaca'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <i className="ri-pause-circle-line" style={{ color: '#dc2626', fontSize: '20px' }}></i>
                  <p style={{
                    fontSize: '14px',
                    color: '#7f1d1d',
                    margin: 0
                  }}>
                    {t.restDayDescription}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="checkbox"
                    id="enableRestDays"
                    checked={restDaySettings.enabled}
                    onChange={(e) => setRestDaySettings({
                      ...restDaySettings,
                      enabled: e.target.checked
                    })}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#dc2626'
                    }}
                  />
                  <label htmlFor="enableRestDays" style={{
                    fontSize: '14px',
                    color: '#7f1d1d',
                    fontWeight: '500'
                  }}>
                    {t.enableRestDays}
                  </label>
                </div>

                {restDaySettings.enabled && (
                  <div style={{
                    display: 'grid',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#7f1d1d',
                        marginBottom: '8px'
                      }}>
                        {t.selectDays}
                      </label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '8px'
                      }}>
                        {dayNames.map((day, index) => (
                          <button
                            key={index}
                            onClick={() => toggleRestDay(index)}
                            className="!rounded-button"
                            style={{
                              padding: '8px 12px',
                              background: restDaySettings.selectedDays.includes(index) ? '#dc2626' : '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              color: restDaySettings.selectedDays.includes(index) ? 'white' : '#374151',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <input
                          type="checkbox"
                          id="autoAdjustMacros"
                          checked={restDaySettings.autoAdjustMacros}
                          onChange={(e) => setRestDaySettings({
                            ...restDaySettings,
                            autoAdjustMacros: e.target.checked
                          })}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#dc2626'
                          }}
                        />
                        <label htmlFor="autoAdjustMacros" style={{
                          fontSize: '14px',
                          color: '#7f1d1d',
                          fontWeight: '500'
                        }}>
                          {t.autoAdjustMacros}
                        </label>
                      </div>

                      {restDaySettings.autoAdjustMacros && (
                        <div style={{
                          display: 'grid',
                          gap: '12px'
                        }}>
                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#7f1d1d',
                              marginBottom: '4px'
                            }}>
                              {t.calorieReduction}: {restDaySettings.calorieReduction} cal
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="500"
                              step="50"
                              value={restDaySettings.calorieReduction}
                              onChange={(e) => setRestDaySettings({
                                ...restDaySettings,
                                calorieReduction: parseInt(e.target.value)
                              })}
                              style={{
                                width: '100%',
                                height: '4px',
                                background: '#e5e7eb',
                                outline: 'none',
                                borderRadius: '2px'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#7f1d1d',
                              marginBottom: '4px'
                            }}>
                              {t.carbReduction}: {Math.round(restDaySettings.carbReduction * 100)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="0.6"
                              step="0.1"
                              value={restDaySettings.carbReduction}
                              onChange={(e) => setRestDaySettings({
                                ...restDaySettings,
                                carbReduction: parseFloat(e.target.value)
                              })}
                              style={{
                                width: '100%',
                                height: '4px',
                                background: '#e5e7eb',
                                outline: 'none',
                                borderRadius: '2px'
                              }}
                            />
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <input
                              type="checkbox"
                              id="maintainProtein"
                              checked={restDaySettings.proteinMaintain}
                              onChange={(e) => setRestDaySettings({
                                ...restDaySettings,
                                proteinMaintain: e.target.checked
                              })}
                              style={{
                                width: '16px',
                                height: '16px',
                                accentColor: '#dc2626'
                              }}
                            />
                            <label htmlFor="maintainProtein" style={{
                              fontSize: '12px',
                              color: '#7f1d1d',
                              fontWeight: '500'
                            }}>
                              {t.maintainProtein}
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => setShowRestDayModal(false)}
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
                  onClick={handleSaveRestDaySettings}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
        )}

        {showGoalsModal && (
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
                  {t.calculateGoals}
                </h3>
                <button
                  onClick={() => setShowGoalsModal(false)}
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
                background: '#f0f9ff',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <i className="ri-calculator-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {t.calculatedCalories}
                  </h4>
                </div>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#3b82f6',
                  margin: '0 0 8px 0'
                }}>
                  {calculateBMR()} cal/day
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {t.basedOn}
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  {t.macroDistribution}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#16a34a',
                      margin: '0 0 4px 0'
                    }}>
                      {calculateMacros(calculateBMR()).protein}g
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {t.protein}
                    </p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#f59e0b',
                      margin: '0 0 4px 0'
                    }}>
                      {calculateMacros(calculateBMR()).carbs}g
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {t.carbs}
                    </p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#8b5cf6',
                      margin: '0 0 4px 0'
                    }}>
                      {calculateMacros(calculateBMR()).fats}g
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {t.fats}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => setShowGoalsModal(false)}
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
                  onClick={handleUpdateGoals}
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
                  {t.applyGoals}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '16px',
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
              {t.bmiCalculator}
            </h3>
            <button
              onClick={() => setShowBMIModal(true)}
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
              {t.calculateBMI}
            </button>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e2e8f0'
          }}>
            {profile.weight && profile.height ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: getBMICategory(calculateBMI()!).color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-heart-pulse-line" style={{
                    color: 'white',
                    fontSize: '20px'
                  }}></i>
                </div>
                <div>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {t.yourBMI}: {calculateBMI()}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: getBMICategory(calculateBMI()!).color,
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {getBMICategory(calculateBMI()!).category}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#e5e7eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="ri-calculator-line" style={{
                    color: '#9ca3af',
                    fontSize: '20px'
                  }}></i>
                </div>
                <div>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 4px 0'
                  }}>
                    {t.calculateBMI}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {t.enterWeightHeight}
                  </p>
                </div>
              </div>
            )}

            {profile.weight && profile.height && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 4px 0'
                }}>
                  {t.bmiRecommendation}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {getBMICategory(calculateBMI()!).recommendation}
                </p>
              </div>
            )}
          </div>
        </div>

        {showBMIModal && (
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
                  {t.bmiTitle}
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

              <div style={{
                background: '#f0f9ff',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid #e0e7ff'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <i className="ri-heart-pulse-line" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                  <p style={{
                    fontSize: '14px',
                    color: '#1e40af',
                    margin: 0
                  }}>
                    {t.bmiDescription}
                  </p>
                </div>

                {profile.weight && profile.height && (
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: getBMICategory(calculateBMI()!).color,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="ri-heart-pulse-line" style={{
                            color: 'white',
                            fontSize: '18px'
                          }}></i>
                        </div>
                        <div>
                          <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: '0 0 2px 0'
                          }}>
                            {t.yourBMI}
                          </p>
                          <p style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {calculateBMI()}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 2px 0'
                        }}>
                          {t.bmiCategory}
                        </p>
                        <p style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: getBMICategory(calculateBMI()!).color,
                          margin: 0
                        }}>
                          {getBMICategory(calculateBMI()!).category}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 4px 0'
                      }}>
                        {t.bmiRecommendation}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {getBMICategory(calculateBMI()!).recommendation}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '16px'
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
                    {getBMIRanges().map((range, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          background: range.color,
                          borderRadius: '50%'
                        }}></div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#374151'
                          }}>
                            {range.range}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            {range.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

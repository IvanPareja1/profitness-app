
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../components/BottomNavigation';
import { NutritionCalculator } from '../lib/nutrition-calculator';
import { fitnessSync, FitnessData } from '../lib/fitness-sync';
import { deviceTime } from '../lib/device-time-utils';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('es');
  const [userData, setUserData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>({});
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProfile, setEditProfile] = useState<any>();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [calculatorData, setCalculatorData] = useState<any>(null);
  const [restDayConfig, setRestDayConfig] = useState({
    enabled: false,
    selectedDays: [] as string[],
    reducedCalories: false,
    calorieReduction: 200
  });
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState(5);
  const [donateMessage, setDonateMessage] = useState('');
  const [donateStatus, setDonateStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const router = useRouter();

  
// Función para cargar datos del usuario desde Supabase
const loadUserDataFromSupabase = async (userId: string) => {
  // VERIFICAR que userId no sea undefined
  if (!userId || userId === 'undefined') {
    console.error('User ID is undefined');
    return;
  }

  try {
    // Cargar perfil del usuario
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error loading profile:', profileError);
      return;
    }

    if (profileData) {
      setUserProfile(profileData);
      setEditProfile(profileData);
      setLanguage(profileData.language || 'es');
    }

    // Cargar configuración de días de descanso
    const { data: restDayData, error: restDayError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('setting_type', 'rest_days')
      .single();

    if (!restDayError && restDayData) {
      setRestDayConfig(restDayData.setting_value);
    }

    // Cargar datos de fitness del día actual
    try {
      const today = deviceTime.getCurrentDate();
      const { data: fitnessData, error: fitnessError } = await supabase
        .from('fitness_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (!fitnessError && fitnessData) {
        setFitnessData(fitnessData);
      }
    } catch (error) {
      console.warn('Error cargando datos fitness:', error);
    }
  } catch (error) {
    console.error('Error cargando datos desde Supabase:', error);
  }
};
  // Función para guardar perfil en Supabase
  const saveProfileToSupabase = async (profileData: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userData.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error guardando perfil en Supabase:', error);
      throw error;
    }
  };


useEffect(() => {
  setMounted(true);

  if (typeof window === 'undefined') return;

  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated || isAuthenticated !== 'true') {
    router.push('/login');
    return;
  }

  try {
    const userDataStored = localStorage.getItem('userData');
    if (userDataStored) {
      const user = JSON.parse(userDataStored);
      setUserData(user);
      
      // VERIFICAR que user.id existe antes de cargar datos
      if (user && user.id && user.id !== 'undefined') {
        loadUserDataFromSupabase(user.id);
      } else {
        console.error('User ID is invalid:', user?.id);
        // Forzar logout si el user ID es inválido
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        router.push('/login');
        return; // Agregar return para evitar ejecución adicional
      }
    }

    // También mantener compatibilidad con localStorage por ahora
    const userProfileStored = localStorage.getItem('userProfile');
    if (userProfileStored) {
      const profile = JSON.parse(userProfileStored);
      setUserProfile(profile);
      setEditProfile(profile);
      setLanguage(profile.language || 'es');
    }

    // Cargar configuración de días de descanso desde localStorage (temporal)
    const restConfig = localStorage.getItem('restDaySettings');
    if (restConfig) {
      setRestDayConfig(JSON.parse(restConfig));
    }
  } catch (error) {
    console.log('Error loading user data:', error);
  }
}, [router]);

  const translations = {
    es: {
      profile: 'Perfil',
      quickActions: 'Acciones Rápidas',
      language: 'Idioma',
      changeLanguage: 'Cambiar idioma',
      sync: 'Sincronizar',
      fitnessData: 'Datos fitness',
      calculator: 'Calculadora',
      nutritionTargets: 'Objetivos nutricionales',
      rest: 'Descanso',
      configureRest: 'Configurar descanso',
      personalInfo: 'Información Personal',
      edit: 'Editar',
      name: 'Nombre',
      email: 'Email',
      age: 'Edad',
      height: 'Altura',
      weight: 'Peso',
      activity: 'Actividad',
      goal: 'Objetivo',
      goalLose: 'Pérdida de peso',
      goalMaintain: 'Mantenimiento',
      goalMuscle: 'Ganar músculo',
      nutritionGoals: 'Objetivos Nutricionales',
      calories: 'Calorías',
      protein: 'Proteínas',
      carbs: 'Carbohidratos',
      fats: 'Grasas',
      autoCalculate: 'Cálculo automático',
      logout: 'Cerrar Sesión',
      save: 'Guardar',
      cancel: 'Cancelar',
      selectLanguage: 'Seleccionar Idioma',
      spanish: 'Español',
      english: 'English',
      syncData: 'Sincronizar Datos',
      syncDescription: 'Sincroniza tus datos con dispositivos fitness',
      syncNow: 'Sincronizar Ahora',
      syncing: 'Sincronizando...',
      syncSuccess: 'Sincronización exitosa',
      syncError: 'Error en sincronización',
      requestPermissions: 'Solicitar Permisos',
      nutritionCalculator: 'Calculadora Nutricional',
      calculateTargets: 'Calcular Objetivos',
      restDayConfig: 'Configuración de Descanso',
      restDayDescription: 'Configura tus días de descanso',
      configure: 'Configurar',
      steps: 'Pasos',
      activeMinutes: 'Minutos activos',
      heartRate: 'Ritmo cardíaco',
      distance: 'Distancia',
      lastSync: 'Última sincronización',
      fitnessDataTitle: 'Datos de Fitness Hoy',
      enableRestDays: 'Habilitar días de descanso',
      selectDays: 'Seleccionar días',
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
      reduceCalories: 'Reducir calorías en días de descanso',
      calorieReduction: 'Reducción de calorías',
      applied: 'Aplicado',
      syncWithDevice: 'Sincronizar con dispositivo',
      permissionsNeeded: 'Se requieren permisos para sincronizar',
      donate: 'Donar',
      supportApp: 'Apoyar la aplicación',
      donateTitle: 'Apoya ProFitness',
      donateDescription: 'Tu apoyo nos ayuda a mantener la aplicación gratuita y mejorar constantemente',
      donateAmount: 'Selecciona el monto',
      donateMessage: 'Mensaje opcional',
      donateSuccess: 'Donación realizada exitosamente',
      donateError: 'Error al procesar la donación',
      thankYou: 'Gracias por tu apoyo',
      donate5: '$5 - Café',
      donate10: '$10 - Almuerzo',
      donate20: '$20 - Cena',
      donateCustom: 'Monto personalizado',
      processing: 'Procesando...'
    },
    en: {
      profile: 'Profile',
      quickActions: 'Quick Actions',
      language: 'Language',
      changeLanguage: 'Change language',
      sync: 'Sync',
      fitnessData: 'Fitness data',
      calculator: 'Calculator',
      nutritionTargets: 'Nutrition targets',
      rest: 'Rest',
      configureRest: 'Configure rest',
      personalInfo: 'Personal Information',
      edit: 'Edit',
      name: 'Name',
      email: 'Email',
      age: 'Age',
      height: 'Height',
      weight: 'Weight',
      activity: 'Activity',
      goal: 'Goal',
      goalLose: 'Weight loss',
      goalMaintain: 'Maintenance',
      goalMuscle: 'Gain muscle',
      nutritionGoals: 'Nutrition Goals',
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fats: 'Fats',
      autoCalculate: 'Auto calculate',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      selectLanguage: 'Select Language',
      spanish: 'Español',
      english: 'English',
      syncData: 'Sync Data',
      syncDescription: 'Sync your data with fitness devices',
      syncNow: 'Sync Now',
      syncing: 'Syncing...',
      syncSuccess: 'Sync successful',
      syncError: 'Sync error',
      requestPermissions: 'Request Permissions',
      nutritionCalculator: 'Nutrition Calculator',
      calculateTargets: 'Calculate Targets',
      restDayConfig: 'Rest Day Configuration',
      restDayDescription: 'Configure your rest days',
      configure: 'Configure',
      steps: 'Steps',
      activeMinutes: 'Active minutes',
      heartRate: 'Heart rate',
      distance: 'Distance',
      lastSync: 'Last sync',
      fitnessDataTitle: 'Today\'s Fitness Data',
      enableRestDays: 'Enable rest days',
      selectDays: 'Select days',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      reduceCalories: 'Reduce calories on rest days',
      calorieReduction: 'Calorie reduction',
      applied: 'Applied',
      syncWithDevice: 'Sync with device',
      permissionsNeeded: 'Permissions needed to sync',
      donate: 'Donate',
      supportApp: 'Support the app',
      donateTitle: 'Support ProFitness',
      donateDescription: 'Your support helps us keep the app free and constantly improving',
      donateAmount: 'Select amount',
      donateMessage: 'Optional message',
      donateSuccess: 'Donation completed successfully',
      donateError: 'Error processing donation',
      thankYou: 'Thank you for your support',
      donate5: '$5 - Coffee',
      donate10: '$10 - Lunch',
      donate20: '$20 - Dinner',
      donateCustom: 'Custom amount',
      processing: 'Processing...'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.es;

  const handleSyncFitnessData = async () => {
    setSyncStatus('syncing');
    setSyncMessage(t.syncing);

    try {
      // Verificar si hay permisos
      if (!fitnessSync.hasPermissions()) {
        const permissionGranted = await fitnessSync.requestFitnessPermissions();
        if (!permissionGranted) {
          setSyncStatus('error');
          setSyncMessage(t.permissionsNeeded);
          return;
        }
      }

      // Sincronizar datos usando fecha del dispositivo
      try {
        const today = deviceTime.getCurrentDate();
        const syncResult = await fitnessSync.syncFitnessData(today);

        if (syncResult.success && syncResult.data) {
          setFitnessData(syncResult.data);
          setSyncStatus('success');
          setSyncMessage(t.syncSuccess);

          // Actualizar perfil con datos sincronizados
          const updatedProfile = {
            ...userProfile,
            lastSyncTime: deviceTime.createTimestamp(), // Usar timestamp del dispositivo
            syncEnabled: true
          };
          setUserProfile(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        } else {
          setSyncStatus('error');
          setSyncMessage(syncResult.error || t.syncError);
        }
      } catch (error) {
        console.warn('Error en sincronización con fecha del dispositivo, intentando fallback:', error);
        // Fallback seguro
        const fallbackToday = new Date().toISOString().split('T')[0];
        const syncResult = await fitnessSync.syncFitnessData(fallbackToday);

        if (syncResult.success && syncResult.data) {
          setFitnessData(syncResult.data);
          setSyncStatus('success');
          setSyncMessage(t.syncSuccess);
        } else {
          setSyncStatus('error');
          setSyncMessage(syncResult.error || t.syncError);
        }
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(t.syncError);
    }

    // Resetear estado después de 3 segundos
    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 3000);
  };

  const handleCalculateNutrition = () => {
    if (!editProfile.age || !editProfile.weight || !editProfile.height) {
      alert('Por favor completa tu información personal primero');
      return;
    }

    const targets = NutritionCalculator.calculateNutritionTargets({
      age: editProfile.age,
      weight: editProfile.weight,
      height: editProfile.height,
      gender: editProfile.gender || 'male',
      activityLevel: editProfile.activityLevel || 'moderate',
      workActivity: editProfile.workActivity || 'moderate',
      goal: editProfile.goal || 'maintain'
    });

    setCalculatorData(targets);

    // Actualizar perfil automáticamente
    const updatedProfile = {
      ...userProfile,
      targetCalories: targets.targetCalories,
      targetProtein: targets.targetProtein,
      targetCarbs: targets.targetCarbs,
      targetFats: targets.targetFats,
      lastCalculation: new Date().toISOString()
    };

    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profileUpdated'));
    }

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #dcfce7;
      border: 1px solid #bbf7d0;
      color: #16a34a;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    successMessage.textContent = 'Objetivos calculados y guardados exitosamente';

    document.body.appendChild(successMessage);

    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        document.body.removeChild(successMessage);
      }
    }, 3000);
  };

  const handleRestDayConfig = () => {
    localStorage.setItem('restDaySettings', JSON.stringify(restDayConfig));

    // Aplicar configuración de descanso si es día de descanso
    try {
      // Usar detección de día de la semana del dispositivo de forma segura
      const timezone = deviceTime.getTimezone();
      const locale = deviceTime.getLocale();

      const today = new Date().toLocaleDateString(locale, {
        weekday: 'long',
        timeZone: timezone
      });
      const todayKey = getDayKey(today);

      if (restDayConfig.enabled && restDayConfig.selectedDays.includes(todayKey)) {
        // Aplicar reducción de calorías si está habilitada
        if (restDayConfig.reducedCalories) {
          const updatedProfile = {
            ...userProfile,
            restDayActive: true,
            adjustedCalories: (userProfile.targetCalories || 2000) - restDayConfig.calorieReduction
          };
          setUserProfile(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }
      }
    } catch (error) {
      console.warn('Error aplicando configuración de día de descanso:', error);
      // Continuar sin aplicar configuración específica si hay error
    }
  };

  const getDayKey = (dayName: string): string => {
    const dayMap: { [key: string]: string } = {
      'lunes': 'monday',
      'martes': 'tuesday',
      'miércoles': 'wednesday',
      'jueves': 'thursday',
      'viernes': 'friday',
      'sábado': 'saturday',
      'domingo': 'sunday'
    };
    return dayMap[dayName.toLowerCase()] || dayName;
  };

  const toggleRestDay = (day: string) => {
    const newSelectedDays = restDayConfig.selectedDays.includes(day)
      ? restDayConfig.selectedDays.filter(d => d !== day)
      : [...restDayConfig.selectedDays, day];

    setRestDayConfig({
      ...restDayConfig,
      selectedDays: newSelectedDays
    });
  };

  const handleSaveProfile = async () => {
    try {
       let updatedProfile;

      if (editProfile.autoCalculate && editProfile.age && editProfile.weight && editProfile.height) {
        const targets = NutritionCalculator.calculateNutritionTargets({
          age: editProfile.age,
          weight: editProfile.weight,
          height: editProfile.height,
          gender: editProfile.gender || 'male',
          activityLevel: editProfile.activityLevel || 'moderate',
          workActivity: editProfile.workActivity || 'moderate',
          goal: editProfile.goal || 'maintain'
        });

        updatedProfile = {
          ...editProfile,
          targetCalories: targets.targetCalories,
          targetProtein: targets.targetProtein,
          targetCarbs: targets.targetCarbs,
          targetFats: targets.targetFats
        };
    } else {
      updatedProfile = editProfile;
    }

        // Guardar en Supabase
        await saveProfileToSupabase(updatedProfile);
        
        // También guardar en localStorage para compatibilidad
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      
    setShowEditModal(false);
    setUserProfile(updatedProfile);
      if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('profileUpdated'));
    }
  } catch (error) {
    console.log('Error saving profile:', error);
  }
};
  
  const handleLanguageChange = async (newLanguage: string) => {
    const updatedProfile = { ...userProfile, language: newLanguage };
    
    try {
      // Guardar en Supabase
      await saveProfileToSupabase(updatedProfile);
      
      // También guardar en localStorage para compatibilidad
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      setUserProfile(updatedProfile);
      setLanguage(newLanguage);
      setShowLanguageModal(false);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (error) {
      console.error('Error cambiando idioma:', error);
    }
  };

  const handleLogout = () => {
    try {
      const userData = localStorage.getItem('userData');
      const userProfile = localStorage.getItem('userProfile');
      const userProfilePhoto = localStorage.getItem('userProfilePhoto');

      if (userData) {
        const user = JSON.parse(userData);
        const userEmail = user.email;
        const userKey = `user_${userEmail}`;

        const nutritionData: { [key: string]: string } = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('nutrition_')) {
            const value = localStorage.getItem(key);
            if (value) {
              nutritionData[key] = value;
            }
          }
        }

        const restDaySettings = localStorage.getItem('restDaySettings');
        const hydrationReminder = localStorage.getItem('hydrationReminder');
        const healthData = localStorage.getItem('healthData');

        const userBackup = {
          userData: user,
          userProfile: userProfile ? JSON.parse(userProfile) : null,
          userProfilePhoto: userProfilePhoto,
          nutritionData: nutritionData,
          restDaySettings: restDaySettings,
          hydrationReminder: hydrationReminder,
          healthData: healthData,
          lastLogin: new Date().toISOString(),
          lastLogout: new Date().toISOString()
        };

        localStorage.setItem(userKey, JSON.stringify(userBackup));
      }
    } catch (error) {
      console.error('Error al guardar datos antes del logout:', error);
    }

    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userProfilePhoto');

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('nutrition_') || key === 'restDaySettings' || key === 'hydrationReminder' || key === 'healthData')) {
        localStorage.removeItem(key);
      }
    }

    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'lose':
        return t.goalLose;
      case 'maintain':
        return t.goalMaintain;
      case 'muscle':
        return t.goalMuscle;
      default:
        return t.goalMaintain;
    }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'lose':
        return 'ri-arrow-down-line';
      case 'maintain':
        return 'ri-pause-line';
      case 'muscle':
        return 'ri-building-line';
      default:
        return 'ri-pause-line';
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'lose':
        return '#ef4444';
      case 'maintain':
        return '#3b82f6';
      case 'muscle':
        return '#16a34a';
      default:
        return '#3b82f6';
    }
  };

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: '#3b82f6' };
    if (bmi < 25) return { category: 'Normal', color: '#10b981' };
    if (bmi < 30) return { category: 'Sobrepeso', color: '#f59e0b' };
    return { category: 'Obesidad', color: '#ef4444' };
  };

  const getBMIRecommendations = (bmi: number) => {
    if (bmi < 18.5) {
      return [
        'Considera aumentar la ingesta calórica',
        'Incluye ejercicios de fuerza',
        'Consulta con un nutricionista',
        'Monitorea tu progreso regularmente'
      ];
    }
    if (bmi < 25) {
      return [
        'Mantén tus hábitos actuales',
        'Continúa con ejercicio regular',
        'Mantén una dieta equilibrada',
        'Revisa tus objetivos periódicamente'
      ];
    }
    if (bmi < 30) {
      return [
        'Considera crear un déficit calórico',
        'Aumenta la actividad física',
        'Reduce porciones gradualmente',
        'Incluye más verduras y proteínas'
      ];
    }
    return [
      'Consulta con un profesional de salud',
      'Crea un plan de pérdida de peso',
      'Prioriza ejercicio cardiovascular',
      'Considera apoyo nutricional especializado'
    ];
  };

  const handleDonate = async () => {
    setDonateStatus('processing');

    try {
      // Simulamos proceso de donación
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aquí integrarías con tu pasarela de pagos preferida
      // Por ejemplo: PayPal, Stripe, Mercado Pago, etc.

      setDonateStatus('success');

      // Mostrar mensaje de agradecimiento
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        border: 2px solid #16a34a;
        border-radius: 16px;
        padding: 24px;
        z-index: 3000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        text-align: center;
        max-width: 300px;
        width: 90%;
      `;
      successMessage.innerHTML = `
        <div style="width: 64px; height: 64px; background: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <i class="ri-heart-fill" style="color: white; font-size: 28px;"></i>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #15803d; margin: 0 0 8px 0;">${t.thankYou}</h3>
        <p style="font-size: 14px; color: #16a34a; margin: 0;">Tu apoyo significa mucho para nosotros</p>
      `;

      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
        setShowDonateModal(false);
        setDonateStatus('idle');
        setDonateAmount(5);
        setDonateMessage('');
      }, 3000);

    } catch (error) {
      setDonateStatus('error');
      setTimeout(() => {
        setDonateStatus('idle');
      }, 3000);
    }
  };

  const handlePatreonDonate = () => {
    // Redirigir a tu página de Patreon
    const patreonUrl = 'https://www.patreon.com/IvanPareja'; // Reemplaza con tu URL de Patreon
    window.open(patreonUrl, '_blank', 'noopener,noreferrer');

    // Cerrar el modal de donación
    setShowDonateModal(false);

    // Mostrar mensaje de agradecimiento
    const thankYouMessage = document.createElement('div');
    thankYouMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #f59e0b;
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
    thankYouMessage.innerHTML = `
      <div style="width: 24px; height: 24px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <i class="ri-external-link-line" style="color: white; font-size: 14px;"></i>
      </div>
      <div>
        <p style="font-size: 14px; font-weight: 600; color: #92400e; margin: 0;">Redirigiendo a Patreon</p>
        <p style="font-size: 12px; color: #f59e0b; margin: 0;">¡Gracias por considerar apoyarnos!</p>
      </div>
    `;

    document.body.appendChild(thankYouMessage);

    setTimeout(() => {
      if (document.body.contains(thankYouMessage)) {
        document.body.removeChild(thankYouMessage);
      }
    }, 4000);
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
        }}><style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 16px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0
        }}>
          {t.profile}
        </h1>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '24px 16px 100px 16px'
      }}>
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
            width: '80px',
            height: '80px',
            background: userData?.picture ? `url(${userData.picture})` : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            {!userData?.picture && (
              <span style={{
                color: 'white',
                fontWeight: '600',
                fontSize: '24px'
              }}>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            {userData?.name || 'Usuario'}
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0 0 16px 0'
          }}>
            {userData?.email || 'usuario@email.com'}
          </p>
          <button
            onClick={() => setShowEditModal(true)}
            className="!rounded-button"
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {t.edit}
          </button>
        </div>

        {/* Fitness Data Card */}
        {fitnessData && (
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
              margin: '0 0 16px 0'
            }}>
              {t.fitnessDataTitle}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: '#f0f9ff',
                borderRadius: '12px'
              }}>
                <i className="ri-walk-line" style={{ fontSize: '24px', color: '#3b82f6', marginBottom: '8px' }}></i>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {fitnessData.steps.toLocaleString()}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {t.steps}
                </p>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: '12px'
              }}>
                <i className="ri-time-line" style={{ fontSize: '24px', color: '#16a34a', marginBottom: '8px' }}></i>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {fitnessData.activeMinutes}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {t.activeMinutes}
                </p>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: '#fef3c7',
                borderRadius: '12px'
              }}>
                <i className="ri-heart-pulse-line" style={{ fontSize: '24px', color: '#f59e0b', marginBottom: '8px' }}></i>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {fitnessData.heartRate}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {t.heartRate}
                </p>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: '#fef2f2',
                borderRadius: '12px'
              }}>
                <i className="ri-road-map-line" style={{ fontSize: '24px', color: '#ef4444', marginBottom: '8px' }}></i>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {fitnessData.distance} km
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {t.distance}
                </p>
              </div>
            </div>
            {userProfile.lastSyncTime && (
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center',
                marginTop: '16px',
                margin: '16px 0 0 0'
              }}>
                {t.lastSync}: {(() => {
                  try {
                    return deviceTime.formatTimestamp(userProfile.lastSyncTime, {
                      includeDate: true,
                      includeTime: true,
                      dateOptions: { format: 'short' },
                      timeOptions: { use24Hour: true }
                    });
                  } catch (error) {
                    // Fallback seguro
                    return new Date(userProfile.lastSyncTime).toLocaleString();
                  }
                })()}
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
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
            margin: '0 0 16px 0'
          }}>
            {t.quickActions}
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%'
          }}>
            <button
              onClick={() => setShowLanguageModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: '#f0f9ff',
                border: '1px solid #e0e7ff',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="ri-translate-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.language}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.changeLanguage}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowSyncModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: syncStatus === 'syncing' ? '#fef3c7' : syncStatus === 'success' ? '#f0fdf4' : syncStatus === 'error' ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${syncStatus === 'syncing' ? '#fde68a' : syncStatus === 'success' ? '#dcfce7' : syncStatus === 'error' ? '#fecaca' : '#dcfce7'}`,
                borderRadius: '12px',
                cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%',
                opacity: syncStatus === 'syncing' ? 0.7 : 1
              }}
              disabled={syncStatus === 'syncing'}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: syncStatus === 'syncing' ? '#f59e0b' : syncStatus === 'success' ? '#16a34a' : syncStatus === 'error' ? '#ef4444' : '#16a34a',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className={`ri-${syncStatus === 'syncing' ? 'loader-4-line' : syncStatus === 'success' ? 'check-line' : syncStatus === 'error' ? 'error-warning-line' : 'refresh-line'}`} style={{
                  color: 'white',
                  fontSize: '18px',
                  animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none'
                }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.sync}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {syncMessage || t.fitnessData}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowCalculatorModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="ri-calculator-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.calculator}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.nutritionTargets}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowRestDayModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="ri-pause-circle-line" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.rest}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.configureRest}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowDonateModal(true)}
              className="!rounded-button"
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '65px',
                width: '100%'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <i className="ri-heart-fill" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <div style={{
                textAlign: 'left',
                flex: 1,
                minWidth: 0
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  margin: '0 0 2px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.donate}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {t.supportApp}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Profile Info */}
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
            margin: '0 0 16px 0'
          }}>
            {t.personalInfo}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.age}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.age || '-'} años
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.height}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.height || '-'} cm
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.weight}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.weight || '-'} kg
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.activity}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.activityLevel || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* IMC Section */}
        {userProfile.weight && userProfile.height && (
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
              margin: '0 0 16px 0'
            }}>
              Índice de Masa Corporal (IMC)
            </h3>

            {(() => {
              const weight = parseFloat(userProfile.weight);
              const height = parseFloat(userProfile.height);
              const bmi = calculateBMI(weight, height);
              const bmiCategory = getBMICategory(bmi);
              const recommendations = getBMIRecommendations(bmi);

              return (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: `conic-gradient(${bmiCategory.color} ${Math.min(bmi / 40 * 360, 360)}deg, #f3f4f6 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#1f2937'
                        }}>
                          {bmi.toFixed(1)}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          kg/m²
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: bmiCategory.color
                    }}></div>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: bmiCategory.color
                    }}>
                      {bmiCategory.category}
                    </span>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      Rangos de IMC:
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      fontSize: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#3b82f6'
                        }}></div>
                        <span>Bajo peso: &lt;18.5</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#10b981'
                        }}></div>
                        <span>Normal: 18.5-24.9</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#f59e0b'
                        }}></div>
                        <span>Sobrepeso: 25-29.9</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444'
                        }}></div>
                        <span>Obesidad: ≥30</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#f0f9ff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e0e7ff'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <i className="ri-lightbulb-line" style={{ color: '#3b82f6' }}></i>
                      Recomendaciones:
                    </h4>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '16px',
                      fontSize: '12px',
                      color: '#374151'
                    }}>
                      {recommendations.map((recommendation, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Goal Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              {t.goal}
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => setShowEditModal(true)}
                className="!rounded-button"
                style={{
                  padding: '6px 12px',
                  background: '#f0f9ff',
                  border: '1px solid #e0e7ff',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {t.edit}
              </button>
              <button
                onClick={handleCalculateNutrition}
                className="!rounded-button"
                style={{
                  padding: '6px 12px',
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Calcular Objetivos
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: `2px solid ${getGoalColor(userProfile.goal || 'maintain')}`
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: getGoalColor(userProfile.goal || 'maintain'),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className={getGoalIcon(userProfile.goal || 'maintain')} style={{
                color: 'white',
                fontSize: '20px'
              }}></i>
            </div>
            <div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 2px 0'
              }}>
                {getGoalText(userProfile.goal || 'maintain')}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                Objetivo actual seleccionado
              </p>
            </div>
          </div>
        </div>

        {/* Nutrition Goals */}
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
            margin: '0 0 16px 0'
          }}>
            {t.nutritionGoals}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.calories}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.adjustedCalories || userProfile.targetCalories || 2000}
                {userProfile.restDayActive && (
                  <span style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginLeft: '4px'
                  }}>
                    ({t.applied})
                  </span>
                )}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.protein}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.targetProtein || 120}g
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.carbs}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.targetCarbs || 250}g
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '0 0 4px 0'
              }}>
                {t.fats}
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                margin: 0
              }}>
                {userProfile.targetFats || 67}g
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="!rounded-button"
          style={{
            width: '100%',
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <i className="ri-logout-circle-line"></i>
          {t.logout}
        </button>
      </main>

      {/* Language Modal */}
      {showLanguageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '320px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.selectLanguage}
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <button
                onClick={() => handleLanguageChange('es')}
                className="!rounded-button"
                style={{
                  padding: '12px 16px',
                  background: language === 'es' ? '#3b82f6' : '#f8fafc',
                  color: language === 'es' ? 'white' : '#1f2937',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {t.spanish}
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className="!rounded-button"
                style={{
                  padding: '12px 16px',
                  background: language === 'en' ? '#3b82f6' : '#f8fafc',
                  color: language === 'en' ? 'white' : '#1f2937',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {t.english}
              </button>
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="!rounded-button"
              style={{
                width: '100%',
                padding: '12px',
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#6b7280',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0'
            }}>
              {t.edit} {t.profile}
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.name}
                </label>
                <input
                  type="text"
                  value={editProfile.name || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.age}
                </label>
                <input
                  type="number"
                  value={editProfile.age || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.weight} (kg)
                </label>
                <input
                  type="number"
                  value={editProfile.weight || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, weight: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.height} (cm)
                </label>
                <input
                  type="number"
                  value={editProfile.height || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, height: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.activity}
                </label>
                <select
                  value={editProfile.activityLevel || 'moderate'}
                  onChange={(e) => setEditProfile({ ...editProfile, activityLevel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="sedentary">Sedentario</option>
                  <option value="light">Ligero</option>
                  <option value="moderate">Moderado</option>
                  <option value="active">Activo</option>
                  <option value="very-active">Muy activo</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  {t.goal}
                </label>
                <select
                  value={editProfile.goal || 'maintain'}
                  onChange={(e) => setEditProfile({ ...editProfile, goal: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="lose">{t.goalLose}</option>
                  <option value="maintain">{t.goalMaintain}</option>
                  <option value="muscle">{t.goalMuscle}</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <input
                  type="checkbox"
                  id="autoCalculate"
                  checked={editProfile.autoCalculate || false}
                  onChange={(e) => setEditProfile({ ...editProfile, autoCalculate: e.target.checked })}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <label
                  htmlFor="autoCalculate"
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  {t.autoCalculate}
                </label>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="!rounded-button"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '320px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.syncData}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              {t.syncDescription}
            </p>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowSyncModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  setShowSyncModal(false);
                  handleSyncFitnessData();
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#16a34a',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {t.syncNow}
              </button>
            </div>
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
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.nutritionCalculator}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              Calcula tus objetivos nutricionales basados en tu perfil
            </p>

            {calculatorData && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 12px 0'
                }}>
                  Objetivos Calculados:
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px 0' }}>Calorías:</p>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                      {calculatorData.targetCalories}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px 0' }}>Proteínas:</p>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                      {calculatorData.targetProtein}g
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px 0' }}>Carbohidratos:</p>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                      {calculatorData.targetCarbs}g
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px 0' }}>Grasas:</p>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                      {calculatorData.targetFats}g
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowCalculatorModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  handleCalculateNutrition();
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {t.calculateTargets}
              </button>
            </div>
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
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 16px 0'
            }}>
              {t.restDayConfig}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              {t.restDayDescription}
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <input
                  type="checkbox"
                  id="enableRestDays"
                  checked={restDayConfig.enabled}
                  onChange={(e) => setRestDayConfig({ ...restDayConfig, enabled: e.target.checked })}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <label
                  htmlFor="enableRestDays"
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  {t.enableRestDays}
                </label>
              </div>

              {restDayConfig.enabled && (
                <>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      {t.selectDays}:
                    </p>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px'
                    }}>
                      {[[ 'monday', t.monday], [ 'tuesday', t.tuesday], [ 'wednesday', t.wednesday], [ 'thursday', t.thursday], [ 'friday', t.friday], [ 'saturday', t.saturday], [ 'sunday', t.sunday]].map(([ day, dayText]) => (
                        <button
                          key={day}
                          onClick={() => toggleRestDay(day)}
                          className="!rounded-button"
                          style={{
                            padding: '8px 12px',
                            background: restDayConfig.selectedDays.includes(day) ? '#ef4444' : '#f8fafc',
                            color: restDayConfig.selectedDays.includes(day) ? 'white' : '#374151',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {dayText}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <input
                      type="checkbox"
                      id="reduceCalories"
                      checked={restDayConfig.reducedCalories}
                      onChange={(e) => setRestDayConfig({ ...restDayConfig, reducedCalories: e.target.checked })}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <label
                      htmlFor="reduceCalories"
                      style={{
                        fontSize: '14px',
                        color: '#374151',
                        cursor: 'pointer'
                      }}
                    >
                      {t.reduceCalories}
                    </label>
                  </div>

                  {restDayConfig.reducedCalories && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        {t.calorieReduction}:
                      </label>
                      <input
                        type="number"
                        value={restDayConfig.calorieReduction}
                        onChange={(e) => setRestDayConfig({ ...restDayConfig, calorieReduction: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="500"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowRestDayModal(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  handleRestDayConfig();
                  setShowRestDayModal(false);
                }}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {t.configure}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #ff424d 0%, #ff6154 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <i className="ri-heart-fill" style={{ color: 'white', fontSize: '28px' }}></i>
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                {t.donateTitle}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {t.donateDescription}
              </p>
            </div>

            {/* Solo Patreon Option */}
            <div style={{
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #ff424d 0%, #ff6154 100%)',
                borderRadius: '16px',
                border: '3px solid #ff424d',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 6px 20px rgba(255, 66, 77, 0.3)'
              }}
                onClick={handlePatreonDonate}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 66, 77, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 66, 77, 0.3)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    <i className="ri-heart-3-fill" style={{ color: 'white', fontSize: '28px' }}></i>
                  </div>
                  <div style={{
                    flex: 1
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'white',
                      margin: '0 0 4px 0'
                    }}>
                      Apóyanos en Patreon
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.9)',
                      margin: 0
                    }}>
                      Suscríbete para apoyo continuo
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'white'
                  }}>
                    <i className="ri-external-link-line" style={{ fontSize: '18px' }}></i>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  padding: '12px 16px'
                }}>
                  <h5 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 8px 0'
                  }}>
                    Beneficios exclusivos:
                  </h5>
                  <ul style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.95)',
                    margin: 0,
                    paddingLeft: '16px',
                    lineHeight: '1.4'
                  }}>
                    <li>Acceso anticipado a nuevas funciones</li>
                    <li>Contenido exclusivo y tips de fitness</li>
                    <li>Soporte prioritario</li>
                    <li>Comunidad privada de miembros</li>
                  </ul>
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                marginTop: '16px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  Tu apoyo nos ayuda a:
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#374151',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Mantener la app gratuita • Agregar nuevas funciones • Mejorar la experiencia
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowDonateModal(false)}
                className="!rounded-button"
                style={{
                  padding: '12px 24px',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}


// Merged code
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

    // Check if we are on the client-side before accessing localStorage
    if (typeof window === 'undefined') return;

    // Verify authentication
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

    // Listen for fitness updates
    const handleFitnessUpdate = (event: CustomEvent) => {
      setFitnessData(event.detail);
    };

    window.addEventListener('fitnessDataUpdated', handleFitnessUpdate as EventListener);

    return () => {
      window.removeEventListener('fitnessDataUpdated', handleFitnessUpdate as EventListener);
    };
  }, [router]);

  const loadUserData = () => {
    if (typeof window === 'undefined') return;

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
    if (typeof window === 'undefined') return;

    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setTempProfile(profile);
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    } else {
      // Create an initial profile if none exists
      const initialProfile: UserProfile = {
        name: userData?.name || '',
        email: userData?.email || '',
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
    if (typeof window === 'undefined') return;

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
    if (typeof window === 'undefined') return;

    const savedPhoto = localStorage.getItem('userProfilePhoto');
    if (savedPhoto) {
      setUserProfilePhoto(savedPhoto);
    } else if (userData?.picture) {
      setUserProfilePhoto(userData.picture);
    }
  };

  const loadFitnessData = () => {
    if (typeof window === 'undefined') return;

    const today = new Date().toISOString().split('T')[0];
    const data = fitnessSync.getFitnessData(today);
    setFitnessData(data);
  };

  const handleSaveProfile = () => {
    if (typeof window === 'undefined') return;

    let updatedProfile = {
      ...tempProfile,
      name: tempProfile.name || userData?.name || '',
      email: tempProfile.email || userData?.email || ''
    };

    // Automatically calculate if enabled
    if (updatedProfile.autoCalculate && updatedProfile.age && updatedProfile.weight && updatedProfile.height) {
      const calculator = new NutritionCalculator();
      const targets = calculator.calculateTargets({
        age: parseInt(updatedProfile.age),
        weight: parseFloat(updatedProfile.weight),
        height: parseFloat(updatedProfile.height),
        gender: updatedProfile.gender,
        activityLevel: updatedProfile.activityLevel,
        goal: updatedProfile.goal
      });

      if (targets) {
        updatedProfile = { ...updatedProfile, ...targets };
      }
    }

    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setShowEditModal(false);

    // Dispatch event to update other components
    window.dispatchEvent(new Event('profileUpdated'));

    // Show success message
    if (updatedProfile.autoCalculate) {
      showSuccessMessage('Perfil actualizado y objetivos recalculados automáticamente');
    } else {
      showSuccessMessage('Perfil actualizado correctamente');
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (typeof window === 'undefined') return;

    const updatedProfile = { ...userProfile, language: newLanguage };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setShowLanguageModal(false);

    // Dispatch event to update other components
    window.dispatchEvent(new Event('profileUpdated'));

    showSuccessMessage('Idioma actualizado correctamente');
  };

  const handleRestDayToggle = (enabled: boolean) => {
    if (typeof window === 'undefined') return;

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
    if (typeof window === 'undefined') return;

    try {
      // Create a full backup before logging out
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

      // Gather nutritional data from the last 30 days
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

      // Save user backup
      if (userData?.email) {
        const userBackupKey = `user_${userData.email}`;
        localStorage.setItem(userBackupKey, JSON.stringify(backupData));
      }

      // Clear session data
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userProfilePhoto');

      // Clear nutritional data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nutrition_') || key.startsWith('weight_')) {
          localStorage.removeItem(key);
        }
      });

      // Clear settings
      localStorage.removeItem('restDaySettings');
      localStorage.removeItem('hydrationReminder');
      localStorage.removeItem('healthData');

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      localStorage.clear();
      router.push('/login');
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof window === 'undefined') return;

    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validate size (max 5MB)
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
    if (typeof window === 'undefined') return;

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
}

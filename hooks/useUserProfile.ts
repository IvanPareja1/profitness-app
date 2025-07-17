
'use client';

import { useLocalStorage } from './useLocalStorage';
import { useEffect, useRef } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  height: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: string;
  goal: string;
  gender: string;
}

const defaultProfile: UserProfile = {
  name: 'María González',
  email: 'maria.gonzalez@email.com',
  age: 28,
  height: 165,
  currentWeight: 75.2,
  goalWeight: 68,
  activityLevel: 'moderate',
  goal: 'fat_loss',
  gender: 'female'
};

export function useUserProfile() {
  const [userProfile, setUserProfile, mounted] = useLocalStorage<UserProfile>('userProfile', defaultProfile);
  const [profilePhoto, setProfilePhoto] = useLocalStorage<string>('userProfilePhoto', '');
  const syncedRef = useRef(false);

  // Sincronizar con datos de Google si están disponibles
  useEffect(() => {
    if (mounted && !syncedRef.current) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const googleData = JSON.parse(userData);
          const needsUpdate = googleData.name !== userProfile.name || googleData.email !== userProfile.email;
          
          if (needsUpdate) {
            setUserProfile(prev => ({
              ...prev,
              name: googleData.name || prev.name,
              email: googleData.email || prev.email
            }));
          }
          
          if (googleData.picture && !profilePhoto) {
            setProfilePhoto(googleData.picture);
          }
          
          syncedRef.current = true;
        } catch (error) {
          console.error('Error parsing Google user data:', error);
          syncedRef.current = true;
        }
      } else {
        syncedRef.current = true;
      }
    }
  }, [mounted, userProfile.name, userProfile.email, profilePhoto, setUserProfile, setProfilePhoto]); 

  // Función para calcular calorías diarias
  const calculateDailyCalories = (profile: UserProfile) => {
    let bmr;
    if (profile.gender === 'male') {
      bmr = 10 * profile.currentWeight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.currentWeight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9
    };

    const tdee = bmr * (activityMultipliers[profile.activityLevel as keyof typeof activityMultipliers] || 1.55);

    switch (profile.goal) {
      case 'fat_loss':
        return Math.round(tdee - 500);
      case 'muscle_gain':
        return Math.round(tdee + 300);
      case 'recomposition':
        return Math.round(tdee - 200);
      case 'maintenance':
      default:
        return Math.round(tdee);
    }
  };

  // Función para calcular macronutrientes
  const calculateMacros = (totalCalories: number, goal: string, weight: number) => {
    let proteinGrams, carbsGrams, fatsGrams;

    switch (goal) {
      case 'fat_loss':
        proteinGrams = Math.round(weight * 2.2);
        fatsGrams = Math.round((totalCalories * 0.25) / 9);
        carbsGrams = Math.round((totalCalories - (proteinGrams * 4) - (fatsGrams * 9)) / 4);
        break;
      case 'muscle_gain':
        proteinGrams = Math.round(weight * 2.0);
        carbsGrams = Math.round((totalCalories * 0.45) / 4);
        fatsGrams = Math.round((totalCalories - (proteinGrams * 4) - (carbsGrams * 4)) / 9);
        break;
      case 'recomposition':
        proteinGrams = Math.round(weight * 2.4);
        fatsGrams = Math.round((totalCalories * 0.28) / 9);
        carbsGrams = Math.round((totalCalories - (proteinGrams * 4) - (fatsGrams * 9)) / 4);
        break;
      case 'maintenance':
      default:
        proteinGrams = Math.round(weight * 1.6);
        carbsGrams = Math.round((totalCalories * 0.40) / 4);
        fatsGrams = Math.round((totalCalories * 0.30) / 9);
        break;
    }

    return {
      protein: { target: proteinGrams },
      carbs: { target: carbsGrams },
      fats: { target: fatsGrams }
    };
  };

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...newProfile }));
  };

  const updateProfilePhoto = (photo: string) => {
    setProfilePhoto(photo);
  };

  const dailyCalories = calculateDailyCalories(userProfile);
  const dailyMacros = calculateMacros(dailyCalories, userProfile.goal, userProfile.currentWeight);

  return {
    userProfile,
    profilePhoto,
    mounted,
    updateProfile,
    updateProfilePhoto,
    dailyCalories,
    dailyMacros,
    setUserProfile,
    setProfilePhoto
  };
}

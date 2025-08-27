'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, callEdgeFunction, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ManualMacrosPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [macros, setMacros] = useState({
    target_calories: 2000,
    target_protein: 150,
    target_carbs: 200,
    target_fat: 70
  });
  const [autoMode, setAutoMode] = useState(true);
  const [profile, setProfile] = useState({
    age: 25,
    height: 165,
    weight: 65,
    gender: 'female',
    activity_level: 'moderate',
    goal: 'maintain'
  });
  const [cyclePhase, setCyclePhase] = useState('');
  const router = useRouter();

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (autoMode && profile.age && profile.height && profile.weight) {
      calculateAutoMacros();
    }
  }, [autoMode, profile, cyclePhase]);

  const initializeUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth');
        return;
      }
      setUser(currentUser);
      await loadUserData(currentUser.id);
    } catch (error) {
      console.error('Error initializing user:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      // Cargar perfil del usuario
      const response = await callEdgeFunction('user-profile', {
        action: 'get_profile',
        userId
      }, token);

      if (response.user) {
        const userData = response.user;
        setProfile({
          age: userData.age || 25,
          height: userData.height || 165,
          weight: userData.weight || 65,
          gender: userData.gender || 'female',
          activity_level: userData.activity_level || 'moderate',
          goal: userData.goal || 'maintain'
        });

        setMacros({
          target_calories: userData.target_calories || 2000,
          target_protein: userData.target_protein || 150,
          target_carbs: userData.target_carbs || 200,
          target_fat: userData.target_fat || 70
        });
      }

      // Cargar datos del ciclo menstrual si es mujer
      if (profile.gender === 'female') {
        await loadCyclePhase(userId);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadCyclePhase = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('menstrual_cycle')
        .select('*')
        .eq('user_id', userId)
        .eq('tracking_enabled', true)
        .single();

      if (data && data.last_period) {
        const lastPeriod = new Date(data.last_period);
        const today = new Date();
        const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod <= data.cycle_length) {
          if (daysSinceLastPeriod <= data.period_length) {
            setCyclePhase('menstrual');
          } else if (daysSinceLastPeriod <= 13) {
            setCyclePhase('follicular');
          } else if (daysSinceLastPeriod <= 17) {
            setCyclePhase('ovulation');
          } else {
            setCyclePhase('luteal');
          }
        }
      }
    } catch (error) {
      console.error('Error loading cycle phase:', error);
    }
  };

  const calculateAutoMacros = () => {
    // Cálculo de TMB (Tasa Metabólica Basal) usando Mifflin-St Jeor
    let bmr;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }

    // Factores de actividad
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    let tdee = bmr * activityFactors[profile.activity_level as keyof typeof activityFactors];

    // Ajustar según objetivo
    if (profile.goal === 'lose') {
      tdee *= 0.85; // Déficit del 15%
    } else if (profile.goal === 'gain') {
      tdee *= 1.15; // Superávit del 15%
    }

    // Ajustar según fase del ciclo menstrual para mujeres
    if (profile.gender === 'female' && cyclePhase) {
      switch (cyclePhase) {
        case 'menstrual':
          tdee *= 1.05; // Ligeramente más calorías durante la menstruación
          break;
        case 'luteal':
          tdee *= 1.08; // Más calorías en fase lútea
          break;
      }
    }

    // Calcular macronutrientes
    const calories = Math.round(tdee);
    const protein = Math.round(profile.weight * 2.2); // 2.2g por kg de peso
    const fat = Math.round(calories * 0.25 / 9); // 25% de calorías de grasas
    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    const carbs = Math.round((calories - proteinCalories - fatCalories) / 4);

    setMacros({
      target_calories: calories,
      target_protein: protein,
      target_carbs: carbs,
      target_fat: fat
    });
  };

  const handleMacroChange = (macro: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setMacros(prev => ({ ...prev, [macro]: numValue }));
  };

  const getPercentages = () => {
    const totalCalories = macros.target_calories;
    const proteinCals = macros.target_protein * 4;
    const carbCals = macros.target_carbs * 4;
    const fatCals = macros.target_fat * 9;
    
    return {
      protein: totalCalories > 0 ? Math.round((proteinCals / totalCalories) * 100) : 0,
      carbs: totalCalories > 0 ? Math.round((carbCals / totalCalories) * 100) : 0,
      fat: totalCalories > 0 ? Math.round((fatCals / totalCalories) * 100) : 0
    };
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setMessage('');

      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await callEdgeFunction('user-macros-manager', {
        action: 'update_macros',
        userId: user.id,
        macros: macros
      }, token);

      if (response.success) {
        setMessage('✓ Metas guardadas correctamente');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving macros:', error);
      setMessage('Error al guardar las metas. Intenta nuevamente.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getCyclePhaseInfo = () => {
    const phases = {
      menstrual: { name: 'Menstrual', color: 'text-red-500', icon: 'ri-drop-line', tip: 'Aumenta ligeramente las calorías y el hierro' },
      follicular: { name: 'Folicular', color: 'text-green-500', icon: 'ri-leaf-line', tip: 'Excelente momento para entrenar intenso' },
      ovulation: { name: 'Ovulación', color: 'text-yellow-500', icon: 'ri-sun-line', tip: 'Pico de energía, aprovecha para ejercicios de fuerza' },
      luteal: { name: 'Lútea', color: 'text-purple-500', icon: 'ri-moon-line', tip: 'Aumenta carbohidratos complejos y magnesio' }
    };
    
    return phases[cyclePhase as keyof typeof phases];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  const percentages = getPercentages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 glass z-20 safe-top">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Ajuste de Metas</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="pt-24 pb-24 px-4">
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-center font-medium ${
            message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Modo Automático/Manual */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Modo de Configuración</h2>
              <p className="text-sm text-gray-600">
                {autoMode ? 'Cálculo automático basado en tu perfil' : 'Configuración manual personalizada'}
              </p>
            </div>
            <button
              onClick={() => setAutoMode(!autoMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoMode ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {autoMode && (
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-green-500 mt-0.5"></i>
                <div className="text-sm text-green-700">
                  <p className="font-medium mb-1">Cálculo automático activado</p>
                  <p>Las metas se calculan usando tu perfil: {profile.age} años, {profile.height}cm, {profile.weight}kg, nivel {profile.activity_level}, objetivo {profile.goal}.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información del ciclo menstrual para mujeres */}
        {profile.gender === 'female' && cyclePhase && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Fase del Ciclo Menstrual</h2>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  getCyclePhaseInfo()?.color === 'text-red-500' ? 'bg-red-100' :
                  getCyclePhaseInfo()?.color === 'text-green-500' ? 'bg-green-100' :
                  getCyclePhaseInfo()?.color === 'text-yellow-500' ? 'bg-yellow-100' : 'bg-purple-100'
                }`}>
                  <i className={`${getCyclePhaseInfo()?.icon} ${getCyclePhaseInfo()?.color} text-lg`}></i>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Fase {getCyclePhaseInfo()?.name}</div>
                  <div className="text-sm text-gray-600">{getCyclePhaseInfo()?.tip}</div>
                </div>
              </div>
              <p className="text-xs text-purple-600">
                Las metas se ajustan automáticamente según tu fase del ciclo para optimizar tu bienestar.
              </p>
            </div>
          </div>
        )}

        {/* Metas de Calorías */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Meta Calórica Diaria</h2>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {macros.target_calories.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">calorías por día</div>
          </div>
          
          {!autoMode && (
            <div>
              <input
                type="range"
                min="1200"
                max="4000"
                step="50"
                value={macros.target_calories}
                onChange={(e) => handleMacroChange('target_calories', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1,200</span>
                <span>4,000</span>
              </div>
            </div>
          )}
        </div>

        {/* Macronutrientes */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Macronutrientes</h2>
          
          {/* Proteínas */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Proteínas</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{macros.target_protein}g</div>
                <div className="text-xs text-gray-500">{percentages.protein}%</div>
              </div>
            </div>
            {!autoMode && (
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={macros.target_protein}
                onChange={(e) => handleMacroChange('target_protein', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            )}
          </div>

          {/* Carbohidratos */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Carbohidratos</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{macros.target_carbs}g</div>
                <div className="text-xs text-gray-500">{percentages.carbs}%</div>
              </div>
            </div>
            {!autoMode && (
              <input
                type="range"
                min="50"
                max="400"
                step="5"
                value={macros.target_carbs}
                onChange={(e) => handleMacroChange('target_carbs', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            )}
          </div>

          {/* Grasas */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-gray-800">Grasas</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-600">{macros.target_fat}g</div>
                <div className="text-xs text-gray-500">{percentages.fat}%</div>
              </div>
            </div>
            {!autoMode && (
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={macros.target_fat}
                onChange={(e) => handleMacroChange('target_fat', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            )}
          </div>

          {/* Barra de distribución visual */}
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-700 mb-2">Distribución Visual</div>
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
              <div 
                className="bg-blue-500 transition-all duration-300"
                style={{ width: `${percentages.protein}%` }}
              ></div>
              <div 
                className="bg-green-500 transition-all duration-300"
                style={{ width: `${percentages.carbs}%` }}
              ></div>
              <div 
                className="bg-yellow-500 transition-all duration-300"
                style={{ width: `${percentages.fat}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recomendaciones Nutricionales</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-heart-line text-green-500 text-xs"></i>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium">Hidratación</p>
                <p>Consume al menos {Math.round(profile.weight * 35)}ml de agua por día (35ml por kg de peso corporal).</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-time-line text-blue-500 text-xs"></i>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium">Timing de Comidas</p>
                <p>Distribuye las comidas en 4-6 porciones durante el día para mantener estables los niveles de energía.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-leaf-line text-purple-500 text-xs"></i>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium">Calidad de Alimentos</p>
                <p>Prioriza alimentos enteros, mínimamente procesados y con alta densidad nutricional.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/50 safe-bottom">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2">
            <i className="ri-home-line nav-inactive text-lg"></i>
            <span className="text-xs nav-inactive mt-1">Inicio</span>
          </Link>

          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <i className="ri-restaurant-line nav-inactive text-lg"></i>
            <span className="text-xs nav-inactive mt-1">Comida</span>
          </Link>

          <Link href="/scan" className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center shadow-medium">
              <i className="ri-qr-scan-2-line text-white text-lg"></i>
            </div>
          </Link>

          <Link href="/reports" className="flex flex-col items-center justify-center py-2">
            <i className="ri-bar-chart-line nav-inactive text-lg"></i>
            <span className="text-xs nav-inactive mt-1">Reportes</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center justify-center py-2">
            <i className="ri-user-line nav-inactive text-lg"></i>
            <span className="text-xs nav-inactive mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
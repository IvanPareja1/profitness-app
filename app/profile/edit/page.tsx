
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: 25,
    height: 170,
    current_weight: 70,
    target_weight: 65,
    gender: 'other',
    activity_level: 'moderate',
    goal_type: 'lose_weight',
    allergies: '',
    medical_conditions: '',
    daily_calories_goal: 2100,
    daily_protein_goal: 105,
    daily_carbs_goal: 262,
    daily_fats_goal: 70
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadProfile();
    }
    setIsLoading(false);
  };

  const loadProfile = async () => {
    try {
      // Consultar directamente la tabla user_profiles
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && profileData) {
        setFormData({
          ...formData,
          ...profileData
        });
      } else if (error && error.code === 'PGRST116') {
        // Perfil no existe, usar datos del usuario de auth
        setFormData({
          ...formData,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          age: user.user_metadata?.age || 25,
          height: user.user_metadata?.height || 170,
          current_weight: user.user_metadata?.weight || 70,
          gender: user.user_metadata?.gender || 'other'
        });
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateMacroGoals = (calories: number, goalType: string) => {
    let proteinRatio, carbsRatio, fatsRatio;

    switch (goalType) {
      case 'gain_muscle':
        proteinRatio = 0.30; carbsRatio = 0.40; fatsRatio = 0.30;
        break;
      case 'lose_weight':
        proteinRatio = 0.35; carbsRatio = 0.35; fatsRatio = 0.30;
        break;
      default:
        proteinRatio = 0.25; carbsRatio = 0.50; fatsRatio = 0.25;
    }

    return {
      protein: Math.round((calories * proteinRatio) / 4),
      carbs: Math.round((calories * carbsRatio) / 4),
      fats: Math.round((calories * fatsRatio) / 9)
    };
  };

  const saveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Calcular metas de macronutrientes automáticamente
      const macros = calculateMacroGoals(formData.daily_calories_goal, formData.goal_type);

      const updatedData = {
        ...formData,
        id: user.id,
        daily_protein_goal: macros.protein,
        daily_carbs_goal: macros.carbs,
        daily_fats_goal: macros.fats
      };

      // Actualizar o crear perfil directamente
      const { data: savedProfile, error } = await supabase
        .from('user_profiles')
        .upsert(updatedData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      alert('✅ Perfil actualizado correctamente');
      setFormData(savedProfile);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar perfil. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const activityLevels = [
    { id: 'sedentary', name: 'Sedentario', desc: 'Poco o ningún ejercicio' },
    { id: 'light', name: 'Ligero', desc: 'Ejercicio ligero 1-3 días/semana' },
    { id: 'moderate', name: 'Moderado', desc: 'Ejercicio moderado 3-5 días/semana' },
    { id: 'active', name: 'Activo', desc: 'Ejercicio intenso 6-7 días/semana' },
    { id: 'very_active', name: 'Muy Activo', desc: 'Ejercicio muy intenso, trabajo físico' }
  ];

  const goalTypes = [
    { id: 'lose_weight', name: 'Perder Peso', desc: 'Reducir grasa corporal' },
    { id: 'maintain_weight', name: 'Mantener Peso', desc: 'Mantener peso actual' },
    { id: 'gain_muscle', name: 'Ganar Músculo', desc: 'Aumentar masa muscular' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-line text-pink-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-4">Para editar tu perfil necesitas una cuenta</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const bmi = formData.current_weight / Math.pow(formData.height / 100, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-gray-600 text-lg"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Editar Perfil</h1>
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="px-3 py-1 bg-pink-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 px-4">
        {/* Profile Photo */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {formData.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <button className="text-pink-600 text-sm font-medium">
              <i className="ri-camera-line mr-1"></i>
              Cambiar Foto
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Información Personal</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Information */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Información Física</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Peso actual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.current_weight}
                onChange={(e) => handleInputChange('current_weight', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Peso objetivo (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.target_weight}
              onChange={(e) => handleInputChange('target_weight', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="mt-4 p-4 bg-pink-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">IMC Actual</span>
              <span className="text-lg font-bold text-pink-600">
                {bmi.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((bmi / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Objetivos</h3>

          <div className="space-y-3 mb-4">
            {goalTypes.map((goal) => (
              <label key={goal.id} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="goalType"
                  value={goal.id}
                  checked={formData.goal_type === goal.id}
                  onChange={(e) => handleInputChange('goal_type', e.target.value)}
                  className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500 mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">{goal.name}</p>
                  <p className="text-sm text-gray-600">{goal.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta diaria de calorías</label>
            <input
              type="number"
              value={formData.daily_calories_goal}
              onChange={(e) => handleInputChange('daily_calories_goal', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Los macronutrientes se calcularán automáticamente</p>
          </div>
        </div>

        {/* Activity Level */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Nivel de Actividad</h3>

          <div className="space-y-3">
            {activityLevels.map((level) => (
              <label key={level.id} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="activityLevel"
                  value={level.id}
                  checked={formData.activity_level === level.id}
                  onChange={(e) => handleInputChange('activity_level', e.target.value)}
                  className="w-5 h-5 text-pink-600 border-gray-300 focus:ring-pink-500 mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">{level.name}</p>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Health Information */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Información de Salud</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alergias alimentarias</label>
              <textarea
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Ej: Nueces, mariscos, lactosa..."
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condiciones médicas</label>
              <textarea
                value={formData.medical_conditions}
                onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                placeholder="Ej: Diabetes, hipertensión..."
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent h-24 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-0 py-0">
        <div className="grid grid-cols-5 h-16">
          <Link href="/" className="flex flex-col items-center justify-center">
            <i className="ri-home-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Inicio</span>
          </Link>
          <Link href="/food" className="flex flex-col items-center justify-center">
            <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Comida</span>
          </Link>
          <Link href="/workout" className="flex flex-col items-center justify-center">
            <i className="ri-run-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Ejercicio</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center justify-center">
            <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
            <span className="text-xs text-gray-400 mt-1">Progreso</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center bg-pink-50">
            <i className="ri-user-fill text-pink-600 text-lg"></i>
            <span className="text-xs text-pink-600 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, callEdgeFunction, getCurrentUser, signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: 'female',
    activity_level: 'moderate',
    goal: 'maintain'
  });
  const [bmi, setBmi] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [cycleData, setCycleData] = useState({
    last_period: '',
    cycle_length: 28,
    period_length: 5,
    tracking_enabled: false
  });
  const [restDays, setRestDays] = useState([]);
  const [selectedRestDays, setSelectedRestDays] = useState([]);
  const router = useRouter();

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentario', description: 'Poco o ningún ejercicio' },
    { value: 'light', label: 'Ligero', description: 'Ejercicio ligero 1-3 días/semana' },
    { value: 'moderate', label: 'Moderado', description: 'Ejercicio moderado 3-5 días/semana' },
    { value: 'active', label: 'Activo', description: 'Ejercicio intenso 6-7 días/semana' },
    { value: 'very_active', label: 'Muy Activo', description: 'Ejercicio muy intenso, trabajo físico' }
  ];

  const goals = [
    { value: 'lose', label: 'Perder Peso', icon: 'ri-arrow-down-line', color: 'text-red-500' },
    { value: 'maintain', label: 'Mantener Peso', icon: 'ri-pause-line', color: 'text-blue-500' },
    { value: 'gain', label: 'Ganar Peso', icon: 'ri-arrow-up-line', color: 'text-green-500' }
  ];

  const weekDays = [
    { value: 'monday', label: 'Lun' },
    { value: 'tuesday', label: 'Mar' },
    { value: 'wednesday', label: 'Mié' },
    { value: 'thursday', label: 'Jue' },
    { value: 'friday', label: 'Vie' },
    { value: 'saturday', label: 'Sáb' },
    { value: 'sunday', label: 'Dom' }
  ];

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (profile.height && profile.weight) {
      const heightM = parseFloat(profile.height) / 100;
      const weightKg = parseFloat(profile.weight);
      const calculatedBmi = weightKg / (heightM * heightM);
      setBmi(isNaN(calculatedBmi) ? 0 : calculatedBmi);
    }
  }, [profile.height, profile.weight]);

  const initializeUser = async () => {
    try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push('/auth');
        return;
      }

      setUser(currentUser);

      if (currentUser) {
        await loadUserProfile(currentUser.id);
        await loadCycleData(currentUser.id);
        await loadRestDays(currentUser.id);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      setMessage('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await callEdgeFunction('user-profile', {
        action: 'get_profile',
        userId
      }, token);

      if (response.user) {
        setProfile({
          name: response.user.name || '',
          age: response.user.age?.toString() || '',
          height: response.user.height?.toString() || '',
          weight: response.user.weight?.toString() || '',
          gender: response.user.gender || 'female',
          activity_level: response.user.activity_level || 'moderate',
          goal: response.user.goal || 'maintain'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadCycleData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('menstrual_cycle')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data[0]) {
        setCycleData({
          last_period: data[0].last_period || '',
          cycle_length: data[0].cycle_length || 28,
          period_length: data[0].period_length || 5,
          tracking_enabled: data[0].tracking_enabled || false
        });
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  };

  const loadRestDays = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('rest_days')
        .select('*')
        .eq('user_id', userId);

      if (data) {
        setRestDays(data);
        setSelectedRestDays(data.map(day => day.day_of_week));
      }
    } catch (error) {
      console.error('Error loading rest days:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setMessage('');

      const token = (await supabase.auth.getSession()).data.session?.access_token;

      // Guardar perfil
      const response = await callEdgeFunction('user-profile', {
        action: 'update_profile',
        userId: user.id,
        profileData: {
          name: profile.name,
          age: parseInt(profile.age) || null,
          height: parseFloat(profile.height) || null,
          weight: parseFloat(profile.weight) || null,
          gender: profile.gender,
          activity_level: profile.activity_level,
          goal: profile.goal
        }
      }, token);

      // Guardar datos del ciclo menstrual si es mujer
      if (profile.gender === 'female') {
        await supabase
          .from('menstrual_cycle')
          .upsert({
            user_id: user.id,
            last_period: cycleData.last_period || null,
            cycle_length: cycleData.cycle_length,
            period_length: cycleData.period_length,
            tracking_enabled: cycleData.tracking_enabled
          }, {
            onConflict: 'user_id'
          });
      }

      // Guardar días de descanso
      await supabase
        .from('rest_days')
        .delete()
        .eq('user_id', user.id);

      if (selectedRestDays.length > 0) {
        const restDaysData = selectedRestDays.map(day => ({
          user_id: user.id,
          day_of_week: day
        }));

        await supabase
          .from('rest_days')
          .insert(restDaysData);
      }

      if (response.success) {
        setMessage('✓ Perfil guardado correctamente');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error al guardar. Intenta nuevamente.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleRestDay = (dayValue: string) => {
    setSelectedRestDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(day => day !== dayValue)
        : [...prev, dayValue]
    );
  };

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Bajo peso', color: 'text-blue-500' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-500' };
    return { text: 'Obesidad', color: 'text-red-500' };
  };

  const getNextPeriod = () => {
    if (!cycleData.last_period) return null;
    const lastPeriod = new Date(cycleData.last_period);
    const nextPeriod = new Date(lastPeriod.getTime() + (cycleData.cycle_length * 24 * 60 * 60 * 1000));
    return nextPeriod;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Mi Perfil</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="pt-20 pb-20 px-4">
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-center font-medium ${
            message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* User Info Section */}
        {user && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-fill text-green-500 text-xl"></i>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <div className="text-sm text-gray-500">Cuenta sincronizada</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({...profile, height: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="165"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="65"
                />
              </div>
            </div>

            {bmi > 0 && (
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Índice de Masa Corporal (IMC)</div>
                    <div className="text-2xl font-bold text-purple-600">{bmi.toFixed(1)}</div>
                  </div>
                  <div className={`font-medium ${getBmiCategory(bmi).color}`}>
                    {getBmiCategory(bmi).text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Objetivo</h2>
          <div className="grid grid-cols-3 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.value}
                onClick={() => setProfile({...profile, goal: goal.value})}
                className={`p-4 rounded-xl border-2 transition-all ${
                  profile.goal === goal.value
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 mx-auto mb-2 flex items-center justify-center ${
                  profile.goal === goal.value ? goal.color : 'text-gray-400'
                }`}>
                  <i className={`${goal.icon} text-xl`}></i>
                </div>
                <div className={`text-xs font-medium ${
                  profile.goal === goal.value ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {goal.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Nivel de Actividad</h2>
          <div className="space-y-3">
            {activityLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setProfile({...profile, activity_level: level.value})}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  profile.activity_level === level.value
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`font-medium ${
                  profile.activity_level === level.value ? 'text-purple-600' : 'text-gray-800'
                }`}>
                  {level.label}
                </div>
                <div className="text-sm text-gray-500 mt-1">{level.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rest Days */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Días de Descanso</h2>
          <p className="text-sm text-gray-600 mb-4">Selecciona los días que prefieres descansar del ejercicio</p>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleRestDay(day.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  selectedRestDays.includes(day.value)
                    ? 'border-blue-300 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <div className="font-medium text-sm">{day.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Menstrual Cycle Tracking - Solo para mujeres */}
        {profile.gender === 'female' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Seguimiento del Ciclo Menstrual</h2>
              <button
                onClick={() => setCycleData({...cycleData, tracking_enabled: !cycleData.tracking_enabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  cycleData.tracking_enabled ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    cycleData.tracking_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {cycleData.tracking_enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del último período
                  </label>
                  <input
                    type="date"
                    value={cycleData.last_period}
                    onChange={(e) => setCycleData({...cycleData, last_period: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración del ciclo (días)
                    </label>
                    <input
                      type="number"
                      value={cycleData.cycle_length}
                      onChange={(e) => setCycleData({...cycleData, cycle_length: parseInt(e.target.value) || 28})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      min="21"
                      max="35"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración del período (días)
                    </label>
                    <input
                      type="number"
                      value={cycleData.period_length}
                      onChange={(e) => setCycleData({...cycleData, period_length: parseInt(e.target.value) || 5})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      min="3"
                      max="8"
                    />
                  </div>
                </div>

                {getNextPeriod() && (
                  <div className="bg-pink-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <i className="ri-calendar-line text-pink-500"></i>
                      <div>
                        <div className="text-sm text-gray-600">Próximo período estimado</div>
                        <div className="font-semibold text-pink-600">
                          {getNextPeriod()?.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Inicio</span>
          </Link>

          <Link href="/nutrition" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Comida</span>
          </Link>

          <Link href="/scan" className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-qr-scan-2-line text-white text-lg"></i>
            </div>
          </Link>

          <Link href="/reports" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-bar-chart-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Reportes</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center justify-center py-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-fill text-purple-500 text-lg"></i>
            </div>
            <span className="text-xs text-purple-500 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth, supabase } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  full_name: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  goal_weight?: number;
  daily_calories?: number;
  avatar_url?: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    activeDays: 0,
    totalMeals: 0,
    totalExercises: 0,
    weightLost: 0
  });
  const [caloriesProgress, setCaloriesProgress] = useState(0);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    goal_weight: '',
    daily_calories: ''
  });
  
  // Usar useRef para trackear si ya hemos hecho fetch
  const hasFetchedProfile = useRef(false);
  const hasFetchedStats = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (hasFetchedProfile.current) return;
    hasFetchedProfile.current = true;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const profileData = {
          full_name: data.full_name || 'Usuario',
          email: data.email || user?.email || '',
          age: data.age,
          height: data.height,
          weight: data.weight,
          goal_weight: data.goal_weight,
          daily_calories: data.daily_calories,
          avatar_url: data.avatar_url
        };
        
        setProfile(profileData);
        
        // Inicializar formData con los valores del perfil
        setFormData({
          age: data.age?.toString() || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          goal_weight: data.goal_weight?.toString() || '',
          daily_calories: data.daily_calories?.toString() || '2200'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (hasFetchedStats.current || !profile) return;
    hasFetchedStats.current = true;
    
    try {
      // Obtener estadísticas de comidas (solo para hoy)
      const today = new Date().toISOString().split('T')[0];
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('id, created_at, calories')
        .eq('user_id', user?.id)
        .gte('created_at', today)
        .limit(100);

      if (mealsError) {
        console.error('Error fetching meals:', mealsError);
        return;
      }

      // Obtener estadísticas de ejercicios (con límite)
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, created_at')
        .eq('user_id', user?.id)
        .limit(100);

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        return;
      }

      // Calcular días activos
      const allDates = [
        ...(meals || []).map(m => m.created_at?.split('T')[0]),
        ...(exercises || []).map(e => e.created_at?.split('T')[0])
      ].filter(Boolean);
      
      const uniqueDates = new Set(allDates);

      // Calcular calorías consumidas hoy
      const todayCalories = meals?.reduce((total, meal) => total + (meal.calories || 0), 0) || 0;
      
      // Calcular progreso de calorías
      const dailyCaloriesGoal = profile?.daily_calories || 2200;
      const progress = dailyCaloriesGoal > 0 
        ? Math.min(100, Math.round((todayCalories / dailyCaloriesGoal) * 100))
        : 0;
      
      setCaloriesProgress(progress);
      
      setStats({
        activeDays: uniqueDates.size,
        totalMeals: meals?.length || 0,
        totalExercises: exercises?.length || 0,
        weightLost: profile?.weight && profile?.goal_weight 
          ? Math.max(0, profile.weight - profile.goal_weight) 
          : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user, profile]);

  const saveProfileData = async () => {
    setSaving(true);
    try {
      const updates = {
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        goal_weight: formData.goal_weight ? parseFloat(formData.goal_weight) : null,
        daily_calories: formData.daily_calories ? parseInt(formData.daily_calories) : 2200,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      // Actualizar el estado local del perfil
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setEditing(false);
      
      // Recargar estadísticas para reflejar los cambios
      hasFetchedStats.current = false;
      fetchStats();
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar los datos. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateSuggestedCalories = () => {
    if (!formData.weight || !formData.height || !formData.age) return 2200;
    
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    
    // Fórmula básica de Mifflin-St Jeor para calorías basales
    const basalCalories = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    
    // Multiplicador de actividad moderada (1.55)
    return Math.round(basalCalories * 1.55);
  };

  useEffect(() => {
    if (user && !hasFetchedProfile.current) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (user && profile && !hasFetchedStats.current) {
      fetchStats();
    }
  }, [user, profile, fetchStats]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateBMI = () => {
    if (profile?.weight && profile?.height) {
      const heightInMeters = profile.height / 100;
      return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const getRemainingWeight = () => {
    if (profile?.weight && profile?.goal_weight) {
      return Math.max(0, profile.weight - profile.goal_weight);
    }
    return 0;
  };

  const getCaloriesProgress = () => {
    return caloriesProgress;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">Perfil</h1>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-settings-line text-gray-600 text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        {/* User Profile */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xl font-bold">
                {getInitials(profile?.full_name || 'U')}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{profile?.full_name}</h2>
          <p className="text-gray-600 text-sm mb-4">{profile?.email}</p>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{stats.activeDays}</div>
              <div className="text-xs text-gray-500">días activo</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{getRemainingWeight().toFixed(1)}</div>
              <div className="text-xs text-gray-500">kg por perder</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{stats.totalExercises}</div>
              <div className="text-xs text-gray-500">entrenamientos</div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Mis objetivos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-trophy-line text-green-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Peso objetivo</div>
                  <div className="text-xs text-gray-500">
                    {profile?.goal_weight ? `${profile.goal_weight} kg` : 'No definido'}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600">
                {getRemainingWeight().toFixed(1)} kg restantes
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-fire-line text-blue-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">Calorías diarias</div>
                  <div className="text-xs text-gray-500">
                    {profile?.daily_calories ? `${profile.daily_calories} kcal` : '2,200 kcal'}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-blue-600">{getCaloriesProgress()}% hoy</div>
            </div>
          </div>
        </div>

        {/* Health Data */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Datos de salud</h3>
            {!editing ? (
              <button 
              onClick={() => navigate('/health-data')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-heart-line text-red-600 text-lg"></i>
                  <span className="text-gray-800 text-sm">Datos de salud</span>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400"></i>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setEditing(false);
                    // Restaurar valores originales
                    setFormData({
                      age: profile?.age?.toString() || '',
                      height: profile?.height?.toString() || '',
                      weight: profile?.weight?.toString() || '',
                      goal_weight: profile?.goal_weight?.toString() || '',
                      daily_calories: profile?.daily_calories?.toString() || '2200'
                    });
                  }}
                  className="text-gray-600 text-sm font-medium px-3 py-1 rounded border border-gray-300"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveProfileData}
                  disabled={saving}
                  className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line mr-1"></i>
                      Guardar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Edad */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              {editing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Edad"
                  className="w-full text-center text-lg font-bold text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="text-lg font-bold text-gray-800">
                  {profile?.age ? `${profile.age} años` : '--'}
                </div>
              )}
              <div className="text-xs text-gray-500">Edad</div>
            </div>

            {/* Altura */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              {editing ? (
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="Altura (cm)"
                  className="w-full text-center text-lg font-bold text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="text-lg font-bold text-gray-800">
                  {profile?.height ? `${profile.height} cm` : '--'}
                </div>
              )}
              <div className="text-xs text-gray-500">Altura</div>
            </div>

            {/* Peso actual */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              {editing ? (
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Peso (kg)"
                  className="w-full text-center text-lg font-bold text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="text-lg font-bold text-gray-800">
                  {profile?.weight ? `${profile.weight} kg` : '--'}
                </div>
              )}
              <div className="text-xs text-gray-500">Peso actual</div>
            </div>

            {/* Peso objetivo */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              {editing ? (
                <input
                  type="number"
                  step="0.1"
                  value={formData.goal_weight}
                  onChange={(e) => handleInputChange('goal_weight', e.target.value)}
                  placeholder="Meta (kg)"
                  className="w-full text-center text-lg font-bold text-gray-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="text-lg font-bold text-gray-800">
                  {profile?.goal_weight ? `${profile.goal_weight} kg` : '--'}
                </div>
              )}
              <div className="text-xs text-gray-500">Peso objetivo</div>
            </div>
          </div>

          {/* Calorías diarias sugeridas */}
          {editing && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-800 text-sm">
                    Calorías diarias sugeridas
                  </div>
                  <div className="text-xs text-blue-600">
                    Basado en tus datos
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-800">
                  {calculateSuggestedCalories()} kcal
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('daily_calories', calculateSuggestedCalories().toString())}
                className="mt-2 w-full bg-blue-600 text-white text-sm font-medium py-2 rounded flex items-center justify-center"
              >
                <i className="ri-magic-line mr-1"></i>
                Usar esta recomendación
              </button>
            </div>
          )}
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="space-y-1">
            {[
              { icon: 'ri-target-line', label: 'Mis metas y objetivos', color: 'text-purple-600', action: () => navigate('/goals') },
              { icon: 'ri-bar-chart-line', label: 'Estadísticas detalladas', color: 'text-blue-600' },
              { icon: 'ri-medal-line', label: 'Logros y medallas', color: 'text-yellow-600' },
              { icon: 'ri-heart-line', label: 'Datos de salud', color: 'text-red-600' },
              { icon: 'ri-notification-line', label: 'Notificaciones', color: 'text-purple-600' },
              { icon: 'ri-shield-check-line', label: 'Privacidad', color: 'text-green-600' },
              { icon: 'ri-question-line', label: 'Ayuda y soporte', color: 'text-gray-600' }
            ].map((item, index) => (
              <button 
                key={index} 
                onClick={item.action}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <i className={`${item.icon} ${item.color} text-lg`}></i>
                  <span className="text-gray-800 text-sm">{item.label}</span>
                </div>
                <i className="ri-arrow-right-s-line text-gray-400"></i>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleSignOut}
          className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <i className="ri-logout-box-line"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-white shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center space-y-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-dashboard-3-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Dashboard</span>
          </button>
          <button 
            onClick={() => navigate('/nutrition')}
            className="flex flex-col items-center justify-center space-y-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-restaurant-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Nutrición</span>
          </button>
          <button 
            onClick={() => navigate('/exercise')}
            className="flex flex-col items-center justify-center space-y-1"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-run-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400">Ejercicio</span>
          </button>
          <button className="flex flex-col items-center justify-center space-y-1 bg-purple-50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-fill text-purple-600 text-lg"></i>
            </div>
            <span className="text-xs text-purple-600 font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
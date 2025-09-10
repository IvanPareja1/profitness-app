import { useState, useEffect } from 'react';
import { useAuth, supabase } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HealthData {
  age: number | null;
  height: number | null;
  weight: number | null;
  goal_weight: number | null;
  goal_type: 'lose_weight' | 'gain_muscle' | 'maintenance';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  daily_calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export default function HealthDataForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<HealthData>({
    age: null,
    height: null,
    weight: null,
    goal_weight: null,
    goal_type: 'maintenance',
    activity_level: 'moderate',
    daily_calories: null,
    protein: null,
    carbs: null,
    fat: null
  });

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setFormData(prev => ({
          ...prev,
          age: data.age,
          height: data.height,
          weight: data.weight,
          goal_weight: data.goal_weight,
          goal_type: data.goal_type || 'maintenance',
          activity_level: data.activity_level || 'moderate',
          daily_calories: data.daily_calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMacros = () => {
    const { weight, goal_type, daily_calories } = formData;
    
    if (!daily_calories || !weight) return;

    let protein, carbs, fat;

    switch (goal_type) {
      case 'lose_weight':
        protein = Math.round(weight * 2.2); // 2.2g per kg for weight loss
        fat = Math.round((daily_calories * 0.25) / 9); // 25% calories from fat
        carbs = Math.round((daily_calories - (protein * 4) - (fat * 9)) / 4);
        break;
      
      case 'gain_muscle':
        protein = Math.round(weight * 2.5); // 2.5g per kg for muscle gain
        fat = Math.round((daily_calories * 0.25) / 9); // 25% calories from fat
        carbs = Math.round((daily_calories - (protein * 4) - (fat * 9)) / 4);
        break;
      
      case 'maintenance':
      default:
        protein = Math.round(weight * 1.8); // 1.8g per kg for maintenance
        fat = Math.round((daily_calories * 0.25) / 9); // 25% calories from fat
        carbs = Math.round((daily_calories - (protein * 4) - (fat * 9)) / 4);
        break;
    }

    setFormData(prev => ({
      ...prev,
      protein,
      carbs,
      fat
    }));
  };

  const calculateCalories = () => {
    const { age, height, weight, goal_type, activity_level } = formData;
    
    if (!age || !height || !weight) return;

    // Mifflin-St Jeor formula for BMR
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    let maintenanceCalories = Math.round(bmr * activityMultipliers[activity_level]);

    // Adjust for goal
    switch (goal_type) {
      case 'lose_weight':
        maintenanceCalories -= 500; // Deficit for weight loss
        break;
      case 'gain_muscle':
        maintenanceCalories += 300; // Surplus for muscle gain
        break;
    }

    setFormData(prev => ({
      ...prev,
      daily_calories: maintenanceCalories
    }));

    calculateMacros();
  };

  const handleInputChange = (field: keyof HealthData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        goal_weight: formData.goal_weight,
        goal_type: formData.goal_type,
        activity_level: formData.activity_level,
        daily_calories: formData.daily_calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) throw error;

      navigate('/');
    } catch (error) {
      console.error('Error saving health data:', error);
      alert('Error al guardar los datos. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando datos...</p>
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
            <button onClick={() => navigate(-1)} className="text-gray-600">
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">Datos de Salud</h1>
            <div className="w-6"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 px-4">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Configura tus metas de salud
          </h2>

          {/* Información Básica */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-gray-800">Información Básica</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Edad</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Edad"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Altura (cm)</label>
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Altura"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Peso Actual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Peso actual"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Peso Objetivo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.goal_weight || ''}
                  onChange={(e) => handleInputChange('goal_weight', parseFloat(e.target.value) || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Peso objetivo"
                />
              </div>
            </div>
          </div>

          {/* Nivel de Actividad */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-4">Nivel de Actividad</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'sedentary', label: 'Sedentario', desc: 'Poco o ningún ejercicio' },
                { value: 'light', label: 'Ligero', desc: 'Ejercicio 1-3 días/semana' },
                { value: 'moderate', label: 'Moderado', desc: 'Ejercicio 3-5 días/semana' },
                { value: 'active', label: 'Activo', desc: 'Ejercicio 6-7 días/semana' },
                { value: 'very_active', label: 'Muy Activo', desc: 'Ejercicio intenso diario' }
              ].map((activity) => (
                <button
                  key={activity.value}
                  type="button"
                  onClick={() => handleInputChange('activity_level', activity.value as any)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    formData.activity_level === activity.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <div className="font-medium text-gray-800 text-sm">
                    {activity.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Meta */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-4">Tu Objetivo</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'lose_weight', label: 'Bajar Peso', icon: 'ri-weight-line', color: 'text-red-600' },
                { value: 'maintenance', label: 'Mantenimiento', icon: 'ri-scales-line', color: 'text-blue-600' },
                { value: 'gain_muscle', label: 'Ganar Músculo', icon: 'ri-body-scan-line', color: 'text-green-600' }
              ].map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => handleInputChange('goal_type', goal.value as any)}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    formData.goal_type === goal.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <i className={`${goal.icon} ${goal.color} text-xl mb-2`}></i>
                  <div className="font-medium text-gray-800 text-sm">
                    {goal.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Calcular */}
          <button
            onClick={calculateCalories}
            disabled={!formData.age || !formData.height || !formData.weight}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium mb-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Calcular Metas
          </button>

          {/* Resultados */}
          {formData.daily_calories && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Tus Metas Diarias</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formData.daily_calories}
                  </div>
                  <div className="text-xs text-gray-500">Calorías</div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formData.protein}g
                  </div>
                  <div className="text-xs text-gray-500">Proteína</div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formData.carbs}g
                  </div>
                  <div className="text-xs text-gray-500">Carbohidratos</div>
                </div>

                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formData.fat}g
                  </div>
                  <div className="text-xs text-gray-500">Grasas</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Basado en tu objetivo de {formData.goal_type === 'lose_weight' ? 'bajar peso' : 
                formData.goal_type === 'gain_muscle' ? 'ganar músculo' : 'mantenimiento'}
              </div>
            </div>
          )}

          {/* Guardar */}
          <button
            onClick={handleSave}
            disabled={saving || !formData.daily_calories}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <i className="ri-check-line mr-2"></i>
                Guardar Metas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

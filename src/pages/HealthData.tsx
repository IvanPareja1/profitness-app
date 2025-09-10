import { useState, useEffect } from 'react';
import { useAuth, supabase } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HealthData {
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: 'lose_weight' | 'gain_muscle' | 'maintain';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  daily_steps?: number;
  bmr?: number;
  tdee?: number;
  target_calories?: number;
  goal_weight?: number | null;
}

export default function HealthData() {
  const [healthData, setHealthData] = useState<HealthData>({
    age: null,
    gender: 'male',
    height: null,
    weight: null,
    goal: 'maintain',
    activity_level: 'moderate',
    daily_steps: 0,
    goal_weight: null
  });

  const [loading, setLoading] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const { error } = await supabase
        .from('profiles')
        .update({
          age: healthData.age,
          gender: healthData.gender,
          height: healthData.height,
          weight: healthData.weight,
          goal: healthData.goal,
          activity_level: healthData.activity_level,
          goal_weight: healthData.goal_weight,
          daily_calories: calculations.targetCalories,
          // Puedes agregar campos para macros si lo deseas
          target_protein: macros.protein,
          target_carbs: macros.carbs,
          target_fat: macros.fat,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      alert('Datos de salud guardados exitosamente!');
      navigate('/profile');

    } catch (error) {
      console.error('Error saving health data:', error);
      alert('Error al guardar los datos');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        loadHealthData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  const loadHealthData = async () => {
    try {
      const { data } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setHealthData(data);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  const checkConnectedDevices = async () => {
    // Verificar dispositivos conectados
    try {
      if ('health' in navigator) {
        const devices = await (navigator as any).health.getConnectedDevices();
        setConnectedDevices(devices);
      }
    } catch (error) {
      console.log('Health connect API not available');
    }
  };

  const calculateCalories = () => {
    // Fórmula de Mifflin-St Jeor para BMR
    let bmr;
    if (healthData.gender === 'male') {
      bmr = 10 * healthData.weight + 6.25 * healthData.height - 5 * healthData.age + 5;
    } else {
      bmr = 10 * healthData.weight + 6.25 * healthData.height - 5 * healthData.age - 161;
    }

    // Multiplicador de actividad
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * activityMultipliers[healthData.activity_level];

    // Ajustar según objetivo
    let targetCalories;
    switch (healthData.goal) {
      case 'lose_weight':
        targetCalories = tdee - 500; // Déficit de 500 calorías
        break;
      case 'gain_muscle':
        targetCalories = tdee + 300; // Superávit de 300 calorías
        break;
      default:
        targetCalories = tdee;
    }

    return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories: Math.round(targetCalories) };
  };

  const calculateMacros = (calories: number) => {
    let protein, carbs, fat;

    switch (healthData.goal) {
      case 'lose_weight':
        protein = healthData.weight * 2.2; // 2.2g por kg de peso
        fat = (calories * 0.25) / 9; // 25% de calorías de grasa
        carbs = (calories - (protein * 4) - (fat * 9)) / 4;
        break;
      case 'gain_muscle':
        protein = healthData.weight * 2.5; // 2.5g por kg de peso
        fat = (calories * 0.25) / 9;
        carbs = (calories - (protein * 4) - (fat * 9)) / 4;
        break;
      default:
        protein = healthData.weight * 1.8;
        fat = (calories * 0.25) / 9;
        carbs = (calories - (protein * 4) - (fat * 9)) / 4;
    }

    return {
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    };
  };

  const connectGoogleFit = async () => {
    try {
      // Integración con Google Fit
      if ('health' in navigator) {
        await (navigator as any).health.requestAuthorization([
          { name: 'steps', access: 'read' },
          { name: 'weight', access: 'read' },
          { name: 'height', access: 'read' }
        ]);
        
        const steps = await (navigator as any).health.query({
          dataType: 'steps',
          startDate: new Date(Date.now() - 86400000), // Últimas 24h
          endDate: new Date()
        });

        if (steps.length > 0) {
          setHealthData(prev => ({
            ...prev,
            daily_steps: steps[0].value
          }));
        }
      }
    } catch (error) {
      console.error('Error connecting to Google Fit:', error);
    }
  };

  const connectAppleHealth = async () => {
    // Lógica similar para Apple HealthKit
    console.log('Conectando Apple Health...');
  };

  const saveHealthData = async () => {
    try {
      setLoading(true);
      
      const calculations = calculateCalories();
      const macros = calculateMacros(calculations.targetCalories);

      const { error } = await supabase
        .from('health_data')
        .upsert({
          user_id: user?.id,
          ...healthData,
          ...calculations,
          target_protein: macros.protein,
          target_carbs: macros.carbs,
          target_fat: macros.fat,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Actualizar también el perfil del usuario
      await supabase
        .from('profiles')
        .update({
          daily_calories: calculations.targetCalories,
          weight: healthData.weight,
          height: healthData.height,
          age: healthData.age
        })
        .eq('user_id', user?.id);

      alert('Datos de salud guardados exitosamente!');
      navigate('/profile');

    } catch (error) {
      console.error('Error saving health data:', error);
      alert('Error al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/profile')} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-800">Datos de Salud</h1>
          </div>
        </div>
      </div>

      <div className="pt-20 px-4 space-y-6">
        {/* Información Básica */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Información Básica</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
              <input
                type="number"
                value={healthData.age}
                onChange={(e) => setHealthData({...healthData, age: parseInt(e.target.value) || 0})}
                className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                placeholder="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <select
                value={healthData.gender}
                onChange={(e) => setHealthData({...healthData, gender: e.target.value})}
                className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
              <input
                type="number"
                value={healthData.height}
                onChange={(e) => setHealthData({...healthData, height: parseInt(e.target.value) || 0})}
                className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                placeholder="175"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
              <input
                type="number"
                value={healthData.weight}
                onChange={(e) => setHealthData({...healthData, weight: parseInt(e.target.value) || 0})}
                className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
                placeholder="70"
              />
            </div>
          </div>
        </div>

        {/* Objetivo y Actividad */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Objetivo y Estilo de Vida</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mi objetivo principal</label>
            <select
              value={healthData.goal}
              onChange={(e) => setHealthData({...healthData, goal: e.target.value as any})}
              className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
            >
              <option value="lose_weight">Perder peso</option>
              <option value="maintain">Mantenerme</option>
              <option value="gain_muscle">Ganar músculo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de actividad</label>
            <select
              value={healthData.activity_level}
              onChange={(e) => setHealthData({...healthData, activity_level: e.target.value as any})}
              className="w-full p-3 bg-gray-50 rounded-lg border-none text-sm"
            >
              <option value="sedentary">Sedentario (poco o ningún ejercicio)</option>
              <option value="light">Ligero (ejercicio 1-3 días/semana)</option>
              <option value="moderate">Moderado (ejercicio 3-5 días/semana)</option>
              <option value="active">Activo (ejercicio 6-7 días/semana)</option>
              <option value="very_active">Muy activo (ejercicio intenso diario)</option>
            </select>
          </div>
        </div>

        {/* Conexión con Dispositivos */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Conexión con Dispositivos</h2>
          
          <div className="space-y-3">
            <button
              onClick={connectGoogleFit}
              className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <i className="ri-google-fill text-blue-600 text-xl"></i>
                <span className="text-sm font-medium">Conectar Google Fit</span>
              </div>
              <i className="ri-arrow-right-s-line text-blue-600"></i>
            </button>

            <button
              onClick={connectAppleHealth}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <i className="ri-apple-fill text-gray-800 text-xl"></i>
                <span className="text-sm font-medium">Conectar Apple Health</span>
              </div>
              <i className="ri-arrow-right-s-line text-gray-600"></i>
            </button>
          </div>

          {healthData.daily_steps > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <i className="ri-walk-line text-green-600"></i>
                <span className="text-sm text-green-800">
                  {healthData.daily_steps.toLocaleString()} pasos hoy
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Resumen de Cálculos */}
        {healthData.age > 0 && healthData.weight > 0 && healthData.height > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Resumen de tu Plan</h2>
            
            {(() => {
              const calculations = calculateCalories();
              const macros = calculateMacros(calculations.targetCalories);
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{calculations.bmr}</div>
                      <div className="text-xs text-blue-700">BMR</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{calculations.tdee}</div>
                      <div className="text-xs text-green-700">TDEE</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{calculations.targetCalories}</div>
                      <div className="text-xs text-purple-700">Calorías Meta</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">{macros.protein}g</div>
                      <div className="text-xs text-red-700">Proteína</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">{macros.carbs}g</div>
                      <div className="text-xs text-yellow-700">Carbohidratos</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{macros.fat}g</div>
                      <div className="text-xs text-purple-700">Grasas</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Botón de Guardar */}
        <button
          onClick={saveHealthData}
          disabled={loading || healthData.age === 0 || healthData.weight === 0 || healthData.height === 0}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar y Calcular Mi Plan'}
        </button>
      </div>
    </div>
  );
}
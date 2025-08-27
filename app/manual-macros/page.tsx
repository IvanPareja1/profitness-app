
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, callEdgeFunction, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

interface CycleRecommendation {
  title: string;
  nutrition: string;
  exercise: string;
  calories: number;
  notes: string;
}

export default function ManualMacrosPage() {
  const [calories, setCalories] = useState<number>(2200);
  const [protein, setProtein] = useState<number>(165);
  const [carbs, setCarbs] = useState<number>(248);
  const [fats, setFats] = useState<number>(73);
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [gender, setGender] = useState<string>('');
  const [trackCycle, setTrackCycle] = useState<boolean>(false);
  const [cyclePhase, setCyclePhase] = useState<CyclePhase>('follicular');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth');
        return;
      }
      setUser(currentUser);
      await loadUserMacros();
    } catch (error) {
      console.error('Error initializing user:', error);
      router.push('/auth');
    }
  };

  const loadUserMacros = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await callEdgeFunction('user-macros-manager', {}, token);
      
      if (response.macros) {
        setCalories(response.macros.calories);
        setProtein(response.macros.protein);
        setCarbs(response.macros.carbs);
        setFats(response.macros.fat);
      }
      
      if (response.profile) {
        setGender(response.profile.gender || '');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user macros:', error);
      setIsLoading(false);
    }
  };

  const calculateFromCalories = () => {
    const proteinCals = calories * 0.3;
    const carbsCals = calories * 0.45;
    const fatsCals = calories * 0.25;

    setProtein(Math.round(proteinCals / 4));
    setCarbs(Math.round(carbsCals / 4));
    setFats(Math.round(fatsCals / 9));
  };

  const saveUserMacros = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await callEdgeFunction('user-macros-manager', {
        calories: adjustedCalories,
        protein,
        carbs,
        fat: fats,
        gender,
        trackCycle,
        cyclePhase: trackCycle ? cyclePhase : null
      }, token);
      
      if (response.success) {
        setSaveMessage('✅ Metas guardadas correctamente');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving macros:', error);
      setSaveMessage('❌ Error al guardar las metas');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const cyclePhases = [
    { id: 'menstrual' as CyclePhase, name: 'Menstruación (Días 1-5)', color: 'red' },
    { id: 'follicular' as CyclePhase, name: 'Fase Folicular (Días 6-14)', color: 'green' },
    { id: 'ovulation' as CyclePhase, name: 'Ovulación (Días 14-16)', color: 'yellow' },
    { id: 'luteal' as CyclePhase, name: 'Fase Lútea (Días 17-28)', color: 'purple' }
  ];

  const getCycleRecommendations = (phase: CyclePhase): CycleRecommendation => {
    const recommendations: Record<CyclePhase, CycleRecommendation> = {
      menstrual: {
        title: 'Días de Menstruación',
        nutrition: 'Aumenta hierro y magnesio. Reduce intensidad del ejercicio.',
        exercise: 'Ejercicio suave: yoga, caminata, estiramientos. Evita entrenamientos intensos.',
        calories: -100,
        notes: 'Es normal sentir menos energía. Prioriza el descanso y la hidratación.'
      },
      follicular: {
        title: 'Fase Folicular',
        nutrition: 'Metabolismo normal. Buen momento para nuevos hábitos alimentarios.',
        exercise: 'Excelente para entrenamientos de fuerza y alta intensidad.',
        calories: 0,
        notes: 'Niveles de energía altos. Ideal para desafíos físicos.'
      },
      ovulation: {
        title: 'Ovulación',
        nutrition: 'Metabolismo ligeramente elevado. Mantén hidratación alta.',
        exercise: 'Pico de rendimiento. Aprovecha para entrenamientos intensos.',
        calories: +50,
        notes: 'Máximo rendimiento físico y mental. Excelente momento para récords personales.'
      },
      luteal: {
        title: 'Fase Lútea',
        nutrition: 'Aumenta carbohidratos complejos. Controla antojos de dulce.',
        exercise: 'Entrenamientos moderados. Incluye más descanso entre series.',
        calories: +100,
        notes: 'Posibles antojos y retención de líquidos. Normal aumentar 1-2kg temporalmente.'
      }
    };
    return recommendations[phase];
  };

  const currentRecommendations = getCycleRecommendations(cyclePhase);
  const adjustedCalories = trackCycle && gender === 'female' ? calories + currentRecommendations.calories : calories;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
          <p className="text-purple-600 font-medium">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
              <i className="ri-arrow-left-line text-gray-600 text-xl"></i>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Ajuste de Metas</h1>
          </div>
          <button 
            onClick={saveUserMacros}
            disabled={isSaving}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isSaving 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
        
        {saveMessage && (
          <div className={`mx-4 mb-2 p-3 rounded-xl text-sm font-medium ${
            saveMessage.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {saveMessage}
          </div>
        )}
      </div>

      <div className="pt-20 pb-20 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Género</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => {
                setGender('male');
                setTrackCycle(false);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                gender === 'male'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <i className="ri-men-line text-2xl mb-2"></i>
              <div className="text-sm font-medium">Masculino</div>
            </button>
            <button
              onClick={() => setGender('female')}
              className={`p-4 rounded-xl border-2 transition-all ${
                gender === 'female'
                  ? 'border-pink-500 bg-pink-50 text-pink-600'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <i className="ri-women-line text-2xl mb-2"></i>
              <div className="text-sm font-medium">Femenino</div>
            </button>
          </div>

          {gender === 'female' && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-800">Seguimiento del ciclo menstrual</h3>
                  <p className="text-sm text-gray-500">Ajusta automáticamente metas según tu ciclo</p>
                </div>
                <button
                  onClick={() => setTrackCycle(!trackCycle)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    trackCycle ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      trackCycle ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {trackCycle && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fase actual del ciclo</label>
                    <select
                      value={cyclePhase}
                      onChange={(e) => setCyclePhase(e.target.value as CyclePhase)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm appearance-none"
                    >
                      {cyclePhases.map((phase) => (
                        <option key={phase.id} value={phase.id}>{phase.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-pink-50 rounded-xl p-4">
                    <h4 className="font-medium text-pink-800 mb-2">{currentRecommendations.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-pink-700">Nutrición:</span>
                        <p className="text-pink-600">{currentRecommendations.nutrition}</p>
                      </div>
                      <div>
                        <span className="font-medium text-pink-700">Ejercicio:</span>
                        <p className="text-pink-600">{currentRecommendations.exercise}</p>
                      </div>
                      <div>
                        <span className="font-medium text-pink-700">Nota:</span>
                        <p className="text-pink-600">{currentRecommendations.notes}</p>
                      </div>
                      {currentRecommendations.calories !== 0 && (
                        <div className="flex items-center space-x-2 mt-3 p-2 bg-pink-100 rounded-lg">
                          <i className="ri-information-line text-pink-500"></i>
                          <span className="text-sm text-pink-700">
                            Ajuste automático: {currentRecommendations.calories > 0 ? '+' : ''}{currentRecommendations.calories} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Macronutrientes</h2>
            <button
              onClick={() => setCustomMode(!customMode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                customMode
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {customMode ? 'Automático' : 'Manual'}
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Calorías objetivo</label>
                <span className="text-lg font-bold text-gray-800">{adjustedCalories} kcal</span>
              </div>
              <input
                type="range"
                min="1200"
                max="3500"
                step="50"
                value={calories}
                onChange={(e) => {
                  setCalories(parseInt(e.target.value));
                  if (!customMode) calculateFromCalories();
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1200</span>
                <span>3500</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-blue-600">Proteínas</label>
                  <span className="text-sm font-bold text-blue-600">{protein}g</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="300"
                  step="5"
                  value={protein}
                  onChange={(e) => setProtein(parseInt(e.target.value))}
                  disabled={!customMode}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-500 mt-1">{(protein * 4)} kcal</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-green-600">Carbohidratos</label>
                  <span className="text-sm font-bold text-green-600">{carbs}g</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="400"
                  step="5"
                  value={carbs}
                  onChange={(e) => setCarbs(parseInt(e.target.value))}
                  disabled={!customMode}
                  className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-500 mt-1">{(carbs * 4)} kcal</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-yellow-600">Grasas</label>
                  <span className="text-sm font-bold text-yellow-600">{fats}g</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="150"
                  step="2"
                  value={fats}
                  onChange={(e) => setFats(parseInt(e.target.value))}
                  disabled={!customMode}
                  className="w-full h-2 bg-yellow-100 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-500 mt-1">{(fats * 9)} kcal</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-800 mb-2">Distribución de macronutrientes</h4>
              <div className="flex space-x-2 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-400"
                  style={{ width: `${(protein * 4 / adjustedCalories) * 100}%` }}
                ></div>
                <div 
                  className="bg-green-400"
                  style={{ width: `${(carbs * 4 / adjustedCalories) * 100}%` }}
                ></div>
                <div 
                  className="bg-yellow-400"
                  style={{ width: `${(fats * 9 / adjustedCalories) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Proteínas {Math.round((protein * 4 / adjustedCalories) * 100)}%</span>
                <span>Carbohidratos {Math.round((carbs * 4 / adjustedCalories) * 100)}%</span>
                <span>Grasas {Math.round((fats * 9 / adjustedCalories) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {!customMode && (
          <button
            onClick={calculateFromCalories}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-medium mb-4"
          >
            Recalcular Macronutrientes
          </button>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Recomendaciones generales</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <i className="ri-drop-line text-blue-500 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Proteínas: 1.6-2.2g por kg de peso</p>
                <p className="text-xs text-gray-600">Esencial para mantenimiento y crecimiento muscular</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <i className="ri-leaf-line text-green-500 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Carbohidratos: 45-65% de calorías totales</p>
                <p className="text-xs text-gray-600">Principal fuente de energía para entrenamientos</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                <i className="ri-sun-line text-yellow-500 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Grasas: 20-35% de calorías totales</p>
                <p className="text-xs text-gray-600">Importantes para hormonas y absorción de vitaminas</p>
              </div>
            </div>
          </div>
        </div>
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
              <i className="ri-user-line text-gray-400 text-lg"></i>
            </div>
            <span className="text-xs text-gray-400 mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

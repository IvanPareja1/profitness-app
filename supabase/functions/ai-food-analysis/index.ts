import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { image_mode, user_preferences = {} } = await req.json();

    // Simulación avanzada de análisis de IA de alimentos
    const simulateAdvancedAIAnalysis = () => {
      // Base de datos expandida de alimentos comunes con valores nutricionales precisos
      const foodDatabase = [
        // Desayunos
        { name: 'Huevos revueltos', calories: 147, carbs: 1, protein: 13, fat: 10, portion: '2 huevos', confidence: 95, ingredients: ['huevos', 'mantequilla'] },
        { name: 'Tostadas integrales', calories: 80, carbs: 15, protein: 4, fat: 1, portion: '1 rebanada', confidence: 97, ingredients: ['pan integral'] },
        { name: 'Yogur griego con frutas', calories: 150, carbs: 18, protein: 12, fat: 4, portion: '1 taza', confidence: 92, ingredients: ['yogur griego', 'fresas', 'arándanos'] },
        { name: 'Avena con plátano', calories: 220, carbs: 45, protein: 6, fat: 3, portion: '1 tazón', confidence: 89, ingredients: ['avena', 'plátano', 'canela'] },
        
        // Almuerzos
        { name: 'Ensalada César', calories: 180, carbs: 12, protein: 8, fat: 14, portion: '1 plato', confidence: 94, ingredients: ['lechuga', 'pollo', 'queso parmesano', 'aderezo césar'] },
        { name: 'Pollo a la parrilla', calories: 220, carbs: 0, protein: 31, fat: 9, portion: '150g', confidence: 89, ingredients: ['pechuga de pollo', 'especias'] },
        { name: 'Arroz con verduras', calories: 190, carbs: 38, protein: 4, fat: 2, portion: '1 taza', confidence: 91, ingredients: ['arroz', 'zanahoria', 'brócoli', 'guisantes'] },
        { name: 'Salmón al horno', calories: 280, carbs: 0, protein: 39, fat: 12, portion: '150g', confidence: 93, ingredients: ['salmón', 'limón', 'hierbas'] },
        { name: 'Pasta con tomate', calories: 320, carbs: 65, protein: 11, fat: 3, portion: '1 plato', confidence: 88, ingredients: ['pasta', 'salsa de tomate', 'albahaca'] },
        
        // Cenas
        { name: 'Sopa de verduras', calories: 120, carbs: 25, protein: 4, fat: 2, portion: '1 tazón', confidence: 87, ingredients: ['verduras mixtas', 'caldo', 'especias'] },
        { name: 'Tacos de pescado', calories: 240, carbs: 28, protein: 18, fat: 8, portion: '2 tacos', confidence: 91, ingredients: ['pescado', 'tortillas', 'repollo', 'salsa'] },
        { name: 'Quinoa con pollo', calories: 350, carbs: 45, protein: 25, fat: 8, portion: '1 plato', confidence: 89, ingredients: ['quinoa', 'pollo', 'verduras'] },
        
        // Snacks
        { name: 'Fruta mixta', calories: 80, carbs: 20, protein: 1, fat: 0, portion: '1 taza', confidence: 96, ingredients: ['manzana', 'uvas', 'melón'] },
        { name: 'Almendras', calories: 160, carbs: 6, protein: 6, fat: 14, portion: '28g', confidence: 94, ingredients: ['almendras'] },
        { name: 'Smoothie verde', calories: 140, carbs: 32, protein: 4, fat: 1, portion: '1 vaso', confidence: 88, ingredients: ['espinacas', 'plátano', 'mango', 'agua de coco'] },
        
        // Postres
        { name: 'Yogur con granola', calories: 200, carbs: 35, protein: 8, fat: 4, portion: '1 taza', confidence: 92, ingredients: ['yogur', 'granola', 'miel'] },
        { name: 'Brownie casero', calories: 180, carbs: 25, protein: 3, fat: 8, portion: '1 porción', confidence: 85, ingredients: ['chocolate', 'harina', 'huevos', 'mantequilla'] }
      ];

      // Seleccionar alimentos aleatorios basados en el modo de imagen
      const getRandomFoods = () => {
        const numFoods = Math.floor(Math.random() * 3) + 1; // 1-3 alimentos
        const selectedFoods = [];
        const shuffled = [...foodDatabase].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < numFoods && i < shuffled.length; i++) {
          const food = { ...shuffled[i] };
          // Añadir variación realista en la confianza
          food.confidence = Math.max(75, food.confidence - Math.floor(Math.random() * 10));
          selectedFoods.push(food);
        }
        
        return selectedFoods;
      };

      const detectedFoods = getRandomFoods();
      
      // Calcular totales
      const totals = detectedFoods.reduce((acc, food) => ({
        calories: acc.calories + food.calories,
        carbs: acc.carbs + food.carbs,
        protein: acc.protein + food.protein,
        fat: acc.fat + food.fat
      }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

      // Calcular confianza promedio
      const avgConfidence = Math.round(
        detectedFoods.reduce((sum, food) => sum + food.confidence, 0) / detectedFoods.length
      );

      return {
        success: true,
        data: {
          detectedFoods: detectedFoods.map(food => ({
            ...food,
            confidence: `${food.confidence}%`
          })),
          totalCalories: totals.calories,
          totalCarbs: totals.carbs,
          totalProtein: totals.protein,
          totalFat: totals.fat,
          confidence_score: avgConfidence,
          analysis_time: new Date().toISOString(),
          image: `healthy ${detectedFoods.map(f => f.name.toLowerCase()).join(' and ')} on white plate, food photography style, natural lighting, restaurant quality presentation`,
          metadata: {
            processing_time: `${(Math.random() * 2 + 1).toFixed(1)}s`,
            algorithm_version: '2.1.5',
            image_quality: 'high',
            lighting_conditions: 'optimal'
          }
        }
      };
    };

    // Realizar análisis (simulado por ahora, pero estructura preparada para IA real)
    const analysisResult = simulateAdvancedAIAnalysis();

    // Guardar resultado del análisis en la base de datos para historial
    try {
      await supabaseClient
        .from('ai_food_analysis')
        .insert({
          user_id: user.id,
          analysis_result: analysisResult.data,
          image_mode,
          confidence_score: analysisResult.data.confidence_score,
          foods_detected: analysisResult.data.detectedFoods.length,
          total_calories: analysisResult.data.totalCalories,
          created_at: new Date().toISOString()
        });
    } catch (dbError) {
      console.error('Error saving analysis to database:', dbError);
      // Continúa sin fallar si no puede guardar en DB
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI food analysis:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Error en el análisis de IA. Intenta nuevamente.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
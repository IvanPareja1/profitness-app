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

    const url = new URL(req.url);
    const method = req.method;

    // GET /exercises - Obtener ejercicios del usuario
    if (method === 'GET' && url.pathname === '/exercises') {
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabaseClient
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at', `${date}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calcular totales del día
      const totals = data.reduce((acc, exercise) => ({
        totalExercises: acc.totalExercises + 1,
        totalDuration: acc.totalDuration + (exercise.duration || 0),
        totalCalories: acc.totalCalories + (exercise.calories_burned || 0),
        totalSets: acc.totalSets + (exercise.sets || 0),
        totalReps: acc.totalReps + (exercise.reps || 0),
      }), { totalExercises: 0, totalDuration: 0, totalCalories: 0, totalSets: 0, totalReps: 0 });

      return new Response(
        JSON.stringify({ exercises: data, totals }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /exercises - Agregar nuevo ejercicio
    if (method === 'POST' && url.pathname === '/exercises') {
      const body = await req.json();
      
      // Calcular calorías quemadas aproximadas basado en tipo y duración
      let caloriesBurned = 0;
      const duration = body.duration || 0;
      const weight = body.weight || 0;
      
      switch (body.type) {
        case 'cardio':
          caloriesBurned = duration * 8; // ~8 kcal/min
          break;
        case 'fuerza':
          caloriesBurned = duration * 6; // ~6 kcal/min
          break;
        case 'resistencia':
          caloriesBurned = duration * 7; // ~7 kcal/min
          break;
        case 'flexibilidad':
          caloriesBurned = duration * 3; // ~3 kcal/min
          break;
        default:
          caloriesBurned = duration * 5; // ~5 kcal/min promedio
      }
      
      const { data, error } = await supabaseClient
        .from('exercises')
        .insert({
          user_id: user.id,
          name: body.name,
          type: body.type,
          duration: duration,
          weight: weight,
          reps: body.reps || null,
          sets: body.sets || null,
          calories_burned: Math.round(caloriesBurned),
          notes: body.notes || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ exercise: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /exercises/:id - Eliminar ejercicio
    if (method === 'DELETE' && url.pathname.startsWith('/exercises/')) {
      const exerciseId = url.pathname.split('/')[2];
      
      const { error } = await supabaseClient
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /exercises/templates - Obtener plantillas de ejercicios
    if (method === 'POST' && url.pathname === '/exercises/templates') {
      const { query } = await req.json();
      
      // Base de datos de ejercicios expandida
      const exerciseDatabase = [
        // Cardio
        { name: 'Correr', type: 'cardio', category: 'Cardio', calories_per_min: 10 },
        { name: 'Caminar rápido', type: 'cardio', category: 'Cardio', calories_per_min: 6 },
        { name: 'Ciclismo', type: 'cardio', category: 'Cardio', calories_per_min: 8 },
        { name: 'Natación', type: 'cardio', category: 'Cardio', calories_per_min: 12 },
        { name: 'Elíptica', type: 'cardio', category: 'Cardio', calories_per_min: 9 },
        { name: 'Cinta de correr', type: 'cardio', category: 'Cardio', calories_per_min: 10 },
        { name: 'Saltar cuerda', type: 'cardio', category: 'Cardio', calories_per_min: 11 },
        
        // Fuerza - Pecho
        { name: 'Press de banca', type: 'fuerza', category: 'Pecho', calories_per_min: 6 },
        { name: 'Flexiones', type: 'fuerza', category: 'Pecho', calories_per_min: 5 },
        { name: 'Press inclinado', type: 'fuerza', category: 'Pecho', calories_per_min: 6 },
        { name: 'Aperturas con mancuernas', type: 'fuerza', category: 'Pecho', calories_per_min: 5 },
        
        // Fuerza - Espalda
        { name: 'Dominadas', type: 'fuerza', category: 'Espalda', calories_per_min: 7 },
        { name: 'Remo con barra', type: 'fuerza', category: 'Espalda', calories_per_min: 6 },
        { name: 'Pulldown lat', type: 'fuerza', category: 'Espalda', calories_per_min: 6 },
        { name: 'Remo con mancuerna', type: 'fuerza', category: 'Espalda', calories_per_min: 5 },
        
        // Fuerza - Piernas
        { name: 'Sentadillas', type: 'fuerza', category: 'Piernas', calories_per_min: 7 },
        { name: 'Peso muerto', type: 'fuerza', category: 'Piernas', calories_per_min: 8 },
        { name: 'Prensa de piernas', type: 'fuerza', category: 'Piernas', calories_per_min: 6 },
        { name: 'Extensiones de cuádriceps', type: 'fuerza', category: 'Piernas', calories_per_min: 4 },
        { name: 'Curl femoral', type: 'fuerza', category: 'Piernas', calories_per_min: 4 },
        { name: 'Elevaciones de gemelos', type: 'fuerza', category: 'Piernas', calories_per_min: 3 },
        
        // Fuerza - Hombros
        { name: 'Press militar', type: 'fuerza', category: 'Hombros', calories_per_min: 6 },
        { name: 'Elevaciones laterales', type: 'fuerza', category: 'Hombros', calories_per_min: 4 },
        { name: 'Elevaciones frontales', type: 'fuerza', category: 'Hombros', calories_per_min: 4 },
        { name: 'Pájaros', type: 'fuerza', category: 'Hombros', calories_per_min: 4 },
        
        // Fuerza - Brazos
        { name: 'Curl de bíceps', type: 'fuerza', category: 'Brazos', calories_per_min: 4 },
        { name: 'Tríceps en polea', type: 'fuerza', category: 'Brazos', calories_per_min: 4 },
        { name: 'Curl martillo', type: 'fuerza', category: 'Brazos', calories_per_min: 4 },
        { name: 'Fondos en paralelas', type: 'fuerza', category: 'Brazos', calories_per_min: 6 },
        
        // Resistencia
        { name: 'Burpees', type: 'resistencia', category: 'Funcional', calories_per_min: 12 },
        { name: 'Mountain climbers', type: 'resistencia', category: 'Funcional', calories_per_min: 10 },
        { name: 'Jumping jacks', type: 'resistencia', category: 'Funcional', calories_per_min: 8 },
        { name: 'Plancha', type: 'resistencia', category: 'Core', calories_per_min: 5 },
        { name: 'Abdominales', type: 'resistencia', category: 'Core', calories_per_min: 4 },
        
        // Flexibilidad
        { name: 'Yoga', type: 'flexibilidad', category: 'Flexibilidad', calories_per_min: 3 },
        { name: 'Estiramientos', type: 'flexibilidad', category: 'Flexibilidad', calories_per_min: 2 },
        { name: 'Pilates', type: 'flexibilidad', category: 'Flexibilidad', calories_per_min: 4 },
        { name: 'Tai Chi', type: 'flexibilidad', category: 'Flexibilidad', calories_per_min: 3 },
      ];

      const results = exerciseDatabase.filter(exercise => 
        exercise.name.toLowerCase().includes(query.toLowerCase()) ||
        exercise.category.toLowerCase().includes(query.toLowerCase()) ||
        exercise.type.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /exercises/stats - Obtener estadísticas generales del usuario
    if (method === 'GET' && url.pathname === '/exercises/stats') {
      const { data, error } = await supabaseClient
        .from('exercises')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calcular estadísticas
      const stats = {
        totalExercises: data.length,
        totalDuration: data.reduce((acc, ex) => acc + (ex.duration || 0), 0),
        totalCalories: data.reduce((acc, ex) => acc + (ex.calories_burned || 0), 0),
        averageDuration: data.length > 0 ? Math.round(data.reduce((acc, ex) => acc + (ex.duration || 0), 0) / data.length) : 0,
        favoriteType: data.length > 0 ? getMostFrequent(data.map(ex => ex.type)) : null,
        activeDays: new Set(data.map(ex => ex.created_at?.split('T')[0])).size,
      };

      return new Response(
        JSON.stringify({ stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Función auxiliar para encontrar el tipo más frecuente
function getMostFrequent(arr: string[]): string | null {
  if (arr.length === 0) return null;
  
  const frequency: { [key: string]: number } = {};
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
  });
  
  return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
}
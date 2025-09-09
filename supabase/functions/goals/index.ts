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

    // GET /goals - Obtener metas del usuario
    if (method === 'GET' && url.pathname === '/goals') {
      const { data, error } = await supabaseClient
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Si no existe, crear metas por defecto
      if (!data) {
        // Cambia el upsert para no incluir user_id como PK
      const { data, error } = await supabaseClient
      .from('user_goals')
      .upsert({
    user_id: user.id,  // Esto debe coincidir con la columna existente
    daily_calories: body.daily_calories,
    daily_protein: body.daily_protein,
    daily_carbs: body.daily_carbs,
    daily_fat: body.daily_fat,
    daily_exercise_minutes: body.daily_exercise_minutes,
    daily_water_glasses: body.daily_water_glasses,
    weekly_exercise_days: body.weekly_exercise_days,
    rest_days: body.rest_days || [],
    auto_adjust_rest_days: body.auto_adjust_rest_days,
    updated_at: new Date().toISOString()
  })
  .select()
  .single();
        if (createError) throw createError;

        return new Response(
          JSON.stringify({ goals: newGoals }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ goals: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /goals - Actualizar metas del usuario
    if (method === 'PUT' && url.pathname === '/goals') {
      const body = await req.json();
      
      const { data, error } = await supabaseClient
        .from('user_goals')
        .upsert({
          user_id: user.id,
          daily_calories: body.daily_calories,
          daily_protein: body.daily_protein,
          daily_carbs: body.daily_carbs,
          daily_fat: body.daily_fat,
          daily_exercise_minutes: body.daily_exercise_minutes,
          daily_water_glasses: body.daily_water_glasses,
          weekly_exercise_days: body.weekly_exercise_days,
          rest_days: [],
          auto_adjust_rest_days: body.auto_adjust_rest_days,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ goals: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /goals/today - Obtener metas ajustadas para hoy
if (method === 'GET' && url.pathname === '/goals/today') {
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date(date).getDay();
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const currentDay = dayNames[dayOfWeek];

  
  const { data: goals, error: goalsError } = await supabaseClient
    .from('user_goals')
    .select('*')
    .eq('user_id', user.id)  
    .single();

  if (goalsError) {
    console.error('Error fetching goals:', goalsError);
    throw goalsError;
  }

       // Verificar si hoy es día de descanso
      const isRestDay = goals.rest_days ? goals.rest_days.includes(currentDay) : false;
      
      // Calcular metas ajustadas
      let adjustedGoals = {
        daily_calories: goals.daily_calories,
        daily_protein: goals.daily_protein,
        daily_carbs: goals.daily_carbs,
        daily_fat: goals.daily_fat,
        daily_exercise_minutes: goals.daily_exercise_minutes,
        daily_water_glasses: goals.daily_water_glasses,
        is_rest_day: isRestDay
      };

      // Si es día de descanso y tiene auto-ajuste activado
      if (isRestDay && goals.auto_adjust_rest_days) {

        // Reducir metas de ejercicio pero mantener nutrición
        adjustedGoals.daily_exercise_minutes = Math.round(goals.daily_exercise_minutes * 0.3); // 30% del ejercicio normal
        adjustedGoals.daily_calories = Math.round(goals.daily_calories * 0.9); // 90% de las calorías
      }

      // Obtener o crear registro de logros diarios
      const { data: achievement, error: achievementError } = await supabaseClient
        .from('daily_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      if (achievementError && achievementError.code !== 'PGRST116') {
        throw achievementError;
      }

      // Si no existe, crear registro
      if (!achievement) {
        const { data: newAchievement, error: createError } = await supabaseClient
          .from('daily_achievements')
          .insert({
            user_id: user.id,
            date: date,
            calories_goal: adjustedGoals.daily_calories,
            protein_goal: adjustedGoals.daily_protein,
            carbs_goal: adjustedGoals.daily_carbs,
            fat_goal: adjustedGoals.daily_fat,
            exercise_goal: adjustedGoals.daily_exercise_minutes,
            water_goal: adjustedGoals.daily_water_glasses,
            is_rest_day: isRestDay
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(
          JSON.stringify({ 
            goals: adjustedGoals, 
            achievement: newAchievement,
            original_goals: goals 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          goals: adjustedGoals, 
          achievement: achievement,
          original_goals: goals 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /goals/progress - Obtener progreso semanal
    if (method === 'GET' && url.pathname === '/goals/progress') {
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');
      
      const { data: achievements, error } = await supabaseClient
        .from('daily_achievements')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Calcular estadísticas de progreso
      const totalDays = achievements.length;
      const restDays = achievements.filter(a => a.is_rest_day).length;
      const activeDays = totalDays - restDays;
      
      const stats = {
        total_days: totalDays,
        active_days: activeDays,
        rest_days: restDays,
        calories_avg_completion: 0,
        exercise_avg_completion: 0,
        streak_maintained: 0
      };

      if (totalDays > 0) {
        stats.calories_avg_completion = Math.round(
          achievements.reduce((sum, a) => {
            const completion = a.calories_goal > 0 ? (a.calories_achieved / a.calories_goal) * 100 : 0;
            return sum + Math.min(completion, 100);
          }, 0) / totalDays
        );

        stats.exercise_avg_completion = Math.round(
          achievements.reduce((sum, a) => {
            const completion = a.exercise_goal > 0 ? (a.exercise_achieved / a.exercise_goal) * 100 : 0;
            return sum + Math.min(completion, 100);
          }, 0) / totalDays
        );

        stats.streak_maintained = achievements.filter(a => a.streak_maintained).length;
      }

      return new Response(
        JSON.stringify({ achievements, stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /goals/achievement - Actualizar logros del día
    if (method === 'PUT' && url.pathname === '/goals/achievement') {
      const body = await req.json();
      const date = body.date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabaseClient
        .from('daily_achievements')
        .upsert({
          user_id: user.id,
          date: date,
          calories_achieved: body.calories_achieved,
          protein_achieved: body.protein_achieved,
          carbs_achieved: body.carbs_achieved,
          fat_achieved: body.fat_achieved,
          exercise_achieved: body.exercise_achieved,
          water_achieved: body.water_achieved,
          streak_maintained: body.streak_maintained
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ achievement: data }),
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
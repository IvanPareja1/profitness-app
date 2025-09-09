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
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Missing start_date or end_date parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener todos los logros en el rango de fechas
    const { data: achievements, error } = await supabaseClient
      .from('daily_achievements')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    // Agrupar por semanas
    const weeks: any[] = [];
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    let currentWeekStart = new Date(startDateObj);
    // Ajustar al lunes de esa semana
    const dayOfWeek = currentWeekStart.getDay();
    const daysToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    currentWeekStart.setDate(currentWeekStart.getDate() - daysToMonday);

    while (currentWeekStart <= endDateObj) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekAchievements = achievements.filter(a => {
        const achievementDate = new Date(a.date);
        return achievementDate >= currentWeekStart && achievementDate <= weekEnd;
      });

      if (weekAchievements.length > 0) {
        const activeDays = weekAchievements.filter(a => !a.is_rest_day).length;
        const restDays = weekAchievements.filter(a => a.is_rest_day).length;
        const streakDays = weekAchievements.filter(a => a.streak_maintained).length;

        const avgCaloriesCompletion = Math.round(
          weekAchievements.reduce((sum, a) => {
            const completion = a.calories_goal > 0 ? (a.calories_achieved / a.calories_goal) * 100 : 0;
            return sum + Math.min(completion, 100);
          }, 0) / weekAchievements.length
        );

        const avgExerciseCompletion = Math.round(
          weekAchievements.reduce((sum, a) => {
            const completion = a.exercise_goal > 0 ? (a.exercise_achieved / a.exercise_goal) * 100 : 0;
            return sum + Math.min(completion, 100);
          }, 0) / weekAchievements.length
        );

        weeks.push({
          week_start: currentWeekStart.toISOString().split('T')[0],
          week_end: weekEnd.toISOString().split('T')[0],
          active_days: activeDays,
          rest_days: restDays,
          streak_days: streakDays,
          avg_calories_completion: avgCaloriesCompletion,
          avg_exercise_completion: avgExerciseCompletion,
          total_days: weekAchievements.length
        });
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return new Response(
      JSON.stringify({ weeks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
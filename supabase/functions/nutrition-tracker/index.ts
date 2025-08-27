import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { method } = req
    const url = new URL(req.url)
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (method === 'GET') {
      // Obtener resumen nutricional del día
      const { data: dailyNutrition } = await supabaseClient
        .from('daily_nutrition')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()

      // Obtener entradas de comida del día
      const { data: foodEntries } = await supabaseClient
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('created_at', { ascending: false })

      // Obtener metas del usuario
      const { data: userProfile } = await supabaseClient
        .from('users')
        .select('target_calories, target_protein, target_carbs, target_fat')
        .eq('id', user.id)
        .single()

      // Agrupar por tipo de comida
      const mealGroups = {
        desayuno: foodEntries?.filter(entry => entry.meal_type === 'desayuno') || [],
        almuerzo: foodEntries?.filter(entry => entry.meal_type === 'almuerzo') || [],
        cena: foodEntries?.filter(entry => entry.meal_type === 'cena') || [],
        snacks: foodEntries?.filter(entry => entry.meal_type === 'snacks') || []
      }

      return new Response(
        JSON.stringify({
          dailyNutrition: dailyNutrition || {
            total_calories: 0,
            total_protein: 0,
            total_carbs: 0,
            total_fat: 0
          },
          foodEntries,
          mealGroups,
          targets: userProfile || {
            target_calories: 2000,
            target_protein: 150,
            target_carbs: 200,
            target_fat: 70
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'POST') {
      let body: any = null;
      try {
        body = await req.json();
        // Log completo del body recibido
        console.log('[nutrition-tracker] POST body recibido:', JSON.stringify(body));
      } catch (err) {
        console.error('[nutrition-tracker] Error parseando body JSON:', err);
        return new Response(
          JSON.stringify({ error: 'Body inválido o no es JSON', details: String(err) }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validar campos requeridos
      const requiredFields = ['foodData', 'userId'];
      for (const field of requiredFields) {
        if (!(field in body)) {
          console.error(`[nutrition-tracker] Faltan campos requeridos: ${field}`);
          return new Response(
            JSON.stringify({ error: `Falta el campo requerido: ${field}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Desestructurar foodData
      const fd = body.foodData;
      // Log de foodData
      console.log('[nutrition-tracker] foodData:', JSON.stringify(fd));

      // Agregar entrada de comida
      const { data: foodEntry, error: foodError } = await supabaseClient
        .from('food_entries')
        .insert({
          user_id: user.id,
          date: fd.date || body.date || date,
          meal_type: fd.meal_type || body.meal_type,
          food_name: fd.food_name || fd.name,
          brand: fd.brand,
          quantity: fd.quantity || 1,
          unit: fd.unit || 'porción',
          calories: fd.calories || 0,
          protein: fd.protein || 0,
          carbs: fd.carbs || 0,
          fat: fd.fat || 0,
          fiber: fd.fiber,
          sugar: fd.sugar,
          sodium: fd.sodium,
          scan_method: fd.scan_method || body.scan_method || 'manual',
          barcode: fd.barcode,
          ingredients: fd.ingredients
        })
        .select()
        .single();

      if (foodError) {
        console.error('[nutrition-tracker] Error insertando foodEntry:', foodError);
        return new Response(
          JSON.stringify({ error: 'Error insertando entrada de comida', details: foodError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Actualizar totales diarios
      await updateDailyTotals(supabaseClient, user.id, fd.date || body.date || date);

      return new Response(
        JSON.stringify({ foodEntry }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'DELETE') {
      const body = await req.json()
      
      // Eliminar entrada de comida
      const { error: deleteError } = await supabaseClient
        .from('food_entries')
        .delete()
        .eq('id', body.entryId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      // Actualizar totales diarios
      await updateDailyTotals(supabaseClient, user.id, body.date || date)

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function updateDailyTotals(supabaseClient: any, userId: string, date: string) {
  // Calcular totales del día
  const { data: entries } = await supabaseClient
    .from('food_entries')
    .select('calories, protein, carbs, fat')
    .eq('user_id', userId)
    .eq('date', date)

  const totals = entries?.reduce((acc, entry) => ({
    total_calories: acc.total_calories + (entry.calories || 0),
    total_protein: acc.total_protein + (entry.protein || 0),
    total_carbs: acc.total_carbs + (entry.carbs || 0),
    total_fat: acc.total_fat + (entry.fat || 0)
  }), {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0
  }) || {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0
  }

  // Actualizar o crear registro diario
  await supabaseClient
    .from('daily_nutrition')
    .upsert({
      user_id: userId,
      date,
      ...totals,
      updated_at: new Date().toISOString()
    })
}
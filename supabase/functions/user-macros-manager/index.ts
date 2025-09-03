import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    const { action, userId, macros } = await req.json()

    if (action === 'update_macros') {
      // Actualizar las metas de macronutrientes del usuario
      const { data, error } = await supabaseClient
        .from('users')
        .update({
          target_calories: macros.target_calories,
          target_protein: macros.target_protein,
          target_carbs: macros.target_carbs,
          target_fat: macros.target_fat,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (error) throw error

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Metas de macronutrientes actualizadas',
          user: data?.[0] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_macros') {
      // Obtener las metas actuales del usuario
      const { data, error } = await supabaseClient
        .from('users')
        .select('target_calories, target_protein, target_carbs, target_fat')
        .eq('id', userId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ 
          success: true,
          macros: data || {
            target_calories: 2000,
            target_protein: 150,
            target_carbs: 200,
            target_fat: 70
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'calculate_auto_macros') {
      // Calcular macros automáticamente basado en el perfil del usuario
      const { profile, cyclePhase } = await req.json()

      // Cálculo de TMB usando Mifflin-St Jeor
      let bmr
      if (profile.gender === 'male') {
        bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age)
      } else {
        bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age)
      }

      // Factores de actividad
      const activityFactors = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      }

      let tdee = bmr * activityFactors[profile.activity_level]

      // Ajustar según objetivo
      if (profile.goal === 'lose') {
        tdee *= 0.85 // Déficit del 15%
      } else if (profile.goal === 'gain') {
        tdee *= 1.15 // Superávit del 15%
      }

      // Ajustar según fase del ciclo menstrual para mujeres
      if (profile.gender === 'female' && cyclePhase) {
        switch (cyclePhase) {
          case 'menstrual':
            tdee *= 1.05 // Ligeramente más calorías
            break
          case 'luteal':
            tdee *= 1.08 // Más calorías en fase lútea
            break
        }
      }

      // Calcular macronutrientes
      const calories = Math.round(tdee)
      const protein = Math.round(profile.weight * 2.2) // 2.2g por kg
      const fat = Math.round(calories * 0.25 / 9) // 25% de calorías de grasas
      const proteinCalories = protein * 4
      const fatCalories = fat * 9
      const carbs = Math.round((calories - proteinCalories - fatCalories) / 4)

      const calculatedMacros = {
        target_calories: calories,
        target_protein: protein,
        target_carbs: carbs,
        target_fat: fat
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          macros: calculatedMacros,
          bmr: Math.round(bmr),
          tdee: Math.round(tdee)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en user-macros-manager:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
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

    const body = await req.json()
    const { action } = body

    if (action === 'get_profile') {
      const { data: profile } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) {
        return new Response(
          JSON.stringify({ user: null, isNewUser: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender)
      const tdee = calculateTDEE(bmr, profile.activity_level)
      const macros = calculateMacros(tdee, profile.goal)

      return new Response(
        JSON.stringify({ 
          user: {
            ...profile,
            bmi: calculateBMI(profile.weight, profile.height),
            bmr,
            tdee,
            recommendedMacros: macros
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'update_profile') {
      const { profileData } = body
      
      const bmr = calculateBMR(profileData.weight, profileData.height, profileData.age, profileData.gender)
      const tdee = calculateTDEE(bmr, profileData.activity_level)
      const macros = calculateMacros(tdee, profileData.goal)

      const userProfileData = {
        id: user.id,
        email: user.email,
        name: profileData.name || user.user_metadata?.full_name || null,
        age: profileData.age,
        height: profileData.height,
        weight: profileData.weight,
        gender: profileData.gender,
        activity_level: profileData.activity_level,
        goal: profileData.goal,
        target_calories: Math.round(tdee),
        target_protein: Math.round(macros.protein),
        target_carbs: Math.round(macros.carbs),
        target_fat: Math.round(macros.fat),
        google_user: !user.email?.includes('@profitness.temp'),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabaseClient
        .from('users')
        .upsert(userProfileData)
        .select()
        .single()

      if (error) throw error

      // Crear configuraciones por defecto
      await supabaseClient
        .from('user_settings')
        .upsert({
          user_id: user.id,
          updated_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: true,
          user: {
            ...data,
            bmi: calculateBMI(data.weight, data.height),
            bmr,
            tdee,
            recommendedMacros: macros
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateBMI(weight: number, height: number): number {
  if (!weight || !height) return 0
  const heightInMeters = height / 100
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (!weight || !height || !age) return 0
  
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
  }
}

function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9
  }
  
  return bmr * (multipliers[activityLevel] || 1.2)
}

function calculateMacros(tdee: number, goal: string) {
  let calories = tdee
  
  if (goal === 'lose') {
    calories = tdee - 500 // Déficit de 500 cal
  } else if (goal === 'gain') {
    calories = tdee + 300 // Superávit de 300 cal
  }

  return {
    protein: (calories * 0.25) / 4, // 25% proteína
    carbs: (calories * 0.45) / 4,   // 45% carbohidratos  
    fat: (calories * 0.30) / 9      // 30% grasas
  }
}
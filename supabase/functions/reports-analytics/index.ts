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

    const url = new URL(req.url)
    const period = url.searchParams.get('period') || '7' // días
    const reportType = url.searchParams.get('type') || 'general'

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(period))

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    if (reportType === 'nutrition') {
      // Reporte nutricional
      const { data: nutritionData } = await supabaseClient
        .from('daily_nutrition')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true })

      const { data: userTargets } = await supabaseClient
        .from('users')
        .select('target_calories, target_protein, target_carbs, target_fat')
        .eq('id', user.id)
        .single()

      // Calcular promedios
      const avgCalories = nutritionData?.reduce((sum, day) => sum + (day.total_calories || 0), 0) / (nutritionData?.length || 1) || 0
      const avgProtein = nutritionData?.reduce((sum, day) => sum + (day.total_protein || 0), 0) / (nutritionData?.length || 1) || 0
      const avgCarbs = nutritionData?.reduce((sum, day) => sum + (day.total_carbs || 0), 0) / (nutritionData?.length || 1) || 0
      const avgFat = nutritionData?.reduce((sum, day) => sum + (day.total_fat || 0), 0) / (nutritionData?.length || 1) || 0

      // Calcular adherencia a metas
      const adherence = {
        calories: userTargets?.target_calories ? (avgCalories / userTargets.target_calories) * 100 : 0,
        protein: userTargets?.target_protein ? (avgProtein / userTargets.target_protein) * 100 : 0,
        carbs: userTargets?.target_carbs ? (avgCarbs / userTargets.target_carbs) * 100 : 0,
        fat: userTargets?.target_fat ? (avgFat / userTargets.target_fat) * 100 : 0
      }

      return new Response(
        JSON.stringify({
          type: 'nutrition',
          period: period + ' días',
          data: nutritionData,
          averages: { avgCalories, avgProtein, avgCarbs, avgFat },
          targets: userTargets,
          adherence,
          insights: generateNutritionInsights(adherence, avgCalories, userTargets)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (reportType === 'hydration') {
      // Reporte de hidratación
      const { data: hydrationData } = await supabaseClient
        .from('hydration_logs')
        .select('date, amount_ml')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)

      // Agrupar por día
      const dailyTotals = hydrationData?.reduce((acc, log) => {
        acc[log.date] = (acc[log.date] || 0) + log.amount_ml
        return acc
      }, {} as Record<string, number>) || {}

      const avgDaily = Object.values(dailyTotals).reduce((a, b) => a + b, 0) / Object.keys(dailyTotals).length || 0
      const goal = 2500
      const adherenceRate = (avgDaily / goal) * 100

      return new Response(
        JSON.stringify({
          type: 'hydration',
          period: period + ' días',
          dailyTotals,
          averageDaily: avgDaily,
          goal,
          adherenceRate,
          insights: generateHydrationInsights(adherenceRate, avgDaily)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (reportType === 'weight') {
      // Reporte de peso
      const { data: weightData } = await supabaseClient
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true })

      let progress = null
      if (weightData && weightData.length > 1) {
        const firstWeight = weightData[0].weight
        const lastWeight = weightData[weightData.length - 1].weight
        progress = {
          change: lastWeight - firstWeight,
          percentage: ((lastWeight - firstWeight) / firstWeight) * 100,
          trend: lastWeight > firstWeight ? 'increase' : lastWeight < firstWeight ? 'decrease' : 'stable'
        }
      }

      return new Response(
        JSON.stringify({
          type: 'weight',
          period: period + ' días',
          data: weightData,
          progress,
          insights: generateWeightInsights(progress)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Reporte general
    const [nutritionRes, hydrationRes, weightRes, exerciseRes] = await Promise.all([
      supabaseClient.from('daily_nutrition').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
      supabaseClient.from('hydration_logs').select('date, amount_ml').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr),
      supabaseClient.from('weight_logs').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr).order('date'),
      supabaseClient.from('exercise_sessions').select('*').eq('user_id', user.id).gte('date', startDateStr).lte('date', endDateStr)
    ])

    return new Response(
      JSON.stringify({
        type: 'general',
        period: period + ' días',
        nutrition: nutritionRes.data,
        hydration: hydrationRes.data,
        weight: weightRes.data,
        exercise: exerciseRes.data,
        summary: {
          totalDays: parseInt(period),
          activeDays: nutritionRes.data?.length || 0,
          avgCalories: nutritionRes.data?.reduce((sum, day) => sum + (day.total_calories || 0), 0) / (nutritionRes.data?.length || 1) || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateNutritionInsights(adherence: any, avgCalories: number, targets: any) {
  const insights = []
  
  if (adherence.calories < 80) {
    insights.push("Estás consumiendo menos calorías de las recomendadas. Considera agregar snacks saludables.")
  } else if (adherence.calories > 120) {
    insights.push("Estás excediendo tu meta calórica. Revisa las porciones de tus comidas.")
  } else {
    insights.push("¡Excelente! Estás manteniendo un buen equilibrio calórico.")
  }

  if (adherence.protein < 80) {
    insights.push("Necesitas incrementar tu consumo de proteína. Incluye más carnes magras, huevos o legumbres.")
  }

  return insights
}

function generateHydrationInsights(adherenceRate: number, avgDaily: number) {
  const insights = []
  
  if (adherenceRate < 70) {
    insights.push("Tu hidratación está por debajo del objetivo. Establece recordatorios cada hora.")
  } else if (adherenceRate > 100) {
    insights.push("¡Excelente hidratación! Mantén este buen hábito.")
  }

  return insights
}

function generateWeightInsights(progress: any) {
  const insights = []
  
  if (progress) {
    if (progress.trend === 'decrease') {
      insights.push(`Has perdido ${Math.abs(progress.change).toFixed(1)}kg. ¡Sigue así!`)
    } else if (progress.trend === 'increase') {
      insights.push(`Has ganado ${progress.change.toFixed(1)}kg.`)
    } else {
      insights.push("Tu peso se ha mantenido estable.")
    }
  }

  return insights
}
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

    const { method } = req
    const url = new URL(req.url)
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (method === 'GET') {
      // Obtener registros de hidratación del día
      const { data: hydrationLogs } = await supabaseClient
        .from('hydration_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('time', { ascending: true })

      // Calcular total del día
      const totalIntake = hydrationLogs?.reduce((sum, log) => sum + log.amount_ml, 0) || 0

      // Obtener datos históricos (últimos 7 días)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { data: weeklyData } = await supabaseClient
        .from('hydration_logs')
        .select('date, amount_ml')
        .eq('user_id', user.id)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      // Agrupar por día
      const dailyTotals = weeklyData?.reduce((acc, log) => {
        const date = log.date
        acc[date] = (acc[date] || 0) + log.amount_ml
        return acc
      }, {} as Record<string, number>) || {}

      return new Response(
        JSON.stringify({
          todayLogs: hydrationLogs || [],
          totalIntake,
          dailyTotals,
          goal: 2500, // Meta diaria en ml
          averageWeek: Object.values(dailyTotals).reduce((a, b) => a + b, 0) / Object.keys(dailyTotals).length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'POST') {
      const body = await req.json()
      
      const { data: hydrationLog, error } = await supabaseClient
        .from('hydration_logs')
        .insert({
          user_id: user.id,
          date: body.date || date,
          amount_ml: body.amount_ml,
          time: body.time || new Date().toTimeString().split(' ')[0]
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ hydrationLog }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'DELETE') {
      const body = await req.json()
      
      const { error } = await supabaseClient
        .from('hydration_logs')
        .delete()
        .eq('id', body.logId)
        .eq('user_id', user.id)

      if (error) throw error

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
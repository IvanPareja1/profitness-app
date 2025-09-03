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

    if (method === 'GET') {
      // Obtener configuraciones del usuario
      const { data: settings } = await supabaseClient
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Obtener recordatorios
      const { data: reminders } = await supabaseClient
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)

      // Obtener días de descanso
      const { data: restDays } = await supabaseClient
        .from('rest_days')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week')

      return new Response(
        JSON.stringify({
          settings: settings || getDefaultSettings(),
          reminders: reminders || [],
          restDays: restDays || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'POST') {
      const body = await req.json()
      const { type, data } = body

      if (type === 'app_settings') {
        // Actualizar configuraciones de la app
        const { data: settings, error } = await supabaseClient
          .from('user_settings')
          .upsert({
            user_id: user.id,
            ...data,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ settings }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (type === 'reminders') {
        // Actualizar recordatorios
        await supabaseClient
          .from('reminders')
          .delete()
          .eq('user_id', user.id)

        if (data.reminders && data.reminders.length > 0) {
          const { error } = await supabaseClient
            .from('reminders')
            .insert(
              data.reminders.map((reminder: any) => ({
                user_id: user.id,
                ...reminder
              }))
            )

          if (error) throw error
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (type === 'rest_days') {
        // Actualizar días de descanso
        await supabaseClient
          .from('rest_days')
          .delete()
          .eq('user_id', user.id)

        const restDayInserts = data.restDays.map((dayConfig: any, index: number) => ({
          user_id: user.id,
          day_of_week: index,
          is_rest_day: dayConfig.isRestDay
        }))

        const { error } = await supabaseClient
          .from('rest_days')
          .insert(restDayInserts)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Tipo de configuración no válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

function getDefaultSettings() {
  return {
    dark_mode: false,
    language: 'es',
    units: 'metric',
    auto_sync: true,
    notifications_sound: true,
    notifications_vibration: true,
    do_not_disturb: true,
    do_not_disturb_start: '22:00',
    do_not_disturb_end: '07:00'
  }
}
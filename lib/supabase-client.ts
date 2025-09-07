import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lsfzabwrnjmrmdaaogsi.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZnphYndybmptcm1kYWFvZ3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTMxMjMsImV4cCI6MjA3MTcyOTEyM30.705EPuJgXmn3A90NIYj3PI2mg5owWzw05Ja40DHVBBM'

// Verificar que las variables no estén vacías
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
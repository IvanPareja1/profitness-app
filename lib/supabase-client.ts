import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lsfzabwrnjmrmdaaogsi.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZnphYndybmptcm1kYWFvZ3NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE1MzEyMywiZXhwIjoyMDcxNzI5MTIzfQ.J0-WgR7aFtlxdRmghgqRgK9XORB6Dc9acsy2OE8uN04'

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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL || 'https://lsfzabwrnjmrmdaaogsi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZnphYndybmptcm1kYWFvZ3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTMxMjMsImV4cCI6MjA3MTcyOTEyM30.705EPuJgXmn3A90NIYj3PI2mg5owWzw05Ja40DHVBBM';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  console.log('📝 Necesitas configurar:');
  console.log('   - VITE_PUBLIC_SUPABASE_URL');
  console.log('   - VITE_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Asegúrate de que las variables existen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug en consola
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Config:');
  console.log('URL:', supabaseUrl ? '✅ Presente' : '❌ Faltante');
  console.log('Key:', supabaseAnonKey ? '✅ Presente' : '❌ Faltante');
}

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Check your .env.local and Vercel settings.';
  console.error('❌', errorMsg);
  throw new Error(errorMsg);
}

// Crear cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  console.log('✅ Supabase initialized globally as window.supabase');
}
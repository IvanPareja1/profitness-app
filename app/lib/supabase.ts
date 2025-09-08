import { createClient } from '@supabase/supabase-js'

// VERIFICAR que las variables de entorno existen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    Missing Supabase environment variables!
    Please check your .env.local file:
    - NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || 'MISSING'}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey ? 'SET' : 'MISSING'}
  `);
}

// Verificar que la URL es válida
if (!supabaseUrl.includes('supabase.co')) {
  console.warn('Supabase URL might be incorrect:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

// Función de utilidad para verificar la conexión
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};
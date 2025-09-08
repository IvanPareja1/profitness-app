// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Log para debug (solo en desarrollo)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Supabase Config:', {
    url: supabaseUrl ? '✅ Configurada' : '❌ Faltante',
    key: supabaseAnonKey ? '✅ Configurada' : '❌ Faltante',
    urlLength: supabaseUrl.length,
    keyLength: supabaseAnonKey.length
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
})

// Función global para debug
if (typeof window !== 'undefined') {
  (window as any).debugAuth = async () => {
    console.log('🔍 Debugging Supabase Auth');
    
    try {
      // 1. Verificar configuración
      console.log('📋 Configuración:', {
        url: supabaseUrl ? `✅ (${supabaseUrl.length} chars)` : '❌ Faltante',
        key: supabaseAnonKey ? `✅ (${supabaseAnonKey.length} chars)` : '❌ Faltante'
      });

      // 2. Verificar sesión
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Sesión:', session);
      console.log('❌ Error de sesión:', sessionError);

      // 3. Verificar usuario
      const { data: user, error: userError } = await supabase.auth.getUser();
      console.log('👤 Usuario:', user);
      console.log('❌ Error de usuario:', userError);

      // 4. Verificar estado de autenticación
      const { data: authState } = await supabase.auth.getSession();
      console.log('🏠 Estado de auth:', authState);

      return { session, user, authState };
    } catch (error) {
      console.error('💥 Error en debug:', error);
      return { error };
    }
  };
}
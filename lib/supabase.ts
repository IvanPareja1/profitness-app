
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper para llamar Edge Functions
export async function callEdgeFunction(functionName: string, data: any, token?: string) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error)
    throw error
  }
}

// Google Auth - ÚNICO método de autenticación
export async function signInWithGoogle(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) {
      console.error('Error signing in with Google:', error);
      return false;
    }
    // Si no hay error, la redirección se inicia automáticamente
    return true;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return false;
  }
}

// Cerrar sesión
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Obtener usuario actual - SOLO usuarios de Google
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (error.message && error.message.toLowerCase().includes('auth session missing')) {
        return null;
      }
      // Solo loguea errores inesperados
      console.error('Error getting current user:', error);
      return null;
    }
    return data?.user ?? null;
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return null;
  }
}

// Función para obtener token de sesión
export async function getSessionToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

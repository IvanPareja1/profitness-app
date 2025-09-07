
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Si hay un usuario pero no perfil, crear el perfil
      if (session?.user) {
        checkAndCreateProfile(session.user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Si hay un usuario nuevo, crear el perfil
      if (session?.user) {
        checkAndCreateProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (user: User) => {
    try {
      // Verificar si el perfil existe
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // El perfil no existe, crear uno nuevo
        console.log('Creando perfil para usuario:', user.id);
        
        // Obtener la URL y clave desde las variables de entorno
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        const response = await fetch(`${supabaseUrl}/functions/v1/create-user-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ user })
        });

        if (!response.ok) {
          console.error('Error al crear perfil:', response.statusText);
        } else {
          console.log('Perfil creado exitosamente');
        }
      }
    } catch (error) {
      console.error('Error verificando perfil:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  return {
    user,
    loading,
    signOut,
    signInWithGoogle
  };
}

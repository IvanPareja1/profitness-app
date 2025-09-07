
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
          
          // Si hay un usuario pero no perfil, crear el perfil
          if (session?.user) {
            await checkAndCreateProfile(session.user);
          }
        }
      } catch (error) {
        console.error('Error en getInitialSession:', error);
        setUser(null);      
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Si hay un usuario nuevo, crear el perfil
      if (session?.user && event === 'SIGNED_IN') {
        await checkAndCreateProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (user: User) => {
    try {
      console.log('Verificando perfil para usuario:', user.email);
      
      // Verificar si el perfil existe
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // El perfil no existe, crear uno nuevo
        console.log('Creando perfil para usuario:', user.id);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
            avatar_url: user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error creando perfil:', insertError);
        } else {
          console.log('Perfil creado exitosamente');
        }
      } else if (data) {
        console.log('Perfil ya existe');
      }
    } catch (error) {
      console.error('Error verificando perfil:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error iniciando sesión con Google:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signOut,
    signInWithGoogle
  };
}

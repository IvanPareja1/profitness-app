// app/components/SupabaseChecker.tsx
'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseChecker() {
  useEffect(() => {
    console.log('🔍 SupabaseChecker mounted');
    
    if (typeof supabase === 'undefined') {
      console.error('❌ supabase is undefined');
      return;
    }

    console.log('✅ supabase is defined');
    
    // Probar conexión
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Auth error:', error);
        } else {
          console.log('✅ Auth successful - Session:', data.session ? 'Exists' : 'None');
        }
      })
      .catch(error => {
        console.error('❌ Auth exception:', error);
      });

  }, []);

  return null; // Componente invisible
}
// app/test-import.tsx
'use client';

import { useEffect } from 'react';

export default function TestImport() {
  useEffect(() => {
    // Probar importación del componente
    import('./components/SupabaseChecker')
      .then(module => {
        console.log('✅ SupabaseChecker module:', module);
        console.log('✅ Default export:', module.default);
      })
      .catch(error => {
        console.error('❌ Import error:', error);
      });

    // Probar importación de supabase
    import('./lib/supabase')
      .then(module => {
        console.log('✅ Supabase module:', module);
        console.log('✅ Supabase export:', module.supabase);
      })
      .catch(error => {
        console.error('❌ Supabase import error:', error);
      });

  }, []);

  return <div>Testing imports...</div>;
}
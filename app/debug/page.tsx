// app/debug/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const debugSupabase = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        supabaseDefined: typeof supabase !== 'undefined',
        authDefined: typeof supabase?.auth !== 'undefined'
      };

      try {
        // Test session
        const sessionResult = await supabase.auth.getSession();
        info.session = sessionResult.data;
        info.sessionError = sessionResult.error ? 
          String(sessionResult.error) : null;

        // Test user
        const userResult = await supabase.auth.getUser();
        info.user = userResult.data;
        info.userError = userResult.error ? 
          String(userResult.error) : null;

      } catch (error) {
        info.generalError = String(error);
      }

      setDebugInfo(info);
      setLoading(false);
    };

    debugSupabase();
  }, []);

  if (loading) return <div>Loading debug info...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Supabase Debug</h1>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}
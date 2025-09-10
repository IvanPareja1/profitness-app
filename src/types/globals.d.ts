declare const __BASE_PATH__: string;

declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_PUBLIC_SUPABASE_URL?: string;
    readonly VITE_PUBLIC_SUPABASE_ANON_KEY?: string;
  }
}
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lsfzabwrnjmrmdaaogsi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZnphYndybmptcm1kYWFvZ3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTMxMjMsImV4cCI6MjA3MTcyOTEyM30.705EPuJgXmn3A90NIYj3PI2mg5owWzw05Ja40DHVBBM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
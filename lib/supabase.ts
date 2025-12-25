import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fqyginpwjnmnvatvamam.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeWdpbnB3am5tbnZhdHZhbWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjUwNjgsImV4cCI6MjA2Mzg0MTA2OH0.NnOTLM8QEgfGbPBnD0YvYnPFXEkWy04MePTqVCTSvvM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client if credentials are missing to prevent app crash
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('⚠️ Supabase credentials missing! Check your .env file.')
  console.warn('The app will run in demo mode - form submissions will not be saved.')
  
  // Create a mock client that won't crash but won't actually work
  supabase = {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ error: { message: 'Supabase غير مُعَد. يرجى إضافة بيانات الاتصال في ملف .env' } })
    })
  }
}

export { supabase }

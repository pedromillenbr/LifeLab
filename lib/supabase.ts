import { createClient } from '@supabase/supabase-js'

// Fallbacks de placeholder garantem que `createClient` não lance em build/prerender
// (Next gera `/_not-found` estaticamente). Em runtime as env vars reais do Vercel sobrepõem.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'lifelab-auth',
  },
})

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ── Diagnostic logging (browser only, safe to expose in console) ──────
if (typeof window !== 'undefined') {
  if (!url || !key) {
    console.error(
      '[supabase] FATAL: missing env vars',
      { hasUrl: !!url, hasKey: !!key }
    )
  } else {
    // Log only domain prefix and key length for safety
    const safeKey = key.slice(0, 8) + '…' + key.slice(-4)
    console.log('[supabase] init', { url, keyPreview: safeKey, keyLength: key.length })

    // Sanity check: anon key must be a JWT (starts with eyJ)
    if (!key.startsWith('eyJ')) {
      console.error(
        '[supabase] WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY does not look like a JWT. ' +
        'Make sure you copied the "anon public" key, not the publishable key or service_role.'
      )
    }
  }
}

export const supabase = createClient(url ?? '', key ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'lifelab-auth',
  },
})

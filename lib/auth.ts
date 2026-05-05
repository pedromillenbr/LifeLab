import { supabase } from './supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@app.local`
}

export interface AuthResult {
  ok: boolean
  error?: string
}

interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
  token_type: string
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
  }
}

const STORAGE_KEY = 'lifelab-auth'

// Persist session in the EXACT format supabase-js expects, so its internal
// getSession() can read it back correctly on next page load.
function persistSession(tokens: AuthTokens) {
  try {
    const sessionData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type || 'bearer',
      user: tokens.user,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
  } catch (err) {
    console.error('[auth] persistSession failed:', err)
  }
}

async function fetchAuth(path: string, body: object, timeoutMs = 6000): Promise<{ ok: boolean; data?: AuthTokens; error?: string; status?: number }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timer)

    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json.msg || json.error_description || json.error || `HTTP ${res.status}`,
      }
    }

    // Compute expires_at if not present
    if (json.access_token && !json.expires_at && json.expires_in) {
      json.expires_at = Math.floor(Date.now() / 1000) + json.expires_in
    }

    return { ok: true, data: json as AuthTokens }
  } catch (err) {
    clearTimeout(timer)
    const message = err instanceof Error ? err.message : 'network error'
    if (message.includes('aborted') || message.includes('AbortError')) {
      return { ok: false, error: 'timeout' }
    }
    return { ok: false, error: message }
  }
}

export async function signUp(username: string, password: string): Promise<AuthResult> {
  if (!username || !password) {
    return { ok: false, error: 'Preencha todos os campos' }
  }

  const normalizedUsername = username.toLowerCase().trim()
  const email = toEmail(normalizedUsername)

  const result = await fetchAuth('/signup', {
    email,
    password,
    data: { username: normalizedUsername },
  })

  if (!result.ok) {
    console.error('[auth] signUp failed:', result.error, result.status)

    const err = (result.error || '').toLowerCase()
    if (
      err.includes('already registered') ||
      err.includes('already exists') ||
      err.includes('user already')
    ) {
      return { ok: false, error: 'Usuário já existe' }
    }

    if (err === 'timeout') {
      return { ok: false, error: 'Sem conexão. Verifique sua internet.' }
    }

    if (err.includes('password')) {
      return { ok: false, error: 'Senha muito curta (mínimo 6 caracteres)' }
    }

    return { ok: false, error: result.error || 'Erro ao criar conta' }
  }

  // Persist session — user is now logged in
  if (result.data) {
    persistSession(result.data)
    // Re-init supabase-js so it picks up the new session from storage
    await supabase.auth.getSession().catch(() => {})
  }

  return { ok: true }
}

export async function signIn(username: string, password: string): Promise<AuthResult> {
  if (!username || !password) {
    return { ok: false, error: 'Preencha todos os campos' }
  }

  const email = toEmail(username)

  const result = await fetchAuth('/token?grant_type=password', {
    email,
    password,
  })

  if (!result.ok) {
    console.error('[auth] signIn failed:', result.error, result.status)

    if (result.error === 'timeout') {
      return { ok: false, error: 'Sem conexão. Verifique sua internet.' }
    }

    if (result.status === 400 || (result.error || '').toLowerCase().includes('invalid')) {
      return { ok: false, error: 'Usuário ou senha inválidos' }
    }

    return { ok: false, error: 'Não foi possível entrar. Tente novamente.' }
  }

  if (result.data) {
    persistSession(result.data)
    await supabase.auth.getSession().catch(() => {})
  }

  return { ok: true }
}

export async function signOut(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.error('[auth] signOut error:', err)
  }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

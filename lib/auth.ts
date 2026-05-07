import { supabase } from './supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const STORAGE_KEY = 'lifelab-auth'

function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@app.local`
}

export interface AuthResult {
  ok: boolean
  error?: string
}

export interface StoredSession {
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

// ── Storage ──────────────────────────────────────────────────────────

function persistSession(tokens: StoredSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type || 'bearer',
      user: tokens.user,
    }))
  } catch { /* storage may be unavailable in private mode */ }
}

function clearSession() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith('sb-')) localStorage.removeItem(k)
    }
  } catch { /* ignore */ }
}

export function getLocalSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (!parsed?.access_token || !parsed?.refresh_token || !parsed?.user?.id) return null
    return parsed as StoredSession
  } catch {
    return null
  }
}

function isExpired(session: StoredSession, graceSeconds = 60): boolean {
  if (!session.expires_at) return false
  return Math.floor(Date.now() / 1000) >= session.expires_at - graceSeconds
}

// ── Auth REST helper ─────────────────────────────────────────────────

interface AuthFetchResult {
  ok: boolean
  data?: StoredSession
  error?: string
  status?: number
}

async function fetchAuth(path: string, body: object): Promise<AuthFetchResult> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(body),
    })

    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json.msg || json.error_description || json.error || `HTTP ${res.status}`,
      }
    }

    if (json.access_token && !json.expires_at && json.expires_in) {
      json.expires_at = Math.floor(Date.now() / 1000) + json.expires_in
    }

    return { ok: true, data: json as StoredSession }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'network error'
    return { ok: false, error: message }
  }
}

// ── Refresh & validation ─────────────────────────────────────────────

let _refreshPromise: Promise<StoredSession | null> | null = null

async function refreshSession(refreshToken: string): Promise<StoredSession | null> {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = (async () => {
    const result = await fetchAuth('/token?grant_type=refresh_token', {
      refresh_token: refreshToken,
    })
    if (!result.ok || !result.data) {
      // Refresh token invalid → wipe so app falls back to /auth
      if (result.status === 400 || result.status === 401) clearSession()
      return null
    }
    persistSession(result.data)
    return result.data
  })()
  try {
    return await _refreshPromise
  } finally {
    _refreshPromise = null
  }
}

export async function ensureValidSession(): Promise<StoredSession | null> {
  const local = getLocalSession()
  if (!local) return null
  if (!isExpired(local)) return local
  return refreshSession(local.refresh_token)
}

// Best-effort: tell supabase-js about the session so its built-in
// `from()`/etc work too.
export async function warmSupabaseClient(session: StoredSession): Promise<void> {
  try {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    })
  } catch { /* non-fatal: REST path uses tokens directly */ }
}

// ── Sign up / Sign in / Sign out ─────────────────────────────────────

export async function signUp(username: string, password: string): Promise<AuthResult> {
  const u = username.trim()
  if (!u || !password) return { ok: false, error: 'Preencha todos os campos' }
  if (password.length < 6) return { ok: false, error: 'A senha precisa ter pelo menos 6 caracteres' }

  const email = toEmail(u)

  const result = await fetchAuth('/signup', {
    email,
    password,
    data: { username: u.toLowerCase() },
  })

  if (!result.ok) {
    const err = (result.error || '').toLowerCase()
    if (err.includes('already registered') || err.includes('already exists') || err.includes('user already')) {
      return { ok: false, error: 'Usuário já existe' }
    }
    if (err.includes('password')) {
      return { ok: false, error: 'Senha muito curta (mínimo 6 caracteres)' }
    }
    return { ok: false, error: result.error || 'Erro ao criar conta' }
  }

  if (result.data?.access_token) {
    persistSession(result.data)
    warmSupabaseClient(result.data).catch(() => {})
    return { ok: true }
  }

  // No access_token in response → confirm-email is ON in Supabase.
  // Retry as login (works when confirm-email is off and signup didn't return tokens).
  const signin = await fetchAuth('/token?grant_type=password', { email, password })
  if (signin.ok && signin.data) {
    persistSession(signin.data)
    warmSupabaseClient(signin.data).catch(() => {})
    return { ok: true }
  }
  return { ok: false, error: 'Conta criada, mas o login automático falhou. Tente entrar.' }
}

export async function signIn(username: string, password: string): Promise<AuthResult> {
  const u = username.trim()
  if (!u || !password) return { ok: false, error: 'Preencha todos os campos' }

  const email = toEmail(u)
  const result = await fetchAuth('/token?grant_type=password', { email, password })

  if (!result.ok) {
    if (result.status === 400 || (result.error || '').toLowerCase().includes('invalid')) {
      return { ok: false, error: 'Usuário ou senha inválidos' }
    }
    return { ok: false, error: 'Não foi possível entrar. Tente novamente.' }
  }

  if (result.data) {
    persistSession(result.data)
    warmSupabaseClient(result.data).catch(() => {})
  }

  return { ok: true }
}

export async function signOut(): Promise<void> {
  const local = getLocalSession()
  clearSession()
  if (local?.access_token) {
    fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${local.access_token}`,
      },
    }).catch(() => {})
  }
  try { await supabase.auth.signOut() } catch { /* ignore */ }
}

export async function getSession() {
  return ensureValidSession()
}

// ── REST helpers for authenticated PostgREST calls ───────────────────

export interface RestOptions extends RequestInit {
  /** If true, do not auto-refresh the token on 401 (avoids loops). */
  noAutoRefresh?: boolean
  /** Optional override for fetch timeout (ms). 0/undefined = no timeout. */
  timeoutMs?: number
}

export async function restFetch(path: string, opts: RestOptions = {}): Promise<Response> {
  const session = await ensureValidSession()
  if (!session) throw new Error('no-session')

  const { noAutoRefresh, headers, timeoutMs, ...rest } = opts

  let signal = rest.signal
  let timer: ReturnType<typeof setTimeout> | null = null
  if (timeoutMs && timeoutMs > 0) {
    const controller = new AbortController()
    timer = setTimeout(() => controller.abort(), timeoutMs)
    signal = controller.signal
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      ...rest,
      signal,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
    })

    if (res.status === 401 && !noAutoRefresh) {
      const fresh = await refreshSession(session.refresh_token)
      if (fresh) return restFetch(path, { ...opts, noAutoRefresh: true })
    }

    return res
  } finally {
    if (timer) clearTimeout(timer)
  }
}

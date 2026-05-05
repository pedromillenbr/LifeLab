import { supabase } from './supabase'

// username → email interno nunca exposto ao usuário
function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@app.local`
}

export interface AuthResult {
  ok: boolean
  error?: string
}

// Hard timeout for any auth network call — guarantees the UI never hangs.
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timeout after ${ms}ms`))
    }, ms)
    promise.then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) },
    )
  })
}

export async function signUp(username: string, password: string): Promise<AuthResult> {
  if (!username || !password) {
    return { ok: false, error: 'Preencha todos os campos' }
  }

  const normalizedUsername = username.toLowerCase().trim()
  const email = toEmail(normalizedUsername)

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: normalizedUsername },
        },
      }),
      8000,
      'signUp',
    )

    if (error) {
      console.error('[auth] SIGNUP ERROR:', error)

      const msg = error.message.toLowerCase()
      if (
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('user already')
      ) {
        return { ok: false, error: 'Usuário já existe' }
      }

      return { ok: false, error: error.message }
    }

    // Sign-out the auto-created session so onAuthStateChange doesn't fire
    // SIGNED_IN immediately and cause a race with the UI redirect.
    // The user will sign in manually right after.
    if (data.session) {
      try {
        await withTimeout(supabase.auth.signOut(), 3000, 'post-signup signOut')
      } catch { /* best effort */ }
    }

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[auth] signUp exception:', message)

    // Even if we timed out waiting for the response, the account may have
    // been created on Supabase's side. Tell the user to try logging in.
    if (message.includes('timeout')) {
      return { ok: false, error: 'A conta pode ter sido criada. Tente fazer login.' }
    }

    return { ok: false, error: 'Não foi possível criar a conta. Tente novamente.' }
  }
}

export async function signIn(username: string, password: string): Promise<AuthResult> {
  if (!username || !password) {
    return { ok: false, error: 'Preencha todos os campos' }
  }

  const email = toEmail(username)

  try {
    const { error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      8000,
      'signIn',
    )

    if (error) {
      console.error('[auth] LOGIN ERROR:', error)
      return { ok: false, error: 'Usuário ou senha inválidos' }
    }

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[auth] signIn exception:', message)
    return { ok: false, error: 'Não foi possível entrar. Tente novamente.' }
  }
}

export async function signOut(): Promise<void> {
  try {
    await withTimeout(supabase.auth.signOut(), 5000, 'signOut')
  } catch (err) {
    console.error('[auth] signOut exception:', err)
  }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

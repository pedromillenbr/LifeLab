import { supabase } from './supabase'

// username → email interno nunca exposto ao usuário
function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@app.local`
}

export interface AuthResult {
  ok: boolean
  error?: string
}

export async function signUp(username: string, password: string): Promise<AuthResult> {
  if (!username || !password) {
    return { ok: false, error: 'Preencha todos os campos' }
  }

  const normalizedUsername = username.toLowerCase().trim()
  const email = toEmail(normalizedUsername)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('SIGNUP ERROR:', error)

    if (
      error.message.toLowerCase().includes('already registered') ||
      error.message.toLowerCase().includes('already exists') ||
      error.message.toLowerCase().includes('user already')
    ) {
      return { ok: false, error: 'Usuário já existe' }
    }

    return { ok: false, error: error.message }
  }

  // 🔥 cria profile manualmente (já que removemos o trigger)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: normalizedUsername,
      })

    if (profileError) {
      console.error('PROFILE ERROR:', profileError)
      return { ok: false, error: profileError.message }
    }
  }

  return { ok: true }
}

export async function signIn(username: string, password: string): Promise<AuthResult> {
  if (!username || !password) {
    return { ok: false, error: 'Preencha todos os campos' }
  }

  const email = toEmail(username)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('LOGIN ERROR:', error)
    return { ok: false, error: 'Usuário ou senha inválidos' }
  }

  return { ok: true }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
} 
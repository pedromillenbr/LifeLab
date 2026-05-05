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
  const email = toEmail(username)

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists') ||
        error.message.toLowerCase().includes('user already')) {
      return { ok: false, error: 'Usuário já existe' }
    }
    return { ok: false, error: 'Erro ao criar conta. Tente novamente.' }
  }

  return { ok: true }
}

export async function signIn(username: string, password: string): Promise<AuthResult> {
  const email = toEmail(username)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
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

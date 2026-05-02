/**
 * Notificações nativas do navegador (Web Notifications API).
 * Funciona enquanto a página está aberta — não há service worker.
 */

export type PermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported'

export function getNotificationPermission(): PermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const r = await Notification.requestPermission()
    return r as PermissionStatus
  } catch {
    return 'denied'
  }
}

export interface SendOptions {
  body?: string
  icon?: string
  tag?: string
  silent?: boolean
}

export function sendNotification(title: string, options: SendOptions = {}): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) return null
  if (Notification.permission !== 'granted') return null
  try {
    const n = new Notification(title, {
      body: options.body,
      icon: options.icon ?? '/favicon.ico',
      tag: options.tag,
      silent: options.silent,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
    return n
  } catch {
    return null
  }
}

const STORAGE_KEY = 'lifelab.lastDailyNotificationDate'

/**
 * Dispara um lembrete diário (se ainda não disparado hoje e dentro
 * da janela de horário). Idempotente — pode ser chamada várias vezes.
 *
 * @param hourStart Hora a partir da qual o lembrete pode disparar (default 9)
 */
export function fireDailyReminderIfDue(
  title: string,
  body: string,
  hourStart = 9,
): boolean {
  if (typeof window === 'undefined') return false
  if (getNotificationPermission() !== 'granted') return false

  const now = new Date()
  if (now.getHours() < hourStart) return false

  const todayKey = now.toISOString().split('T')[0]
  const last = window.localStorage.getItem(STORAGE_KEY)
  if (last === todayKey) return false

  const result = sendNotification(title, { body, tag: 'lifelab-daily' })
  if (result) {
    window.localStorage.setItem(STORAGE_KEY, todayKey)
    return true
  }
  return false
}

export function clearDailyReminderState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

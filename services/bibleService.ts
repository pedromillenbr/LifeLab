/**
 * Bible API service — fetch passages from bible-api.com with localStorage cache + in-flight dedup.
 * Reference format: "John 3", "Psalm 23", "John 3:16-21".
 */

const CACHE_VERSION = 'v1'
const CACHE_PREFIX = `bible:${CACHE_VERSION}:`

export interface PassageVerse {
  book_id?: string
  book_name: string
  chapter: number
  verse: number
  text: string
}

export interface Passage {
  reference: string
  text: string
  verses: PassageVerse[]
  translation_id?: string
  translation_name?: string
}

export class BibleAPIError extends Error {
  constructor(message: string, public reference: string) {
    super(message)
    this.name = 'BibleAPIError'
  }
}

const inflight = new Map<string, Promise<Passage>>()

function cacheKey(reference: string) {
  return CACHE_PREFIX + reference.trim().toLowerCase()
}

function readCache(reference: string): Passage | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(cacheKey(reference))
    return raw ? JSON.parse(raw) as Passage : null
  } catch {
    return null
  }
}

function writeCache(reference: string, passage: Passage) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(cacheKey(reference), JSON.stringify(passage))
  } catch {
    // quota exceeded — silently ignore, will refetch next time
  }
}

export async function fetchPassage(reference: string): Promise<Passage> {
  const ref = reference.trim()
  if (!ref) throw new BibleAPIError('Referência vazia', ref)

  const cached = readCache(ref)
  if (cached) return cached

  const existing = inflight.get(ref)
  if (existing) return existing

  const promise = (async () => {
    let res: Response
    try {
      res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=almeida`, {
        headers: { Accept: 'application/json' },
      })
    } catch (e) {
      throw new BibleAPIError('Falha de conexão com a API da Bíblia', ref)
    }
    if (!res.ok) {
      throw new BibleAPIError(`API respondeu com status ${res.status}`, ref)
    }
    const data = await res.json()
    if (!data || !Array.isArray(data.verses)) {
      throw new BibleAPIError('Resposta inesperada da API', ref)
    }
    const passage: Passage = {
      reference: data.reference || ref,
      text: data.text || '',
      verses: data.verses,
      translation_id: data.translation_id,
      translation_name: data.translation_name,
    }
    writeCache(ref, passage)
    return passage
  })()

  inflight.set(ref, promise)
  try {
    return await promise
  } finally {
    inflight.delete(ref)
  }
}

export function clearPassageCache() {
  if (typeof window === 'undefined') return
  const toRemove: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k && k.startsWith(CACHE_PREFIX)) toRemove.push(k)
  }
  toRemove.forEach(k => window.localStorage.removeItem(k))
}

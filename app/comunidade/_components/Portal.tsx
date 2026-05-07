'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders children into document.body so `position: fixed` is anchored
 * to the viewport, not to an ancestor that creates a containing block
 * via `transform` / `filter` / `backdrop-filter`.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

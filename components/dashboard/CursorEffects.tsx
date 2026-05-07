'use client'

import { useEffect } from 'react'

export function CursorEffects() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const glow = document.getElementById('cursor-glow')
    if (!glow) return

    let pendingX = 0
    let pendingY = 0
    let raf = 0
    const flush = () => {
      glow.style.transform = `translate3d(${pendingX}px, ${pendingY}px, 0) translate(-50%, -50%)`
      raf = 0
    }
    const move = (e: MouseEvent) => {
      pendingX = e.clientX
      pendingY = e.clientY
      if (!raf) raf = requestAnimationFrame(flush)
    }
    document.addEventListener('mousemove', move, { passive: true })

    return () => {
      if (raf) cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', move)
    }
  }, [])

  return <div id="cursor-glow" aria-hidden="true" />
}

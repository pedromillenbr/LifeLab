'use client'

import { useEffect } from 'react'

export function CursorEffects() {
  useEffect(() => {
    const glow = document.getElementById('cursor-glow')
    if (!glow) return
    const move = (e: MouseEvent) => {
      glow.style.left = e.clientX + 'px'
      glow.style.top = e.clientY + 'px'
    }
    document.addEventListener('mousemove', move)

    // Floating particles
    const canvas = document.createElement('canvas')
    canvas.id = 'particle-canvas'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0
    const particles: { x: number; y: number; r: number; vx: number; vy: number; a: number; da: number }[] = []
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 40; i++) particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 0.9 + 0.3,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -Math.random() * 0.18 - 0.06,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.008,
    })
    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a += p.da
        if (p.a < 0) { p.a = 0; p.da *= -1 }
        if (p.a > 1) { p.a = 1; p.da *= -1 }
        if (p.y < -4) p.y = H + 4
        if (p.x < -4) p.x = W + 4
        if (p.x > W + 4) p.x = -4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(34,197,94,${p.a * 0.35})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', move)
      canvas.remove()
    }
  }, [])

  return <div id="cursor-glow" aria-hidden="true" />
}

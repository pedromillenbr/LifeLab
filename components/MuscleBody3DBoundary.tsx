'use client'
import React from 'react'

interface State { hasError: boolean }

/**
 * Isola o canvas 3D do resto da página. Qualquer crash do Three.js
 * (WebGL indisponível, driver, etc.) mostra um placeholder em vez
 * de derrubar a página inteira.
 */
export class MuscleBody3DBoundary extends React.Component<
  { children: React.ReactNode; height?: number },
  State
> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[MuscleBody3D] crash:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: this.props.height ?? 380,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'rgba(255,255,255,.55)', fontSize: 12, textAlign: 'center',
            padding: 16,
          }}
        >
          <span style={{ fontSize: 28 }}>🧍</span>
          <span>Visualização 3D indisponível neste dispositivo.</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
            (Seus dados de treino continuam sendo registrados normalmente.)
          </span>
        </div>
      )
    }
    return this.props.children
  }
}

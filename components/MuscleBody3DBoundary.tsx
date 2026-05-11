'use client'
import React from 'react'

interface State {
  hasError: boolean
  errorMessage: string
  showDetails: boolean
}

/**
 * Isola o canvas 3D do resto da página. Qualquer crash do Three.js
 * (WebGL indisponível, driver, etc.) mostra um placeholder em vez
 * de derrubar a página inteira. O usuário pode expandir para ver
 * a mensagem de erro (útil pra reportar bugs).
 */
export class MuscleBody3DBoundary extends React.Component<
  { children: React.ReactNode; height?: number },
  State
> {
  state: State = { hasError: false, errorMessage: '', showDetails: false }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    return { hasError: true, errorMessage: message }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[MuscleBody3D] crash:', error, info)
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
          <button
            type="button"
            onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
            style={{
              marginTop: 8, fontSize: 11,
              background: 'transparent', border: '1px solid rgba(255,255,255,.15)',
              color: 'rgba(255,255,255,.55)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
            }}
          >
            {this.state.showDetails ? 'Ocultar detalhes técnicos' : 'Detalhes técnicos'}
          </button>
          {this.state.showDetails && (
            <pre
              style={{
                marginTop: 6, padding: 10, fontSize: 10, lineHeight: 1.5,
                maxWidth: '100%', overflow: 'auto',
                background: 'rgba(0,0,0,.4)', borderRadius: 6,
                color: '#f87171', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}
            >
              {this.state.errorMessage}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

import type { Metadata } from 'next'
import './globals.css'
import dynamic from 'next/dynamic'
import { Syne, Inter, JetBrains_Mono } from 'next/font/google'
import { Sidebar } from '@/components/Sidebar'
import { StoreHydration } from '@/components/StoreHydration'

const CursorEffects = dynamic(
  () => import('@/components/dashboard/CursorEffects').then(m => ({ default: m.CursorEffects })),
  { ssr: false }
)

const syne = Syne({ subsets: ['latin'], weight: ['400','500','600','700','800'], display: 'swap', variable: '--font-syne' })
const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700'], display: 'swap', variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500','600','700'], display: 'swap', variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'LifeLab',
  description: 'Seu sistema pessoal de alta performance',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        className="flex min-h-screen"
        style={{ background: 'var(--color-bg-1)', color: 'var(--color-text-main)' }}
      >
        <StoreHydration />

        {/* Mesh background animado — AuraLab v2 */}
        <div className="mesh-bg" aria-hidden="true" />

        {/* Cursor glow follower + floating particles canvas */}
        <CursorEffects />

        <Sidebar />

        <main
          className="flex-1 min-h-screen overflow-auto"
          style={{ marginLeft: 56, position: 'relative', zIndex: 1 }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import dynamic from 'next/dynamic'
import { Syne, Inter, JetBrains_Mono } from 'next/font/google'
import { Sidebar } from '@/components/Sidebar'
import { MobileNav } from '@/components/MobileNav'
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LifeLab',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0c10',
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* PWA & App Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LifeLab" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0b0c10" />
        <meta name="msapplication-TileColor" content="#0b0c10" />
        
        {/* Fullscreen support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
      </head>
      <body
        className="flex flex-col min-h-screen md:flex-row"
        style={{ background: 'var(--color-bg-1)', color: 'var(--color-text-main)', WebkitTouchCallout: 'none' }}
      >
        <StoreHydration />

        {/* Mesh background animado — AuraLab v2 */}
        <div className="mesh-bg" aria-hidden="true" />

        {/* Cursor glow follower + floating particles canvas */}
        <CursorEffects />

        <Sidebar />
        <MobileNav />

        <main
          className="flex-1 min-h-screen overflow-x-hidden md:overflow-auto pb-20 md:pb-0 md:ml-[56px]"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}

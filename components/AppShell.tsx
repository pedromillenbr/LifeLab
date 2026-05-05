'use client'

import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/Sidebar'
import { MobileNav } from '@/components/MobileNav'
import { StoreHydration } from '@/components/StoreHydration'

const CursorEffects = dynamic(
  () => import('@/components/dashboard/CursorEffects').then(m => ({ default: m.CursorEffects })),
  { ssr: false }
)

export function AppShell() {
  return (
    <>
      <StoreHydration />
      <CursorEffects />
      <Sidebar />
      <MobileNav />
    </>
  )
}

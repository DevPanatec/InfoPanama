'use client'

import { ConvexProvider } from 'convex/react'
import { ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

console.log('🔌 Convex URL:', process.env.NEXT_PUBLIC_CONVEX_URL)
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  console.log('🔌 ConvexClientProvider rendering')
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  )
}

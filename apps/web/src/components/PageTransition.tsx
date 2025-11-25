'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // No hacer transición en el primer render para evitar flash
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={`transition-opacity duration-100 ${
        isVisible ? 'opacity-100' : 'opacity-95'
      }`}
    >
      {children}
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

export function LoadingBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // No mostrar en el primer render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setVisible(true)
    setProgress(0)

    // Animación progresiva
    const timer1 = setTimeout(() => setProgress(30), 50)
    const timer2 = setTimeout(() => setProgress(60), 150)
    const timer3 = setTimeout(() => setProgress(90), 300)
    const timer4 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 200)
    }, 400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-slate-200">
      <div
        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

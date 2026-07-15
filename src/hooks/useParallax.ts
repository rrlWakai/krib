import { useEffect, useRef } from 'react'

export function useParallax(speed = 0.4) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScroll = () => {
      const scrolled = window.scrollY
      el.style.transform = `translateY(${scrolled * speed}px) scale(1.05)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return ref
}

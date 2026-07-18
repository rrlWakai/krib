import { useState, useEffect, useRef } from 'react'

export function useScrollDirection({ threshold = 10 }: { threshold?: number } = {}) {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [isAtBottom, setIsAtBottom] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight

      if (scrollY > lastScrollY.current + threshold) {
        setScrollDirection('down')
      } else if (scrollY < lastScrollY.current - threshold) {
        setScrollDirection('up')
      }

      setIsAtBottom(scrollY + winHeight >= docHeight - 100)
      lastScrollY.current = scrollY
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { scrollDirection, isAtBottom }
}

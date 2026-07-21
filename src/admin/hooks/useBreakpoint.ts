import { useState, useEffect, useCallback } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop'

interface BreakpointConfig {
  current: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isLaptop: boolean
  isDesktop: boolean
  sidebarWidth: number
}

const breakpoints = {
  mobile: 0,
  tablet: 768,
  laptop: 1024,
  desktop: 1536,
} as const

function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.desktop) return 'desktop'
  if (width >= breakpoints.laptop) return 'laptop'
  if (width >= breakpoints.tablet) return 'tablet'
  return 'mobile'
}

export function useBreakpoint(): BreakpointConfig {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )

  useEffect(() => {
    let rafId: number
    let lastWidth = width

    function handleResize() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const newWidth = window.innerWidth
        if (newWidth !== lastWidth) {
          lastWidth = newWidth
          setWidth(newWidth)
        }
      })
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const current = getBreakpoint(width)

  return {
    current,
    isMobile: current === 'mobile',
    isTablet: current === 'tablet',
    isLaptop: current === 'laptop',
    isDesktop: current === 'desktop',
    sidebarWidth: current === 'mobile' ? 0 : current === 'tablet' ? 0 : 240,
  }
}

export function useSidebarState() {
  const bp = useBreakpoint()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const isOpen = bp.isMobile || bp.isTablet ? mobileOpen : !collapsed

  const toggle = useCallback(() => {
    if (bp.isMobile || bp.isTablet) {
      setMobileOpen((p) => !p)
    } else {
      setCollapsed((p) => !p)
    }
  }, [bp.isMobile, bp.isTablet])

  const close = useCallback(() => {
    if (bp.isMobile || bp.isTablet) {
      setMobileOpen(false)
    }
  }, [bp.isMobile, bp.isTablet])

  const sidebarWidth = bp.isMobile || bp.isTablet
    ? 0
    : collapsed
    ? 72
    : 240

  return {
    ...bp,
    mobileOpen,
    collapsed,
    isOpen,
    sidebarWidth,
    toggle,
    close,
  }
}

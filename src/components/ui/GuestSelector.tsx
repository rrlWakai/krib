import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, ChevronDown } from 'lucide-react'

export interface GuestCount {
  adults: number
  children: number
  infants: number
  pets: number
}

interface GuestSelectorProps {
  maxGuests: number
  villaName: string
  value?: GuestCount
  onChange?: (guests: GuestCount) => void
}

const defaultGuests: GuestCount = { adults: 2, children: 0, infants: 0, pets: 0 }

const CATEGORIES = [
  { key: 'adults' as const, label: 'Adults', description: 'Ages 13+', min: 1 },
  { key: 'children' as const, label: 'Children', description: 'Ages 2–12', min: 0 },
  { key: 'infants' as const, label: 'Infants', description: 'Under 2 years', min: 0 },
  { key: 'pets' as const, label: 'Pets', description: 'Service animals welcome', min: 0 },
]

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } },
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { y: '100%', transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } },
}

export function GuestSelector({ maxGuests, villaName, value, onChange }: GuestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [guests, setGuests] = useState<GuestCount>(value ?? defaultGuests)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (isMobile && isOpen) {
      const alreadyLocked = document.body.style.position === 'fixed'
      if (!alreadyLocked) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      const alreadyLocked = document.body.style.position === 'fixed'
      if (!alreadyLocked) {
        document.body.style.overflow = ''
      }
    }
    return () => {
      const alreadyLocked = document.body.style.position === 'fixed'
      if (!alreadyLocked) {
        document.body.style.overflow = ''
      }
    }
  }, [isMobile, isOpen])

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) {
        focusable[0].focus()
      }
      const handleTabTrap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last?.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
      }
      document.addEventListener('keydown', handleTabTrap)
      return () => document.removeEventListener('keydown', handleTabTrap)
    }
  }, [isOpen])

  const totalOccupancy = guests.adults + guests.children
  const atCapacity = totalOccupancy >= maxGuests

  const updateCount = useCallback((key: keyof GuestCount, delta: number) => {
    setGuests((prev) => {
      const next = { ...prev, [key]: Math.max(prev[key] + delta, 0) }
      if (key === 'adults' || key === 'children') {
        const newOcc = next.adults + next.children
        if (newOcc > maxGuests) return prev
      }
      if (key === 'adults' && next.adults < 1) return prev
      onChange?.(next)
      return next
    })
  }, [maxGuests, onChange])

  const canIncrement = (key: keyof GuestCount) => {
    if (key === 'adults' || key === 'children') {
      return !atCapacity
    }
    return true
  }

  const getTriggerLabel = () => {
    const total = guests.adults + guests.children
    return `${total} ${total === 1 ? 'Guest' : 'Guests'}`
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-2 bg-transparent text-on-surface font-body text-body-md focus:outline-none cursor-pointer group"
      >
        <span>{getTriggerLabel()}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronDown size={16} className="text-on-surface-variant group-hover:text-primary transition-colors" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 z-[110] md:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
            )}

            <motion.div
              ref={panelRef}
              role="listbox"
              aria-label="Guest selection"
              variants={isMobile ? sheetVariants : dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`
                bg-white shadow-modal border-0 z-[115] overflow-y-auto

                /* Mobile: bottom sheet */
                fixed bottom-0 left-0 right-0 rounded-t-[20px] max-h-[85vh]
                pb-[env(safe-area-inset-bottom,24px)]

                /* Desktop: floating dropdown */
                md:absolute md:top-full md:left-0 md:mt-2
                md:rounded-[20px] md:border md:border-outline-variant
                md:w-[380px] md:max-h-[none] md:shadow-elevated
                md:pb-0 md:static md:overflow-visible
              `}
            >
              {isMobile && (
                <div className="flex justify-center pt-3 pb-1 md:hidden">
                  <div className="w-8 h-1 rounded-full bg-outline/50" />
                </div>
              )}

              <div className="px-6 pt-4 pb-2 md:pt-6 md:pb-1">
                {CATEGORIES.map((cat) => {
                  const count = guests[cat.key]
                  const canAdd = canIncrement(cat.key)
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="font-body font-medium text-on-surface text-sm">
                            {cat.label}
                          </p>
                          <p className="font-body text-[13px] leading-tight text-on-surface-variant/70 mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateCount(cat.key, -1)}
                            disabled={count <= cat.min}
                            aria-label={`Remove ${cat.label.toLowerCase()}`}
                            className={`
                              w-[42px] h-[42px] rounded-full border flex items-center justify-center
                              transition-all duration-250 ease-out
                              ${count <= cat.min
                                ? 'border-outline/30 text-outline/30 cursor-not-allowed'
                                : 'border-outline text-on-surface-variant hover:border-[#4F91B8] hover:text-[#4F91B8] active:scale-90 cursor-pointer'
                              }
                            `}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-body font-semibold text-body-md text-on-surface tabular-nums">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCount(cat.key, 1)}
                            disabled={
                              (cat.key === 'adults' || cat.key === 'children') && !canAdd
                            }
                            aria-label={`Add ${cat.label.toLowerCase()}`}
                            className={`
                              w-[42px] h-[42px] rounded-full border flex items-center justify-center
                              transition-all duration-250 ease-out
                              ${(cat.key === 'adults' || cat.key === 'children') && !canAdd
                                ? 'border-outline/30 text-outline/30 cursor-not-allowed'
                                : 'border-outline text-on-surface-variant hover:border-[#4F91B8] hover:text-[#4F91B8] active:scale-90 cursor-pointer'
                              }
                            `}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      {CATEGORIES.indexOf(cat) < CATEGORIES.length - 1 && (
                        <div className="h-px bg-outline-variant/60" />
                      )}
                    </div>
                  )
                })}
              </div>

              {atCapacity && (
                <div className="px-6 pb-2 md:pb-1">
                  <p className="font-body text-[13px] text-[#4F91B8] font-medium">
                    Maximum occupancy of {maxGuests} guests reached for {villaName}.
                  </p>
                </div>
              )}

              <div className="px-6 py-3 md:py-4 flex items-center justify-between border-t border-outline-variant/60">
                <p className="font-body text-[13px] font-semibold text-on-surface-variant">
                  Max occupancy: {maxGuests} guests
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="font-body text-label-caps text-primary uppercase tracking-[0.12em] hover:text-primary-hover transition-colors duration-200 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

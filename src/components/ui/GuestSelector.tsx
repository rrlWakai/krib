import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'

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
  { key: 'adults' as const, label: 'Adults', description: 'Age 13+', min: 1, max: Infinity },
  { key: 'children' as const, label: 'Children', description: 'Age 2-12', min: 0, max: Infinity },
  { key: 'infants' as const, label: 'Infants', description: 'Under 2', min: 0, max: Infinity },
  { key: 'pets' as const, label: 'Pets', description: 'Maximum 2', min: 0, max: 10 },
]

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } },
}

const modalVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } },
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 34 } },
  exit: { y: '100%', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
}

export function GuestSelector({ maxGuests, villaName, value, onChange }: GuestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [guests, setGuests] = useState<GuestCount>(value ?? defaultGuests)
  const [isMobile, setIsMobile] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

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
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, isOpen])

  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 50)
    }
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const all = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!all || all.length === 0) return
      const first = all[0]
      const last = all[all.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
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
      const cat = CATEGORIES.find((c) => c.key === key)
      if (cat && next[key] > cat.max) return prev
      onChange?.(next)
      return next
    })
  }, [maxGuests, onChange])

  const canIncrement = useCallback((key: keyof GuestCount) => {
    if (key === 'adults' || key === 'children') {
      return !atCapacity
    }
    const cat = CATEGORIES.find((c) => c.key === key)
    if (cat && guests[key] >= cat.max) return false
    return true
  }, [atCapacity, guests])

  const totalGuests = guests.adults + guests.children
  const summaryLabel = `${totalGuests} ${totalGuests === 1 ? 'Guest' : 'Guests'}`

  const detailParts: string[] = []
  if (guests.adults > 0) detailParts.push(`${guests.adults} Adult${guests.adults !== 1 ? 's' : ''}`)
  if (guests.children > 0) detailParts.push(`${guests.children} Child${guests.children !== 1 ? 'ren' : ''}`)
  if (guests.infants > 0) detailParts.push(`${guests.infants} Infant${guests.infants !== 1 ? 's' : ''}`)
  if (guests.pets > 0) detailParts.push(`${guests.pets} Pet${guests.pets !== 1 ? 's' : ''}`)
  const detailLabel = detailParts.join(', ')

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-body text-body-md text-on-surface font-medium">
            {summaryLabel}
          </p>
          {detailLabel && (
            <p className="font-body text-[13px] text-on-surface-variant/70 mt-0.5 truncate">
              {detailLabel}
            </p>
          )}
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="ml-3 shrink-0 font-body text-[12px] font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary-hover focus:outline-none focus:text-primary-hover cursor-pointer"
        >
          Change
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[120] flex items-end justify-center md:items-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false)
            }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

            {isMobile ? (
              <motion.div
                ref={panelRef}
                variants={sheetVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="dialog"
                aria-label="Guest selection"
                aria-modal="true"
                data-lenis-prevent
                className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1 w-8 rounded-full bg-outline/50" />
                </div>

                <div className="px-6 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-headline-sm text-on-surface">
                      Guests
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        triggerRef.current?.focus()
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant/50 transition-colors hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <PanelContent
                  guests={guests}
                  maxGuests={maxGuests}
                  villaName={villaName}
                  atCapacity={atCapacity}
                  updateCount={updateCount}
                  canIncrement={canIncrement}
                />

                <div className="px-6 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      triggerRef.current?.focus()
                    }}
                    className="w-full rounded-full bg-primary py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-on-primary transition-all duration-300 hover:bg-primary-hover cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                ref={panelRef}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="dialog"
                aria-label="Guest selection"
                aria-modal="true"
                className="relative z-10 w-full max-w-[380px] rounded-[20px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                  <h3 className="font-display text-headline-sm text-on-surface">
                    Guests
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      triggerRef.current?.focus()
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant/50 transition-colors hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <PanelContent
                  guests={guests}
                  maxGuests={maxGuests}
                  villaName={villaName}
                  atCapacity={atCapacity}
                  updateCount={updateCount}
                  canIncrement={canIncrement}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function PanelContent({
  guests,
  maxGuests,
  villaName,
  atCapacity,
  updateCount,
  canIncrement,
}: {
  guests: GuestCount
  maxGuests: number
  villaName: string
  atCapacity: boolean
  updateCount: (key: keyof GuestCount, delta: number) => void
  canIncrement: (key: keyof GuestCount) => boolean
}) {
  return (
    <div className="px-6">
      {CATEGORIES.map((cat) => {
        const count = guests[cat.key]
        const canAdd = canIncrement(cat.key)
        const atMin = count <= cat.min
        return (
          <div key={cat.key}>
            <div className="flex items-center justify-between py-4">
              <div className="min-w-0 flex-1 pr-4">
                <p className="font-body text-sm font-medium text-on-surface">
                  {cat.label}
                </p>
                <p className="font-body text-[13px] leading-tight text-on-surface-variant/70 mt-0.5">
                  {cat.description}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => updateCount(cat.key, -1)}
                  disabled={atMin}
                  aria-label={"Remove " + cat.label.toLowerCase()}
                  className={"flex h-[44px] w-[44px] items-center justify-center rounded-full border transition-all duration-200 ease-out " + (atMin
                    ? "border-outline/30 text-outline/30 cursor-not-allowed"
                    : "border-outline text-on-surface-variant hover:border-primary hover:text-primary active:scale-90 cursor-pointer"
                  )}
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-body font-semibold text-body-md text-on-surface tabular-nums">
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => updateCount(cat.key, 1)}
                  disabled={!canAdd}
                  aria-label={"Add " + cat.label.toLowerCase()}
                  className={"flex h-[44px] w-[44px] items-center justify-center rounded-full border transition-all duration-200 ease-out " + (!canAdd
                    ? "border-outline/30 text-outline/30 cursor-not-allowed"
                    : "border-outline text-on-surface-variant hover:border-primary hover:text-primary active:scale-90 cursor-pointer"
                  )}
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

      {atCapacity && (
        <div className="pb-4">
          <p className="font-body text-[13px] text-primary font-medium">
            Maximum occupancy of {maxGuests} guests reached for {villaName}.
          </p>
        </div>
      )}

      <div className="py-4 flex items-center justify-between border-t border-outline-variant/60">
        <p className="font-body text-[13px] font-semibold text-on-surface-variant">
          Max occupancy: {maxGuests} guests
        </p>
      </div>
    </div>
  )
}

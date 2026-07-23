import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  X,
  ChevronLeft,
  CalendarDays,
  Clock,
  Users,
  User,
  Check,
  Send,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react'
import { GuestSelector } from './GuestSelector'
import type { GuestCount } from './GuestSelector'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { cn } from '../../lib/cn'
import { generateReservationId } from '../../lib/reservationData'
import { images } from '../../lib/images'

interface PropertyInfo {
  id: string
  name: string
  priceDetails: { perNight: string; rateType: string }
  maxGuests: number
  partyFeeLabel?: string
}

interface BookingExperienceProps {
  isOpen: boolean
  onClose: () => void
  property: PropertyInfo
  partyFeeActive?: boolean
  onPartyFeeToggle?: (active: boolean) => void
}

type Step = 1 | 2 | 3 | 4
type SubmitState = 'idle' | 'submitting' | 'success'

const STEP_COUNT = 4

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } },
}

const panelDesktopVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.98,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const panelMobileVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 34 },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const stepContentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10)
}

function formatPrice(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH')
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getVillaImage(villaId: string): string {
  if (villaId === 'krib-2') return images.krib2Exterior
  return images.krib1
}

const STEP_META: { label: string; icon: typeof CalendarDays; heading: string; subheading: string }[] = [
  { label: 'Date', icon: CalendarDays, heading: 'Choose your stay date', subheading: 'Select your preferred arrival date. Your stay includes a full 21-hour experience.' },
  { label: 'Guests', icon: Users, heading: 'Who\'s joining your stay?', subheading: 'Tell us who will be enjoying the villa.' },
  { label: 'Details', icon: User, heading: 'A few details about you', subheading: 'So we can prepare for your arrival.' },
  { label: 'Review', icon: Check, heading: 'Review your reservation', subheading: 'Everything look good? Submit your request.' },
]

export function BookingExperience({ isOpen, onClose, property, partyFeeActive, onPartyFeeToggle }: BookingExperienceProps) {
  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState(1)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [reservationId, setReservationId] = useState('')

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [guests, setGuests] = useState<GuestCount>({ adults: 2, children: 0, infants: 0, pets: 0 })
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const panelRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      setStep(1)
      setDirection(1)
      setSubmitState('idle')
      setReservationId('')
      setSelectedDate(null)
      setGuests({ adults: 2, children: 0, infants: 0, pets: 0 })
      setFullName('')
      setEmail('')
      setPhone('')
      setMessage('')
      setAgreed(false)
      setErrors({})
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.paddingRight = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && submitState === 'idle') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, submitState])

  const basePrice = parsePrice(property.priceDetails.perNight)
  const partyFee = partyFeeActive ? 5000 : 0
  const total = basePrice + partyFee

  const goNext = useCallback(() => {
    if (step < STEP_COUNT) {
      setDirection(1)
      setStep((s) => (s + 1) as Step)
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => (s - 1) as Step)
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const goToStep = useCallback((target: Step) => {
    if (target < step) {
      setDirection(-1)
      setStep(target)
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const validateStep = (s: Step): boolean => {
    const errs: Record<string, string> = {}
    if (s === 1 && !selectedDate) errs.date = 'Please select a date'
    if (s === 3) {
      if (!fullName.trim()) errs.fullName = 'Name is required'
      if (!email.trim()) errs.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email'
      if (!phone.trim()) errs.phone = 'Phone is required'
      else if (!/^[\d\s+\-()]{7,20}$/.test(phone)) errs.phone = 'Enter a valid phone number'
      if (!agreed) errs.agreed = 'You must agree to the house rules'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => { if (validateStep(step)) goNext() }

  const handleSubmit = () => {
    if (!validateStep(3)) return
    const newId = generateReservationId()
    setReservationId(newId)
    const reservationData = {
      id: newId, email, villaId: property.id, villaName: property.name,
      maxGuests: property.maxGuests, checkIn: selectedDate!,
      checkOut: new Date(new Date(selectedDate!).getTime() + 21 * 60 * 60 * 1000).toISOString().split('T')[0],
      guests, createdAt: new Date().toISOString().split('T')[0], status: 'awaiting_confirmation' as const,
    }
    localStorage.setItem('krib_last_reservation', JSON.stringify({ id: newId, email }))
    localStorage.setItem('krib_last_reservation_full', JSON.stringify(reservationData))
    setSubmitState('submitting')
    setTimeout(() => setSubmitState('success'), 1800)
  }

  const departureDate = selectedDate ? new Date(new Date(selectedDate).getTime() + 21 * 60 * 60 * 1000) : null
  const totalGuests = guests.adults + guests.children
  const hasDate = !!selectedDate
  const meta = STEP_META[step - 1]

  const summaryContent = (
    <div className="flex flex-col h-full">
      <div className="relative h-44 lg:h-52 overflow-hidden shrink-0">
        <img
          src={getVillaImage(property.id)}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <p className="font-body text-[10px] text-white/60 uppercase tracking-[0.2em] font-semibold mb-1">
            Your Villa
          </p>
          <p className="font-display text-headline-sm text-white">{property.name}</p>
        </div>
      </div>

      <div className="flex-1 p-5 lg:p-6 space-y-0">
        <SummaryItem
          label="Stay Duration"
          value="21 Hours"
          icon={<Clock size={14} className="text-on-surface-variant/50" />}
        />

        {hasDate && departureDate && (
          <>
            <SummaryItem
              label="Arrival"
              value={`${formatDateShort(new Date(selectedDate!))} · 2:00 PM`}
            />
            <SummaryItem
              label="Departure"
              value={`${formatDateShort(departureDate)} · 11:00 AM`}
              valueClassName="text-primary"
            />
          </>
        )}

        {totalGuests > 0 && (
          <SummaryItem
            label="Guests"
            value={`${totalGuests} ${totalGuests === 1 ? 'Guest' : 'Guests'}`}
          />
        )}

        <div className="h-px bg-outline-variant/40 my-4" />

        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-on-surface-variant">Base Rate</span>
          <span className="font-body text-sm text-on-surface font-medium">{formatPrice(basePrice)}</span>
        </div>

        {onPartyFeeToggle && (
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onPartyFeeToggle(!partyFeeActive!)}
                className={cn(
                  'relative inline-flex h-[22px] w-10 items-center rounded-full transition-colors duration-300 cursor-pointer shrink-0',
                  partyFeeActive ? 'bg-primary' : 'bg-outline/40',
                )}
                role="switch"
                aria-checked={!!partyFeeActive}
                aria-label="Toggle party fee"
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white shadow-sm',
                    partyFeeActive ? 'ml-[22px]' : 'ml-[3px]',
                  )}
                />
              </button>
              <span className="font-body text-sm text-on-surface-variant">Party fee</span>
            </div>
            <motion.span
              key={partyFeeActive ? 'on' : 'off'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-body text-sm text-on-surface font-medium tabular-nums"
            >
              {partyFeeActive ? formatPrice(5000) : '—'}
            </motion.span>
          </div>
        )}

        {partyFeeActive && (
          <p className="font-body text-xs text-secondary/80 pl-[52px] -mt-1">
            Includes venue setup for celebrations
          </p>
        )}

        <div className="h-px bg-on-surface/10 my-4" />

        <div className="flex justify-between items-baseline">
          <span className="font-body text-sm font-semibold text-on-surface">Total</span>
          <LayoutGroup>
            <motion.span
              key={total}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-headline-md font-medium text-primary"
            >
              {formatPrice(total)}
            </motion.span>
          </LayoutGroup>
        </div>
      </div>

      <div className="p-5 lg:p-6 pt-0 lg:pt-0">
        {submitState === 'idle' && step < STEP_COUNT && (
          <button
            onClick={handleNext}
            className={cn(
              'w-full py-4 rounded-full font-body text-xs font-semibold uppercase tracking-[0.14em]',
              'bg-primary text-on-primary',
              'shadow-[0_4px_16px_rgba(0,71,171,0.2)]',
              'hover:bg-primary-hover hover:shadow-[0_6px_24px_rgba(0,71,171,0.28)]',
              'transition-all duration-300 cursor-pointer',
            )}
          >
            Continue
          </button>
        )}
        {submitState === 'idle' && step === STEP_COUNT && (
          <button
            onClick={handleSubmit}
            className={cn(
              'w-full py-4 rounded-full inline-flex items-center justify-center gap-2.5',
              'font-body text-xs font-semibold uppercase tracking-[0.14em]',
              'bg-primary text-on-primary',
              'shadow-[0_4px_16px_rgba(0,71,171,0.2)]',
              'hover:bg-primary-hover hover:shadow-[0_6px_24px_rgba(0,71,171,0.28)]',
              'transition-all duration-300 cursor-pointer',
            )}
          >
            <Send size={14} />
            Request Reservation
          </button>
        )}
        {submitState === 'idle' && (
          <div className="flex items-center gap-2 mt-3 justify-center">
            <Shield size={12} className="text-tertiary" />
            <p className="font-body text-[11px] text-on-surface-variant/60">
              No payment until your reservation is approved
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const stepContent = (
    <LayoutGroup>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`step-${step}`}
          custom={direction}
          variants={stepContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {step === 1 && (
            <StepDate
              villaId={property.id}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              error={errors.date}
            />
          )}
          {step === 2 && (
            <StepGuests
              maxGuests={property.maxGuests}
              villaName={property.name}
              guests={guests}
              onChange={setGuests}
            />
          )}
          {step === 3 && (
            <StepDetails
              fullName={fullName}
              onFullNameChange={setFullName}
              email={email}
              onEmailChange={setEmail}
              phone={phone}
              onPhoneChange={setPhone}
              message={message}
              onMessageChange={setMessage}
              agreed={agreed}
              onAgreedChange={setAgreed}
              errors={errors}
            />
          )}
          {step === 4 && (
            <StepReview
              property={property}
              selectedDate={selectedDate}
              departureDate={departureDate}
              guests={guests}
              totalGuests={totalGuests}
              fullName={fullName}
              email={email}
              phone={phone}
              message={message}
              basePrice={basePrice}
              partyFeeActive={partyFeeActive}
              onPartyFeeToggle={onPartyFeeToggle}
              total={total}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget && submitState === 'idle') onClose()
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

          {/* ─── DESKTOP / TABLET PANEL ─── */}
          <motion.div
            ref={panelRef}
            variants={panelDesktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'hidden md:flex flex-col bg-white overflow-hidden',
              'absolute inset-4 lg:inset-6 xl:inset-8',
              'max-w-[1280px] mx-auto my-auto max-h-[92vh]',
              'shadow-[0_24px_80px_rgba(0,0,0,0.18)]',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {submitState === 'success' ? (
              <SuccessState
                propertyName={property.name}
                reservationId={reservationId}
                onClose={onClose}
              />
            ) : submitState === 'submitting' ? (
              <SubmittingState />
            ) : (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* LEFT — Booking Flow */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0">
                  {/* Step Header */}
                  <div className="shrink-0 px-8 lg:px-10 pt-7 pb-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1">
                        {STEP_META.map((m, i) => {
                          const Icon = m.icon
                          const isCurrent = i + 1 === step
                          const isDone = i + 1 < step
                          return (
                            <button
                              key={m.label}
                              onClick={() => isDone && goToStep((i + 1) as Step)}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300',
                                isCurrent
                                  ? 'text-primary'
                                  : isDone
                                    ? 'text-on-surface-variant/60 hover:text-primary cursor-pointer'
                                    : 'text-on-surface-variant/25 pointer-events-none',
                              )}
                            >
                              <div className={cn(
                                'w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-300',
                                isCurrent
                                  ? 'border-primary bg-primary text-white'
                                  : isDone
                                    ? 'border-primary/40 bg-primary/5 text-primary'
                                    : 'border-outline-variant/40 text-on-surface-variant/30',
                              )}>
                                {isDone ? <Check size={12} strokeWidth={3} /> : <Icon size={13} />}
                              </div>
                              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.08em] hidden lg:block">
                                {m.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high rounded-full transition-all duration-200 cursor-pointer"
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="relative h-[2px] bg-surface-container-high">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-primary"
                        animate={{ width: `${(step / STEP_COUNT) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 28 }}
                      />
                    </div>

                    <div className="mt-6 mb-1">
                      <h2 className="font-display text-headline-md max-md:text-headline-md-mobile text-on-surface">
                        {meta.heading}
                      </h2>
                      <p className="font-body text-sm text-on-surface-variant/60 mt-1">
                        {meta.subheading}
                      </p>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-8 lg:px-10 pb-8"
                  >
                    <div className="pt-6">
                      {stepContent}
                    </div>

                    {/* Inline Navigation */}
                    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-outline-variant/30">
                      {step > 1 && (
                        <motion.button
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={goBack}
                          className="flex items-center gap-1.5 px-5 py-3 rounded-full border border-outline-variant/60 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                          Back
                        </motion.button>
                      )}
                      <div className="flex-1" />
                      {step < STEP_COUNT && (
                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNext}
                          className={cn(
                            'px-8 py-3.5 rounded-full',
                            'bg-primary text-on-primary',
                            'font-body text-[11px] font-semibold uppercase tracking-[0.1em]',
                            'shadow-[0_2px_8px_rgba(0,71,171,0.25)]',
                            'hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)]',
                            'transition-all duration-300 cursor-pointer',
                          )}
                        >
                          Continue
                        </motion.button>
                      )}
                      {step === STEP_COUNT && (
                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmit}
                          className={cn(
                            'inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full',
                            'bg-primary text-on-primary',
                            'font-body text-[11px] font-semibold uppercase tracking-[0.1em]',
                            'shadow-[0_2px_8px_rgba(0,71,171,0.25)]',
                            'hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)]',
                            'transition-all duration-300 cursor-pointer',
                          )}
                        >
                          <Send size={13} />
                          Request Reservation
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT — Sticky Summary */}
                <div className="w-[340px] lg:w-[380px] shrink-0 border-l border-outline-variant/30 bg-surface-container-low/50 overflow-y-auto overscroll-contain">
                  {summaryContent}
                </div>
              </div>
            )}
          </motion.div>

          {/* ─── MOBILE BOTTOM SHEET ─── */}
          <motion.div
            variants={panelMobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'md:hidden fixed bottom-0 left-0 right-0 bg-white flex flex-col',
              'max-h-[95vh]',
            )}
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {submitState === 'success' ? (
              <SuccessState
                propertyName={property.name}
                reservationId={reservationId}
                onClose={onClose}
              />
            ) : submitState === 'submitting' ? (
              <SubmittingState />
            ) : (
              <>
                {/* Mobile Header */}
                <div className="shrink-0 px-5 pt-4 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      {STEP_META.map((m, i) => {
                        const isCurrent = i + 1 === step
                        const isDone = i + 1 < step
                        return (
                          <div
                            key={m.label}
                            className={cn(
                              'h-1 rounded-full transition-all duration-500',
                              isCurrent ? 'w-6 bg-primary' : isDone ? 'w-3 bg-primary/40' : 'w-3 bg-outline-variant/40',
                            )}
                          />
                        )
                      })}
                    </div>
                    <button
                      onClick={onClose}
                      className="w-11 h-11 flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface rounded-full transition-colors duration-200 cursor-pointer"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <h2 className="font-display text-headline-sm text-on-surface">
                    {meta.heading}
                  </h2>
                  <p className="font-body text-xs text-on-surface-variant/60 mt-0.5">
                    {meta.subheading}
                  </p>
                </div>

                {/* Mobile Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-5 py-5">
                  {stepContent}
                </div>

                {/* Mobile Bottom Bar */}
                <div className="shrink-0 px-5 py-3.5 border-t border-outline-variant/30 bg-white pb-[calc(14px+env(safe-area-inset-bottom,0px))]">
                  <div className="flex items-center gap-3">
                    {step > 1 && (
                      <button
                        onClick={goBack}
                        className="flex items-center gap-1 px-4 py-3 rounded-full border border-outline-variant/60 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        Back
                      </button>
                    )}
                    <div className="flex-1" />
                    {step < STEP_COUNT ? (
                      <button
                        onClick={handleNext}
                        className={cn(
                          'px-6 py-3.5 rounded-full',
                          'bg-primary text-on-primary',
                          'font-body text-[11px] font-semibold uppercase tracking-[0.1em]',
                          'shadow-[0_2px_8px_rgba(0,71,171,0.25)]',
                          'transition-all duration-300 cursor-pointer',
                        )}
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className={cn(
                          'inline-flex items-center gap-2 px-6 py-3.5 rounded-full',
                          'bg-primary text-on-primary',
                          'font-body text-[11px] font-semibold uppercase tracking-[0.1em]',
                          'shadow-[0_2px_8px_rgba(0,71,171,0.25)]',
                          'transition-all duration-300 cursor-pointer',
                        )}
                      >
                        <Send size={13} />
                        Request
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2.5 px-1">
                    <span className="font-body text-[11px] text-on-surface-variant/50">
                      Step {step} of {STEP_COUNT}
                    </span>
                    <motion.span
                      key={total}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-body text-sm font-semibold text-primary"
                    >
                      {formatPrice(total)}
                    </motion.span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ======================================================================
   SUMMARY ITEM (for right sidebar)
   ====================================================================== */
function SummaryItem({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="font-body text-[13px] text-on-surface-variant/60 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className={cn('font-body text-[13px] text-on-surface font-medium', valueClassName)}>
        {value}
      </span>
    </div>
  )
}

/* ======================================================================
   SUBMITTING STATE
   ====================================================================== */
function SubmittingState() {
  return (
    <div className="flex-1 flex items-center justify-center p-12 min-h-[400px]">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="font-body text-sm text-on-surface-variant">
          Submitting your reservation request...
        </p>
      </div>
    </div>
  )
}

/* ======================================================================
   STEP 1 — Choose Your Stay Date
   ====================================================================== */
function StepDate({
  villaId,
  selectedDate,
  onDateSelect,
  error,
}: {
  villaId: string
  selectedDate: string | null
  onDateSelect: (date: string | null) => void
  error?: string
}) {
  const depDate = selectedDate
    ? new Date(new Date(selectedDate).getTime() + 21 * 60 * 60 * 1000)
    : null

  return (
    <div>
      <AvailabilityCalendar villaId={villaId} villaName="" onDateSelect={onDateSelect} />

      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-5 rounded-xl bg-surface-container-low border border-outline-variant/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-primary" />
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
              Your 21-Hour Stay
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-body text-on-surface-variant">Arrival</span>
            <span className="font-body text-on-surface font-medium">
              {formatDateShort(new Date(selectedDate))} · 2:00 PM
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1.5">
            <span className="font-body text-on-surface-variant">Departure</span>
            <span className="font-body text-primary font-medium">
              {depDate ? formatDateShort(depDate) : '—'} · 11:00 AM
            </span>
          </div>
        </motion.div>
      )}

      {error && (
        <p className="font-body text-[12px] text-error mt-3">{error}</p>
      )}

      <div className="mt-6 p-4 rounded-xl bg-tertiary-container/20 border border-tertiary/10">
        <div className="flex items-start gap-3">
          <Shield size={15} className="text-tertiary shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-[13px] text-on-surface font-medium">
              One reservation per villa per date
            </p>
            <p className="font-body text-xs text-on-surface-variant/60 mt-0.5">
              Perfect for birthdays and family gatherings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ======================================================================
   STEP 2 — Who's Joining Your Stay?
   ====================================================================== */
function StepGuests({
  maxGuests,
  villaName,
  guests,
  onChange,
}: {
  maxGuests: number
  villaName: string
  guests: GuestCount
  onChange: (g: GuestCount) => void
}) {
  return (
    <div>
      <GuestSelector
        maxGuests={maxGuests}
        villaName={villaName}
        value={guests}
        onChange={onChange}
      />

      {guests.pets > 2 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 overflow-hidden"
        >
          <p className="font-body text-sm text-primary leading-relaxed">
            For more than 2 pets, our staff will be notified so we can prepare accordingly.
          </p>
        </motion.div>
      )}

      <div className="mt-8 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
        <div className="flex items-start gap-3">
          <Sparkles size={15} className="text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-[13px] text-on-surface font-medium">
              Maximum {maxGuests} guests allowed
            </p>
            <p className="font-body text-xs text-on-surface-variant/60 mt-0.5">
              Adults and children count toward the guest limit. Infants and pets do not.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ======================================================================
   STEP 3 — A Few Details About You
   ====================================================================== */
function StepDetails({
  fullName,
  onFullNameChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  message,
  onMessageChange,
  agreed,
  onAgreedChange,
  errors,
}: {
  fullName: string
  onFullNameChange: (v: string) => void
  email: string
  onEmailChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  message: string
  onMessageChange: (v: string) => void
  agreed: boolean
  onAgreedChange: (v: boolean) => void
  errors: Record<string, string>
}) {
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 350)
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <label className="font-body text-[11px] text-on-surface-variant/60 uppercase tracking-[0.12em] font-semibold block mb-1.5">
          Full Name <span className="text-error">*</span>
        </label>
        <input
          ref={nameRef}
          type="text"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-4 py-3.5 rounded-lg bg-surface-container-low border border-outline-variant/60 font-body text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-colors duration-200"
        />
        {errors.fullName && (
          <p className="font-body text-[11px] text-error mt-1">{errors.fullName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-body text-[11px] text-on-surface-variant/60 uppercase tracking-[0.12em] font-semibold block mb-1.5">
            Email Address <span className="text-error">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@email.com"
            className="w-full px-4 py-3.5 rounded-lg bg-surface-container-low border border-outline-variant/60 font-body text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-colors duration-200"
          />
          {errors.email && (
            <p className="font-body text-[11px] text-error mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="font-body text-[11px] text-on-surface-variant/60 uppercase tracking-[0.12em] font-semibold block mb-1.5">
            Phone Number <span className="text-error">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+63 9XX XXX XXXX"
            className="w-full px-4 py-3.5 rounded-lg bg-surface-container-low border border-outline-variant/60 font-body text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-colors duration-200"
          />
          {errors.phone && (
            <p className="font-body text-[11px] text-error mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="font-body text-[11px] text-on-surface-variant/60 uppercase tracking-[0.12em] font-semibold block mb-1.5">
          Anything we should know? <span className="text-on-surface-variant/30">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Special requests, celebrations, dietary needs..."
          rows={3}
          className="w-full px-4 py-3.5 rounded-lg bg-surface-container-low border border-outline-variant/60 font-body text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary transition-colors duration-200 resize-none"
        />
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onAgreedChange(!agreed)}
            className={cn(
              'shrink-0 mt-0.5 w-11 h-11 min-w-11 min-h-11 flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer',
              agreed
                ? 'bg-primary text-white'
                : 'border-2 border-outline hover:border-primary',
            )}
            aria-checked={agreed}
            role="checkbox"
          >
            {agreed && <Check size={14} strokeWidth={3} />}
          </button>
          <p className="font-body text-[13px] text-on-surface leading-relaxed">
            I have read and agree to the house rules. I understand this is a reservation request that requires owner approval before payment.
          </p>
        </div>
        {errors.agreed && (
          <p className="font-body text-[11px] text-error mt-2 ml-14">{errors.agreed}</p>
        )}
      </div>

      <div className="p-4 rounded-xl bg-tertiary-container/20 border border-tertiary/10">
        <p className="font-body text-xs text-on-surface-variant">
          No payment required until your reservation is approved. We&apos;ll personally review your request before any payment is processed.
        </p>
      </div>
    </div>
  )
}

/* ======================================================================
   STEP 4 — Review Your Reservation
   ====================================================================== */
function StepReview({
  property,
  selectedDate,
  departureDate,
  guests,
  totalGuests,
  fullName,
  email,
  phone,
  message,
  basePrice,
  partyFeeActive,
  onPartyFeeToggle,
  total,
}: {
  property: PropertyInfo
  selectedDate: string | null
  departureDate: Date | null
  guests: GuestCount
  totalGuests: number
  fullName: string
  email: string
  phone: string
  message: string
  basePrice: number
  partyFeeActive?: boolean
  onPartyFeeToggle?: (active: boolean) => void
  total: number
}) {
  return (
    <div>
      <div className="space-y-0">
        <ReviewRow label="Villa" value={property.name} />
        {selectedDate && departureDate && (
          <ReviewRow
            label="Date"
            value={`${formatDateShort(new Date(selectedDate))} — ${formatDateShort(departureDate)}`}
          />
        )}
        <ReviewRow
          label="Stay"
          value="21 Hours"
          valueIcon={<Clock size={12} className="text-primary" />}
        />
        <ReviewRow
          label="Guests"
          value={`${totalGuests} ${totalGuests === 1 ? 'Guest' : 'Guests'} (${guests.adults} Adult${guests.adults !== 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children !== 1 ? 'ren' : ''}` : ''})`}
        />
        {guests.infants > 0 && <ReviewRow label="Infants" value={`${guests.infants}`} />}
        {guests.pets > 0 && <ReviewRow label="Pets" value={`${guests.pets}`} />}
      </div>

      <div className="h-px bg-outline-variant/30 my-5" />

      <div className="space-y-0">
        <p className="font-body text-[11px] text-on-surface-variant/50 uppercase tracking-[0.12em] font-semibold mb-3">
          Contact
        </p>
        <ReviewRow label="Name" value={fullName} />
        <ReviewRow label="Email" value={email} />
        <ReviewRow label="Phone" value={phone} />
        {message && <ReviewRow label="Message" value={message} />}
      </div>

      <div className="h-px bg-outline-variant/30 my-5" />

      <div className="space-y-0">
        <p className="font-body text-[11px] text-on-surface-variant/50 uppercase tracking-[0.12em] font-semibold mb-3">
          Pricing
        </p>
        <ReviewRow label="Base Rate" value={formatPrice(basePrice)} />

        {onPartyFeeToggle && (
          <div className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onPartyFeeToggle(!partyFeeActive)}
                  className={cn(
                    'relative inline-flex h-[22px] w-10 items-center rounded-full transition-colors duration-300 cursor-pointer',
                    partyFeeActive ? 'bg-primary' : 'bg-outline/40',
                  )}
                  role="switch"
                  aria-checked={!!partyFeeActive}
                  aria-label="Toggle party fee"
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={cn(
                      'inline-block h-4 w-4 rounded-full bg-white shadow-sm',
                      partyFeeActive ? 'ml-[22px]' : 'ml-[3px]',
                    )}
                  />
                </button>
                <span className="font-body text-sm text-on-surface-variant">Party fee (+₱5,000)</span>
              </div>
              <motion.span
                key={partyFeeActive ? 'on' : 'off'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-body text-sm text-on-surface font-medium tabular-nums"
              >
                {partyFeeActive ? formatPrice(5000) : '—'}
              </motion.span>
            </div>
            {partyFeeActive && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="font-body text-xs text-secondary/80 mt-2 ml-[52px] overflow-hidden"
              >
                Includes venue setup for parties and celebrations
              </motion.p>
            )}
          </div>
        )}

        <div className="flex justify-between items-baseline pt-4 border-t border-on-surface/10">
          <span className="font-body text-sm font-semibold text-on-surface">Total</span>
          <motion.span
            key={total}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-headline-md font-medium text-primary"
          >
            {formatPrice(total)}
          </motion.span>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-primary-container/20 border border-primary/10">
        <div className="flex items-start gap-3">
          <Shield size={14} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-[13px] text-on-surface font-medium">
              We&apos;ll personally review your request
            </p>
            <p className="font-body text-xs text-on-surface-variant/60 mt-0.5">
              No payment is required until your reservation has been approved by our team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  valueIcon,
}: {
  label: string
  value: string
  valueIcon?: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-2">
      <span className="font-body text-[13px] text-on-surface-variant shrink-0">{label}</span>
      <span className="font-body text-[13px] text-on-surface font-medium text-right flex items-center gap-1.5">
        {valueIcon}
        {value}
      </span>
    </div>
  )
}

/* ======================================================================
   SUCCESS STATE
   ====================================================================== */
function SuccessState({
  propertyName,
  reservationId,
  onClose,
}: {
  propertyName: string
  reservationId: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(reservationId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex items-center justify-center p-8 sm:p-10"
    >
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center mb-6 mx-auto"
        >
          <Check size={28} className="text-tertiary" strokeWidth={2.5} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="font-display text-headline-xl max-md:text-headline-xl-mobile text-on-surface mb-3"
        >
          You&apos;re almost there!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="font-body text-sm text-on-surface-variant leading-relaxed mb-4"
        >
          We&apos;ve received your reservation request for{' '}
          <strong className="text-on-surface">{propertyName}</strong>.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="font-body text-sm text-on-surface-variant leading-relaxed mb-8"
        >
          Our team will review your preferred date shortly. You&apos;ll receive confirmation once your reservation has been approved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mb-8"
        >
          <p className="font-body text-[10px] text-on-surface-variant/50 uppercase tracking-[0.15em] font-semibold mb-2">
            Reservation ID
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
            <code className="font-mono text-sm font-semibold text-on-surface tracking-tight">
              {reservationId}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-outline-variant/30 transition-colors cursor-pointer"
              aria-label="Copy reservation ID"
            >
              {copied ? (
                <Check size={13} className="text-tertiary" />
              ) : (
                <span className="font-body text-[10px] text-primary font-semibold">Copy</span>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <button
            type="button"
            onClick={() => {
              onClose()
              window.location.href = '/my-reservation'
            }}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-primary text-on-primary font-body text-[11px] font-semibold uppercase tracking-[0.1em] shadow-[0_2px_8px_rgba(0,71,171,0.25)] hover:bg-primary-hover transition-all duration-300 cursor-pointer"
          >
            View My Reservation <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

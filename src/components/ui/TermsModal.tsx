import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useSiteSettings } from '../../hooks/useSiteSettings'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAgree: () => void
  section?: 'terms' | 'privacy'
  triggerRef?: React.RefObject<HTMLElement | null>
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } },
}

const panelVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function TermsSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id}>
      <h3 className="font-display text-base text-on-surface mb-3 leading-snug">
        {title}
      </h3>
      <div className="font-body text-[13px] text-on-surface-variant leading-relaxed space-y-2.5">
        {children}
      </div>
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="text-on-surface">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split('\n')
  const blocks: React.ReactNode[] = []
  let list: string[] = []
  let key = 0

  const flushList = () => {
    if (list.length === 0) return
    blocks.push(
      <ul key={`ul-${key++}`} className="list-none space-y-1.5 mt-1.5">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item.replace(/^-\s*/, ''))}</li>
        ))}
      </ul>,
    )
    list = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      flushList()
      continue
    }
    if (line.startsWith('## ')) {
      flushList()
      blocks.push(
        <h3 key={`h-${key++}`} className="font-display text-base text-on-surface mb-3 leading-snug">
          {renderInline(line.slice(3))}
        </h3>,
      )
    } else if (line.startsWith('- ')) {
      list.push(line.slice(2))
    } else {
      flushList()
      blocks.push(<p key={`p-${key++}`}>{renderInline(line)}</p>)
    }
  }
  flushList()

  return <div className="space-y-2.5">{blocks}</div>
}

export function TermsModal({ isOpen, onClose, onAgree, section = 'terms', triggerRef }: TermsModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const agreeButtonRef = useRef<HTMLButtonElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const { settings } = useSiteSettings()
  const termsMd = settings?.legal?.terms_conditions
  const privacyMd = settings?.legal?.privacy_policy

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      const scrollY = window.scrollY
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.documentElement.style.overflow = 'hidden'
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`

      setTimeout(() => closeButtonRef.current?.focus(), 50)

      return () => {
        document.documentElement.style.overflow = ''
        document.documentElement.style.paddingRight = ''
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      triggerRef?.current?.focus()
    } else if (section === 'privacy') {
      setTimeout(() => {
        scrollContainerRef.current
          ?.querySelector('#privacy-notice')
          ?.scrollIntoView({ block: 'start' })
      }, 100)
    }
  }, [isOpen, section, triggerRef])

  const handleAgree = useCallback(() => {
    onAgree()
    onClose()
  }, [onAgree, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-label={section === 'privacy' ? 'Privacy Notice' : 'Terms & Conditions'}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

          <motion.div
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative bg-white w-full max-w-lg flex flex-col overflow-hidden',
              'max-h-[calc(100dvh-2rem)]',
              'shadow-[0_24px_80px_rgba(0,0,0,0.18)]',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
              <h2 className="font-display text-lg text-on-surface">
                {section === 'privacy' ? 'Privacy Notice' : 'Terms & Conditions'}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high rounded-full transition-all duration-200 cursor-pointer"
                aria-label={section === 'privacy' ? 'Close privacy notice' : 'Close terms and conditions'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              ref={scrollContainerRef}
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-6 py-6"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="space-y-7">
                {section === 'privacy' && privacyMd ? (
                  <div id="privacy-notice">{renderMarkdown(privacyMd)}</div>
                ) : section === 'terms' && termsMd ? (
                  renderMarkdown(termsMd)
                ) : (
                  <>
                <TermsSection title="House Rules">
                  <p>
                    All guests are expected to respect the property and the surrounding Beverly Place community. These rules ensure a comfortable stay for everyone.
                  </p>
                  <ul className="list-none space-y-1.5 mt-2">
                    <li><strong className="text-on-surface">Quiet hours</strong> are observed after 10:00 PM. Indoor conversations and low-volume music are acceptable.</li>
                    <li><strong className="text-on-surface">Smoking</strong> is permitted in outdoor areas only. No smoking inside the villa.</li>
                    <li><strong className="text-on-surface">Pool rules</strong> — No diving. Children must be supervised at all times.</li>
                    <li><strong className="text-on-surface">Pets</strong> are not allowed inside the villa.</li>
                    <li><strong className="text-on-surface">Children</strong> are welcome. Please supervise them around the pool and outdoor areas.</li>
                  </ul>
                </TermsSection>

                <TermsSection title="Reservation Policy">
                  <p>
                    All reservations are requests and are subject to owner approval. Submitting a reservation does not guarantee availability. Our team will review your request and confirm availability before any payment is required.
                  </p>
                  <p>
                    Each reservation is a 21-hour stay, starting at your selected arrival time.
                  </p>
                </TermsSection>

                <TermsSection title="Cancellation Policy">
                  <p>
                    Pending reservation requests can be cancelled at any time at no cost. Approved reservations cancelled at least 7 days before the scheduled arrival are also free of charge.
                  </p>
                  <p>
                    Cancellations made within 7 days of arrival may be subject to a fee. No-shows will be treated as cancellations. We recommend coordinating with us if you need to reschedule — we will do our best to accommodate date changes.
                  </p>
                </TermsSection>

                <TermsSection title="Check-in / Check-out">
                  <ul className="list-none space-y-1.5">
                    <li><strong className="text-on-surface">Check-in:</strong> Your selected arrival time.</li>
                    <li><strong className="text-on-surface">Check-out:</strong> 21 hours after your arrival.</li>
                    <li>Early check-in and late check-out may be arranged in advance, subject to availability on your booking date.</li>
                  </ul>
                </TermsSection>

                <TermsSection title="Guest Responsibilities">
                  <p>
                    Guests are responsible for the proper use and care of the property, furniture, appliances, and amenities during their stay. Any damage caused by negligence or misuse will be assessed and may result in additional charges.
                  </p>
                  <p>
                    Guests must ensure that all visitors and participants comply with the house rules and community guidelines. The primary guest is responsible for the conduct of all members of their group.
                  </p>
                </TermsSection>

                <TermsSection title="Damage & Liability">
                  <p>
                    KRiB Beverly Place is not responsible for any loss, theft, or damage to personal belongings during your stay. Guests are advised to keep valuables secure.
                  </p>
                  <p>
                    Any damage to the property, its contents, or amenities beyond normal wear and tear will be charged to the guest at replacement or repair cost. A security assessment may be conducted upon check-out.
                  </p>
                </TermsSection>

                <TermsSection id="privacy-notice" title="Privacy Notice">
                  <p>
                    We collect personal information (name, email, phone number) solely for the purpose of processing and managing your reservation. This information is not shared with third parties and is stored securely.
                  </p>
                  <p>
                    CCTV cameras are active in common areas of the property for security purposes. No cameras are present inside bedrooms or bathrooms.
                  </p>
                </TermsSection>

                <TermsSection title="Payment Process">
                  <div className="space-y-2.5">
                    <p>
                      <strong className="text-on-surface">No payment is required until your reservation has been approved.</strong> Submitting a reservation request does not obligate you to any payment.
                    </p>
                    <p>
                      Once your reservation is approved by our team, we will contact you with the final confirmation and any payment instructions. Approval by our team confirms your booking.
                    </p>
                  </div>
                </TermsSection>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-5 border-t border-outline-variant/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className={cn(
                    'px-6 py-3 rounded-full',
                    'border border-outline-variant/60',
                    'font-body text-[11px] font-semibold uppercase tracking-[0.1em]',
                    'text-on-surface-variant',
                    'hover:bg-surface-container-low',
                    'transition-all duration-200 cursor-pointer',
                  )}
                >
                  Close
                </button>
                <button
                  ref={agreeButtonRef}
                  onClick={handleAgree}
                  className={cn(
                    'flex-1 px-6 py-3 rounded-full',
                    'bg-primary text-on-primary',
                    'font-body text-[11px] font-semibold uppercase tracking-[0.1em]',
                    'shadow-[0_2px_8px_rgba(0,71,171,0.25)]',
                    'hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)]',
                    'transition-all duration-300 cursor-pointer',
                  )}
                >
                  I Understand &amp; Agree
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

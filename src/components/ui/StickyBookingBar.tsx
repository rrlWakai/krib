import { motion, AnimatePresence } from 'framer-motion'
import { useScrollDirection } from '../../hooks/useScrollDirection'
import { cn } from '../../lib/cn'

interface StickyBookingBarProps {
  price: string
  rateType: string
  maxGuests: number
  partyFeeActive?: boolean
  discountApplied?: boolean
  onPartyFeeToggle?: (active: boolean) => void
  onReserve: () => void
}

function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10)
}

function formatPrice(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH')
}

export function StickyBookingBar({
  price,
  rateType,
  maxGuests,
  partyFeeActive,
  discountApplied,
  onPartyFeeToggle,
  onReserve,
}: StickyBookingBarProps) {
  const { scrollDirection, isAtBottom } = useScrollDirection({ threshold: 15 })
  const isVisible = scrollDirection === 'up' && !isAtBottom

  const basePrice = parsePrice(price)
  const total = partyFeeActive ? basePrice + 5000 : basePrice

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div className="bg-white/95 backdrop-blur-xl border-t border-outline-variant/40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom,0px))]">
              {/* Left Side */}
              <div className="min-w-0 flex-1">
                <p className="font-body text-[10px] text-on-surface-variant/60 uppercase tracking-[0.12em] font-semibold mb-0.5">
                  Your Stay
                </p>
                <div className="flex items-baseline gap-1.5">
                  <motion.span
                    key={total}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-[22px] leading-none text-on-surface font-medium"
                  >
                    {formatPrice(total)}
                  </motion.span>
                  <span className="font-body text-[12px] text-on-surface-variant/60">
                    {rateType}
                  </span>
                </div>
                <p className="font-body text-[11px] text-on-surface-variant/50 mt-1">
                  22 Hours &bull; Up to {maxGuests} Guests
                </p>

                {/* Party Fee Toggle */}
                {onPartyFeeToggle && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => onPartyFeeToggle(!partyFeeActive)}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 cursor-pointer',
                        partyFeeActive ? 'bg-primary' : 'bg-outline/50',
                      )}
                      role="switch"
                      aria-checked={partyFeeActive}
                      aria-label="Toggle party fee"
                    >
                      <motion.span
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={cn(
                          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm',
                          partyFeeActive ? 'translate-x-4' : 'translate-x-0.5',
                        )}
                      />
                    </button>
                    <span className="font-body text-[10px] text-on-surface-variant/70">
                      +₱5,000 Party Fee
                    </span>
                  </div>
                )}

                {discountApplied && (
                  <p className="font-body text-[10px] text-tertiary font-medium mt-0.5">
                    Discount Applied
                  </p>
                )}
              </div>

              {/* Right Side - CTA */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReserve}
                className={cn(
                  'shrink-0 px-6 py-3.5 rounded-full',
                  'bg-primary text-on-primary',
                  'font-body text-[11px] font-semibold uppercase tracking-[0.1em]',
                  'shadow-[0_2px_8px_rgba(0,71,171,0.25)]',
                  'hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)]',
                  'transition-all duration-300',
                  'active:scale-[0.98]',
                  'cursor-pointer',
                )}
              >
                Request Reservation
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

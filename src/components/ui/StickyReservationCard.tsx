import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '../../lib/animations'
import { GuestSelector } from './GuestSelector'
import type { GuestCount } from './GuestSelector'
import { cn } from '../../lib/cn'

interface StickyReservationCardProps {
  price: string
  rateType: string
  villaName: string
  maxGuests: number
  partyFeeActive?: boolean
  onPartyFeeToggle?: (active: boolean) => void
  onReserve?: () => void
}

function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10)
}

function formatPrice(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH')
}

export function StickyReservationCard({
  price,
  rateType,
  villaName,
  maxGuests,
  partyFeeActive,
  onPartyFeeToggle,
  onReserve,
}: StickyReservationCardProps) {
  const [guests, setGuests] = useState<GuestCount>({ adults: 2, children: 0, infants: 0, pets: 0 })

  const basePrice = parsePrice(price)
  const total = partyFeeActive ? basePrice + 5000 : basePrice

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="bg-white border border-outline-variant rounded-default shadow-elevated sticky top-28"
    >
      <div className="p-6">
        <div className="flex items-baseline gap-2 mb-1">
          <motion.span
            key={total}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-headline-lg text-on-surface"
          >
            {formatPrice(total)}
          </motion.span>
          <span className="font-body text-body-md text-on-surface-variant">{rateType}</span>
        </div>

        <div className="mt-4 space-y-4">
          <div className="border border-outline-variant rounded-default divide-y divide-outline-variant">
            <div className="p-4">
              <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1">
                Arrival date
              </label>
              <span className="font-body text-body-md text-on-surface">Select date</span>
            </div>
            <div className="p-4 bg-surface-container/50">
              <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1">
                Departure (auto)
              </label>
              <span className="font-body text-body-md text-primary font-medium">22 hours after arrival</span>
            </div>
            <div className="p-4 relative">
              <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1">
                Guests
              </label>
              <GuestSelector
                maxGuests={maxGuests}
                villaName={villaName}
                value={guests}
                onChange={setGuests}
              />
            </div>
          </div>

          <button
            onClick={onReserve}
            className="w-full bg-primary text-on-primary py-4 px-6 rounded-full font-body text-label-caps uppercase tracking-widest shadow-button hover:bg-primary-hover hover:shadow-elevated transition-all duration-300 cursor-pointer">
            Request Reservation
          </button>

          <p className="font-body text-body-md text-on-surface-variant text-center text-sm">
            You will not be charged yet
          </p>
        </div>
      </div>

      <div className="border-t border-outline-variant p-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-body text-body-md text-on-surface-variant">{villaName}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="font-body text-body-md text-on-surface-variant">Cleaning fee</span>
          <span className="font-body text-body-md text-on-surface">Included</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="font-body text-body-md text-on-surface-variant">Security deposit</span>
          <span className="font-body text-body-md text-on-surface">Refundable</span>
        </div>

        {/* Party Fee Toggle */}
        {onPartyFeeToggle && (
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onPartyFeeToggle(!partyFeeActive)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer',
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
                      'inline-block h-4 w-4 rounded-full bg-white shadow-sm',
                      partyFeeActive ? 'translate-x-5.5' : 'translate-x-1',
                    )}
                  />
                </button>
                <span className="font-body text-body-md text-on-surface-variant">
                  Party fee
                </span>
              </div>
              <motion.span
                key={partyFeeActive ? 'active' : 'inactive'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-body text-body-md text-on-surface"
              >
                {partyFeeActive ? formatPrice(5000) : '—'}
              </motion.span>
            </div>
            {partyFeeActive && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="font-body text-[12px] text-secondary mt-2 ml-12"
              >
                Includes venue setup for parties and celebrations
              </motion.p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

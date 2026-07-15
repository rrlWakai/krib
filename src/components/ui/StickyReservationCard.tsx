import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '../../lib/animations'
import { GuestSelector } from './GuestSelector'
import type { GuestCount } from './GuestSelector'

interface StickyReservationCardProps {
  price: string
  rateType: string
  villaName: string
  maxGuests: number
  hasPartyFee?: boolean
  onReserve?: () => void
}

export function StickyReservationCard({
  price,
  rateType,
  villaName,
  maxGuests,
  hasPartyFee,
  onReserve,
}: StickyReservationCardProps) {
  const [guests, setGuests] = useState<GuestCount>({ adults: 2, children: 0, infants: 0, pets: 0 })

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
          <span className="font-display text-headline-lg text-on-surface">{price}</span>
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
            className="w-full bg-primary text-on-primary py-4 px-6 rounded-default font-body text-label-caps uppercase tracking-widest shadow-button hover:bg-primary-hover hover:shadow-elevated transition-all duration-300 cursor-pointer">
            Reserve Now
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
        {hasPartyFee && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-body text-body-md text-on-surface-variant">Party fee</span>
            <span className="font-body text-body-md text-on-surface">₱5,000 (if applicable)</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

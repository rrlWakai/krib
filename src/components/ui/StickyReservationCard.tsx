import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../lib/animations";
import { GuestSelector } from "./GuestSelector";
import type { GuestCount } from "./GuestSelector";
import { cn } from "../../lib/cn";
import { isKrib1, KRIB1_ADDITIONAL_GUEST_FEE, KRIB1_STANDARD_CAPACITY } from "../../lib/bookingTime";

interface StickyReservationCardProps {
  price: string;
  rateType: string;
  villaName: string;
  villaId?: string;
  maxGuests: number;
  partyFeeActive?: boolean;
  partyFeeAmount?: number;
  onPartyFeeToggle?: (active: boolean) => void;
  onReserve?: () => void;
}

function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
}

function formatPrice(amount: number): string {
  return "₱" + amount.toLocaleString("en-PH");
}

export function StickyReservationCard({
  price,
  rateType,
  villaName,
  villaId,
  maxGuests,
  partyFeeActive,
  partyFeeAmount,
  onPartyFeeToggle,
  onReserve,
}: StickyReservationCardProps) {
  const [guests, setGuests] = useState<GuestCount>({
    adults: 2,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const basePrice = parsePrice(price);
  const partyFee = partyFeeAmount ?? 5000;
  const total = partyFeeActive ? basePrice + partyFee : basePrice;
  const krib1 = !!villaId && isKrib1(villaId);
  const totalGuests = guests.adults + guests.children;
  const additionalGuests = krib1 ? Math.max(0, totalGuests - KRIB1_STANDARD_CAPACITY) : 0;
  const additionalGuestFee = (krib1 && !partyFeeActive) ? additionalGuests * KRIB1_ADDITIONAL_GUEST_FEE : 0;
  const displayTotal = total + additionalGuestFee;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white border border-outline-variant rounded-default shadow-elevated sticky top-28"
    >
      <div className="p-6">
        <div className="flex items-baseline gap-2 mb-1">
          <motion.span
            key={displayTotal}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-headline-lg text-on-surface"
          >
            {formatPrice(displayTotal)}
          </motion.span>
          <span className="font-body text-body-md text-on-surface-variant">
            {rateType}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <div className="border border-outline-variant rounded-default divide-y divide-outline-variant">
            <div className="p-4">
              <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1">
                {krib1 ? "Check-in" : "Arrival date"}
              </label>
              <span className="font-body text-body-md text-on-surface">
                {krib1 ? "2:00 PM (Fixed)" : "Select date"}
              </span>
            </div>
            <div className="p-4 bg-surface-container/50">
              <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1">
                Departure (auto)
              </label>
              <span className="font-body text-body-md text-primary font-medium">
                21 hours after arrival
              </span>
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

          {additionalGuestFee > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/60">
              <p className="font-body text-[11px] text-amber-800 font-medium">
                {additionalGuests} additional guest{additionalGuests !== 1 ? "s" : ""} × ₱{KRIB1_ADDITIONAL_GUEST_FEE} = +{formatPrice(additionalGuestFee)}
              </p>
              <p className="font-body text-[10px] text-amber-700/80 mt-0.5">
                Requires admin approval
              </p>
            </div>
          )}

          <button
            onClick={onReserve}
            className="w-full bg-primary text-on-primary py-4 px-6 rounded-full font-body text-label-caps uppercase tracking-widest shadow-button hover:bg-primary-hover hover:shadow-elevated transition-all duration-300 cursor-pointer"
          >
            Request Reservation
          </button>

          <p className="font-body text-body-md text-on-surface-variant text-center text-sm">
            You will not be charged yet
          </p>
        </div>
      </div>

      <div className="border-t border-outline-variant p-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-body text-body-md text-on-surface-variant">
            {villaName}
          </span>
        </div>

        {/* Party Fee Toggle */}
        {onPartyFeeToggle && (
          <button
            type="button"
            onClick={() => onPartyFeeToggle(!partyFeeActive)}
            className={cn(
              "flex w-full items-center justify-between gap-4 py-2 rounded-lg border transition-colors duration-200 cursor-pointer",
              partyFeeActive
                ? "bg-primary/5 border-primary/20"
                : "bg-surface-container-low border-outline-variant/30 hover:bg-surface-container hover:border-primary/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
            )}
            role="switch"
            aria-checked={partyFeeActive}
            aria-label="Toggle party fee"
          >
            <div className="flex items-center gap-3 shrink-0">
              <div className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-out shrink-0",
                partyFeeActive ? "bg-primary" : "bg-outline/30",
              )}>
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "inline-block h-4 w-4 rounded-full bg-white shadow-sm",
                    partyFeeActive ? "translate-x-5.5" : "translate-x-1",
                  )}
                />
              </div>
              <span className={cn(
                "font-body text-body-md font-medium",
                partyFeeActive ? "text-on-surface" : "text-on-surface-variant",
              )}>
                Party fee
              </span>
            </div>
            <motion.span
              key={partyFeeActive ? "active" : "inactive"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "font-body text-body-md font-medium shrink-0",
                partyFeeActive ? "text-primary" : "text-on-surface-variant/60",
              )}
            >
              {partyFeeActive ? formatPrice(partyFee) : <span className="text-on-surface-variant/40">₱5,000</span>}
            </motion.span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

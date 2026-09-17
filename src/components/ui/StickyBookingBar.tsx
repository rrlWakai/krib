import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { isKrib1, KRIB1_ADDITIONAL_GUEST_FEE, KRIB1_STANDARD_CAPACITY } from "../../lib/bookingTime";

interface StickyBookingBarProps {
  price: string;
  rateType: string;
  villaId?: string;
  maxGuests: number;
  partyFeeActive?: boolean;
  partyFeeAmount?: number;
  discountApplied?: boolean;
  onPartyFeeToggle?: (active: boolean) => void;
  onReserve: () => void;
}

function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
}

function formatPrice(amount: number): string {
  return "₱" + amount.toLocaleString("en-PH");
}

export function StickyBookingBar({
  price,
  rateType,
  villaId,
  maxGuests,
  partyFeeActive,
  partyFeeAmount,
  discountApplied,
  onPartyFeeToggle,
  onReserve,
}: StickyBookingBarProps) {
  const basePrice = parsePrice(price);
  const partyFee = partyFeeAmount ?? 5000;
  const total = partyFeeActive ? basePrice + partyFee : basePrice;
  const krib1 = !!villaId && isKrib1(villaId);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="bg-white/95 backdrop-blur-xl border-t border-outline-variant/40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
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
              21 Hours &bull; Standard capacity {maxGuests} Guests{krib1 ? ` (+${KRIB1_ADDITIONAL_GUEST_FEE}/pax above ${KRIB1_STANDARD_CAPACITY})` : ""}
            </p>

            {/* Party Fee Toggle */}
            {onPartyFeeToggle && (
              <button
                type="button"
                onClick={() => onPartyFeeToggle(!partyFeeActive)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 py-2 rounded-lg border transition-colors duration-200 cursor-pointer",
                  partyFeeActive
                    ? "bg-primary/5 border-primary/20"
                    : "bg-surface-container-low border-outline-variant/30 hover:bg-surface-container hover:border-primary/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
                )}
                role="switch"
                aria-checked={partyFeeActive}
                aria-label="Toggle party fee"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 shrink-0",
                    partyFeeActive ? "bg-primary" : "bg-outline/30",
                  )}>
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={cn(
                        "inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm",
                        partyFeeActive ? "translate-x-4" : "translate-x-0.5",
                      )}
                    />
                  </div>
                  <span className={cn(
                    "font-body text-[10px] font-medium",
                    partyFeeActive ? "text-on-surface" : "text-on-surface-variant",
                  )}>
                    Party fee
                  </span>
                </div>
                <motion.span
                  key={partyFeeActive ? "on" : "off"}
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={cn(
                    "font-body text-[10px] font-medium tabular-nums shrink-0",
                    partyFeeActive ? "text-primary" : "text-on-surface-variant/60",
                  )}
                >
                  {partyFeeActive ? formatPrice(partyFee) : <span className="text-on-surface-variant/40">₱5,000</span>}
                </motion.span>
              </button>
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
              "shrink-0 px-6 py-3.5 rounded-full",
              "bg-primary text-on-primary",
              "font-body text-[11px] font-semibold uppercase tracking-0.1em",
              "shadow-[0_2px_8px_rgba(0,71,171,0.25)]",
              "hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)]",
              "transition-all duration-300",
              "active:scale-[0.98]",
              "cursor-pointer",
            )}
          >
            Request Reservation
          </motion.button>
        </div>
      </div>
    </div>
  );
}

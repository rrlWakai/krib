import { motion } from "framer-motion"
import { Clock, CreditCard, Shield } from "lucide-react"
import { formatDate, formatPrice } from "../../lib/reservationData"

interface Props {
  amountDue: number
  deadline: string
}

export function PaymentCard({ amountDue, deadline }: Props) {
  return (
    <motion.div
      id="payment"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-blue-200/50 bg-gradient-to-br from-blue-50/40 via-white to-white p-6 md:p-8 shadow-[0_2px_12px_rgba(79,145,184,0.06)]"
    >
      <div className="flex items-start gap-4 md:gap-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0"
        >
          <CreditCard size={18} className="text-[#4F91B8]" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-headline-sm max-md:text-headline-sm-mobile text-on-surface mb-2">
            Complete Your Down Payment
          </h3>
          <p className="font-body text-body-md text-on-surface-variant leading-relaxed mb-6">
            Your reservation is secured. Complete your down payment to confirm your stay.
          </p>

          {/* Payment details */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-6">
            <div>
              <span className="font-body text-[10px] text-on-surface-variant/50 uppercase tracking-[0.12em] font-medium">
                Amount Due
              </span>
              <p className="font-display text-headline-md font-medium text-on-surface mt-1">
                {formatPrice(amountDue)}
              </p>
            </div>
            <div>
              <span className="font-body text-[10px] text-on-surface-variant/50 uppercase tracking-[0.12em] font-medium">
                Payment Deadline
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={14} className="text-amber-500" />
                <span className="font-body text-sm font-medium text-amber-800">
                  {formatDate(deadline)}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary/60 text-on-primary font-body text-[11px] font-semibold uppercase tracking-[0.1em] cursor-not-allowed transition-all duration-300"
              title="Online payment coming soon"
            >
              <CreditCard size={13} />
              Pay Now — Coming Soon
            </button>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-on-surface-variant/40" />
              <span className="font-body text-xs text-on-surface-variant/50">
                Secure payment processed by our team
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

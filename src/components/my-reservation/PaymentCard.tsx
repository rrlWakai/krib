import { motion } from "framer-motion"
import { Clock, CreditCard } from "lucide-react"
import { formatDate } from "../../lib/reservationData"

interface Props {
  amountDue: number
  deadline: string
}

export function PaymentCard({ amountDue, deadline }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-blue-200/60 bg-gradient-to-br from-blue-50/60 to-white p-8 max-md:p-6"
    >
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <CreditCard size={20} className="text-[#4F91B8]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-headline-sm max-md:text-headline-sm-mobile text-on-surface mb-1">
            Down Payment Required
          </h3>
          <p className="font-body text-body-md text-on-surface-variant leading-relaxed mb-4">
            Please complete your down payment to secure your booking.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-5">
            <div>
              <span className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px]">
                Amount Due
              </span>
              <p className="font-display text-headline-md font-medium text-on-surface mt-1">
                ₱{(amountDue / 100).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px]">
                Payment Deadline
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={14} className="text-amber-600" />
                <span className="font-body text-body-md font-medium text-amber-800">
                  {formatDate(deadline)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary/60 text-on-primary font-body text-label-caps uppercase tracking-widest rounded-default cursor-not-allowed transition-all duration-300"
            title="Online payment coming soon"
          >
            <CreditCard size={14} />
            Pay Now — Coming Soon
          </button>
        </div>
      </div>
    </motion.div>
  )
}

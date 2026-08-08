import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Loader2, Mail, KeyRound } from "lucide-react"
import { cn } from "../../lib/cn"

interface LookupFormProps {
  onFound: (reservation: { id: string; email: string }) => void
  onError: (message: string) => void
  onSearching: (searching: boolean) => void
  searching: boolean
}

export function LookupForm({ onFound, onError, onSearching, searching }: LookupFormProps) {
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [focused, setFocused] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onError("")

    if (!code.trim()) {
      onError("Please enter your reservation code.")
      return
    }
    if (!email.trim()) {
      onError("Please enter the email address you used to book.")
      return
    }
    onSearching(true)
    onFound({ id: code.trim(), email: email.trim() })
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Card */}
        <div className="rounded-[24px] border border-outline-variant/60 bg-white p-8 max-md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="w-6 h-px bg-primary/40" />
            <span className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-[0.15em] text-[11px]">
              Find Your Reservation
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label className="font-body text-sm font-medium text-on-surface block mb-2">
              Reservation Code
            </label>
            <div className={cn(
              "relative flex items-center rounded-xl border transition-all duration-200",
              focused === "code"
                ? "border-primary ring-[3px] ring-primary/10"
                : "border-outline-variant hover:border-outline",
            )}>
              <KeyRound size={16} className="absolute left-4 text-on-surface-variant/40" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onFocus={() => setFocused("code")}
                onBlur={() => setFocused(null)}
                placeholder="KRB-XXXXXXXX"
                className="w-full pl-11 pr-4 py-4 bg-transparent font-body text-body-md text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none tracking-wide"
                autoComplete="off"
                disabled={searching}
              />
            </div>
            <p className="font-body text-xs text-on-surface-variant/50 mt-2.5 pl-1">
              Sent to your mobile number after you book (e.g. KRB-3F9A2B7).
            </p>

            <label className="font-body text-sm font-medium text-on-surface block mb-2 mt-6">
              Email Address
            </label>
            <div className={cn(
              "relative flex items-center rounded-xl border transition-all duration-200",
              focused === "email"
                ? "border-primary ring-[3px] ring-primary/10"
                : "border-outline-variant hover:border-outline",
            )}>
              <Mail size={16} className="absolute left-4 text-on-surface-variant/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-4 bg-transparent font-body text-body-md text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none"
                autoComplete="email"
                disabled={searching}
              />
            </div>
            <p className="font-body text-xs text-on-surface-variant/50 mt-2.5 pl-1">
              The email address you used when booking.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={searching}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 px-8 py-4 mt-6 rounded-full",
                "bg-primary text-on-primary font-body text-label-caps uppercase tracking-[0.14em] text-[11px]",
                "shadow-[0_4px_16px_rgba(0,71,171,0.2)]",
                "hover:bg-primary-hover hover:shadow-[0_6px_24px_rgba(0,71,171,0.28)]",
                "transition-all duration-300 cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {searching ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={14} />
                  Find Reservation
                </>
              )}
            </button>
          </form>

          {/* Trust signals */}
          <div className="mt-6 pt-5 border-t border-outline-variant/40">
            <p className="font-body text-xs text-on-surface-variant/50 text-center">
              Both your reservation code and email are required to view your booking.
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 text-center space-y-2"
        >
          <p className="font-body text-xs text-on-surface-variant/40">
            No payment is required until your reservation is approved.
          </p>
          <p className="font-body text-xs text-on-surface-variant/40">
            We&apos;ll keep you updated every step of the way.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

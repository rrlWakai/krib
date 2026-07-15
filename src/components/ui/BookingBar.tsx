import { motion } from 'framer-motion'
import { fadeUp } from '../../lib/animations'

export function BookingBar() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="bg-white rounded-default shadow-elevated border border-outline-variant"
    >
      <div className="px-8 py-6 max-md:px-6 max-md:py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px]">
              Check-in
            </label>
            <input
              className="bg-transparent border-b border-outline text-on-surface font-body text-body-md py-2 placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              placeholder="Select date"
              type="text"
              readOnly
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px]">
              Check-out
            </label>
            <input
              className="bg-transparent border-b border-outline text-on-surface font-body text-body-md py-2 placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              placeholder="Select date"
              type="text"
              readOnly
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px]">
              Guests
            </label>
            <select className="bg-transparent border-b border-outline text-on-surface font-body text-body-md py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer">
              <option>2 Adults</option>
              <option>4 Adults</option>
              <option>6 Adults</option>
              <option>8+ Adults</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-primary text-on-primary py-3 px-6 rounded-default font-body text-label-caps uppercase tracking-widest shadow-button hover:bg-primary-hover hover:shadow-elevated transition-all duration-300 cursor-pointer text-sm">
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

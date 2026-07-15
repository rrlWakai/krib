import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useNavScroll } from '../../hooks/useNavScroll'

const VILLA_ROUTES = ['/krib-1', '/krib-2']

export function VillaHeader() {
  const scrolled = useNavScroll()
  const location = useLocation()
  const isVillaPage = VILLA_ROUTES.includes(location.pathname)

  if (!isVillaPage) return null

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-500',
        scrolled
          ? 'bg-white/90 py-3 shadow-[0_1px_10px_rgba(15,23,42,0.06)] backdrop-blur-xl'
          : 'bg-transparent py-6',
      )}
    >
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-desktop max-md:px-margin-mobile">
        <Link
          to="/"
          className="flex items-center gap-2 group"
        >
          <motion.div
            whileHover={{ x: -3 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'flex items-center gap-2 transition-colors duration-500',
              scrolled ? 'text-on-surface' : 'text-white',
            )}
          >
            <ArrowLeft size={18} />
            <span className="font-body text-label-caps uppercase tracking-widest text-sm">Back</span>
          </motion.div>
        </Link>

        <Link
          to="/"
          className={cn(
            'font-body text-headline-sm tracking-tighter transition-colors duration-500',
            scrolled ? 'text-on-surface' : 'text-white',
          )}
        >
          KRiB
        </Link>
      </div>
    </motion.nav>
  )
}

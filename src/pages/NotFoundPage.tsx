import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { pageTransition, fadeUp } from '../lib/animations'

export function NotFoundPage() {
  return (
    <motion.main
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex items-center justify-center px-margin-desktop max-md:px-margin-mobile"
    >
      <div className="text-center max-w-lg">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display text-[120px] leading-none text-primary/10 font-semibold mb-4"
        >
          404
        </motion.p>
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display text-headline-xl mb-6"
        >
          Page not found
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-body text-body-lg text-on-surface-variant mb-12"
        >
          The page you are looking for does not exist or has been moved. Let
          us help you find your way back.
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-label-caps text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>
      </div>
    </motion.main>
  )
}

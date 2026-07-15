import { motion } from 'framer-motion'
import { fadeUp } from '../../lib/animations'
import { cn } from '../../lib/cn'

interface PageHeroProps {
  subtitle?: string
  title: string
  description?: string
  image?: string
  overlay?: boolean
  align?: 'left' | 'center'
  size?: 'full' | 'half'
  className?: string
}

export function PageHero({
  subtitle,
  title,
  description,
  image,
  overlay = true,
  align = 'left',
  size = 'full',
  className,
}: PageHeroProps) {
  if (size === 'half' && image) {
    return (
      <section
        className={cn(
          'relative flex items-center overflow-hidden bg-surface-container-low pt-32 pb-24',
          className
        )}
      >
        <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              {subtitle && (
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="font-body text-label-caps text-secondary mb-4 tracking-[0.2em]"
                >
                  {subtitle}
                </motion.p>
              )}
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="font-display text-display-lg max-md:text-display-lg-mobile"
              >
                {title}
              </motion.h1>
              {description && (
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="font-body text-body-lg text-on-surface-variant mt-6 max-w-xl"
                >
                  {description}
                </motion.p>
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="aspect-[4/3] overflow-hidden rounded-default shadow-elevated"
            >
              <img
                className="w-full h-full object-cover"
                src={image}
                alt={title}
              />
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'relative flex items-center overflow-hidden',
        size === 'full' ? 'h-[70vh] min-h-[500px]' : 'py-32',
        image ? 'text-white' : 'bg-surface-container-low pt-32 pb-24 text-on-surface',
        className
      )}
    >
      {image && (
        <>
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
            {overlay && <div className="absolute inset-0 bg-black/35" />}
          </div>
        </>
      )}
      <div
        className={cn(
          'relative z-10 mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile',
          align === 'center' ? 'text-center' : ''
        )}
      >
        {subtitle && (
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={cn(
              'font-body text-label-caps mb-4 tracking-[0.2em]',
              image ? 'text-white/80' : 'text-secondary'
            )}
          >
            {subtitle}
          </motion.p>
        )}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className={cn(
            'font-display',
            size === 'full' ? 'text-display-lg max-md:text-display-lg-mobile' : 'text-headline-xl max-md:text-headline-xl-mobile',
            align === 'center' ? 'mx-auto max-w-4xl' : 'max-w-3xl'
          )}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={cn(
              'font-body text-body-lg mt-6',
              image ? 'text-white/80' : 'text-on-surface-variant',
              align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-xl'
            )}
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  )
}

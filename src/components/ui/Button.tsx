import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  className?: string
  as?: 'button' | 'a'
  href?: string
}

const variantClasses = {
  primary:
    'bg-primary text-on-primary shadow-button hover:bg-primary-hover hover:shadow-elevated',
  outline:
    'border border-outline text-on-surface hover:border-primary hover:text-primary',
  ghost: 'text-on-surface-variant hover:text-primary',
}

export function Button({
  children,
  variant = 'primary',
  className,
  as: Component = 'button',
  href,
}: ButtonProps) {
  const baseClasses =
    'font-body text-label-caps uppercase tracking-widest inline-flex items-center justify-center rounded-default transition-all duration-300'

  if (Component === 'a' && href) {
    return (
      <motion.a
        href={href}
        whileHover={{ y: -1 }}
        whileTap={{ y: 0 }}
        className={cn(baseClasses, variantClasses[variant], className)}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 0 }}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </motion.button>
  )
}

import { cn } from '../../lib/cn'

interface SectionHeadingProps {
  label?: string
  title: React.ReactNode
  description?: string
  className?: string
  align?: 'left' | 'center'
  labelClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function SectionHeading({
  label,
  title,
  description,
  className,
  align = 'left',
  labelClassName,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === 'center' ? 'text-center mx-auto' : '',
        className
      )}
    >
      {label && (
        <p
          className={cn(
            'font-body text-label-caps text-secondary mb-4 tracking-[0.2em]',
            labelClassName
          )}
        >
          {label}
        </p>
      )}
      {typeof title === 'string' ? (
        <h2
          className={cn(
            'font-display text-headline-xl mb-6',
            titleClassName
          )}
        >
          {title}
        </h2>
      ) : (
        title
      )}
      {description && (
        <p
          className={cn(
            'font-body text-body-lg text-on-surface-variant max-w-2xl',
            align === 'center' ? 'mx-auto' : '',
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}

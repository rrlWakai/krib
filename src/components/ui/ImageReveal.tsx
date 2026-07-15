import { motion } from 'framer-motion'
import { useState } from 'react'
import { imageReveal } from '../../lib/animations'
import { cn } from '../../lib/cn'

interface ImageRevealProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
  priority?: boolean
  rounded?: boolean
}

export function ImageReveal({
  src,
  alt,
  className,
  aspectRatio = 'aspect-[4/5]',
  priority = false,
  rounded = true,
}: ImageRevealProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      variants={imageReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={cn(
        'overflow-hidden bg-surface-container',
        rounded && 'rounded-default',
        aspectRatio,
        className
      )}
    >
      {!loaded && (
        <div className="w-full h-full bg-surface-container-highest animate-pulse" />
      )}
      <img
        className={cn(
          'w-full h-full object-cover transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
      />
    </motion.div>
  )
}

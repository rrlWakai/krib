import { motion } from 'framer-motion'
import { images } from '../../../lib/images'

interface GalleryItem {
  id: string
  src: string
  alt: string
  caption?: string
  cols: string
  height: string
}

const gallery: GalleryItem[] = [
  {
    id: 'portrait',
    src: images.krib2,
    alt: 'KRiB 2 villa exterior with tropical garden',
    caption: 'KRiB 2 — signature villa',
    cols: 'md:col-span-5',
    height: 'h-[35vh] md:h-[80vh]',
  },
  {
    id: 'lifestyle',
    src: images.galleryBreakfast,
    alt: 'Al fresco breakfast at KRiB',
    caption: 'Slow mornings by the pool',
    cols: 'md:col-span-7',
    height: 'h-[35vh] md:h-[80vh]',
  },
  {
    id: 'interior',
    src: images.krib2Living,
    alt: 'Spacious living room with natural light',
    caption: 'Open living, open hearts',
    cols: 'md:col-span-4',
    height: 'h-[30vh] md:h-[65vh]',
  },
  {
    id: 'detail',
    src: images.galleryStairs,
    alt: 'Architectural staircase detail',
    caption: 'Every detail tells a story',
    cols: 'md:col-span-4',
    height: 'h-[30vh] md:h-[65vh]',
  },
  {
    id: 'garden',
    src: images.krib1Pool,
    alt: 'Private pool surrounded by lush greenery',
    caption: 'Your own tropical escape',
    cols: 'md:col-span-4',
    height: 'h-[30vh] md:h-[65vh]',
  },
  {
    id: 'aerial',
    src: images.hero,
    alt: 'Aerial view of KRiB Beverly Place estate',
    caption: 'Beverly Place, Pampanga',
    cols: 'md:col-span-12',
    height: 'h-[35vh] md:h-[70vh]',
  },
]

function GridImage({ item, index }: { item: GalleryItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden group ${item.cols} col-span-12`}
    >
      <div className={`relative overflow-hidden ${item.height}`}>
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover transition-all duration-1000"
          src={item.src}
          alt={item.alt}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        {item.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <p className="font-body text-label-caps text-white/80 tracking-[0.2em] text-xs">
              {item.caption}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function Gallery() {
  return (
    <section className="overflow-hidden bg-white" id="gallery">
      {/* Section header */}
      <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile pt-section-gap max-md:pt-section-gap-mobile pb-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="w-8 h-px bg-primary/40" />
            <span className="font-body text-label-caps text-primary uppercase tracking-[0.28em] text-sm font-medium">
              Gallery
            </span>
          </div>
          <h2 className="font-display text-display-md max-md:text-display-md-mobile text-on-surface mb-5 leading-tight max-w-3xl">
            A visual journal.
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
            Every corner of KRiB tells a story. Light through the leaves.
            Laughter by the pool. Quiet mornings that stretch into
            afternoons.
          </p>
        </motion.div>
      </div>

      {/* Editorial grid */}
      <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile pb-20 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {gallery.map((item, i) => (
            <GridImage key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

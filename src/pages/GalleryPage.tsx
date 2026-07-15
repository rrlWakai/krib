import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { galleryImages, siteContent } from '../lib/data'
import { pageTransition, staggerContainer, fadeUp } from '../lib/animations'
import { cn } from '../lib/cn'

const allCategories = siteContent.gallery.categories

export function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <motion.main
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHero
        title={siteContent.gallery.heroTitle}
        description={siteContent.gallery.heroDescription}
        size="half"
      />

      <section className="py-section-gap">
        <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
          <Reveal>
            <div className="flex flex-wrap gap-4 mb-16">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'font-body text-label-caps uppercase tracking-widest px-6 py-3 rounded-default transition-all duration-300 cursor-pointer',
                    activeCategory === cat.id
                      ? 'bg-primary text-on-primary shadow-button'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
          >
            {galleryImages.map((img) => (
              <motion.div
                key={img.id}
                variants={fadeUp}
                className={cn(img.colSpan, img.rowSpan, 'overflow-hidden rounded-default shadow-card')}
              >
                <div className="w-full h-full min-h-[300px] bg-surface-container overflow-hidden group">
                  <img
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    src={img.src}
                    alt={img.alt}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-label-caps text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-primary-hover hover:border-primary-hover transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </section>
    </motion.main>
  )
}

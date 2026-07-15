import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'
import { siteContent, nearbyAttractions } from '../lib/data'
import { images } from '../lib/images'
import { pageTransition } from '../lib/animations'
import { getIcon } from '../lib/iconMap'

export function LocationPage() {
  const { location } = siteContent

  return (
    <motion.main
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHero
        title={location.heroTitle}
        description={location.heroDescription}
        size="half"
      />

      <section className="py-section-gap px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <Reveal className="md:col-span-5">
            <SectionLabel>GETTING HERE</SectionLabel>
            <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-8">
              Directions
            </h2>

            <div className="space-y-8 mb-12">
              {location.directions.map((d, i) => (
                <div key={i} className="border-l-2 border-primary pl-6">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-body text-label-caps text-secondary uppercase tracking-widest">
                      From {d.from}
                    </span>
                    <span className="font-body text-label-caps text-on-surface-variant/50">
                      |
                    </span>
                    <span className="font-body text-label-caps text-on-surface-variant uppercase tracking-widest">
                      {d.travelTime}
                    </span>
                  </div>
                  <p className="font-body text-body-md text-on-surface-variant">
                    {d.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-on-surface-variant">
              <MapPin size={20} />
              <span className="font-body text-body-md">{location.address}</span>
            </div>
          </Reveal>

          <Reveal delay={200} className="md:col-span-6 md:col-start-7">
            <div className="aspect-[4/3] bg-surface-container-highest rounded-default overflow-hidden shadow-elevated grayscale hover:grayscale-0 transition-all duration-1000">
              <img
                className="w-full h-full object-cover"
                src={images.map}
                alt="Map showing KRiB Beverly Place location"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface-container-low py-section-gap">
        <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
          <Reveal>
            <div className="max-w-2xl mb-16">
              <SectionLabel>NEARBY</SectionLabel>
              <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile">
                What is close by
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyAttractions.map((a, i) => {
              const Icon = getIcon(a.icon)
              return (
                <Reveal key={a.id} delay={i * 80}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-surface border border-outline-variant rounded-default p-6 flex items-start gap-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-500"
                  >
                    <Icon size={24} className="text-on-surface-variant shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-body text-body-md font-semibold text-on-surface mb-1">
                        {a.name}
                      </h3>
                      <p className="font-body text-body-md text-on-surface-variant text-sm mb-2">
                        {a.description}
                      </p>
                      <span className="font-body text-label-caps text-secondary uppercase tracking-widest text-[11px]">
                        {a.travelTime}
                      </span>
                    </div>
                  </motion.div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="pb-24 pt-16 px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto text-center">
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

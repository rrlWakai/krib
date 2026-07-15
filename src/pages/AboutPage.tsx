import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { SectionLabel } from '../components/ui/SectionLabel'
import { siteContent } from '../lib/data'
import { pageTransition } from '../lib/animations'
import { images } from '../lib/images'

export function AboutPage() {
  const { aboutPage } = siteContent

  return (
    <motion.main
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHero
        title={aboutPage.heroTitle}
        description={aboutPage.heroDescription}
        image={images.hero}
        size="half"
      />

      {aboutPage.sections.map((section, i) => (
        <section
          key={section.title}
          className={`py-section-gap px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto ${
            i % 2 === 1 ? 'bg-surface-container-low' : 'bg-surface'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
            <Reveal className="md:col-span-4 md:col-start-2">
              <SectionLabel>0{i + 1}</SectionLabel>
              <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile">
                {section.title}
              </h2>
            </Reveal>
            <Reveal delay={150} className="md:col-span-5">
              <div className="space-y-6">
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="font-body text-body-lg text-on-surface-variant leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <section className="py-24 px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto text-center">
        <Reveal>
          <p className="font-display text-quote italic text-on-surface-variant max-w-2xl mx-auto mb-12">
            &ldquo;We are not a resort. We are not a hotel. We are a place
            where you can breathe, connect, and remember what matters most.&rdquo;
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-label-caps text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-primary-hover hover:border-primary-hover transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </Reveal>
      </section>
    </motion.main>
  )
}

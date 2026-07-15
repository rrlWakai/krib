import { motion } from 'framer-motion'
import { cn } from '../../../lib/cn'
import { experiences } from '../../../lib/data'

export function Experiences() {
  return (
    <section className="relative overflow-hidden bg-white py-section-gap">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,71,171,0.015),transparent_50%)] pointer-events-none" />

      <div className="relative mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-20"
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="w-8 h-px bg-primary/40" />
            <span className="font-body text-label-caps text-primary uppercase tracking-[0.28em] text-sm font-medium">
              The Experience
            </span>
          </div>
          <h2 className="font-display text-display-md max-md:text-display-md-mobile text-on-surface mb-5 leading-tight max-w-3xl">
            It is the little moments that make a weekend unforgettable.
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Central timeline rail - hidden on mobile, visible on md+ */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant/40 -translate-x-1/2" />

          {/* Mobile timeline rail - visible on mobile only */}
          <div className="md:hidden absolute left-5 top-0 bottom-0 w-px bg-outline-variant/30" />

          <div className="space-y-24 md:space-y-32">
            {experiences.map((exp, i) => {
              const isEven = i % 2 === 0

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  {/* Timeline dot - desktop */}
                  <div className="hidden md:block absolute left-1/2 top-8 w-3 h-3 rounded-full bg-white border-2 border-primary/50 -translate-x-1/2 z-10 shadow-[0_0_0_4px_rgba(0,71,171,0.06)]" />

                  {/* Timeline dot - mobile */}
                  <div className="md:hidden absolute left-5 top-7 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary/40 -translate-x-1/2 z-10" />

                  {/* Desktop: alternating grid */}
                  <div className="hidden md:grid grid-cols-12 gap-8 items-center">
                    {/* Image */}
                    <div className={cn("col-span-5", isEven ? "" : "col-start-8")}>
                      <div className="overflow-hidden rounded-sm bg-surface-container">
                        <motion.img
                          whileHover={{ scale: 1.04 }}
                          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                          className="w-full h-[280px] lg:h-[340px] object-cover transition-transform duration-1000"
                          src={exp.image}
                          alt={exp.title}
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <div className={cn("col-span-5", isEven ? "col-start-8" : "")}>
                      <span className="font-body text-label-caps text-primary/40 tracking-[0.3em] text-xs">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-headline-md text-on-surface mt-3 mb-5 leading-tight">
                        {exp.title}
                      </h3>
                      <p className="font-body text-body-lg text-on-surface-variant leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>

                  {/* Mobile: stacked below timeline */}
                  <div className="md:hidden pl-14">
                    <span className="font-body text-label-caps text-primary/40 tracking-[0.3em] text-xs">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-headline-md text-on-surface mt-2 mb-4 leading-tight">
                      {exp.title}
                    </h3>
                    <div className="overflow-hidden rounded-sm bg-surface-container mb-5">
                      <img
                        className="w-full h-[200px] object-cover"
                        src={exp.image}
                        alt={exp.title}
                      />
                    </div>
                    <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

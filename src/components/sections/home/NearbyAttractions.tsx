import { motion } from 'framer-motion'
import { Reveal } from "../../ui/Reveal";
import { nearbyAttractions } from "../../../lib/data";
import { getIcon } from "../../../lib/iconMap";

export function NearbyAttractions() {
  return (
    <section className="py-section-gap bg-surface">
      <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
        <Reveal>
          <div className="max-w-2xl mb-16">
            <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-6">
              Discover what surrounds your stay.
            </h2>
            <p className="font-body text-body-lg text-on-surface-variant">
              From local dining to easy access to the city, these nearby spots
              make every stay feel even more effortless.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {nearbyAttractions.map((attraction, i) => {
            const Icon = getIcon(attraction.icon)
            return (
              <Reveal key={attraction.id} delay={i * 100}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-surface border border-outline-variant rounded-default p-6 flex items-start gap-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-500"
                >
                  <Icon size={24} className="text-on-surface-variant shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-body text-body-md font-semibold text-on-surface mb-1">
                      {attraction.name}
                    </h3>
                    <p className="font-body text-body-md text-on-surface-variant mb-2">
                      {attraction.description}
                    </p>
                    <span className="font-body text-label-caps text-secondary uppercase tracking-widest">
                      {attraction.travelTime}
                    </span>
                  </div>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  );
}

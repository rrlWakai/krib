import { ArrowRight, Users, Clock, Waves, Snowflake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../../ui/Reveal'
import { villas } from '../../../lib/data'
import type { LucideIcon } from 'lucide-react'

const quickInfoIcons: Record<string, LucideIcon> = {
  users: Users,
  clock: Clock,
  pool: Waves,
  ac: Snowflake,
}

export function ChooseYourStay() {
  const [villa1, villa2] = villas

  const villaQuickInfo = [
    { icon: 'users', label: (n: number) => `Up to ${n} Guests` },
    { icon: 'clock', label: () => '22-Hour Stay' },
    { icon: 'pool', label: () => 'Private Swimming Pool' },
    { icon: 'ac', label: () => 'Fully Air-conditioned' },
  ]

  return (
    <section className="py-section-gap px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto">
      <Reveal>
        <div className="max-w-2xl mb-20">
          <p className="font-body text-label-caps text-secondary mb-4 tracking-[0.2em]">
            CHOOSE YOUR VILLA
          </p>
          <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-6">
            Two villas. One unforgettable experience.
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant">
            Whether you are planning an intimate family getaway or a grand
            celebration, each villa offers its own personality. The question
            is not which is better — but which feels like yours.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <Reveal delay={100}>
          <div className="group relative">
            <Link to={`/${villa1.slug}`} className="block mb-8">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-container">
                <img
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                  src={villa1.image}
                  alt={villa1.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </Link>
            <div className="max-w-lg">
              <span className="font-body text-label-caps text-secondary tracking-[0.2em]">
                {villa1.number}
              </span>
              <h3 className="font-display text-headline-xl max-md:text-headline-xl-mobile mt-2 mb-3">
                {villa1.name}
              </h3>
              <p className="font-display text-quote italic text-on-surface mb-4 leading-relaxed">
                The Original Family Retreat
              </p>
              <p className="font-body text-body-lg text-on-surface-variant mb-6 leading-relaxed">
                Perfect for intimate family gatherings, birthdays, and peaceful weekend escapes.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-10">
                {villaQuickInfo.map((info) => {
                  const Icon = quickInfoIcons[info.icon]
                  return (
                    <div key={info.icon} className="flex items-center gap-3 bg-surface-container-low rounded-default px-4 py-3">
                      <Icon size={18} className="text-on-surface-variant shrink-0" />
                      <span className="font-body text-body-md text-on-surface text-sm">
                        {info.label(villa1.maxGuests)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <Link
                to={`/${villa1.slug}`}
                className="group/link inline-flex items-center gap-3 font-body text-label-caps text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-primary-hover hover:border-primary-hover transition-all duration-300"
              >
                Explore {villa1.name}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover/link:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={250}>
          <div className="group relative md:mt-32">
            <Link to={`/${villa2.slug}`} className="block mb-8">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-container">
                <img
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                  src={villa2.image}
                  alt={villa2.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </Link>
            <div className="max-w-lg">
              <span className="font-body text-label-caps text-secondary tracking-[0.2em]">
                {villa2.number}
              </span>
              <h3 className="font-display text-headline-xl max-md:text-headline-xl-mobile mt-2 mb-3">
                {villa2.name}
              </h3>
              <p className="font-display text-quote italic text-on-surface mb-4 leading-relaxed">
                The Signature Celebration Villa
              </p>
              <p className="font-body text-body-lg text-on-surface-variant mb-6 leading-relaxed">
                Designed for larger celebrations, reunions, and unforgettable group experiences.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-10">
                {villaQuickInfo.map((info) => {
                  const Icon = quickInfoIcons[info.icon]
                  return (
                    <div key={info.icon} className="flex items-center gap-3 bg-surface-container-low rounded-default px-4 py-3">
                      <Icon size={18} className="text-on-surface-variant shrink-0" />
                      <span className="font-body text-body-md text-on-surface text-sm">
                        {info.label(villa2.maxGuests)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <Link
                to={`/${villa2.slug}`}
                className="group/link inline-flex items-center gap-3 font-body text-label-caps text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-primary-hover hover:border-primary-hover transition-all duration-300"
              >
                Explore {villa2.name}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover/link:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

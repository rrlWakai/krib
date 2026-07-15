import { Star } from 'lucide-react'
import { Reveal } from '../../ui/Reveal'
import { testimonials } from '../../../lib/data'

export function Testimonials() {
  return (
    <section className="py-section-gap px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto">
      <Reveal>
        <div className="max-w-2xl mb-16">
          <p className="font-body text-label-caps text-secondary mb-4 tracking-[0.2em]">
            GUEST STORIES
          </p>
          <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-6">
            What our guests are saying.
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <Reveal key={t.id} delay={i * 150}>
            <div className="bg-surface border border-outline-variant rounded-default p-8 h-full flex flex-col shadow-card hover:shadow-elevated transition-shadow duration-500">
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="text-on-surface-variant fill-on-surface-variant"
                  />
                ))}
              </div>
              <p className="font-body text-body-lg text-on-surface-variant mb-8 flex-1 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-6 border-t border-outline-variant">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="font-body text-label-caps text-primary font-semibold">
                    {t.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <span className="font-body text-body-md font-semibold text-on-surface block">
                    {t.author}
                  </span>
                  <span className="font-body text-body-md text-on-surface-variant">
                    {t.location}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

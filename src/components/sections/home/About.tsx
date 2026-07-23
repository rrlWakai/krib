import { Reveal } from '../../ui/Reveal'
import { siteContent } from '../../../lib/data'
import { images } from '../../../lib/images'

export function About() {
  return (
    <section className="py-section-gap bg-surface-container-low">
      <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile grid grid-cols-1 md:grid-cols-2 items-center gap-20">
        <Reveal className="order-2 md:order-1">
          <p className="font-body text-label-caps text-secondary mb-6 tracking-[0.2em]">
            {siteContent.about.label}
          </p>
          <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-8 leading-tight">
            {siteContent.about.title}
          </h2>
          <div className="space-y-5 text-on-surface-variant font-body text-body-lg leading-relaxed">
            {siteContent.about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={300} className="order-1 md:order-2">
          <div className="relative">
            <img
              className="w-full aspect-4/5 object-cover rounded-default shadow-elevated"
              src={images.about}
              alt="Family gathering at KRiB Beverly Place"
            />
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary-container/30 rounded-default hidden md:block" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

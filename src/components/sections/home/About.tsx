import { Reveal } from '../../ui/Reveal'
import { images } from '../../../lib/images'
import { usePublishedWebsite } from '../../../hooks/usePublishedWebsite'
import { resolveHomeContent } from '../../../lib/websiteContent'

export function About() {
  const { content } = usePublishedWebsite()
  const home = resolveHomeContent(content?.pages?.home)

  return (
    <section className="py-section-gap bg-surface-container-low">
      <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile grid grid-cols-1 md:grid-cols-2 items-center gap-20">
        <Reveal className="order-2 md:order-1">
          <p className="font-body text-label-caps text-secondary mb-6 tracking-[0.2em]">
            {home.about.label}
          </p>
          <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-8 leading-tight">
            {home.about.title}
          </h2>
          <div className="space-y-5 text-on-surface-variant font-body text-body-lg leading-relaxed">
            {home.about.paragraphs.map((p, i) => (
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
            <img
              src={images.krib2}
              alt="KRiB Beverly Place"
              className="absolute -bottom-6 -left-6 w-48 h-48 object-cover rounded-default shadow-elevated hidden md:block"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

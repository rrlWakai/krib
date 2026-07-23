import { motion, useScroll, useTransform } from 'framer-motion'
import { Reveal } from '../../ui/Reveal'
import { images } from '../../../lib/images'

function scrollToVillas() {
  const el = document.getElementById('villas')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function CTA() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, 40])
  const scale = useTransform(scrollY, [0, 400], [1.02, 1.08])

  return (
    <section className="relative overflow-hidden bg-[#0f172a] py-20 md:py-40 lg:py-48">
      <motion.img
        src={images.cta}
        alt=""
        style={{ y, scale }}
        className="absolute inset-0 h-[112%] w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.24)_55%,rgba(0,0,0,0.5)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.12),transparent_45%)]" />
      <div className="relative z-10 mx-auto flex min-h-80 w-full max-w-container-max items-center justify-center px-margin-desktop max-md:px-margin-mobile">
        <div className="max-w-3xl text-center">
          <Reveal>
            <p className="mx-auto mb-5 w-fit rounded-full border border-white/25 bg-white/12 px-4 py-2 font-body text-label-caps uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm">
              Your Perfect Villa Awaits
            </p>
          </Reveal>
          <Reveal>
            <h2 className="mb-8 font-display text-headline-xl leading-tight text-white max-md:text-headline-xl-mobile">
              Ready to Find Your Perfect Villa?
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mb-10 max-w-2xl font-body text-body-lg text-white/85 leading-relaxed">
              Whether you are planning a peaceful family getaway or a memorable
              celebration with loved ones, explore KRiB 1 and KRiB 2 to discover
              the stay that is right for you.
            </p>
          </Reveal>
           <Reveal delay={400}>
             <button
               onClick={scrollToVillas}
               className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 font-body text-label-caps uppercase tracking-[0.2em] text-primary shadow-[0_16px_40px_rgba(15,23,42,0.22)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-[0_22px_46px_rgba(15,23,42,0.28)] cursor-pointer"
             >
               Explore Villas
             </button>
           </Reveal>
        </div>
      </div>
    </section>
  )
}

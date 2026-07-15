import { siteContent } from "../../../lib/data";
import heroImage from "../../../assets/hero.png";
import { ArrowRight } from "lucide-react";
import { Reveal } from "../../ui/Reveal";

export function Hero() {
  return (
    <header className="relative h-screen w-full flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
        <div className="max-w-3xl">
          <Reveal delay={0}>
            <p className="font-body text-label-caps text-white/80 tracking-[0.3em] mb-5">
              {siteContent.hero.subtitle}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <h1 className="font-display text-display-lg max-md:text-display-lg-mobile text-white mb-6 leading-tight">
              {siteContent.hero.title}
            </h1>
          </Reveal>
          <Reveal delay={400}>
            <p className="font-body text-body-lg text-white/90 max-w-xl leading-relaxed">
              {siteContent.hero.description}
            </p>
          </Reveal>
          <Reveal delay={600}>
            <div className="mt-10">
              <a
                href="#villas"
                className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-default font-body text-label-caps uppercase tracking-widest shadow-button hover:bg-primary hover:text-white hover:shadow-elevated transition-all duration-500"
              >
                Explore our villas
                <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </header>
  );
}

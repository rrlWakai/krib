import { motion } from "framer-motion";
import { ArrowUpRight, Facebook, Instagram } from "lucide-react";
import { Reveal } from "../../ui/Reveal";
import socialImage from "../../../assets/soc.png";

const socialPlatforms = [
  {
    name: "Facebook",
    handle: "KRiB Beverly Place",
    blurb: "Message us on Facebook",
    href: "https://www.facebook.com/kribbeverlyplace",
    icon: Facebook,
    accent: "from-primary to-primary/90",
  },
  {
    name: "Instagram",
    handle: "@krib_at_beverlyplace",
    blurb: "Follow our journey",
    href: "https://www.instagram.com/krib_at_beverlyplace?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    icon: Instagram,
    accent: "from-primary/90 to-primary/70",
  },
];

export function Connect() {
  return (
    <section
      id="connect"
      className="relative overflow-hidden bg-[#f7fafc] py-section-gap max-md:py-section-gap-mobile"
    >
      <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
        <div className="overflow-hidden rounded-4xl border border-white/60 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
          <div className="grid items-stretch lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative flex flex-col justify-center bg-[#f3f7fb] p-10 md:p-14 lg:p-16">
              <Reveal className="max-w-xl">
                <p className="mb-6 font-body text-label-caps uppercase tracking-[0.24em] text-primary">
                  Let's Connect
                </p>
                <h2 className="mb-6 font-display text-headline-xl leading-tight text-on-surface max-md:text-headline-xl-mobile">
                  Have questions about your stay, availability, or celebrations?
                </h2>
                <p className="mb-4 font-body text-body-lg text-on-surface-variant">
                  We're just a message away.
                </p>
                <p className="mb-10 font-body text-body-lg leading-relaxed text-on-surface-variant">
                  Connect with us on Facebook or Instagram and we'll be happy to
                  help you plan your perfect getaway.
                </p>

                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://www.facebook.com/kribbeverlyplace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 font-body text-label-caps uppercase tracking-[0.2em] text-white shadow-[0_12px_30px_rgba(79,145,184,0.24)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_18px_36px_rgba(79,145,184,0.28)]"
                  >
                    Message on Facebook
                    <ArrowUpRight size={18} />
                  </a>
                  <a
                    href="https://www.instagram.com/krib_at_beverlyplace?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-full border border-primary/25 bg-white px-7 py-4 font-body text-label-caps uppercase tracking-[0.2em] text-primary shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-0.5 hover:border-primary hover:bg-[#f7fbfd]"
                  >
                    Visit Instagram
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </Reveal>
            </div>

            <div className="relative min-h-80 md:min-h-120 overflow-hidden">
              <img
                src={socialImage}
                alt="A lifestyle image of KRiB Beverly Place"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/70 via-[#0f172a]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <div className="grid gap-4 md:grid-cols-2">
                  {socialPlatforms.map((platform, index) => {
                    const Icon = platform.icon;

                    return (
                      <motion.a
                        key={platform.name}
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ duration: 0.5, delay: 0.12 * index }}
                        whileHover={{
                          y: -6,
                          scale: 1.01,
                          boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
                        }}
                        className={`rounded-[1.25rem] bg-linear-to-br ${platform.accent} p-px`}
                      >
                        <div className="rounded-[1.2rem] bg-white/95 p-5 text-on-surface backdrop-blur-sm">
                          <div className="mb-4 inline-flex rounded-full bg-on-surface-variant/5 p-3 text-on-surface-variant">
                            <Icon size={20} />
                          </div>
                          <p className="font-body text-label-caps uppercase tracking-[0.24em] text-primary">
                            {platform.name}
                          </p>
                          <p className="mt-2 font-body text-body-md text-on-surface">
                            {platform.handle}
                          </p>
                          <p className="mt-1 font-body text-sm text-on-surface-variant">
                            {platform.blurb}
                          </p>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

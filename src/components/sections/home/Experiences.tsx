import { motion } from "framer-motion";
import { cn } from "../../../lib/cn";
import { usePublishedWebsite } from "../../../hooks/usePublishedWebsite";
import { resolveHomeContent } from "../../../lib/websiteContent";

export function Experiences() {
  const { content } = usePublishedWebsite();
  const home = resolveHomeContent(content?.pages?.home);

  return (
    <section className="relative overflow-hidden bg-white py-section-gap max-md:py-section-gap-mobile">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,71,171,0.015),transparent_50%)] pointer-events-none" />

      <div className="relative mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
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
              {home.experiences.label}
            </span>
          </div>
          <h2 className="font-display text-display-md max-md:text-display-md-mobile text-on-surface mb-5 leading-tight max-w-3xl">
            {home.experiences.title}
          </h2>
        </motion.div>

        <div className="flex flex-col gap-16 md:gap-20">
          {home.experiences.items.map((exp, i) => {
            const imageOnRight = i % 2 === 1;

            return (
              <motion.article
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-sm bg-surface-container",
                    imageOnRight && "md:order-2",
                  )}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.04 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-full w-full object-cover object-center"
                      src={exp.image}
                      alt={exp.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                <div className="max-w-xl">
                  <span className="font-body text-label-caps text-primary/40 tracking-[0.3em] text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-headline-md max-md:text-headline-md-mobile text-on-surface mt-3 mb-5 leading-tight">
                    {exp.title}
                  </h3>
                  <p className="font-body text-body-lg max-md:text-body-md text-on-surface-variant leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

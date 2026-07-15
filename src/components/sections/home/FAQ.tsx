import { useState, useId } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/cn";
import { faqCategories } from "../../../lib/data";
import type { FAQCategory } from "../../../types";

function ChapterAccordion({ category, index }: { category: FAQCategory; index: number }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const uid = useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Chapter header */}
      <div className="flex items-start gap-6 mb-10 md:mb-12">
        <span className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-light text-primary/15 leading-none select-none tracking-tight">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 pt-1.5 md:pt-3">
          <div className="flex items-center gap-4 mb-3">
            <span className="font-body text-label-caps text-primary uppercase tracking-[0.28em] text-sm font-medium">
              {category.category}
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          <p className="font-body text-body-md text-on-surface-variant/60 leading-relaxed max-w-lg text-sm">
            {category.items.length}{" "}
            {category.items.length === 1 ? "question" : "questions"}
          </p>
        </div>
      </div>

      {/* Timeline + items */}
      <div className="relative pl-8 md:pl-10">
        {/* Vertical timeline rail */}
        <div className="absolute left-0 top-2 bottom-0 w-px bg-outline-variant/40" />

        <div className="space-y-8">
          {category.items.map((item, i) => {
            const isOpen = openId === item.id;
            const btnId = `${uid}-btn-${item.id}`;
            const panelId = `${uid}-panel-${item.id}`;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute -left-8 md:-left-10 top-[18px] w-[9px] h-[9px] rounded-full border-2 transition-all duration-500 -translate-x-1/2",
                    isOpen
                      ? "border-primary bg-primary scale-110"
                      : "border-outline-variant/50 bg-white group-hover:border-primary/50",
                  )}
                />

                <button
                  id={btnId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="group flex w-full items-start justify-between gap-4 py-2 text-left cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span
                    className={cn(
                      "font-body text-body-lg leading-relaxed transition-colors duration-300 pr-4 flex-1",
                      isOpen
                        ? "text-primary font-medium"
                        : "text-on-surface group-hover:text-primary/80",
                    )}
                  >
                    {item.question}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-400 mt-0.5",
                      isOpen
                        ? "border-primary/20 bg-primary/5 text-primary rotate-90"
                        : "border-outline-variant/40 text-on-surface-variant/40 group-hover:border-primary/30 group-hover:text-primary/60",
                    )}
                  >
                    <motion.span
                      key={isOpen ? "minus" : "plus"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {isOpen ? <Minus size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
                    </motion.span>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: -4 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.3, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
                        className="pb-4"
                      >
                        <div className="w-10 h-px bg-primary/20 mb-5" />
                        <p className="font-body text-body-md text-on-surface-variant leading-relaxed max-w-2xl pl-0">
                          {item.answer}
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="relative overflow-hidden bg-white py-section-gap">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,71,171,0.02),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(79,145,184,0.02),transparent_50%)] pointer-events-none" />

      <div className="relative mx-auto w-full max-w-[920px] px-margin-desktop max-md:px-margin-mobile">
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
              Guidance
            </span>
          </div>
          <h2 className="font-display text-display-md max-md:text-display-md-mobile text-on-surface mb-5 leading-tight max-w-3xl">
            Everything you need to know before you arrive.
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            We have gathered the questions guests ask most when planning their stay.
            If you cannot find what you are looking for, reach out on{" "}
            <a
              href="https://www.facebook.com/KribBeverlyPlace"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary border-b border-primary/30 hover:border-primary transition-colors"
            >
              Facebook
            </a>{" "}
            or{" "}
            <a
              href="https://www.instagram.com/krib_at_beverlyplace"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary border-b border-primary/30 hover:border-primary transition-colors"
            >
              Instagram
            </a>
            .
          </p>
        </motion.div>

        {/* Editorial chapters */}
        <div className="space-y-20 md:space-y-28">
          {faqCategories.map((category, i) => (
            <ChapterAccordion key={category.id} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

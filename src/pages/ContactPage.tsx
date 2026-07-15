import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { PageHero } from "../components/ui/PageHero";
import { Reveal } from "../components/ui/Reveal";
import { SectionLabel } from "../components/ui/SectionLabel";
import { Button } from "../components/ui/Button";
import { siteContent } from "../lib/data";
import { pageTransition } from "../lib/animations";

export function ContactPage() {
  const { contact } = siteContent;
  const contactInfo = [
    { label: "Email", value: contact.email, icon: Mail },
    { label: "Phone", value: contact.phone, icon: Phone },
    { label: "Address", value: contact.address, icon: MapPin },
  ];
  const { social } = contact;

  return (
    <motion.main
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHero
        title={contact.title}
        description={contact.description}
        size="half"
      />

      <section className="py-section-gap px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <Reveal className="md:col-span-5">
            <SectionLabel>GET IN TOUCH</SectionLabel>
            <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-8">
              We would love to hear from you
            </h2>
            <p className="font-body text-body-lg text-on-surface-variant mb-12 leading-relaxed">
              {contact.description}
            </p>

            <div className="space-y-6 mb-12">
              {contactInfo.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <Icon size={20} className="text-on-surface-variant shrink-0" />
                    <div>
                      <span className="font-body text-label-caps text-secondary uppercase tracking-widest text-[11px] block mb-1">
                        {item.label}
                      </span>
                      <span className="font-body text-body-md text-on-surface">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <a
                href={social.facebook}
                className="font-body text-label-caps text-on-surface-variant uppercase tracking-widest border-b border-outline-variant pb-1 hover:text-primary hover:border-primary transition-colors"
              >
                Facebook
              </a>
              <a
                href={social.instagram}
                className="font-body text-label-caps text-on-surface-variant uppercase tracking-widest border-b border-outline-variant pb-1 hover:text-primary hover:border-primary transition-colors"
              >
                Instagram
              </a>
            </div>
          </Reveal>

          <Reveal delay={200} className="md:col-span-6 md:col-start-7">
            <div className="bg-surface-container-low border border-outline-variant rounded-default p-10 shadow-elevated">
              <h3 className="font-display text-headline-md mb-8">
                Send us an inquiry
              </h3>
              <form className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="font-body text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] block mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-outline-variant rounded-default bg-surface px-5 py-3.5 font-body text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                    placeholder="Your first name"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="font-body text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] block mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-outline-variant rounded-default bg-surface px-5 py-3.5 font-body text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                    placeholder="Your last name"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-body text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-outline-variant rounded-default bg-surface px-5 py-3.5 font-body text-body-md text-on-surface outline-none focus:border-primary transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-body text-label-caps text-on-surface-variant uppercase tracking-widest text-[11px] block mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full border border-outline-variant rounded-default bg-surface px-5 py-3.5 font-body text-body-md text-on-surface outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Tell us about your plans..."
                  />
                </div>
                <div className="col-span-2 pt-4">
                  <Button variant="primary">Send Inquiry</Button>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-24 px-margin-desktop max-md:px-margin-mobile max-w-container-max mx-auto text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-label-caps text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-primary-hover hover:border-primary-hover transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </section>
    </motion.main>
  );
}

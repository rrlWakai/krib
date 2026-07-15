import { Link } from "react-router-dom";
import { siteContent } from "../../lib/data";

export function Footer() {
  const { contact } = siteContent;

  return (
    <footer className="bg-surface border-t border-outline-variant overflow-hidden">
      <div className="mx-auto w-full max-w-container-max">
        {/* Large type — brand as editorial statement */}
        <div className="px-margin-desktop max-md:px-margin-mobile pt-20 pb-10 md:pt-28 md:pb-12">
          <Link to="/" className="inline-block">
            <h2 className="font-display font-bold text-[clamp(4rem,18vw,10rem)] text-primary leading-[0.85] tracking-[-0.04em] select-none hover:opacity-80 transition-opacity duration-500">
              KRiB
            </h2>
          </Link>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 px-margin-desktop max-md:px-margin-mobile pb-16 md:pb-20">
          {/* Quick links */}
          <div className="md:col-span-4">
            <p className="font-body text-label-caps text-on-surface-variant/50 tracking-[0.25em] mb-5 text-[10px] uppercase">
              Villas
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/krib-1"
                className="font-body text-headline-xs text-on-surface hover:text-primary transition-colors duration-300"
              >
                KRiB 1
              </Link>
              <Link
                to="/krib-2"
                className="font-body text-headline-xs text-on-surface hover:text-primary transition-colors duration-300"
              >
                KRiB 2
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-4">
            <p className="font-body text-label-caps text-on-surface-variant/50 tracking-[0.25em] mb-5 text-[10px] uppercase">
              Explore
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/#story"
                className="font-body text-headline-xs text-on-surface hover:text-primary transition-colors duration-300"
              >
                About
              </Link>
              <Link
                to="/gallery"
                className="font-body text-headline-xs text-on-surface hover:text-primary transition-colors duration-300"
              >
                Gallery
              </Link>
              <Link
                to="/location"
                className="font-body text-headline-xs text-on-surface hover:text-primary transition-colors duration-300"
              >
                Location
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="font-body text-label-caps text-on-surface-variant/50 tracking-[0.25em] mb-5 text-[10px] uppercase">
              Contact
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${contact.email}`}
                className="font-body text-headline-xs text-on-surface hover:text-primary transition-colors duration-300"
              >
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="font-body text-headline-xs text-on-surface hover:text-primary transition-colors duration-300"
              >
                {contact.phone}
              </a>
              <p className="font-body text-body-md text-on-surface-variant mt-1">
                {contact.address}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-outline-variant px-margin-desktop max-md:px-margin-mobile py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-body-sm text-on-surface-variant/60">
            &copy; 2024 KRiB Beverly Place. All rights reserved.
          </p>
          <div className="flex gap-6">
            {contact.social.facebook && (
              <a
                href={contact.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-body-sm text-on-surface-variant/60 hover:text-primary transition-colors duration-300"
              >
                Facebook
              </a>
            )}
            {contact.social.instagram && (
              <a
                href={contact.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-body-sm text-on-surface-variant/60 hover:text-primary transition-colors duration-300"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

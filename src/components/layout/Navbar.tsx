import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import { useNavScroll } from "../../hooks/useNavScroll";

const VILLA_ROUTES = ["/krib-1", "/krib-2"];

export function Navbar() {
  const scrolled = useNavScroll();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const isVillaPage = VILLA_ROUTES.includes(location.pathname);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isVillaPage) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "bg-white/90 py-4 shadow-[0_1px_10px_rgba(15,23,42,0.06)] backdrop-blur-xl"
          : "bg-transparent py-6 md:py-8",
      )}
    >
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-desktop max-md:px-margin-mobile">
        <Link
          to="/"
          className={cn(
            "font-body text-headline-md tracking-tighter transition-colors duration-500",
            scrolled ? "text-on-surface" : "text-white",
          )}
        >
          KRiB Beverly Place
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {isHomePage ? (
            <>
              <a
                href="#story"
                className={cn(
                  "font-body text-sm font-medium transition-all duration-300",
                  scrolled
                    ? "text-on-surface-variant hover:text-primary"
                    : "text-white/90 hover:text-white",
                )}
              >
                About
              </a>
              <a
                href="#villas"
                className={cn(
                  "font-body text-sm font-medium transition-all duration-300",
                  scrolled
                    ? "text-on-surface-variant hover:text-primary"
                    : "text-white/90 hover:text-white",
                )}
              >
                Villas
              </a>
              <a
                href="#gallery"
                className={cn(
                  "font-body text-sm font-medium transition-all duration-300",
                  scrolled
                    ? "text-on-surface-variant hover:text-primary"
                    : "text-white/90 hover:text-white",
                )}
              >
                Gallery
              </a>
              <a
                href="#connect"
                className={cn(
                  "font-body text-sm font-medium transition-all duration-300",
                  scrolled
                    ? "text-on-surface-variant hover:text-primary"
                    : "text-white/90 hover:text-white",
                )}
              >
                Contact
              </a>
            </>
          ) : null}
          <Link
            to="/my-reservation"
            className={cn(
              "font-body text-sm font-medium transition-all duration-300",
              scrolled
                ? "text-on-surface-variant hover:text-primary"
                : "text-white/90 hover:text-white",
            )}
          >
            My Reservation
          </Link>
        </div>

        <div className="hidden md:block">
          <a
            href={isHomePage ? "#villas" : "/"}
            className={cn(
              "inline-flex items-center rounded-full px-7 py-3 font-body text-sm font-semibold transition-all duration-300",
              scrolled
                ? "bg-primary text-on-primary shadow-[0_10px_24px_rgba(79,145,184,0.18)] hover:bg-primary-hover"
                : "bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.12)] hover:bg-primary hover:text-white",
            )}
          >
            {isHomePage ? "Explore Villas" : "Home"}
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "md:hidden min-w-11 min-h-11 flex items-center justify-center transition-colors duration-300",
            scrolled ? "text-on-surface" : "text-white",
          )}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-white border-t border-outline-variant overflow-hidden"
          >
            <div className="px-margin-mobile py-8 flex flex-col gap-6">
              {isHomePage ? (
                <>
                  <a
                    href="#villas"
                    onClick={() => setMobileOpen(false)}
                    className="font-body text-sm font-medium text-on-surface transition-colors hover:text-primary"
                  >
                    Villas
                  </a>
                  <a
                    href="#story"
                    onClick={() => setMobileOpen(false)}
                    className="font-body text-sm font-medium text-on-surface transition-colors hover:text-primary"
                  >
                    About
                  </a>
                  <a
                    href="#gallery"
                    onClick={() => setMobileOpen(false)}
                    className="font-body text-sm font-medium text-on-surface transition-colors hover:text-primary"
                  >
                    Gallery
                  </a>
                  <a
                    href="#connect"
                    onClick={() => setMobileOpen(false)}
                    className="font-body text-sm font-medium text-on-surface transition-colors hover:text-primary"
                  >
                    Contact
                  </a>
                </>
              ) : null}
              <Link
                to="/my-reservation"
                onClick={() => setMobileOpen(false)}
                className="font-body text-sm font-medium text-on-surface transition-colors hover:text-primary"
              >
                My Reservation
              </Link>
              <a
                href={isHomePage ? "#villas" : "/"}
                onClick={() => setMobileOpen(false)}
                className="mt-4 rounded-full bg-primary px-8 py-4 text-center font-body text-sm font-semibold text-on-primary shadow-button"
              >
                {isHomePage ? "Explore Villas" : "Home"}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

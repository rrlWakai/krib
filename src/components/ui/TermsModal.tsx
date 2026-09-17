import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { useSiteSettings } from "../../hooks/useSiteSettings";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  section?: "terms" | "privacy";
  triggerRef?: React.RefObject<HTMLElement | null>;
  reviewRequired?: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function TermsSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id}>
      <h3 className="font-display text-base text-on-surface mb-3 leading-snug">
        {title}
      </h3>
      <div className="font-body text-[13px] text-on-surface-variant leading-relaxed space-y-2.5">
        {children}
      </div>
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-on-surface">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="list-none space-y-1.5 mt-1.5">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item.replace(/^-\s*/, ""))}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3
          key={`h-${key++}`}
          className="font-display text-base text-on-surface mb-3 leading-snug"
        >
          {renderInline(line.slice(3))}
        </h3>,
      );
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else {
      flushList();
      blocks.push(<p key={`p-${key++}`}>{renderInline(line)}</p>);
    }
  }
  flushList();

  return <div className="space-y-2.5">{blocks}</div>;
}

function TermsFallbackContent() {
  return renderMarkdown(`## Terms and Instructions:

1. Rental fee is good for 20pax at KRiB 1 and 30 pax at KRiB 2.
For small parties of upto 50pax, additional 5k party fee is charged.

2. Check in time is 2pm until 11am the following day.

3. For direct bookings, PHP 5k must be deposited to reserve the preferred schedule of rental. Please deposit via BPI
account number 3339-0638-09 or GCASH number 0968 8700748 under KAREN GARCIA. This shall also serve as your SECURITY DEPOSIT, which will be refunded after your stay, on the following conditions:

**A) That there are no damages incurred in the property.** Stated are the common incidents but are not limited to such:
- improper handling of furnitures, appliances and household items causing physical or total damage
- soiled, stained or ripped linens
- leaving vomits or items that can clog sinks and water closets
- leaving left over stale food anywhere in the property
- smoking inside the house
- littering and disposing cigarette butts on the grounds (a cigarette disposal bin is available by the pool area)
- unattended/leaving behind pet poop, pee, fur sheddings & pet odors.

and anything analogous to misuse and abuse, are subject to the forfeiture of security deposit. We shall send pictures of the condition of the house for justification.

In case loss or damages is more than the security deposit amount, cost of repair or replacement shall be collected before check out.

**B) That the property, its content and the areas used is not left in a mess and disarray.** We encourage that every piece of furniture and/or appliances are put back where it originally was.

**C) That there are no excess heads beyond the declared number.**

**D) That children's parties, baptismal, small weddings, reunions or any form of gathering be declared and guests are kept to the maximum allowance (50).**
Bringing in of mobile lights & sound system are strictly prohibited.
Loud music is not allowed. The property owners reserves the right to evict guests who will not adhere to this clause.

**E) That the check-in and check-out time is STRICTLY observed.** PHP1,000 per hour will be charged for late check-out.

Pls allow us to thoroughly check the property to return the security deposit. We encourage a walk though with our staff for a better check-out procedure.

4. A rental agreement is available upon check in. If you want an advanced copy, we can send it to your email for your perusal. Pls sign and submit the original confirmed copy to the caretaker upon check-in.

5. Full payment must be made 3 weeks before the actual scheduled rental. Cancellations are only allowed 10 days before the rental date if reasons are emergency in nature. Payment shall be refunded in such case.

6. Pls settle via deposit at BPI account number 3339-0638-09 or GCASH 0968 8700748 under KAREN GARCIA.
Pls send thru viber or messenger accounts the copies of the deposit slip of the full payment VIBER: Karen Lopez-Garcia MESSENGER: Krib Beverly Place.

7. Pls send the complete list of the names of the guests together with the car plate numbers a week before the actual scheduled rental. Kindly send one (1) email address for reference so we can send you the filled and signed gate pass form. This must be printed in TWO (2) copies. One copy should be presented to the security and the other copy to the be given to the caretaker to be given access to the village and the property respectively. Failure to do so may be denied entry. We encourage that you finalize and complete your list for security reasons to prevent any untoward incidents.

Gate pass will only be sent after full settlement of rental fee.

9. Bath towels, bath essentials are not included in the rental. Pls bring your own as nothing shall be provided.

10. Refrigerator, microwave, rice cooker, electric kettle, toaster, stove BBQ Pit, basic cooking and dining utensils are provided.
Pls clean-up after use. 500 pesos cleaning fee shall be charged if these utensils are used and left unwashed.

11. Free three (3) 5-gallon Purified drinking water.

12. Smoking is prohibited. A designated area is provided outdoor.

13. Only the rooms opened are available for usage. The others are for the personal use of the property owners.

14. For KRiB 1, Only the outdoor kitchen is allowed for cooking. No cooking is allowed inside the house. (Pls do not leave left over food as these might attract rodents or pests from the outside)

15. DUE TO THE COVID SCARE, SLIPPERS AND SHOES ARE NOT ENCOURAGED BROUGHT INSIDE THE HOUSE to keep the house better sanitized. Feel free to bring your own house slippers.

16. Please do not let the pets swim in the pool as it is chlorinated.

17. Kindly allow our staff to enter the pool area to turn off outdoor light switches and to clean the pool the following morning of your stay. They will seek permission from you before they proceed.

18. Prepaid Wifi available.

Pls maintain the freshness and cleanliness of the house.. we value you as our guests and the next guests after you. We expect the same accordance from you. This may be just a rental, but we can assure you that this property can be your home away from home.

Thank you for choosing KRiB! ☺️`);
}

function PrivacyFallbackContent() {
  return (
    <TermsSection id="privacy-notice" title="Privacy Notice">
      <p>
        We collect personal information (name, email, phone number) solely for
        the purpose of processing and managing your reservation. This
        information is not shared with third parties and is stored securely.
      </p>
      <p>
        CCTV cameras are active in common areas of the property for security
        purposes. No cameras are present inside bedrooms or bathrooms.
      </p>
    </TermsSection>
  );
}

function ReviewStatusItem({
  reviewed,
  label,
}: {
  reviewed: boolean;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200",
          reviewed ? "bg-primary border-primary" : "border-outline",
        )}
      >
        {reviewed ? (
          <Check size={10} strokeWidth={3} className="text-white" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
        )}
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-body text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
            reviewed ? "text-primary" : "text-on-surface-variant/60",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "font-body text-[10px] transition-colors duration-200",
            reviewed ? "text-primary" : "text-on-surface-variant/40",
          )}
        >
          {reviewed ? "Reviewed" : "Review required"}
        </span>
      </span>
    </span>
  );
}

export function TermsModal({
  isOpen,
  onClose,
  onAgree,
  section = "terms",
  triggerRef,
  reviewRequired = false,
}: TermsModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const agreeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const suppressScrollRef = useRef(false);
  const { settings } = useSiteSettings();
  const termsMd = settings?.legal?.terms_conditions;
  const privacyMd = settings?.legal?.privacy_policy;

  const [activeSection, setActiveSection] = useState<"terms" | "privacy">(
    section,
  );
  const [termsReviewed, setTermsReviewed] = useState(false);
  const [privacyReviewed, setPrivacyReviewed] = useState(false);

  const allReviewed = termsReviewed && privacyReviewed;
  const canAgree = !reviewRequired || allReviewed;

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const scrollY = window.scrollY;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      setTimeout(() => closeButtonRef.current?.focus(), 50);

      return () => {
        document.documentElement.style.overflow = "";
        document.documentElement.style.paddingRight = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveSection(section ?? "terms");
    setTermsReviewed(false);
    setPrivacyReviewed(false);
  }, [isOpen, section]);

  useEffect(() => {
    if (!isOpen || !reviewRequired) return;
    suppressScrollRef.current = true;
    scrollContainerRef.current?.scrollTo({ top: 0 });
    const t = setTimeout(() => {
      suppressScrollRef.current = false;
    }, 100);
    return () => clearTimeout(t);
  }, [isOpen, activeSection, reviewRequired]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      triggerRef?.current?.focus();
    } else if (section === "privacy" && !reviewRequired) {
      setTimeout(() => {
        scrollContainerRef.current
          ?.querySelector("#privacy-notice")
          ?.scrollIntoView({ block: "start" });
      }, 100);
    }
  }, [isOpen, section, triggerRef, reviewRequired]);

  useEffect(() => {
    if (reviewRequired && isOpen && allReviewed) {
      agreeButtonRef.current?.focus();
    }
  }, [reviewRequired, isOpen, allReviewed]);

  const markActiveReviewed = useCallback(() => {
    if (activeSection === "terms") setTermsReviewed(true);
    else setPrivacyReviewed(true);
  }, [activeSection]);

  const handleDocScroll = useCallback(() => {
    if (!reviewRequired || suppressScrollRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 16) {
      markActiveReviewed();
    }
  }, [reviewRequired, markActiveReviewed]);

  const handleDocKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!reviewRequired) return;
    if (
      e.key === " " ||
      e.key === "End" ||
      e.key === "PageDown" ||
      e.key === "ArrowDown"
    ) {
      requestAnimationFrame(handleDocScroll);
    }
  };

  const handleAgree = useCallback(() => {
    if (!canAgree) return;
    onAgree();
    onClose();
  }, [canAgree, onAgree, onClose]);

  const tabClass = (active: boolean) =>
    cn(
      "shrink-0 pb-3 -mb-px border-b-2 font-body text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 cursor-pointer",
      active
        ? "border-primary text-primary"
        : "border-transparent text-on-surface-variant/60 hover:text-on-surface",
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={
            reviewRequired
              ? "Terms & Privacy review"
              : section === "privacy"
                ? "Privacy Notice"
                : "Terms & Conditions"
          }
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

          <motion.div
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative bg-white w-full max-w-lg flex flex-col overflow-hidden",
              "max-h-[calc(100dvh-2rem)]",
              "shadow-[0_24px_80px_rgba(0,0,0,0.18)]",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
              <h2 className="font-display text-lg text-on-surface">
                {reviewRequired
                  ? "Terms & Privacy"
                  : activeSection === "privacy"
                    ? "Privacy Notice"
                    : "Terms & Conditions"}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high rounded-full transition-all duration-200 cursor-pointer"
                aria-label={
                  reviewRequired
                    ? "Cancel review"
                    : activeSection === "privacy"
                      ? "Close privacy notice"
                      : "Close terms and conditions"
                }
              >
                <X size={16} />
              </button>
            </div>

            {/* Section switcher (review mode) */}
            {reviewRequired && (
              <div className="shrink-0 flex gap-6 px-6 border-b border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setActiveSection("terms")}
                  aria-pressed={activeSection === "terms"}
                  className={tabClass(activeSection === "terms")}
                >
                  Terms &amp; Conditions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("privacy")}
                  aria-pressed={activeSection === "privacy"}
                  className={tabClass(activeSection === "privacy")}
                >
                  Privacy Policy
                </button>
              </div>
            )}

            {/* Scrollable Content */}
            <div
              ref={scrollContainerRef}
              data-lenis-prevent
              tabIndex={reviewRequired ? 0 : undefined}
              onScroll={reviewRequired ? handleDocScroll : undefined}
              onWheel={reviewRequired ? handleDocScroll : undefined}
              onTouchMove={reviewRequired ? handleDocScroll : undefined}
              onKeyDown={reviewRequired ? handleDocKeyDown : undefined}
              aria-label={
                reviewRequired
                  ? activeSection === "terms"
                    ? "Terms & Conditions document. Scroll to the end to complete review."
                    : "Privacy Policy document. Scroll to the end to complete review."
                  : undefined
              }
              className="flex-1 overflow-y-auto overscroll-contain px-6 py-6"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="space-y-7">
                {activeSection === "privacy" && privacyMd ? (
                  <div id="privacy-notice">{renderMarkdown(privacyMd)}</div>
                ) : activeSection === "terms" && termsMd ? (
                  renderMarkdown(termsMd)
                ) : activeSection === "privacy" ? (
                  <PrivacyFallbackContent />
                ) : (
                  <TermsFallbackContent />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-5 border-t border-outline-variant/30">
              {reviewRequired ? (
                <>
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5 mb-4"
                  >
                    <ReviewStatusItem
                      reviewed={termsReviewed}
                      label="Terms & Conditions"
                    />
                    <ReviewStatusItem
                      reviewed={privacyReviewed}
                      label="Privacy Policy"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onClose}
                      className={cn(
                        "px-6 py-3 rounded-full",
                        "border border-outline-variant/60",
                        "font-body text-[11px] font-semibold uppercase tracking-[0.1em]",
                        "text-on-surface-variant",
                        "hover:bg-surface-container-low",
                        "transition-all duration-200 cursor-pointer",
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      ref={agreeButtonRef}
                      onClick={handleAgree}
                      disabled={!canAgree}
                      className={cn(
                        "flex-1 px-6 py-3 rounded-full",
                        "bg-primary text-on-primary",
                        "font-body text-[11px] font-semibold uppercase tracking-[0.1em]",
                        "shadow-[0_2px_8px_rgba(0,71,171,0.25)]",
                        "hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)]",
                        "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-primary",
                        "transition-all duration-300",
                      )}
                    >
                      I Agree &amp; Continue
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className={cn(
                      "px-6 py-3 rounded-full",
                      "border border-outline-variant/60",
                      "font-body text-[11px] font-semibold uppercase tracking-[0.1em]",
                      "text-on-surface-variant",
                      "hover:bg-surface-container-low",
                      "transition-all duration-200 cursor-pointer",
                    )}
                  >
                    Close
                  </button>
                  <button
                    ref={agreeButtonRef}
                    onClick={handleAgree}
                    className={cn(
                      "flex-1 px-6 py-3 rounded-full",
                      "bg-primary text-on-primary",
                      "font-body text-[11px] font-semibold uppercase tracking-[0.1em]",
                      "shadow-[0_2px_8px_rgba(0,71,171,0.25)]",
                      "hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)]",
                      "transition-all duration-300 cursor-pointer",
                    )}
                  >
                    I Understand &amp; Agree
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

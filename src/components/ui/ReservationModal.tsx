import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CalendarDays,
  Clock,
  Check,
  Send,
  Phone,
  Mail,
  MessageCircle,
  FileText,
} from "lucide-react";
import { GuestSelector } from "./GuestSelector";
import type { GuestCount } from "./GuestSelector";
import type { VillaPolicy } from "../../types";

interface PropertyInfo {
  id: string;
  name: string;
  priceDetails: { perNight: string; rateType: string };
  maxGuests: number;
  hasPartyFee: boolean;
  partyFeeLabel?: string;
  policies: VillaPolicy[];
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyInfo;
}

type ContactMethod = "messenger" | "call" | "email";
type Step = "form" | "submitting" | "success";

const today = new Date().toISOString().split("T")[0];

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const modalPanelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 12,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ReservationModal({
  isOpen,
  onClose,
  property,
}: ReservationModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [checkIn, setCheckIn] = useState("");
  const [guests, setGuests] = useState<GuestCount>({
    adults: 2,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] =
    useState<ContactMethod>("messenger");
  const [facebookName, setFacebookName] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const facebookNameRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setStep("form");
      setCheckIn("");
      setGuests({ adults: 2, children: 0, infants: 0, pets: 0 });
      setFullName("");
      setPhone("");
      setEmail("");
      setContactMethod("messenger");
      setFacebookName("");
      setFacebookLink("");
      setSpecialRequests("");
      setAgreed(false);
      setErrors({});
      setTimeout(() => initialFocusRef.current?.focus(), 100);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflowY = "scroll";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "submitting") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, onClose, step]);

  useEffect(() => {
    if (contactMethod === "messenger") {
      setTimeout(() => facebookNameRef.current?.focus(), 150);
    }
  }, [contactMethod]);

  const checkOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 22 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    : "";

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!checkIn) errs.checkIn = "Please select a check-in date";
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Please enter a valid email address";
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[\d\s+\-()]{7,20}$/.test(phone))
      errs.phone = "Please enter a valid phone number";
    if (contactMethod === "messenger" && !facebookName.trim())
      errs.facebookName = "Facebook name is required";
    if (!agreed) errs.agreed = "You must agree to the house rules";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setStep("submitting");
    setTimeout(() => setStep("success"), 1800);
  }

  const contactMethods: {
    value: ContactMethod;
    label: string;
    icon: typeof MessageCircle;
  }[] = [
    { value: "messenger", label: "Facebook Messenger", icon: MessageCircle },
    { value: "call", label: "Phone Call", icon: Phone },
    { value: "email", label: "Email", icon: Mail },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            variants={modalPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-[24px] overflow-hidden shadow-modal"
          >
            <div
              ref={panelRef}
              className="relative w-full max-w-2xl max-h-[85vh] bg-white flex flex-col"
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors duration-200 cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} className="text-on-surface-variant" />
              </button>

              {step === "form" && (
                <>
                  {/* Fixed Header */}
                  <div className="shrink-0 px-8 md:px-10 pt-12 pb-4">
                    <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile text-on-surface mb-2 pr-10">
                      Reserve {property.name}
                    </h2>
                    <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
                      Fill in your details and we will review your reservation
                      request. You will not be charged yet.
                    </p>
                  </div>

                  {/* Scrollable Body */}
                  <div
                    className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-8 md:px-10 pb-4"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {/* Trip Details */}
                    <SectionDivider icon={CalendarDays} label="Trip Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-surface-container-low rounded-default">
                        <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                          Villa
                        </label>
                        <p className="font-body text-body-md font-medium text-on-surface">
                          {property.name}
                        </p>
                      </div>
                      <div className="p-4 bg-surface-container-low rounded-default">
                        <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                          Check-in Date
                        </label>
                        <input
                          ref={initialFocusRef}
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={today}
                          className="w-full bg-transparent text-on-surface font-body text-body-md focus:outline-none cursor-pointer color-scheme:light"
                        />
                        {errors.checkIn && (
                          <p className="font-body text-[12px] text-error mt-1">
                            {errors.checkIn}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-surface-container-low rounded-default">
                        <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                          Checkout
                        </label>
                        <p className="font-body text-body-md text-on-surface font-medium">
                          {checkOut || (
                            <span className="text-on-surface-variant/50">
                              Auto-calculated
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-surface-container-low rounded-default">
                        <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                          Stay Duration
                        </label>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-primary" />
                          <span className="font-body text-body-md text-primary font-medium">
                            22-Hour Stay
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Guest Selector */}
                    <div className="mb-8">
                      <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-3">
                        Guests
                      </label>
                      <div className="border border-outline-variant rounded-default p-3">
                        <GuestSelector
                          maxGuests={property.maxGuests}
                          villaName={property.name}
                          value={guests}
                          onChange={setGuests}
                        />
                      </div>
                      {guests.pets > 2 && (
                        <p className="font-body text-[13px] text-[#4F91B8] mt-2 leading-relaxed">
                          For more than 2 pets, our staff will be notified so we
                          can prepare accordingly.
                        </p>
                      )}
                    </div>

                    {/* Price Summary */}
                    <SectionDivider icon={FileText} label="Price Summary" />
                    <div className="space-y-3 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="font-body text-body-md text-on-surface-variant">
                          Villa Rate
                        </span>
                        <span className="font-body text-body-md font-medium text-on-surface">
                          {property.priceDetails.perNight}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-body text-body-md text-on-surface-variant">
                          Party Fee
                        </span>
                        <span className="font-body text-body-md font-medium text-on-surface">
                          {property.hasPartyFee
                            ? (property.partyFeeLabel ?? "₱5,000")
                            : "—"}
                        </span>
                      </div>
                      <div className="border-t border-outline-variant/50 pt-3 flex justify-between items-center">
                        <span className="font-body text-body-md font-semibold text-on-surface">
                          Total
                        </span>
                        <span className="font-display text-headline-md font-medium text-primary">
                          {property.priceDetails.perNight}
                        </span>
                      </div>
                    </div>

                    {/* Guest Information */}
                    <SectionDivider icon={Mail} label="Guest Information" />
                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                          Full Name <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-default font-body text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors duration-200"
                        />
                        {errors.fullName && (
                          <p className="font-body text-[12px] text-error mt-1">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                            Phone Number <span className="text-error">*</span>
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+63 9XX XXX XXXX"
                            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-default font-body text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors duration-200"
                          />
                          {errors.phone && (
                            <p className="font-body text-[12px] text-error mt-1">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                            Email Address <span className="text-error">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-default font-body text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors duration-200"
                          />
                          {errors.email && (
                            <p className="font-body text-[12px] text-error mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Preferred Contact Method */}
                      <div>
                        <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-3">
                          Preferred Contact Method{" "}
                          <span className="text-error">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {contactMethods.map((m) => {
                            const Icon = m.icon;
                            const selected = contactMethod === m.value;
                            return (
                              <button
                                key={m.value}
                                type="button"
                                onClick={() => {
                                  setContactMethod(m.value);
                                  if (m.value !== "messenger") {
                                    setFacebookName("");
                                    setFacebookLink("");
                                  }
                                }}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-default border transition-all duration-200 cursor-pointer ${
                                  selected
                                    ? "border-[#4F91B8] bg-[#4F91B8]/5 text-[#4F91B8]"
                                    : "border-outline-variant text-on-surface-variant hover:border-outline"
                                }`}
                              >
                                <Icon size={16} />
                                <span className="font-body text-body-md text-sm">
                                  {m.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conditional Facebook fields */}
                      <AnimatePresence>
                        {contactMethod === "messenger" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden"
                          >
                            <div>
                              <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                                Facebook Name{" "}
                                <span className="text-error">*</span>
                              </label>
                              <input
                                ref={facebookNameRef}
                                type="text"
                                value={facebookName}
                                onChange={(e) =>
                                  setFacebookName(e.target.value)
                                }
                                placeholder="Your Facebook profile name"
                                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-default font-body text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors duration-200"
                              />
                              {errors.facebookName && (
                                <p className="font-body text-[12px] text-error mt-1">
                                  {errors.facebookName}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                                Facebook Profile Link
                              </label>
                              <input
                                type="url"
                                value={facebookLink}
                                onChange={(e) =>
                                  setFacebookLink(e.target.value)
                                }
                                placeholder="https://facebook.com/your.profile"
                                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-default font-body text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors duration-200"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Special Requests */}
                      <div>
                        <label className="font-body text-label-caps text-on-surface-variant/60 uppercase tracking-widest text-[11px] block mb-1.5">
                          Special Requests
                        </label>
                        <textarea
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Any special requests or requirements for your stay..."
                          rows={3}
                          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-default font-body text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors duration-200 resize-none"
                        />
                      </div>
                    </div>

                    {/* House Rules Agreement */}
                    <div className="p-5 bg-surface-container-low rounded-default border border-outline-variant/40">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => setAgreed(!agreed)}
                          className={`shrink-0 mt-0.5 w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            agreed
                              ? "bg-primary border-primary text-white"
                              : "border-outline hover:border-primary"
                          }`}
                          aria-checked={agreed}
                          role="checkbox"
                        >
                          {agreed && <Check size={12} strokeWidth={3} />}
                        </button>
                        <div>
                          <p className="font-body text-body-md text-on-surface text-sm">
                            I have read and agree to the{" "}
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById("policies");
                                if (el)
                                  el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="text-primary underline hover:text-primary-hover transition-colors cursor-pointer"
                            >
                              House Rules
                            </button>
                            .
                          </p>
                          {errors.agreed && (
                            <p className="font-body text-[12px] text-error mt-1">
                              {errors.agreed}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Footer - shown during form and submitting states */}
              {(step === "form" || step === "submitting") && (
                <div className="shrink-0 px-8 md:px-10 pt-4 pb-8 md:pb-10 border-t border-outline-variant/30">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 md:flex-none px-8 py-4 font-body text-label-caps text-on-surface-variant uppercase tracking-widest border border-outline-variant rounded-default hover:bg-surface-container-low transition-all duration-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={step === "submitting"}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-on-primary font-body text-label-caps uppercase tracking-widest rounded-default shadow-button hover:bg-primary-hover hover:shadow-elevated transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {step === "submitting" ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Submit Reservation Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Submitting State */}
              {step === "submitting" && (
                <div className="flex-1 flex items-center justify-center p-12">
                  <div className="text-center">
                    <svg
                      className="animate-spin h-8 w-8 mx-auto mb-4 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <p className="font-body text-body-md text-on-surface-variant">
                      Submitting your reservation request...
                    </p>
                  </div>
                </div>
              )}

              {/* Success State */}
              {step === "success" && (
                <div className="flex-1 overflow-y-auto">
                  <SuccessState
                    onClose={onClose}
                    propertyName={property.name}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionDivider({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarDays;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <Icon size={16} className="text-primary/60" />
      <span className="font-body text-label-caps text-primary uppercase tracking-[0.2em] text-sm font-medium">
        {label}
      </span>
      <span className="flex-1 h-px bg-linear-to-r from-primary/15 to-transparent" />
    </div>
  );
}

function SuccessState({
  onClose,
  propertyName,
}: {
  onClose: () => void;
  propertyName: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="p-8 md:p-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center mx-auto mb-6"
      >
        <Check size={28} className="text-tertiary" strokeWidth={2.5} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="font-display text-headline-xl max-md:text-headline-xl-mobile text-on-surface mb-3"
      >
        Reservation Request Received
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="font-body text-body-md text-on-surface-variant max-w-lg mx-auto leading-relaxed mb-8"
      >
        Thank you for choosing KRiB Beverly Place. We have received your
        reservation request for{" "}
        <strong className="text-on-surface">{propertyName}</strong>. Our team
        will review your selected date and contact you through your preferred
        contact method once your reservation has been reviewed.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-amber-50 border border-amber-200/60 mb-10"
      >
        <Clock size={14} className="text-amber-600" />
        <span className="font-body text-body-md text-sm font-medium text-amber-800">
          Awaiting Confirmation
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-4 font-body text-label-caps text-on-surface-variant uppercase tracking-widest border border-outline-variant rounded-default hover:bg-surface-container-low transition-all duration-300 cursor-pointer"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

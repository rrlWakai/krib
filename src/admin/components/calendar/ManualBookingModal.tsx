import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { createManualReservation } from "../../services/mutations";
import type { Reservation, Villa } from "../../types";
import { formatManilaDateKey } from "../../services/calendarTime";

interface ManualBookingModalProps {
  open: boolean;
  arrivalDate: string;
  villas: Villa[];
  defaultVillaId?: string;
  onClose: () => void;
  onCreated: (reservation: Reservation) => void;
}

export default function ManualBookingModal({
  open,
  arrivalDate,
  villas,
  defaultVillaId,
  onClose,
  onCreated,
}: ManualBookingModalProps) {
  const [villaId, setVillaId] = useState(
    defaultVillaId ?? villas[0]?.slug ?? "",
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [infants, setInfants] = useState("0");
  const [pets, setPets] = useState("0");
  const [isParty, setIsParty] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setVillaId(defaultVillaId ?? villas[0]?.slug ?? "");
    setFullName("");
    setEmail("");
    setPhone("");
    setAdults("1");
    setChildren("0");
    setInfants("0");
    setPets("0");
    setIsParty(false);
    setSpecialRequests("");
    setError(null);
    setSaving(false);
  }, [open, defaultVillaId, villas]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, saving, onClose]);

  const dateLabel = useMemo(
    () =>
      formatManilaDateKey(arrivalDate, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [arrivalDate],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const result = await createManualReservation({
      villa_id: villaId,
      arrival_date: arrivalDate,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      adults: Number(adults),
      children: Number(children),
      infants: Number(infants),
      pets: Number(pets),
      is_party: isParty,
      special_requests: specialRequests.trim(),
    });

    setSaving(false);
    if (result.error || !result.data) {
      setError(
        result.error?.message ??
          "Unable to create this booking. Please try again.",
      );
      return;
    }
    onCreated(result.data);
  }

  if (!open) return null;

  const inputClass =
    "h-10 w-full rounded-md border border-[#ECECEC] bg-white px-3 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]";
  const labelClass =
    "mb-1 block font-body text-[11px] font-medium uppercase tracking-[0.06em] text-[#757575]";

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/30"
        onClick={saving ? undefined : onClose}
      />
      <div className="fixed inset-0 z-[61] flex items-center justify-center overflow-y-auto p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-booking-title"
          className="my-8 w-full max-w-[520px] rounded-xl border border-[#ECECEC] bg-white shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#ECECEC] px-6 py-4">
            <div>
              <h2
                id="manual-booking-title"
                className="font-display text-[18px] font-medium text-[#0A1F44]"
              >
                Add Manual Booking
              </h2>
              <p className="mt-1 font-body text-[12px] text-[#757575]">
                {dateLabel} · 2:00 PM (Fixed)
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7] disabled:opacity-50"
              aria-label="Close manual booking"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-[13px] text-red-600"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="manual-booking-villa" className={labelClass}>
                Villa
              </label>
              <select
                id="manual-booking-villa"
                value={villaId}
                onChange={(event) => setVillaId(event.target.value)}
                className={inputClass}
                required
              >
                {villas.map((villa) => (
                  <option key={villa.id} value={villa.slug}>
                    {villa.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="manual-booking-name" className={labelClass}>
                  Guest name
                </label>
                <input
                  id="manual-booking-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="manual-booking-phone" className={labelClass}>
                  Contact number
                </label>
                <input
                  id="manual-booking-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="manual-booking-email" className={labelClass}>
                Guest email
              </label>
              <input
                id="manual-booking-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="manual-booking-adults" className={labelClass}>
                  Adults
                </label>
                <input
                  id="manual-booking-adults"
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(event) => setAdults(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="manual-booking-children" className={labelClass}>
                  Children
                </label>
                <input
                  id="manual-booking-children"
                  type="number"
                  min="0"
                  value={children}
                  onChange={(event) => setChildren(event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="manual-booking-infants" className={labelClass}>
                  Infants
                </label>
                <input
                  id="manual-booking-infants"
                  type="number"
                  min="0"
                  value={infants}
                  onChange={(event) => setInfants(event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="manual-booking-pets" className={labelClass}>
                  Pets
                </label>
                <input
                  id="manual-booking-pets"
                  type="number"
                  min="0"
                  value={pets}
                  onChange={(event) => setPets(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#ECECEC] px-3 py-3">
              <span>
                <span className="block font-body text-[13px] font-medium text-[#0A1F44]">
                  Party booking
                </span>
                <span className="block font-body text-[11px] text-[#757575]">
                  ₱5,000 party fee replaces additional guest fees.
                </span>
              </span>
              <input
                type="checkbox"
                checked={isParty}
                onChange={(event) => setIsParty(event.target.checked)}
                className="h-4 w-4 accent-[#0A1F44]"
              />
            </label>

            <div>
              <label htmlFor="manual-booking-notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="manual-booking-notes"
                value={specialRequests}
                onChange={(event) => setSpecialRequests(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-md border border-[#ECECEC] px-3 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-[#ECECEC] pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-[#ECECEC] px-4 py-2.5 font-body text-[13px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !villaId}
                className="rounded-lg bg-[#0A1F44] px-5 py-2.5 font-body text-[13px] font-medium text-white transition-colors hover:bg-[#142d5b] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

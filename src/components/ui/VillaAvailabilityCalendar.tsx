import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { fetchUpcomingAvailability, type AvailabilityReservation } from "../../services/api/availability";
import { getUnavailableDates } from "../../lib/availability";
import { hasFixedCheckin, toLocalDateString } from "../../lib/bookingTime";

interface VillaAvailabilityCalendarProps {
  villaId: string;
  onReserveDate: (date: string) => void;
  refreshKey?: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatLongDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function VillaAvailabilityCalendar({
  villaId,
  onReserveDate,
  refreshKey = 0,
}: VillaAvailabilityCalendarProps) {
  const todayStr = toLocalDateString(new Date());
  const [todayY, todayM] = todayStr.split("-").map(Number);
  const todayMonthIndex = todayM - 1;

  const [view, setView] = useState(() => ({ year: todayY, month: todayMonthIndex }));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reservations, setReservations] = useState<AvailabilityReservation[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [retryEpoch, setRetryEpoch] = useState(0);
  const inFlightRef = useRef<{
    key: string;
    promise: Promise<AvailabilityReservation[]>;
  } | null>(null);

  const hasFixedCheckinVilla = hasFixedCheckin(villaId);

  useEffect(() => {
    const key = `${villaId}:${refreshKey}:${retryEpoch}`;
    let cancelled = false;

    if (inFlightRef.current?.key === key) {
      inFlightRef.current.promise
        .then((data) => {
          if (cancelled) return;
          setReservations(data);
          setState("ready");
        })
        .catch(() => {
          if (cancelled) return;
          setReservations([]);
          setState("error");
        });
      return () => {
        cancelled = true;
      };
    }

    const promise = fetchUpcomingAvailability(villaId);
    inFlightRef.current = { key, promise };
    setState("loading");
    promise
      .then((data) => {
        if (cancelled) return;
        setReservations(data);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setReservations([]);
        setState("error");
      })
      .finally(() => {
        if (inFlightRef.current?.key === key) {
          inFlightRef.current = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [villaId, refreshKey, retryEpoch]);

  const unavailableDates = useMemo(
    () => getUnavailableDates(reservations, villaId),
    [reservations, villaId],
  );

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = getDaysInMonth(view.year, view.month);
  const viewLabel = new Date(view.year, view.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const canGoPrev =
    view.year > todayY || (view.year === todayY && view.month > todayMonthIndex);
  const canGoNext =
    view.year < todayY + 2 || (view.year === todayY + 2 && view.month < todayMonthIndex);

  const goPrev = () =>
    setView((v) => ({
      year: v.month === 0 ? v.year - 1 : v.year,
      month: v.month === 0 ? 11 : v.month - 1,
    }));
  const goNext = () =>
    setView((v) => ({
      year: v.month === 11 ? v.year + 1 : v.year,
      month: v.month === 11 ? 0 : v.month + 1,
    }));

  const retry = () => {
    setRetryEpoch((e) => e + 1);
  };

  return (
    <div className="bg-white border border-outline-variant rounded-default shadow-card overflow-hidden">
      <div className="p-6 md:p-8">
        {state === "loading" && (
          <div aria-busy="true" aria-label="Checking availability">
            <div className="flex items-center justify-between mb-5">
              <div className="h-7 w-40 bg-surface-container-high rounded-md animate-pulse" />
              <div className="flex items-center gap-1.5">
                <div className="h-9 w-9 rounded-full bg-surface-container-high animate-pulse" />
                <div className="h-9 w-9 rounded-full bg-surface-container-high animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-3">
              {WEEKDAYS.map((w, i) => (
                <div key={w} className={cn("h-3 rounded", i % 2 === 0 ? "bg-surface-container-high animate-pulse" : "bg-surface-container-low animate-pulse")} />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg bg-surface-container-low animate-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="py-10 text-center">
            <p className="font-body text-body-md text-on-surface mb-3">
              Availability is temporarily unavailable. Please try again.
            </p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center rounded-full border border-outline-variant px-5 py-2.5 font-body text-label-caps uppercase tracking-widest text-on-surface hover:bg-surface-container-low hover:border-primary/40 transition-all duration-200 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {state === "ready" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-headline-sm text-on-surface">
                {viewLabel}
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={!canGoPrev}
                  aria-label="Previous month"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant transition-colors",
                    canGoPrev
                      ? "text-on-surface-variant hover:bg-surface-container-low hover:border-primary/40 cursor-pointer"
                      : "text-on-surface-variant/25",
                  )}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext}
                  aria-label="Next month"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant transition-colors",
                    canGoNext
                      ? "text-on-surface-variant hover:bg-surface-container-low hover:border-primary/40 cursor-pointer"
                      : "text-on-surface-variant/25",
                  )}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="flex items-center justify-center font-body text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/50 py-1.5"
                >
                  {w}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isPast = dateStr < todayStr;
                const unavailable = unavailableDates.has(dateStr);
                const disabled = isPast || unavailable;
                const selected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(selected ? null : dateStr)}
                    aria-pressed={selected}
                    aria-disabled={disabled}
                    aria-label={`${formatLongDate(dateStr)}${unavailable ? ", unavailable" : ", available"}`}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-lg font-body text-sm transition-all duration-150",
                      disabled
                        ? unavailable
                          ? "text-on-surface-variant/45 line-through decoration-1 cursor-default"
                          : "text-on-surface-variant/25 cursor-default"
                        : selected
                          ? "bg-primary text-on-primary font-semibold shadow-sm"
                          : isToday
                            ? "text-primary border border-primary/40 font-medium hover:bg-primary/5 cursor-pointer"
                            : "text-on-surface hover:bg-primary/5 hover:text-primary cursor-pointer",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-body text-xs text-on-surface-variant">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/50" />
                <span className="font-body text-xs text-on-surface-variant">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-outline/40" />
                <span className="font-body text-xs text-on-surface-variant">Unavailable</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-outline-variant px-6 py-5 md:px-8">
        {selectedDate && state === "ready" ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-body text-body-md text-on-surface font-medium">
                {formatLongDate(selectedDate)}
              </p>
              <p className="font-body text-sm text-on-surface-variant mt-0.5">
                {hasFixedCheckinVilla
                  ? "Check-in fixed at 2:00 PM · 21-hour stay"
                  : "You will choose an arrival time in the booking steps."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onReserveDate(selectedDate)}
              className="shrink-0 bg-primary text-on-primary px-6 py-3.5 rounded-full font-body text-label-caps uppercase tracking-widest shadow-button hover:bg-primary-hover hover:shadow-elevated transition-all duration-300 cursor-pointer"
            >
              Reserve this date
            </button>
          </div>
        ) : (
          <p className="font-body text-sm text-on-surface-variant">
            Select an available date to continue with your reservation.
          </p>
        )}
      </div>
    </div>
  );
}
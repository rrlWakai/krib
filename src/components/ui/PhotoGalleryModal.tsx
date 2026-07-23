import { useEffect, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

interface PhotoGalleryModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onIndexChange?: (index: number) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE } },
};

const imageVariants = {
  enter: { opacity: 0, scale: 0.96 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: EASE } },
};

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 0.3;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function PhotoGalleryModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}: PhotoGalleryModalProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // ── Index change + preloading ──────────────────────────────────────
  const changeIndex = useCallback(
    (next: number) => {
      if (next === currentIndex || images.length === 0) return;
      setIsLoading(true);
      setDragOffset(0);
      onIndexChange?.(next);

      const preload = [next - 1, next + 1, next - 2, next + 2];
      preload.forEach((i) => {
        const idx = (i + images.length) % images.length;
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "image";
        link.href = images[idx];
        document.head.appendChild(link);
      });
    },
    [currentIndex, images, onIndexChange],
  );

  const goNext = useCallback(() => {
    changeIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, changeIndex]);

  const goPrev = useCallback(() => {
    changeIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, changeIndex]);

  // ── Keyboard ───────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      const container = overlayRef.current;
      if (!container) return;

      if (e.key === "Tab") {
        e.preventDefault();
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          const idx = focusable.indexOf(document.activeElement as HTMLElement);
          (idx <= 0 ? last : focusable[idx - 1]).focus();
        } else {
          const idx = focusable.indexOf(document.activeElement as HTMLElement);
          (idx >= focusable.length - 1 ? first : focusable[idx + 1]).focus();
        }
        return;
      }

      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    },
    [onClose, goPrev, goNext],
  );

  // ── Open / close lifecycle ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const { overflow, paddingRight } = document.body.style;
    const scrollbarW =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    document.documentElement.style.overscrollBehavior = "none";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      document.documentElement.style.overscrollBehavior = "";
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  // ── Focus first interactive element on open ────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      const btn = overlayRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      btn?.focus();
    });
  }, [isOpen]);

  // ── Touch / swipe ──────────────────────────────────────────────────
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (images.length <= 1) return;
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      setDragOffset(0);
      setIsDragging(true);
    },
    [images.length],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    if (Math.abs(dy) > Math.abs(dx)) return;
    e.preventDefault();
    setDragOffset(dx);
  }, []);

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
    const dx = dragOffset;
    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(dx) / elapsed;

    if (Math.abs(dx) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
      if (dx < 0) goNext();
      else goPrev();
    }
    setDragOffset(0);
  }, [dragOffset, goNext, goPrev]);

  // ── Mouse drag (desktop) ───────────────────────────────────────────
  const mouseDownRef = useRef(false);
  const mouseStartX = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (images.length <= 1) return;
      if ((e.target as HTMLElement).closest("button")) return;
      mouseDownRef.current = true;
      mouseStartX.current = e.clientX;
      setIsDragging(true);
    },
    [images.length],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!mouseDownRef.current) return;
      setDragOffset(e.clientX - mouseStartX.current);
    },
    [],
  );

  const onMouseUp = useCallback(() => {
    if (!mouseDownRef.current) return;
    mouseDownRef.current = false;
    setIsDragging(false);
    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
      if (dragOffset < 0) goNext();
      else goPrev();
    }
    setDragOffset(0);
  }, [dragOffset, goNext, goPrev]);

  // ── Render ─────────────────────────────────────────────────────────
  if (images.length === 0) return null;

  const hasMultiple = images.length > 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          key="lightbox-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo gallery — image ${currentIndex + 1} of ${images.length}`}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none"
          onClick={onClose}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* ── Close ──────────────────────────────────────────────── */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "absolute z-20 flex items-center justify-center rounded-full",
              "text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer",
              /* mobile: respect safe area */
              "top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]",
              /* desktop: standard position */
              "md:top-6 md:right-6",
              "w-10 h-10 md:w-11 md:h-11",
            )}
            aria-label="Close gallery"
          >
            <X size={22} className="md:w-6 md:h-6" />
          </button>

          {/* ── Previous ───────────────────────────────────────────── */}
          {hasMultiple && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className={cn(
                "absolute z-20 flex items-center justify-center rounded-full",
                "text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer",
                "left-2 md:left-5",
                "top-1/2 -translate-y-1/2",
                "w-10 h-10 md:w-12 md:h-12",
                "max-sm:hidden",
              )}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="md:w-7 md:h-7" />
            </button>
          )}

          {/* ── Next ───────────────────────────────────────────────── */}
          {hasMultiple && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className={cn(
                "absolute z-20 flex items-center justify-center rounded-full",
                "text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer",
                "right-2 md:right-5",
                "top-1/2 -translate-y-1/2",
                "w-10 h-10 md:w-12 md:h-12",
                "max-sm:hidden",
              )}
              aria-label="Next image"
            >
              <ChevronRight size={24} className="md:w-7 md:h-7" />
            </button>
          )}

          {/* ── Image ──────────────────────────────────────────────── */}
          <div
            ref={imageContainerRef}
            className={cn(
              "relative z-10 flex items-center justify-center",
              "w-full h-full",
              "px-14 py-16",
              "md:px-20 md:py-20",
              /* mobile: tighter padding, safe areas */
              "max-sm:px-[max(3.5rem,env(safe-area-inset-left))]",
              "max-sm:pr-[max(3.5rem,env(safe-area-inset-right))]",
              "max-sm:pt-[max(4rem,env(safe-area-inset-top))]",
              "max-sm:pb-[max(4rem,env(safe-area-inset-bottom))]",
              isDragging && "cursor-grabbing",
            )}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: "none" }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentIndex}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex items-center justify-center"
                style={{
                  transform: `translateX(${dragOffset * 0.4}px)`,
                  transition: isDragging ? "none" : undefined,
                }}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={images[currentIndex]}
                  alt={`Photo ${currentIndex + 1} of ${images.length}`}
                  className={cn(
                    "block max-w-[90vw] max-h-[85vh] md:max-w-[88vw] md:max-h-[82vh]",
                    "w-auto h-auto object-contain rounded-sm",
                    "transition-opacity duration-200",
                    isLoading ? "opacity-0" : "opacity-100",
                  )}
                  draggable={false}
                  onLoad={() => setIsLoading(false)}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Counter + Swipe hint (mobile) ──────────────────────── */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 z-20",
              "flex flex-col items-center gap-1",
              "bottom-[max(1rem,env(safe-area-inset-bottom))]",
              "md:bottom-6",
            )}
          >
            {hasMultiple && (
              <span className="font-body text-xs md:text-sm text-white/60 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full tabular-nums">
                {currentIndex + 1} / {images.length}
              </span>
            )}
            <span className="font-body text-[11px] text-white/40 md:hidden">
              Swipe to navigate
            </span>
          </div>

          {/* ── Thumbnail strip (desktop) ──────────────────────────── */}
          {hasMultiple && images.length <= 30 && (
            <div
              className={cn(
                "absolute z-20 left-1/2 -translate-x-1/2",
                "hidden lg:flex items-center gap-1.5",
                "bottom-16 max-w-3xl px-4",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => changeIndex(i)}
                  className={cn(
                    "relative shrink-0 w-11 h-11 lg:w-12 lg:h-12",
                    "rounded overflow-hidden transition-all duration-200 cursor-pointer",
                    "border-2",
                    i === currentIndex
                      ? "border-white ring-1 ring-white/40 scale-105"
                      : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100",
                  )}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === currentIndex}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    loading={Math.abs(i - currentIndex) <= 3 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

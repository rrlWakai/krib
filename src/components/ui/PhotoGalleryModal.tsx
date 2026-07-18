import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function PhotoGalleryModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext,
}: PhotoGalleryModalProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrevious, onNext],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    if (touchStart - touchEnd > 50) {
      // Swiped left
      onNext();
    }
    if (touchEnd - touchStart > 50) {
      // Swiped right
      onPrevious();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10 cursor-pointer rounded-full hover:bg-white/10"
            aria-label="Close gallery"
          >
            <X size={24} className="md:size-8" />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 items-center justify-center text-white/80 hover:text-white transition-colors z-10 cursor-pointer rounded-full hover:bg-white/10 max-sm:hidden sm:flex"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 items-center justify-center text-white/80 hover:text-white transition-colors z-10 cursor-pointer rounded-full hover:bg-white/10 max-sm:hidden sm:flex"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>

          {/* Image Container with Touch Support */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[currentIndex]}
              alt={`Photo ${currentIndex + 1} of ${images.length}`}
              className="w-full h-full object-contain"
            />
          </motion.div>

          {/* Image Counter */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 font-body text-body-sm md:text-body-md text-white/80 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Mobile Swipe Hint */}
          <div className="absolute bottom-4 left-4 right-4 md:hidden font-body text-body-sm text-white/60 text-center">
            Swipe to navigate
          </div>

          {/* Thumbnail Strip - Desktop */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 hidden lg:flex gap-2 justify-center max-w-2xl mx-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    // This would need a setCurrentIndex prop
                  }}
                  className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                    i === currentIndex
                      ? "border-primary ring-2 ring-primary"
                      : "border-white/30 hover:border-white/60"
                  }`}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === currentIndex}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
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

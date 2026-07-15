import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
  currentPath: string;
}

export function LoadingScreen({ onComplete, currentPath }: LoadingScreenProps) {
  const prefersReducedMotion = useReducedMotion();

  // Determine if we are on a specific villa route and get the villa number
  const isVilla1 = currentPath.includes("krib-1");
  const isVilla2 = currentPath.includes("krib-2");
  const villaNumber = isVilla1 ? "1" : isVilla2 ? "2" : null;

  // Timings (in seconds)
  const containerFadeInDuration = 0.3;
  const squareDrawDuration = 0.6;
  const verticalLineDrawDuration = 0.35;
  const diagonalDrawDuration = 0.35;
  const wordmarkFadeInDuration = 0.5;
  const villaNumberFadeInDuration = 0.25;

  // Calculate standard sequence end time
  // Step 1: Container fade-in starts at 0s, ends at 0.3s
  // Step 2: Square draws from 0.3s to 0.9s
  // Step 3: Vertical line draws from 0.9s to 1.25s
  // Step 4: Diagonal draws from 1.25s to 1.6s
  // Step 5: Wordmark fades in from 1.6s to 2.1s
  // Step 6: Villa number fades in from 2.1s to 2.35s
  // Step 7: Pause for 350-400ms, then exit.
  // Total loader active time = 2.75s.
  const totalSequenceTime = 2.75;

  useEffect(() => {
    // If user prefers reduced motion, make the sequence much faster (1.0s total)
    const activeDuration = prefersReducedMotion ? 1.0 : totalSequenceTime;
    
    const timer = setTimeout(() => {
      onComplete();
    }, activeDuration * 1000);

    return () => clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  // Framer Motion variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: containerFadeInDuration, ease: "easeOut" as const }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.8, ease: "easeInOut" as const }
    }
  };

  // Standard line drawing transition
  const lineTransition = (delay: number, duration: number) => ({
    pathLength: {
      delay,
      duration,
      ease: [0.25, 0.1, 0.25, 1] as const, // Custom elegant ease-in-out
    }
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-100 flex items-center justify-center bg-white"
    >
      <div className="relative w-[280px] h-[308px] flex items-center justify-center">
        <svg
          viewBox="0 0 200 220"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* STEP 2: Outer Square */}
          <motion.path
            d="M 60,50 L 140,50 L 140,130 L 60,130 Z"
            stroke="#7C7C7C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 1 }}
            transition={prefersReducedMotion ? undefined : lineTransition(containerFadeInDuration, squareDrawDuration)}
          />

          {/* STEP 3: Vertical Line */}
          <motion.path
            d="M 78,38 L 78,162"
            stroke="#7C7C7C"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 1 }}
            transition={prefersReducedMotion ? undefined : lineTransition(
              containerFadeInDuration + squareDrawDuration,
              verticalLineDrawDuration
            )}
          />

          {/* STEP 4: Diagonal Stroke of the "K" */}
          <motion.path
            d="M 140,50 L 84,96 C 80,99 78,102 78,106 C 78,110 80,113 84,116 L 126,130"
            stroke="#7C7C7C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 1 }}
            transition={prefersReducedMotion ? undefined : lineTransition(
              containerFadeInDuration + squareDrawDuration + verticalLineDrawDuration,
              diagonalDrawDuration
            )}
          />

          {/* STEP 5: "KRiB" Wordmark */}
          <motion.text
            x="96"
            y="152"
            fill="#7C7C7C"
            style={{ 
              letterSpacing: "0.28em",
              fontFamily: "var(--font-body)",
            }}
            className="text-[13px] font-normal select-none"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                delay: prefersReducedMotion 
                  ? 0.2 
                  : containerFadeInDuration + squareDrawDuration + verticalLineDrawDuration + diagonalDrawDuration,
                duration: wordmarkFadeInDuration,
                ease: "easeOut"
              }
            }}
          >
            KRiB
          </motion.text>

          {/* STEP 6: Villa Number */}
          {villaNumber && (
            <motion.text
              x="152"
              y="152"
              fill="#7C7C7C"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic"
              }}
              className="text-[14px] select-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  delay: prefersReducedMotion
                    ? 0.4
                    : containerFadeInDuration + squareDrawDuration + verticalLineDrawDuration + diagonalDrawDuration + wordmarkFadeInDuration,
                  duration: villaNumberFadeInDuration,
                  ease: "easeOut"
                }
              }}
            >
              {villaNumber}
            </motion.text>
          )}
        </svg>
      </div>
    </motion.div>
  );
}

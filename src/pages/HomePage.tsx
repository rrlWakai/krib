import { motion } from "framer-motion";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { Hero } from "../components/sections/home/Hero";
import { ChooseYourStay } from "../components/sections/home/ChooseYourStay";
import { About } from "../components/sections/home/About";
import { Experiences } from "../components/sections/home/Experiences";
import { Amenities } from "../components/sections/home/Amenities";
import { Gallery } from "../components/sections/home/Gallery";
import { FAQ } from "../components/sections/home/FAQ";
import { CTA } from "../components/sections/home/CTA";
import { Connect } from "../components/sections/home/Connect";

export function HomePage() {
  useScrollToHash();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Hero />
      <div id="story">
        <About />
      </div>
      <Experiences />
      <div id="villas">
        <ChooseYourStay />
      </div>
      <Amenities />
      <Gallery />
      <FAQ />
      <CTA />
      <Connect />
    </motion.main>
  );
}

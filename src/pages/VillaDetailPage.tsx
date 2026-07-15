import { useState, useMemo, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ChevronRight,
  ArrowLeft,
  MapPin,
  Users,
  Bed,
  Bath,
  Waves,
  Image,
  Expand,
} from "lucide-react";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { villas, nearbyAttractions } from "../lib/data";
import { fadeUp, pageTransition } from "../lib/animations";
import { Reveal } from "../components/ui/Reveal";
import { SectionLabel } from "../components/ui/SectionLabel";
import { StickyReservationCard } from "../components/ui/StickyReservationCard";
import { AvailabilityCalendar } from "../components/ui/AvailabilityCalendar";
import { PhotoGalleryModal } from "../components/ui/PhotoGalleryModal";
import { VillaPolicies } from "../components/ui/VillaPolicies";
import { VillaHeader } from "../components/ui/VillaHeader";
import { VillaAmenities } from "../components/sections/villa/VillaAmenities";
import { ReservationModal } from "../components/ui/ReservationModal";
import { getIcon } from "../lib/iconMap";
import { cn } from "../lib/cn";
import { images } from "../lib/images";

function ParallaxImg({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.img
        style={{ y }}
        className="w-full h-full object-cover"
        src={src}
        alt={alt}
        loading="lazy"
      />
    </div>
  );
}

export function VillaDetailPage() {
  useScrollToHash();
  const location = useLocation();
  const slug = location.pathname.replace("/", "");
  const villa = villas.find((v) => v.slug === slug);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reservationOpen, setReservationOpen] = useState(false);

  const allImages = useMemo(() => {
    if (!villa) return [];
    return villa.images.length >= 5
      ? villa.images
      : [
          ...villa.images,
          images.krib1Pool,
          images.krib2Pool,
          images.galleryBathroom,
          images.galleryBreakfast,
          images.galleryStairs,
        ].slice(0, 5);
  }, [villa]);

  const openGallery = useCallback((index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }, []);

  const handlePrevious = useCallback(() => {
    setGalleryIndex((i) => (i > 0 ? i - 1 : allImages.length - 1));
  }, [allImages.length]);

  const handleNext = useCallback(() => {
    setGalleryIndex((i) => (i < allImages.length - 1 ? i + 1 : 0));
  }, [allImages.length]);

  if (!villa) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <h1 className="font-display text-headline-xl mb-4">
            Villa not found
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant mb-8">
            The villa you are looking for does not exist or may have been
            removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-label-caps text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-primary-hover hover:border-primary-hover transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <VillaHeader />
      <motion.main
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* ===== 1. HERO GALLERY ===== */}
        <section className="relative bg-on-surface">
          {/* Desktop Grid Layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-[50vh] md:h-[70vh] overflow-hidden gap-1">
            <div
              className="md:col-span-2 md:row-span-2 relative overflow-hidden cursor-pointer group"
              onClick={() => openGallery(0)}
              role="button"
              tabIndex={0}
              aria-label={`View ${villa.name} featured image`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openGallery(0);
                }
              }}
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full object-cover"
                src={allImages[0]}
                alt={`${villa.name} featured`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
            {allImages.slice(1, 5).map((img, i) => (
              <div
                key={i}
                className="relative overflow-hidden cursor-pointer group"
                onClick={() => openGallery(i + 1)}
                role="button"
                tabIndex={0}
                aria-label={`View ${villa.name} image ${i + 2}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openGallery(i + 1);
                  }
                }}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover"
                  src={img}
                  alt={`${villa.name} view ${i + 2}`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>

          {/* Mobile Gallery Carousel */}
          <div className="md:hidden relative">
            <div className="aspect-video overflow-hidden">
              <motion.img
                key={galleryIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover cursor-pointer"
                src={allImages[galleryIndex]}
                alt={`${villa.name} image ${galleryIndex + 1}`}
                onClick={() => openGallery(galleryIndex)}
              />
            </div>

            {/* Mobile Thumbnails */}
            <div className="flex gap-2 p-3 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={cn(
                    "shrink-0 w-16 h-16 overflow-hidden border-2 transition-all duration-200",
                    galleryIndex === i
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-outline hover:border-primary/50",
                  )}
                  aria-label={`View image ${i + 1}`}
                  aria-current={galleryIndex === i}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Mobile Navigation Dots */}
            <div className="flex justify-center gap-2 py-3 bg-on-surface/5">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    galleryIndex === i
                      ? "bg-primary w-6"
                      : "bg-primary/30 hover:bg-primary/60",
                  )}
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={galleryIndex === i}
                />
              ))}
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6 bg-linear-to-b from-black/40 to-transparent">
            <nav className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
              <ol className="flex items-center gap-3 font-body text-label-caps text-white/80 uppercase tracking-widest text-xs md:text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-white/60">
                  <ChevronRight size={12} />
                </li>
                <li className="text-white font-semibold">{villa.name}</li>
              </ol>
            </nav>
          </div>

          {/* Call-to-action Button */}
          <button
            onClick={() => openGallery(0)}
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/90 text-on-surface px-4 md:px-5 py-2.5 rounded-default font-body text-label-caps uppercase tracking-widest shadow-card hover:bg-white hover:shadow-elevated transition-all duration-300 cursor-pointer text-xs md:text-sm z-10 flex items-center gap-2 backdrop-blur-sm"
            aria-label="View all photos in gallery"
          >
            <Image size={16} />
            <span className="hidden sm:inline">Show all photos</span>
            <span className="sm:hidden">Gallery</span>
          </button>

          {/* Image Counter - Desktop */}
          <div className="hidden md:block absolute bottom-6 left-6 font-body text-body-sm text-white/80 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-default z-10">
            {galleryIndex + 1} / {allImages.length}
          </div>
        </section>

        {/* ===== 2-7: MAIN CONTENT + STICKY CARD ===== */}
        <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile py-section-gap">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-section-gap">
              {/* ----- 2. PROPERTY OVERVIEW ----- */}
              <section id="overview">
                <Reveal>
                  <div className="mb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-body text-label-caps text-on-surface-variant/60 tracking-[0.2em] text-sm">
                        {villa.number} &mdash; {villa.tagline}
                      </span>
                    </div>
                    <h1 className="font-display text-display-md max-md:text-display-md-mobile text-on-surface mb-3 leading-tight">
                      {villa.name}
                    </h1>
                  </div>
                  <p className="font-body text-body-lg text-on-surface-variant leading-relaxed mb-10">
                    {villa.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 mb-10">
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-on-surface-variant" />
                      <span className="font-body text-body-md text-on-surface">
                        {villa.maxGuests} guests
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed size={20} className="text-on-surface-variant" />
                      <span className="font-body text-body-md text-on-surface">
                        {villa.bedrooms} bedrooms
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath size={20} className="text-on-surface-variant" />
                      <span className="font-body text-body-md text-on-surface">
                        {villa.bathrooms} bathrooms
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Waves size={20} className="text-on-surface-variant" />
                      <span className="font-body text-body-md text-on-surface">
                        Private pool
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={20} className="text-on-surface-variant" />
                      <span className="font-body text-body-md text-on-surface">
                        Beverly Place, Pampanga
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {villa.quickHighlights.map((h) => (
                      <span
                        key={h}
                        className="font-body text-label-caps bg-primary-container text-on-primary-container px-5 py-2.5 rounded-full text-[11px] uppercase tracking-widest"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </Reveal>
              </section>

              {/* ----- 3. VILLA STORY ----- */}
              <section id="story">
                <Reveal>
                  <SectionLabel>ABOUT THIS VILLA</SectionLabel>
                  <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-6 leading-tight">
                    {villa.tagline}
                  </h2>
                  <div className="space-y-5">
                    <p className="font-body text-body-lg text-on-surface-variant leading-relaxed">
                      {villa.story}
                    </p>
                    <p className="font-body text-body-lg text-on-surface-variant leading-relaxed">
                      Whether you are planning a quiet weekend escape or a
                      lively celebration with loved ones,
                      {villa.name} provides the perfect setting. The open living
                      spaces, private pool, and thoughtfully designed interiors
                      create an atmosphere that is both luxurious and welcoming.
                    </p>
                  </div>
                </Reveal>
              </section>

              {/* ----- 4. AMENITIES (Editorial Grid) ----- */}
              <section id="amenities">
                {villa.slug === 'krib-2' ? (
                  <VillaAmenities villaName={villa.name} />
                ) : (
                  <>
                    <Reveal>
                      <SectionLabel>AMENITIES</SectionLabel>
                      <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-10">
                        Everything you need
                      </h2>
                    </Reveal>

                    {villa.amenities.map((category) => (
                      <div key={category.category} className="mb-14 last:mb-0">
                        <Reveal>
                          <div className="flex items-center gap-4 mb-8">
                            <span className="font-body text-label-caps text-primary uppercase tracking-[0.28em] text-sm font-medium">
                              {category.category}
                            </span>
                            <span className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
                          </div>
                        </Reveal>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-5">
                          {category.items.map((item) => {
                            const Icon = getIcon(item.icon);
                            return (
                              <motion.div
                                key={item.label}
                                variants={fadeUp}
                                className="flex items-center gap-4"
                              >
                                <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant/35 text-on-surface-variant/60">
                                  <Icon size={18} strokeWidth={1.5} />
                                </span>
                                <span className="font-body text-body-md text-on-surface leading-tight">
                                  {item.label}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </section>

              {/* ----- 5. AVAILABILITY CALENDAR ----- */}
              <section id="availability">
                <Reveal>
                  <SectionLabel>AVAILABILITY</SectionLabel>
                  <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-4">
                    Availability Calendar
                  </h2>
                  <p className="font-body text-body-lg text-on-surface-variant mb-8">
                    Select your preferred dates and instantly view this
                    villa&apos;s availability before submitting your reservation
                    inquiry.
                  </p>
                </Reveal>

                <motion.div
                  whileHover={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
                  transition={{ duration: 0.4 }}
                >
                  <AvailabilityCalendar
                    villaId={villa.id}
                    villaName={villa.name}
                  />
                </motion.div>
              </section>
            </div>

            {/* Right Column - Sticky Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="lg:sticky lg:top-28"
              >
                <StickyReservationCard
                  price={villa.priceDetails.perNight}
                  rateType={villa.priceDetails.rateType}
                  villaName={villa.name}
                  maxGuests={villa.maxGuests}
                  hasPartyFee
                  onReserve={() => setReservationOpen(true)}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* ===== 7. GALLERY — luxury editorial ===== */}
        <section className="overflow-hidden">
          {/* Header */}
          <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile mb-14 md:mb-20 pt-section-gap">
            <Reveal>
              <div className="w-10 h-[2px] bg-primary mb-6" />
              <SectionLabel>GALLERY</SectionLabel>
              <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mt-3">
                A closer look at {villa.name}
              </h2>
            </Reveal>
          </div>

          {/* Cinematic hero — edge to edge, parallax */}
          <div className="relative h-[50vh] md:h-[80vh] overflow-hidden">
            <ParallaxImg
              src={allImages[0]}
              alt={`${villa.name} featured`}
              className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-8 left-6 md:bottom-12 md:left-10"
            >
              <p className="font-body text-label-caps text-white/50 tracking-[0.25em] text-[10px] mb-1">
                FEATURED
              </p>
              <p className="font-display text-headline-xs md:text-headline-sm text-white font-light">
                {villa.name} — exterior
              </p>
            </motion.div>
            <button
              onClick={() => openGallery(0)}
              className="absolute bottom-8 right-6 md:bottom-12 md:right-10 font-body text-label-caps text-white/80 tracking-[0.2em] border border-white/30 px-5 py-3 hover:bg-white hover:text-primary transition-all duration-500 text-xs uppercase cursor-pointer backdrop-blur-sm bg-black/10"
            >
              View all {allImages.length} photos
            </button>
          </div>

          {/* Desktop: editorial grid */}
          <div className="hidden md:block">
            {/* Row 1: tall portrait + wide landscape */}
            <div className="grid grid-cols-12">
              <div className="relative col-span-5 overflow-hidden group cursor-pointer"
                onClick={() => openGallery(1)}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-[70vh] object-cover"
                  src={allImages[1]}
                  alt={`${villa.name} - view 2`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-700 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-500"
                  >
                    <Expand size={24} className="text-white" />
                  </motion.div>
                </div>
              </div>
              <div className="relative col-span-7 overflow-hidden group cursor-pointer"
                onClick={() => openGallery(2)}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-[70vh] object-cover"
                  src={allImages[2]}
                  alt={`${villa.name} - view 3`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-700 flex items-center justify-center">
                  <motion.div className="opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <Expand size={24} className="text-white" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Row 2: 3-column even spread */}
            {allImages.length > 3 && (
              <div className="grid grid-cols-12">
                {allImages.slice(3, 6).map((img, i) => (
                  <div
                    key={i}
                    className="relative col-span-4 overflow-hidden group cursor-pointer"
                    onClick={() => openGallery(i + 3)}
                  >
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-[50vh] object-cover"
                      src={img}
                      alt={`${villa.name} - view ${i + 4}`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-700 flex items-center justify-center">
                      <motion.div className="opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <Expand size={24} className="text-white" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Row 3: full-width closing image with parallax */}
            {allImages.length > 6 && (
              <div className="relative h-[55vh] overflow-hidden group cursor-pointer"
                onClick={() => openGallery(6)}
              >
                <ParallaxImg
                  src={allImages[6]}
                  alt={`${villa.name} - view 7`}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-700 flex items-center justify-center">
                  <motion.div className="opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <Expand size={28} className="text-white" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: full-bleed vertical rhythm */}
          <div className="md:hidden">
            {allImages.slice(1).map((img, i) => {
              const heights = ['52vh', '42vh', '56vh', '42vh', '50vh']
              const labels = ['Pool & garden', 'Living area', 'Bedroom', 'Bathroom', 'Exterior']
              return (
                <Reveal key={i} delay={i * 60}>
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    style={{ height: heights[i % heights.length] }}
                    onClick={() => openGallery(i + 1)}
                  >
                    <motion.img
                      whileHover={{ scale: 1.04 }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full object-cover"
                      src={img}
                      alt={`${villa.name} - view ${i + 2}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                    {labels[i] && (
                      <p className="absolute bottom-4 left-5 font-body text-label-caps text-white/70 tracking-[0.2em] text-[10px] uppercase">
                        {labels[i]}
                      </p>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* ===== 8. LOCATION ===== */}
        <section id="location" className="py-section-gap">
          <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
              <Reveal className="md:col-span-5">
                <SectionLabel>LOCATION</SectionLabel>
                <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-6">
                  Beverly Place, Pampanga
                </h2>
                <p className="font-body text-body-lg text-on-surface-variant mb-10 leading-relaxed">
                  Tucked away in the quiet hills of Pampanga, KRiB Beverly Place
                  is close enough for a spontaneous weekend escape, yet feels
                  like a world away.
                </p>

                <div className="space-y-6 mb-10">
                  {nearbyAttractions.map((a) => {
                    const Icon = getIcon(a.icon);
                    return (
                      <div key={a.id} className="flex items-start gap-4">
                        <Icon
                          size={20}
                          className="text-on-surface-variant shrink-0 mt-0.5"
                        />
                        <div>
                          <h4 className="font-body text-body-md font-semibold text-on-surface">
                            {a.name}
                          </h4>
                          <p className="font-body text-body-md text-on-surface-variant text-sm">
                            {a.description}
                          </p>
                          <span className="font-body text-label-caps text-secondary uppercase tracking-widest text-[11px]">
                            {a.travelTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <a
                  href={
                    villa.mapLink ??
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${villa.name} Beverly Place Pampanga`,
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-body text-label-caps text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-primary-hover hover:border-primary-hover transition-colors"
                >
                  <MapPin size={16} /> Get Directions
                </a>
              </Reveal>

              <Reveal delay={200} className="md:col-span-6 md:col-start-7">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="aspect-4/3 bg-surface-container-highest rounded-lg overflow-hidden shadow-elevated"
                >
                  {/* Embedded Google Map for the villa's location */}
                  <iframe
                    title={`Map - ${villa.name}`}
                    src={
                      villa.mapEmbed ??
                      `https://www.google.com/maps?q=${encodeURIComponent(
                        `${villa.name} Beverly Place Pampanga`,
                      )}&output=embed`
                    }
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen={true}
                  />
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===== 9. HOUSE POLICIES ===== */}
        <section className="bg-surface-container-low py-section-gap">
          <div className="mx-auto w-full max-w-container-max px-margin-desktop max-md:px-margin-mobile">
            <Reveal>
              <SectionLabel>HOUSE POLICIES</SectionLabel>
              <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile mb-4">
                Things to know
              </h2>
              <p className="font-body text-body-lg text-on-surface-variant mb-10">
                Please review our policies before making a reservation.
              </p>
            </Reveal>

            <VillaPolicies policies={villa.policies} />
          </div>
        </section>
      </motion.main>

      <PhotoGalleryModal
        images={allImages}
        currentIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      {villa && (
        <ReservationModal
          isOpen={reservationOpen}
          onClose={() => setReservationOpen(false)}
          property={{
            id: villa.id,
            name: villa.name,
            priceDetails: villa.priceDetails,
            maxGuests: villa.maxGuests,
            hasPartyFee: true,
            partyFeeLabel: '₱5,000',
            policies: villa.policies,
          }}
        />
      )}
    </>
  );
}

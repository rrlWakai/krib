# KRiB Beverly Place — Complete Asset Inventory

> Production image checklist generated from a full codebase audit.
> Every image reference in every page, component, and data file has been cataloged.

---

## Table of Contents

1. [Current State Summary](#current-state-summary)
2. [Homepage](#homepage)
3. [KRiB 1 — Villa Detail Page](#krib-1--villa-detail-page)
4. [KRiB 2 — Villa Detail Page](#krib-2--villa-detail-page)
5. [Shared / Cross-Villa Assets](#shared--cross-villa-assets)
6. [Branding & Meta](#branding--meta)
7. [Admin Control Center](#admin-control-center)
8. [Unused / Orphaned Assets](#unused--orphaned-assets)
9. [Image Replacement Map](#image-replacement-map)
10. [Final Summary](#final-summary)

---

## Current State Summary

| Metric | Count |
|--------|-------|
| Total image constants defined | 24 |
| Local assets on disk | 8 |
| Local assets actually imported | 5 |
| Orphaned local assets (on disk, not imported) | 3 |
| Unsplash placeholder URLs | 19 |
| Unused exported constants (defined but never rendered) | 3 |
| Favicon / OG image / meta image | **MISSING** |
| Logo image file | **MISSING** (text-only rendering) |

**All 19 Unsplash URLs are production placeholders.** Each must be replaced with the owner's actual photography before deployment.

---

## Homepage

### Hero Section — `src/components/sections/home/Hero.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| Hero Background | `hero.webp` | `assets/images/homepage/` | Landscape | 16:9 | 2560×1440 | Full-viewport CSS background-image | **Yes** | `hero.png` (local — exists) |

**Composition:** Wide establishing shot of the KRiB Beverly Place estate from an elevated or aerial angle. Tropical greenery, pool visible, golden-hour or soft daylight. Should convey luxury, exclusivity, and serenity at first glance.

**Camera:** Drone or elevated tripod, wide-angle (16mm–24mm).
**Lighting:** Golden hour (6:30–7:30 AM or 4:30–5:30 PM) for warm, inviting tone.
**Subject:** Full estate exterior with pool and garden visible. No people.

---

### About Section — `src/components/sections/home/About.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| About / Story Image | `about.webp` | `assets/images/homepage/` | Portrait | 4:5 | 1200×1500 | `<img>` tag, right column | **Yes** | Unsplash `photo-1469854523086-cc02fe5d8800` |

**Composition:** Warm lifestyle shot — family or group enjoying the villa grounds, casual and genuine. Should feel editorial but authentic, not staged.

**Camera:** 35mm–50mm lens, natural framing.
**Lighting:** Soft natural daylight, shade or overcast for even tones.
**Subject:** People enjoying the property (family gathering, poolside moment). Faces can be candid/profile.

---

### Choose Your Stay (Villa Cards) — `src/components/sections/home/ChooseYourStay.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| KRiB 1 Card Image | `krib1-card.webp` | `assets/images/villas/krib-1/` | Portrait | 4:5 | 1200×1500 | `<img>` tag | **Yes** | `05.png` (local — exists) |
| KRiB 2 Card Image | `krib2-card.webp` | `assets/images/villas/krib-2/` | Portrait | 4:5 | 1200×1500 | `<img>` tag | **Yes** | `bbx.png` (local — exists) |

**Composition (KRiB 1):** Exterior view of KRiB 1 showing the villa facade, garden, and pool. Warm and inviting. Should clearly show "family retreat" character.

**Composition (KRiB 2):** Exterior view of KRiB 2 showing the larger estate, pool pavilion, and expansive grounds. Should convey "signature villa" grandeur. Staggered layout (`md:mt-32`) so this card sits lower on desktop.

**Camera:** 24mm–35mm, tripod level or slight low angle.
**Lighting:** Late afternoon golden hour.
**Subject:** Villa exterior only. No people. Pool and garden visible.

---

### Gallery Section — `src/components/sections/home/Gallery.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| Gallery — Portrait (KRiB 2 exterior) | `gallery-portrait.webp` | `assets/images/homepage/` | Portrait | ~5:8 | 1000×1600 | `<motion.img>`, col-span-5 | **Yes** | `bbx.png` (reused) |
| Gallery — Lifestyle (breakfast) | `gallery-lifestyle.webp` | `assets/images/homepage/` | Landscape | ~7:5 | 1400×1000 | `<motion.img>`, col-span-7 | **Yes** | Unsplash `photo-1504674900247` |
| Gallery — Interior (living room) | `gallery-interior.webp` | `assets/images/homepage/` | Landscape | ~4:3 | 1200×900 | `<motion.img>`, col-span-4 | **Yes** | Unsplash `photo-1600607687939` |
| Gallery — Detail (stairs) | `gallery-detail.webp` | `assets/images/homepage/` | Landscape | ~4:3 | 1200×900 | `<motion.img>`, col-span-4 | **Yes** | Unsplash `photo-1600585154340` |
| Gallery — Garden (pool) | `gallery-garden.webp` | `assets/images/homepage/` | Landscape | ~4:3 | 1200×900 | `<motion.img>`, col-span-4 | **Yes** | Unsplash `photo-1572331165267` |
| Gallery — Aerial (estate overview) | `gallery-aerial.webp` | `assets/images/homepage/` | Landscape | 16:9 | 2560×1440 | `<motion.img>`, full-width col-span-12 | **Yes** | `hero.png` (reused) |

**Composition:** Editorial magazine-quality grid. Mix of wide establishing shots, intimate details, and lifestyle moments. Each image should feel like it belongs in a luxury hospitality lookbook.

**Camera:** Mix of wide (16–24mm) for aerials/exteriors and standard (35–50mm) for lifestyle/details.
**Lighting:** Consistent warm natural light throughout. Avoid mixed color temperatures.
**Subjects:** Pool aerial, living room with natural light, breakfast/table setting, architectural detail, garden/pool greenery, estate exterior.

---

### Experiences Section — `src/components/sections/home/Experiences.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| Morning Coffee beside pool | `exp-morning-coffee.webp` | `assets/images/homepage/` | Landscape | 16:10 | 1200×750 | `<motion.img>` (desktop) + `<img>` (mobile) | **Yes** | Unsplash `photo-1495474472287` |
| Birthday celebrations | `exp-birthday.webp` | `assets/images/homepage/` | Landscape | 16:10 | 1200×750 | `<motion.img>` (desktop) + `<img>` (mobile) | **Yes** | Unsplash `photo-1529543544282` |
| Weekend barbecue / sunset | `exp-weekend-bbq.webp` | `assets/images/homepage/` | Landscape | 16:10 | 1200×750 | `<motion.img>` (desktop) + `<img>` (mobile) | **Yes** | Unsplash `photo-1507525428034` |
| Pool days / afternoon swim | `exp-pool-days.webp` | `assets/images/homepage/` | Landscape | 16:10 | 1200×750 | `<motion.img>` (desktop) + `<img>` (mobile) | **Yes** | Unsplash `photo-1495474472287` (reused) |
| Quiet evenings | `exp-quiet-evenings.webp` | `assets/images/homepage/` | Landscape | 16:10 | 1200×750 | `<motion.img>` (desktop) + `<img>` (mobile) | **Yes** | Unsplash `photo-1507525428034` (reused) |

> **Note:** Currently 2 images are reused (`morningCoffee` used for 2 experiences, `sunsetGatherings` used for 2 experiences). Each experience ideally gets a unique photograph.

**Composition:** Lifestyle editorial — authentic moments of enjoyment at the villa. Should tell a story per experience.
**Camera:** 35mm–85mm for intimate moments.
**Lighting:** Natural light matching the time of day described (morning golden light, afternoon sun, sunset).
**Subjects:** Coffee by the pool, group celebration, grilling/BBQ, swimming, evening gathering.

---

### CTA Section — `src/components/sections/home/CTA.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| CTA Background | `cta-bg.webp` | `assets/images/homepage/` | Landscape | 16:9 | 2560×1440 | Parallax `<motion.img>`, full-bleed | **Yes** | Unsplash `photo-1540541338287` |

**Composition:** Atmospheric pool or estate shot at dusk/twilight. Heavy overlay (gradient + radial), so the image provides mood and texture more than detail. Blue/slate tone preferred.

**Camera:** Wide-angle, tripod.
**Lighting:** Blue hour or twilight for dramatic atmosphere.
**Subject:** Pool with ambient lighting, or villa exterior at dusk.

---

### Connect / Social Section — `src/components/sections/home/Connect.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| Social / Connect Image | `social.webp` | `assets/images/homepage/` | Portrait | ~3:4 | 1200×1600 | `<img>` tag, right column | **Yes** | Unsplash `photo-1510798831971` |

**Composition:** Lifestyle image that evokes social media aesthetic — people enjoying the villa, candid and aspirational. Should work as an Instagram-worthy backdrop.

**Camera:** 35mm–50mm, natural framing.
**Lighting:** Warm afternoon light.
**Subject:** People enjoying the villa lifestyle — poolside, garden, or terrace.

---

### Homepage Summary

| # | Asset Key | Required Unique Images | Current Source | Status |
|---|-----------|----------------------|----------------|--------|
| 1 | Hero Background | 1 | Local `hero.png` | Needs owner photo |
| 2 | About Image | 1 | Unsplash | Needs owner photo |
| 3 | KRiB 1 Card | 1 | Local `05.png` | Needs owner photo |
| 4 | KRiB 2 Card | 1 | Local `bbx.png` | Needs owner photo |
| 5 | Gallery (6 images) | 6 | 2 local + 4 Unsplash | Needs owner photos |
| 6 | Experiences (5 images) | 5 (3 unique, 2 reused) | 3 Unsplash | Needs owner photos |
| 7 | CTA Background | 1 | Unsplash | Needs owner photo |
| 8 | Social / Connect | 1 | Unsplash | Needs owner photo |
| | **Homepage Total** | **17** | | |

---

## KRiB 1 — Villa Detail Page

> Source: `src/lib/data.ts` villa definition + `src/pages/VillaDetailPage.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| KRiB 1 Hero / Primary | `krib1-hero.webp` | `assets/images/villas/krib-1/` | Landscape or Portrait | 4:5 or 16:9 | 2560×1920 | Primary villa `image` field, hero grid cell 0, gallery parallax hero, mobile carousel lead | **Yes** | `05.png` (local) |
| KRiB 1 Bedroom | `krib1-bedroom.webp` | `assets/images/villas/krib-1/` | Landscape | 16:10 | 1200×750 | Gallery index 1, hero grid, editorial grid | **Yes** | Unsplash `photo-1618773928121` |
| KRiB 1 Pool | `krib1-pool.webp` | `assets/images/villas/krib-1/` | Landscape | 16:10 | 1200×750 | Gallery index 2, hero grid, editorial grid | **Yes** | Unsplash `photo-1572331165267` |
| KRiB 1 Bathroom | `krib1-bathroom.webp` | `assets/images/villas/krib-1/` | Landscape | 16:10 | 1200×750 | Gallery index 3, hero grid, editorial grid | **Yes** | Unsplash `photo-1552321554` |
| KRiB 1 (5th gallery) | `krib1-exterior.webp` | `assets/images/villas/krib-1/` | Landscape | 16:10 | 1200×750 | Gallery index 4 (currently duplicate of hero) | **Recommended** | `05.png` (reused) |

**KRiB 1 Gallery Index:**

| Index | Current Image | Purpose in VillaDetailPage |
|-------|---------------|---------------------------|
| 0 | `images.krib1` (`05.png`) | Hero grid large cell, gallery parallax hero, mobile carousel lead |
| 1 | `images.krib1Bedroom` (Unsplash) | Hero grid small cell, gallery editorial row 1 (portrait) |
| 2 | `images.krib1Pool` (Unsplash) | Hero grid small cell, gallery editorial row 1 (landscape) |
| 3 | `images.galleryBathroom` (Unsplash) | Hero grid small cell, gallery editorial row 2 |
| 4 | `images.krib1` (`05.png`) | Hero grid small cell, gallery editorial row 2 (**duplicate of index 0**) |

**KRiB 1 Bedroom Photography Specifications:**

| Room | Camera Angle | Lighting | Subject | Composition |
|------|-------------|----------|---------|-------------|
| Primary Bedroom | Wide angle (24mm) from doorway | Natural morning light from window | Bed fully made, crisp white linens | Editorial luxury, symmetrical |
| Bedroom 2 | Wide angle from corner | Soft natural light | Bed prepared, side table with lamp | Warm, inviting |
| Bedroom 3 | Wide angle from doorway | Natural light | Bed prepared, clean lines | Minimal, editorial |
| Bathroom | Wide angle from entrance | Bright natural or warm artificial | Clean vanity, towels folded, shower visible | Spa-like, pristine |

---

## KRiB 2 — Villa Detail Page

> Source: `src/lib/data.ts` villa definition + `src/pages/VillaDetailPage.tsx`

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| KRiB 2 Hero / Primary | `krib2-hero.webp` | `assets/images/villas/krib-2/` | Landscape or Portrait | 4:5 or 16:9 | 2560×1920 | Primary villa `image` field (used in ChooseYourStay cards, gallery section) | **Yes** | `bbx.png` (local) |
| KRiB 2 Living / Interior 1 | `krib2-living.webp` | `assets/images/villas/krib-2/` | Landscape | 16:10 | 1200×750 | Gallery index 0, hero grid cell 0, gallery parallax hero, mobile carousel lead | **Yes** | `k2.webp` (local) |
| KRiB 2 Interior 2 | `krib2-interior-2.webp` | `assets/images/villas/krib-2/` | Landscape | 16:10 | 1200×750 | Gallery index 1, hero grid, editorial grid | **Yes** | `kk2.webp` (local) |
| KRiB 2 Pool | `krib2-pool.webp` | `assets/images/villas/krib-2/` | Landscape | 16:10 | 1200×750 | Gallery index 2, hero grid, editorial grid | **Yes** | Unsplash `photo-1575429198097` |
| KRiB 2 Dining / Breakfast | `krib2-dining.webp` | `assets/images/villas/krib-2/` | Landscape | 16:10 | 1200×750 | Gallery index 3, hero grid, editorial grid | **Yes** | Unsplash `photo-1504674900247` |

**KRiB 2 Gallery Index:**

| Index | Current Image | Purpose in VillaDetailPage |
|-------|---------------|---------------------------|
| 0 | `images.k2` (`k2.webp`) | Hero grid large cell, gallery parallax hero, mobile carousel lead |
| 1 | `images.kk2` (`kk2.webp`) | Hero grid small cell, gallery editorial row 1 (portrait) |
| 2 | `images.krib2Pool` (Unsplash) | Hero grid small cell, gallery editorial row 1 (landscape) |
| 3 | `images.galleryBreakfast` (Unsplash) | Hero grid small cell, gallery editorial row 2 |

> **Note:** KRiB 2 has only 4 gallery images. The VillaDetailPage pads to 5 with fallback images from the pool/bathroom/breakfast/stairs set. This means one gallery slot currently shows a KRiB 1 pool image as a fallback.

**KRiB 2 Bedroom Photography Specifications (Sleeping Arrangements):**

| Room | Capacity | Camera Angle | Lighting | Subject | Composition |
|------|----------|-------------|----------|---------|-------------|
| Large Bedroom | 18 guests | Ultra-wide (16mm) from entrance | Bright natural light, warm tone | Multiple beds/cots arranged, luxury bedding | Grand scale, editorial |
| Medium Bedroom | 8 guests | Wide angle (24mm) from corner | Natural light from windows | Beds prepared, clean linens | Spacious, warm |
| Small Bedroom | 4 guests | Wide angle (24mm) from doorway | Soft natural light | Beds prepared, intimate setting | Cozy, well-appointed |

---

## Shared / Cross-Villa Assets

These images are used across both villas or in shared sections.

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| Gallery — Pool Aerial (shared) | `gallery-pool-aerial.webp` | `assets/images/shared/` | Landscape | 4:3 | 1200×900 | Gallery section data array | **Yes** | Unsplash `photo-1495474472287` (reused from experiences) |
| Gallery — Living Room | `gallery-living-room.webp` | `assets/images/shared/` | Portrait | 3:4 | 900×1200 | Gallery section data array | **Yes** | Unsplash `photo-1600607687939` |
| Gallery — Breakfast Setup | `gallery-breakfast.webp` | `assets/images/shared/` | Landscape | 5:3 | 1200×720 | Gallery section data array | **Yes** | `05.png` (reused from KRiB 1) |
| Gallery — Bedroom Interior | `gallery-bedroom.webp` | `assets/images/shared/` | Landscape | 4:3 | 1200×900 | Gallery section data array | **Yes** | Unsplash `photo-1618773928121` (reused from KRiB 1) |
| Gallery — Garden / Evening | `gallery-garden-evening.webp` | `assets/images/shared/` | Landscape | 5:3 | 1200×720 | Gallery section data array | **Yes** | `bbx.png` (reused from KRiB 2) |
| Map Image | `map-location.webp` | `assets/images/shared/` | Landscape | 16:9 | 1200×675 | `images.map` constant (currently defined but not actively rendered) | **Optional** | Unsplash `photo-1524661135` |
| Location Hero | `location-hero.webp` | `assets/images/shared/` | Landscape | 16:9 | 2560×1440 | `images.locationHero` constant (defined, no component renders it) | **Optional** | Unsplash `photo-1500382017468` |

### Reservation / My Reservation

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| KRiB 1 Reservation Hero | `reservation-krib1.webp` | `assets/images/shared/` | Landscape | 16:9 | 1200×675 | `ReservationOverviewCard` hero banner, `getVillaImageByName()` | **Yes** | `hero.png` (reused) |
| KRiB 2 Reservation Hero | `reservation-krib2.webp` | `assets/images/shared/` | Landscape | 16:9 | 1200×675 | `ReservationOverviewCard` hero banner, `getVillaImageByName()` | **Yes** | Unsplash `photo-1600607687939` (reused) |

### Booking Experience Modal

| Asset | Filename (suggested) | Folder | Orientation | Aspect Ratio | Min Resolution | Image Type | Required | Currently |
|-------|----------------------|--------|-------------|--------------|----------------|------------|----------|-----------|
| KRiB 1 Booking Summary | `booking-krib1.webp` | `assets/images/shared/` | Landscape | 16:9 | 600×340 | `BookingExperience.tsx` sidebar header | **Yes** | `images.krib1` (reused) |
| KRiB 2 Booking Summary | `booking-krib2.webp` | `assets/images/shared/` | Landscape | 16:9 | 600×340 | `BookingExperience.tsx` sidebar header | **Yes** | `images.k2` → `images.krib2` fallback |

---

## Branding & Meta

### Currently Missing — Must Be Created

| Asset | Filename (suggested) | Folder | Format | Size | Purpose | Required |
|-------|----------------------|--------|--------|------|---------|----------|
| Favicon | `favicon.ico` + `favicon.svg` | `public/` | ICO + SVG | 32×32, 16×16 | Browser tab icon | **Yes** |
| Apple Touch Icon | `apple-touch-icon.png` | `public/` | PNG | 180×180 | iOS home screen icon | **Yes** |
| OG Image (Social Share) | `og-image.webp` | `public/` or `assets/images/meta/` | WebP/JPG | 1200×630 | Facebook, LinkedIn, Twitter share preview | **Yes** |
| Twitter Card Image | `twitter-card.webp` | `public/` or `assets/images/meta/` | WebP/JPG | 1200×628 | Twitter/X share preview | **Yes** |
| Logo Mark (SVG) | `logo-k.svg` | `assets/branding/` | SVG | Scalable | Loading screen, navbar (currently inline SVG) | **Recommended** |
| Logo Full (SVG) | `logo-full.svg` | `assets/branding/` | SVG | Scalable | Footer, admin, print materials | **Recommended** |

### Currently Implemented as Text/Inline SVG (No Image File Needed)

| Element | Location | Implementation | Notes |
|---------|----------|----------------|-------|
| Navbar Logo | `src/components/layout/Navbar.tsx` | Text-only: `"KRiB Beverly Place"` | Consider replacing with SVG logo |
| Footer Logo | `src/components/layout/Footer.tsx` | Text-only: giant `"KRiB"` typography | Consider replacing with SVG logo |
| Loading Screen Logo | `src/components/ui/LoadingScreen.tsx` | Inline SVG (animated K monogram + "KRiB" text) | Self-contained, no external asset needed |
| Admin Sidebar | `src/admin/layout/Sidebar.tsx` | Text: `"K"` circle + `"KRiB Control Center"` | Consider logo for consistency |

---

## Admin Control Center

The admin system uses **zero photographic images**. All visuals are Lucide icons and text initials.

| Element | Location | Implementation | Image Required? |
|---------|----------|----------------|-----------------|
| Sidebar Branding | `Sidebar.tsx` | Text `"K"` + `"KRiB Control Center"` | No (text-only) |
| Villa Card Placeholder | `Villas.tsx` | `<Building2>` Lucide icon on gradient | No (icon-based) |
| Guest Avatars | `Guests.tsx` | Text initials in colored circles | No (text-based) |
| Dashboard Stats | `Dashboard.tsx` | Lucide icons (`LogIn`, `LogOut`, `Clock`, etc.) | No |
| Empty States | All pages | Lucide icons (`CalendarDays`, `User`, `Tag`, etc.) | No |
| Calendar | `Calendar.tsx` | CSS color blocks | No |
| Charts | `Reports.tsx` | CSS/SVG inline | No |

> **Recommendation:** If photographic villa thumbnails are desired in the admin reservation list or villa management cards, those would need to be added to the component code. Currently the admin is entirely icon/text-based.

---

## Unused / Orphaned Assets

### On Disk But Not Imported in `images.ts`

| File | Path | Status | Notes |
|------|------|--------|-------|
| `about.png` | `src/assets/about.png` | **Orphaned** | `images.about` uses Unsplash instead |
| `finalcta.png` | `src/assets/finalcta.png` | **Orphaned** | `images.cta` uses Unsplash instead |
| `soc.png` | `src/assets/soc.png` | **Orphaned** | `images.social` uses Unsplash instead |

### Defined in `images.ts` But Never Rendered in Any Component

| Constant | Source | Status | Notes |
|----------|--------|--------|-------|
| `images.alFresco` | Unsplash `photo-1414235077428` | **Unused** | Defined but no component references it |
| `images.yogaTerrace` | Unsplash `photo-1506126613408` | **Unused** | Defined but no component references it |
| `images.locationHero` | Unsplash `photo-1500382017468` | **Unused** | Defined but no Location component exists |
| `images.galleryTextile` | Unsplash `photo-1616137466211` | **Admin only** | Used in admin `mockData.ts` gallery array, not rendered in public site |
| `images.galleryEstateNight` | Unsplash `photo-1564013799919` | **Admin only** | Used in admin `mockData.ts` gallery array, not rendered in public site |

---

## Image Replacement Map

This table maps every Unsplash placeholder to its replacement priority and the exact constant to update in `src/lib/images.ts`.

| Priority | Constant | Current Unsplash ID | Suggested Filename | Used In |
|----------|----------|--------------------|--------------------|---------|
| **P0** | `hero` | _(local asset)_ | `hero.webp` | Hero, Gallery, Reservation |
| **P0** | `krib1` | _(local asset)_ | `krib1-hero.webp` | KRiB 1 hero, gallery, booking |
| **P0** | `krib2` | _(local asset)_ | `krib2-hero.webp` | KRiB 2 primary, ChooseYourStay |
| **P0** | `k2` | _(local asset)_ | `krib2-living.webp` | KRiB 2 gallery, booking |
| **P0** | `kk2` | _(local asset)_ | `krib2-interior-2.webp` | KRiB 2 gallery |
| **P1** | `krib1Bedroom` | `photo-1618773928121` | `krib1-bedroom.webp` | KRiB 1 gallery |
| **P1** | `krib1Pool` | `photo-1572331165267` | `krib1-pool.webp` | KRiB 1 gallery, KRiB 2 fallback |
| **P1** | `krib2Pool` | `photo-1575429198097` | `krib2-pool.webp` | KRiB 2 gallery |
| **P1** | `galleryBathroom` | `photo-1552321554` | `krib1-bathroom.webp` | KRiB 1 gallery, KRiB 2 fallback |
| **P1** | `galleryBreakfast` | `photo-1504674900247` | `krib2-dining.webp` | KRiB 2 gallery, homepage gallery |
| **P1** | `about` | `photo-1469854523086` | `about.webp` | Homepage About section |
| **P1** | `cta` | `photo-1540541338287` | `cta-bg.webp` | Homepage CTA |
| **P1** | `social` | `photo-1510798831971` | `social.webp` | Homepage Connect section |
| **P2** | `morningCoffee` | `photo-1495474472287` | `exp-morning-coffee.webp` | Experiences, Gallery |
| **P2** | `familyBbq` | `photo-1529543544282` | `exp-birthday.webp` | Experiences |
| **P2** | `sunsetGatherings` | `photo-1507525428034` | `exp-weekend-bbq.webp` | Experiences |
| **P3** | `galleryStairs` | `photo-1600585154340` | `gallery-detail.webp` | Gallery (fallback pad) |
| **P3** | `map` | `photo-1524661135` | `map-location.webp` | Not actively rendered |
| **P3** | `locationHero` | `photo-1500382017468` | `location-hero.webp` | Not actively rendered |

**Priority Guide:**
- **P0** — Critical: Currently local assets, must be replaced with high-quality production photos
- **P1** — High: Core villa/gallery images visible on every page
- **P2** — Medium: Experience section images (reused across multiple entries)
- **P3** — Low: Fallback/pad images or unused constants

---

## Final Summary

### Totals

| Category | Count |
|----------|-------|
| **Total required images (unique)** | **28** |
| Total optional/recommended images | 5 |
| Total unused/orphaned constants | 3 (alFresco, yogaTerrace, locationHero) |
| Total orphaned local files | 3 (about.png, finalcta.png, soc.png) |

### Required Images Breakdown

| Section | Required Unique Images |
|---------|----------------------|
| Homepage (all sections) | 17 |
| KRiB 1 Villa Detail | 5 |
| KRiB 2 Villa Detail | 5 |
| Reservation / Booking modals | 2 (can reuse villa heroes) |
| Branding / Meta | 4 (favicon, apple-touch, OG, Twitter) |
| **Total** | **28** (3 overlap with villa heroes = **25 truly unique**) |

### Missing Branding Assets

1. **Favicon** — No favicon.ico or favicon.svg exists. `index.html` has no `<link rel="icon">`.
2. **Apple Touch Icon** — Missing.
3. **OG Image** — No `<meta property="og:image">` in index.html.
4. **Twitter Card Image** — No `<meta name="twitter:image">` in index.html.
5. **Logo SVG** — No standalone logo file. All branding is text-only or inline SVG.

### Missing Illustrations

None required. The site uses Lucide icons for all iconography. If custom illustrations are desired for empty states or onboarding, they would be additive.

### Missing Placeholders

The admin system has no image placeholders — it's entirely icon/text-based. If admin villa cards or reservation lists should show thumbnail photos, those components need to be updated to render `<img>` tags.

### Duplicate Image Opportunities

| Current Duplication | Recommendation |
|--------------------|----------------|
| `images.krib1` used as both KRiB 1 hero AND gallery index 0+4 (duplicate in same gallery) | Provide a unique 5th image for KRiB 1 (e.g., exterior, garden, or kitchen) |
| `images.morningCoffee` used for 2 different experiences ("morning-pool" + "pool-days") | Provide unique images for each experience |
| `images.sunsetGatherings` used for 2 different experiences ("weekend-bbq" + "quiet-evenings") | Provide unique images for each experience |
| `images.hero` used as homepage hero AND gallery aerial AND KRiB 1 reservation | Provide dedicated images per context |
| `images.krib2` used as KRiB 2 primary AND homepage gallery portrait AND ChooseYourStay card | Use same image is fine for card+primary, but gallery should have unique content |
| KRiB 2 gallery pads with `images.krib1Pool` (cross-villa borrow) | Provide a 5th unique KRiB 2 image |

### Recommendations for Image Optimization

1. **Format:** Deliver all images as WebP with JPG fallback. Current local assets are a mix of `.png` and `.webp`.
2. **Compression:** Target 80–85% quality for hero/full-bleed images, 75–80% for thumbnails and cards.
3. **Responsive Sizes:** Generate 3 sizes per image:
   - **Desktop:** 2560× (hero), 1200× (standard)
   - **Tablet:** 1024×
   - **Mobile:** 640×
4. **Lazy Loading:** All images below the fold already use `loading="lazy"` (Gallery, Experiences). Hero and first-visible images should remain eager-loaded.
5. **BlurHash / LQIP:** Consider adding blur placeholder hashes for the hero and villa gallery images to prevent layout shift during load.
6. **Alt Text:** Audit and finalize alt text for all images — current alt text is descriptive but should be verified against actual photography.
7. **File Naming:** Follow the suggested filenames in this document. Use lowercase, hyphen-separated, no spaces.
8. **Folder Structure:**
   ```
   public/images/
   ├── homepage/
   │   ├── hero.webp
   │   ├── about.webp
   │   ├── cta-bg.webp
   │   ├── social.webp
   │   ├── gallery-*.webp (6 images)
   │   └── exp-*.webp (5 images)
   ├── villas/
   │   ├── krib-1/
   │   │   ├── krib1-hero.webp
   │   │   ├── krib1-bedroom.webp
   │   │   ├── krib1-pool.webp
   │   │   ├── krib1-bathroom.webp
   │   │   └── krib1-exterior.webp
   │   └── krib-2/
   │       ├── krib2-hero.webp
   │       ├── krib2-living.webp
   │       ├── krib2-interior-2.webp
   │       ├── krib2-pool.webp
   │       └── krib2-dining.webp
   ├── shared/
   │   ├── reservation-krib1.webp
   │   └── reservation-krib2.webp
   └── meta/
       ├── og-image.webp
       └── twitter-card.webp
   ```
9. **CDN:** For production, consider serving images from a CDN (Cloudflare R2, AWS S3+CloudFront, or Vercel Blob) for faster global delivery.
10. **Image Sitemap:** Add an image sitemap XML for SEO discoverability of all villa photography.

---

*Generated from complete codebase audit of `src/lib/images.ts`, `src/lib/data.ts`, `src/lib/reservationData.ts`, `src/pages/`, `src/components/`, `src/admin/`, and `index.html`.*

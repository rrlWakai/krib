---
name: Heritage Sanctuary
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#404941'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#717970'
  outline-variant: '#c0c9be'
  surface-tint: '#2e6a41'
  primary: '#003b1b'
  on-primary: '#ffffff'
  primary-container: '#14532d'
  on-primary-container: '#87c695'
  inverse-primary: '#96d5a3'
  secondary: '#815520'
  on-secondary: '#ffffff'
  secondary-container: '#fdc081'
  on-secondary-container: '#784d18'
  tertiary: '#592100'
  on-tertiary: '#ffffff'
  tertiary-container: '#78350f'
  on-tertiary-container: '#ffa072'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f2be'
  primary-fixed-dim: '#96d5a3'
  on-primary-fixed: '#00210d'
  on-primary-fixed-variant: '#12512c'
  secondary-fixed: '#ffdcbc'
  secondary-fixed-dim: '#f6bb7c'
  on-secondary-fixed: '#2c1700'
  on-secondary-fixed-variant: '#663e09'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb693'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#76330d'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 80px
    fontWeight: '600'
    lineHeight: 92px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  quote:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 42px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 24px
  section-gap: 160px
---

## Brand & Style

This design system embodies the essence of "Handcrafted Luxury." The visual narrative is rooted in a boutique, editorial aesthetic that prioritizes cinematic storytelling over transactional utility. The experience should feel like flipping through a high-end architectural digest—deliberate, calm, and deeply immersive.

The style leverages **Minimalism** blended with **Editorial** layouts. We utilize generous white space (the "Ivory Canvas") to allow high-quality photography and refined typography to breathe. Compositions should favor asymmetry to create a sense of organic movement and human touch, avoiding the rigid predictability of corporate grids. The emotional response is one of immediate decompression and timelessness.

## Colors

The palette is derived from natural materials—stone, wood, and forest—set against a warm, luminous ivory base.

- **Primary (Forest Green):** Used for deep immersion, hero sections, and moments of sanctuary.
- **Secondary (Bronze):** Reserved for interactive highlights, fine details, and subtle calls to action.
- **Tertiary (Warm Wood):** Used for structural elements and tactile accents.
- **Neutral (Warm Ivory):** The primary background color to ensure the UI feels soft and welcoming rather than clinical.
- **Accents (Charcoal & Stone):** Used for high-contrast typography and utilitarian UI elements to maintain groundedness.

## Typography

The typographic scale relies on the tension between the expressive, high-contrast **Playfair Display** and the functional, understated **Inter**.

- **Display & Headlines:** Use Playfair Display. Large titles should use tighter letter-spacing to emphasize the thick-and-thin strokes of the serif.
- **Body Copy:** Use Inter with generous line-height to ensure readability and a relaxed pace.
- **Labels:** Small caps with tracking (letter spacing) are used for navigation and eyebrow headers to provide a sense of refined organization.
- **Storytelling:** Italicized serif subheads are encouraged for pull quotes and narrative descriptors.

## Layout & Spacing

This design system uses a **Fluid Grid** with wide margins to create an "art gallery" feel. 

- **Desktop:** 12-column grid with 80px outer margins. Use intentional "empty" columns to create asymmetrical balance. 
- **Section Spacing:** Vertical rhythm is extremely loose. Use a `section-gap` of 160px between major narrative blocks to prevent the interface from feeling cluttered.
- **The "Boutique" Offset:** Elements like images and text blocks should frequently overlap or be offset by one column to break the standard vertical flow.
- **Mobile:** Transition to a 4-column grid with 24px margins. Maintain vertical breathing room; do not collapse margins to save space.

## Elevation & Depth

We avoid digital shadows and artificial depth. Instead, we use **Tonal Layering** and **Materiality** to create hierarchy.

- **Flat Surfaces:** Components sit directly on the Ivory canvas or Stone-colored containers.
- **Soft Outlines:** If a boundary is needed, use 1px solid strokes in `soft_beige` or `stone_neutral`.
- **Textural Overlays:** Depth is suggested through image layering—text overlapping a high-resolution photograph creates a natural sense of foreground and background.
- **Motion-based Depth:** Use slow, subtle parallax effects on background imagery to suggest physical space.

## Shapes

The shape language is **Sharp (0)**. 

To reflect architectural precision and the "editorial" nature of the design system, we utilize 90-degree corners for all containers, buttons, and images. This creates a sophisticated, structured look that mimics high-end stationery and floor plans. 

Occasional circular elements may be used for decorative stamps or iconography, but structural UI elements must remain strictly rectangular.

## Components

- **Buttons:** Primary buttons are text-only with a 1px bottom border (link style) or solid Charcoal blocks with Ivory text. No rounded corners. Transitions should be a slow fade.
- **Cards:** Use "The Floating Card" style—no borders, no shadows. Use a slight background color shift to `soft_beige` or simply rely on image-to-text proximity.
- **Inputs:** Minimalist bottom-border-only fields. Labels use `label-caps` typography positioned above the line.
- **Navigation:** A hidden "hamburger" menu or a very sparse top bar. Use `label-caps` for links.
- **Narrative Lists:** Lists for amenities or services should include a numerical prefix (e.g., 01, 02) in a small serif font, followed by a bold Inter heading.
- **Interactive Bronze:** Use the Bronze color for hover states, small icons, and "Book Now" indicators to draw the eye without being loud.
---
name: Ethereal Glass
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 12px
  margin-mobile: 16px
  margin-desktop: 40px
  card-padding: 16px
  container-max: 1440px
---

## Brand & Style
The design system is centered on a **Dark Glassmorphism** aesthetic, optimized for high-performance productivity and deep focus. The brand personality is sophisticated, technical, and unobtrusive, acting as a serene backdrop for complex information. 

By utilizing frosted translucent layers, the UI maintains a sense of spatial depth without overwhelming the user with heavy shadows. The primary emotional response should be one of "digital calm"—a quiet, organized workspace where content feels lightweight and modern. The style combines minimalist layout principles with the tactile richness of depth-based interfaces.

## Colors
The palette is rooted in a deep, near-black neutral base (`#09090B`) to maximize contrast and reduce eye strain. Vibrant accents in blue and emerald provide functional highlights for icons and active states, while maintaining a professional "pro-tool" vibe.

Functional surfaces are not solid; they utilize semi-transparent white fills with low opacity to create the glass effect. Text colors follow a strict hierarchy of high-contrast white for primary content, medium-gray for secondary metadata, and low-opacity gray for disabled states or subtle borders.

## Typography
The typography system uses a tri-font approach to balance personality and utility. **Manrope** is used for headlines to provide a modern, slightly geometric warmth. **Inter** handles the bulk of data and body text for its legendary legibility in small-scale dark mode environments. **JetBrains Mono** is introduced for labels and metadata (like URL paths or counts) to lean into the technical, developer-centric aesthetic.

Type scales are kept tight and efficient. Large display styles are used sparingly for hero elements (like clocks), while the rest of the UI stays within a highly legible 11px-16px range to maximize information density.

## Layout & Spacing
The layout follows a **fluid grid** model with a hard max-width for desktop to ensure content remains scannable. A strict 4px spacing rhythm is applied across the system.

- **Desktop:** A multi-column approach for content categories, using a sidebar for secondary navigation and a broad grid for primary dashboard items.
- **Tablet:** Collapses sidebar into a hidden drawer; grid adjusts to 3 columns.
- **Mobile:** Single column flow with increased vertical margins (24px) to ensure touch targets are comfortable. 

Elements are grouped in high-density clusters, using gutters of 12px to maintain a compact, "cockpit" feel while preventing visual clutter.

## Elevation & Depth
In this design system, depth is achieved through **Backdrop Blurs** and **Tonal Layering** rather than traditional drop shadows.

1.  **Level 0 (Base):** Solid `#09090B`.
2.  **Level 1 (Cards/Panels):** `rgba(255, 255, 255, 0.04)` fill with a `20px` backdrop blur and a `1px` stroke of `rgba(255, 255, 255, 0.1)`.
3.  **Level 2 (Hover/Active):** `rgba(255, 255, 255, 0.08)` fill with a subtle glow or more pronounced border brightness.

This hierarchy ensures that elements appear to be floating in a 3D space of frosted glass, maintaining clarity through the blur rather than through heavy black shadows.

## Shapes
The shape language is consistently **Rounded**. A standard radius of `0.5rem` (8px) is applied to all container elements and interactive cards. This softens the technical nature of the dark theme and makes the "glass" panels feel like polished, physical objects. Small components like chips or search bars may use a higher roundedness (`rounded-lg`) to differentiate them from structural panels.

## Components
- **Glass Cards:** The core unit. Must have a 1px inner border to simulate the edge of glass. Content should be padded by 16px. Icons within cards should use vibrant, low-saturation colors to pop against the dark background.
- **Search Bar:** Centered, pill-shaped, with a `rgba(255, 255, 255, 0.05)` fill. Use a subtle search icon and `Inter` for the placeholder text.
- **Sidebar Links:** High-contrast text on hover. Use `label-sm` (Mono) for secondary tags or counts next to navigation items.
- **Buttons:** Primary buttons use the `primary_color_hex` with white text. Secondary buttons should be "ghost" style with a glass background and a 1px white-alpha border.
- **Chips/Badges:** Use a solid, low-opacity background of the accent color (e.g., `rgba(59, 130, 246, 0.2)`) and `JetBrains Mono` for the text to denote categories or counts.
- **Input Fields:** Similar to the search bar but with a sharper focus state—increasing the border opacity to `0.4` when active.
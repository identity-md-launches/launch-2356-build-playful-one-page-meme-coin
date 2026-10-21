# $DONGLE design system

## Overview

$DONGLE is a fictional robotics meme landing page. Its central visual idea is a comically small robot presented with the seriousness of an industrial engineering sheet. Oversized condensed typography, an orange robot in a yellow hard hat, measurement grids, warning labels, and a dark test bench carry the joke. The surrounding interface stays flat, spacious, and readable.

The canonical implementation is `src/styles.css`; content and interaction patterns live in `src/App.tsx`. There is one English page, one theme, and hash navigation. The source does not contain a component framework, a wallet stack, or a theme switcher.

## Colors

All color tokens are declared at the top of `src/styles.css` in hex notation.

| Token | Value | Implemented role |
| --- | --- | --- |
| `--color-bg` | `#f5f3eb` | Warm page and dialog background |
| `--color-surface` | `#eeece3` | Technical section, contract panel, neutral hover |
| `--color-ink` | `#25251f` | Primary text, structural rules, dark test bench |
| `--color-muted` | `#68685e` | Supporting copy and secondary headings |
| `--color-border` | `#d5d3c8` | Quiet section/table separators |
| `--color-accent` | `#fb661f` | Primary action fill |
| `--color-accent-hover` | `#f15e16` | Primary action hover fill |
| `--color-accent-text` | `#b8400b` | Small orange text and text-link hover |
| `--color-display-accent` | `#e95b14` | Large orange hero words |
| `--color-safety` | `#f6d345` | Warning artwork, manifesto section, test button |
| `--color-inverse` | `#f5f3eb` | Text and keyboard focus on the dark test bench |
| `--color-dark-muted` | `#b7b7a6` | Supporting text on the test bench |
| `--color-online` | `#4e6b2d` | Decorative status dot; always accompanied by text |
| `--color-focus` | `#253baf` | 3 px keyboard outline on light surfaces |

Measured solid pairs: ink/page 13.87:1, muted/page 5.07:1, muted/surface 4.76:1, large orange heading/page 3.17:1, small orange text/page 5.01:1, primary button text/fill 5.15:1, primary button text/hover 4.66:1, dark-muted/test-bench 7.58:1. Image/grid-backed artwork has not been exhaustively contrast-measured. See the validation report for measurement coverage.

## Typography

Fonts are bundled locally through `src/fonts.css` with `font-display: swap`; only WOFF2 Latin subsets are exported.

| Role | Family | Loaded weights |
| --- | --- | --- |
| Body, UI, section headings | Barlow; Arial/sans-serif fallback | 400, 600, 700 |
| Hero | Barlow Condensed; Impact/sans-serif fallback | 700 |
| Measurements and technical metadata | IBM Plex Mono; monospace fallback | 400 |

The six size tokens are `--text-small` 14 px, `--text-body` 16 px, `--text-lead` 20 px, `--text-title` 28 px, `--text-section` 56 px, and `--text-display` 112 px at the desktop base. At widths up to 1200 px, section/display become 48/104 px; up to 960 px they become 40/88 px; up to 700 px, 40/72 px; up to 370 px, 40/60 px. The probe confirmed six sizes per measured width. The two small mobile artwork stamps retain 14 px lettering during text enlargement so decorative artwork does not overflow.

Body line height is 1.5, descriptions 1.4, section headings 1.04, card headings 1.15, and the short hero lines 0.88. Hero tracking is −0.025 em; section headings −0.035 em; ordinary body copy uses natural spacing. Headings balance and permit emergency wrapping for enlarged text. Long prose has a bounded measure; figures use tabular numerals. The brief’s exact uppercase hero and CTA wording and industrial artwork are deliberate exceptions to sentence casing.

## Layout

`.shell` provides shared alignment edges with a 1280 px maximum. Desktop gutters start at 56 px per side; 1200 px and below use 40 px, 960 px and below 28 px, 700 px and below 20 px, and 370 px and below 16 px. Section spacing is 112 px, decreasing to 80 px at 960 px and 64 px at 700 px. The defined spacing steps are 8, 16, 24, 32, 48, 80, and 112 px; component geometry also uses local values where needed.

The desktop hero, story, technical sheet, and manifesto use two columns. At 700 px the hero is visually ordered as headline, explanation, mascot, then actions; the other content sections stack. The story copy precedes its blueprint on mobile. The technical table retains two readable columns, with the simulation below it. Community links become full-width rows. The contract panel wraps rather than clipping values.

The header is static. Desktop anchor links become an explicit menu at 700 px. Below 370 px, the two hero actions stack. The metric strip uses wrapping flex items below 960 px, allowing large text to form separate rows. Mobile artwork drops optional measurement annotations and its lower caption to keep the mascot clear. There is no hidden essential content or horizontally scrolling carousel.

The actual export was rendered at 320, 390, 700, 701, 768, 960, 1024, 1280, and 1440 px without horizontal overflow. At 390 × 844, the full mascot and buy control are visible; the button occupies y=659.86–715.86 px. 200% root text enlargement also reflowed without horizontal overflow. This is distinct from native browser zoom, which was not manually verified.

## Elevation & Depth

The site uses 1 px rules and tonal surfaces for structure. Ordinary panels have no decorative box shadow. The mascot has a restrained drop shadow to ground the transparent render. The modal is the only elevated UI surface: it has an 8 px radius, a soft shadow, and a dark translucent, slightly blurred backdrop. Native `dialog.showModal()` supplies the top layer and background inertness.

## Shapes

Buttons and utility panels use 4 px radii, the test bench 5 px, and dialogs 8 px. Circular status dots, the stamped conviction seal, square registration corners, and a 28 px measurement grid belong to engineering artwork. Hazard stripes appear once at the bottom of the page. Critical text and addresses remain selectable and wrap; they are not cropped or ellipsized.

## Components

These are implemented patterns, not a published component library.

| Pattern | Source | Behavior and reuse |
| --- | --- | --- |
| `Icon` / `RobotMark` | `src/icons.tsx` | Original SVGs; `Icon` takes a named symbol and optional class. UI icons inherit `currentColor` and remain decorative beside readable labels. |
| `.button.primary`, `.button.secondary`, `.spec-link` | `src/styles.css`, `src/App.tsx` | Orange main action, outlined secondary, text navigation. Minimum primary height 56 px, secondary navigation 44 px. Hover, active, focus, and disabled states are explicit. |
| Header / mobile navigation | `src/App.tsx` | Logo at the leading edge, section anchors, right-side utility/menu. Menu exposes expanded state, closes on selection or Escape, and returns focus on Escape. |
| `.artboard.grid-paper` | `src/App.tsx`, `src/styles.css` | Transparent mascot plus registration corners, grid, dimensions, and warning stamp. Responsive positioning is product-specific rather than a reusable content card. |
| `.spec-table` | `src/App.tsx` | Two-column engineering-data sheet with table/row/header/cell semantics and notes under values. |
| `.test-panel` | `src/App.tsx` | Initial, pending, completion, and repeat states. A one-second timeout drives a clearly labeled simulation; it disables repeat activation while pending and announces results through a stable status region. |
| `.factory-dialog` | `src/App.tsx` | Native modal for buy status and share/download flows. It supports Escape, backdrop dismissal, explicit Tab/Shift+Tab looping, and restoration of trigger focus. Clipboard failure reveals a labeled, selectable URL. |
| `.community-links` | `src/App.tsx` | External sharing links and a share-card action. Missing official accounts are disclosed; `src/config.ts` holds optional owner settings. |
| `.contract-inner` | `src/App.tsx` | Explicit unset address state. A supplied address wraps in full and exposes copy feedback; no guessed address is shipped. |

Motion is guarded by `prefers-reduced-motion: no-preference`. Buttons use named-property transitions of 150 ms with `cubic-bezier(.2, 0, 0, 1)` and press to 0.96 scale. Mascot hover uses 300 ms. The piston runs four brief 250 ms movements only after activation. There is no autoplay or endless animation. Reduced motion keeps the same textual state changes with no graphical motion.

## Do’s and don’ts

- Start a new section with `.shell` and `.section-space`, and reuse the six type roles and existing semantic colors.
- Keep the strongest action orange, with supporting actions neutral. On dark panels, use the inverse focus outline.
- Keep jokes in the marketing copy and technical fiction; keep purchase availability and clipboard errors plain and truthful.
- Preserve the helmeted orange mascot, shared alignment edges, and restrained engineering artwork. Avoid competing gradients, glows, tickers, or nested cards.
- Add another page only with a static entry or hash navigation, reuse `Icon`/`RobotMark` and existing primitives, then check its narrow layout, keyboard path, and production export. Do not introduce server-dependent routes or fabricated launch data.

Design guidance: Jakub Krehel’s Better Interface (MIT), with documentation guidance adapted from Paul Bakaus’s Impeccable (Apache-2.0). Exact revisions and license notices are retained in `THIRD_PARTY.md` and `licenses/design-guidance.txt`.

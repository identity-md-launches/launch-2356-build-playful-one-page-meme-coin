# $DONGLE factory

A one-page landing site for a fictional robotics meme project. Small shaft. Massive torque.

The finished static site is in **`dist/`**, alongside the React + TypeScript source and npm lockfile. Vite uses `base: './'`; the export works at a static-hosting subpath with hash navigation. All fonts, illustrations, icons, and share-card assets are local. No backend, wallet, RPC, API key, or runtime CDN is required.

## Install, develop, preview, rebuild

Use Node.js 22.12 or newer. This build was checked with Node 22.23.2 and npm 10.9.8.

```sh
npm ci
npm run dev
```

To regenerate and serve the production export:

```sh
npm run typecheck
npm run build
npm run preview
```

Open the HTTP address printed by Vite. Serve `dist/` as a directory; opening `index.html` directly with a `file:` URL does not provide the module-loading behavior of a web server. Keep the complete `dist/` directory in the submission when rebuilding. Hosting and publication are outside this deliverable.

## What works

- Responsive anchor navigation and a mobile menu with Escape support.
- `BUY $DONGLE` opens a keyboard-accessible launch-status dialog. The supplied project is fictional, so it truthfully explains that no token or purchase is available and links to the contract placeholder.
- The technical-specs action reaches the specification sheet. Its one-second actuator simulation has pending, completed, and repeat-run states, announced through a status region.
- X and Telegram links open their actual sharing flows with this page’s URL. They are explicitly described as share links, rather than invented official accounts.
- The share dialog downloads the local 1200 × 630 PNG and copies the page URL. If clipboard permission is unavailable, it provides a selectable text field.
- Focus loops inside dialogs and returns to the trigger on dismissal. Reduced motion removes graphical animation while retaining status feedback.

## Owner-settable placeholders

`src/config.ts` deliberately leaves `contractAddress`, `buyUrl`, `xUrl`, and `telegramUrl` as `null`. No addresses or accounts were invented. These are optional future settings, not credentials. A purchase link appears only when both a real contract address and a real buy URL are supplied. Review all fictional/pre-launch copy before turning this concept into an actual launch. The delivered default has no transaction or wallet flow.

## Validation

```sh
npx playwright install chromium webkit
npm run typecheck
npm run build
npm run validate
```

`scripts/validate.mjs` serves the actual export under `/preview/` in a bounded local process and closes its browser/server afterward. Browser results and disposable screenshots go to `test/scratch/validation/`.

Actual results for the delivered export:

| Check | Result |
| --- | --- |
| Production build | Passed, Vite 7.3.7 |
| Typecheck | Passed, `tsc --noEmit` |
| Chromium interaction/reflow checks | 21 passed |
| Responsive widths | 320, 390, 700, 701, 768, 960, 1024, 1280, 1440 px; no horizontal overflow |
| First screen at 390 × 844 | Mascot and primary action both visible; buy button ends at 715.86 px |
| Automated accessibility | No reported violations at 390/1440 px and in the buy dialog; not a full accessibility certification |
| Pinned taste@1 design probe | 14/16 passed; capitals and slogan-density exceptions retained for the explicit brief |
| WebKit | Attempted; unavailable because required system libraries were missing |

The pinned probe was run with `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste`. Its inputs are assignment-provided and removed from delivery. The retained results are in [artifacts/design-probe.json](artifacts/design-probe.json).

The six-domain review, fixes, evidence, and honest coverage limits are in [artifacts/validation.md](artifacts/validation.md). Raw interaction results are in [artifacts/interaction-results.json](artifacts/interaction-results.json). Physical devices, assistive-technology screen readers, native browser zoom, and live social-platform unfurls were not tested. 200% text enlargement was checked separately and passed.

View [the desktop page](artifacts/screenshots/desktop-full.webp), [the mobile page](artifacts/screenshots/mobile-full.webp), and [the first mobile screen](artifacts/screenshots/mobile-first-screen.webp).

## Source and design

- `src/App.tsx`: page content, accessible dialogs, sharing, simulation.
- `src/styles.css`: implemented tokens, layout, component states, motion, breakpoints.
- `src/fonts.css`: local WOFF2 font declarations, supplied through Fontsource dependencies.
- `src/config.ts`: explicitly unset owner settings.
- `src/assets/dongle.webp`: custom generated, alpha-transparent mascot.
- `public/`: favicon and ready-to-share PNG, copied into `dist/` at build time.
- [DESIGN.md](DESIGN.md): final design system and responsive behavior.
- [artifacts/ASSETS.md](artifacts/ASSETS.md): asset provenance and complete generation prompt.
- [THIRD_PARTY.md](THIRD_PARTY.md): third-party credits and license locations.

## Submission size and ignore budget

The export, complete source, lockfile, documentation, licenses, and selected evidence are retained. No dependency archive, registry mirror, source map, cache, or submodule is required. The final byte inventory is in [artifacts/package-inventory.json](artifacts/package-inventory.json); the complete delivered file set is below the 8 MiB limit.

The explicit `.gitignore` path budget is limited to `**/node_modules/` (installed dependencies, zero submitted bytes), `**/.vite/` (generated Vite caches, zero submitted bytes), and `/test/scratch/` (disposable verification work, zero submitted bytes). `dist/` is deliberately included. npm caches and browser downloads used for verification were kept outside the repository.

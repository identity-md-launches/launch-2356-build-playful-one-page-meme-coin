# $DONGLE — just a test token

$DONGLE was **just a TEST TOKEN, launched only to test the platform**. The site makes that explicit in the hero, every major section, both information/share dialogs, the intro video, social text and share image. Purchase controls and the launch-platform link have been removed. The supplied Solana mint address remains visible for reference.

The complete static export is in **dist/** alongside the React/TypeScript source and unchanged npm lockfile. Vite's existing `base: './'` gives relative asset URLs for static hosting and gateway subpaths. Navigation uses hashes. Fonts, artwork, video and the share image are bundled locally.

## Install, develop, preview and rebuild

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

To check and rebuild the production export:

```sh
npm run typecheck
npm run build
npm run preview
```

Open the HTTP address printed by Vite. Serve the complete `dist/` directory over HTTP; do not open its index with a `file:` URL. Publication is outside this revision.

## Interactions

- “Read the test-token notice” opens an accessible dialog with the existing mint and an internal action to view its reference section.
- The original 11-second film opens once per session, can be closed or replayed, and now carries a test-token notice in every frame. It is muted, has native controls, and opens paused for reduced motion.
- The mobile menu and section links navigate within the page.
- The fictional torque simulation keeps its pending, completed and repeat states.
- X and Telegram share the test-token notice and current page URL. These are sharing tools, not official account links.
- The share dialog downloads the updated local PNG and copies the page URL, with a selectable text fallback if clipboard access fails. The existing mint also has a copy control.

## Validation of this revision

```sh
npx playwright install chromium webkit
npm run validate
```

The browser installation is setup for a fresh environment, not a production dependency. If a compatible Chromium is already installed, `CHROMIUM_PATH` can select its executable. The validation script serves the actual export under `/preview/`, exercises it, then closes its own server and browser. Disposable output goes to `test/scratch/validation/`.

Actual final results:

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed, `tsc --noEmit` |
| `npm run build` | Passed, Vite 7.3.7 |
| Chromium interaction checks | 26/26 passed |
| Reflow | No horizontal overflow at 320, 390, 700, 701, 768, 960, 1024, 1280 and 1440 px |
| First screen at 390 × 844 | Product notice and action visible; page action ends at y=424.86 px; mascot ends at y=761.86 px |
| Automated accessibility | No violations reported in the intro/notice dialogs or at 390/1440 px |
| Console/resources | No page errors or failing resources observed |
| Pinned taste@1 | 13/16 on the fresh intro screen; 14/16 with the film dismissed |
| WebKit | Attempted; browser executable unavailable |

The pinned probe was run against `dist/` with offline requests enabled, at 320, 390 and 1440 px. A temporary adapter selected the available Chromium without changing the pinned script. A supplemental run seeded the same session flag that dismissing the film sets. Its remaining casing/repetition flags follow the explicit request for big, bold notices everywhere. The fresh-screen layout flag compares native modal controls with the intentionally inactive page behind the backdrop; the dismissed page passes layout. Full evidence and dispositions are in [artifacts/validation.md](artifacts/validation.md), [interaction results](artifacts/interaction-results.json) and [probe results](artifacts/design-probe.json).

Physical devices, screen readers, browser-native zoom, WebKit, live social posting/unfurls and browser animation-panel slow playback were not verified. A separate 200% root-text enlargement check passed. Automated scans are not a full accessibility certification.

See the [mobile first screen](artifacts/screenshots/mobile-first-screen.webp), [mobile page](artifacts/screenshots/mobile-full.webp), [desktop page](artifacts/screenshots/desktop-full.webp) and [intro film](artifacts/screenshots/mobile-film.webp).

## Source and assets

- `src/App.tsx`: page, shared `TestNotice`, dialogs, navigation, copying and simulation.
- `src/styles.css` / `src/fonts.css`: design tokens, responsive styles and local fonts.
- `src/config.ts`: the supplied test-token identity; no launch-platform URL.
- `public/`: favicon, updated share PNG and both video formats with poster.
- `scripts/render-share.mjs`: regenerate the 1200 × 630 PNG with `node scripts/render-share.mjs`.
- `scripts/render-film.mjs` and `scripts/film/film.html`: regenerate the video/poster with `node scripts/render-film.mjs`; requires Chromium and ffmpeg, uses temporary frames outside the repository.
- [DESIGN.md](DESIGN.md): implemented design system.
- [Asset notes](artifacts/ASSETS.md) and [THIRD_PARTY.md](THIRD_PARTY.md): provenance and licenses.

Both rendering scripts support `CHROMIUM_PATH`. Generated runtime assets are already included; normal `npm run build` does not need to regenerate them.

## Delivery size

[artifacts/package-inventory.json](artifacts/package-inventory.json) records the submitted file inventory, excluding assignment inputs and disposable tests. The source, lockfile, runtime assets, complete export and selected evidence fit within 8 MiB. Ignore rules exclude dependency/cache directories and `test/scratch/`. An explicit inclusion budget of 1,048,576 bytes covers `artifacts/*.md`, `artifacts/*.json` and selected `artifacts/screenshots/*.webp` so the linked review evidence is delivered. No dependency archive, registry mirror or submodule is included.

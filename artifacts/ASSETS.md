# Runtime asset notes

The orange helmeted robot (`src/assets/dongle.webp`), SVG icon/robot mark source (`src/icons.tsx`), favicon, and industrial visual system were supplied in the existing project. This revision retains that artwork; it did not commission a replacement mascot. The original image-generation prompt was not present in the supplied project, so no prompt is reconstructed here.

`public/images/dongle-share.png` is a newly rendered 1200 × 630 card combining the existing robot, locally loaded Barlow fonts and the explicit test-token notice. Its complete reproducible layout is in `scripts/render-share.mjs`.

The existing 11-second robot film has been re-rendered from `scripts/film/film.html` with a persistent yellow test-token notice and updated final title. `scripts/render-film.mjs` renders deterministic frames with Chromium and encodes silent 720 × 720 MP4/WebM files with ffmpeg; frames remain outside the repository. Both formats and the WebP poster remain delivered in `public/media/` and `dist/media/`.

The font files are Latin WOFF2 subsets from the unchanged, locked Fontsource dependencies. Runtime images, fonts and videos are local; no remote media service is required. License notices are retained under `licenses/` and described in `THIRD_PARTY.md`.

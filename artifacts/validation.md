# Validation and design review

## Scope and requirements

This revision modifies the existing one-page $DONGLE site. The main message is that it was just a test token launched only to test the platform. The robot, fictional specifications, one-second simulation, supplied mint and video are retained. All purchase controls and the platform destination have been removed. No on-chain action, wallet, backend, deployment or social posting was performed.

| Requirement | Final result and evidence |
| --- | --- |
| “big bold letters everywhere” about the test token | Met: hero, five content sections, footer, notice/share dialogs, film header and every video frame, share card, social copy and metadata. Section warnings are 28 px / 700; hero is 72 px at 390. |
| “remove the link … to the platform” | Met: URL/settings removed from `src/config.ts`; all rendered link destinations checked against internal anchors, local image and X/Telegram sharing endpoints. No buy button remains. |
| Usable, responsive primary interactions | Met: 26 Chromium checks; nine reflow widths; navigation, dialogs, clipboard success/failure, download, simulation and video flows. |
| `dist/index.html`, local assets, relative URLs, source and lockfile | Met: production export rebuilt with the existing `base: './'`; validation served `/preview/` successfully. Manifest and lockfile unchanged. |
| Production build, typecheck and useful interaction checks | Met: final typecheck/build exit 0; final validation exit 0. Raw results retained. |
| Better Interface and six-domain review | Met for the stated revision scope; coverage, findings and unperformed checks below. |
| First screen at 390, title/favicon/description/OG title and image | Met in both the fresh intro and dismissed page; screenshots and probe share check. |
| Root design documentation and install/preview/rebuild instructions | Met: `DESIGN.md` and `README.md`, updated to the final implementation. |

Visual idea: an industrial robot specification sheet whose dominant message is a repeated test-token disclosure.

## Executed verification

- `npm ci --cache /tmp/dongle-npm-cache --no-audit --no-fund`: succeeded using the existing lockfile.
- `node scripts/render-share.mjs` and `node scripts/render-film.mjs`, with `CHROMIUM_PATH` selecting the available browser: succeeded. Video rendering produced 330 frames and silent MP4/WebM plus a poster; temporary frames stayed outside the repository.
- Final `npm run typecheck`: exit 0 (`tsc --noEmit`).
- Final `npm run build`: exit 0 (Vite 7.3.7, 33 modules). This ran after the last source change. Documentation/evidence additions do not change the export.
- Final `npm run validate`, using the available Chromium: exit 0; **26/26 passed**. See [interaction-results.json](interaction-results.json).
- `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste --offline`, with `IMD_PLAYWRIGHT` pointing at a temporary adapter selecting available Chromium: exit 0; **13/16 check flags pass**. This is the unmodified pinned probe on a fresh session, including its intro modal. The process exit code alone does not mean every check passed.
- A supplemental run of the same probe wrote `test/scratch/taste-main`, using an adapter that seeds `dongle-film-seen=1`, the value actual dismissal sets: **14/16 pass**, including layout. Both results are preserved in [design-probe.json](design-probe.json).
- Supplied browser tool: inspected the production preview at 390 and 1440, viewed screenshots, walked Skip → Enter → Tab → Enter to open the notice using the keyboard, inspected its name/heading/focus ring, and dismissed with Escape. Checked loaded font faces, link destinations, warning/background colors and console/network output. No warnings/errors; local resources loaded successfully, including video range responses.

The default Playwright browser download setup did not complete, so compatible installed Chromium was selected explicitly. WebKit launch was attempted and reported **browser executable unavailable**; it was not represented as a passed check.

The first validation attempt exposed a harness race: native dialog `close` events run after the dialog hides. `scripts/validate.mjs:65` now waits for the actual session flag before asserting persistence. The final run passed the dismissal/reload behavior. An initial film-render attempt found the response-header issue described below; it was fixed and the film fully regenerated.

## Interaction and layout evidence

Reflow passed at **320, 390, 700, 701, 768, 960, 1024, 1280 and 1440 CSS px**. At 390 × 844, the main page notice action is x=20, y=368.86, width=350, height=56; the complete mascot ends at y=761.86. In the fresh film dialog, the Read and Skip actions end at y=716.39. Both states expose the product and main action on the first screen.

The suite exercises menu open/anchor/Escape/focus return; notice Tab containment, close/Escape/focus return and mint navigation; simulation initial/pending/completed/repeat states; actual mint and URL clipboard readback; denied clipboard recovery; share PNG download; encoded social share text/URL; film intro, reduced-motion pause, autoplay, backdrop dismissal, replay, Skip, close and notice handoff. The supplied mint is unchanged: `7i5fZty1GFryS5ZWqUFRPstfiQDhvNmoFjwaTqb5w1q7`.

Axe scans reported zero violations in the intro dialog, notice dialog, and page at 390/1440. The root-text enlargement check at 200% passed independently of viewport reflow. These are bounded automated checks, not a claim of complete accessibility conformance.

Viewed final evidence:

- [Mobile first screen](screenshots/mobile-first-screen.webp) and [mobile full page](screenshots/mobile-full.webp).
- [Desktop full page](screenshots/desktop-full.webp).
- [Mobile intro film](screenshots/mobile-film.webp) and [notice dialog](screenshots/notice-dialog.webp).
- [Dark-panel keyboard focus](screenshots/testbench-focus.webp).
- The actual share PNG and film poster, confirming the baked-in test-token message.

## Better Interface coverage

The pinned workflow, all six core domains and final design-document method were read and applied during construction. Existing Barlow typography, semantic hex tokens, shared shells and industrial artwork were reused.

| Domain | Status | Coverage and limits |
| --- | --- | --- |
| Accessibility | Checked | Native links/buttons/dialog, heading order, labels, skip link, keyboard opening/dismissal/containment/focus return, visible focus in the notice and dark panel, status text, reduced motion, targets and Axe scans. Screen-reader sessions and forced-colors rendering not performed. |
| Layout | Checked | Shared edges, notice grouping, mobile action before artwork, nine reflow widths, full mobile/desktop screenshots, modal fit and 200% root-text enlargement. Native browser zoom and RTL mirror not verified; the site is English only. |
| Writing | Checked | Plain launch-status explanation, verb-led internal actions, truthful existing mint, explicit fictional simulation, consistent clipboard errors and test context in share text. No claim of an official social account or future launch. |
| Typography | Checked | Six computed size steps at 390/1440, three families and three weights; all five local font faces loaded. Notice wrapping, long mint wrapping, readable dialog copy and first-screen hierarchy inspected. No translation expansion test; no localization is implemented. |
| Colors | Checked | Existing role tokens retained; measured solid pairs below and automated contrast checks pass. Contrast against video/image/grid pixels was not exhaustively measured; no second theme exists. |
| UI details | Checked | Primary/secondary/disabled/pending/completed/error states, native media controls, modal surfaces, SVG icons, clipboard recovery, 150 ms named-property transitions and reduced-motion guards reviewed. Browser Animations-panel playback at 10% speed was not performed. |

Measured browser-computed pairs: notice ink/page **13.87:1**, notice ink/technical surface **13.02:1**, notice ink/yellow **10.51:1**, muted/page **5.07:1**, large orange hero/page **3.17:1**, primary text/fill **5.15:1**, primary text/hover **4.66:1**, dark supporting text/panel **7.58:1**. The large orange display meets its 3:1 threshold; measured ordinary text meets 4.5:1. The probe leaves 27 fresh-screen and 19 dismissed-screen image/video/grid text boxes unmeasured.

## Findings, corrections and dispositions

### High — purchase promotion contradicted the requested test status (fixed)

Source: `src/App.tsx:195`, `src/App.tsx:318`, `src/config.ts:1`; final snippets: `Read the test-token notice`, `Just a test token.`, and no buy URL property.

Now: the former buy dialog/control and trading destination are replaced by a bold test notice and an internal mint-reference action.
Change: removed the platform URL, purchase branch, stale pre-launch fallback copy and trading instructions; retained the exact supplied mint.
Why: the request explicitly identifies a test token and asks to remove the platform link.

Reproduction/evidence: at 390 or 1440, open the hero/film notice; inspect all hrefs. The disclosure/link validation and all notice interactions pass, with no outbound destination inside the notice.

### High — shared media could lose the test-token context (fixed)

Source: `src/App.tsx:19`, `src/App.tsx:38`, `src/App.tsx:326`, `scripts/film/film.html:31`, `scripts/render-share.mjs:1`, `index.html:8`.

Now: the same message covers every major content section, footer, dialogs, shared text, social card, metadata and every video frame.
Change: added shared 28 px/700 notices, bold 20 px explanations, a large hero, and updated both video formats and card.
Why: “big bold letters everywhere” applies to visitors who enter through the intro or share image too.

Reproduction/evidence: inspect the mobile/desktop full pages, film, poster and downloaded PNG. The explicit per-section size/weight and social-text assertions pass. Requested repetition and uppercase are retained intentionally.

### Medium — mobile action followed the artwork (fixed)

Source: `src/styles.css:391`; final snippets: `.hero-visual { grid-row: 4; }`, `.hero-actions { grid-row: 3; }`.

Now: the notice action precedes the mascot at widths up to 700.
Change: reused the hero grid and stacked actions within the existing gutters.
Why: the product message and main action must be present on the first 390 px screen.

Reproduction/evidence: 390 × 844 screenshot and bounding-box check show action ending at y=424.86; the full robot remains visible. All nine reflow widths pass.

### Medium — slogan clutter weakened the warning hierarchy (fixed)

Source: `src/App.tsx:201`, `src/App.tsx:248`, `src/App.tsx:255`, `src/App.tsx:310`.

Now: secondary promotional taglines are replaced by short test-context or fictional-specification copy. The redundant actuator annotation that overlaid the desktop robot was deleted; the mascot fills the same artboard without an empty content column.
Change: removed competing filler and reused existing text sizes and layout.
Why: status clarity and readable first-screen content take precedence while retaining the robot's established visual identity.

Reproduction/evidence: compare final desktop/mobile screenshots; the supplemental probe now passes slogan density with three measured two-beat lines, and both probes pass copy budget, type sizes, tracking and eyebrow checks.

### Low — missing film-render resource caused a header error (fixed)

Source: `scripts/render-film.mjs:22`; final snippet: `const data = await readFile(file); res.writeHead(200, ...).end(data);`.

Now: files are read before success headers are sent, so a missing resource can return 404 without `ERR_HTTP_HEADERS_SENT`.
Change: reordered the existing file response; no rendering dependency changed.
Why: the film had to be regenerated with the notice intact.

Reproduction/evidence: reran the complete renderer successfully; generated 330 frames, MP4, WebM and poster, then rebuilt and played the delivered video.

### Probe layout flag — native modal over inactive background (dismissed)

Source: `src/App.tsx:324`, native `dialog.showModal()` at `src/App.tsx:92`.

The fresh-session probe flags four modal controls over the dimmed page behind the native backdrop. Screenshots confirm the controls are inside the readable dialog, with no foreground text collision. This is expected modal composition, not a floating control obscuring active content. The actual dismissed-page supplemental probe passes layout, as do all reflow checks. The warning and both film actions fit at 390 × 844. No source change was needed.

### Probe casing and repetition flags — explicit request (retained)

Source: `src/App.tsx:20`, `src/App.tsx:195`, `src/App.tsx:326`; final snippet: `JUST A TEST TOKEN`.

The request says “big bold letters everywhere.” Uppercase notices and repeated explanations implement that direction. Existing engineering-art lettering also remains part of the prior visual identity. These are disclosed exceptions to the house bar, not unreported probe passes. All other applicable probe categories pass on the dismissed page.

## Limitations and completion

WebKit could not launch because its executable was unavailable. Physical iOS/Android devices, assistive-technology screen readers, native browser zoom, RTL, forced-colors rendering, live social-platform posting/unfurls, and animation-panel slow playback were not tested. Browser snapshots are not screen-reader tests. The site does not implement themes, forms, localization, wallets or transaction states, so those feature-specific checks are not applicable.

**Complete for the stated scope**, with these browser/platform coverage limitations. This is the worker's report of local checks, not independent verification. Source, required assets, export, license notices and selected evidence are retained within the package limit. `.gitignore` explicitly includes the review Markdown/JSON and selected WebP screenshots under a 1,048,576-byte artifacts budget, overriding a local metadata exclusion without editing Git metadata; no publishing command was run.

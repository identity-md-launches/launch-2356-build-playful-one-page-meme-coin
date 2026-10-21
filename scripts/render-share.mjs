import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

// Rebuild the local social/download image from the existing art and locked fonts.
const data = async (file, mime) => `data:${mime};base64,${(await readFile(file)).toString('base64')}`;
const display = await data('node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2', 'font/woff2');
const body = await data('node_modules/@fontsource/barlow/files/barlow-latin-700-normal.woff2', 'font/woff2');
const robot = await data('src/assets/dongle.webp', 'image/webp');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="UTF-8"><style>
    @font-face { font-family: Display; font-weight: 700; src: url('${display}') }
    @font-face { font-family: Body; font-weight: 700; src: url('${body}') }
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; background: #f5f3eb; color: #25251f; font-family: Body, sans-serif; font-weight: 700; }
    body::before { content: ''; position: absolute; inset: 0 0 auto; height: 16px; background: repeating-linear-gradient(-50deg, #25251f 0 16px, #f6d345 16px 32px); }
    main { position: relative; height: 100%; padding: 48px 56px; }
    h1 { font: 700 60px/1 Display, sans-serif; margin-bottom: 28px; }
    h2 { font: 700 120px/.94 Display, sans-serif; letter-spacing: -.02em; }
    h2 span { color: #b8400b; }
    p { max-width: 650px; font-size: 30px; line-height: 1.4; margin-top: 28px; }
    img { position: absolute; right: 10px; top: 86px; width: 450px; height: auto; }
    footer { position: absolute; inset: auto 56px 32px; border-top: 2px solid #25251f; padding-top: 16px; font-size: 20px; }
  </style></head><body><main><h1>$DONGLE</h1><h2>JUST A<br><span>TEST TOKEN.</span></h2><p>Launched only to test the platform.</p><img src="${robot}" alt="Dongle, the orange robot wearing a yellow helmet"><footer>TEST TOKEN · PLATFORM TESTING ONLY</footer></main></body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await document.querySelector('img').decode(); });
  await page.screenshot({ path: 'public/images/dongle-share.png' });
  console.log('Wrote public/images/dongle-share.png (1200 × 630)');
} finally {
  await browser.close();
}

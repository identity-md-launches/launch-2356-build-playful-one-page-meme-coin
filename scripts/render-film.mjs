import { createServer } from 'node:http';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

// Renders scripts/film/film.html frame by frame from the existing mascot art, then encodes it with ffmpeg.
// Usage: node scripts/render-film.mjs [--frames-only] [--at seconds]
// CHROMIUM_PATH may point at an installed Chromium when Playwright's own download is unavailable.
const root = resolve('.');
const fps = 30;
const out = resolve('public/media');
const frames = join(tmpdir(), 'dongle-film-frames');
const args = process.argv.slice(2);
const at = args.includes('--at') ? Number(args[args.indexOf('--at') + 1]) : null;
const mime = { '.html': 'text/html', '.webp': 'image/webp', '.woff2': 'font/woff2' };

const server = createServer(async (req, res) => {
  const file = resolve(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1));
  if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try { res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }).end(await readFile(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 720, height: 720 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/scripts/film/film.html`);
  await page.evaluate(async () => { await document.fonts.ready; await document.getElementById('robot').decode(); });
  const stage = page.locator('#stage');
  if (at !== null) {
    await page.evaluate((t) => window.render(t), at);
    await stage.screenshot({ path: join(tmpdir(), `dongle-film-${at}.png`) });
    console.log(join(tmpdir(), `dongle-film-${at}.png`));
  } else {
    await rm(frames, { recursive: true, force: true });
    await mkdir(frames, { recursive: true });
    const total = Math.round((await page.evaluate(() => window.DURATION)) * fps);
    for (let i = 0; i < total; i++) {
      await page.evaluate((t) => window.render(t), i / fps);
      await stage.screenshot({ path: join(frames, `${String(i).padStart(4, '0')}.png`) });
    }
    console.log(`Rendered ${total} frames to ${frames}`);
  }
} finally {
  await browser.close();
  server.close();
}

if (at === null && !args.includes('--frames-only')) {
  await mkdir(out, { recursive: true });
  const ffmpeg = (list) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...list], { stdio: 'inherit' });
  ffmpeg(['-framerate', String(fps), '-i', join(frames, '%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', join(out, 'dongle-film.mp4')]);
  ffmpeg(['-framerate', String(fps), '-i', join(frames, '%04d.png'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '40', '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', join(out, 'dongle-film.webm')]);
  ffmpeg(['-i', join(frames, `${String(Math.round(9.5 * fps)).padStart(4, '0')}.png`), '-c:v', 'libwebp', '-quality', '80', join(out, 'dongle-film-poster.webp')]);
  console.log(`Wrote the MP4, WebM and poster to ${out}`);
}

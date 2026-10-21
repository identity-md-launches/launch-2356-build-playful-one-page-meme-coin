import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

// Checks the real production export at a static-hosting subpath. No development server.
const output = resolve('test/scratch/validation');
await mkdir(output, { recursive: true });
const root = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith('/preview/')) { res.writeHead(404).end(); return; }
    const file = resolve(root, pathname.slice('/preview/'.length) || 'index.html');
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const url = `http://127.0.0.1:${server.address().port}/preview/`;
const results = { checks: [], limits: [], pageErrors: [], resourceErrors: [], accessibility: [] };
let browser;

async function check(name, task) {
  console.log(`Checking: ${name}`);
  try { const detail = await task(); results.checks.push({ name, passed: true, detail }); }
  catch (error) {
    results.checks.push({ name, passed: false, detail: error.message });
    console.log(error.message);
    for (const context of browser?.contexts() ?? []) {
      for (const page of context.pages()) await page.evaluate(() => document.querySelector('dialog[open]')?.close()).catch(() => {});
    }
  }
  console.log(`${results.checks.at(-1).passed ? 'PASS' : 'FAIL'}: ${name}`);
}

try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', (error) => results.pageErrors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) results.resourceErrors.push(`${response.status()} ${new URL(response.url()).pathname}`); });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);

  for (const width of [320, 390, 700, 701, 768, 960, 1024, 1280, 1440]) {
    await check(`Static subpath and reflow at ${width}px`, async () => {
      await page.setViewportSize({ width, height: width < 701 ? 844 : 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      assert(await page.locator('.hero-robot').evaluate((img) => img.complete && img.naturalWidth > 0));
      const metrics = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      assert(metrics.content <= metrics.viewport, JSON.stringify(metrics));
      return metrics;
    });
    if ([320, 390, 768, 1440].includes(width)) {
      await page.screenshot({ path: `${output}/${width}-full.webp`, fullPage: true, type: 'webp', quality: 80 });
      await page.screenshot({ path: `${output}/${width}-first.webp`, type: 'webp', quality: 85 });
    }
  }

  await check('390px first screen includes product and primary action', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    const box = await page.getByRole('button', { name: 'BUY $DONGLE' }).boundingBox();
    const robotBox = await page.locator('.hero-robot').boundingBox();
    assert(box && box.y >= 0 && box.y + box.height <= 844, `Buy action: ${JSON.stringify(box)}`);
    assert(robotBox && robotBox.y >= 0 && robotBox.y + robotBox.height <= 844);
    return { buy: box, mascot: robotBox };
  });

  await check('Mobile navigation opens, follows anchors and closes', async () => {
    const menu = page.locator('#menu-toggle');
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'The story' }).click();
    assert.equal(new URL(page.url()).hash, '#story');
    assert.equal(await page.locator('#mobile-nav').count(), 0);
    await menu.click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#mobile-nav').count(), 0);
    assert(await menu.evaluate((el) => el === document.activeElement));
    return 'Anchor navigation, expanded state, Escape and focus return passed.';
  });

  await check('Buy flow is honest, modal traps focus and Escape restores trigger', async () => {
    const buy = page.getByRole('button', { name: 'BUY $DONGLE' });
    await buy.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    assert.match(await dialog.innerText(), /No token has launched and no purchase is available/);
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      assert(await dialog.evaluate((el) => el.contains(document.activeElement)));
    }
    await page.screenshot({ path: `${output}/buy-dialog.webp`, type: 'webp', quality: 85 });
    const axe = await new AxeBuilder({ page }).analyze();
    results.accessibility.push({ state: 'buy dialog', violations: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map((n) => n.target) })) });
    assert.equal(axe.violations.length, 0, JSON.stringify(results.accessibility.at(-1)));
    await page.keyboard.press('Escape');
    assert(await buy.evaluate((el) => el === document.activeElement));
    await buy.click();
    await dialog.getByRole('button', { name: 'Check contract status' }).click();
    assert.equal(new URL(page.url()).hash, '#contract');
    assert(await page.getByRole('heading', { name: 'Check the serial number.' }).evaluate((el) => el === document.activeElement));
    assert.match(await page.locator('#contract').innerText(), /No token has been deployed/);
    assert.equal(await page.locator('#contract code').count(), 0);
    return 'No fabricated contract or transaction; modal, focus trap, dismissal and status navigation passed.';
  });

  await check('Technical specs anchor and simulation pending, success and repeat states', async () => {
    await page.getByRole('link', { name: 'READ THE TECHNICAL SPECS' }).click();
    assert.equal(new URL(page.url()).hash, '#specs');
    const run = page.getByRole('button', { name: 'Run a torque test' });
    await run.click();
    assert(await page.getByRole('button', { name: 'Running simulation…' }).isDisabled());
    await page.getByText('Test complete. 2 mm traveled. Ego unchanged.').waitFor();
    assert.match(await page.locator('.test-readout').innerText(), /2.00/);
    await page.getByRole('button', { name: 'Run it again' }).click();
    await page.getByText('Mountains moved: 0. Confidence: still 9,000 RPM.').waitFor();
    assert.equal(await page.locator('.test-panel [role="status"]').count(), 1);
    return '1 second simulation; button prevents duplicate runs and announces the result.';
  });

  await check('Share links carry page URL and use real platform share endpoints', async () => {
    const x = new URL(await page.getByRole('link', { name: /Spread the word on X/ }).getAttribute('href'));
    const telegram = new URL(await page.getByRole('link', { name: /Send it to the group chat/ }).getAttribute('href'));
    assert.equal(x.host, 'twitter.com'); assert.equal(x.pathname, '/intent/tweet');
    assert.equal(telegram.host, 't.me'); assert.equal(telegram.pathname, '/share/url');
    assert.equal(x.searchParams.get('url'), url); assert.equal(telegram.searchParams.get('url'), url);
    return 'Destinations and encoded current URL verified; no fabricated social handles.';
  });

  await check('Share card download, clipboard success and fallback', async () => {
    await page.getByRole('button', { name: /Take a little confidence/ }).click();
    const dialog = page.getByRole('dialog');
    assert(await dialog.locator('img').evaluate((img) => img.complete && img.naturalWidth === 1200));
    const downloadPromise = page.waitForEvent('download');
    await dialog.getByRole('link', { name: 'Download share card' }).click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'dongle-small-shaft-massive-torque.png');
    assert.equal(await download.failure(), null);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await dialog.getByRole('button', { name: 'Copy page link' }).click();
    await dialog.getByText('Factory link copied. Send in the crew.').waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), url);
    await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('Permission denied'); } }));
    await dialog.getByRole('button', { name: 'Copy page link' }).click();
    await dialog.getByText('Clipboard unavailable. Select and copy the text below.').waitFor();
    assert.equal(await dialog.getByRole('textbox', { name: 'Page link to copy' }).inputValue(), url);
    await page.screenshot({ path: `${output}/share-dialog.webp`, type: 'webp', quality: 85 });
    await page.keyboard.press('Escape');
    return '1200 × 630 local PNG downloads; real clipboard readback and denied-permission recovery passed.';
  });

  for (const width of [390, 1440]) {
    await check(`Automated accessibility scan at ${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      results.accessibility.push({ state: `${width}px page`, violations: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map((n) => n.target) })) });
      assert.equal(axe.violations.length, 0, JSON.stringify(results.accessibility.at(-1)));
      return `${axe.passes.length} rules passed; no automated WCAG A/AA violations.`;
    });
  }

  await check('Reduced motion stops graphical animation', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Run it again' }).click();
    const animations = await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length);
    assert.equal(animations, 0);
    await page.getByText('USB connection failed. Blaming the USB port.').waitFor();
    return 'Simulation still provides text feedback with zero running animations.';
  });

  await check('Primary hover contrast and inverse-panel keyboard focus', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url);
    const buy = page.getByRole('button', { name: 'BUY $DONGLE' });
    await buy.hover();
    const ratio = await buy.evaluate((el) => {
      const luminance = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => v / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      const style = getComputedStyle(el);
      const colors = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
      return (colors[0] + .05) / (colors[1] + .05);
    });
    assert(ratio >= 4.5, `Hover text contrast ${ratio}`);
    const run = page.getByRole('button', { name: 'Run a torque test' });
    await run.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const focus = await run.evaluate((el) => ({ visible: el.matches(':focus-visible'), color: getComputedStyle(el).outlineColor, width: getComputedStyle(el).outlineWidth }));
    assert.deepEqual(focus, { visible: true, color: 'rgb(245, 243, 235)', width: '3px' });
    await page.screenshot({ path: `${output}/testbench-focus.webp`, type: 'webp', quality: 85 });
    return { hoverContrast: Number(ratio.toFixed(2)), focus };
  });

  await check('200% text enlargement reflows at 390px', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
    await page.screenshot({ path: `${output}/390-text-200.webp`, fullPage: true, type: 'webp', quality: 70 });
    return 'Text enlargement checked separately from browser-native zoom.';
  });

  await check('Production export has no page or resource errors', async () => {
    assert.deepEqual(results.pageErrors, []);
    assert.deepEqual(results.resourceErrors, []);
    return 'All scripts, styles, fonts, mascot, share image and favicon loaded locally.';
  });
  await context.close();

  let safari;
  try {
    safari = await webkit.launch({ headless: true });
  } catch (error) {
    const libraries = [...new Set(error.message.match(/lib[^\s║]+\.so(?:\.[0-9]+)*/g) ?? [])];
    results.limits.push(`WebKit could not launch: ${libraries.length ? `missing host libraries: ${libraries.join(', ')}` : error.message.split('\n').filter(Boolean).slice(0, 4).join(' ')}`);
  }
  if (safari) {
    await check('WebKit mobile primary interactions', async () => {
      const page = await safari.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(url);
      await page.getByRole('button', { name: 'BUY $DONGLE' }).click();
      await page.getByRole('dialog').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.getByRole('link', { name: 'READ THE TECHNICAL SPECS' }).click();
      await page.getByRole('button', { name: 'Run a torque test' }).click();
      await page.getByText('Test complete. 2 mm traveled. Ego unchanged.').waitFor();
      return 'Buy dialog, Escape, anchor navigation and simulation passed.';
    });
    await safari.close();
  }
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
  if (results.checks.some(({ passed }) => !passed)) process.exitCode = 1;
}

// Run against a running dev or preview server: node scripts/check-ui.mjs [base URL]
// CHROME_PATH overrides browser discovery. No external service calls are made.
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const executablePath = process.env.CHROME_PATH || [
  '/usr/bin/chromium', '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync);
assert(executablePath, 'Set CHROME_PATH to your Chromium or Chrome executable');
const base = process.argv[2] || 'http://localhost:4321';
const browser = await puppeteer.launch({ executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(`${page.url()}: ${error.message}`));
async function open(route) {
  const response = await page.goto(base + route, { waitUntil: 'networkidle0' });
  assert([200, 304].includes(response.status()), `${route}: HTTP ${response.status()}`);
  await page.evaluate(() => document.fonts.ready);
}
async function bounds(selector) {
  return page.$$eval(selector, (elements) => elements.map((el) => {
    const r = el.getBoundingClientRect();
    const css = getComputedStyle(el);
    return { left: r.left, right: r.right, width: r.width, height: r.height, visible: css.display !== 'none' && r.width > 0 };
  }));
}
try {
  for (const width of [390, 768, 1440]) {
    await page.setViewport({ width, height: 1000 });
    await open('/gallery');
    for (const box of await bounds('.intro, .room__glyph, .room__anno')) {
      if (box.visible) assert(box.left >= -1 && box.right <= width + 1, `Gallery clips at ${width}px: ${JSON.stringify(box)}`);
    }
    await open('/fonts/inter');
    for (const selector of ['.dash', '.cmd', '.hero__head', '.hero__strip']) {
      const box = (await bounds(`#in-use ${selector}`))[0];
      assert(box?.visible, `${selector} missing at ${width}px`);
      assert(box.left >= 0 && box.right <= width, `${selector} overflows at ${width}px`);
    }
    if (width === 390) {
      const tableFits = await page.$eval('.dash__table', (el) => el.getBoundingClientRect().bottom <= el.closest('.iu__scene').getBoundingClientRect().bottom);
      assert(tableFits, 'Mobile analytics table is cropped');
      const commandFits = await page.$eval('.cmd', (el) => { const a = el.getBoundingClientRect(), b = el.closest('.iu__scene').getBoundingClientRect(); return a.top >= b.top && a.bottom <= b.bottom; });
      assert(commandFits, 'Mobile command palette is cropped');
    }
    await page.click('[data-weight-pause]');
    assert.equal(await page.$eval('[data-em]', (el) => el.style.animationPlayState), 'paused');
    await page.click('[data-weight-pause]');
    assert.equal(await page.$eval('[data-em]', (el) => el.style.animationPlayState), 'running');
    await open('/fonts/fraunces');
    const wordFits = await page.$eval('.ink__word', (el) => { const letters = [...el.children].map(e => e.getBoundingClientRect()); return Math.max(...letters.map(r => r.top)) - Math.min(...letters.map(r => r.top)) < 20 && el.scrollWidth <= el.clientWidth + 1; });
    assert(wordFits, `Fraunces word does not fit on one line at ${width}px`);
    await page.click('[data-wonk]');
    assert.equal(await page.$eval('[data-wonk]', el => el.getAttribute('aria-pressed')), 'false');
    console.log(`Responsive layout and example controls: ${width}px passed`);
  }
  await open('/pair');
  const faces = () => page.evaluate(() => ({ a: document.querySelector('select[data-pair-a]').value, b: document.querySelector('select[data-pair-b]').value, family: document.querySelector('[data-pair-body]').style.fontFamily }));
  assert.match((await faces()).family, /Inter/);
  await page.select('select[data-pair-b]', 'newsreader');
  assert.match((await faces()).family, /Newsreader/);
  await page.click('[data-pair-swap]');
  assert.deepEqual({ a: (await faces()).a, b: (await faces()).b }, { a: 'newsreader', b: 'fraunces' });
  assert.match((await faces()).family, /Fraunces/);
  await page.click('[data-recipe="fraunces+inter"]');
  assert.equal(await page.$eval('[data-recipe="fraunces+inter"]', el => el.getAttribute('aria-pressed')), 'true');
  await page.select('select[data-pair-a]', 'oswald');
  await page.$eval('[data-tune="awght"]', el => { el.value = '900'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.equal(await page.$eval('[data-pair-h]', el => el.style.fontVariationSettings), '"wght" 700');
  assert.equal(await page.$eval('[data-pair-body]', el => el.style.fontSize), '17px');
  console.log('Pairing preview, recipes, swap, and weight limits passed');

  const fonts = readdirSync(new URL('../src/content/fonts/', import.meta.url)).filter(f => f.endsWith('.mdx'));
  for (const file of fonts) await open(`/fonts/${file.slice(0, -4)}`);
  assert.deepEqual(errors, [], 'Browser errors');
  console.log(`All ${fonts.length} specimen pages loaded without browser errors`);
} finally {
  await browser.close();
}

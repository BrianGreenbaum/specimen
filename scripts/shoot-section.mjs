// Screenshot an arbitrary selector on a page. Usage: node shoot-section.mjs <url> <selector> <out.png> [width]
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, sel, out, width] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: Number(width) || 1440, height: 1000, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate(() => {
  document.querySelectorAll('[data-reveal]').forEach((e) => { e.removeAttribute('data-reveal'); e.style.opacity = '1'; e.style.transform = 'none'; });
  return document.fonts.ready;
});
await new Promise((r) => setTimeout(r, 600));
const elh = await page.$(sel);
if (!elh) { console.error('selector not found:', sel); process.exit(1); }
await elh.scrollIntoView();
await new Promise((r) => setTimeout(r, 300));
await elh.screenshot({ path: out });
await browser.close();
console.log('saved', out);

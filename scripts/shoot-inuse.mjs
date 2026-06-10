// Headless capture of the isolated In-Use harness (/lab/<slug>) for font slugs.
// Usage: node scripts/shoot-inuse.mjs <slug> [slug...]
// Outputs to /tmp/specimen-shots/<slug>/ :
//   scene-NN.png    cropped per-act shots at 1440px desktop
//   section-1440.png  full stack, desktop — judge the act-to-act handoffs
//   section-768.png   full stack, tablet responsiveness gate
//   section-390.png   full stack, mobile responsiveness gate
// Lower DPR on the stacks keeps critic tokens down.
import puppeteer from 'puppeteer-core';
import { mkdir, rm } from 'node:fs/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = process.env.PORT || '4400';
const OUT = '/tmp/specimen-shots';
const slugs = process.argv.slice(2);
if (!slugs.length) { console.error('need slug(s)'); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

async function force(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((e) => {
      e.removeAttribute('data-reveal');
      e.style.opacity = '1';
      e.style.transform = 'none';
    });
  });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
}

async function shoot(slug) {
  const dir = `${OUT}/${slug}`;
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });
  const url = `http://localhost:${PORT}/lab/${slug}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await force(page);

  const figs = await page.$$('#in-use figure');
  let n = 0;
  for (const fig of figs) {
    const box = await fig.boundingBox();
    if (!box || box.height < 40) continue;
    n++;
    await fig.scrollIntoView();
    await force(page);
    await fig.screenshot({ path: `${dir}/scene-${String(n).padStart(2, '0')}.png` });
    // opt-in second state: a figure may declare data-shoot-click="<selector>"
    // to put an interaction outcome into the evidence (scene-NNb.png)
    const sel = await fig.evaluate((el) => el.getAttribute('data-shoot-click'));
    if (sel) {
      await fig.evaluate((el, s) => el.querySelector(s)?.click(), sel);
      await new Promise((r) => setTimeout(r, 700));
      await fig.screenshot({ path: `${dir}/scene-${String(n).padStart(2, '0')}b.png` });
      await fig.evaluate((el, s) => el.querySelector(s)?.click(), sel); // restore
    }
  }

  // full-stack responsiveness gates (whole section, one shot per viewport)
  for (const [w, dpr] of [[1440, 1], [768, 1.25], [390, 1.5]]) {
    await page.setViewport({ width: w, height: 1000, deviceScaleFactor: dpr });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await force(page);
    const m = await page.$('#in-use');
    await m.screenshot({ path: `${dir}/section-${w}.png` });
  }
  await page.close();
  console.log(`${slug}: ${n} scenes`);
}

for (const slug of slugs) {
  try {
    await shoot(slug);
  } catch (e) {
    console.error(`${slug}: retry (${e.message.split('\n')[0]})`);
    try { await shoot(slug); } catch (e2) { console.error(`${slug}: FAILED ${e2.message.split('\n')[0]}`); }
  }
}
await browser.close();
console.log('done');

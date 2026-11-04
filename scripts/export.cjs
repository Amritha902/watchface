// Renders submission PNGs of the PRAHAR face + a full showcase screenshot.
// Usage: python3 -m http.server 8123 &  then  node scripts/export.cjs [baseUrl]
const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');

(async () => {

const base = process.argv[2] || 'http://localhost:8123/';
mkdirSync('exports', { recursive: true });

const shots = [
  // name, query
  ['01-usha-brahma-muhurta', 't=5.25&doy=308'],
  ['02-purvahna-morning', 't=8.1&doy=308'],
  ['03-madhyahna-focus', 't=11.3&doy=308'],
  ['04-sayahna-golden-hour', 't=17.1&doy=308'],
  ['05-pradosha-dusk', 't=18.6&doy=308'],
  ['06-nishitha-night', 't=22.4&doy=308'],
  ['07-always-on', 't=22.4&doy=308&aod=1'],
  ['08-hindi', 't=11.3&doy=308&lang=hi'],
  ['09-oslo-midsummer', 't=21.9&doy=172&city=oslo'],
  ['10-oslo-midwinter', 't=14.6&doy=355&city=oslo'],
  ['11-heart-racing', 't=11.3&doy=308&hr=138&secs=0.02'],
  ['12-heart-spike-breathe', 't=11.3&doy=308&spike=1&secs=3.1'],
  ['13-binge-dark-jonas', 't=13.2&doy=308&theme=dark.jonas'],
  ['14-binge-dark-martha', 't=20.5&doy=308&theme=dark.martha'],
  ['15-binge-dark-adam', 't=9.4&doy=308&theme=dark.adam'],
  ['16-binge-deathnote-light', 't=22.4&doy=308&theme=deathnote.light'],
  ['17-binge-deathnote-l', 't=11.3&doy=308&theme=deathnote.l'],
  ['18-binge-deathnote-ryuk', 't=16.2&doy=308&theme=deathnote.ryuk'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });

for (const [name, q] of shots) {
  await page.goto(`${base}?${q}&freeze=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const svg = await page.$('#screen svg');
  // Render the raw face at native 466px (x2) with a clean circular crop
  const markup = await svg.evaluate((n) => n.outerHTML);
  const p2 = await browser.newPage({ viewport: { width: 466, height: 466 }, deviceScaleFactor: 2 });
  await p2.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&family=Special+Elite&family=UnifrakturMaguntia&family=IBM+Plex+Mono:wght@300;500&family=Cormorant+Garamond:wght@500;600&display=swap" rel="stylesheet"><style>html,body{margin:0;background:transparent}svg{width:466px;height:466px;display:block}</style></head><body>${markup}</body></html>`, { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready);
  await p2.screenshot({ path: `exports/face-${name}.png`, omitBackground: true });
  await p2.close();
  console.log('face', name);
}

await page.goto(`${base}?t=11.3&doy=308&freeze=1`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'exports/showcase-hero.png' });
await page.screenshot({ path: 'exports/showcase-full.png', fullPage: true });
await browser.close();
console.log('done');
})();

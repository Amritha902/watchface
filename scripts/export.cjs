// Renders submission PNGs (+ Figma-ready SVGs) of every Encore screen.
// Usage: npm start &  then  node scripts/export.cjs [baseUrl]
const { chromium } = require('playwright');
const { mkdirSync, writeFileSync } = require('node:fs');
const base = process.argv[2] || 'http://localhost:8787/';
const shots = [
  ['01-studio', 'face=studio'],
  ['02-friends', 'face=friends&play=1'],
  ['03-stranger', 'face=stranger&play=1&secs=1.3'],
  ['04-money-heist', 'face=heist&play=1'],
  ['05-squid-game', 'face=squid&play=1'],
  ['06-gift-reveal', 'face=friends&screen=gift&el=3.2&secs=3.2'],
  ['07-gift-unwrapping', 'face=friends&screen=gift&el=1.9&secs=1.9'],
  ['08-gallery', 'face=friends&screen=gallery&pos=1'],
  ['09-gallery-create', 'screen=gallery&pos=5'],
  ['10-describe', 'screen=create&prompt=A rainy café in Mumbai, warm and cosy&secs=0.4'],
  ['11-designing', 'screen=designing&prompt=Neon Tokyo night&p=0.7&secs=0.9'],
  ['12-prompt-cafe', 'pfx=Rainy café, cosy'],
  ['13-prompt-tokyo', 'pfx=Neon Tokyo night'],
  ['14-prompt-ocean', 'pfx=Calm ocean, teal'],
  ['15-heart-racing', 'face=friends&play=1&hr=140&secs=0.02'],
  ['16-heart-breathe', 'face=friends&spike=1&secs=2.6'],
  ['17-always-on', 'face=friends&aod=1'],
  ['18-favourite-quiz', 'screen=quiz&face=stranger&secs=0.5'],
  ['19-medallion-stranger', 'face=stranger&edit=put it in a circle&secs=1.3'],
  ['20-medallion-friends', 'face=friends&edit=circle frame&secs=1'],
  ['21-edited-friends', 'face=friends&play=1&edit=clock on the left, darker, gold'],
  ['22-medallion-tokyo', 'pfx=Neon Tokyo night&edit=put it in a circle, pink'],
];
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@300;700;800&family=Gabarito:wght@800&family=Libre+Baskerville:wght@700&family=Bebas+Neue&family=JetBrains+Mono:wght@700&display=swap';
(async () => {
  mkdirSync('exports', { recursive: true }); mkdirSync('figma', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const p2 = await browser.newPage({ viewport: { width: 396, height: 484 }, deviceScaleFactor: 2 });
  for (const [name, q] of shots) {
    await page.goto(`${base}?t=10.15&freeze=1&${q}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const svg = (await page.$eval('#screen svg', (n) => n.outerHTML)).replace('<svg ', '<svg width="396" height="484" ');
    // Figma-ready copy: native 368×448 (Titan kit size), single font family names
    const fig = svg.replace('width="396" height="484"', 'width="368" height="448" preserveAspectRatio="none"')
      .replace(/font-family="([^"]*)"/g, (m, v) => `font-family="${v.split(',')[0].replace(/'/g, '').trim()}"`);
    writeFileSync(`figma/${name}.svg`, fig);
    await p2.setContent(`<html><head><link href="${FONTS}" rel="stylesheet"><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' });
    await p2.evaluate(() => document.fonts.ready);
    await p2.screenshot({ path: `exports/${name}.png`, omitBackground: true });
    console.log(name);
  }
  await page.goto(`${base}?t=10.15&freeze=1&face=friends&play=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'exports/showcase-hero.png' });
  await page.screenshot({ path: 'exports/showcase-full.png', fullPage: true });
  await browser.close();
})();

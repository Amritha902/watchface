const { chromium } = require('playwright');
const fs = require('node:fs');
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@200;300;400;500;700;800&family=Gabarito:wght@800&display=swap';
(async () => {
  const { CONCEPTS2 } = await import('../src/concepts2.js');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 368, height: 448 }, deviceScaleFactor: 2 });
  fs.mkdirSync('figma/concepts', { recursive: true });
  for (const c of CONCEPTS2) for (const st of ['active', 'alt', 'aod']) {
    const svg = c.fn(st, `${c.slug.replace(/-/g, '')}${st}`); fs.writeFileSync(`figma/concepts/${c.slug}-${st}.svg`, svg);
    await p.setContent(`<html><head><link href="${FONTS}" rel="stylesheet"><style>html,body{margin:0;background:#222}svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `exports/concept-${c.slug}-${st}.png` });
  }
  await b.close(); console.log('ok');
})();

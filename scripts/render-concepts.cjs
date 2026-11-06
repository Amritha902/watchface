// Renders the five concept entries (6–10): SVG sources + PNG @3x for every state.
const { chromium } = require('playwright');
const fs = require('node:fs');
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@200;300;400;500;700;800&display=swap';
(async () => {
  const { CONCEPTS } = await import('../src/concepts.js');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 368, height: 448 }, deviceScaleFactor: 3 });
  for (const c of CONCEPTS) for (const st of ['active', 'alt', 'aod']) {
    const svg = c.fn(st, `${c.slug}${st}`); fs.writeFileSync(`figma/concepts/${c.slug}-${st}.svg`, svg);
    await p.setContent(`<html><head><link href="${FONTS}" rel="stylesheet"><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `exports/concept-${c.slug}-${st}.png`, omitBackground: true });
  }
  await b.close(); console.log('ok');
})();

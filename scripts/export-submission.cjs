// Submission exports at the Titan kit resolution 368×448, rendered @3x (1104×1344) from the Figma-ready SVGs.
const { chromium } = require('playwright');
const fs = require('node:fs');
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@300;700;800&family=Gabarito:wght@800&family=Libre+Baskerville:wght@700&family=Bebas+Neue&family=JetBrains+Mono:wght@700&display=swap';
const PICK = {
  'Active - Studio': '01-studio', 'Active - The Apartment (Flat 5B)': '02-friends', 'Active - Upside (Hollow Lights)': '03-stranger',
  'Active - The Vault (The Mint Job)': '04-money-heist', 'Active - The Game (Last Round)': '05-squid-game',
  'Active - Generated (Neon Tokyo night)': '13-prompt-tokyo', 'Active - Medallion (Upside)': '19-medallion-stranger',
  'Always-On - The Apartment': '17-always-on',
  'Interactive - Gift reveal': '06-gift-reveal', 'Interactive - Favourite character': '18-favourite-quiz',
  'Interactive - Describe it': '10-describe', 'Interactive - Swipe gallery': '08-gallery',
  'Interactive - Heart racing': '15-heart-racing', 'Interactive - Breathe guide': '16-heart-breathe',
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 368, height: 448 }, deviceScaleFactor: 3 });
  for (const [label, file] of Object.entries(PICK)) {
    const svg = fs.readFileSync(`figma/${file}.svg`, 'utf8');
    await p.setContent(`<html><head><link href="${FONTS}" rel="stylesheet"><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `submission/png-3x/Encore - ${label}.png`, omitBackground: true });
  }
  await b.close();
  console.log(fs.readdirSync('submission/png-3x').length, 'PNGs @3x (1104×1344)');
})();

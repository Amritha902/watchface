// Square 1:1 preview (≤5 MB) for each standalone Figma entry: hero Active state + Always-On, Medallion and Heart-sync states.
const { chromium } = require('playwright');
const fs = require('node:fs');
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@300;700;800&family=Gabarito:wght@800&family=Libre+Baskerville:wght@700&family=Bebas+Neue&family=JetBrains+Mono:wght@700&display=swap';
const ENTRIES = [
  { slug: 'match-day', active: '23-match-day', name: 'Match Day', kind: 'Live sport', glow: 'rgba(255,209,102,.30)', glow2: 'rgba(63,174,90,.28)',
    tag: 'The match lives on your wrist.', sub: 'Score and overs at a glance, under floodlights.', bullets: ['Live score complication, readable in a second', 'Floodlights pulse, the crowd twinkles', 'Heart races in the final over, the edge glows'] },
  { slug: 'petal-season', active: '24-petal-season', name: 'Petal Season', kind: 'Romance', glow: 'rgba(255,158,192,.38)', glow2: 'rgba(246,169,107,.25)',
    tag: 'A slow spring, all day.', sub: 'Petals drift past a big serif clock.', bullets: ['Stacked serif time, 128 px, high contrast', 'Petals fall slowly; blossoms frame the date', 'Nudge in the mood: "Call someone you love"'] },
  { slug: 'orbit-9', active: '25-orbit-9', name: 'Orbit 9', kind: 'Sci-fi', glow: 'rgba(255,122,107,.32)', glow2: 'rgba(80,110,255,.30)',
    tag: 'Your own small planet.', sub: 'A moon orbits once a minute behind the time.', bullets: ['Mono digits sit on a ringed planet', 'Moon orbit doubles as a seconds cue', 'True-black always-on keeps only the time'] },
  { slug: 'northern', active: '26-northern', name: 'Northern', kind: 'Nature', glow: 'rgba(61,255,176,.30)', glow2: 'rgba(176,123,255,.25)',
    tag: 'Aurora on your wrist.', sub: 'Light ribbons move slowly over a still lake.', bullets: ['Hairline time over a living aurora', 'Ribbons drift slowly, calm not busy', 'Mountains reflect in the lake'] },
];
const svg = (f) => fs.readFileSync(`figma/${f}.svg`, 'utf8');
const page = (e) => `<html><head><link href="${FONTS}" rel="stylesheet"><style>
  *{box-sizing:border-box} html,body{margin:0;width:1800px;height:1800px;background:#050507;font-family:Inter,sans-serif;color:#fff;overflow:hidden}
  .glow{position:absolute;inset:0;background:radial-gradient(900px 760px at 28% 40%,${e.glow},transparent 70%),radial-gradient(760px 640px at 86% 22%,${e.glow2},transparent 70%)}
  .hero{position:absolute;left:150px;top:230px;width:560px;height:682px}
  .case{position:absolute;inset:-34px;border-radius:150px/160px;background:linear-gradient(145deg,#ececf0,#9b9ba3 18%,#55555d 45%,#26262c 62%,#8a8a93 86%,#d4d4da);box-shadow:0 80px 120px -40px #000}
  .glass{position:absolute;inset:-12px;border-radius:138px/150px;background:#000}
  .scr{position:absolute;inset:0;border-radius:128px/140px;overflow:hidden} .scr svg,.f svg{width:100%;height:100%;display:block}
  .crown{position:absolute;right:-66px;top:120px;width:40px;height:110px;border-radius:10px;background:repeating-linear-gradient(0deg,#c9c9cf 0 4px,#6a6a72 4px 8px)}
  .band{position:absolute;left:90px;width:380px;height:300px;background:linear-gradient(90deg,#0b0b0e,#22222a 50%,#0b0b0e)} .band.t{top:-330px;border-radius:60px 60px 0 0}.band.b{bottom:-330px;border-radius:0 0 60px 60px}
  .copy{position:absolute;left:880px;top:250px;width:830px}
  .k{font-size:26px;letter-spacing:.28em;text-transform:uppercase;color:#a9a9b6}
  h1{font-size:150px;font-weight:800;letter-spacing:-.05em;margin:12px 0 0;line-height:.95;background:linear-gradient(180deg,#fff 35%,#a4a4b0);-webkit-background-clip:text;color:transparent}
  .tag{font-size:50px;font-weight:700;line-height:1.15;margin-top:30px;letter-spacing:-.015em} .sub{font-size:36px;color:#b9b9c4;margin-top:12px;line-height:1.3}
  ul{list-style:none;padding:0;margin:40px 0 0;font-size:31px;color:#e2e2ea;line-height:1.7} li:before{content:'— ';color:#7d7d88}
  .row{position:absolute;left:150px;bottom:150px;display:flex;gap:70px}
  .cell{text-align:center}.f{width:250px;height:304px;border-radius:58px/64px;overflow:hidden;box-shadow:0 0 0 8px #17171c,0 0 0 10px #3a3a44,0 30px 50px -20px #000}
  .cell span{display:block;margin-top:26px;font-size:24px;letter-spacing:.14em;text-transform:uppercase;color:#a9a9b6}
  .meta{position:absolute;right:150px;bottom:190px;width:560px;font-size:26px;line-height:1.7;color:#a9a9b6}
  .meta b{color:#fff;font-weight:600}
</style></head><body><div class="glow"></div>
<div class="hero"><div class="band t"></div><div class="band b"></div><div class="case"></div><div class="glass"></div><div class="crown"></div><div class="scr">${svg(e.active)}</div></div>
<div class="copy"><div class="k">Open Innovation · ${e.kind}</div><h1>${e.name}</h1><div class="tag">${e.tag}</div><div class="sub">${e.sub}</div><ul>${e.bullets.map((b) => `<li>${b}</li>`).join('')}</ul></div>
<div class="row">${[['aod', 'Always-on'], ['medallion', 'Medallion'], ['racing', 'Heart sync']].map(([s, l]) => `<div class="cell"><div class="f">${svg(`${e.slug}-${s}`)}</div><span>${l}</span></div>`).join('')}</div>
<div class="meta"><b>368 × 448</b> rectangular OLED<br/>Text ≥ 21 px · icons ≥ 25 px<br/>Part of the <b>Encore</b> collection</div>
</body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 1800 } });
  fs.mkdirSync('submission/entries', { recursive: true });
  for (const e of ENTRIES) {
    await p.setContent(page(e), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(250);
    const out = `submission/entries/${e.name} - preview-1x1.png`; await p.screenshot({ path: out });
    console.log(out, (fs.statSync(out).size / 1048576).toFixed(2), 'MB');
  }
  await b.close();
})();

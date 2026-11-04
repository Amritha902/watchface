// Builds submission/Encore-preview-1x1.png: the square hero image for the portal's "Final Preview Exports" field (≤5 MB).
const { chromium } = require('playwright');
const fs = require('node:fs');
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@300;700;800&family=Gabarito:wght@800&family=Libre+Baskerville:wght@700&family=Bebas+Neue&family=JetBrains+Mono:wght@700&display=swap';
const svg = (f) => fs.readFileSync(`figma/${f}.svg`, 'utf8');
const html = `<html><head><link href="${FONTS}" rel="stylesheet"><style>
  *{box-sizing:border-box} html,body{margin:0;width:1800px;height:1800px;background:#050507;font-family:Inter,sans-serif;color:#fff;overflow:hidden}
  .glow{position:absolute;inset:0;background:radial-gradient(900px 700px at 30% 42%,rgba(140,90,220,.38),transparent 70%),radial-gradient(700px 600px at 85% 20%,rgba(255,80,120,.16),transparent 70%)}
  .hero{position:absolute;left:150px;top:240px;width:560px;height:682px}
  .case{position:absolute;inset:-34px;border-radius:150px/160px;background:linear-gradient(145deg,#ececf0,#9b9ba3 18%,#55555d 45%,#26262c 62%,#8a8a93 86%,#d4d4da);box-shadow:0 80px 120px -40px #000}
  .glass{position:absolute;inset:-12px;border-radius:138px/150px;background:#000}
  .scr{position:absolute;inset:0;border-radius:128px/140px;overflow:hidden} .scr svg{width:100%;height:100%;display:block}
  .crown{position:absolute;right:-66px;top:120px;width:40px;height:110px;border-radius:10px;background:repeating-linear-gradient(0deg,#c9c9cf 0 4px,#6a6a72 4px 8px)}
  .band{position:absolute;left:90px;width:380px;height:300px;background:linear-gradient(90deg,#0b0b0e,#22222a 50%,#0b0b0e)}
  .band.t{top:-330px;border-radius:60px 60px 0 0}.band.b{bottom:-330px;border-radius:0 0 60px 60px}
  .copy{position:absolute;left:880px;top:250px;width:820px}
  .k{font-size:26px;letter-spacing:.28em;text-transform:uppercase;color:#a9a9b6}
  h1{font-size:210px;font-weight:800;letter-spacing:-.05em;margin:10px 0 0;line-height:.9;background:linear-gradient(180deg,#fff 35%,#9a9aa6);-webkit-background-clip:text;color:transparent}
  .tag{font-size:50px;font-weight:600;line-height:1.18;margin-top:34px;letter-spacing:-.015em}
  .tag span{color:#a9a9b6;font-weight:500}
  ul{list-style:none;padding:0;margin:44px 0 0;font-size:32px;color:#d9d9e2;line-height:1.75} ul b{color:#fff}
  .row{position:absolute;left:130px;right:130px;bottom:120px;display:flex;justify-content:space-between}
  .f{width:200px;height:244px;border-radius:46px/52px;overflow:hidden;box-shadow:0 0 0 7px #17171c,0 0 0 9px #3a3a44,0 30px 50px -20px #000}
  .f svg{width:100%;height:100%;display:block}
  .lbl{position:absolute;bottom:62px;left:0;right:0;text-align:center;font-size:24px;color:#8e8e98;letter-spacing:.08em}
</style></head><body><div class="glow"></div>
<div class="hero"><div class="band t"></div><div class="band b"></div><div class="case"></div><div class="glass"></div><div class="crown"></div><div class="scr">${svg('06-gift-reveal')}</div></div>
<div class="copy"><div class="k">Open Innovation</div><h1>Encore.</h1>
<div class="tag">Watch faces that know what you love. <span>Start a show and your watch gifts you a face made for it.</span></div>
<ul><li><b>Made for you</b>: a gift when a new show starts</li><li><b>Favourite character</b>: AI paints their world</li><li><b>Describe it</b>: a sentence becomes a face</li><li><b>Make it yours</b>: edit in plain words</li></ul></div>
<div class="row">${['02-friends','03-stranger','04-money-heist','05-squid-game','19-medallion-stranger','17-always-on'].map((f) => `<div class="f">${svg(f)}</div>`).join('')}</div>
<div class="lbl">ACTIVE · MEDALLION · ALWAYS-ON  ·  368 × 448 OLED</div>
</body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 1800 } });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: 'submission/Encore-preview-1x1.png' }); await b.close();
  console.log('submission/Encore-preview-1x1.png', (fs.statSync('submission/Encore-preview-1x1.png').size / 1048576).toFixed(2), 'MB');
})();

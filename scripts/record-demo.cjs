// Records docs/encore-demo.mp4: a captioned, end-to-end walkthrough of the prototype.
// Usage: node scripts/bundle.cjs && node scripts/record-demo.cjs   (needs Playwright + ffmpeg)
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const DIR = 'docs/.demo';
const URL = 'file://' + path.resolve('dist/encore.html') + '?t=10.15';

(async () => {
  fs.rmSync(DIR, { recursive: true, force: true }); fs.mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: DIR, size: { width: 1280, height: 720 } } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: `
    #cap{pointer-events:none;position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:99;background:rgba(10,10,14,.86);backdrop-filter:blur(8px);
      color:#fff;font:600 21px Inter,sans-serif;padding:12px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.14);transition:opacity .35s;white-space:nowrap}
    #cap small{display:block;font-weight:400;font-size:14px;color:#b9b9c4;text-align:center;margin-top:2px}
    #card{position:fixed;inset:0;z-index:100;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .6s;
      font-family:Inter,sans-serif;color:#fff;text-align:center}
    #card h1{font-size:96px;font-weight:800;letter-spacing:-.045em;margin:0;background:linear-gradient(180deg,#fff 30%,#9a9aa6);-webkit-background-clip:text;color:transparent}
    #card p{font-size:26px;color:#b9b9c4;margin:14px 0 0;max-width:900px;line-height:1.35}
    #card .k{font-size:14px;letter-spacing:.24em;text-transform:uppercase;color:#8e8e98;margin-bottom:16px}
    .hl{outline:3px solid #fff!important;outline-offset:4px;border-radius:999px;transition:outline .2s}` });
  const say = (t, sub = '') => page.evaluate(([t, sub]) => { let c = document.getElementById('cap'); if (!c) { c = document.createElement('div'); c.id = 'cap'; document.body.appendChild(c); } c.style.opacity = t ? 1 : 0; c.innerHTML = t + (sub ? `<small>${sub}</small>` : ''); }, [t, sub]);
  const card = (k, h, p) => page.evaluate(([k, h, p]) => { let c = document.getElementById('card'); if (!c) { c = document.createElement('div'); c.id = 'card'; document.body.appendChild(c); } c.style.opacity = 1; c.style.pointerEvents = 'auto'; c.innerHTML = `<div class="k">${k}</div><h1>${h}</h1><p>${p}</p>`; }, [k, h, p]);
  const uncard = () => page.evaluate(() => { const c = document.getElementById('card'); if (c) { c.style.opacity = 0; c.style.pointerEvents = 'none'; } });
  const wait = (ms) => page.waitForTimeout(ms);
  const scrollTo = (sel, block = 'center') => page.evaluate(([s, b]) => document.querySelector(s).scrollIntoView({ behavior: 'smooth', block: b }), [sel, block]);
  const click = async (sel) => { await page.evaluate((s) => document.querySelector(s).classList.add('hl'), sel); await wait(450); await page.click(sel); await page.evaluate((s) => document.querySelector(s)?.classList.remove('hl'), sel); };
  const scr = async () => page.$eval('#screen', (n) => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const tap = async (fx, fy) => { const r = await scr(); await page.mouse.click(r.x + r.w * fx, r.y + r.h * fy); };
  const t0 = Date.now();

  // 0 · title
  await card('Watch Face Design Challenge 2026 · Open Innovation', 'Encore.', 'A watch face that knows what you love.');
  await wait(2600); await card('The problem', 'Your watch face<br/>knows nothing about you.', 'It\'s the screen you look at 80 times a day. Encore changes that.'); await wait(3000); await uncard(); await wait(600);

  // 1 · gift
  await scrollTo('.stage', 'start'); await wait(700);
  await say('1 · You press play on Friends', 'Encore\'s phone app notices what\'s playing, privately and on-device');
  await wait(1600); await click('#playBtn'); await wait(1500);
  await say('Your watch gets a gift', '"Made for you · Because you\'re watching Friends"'); await wait(3600);
  await say('One tap: wear it', 'The face carries your show: episode, minutes left, resume on TV'); await tap(0.5, 420 / 484); await wait(2600);

  // 2 · favourite character
  await scrollTo('#favBtn'); await wait(600);
  await say('2 · Who\'s your favourite?', 'Pick Stranger Things, then a character'); await click('.show[data-k="stranger"]'); await wait(500);
  await click('#favBtn'); await wait(1800);
  await say('Tap Eleven', 'Claude reads her world · Flux paints the wallpaper'); await tap(0.25, 162 / 484); await wait(4600);
  await say('"Because Eleven is your favourite"', 'Her colours, objects and mood. Never an actor\'s face.'); await wait(2200); await tap(0.5, 420 / 484); await wait(1800);

  // 3 · swipe
  await say('3 · Swipe for more', 'Your collection, with + Create your own at the end'); await scrollTo('.stage', 'start'); await wait(500);
  for (let i = 0; i < 6; i++) { await page.click('#swipeBtn'); await wait(650); }
  await wait(600);

  // 4 · describe
  await scrollTo('#prompt'); await wait(600);
  await say('4 · Or just describe it', '"Neon Tokyo night"'); await page.click('#prompt');
  await page.keyboard.type('Neon Tokyo night', { delay: 70 }); await wait(900);
  await click('#designBtn'); await say('Encore designs it', 'Wallpaper, palette, typeface and layout from one sentence'); await wait(5600);
  await tap(0.5, 420 / 484); await wait(1800);

  // 5 · make it yours
  await scrollTo('#refine'); await wait(600);
  await say('5 · Make it yours, in plain words', 'Claude turns a sentence into exact edits');
  for (const chip of ['Put it in a circle', 'Gold accent', 'Clock on the left', 'Make it darker']) {
    await page.evaluate((c) => [...document.querySelectorAll('#refineChips .chip')].find((b) => b.textContent === c).classList.add('hl'), chip); await wait(400);
    await page.click(`#refineChips .chip:text("${chip}")`); await say(`"${chip}"`, 'Applied instantly · Undo any step'); await wait(1500);
  }
  await click('#undoBtn'); await say('Undo (multi-step)', 'Back one edit at a time'); await wait(1600);

  // 6 · heart
  await scrollTo('#spikeBtn'); await wait(600);
  await say('6 · It beats with you', 'Heart-rate spike → the edge pulses red, then a breathing guide'); await click('#spikeBtn'); await wait(7600);

  // 7 · wrist + specs
  await say('On your wrist', 'Real scale, 45 mm-class display'); await scrollTo('#wrist', 'start'); await wait(3200);
  await say('A watch-face app, not a new watch', 'Runs on Wear OS 4+ · on-device privacy · under 3% battery a day (target)'); await scrollTo('#specs', 'start'); await wait(3600);
  await say('');

  // end
  await card('Usability-tested with TheySaid · 10 sessions', '100% delightful', 'Every round-2 tester called the gift moment delightful. Premium feel 5.8 / 7.'); await wait(3600);
  await card('Designed & built by Amritha S', 'Encore.', 'Watch faces that know what you love.'); await wait(3200);

  const dur = (Date.now() - t0) / 1000;
  await ctx.close(); await browser.close();
  const webm = fs.readdirSync(DIR).find((f) => f.endsWith('.webm'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-sseof', `-${dur.toFixed(1)}`, '-i', `${DIR}/${webm}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'medium', '-movflags', '+faststart', '-r', '30', 'docs/encore-demo.mp4']);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '7', '-t', '12', '-i', 'docs/encore-demo.mp4', '-vf', 'fps=10,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4', 'docs/encore-demo-preview.gif']);
  fs.rmSync(DIR, { recursive: true, force: true });
  console.log('docs/encore-demo.mp4', (fs.statSync('docs/encore-demo.mp4').size / 1048576).toFixed(1), 'MB,', dur.toFixed(0), 's');
})();

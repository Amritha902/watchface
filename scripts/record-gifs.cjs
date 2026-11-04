// Records the README animations straight from the running prototype.
// Usage: npm start &  then  node scripts/record-gifs.cjs   (needs Playwright + ffmpeg)
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const BASE = process.argv[2] || 'http://localhost:8787/';
const TMP = 'docs/.frames';

(async () => {
  const browser = await chromium.launch();
  async function record(name, query, script) {
    const dir = `${TMP}/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 2100 }, recordVideo: { dir, size: { width: 1280, height: 2100 } } });
    const t0 = Date.now();
    const page = await ctx.newPage();
    await page.goto(`${BASE}?t=10.15&${query}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const box = await (await page.$('.watch')).boundingBox();
    const clip = { x: Math.round(box.x - 44), y: Math.round(box.y - 70), w: Math.round(box.width + 100), h: Math.round(box.height + 140) };
    const scr = await (await page.$('#screen')).boundingBox();
    const tap = (fx, fy) => page.mouse.click(scr.x + scr.width * fx, scr.y + scr.height * fy);
    const cap = (ms) => page.waitForTimeout(ms);
    const from = (Date.now() - t0) / 1000;
    await script({ page, cap, tap, scr });
    const dur = (Date.now() - t0) / 1000 - from;
    await ctx.close();
    const video = fs.readdirSync(dir).find((f) => f.endsWith('.webm'));
    const vf = `crop=${clip.w}:${clip.h}:${clip.x}:${clip.y},fps=12,scale=280:-1:flags=lanczos`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', from.toFixed(2), '-t', dur.toFixed(2), '-i', `${dir}/${video}`,
      '-vf', `${vf},split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, `docs/${name}.gif`]);
    console.log(`docs/${name}.gif`, Math.round(fs.statSync(`docs/${name}.gif`).size / 1024), 'KB');
  }

  await record('gift', '', async ({ page, cap, tap }) => {
    await cap(700); await page.click('#playBtn'); await cap(5200); await tap(0.5, 420 / 484); await cap(1600);
  });
  await record('character', '', async ({ page, cap, tap }) => {
    await page.click('.show[data-k="stranger"]'); await page.click('#favBtn'); await cap(1300);
    await tap(0.25, 162 / 484); await cap(6600); await tap(0.5, 420 / 484); await cap(1500);
  });
  await record('swipe', 'face=friends&play=1', async ({ page, cap, scr }) => {
    await cap(700);
    await page.mouse.move(scr.x + scr.width * 0.85, scr.y + scr.height * 0.5); await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(scr.x + scr.width * (0.85 - i * 0.08), scr.y + scr.height * 0.5); await cap(40); }
    await page.mouse.up(); await cap(900);
    for (let i = 0; i < 5; i++) { await page.click('#swipeBtn'); await cap(800); }
    await page.mouse.click(scr.x + scr.width * 0.5, scr.y + scr.height * 0.4); await cap(1200);
  });
  await record('describe', '', async ({ page, cap, tap }) => {
    await cap(500); await page.fill('#prompt', 'Neon Tokyo night'); await page.dispatchEvent('#prompt', 'input'); await cap(1300);
    await tap(0.5, 428 / 484); await cap(8200); await tap(0.5, 420 / 484); await cap(1400);
  });
  await record('edit', 'face=friends&play=1', async ({ page, cap }) => {
    await cap(900);
    for (const chip of ['Put it in a circle', 'Gold accent', 'Clock on the left', 'Make it darker']) {
      await page.click(`#refineChips .chip:text("${chip}")`); await cap(1300);
    }
    await page.click('#undoBtn'); await cap(800); await page.click('#undoBtn'); await cap(800);
  });
  await record('heart', 'face=stranger&play=1', async ({ page, cap }) => {
    await cap(800); await page.click('#spikeBtn'); await cap(7500);
  });
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
})();

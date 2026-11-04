// Builds submission/NN-Name/ (+ .zip) for all 10 entries: named frame SVGs (drag into Figma),
// frame PNGs @3x, 1:1 preview, DESCRIPTION.md and IMPORT-TO-FIGMA.md.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@300;700;800&family=Gabarito:wght@800&family=Libre+Baskerville:wght@700&family=Bebas+Neue&family=JetBrains+Mono:wght@700&display=swap';
const F = (f) => `figma/${f}.svg`, C = (f) => `figma/concepts/${f}.svg`;
const show = (slug, active, kind, tag, sub, bullets, glow, glow2, concept, theme) => ({ kind, tag, sub, bullets, glow, glow2, concept, theme,
  frames: [['Active Display', F(active)], ['Always-On', F(`${slug}-aod`)], ['Interactive - Medallion', F(`${slug}-medallion`)], ['Interactive - Heart racing', F(`${slug}-racing`)]],
  cells: [[F(`${slug}-aod`), 'Always-on'], [F(`${slug}-medallion`), 'Medallion'], [F(`${slug}-racing`), 'Heart sync']] });
const concept = (slug, kind, alt, tag, sub, bullets, glow, glow2, conceptText, theme) => ({ kind, tag, sub, bullets, glow, glow2, concept: conceptText, theme,
  frames: [['Active Display', C(`${slug}-active`)], [`Interactive - ${alt}`, C(`${slug}-alt`)], ['Always-On', C(`${slug}-aod`)]],
  cells: [[C(`${slug}-alt`), alt], [C(`${slug}-aod`), 'Always-on']] });
const ENTRIES = [
  { n: 1, name: 'Encore', preview: 'submission/Encore-preview-1x1.png', figma: 'https://www.figma.com/design/B5hYSaEPQLPnF5OnTFh9uD', theme: 'Open Innovation · Personalised entertainment',
    concept: "For the Open Innovation theme, Encore is a watch face that knows what you love: when you start a new series, your watch gifts you a face designed around that show's world, and you can pick a favourite character or describe a face in one sentence to have it made for you. The time is always the hero, large and high-contrast for a one-second glance, while a single glass complication carries heart rate, steps or your episode progress. All text is at least 21 px and every icon at least 25 px, and the always-on state drops to true black with type only.",
    frames: [['Active Display - Studio', F('01-studio')], ['Active Display - The Apartment', F('02-friends')], ['Active Display - Upside', F('03-stranger')], ['Active Display - The Vault', F('04-money-heist')], ['Active Display - The Game', F('05-squid-game')], ['Active Display - Generated', F('13-prompt-tokyo')], ['Active Display - Medallion', F('19-medallion-stranger')], ['Always-On', F('17-always-on')], ['Interactive - Gift reveal', F('06-gift-reveal')], ['Interactive - Favourite character', F('18-favourite-quiz')], ['Interactive - Describe it', F('10-describe')], ['Interactive - Heart racing', F('15-heart-racing')], ['Interactive - Breathe guide', F('16-heart-breathe')]] },
  { n: 2, name: 'Match Day', figma: 'https://www.figma.com/design/IDcHaADMOicH5pN6GQjgzT', ...show('match-day', '23-match-day', 'Live sport', 'The match lives on your wrist.', 'Score and overs at a glance, under floodlights.', ['Live score complication, readable in a second', 'Floodlights pulse, the crowd twinkles', 'Heart races in the final over, the edge glows'], 'rgba(255,209,102,.30)', 'rgba(63,174,90,.28)',
    "For the Open Innovation theme, Match Day puts a floodlit night match on your wrist: the stadium lights pulse, the crowd twinkles and a live score complication (runs, wickets, overs) reads in a single glance. Condensed Bebas digits stay large and cream-white against the deep navy sky, and in a tense final over the edge of the screen glows red with your heartbeat. The always-on state keeps only the time on true black, and a medallion variant frames the ground in a ringed circle.", 'Open Innovation · Live sport') },
  { n: 3, name: 'Petal Season', ...show('petal-season', '24-petal-season', 'Romance', 'A slow spring, all day.', 'Petals drift past a big serif clock.', ['Stacked serif time, 128 px, high contrast', 'Petals fall slowly; blossoms frame the date', 'Nudge in the mood: "Call someone you love"'], 'rgba(255,158,192,.38)', 'rgba(246,169,107,.25)',
    "For the Open Innovation theme, Petal Season is a slow, romantic face for people who binge love stories: blossoms frame the date and petals drift past a large stacked serif clock against a dusk-pink sky. The stacked Libre Baskerville time keeps glanceability high while the warm gradient and soft motion keep it calm, and the complication carries your episode or a gentle nudge. Always-on reduces it to grey type on true black.", 'Open Innovation · Romance / calm') },
  { n: 4, name: 'Orbit 9', ...show('orbit-9', '25-orbit-9', 'Sci-fi', 'Your own small planet.', 'A moon orbits once a minute behind the time.', ['Mono digits sit on a ringed planet', 'Moon orbit doubles as a seconds cue', 'True-black always-on keeps only the time'], 'rgba(255,122,107,.32)', 'rgba(80,110,255,.30)',
    "For the Open Innovation theme, Orbit 9 gives you your own small planet: a ringed world glows behind monospaced digits while a moon completes one orbit every minute, quietly doubling as a seconds cue. Coral and indigo give strong contrast to the white JetBrains Mono time, and a single glass complication shows heart rate, steps or your current episode. Always-on keeps only the time, and the medallion variant frames the planet in a porthole.", 'Open Innovation · Sci-fi / futuristic') },
  { n: 5, name: 'Northern', ...show('northern', '26-northern', 'Nature', 'Aurora on your wrist.', 'Light ribbons move slowly over a still lake.', ['Hairline time over a living aurora', 'Ribbons drift slowly, calm not busy', 'Mountains reflect in the lake'], 'rgba(61,255,176,.30)', 'rgba(176,123,255,.25)',
    "For the Open Innovation theme, Northern brings the aurora to your wrist: green, teal and violet ribbons move slowly over snow-capped mountains and a still lake that reflects them. A hairline Inter Tight clock floats above the scene for a calm, premium read, and the complication suggests stepping outside or shows your documentary's progress. Motion is deliberately slow to stay restful, and always-on drops to thin grey type on true black.", 'Open Innovation · Nature / ambient') },
  { n: 6, name: 'Glance Deck', ...concept('glance-deck', 'Notification centre', 'Expanded deck', 'A tiny notification centre.', 'Your next three things, stacked like cards.', ['Priority card fans to the front', 'Tap to spread the deck; swipe to clear', 'Weather, steps and music as glass tiles'], 'rgba(123,92,255,.38)', 'rgba(32,211,194,.25)',
    "For the Open Innovation theme, Glance Deck turns the watch face into a tiny notification centre: your next three things sit in a fanned stack of glass cards under a large clock, with the most urgent card (a delivery arriving in 6 minutes) at the front. Tap to spread the deck into a readable list and swipe to clear; weather, steps and music live as three glass tiles below. Always-on shows only the time and a '3 waiting' badge.", 'Open Innovation · Productivity / notifications') },
  { n: 7, name: 'Next Stop', ...concept('next-stop', 'Commute', 'Arrival alert', 'Your metro ride, live.', 'The train moves along your line, stop by stop.', ['Big "4 min" to your stop', 'Wrist alert: next stop, which doors open', 'Always-on keeps the minutes'], 'rgba(139,92,246,.40)', 'rgba(255,209,102,.20)',
    "For the Open Innovation theme, Next Stop makes your metro journey the watch face: the line runs across the screen, your train moves stop by stop, and a big '4 min to Central' tells you exactly when to look up. One stop before arrival the face becomes a full-screen alert showing the station and which side the doors open. Always-on keeps the time and minutes to go on true black.", 'Open Innovation · Commute / transit') },
  { n: 8, name: 'Bloom', ...concept('bloom', 'Wellness', 'Goal reached', 'Your steps grow a flower.', 'Petals open as you move; full bloom at your goal.', ['Progress you can feel, not just read', 'Celebration bloom at 10,000 steps', 'Line-art flower in always-on'], 'rgba(255,143,177,.35)', 'rgba(63,174,90,.28)',
    "For the Open Innovation theme, Bloom turns your step count into a living flower: it grows through the day and its petals open as you move, so progress is something you feel at a glance rather than a number to decode. At 10,000 steps it bursts into full bloom with drifting petals. Always-on redraws the flower as a single grey line beside the time.", 'Open Innovation · Wellness / fitness') },
  { n: 9, name: 'Tide', ...concept('tide', 'Battery', 'Low tide', 'Battery as water.', 'The tide falls through the day and glows red when low.', ['Water level is the battery level', 'Low tide turns warm: charge soon', 'A single wave line in always-on'], 'rgba(47,168,255,.38)', 'rgba(255,107,74,.20)',
    "For the Open Innovation theme, Tide shows your battery as water: the level falls through the day beneath a light hairline clock, so you can judge remaining charge from across the room. At low tide the water turns warm red and the face asks you to charge soon, with an estimate of hours left. Always-on keeps a single wave line at the current level.", 'Open Innovation · Device / utility') },
  { n: 10, name: 'Deep Work', ...concept('deep-work', 'Focus', 'Break time', 'Time to focus.', 'A ring counts down while alerts wait.', ['Focus ring wraps the time', 'Alerts held until your break', 'Turns green when it is time to rest'], 'rgba(255,107,74,.32)', 'rgba(61,220,132,.20)',
    "For the Open Innovation theme, Deep Work wraps the time in a focus ring that counts down your session while notifications wait quietly ('4 alerts on hold'). When the session ends the ring turns green, the break timer starts and the face suggests you stand up and stretch. Always-on keeps a thin grey ring and the remaining focus time.", 'Open Innovation · Productivity / focus') },
];
const svgText = (p) => fs.readFileSync(p, 'utf8');
const previewHtml = (e) => `<html><head><link href="${FONTS}" rel="stylesheet"><style>
  *{box-sizing:border-box} html,body{margin:0;width:1800px;height:1800px;background:#050507;font-family:Inter,sans-serif;color:#fff;overflow:hidden}
  .glow{position:absolute;inset:0;background:radial-gradient(900px 760px at 28% 40%,${e.glow},transparent 70%),radial-gradient(760px 640px at 86% 22%,${e.glow2},transparent 70%)}
  .hero{position:absolute;left:150px;top:230px;width:560px;height:682px}
  .case{position:absolute;inset:-34px;border-radius:150px/160px;background:linear-gradient(145deg,#ececf0,#9b9ba3 18%,#55555d 45%,#26262c 62%,#8a8a93 86%,#d4d4da);box-shadow:0 80px 120px -40px #000}
  .glass{position:absolute;inset:-12px;border-radius:138px/150px;background:#000} .scr{position:absolute;inset:0;border-radius:128px/140px;overflow:hidden} .scr svg,.f svg{width:100%;height:100%;display:block}
  .crown{position:absolute;right:-66px;top:120px;width:40px;height:110px;border-radius:10px;background:repeating-linear-gradient(0deg,#c9c9cf 0 4px,#6a6a72 4px 8px)}
  .band{position:absolute;left:90px;width:380px;height:300px;background:linear-gradient(90deg,#0b0b0e,#22222a 50%,#0b0b0e)} .band.t{top:-330px;border-radius:60px 60px 0 0}.band.b{bottom:-330px;border-radius:0 0 60px 60px}
  .copy{position:absolute;left:880px;top:250px;width:830px} .k{font-size:26px;letter-spacing:.28em;text-transform:uppercase;color:#a9a9b6}
  h1{font-size:150px;font-weight:800;letter-spacing:-.05em;margin:12px 0 0;line-height:.95;background:linear-gradient(180deg,#fff 35%,#a4a4b0);-webkit-background-clip:text;color:transparent}
  .tag{font-size:50px;font-weight:700;line-height:1.15;margin-top:30px;letter-spacing:-.015em} .sub{font-size:36px;color:#b9b9c4;margin-top:12px;line-height:1.3}
  ul{list-style:none;padding:0;margin:40px 0 0;font-size:31px;color:#e2e2ea;line-height:1.7} li:before{content:'— ';color:#7d7d88}
  .row{position:absolute;left:150px;bottom:150px;display:flex;gap:70px} .cell{text-align:center}
  .f{width:250px;height:304px;border-radius:58px/64px;overflow:hidden;box-shadow:0 0 0 8px #17171c,0 0 0 10px #3a3a44,0 30px 50px -20px #000}
  .cell span{display:block;margin-top:26px;font-size:24px;letter-spacing:.14em;text-transform:uppercase;color:#a9a9b6}
  .meta{position:absolute;right:150px;bottom:190px;width:560px;font-size:26px;line-height:1.7;color:#a9a9b6} .meta b{color:#fff;font-weight:600}
</style></head><body><div class="glow"></div>
<div class="hero"><div class="band t"></div><div class="band b"></div><div class="case"></div><div class="glass"></div><div class="crown"></div><div class="scr">${svgText(e.frames[0][1])}</div></div>
<div class="copy"><div class="k">Open Innovation · ${e.kind}</div><h1>${e.name}</h1><div class="tag">${e.tag}</div><div class="sub">${e.sub}</div><ul>${e.bullets.map((b) => `<li>${b}</li>`).join('')}</ul></div>
<div class="row">${e.cells.map(([p, l]) => `<div class="cell"><div class="f">${svgText(p)}</div><span>${l}</span></div>`).join('')}</div>
<div class="meta"><b>368 × 448</b> rectangular OLED<br/>Text ≥ 21 px · icons ≥ 25 px<br/>Part of the <b>Encore</b> collection</div></body></html>`;
(async () => {
  const b = await chromium.launch();
  const prev = await b.newPage({ viewport: { width: 1800, height: 1800 } });
  const fr = await b.newPage({ viewport: { width: 368, height: 448 }, deviceScaleFactor: 3 });
  for (const e of ENTRIES) {
    const nn = String(e.n).padStart(2, '0'), dir = `submission/${nn}-${e.name.replace(/ /g, '-')}`;
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(`${dir}/frames-svg`, { recursive: true }); fs.mkdirSync(`${dir}/frames-png@3x`, { recursive: true });
    const pv = `${dir}/${e.name} - preview 1x1.png`;
    if (e.preview) fs.copyFileSync(e.preview, pv);
    else { await prev.setContent(previewHtml(e), { waitUntil: 'networkidle' }); await prev.evaluate(() => document.fonts.ready); await prev.waitForTimeout(250); await prev.screenshot({ path: pv }); }
    for (const [label, p] of e.frames) {
      const svg = svgText(p);
      fs.writeFileSync(`${dir}/frames-svg/${e.name} - ${label}.svg`, svg);
      await fr.setContent(`<html><head><link href="${FONTS}" rel="stylesheet"><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' });
      await fr.evaluate(() => document.fonts.ready);
      await fr.screenshot({ path: `${dir}/frames-png@3x/${e.name} - ${label}.png`, omitBackground: true });
    }
    fs.writeFileSync(`${dir}/DESCRIPTION.md`, `# ${e.name}\n\n**Submission ${e.n} of 10 · Figma track · Titan Watch Face Design Challenge 2026**\n\n- **Participant:** Amritha S\n- **Design name:** ${e.name}\n- **Challenge:** Open Innovation\n- **Theme / category:** ${e.theme}\n- **Tool:** Figma\n- **Resolution:** 368 × 448 rectangular OLED (Titan design kit) · text ≥ 21 px · icons ≥ 25 px\n- **Figma file (Edit access):** ${e.figma || 'create from frames-svg/ (see IMPORT-TO-FIGMA.md), then paste its link here'}\n\n## Brief design concept (paste into the form)\n${e.concept}\n\n## Frames\n${e.frames.map(([l]) => `- ${e.name} / ${l}`).join('\n')}\n\n## Originality\nOriginal vector artwork made for this challenge. All show, character and place names are fictional; no copyrighted characters, logos or brand marks. No brand logo on the face.\n`);
    fs.writeFileSync(`${dir}/IMPORT-TO-FIGMA.md`, `# Put ${e.name} into its own Figma file (about 1 minute)\n\n1. In Figma: **New design file**, name it \`${nn} · ${e.name} — Titan Watch Face 2026\`.\n2. Drag every file from \`frames-svg/\` onto the canvas. Each becomes an editable vector frame (368 × 448).\n3. Rename each frame to the file name (e.g. \`${e.name} / Active Display\`) and line them up left to right.\n4. Optional: select all frames, press **Shift + A** for auto layout with 80 px gap, and add a text title "${e.name}".\n5. **Share → Anyone with the link → can edit → Copy link**. Paste that link into the portal's "Figma File (Editable Link)" field.\n6. Upload \`${e.name} - preview 1x1.png\` as the Final Preview Export (square, under 5 MB).\n\nFonts used (all free in Figma via Google Fonts): Inter, Inter Tight, Gabarito, Libre Baskerville, Bebas Neue, JetBrains Mono.\n`);
    execFileSync('zip', ['-qr', '-9', `${path.basename(dir)}.zip`, path.basename(dir)], { cwd: 'submission' });
    console.log(`${nn} ${e.name}: ${e.frames.length} frames, zip ${(fs.statSync(`${dir}.zip`).size / 1048576).toFixed(2)} MB, preview ${(fs.statSync(pv).size / 1048576).toFixed(2)} MB`);
  }
  await b.close();
})();

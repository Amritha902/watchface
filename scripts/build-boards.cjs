// Builds each submission into a clear, upload-ready folder:
//   1 - UPLOAD THIS - preview 1x1.png       (Final Preview Export)
//   2 - FIGMA - drag this one file into your Figma file.svg   (all screens + title + concept, editable)
//   3 - FORM TEXT.txt                         (design name, concept, Figma link)
//   board-preview.png, screens-png/, screens-svg/
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@200;300;700;800&family=Gabarito:wght@800&family=Libre+Baskerville:wght@400;700&family=Bebas+Neue&family=JetBrains+Mono:wght@700&display=swap';
const LINKS = {
  '01': 'https://www.figma.com/design/bF4ASsrCe6CD7pQd2NUsVz', '02': 'https://www.figma.com/design/YjlQIGfEwgmFysNBXPFapH',
  '03': 'https://www.figma.com/design/MUukA0dFNrshTbITAxlQcw', '04': 'https://www.figma.com/design/0tHyo4NAZ83qGAlAs4rCVi',
  '05': 'https://www.figma.com/design/6vYaxby18VGa4hitgTSpfM', '06': 'https://www.figma.com/design/HLuKt5YyPHur67PiVCvKvv',
  '07': 'https://www.figma.com/design/U7y4mXiZqY1cFlBM0OKUJY', '08': 'https://www.figma.com/design/oilX3PE8PBoRqrHEk4TH1o',
  '09': 'https://www.figma.com/design/cvw9aktNCeIBlwXgknEFML', '10': 'https://www.figma.com/design/SGhvCTYn7A2Kgv6PSX3xTN' };
const root = 'submission';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wrap = (s, n) => { const out = []; let l = ''; for (const w of s.split(' ')) { if ((l + ' ' + w).trim().length > n) { out.push(l.trim()); l = w; } else l += ' ' + w; } if (l.trim()) out.push(l.trim()); return out; };
const order = (l) => /^Active/.test(l) ? 0 : /^Always/.test(l) ? 2 : 1;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 800, height: 600 } });
  const dirs = fs.readdirSync(root).filter((d) => /^\d\d-/.test(d) && fs.statSync(path.join(root, d)).isDirectory());
  for (const d of dirs) {
    const dir = path.join(root, d), nn = d.slice(0, 2);
    const desc = fs.readFileSync(path.join(dir, 'DESCRIPTION.md'), 'utf8');
    const name = desc.match(/\*\*Design name:\*\* (.*)/)[1], theme = desc.match(/\*\*Theme \/ category:\*\* (.*)/)[1];
    const concept = desc.split('## Brief design concept (paste into the form)\n')[1].split('\n')[0].trim();
    // gather screens (support both old and new folder names)
    const svgDir = fs.existsSync(path.join(dir, 'frames-svg')) ? path.join(dir, 'frames-svg') : path.join(dir, 'screens-svg');
    const pngDir = fs.existsSync(path.join(dir, 'frames-png@3x')) ? path.join(dir, 'frames-png@3x') : path.join(dir, 'screens-png');
    const files = fs.readdirSync(svgDir).filter((f) => f.endsWith('.svg'));
    const screens = files.map((f) => ({ f, label: f.replace(/\.svg$/, '').split(' - ').slice(1).join(' · ') }))
      .sort((a, c) => order(a.label) - order(c.label) || 0);
    // board layout
    const W = 368, H = 448, G = 64, X0 = 96, perRow = screens.length > 6 ? 5 : screens.length;
    const lines = wrap(concept, Math.max(70, Math.min(118, Math.round((perRow * (W + G) - G) / 10.5))));
    const top = 250 + lines.length * 32, rows = Math.ceil(screens.length / perRow);
    const BW = Math.max(X0 * 2 + perRow * W + (perRow - 1) * G, 1500), BH = top + rows * (H + 90) + 110;
    let body = '';
    screens.forEach((s, i) => {
      const x = X0 + (i % perRow) * (W + G), y = top + Math.floor(i / perRow) * (H + 90), p = `s${i}-`;
      let svg = fs.readFileSync(path.join(svgDir, s.f), 'utf8').replace(/<\?xml[^>]*>/, '');
      const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
        .replace(/id="([^"]+)"/g, `id="${p}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`).replace(/href="#([^"]+)"/g, `href="#${p}$1"`);
      body += `<g id="${esc(name)} / ${esc(s.label)}"><clipPath id="${p}frame"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="86"/></clipPath>` +
        `<g clip-path="url(#${p}frame)"><rect x="${x}" y="${y}" width="${W}" height="${H}" fill="#000"/><g transform="translate(${x} ${y}) scale(${(W / 396).toFixed(5)} ${(H / 484).toFixed(5)})">${inner}</g></g>` +
        `<rect x="${x - 7}" y="${y - 7}" width="${W + 14}" height="${H + 14}" rx="92" fill="none" stroke="#2c2c33" stroke-width="6"/></g>` +
        `<text x="${x}" y="${y + H + 44}" font-family="Inter" font-weight="600" font-size="17" letter-spacing="2" fill="#9d9da8">${esc(s.label.toUpperCase())}</text>`;
    });
    const board = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}">` +
      `<defs><radialGradient id="bgglow" cx=".2" cy=".1" r=".9"><stop offset="0" stop-color="#1b1b24"/><stop offset="1" stop-color="#08080a"/></radialGradient></defs>` +
      `<rect width="${BW}" height="${BH}" rx="40" fill="url(#bgglow)"/>` +
      `<text x="${X0}" y="96" font-family="Inter" font-weight="600" font-size="19" letter-spacing="3" fill="#9d9da8">${esc(('Submission ' + nn + ' · ' + theme).toUpperCase())}</text>` +
      `<text x="${X0}" y="182" font-family="Inter" font-weight="800" font-size="84" letter-spacing="-3" fill="#ffffff">${esc(name)}</text>` +
      lines.map((l, i) => `<text x="${X0}" y="${236 + i * 32}" font-family="Inter" font-weight="400" font-size="21" fill="#d2d2da">${esc(l)}</text>`).join('') +
      body +
      `<text x="${X0}" y="${BH - 56}" font-family="Inter" font-weight="400" font-size="18" fill="#8a8a95">368 × 448 rectangular OLED  ·  text ≥ 21 px  ·  icons ≥ 25 px  ·  always-on on true black  ·  all names fictional, no logos  ·  Designed by Amritha S</text></svg>`;
    // new clean layout
    const tmp = dir + '.new'; fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp + '/screens-svg', { recursive: true }); fs.mkdirSync(tmp + '/screens-png', { recursive: true });
    const prev = fs.readdirSync(dir).find((f) => /preview 1x1\.png$/.test(f));
    fs.copyFileSync(path.join(dir, prev), path.join(tmp, `1 - UPLOAD THIS - ${name} preview 1x1.png`));
    fs.writeFileSync(path.join(tmp, `2 - FIGMA - drag this into your Figma file - ${name}.svg`), board);
    for (const s of screens) { fs.copyFileSync(path.join(svgDir, s.f), path.join(tmp, 'screens-svg', s.f)); const pn = s.f.replace(/\.svg$/, '.png'); if (fs.existsSync(path.join(pngDir, pn))) fs.copyFileSync(path.join(pngDir, pn), path.join(tmp, 'screens-png', pn)); }
    fs.writeFileSync(path.join(tmp, '3 - FORM TEXT.txt'),
`SUBMISSION ${nn} of 10  ·  Titan Watch Face Design Challenge 2026  ·  Figma track  ·  Amritha S

DESIGN NAME
${name}

BRIEF DESIGN CONCEPT (theme mentioned)
${concept}

FIGMA FILE (EDITABLE LINK)
${LINKS[nn]}
(Open it, drag in file "2 - FIGMA ..." once, then Share > Anyone with the link > can edit.)

FINAL PREVIEW EXPORT
Upload "1 - UPLOAD THIS - ${name} preview 1x1.png"  (square 1:1, under 5 MB)
`);
    fs.writeFileSync(path.join(tmp, 'START HERE.txt'),
`${name}  ·  submission ${nn} of 10

What is in this folder
  1 - UPLOAD THIS ... preview 1x1.png   The final photo. Upload it as "Final Preview Export".
  2 - FIGMA ... .svg                      Every screen of the design on one board, with title and concept. Fully editable vectors.
  3 - FORM TEXT.txt                       Design name, concept and Figma link, ready to paste.
  board-preview.png                       What the Figma board looks like.
  screens-png/                            Each screen at 3x (1104 × 1344).
  screens-svg/                            Each screen as its own editable SVG (368 × 448).

Put it in Figma (about 30 seconds)
  1. Open ${LINKS[nn]}
  2. Drag "2 - FIGMA ... .svg" onto the canvas. Done: all screens appear as editable layers.
  3. Share > Anyone with the link > can edit.

Fill the form
  Design name, concept and Figma link: copy from "3 - FORM TEXT.txt".
  Final Preview Export: upload "1 - UPLOAD THIS ... preview 1x1.png".

Fonts (all free in Figma): Inter, Inter Tight, Gabarito, Libre Baskerville, Bebas Neue, JetBrains Mono.
`);
    await pg.setViewportSize({ width: BW, height: BH });
    await pg.setContent(`<html><head><link href="${FONTS}" rel="stylesheet"><style>html,body{margin:0;background:#08080a}svg{display:block}</style></head><body>${board}</body></html>`, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    await pg.screenshot({ path: path.join(tmp, 'board-preview.png') });
    fs.rmSync(dir, { recursive: true, force: true }); fs.renameSync(tmp, dir);
    fs.rmSync(dir + '.zip', { force: true });
    execFileSync('zip', ['-qr', '-9', `${d}.zip`, d], { cwd: root });
    console.log(d, screens.length, 'screens', BW + 'x' + BH, (fs.statSync(dir + '.zip').size / 1048576).toFixed(2) + ' MB');
  }
  await b.close();
})();

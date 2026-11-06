// collection.html: all ten designs, each with its concept and every screen (used for usability testing).
const fs = require('node:fs'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = 'submission', out = 'docs/collection';
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const order = (f) => /Active Display\.png$|Active Display - Studio/.test(f) ? 0 : /Active/.test(f) ? 1 : /Always/.test(f) ? 3 : 2;
let sections = '';
for (const d of fs.readdirSync(root).filter((x) => /^\d\d-/.test(x) && fs.statSync(path.join(root, x)).isDirectory()).sort()) {
  const form = fs.readFileSync(path.join(root, d, '3 - FORM TEXT.txt'), 'utf8');
  const name = form.split('DESIGN NAME\n')[1].split('\n')[0];
  const concept = form.split('(theme mentioned)\n')[1].split('\n')[0].replace(/^For the Open Innovation theme, /, '');
  let shots = fs.readdirSync(path.join(root, d, 'screens-png')).filter((f) => f.endsWith('.png')).sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  if (shots.length > 6) shots = shots.filter((f) => /Studio|The Apartment|Gift reveal|Favourite|Describe|Always-On/.test(f));
  const cells = shots.map((f, i) => {
    const o = `${d}-${i}.png`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(root, d, 'screens-png', f), '-vf', 'scale=368:448', path.join(out, o)]);
    const label = f.replace(/\.png$/, '').split(' - ').slice(1).join(' · ');
    return `<figure><img src="docs/collection/${o}" alt="${name}: ${label}"/><figcaption>${label}</figcaption></figure>`;
  }).join('');
  sections += `<section id="${d}"><div class="num">${d.slice(0, 2)} / 10</div><h2>${name}</h2><p>${concept.charAt(0).toUpperCase() + concept.slice(1)}</p><div class="row">${cells}</div></section>`;
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ten watch faces</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>body{margin:0;background:#07070a;color:#eee;font-family:Inter,sans-serif}header,section{max-width:1180px;margin:0 auto;padding:40px 24px}
header h1{font-size:48px;margin:0 0 8px;letter-spacing:-.03em}header p{color:#aaa;font-size:18px;max-width:760px;line-height:1.5}
section{border-top:1px solid #1f1f26}.num{color:#888;font-size:13px;letter-spacing:.2em}h2{font-size:36px;margin:6px 0 10px;letter-spacing:-.02em}
section p{color:#c8c8d0;font-size:17px;line-height:1.55;max-width:860px}.row{display:flex;gap:24px;flex-wrap:wrap;margin-top:22px}
figure{margin:0;text-align:center}figure img{width:246px;height:300px;border-radius:56px;display:block;box-shadow:0 0 0 7px #17171c,0 0 0 9px #34343c}
figcaption{margin-top:14px;color:#9a9aa6;font-size:13px;letter-spacing:.08em;text-transform:uppercase}</style></head><body>
<header><h1>Ten watch faces</h1><p>Ten original faces for a rectangular smartwatch (368 × 448). Each one shows the main screen, an interactive state and the dim always-on screen. Scroll through and judge each design.</p></header>
${sections}</body></html>`;
fs.writeFileSync('collection.html', html);
console.log('collection.html', fs.readdirSync(out).length, 'images');

// motion-preview.gif per submission: crossfades through every screen (Active → Interactive → Always-On).
const fs = require('node:fs'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = 'submission';
for (const d of fs.readdirSync(root).filter((x) => /^\d\d-/.test(x) && fs.statSync(path.join(root, x)).isDirectory())) {
  const dir = path.join(root, d, 'screens-png');
  const order = (f) => /Active/.test(f) ? 0 : /Always/.test(f) ? 2 : 1;
  let files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  if (files.length > 6) files = files.filter((f) => /Active Display - (Studio|The Apartment|Upside|The Vault)|Gift reveal|Favourite|Heart racing|Always-On/.test(f));
  const hold = 1.6, fade = 0.5, args = [];
  files.forEach((f) => args.push('-loop', '1', '-t', String(hold + fade), '-i', path.join(dir, f)));
  let fc = files.map((_, i) => `[${i}]scale=276:336:flags=lanczos,format=rgba,setsar=1[v${i}]`).join(';');
  let last = 'v0', off = hold;
  for (let i = 1; i < files.length; i++) { fc += `;[${last}][v${i}]xfade=transition=fade:duration=${fade}:offset=${off.toFixed(2)}[x${i}]`; last = `x${i}`; off += hold; }
  fc += `;[${last}]fps=10,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`;
  const out = path.join(root, d, 'motion-preview.gif');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args, '-filter_complex', fc, out]);
  fs.copyFileSync(out, `docs/entries/${d}.gif`);
  fs.rmSync(path.join(root, d + '.zip'), { force: true });
  execFileSync('zip', ['-qr', '-9', `${d}.zip`, d], { cwd: root });
  console.log(d, files.length, 'screens', (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
}

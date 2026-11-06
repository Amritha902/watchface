// UPLOAD/NN-Name/: per submission, exactly what the form needs, kept separate:
//   NN-Name - FIGMA LINK.txt
//   NN-Name - 1 Design files.zip   (Figma board SVG, every screen as editable SVG, form text)
//   NN-Name - 2 Images.zip         (final 1:1 preview, every screen PNG @3x, board image, motion GIF)
//   NN-Name - FINAL IMAGE 1x1.png  (the image to upload as "Final Preview Export")
const fs = require('node:fs'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const src = 'submission', out = path.join(src, 'UPLOAD');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
for (const d of fs.readdirSync(src).filter((x) => /^\d\d-/.test(x) && fs.statSync(path.join(src, x)).isDirectory()).sort()) {
  const dir = path.join(src, d), o = path.join(out, d), tmp = path.join(out, '.tmp-' + d);
  fs.mkdirSync(o, { recursive: true });
  const form = fs.readFileSync(path.join(dir, '3 - FORM TEXT.txt'), 'utf8');
  const link = form.split('EDITABLE LINK)\n')[1].split('\n')[0].trim();
  const name = form.split('DESIGN NAME\n')[1].split('\n')[0].trim();
  fs.writeFileSync(path.join(o, `${d} - FIGMA LINK.txt`), `${name}\n\nFigma file (editable link):\n${link}\n\nBefore submitting: open it, then Share > Anyone with the link > can edit.\n`);
  const preview = fs.readdirSync(dir).find((f) => /preview 1x1\.png$/.test(f));
  fs.copyFileSync(path.join(dir, preview), path.join(o, `${d} - FINAL IMAGE 1x1.png`));
  // design zip
  const a = path.join(tmp, `${d} - Design files`); fs.mkdirSync(path.join(a, 'screens-svg'), { recursive: true });
  const board = fs.readdirSync(dir).find((f) => /^2 - FIGMA/.test(f));
  fs.copyFileSync(path.join(dir, board), path.join(a, `${name} - Figma board (drag into Figma).svg`));
  for (const f of fs.readdirSync(path.join(dir, 'screens-svg'))) fs.copyFileSync(path.join(dir, 'screens-svg', f), path.join(a, 'screens-svg', f));
  fs.copyFileSync(path.join(dir, '3 - FORM TEXT.txt'), path.join(a, 'FORM TEXT (name, concept, Figma link).txt'));
  // images zip
  const b = path.join(tmp, `${d} - Images`); fs.mkdirSync(path.join(b, 'screens'), { recursive: true });
  fs.copyFileSync(path.join(dir, preview), path.join(b, `${name} - FINAL IMAGE 1x1.png`));
  for (const f of fs.readdirSync(path.join(dir, 'screens-png'))) fs.copyFileSync(path.join(dir, 'screens-png', f), path.join(b, 'screens', f));
  fs.copyFileSync(path.join(dir, 'board-preview.png'), path.join(b, `${name} - all screens.png`));
  if (fs.existsSync(path.join(dir, 'motion-preview.gif'))) fs.copyFileSync(path.join(dir, 'motion-preview.gif'), path.join(b, `${name} - motion.gif`));
  execFileSync('zip', ['-qr', '-9', path.resolve(o, `${d} - 1 Design files.zip`), path.basename(a)], { cwd: tmp });
  execFileSync('zip', ['-qr', '-9', path.resolve(o, `${d} - 2 Images.zip`), path.basename(b)], { cwd: tmp });
  fs.rmSync(tmp, { recursive: true, force: true });
  const sz = (f) => (fs.statSync(path.join(o, f)).size / 1048576).toFixed(2) + ' MB';
  console.log(d, '|', link, '| design', sz(`${d} - 1 Design files.zip`), '| images', sz(`${d} - 2 Images.zip`), '| final', sz(`${d} - FINAL IMAGE 1x1.png`));
}

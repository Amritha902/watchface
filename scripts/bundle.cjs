// Builds dist/encore.html: the whole prototype in one self-contained file (no server needed;
// AI routes fall back to the built-in generator). Used for usability-test snapshots and sharing.
const fs = require('node:fs');
const strip = (f) => fs.readFileSync(f, 'utf8').replace(/^import .*$/gm, '').replace(/^export \{[^}]*\};?$/gm, '').replace(/^export (const|function|async function|let) /gm, '$1 ');
const js = ['src/faces.js', 'src/watch.js', 'src/app.js'].map(strip).join('\n;\n');
let html = fs.readFileSync('index.html', 'utf8').replace('<script type="module" src="src/app.js"></script>', `<script type="module">\n${js}\n</script>`);
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/encore.html', html);
fs.writeFileSync('dist/index.html', html); // Netlify / static hosting entry point
console.log('dist/encore.html', (html.length / 1024).toFixed(1) + ' KB');

// Figma-ready vector sources, served next to the demo (used to sync the Figma board)
if (fs.existsSync('figma')) {
  fs.mkdirSync('dist/figma', { recursive: true });
  for (const f of fs.readdirSync('figma')) if (f.endsWith('.svg')) fs.copyFileSync(`figma/${f}`, `dist/figma/${f}`);
}

// ten-face motion previews for the collection section
if (fs.existsSync('docs/entries')) {
  fs.mkdirSync('dist/docs/entries', { recursive: true });
  for (const f of fs.readdirSync('docs/entries')) if (f.endsWith('.gif')) fs.copyFileSync(`docs/entries/${f}`, `dist/docs/entries/${f}`);
}

// collection page for usability testing
if (fs.existsSync('collection.html')) {
  fs.copyFileSync('collection.html', 'dist/collection.html');
  fs.mkdirSync('dist/docs/collection', { recursive: true });
  for (const f of fs.readdirSync('docs/collection')) fs.copyFileSync(`docs/collection/${f}`, `dist/docs/collection/${f}`);
}

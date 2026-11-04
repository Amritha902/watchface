// ENCORE — face library. Every wallpaper is original vector art that evokes a show's
// world (a purple apartment door, fairy lights, a vault, neon shapes) without using
// official logos, artwork or likenesses. Official art would come via studio licensing.

export const W = 396, H = 484;
const rad = (d) => (d * Math.PI) / 180;

const blurDef = (id, sd) => `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

// ---------------------------------------------------------------- wallpapers
function studio({ id, secs, palette = ['#5b5bff', '#ff4fa3', '#20d3c2'], bg = '#000' }) {
  const [a, b, c] = palette;
  const x1 = 110 + 40 * Math.sin(secs * 0.25), y1 = 150 + 30 * Math.cos(secs * 0.2);
  const x2 = 300 + 35 * Math.cos(secs * 0.22), y2 = 360 + 30 * Math.sin(secs * 0.27);
  const x3 = 250 + 50 * Math.sin(secs * 0.17 + 1), y3 = 220 + 40 * Math.cos(secs * 0.31);
  return `<defs>${blurDef(id + 'bl', 58)}</defs><rect width="${W}" height="${H}" fill="${bg}"/>
    <g filter="url(#${id}bl)"><circle cx="${x1}" cy="${y1}" r="150" fill="${a}" opacity=".75"/>
    <circle cx="${x2}" cy="${y2}" r="160" fill="${b}" opacity=".6"/><circle cx="${x3}" cy="${y3}" r="90" fill="${c}" opacity=".45"/></g>
    <rect width="${W}" height="${H}" fill="#000" opacity=".18"/>`;
}

function apartment({ id, secs }) {
  let stripes = '';
  for (let x = 0; x < W; x += 18) stripes += `<rect x="${x}" width="8" height="${H}" fill="#fff" opacity=".035"/>`;
  const steam = [0, 1, 2].map((k) => {
    const o = (Math.sin(secs * 1.4 + k * 2) + 1) / 2;
    return `<path d="M${52 + k * 10} 352 C ${46 + k * 10} 340, ${60 + k * 10} 332, ${52 + k * 10} 318" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(0.15 + 0.35 * o).toFixed(2)}"/>`;
  }).join('');
  return `<defs>
      <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7446ad"/><stop offset="1" stop-color="#3a1d62"/></linearGradient>
      <linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5f2f93"/><stop offset="1" stop-color="#4a2276"/></linearGradient>
      <radialGradient id="${id}lamp" cx=".15" cy=".1" r=".7"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e98547"/><stop offset="1" stop-color="#a94c1f"/></linearGradient>
      ${blurDef(id + 'sh', 10)}
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${id}w)"/>${stripes}
    <rect width="${W}" height="${H}" fill="url(#${id}lamp)"/>
    <rect x="232" y="104" width="138" height="340" fill="#000" opacity=".35" filter="url(#${id}sh)"/>
    <rect x="236" y="92" width="134" height="350" rx="3" fill="#e9c44c"/>
    <rect x="248" y="104" width="110" height="338" fill="url(#${id}d)"/>
    <rect x="260" y="120" width="86" height="120" rx="3" fill="none" stroke="#3d1a66" stroke-width="3" opacity=".7"/>
    <rect x="260" y="256" width="86" height="160" rx="3" fill="none" stroke="#3d1a66" stroke-width="3" opacity=".7"/>
    <ellipse cx="303" cy="178" rx="22" ry="28" fill="none" stroke="#e9c44c" stroke-width="6"/>
    <ellipse cx="303" cy="178" rx="13" ry="18" fill="#3a1d62" stroke="#c99f2e" stroke-width="2"/>
    <circle cx="346" cy="300" r="6" fill="#e9c44c"/><circle cx="344" cy="298" r="2" fill="#fff7d0"/>
    <path d="M-20 420 C -20 386 6 372 40 372 L 210 372 C 244 372 262 388 262 420 L 262 ${H} L -20 ${H} Z" fill="url(#${id}c)"/>
    <path d="M-20 404 C -20 380 0 362 24 362 C 48 362 58 380 58 404 L 58 ${H} L -20 ${H} Z" fill="#c76530"/>
    <line x1="120" y1="380" x2="120" y2="${H}" stroke="#8f3e17" stroke-width="2" opacity=".6"/>
    <g transform="translate(36 352)"><rect x="0" y="0" width="34" height="30" rx="6" fill="#f6efe2"/>
      <path d="M34 8 C 46 8 46 24 34 24" stroke="#f6efe2" stroke-width="5" fill="none"/></g>
    ${steam}`;
}

function upside({ id, secs }) {
  const cols = ['#ff3b3b', '#ffd23b', '#3bff8a', '#3bb5ff', '#ff5bd2', '#ff8a3b', '#3bffe6', '#ffd23b', '#ff3b3b'];
  const pts = cols.map((_, i) => { const x = -6 + i * 51; return [x, 78 + 14 * Math.sin(i * 1.3) + (i % 2 ? 10 : 0)]; });
  let wire = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x, y] = pts[i]; wire += ` Q ${(x0 + x) / 2} ${Math.max(y0, y) + 16} ${x} ${y}`; }
  let bulbs = '';
  pts.forEach(([x, y], i) => {
    let f = 0.55 + 0.45 * Math.sin(secs * 2.6 + i * 1.9);
    if (Math.floor(secs * 3 + i * 7) % 23 === 0) f = 0.08; // occasional flicker-out
    bulbs += `<circle cx="${x}" cy="${y + 10}" r="16" fill="${cols[i]}" opacity="${(f * 0.7).toFixed(2)}" filter="url(#${id}g)"/>`;
    bulbs += `<ellipse cx="${x}" cy="${y + 10}" rx="5" ry="7" fill="${cols[i]}" opacity="${(0.4 + 0.6 * f).toFixed(2)}"/>`;
  });
  let trees = `M0 ${H}`;
  for (let x = 0; x <= W + 30; x += 30) { const h = 70 + ((x * 37) % 60); trees += ` L ${x - 15} ${H - 40} L ${x} ${H - 40 - h} L ${x + 15} ${H - 40}`; }
  trees += ` L ${W} ${H} Z`;
  let ash = '';
  for (let i = 0; i < 10; i++) {
    const y = H - ((secs * 10 + i * 53) % (H + 20)), x = (i * 41 + 20 * Math.sin(secs * 0.6 + i)) % W;
    ash += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${1 + (i % 3) * 0.6}" fill="#ffd0d0" opacity=".28"/>`;
  }
  return `<defs>${blurDef(id + 'g', 9)}
      <radialGradient id="${id}r" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#ff1d1d" stop-opacity=".75"/><stop offset=".55" stop-color="#5a0505" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="#050307"/><rect width="${W}" height="${H}" fill="url(#${id}r)"/>
    ${ash}<path d="${trees}" fill="#020102"/>
    <path d="${wire}" stroke="#1b1b1b" stroke-width="2" fill="none"/>${bulbs}`;
}

function vault({ id, secs }) {
  const cx = 318, cy = 300, rot = (secs * 7) % 360;
  let bolts = '';
  for (let k = 0; k < 24; k++) { const a = rad(k * 15); bolts += `<circle cx="${(cx + 176 * Math.cos(a)).toFixed(1)}" cy="${(cy + 176 * Math.sin(a)).toFixed(1)}" r="5" fill="#f3c77a" opacity=".55"/>`; }
  let spokes = '';
  for (let k = 0; k < 3; k++) spokes += `<rect x="${cx - 100}" y="${cy - 6}" width="200" height="12" rx="6" fill="#f3c77a" opacity=".8" transform="rotate(${rot + k * 60} ${cx} ${cy})"/>`;
  return `<defs><radialGradient id="${id}bg" cx=".3" cy=".3" r="1"><stop offset="0" stop-color="#b3141d"/><stop offset=".6" stop-color="#5a070c"/><stop offset="1" stop-color="#1c0204"/></radialGradient>
      <radialGradient id="${id}m" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#3b0a0d"/><stop offset="1" stop-color="#140203"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}bg)"/>
    <circle cx="${cx}" cy="${cy}" r="214" fill="url(#${id}m)" stroke="#f3c77a" stroke-opacity=".35" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="196" fill="none" stroke="#f3c77a" stroke-opacity=".18" stroke-width="10"/>
    ${bolts}<circle cx="${cx}" cy="${cy}" r="140" fill="none" stroke="#f3c77a" stroke-opacity=".22" stroke-width="2" stroke-dasharray="3 9"/>
    ${spokes}<circle cx="${cx}" cy="${cy}" r="34" fill="#2a0306" stroke="#f3c77a" stroke-width="4"/>
    <rect width="${W}" height="${H}" fill="#000" opacity=".12"/>`;
}

function game({ id, secs }) {
  const lit = Math.floor(secs * 1.1) % 3;
  const st = (k) => `stroke="#ff2e88" stroke-width="5" fill="none" opacity="${k === lit ? 1 : 0.35}"`;
  const shapes = (extra) => `<g ${extra}><circle cx="122" cy="116" r="26" ${st(0)}/>
      <path d="M198 88 L 228 140 L 168 140 Z" ${st(1)} stroke-linejoin="round"/>
      <rect x="248" y="91" width="50" height="50" rx="2" ${st(2)}/></g>`;
  let grid = '';
  for (let i = 0; i <= 12; i++) { const x = -200 + i * 66; grid += `<line x1="${W / 2}" y1="300" x2="${x}" y2="${H}" stroke="#14c2a8" stroke-width="1" opacity=".3"/>`; }
  for (let j = 0; j < 7; j++) { const y = 300 + (j * j * 4.6) + ((secs * 6) % 10) * (j / 7); grid += `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="#14c2a8" stroke-width="1" opacity="${(0.08 + j * 0.04).toFixed(2)}"/>`; }
  return `<defs>${blurDef(id + 'g', 8)}
      <radialGradient id="${id}p" cx=".5" cy=".18" r=".7"><stop offset="0" stop-color="#ff2e88" stop-opacity=".35"/><stop offset="1" stop-color="#ff2e88" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14c2a8" stop-opacity="0"/><stop offset="1" stop-color="#0c6e61" stop-opacity=".55"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="#0c0910"/><rect width="${W}" height="${H}" fill="url(#${id}p)"/>
    <rect y="300" width="${W}" height="${H - 300}" fill="url(#${id}f)"/>${grid}
    ${shapes(`filter="url(#${id}g)"`)}${shapes('')}`;
}

// motifs for prompt-generated faces
const MOTIFS = {
  waves: ({ secs, pal }) => [0, 1, 2].map((k) => {
    let d = `M0 ${H}`;
    for (let x = 0; x <= W; x += 12) d += ` L ${x} ${(330 + k * 38 + 12 * Math.sin(x / 40 + secs * (0.6 + k * 0.2) + k)).toFixed(1)}`;
    return `<path d="${d} L ${W} ${H} Z" fill="${pal[2]}" opacity="${0.18 + k * 0.16}"/>`;
  }).join(''),
  skyline: ({ secs, pal }) => {
    let o = ''; let x = 0, i = 0;
    while (x < W) {
      const w = 34 + ((i * 53) % 30), h = 110 + ((i * 97) % 170);
      o += `<rect x="${x}" y="${H - h}" width="${w - 3}" height="${h}" fill="#05030c" opacity=".92"/>`;
      for (let wy = H - h + 12; wy < H - 10; wy += 16) for (let wx = x + 6; wx < x + w - 10; wx += 10)
        if (((wx * 7 + wy * 13 + i) % 5) === 0) o += `<rect x="${wx}" y="${wy}" width="4" height="6" fill="${pal[2]}" opacity="${(0.4 + 0.5 * ((Math.sin(secs + wx + wy) + 1) / 2)).toFixed(2)}"/>`;
      x += w; i++;
    }
    return o;
  },
  trees: ({ pal }) => {
    let o = '';
    for (let k = 0; k < 2; k++) { let d = `M0 ${H}`; for (let x = -10; x <= W + 30; x += 26) { const h = 90 + ((x * (31 + k * 9)) % 80) + k * 40; d += ` L ${x - 13} ${H - 30 + k * 10} L ${x} ${H - 30 - h + k * 60} L ${x + 13} ${H - 30 + k * 10}`; } o += `<path d="${d} L ${W} ${H} Z" fill="${k ? '#02100a' : pal[1]}" opacity="${k ? 0.95 : 0.6}"/>`; }
    return o;
  },
  sun: ({ pal }) => {
    let o = `<circle cx="${W / 2}" cy="360" r="120" fill="${pal[2]}"/>`;
    for (let k = 0; k < 6; k++) o += `<rect x="0" y="${330 + k * 18}" width="${W}" height="${4 + k * 1.6}" fill="${pal[0]}"/>`;
    return o + `<rect y="380" width="${W}" height="${H - 380}" fill="${pal[0]}" opacity=".85"/>`;
  },
  cups: ({ secs, pal }) => {
    const steam = [0, 1, 2].map((k) => `<path d="M${168 + k * 16} 330 C ${160 + k * 16} 310, ${180 + k * 16} 296, ${168 + k * 16} 276" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="${(0.15 + 0.3 * ((Math.sin(secs * 1.3 + k * 2) + 1) / 2)).toFixed(2)}"/>`).join('');
    let rain = '';
    for (let i = 0; i < 26; i++) { const x = (i * 37) % W, y = ((secs * 140 + i * 71) % (H + 40)) - 20; rain += `<line x1="${x}" y1="${y.toFixed(0)}" x2="${x - 4}" y2="${(y + 16).toFixed(0)}" stroke="#fff" stroke-width="1" opacity=".18"/>`; }
    return rain + `<g transform="translate(110 0)"><rect x="140" y="336" width="88" height="80" rx="16" fill="${pal[2]}"/><path d="M228 352 C 262 352 262 396 228 396" stroke="${pal[2]}" stroke-width="10" fill="none"/>
      <ellipse cx="184" cy="420" rx="70" ry="10" fill="#000" opacity=".3"/>${steam}</g>`;
  },
};

// ---------------------------------------------------------------- face catalogue
export const FACES = {
  studio: {
    id: 'studio', name: 'Studio', show: null, accent: '#8d8dff', ink: '#ffffff',
    timeFont: "'Inter Tight', 'Inter', sans-serif", timeWeight: 700, layout: 'center', wallpaper: studio,
  },
  friends: {
    id: 'friends', name: 'The Apartment', show: 'Friends', service: 'Netflix', ep: 'S3 · E7', left: 22, accent: '#e9c44c', ink: '#FFF4DC',
    timeFont: "'Gabarito', sans-serif", timeWeight: 800, layout: 'stack', wallpaper: apartment, nudge: 'Coffee break at 4?',
  },
  stranger: {
    id: 'stranger', name: 'Upside', show: 'Stranger Things', service: 'Netflix', ep: 'S4 · E2', left: 41, accent: '#ff3030', ink: '#ffe9e9',
    timeFont: "'Libre Baskerville', serif", timeWeight: 700, layout: 'glow', wallpaper: upside, nudge: 'Lights on before bed',
  },
  heist: {
    id: 'heist', name: 'The Vault', show: 'Money Heist', service: 'Netflix', ep: 'S5 · E3', left: 33, accent: '#f3c77a', ink: '#FFE7C2',
    timeFont: "'Bebas Neue', sans-serif", timeWeight: 400, layout: 'stack', wallpaper: vault, nudge: 'Stick to the plan',
  },
  squid: {
    id: 'squid', name: 'The Game', show: 'Squid Game', service: 'Netflix', ep: 'S2 · E5', left: 18, accent: '#ff2e88', ink: '#ffffff',
    timeFont: "'JetBrains Mono', monospace", timeWeight: 700, layout: 'center', wallpaper: game, nudge: 'Move: 3,000 steps to go',
  },
};

// ---------------------------------------------------------------- prompt → face
const MOODS = [
  [/coffee|caf[eé]|cos[yz]|rain|book/, { motif: 'cups', pal: ['#1d120c', '#5c3a26', '#f2c89b'], font: "'Gabarito', sans-serif", w: 800, layout: 'stack' }],
  [/neon|tokyo|city|night|cyber|seoul|mumbai/, { motif: 'skyline', pal: ['#0a0620', '#3a0f6b', '#ff4fd8'], font: "'Inter Tight', sans-serif", w: 800, layout: 'center' }],
  [/ocean|beach|sea|wave|surf|goa|calm/, { motif: 'waves', pal: ['#021a30', '#0b5f93', '#7fe3ff'], font: "'Inter Tight', sans-serif", w: 300, layout: 'center' }],
  [/forest|nature|mountain|green|tree|hike/, { motif: 'trees', pal: ['#06140c', '#1f5c35', '#9dffb0'], font: "'Libre Baskerville', serif", w: 700, layout: 'stack' }],
  [/sunset|retro|80s|synth|vapor|summer/, { motif: 'sun', pal: ['#1a0633', '#ff5e7e', '#ffc65e'], font: "'Bebas Neue', sans-serif", w: 400, layout: 'center' }],
];
const COLORS = { red: '#ff4d4d', blue: '#4da3ff', pink: '#ff6fb5', gold: '#f3c77a', purple: '#a77bff', green: '#4dffa0', orange: '#ff9a3c', teal: '#2fe0c8' };

export function faceFromPrompt(prompt) {
  const p = prompt.toLowerCase();
  if (/friends|central perk|ross|rachel|chandler/.test(p)) return { ...FACES.friends, name: 'Your Apartment', fromPrompt: prompt };
  if (/stranger|upside|hawkins|eleven/.test(p)) return { ...FACES.stranger, fromPrompt: prompt };
  if (/heist|vault|professor|money/.test(p)) return { ...FACES.heist, fromPrompt: prompt };
  if (/squid|game/.test(p)) return { ...FACES.squid, fromPrompt: prompt };
  let mood = MOODS.find(([re]) => re.test(p))?.[1];
  let h = 0; for (const ch of p) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  if (!mood) {
    const hue = h % 360, c = (l, s = 70) => `hsl(${hue} ${s}% ${l}%)`;
    mood = { motif: null, pal: [c(4, 40), c(30), c(65, 90)], font: "'Inter Tight', sans-serif", w: 700, layout: 'center' };
  }
  const pal = [...mood.pal];
  const colour = Object.keys(COLORS).find((k) => p.includes(k));
  if (colour) pal[2] = COLORS[colour];
  const name = prompt.trim().split(/\s+/).slice(0, 3).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') || 'Yours';
  return {
    id: 'custom-' + h, name, show: null, accent: pal[2], ink: '#ffffff', fromPrompt: prompt,
    timeFont: mood.font, timeWeight: mood.w, layout: mood.layout,
    wallpaper: ({ id, secs }) => {
      const base = `<defs><linearGradient id="${id}cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}cg)"/>`;
      return mood.motif ? base + MOTIFS[mood.motif]({ secs, pal }) : studio({ id, secs, palette: [pal[1], pal[2], pal[1]], bg: pal[0] });
    },
  };
}

// ---------------------------------------------------------------- your photo → face
// Any image the user picks (stays on the device) becomes the wallpaper, wrapped in a show's
// styling. The prototype never ships or commits third-party photos.
export function faceFromPhoto(dataUrl, base = FACES.friends, focus = 'xMidYMid') {
  // (frame / clockPos / dim are applied by the renderer, so they work on every face)
  return {
    ...base, id: 'photo-' + dataUrl.length, name: base.show ? `${base.show} · Your photo` : 'Your photo',
    layout: 'photo', photo: dataUrl,
    wallpaper: ({ id }) => `<defs><linearGradient id="${id}ps" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset=".32" stop-color="#000" stop-opacity="0"/>
        <stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="${base.accent}"/>
      <image href="${dataUrl}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="${focus} slice"/>
      <rect width="${W}" height="${H}" fill="url(#${id}ps)"/>
      <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="89" fill="none" stroke="${base.accent}" stroke-width="6" opacity=".9"/>`,
  };
}

// ---------------------------------------------------------------- favourite character → face
// style: the card from /api/style (Claude). image: optional AI wallpaper (data: URL).
const WEIGHT = { 'Inter Tight': 800, Gabarito: 800, 'Libre Baskerville': 700, 'Bebas Neue': 400, 'JetBrains Mono': 700 };
export function faceFromStyle(style, base, character, image = null) {
  const [bg, mid, accent] = style.palette;
  const look = { ...base, accent, ink: style.ink, nudge: style.nudge, timeFont: `'${style.timeFont}', sans-serif`, timeWeight: WEIGHT[style.timeFont] || 700 };
  if (image) return { ...faceFromPhoto(image, look), id: 'char-' + character, name: style.name, character, style };
  const gen = faceFromPrompt(`${style.motifs.join(' ')} ${style.mood}`);
  return { ...gen, ...look, layout: gen.layout, id: 'char-' + character, name: style.name, character, style,
    wallpaper: ({ id, secs }) => studio({ id, secs, palette: [mid, accent, mid], bg }) };
}

// offline fallback when no Claude key: the show's own scene, re-tinted per character
const CHAR_TINT = ['#ff6fb5', '#4da3ff', '#ffb547', '#7cf29a', '#c77bff', '#ff6b4d', '#2fe0c8', '#f3c77a'];
export function faceForCharacterOffline(base, character, i) {
  return { ...base, id: 'char-' + character, name: `${character}'s ${base.name.replace(/^The /, '')}`, character, accent: CHAR_TINT[i % CHAR_TINT.length] };
}

// ---------------------------------------------------------------- refine: "make it darker", "put it in a circle"…
// A face's editable settings. Claude (via /api/refine) or the offline rules below produce a patch.
export const EDITABLE = ['accent', 'ink', 'timeFont', 'frame', 'clockPos', 'timeScale', 'dim', 'hideCard'];
export const settingsOf = (f) => ({
  accent: f.accent, ink: f.ink, timeFont: (f.timeFont.match(/'([^']+)'/) || [, 'Inter Tight'])[1],
  frame: f.frame || 'full', clockPos: f.clockPos || 'auto', timeScale: f.timeScale || 1, dim: f.dim || 0, hideCard: !!f.hideCard,
});
export function applyPatch(face, patch) {
  const f = { ...face };
  for (const k of EDITABLE) if (patch[k] !== undefined && patch[k] !== null) f[k] = patch[k];
  if (patch.timeFont) { f.timeFont = `'${patch.timeFont}', sans-serif`; f.timeWeight = WEIGHT[patch.timeFont] || 700; }
  f.timeScale = Math.min(1.5, Math.max(0.6, +f.timeScale || 1));
  f.dim = Math.min(0.7, Math.max(-0.3, +f.dim || 0));
  f.id = face.id.replace(/~\d+$/, '') + '~' + Date.now() % 100000;
  return f;
}
const FONT_WORDS = [[/serif|classic|elegant/, 'Libre Baskerville'], [/mono|code|typewriter|retro computer/, 'JetBrains Mono'], [/condensed|tall|poster|bold/, 'Bebas Neue'], [/round|friendly|chunky|playful/, 'Gabarito'], [/minimal|clean|modern|apple/, 'Inter Tight']];
export function refineOffline(face, text) {
  const t = text.toLowerCase(), cur = settingsOf(face), patch = {}, done = [];
  if (/circle|medallion|round frame|badge|porthole/.test(t)) { patch.frame = 'medallion'; done.push('framed in a medallion'); }
  else if (/full ?(screen|bleed)|edge to edge|no circle|remove (the )?circle/.test(t)) { patch.frame = 'full'; done.push('full-screen artwork'); }
  for (const pos of ['left', 'right', 'center']) if (new RegExp(`(clock|time).*${pos}|${pos}.*(clock|time)`).test(t.replace('centre', 'center'))) { patch.clockPos = pos; done.push(`clock ${pos}`); }
  if (/bigger|larger|huge|giant/.test(t)) { patch.timeScale = cur.timeScale * 1.18; done.push('bigger time'); }
  if (/smaller|tiny|subtle/.test(t)) { patch.timeScale = cur.timeScale / 1.18; done.push('smaller time'); }
  if (/darker|moodier|night|dim/.test(t)) { patch.dim = cur.dim + 0.18; done.push('darker'); }
  if (/brighter|lighter|sunny/.test(t)) { patch.dim = cur.dim - 0.15; done.push('brighter'); }
  const col = Object.keys(COLORS).find((k) => t.includes(k)); if (col) { patch.accent = COLORS[col]; done.push(`${col} accent`); }
  const font = FONT_WORDS.find(([re]) => re.test(t)); if (font) { patch.timeFont = font[1]; done.push(`${font[1]} type`); }
  if (/hide (the )?card|no card|cleaner|declutter/.test(t)) { patch.hideCard = true; done.push('card hidden'); }
  if (/show (the )?card|add (the )?card/.test(t)) { patch.hideCard = false; done.push('card shown'); }
  return { patch, summary: done.length ? done.join(' · ') : "Didn't catch that. Try “circle frame”, “clock left”, “darker”, “gold”, “serif”." };
}

// Four more original concepts (entries 3, 4, 5, 9): Heartwritten, Inner Weather, Threshold, Day Weave.
// Same canvas and rules as concepts.js: 396×484 units rendered at 368×448, text ≥21px, icons ≥25px.
const HEAD = (id) => `<svg width="368" height="448" preserveAspectRatio="none" viewBox="0 0 396 484" xmlns="http://www.w3.org/2000/svg"><defs>
<clipPath id="${id}c"><rect width="396" height="484" rx="92"/></clipPath>
<filter id="${id}b" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"/></filter>
<filter id="${id}s" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter></defs><g clip-path="url(#${id}c)">`;
const END = '</g></svg>';
const T = (x, y, size, weight, fill, text, anchor = 'start', font = 'Inter', extra = '') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${text}</text>`;
const HEART = (x, y, k, c = '#ff4d5e') => `<path transform="translate(${x} ${y}) scale(${k})" fill="${c}" d="M0 6 C -9 -1 -11 -8 -6 -11 C -3 -13 0 -11 0 -8 C 0 -11 3 -13 6 -11 C 11 -8 9 -1 0 6Z"/>`;
const STATUS = (ink = '#fff', hr = 68, aod = false) => T(38, 62, 23, 700, ink, 'WED 4', 'start', 'Inter', 'letter-spacing="1.5"') + HEART(String(hr).length > 2 ? 292 : 306, 54, 1.4, aod ? '#7a3a3a' : '#ff4d5e') + T(360, 62, 23, 700, ink, hr, 'end');
const GREY = '#a8a8a8';

// ---------------------------------------------------------------- Heartwritten
// One continuous heartbeat line that rises into the digits 1 0 : 0 9 and falls back to the baseline.
function ecgTime(base = 286, top = 128, beats = 1) {
  const blip = (x) => beats ? ` L ${x} ${base} L ${x + 5} ${base - 10} L ${x + 9} ${base} L ${x + 12} ${base + 14} L ${x + 16} ${base - 30 * beats} L ${x + 20} ${base + 10} L ${x + 24} ${base}` : '';
  // the "1" is a heartbeat spike; zeros and the nine sit on the line as rounded loops
  let d = `M -10 ${base}` + blip(2) + ` L 50 ${base} L 70 ${top} L 70 ${base} M 56 ${top + 18} L 70 ${top}`;
  d += ` M 70 ${base} L 406 ${base}`;
  const h = base - top, w = 64, r = 30;
  const zero = (x) => ` M ${x + r} ${top} L ${x + w - r} ${top} A ${r} ${r} 0 0 1 ${x + w} ${top + r} L ${x + w} ${base - r} A ${r} ${r} 0 0 1 ${x + w - r} ${base} L ${x + r} ${base} A ${r} ${r} 0 0 1 ${x} ${base - r} L ${x} ${top + r} A ${r} ${r} 0 0 1 ${x + r} ${top} Z`;
  const lh = h * 0.52;
  const nine = (x) => ` M ${x + r} ${top} L ${x + w - r} ${top} A ${r} ${r} 0 0 1 ${x + w} ${top + r} L ${x + w} ${top + lh - r} A ${r} ${r} 0 0 1 ${x + w - r} ${top + lh} L ${x + r} ${top + lh} A ${r} ${r} 0 0 1 ${x} ${top + lh - r} L ${x} ${top + r} A ${r} ${r} 0 0 1 ${x + r} ${top} Z M ${x + w} ${top + r} L ${x + w} ${base - r} A ${r} ${r} 0 0 1 ${x + w - r} ${base}`;
  void h;
  return d + zero(94) + zero(220) + nine(304);
}
export function heartwritten(state = 'active', id = 'hw') {
  let s = HEAD(id);
  const path = ecgTime(286, 128, state === 'alt' ? 1.8 : 1);
  const colon = (c, r = 7) => `<circle cx="192" cy="180" r="${r}" fill="${c}"/><circle cx="192" cy="238" r="${r}" fill="${c}"/>`;
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 64, true);
    s += `<path d="${ecgTime(286, 128, 0)}" fill="none" stroke="${GREY}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>` + colon(GREY, 5);
    s += T(198, 384, 27, 600, GREY, '64 bpm', 'middle');
    return s + END;
  }
  const hot = state === 'alt';
  const c1 = hot ? '#ffb020' : '#ff4d6d', c2 = hot ? '#ff3b30' : '#ff9a8b';
  s += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="${id}r" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="${hot ? '#3a0d06' : '#2a0712'}"/><stop offset="1" stop-color="#050203"/></radialGradient>
    <pattern id="${id}grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0 H0 V22" fill="none" stroke="#ff4d6d" stroke-opacity=".09" stroke-width="1"/></pattern></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}r)"/><rect width="396" height="484" fill="url(#${id}grid)"/>`;
  s += STATUS('#fff', hot ? 142 : 68);
  s += `<path d="${path}" fill="none" stroke="${c1}" stroke-width="${hot ? 22 : 16}" stroke-linejoin="round" opacity=".55" filter="url(#${id}s)"/>`;
  s += `<path d="${path}" fill="none" stroke="url(#${id}g)" stroke-width="${hot ? 9 : 8}" stroke-linejoin="round" stroke-linecap="round"/>`;
  s += colon(`url(#${id}g)`, 7);
  s += `<circle cx="396" cy="286" r="10" fill="#fff" filter="url(#${id}s)"/>`;
  if (hot) {
    s += `<rect x="18" y="352" width="360" height="100" rx="30" fill="#140806" fill-opacity=".8" stroke="#ffb020" stroke-opacity=".35"/>`;
    s += T(40, 394, 23, 700, '#fff', 'Zone 4 · Run') + T(40, 426, 21, 400, '#fff', '142 bpm · 24 min in', 'start', 'Inter', 'opacity=".75"');
    [0, 1, 2, 3, 4].forEach((i) => { s += `<rect x="${268 + i * 20}" y="${410 - i * 9}" width="14" height="${18 + i * 9}" rx="4" fill="${i < 4 ? '#ffb020' : '#fff'}" opacity="${i < 4 ? 1 : .25}"/>`; });
  } else {
    s += `<rect x="18" y="352" width="360" height="100" rx="30" fill="#1a0a10" fill-opacity=".75" stroke="#fff" stroke-opacity=".12"/>`;
    s += HEART(62, 402, 2.3) + T(96, 394, 23, 700, '#fff', '68 bpm · resting') + T(96, 426, 21, 400, '#fff', 'Your pulse writes the time', 'start', 'Inter', 'opacity=".72"');
  }
  return s + END;
}

const rnd2 = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
function softCloud(x, y, k, top, bottom, op, id, n) {
  const g = `${id}cg${n}`;
  const puffs = [[-46, 6, 26], [-20, -10, 34], [14, -16, 38], [44, -2, 28], [62, 10, 20], [-62, 14, 18]];
  let s = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient><filter id="${g}f" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${(2.2 / k).toFixed(2)}"/></filter></defs>`;
  s += `<g transform="translate(${x} ${y}) scale(${k})" opacity="${op}">`;
  s += `<ellipse cx="4" cy="26" rx="80" ry="12" fill="#000" opacity=".12" filter="url(#${id}s)"/>`;
  s += `<g fill="url(#${g})" filter="url(#${g}f)">` + puffs.map(([px, py, r]) => `<circle cx="${px}" cy="${py}" r="${r}"/>`).join('') + `<rect x="-74" y="4" width="146" height="26" rx="13"/></g>`;
  s += `</g>`;
  return s;
}
// ---------------------------------------------------------------- Inner Weather
export function innerWeather(state = 'active', id = 'iw') {
  let s = HEAD(id);
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 66, true);
    s += T(198, 250, 118, 300, GREY, '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
    s += `<circle cx="150" cy="330" r="14" fill="none" stroke="${GREY}" stroke-width="3"/>` + T(176, 340, 27, 500, GREY, 'Clear');
    return s + END;
  }
  const storm = state === 'alt';
  if (!storm) {
    s += `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3a78"/><stop offset=".55" stop-color="#6f86c9"/><stop offset="1" stop-color="#f6c49a"/></linearGradient>
      <radialGradient id="${id}sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d8"/><stop offset=".6" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient></defs>`;
    s += `<rect width="396" height="484" fill="url(#${id}sky)"/>`;
    s += `<circle cx="300" cy="330" r="150" fill="#ffd27a" opacity=".45" filter="url(#${id}b)"/><circle cx="300" cy="330" r="62" fill="url(#${id}sun)"/>`;
    s += softCloud(78, 128, .78, '#ffffff', '#c9d3f0', .85, id, 1) + softCloud(330, 104, .5, '#ffffff', '#cdd6f2', .7, id, 2) + softCloud(96, 318, .62, '#fff4ea', '#e9c2b4', .75, id, 3);
    s += STATUS('#fff', 66);
    s += T(198, 250, 118, 300, '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
    s += `<rect x="18" y="352" width="360" height="100" rx="30" fill="#0e1a3a" fill-opacity=".45" stroke="#fff" stroke-opacity=".25"/>`;
    s += `<circle cx="62" cy="402" r="16" fill="#ffd27a"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = i * Math.PI / 4; return `<line x1="${(62 + 21 * Math.cos(a)).toFixed(1)}" y1="${(402 + 21 * Math.sin(a)).toFixed(1)}" x2="${(62 + 27 * Math.cos(a)).toFixed(1)}" y2="${(402 + 27 * Math.sin(a)).toFixed(1)}" stroke="#ffd27a" stroke-width="3" stroke-linecap="round"/>`; }).join('');
    s += T(104, 394, 23, 700, '#fff', 'Inner weather: Clear') + T(104, 426, 21, 400, '#fff', 'Stress low · HRV 62 ms', 'start', 'Inter', 'opacity=".8"');
    return s + END;
  }
  s += `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1118"/><stop offset=".6" stop-color="#2b3445"/><stop offset="1" stop-color="#46506a"/></linearGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}sky)"/>`;
  s += softCloud(80, 108, 1.25, '#8a93a8', '#3a4152', .95, id, 4) + softCloud(318, 92, 1.05, '#7c859a', '#323849', .95, id, 5) + softCloud(206, 150, 1.15, '#9aa3b6', '#454c5e', .9, id, 6);
  for (let i = 0; i < 70; i++) { const x = rnd2(i) * 420 - 10, y = 150 + rnd2(i + 300) * 320, l = 14 + rnd2(i + 600) * 18; s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - l * .32).toFixed(1)}" y2="${(y + l).toFixed(1)}" stroke="#c7d3ec" stroke-width="1.4" opacity="${(.15 + rnd2(i + 900) * .3).toFixed(2)}" stroke-linecap="round"/>`; }
  s += `<path d="M344 268 L 328 306 L 344 306 L 334 342 L 364 296 L 348 296 L 360 268 Z" fill="#ffe27a"/><path d="M344 268 L 328 306 L 344 306 L 334 342 L 364 296 L 348 296 L 360 268 Z" fill="#ffe27a" opacity=".6" filter="url(#${id}s)"/>`;
  s += STATUS('#fff', 104);
  s += T(198, 262, 118, 300, '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
  s += `<rect x="18" y="352" width="360" height="100" rx="30" fill="#0a0d14" fill-opacity=".7" stroke="#ffe27a" stroke-opacity=".3"/>`;
  s += T(40, 394, 23, 700, '#fff', 'Storm building') + T(40, 426, 21, 400, '#fff', 'Stress rising · 3 calls', 'start', 'Inter', 'opacity=".75"');
  s += `<rect x="252" y="378" width="108" height="48" rx="24" fill="#ffe27a"/>` + T(306, 410, 23, 800, '#111', 'Breathe', 'middle');
  return s + END;
}

// ---------------------------------------------------------------- Threshold (kolam)
// A real sikku kolam: one line weaves diagonally between a square grid of dots (pulli) and loops
// around the outside at every edge, drawn rotated 45° into a diamond. One edge loop fills per 3 minutes.
function sikku(n, a, cx, cy, done, aod, full) {
  const P = (x, y) => { // grid → screen (rotate 45° around grid centre)
    return [cx + (x - (n - 1) / 2) * a, cy + (y - (n - 1) / 2) * a];
  };
  const lo = -0.5, hi = n - 0.5, pt = ([x, y]) => P(x, y).map((v) => v.toFixed(1)).join(' ');
  const clip = (c, slope) => { // segment of x + slope*y = c inside the square
    const pts = [];
    for (const x of [lo, hi]) { const y = (c - x) / slope; if (y >= lo - 1e-9 && y <= hi + 1e-9) pts.push([x, y]); }
    for (const y of [lo, hi]) { const x = c - slope * y; if (x > lo + 1e-9 && x < hi - 1e-9) pts.push([x, y]); }
    return pts.length >= 2 ? pts.slice(0, 2) : null;
  };
  const lines = [];
  for (let c = -0.5; c <= 2 * n - 1.5; c += 1) { const sg = clip(c, 1); if (sg) lines.push(sg); }
  for (let c = -(n - 0.5); c <= n - 0.5; c += 1) { const sg = clip(c, -1); if (sg) lines.push(sg); }
  // edge loops: at every edge point beside a dot, the two diagonals turn around outside
  const loops = [], d = 0.44, r = d * Math.SQRT1_2;
  const edge = [];
  for (let i = 0; i < n; i++) edge.push([[i, lo], [0, -1]]);
  for (let j = 0; j < n; j++) edge.push([[hi, j], [1, 0]]);
  for (let i = n - 1; i >= 0; i--) edge.push([[i, hi], [0, 1]]);
  for (let j = n - 1; j >= 0; j--) edge.push([[lo, j], [-1, 0]]);
  for (const [[px, py], [nx, ny]] of edge) {
    const C = [px + nx * d, py + ny * d], base = Math.atan2(-ny, -nx), pts = [];
    for (let t = 0; t <= 36; t++) { const ang = base + Math.PI / 4 + (t / 36) * (Math.PI * 1.5); pts.push([C[0] + r * Math.cos(ang), C[1] + r * Math.sin(ang)]); }
    loops.push(`M${pt([px, py])} ` + pts.map((q) => `L${pt(q)}`).join(' ') + ` L${pt([px, py])}`);
  }
  const pal = ['#ffb627', '#ff6b8b', '#ffd27a', '#4fd1a5'];
  let s = '';
  const sw = aod ? 2.2 : 4;
  const base = aod ? GREY : '#fff4e2';
  if (!aod) s += `<path d="${lines.map(([p1, p2]) => `M${pt(p1)} L${pt(p2)}`).join(' ')} ${loops.join(' ')}" fill="none" stroke="#ffb627" stroke-width="${sw * 3}" opacity="${full ? .35 : .12}" filter="url(#thglow)"/>`;
  s += `<path d="${lines.map(([p1, p2]) => `M${pt(p1)} L${pt(p2)}`).join(' ')}" fill="none" stroke="${full ? '#ffd27a' : base}" stroke-width="${sw}" stroke-linecap="round" opacity="${aod ? .5 : .92}"/>`;
  loops.forEach((l, i) => { const on = full || i < done; s += `<path d="${l}" fill="none" stroke="${aod ? GREY : on ? pal[i % pal.length] : base}" stroke-width="${sw}" stroke-linejoin="round" opacity="${aod ? .5 : on ? 1 : .55}"/>`; });
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += `<circle cx="${P(i, j)[0].toFixed(1)}" cy="${P(i, j)[1].toFixed(1)}" r="${aod ? 2.6 : 4.2}" fill="${aod ? GREY : '#fff4e2'}"/>`;
  return s;
}
export function threshold(state = 'active', id = 'th') {
  let s = HEAD(id);
  const aod = state === 'aod', full = state === 'alt';
  s += `<defs><filter id="thglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
  if (aod) {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 66, true);
    s += T(198, 152, 84, 800, GREY, '10:09', 'middle', 'Gabarito', 'letter-spacing="-2"');
    s += sikku(5, 34, 198, 300, 0, true, false);
    return s + END;
  }
  s += `<defs><radialGradient id="${id}bg" cx=".5" cy=".62" r=".75"><stop offset="0" stop-color="${full ? '#9a3414' : '#7a2a16'}"/><stop offset=".6" stop-color="#4a170b"/><stop offset="1" stop-color="#1f0804"/></radialGradient>
    <pattern id="${id}grain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#ffd9b0" opacity=".07"/><circle cx="4" cy="4" r=".5" fill="#000" opacity=".12"/></pattern></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}bg)"/><rect width="396" height="484" fill="url(#${id}grain)"/>`;
  s += `<circle cx="198" cy="304" r="130" fill="#ffb627" opacity="${full ? .32 : .14}" filter="url(#${id}b)"/>`;
  s += STATUS('#fff4e2', 66);
  s += T(198, 152, 84, 800, full ? '#ffd27a' : '#fff4e2', full ? '11:00' : '10:09', 'middle', 'Gabarito', 'letter-spacing="-2"');
  s += sikku(5, 34, 198, 300, full ? 20 : 3, false, full);
  s += T(198, 452, 21, 600, '#fff4e2', full ? 'Kolam complete · new one at 11' : '9 min drawn · one loop every 3', 'middle', 'Inter', 'opacity=".8"');
  return s + END;
}

// ---------------------------------------------------------------- Day Weave
const DAY = ['s', 's', 's', 's', 's', 's', 's', 'm', 'w', 'x', 'i', '', '', '', '', '', '', '', '', '', '', '', '', ''];
const WEEK = ['ssssssswmxixxwxmmxxwssss', 'sssssssmxxxxxxwxxmmxssss', 'sssssssxmxxixxxxwwxxssss', 'ssssssswmxixxxxmxxxxssss', 'ssssssssmxxxxxxwwmmmxsss', 'sssssssssmmwwwwxxmmmmsss', 'sssssssmwxi'];
const COL = { s: '#5b5bd6', m: '#3ddc84', w: '#ff6b4a', x: '#f2b84b', i: '#f2f2f2', '': null };
function weave(x0, y0, w, h, hours, aod, id, cur = 10) {
  let s = ''; const n = hours.length, cw = w / n, rows = Math.floor(h / 14);
  hours.forEach((k, i) => {
    const x = x0 + i * cw;
    if (!COL[k]) { s += `<line x1="${(x + cw / 2).toFixed(1)}" y1="${y0}" x2="${(x + cw / 2).toFixed(1)}" y2="${y0 + h}" stroke="${aod ? '#333' : '#fff'}" stroke-opacity="${aod ? 1 : .18}" stroke-width="1.5"/>`; return; }
    const c = aod ? GREY : COL[k];
    s += `<rect x="${(x + 1).toFixed(1)}" y="${y0}" width="${(cw - 2).toFixed(1)}" height="${h}" rx="${(cw / 2 - 1).toFixed(1)}" fill="${c}" opacity="${aod ? .5 : 1}"/>`;
    if (!aod) for (let r = 0; r < rows; r++) if ((r + i) % 2 === 0) s += `<rect x="${(x + 1).toFixed(1)}" y="${y0 + r * 14 + 3}" width="${(cw - 2).toFixed(1)}" height="7" fill="#000" opacity=".28"/>`;
    if (i === cur && !aod) s += `<rect x="${(x - 2).toFixed(1)}" y="${y0 - 8}" width="${(cw + 4).toFixed(1)}" height="${h + 16}" rx="${(cw / 2 + 2).toFixed(1)}" fill="none" stroke="#fff" stroke-width="2.5"/>`;
  });
  return s;
}
export function dayWeave(state = 'active', id = 'dw') {
  let s = HEAD(id);
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 64, true);
    s += T(34, 184, 112, 300, GREY, '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
    s += weave(34, 236, 328, 150, DAY, true, id);
    return s + END;
  }
  s += `<defs><linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14121c"/><stop offset="1" stop-color="#0a090e"/></linearGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}bg)"/><circle cx="80" cy="360" r="140" fill="#5b5bd6" opacity=".35" filter="url(#${id}b)"/><circle cx="330" cy="150" r="120" fill="#f2b84b" opacity=".22" filter="url(#${id}b)"/>`;
  s += STATUS('#fff', 64);
  if (state === 'alt') {
    s += T(34, 124, 46, 800, '#fff', 'Your week', 'start', 'Inter Tight', 'letter-spacing="-1.5"') + T(362, 122, 21, 600, '#fff', 'Mon–Sun', 'end', 'Inter', 'opacity=".6"');
    WEEK.forEach((row, r) => { const hrs = row.split('').concat(Array(24 - row.length).fill('')); s += weave(34, 150 + r * 34, 328, 26, hrs, false, id + r, r === 6 ? 10 : -1); });
    s += T(34, 420, 21, 400, '#fff', 'Each row is one day', 'start', 'Inter', 'opacity=".7"');
    s += T(34, 450, 23, 700, '#fff', 'Sleep steadier than last week', 'start');
    return s + END;
  }
  s += T(34, 172, 112, 300, '#fff', '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
  s += weave(34, 210, 328, 150, DAY, false, id);
  const legend = [['#5b5bd6', '7h sleep'], ['#3ddc84', '1h move'], ['#f2b84b', '1h work']];
  legend.forEach(([c, l], i) => { const cx = [46, 166, 284][i]; s += `<circle cx="${cx}" cy="404" r="11" fill="${c}"/>` + T(cx + 18, 412, 21, 600, '#fff', l); });
  s += T(34, 452, 21, 400, '#fff', 'Each thread is one hour of today', 'start', 'Inter', 'opacity=".6"');
  return s + END;
}
export const CONCEPTS2 = [
  { slug: 'heartwritten', fn: heartwritten }, { slug: 'inner-weather', fn: innerWeather },
  { slug: 'threshold', fn: threshold }, { slug: 'day-weave', fn: dayWeave },
];

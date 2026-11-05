// Four more original concepts (entries 2, 7, 8, 10): Contour, Haze, Rest Moon, Constellation.
// 396×484 units rendered at 368×448; text ≥21px, icons ≥25px.
const HEAD = (id) => `<svg width="368" height="448" preserveAspectRatio="none" viewBox="0 0 396 484" xmlns="http://www.w3.org/2000/svg"><defs>
<clipPath id="${id}c"><rect width="396" height="484" rx="92"/></clipPath>
<filter id="${id}b" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"/></filter>
<filter id="${id}s" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter></defs><g clip-path="url(#${id}c)">`;
const END = '</g></svg>';
const T = (x, y, size, weight, fill, text, anchor = 'start', font = 'Inter', extra = '') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${text}</text>`;
const HEART = (x, y, k, c = '#ff4d5e') => `<path transform="translate(${x} ${y}) scale(${k})" fill="${c}" d="M0 6 C -9 -1 -11 -8 -6 -11 C -3 -13 0 -11 0 -8 C 0 -11 3 -13 6 -11 C 11 -8 9 -1 0 6Z"/>`;
const STATUS = (ink = '#fff', hr = 68, aod = false) => T(38, 62, 23, 700, ink, 'WED 4', 'start', 'Inter', 'letter-spacing="1.5"') + HEART(306, 54, 1.4, aod ? '#7a3a3a' : '#ff4d5e') + T(360, 62, 23, 700, ink, hr, 'end');
const GREY = '#a8a8a8';
const CARD = (stroke = '#fff', so = '.14', fill = '#0b0b10', fo = '.7') => `<rect x="18" y="352" width="360" height="100" rx="30" fill="${fill}" fill-opacity="${fo}" stroke="${stroke}" stroke-opacity="${so}"/>`;
const f1 = (n) => n.toFixed(1);

// ---------------------------------------------------------------- Contour
function blob(cx, cy, r, seed, n = 72) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.16 * Math.sin(3 * a + seed) + 0.09 * Math.sin(5 * a + seed * 2.3) + 0.05 * Math.cos(7 * a + seed));
    d += `${i ? 'L' : 'M'}${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * 0.82 * Math.sin(a))} `;
  }
  return d + 'Z';
}
function terrain(aod, id) {
  const peaks = aod ? [[250, 300, 5, 1.1], [90, 330, 3, 2.7]] : [[250, 250, 9, 1.1], [104, 300, 6, 2.7], [330, 120, 4, 0.4]];
  const ramp = ['#0f3b33', '#145246', '#1a6a55', '#22845f', '#36a065', '#5bbb67', '#8ed36a', '#c4e874', '#f2f7a0'];
  let s = '';
  peaks.forEach(([cx, cy, lv, seed], p) => {
    for (let l = 0; l < lv; l++) {
      const r = 26 + (lv - l) * 22, c = aod ? GREY : ramp[Math.min(l + (p ? 1 : 0), ramp.length - 1)];
      s += `<path d="${blob(cx, cy, r, seed + l * 0.18)}" fill="none" stroke="${c}" stroke-width="${aod ? 1.6 : (l === lv - 1 ? 3 : 2)}" opacity="${aod ? .4 : .95}"/>`;
    }
  });
  return s;
}
export function contour(state = 'active', id = 'ct') {
  let s = HEAD(id);
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + terrain(true, id) + STATUS(GREY, 64, true);
    s += T(34, 176, 108, 300, GREY, '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
    return s + END;
  }
  s += `<defs><radialGradient id="${id}bg" cx=".6" cy=".55" r=".8"><stop offset="0" stop-color="#0d2a24"/><stop offset="1" stop-color="#040b09"/></radialGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}bg)"/>`;
  if (state === 'alt') {
    s += STATUS('#fff', 64);
    s += T(34, 124, 46, 800, '#fff', 'Elevation', 'start', 'Inter Tight', 'letter-spacing="-1.5"') + T(362, 122, 21, 600, '#fff', 'Today', 'end', 'Inter', 'opacity=".6"');
    const pts = [2, 2, 2, 2, 2, 3, 6, 20, 14, 8, 9, 7, 9, 6, 6, 8, 10, 15, 11, 6, 4, 3, 2, 2];
    const X = (i) => 34 + i * (328 / 23), Y = (v) => 330 - v * 8.5;
    let d = `M34 330 ` + pts.map((v, i) => `L${f1(X(i))} ${f1(Y(v))}`).join(' ') + ` L362 330 Z`;
    s += `<defs><linearGradient id="${id}fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4e874" stop-opacity=".9"/><stop offset="1" stop-color="#145246" stop-opacity=".2"/></linearGradient></defs>`;
    for (let k = 1; k < 6; k++) s += `<line x1="34" x2="362" y1="${330 - k * 34}" y2="${330 - k * 34}" stroke="#fff" stroke-opacity=".07"/>`;
    s += `<path d="${d}" fill="url(#${id}fill)"/><path d="${d.replace(/ L362 330 Z$/, '').replace(/^M34 330 /, 'M')}" fill="none" stroke="#f2f7a0" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<circle cx="${f1(X(7))}" cy="${f1(Y(20))}" r="9" fill="#f2f7a0"/>` + T(f1(X(7) + 16), f1(Y(20) + 8), 21, 700, '#f2f7a0', 'Peak · 7 am run');
    s += `<line x1="${f1(X(10))}" x2="${f1(X(10))}" y1="150" y2="330" stroke="#fff" stroke-width="2" stroke-dasharray="4 6" opacity=".6"/>`;
    s += T(34, 368, 21, 600, '#fff', '12 AM', 'start', 'Inter', 'opacity=".5"') + T(198, 368, 21, 600, '#fff', 'NOON', 'middle', 'Inter', 'opacity=".5"') + T(362, 368, 21, 600, '#fff', '12 AM', 'end', 'Inter', 'opacity=".5"');
    s += T(34, 420, 23, 700, '#fff', 'Climbed 6,842 steps of terrain') + T(34, 450, 21, 400, '#fff', 'Higher land means a busier hour', 'start', 'Inter', 'opacity=".65"');
    return s + END;
  }
  s += terrain(false, id);
  s += `<circle cx="250" cy="250" r="8" fill="#f2f7a0"/><circle cx="250" cy="250" r="16" fill="#f2f7a0" opacity=".3" filter="url(#${id}s)"/>`;
  s += `<rect x="236" y="196" width="128" height="36" rx="18" fill="#04120d" fill-opacity=".8" stroke="#f2f7a0" stroke-opacity=".5"/>` + T(300, 221, 21, 700, '#f2f7a0', '7 am run', 'middle');
  s += STATUS('#fff', 64);
  s += T(34, 176, 108, 300, '#fff', '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
  s += CARD('#c4e874', '.3', '#04120d', '.78');
  s += `<path d="M44 424 L 60 392 L 70 406 L 82 382 L 98 424 Z" fill="none" stroke="#c4e874" stroke-width="3" stroke-linejoin="round"/>`;
  s += T(112, 394, 23, 700, '#fff', 'Today’s terrain') + T(112, 426, 21, 400, '#fff', 'Highest peak 7 am · 3.1 km', 'start', 'Inter', 'opacity=".75"');
  return s + END;
}

// ---------------------------------------------------------------- Haze
function skyline(base, fill, stroke) {
  const b = [[0, 70], [30, 110], [62, 84], [92, 150], [126, 96], [150, 128], [182, 176], [214, 102], [240, 136], [272, 90], [298, 160], [330, 112], [356, 82], [382, 120]];
  let s = '';
  b.forEach(([x, h], i) => {
    const w = (b[i + 1] ? b[i + 1][0] : 400) - x;
    s += `<rect x="${x}" y="${base - h}" width="${w + 1}" height="${h + 40}" fill="${fill}" ${stroke ? `stroke="${stroke}" stroke-width="1.6"` : ''}/>`;
    if (!stroke) for (let r = 0; r < Math.floor(h / 22); r++) for (let c = 0; c < Math.floor(w / 12); c++) if ((r * 7 + c * 3 + i) % 5 === 0) s += `<rect x="${x + 4 + c * 12}" y="${base - h + 10 + r * 22}" width="5" height="8" fill="#ffd27a" opacity=".55"/>`;
  });
  return s;
}
export function haze(state = 'active', id = 'hz') {
  let s = HEAD(id);
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + skyline(484, '#000', '#333') + STATUS(GREY, 66, true);
    s += T(198, 228, 112, 300, GREY, '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
    s += T(198, 286, 27, 600, GREY, 'AQI 162', 'middle');
    return s + END;
  }
  const clean = state === 'alt';
  if (clean) {
    s += `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c64d8"/><stop offset=".7" stop-color="#7fc4ff"/><stop offset="1" stop-color="#d9f0ff"/></linearGradient></defs>`;
    s += `<rect width="396" height="484" fill="url(#${id}sky)"/><circle cx="320" cy="300" r="40" fill="#fff8d6"/><circle cx="320" cy="300" r="80" fill="#fff8d6" opacity=".35" filter="url(#${id}s)"/>`;
    s += skyline(484, '#0e2a52');
    s += STATUS('#fff', 66);
    s += T(198, 228, 112, 300, '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
    s += CARD('#fff', '.35', '#0e2a52', '.6');
    s += `<circle cx="62" cy="402" r="24" fill="#3ddc84"/>` + T(62, 410, 21, 800, '#05210f', '38', 'middle');
    s += T(100, 394, 23, 700, '#fff', 'Air is clean') + T(100, 426, 21, 400, '#fff', 'Open a window today', 'start', 'Inter', 'opacity=".8"');
    return s + END;
  }
  s += `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3328"/><stop offset=".6" stop-color="#8a7558"/><stop offset="1" stop-color="#b59a72"/></linearGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}sky)"/><circle cx="320" cy="300" r="34" fill="#f0c890" opacity=".55"/>`;
  s += skyline(484, '#4a3e30');
  s += `<rect width="396" height="484" fill="#c9b08a" opacity=".38"/>`;
  for (let i = 0; i < 160; i++) { const x = (i * 97) % 396, y = (i * 61) % 484, r = 1 + (i % 3); s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#efe0c4" opacity="${.18 + (i % 4) * .06}"/>`; }
  s += `<ellipse cx="198" cy="330" rx="260" ry="90" fill="#d8c3a0" opacity=".45" filter="url(#${id}b)"/>`;
  s += STATUS('#fff', 66);
  s += T(198, 228, 112, 300, '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
  s += CARD('#ffb35c', '.4', '#2a2016', '.82');
  s += `<circle cx="62" cy="402" r="24" fill="#ff8a3c"/>` + T(62, 410, 21, 800, '#2a1204', '162', 'middle');
  s += T(100, 394, 23, 700, '#fff', 'Unhealthy air') + T(100, 426, 21, 400, '#fff', 'Mask on for your walk', 'start', 'Inter', 'opacity=".8"');
  return s + END;
}

// ---------------------------------------------------------------- Rest Moon
function moon(cx, cy, r, k, id, aod) {
  // k = lit fraction 0..1, lit on the right (waxing)
  const rx = Math.abs(1 - 2 * k) * r, sweep = k > 0.5 ? 1 : 0;
  const lit = `M${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${f1(rx)} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
  if (aod) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#555" stroke-width="2"/><path d="${lit}" fill="none" stroke="${GREY}" stroke-width="3"/>`;
  let s = `<defs><radialGradient id="${id}m" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#d9d2c0"/></radialGradient><clipPath id="${id}lit"><path d="${lit}"/></clipPath></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r + 40}" fill="#cfd8ff" opacity="${.12 + k * .2}" filter="url(#${id}b)"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a1f33"/>`;
  s += `<g clip-path="url(#${id}lit)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}m)"/>`;
  [[-.3, -.25, .18], [.25, .1, .22], [-.05, .4, .12], [.4, -.35, .1], [-.45, .2, .09]].forEach(([dx, dy, rr]) => { s += `<circle cx="${f1(cx + dx * r)}" cy="${f1(cy + dy * r)}" r="${f1(rr * r)}" fill="#bdb5a2" opacity=".55"/>`; });
  return s + `</g>`;
}
export function restMoon(state = 'active', id = 'rm') {
  let s = HEAD(id);
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 58, true);
    s += T(198, 168, 96, 300, GREY, '10:09', 'middle', 'Inter Tight', 'letter-spacing="-3"');
    s += moon(198, 316, 84, 0.82, id, true);
    return s + END;
  }
  const debt = state === 'alt', k = debt ? 0.22 : 0.82;
  s += `<defs><radialGradient id="${id}bg" cx=".5" cy=".65" r=".8"><stop offset="0" stop-color="#141a33"/><stop offset="1" stop-color="#05060d"/></radialGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}bg)"/>`;
  for (let i = 0; i < 46; i++) { const x = (i * 83 + 17) % 396, y = (i * 47 + 11) % 330; s += `<circle cx="${x}" cy="${y}" r="${(i % 3) * .6 + .8}" fill="#fff" opacity="${.3 + (i % 5) * .12}"/>`; }
  s += STATUS('#fff', 58);
  s += T(198, 168, 96, 300, '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-3"');
  s += moon(198, 270, 70, k, id, false);
  s += CARD('#cfd8ff', '.3', '#0a0d1c', '.82');
  if (debt) s += T(40, 394, 23, 700, '#fff', 'Thin moon · 22% rested') + T(40, 426, 21, 400, '#fff', '3h owed · bed by 10:30', 'start', 'Inter', 'opacity=".75"');
  else s += T(40, 394, 23, 700, '#fff', 'Nearly full · 82% rested') + T(40, 426, 21, 400, '#fff', 'Slept 6h 50m last night', 'start', 'Inter', 'opacity=".75"');
  return s + END;
}

// ---------------------------------------------------------------- Constellation
const PEOPLE = [[70, 150, 'Amma', 24], [150, 120, 'Jun', 6], [220, 170, 'Ravi', 12], [300, 132, 'Team', 40], [330, 204, 'Wren', 4], [236, 236, 'Ellie', 9]];
export function constellation(state = 'active', id = 'cs') {
  let s = HEAD(id);
  const aod = state === 'aod', alt = state === 'alt';
  if (aod) {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 66, true);
    s += `<path d="${PEOPLE.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')}" fill="none" stroke="#444" stroke-width="1.5"/>`;
    PEOPLE.forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="4" fill="${GREY}"/>`; });
    s += T(198, 392, 104, 300, GREY, '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
    return s + END;
  }
  s += `<defs><radialGradient id="${id}bg" cx=".5" cy=".35" r=".9"><stop offset="0" stop-color="#1b1640"/><stop offset="1" stop-color="#05040d"/></radialGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}bg)"/><circle cx="200" cy="190" r="150" fill="#7b5cff" opacity=".25" filter="url(#${id}b)"/>`;
  for (let i = 0; i < 60; i++) { const x = (i * 71 + 5) % 396, y = (i * 43 + 9) % 484; s += `<circle cx="${x}" cy="${y}" r=".9" fill="#fff" opacity="${.15 + (i % 4) * .08}"/>`; }
  s += STATUS('#fff', 66);
  const pts = PEOPLE.map(([x, y, n, m]) => [x, y, n, m]);
  s += `<path d="${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')}" fill="none" stroke="#c9bfff" stroke-width="2" opacity=".55"/>`;
  pts.forEach(([x, y, n, m]) => {
    const r = 4 + Math.sqrt(m) * 1.4;
    s += `<circle cx="${x}" cy="${y}" r="${f1(r * 2.4)}" fill="#e6deff" opacity=".35" filter="url(#${id}s)"/><circle cx="${x}" cy="${y}" r="${f1(r)}" fill="#fff"/>`;
  });
  [[0, 'Amma'], [3, 'Team']].forEach(([i, n]) => { const [x, y] = pts[i]; s += T(x, y - 22, 21, 700, '#fff', n, 'middle'); });
  if (alt) {
    s += `<circle cx="96" cy="300" r="7" fill="#fff" opacity=".35"/><circle cx="96" cy="300" r="20" fill="none" stroke="#ffd166" stroke-width="2.5" stroke-dasharray="4 5"/>` + T(124, 307, 21, 700, '#ffd166', 'Neha');
    s += T(198, 120, 0, 0, '#fff', '');
    s += CARD('#ffd166', '.4', '#0d0a1f', '.85');
    s += T(40, 394, 23, 700, '#fff', 'Neha’s star fades') + T(40, 426, 21, 400, '#fff', 'Last talk: 3 weeks', 'start', 'Inter', 'opacity=".75"');
    s += `<rect x="264" y="378" width="96" height="48" rx="24" fill="#ffd166"/>` + T(312, 410, 23, 800, '#111', 'Say hi', 'middle');
    return s + END;
  }
  s += T(198, 340, 0, 0, '#fff', '');
  s += T(34, 330, 0, 0, '#fff', '');
  s += `<text x="362" y="340" text-anchor="end" font-family="Inter Tight" font-size="64" font-weight="300" fill="#fff" letter-spacing="-2">10:09</text>`;
  s += CARD('#c9bfff', '.3', '#0d0a1f', '.82');
  s += `<circle cx="62" cy="402" r="18" fill="none" stroke="#c9bfff" stroke-width="3"/><circle cx="62" cy="402" r="6" fill="#fff"/>`;
  s += T(96, 394, 23, 700, '#fff', '6 people today') + T(96, 426, 21, 400, '#fff', 'Brightest: Team call · 40 min', 'start', 'Inter', 'opacity=".75"');
  return s + END;
}
export const CONCEPTS3 = [
  { slug: 'contour', fn: contour }, { slug: 'haze', fn: haze }, { slug: 'rest-moon', fn: restMoon }, { slug: 'constellation', fn: constellation },
];

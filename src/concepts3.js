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
const STATUS = (ink = '#fff', hr = 68, aod = false) => T(38, 62, 23, 700, ink, 'WED 4', 'start', 'Inter', 'letter-spacing="1.5"') + HEART(String(hr).length > 2 ? 292 : 306, 54, 1.4, aod ? '#7a3a3a' : '#ff4d5e') + T(360, 62, 23, 700, ink, hr, 'end');
const GREY = '#c2c2c2';
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
    s += T(34, 420, 23, 700, '#fff', '6,842 steps of terrain') + T(34, 450, 21, 400, '#fff', 'Higher land means a busier hour', 'start', 'Inter', 'opacity=".65"');
    return s + END;
  }
  s += terrain(false, id);
  s += `<ellipse cx="140" cy="140" rx="190" ry="90" fill="#04100c" opacity=".95" filter="url(#${id}b)"/>`;
  s += `<circle cx="250" cy="250" r="8" fill="#f2f7a0"/><circle cx="250" cy="250" r="16" fill="#f2f7a0" opacity=".3" filter="url(#${id}s)"/>`;
  s += `<rect x="236" y="196" width="128" height="36" rx="18" fill="#04120d" fill-opacity=".8" stroke="#f2f7a0" stroke-opacity=".5"/>` + T(300, 221, 21, 700, '#f2f7a0', '7 am run', 'middle');
  s += STATUS('#fff', 64);
  s += T(34, 176, 108, 300, '#fff', '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
  s += CARD('#c4e874', '.3', '#04120d', '.78');
  s += `<path d="M44 424 L 60 392 L 70 406 L 82 382 L 98 424 Z" fill="none" stroke="#c4e874" stroke-width="3" stroke-linejoin="round"/>`;
  s += T(112, 394, 23, 700, '#fff', 'Today’s terrain') + T(112, 426, 21, 400, '#fff', 'Peak at 7 am · 3.1 km', 'start', 'Inter', 'opacity=".75"');
  return s + END;
}

// ---------------------------------------------------------------- Haze
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
// roofline: [x, width, height, cap] cap: 0 flat, 1 spire, 2 stepped, 3 tank, 4 antenna
const FAR = [[0, 40, 120, 0], [40, 30, 150, 2], [70, 46, 112, 0], [116, 26, 176, 1], [142, 44, 130, 3], [186, 30, 160, 0], [216, 52, 118, 2], [268, 28, 188, 4], [296, 46, 136, 0], [342, 30, 168, 1], [372, 30, 124, 0]];
const NEAR = [[-6, 50, 84, 3], [44, 36, 116, 0], [80, 58, 92, 2], [138, 34, 136, 4], [172, 48, 100, 0], [220, 40, 124, 3], [260, 56, 96, 2], [316, 34, 142, 1], [350, 52, 104, 0]];
function towers(list, base, fill, lit, seed, outline) {
  let s = '', roof = `M-10 ${base}`;
  list.forEach(([x, w, h, cap], i) => {
    const top = base - h;
    let d = `M${x} ${base} L${x} ${top} L${x + w} ${top} L${x + w} ${base} Z`;
    if (cap === 1) d += ` M${x + w / 2 - 6} ${top} L${x + w / 2} ${top - 34} L${x + w / 2 + 6} ${top} Z`;
    if (cap === 2) d += ` M${x + 6} ${top} L${x + 6} ${top - 14} L${x + w - 6} ${top - 14} L${x + w - 6} ${top} Z`;
    if (cap === 3) d += ` M${x + w - 18} ${top} L${x + w - 18} ${top - 12} L${x + w - 6} ${top - 12} L${x + w - 6} ${top} Z`;
    if (cap === 4) d += ` M${x + w / 2 - 1.5} ${top} L${x + w / 2 - 1.5} ${top - 40} L${x + w / 2 + 1.5} ${top - 40} L${x + w / 2 + 1.5} ${top} Z`;
    roof += ` L${x} ${top} L${x + w} ${top}`;
    if (!outline) {
      s += `<path d="${d}" fill="${fill}"/>`;
      if (lit) for (let r = 0; r < Math.floor(h / 16) - 1; r++) for (let c = 0; c < Math.floor((w - 8) / 9); c++) {
        const k = rnd(seed + i * 97 + r * 13 + c * 7);
        if (k > .78) s += `<rect x="${x + 5 + c * 9}" y="${top + 10 + r * 16}" width="4" height="7" rx="1" fill="${lit}" opacity="${(.35 + k * .5).toFixed(2)}"/>`;
      }
    }
  });
  if (outline) s += `<path d="${roof} L406 ${base}" fill="none" stroke="${fill}" stroke-width="2" stroke-linejoin="round"/>`;
  return s;
}
export function haze(state = 'active', id = 'hz') {
  let s = HEAD(id);
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + towers(NEAR.map(([x, w, hh, c]) => [x, w, hh * 1.55, c]), 500, '#4a4a4a', null, 0, true) + STATUS(GREY, 66, true);
    s += T(198, 178, 100, 300, GREY, '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
    s += T(198, 232, 27, 600, GREY, 'AQI 162', 'middle');
    return s + END;
  }
  const clean = state === 'alt';
  if (clean) {
    s += `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f4fc4"/><stop offset=".55" stop-color="#5aa8f5"/><stop offset="1" stop-color="#cfe9ff"/></linearGradient></defs>`;
    s += `<rect width="396" height="484" fill="url(#${id}sky)"/>`;
    s += `<circle cx="342" cy="214" r="90" fill="#fff6c8" opacity=".45" filter="url(#${id}b)"/><circle cx="342" cy="214" r="28" fill="#fffbe6"/>`;
    [[70, 222], [92, 214], [112, 228], [230, 200]].forEach(([x, y]) => { s += `<path d="M${x - 8} ${y - 4} Q ${x - 4} ${y - 8} ${x} ${y} Q ${x + 4} ${y - 8} ${x + 8} ${y - 4}" fill="none" stroke="#0b2a5c" stroke-width="2" stroke-linecap="round"/>`; });
    s += towers(FAR.map(([x, w, hh, c]) => [x, w, hh * 1.5, c]), 500, '#3b6db3', '#e6f2ff', 3) + towers(NEAR.map(([x, w, hh, c]) => [x, w, hh * 1.55, c]), 500, '#0b2348', '#ffd27a', 11);
    s += STATUS('#fff', 66);
    s += T(198, 178, 100, 300, '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
    s += `<rect x="30" y="380" width="336" height="76" rx="38" fill="#081a38" fill-opacity=".86" stroke="#fff" stroke-opacity=".3"/>`;
    s += `<circle cx="70" cy="418" r="24" fill="#3ddc84"/>` + T(70, 426, 21, 800, '#05210f', '38', 'middle');
    s += T(106, 412, 23, 700, '#fff', 'Air is clean') + T(106, 440, 21, 400, '#fff', 'Open a window today', 'start', 'Inter', 'opacity=".8"');
    return s + END;
  }
  s += `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e2820"/><stop offset=".55" stop-color="#7d6a50"/><stop offset="1" stop-color="#bda37c"/></linearGradient>
    <linearGradient id="${id}fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb48c" stop-opacity="0"/><stop offset=".55" stop-color="#cdb48c" stop-opacity=".75"/><stop offset="1" stop-color="#cdb48c" stop-opacity=".9"/></linearGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}sky)"/>`;
  s += `<circle cx="342" cy="214" r="70" fill="#f3cf98" opacity=".35" filter="url(#${id}b)"/><circle cx="342" cy="214" r="26" fill="#f0d2a0" opacity=".6"/>`;
  s += towers(FAR.map(([x, w, hh, c]) => [x, w, hh * 1.5, c]), 500, '#8c7658', null, 3);
  s += `<rect y="180" width="396" height="304" fill="url(#${id}fog)"/>`;
  s += towers(NEAR.map(([x, w, hh, c]) => [x, w, hh * 1.55, c]), 500, '#4e402f', '#ffcf7a', 11);
  s += `<rect y="280" width="396" height="204" fill="url(#${id}fog)" opacity=".55"/>`;
  for (let i = 0; i < 220; i++) { const x = rnd(i) * 396, y = rnd(i + 500) * 484, r = .6 + rnd(i + 900) * 1.4; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f4e6cc" opacity="${(.08 + rnd(i + 1300) * .22).toFixed(2)}"/>`; }
  s += STATUS('#fff', 66);
  s += T(198, 178, 100, 300, '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
  s += `<rect x="30" y="380" width="336" height="76" rx="38" fill="#2a2016" fill-opacity=".86" stroke="#ffb35c" stroke-opacity=".4"/>`;
  s += `<circle cx="70" cy="418" r="24" fill="#ff8a3c"/>` + T(70, 426, 21, 800, '#2a1204', '162', 'middle');
  s += T(106, 412, 23, 700, '#fff', 'Unhealthy air') + T(106, 440, 21, 400, '#fff', 'Mask on for your walk', 'start', 'Inter', 'opacity=".8"');
  return s + END;
}

// ---------------------------------------------------------------- Rest Moon
const litPath = (cx, cy, r, k) => {
  const rx = Math.abs(1 - 2 * k) * r, sweep = k > 0.5 ? 1 : 0;
  return `M${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${f1(rx)} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;
};
function moon(cx, cy, r, k, id, aod) {
  const lit = litPath(cx, cy, r, k);
  if (aod) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#3a3a3a" stroke-width="2"/><path d="${lit}" fill="none" stroke="${GREY}" stroke-width="2.5"/>`;
  let s = `<defs><radialGradient id="${id}m" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fffdf6"/><stop offset=".7" stop-color="#e7e0cf"/><stop offset="1" stop-color="#bfb6a2"/></radialGradient>
    <radialGradient id="${id}dk" cx=".6" cy=".4" r=".8"><stop offset="0" stop-color="#232a48"/><stop offset="1" stop-color="#0d1124"/></radialGradient>
    <clipPath id="${id}lit"><path d="${lit}"/></clipPath><filter id="${id}mb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r + 46}" fill="#cfd8ff" opacity="${(.1 + k * .22).toFixed(2)}" filter="url(#${id}b)"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}dk)"/><circle cx="${cx}" cy="${cy}" r="${r - .8}" fill="none" stroke="#cfd8ff" stroke-opacity=".12" stroke-width="1.6"/>`;
  s += `<g clip-path="url(#${id}lit)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}m)"/>`;
  [[-.28, -.2, .34, .22, -20], [.18, .05, .3, .2, 30], [-.05, .42, .22, .14, 0], [.38, -.38, .16, .12, 10]].forEach(([dx, dy, ex, ey, rot]) => {
    s += `<ellipse cx="${f1(cx + dx * r)}" cy="${f1(cy + dy * r)}" rx="${f1(ex * r)}" ry="${f1(ey * r)}" transform="rotate(${rot} ${f1(cx + dx * r)} ${f1(cy + dy * r)})" fill="#a89f8b" opacity=".38" filter="url(#${id}mb)"/>`;
  });
  [[.3, .5, .06], [-.42, .18, .045], [.05, -.55, .05], [.55, .15, .04]].forEach(([dx, dy, rr]) => {
    s += `<circle cx="${f1(cx + dx * r)}" cy="${f1(cy + dy * r)}" r="${f1(rr * r)}" fill="none" stroke="#9c937f" stroke-opacity=".55" stroke-width="1.4"/>`;
  });
  s += `</g>`;
  return s;
}
const tinyMoon = (cx, cy, r, k, aod) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${aod ? 'none' : '#1d2340'}" stroke="${aod ? '#3a3a3a' : '#cfd8ff'}" stroke-opacity="${aod ? 1 : .25}" stroke-width="1.2"/><path d="${litPath(cx, cy, r, k)}" fill="${aod ? GREY : '#efe8d6'}"/>`;
export function restMoon(state = 'active', id = 'rm') {
  let s = HEAD(id);
  const week = state === 'alt' ? [.7, .55, .42, .35, .3, .25, .22] : [.6, .74, .9, .66, .95, .78, .82];
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 58, true);
    s += T(198, 160, 92, 300, GREY, '10:09', 'middle', 'Inter Tight', 'letter-spacing="-3"');
    s += moon(198, 290, 80, 0.82, id, true);
    return s + END;
  }
  const debt = state === 'alt', k = debt ? 0.22 : 0.82;
  s += `<defs><radialGradient id="${id}bg" cx=".5" cy=".6" r=".85"><stop offset="0" stop-color="#161d3a"/><stop offset="1" stop-color="#04050b"/></radialGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}bg)"/>`;
  for (let i = 0; i < 70; i++) { const x = rnd(i + 40) * 396, y = rnd(i + 140) * 340, r = .5 + rnd(i + 240) * 1.3; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(.2 + rnd(i + 340) * .6).toFixed(2)}"/>`; }
  s += STATUS('#fff', 58);
  s += T(198, 160, 92, 300, '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-3"');
  s += moon(198, 262, 72, k, id, false);
  s += CARD('#cfd8ff', '.25', '#0a0d1c', '.82');
  s += T(40, 390, 23, 700, '#fff', debt ? 'Sleep · 3h owed' : 'Sleep · 82% rested');
  if (!debt) s += T(358, 390, 21, 500, '#cfd8ff', '6h 50m', 'end', 'Inter', 'opacity=".85"');
  week.forEach((w, i) => { s += tinyMoon(50 + i * 25, 422, 9, w, false); });
  s += T(358, 429, 21, 400, '#fff', debt ? 'Bed by 10:30' : 'Last 7 nights', 'end', 'Inter', 'opacity=".7"');
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
  s += `<rect width="396" height="484" fill="url(#${id}bg)"/><circle cx="200" cy="190" r="150" fill="#7b5cff" opacity=".25" filter="url(#${id}b)"/><ellipse cx="220" cy="210" rx="210" ry="46" transform="rotate(-24 220 210)" fill="#ff7ad9" opacity=".12" filter="url(#${id}b)"/>`;
  for (let i = 0; i < 60; i++) { const x = (i * 71 + 5) % 396, y = (i * 43 + 9) % 484; s += `<circle cx="${x}" cy="${y}" r=".9" fill="#fff" opacity="${.15 + (i % 4) * .08}"/>`; }
  s += STATUS('#fff', 66);
  const pts = PEOPLE.map(([x, y, n, m]) => [x, y, n, m]);
  s += `<path d="${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')}" fill="none" stroke="#c9bfff" stroke-width="2" opacity=".55"/>`;
  pts.forEach(([x, y, n, m]) => {
    const r = 4 + Math.sqrt(m) * 1.4;
    s += `<circle cx="${x}" cy="${y}" r="${f1(r * 2.4)}" fill="#e6deff" opacity=".35" filter="url(#${id}s)"/><circle cx="${x}" cy="${y}" r="${f1(r)}" fill="#fff"/>`;
    if (m >= 9) { const L = r * 3.4; s += `<path d="M${x - L} ${y} L${x + L} ${y} M${x} ${y - L} L${x} ${y + L}" stroke="#fff" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>`; }
  });
  [[0, 'Amma'], [3, 'Team']].forEach(([i, n]) => { const [x, y] = pts[i]; s += T(x, y - 22, 21, 700, '#fff', n, 'middle'); });
  if (alt) {
    s += `<circle cx="70" cy="282" r="7" fill="#fff" opacity=".35"/><circle cx="70" cy="282" r="20" fill="none" stroke="#ffd166" stroke-width="2.5" stroke-dasharray="4 5"/>` + T(98, 289, 21, 700, '#ffd166', 'Neha');
    s += T(198, 120, 0, 0, '#fff', '');
    s += CARD('#ffd166', '.4', '#0d0a1f', '.85');
    s += T(40, 394, 23, 700, '#fff', 'Neha’s star fades') + T(40, 426, 21, 400, '#fff', 'Last talk: 3 weeks', 'start', 'Inter', 'opacity=".75"');
    s += `<rect x="264" y="378" width="96" height="48" rx="24" fill="#ffd166"/>` + T(312, 410, 23, 800, '#111', 'Say hi', 'middle');
    return s + END;
  }
  s += T(198, 340, 0, 0, '#fff', '');
  s += T(34, 330, 0, 0, '#fff', '');
  s += `<text x="198" y="338" text-anchor="middle" font-family="Inter Tight" font-size="88" font-weight="300" fill="#fff" letter-spacing="-3">10:09</text>`;
  s += CARD('#c9bfff', '.3', '#0d0a1f', '.82');
  s += `<circle cx="62" cy="402" r="18" fill="none" stroke="#c9bfff" stroke-width="3"/><circle cx="62" cy="402" r="6" fill="#fff"/>`;
  s += T(96, 394, 23, 700, '#fff', '6 people you talked to') + T(96, 426, 21, 400, '#fff', 'Longest: Team · 40 min', 'start', 'Inter', 'opacity=".75"');
  return s + END;
}
export const CONCEPTS3 = [
  { slug: 'contour', fn: contour }, { slug: 'haze', fn: haze }, { slug: 'rest-moon', fn: restMoon }, { slug: 'constellation', fn: constellation },
];

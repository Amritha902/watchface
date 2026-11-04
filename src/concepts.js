// Five original watch-face concepts (Encore collection, entries 6–10).
// Each returns an SVG string for a state: 'active' | 'alt' (interactive) | 'aod'.
// Canvas: 396×484 design units, rendered at 368×448 (Titan kit size). Text ≥23u (≈21px), icons ≥27u (≈25px).

const HEAD = (id) => `<svg width="368" height="448" preserveAspectRatio="none" viewBox="0 0 396 484" xmlns="http://www.w3.org/2000/svg"><defs>
<clipPath id="${id}c"><rect width="396" height="484" rx="92"/></clipPath>
<filter id="${id}b" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"/></filter>
<filter id="${id}s" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter></defs><g clip-path="url(#${id}c)">`;
const END = '</g></svg>';
const T = (x, y, size, weight, fill, text, anchor = 'start', font = 'Inter', extra = '') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${text}</text>`;
const HEART = (x, y, k, c = '#ff4d5e') => `<path transform="translate(${x} ${y}) scale(${k})" fill="${c}" d="M0 6 C -9 -1 -11 -8 -6 -11 C -3 -13 0 -11 0 -8 C 0 -11 3 -13 6 -11 C 11 -8 9 -1 0 6Z"/>`;
const STATUS = (ink = '#fff', hr = 68, aod = false) => T(38, 62, 23, 700, ink, 'WED 4', 'start', 'Inter', 'letter-spacing="1.5"') + HEART(306, 54, 1.4, aod ? '#7a3a3a' : '#ff4d5e') + T(360, 62, 23, 700, ink, hr, 'end');
const arc = (cx, cy, r, f) => {
  const a = -Math.PI / 2 + 2 * Math.PI * Math.min(f, 0.9999);
  return `M${cx} ${cy - r} A ${r} ${r} 0 ${f > 0.5 ? 1 : 0} 1 ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
};
const GREY = '#a8a8a8';

// ---------------------------------------------------------------- 6 · Glance Deck
export function glanceDeck(state = 'active', id = 'gd') {
  let s = HEAD(id);
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 68, true);
    s += T(34, 186, 108, 800, GREY, '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
    s += `<rect x="34" y="214" width="150" height="44" rx="22" fill="none" stroke="${GREY}" stroke-width="2"/>` + T(109, 244, 23, 700, GREY, '3 waiting', 'middle');
    return s + END;
  }
  s += `<defs><linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0b16"/><stop offset="1" stop-color="#1b1433"/></linearGradient></defs>`;
  s += `<rect width="396" height="484" fill="url(#${id}bg)"/><circle cx="330" cy="120" r="120" fill="#7b5cff" opacity=".45" filter="url(#${id}b)"/><circle cx="60" cy="420" r="120" fill="#20d3c2" opacity=".28" filter="url(#${id}b)"/>`;
  s += STATUS();
  const card = (x, y, w, h, icoCol, ico, title, sub, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="#1c1c2a" fill-opacity=".9" stroke="#fff" stroke-opacity=".16"/>
    <circle cx="${x + 38}" cy="${y + h / 2}" r="22" fill="${icoCol}"/>${ico(x + 38, y + h / 2)}
    ${T(x + 72, y + h / 2 - 4, 23, 700, '#fff', title)}${T(x + 72, y + h / 2 + 24, 21, 400, '#fff', sub, 'start', 'Inter', 'opacity=".75"')}${extra}`;
  const bag = (cx, cy) => `<path d="M${cx} ${cy - 12} L ${cx + 12} ${cy - 6} L ${cx + 12} ${cy + 8} L ${cx} ${cy + 14} L ${cx - 12} ${cy + 8} L ${cx - 12} ${cy - 6} Z" fill="#fff"/><path d="M${cx - 12} ${cy - 6} L ${cx} ${cy} L ${cx + 12} ${cy - 6} M ${cx} ${cy} V ${cy + 14}" stroke="#ff8a3c" stroke-width="2.5" fill="none"/>`;
  const phone = (cx, cy) => `<path d="M${cx - 8} ${cy - 9} l5 0 l3 6 l-3 3 a14 14 0 0 0 6 6 l3 -3 l6 3 l0 5 a3 3 0 0 1 -3 3 a20 20 0 0 1 -20 -20 a3 3 0 0 1 3 -3z" fill="#fff"/>`;
  const cal = (cx, cy) => `<rect x="${cx - 10}" y="${cy - 9}" width="20" height="19" rx="3" fill="#fff"/><rect x="${cx - 10}" y="${cy - 9}" width="20" height="6" fill="#4d8dff"/>`;
  if (state === 'alt') {
    s += T(34, 120, 50, 800, '#fff', '10:09', 'start', 'Inter Tight', 'letter-spacing="-2"') + T(362, 118, 21, 600, '#fff', 'Swipe to clear', 'end', 'Inter', 'opacity=".6"');
    s += card(18, 140, 360, 94, '#ff8a3c', bag, 'Food order', 'Arriving in 6 min');
    s += card(18, 242, 360, 94, '#33d17a', phone, 'Amma', 'Missed call · 9:52');
    s += card(18, 344, 360, 94, '#4d8dff', cal, 'Standup at 11', 'Room 4 · in 51 min');
    return s + END;
  }
  s += T(34, 172, 108, 800, '#fff', '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
  s += `<rect x="62" y="194" width="272" height="80" rx="24" fill="#fff" fill-opacity=".06"/><rect x="46" y="206" width="304" height="86" rx="25" fill="#fff" fill-opacity=".1"/>`;
  s += card(34, 220, 328, 112, '#ff8a3c', bag, 'Food order', 'Arriving in 6 min', `<rect x="106" y="312" width="228" height="5" rx="2.5" fill="#fff" opacity=".18"/><rect x="106" y="312" width="160" height="5" rx="2.5" fill="#ff8a3c"/>`);
  s += `<rect x="296" y="190" width="56" height="34" rx="17" fill="#ff4d5e"/>` + T(324, 215, 21, 800, '#fff', '+2', 'middle');
  const tile = (x) => `<rect x="${x}" y="352" width="104" height="100" rx="26" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".12"/>`;
  s += tile(34) + tile(146) + tile(258);
  s += `<circle cx="66" cy="384" r="14" fill="#ffd166"/>` + T(52, 436, 27, 800, '#fff', '28°');
  s += `<circle cx="198" cy="392" r="22" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="6"/><path d="${arc(198, 392, 22, 0.68)}" stroke="#20d3c2" stroke-width="6" fill="none" stroke-linecap="round"/>` + T(198, 440, 23, 700, '#fff', '6.8k', 'middle');
  s += `<path d="M300 378 L 324 392 L 300 406 Z" fill="#fff"/>` + T(310, 440, 23, 700, '#fff', 'Lo-fi', 'middle');
  return s + END;
}

// ---------------------------------------------------------------- 7 · Next Stop
export function nextStop(state = 'active', id = 'ns') {
  let s = HEAD(id);
  const P = '#8b5cf6', Y = '#ffd166';
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 72, true);
    s += T(34, 186, 108, 800, GREY, '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
    s += T(34, 250, 30, 800, GREY, '4 min') + T(132, 250, 23, 600, GREY, 'to Central');
    return s + END;
  }
  s += `<defs><linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d1a"/><stop offset="1" stop-color="#171236"/></linearGradient></defs><rect width="396" height="484" fill="url(#${id}bg)"/>`;
  if (state === 'alt') {
    for (let k = 0; k < 4; k++) s += `<circle cx="198" cy="236" r="${70 + k * 40}" fill="none" stroke="${P}" stroke-width="${4 - k * 0.7}" opacity="${0.8 - k * 0.18}"/>`;
    s += `<circle cx="198" cy="236" r="60" fill="${P}"/><rect x="166" y="206" width="64" height="60" rx="6" fill="none" stroke="#fff" stroke-width="4"/><rect x="172" y="212" width="16" height="48" rx="2" fill="#fff"/><rect x="208" y="212" width="16" height="48" rx="2" fill="#fff"/><path d="M195 229 l-7 7 l7 7 M201 229 l7 7 l-7 7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += T(198, 90, 46, 800, '#fff', '10:13', 'middle', 'Inter Tight') + T(198, 366, 23, 700, Y, 'NEXT STOP', 'middle', 'Inter', 'letter-spacing="2"');
    s += T(198, 414, 50, 800, '#fff', 'Central', 'middle', 'Inter Tight') + T(198, 452, 21, 500, '#fff', 'Doors open on the left', 'middle', 'Inter', 'opacity=".75"');
    return s + END;
  }
  s += `<circle cx="210" cy="300" r="140" fill="${P}" opacity=".25" filter="url(#${id}b)"/>` + STATUS('#fff', 72);
  s += T(34, 172, 108, 800, '#fff', '10:09', 'start', 'Inter Tight', 'letter-spacing="-4"');
  s += `<line x1="20" y1="268" x2="376" y2="268" stroke="${P}" stroke-width="10" stroke-linecap="round" opacity=".45"/><line x1="20" y1="268" x2="176" y2="268" stroke="${P}" stroke-width="10" stroke-linecap="round"/>`;
  [50, 130, 210, 290, 362].forEach((x, i) => {
    if (x === 290) s += `<circle cx="${x}" cy="268" r="17" fill="#0a0d1a" stroke="${Y}" stroke-width="6"/>`;
    else s += `<circle cx="${x}" cy="268" r="10" fill="${i < 2 ? P : '#0a0d1a'}" stroke="${P}" stroke-width="5"/>`;
  });
  s += `<rect x="154" y="250" width="48" height="36" rx="12" fill="#fff"/><rect x="161" y="257" width="14" height="12" rx="3" fill="${P}"/><rect x="181" y="257" width="14" height="12" rx="3" fill="${P}"/>`;
  s += T(290, 320, 23, 800, Y, 'Central', 'middle') + T(90, 320, 21, 500, '#fff', 'Park St', 'middle', 'Inter', 'opacity=".6"');
  s += `<rect x="18" y="360" width="360" height="92" rx="28" fill="#0b0b10" fill-opacity=".6" stroke="#fff" stroke-opacity=".14"/>`;
  s += T(40, 418, 38, 800, Y, '4 min') + T(150, 404, 23, 700, '#fff', 'to Central') + T(150, 432, 21, 400, '#fff', '2 stops · Line 2', 'start', 'Inter', 'opacity=".72"');
  return s + END;
}

// ---------------------------------------------------------------- 8 · Bloom
export function bloom(state = 'active', id = 'bl') {
  let s = HEAD(id);
  const open = state === 'alt' ? 1.18 : 0.78, aod = state === 'aod';
  const petalFill = aod ? 'none' : '#ff8fb1', stroke = aod ? `stroke="${GREY}" stroke-width="2.5"` : '';
  if (aod) s += `<rect width="396" height="484" fill="#000"/>`;
  else s += `<defs><linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1f1a"/><stop offset=".7" stop-color="#173a2c"/><stop offset="1" stop-color="#0a1712"/></linearGradient></defs><rect width="396" height="484" fill="url(#${id}bg)"/><circle cx="198" cy="250" r="130" fill="#ffb3cc" opacity="${state === 'alt' ? 0.35 : 0.18}" filter="url(#${id}b)"/>`;
  s += STATUS(aod ? GREY : '#f2fff6', 70, aod);
  s += T(198, 168, 96, 700, aod ? GREY : '#f2fff6', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-3"');
  const cx = 198, cy = 244;
  s += `<path d="M198 ${state === 'alt' ? 384 : 470} C 190 ${state === 'alt' ? 350 : 400}, 210 330, ${cx} ${cy + 20}" stroke="${aod ? GREY : '#3fae5a'}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="172" cy="368" rx="28" ry="12" transform="rotate(-30 172 368)" fill="${aod ? 'none' : '#3fae5a'}" ${stroke}/><ellipse cx="226" cy="326" rx="28" ry="12" transform="rotate(30 226 326)" fill="${aod ? 'none' : '#3fae5a'}" ${stroke}/>`;
  for (let k = 0; k < 6; k++) {
    const a = k * 60 - 90, r = 30 * open;
    const px = cx + r * Math.cos((a * Math.PI) / 180), py = cy + r * Math.sin((a * Math.PI) / 180);
    s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(26 * open).toFixed(1)}" ry="${(15 * open).toFixed(1)}" transform="rotate(${a} ${px.toFixed(1)} ${py.toFixed(1)})" fill="${petalFill}" ${stroke} opacity=".95"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${14 * open}" fill="${aod ? 'none' : '#ffd166'}" ${stroke}/>`;
  if (aod) return s + T(198, 452, 23, 700, GREY, '6,842 steps', 'middle') + END;
  if (state === 'alt') {
    for (let i = 0; i < 18; i++) { const x = 30 + ((i * 71) % 340), y = 90 + ((i * 53) % 300); s += `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="#ffd1e0" transform="rotate(${i * 37} ${x} ${y})" opacity=".85"/>`; }
    s += T(198, 418, 29, 800, '#fff', 'Goal reached', 'middle') + T(198, 452, 21, 500, '#fff', '10,000 steps · in full bloom', 'middle', 'Inter', 'opacity=".8"');
    return s + END;
  }
  s += `<rect x="18" y="380" width="360" height="74" rx="26" fill="#0b0b10" fill-opacity=".55" stroke="#fff" stroke-opacity=".12"/>`;
  s += T(40, 427, 27, 800, '#fff', '6,842') + T(130, 427, 21, 500, '#fff', 'steps', 'start', 'Inter', 'opacity=".7"') + T(358, 427, 23, 700, '#ff8fb1', '68% to bloom', 'end');
  return s + END;
}

// ---------------------------------------------------------------- 9 · Tide
export function tide(state = 'active', id = 'td') {
  let s = HEAD(id);
  const level = state === 'alt' ? 0.16 : 0.62, surf = 484 * (1 - level);
  const wave = (y, amp, ph) => { let d = `M0 ${y}`; for (let x = 0; x <= 396; x += 12) d += ` L ${x} ${(y + amp * Math.sin(x / 38 + ph)).toFixed(1)}`; return d; };
  const low = state === 'alt';
  if (state === 'aod') {
    s += `<rect width="396" height="484" fill="#000"/>` + STATUS(GREY, 64, true);
    s += T(198, 168, 104, 300, GREY, '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
    s += `<path d="${wave(surf, 6, 1)}" stroke="${GREY}" stroke-width="2.5" fill="none"/>` + T(198, surf + 64, 30, 700, GREY, '62%', 'middle');
    return s + END;
  }
  s += `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06101f"/><stop offset="1" stop-color="#0c2440"/></linearGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${low ? '#ff6b4a' : '#2fa8ff'}"/><stop offset="1" stop-color="${low ? '#5a1408' : '#06315c'}"/></linearGradient></defs>
    <rect width="396" height="484" fill="url(#${id}sky)"/>`;
  s += `<path d="${wave(surf - 8, 9, 2.2)} L 396 484 L 0 484 Z" fill="${low ? '#ff9b7a' : '#7fd4ff'}" opacity=".35"/><path d="${wave(surf, 10, 0.6)} L 396 484 L 0 484 Z" fill="url(#${id}w)"/>`;
  for (let i = 0; i < 9; i++) { const x = 40 + ((i * 67) % 320), y = surf + 40 + ((i * 43) % Math.max(30, 484 - surf - 60)); if (y < 470) s += `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`; }
  s += STATUS('#e8f4ff', 64);
  s += T(198, 168, 104, 300, '#e8f4ff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-4"');
  if (low) {
    s += T(198, 300, 58, 800, '#ff8a6b', '16%', 'middle', 'Inter Tight') + T(198, 336, 23, 700, '#fff', 'Low tide · charge soon', 'middle') + T(198, 366, 21, 400, '#fff', 'About 2 h left', 'middle', 'Inter', 'opacity=".72"');
  } else {
    s += T(198, surf + 92, 58, 800, '#fff', '62%', 'middle', 'Inter Tight') + T(198, surf + 128, 23, 700, '#fff', 'battery · about 18 h', 'middle', 'Inter', 'opacity=".85"');
  }
  return s + END;
}

// ---------------------------------------------------------------- 10 · Deep Work
export function deepWork(state = 'active', id = 'dw') {
  let s = HEAD(id);
  const aod = state === 'aod', brk = state === 'alt';
  const A = brk ? '#3ddc84' : '#ff6b4a', cx = 198, cy = 258, r = 140;
  s += `<rect width="396" height="484" fill="${aod ? '#000' : '#08080b'}"/>`;
  if (!aod) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${A}" opacity=".12" filter="url(#${id}b)"/>`;
  s += STATUS(aod ? GREY : '#fff', 64, aod);
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-opacity="${aod ? 0.12 : 0.1}" stroke-width="${aod ? 3 : 16}"/>`;
  s += `<path d="${arc(cx, cy, r, brk ? 0.999 : 0.75)}" stroke="${aod ? GREY : A}" stroke-width="${aod ? 3 : 16}" fill="none" stroke-linecap="round"/>`;
  s += T(cx, cy + 10, 84, aod ? 300 : 700, aod ? GREY : '#fff', '10:09', 'middle', 'Inter Tight', 'letter-spacing="-3"');
  s += T(cx, cy + 56, 23, 700, aod ? GREY : A, brk ? 'Break · 4:12' : 'Focus · 18:42 left', 'middle');
  if (aod) return s + END;
  if (brk) s += T(cx, 452, 23, 600, '#fff', 'Stand up and stretch', 'middle');
  else {
    s += `<path d="M${cx - 112} 432 a13 13 0 0 1 26 0 v8 l4 5 h-34 l4 -5z" fill="#fff" opacity=".85"/><line x1="${cx - 120}" y1="424" x2="${cx - 82}" y2="452" stroke="#08080b" stroke-width="7"/><line x1="${cx - 120}" y1="424" x2="${cx - 82}" y2="452" stroke="#fff" stroke-width="3"/>`;
    s += T(cx - 70, 448, 23, 600, '#fff', '4 alerts on hold');
  }
  return s + END;
}

export const CONCEPTS = [
  { n: 6, slug: 'glance-deck', name: 'Glance Deck', fn: glanceDeck, kind: 'Notification centre', alt: 'Expanded deck', glow: 'rgba(123,92,255,.38)', glow2: 'rgba(32,211,194,.25)',
    tag: 'A tiny notification centre.', sub: 'Your next three things, stacked like cards.', bullets: ['Priority card fans to the front', 'Tap to spread the deck; swipe to clear', 'Weather, steps and music as glass tiles'] },
  { n: 7, slug: 'next-stop', name: 'Next Stop', fn: nextStop, kind: 'Commute', alt: 'Arrival alert', glow: 'rgba(139,92,246,.40)', glow2: 'rgba(255,209,102,.20)',
    tag: 'Your metro ride, live.', sub: 'The train moves along your line, stop by stop.', bullets: ['Big "4 min" to your stop', 'Wrist alert: next stop, which doors open', 'Always-on keeps the minutes'] },
  { n: 8, slug: 'bloom', name: 'Bloom', fn: bloom, kind: 'Wellness', alt: 'Goal reached', glow: 'rgba(255,143,177,.35)', glow2: 'rgba(63,174,90,.28)',
    tag: 'Your steps grow a flower.', sub: 'Petals open as you move; full bloom at your goal.', bullets: ['Progress you can feel, not just read', 'Celebration bloom at 10,000 steps', 'Line-art flower in always-on'] },
  { n: 9, slug: 'tide', name: 'Tide', fn: tide, kind: 'Battery', alt: 'Low tide', glow: 'rgba(47,168,255,.38)', glow2: 'rgba(255,107,74,.20)',
    tag: 'Battery as water.', sub: 'The tide falls through the day and glows red when low.', bullets: ['Water level is the battery level', 'Low tide turns warm: charge soon', 'A single wave line in always-on'] },
  { n: 10, slug: 'deep-work', name: 'Deep Work', fn: deepWork, kind: 'Focus', alt: 'Break time', glow: 'rgba(255,107,74,.32)', glow2: 'rgba(61,220,132,.20)',
    tag: 'Time to focus.', sub: 'A ring counts down while alerts wait.', bullets: ['Focus ring wraps the time', 'Alerts held until your break', 'Turns green when it is time to rest'] },
];

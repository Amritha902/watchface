// PRAHAR watch face — rendering engine (pure SVG, no dependencies).
// Renders a 466x466 round AMOLED face. Everything is derived from:
//   time-of-day, day-of-year, latitude/longitude/timezone.

export const PRAHARS = [
  { en: 'Purvahna',  hi: 'पूर्वाह्न', nudge: 'Move · plan the day',     hiN: 'चलें · दिन की योजना',  color: '#FFD166' },
  { en: 'Madhyahna', hi: 'मध्याह्न',  nudge: 'Deep focus window',       hiN: 'गहन एकाग्रता',        color: '#FFF1A8' },
  { en: 'Aparahna',  hi: 'अपराह्न',   nudge: 'Hydrate · take a walk',   hiN: 'पानी पिएँ · टहलें',     color: '#FFB347' },
  { en: 'Sayahna',   hi: 'सायाह्न',   nudge: 'Wrap up · reconnect',     hiN: 'काम समेटें · मिलें',     color: '#FF8C61' },
  { en: 'Pradosha',  hi: 'प्रदोष',    nudge: 'Unplug · family time',    hiN: 'स्क्रीन बंद · परिवार',   color: '#C79BFF' },
  { en: 'Nishitha',  hi: 'निशीथ',     nudge: 'Wind down for sleep',     hiN: 'सोने की तैयारी',       color: '#93A9FF' },
  { en: 'Triyama',   hi: 'त्रियामा',   nudge: 'Deep rest',               hiN: 'गहरी नींद',            color: '#74CFFF' },
  { en: 'Usha',      hi: 'उषा',       nudge: 'Rise · breathe',          hiN: 'जागें · श्वास',          color: '#FF9EC4' },
];

export const CITIES = {
  delhi:     { name: 'New Delhi', lat: 28.61, lng: 77.21, tz: 5.5 },
  mumbai:    { name: 'Mumbai',    lat: 19.08, lng: 72.88, tz: 5.5 },
  bengaluru: { name: 'Bengaluru', lat: 12.97, lng: 77.59, tz: 5.5 },
  london:    { name: 'London',    lat: 51.51, lng: -0.13, tz: 0, dst: true },
  oslo:      { name: 'Oslo',      lat: 59.91, lng: 10.75, tz: 1, dst: true },
};

const C = 233; // centre
const mod24 = (x) => ((x % 24) + 24) % 24;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const rad = (d) => (d * Math.PI) / 180;

// EU-style DST approximation (last Sun of March .. last Sun of October ≈ doy 88..300)
export const tzFor = (city, doy) => city.tz + (city.dst && doy >= 88 && doy < 300 ? 1 : 0);

// NOAA solar approximation → local sunrise / sunset in hours
export function sunTimes(doy, lat, lng, tz) {
  const g = (2 * Math.PI / 365) * (doy - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const la = rad(lat);
  const arg = Math.cos(rad(90.833)) / (Math.cos(la) * Math.cos(decl)) - Math.tan(la) * Math.tan(decl);
  const ha = (Math.acos(clamp(arg, -1, 1)) * 180) / Math.PI;
  const sr = (720 - 4 * (lng + ha) - eq) / 60 + tz;
  const ss = (720 - 4 * (lng - ha) - eq) / 60 + tz;
  return { sr: mod24(sr), ss: mod24(ss) };
}

// The 8 prahars: 4 equal parts of daylight, 4 equal parts of night.
export function prahars(sr, ss) {
  const day = mod24(ss - sr) || 24;
  const night = 24 - day;
  const out = [];
  for (let i = 0; i < 4; i++) out.push({ start: mod24(sr + (i * day) / 4), len: day / 4 });
  for (let i = 0; i < 4; i++) out.push({ start: mod24(ss + (i * night) / 4), len: night / 4 });
  return out.map((p, i) => ({ ...p, ...PRAHARS[i], i }));
}

export function currentPrahar(list, t) {
  for (const p of list) {
    const d = mod24(t - p.start);
    if (d < p.len) return { ...p, progress: d / p.len, remaining: p.len - d };
  }
  return { ...list[0], progress: 0, remaining: list[0].len };
}

// Moon phase fraction 0..1 (0 = new, .5 = full)
export function moonPhase(date) {
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date.getTime() - ref) / 86400000;
  return (((days / 29.530588853) % 1) + 1) % 1;
}

// ---- sky colour ----------------------------------------------------------
const PAL = {
  night:    ['#03050d', '#0a1130'],
  predawn:  ['#0d1336', '#3b2d5e'],
  dawn:     ['#2b3a7a', '#e9805a'],
  morning:  ['#2f6cc0', '#e9c08a'],
  noon:     ['#1655b0', '#4f9ddf'],
  golden:   ['#2c58a6', '#e8a95e'],
  sunset:   ['#272b69', '#e2654a'],
  twilight: ['#10153b', '#4a2a62'],
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, f) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join('');
};
function sky(t, sr, ss) {
  const mid = sr + mod24(ss - sr) / 2;
  const keys = [
    [sr - 1.6, 'night'], [sr - 0.6, 'predawn'], [sr, 'dawn'], [sr + 1.2, 'morning'],
    [mid, 'noon'], [ss - 1.2, 'golden'], [ss, 'sunset'], [ss + 0.7, 'twilight'], [ss + 1.6, 'night'],
  ].map(([h, k]) => [mod24(h), k]).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < keys.length; i++) {
    const [h0, k0] = keys[i];
    const [h1, k1] = keys[(i + 1) % keys.length];
    const span = mod24(h1 - h0) || 24;
    const d = mod24(t - h0);
    if (d <= span) {
      const f = d / span;
      return [mix(PAL[k0][0], PAL[k1][0], f), mix(PAL[k0][1], PAL[k1][1], f)];
    }
  }
  return PAL.night;
}

// ---- geometry ------------------------------------------------------------
const ang = (t) => mod24(t) * 15 + 180; // midnight bottom, noon top, clockwise
const pt = (r, deg) => [C + r * Math.sin(rad(deg)), C - r * Math.cos(rad(deg))];
function arc(r, t0, len) {
  const a0 = ang(t0), sweep = len * 15, a1 = a0 + sweep;
  const [x0, y0] = pt(r, a0), [x1, y1] = pt(r, a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
function moonPath(x, y, r, f) {
  const k = Math.cos(2 * Math.PI * f);
  const rx = Math.abs(k) * r;
  const waxing = f < 0.5, crescent = k > 0;
  if (waxing) {
    return `M${x} ${y - r}A${r} ${r} 0 0 1 ${x} ${y + r}A${rx} ${r} 0 0 ${crescent ? 0 : 1} ${x} ${y - r}Z`;
  }
  return `M${x} ${y - r}A${r} ${r} 0 0 0 ${x} ${y + r}A${rx} ${r} 0 0 ${crescent ? 1 : 0} ${x} ${y - r}Z`;
}

// deterministic star field
const STARS = (() => {
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out = [];
  while (out.length < 70) {
    const x = rnd() * 466, y = rnd() * 466;
    if (Math.hypot(x - C, y - C) < 196) out.push([x, y, 0.4 + rnd() * 1.1, 0.3 + rnd() * 0.7]);
  }
  return out;
})();

const fmtDur = (h) => {
  const m = Math.round(h * 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
};
const fmtClock = (h) => {
  const m = Math.floor(mod24(h) * 60 + 1e-6);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
export { fmtDur, fmtClock };

/**
 * state = { t (hours 0-24), date (Date for weekday/moon), doy, city, aod, lang ('en'|'hi'), id }
 * returns SVG markup string
 */
export function renderFace(state) {
  const { t, doy, date, city, aod = false, lang = 'en', id = 'f' } = state;
  const day = new Date(Date.UTC(date.getUTCFullYear(), 0, doy, 12)); // local calendar day for labels
  const tz = tzFor(city, doy);
  const { sr, ss } = sunTimes(doy, city.lat, city.lng, tz);
  const list = prahars(sr, ss);
  const cur = currentPrahar(list, t);
  const next = list[(cur.i + 1) % 8];
  const dayLen = mod24(ss - sr);
  const isDay = mod24(t - sr) < dayLen;
  const solar = isDay ? Math.sin((Math.PI * mod24(t - sr)) / dayLen)
                      : -Math.sin((Math.PI * mod24(t - ss)) / (24 - dayLen));
  const starA = clamp(-solar * 2.2, 0, 1);
  const [top, bot] = sky(t, sr, ss);
  const brahma = mod24(sr - 1.6); // Brahma muhurta: 96 → 48 min before sunrise
  const inBrahma = mod24(t - brahma) < 0.8;
  const accent = cur.color;
  const R = 204; // prahar ring radius
  const gap = 0.07;

  const font = `font-family="Outfit, 'Segoe UI', sans-serif"`;
  const deva = `font-family="'Noto Sans Devanagari', 'Outfit', sans-serif"`;
  const wd = day.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();
  const dm = day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).toUpperCase();

  let s = `<svg viewBox="0 0 466 466" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PRAHAR watch face showing ${fmtClock(t)}, ${cur.en}">`;
  s += `<defs>
    <clipPath id="${id}c"><circle cx="${C}" cy="${C}" r="233"/></clipPath>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}"/><stop offset=".62" stop-color="${bot}"/><stop offset="1" stop-color="${mix(bot, '#000000', 0.55)}"/>
    </linearGradient>
    <radialGradient id="${id}v" cx=".5" cy=".5" r=".5">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
    </radialGradient>
    <radialGradient id="${id}m" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}g" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${isDay ? '#FFE8A3' : '#DCE6FF'}" stop-opacity=".85"/>
      <stop offset="1" stop-color="${isDay ? '#FFB347' : '#93A9FF'}" stop-opacity="0"/>
    </radialGradient>
  </defs><g clip-path="url(#${id}c)">`;

  // background
  if (aod) {
    s += `<rect width="466" height="466" fill="#000"/>`;
  } else {
    s += `<rect width="466" height="466" fill="url(#${id}s)"/>`;
    if (starA > 0.01) {
      s += `<g opacity="${starA.toFixed(2)}">` + STARS.map(([x, y, r, o]) =>
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${o.toFixed(2)}"/>`).join('') + `</g>`;
    }
    s += `<circle cx="${C}" cy="${C}" r="170" fill="url(#${id}m)"/>`;
    s += `<rect width="466" height="466" fill="url(#${id}v)"/>`;
  }

  // horizon hint: sunrise → sunset chord markers
  const markR = 224;
  for (const [h, lbl] of [[sr, '☀︎↑'], [ss, '☀︎↓']]) {
    const [x, y] = pt(markR, ang(h));
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${aod ? 1.5 : 2.4}" fill="#FFD166" opacity="${aod ? 0.5 : 0.9}"><title>${lbl}</title></circle>`;
  }
  // Brahma muhurta arc
  s += `<path d="${arc(markR, brahma, 0.8)}" stroke="#FF9EC4" stroke-width="${aod ? 1.2 : 2.5}" stroke-linecap="round" fill="none" opacity="${aod ? 0.5 : 0.95}"/>`;

  // hour ticks
  for (let h = 0; h < 24; h++) {
    const major = h % 6 === 0;
    const [x0, y0] = pt(major ? 183 : 187, ang(h));
    const [x1, y1] = pt(192, ang(h));
    s += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="#fff" stroke-width="${major ? 2 : 1}" stroke-linecap="round" opacity="${aod ? 0.25 : major ? 0.7 : 0.35}"/>`;
  }
  if (!aod) {
    for (const h of [6, 12, 18]) {
      const [x, y] = pt(170, ang(h));
      s += `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11" ${font} font-weight="500" fill="#fff" opacity=".55">${String(h).padStart(2, '0')}</text>`;
    }
  }

  // prahar ring
  for (const p of list) {
    const active = p.i === cur.i;
    const d = arc(R, p.start + gap, Math.max(0.01, p.len - 2 * gap));
    if (aod) {
      s += `<path d="${d}" stroke="${p.color}" stroke-width="${active ? 2 : 1.2}" fill="none" opacity="${active ? 0.6 : 0.38}"/>`;
    } else {
      s += `<path d="${d}" stroke="${p.color}" stroke-width="12" fill="none" opacity="${active ? 0.32 : 0.2}"/>`;
    }
  }
  // progress inside current prahar
  const done = cur.progress * cur.len;
  if (done - gap > 0.01) {
    s += `<path d="${arc(R, cur.start + gap, done - gap)}" stroke="${accent}" stroke-width="${aod ? 3 : 12}" fill="none" opacity="${aod ? 0.85 : 1}"/>`;
  }

  // the "hand": sun by day, moon (real phase) by night
  const [hx, hy] = pt(R, ang(t));
  if (aod) {
    s += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="7" fill="#000" stroke="${accent}" stroke-width="2"/>`;
  } else {
    s += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="30" fill="url(#${id}g)"/>`;
    if (isDay) {
      s += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="11" fill="#FFF4D0" stroke="#FFC857" stroke-width="2.5"/>`;
    } else {
      const f = moonPhase(date);
      s += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="11" fill="#1a2140" stroke="#DCE6FF" stroke-opacity=".5" stroke-width="1"/>`;
      if (Math.abs(f - 0) > 0.015 && Math.abs(f - 1) > 0.015)
        s += `<path d="${moonPath(+hx.toFixed(1), +hy.toFixed(1), 11, f)}" fill="#EEF2FF"/>`;
    }
  }

  // centre typography
  const primary = lang === 'hi' ? cur.hi : cur.en;
  const secondary = lang === 'hi' ? cur.en : cur.hi;
  const nudge = inBrahma ? (lang === 'hi' ? 'ब्रह्म मुहूर्त · ध्यान' : 'Brahma muhurta · breathe') : (lang === 'hi' ? cur.hiN : cur.nudge);
  const nextName = lang === 'hi' ? next.hi : next.en;
  const textCol = aod ? '#bfbfbf' : '#fff';

  if (!aod) {
    s += `<text x="${C}" y="120" text-anchor="middle" font-size="13" ${font} font-weight="500" letter-spacing="3" fill="#fff" opacity=".78">${wd} · ${dm}</text>`;
  }
  s += `<text x="${C}" y="${aod ? 240 : 228}" text-anchor="middle" font-size="${aod ? 88 : 94}" ${font} font-weight="${aod ? 200 : 300}" letter-spacing="-2" fill="${textCol}">${fmtClock(t)}</text>`;

  const pFont = lang === 'hi' ? deva : font;
  const sFont = lang === 'hi' ? font : deva;
  s += `<text x="${C}" y="${aod ? 278 : 266}" text-anchor="middle" font-size="${aod ? 17 : 21}" ${pFont} font-weight="600" letter-spacing="${lang === 'hi' ? 0 : 1.5}" fill="${accent}" opacity="${aod ? 0.7 : 1}">${lang === 'hi' ? primary : primary.toUpperCase()}</text>`;

  if (!aod) {
    s += `<text x="${C}" y="289" text-anchor="middle" font-size="14" ${sFont} font-weight="400" fill="#fff" opacity=".7">${secondary} · ${lang === 'hi' ? `Prahar ${cur.i + 1}/8` : `प्रहर ${cur.i + 1}/8`}</text>`;
    // nudge chip
    const w = Math.max(120, nudge.length * 6.6 + 30);
    s += `<rect x="${(C - w / 2).toFixed(1)}" y="304" width="${w.toFixed(1)}" height="26" rx="13" fill="#000" fill-opacity=".28" stroke="${accent}" stroke-opacity=".55"/>`;
    s += `<circle cx="${(C - w / 2 + 14).toFixed(1)}" cy="317" r="3.5" fill="${accent}"/>`;
    s += `<text x="${(C + 6).toFixed(1)}" y="321.5" text-anchor="middle" font-size="12" ${lang === 'hi' ? deva : font} font-weight="500" fill="#fff">${nudge}</text>`;
    // countdown
    s += `<text x="${C}" y="352" text-anchor="middle" font-size="12" ${lang === 'hi' ? deva : font} fill="#fff" opacity=".72">${lang === 'hi' ? `${nextName} ${fmtDur(cur.remaining)} में` : `${nextName} in ${fmtDur(cur.remaining)}`}</text>`;

    // complications: heart, steps, battery (simulated from time of day)
    const awake = clamp(mod24(t - sr - 0.5) / Math.max(1, dayLen + 3), 0, 1);
    const steps = mod24(t - sr) > dayLen + 4 ? 0 : Math.round(9400 * (awake * awake * (3 - 2 * awake)));
    const hr = isDay ? 72 + Math.round(6 * Math.sin(t * 1.7)) : 56 + Math.round(3 * Math.sin(t));
    const batt = Math.round(100 - mod24(t - 7) * 3.1);
    const items = [
      ['#FF6B6B', `${hr}`, 'BPM'],
      ['#7CE0A3', steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : `${steps}`, 'STEPS'],
      ['#9DB4FF', `${batt}%`, 'BATT'],
    ];
    items.forEach(([c, v, l], k) => {
      const x = C + (k - 1) * 62;
      s += `<circle cx="${x}" cy="370" r="2.5" fill="${c}"/>`;
      s += `<text x="${x}" y="388" text-anchor="middle" font-size="13" ${font} font-weight="600" fill="#fff">${v}</text>`;
      s += `<text x="${x}" y="399" text-anchor="middle" font-size="7.5" ${font} letter-spacing="1.2" fill="#fff" opacity=".55">${l}</text>`;
    });
  }

  s += `</g></svg>`;
  return { svg: s, cur, list, sr, ss, next, inBrahma };
}

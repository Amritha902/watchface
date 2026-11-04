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

// ---- heart ----------------------------------------------------------------
const gauss = (u, m, w) => Math.exp(-(((u - m) / w) ** 2));
// one heartbeat as an ECG trace, u in [0,1)
const ecgWave = (u) => 0.12 * gauss(u, 0.1, 0.03) - 0.15 * gauss(u, 0.17, 0.01) + 1 * gauss(u, 0.2, 0.012)
  - 0.3 * gauss(u, 0.23, 0.012) + 0.22 * gauss(u, 0.42, 0.05);
// brightness envelope: "lub" then "dub", fast attack, exponential decay
export function beatPulse(secs, hr) {
  const ph = ((secs * hr) / 60) % 1;
  const lub = Math.exp(-ph * 9);
  const dub = ph > 0.17 ? 0.6 * Math.exp(-(ph - 0.17) * 9) : 0;
  return clamp(Math.max(lub, dub), 0, 1);
}
const heartPath = (x, y, k) => `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})" d="M0 6 C -9 -1 -11 -8 -6 -11 C -3 -13 0 -11 0 -8 C 0 -11 3 -13 6 -11 C 11 -8 9 -1 0 6Z"/>`;
export function simulatedHr(t, isDay) {
  return isDay ? 72 + Math.round(6 * Math.sin(t * 1.7)) : 56 + Math.round(3 * Math.sin(t));
}

/**
 * state = { t, doy, date, city, aod, lang, id,
 *           theme?  (character skin from themes.js, plus showTitle),
 *           hr?     (bpm; simulated when omitted), secs? (animation clock), spike? (0..1) }
 */
export function renderFace(state) {
  const { t, doy, date, city, aod = false, lang = 'en', id = 'f', theme: th = null, secs = 0, spike = 0 } = state;
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
  let starA = clamp(-solar * 2.2, 0, 1);
  let [top, bot] = sky(t, sr, ss);
  if (th) { [top, bot] = th.sky; starA = th.light ? 0 : starA * 0.5; }
  const brahma = mod24(sr - 1.6); // Brahma muhurta: 96 → 48 min before sunrise
  const inBrahma = mod24(t - brahma) < 0.8;
  const accent = th ? th.accent : cur.color;
  const ink = aod ? '#bfbfbf' : th ? th.ink : '#fff';
  const R = 204; // prahar ring radius
  const gap = 0.07;
  const hr = state.hr ?? simulatedHr(t, isDay);
  const pulse = beatPulse(secs, hr);
  const stress = aod ? 0 : clamp((hr - 95) / 50, 0, 1); // 0 calm → 1 racing

  const font = `font-family="Outfit, 'Segoe UI', sans-serif"`;
  const deva = `font-family="'Noto Sans Devanagari', 'Outfit', sans-serif"`;
  const tFont = th ? `font-family="${th.timeFont.replace(/"/g, "'")}"` : font;
  const lFont = th ? `font-family="${th.labelFont.replace(/"/g, "'")}"` : font;
  const wd = day.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();
  const dm = day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).toUpperCase();

  let s = `<svg viewBox="0 0 466 466" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PRAHAR watch face showing ${fmtClock(t)}, ${cur.en}">`;
  s += `<defs>
    <clipPath id="${id}c"><circle cx="${C}" cy="${C}" r="233"/></clipPath>
    <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}"/><stop offset=".62" stop-color="${bot}"/><stop offset="1" stop-color="${mix(bot, '#000000', th?.light ? 0.12 : 0.55)}"/>
    </linearGradient>
    <radialGradient id="${id}v" cx=".5" cy=".5" r=".5">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${th?.light ? 0.18 : 0.55}"/>
    </radialGradient>
    <radialGradient id="${id}m" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}h" cx=".5" cy=".5" r=".5">
      <stop offset=".5" stop-color="#ff1f3d" stop-opacity="0"/><stop offset=".85" stop-color="#ff1f3d" stop-opacity=".55"/><stop offset="1" stop-color="#ff1f3d" stop-opacity=".95"/>
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
    if (th) s += th.motif(accent, ink);
    if (!th?.light) s += `<circle cx="${C}" cy="${C}" r="170" fill="url(#${id}m)"/>`;
    s += `<rect width="466" height="466" fill="url(#${id}v)"/>`;
  }

  // heart-reactive glow: the edge of the screen breathes red with every beat
  if (stress > 0) {
    s += `<rect width="466" height="466" fill="url(#${id}h)" opacity="${(stress * (0.18 + 0.6 * pulse)).toFixed(3)}"/>`;
  }

  // sunrise / sunset markers + Brahma muhurta arc
  const markR = 224;
  for (const h of [sr, ss]) {
    const [x, y] = pt(markR, ang(h));
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${aod ? 1.5 : 2.4}" fill="#FFD166" opacity="${aod ? 0.5 : 0.9}"/>`;
  }
  s += `<path d="${arc(markR, brahma, 0.8)}" stroke="#FF9EC4" stroke-width="${aod ? 1.2 : 2.5}" stroke-linecap="round" fill="none" opacity="${aod ? 0.5 : 0.95}"/>`;

  // hour ticks
  for (let h = 0; h < 24; h++) {
    const major = h % 6 === 0;
    const [x0, y0] = pt(major ? 183 : 187, ang(h));
    const [x1, y1] = pt(192, ang(h));
    s += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${ink}" stroke-width="${major ? 2 : 1}" stroke-linecap="round" opacity="${aod ? 0.25 : major ? 0.7 : 0.35}"/>`;
  }
  if (!aod) {
    for (const h of [6, 12, 18]) {
      const [x, y] = pt(170, ang(h));
      s += `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11" ${font} font-weight="500" fill="${ink}" opacity=".55">${String(h).padStart(2, '0')}</text>`;
    }
  }

  // prahar ring
  for (const p of list) {
    const active = p.i === cur.i;
    const col = th ? th.ring : p.color;
    const d = arc(R, p.start + gap, Math.max(0.01, p.len - 2 * gap));
    if (aod) {
      s += `<path d="${d}" stroke="${p.color}" stroke-width="${active ? 2 : 1.2}" fill="none" opacity="${active ? 0.6 : 0.38}"/>`;
    } else {
      s += `<path d="${d}" stroke="${col}" stroke-width="12" fill="none" opacity="${th ? (active ? 0.9 : 0.6) : active ? 0.32 : 0.2}"/>`;
    }
  }
  const done = cur.progress * cur.len;
  if (done - gap > 0.01) {
    s += `<path d="${arc(R, cur.start + gap, done - gap)}" stroke="${aod ? cur.color : accent}" stroke-width="${aod ? 3 : 12}" fill="none" opacity="${aod ? 0.85 : 1}"/>`;
  }

  // the "hand": sun by day, moon (real phase) by night
  const [hx, hy] = pt(R, ang(t));
  if (aod) {
    s += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="7" fill="#000" stroke="${cur.color}" stroke-width="2"/>`;
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

  // breathing guide during a heart-rate spike: ring expands 4 s (in), contracts 6 s (out)
  let breathe = '';
  if (spike > 0 && !aod) {
    const cyc = secs % 10;
    const inhale = cyc < 4;
    const e = inhale ? (1 - Math.cos((Math.PI * cyc) / 4)) / 2 : (1 + Math.cos((Math.PI * (cyc - 4)) / 6)) / 2;
    const r = 112 + 44 * e;
    s += `<circle cx="${C}" cy="${C}" r="${r.toFixed(1)}" fill="${accent}" fill-opacity="${(0.04 + 0.06 * e).toFixed(3)}" stroke="${accent}" stroke-width="1.5" opacity="${(0.35 + 0.5 * spike).toFixed(2)}"/>`;
    breathe = inhale ? 'Breathe in…' : 'Breathe out…';
  }

  // centre typography
  const primary = lang === 'hi' ? cur.hi : cur.en;
  const secondary = lang === 'hi' ? cur.en : cur.hi;
  let nudge = inBrahma && !th ? (lang === 'hi' ? 'ब्रह्म मुहूर्त · ध्यान' : 'Brahma muhurta · breathe') : th ? th.nudges[cur.i] : (lang === 'hi' ? cur.hiN : cur.nudge);
  let chipCol = accent;
  if (breathe) { nudge = `♥ ${hr} spike · ${breathe}`; chipCol = '#ff3b55'; }
  const nextName = lang === 'hi' ? next.hi : next.en;

  if (!aod) {
    s += `<text x="${C}" y="${th ? 112 : 120}" text-anchor="middle" font-size="13" ${font} font-weight="500" letter-spacing="3" fill="${ink}" opacity=".78">${wd} · ${dm}</text>`;
    if (th) s += `<text x="${C}" y="132" text-anchor="middle" font-size="9.5" ${font} font-weight="600" letter-spacing="2.5" fill="${accent}" opacity=".9">${th.name.toUpperCase()} · ${th.showTitle.toUpperCase()}</text>`;
  }
  s += `<text x="${C}" y="${aod ? 240 : 228}" text-anchor="middle" font-size="${aod ? 88 : 94}" ${aod ? font : tFont} font-weight="${aod ? 200 : th ? th.timeWeight : 300}" letter-spacing="-2" fill="${ink}">${fmtClock(t)}</text>`;

  const pFont = lang === 'hi' ? deva : th ? lFont : font;
  const sFont = lang === 'hi' ? font : deva;
  s += `<text x="${C}" y="${aod ? 278 : 266}" text-anchor="middle" font-size="${aod ? 17 : th && /Fraktur/.test(th.labelFont) && lang !== 'hi' ? 25 : 21}" ${aod && lang !== 'hi' ? font : pFont} font-weight="600" letter-spacing="${lang === 'hi' ? 0 : 1.5}" fill="${aod ? cur.color : accent}" opacity="${aod ? 0.7 : 1}">${lang === 'hi' || (!aod && th && /Fraktur/.test(th.labelFont)) ? primary : primary.toUpperCase()}</text>`;

  if (!aod) {
    s += `<text x="${C}" y="289" text-anchor="middle" font-size="14" ${sFont} font-weight="400" fill="${ink}" opacity=".7">${secondary} · ${lang === 'hi' ? `Prahar ${cur.i + 1}/8` : `प्रहर ${cur.i + 1}/8`}</text>`;
    // nudge chip
    const w = Math.max(120, nudge.length * 6.6 + 30);
    s += `<rect x="${(C - w / 2).toFixed(1)}" y="304" width="${w.toFixed(1)}" height="26" rx="13" fill="${th?.light ? '#fff' : '#000'}" fill-opacity="${th?.light ? 0.55 : 0.28}" stroke="${chipCol}" stroke-opacity="${breathe ? 0.5 + 0.5 * pulse : 0.55}"/>`;
    s += `<circle cx="${(C - w / 2 + 14).toFixed(1)}" cy="317" r="3.5" fill="${chipCol}"/>`;
    s += `<text x="${(C + 6).toFixed(1)}" y="321.5" text-anchor="middle" font-size="12" ${lang === 'hi' && !th && !breathe ? deva : font} font-weight="500" fill="${ink}">${nudge}</text>`;
    s += `<text x="${C}" y="352" text-anchor="middle" font-size="12" ${lang === 'hi' ? deva : font} fill="${ink}" opacity=".72">${lang === 'hi' ? `${nextName} ${fmtDur(cur.remaining)} में` : `${nextName} in ${fmtDur(cur.remaining)}`}</text>`;

    const heartCol = '#FF4D5E';
    if (stress > 0.05) {
      // racing heart: big beating heart + live ECG trace replaces the stats row
      s += `<g fill="${heartCol}">${heartPath(C - 70, 384, 1.25 + 0.35 * pulse)}</g>`;
      s += `<text x="${C - 48}" y="390" font-size="17" ${font} font-weight="700" fill="${ink}">${hr}</text>`;
      s += `<text x="${C - 48}" y="401" font-size="7.5" ${font} letter-spacing="1.2" fill="${ink}" opacity=".6">BPM</text>`;
      const W = 2.4, N = 72, x0 = C - 8, wpx = 100, base = 393, amp = 20;
      let d = '';
      for (let i = 0; i <= N; i++) {
        const tt = secs - W + (W * i) / N;
        const u = ((((tt * hr) / 60) % 1) + 1) % 1;
        d += `${i ? 'L' : 'M'}${(x0 + (wpx * i) / N).toFixed(1)} ${(base - amp * ecgWave(u)).toFixed(1)}`;
      }
      s += `<path d="${d}" fill="none" stroke="${heartCol}" stroke-width="1.8" stroke-linejoin="round" opacity=".95"/>`;
      s += `<circle cx="${x0 + wpx}" cy="${(base - amp * ecgWave(((secs * hr) / 60) % 1)).toFixed(1)}" r="2.5" fill="#fff"/>`;
    } else {
      const awake = clamp(mod24(t - sr - 0.5) / Math.max(1, dayLen + 3), 0, 1);
      const steps = mod24(t - sr) > dayLen + 4 ? 0 : Math.round(9400 * (awake * awake * (3 - 2 * awake)));
      const batt = Math.round(100 - mod24(t - 7) * 3.1);
      const items = [
        [heartCol, `${hr}`, 'BPM'],
        ['#7CE0A3', steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : `${steps}`, 'STEPS'],
        ['#9DB4FF', `${batt}%`, 'BATT'],
      ];
      items.forEach(([c, v, l], k) => {
        const x = C + (k - 1) * 62;
        if (k === 0) s += `<g fill="${c}">${heartPath(x, 370, 0.5 + 0.12 * pulse)}</g>`;
        else s += `<circle cx="${x}" cy="370" r="2.5" fill="${c}"/>`;
        s += `<text x="${x}" y="388" text-anchor="middle" font-size="13" ${font} font-weight="600" fill="${ink}">${v}</text>`;
        s += `<text x="${x}" y="399" text-anchor="middle" font-size="7.5" ${font} letter-spacing="1.2" fill="${ink}" opacity=".55">${l}</text>`;
      });
    }
  }

  // brightness throb: whole face dims between beats when the heart races
  if (stress > 0) s += `<rect width="466" height="466" fill="#000" opacity="${(stress * 0.38 * (1 - pulse)).toFixed(3)}"/>`;
  // spike flash: a red ring that snaps on with each beat
  if (spike > 0 && !aod) s += `<circle cx="${C}" cy="${C}" r="229" fill="none" stroke="#ff2a45" stroke-width="7" opacity="${(spike * pulse).toFixed(3)}"/>`;

  s += `</g></svg>`;
  return { svg: s, cur, list, sr, ss, next, inBrahma, hr };
}

// ---- Binge Match watch screens ------------------------------------------------
const shell = (id, inner, bg = '#07080c') => `<svg viewBox="0 0 466 466" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${id}c"><circle cx="${C}" cy="${C}" r="233"/></clipPath></defs><g clip-path="url(#${id}c)"><rect width="466" height="466" fill="${bg}"/>${inner}</g></svg>`;
const ff = `font-family="Outfit, sans-serif"`;

export function renderSuggest(show, id = 'sg') {
  let s = `<circle cx="${C}" cy="120" r="34" fill="#E50914" opacity=".14"/><circle cx="${C}" cy="120" r="22" fill="#E50914" opacity=".25"/>`;
  s += `<path d="M225 108 L247 120 L225 132Z" fill="#fff"/>`;
  s += `<text x="${C}" y="184" text-anchor="middle" font-size="12" ${ff} letter-spacing="3" fill="#fff" opacity=".6">NOW WATCHING</text>`;
  s += `<text x="${C}" y="222" text-anchor="middle" font-size="34" ${ff} font-weight="600" fill="#fff">${show.title}</text>`;
  s += `<text x="${C}" y="256" text-anchor="middle" font-size="15" ${ff} fill="#fff" opacity=".8">Want a face inspired by it?</text>`;
  s += `<rect x="137" y="286" width="192" height="44" rx="22" fill="#FFC857"/><text x="${C}" y="314" text-anchor="middle" font-size="16" ${ff} font-weight="600" fill="#111">Design my face</text>`;
  s += `<text x="${C}" y="362" text-anchor="middle" font-size="13" ${ff} fill="#fff" opacity=".5">Later</text>`;
  return shell(id, s);
}

export function renderDesigning(char, progress, step, id = 'dg') {
  const a = char.accent;
  const R = 150, ang0 = -90, a1 = ang0 + 360 * progress;
  const p = (deg) => [C + R * Math.cos((deg * Math.PI) / 180), C + R * Math.sin((deg * Math.PI) / 180)];
  const [x0, y0] = p(ang0), [x1, y1] = p(a1);
  let s = `<rect width="466" height="466" fill="${char.sky[1]}" opacity=".6"/>`;
  s += char.motif(a, char.ink);
  s += `<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="6"/>`;
  if (progress > 0.001) s += `<path d="M${x0} ${y0}A${R} ${R} 0 ${progress > 0.5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${a}" stroke-width="6" stroke-linecap="round"/>`;
  s += `<text x="${C}" y="200" text-anchor="middle" font-size="12" ${ff} letter-spacing="3" fill="#fff" opacity=".6">DESIGNING</text>`;
  s += `<text x="${C}" y="240" text-anchor="middle" font-size="30" ${ff} font-weight="600" fill="${char.light ? '#111' : '#fff'}">${char.name}</text>`;
  s += `<text x="${C}" y="270" text-anchor="middle" font-size="13" ${ff} fill="${char.light ? '#111' : '#fff'}" opacity=".75">${step}</text>`;
  s += `<text x="${C}" y="305" text-anchor="middle" font-size="22" ${ff} font-weight="300" fill="${a}">${Math.round(progress * 100)}%</text>`;
  return shell(id, s, char.sky[0]);
}

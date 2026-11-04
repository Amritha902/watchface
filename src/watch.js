// ENCORE — watch screen renderer (396 × 484, rounded-rect OLED). Pure SVG strings.
import { W, H } from './faces.js';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const ease = (x) => { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const UI = `font-family="Inter, 'Inter Tight', system-ui, sans-serif"`;
const RX = 92;

export const fmt12 = (t) => {
  const m = Math.floor((((t % 24) + 24) % 24) * 60 + 1e-6);
  const h = Math.floor(m / 60) % 12 || 12;
  return [String(h), String(m % 60).padStart(2, '0')];
};

const gauss = (u, m, w) => Math.exp(-(((u - m) / w) ** 2));
export function beatPulse(secs, hr) {
  const ph = ((secs * hr) / 60) % 1;
  return clamp(Math.max(Math.exp(-ph * 9), ph > 0.17 ? 0.6 * Math.exp(-(ph - 0.17) * 9) : 0), 0, 1);
}
const heart = (x, y, k, fill) => `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})" fill="${fill}" d="M0 6 C -9 -1 -11 -8 -6 -11 C -3 -13 0 -11 0 -8 C 0 -11 3 -13 6 -11 C 11 -8 9 -1 0 6Z"/>`;

const open = (id, inner, extraDefs = '') => `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs>
  <clipPath id="${id}clip"><rect width="${W}" height="${H}" rx="${RX}"/></clipPath>
  <filter id="${id}soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="${id}shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity=".45"/></filter>
  ${extraDefs}</defs><g clip-path="url(#${id}clip)">${inner}</g></svg>`;

// ------------------------------------------------------------------ HOME FACE
/**
 * o = { face, t, secs, id, hr, spike (0..1), play: {show, ep, left, total} | null, day: 'WED 4' }
 */
export function renderHome(o) {
  const { face: f, t, secs = 0, id = 'h', hr = 72, spike = 0, play = null, day = '', aod = false } = o;
  const [hh, mm] = fmt12(t);
  const pulse = beatPulse(secs, hr);
  const stress = clamp((hr - 95) / 50, 0, 1);
  const ink = aod ? '#a8a8a8' : f.ink;
  const medal = f.frame === 'medallion' && !aod;
  let s;
  if (aod) s = `<rect width="${W}" height="${H}" fill="#000"/>`;
  else if (medal) {
    // ray burst + the face's own artwork inside a ringed circle (works for scenes, photos and AI art)
    s = `<rect width="${W}" height="${H}" fill="#050507"/>`;
    for (let k = 0; k < 36; k++) { const a = (k * 10 + secs * 2) * Math.PI / 180, b = a + Math.PI / 54; s += `<path d="M198 318 L ${(198 + 600 * Math.cos(a)).toFixed(1)} ${(318 + 600 * Math.sin(a)).toFixed(1)} L ${(198 + 600 * Math.cos(b)).toFixed(1)} ${(318 + 600 * Math.sin(b)).toFixed(1)} Z" fill="${f.accent}" opacity=".07"/>`; }
    s += `<circle cx="198" cy="318" r="150" fill="${f.accent}" opacity=".25" filter="url(#${id}soft)"/>`;
    s += `<defs><clipPath id="${id}med"><circle cx="198" cy="318" r="128"/></clipPath></defs><g clip-path="url(#${id}med)"><g transform="translate(67.3 158.3) scale(0.66)">${f.wallpaper({ id: id + 'w', secs })}</g></g>`;
    s += `<circle cx="198" cy="318" r="131" fill="none" stroke="#fff" stroke-width="7"/>`;
  } else s = f.wallpaper({ id, secs });
  if (!aod && f.dim) s += `<rect width="${W}" height="${H}" fill="${f.dim > 0 ? '#000' : '#fff'}" opacity="${Math.abs(f.dim).toFixed(2)}"/>`;

  // scrim behind type for legibility (premium: soft vignette, not a box)
  if (!aod) s += `<rect width="${W}" height="${H}" fill="url(#${id}vig)"/>`;

  // status row
  const pos = f.clockPos && f.clockPos !== 'auto' ? f.clockPos : medal ? 'right' : null;
  const ax = pos === 'left' ? 34 : pos === 'right' ? W - 34 : W / 2, anchor = pos === 'left' ? 'start' : pos === 'right' ? 'end' : 'middle';
  const k = f.timeScale || 1;
  if (medal) {
    // heart rate sits in the corner opposite the clock
    s += pos === 'left'
      ? heart(W - 92, 58, 1.25 + 0.15 * pulse, '#ff4d5e') + `<text x="${W - 36}" y="66" text-anchor="end" ${UI} font-size="23" font-weight="700" fill="#fff">${hr}</text>`
      : heart(54, 58, 1.25 + 0.15 * pulse, '#ff4d5e') + `<text x="72" y="66" ${UI} font-size="23" font-weight="700" fill="#fff">${hr}</text>`;
    s += `<text x="${ax}" y="${pos === 'left' ? 104 : 66}" text-anchor="${anchor}" ${UI} font-size="23" font-weight="700" letter-spacing="1.5" fill="#fff">${day}</text>`;
  } else {
    s += `<text x="38" y="66" ${UI} font-size="23" font-weight="700" letter-spacing="1.5" fill="${ink}">${day}</text>`;
    s += heart(W - 92, 58, 1.25 + 0.15 * pulse, aod ? '#7a3a3a' : '#ff4d5e');
    s += `<text x="${W - 36}" y="66" text-anchor="end" ${UI} font-size="23" font-weight="700" fill="${ink}">${hr}</text>`;
  }

  // time
  const tf = `font-family="${f.timeFont.replace(/"/g, "'")}" font-weight="${aod ? 300 : f.timeWeight}"`;
  if (medal) {
    s += `<text x="${ax}" y="${(pos === 'left' ? 178 : 158) + 30 * (k - 1)}" text-anchor="${anchor}" ${tf} font-size="${(86 * k).toFixed(0)}" letter-spacing="-2" fill="#fff">${hh}:${mm}</text>`;
  } else if (pos) {
    s += `<text x="${ax}" y="${f.layout === 'photo' ? 146 : 280}" text-anchor="${anchor}" ${tf} font-size="${((f.layout === 'photo' ? 92 : 120) * k).toFixed(0)}" letter-spacing="-3" fill="${ink}" ${aod ? '' : `filter="url(#${id}shadow)"`}>${hh}:${mm}</text>`;
  } else if (f.layout === 'stack') {
    const big = (f.timeFont.includes('Bebas') ? 150 : 128) * Math.min(k, 1.12);
    s += `<g ${aod ? '' : `filter="url(#${id}shadow)"`}><text x="34" y="${f.timeFont.includes('Bebas') ? 206 : 202}" ${tf} font-size="${big}" letter-spacing="-4" fill="${ink}">${hh.padStart(2, '0')}</text>`;
    s += `<text x="34" y="${f.timeFont.includes('Bebas') ? 340 : 322}" ${tf} font-size="${big}" letter-spacing="-4" fill="${aod ? ink : f.accent}">${mm}</text></g>`;
  } else if (f.layout === 'photo' && !aod) {
    s += `<text x="${W / 2}" y="146" text-anchor="middle" ${tf} font-size="${(92 * k).toFixed(0)}" letter-spacing="-3" fill="${ink}" filter="url(#${id}shadow)">${hh}:${mm}</text>`;
  } else if (f.layout === 'glow' && !aod) {
    s += `<text x="${W / 2}" y="268" text-anchor="middle" ${tf} font-size="104" fill="${f.accent}" opacity=".8" filter="url(#${id}soft)">${hh}:${mm}</text>`;
    s += `<text x="${W / 2}" y="268" text-anchor="middle" ${tf} font-size="104" fill="#120202" stroke="${f.accent}" stroke-width="2.2">${hh}:${mm}</text>`;
  } else {
    const size = (f.timeFont.includes('Mono') ? 104 : 138) * Math.min(k, 1.1);
    s += `<text x="${W / 2}" y="${f.timeFont.includes('Mono') ? 270 : 280}" text-anchor="middle" ${tf} font-size="${size}" letter-spacing="${f.timeFont.includes('Mono') ? -6 : -6}" fill="${ink}" ${aod ? '' : `filter="url(#${id}shadow)"`}>${hh}:${mm}</text>`;
  }

  if (!aod && !medal && !f.hideCard) {
    // glass complication card
    const cy = 352, ch = 100;
    s += `<rect x="18" y="${cy}" width="${W - 36}" height="${ch}" rx="30" fill="#0b0b10" fill-opacity=".58" stroke="#fff" stroke-opacity=".14"/>`;
    if (play) {
      const prog = clamp(1 - play.left / play.total, 0, 1);
      s += `<rect x="32" y="${cy + 20}" width="58" height="58" rx="16" fill="${f.accent}"/>`;
      s += `<text x="61" y="${cy + 59}" text-anchor="middle" ${UI} font-size="28" font-weight="800" fill="#111">${play.show[0]}</text>`;
      s += `<text x="104" y="${cy + 43}" ${UI} font-size="23" font-weight="700" fill="#fff">${play.show}</text>`;
      s += `<text x="104" y="${cy + 72}" ${UI} font-size="21" fill="#fff" opacity=".72">${f.live ? play.ep : `${play.ep.replace(' · ', ' ')} · ${play.left}m left`}</text>`;
      s += `<rect x="104" y="${cy + 82}" width="196" height="4" rx="2" fill="#fff" opacity=".2"/><rect x="104" y="${cy + 82}" width="${(196 * prog).toFixed(1)}" height="4" rx="2" fill="${f.accent}"/>`;
      s += `<circle cx="${W - 56}" cy="${cy + 50}" r="24" fill="#fff"/><path d="M${W - 63} ${cy + 38} L ${W - 44} ${cy + 50} L ${W - 63} ${cy + 62} Z" fill="#111"/>`;
    } else {
      s += `<text x="38" y="${cy + 44}" ${UI} font-size="23" font-weight="700" fill="#fff">${f.nudge || 'Wind down at 10:30'}</text>`;
      s += `<text x="38" y="${cy + 76}" ${UI} font-size="21" font-weight="600" fill="#fff" opacity=".6">Up next</text>`;
      s += `<text x="${W - 38}" y="${cy + 76}" text-anchor="end" ${UI} font-size="23" font-weight="800" fill="${f.accent}">6,842 steps</text>`;
    }
  }
  if (!aod) s += `<rect x="${W / 2 - 18}" y="${H - 16}" width="36" height="4" rx="2" fill="#fff" opacity=".35"/>`;

  // heart sync: racing → red edge glow on every beat; spike → breathe overlay
  if (stress > 0 && !aod) {
    s += `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="${RX - 6}" fill="none" stroke="#ff2a45" stroke-width="18" opacity="${(stress * (0.25 + 0.75 * pulse)).toFixed(3)}" filter="url(#${id}soft)"/>`;
    s += `<rect width="${W}" height="${H}" fill="#000" opacity="${(stress * 0.3 * (1 - pulse)).toFixed(3)}"/>`;
  }
  if (spike > 0 && !aod) s += breatheLayer(id, secs, hr, spike, f.accent);

  const vig = `<radialGradient id="${id}vig" cx=".5" cy=".45" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>`;
  return open(id, s, vig);
}

function breatheLayer(id, secs, hr, k, accent) {
  const cyc = secs % 10, inhale = cyc < 4;
  const e = inhale ? (1 - Math.cos((Math.PI * cyc) / 4)) / 2 : (1 + Math.cos((Math.PI * (cyc - 4)) / 6)) / 2;
  let s = `<rect width="${W}" height="${H}" fill="#04050a" opacity="${(0.86 * k).toFixed(2)}"/><g opacity="${k.toFixed(2)}">`;
  for (let i = 0; i < 4; i++) {
    const r = 40 + e * 70 + i * (12 + e * 18);
    s += `<circle cx="${W / 2}" cy="214" r="${r.toFixed(1)}" fill="none" stroke="${i % 2 ? '#7fd4ff' : '#9d8bff'}" stroke-width="${2 + (3 - i)}" opacity="${(0.75 - i * 0.15).toFixed(2)}"/>`;
  }
  s += `<circle cx="${W / 2}" cy="214" r="${(36 + e * 60).toFixed(1)}" fill="#7fd4ff" opacity=".12" filter="url(#${id}soft)"/>`;
  s += `<text x="${W / 2}" y="380" text-anchor="middle" ${UI} font-size="30" font-weight="700" fill="#fff">${inhale ? 'Breathe in' : 'Breathe out'}</text>`;
  s += `<text x="${W / 2}" y="418" text-anchor="middle" ${UI} font-size="21" fill="#fff" opacity=".7">Heart rate ${hr} bpm</text></g>`;
  return s;
}

// ------------------------------------------------------------------ GALLERY (swipe)
// cards: [{face, label}], pos: fractional index (animated); last card may be {create:true}
export function renderGallery({ cards, pos, secs, t, id = 'g', day }) {
  const cw = W * 0.64, chh = H * 0.64, cy = 56;
  let s = `<rect width="${W}" height="${H}" fill="#000"/>`;
  s += `<text x="${W / 2}" y="40" text-anchor="middle" ${UI} font-size="21" font-weight="600" fill="#fff" opacity=".65">Swipe · tap to wear</text>`;
  cards.forEach((c, i) => {
    const d = i - pos;
    if (Math.abs(d) > 1.6) return;
    const sc = 1 - Math.min(Math.abs(d), 1) * 0.12;
    const w = cw * sc, h = chh * sc, x = W / 2 + d * (cw + 18) - w / 2, y = cy + (chh - h) / 2;
    if (c.create) {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${54 * sc}" fill="#121218" stroke="#fff" stroke-opacity=".18" stroke-dasharray="6 6"/>`;
      s += `<circle cx="${x + w / 2}" cy="${y + h / 2 - 22}" r="${34 * sc}" fill="url(#${id}cg)"/>`;
      s += `<path d="M${x + w / 2 - 12} ${y + h / 2 - 22} H ${x + w / 2 + 12} M ${x + w / 2} ${y + h / 2 - 34} V ${y + h / 2 - 10}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
      s += `<text x="${x + w / 2}" y="${y + h / 2 + 40}" text-anchor="middle" ${UI} font-size="23" font-weight="700" fill="#fff">Create your own</text>`;
      s += `<text x="${x + w / 2}" y="${y + h / 2 + 68}" text-anchor="middle" ${UI} font-size="21" fill="#fff" opacity=".6">Describe it</text>`;
    } else {
      const inner = renderHome({ face: c.face, t, secs, id: `${id}c${i}`, play: null, day }).replace('<svg ', `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" `);
      s += inner;
      if (c.badge) s += `<rect x="${x + w / 2 - 68}" y="${y - 16}" width="136" height="32" rx="16" fill="${c.face.accent}"/><text x="${x + w / 2}" y="${y + 7}" text-anchor="middle" ${UI} font-size="21" font-weight="800" fill="#111">${c.badge}</text>`;
    }
  });
  const cur = cards[Math.round(clamp(pos, 0, cards.length - 1))];
  const title = cur.create ? 'New face' : cur.face.name;
  const sub = cur.create ? 'From a description' : cur.face.show ? `Inspired by ${cur.face.show}` : cur.face.fromPrompt ? `“${cur.face.fromPrompt}”` : 'Encore original';
  s += `<text x="${W / 2}" y="${cy + chh + 36}" text-anchor="middle" ${UI} font-size="23" font-weight="700" fill="#fff">${title}</text>`;
  s += `<text x="${W / 2}" y="${cy + chh + 62}" text-anchor="middle" ${UI} font-size="21" fill="#fff" opacity=".6">${sub.length > 28 ? sub.slice(0, 27) + '…”' : sub}</text>`;
  cards.forEach((_, i) => {
    const on = Math.round(pos) === i;
    s += `<circle cx="${W / 2 + (i - (cards.length - 1) / 2) * 13}" cy="${H - 26}" r="${on ? 3.6 : 2.6}" fill="#fff" opacity="${on ? 1 : 0.3}"/>`;
  });
  return open(id, s, `<linearGradient id="${id}cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b5cff"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient>`);
}

// ------------------------------------------------------------------ GIFT REVEAL
export function renderGift({ face, el, reason, t, secs, id = 'gf', day }) {
  let s = `<rect width="${W}" height="${H}" fill="#000"/>`;
  const a = face.accent;
  // phase A: orb gathers (0–1.4 s)
  const orb = ease(el / 1.4), burst = ease((el - 1.3) / 0.9), card = ease((el - 1.6) / 0.9), ui = ease((el - 2.4) / 0.6);
  s += `<circle cx="${W / 2}" cy="214" r="${(30 + 30 * orb + 260 * burst).toFixed(1)}" fill="${a}" opacity="${(0.55 * (1 - burst * 0.85)).toFixed(2)}" filter="url(#${id}soft)"/>`;
  if (el < 1.9) {
    s += `<text x="${W / 2}" y="350" text-anchor="middle" ${UI} font-size="21" font-weight="600" fill="#fff" opacity="${(orb * (1 - burst)).toFixed(2)}">Something new, made for you…</text>`;
    for (let k = 0; k < 10; k++) { // sparkle ring
      const ang = (k / 10) * Math.PI * 2 + secs * 1.4, r = 70 - 30 * orb;
      s += `<circle cx="${(W / 2 + r * Math.cos(ang)).toFixed(1)}" cy="${(214 + r * Math.sin(ang)).toFixed(1)}" r="2.2" fill="#fff" opacity="${(orb * (1 - burst)).toFixed(2)}"/>`;
    }
  }
  if (card > 0) {
    const sc = 0.2 + 0.3 * card, w = W * sc, h = H * sc, x = W / 2 - w / 2, y = 192 - h / 2 + 10 * (1 - card);
    s += `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="${RX * sc + 3}" fill="none" stroke="${a}" stroke-width="2" opacity="${card.toFixed(2)}"/>`;
    s += renderHome({ face, t, secs, id: id + 'p', day, play: null }).replace('<svg ', `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" opacity="${card.toFixed(2)}" `);
    // light sweep across the card
    const sx = x - 80 + (w + 160) * ease((el - 2.0) / 0.8);
    if (el > 2.0 && el < 2.9) s += `<rect x="${sx.toFixed(1)}" y="${y}" width="40" height="${h}" fill="#fff" opacity=".22" transform="skewX(-18)"/>`;
  }
  if (ui > 0) {
    s += `<g opacity="${ui.toFixed(2)}">`;
    const [r1, r2] = reason.includes('·') ? [reason, ''] : reason.replace(/^(Because .*?(watching|is your favourite)|From your description)(.*)$/, '$1|$3').split('|');
    s += `<text x="${W / 2}" y="50" text-anchor="middle" ${UI} font-size="21" font-weight="800" letter-spacing="2" fill="${a}">MADE FOR YOU</text>`;
    s += `<text x="${W / 2}" y="340" text-anchor="middle" ${UI} font-size="21" fill="#fff" opacity=".75">${r1}</text>`;
    if (r2) s += `<text x="${W / 2}" y="368" text-anchor="middle" ${UI} font-size="23" font-weight="700" fill="#fff">${r2.trim()}</text>`;
    s += `<rect x="48" y="384" width="${W - 96}" height="52" rx="26" fill="#fff"/><text x="${W / 2}" y="418" text-anchor="middle" ${UI} font-size="23" font-weight="700" fill="#000">Wear this face</text>`;
    s += `<text x="${W / 2}" y="466" text-anchor="middle" ${UI} font-size="21" fill="#fff" opacity=".6">Save for later</text></g>`;
  }
  return open(id, s);
}

// ------------------------------------------------------------------ CREATE (describe it)
export function renderCreate({ prompt, secs, id = 'cr', listening = true }) {
  let s = `<rect width="${W}" height="${H}" fill="#000"/>`;
  s += `<text x="${W / 2}" y="66" text-anchor="middle" ${UI} font-size="27" font-weight="700" fill="#fff">Describe your face</text>`;
  s += `<text x="${W / 2}" y="96" text-anchor="middle" ${UI} font-size="21" fill="#fff" opacity=".6">Say it, or type on your phone</text>`;
  // listening orb
  for (let i = 0; i < 3; i++) {
    const r = 46 + 10 * Math.sin(secs * 3 + i * 1.3) * (listening ? 1 : 0.2) + i * 8;
    s += `<circle cx="${W / 2}" cy="210" r="${r.toFixed(1)}" fill="url(#${id}og)" opacity="${(0.55 - i * 0.15).toFixed(2)}"/>`;
  }
  s += `<path d="M${W / 2} 192 v 20 M ${W / 2 - 12} 206 a 12 12 0 0 0 24 0 M ${W / 2} 220 v 8" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  s += `<rect x="${W / 2 - 7}" y="186" width="14" height="26" rx="7" fill="#fff"/>`;
  const text = prompt ? `“${prompt}”` : 'e.g. “a rainy café in Mumbai”';
  const lines = wrap(text, 22);
  lines.slice(0, 3).forEach((ln, i) => {
    s += `<text x="${W / 2}" y="${312 + i * 30}" text-anchor="middle" ${UI} font-size="23" font-weight="${prompt ? 600 : 400}" fill="#fff" opacity="${prompt ? 1 : 0.4}">${ln}</text>`;
  });
  if (prompt) s += `<rect x="48" y="396" width="${W - 96}" height="54" rx="27" fill="#fff"/><text x="${W / 2}" y="431" text-anchor="middle" ${UI} font-size="23" font-weight="700" fill="#000">Design it</text>`;
  return open(id, s, `<radialGradient id="${id}og"><stop offset="0" stop-color="#ff5fa2"/><stop offset=".6" stop-color="#7b5cff"/><stop offset="1" stop-color="#2a1d6b"/></radialGradient>`);
}

export function renderDesigning({ face, p, step, secs, id = 'ds' }) {
  let s = `<rect width="${W}" height="${H}" fill="#000"/>`;
  // the face materialises inside a shimmering frame
  const sc = 0.56, w = W * sc, h = H * sc, x = W / 2 - w / 2, y = 60;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${RX * sc}" fill="#15151c"/>`;
  s += `<g opacity="${ease(p).toFixed(2)}">` + renderHome({ face, t: 10.15, secs, id: id + 'p', play: null }).replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `) + `</g>`;
  const sh = x - 60 + ((secs * 160) % (w + 120));
  s += `<rect x="${sh.toFixed(1)}" y="${y}" width="50" height="${h}" fill="#fff" opacity=".12" transform="skewX(-15)" clip-path="url(#${id}clip)"/>`;
  s += `<text x="${W / 2}" y="362" text-anchor="middle" ${UI} font-size="21" font-weight="800" letter-spacing="1.5" fill="${face.accent}">DESIGNING · ${Math.round(p * 100)}%</text>`;
  s += `<text x="${W / 2}" y="394" text-anchor="middle" ${UI} font-size="21" fill="#fff">${step}</text>`;
  s += `<rect x="78" y="420" width="${W - 156}" height="4" rx="2" fill="#fff" opacity=".15"/><rect x="78" y="420" width="${((W - 156) * p).toFixed(1)}" height="4" rx="2" fill="${face.accent}"/>`;
  return open(id, s);
}

function wrap(text, n) {
  const out = []; let line = '';
  for (const w of text.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }
  if (line.trim()) out.push(line.trim());
  return out;
}

// ------------------------------------------------------------------ FAVOURITE CHARACTER QUIZ
export function renderQuiz({ show, chars, secs, accent = '#fff', id = 'qz' }) {
  let s = `<rect width="${W}" height="${H}" fill="#000"/><circle cx="${W / 2}" cy="-40" r="220" fill="${accent}" opacity=".18" filter="url(#${id}soft)"/>`;
  s += `<text x="${W / 2}" y="62" text-anchor="middle" ${UI} font-size="21" font-weight="800" letter-spacing="1.5" fill="${accent}">${show.toUpperCase()}</text>`;
  s += `<text x="${W / 2}" y="100" text-anchor="middle" ${UI} font-size="27" font-weight="700" fill="#fff">Who's your favourite?</text>`;
  const list = chars.slice(0, 6);
  if (!list.length) s += `<text x="${W / 2}" y="240" text-anchor="middle" ${UI} font-size="15" fill="#fff" opacity=".6">Looking up the cast…</text>`;
  list.forEach((c, i) => {
    const x = i % 2 ? W / 2 + 6 : 24, y = 128 + Math.floor(i / 2) * 82, w = W / 2 - 30;
    const pulse = 0.12 + 0.05 * Math.sin(secs * 2 + i);
    s += `<rect x="${x}" y="${y}" width="${w}" height="68" rx="24" fill="#fff" fill-opacity="${pulse.toFixed(2)}" stroke="#fff" stroke-opacity=".18"/>`;
    s += `<circle cx="${x + 30}" cy="${y + 32}" r="18" fill="${accent}"/><text x="${x + 30}" y="${y + 40}" text-anchor="middle" ${UI} font-size="21" font-weight="800" fill="#111">${c[0]}</text>`;
    s += `<text x="${x + 54}" y="${y + 38}" ${UI} font-size="23" font-weight="600" fill="#fff">${c.length > 8 ? c.slice(0, 7) + '…' : c}</text>`;
  });
  s += `<text x="${W / 2}" y="${H - 30}" text-anchor="middle" ${UI} font-size="21" fill="#fff" opacity=".6">A face around their world</text>`;
  return open(id, s);
}
export const QUIZ_HIT = (sx, sy) => { const r = Math.floor((sy - 128) / 82), c = sx > W / 2 ? 1 : 0; return sy >= 128 && r >= 0 && r < 3 ? r * 2 + c : -1; };

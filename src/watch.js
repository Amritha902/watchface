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
  let s = aod ? `<rect width="${W}" height="${H}" fill="#000"/>` : f.wallpaper({ id, secs });

  // scrim behind type for legibility (premium: soft vignette, not a box)
  if (!aod) s += `<rect width="${W}" height="${H}" fill="url(#${id}vig)"/>`;

  // status row
  s += `<text x="38" y="62" ${UI} font-size="15" font-weight="600" letter-spacing="1.2" fill="${ink}" opacity=".9">${day}</text>`;
  s += heart(W - 82, 57, 0.62 + 0.18 * pulse, aod ? '#7a3a3a' : '#ff4d5e');
  s += `<text x="${W - 38}" y="62" text-anchor="end" ${UI} font-size="15" font-weight="600" fill="${ink}">${hr}</text>`;

  // time
  const tf = `font-family="${f.timeFont.replace(/"/g, "'")}" font-weight="${aod ? 300 : f.timeWeight}"`;
  if (f.layout === 'stack') {
    const big = f.timeFont.includes('Bebas') ? 168 : 132;
    s += `<g ${aod ? '' : `filter="url(#${id}shadow)"`}><text x="34" y="${f.timeFont.includes('Bebas') ? 222 : 206}" ${tf} font-size="${big}" letter-spacing="-4" fill="${ink}">${hh.padStart(2, '0')}</text>`;
    s += `<text x="34" y="${f.timeFont.includes('Bebas') ? 366 : 330}" ${tf} font-size="${big}" letter-spacing="-4" fill="${aod ? ink : f.accent}">${mm}</text></g>`;
  } else if (f.layout === 'photo' && !aod) {
    s += `<text x="${W / 2}" y="146" text-anchor="middle" ${tf} font-size="92" letter-spacing="-3" fill="${ink}" filter="url(#${id}shadow)">${hh}:${mm}</text>`;
  } else if (f.layout === 'glow' && !aod) {
    s += `<text x="${W / 2}" y="268" text-anchor="middle" ${tf} font-size="104" fill="${f.accent}" opacity=".8" filter="url(#${id}soft)">${hh}:${mm}</text>`;
    s += `<text x="${W / 2}" y="268" text-anchor="middle" ${tf} font-size="104" fill="#120202" stroke="${f.accent}" stroke-width="2.2">${hh}:${mm}</text>`;
  } else {
    const size = f.timeFont.includes('Mono') ? 104 : 138;
    s += `<text x="${W / 2}" y="${f.timeFont.includes('Mono') ? 270 : 280}" text-anchor="middle" ${tf} font-size="${size}" letter-spacing="${f.timeFont.includes('Mono') ? -6 : -6}" fill="${ink}" ${aod ? '' : `filter="url(#${id}shadow)"`}>${hh}:${mm}</text>`;
  }

  if (!aod) {
    // glass complication card
    const cy = 384, ch = 72;
    s += `<rect x="20" y="${cy}" width="${W - 40}" height="${ch}" rx="26" fill="#0b0b10" fill-opacity=".52" stroke="#fff" stroke-opacity=".14"/>`;
    if (play) {
      const prog = clamp(1 - play.left / play.total, 0, 1);
      s += `<rect x="34" y="${cy + 14}" width="44" height="44" rx="12" fill="${f.accent}"/>`;
      s += `<text x="56" y="${cy + 44}" text-anchor="middle" ${UI} font-size="20" font-weight="800" fill="#111">${play.show[0]}</text>`;
      s += `<text x="92" y="${cy + 31}" ${UI} font-size="15" font-weight="600" fill="#fff">${play.show}</text>`;
      s += `<text x="92" y="${cy + 50}" ${UI} font-size="12.5" fill="#fff" opacity=".65">${play.ep} · ${play.left} min left</text>`;
      s += `<rect x="92" y="${cy + 57}" width="210" height="3" rx="1.5" fill="#fff" opacity=".18"/><rect x="92" y="${cy + 57}" width="${(210 * prog).toFixed(1)}" height="3" rx="1.5" fill="${f.accent}"/>`;
      s += `<circle cx="${W - 54}" cy="${cy + 36}" r="20" fill="#fff"/><path d="M${W - 60} ${cy + 26} L ${W - 44} ${cy + 36} L ${W - 60} ${cy + 46} Z" fill="#111"/>`;
    } else {
      s += `<text x="40" y="${cy + 31}" ${UI} font-size="12" font-weight="600" letter-spacing="1" fill="#fff" opacity=".55">UP NEXT</text>`;
      s += `<text x="40" y="${cy + 54}" ${UI} font-size="16" font-weight="600" fill="#fff">${f.nudge || 'Wind down at 10:30'}</text>`;
      s += `<text x="${W - 40}" y="${cy + 54}" text-anchor="end" ${UI} font-size="16" font-weight="700" fill="${f.accent}">6,842</text>`;
      s += `<text x="${W - 40}" y="${cy + 31}" text-anchor="end" ${UI} font-size="12" font-weight="600" letter-spacing="1" fill="#fff" opacity=".55">STEPS</text>`;
    }
    // swipe affordance
    s += `<rect x="${W / 2 - 18}" y="${H - 16}" width="36" height="4" rx="2" fill="#fff" opacity=".35"/>`;
  }

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
  s += `<text x="${W / 2}" y="388" text-anchor="middle" ${UI} font-size="26" font-weight="700" fill="#fff">${inhale ? 'Breathe in' : 'Breathe out'}</text>`;
  s += `<text x="${W / 2}" y="418" text-anchor="middle" ${UI} font-size="14" fill="#fff" opacity=".6">Heart rate spiked to ${hr} bpm</text></g>`;
  return s;
}

// ------------------------------------------------------------------ GALLERY (swipe)
// cards: [{face, label}], pos: fractional index (animated); last card may be {create:true}
export function renderGallery({ cards, pos, secs, t, id = 'g', day }) {
  const cw = W * 0.7, chh = H * 0.7, cy = 52;
  let s = `<rect width="${W}" height="${H}" fill="#000"/>`;
  s += `<text x="${W / 2}" y="34" text-anchor="middle" ${UI} font-size="13" font-weight="600" letter-spacing="1.5" fill="#fff" opacity=".55">SWIPE · TAP TO WEAR</text>`;
  cards.forEach((c, i) => {
    const d = i - pos;
    if (Math.abs(d) > 1.6) return;
    const sc = 1 - Math.min(Math.abs(d), 1) * 0.12;
    const w = cw * sc, h = chh * sc, x = W / 2 + d * (cw + 18) - w / 2, y = cy + (chh - h) / 2;
    if (c.create) {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${54 * sc}" fill="#121218" stroke="#fff" stroke-opacity=".18" stroke-dasharray="6 6"/>`;
      s += `<circle cx="${x + w / 2}" cy="${y + h / 2 - 22}" r="${34 * sc}" fill="url(#${id}cg)"/>`;
      s += `<path d="M${x + w / 2 - 12} ${y + h / 2 - 22} H ${x + w / 2 + 12} M ${x + w / 2} ${y + h / 2 - 34} V ${y + h / 2 - 10}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
      s += `<text x="${x + w / 2}" y="${y + h / 2 + 40}" text-anchor="middle" ${UI} font-size="${17 * sc}" font-weight="700" fill="#fff">Create your own</text>`;
      s += `<text x="${x + w / 2}" y="${y + h / 2 + 62}" text-anchor="middle" ${UI} font-size="${12.5 * sc}" fill="#fff" opacity=".55">Describe it. We design it.</text>`;
    } else {
      const inner = renderHome({ face: c.face, t, secs, id: `${id}c${i}`, play: null, day }).replace('<svg ', `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" `);
      s += inner;
      if (c.badge) s += `<rect x="${x + w / 2 - 52}" y="${y - 10}" width="104" height="22" rx="11" fill="${c.face.accent}"/><text x="${x + w / 2}" y="${y + 5}" text-anchor="middle" ${UI} font-size="11" font-weight="800" letter-spacing=".6" fill="#111">${c.badge}</text>`;
    }
  });
  const cur = cards[Math.round(clamp(pos, 0, cards.length - 1))];
  const title = cur.create ? 'New face' : cur.face.name;
  const sub = cur.create ? 'From a description' : cur.face.show ? `Inspired by ${cur.face.show}` : cur.face.fromPrompt ? `“${cur.face.fromPrompt}”` : 'Encore original';
  s += `<text x="${W / 2}" y="${cy + chh + 40}" text-anchor="middle" ${UI} font-size="20" font-weight="700" fill="#fff">${title}</text>`;
  s += `<text x="${W / 2}" y="${cy + chh + 62}" text-anchor="middle" ${UI} font-size="13" fill="#fff" opacity=".55">${sub.length > 34 ? sub.slice(0, 33) + '…”' : sub}</text>`;
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
    s += `<text x="${W / 2}" y="350" text-anchor="middle" ${UI} font-size="17" font-weight="600" fill="#fff" opacity="${(orb * (1 - burst)).toFixed(2)}">Something new, made for you…</text>`;
    for (let k = 0; k < 10; k++) { // sparkle ring
      const ang = (k / 10) * Math.PI * 2 + secs * 1.4, r = 70 - 30 * orb;
      s += `<circle cx="${(W / 2 + r * Math.cos(ang)).toFixed(1)}" cy="${(214 + r * Math.sin(ang)).toFixed(1)}" r="2.2" fill="#fff" opacity="${(orb * (1 - burst)).toFixed(2)}"/>`;
    }
  }
  if (card > 0) {
    const sc = 0.22 + 0.34 * card, w = W * sc, h = H * sc, x = W / 2 - w / 2, y = 212 - h / 2 + 10 * (1 - card);
    s += `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="${RX * sc + 3}" fill="none" stroke="${a}" stroke-width="2" opacity="${card.toFixed(2)}"/>`;
    s += renderHome({ face, t, secs, id: id + 'p', day, play: null }).replace('<svg ', `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" opacity="${card.toFixed(2)}" `);
    // light sweep across the card
    const sx = x - 80 + (w + 160) * ease((el - 2.0) / 0.8);
    if (el > 2.0 && el < 2.9) s += `<rect x="${sx.toFixed(1)}" y="${y}" width="40" height="${h}" fill="#fff" opacity=".22" transform="skewX(-18)"/>`;
  }
  if (ui > 0) {
    s += `<g opacity="${ui.toFixed(2)}">`;
    s += `<text x="${W / 2}" y="48" text-anchor="middle" ${UI} font-size="12.5" font-weight="700" letter-spacing="2" fill="${a}">MADE FOR YOU</text>`;
    s += `<text x="${W / 2}" y="376" text-anchor="middle" ${UI} font-size="15" fill="#fff" opacity=".75">${reason}</text>`;
    s += `<rect x="58" y="396" width="${W - 116}" height="48" rx="24" fill="#fff"/><text x="${W / 2}" y="426" text-anchor="middle" ${UI} font-size="17" font-weight="700" fill="#000">Wear this face</text>`;
    s += `<text x="${W / 2}" y="468" text-anchor="middle" ${UI} font-size="14" fill="#fff" opacity=".55">Save for later</text></g>`;
  }
  return open(id, s);
}

// ------------------------------------------------------------------ CREATE (describe it)
export function renderCreate({ prompt, secs, id = 'cr', listening = true }) {
  let s = `<rect width="${W}" height="${H}" fill="#000"/>`;
  s += `<text x="${W / 2}" y="64" text-anchor="middle" ${UI} font-size="22" font-weight="700" fill="#fff">Describe your face</text>`;
  s += `<text x="${W / 2}" y="90" text-anchor="middle" ${UI} font-size="13" fill="#fff" opacity=".55">Speak, scribble or type on your phone</text>`;
  // listening orb
  for (let i = 0; i < 3; i++) {
    const r = 46 + 10 * Math.sin(secs * 3 + i * 1.3) * (listening ? 1 : 0.2) + i * 8;
    s += `<circle cx="${W / 2}" cy="210" r="${r.toFixed(1)}" fill="url(#${id}og)" opacity="${(0.55 - i * 0.15).toFixed(2)}"/>`;
  }
  s += `<path d="M${W / 2} 192 v 20 M ${W / 2 - 12} 206 a 12 12 0 0 0 24 0 M ${W / 2} 220 v 8" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  s += `<rect x="${W / 2 - 7}" y="186" width="14" height="26" rx="7" fill="#fff"/>`;
  const text = prompt ? `“${prompt}”` : 'e.g. “a rainy café in Mumbai”';
  const lines = wrap(text, 26);
  lines.slice(0, 3).forEach((ln, i) => {
    s += `<text x="${W / 2}" y="${318 + i * 26}" text-anchor="middle" ${UI} font-size="19" font-weight="${prompt ? 600 : 400}" fill="#fff" opacity="${prompt ? 1 : 0.4}">${ln}</text>`;
  });
  if (prompt) s += `<rect x="58" y="404" width="${W - 116}" height="48" rx="24" fill="#fff"/><text x="${W / 2}" y="434" text-anchor="middle" ${UI} font-size="17" font-weight="700" fill="#000">Design it</text>`;
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
  s += `<text x="${W / 2}" y="362" text-anchor="middle" ${UI} font-size="13" font-weight="700" letter-spacing="2" fill="${face.accent}">DESIGNING · ${Math.round(p * 100)}%</text>`;
  s += `<text x="${W / 2}" y="392" text-anchor="middle" ${UI} font-size="16" fill="#fff">${step}</text>`;
  s += `<rect x="78" y="420" width="${W - 156}" height="4" rx="2" fill="#fff" opacity=".15"/><rect x="78" y="420" width="${((W - 156) * p).toFixed(1)}" height="4" rx="2" fill="${face.accent}"/>`;
  return open(id, s);
}

function wrap(text, n) {
  const out = []; let line = '';
  for (const w of text.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }
  if (line.trim()) out.push(line.trim());
  return out;
}

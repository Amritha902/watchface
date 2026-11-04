// BINGE MATCH — show-inspired skins for the PRAHAR engine.
// Every motif here is ORIGINAL geometry (loops, apples, rain, cubes) that evokes
// the mood of a show without using any official artwork, logos or likenesses.
// In production, official character art would come via a licensed partnership.

const C = 233;

const triquetra = (col, op = 0.2, cy = 196) => [0, 120, 240].map((a) => {
  const x = C + 26 * Math.sin((a * Math.PI) / 180), y = cy - 26 * Math.cos((a * Math.PI) / 180);
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="46" fill="none" stroke="${col}" stroke-width="1.6" opacity="${op}"/>`;
}).join('');

const rain = (col, op = 0.12, seed = 3) => {
  let s = seed, out = '';
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 40; i++) {
    const x = rnd() * 466, y = rnd() * 466, l = 10 + rnd() * 18;
    out += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 3).toFixed(0)}" y2="${(y + l).toFixed(0)}" stroke="${col}" stroke-width="1" opacity="${op}"/>`;
  }
  return out;
};

const apple = (x, y, k, col, op) =>
  `<g transform="translate(${x} ${y}) scale(${k})" opacity="${op}">
    <path d="M0 -14 C -18 -26 -36 -8 -30 12 C -26 28 -12 36 0 30 C 12 36 26 28 30 12 C 36 -8 18 -26 0 -14Z" fill="${col}"/>
    <path d="M0 -14 C 0 -22 3 -28 7 -31" stroke="${col}" stroke-width="3" fill="none"/>
    <path d="M4 -24 C 12 -34 22 -30 22 -26 C 14 -22 8 -22 4 -24Z" fill="${col}"/></g>`;

const ruled = (col, op) => {
  let o = '';
  for (let y = 70; y < 420; y += 22) o += `<line x1="40" y1="${y}" x2="426" y2="${y}" stroke="${col}" stroke-width=".8" opacity="${op}"/>`;
  return o + `<line x1="96" y1="40" x2="96" y2="430" stroke="#D7263D" stroke-width="1" opacity="${op * 1.6}"/>`;
};

const cubes = (col) => {
  let o = '';
  const pos = [[338, 352], [360, 352], [349, 331], [96, 300], [112, 318]];
  pos.forEach(([x, y], i) => { o += `<rect x="${x}" y="${y}" width="20" height="20" rx="2" fill="none" stroke="${col}" stroke-width="1.4" opacity="${0.35 - i * 0.03}" transform="rotate(${i * 7} ${x + 10} ${y + 10})"/>`; });
  return o;
};

const gearRings = (col) => [150, 128, 106].map((r, i) =>
  `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="${2 + i * 2} ${6 + i * 3}" opacity="${0.22 - i * 0.04}"/>`).join('');

const wings = (col) =>
  `<path d="M233 150 L120 110 L150 150 L95 150 L140 180 L90 200 L233 175Z" fill="${col}" opacity=".07"/>
   <path d="M233 150 L346 110 L316 150 L371 150 L326 180 L376 200 L233 175Z" fill="${col}" opacity=".07"/>`;

export const SHOWS = {
  dark: {
    title: 'Dark', platform: 'Netflix', episode: 'S1 · E4', mood: 'Time loops, rain, a small town with secrets',
    characters: [
      {
        id: 'jonas', name: 'Jonas', vibe: 'Yellow raincoat · the seeker',
        sky: ['#06090a', '#17251f'], ring: '#5c6b52', accent: '#F2C230', ink: '#EDEAD8',
        timeFont: "'Special Elite', monospace", labelFont: "'Special Elite', monospace", timeWeight: 400,
        motif: (a) => rain('#cfd9d0', 0.1, 5) + triquetra(a, 0.22),
        nudges: ['Walk the forest path', 'Focus · connect the threads', 'Step outside · hydrate', "Close today's loop",
          'Unplug · the caves can wait', 'Lights low · rewind the day', 'Deep rest · no travelling', 'Rise · a new cycle'],
      },
      {
        id: 'martha', name: 'Martha', vibe: 'Red thread · the other side',
        sky: ['#0b0607', '#2a1214'], ring: '#5a3438', accent: '#E0313F', ink: '#F4E9E6',
        timeFont: "'Cormorant Garamond', serif", labelFont: "'Special Elite', monospace", timeWeight: 500,
        motif: (a) => triquetra(a, 0.25) + rain('#ffb3b3', 0.07, 11),
        nudges: ['Morning light · move', 'Deep focus · follow the thread', 'Walk · breathe', 'Reach out to someone',
          'Unplug · be present', 'Wind down', 'Deep rest', 'Rise · choose your path'],
      },
      {
        id: 'adam', name: 'Adam', vibe: 'Monochrome · the long game',
        sky: ['#08090b', '#1b1d22'], ring: '#3a3d45', accent: '#B9C0CC', ink: '#E7E9EE',
        timeFont: "'IBM Plex Mono', monospace", labelFont: "'IBM Plex Mono', monospace", timeWeight: 300,
        motif: (a) => gearRings(a),
        nudges: ['Plan the long game', 'Deep focus', 'Pause · walk', 'Review · reflect',
          'Unplug', 'Wind down', 'Deep rest', 'Rise · begin again'],
      },
    ],
  },
  deathnote: {
    title: 'Death Note', platform: 'Netflix', episode: 'Ep 7', mood: 'Gothic, cerebral, a notebook and an apple',
    characters: [
      {
        id: 'light', name: 'Light Yagami', vibe: 'Crimson & black · the planner',
        sky: ['#050505', '#1c0507'], ring: '#4a1a1e', accent: '#D7263D', ink: '#F5EFEF',
        timeFont: "'Cormorant Garamond', serif", labelFont: "'UnifrakturMaguntia', serif", timeWeight: 500,
        motif: (a) => ruled('#ffffff', 0.05) + apple(372, 120, 0.9, a, 0.28),
        nudges: ["Write today's plan down", 'Execute · deep focus', 'Recalculate · take a walk', 'Review the ledger',
          'Close the notebook', 'Sleep · even geniuses rest', 'Deep rest', 'Rise · a fresh page'],
      },
      {
        id: 'l', name: 'L', vibe: 'Paper white · the detective',
        light: true,
        sky: ['#f1f0ec', '#d9d8d2'], ring: '#b9b7af', accent: '#111111', ink: '#141414',
        timeFont: "'IBM Plex Mono', monospace", labelFont: "'IBM Plex Mono', monospace", timeWeight: 300,
        motif: (a) => cubes(a),
        nudges: ['Observe · plan', 'Deduce · deep focus', 'Sugar break · walk', 'Review the evidence',
          'Unplug · think', 'Wind down', 'Rest · the case can wait', 'Rise · new case'],
      },
      {
        id: 'ryuk', name: 'Ryuk', vibe: 'Apples & wings · the trickster',
        sky: ['#040404', '#141018'], ring: '#3b2f45', accent: '#FF2E4D', ink: '#EDE6F2',
        timeFont: "'Cormorant Garamond', serif", labelFont: "'UnifrakturMaguntia', serif", timeWeight: 600,
        motif: (a) => wings('#cbb8ff') + apple(120, 360, 0.55, a, 0.35) + apple(346, 360, 0.55, a, 0.35),
        nudges: ['Grab an apple · move', 'Focus · no distractions', 'Snack & stroll', 'Have some fun',
          'Unplug · watch the humans', 'Wind down', 'Deep rest', 'Rise · stay curious'],
      },
    ],
  },
};

// Any other title → generated palette (stands in for the online lookup + generation step)
export function autoShow(title) {
  let h = 0; for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  const hsl = (H, S, L) => {
    S /= 100; L /= 100; const k = (n) => (n + H / 30) % 12, a = S * Math.min(L, 1 - L);
    const f = (n) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  };
  const mk = (id, name, vibe, dh, motif) => ({
    id, name, vibe,
    sky: [hsl(hue + dh, 40, 5), hsl(hue + dh, 45, 16)], ring: hsl(hue + dh, 25, 30),
    accent: hsl(hue + dh, 85, 62), ink: '#F2F2F2',
    timeFont: 'Outfit, sans-serif', labelFont: 'Outfit, sans-serif', timeWeight: 300, motif,
    nudges: ['Move · plan', 'Deep focus', 'Hydrate · walk', 'Wrap up', 'Unplug', 'Wind down', 'Deep rest', 'Rise'],
  });
  return {
    title, platform: 'Netflix', episode: 'Now playing', mood: 'Palette generated from the title',
    characters: [
      mk('hero', 'The Hero', 'Bold & bright', 0, (a) => triquetra(a, 0.12)),
      mk('rival', 'The Rival', 'Sharp & cool', 150, (a) => gearRings(a)),
      mk('wild', 'The Wildcard', 'Warm & chaotic', 60, (a) => rain(a, 0.12, 9)),
    ],
  };
}

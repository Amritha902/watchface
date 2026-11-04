import { FACES, faceFromPrompt, W, H } from './faces.js';
import { renderHome, renderGallery, renderGift, renderCreate, renderDesigning } from './watch.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

const SHOWS = ['friends', 'stranger', 'heist', 'squid'];
const POSTER = {
  friends: 'linear-gradient(160deg,#7446ad,#e9c44c)', stranger: 'linear-gradient(160deg,#050307,#ff1d1d)',
  heist: 'linear-gradient(160deg,#b3141d,#1c0204)', squid: 'linear-gradient(160deg,#0c9e8a,#ff2e88)',
};

const state = {
  screen: params.get('screen') || 'home',
  face: FACES[params.get('face')] || FACES.studio,
  owned: [FACES.studio],
  pos: 0, target: 0,
  play: null, selected: 'friends',
  gift: null, prompt: params.get('prompt') || '',
  designing: null, aod: params.get('aod') === '1',
  hrManual: params.has('hr') ? +params.get('hr') : null, spikeAt: params.has('spike') ? -100 : null,
  taste: { friends: 14, stranger: 6, heist: 3, squid: 2 },
};
let secs = params.has('secs') ? +params.get('secs') : 0;
const fixedT = params.has('t') ? +params.get('t') : null;

const nowT = () => { if (fixedT !== null) return fixedT; const d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; };
const dayLabel = () => (params.has('t') ? 'WED 4' : new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }).toUpperCase().replace(',', ''));

// ---------------- heart ----------------
function heart() {
  const base = state.hrManual ?? 68 + Math.round(4 * Math.sin(secs * 0.3));
  if (state.spikeAt === null) return { hr: base, spike: 0 };
  if (state.spikeAt === -100) return { hr: 148, spike: 1 };
  const e = secs - state.spikeAt, peak = 150;
  if (e < 1.5) return { hr: Math.round(base + (peak - base) * e / 1.5), spike: 0 };
  if (e < 16) return { hr: Math.round(peak - (e - 1.5) * 1.3), spike: Math.min(1, (e - 1.5) / 0.6) };
  if (e < 22) { const f = (e - 16) / 6; return { hr: Math.round(peak - 19 + (base - peak + 19) * f), spike: 1 - f }; }
  state.spikeAt = null; return { hr: base, spike: 0 };
}

// ---------------- gallery cards ----------------
function cards() {
  const list = [...state.owned];
  for (const k of ['studio', ...SHOWS]) if (!list.some((f) => f.id === FACES[k].id)) list.push(FACES[k]);
  return [...list.map((f) => ({ face: f, badge: f.gifted ? 'FOR YOU' : null })), { create: true }];
}

// ---------------- flows ----------------
function wear(face) {
  if (!state.owned.some((f) => f.id === face.id)) state.owned.unshift(face);
  state.face = face; state.screen = 'home';
}
function startGift(face, reason) { state.gift = { face: { ...face, gifted: true }, reason, start: secs }; state.screen = 'gift'; }
function pressPlay() {
  const k = state.selected, f = FACES[k];
  state.play = { show: f.show, ep: f.ep, left: f.left, total: 50 };
  state.taste[k] = (state.taste[k] || 0) + 1;
  $('playState').textContent = `Playing ${f.show} on ${f.service}…`;
  renderTaste();
  setTimeout(() => {
    $('playState').textContent = 'Detected → a face is on its way to your watch';
    if (state.face.id !== f.id) startGift(f, `Because you're watching ${f.show}`);
  }, 1300);
}
const STEPS = ['Reading your description…', 'Choosing a palette…', 'Composing the wallpaper…', 'Setting the type…', 'Checking always-on & battery…'];
function design() {
  const p = $('prompt').value.trim() || state.prompt;
  if (!p) { state.screen = 'create'; return; }
  state.prompt = p;
  state.designing = { face: faceFromPrompt(p), start: secs };
  state.screen = 'designing';
}

// ---------------- input on the watch ----------------
const screenEl = $('screen');
let drag = null;
const toSvg = (e) => { const r = screenEl.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
screenEl.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, start: state.pos, moved: false, at: toSvg(e) }; screenEl.setPointerCapture(e.pointerId); });
screenEl.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 6) drag.moved = true;
  if (state.screen === 'gallery') { const w = screenEl.getBoundingClientRect().width * 0.75; state.target = state.pos = Math.max(0, Math.min(cards().length - 1, drag.start - dx / w)); }
});
screenEl.addEventListener('pointerup', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, [, sy] = drag.at;
  const moved = drag.moved; drag = null;
  if (state.screen === 'home' && moved && dx < -30) { openGallery(); return; }
  if (state.screen === 'gallery') {
    state.target = Math.round(state.pos);
    if (!moved && sy > 50 && sy < 400) {
      const c = cards()[state.target];
      if (c.create) state.screen = 'create'; else wear(c.face);
    }
    return;
  }
  if (moved) return;
  if (state.screen === 'gift' && secs - state.gift.start > 2.4) {
    if (sy > 390 && sy < 450) wear(state.gift.face);
    else if (sy >= 450) { if (!state.owned.some((f) => f.id === state.gift.face.id)) state.owned.push(state.gift.face); state.screen = 'home'; }
  } else if (state.screen === 'create' && state.prompt && sy > 398) design();
});
function openGallery() { state.screen = 'gallery'; const i = cards().findIndex((c) => c.face && c.face.id === state.face.id); state.pos = state.target = Math.max(0, i); }

$('swipeBtn').onclick = () => (state.screen === 'gallery' ? (state.target = Math.min(cards().length - 1, Math.round(state.target) + 1)) : openGallery());
$('homeBtn').onclick = $('crown').onclick = () => { state.screen = 'home'; };
$('aodBtn').onclick = () => { state.aod = !state.aod; $('aodBtn').classList.toggle('white', state.aod); state.screen = 'home'; };

// ---------------- page panels ----------------
$('shows').innerHTML = SHOWS.map((k) => `<button class="show${k === state.selected ? ' on' : ''}" data-k="${k}" style="background:${POSTER[k]}"><span class="pl">SELECTED</span>${FACES[k].show}<small>${FACES[k].service} · ${FACES[k].ep}</small></button>`).join('');
$('shows').onclick = (e) => { const b = e.target.closest('.show'); if (!b) return; state.selected = b.dataset.k; document.querySelectorAll('.show').forEach((x) => x.classList.toggle('on', x === b)); };
$('services').onclick = (e) => { const b = e.target.closest('.svc'); if (b) b.classList.toggle('on'); };
$('playBtn').onclick = pressPlay;
$('designBtn').onclick = design;
$('prompt').addEventListener('input', () => { state.prompt = $('prompt').value; if (state.screen === 'home' || state.screen === 'gallery') state.screen = 'create'; });
$('chips').onclick = (e) => { const b = e.target.closest('.chip'); if (!b) return; $('prompt').value = b.textContent; state.prompt = b.textContent; state.screen = 'create'; };
$('spikeBtn').onclick = () => { state.spikeAt = secs; state.screen = 'home'; };
$('hrAuto').onclick = () => { state.hrManual = null; state.spikeAt = null; };
$('hr').oninput = (e) => { state.hrManual = +e.target.value; state.spikeAt = null; };

function renderTaste() {
  const top = Object.entries(state.taste).sort((a, b) => b[1] - a[1]);
  $('taste').innerHTML = 'On-device taste profile: ' + top.map(([k, n]) => `<b>${FACES[k].show}</b> ${n} eps`).join(' · ');
}

function renderGalleryThumbs() {
  const items = [
    [FACES.studio, 'Encore original'], [FACES.friends, 'Inspired by Friends'], [FACES.stranger, 'Inspired by Stranger Things'],
    [FACES.heist, 'Inspired by Money Heist'], [FACES.squid, 'Inspired by Squid Game'],
    [faceFromPrompt('Rainy café, cosy'), '“Rainy café, cosy”'], [faceFromPrompt('Neon Tokyo night'), '“Neon Tokyo night”'], [faceFromPrompt('Calm ocean, teal'), '“Calm ocean, teal”'],
  ];
  $('gallery').innerHTML = items.map(([f, sub], i) => {
    const play = f.show ? { show: f.show, ep: f.ep, left: f.left, total: 50 } : null;
    return `<div class="thumb"><div class="f">${renderHome({ face: f, t: 10.15, secs: 2, id: 'gt' + i, play, day: 'WED 4' })}</div><b>${f.name}</b><span>${sub}</span></div>`;
  }).join('');
}

// ---------------- loop ----------------
function draw() {
  const t = nowT(), day = dayLabel(), { hr, spike } = heart();
  let svg;
  if (state.screen === 'gallery') {
    state.pos += (state.target - state.pos) * 0.25;
    svg = renderGallery({ cards: cards(), pos: state.pos, secs, t, day });
  } else if (state.screen === 'gift') {
    svg = renderGift({ face: state.gift.face, el: secs - state.gift.start, reason: state.gift.reason, t, secs, day });
  } else if (state.screen === 'create') {
    svg = renderCreate({ prompt: state.prompt, secs });
  } else if (state.screen === 'designing') {
    const p = Math.min(1, (secs - state.designing.start) / 5);
    svg = renderDesigning({ face: state.designing.face, p, step: STEPS[Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))], secs });
    if (p >= 1) startGift(state.designing.face, 'From your description');
  } else {
    const play = state.play && state.play.show === state.face.show ? state.play : null;
    svg = renderHome({ face: state.face, t, secs, hr, spike, play, day, aod: state.aod });
  }
  screenEl.innerHTML = svg;
  const accent = state.screen === 'gift' ? state.gift.face.accent : state.screen === 'designing' ? state.designing.face.accent : state.face.accent;
  $('watch').style.setProperty('--accent', accent);
  $('hrLbl').textContent = `${hr} bpm${state.hrManual === null ? ' · auto' : ''}`;
  if (document.activeElement !== $('hr')) $('hr').value = hr;
}

// deep-link states (used by the export script)
if (params.has('pfx')) state.face = faceFromPrompt(params.get('pfx'));
if (params.has('play') && state.face.show) state.play = { show: state.face.show, ep: state.face.ep, left: state.face.left, total: 50 };
if (state.screen === 'gift') { startGift(state.face, params.get('reason') || `Because you're watching ${state.face.show || 'something new'}`); if (params.has('el')) state.gift.start = secs - +params.get('el'); }
if (state.screen === 'designing') state.designing = { face: faceFromPrompt(state.prompt || 'Rainy café'), start: secs - (+params.get('p') || 0.6) * 5 };
if (state.screen === 'gallery') state.pos = state.target = +(params.get('pos') || 1);

renderTaste(); renderGalleryThumbs();
let last = performance.now(), lastDraw = 0;
function tick(now) {
  secs += (now - last) / 1000; last = now;
  if (now - lastDraw > 33) { lastDraw = now; draw(); }
  requestAnimationFrame(tick);
}
if (params.has('freeze')) draw(); else requestAnimationFrame(tick);

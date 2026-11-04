import { FACES, faceFromPrompt, faceFromPhoto, faceFromStyle, faceForCharacterOffline, refineOffline, applyPatch, settingsOf, W, H } from './faces.js';
import { renderHome, renderGallery, renderGift, renderCreate, renderDesigning, renderQuiz, QUIZ_HIT } from './watch.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

const SHOWS = ['friends', 'stranger', 'heist', 'squid', 'cricket', 'romance', 'scifi', 'nature'];
const POSTER = {
  friends: 'linear-gradient(160deg,#7446ad,#e9c44c)', stranger: 'linear-gradient(160deg,#050307,#ff1d1d)',
  heist: 'linear-gradient(160deg,#b3141d,#1c0204)', squid: 'linear-gradient(160deg,#0c9e8a,#ff2e88)',
  cricket: 'linear-gradient(160deg,#0d1f45,#3fae5a)', romance: 'linear-gradient(160deg,#3b1d4f,#f6a96b)', scifi: 'linear-gradient(160deg,#090c24,#d4486a)', nature: 'linear-gradient(160deg,#030a14,#3dffb0)',
};

const state = {
  quiz: null,
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
function heartState() {
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
// ---------------- favourite character → AI face ----------------
const CHAR_STEPS = ['Looking up the cast…', 'Reading their world with Claude…', 'Painting the wallpaper…', 'Setting type and colour…', 'Checking always-on & battery…'];
let api = { claude: false, replicate: false, tmdb: false };
fetch('/api/health').then((r) => (r.ok ? r.json() : api)).then((h) => { api = h; aiLabel(); }).catch(() => aiLabel());
function aiLabel() {
  $('aiState').textContent = api.claude ? `AI on: Claude${api.replicate ? ' + Flux' : ''}${api.tmdb ? ' + TMDB' : ''}` : 'AI offline: using the built-in generator';
}
async function openQuiz() {
  const base = FACES[state.selected];
  state.quiz = { show: base.show, base, chars: [] }; state.screen = 'quiz';
  let chars = [];
  try { const r = await fetch(`/api/characters?show=${encodeURIComponent(base.show)}`); if (r.ok) chars = (await r.json()).characters; } catch {}
  if (!chars.length) chars = { friends: ['Maya', 'Rohan', 'Tara', 'Kabir', 'Zoe', 'Dev'], stranger: ['Wren', 'Jun', 'Ellie', 'Sam', 'Noor', 'Ravi'], heist: ['Vega', 'Rook', 'Saffron', 'Kit', 'Marlow', 'Ines'], squid: ['Jae', 'Hana', 'Min', 'Ola', 'Teo', 'Aria'], cricket: ['Arjun', 'Veer', 'Kabir', 'Ishan', 'Neel', 'Rafi'], romance: ['Seo-ah', 'Ji-ho', 'Mira', 'Leo', 'Hae', 'Yuna'], scifi: ['Captain Ixa', 'Bolt', 'Dr Vale', 'Nyx', 'Oren', 'Sol'], nature: ['Orca', 'Snow fox', 'Moose', 'Eagle', 'Lynx', 'Elk'] }[state.selected];
  state.quiz.chars = chars.slice(0, 6);
  $('favChips').innerHTML = state.quiz.chars.map((c, i) => `<button class="chip" data-i="${i}">${c}</button>`).join('');
}
async function designCharacter(i) {
  const { base, chars, show } = state.quiz, character = chars[i];
  const job = { face: { ...base, accent: faceForCharacterOffline(base, character, i).accent }, start: secs, done: null, steps: CHAR_STEPS, slow: true };
  state.designing = job; state.screen = 'designing';
  let face;
  try {
    const r = await fetch('/api/style', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ show, character }) });
    if (!r.ok) throw new Error((await r.json()).error);
    const style = await r.json();
    job.face = faceFromStyle(style, base, character);
    let image = null;
    try {
      const w = await fetch('/api/wallpaper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imagePrompt: style.imagePrompt }) });
      if (w.ok) image = (await w.json()).image;
    } catch {}
    face = faceFromStyle(style, base, character, image);
    $('aiState').textContent = `Claude style: “${style.mood}”`;
  } catch (e) {
    face = faceForCharacterOffline(base, character, i);
    if (api.claude) $('aiState').textContent = `AI unavailable (${e.message}); using the built-in generator`;
  }
  job.face = face; job.done = secs;
}
$('favBtn').onclick = openQuiz;

// ---------------- refine the worn face ----------------
const history = [];
async function refineFace(text) {
  text = text.trim(); if (!text) return;
  const face = state.face;
  $('refineState').textContent = 'Working…';
  let patch, summary, image = null;
  try {
    if (!api.claude) throw new Error('offline');
    const r = await fetch('/api/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: settingsOf(face), instruction: text, imagePrompt: face.style?.imagePrompt || '' }) });
    if (!r.ok) throw new Error((await r.json()).error);
    const out = await r.json();
    ({ summary } = out); patch = out;
    if (out.regenerateImage && out.imagePrompt && api.replicate) {
      $('refineState').textContent = 'Repainting the artwork…';
      const w = await fetch('/api/wallpaper', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imagePrompt: out.imagePrompt }) });
      if (w.ok) image = (await w.json()).image;
    }
  } catch { ({ patch, summary } = refineOffline(face, text)); }
  history.push(face); undoLabel();
  let next = applyPatch(face, patch);
  if (image) next = { ...applyPatch(faceFromPhoto(image, next), patch), name: face.name, style: { ...(face.style || {}), imagePrompt: patch.imagePrompt } };
  const i = state.owned.findIndex((f) => f.id === face.id); if (i >= 0) state.owned[i] = next;
  state.face = next; state.screen = 'home'; state.flash = secs;
  $('refineState').textContent = `✓ ${summary}`;
}
$('refineBtn').onclick = () => refineFace($('refine').value);
$('refineChips').onclick = (e) => { const b = e.target.closest('.chip'); if (b) { $('refine').value = b.textContent; refineFace(b.textContent); } };
const undoLabel = () => { $('undoBtn').textContent = history.length ? `↶ Undo (${history.length})` : '↶ Undo'; $('undoBtn').disabled = !history.length; };
$('undoBtn').onclick = () => { if (history.length) { state.face = history.pop(); state.screen = 'home'; $('refineState').textContent = history.length ? `Undone · ${history.length} more step${history.length > 1 ? 's' : ''} back available` : 'Back to the original'; } undoLabel(); };
undoLabel();
$('describeJump').onclick = () => { state.screen = 'create'; $('prompt').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('prompt').focus(); };
$('favChips').onclick = (e) => { const b = e.target.closest('.chip'); if (b) designCharacter(+b.dataset.i); };

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
  const dx = e.clientX - drag.x, [drag0x, sy] = drag.at;
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
  else if (state.screen === 'quiz') { const k = QUIZ_HIT(drag0x, sy); if (k >= 0 && k < state.quiz.chars.length) designCharacter(k); }
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
$('tryBtn').onclick = () => { state.selected = 'friends'; document.querySelectorAll('.show').forEach((x) => x.classList.toggle('on', x.dataset.k === 'friends')); $('watch').scrollIntoView({ behavior: 'smooth', block: 'center' }); pressPlay(); };
$('designBtn').onclick = design;
$('prompt').addEventListener('input', () => { state.prompt = $('prompt').value; if (state.screen === 'home' || state.screen === 'gallery') state.screen = 'create'; });
$('chips').onclick = (e) => { const b = e.target.closest('.chip'); if (!b) return; $('prompt').value = b.textContent; state.prompt = b.textContent; state.screen = 'create'; };
$('photo').onchange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    const base = FACES[state.selected];
    startGift(faceFromPhoto(r.result, base), `Made from your photo · ${base.show} style`);
    state.play = { show: base.show, ep: base.ep, left: base.left, total: 50 };
  };
  r.readAsDataURL(file);
};
$('spikeBtn').onclick = () => { state.spikeAt = secs; state.screen = 'home'; };
$('hrAuto').onclick = () => { state.hrManual = null; state.spikeAt = null; };
$('hr').oninput = (e) => { state.hrManual = +e.target.value; state.spikeAt = null; };

function renderTaste() {
  const top = Object.entries(state.taste).sort((a, b) => b[1] - a[1]);
  $('taste').innerHTML = 'On-device taste profile: ' + top.map(([k, n]) => `<b>${FACES[k].show}</b> ${n} eps`).join(' · ');
}

function renderGalleryThumbs() {
  const items = [
    [FACES.studio, 'Encore original'], [FACES.friends, 'Sitcom · Flat 5B'], [FACES.stranger, '80s supernatural · Hollow Lights'],
    [FACES.heist, 'Heist · The Mint Job'], [FACES.squid, 'Survival game · Last Round'],
    [FACES.cricket, 'Live cricket · Super Over'], [FACES.romance, 'Romance · Spring Letters'], [FACES.scifi, 'Sci-fi · Orbit 9'], [FACES.nature, 'Nature doc · Wild North'],
    [faceFromPrompt('Rainy café, cosy'), '“Rainy café, cosy”'], [faceFromPrompt('Neon Tokyo night'), '“Neon Tokyo night”'], [faceFromPrompt('Calm ocean, teal'), '“Calm ocean, teal”'],
  ];
  $('gallery').innerHTML = items.map(([f, sub], i) => {
    const play = f.show ? { show: f.show, ep: f.ep, left: f.left, total: 50 } : null;
    return `<div class="thumb"><div class="f">${renderHome({ face: f, t: 10.15, secs: 2, id: 'gt' + i, play, day: 'WED 4' })}</div><b>${f.name}</b><span>${sub}</span></div>`;
  }).join('');
}

// ---------------- loop ----------------
function draw() {
  const t = nowT(), day = dayLabel(), { hr, spike } = heartState();
  let svg;
  if (state.screen === 'gallery') {
    state.pos += (state.target - state.pos) * 0.25;
    svg = renderGallery({ cards: cards(), pos: state.pos, secs, t, day });
  } else if (state.screen === 'gift') {
    svg = renderGift({ face: state.gift.face, el: secs - state.gift.start, reason: state.gift.reason, t, secs, day });
  } else if (state.screen === 'create') {
    svg = renderCreate({ prompt: state.prompt, secs });
  } else if (state.screen === 'quiz') {
    svg = renderQuiz({ show: state.quiz.show, chars: state.quiz.chars, secs, accent: state.quiz.base.accent });
  } else if (state.screen === 'designing') {
    const d = state.designing, steps = d.steps || STEPS;
    let p = Math.min(1, (secs - d.start) / 5);
    if (d.slow) {
      const el = secs - d.start, shown = Math.min(0.92, el / 4.2);
      p = d.done === null || el < 3.9 ? shown : Math.min(1, 0.92 + (secs - Math.max(d.done, d.start + 3.9)) / 1.1);
    }
    svg = renderDesigning({ face: d.face, p, step: steps[Math.min(steps.length - 1, Math.floor(p * steps.length))], secs });
    if (p >= 1) startGift(d.face, d.face.character ? `Because ${d.face.character} is your favourite` : 'From your description');
  } else {
    const play = state.play && state.play.show === state.face.show ? state.play : null;
    svg = renderHome({ face: state.face, t, secs, hr, spike, play, day, aod: state.aod });
  }
  if (state.flash && secs - state.flash < 0.6) svg = svg.replace('</g></svg>', `<rect width="${W}" height="${H}" fill="#fff" opacity="${(0.35 * (1 - (secs - state.flash) / 0.6)).toFixed(2)}"/></g></svg>`);
  screenEl.innerHTML = svg;
  const accent = state.screen === 'gift' ? state.gift.face.accent : state.screen === 'designing' ? state.designing.face.accent : state.face.accent;
  $('watch').style.setProperty('--accent', accent);
  $('hrLbl').textContent = `${hr} bpm${state.hrManual === null ? ' · auto' : ''}`;
  if (document.activeElement !== $('hr')) $('hr').value = hr;
}

// deep-link states (used by the export script)
if (params.has('pfx')) state.face = faceFromPrompt(params.get('pfx'));
if (params.has('edit')) state.face = applyPatch(state.face, refineOffline(state.face, params.get('edit')).patch);
if (state.screen === 'quiz') { const k = params.get('face') || 'stranger'; state.selected = k; state.quiz = { show: FACES[k].show, base: FACES[k], chars: ['Wren', 'Jun', 'Ellie', 'Sam', 'Noor', 'Ravi'] }; }
if (params.has('play') && state.face.show) state.play = { show: state.face.show, ep: state.face.ep, left: state.face.left, total: 50 };
if (state.screen === 'gift') { startGift(state.face, params.get('reason') || `Because you're watching ${state.face.show || 'something new'}`); if (params.has('el')) state.gift.start = secs - +params.get('el'); }
if (state.screen === 'designing') state.designing = { face: faceFromPrompt(state.prompt || 'Rainy café'), start: secs - (+params.get('p') || 0.6) * 5 };
if (state.screen === 'gallery') state.pos = state.target = +(params.get('pos') || 1);

// ---------------- on-the-wrist renders ----------------
function renderWrist() {
  const face = renderHome({ face: FACES.friends, t: 10.15, secs: 2, id: 'wr', play: { show: 'Flat 5B', ep: 'S3 · E7', left: 22, total: 50 }, day: 'WED 4' });
  const inner = (x, y, w, h) => face.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
  $('wristShot').innerHTML = `<svg viewBox="0 0 720 460" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="bgw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b1712"/><stop offset="1" stop-color="#0b0a09"/></linearGradient>
      <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58d68"/><stop offset=".55" stop-color="#a8704f"/><stop offset="1" stop-color="#7d5038"/></linearGradient>
      <linearGradient id="ti" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8e8ec"/><stop offset=".3" stop-color="#8d8d95"/><stop offset=".6" stop-color="#3a3a40"/><stop offset="1" stop-color="#b9b9c0"/></linearGradient>
      <linearGradient id="band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#15151a"/><stop offset=".5" stop-color="#2a2a31"/><stop offset="1" stop-color="#15151a"/></linearGradient>
      <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-opacity=".55"/></filter>
      <radialGradient id="lamp" cx=".75" cy=".15" r=".8"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".18"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient></defs>
    <rect width="720" height="460" fill="url(#bgw)"/><rect width="720" height="460" fill="url(#lamp)"/>
    <g transform="rotate(-14 360 240)">
      <path d="M-80 170 C 120 150 520 140 860 160 L 860 330 C 520 350 120 345 -80 320 Z" fill="url(#skin)" filter="url(#sh)"/>
      <path d="M-80 300 C 120 318 520 322 860 305" stroke="#000" stroke-opacity=".18" stroke-width="10" fill="none"/>
      <rect x="300" y="96" width="120" height="290" rx="18" fill="url(#band)"/>
      <g filter="url(#sh)"><rect x="268" y="128" width="184" height="226" rx="54" fill="url(#ti)"/>
      <rect x="275" y="135" width="170" height="212" rx="48" fill="#000"/></g>
      <rect x="452" y="168" width="10" height="32" rx="4" fill="#b9b9c0"/><rect x="451" y="218" width="7" height="42" rx="3" fill="#8d8d95"/>
      <defs><clipPath id="wrc"><rect x="279" y="139" width="162" height="204" rx="44"/></clipPath></defs>
      <g clip-path="url(#wrc)">${inner(279, 139, 162, 204)}</g>
    </g></svg>`;
  $('sideShot').innerHTML = `<svg viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="sti" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f1f4"/><stop offset=".35" stop-color="#a3a3ab"/><stop offset=".7" stop-color="#4a4a52"/><stop offset="1" stop-color="#9b9ba3"/></linearGradient>
      <linearGradient id="sband" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121216"/><stop offset=".5" stop-color="#27272e"/><stop offset="1" stop-color="#121216"/></linearGradient></defs>
    <rect width="460" height="460" fill="#0e0e12"/>
    <path d="M90 226 C 40 230 10 300 20 460" stroke="url(#sband)" stroke-width="44" fill="none"/>
    <path d="M370 226 C 420 230 450 300 440 460" stroke="url(#sband)" stroke-width="44" fill="none"/>
    <rect x="70" y="190" width="320" height="58" rx="26" fill="url(#sti)"/>
    <rect x="78" y="182" width="304" height="14" rx="7" fill="#0b0b0e"/><rect x="90" y="183" width="280" height="3" rx="1.5" fill="#fff" opacity=".35"/>
    <rect x="392" y="200" width="18" height="20" rx="4" fill="#c9c9cf"/><rect x="406" y="203" width="6" height="14" rx="2" fill="#ff5a3c"/>
    <rect x="390" y="228" width="10" height="14" rx="3" fill="#9b9ba3"/>
    <path d="M200 248 h60 v6 a8 8 0 0 1 -8 8 h-44 a8 8 0 0 1 -8 -8z" fill="#3a3a40"/>
    <line x1="70" y1="290" x2="390" y2="290" stroke="#5a5a64" stroke-dasharray="3 5"/><text x="230" y="312" text-anchor="middle" font-family="Inter" font-size="13" fill="#a4a4ae">45 mm</text>
    <line x1="62" y1="182" x2="62" y2="248" stroke="#5a5a64" stroke-dasharray="3 5"/><text x="8" y="220" text-anchor="start" font-family="Inter" font-size="13" fill="#a4a4ae">10.7 mm</text>
    <text x="230" y="120" text-anchor="middle" font-family="Inter" font-size="15" font-weight="600" fill="#f5f5f7">Titanium case · sapphire front</text>
    <text x="230" y="144" text-anchor="middle" font-family="Inter" font-size="13" fill="#a4a4ae">Showcase render. Encore runs on any compatible watch.</text></svg>`;
}
renderWrist();
renderTaste(); renderGalleryThumbs();
let last = performance.now(), lastDraw = 0;
function tick(now) {
  secs += (now - last) / 1000; last = now;
  if (now - lastDraw > 33) { lastDraw = now; draw(); }
  requestAnimationFrame(tick);
}
if (params.has('freeze')) draw(); else requestAnimationFrame(tick);

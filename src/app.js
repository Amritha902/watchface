import { FACES, faceFromPrompt, faceFromPhoto, faceFromStyle, faceForCharacterOffline, refineOffline, applyPatch, settingsOf, W, H } from './faces.js';
import { renderHome, renderGallery, renderGift, renderCreate, renderDesigning, renderQuiz, QUIZ_HIT } from './watch.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

const SHOWS = ['friends', 'stranger', 'heist', 'squid'];
const POSTER = {
  friends: 'linear-gradient(160deg,#7446ad,#e9c44c)', stranger: 'linear-gradient(160deg,#050307,#ff1d1d)',
  heist: 'linear-gradient(160deg,#b3141d,#1c0204)', squid: 'linear-gradient(160deg,#0c9e8a,#ff2e88)',
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
  if (!chars.length) chars = { friends: ['Rachel', 'Ross', 'Monica', 'Chandler', 'Joey', 'Phoebe'], stranger: ['Eleven', 'Dustin', 'Steve', 'Max', 'Hopper', 'Will'], heist: ['The Professor', 'Tokyo', 'Berlin', 'Nairobi', 'Rio', 'Denver'], squid: ['Gi-hun', 'Sae-byeok', 'Sang-woo', 'Ali', 'Il-nam', 'The Front Man'] }[state.selected];
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
  history.push(face);
  let next = applyPatch(face, patch);
  if (image) next = { ...applyPatch(faceFromPhoto(image, next), patch), name: face.name, style: { ...(face.style || {}), imagePrompt: patch.imagePrompt } };
  const i = state.owned.findIndex((f) => f.id === face.id); if (i >= 0) state.owned[i] = next;
  state.face = next; state.screen = 'home'; state.flash = secs;
  $('refineState').textContent = `✓ ${summary}`;
}
$('refineBtn').onclick = () => refineFace($('refine').value);
$('refineChips').onclick = (e) => { const b = e.target.closest('.chip'); if (b) { $('refine').value = b.textContent; refineFace(b.textContent); } };
$('undoBtn').onclick = () => { if (history.length) { state.face = history.pop(); state.screen = 'home'; $('refineState').textContent = 'Undone'; } };
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
  } else if (state.screen === 'quiz') {
    svg = renderQuiz({ show: state.quiz.show, chars: state.quiz.chars, secs, accent: state.quiz.base.accent });
  } else if (state.screen === 'designing') {
    const d = state.designing, steps = d.steps || STEPS;
    let p = Math.min(1, (secs - d.start) / 5);
    if (d.slow) p = d.done === null ? Math.min(0.92, (secs - d.start) / 14) : Math.min(1, 0.92 + (secs - d.done) / 1.2);
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
if (state.screen === 'quiz') { const k = params.get('face') || 'stranger'; state.selected = k; state.quiz = { show: FACES[k].show, base: FACES[k], chars: ['Eleven', 'Dustin', 'Steve', 'Max', 'Hopper', 'Will'] }; }
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

import { renderFace, renderSuggest, renderDesigning, simulatedHr, CITIES, tzFor, sunTimes, prahars, fmtClock, fmtDur } from './face.js';
import { SHOWS, autoShow } from './themes.js';

const $ = (id) => document.getElementById(id);
const YEAR = 2026;
const params = new URLSearchParams(location.search);
const mod24 = (x) => ((x % 24) + 24) % 24;

const dateFromDoy = (doy) => new Date(Date.UTC(YEAR, 0, doy, 12));
const doyOf = (d) => Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400000);
const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

const state = {
  mode: params.get('mode') || 'live',
  t: 12, doy: 308,
  city: params.get('city') || 'delhi',
  aod: params.get('aod') === '1',
  lang: params.get('lang') || 'en',
  theme: null,
  hrManual: params.has('hr') ? +params.get('hr') : null,
  spikeAt: params.has('spike') ? -100 : null,   // performance-clock seconds when a spike started
  binge: { stage: 'idle', show: null, char: null, start: 0 },
};
let secs = 0; // animation clock (seconds)

function syncLive() {
  const city = CITIES[state.city];
  const now = new Date();
  const tz = tzFor(city, doyOf(now));
  const local = new Date(now.getTime() + tz * 3600000);
  state.doy = Math.min(365, doyOf(local));
  state.t = local.getUTCHours() + local.getUTCMinutes() / 60 + local.getUTCSeconds() / 3600;
}

const ctx = () => {
  const city = CITIES[state.city];
  const date = dateFromDoy(state.doy);
  const tz = tzFor(city, state.doy);
  const inst = (t) => new Date(date.getTime() + (t - 12 - tz) * 3600000);
  return { city, date, tz, inst };
};

// ---- heart ---------------------------------------------------------------
function heart() {
  const { city, tz } = ctx();
  const { sr, ss } = sunTimes(state.doy, city.lat, city.lng, tz);
  const base = state.hrManual ?? simulatedHr(state.t, mod24(state.t - sr) < mod24(ss - sr));
  if (state.spikeAt === null) return { hr: base, spike: 0 };
  if (state.spikeAt === -100) return { hr: 148, spike: 1 }; // static render via ?spike
  const e = secs - state.spikeAt;
  const peak = 152;
  let hr, spike;
  if (e < 1.5) { hr = base + (peak - base) * (e / 1.5); spike = e / 1.5; }
  else if (e < 14) { hr = peak - (e - 1.5) * 1.2; spike = 1; }               // breathing slowly brings it down
  else if (e < 22) { const f = (e - 14) / 8; hr = (peak - 15) + (base - (peak - 15)) * f; spike = 1 - f; }
  else { state.spikeAt = null; return { hr: base, spike: 0 }; }
  return { hr: Math.round(hr), spike };
}

// ---- binge match -----------------------------------------------------------
const DESIGN_STEPS = [
  'Looking up the show online…', 'Reading its colour script…', 'Picking motifs for the character…',
  'Tuning typography…', 'Fitting to your prahar rhythm…', 'Checking always-on & burn-in safety…',
];
const DESIGN_SECS = 7; // ~10 min in production; sped up for the demo

function currentShow() {
  const key = $('showSel').value;
  if (key === 'other') return autoShow(($('showOther').value || 'Untitled').trim());
  return SHOWS[key];
}
const withShow = (c, show) => ({ ...c, showTitle: show.title });

function renderChars() {
  const show = state.binge.show;
  const { city, inst } = ctx();
  $('chars').innerHTML = show.characters.map((c, k) => {
    const o = renderFace({ t: state.t, doy: state.doy, date: inst(state.t), city, theme: withShow(c, show), id: 'ch' + k, lang: state.lang });
    return `<button class="char" data-k="${k}"><div class="face">${o.svg}</div><b>${c.name}</b><span>${c.vibe}</span></button>`;
  }).join('');
}

function startBinge() {
  state.binge = { stage: 'suggest', show: currentShow(), char: null, start: secs };
  $('pickArea').classList.add('hidden'); $('steps').classList.add('hidden');
}
function toPick() {
  state.binge.stage = 'pick'; state.binge.start = secs;
  renderChars(); $('pickArea').classList.remove('hidden');
}
function choose(k) {
  const show = state.binge.show;
  state.binge.char = withShow(show.characters[k], show);
  state.binge.stage = 'designing'; state.binge.start = secs;
  document.querySelectorAll('.char').forEach((b) => b.classList.toggle('on', +b.dataset.k === k));
  $('steps').classList.remove('hidden');
}
function finishBinge() {
  state.theme = state.binge.char;
  state.binge.stage = 'idle';
  $('steps').innerHTML = DESIGN_STEPS.map((s) => `<li class="done">✓ ${s}</li>`).join('') + `<li class="now">Applied: ${state.theme.name} · ${state.theme.showTitle} edition</li>`;
}

// ---- drawing ---------------------------------------------------------------
function draw() {
  const { city, date, inst } = ctx();
  const { hr, spike } = heart();
  const b = state.binge;
  let svg;
  if (b.stage === 'suggest') {
    svg = renderSuggest(b.show);
  } else if (b.stage === 'designing') {
    const p = Math.min(1, (secs - b.start) / DESIGN_SECS);
    const k = Math.min(DESIGN_STEPS.length - 1, Math.floor(p * DESIGN_STEPS.length));
    svg = renderDesigning(b.char, p, DESIGN_STEPS[k]);
    $('steps').innerHTML = DESIGN_STEPS.map((s, i) => `<li class="${i < k ? 'done' : i === k ? 'now' : ''}">${i < k ? '✓' : i === k ? '◌' : '·'} ${s}</li>`).join('');
    if (p >= 1) finishBinge();
  } else {
    let theme = state.theme;
    if (b.stage === 'pick') { // watch cycles through the character previews
      const cs = b.show.characters;
      theme = withShow(cs[Math.floor((secs - b.start) / 2.5) % cs.length], b.show);
    }
    svg = renderFace({ t: state.t, doy: state.doy, date: inst(state.t), city, aod: state.aod, lang: state.lang, id: 'main', theme, hr, secs, spike }).svg;
  }
  $('screen').innerHTML = svg;

  const out = renderFace({ t: state.t, doy: state.doy, date, city }); // readouts only
  $('rPrahar').textContent = state.lang === 'hi' ? out.cur.hi : out.cur.en;
  $('rPrahar').className = state.lang === 'hi' ? 'deva' : '';
  $('rSr').textContent = fmtClock(out.sr);
  $('rSs').textContent = fmtClock(out.ss);
  $('rDay').textContent = fmtDur(mod24(out.ss - out.sr));
  if (document.activeElement !== $('time')) $('time').value = Math.floor(state.t * 60) % 1440;
  if (document.activeElement !== $('doy')) $('doy').value = state.doy;
  $('timeLbl').textContent = fmtClock(state.t) + (state.mode === 'live' ? ' (live)' : '');
  $('doyLbl').textContent = fmtDate(date) + ' ' + YEAR + ` · ${city.name}`;
  $('ringbar').innerHTML = out.list.map((p) =>
    `<i style="flex:${p.len};background:${p.color};opacity:${p.i === out.cur.i ? 1 : 0.35}" title="${p.en} · ${fmtDur(p.len)}"></i>`).join('');

  $('bpm').textContent = hr;
  $('hrLbl').textContent = state.hrManual === null ? `auto (${hr})` : `${state.hrManual}`;
  if (document.activeElement !== $('hr')) $('hr').value = hr;
}

function drawStatic() {
  const { city, date, tz, inst } = ctx();
  const { sr, ss } = sunTimes(state.doy, city.lat, city.lng, tz);
  const list = prahars(sr, ss);

  const moments = [
    ['Usha · Brahma muhurta', sr - 1.2, false],
    ['Madhyahna · focus', sr + mod24(ss - sr) * 0.4, false],
    ['Sayahna · golden hour', ss - 0.4, false],
    ['Nishitha · night', ss + 3.5, false],
    ['Always-on display', ss + 3.5, true],
  ];
  $('thumbs').innerHTML = moments.map(([label, t, aod], k) => {
    const o = renderFace({ t: mod24(t), doy: state.doy, date: inst(t), city, aod, lang: state.lang, id: 'th' + k });
    return `<div class="thumb"><div class="face">${o.svg}</div><p><b>${fmtClock(t)}</b>${label}</p></div>`;
  }).join('');

  const eds = [];
  for (const show of Object.values(SHOWS)) for (const c of show.characters) eds.push([show, c]);
  const te = sr + mod24(ss - sr) * 0.55;
  $('editions').innerHTML = eds.map(([show, c], k) => {
    const o = renderFace({ t: mod24(te), doy: state.doy, date: inst(te), city, lang: state.lang, id: 'ed' + k, theme: withShow(c, show) });
    return `<div class="thumb"><div class="face">${o.svg}</div><p><b>${c.name}</b>${show.title} · ${c.vibe}</p></div>`;
  }).join('');

  $('thumbCity').textContent = `${city.name}, ${fmtDate(date)}`;
  $('tblCity').textContent = city.name;
  $('tblDate').textContent = fmtDate(date) + ' ' + YEAR;
  $('tbl').innerHTML = `<tr><th>#</th><th>Prahar</th><th></th><th>From</th><th>To</th><th>Length</th><th>Nudge</th></tr>` +
    list.map((p) => `<tr><td>${p.i + 1}</td><td><span class="sw" style="background:${p.color}"></span>${p.en}</td>
      <td class="deva">${p.hi}</td><td>${fmtClock(p.start)}</td><td>${fmtClock(p.start + p.len)}</td>
      <td>${fmtDur(p.len)}</td><td>${p.nudge}</td></tr>`).join('');
}

// ---- controls -------------------------------------------------------------
const citySel = $('city');
citySel.innerHTML = Object.entries(CITIES).map(([k, c]) => `<option value="${k}">${c.name}</option>`).join('');
citySel.value = state.city;

function setSeg(segId, attr, val) {
  document.querySelectorAll(`#${segId} button`).forEach((b) => b.classList.toggle('on', b.dataset[attr] === String(val)));
}
function setMode(m) { state.mode = m; setSeg('modeSeg', 'mode', m); if (m === 'live') syncLive(); draw(); drawStatic(); }

$('modeSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });
$('dispSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.aod = b.dataset.aod === '1'; setSeg('dispSeg', 'aod', b.dataset.aod); draw(); });
const setLang = (l) => { state.lang = l; setSeg('langSeg', 'lang', l); draw(); drawStatic(); };
$('langSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setLang(b.dataset.lang); });
$('screen').addEventListener('click', () => {
  if (state.binge.stage === 'suggest') { toPick(); $('bingePanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
  if (state.binge.stage !== 'idle') return;
  setLang(state.lang === 'en' ? 'hi' : 'en');
});
citySel.addEventListener('change', () => { state.city = citySel.value; if (state.mode === 'live') syncLive(); draw(); drawStatic(); });
$('time').addEventListener('input', (e) => { if (state.mode !== 'manual') setMode('manual'); state.t = +e.target.value / 60; draw(); });
$('doy').addEventListener('input', (e) => { if (state.mode !== 'manual') setMode('manual'); state.doy = +e.target.value; draw(); drawStatic(); });

$('hr').addEventListener('input', (e) => { state.hrManual = +e.target.value; state.spikeAt = null; });
$('hrAuto').addEventListener('click', () => { state.hrManual = null; state.spikeAt = null; });
$('spikeBtn').addEventListener('click', () => { state.spikeAt = secs; });

$('showSel').addEventListener('change', () => $('showOther').classList.toggle('hidden', $('showSel').value !== 'other'));
$('detectBtn').addEventListener('click', startBinge);
$('chars').addEventListener('click', (e) => { const b = e.target.closest('.char'); if (b) choose(+b.dataset.k); });
$('classicBtn').addEventListener('click', () => {
  state.theme = null; state.binge.stage = 'idle';
  $('pickArea').classList.add('hidden'); $('steps').classList.add('hidden');
});

// ---- loop (≈30 fps; the face animates even in manual mode for the heartbeat) ----
let last = performance.now(), lastStatic = 0, lastDraw = 0;
function tick(now) {
  const dt = (now - last) / 1000; last = now; secs += dt;
  if (state.mode === 'live') syncLive();
  else if (state.mode === 'day') state.t = (state.t + dt) % 24;                 // 24 s per day
  else if (state.mode === 'year') {
    state.doy = Math.floor((((state.doy - 1 + dt * 30) % 365) + 1) * 100) / 100;
    if (now - lastStatic > 400) { lastStatic = now; drawStatic(); }
  }
  if (now - lastDraw > 33) { lastDraw = now; draw(); }
  requestAnimationFrame(tick);
}

if (params.has('t')) { state.mode = 'manual'; state.t = +params.get('t'); }
if (params.has('doy')) { state.mode = 'manual'; state.doy = +params.get('doy'); }
if (params.has('secs')) secs = +params.get('secs');
if (params.has('theme')) {
  const [sk, ck] = params.get('theme').split('.');
  const show = SHOWS[sk]; const c = show?.characters.find((x) => x.id === ck);
  if (c) state.theme = withShow(c, show);
}
setSeg('dispSeg', 'aod', state.aod ? '1' : '0'); setSeg('langSeg', 'lang', state.lang);
setMode(state.mode);
if (params.has('freeze')) draw(); else requestAnimationFrame(tick);

import { renderFace, CITIES, tzFor, sunTimes, prahars, fmtClock, fmtDur } from './face.js';

const $ = (id) => document.getElementById(id);
const YEAR = 2026;
const params = new URLSearchParams(location.search);

const dateFromDoy = (doy) => new Date(Date.UTC(YEAR, 0, doy, 12));
const doyOf = (d) => Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400000);
const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

const state = {
  mode: params.get('mode') || 'live',
  t: 12, doy: 308,
  city: params.get('city') || 'delhi',
  aod: params.get('aod') === '1',
  lang: params.get('lang') || 'en',
};

function syncLive() {
  const city = CITIES[state.city];
  const now = new Date();
  const tz = tzFor(city, doyOf(now));
  const local = new Date(now.getTime() + tz * 3600000);
  state.doy = Math.min(365, doyOf(local));
  state.t = local.getUTCHours() + local.getUTCMinutes() / 60 + local.getUTCSeconds() / 3600;
}

function draw() {
  const city = CITIES[state.city];
  const date = dateFromDoy(state.doy);
  // moon phase needs the actual instant
  const instant = new Date(date.getTime() + (state.t - 12 - tzFor(city, state.doy)) * 3600000);
  const out = renderFace({ t: state.t, doy: state.doy, date: instant, city, aod: state.aod, lang: state.lang, id: 'main' });
  $('screen').innerHTML = out.svg;

  $('rPrahar').textContent = state.lang === 'hi' ? out.cur.hi : out.cur.en;
  $('rPrahar').className = state.lang === 'hi' ? 'deva' : '';
  $('rSr').textContent = fmtClock(out.sr);
  $('rSs').textContent = fmtClock(out.ss);
  const dayLen = ((out.ss - out.sr) % 24 + 24) % 24;
  $('rDay').textContent = fmtDur(dayLen);
  $('time').value = Math.floor(state.t * 60) % 1440;
  $('doy').value = state.doy;
  $('timeLbl').textContent = fmtClock(state.t) + (state.mode === 'live' ? ' (live)' : '');
  $('doyLbl').textContent = fmtDate(date) + ' ' + YEAR + ` · ${city.name}`;

  $('ringbar').innerHTML = out.list.map((p) =>
    `<i style="flex:${p.len};background:${p.color};opacity:${p.i === out.cur.i ? 1 : 0.35}" title="${p.en} · ${fmtDur(p.len)}"></i>`).join('');
}

function drawStatic() {
  const city = CITIES[state.city];
  const date = dateFromDoy(state.doy);
  const tz = tzFor(city, state.doy);
  const { sr, ss } = sunTimes(state.doy, city.lat, city.lng, tz);
  const list = prahars(sr, ss);
  const inst = (t) => new Date(date.getTime() + (t - 12 - tz) * 3600000);

  const moments = [
    ['Usha · Brahma muhurta', sr - 1.2, false],
    ['Madhyahna · focus', sr + (ss - sr) * 0.4, false],
    ['Sayahna · golden hour', ss - 0.4, false],
    ['Nishitha · night', ss + 3.5, false],
    ['Always-on display', ss + 3.5, true],
  ];
  $('thumbs').innerHTML = moments.map(([label, t, aod], k) => {
    const o = renderFace({ t: (t + 24) % 24, doy: state.doy, date: inst(t), city, aod, lang: state.lang, id: 'th' + k });
    return `<div class="thumb"><div class="face">${o.svg}</div><p><b>${fmtClock(t)}</b>${label}</p></div>`;
  }).join('');
  $('thumbCity').textContent = `${city.name}, ${fmtDate(date)}`;
  $('tblCity').textContent = city.name;
  $('tblDate').textContent = fmtDate(date) + ' ' + YEAR;
  $('tbl').innerHTML = `<tr><th>#</th><th>Prahar</th><th></th><th>From</th><th>To</th><th>Length</th><th>Nudge</th></tr>` +
    list.map((p) => `<tr><td>${p.i + 1}</td><td><span class="sw" style="background:${p.color}"></span>${p.en}</td>
      <td class="deva">${p.hi}</td><td>${fmtClock(p.start)}</td><td>${fmtClock(p.start + p.len)}</td>
      <td>${fmtDur(p.len)}</td><td>${p.nudge}</td></tr>`).join('');
}

// --- controls -------------------------------------------------------------
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
$('screen').addEventListener('click', () => setLang(state.lang === 'en' ? 'hi' : 'en'));
citySel.addEventListener('change', () => { state.city = citySel.value; if (state.mode === 'live') syncLive(); draw(); drawStatic(); });
$('time').addEventListener('input', (e) => { if (state.mode !== 'manual') setMode('manual'); state.t = +e.target.value / 60; draw(); });
$('doy').addEventListener('input', (e) => { if (state.mode !== 'manual') setMode('manual'); state.doy = +e.target.value; draw(); drawStatic(); });

// --- loop -----------------------------------------------------------------
let last = performance.now(), lastStatic = 0;
function tick(now) {
  const dt = (now - last) / 1000; last = now;
  if (state.mode === 'live') { syncLive(); draw(); }
  else if (state.mode === 'day') { state.t = (state.t + dt * 1.0) % 24; draw(); }            // 24 s per day
  else if (state.mode === 'year') {
    state.doy = ((state.doy - 1 + dt * 30) % 365) + 1; state.doy = Math.floor(state.doy * 100) / 100;
    draw();
    if (now - lastStatic > 400) { lastStatic = now; drawStatic(); }
  }
  requestAnimationFrame(tick);
}

if (params.has('t')) { state.mode = 'manual'; state.t = +params.get('t'); }
if (params.has('doy')) { state.mode = 'manual'; state.doy = +params.get('doy'); }
setSeg('dispSeg', 'aod', state.aod ? '1' : '0'); setSeg('langSeg', 'lang', state.lang);
setMode(state.mode);
if (state.mode === 'year') { state.t = 13; }
requestAnimationFrame(tick);

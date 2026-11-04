// Encore backend: serves the prototype and powers "favourite character → AI wallpaper".
//
//   GET  /api/health                      which providers are configured
//   GET  /api/characters?show=<title>     character list (TMDB when keyed, built-in otherwise)
//   POST /api/style   {show, character}   Claude → character-inspired style card (JSON)
//   POST /api/wallpaper {imagePrompt}     Replicate (Flux) → wallpaper as a data: URL
//
// Every route degrades gracefully: with no keys the frontend uses its built-in generator.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8787);
const has = { claude: !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN), replicate: !!process.env.REPLICATE_API_TOKEN, tmdb: !!process.env.TMDB_API_KEY };
const claude = has.claude ? new Anthropic() : null;

// ------------------------------------------------------------------ characters
const BUILT_IN = {
  'friends': ['Rachel', 'Ross', 'Monica', 'Chandler', 'Joey', 'Phoebe'],
  'stranger things': ['Eleven', 'Dustin', 'Steve', 'Max', 'Hopper', 'Will'],
  'money heist': ['The Professor', 'Tokyo', 'Berlin', 'Nairobi', 'Rio', 'Denver'],
  'squid game': ['Gi-hun', 'Sae-byeok', 'Sang-woo', 'Ali', 'Il-nam', 'The Front Man'],
};

async function tmdbCharacters(title) {
  const key = process.env.TMDB_API_KEY;
  const q = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${key}&query=${encodeURIComponent(title)}`).then((r) => r.json());
  const show = q.results?.[0];
  if (!show) return null;
  const credits = await fetch(`https://api.themoviedb.org/3/tv/${show.id}/aggregate_credits?api_key=${key}`).then((r) => r.json());
  const names = (credits.cast || [])
    .flatMap((c) => (c.roles || []).map((r) => ({ name: r.character, eps: r.episode_count })))
    .filter((r) => r.name && !/self|voice|uncredited/i.test(r.name))
    .sort((a, b) => b.eps - a.eps)
    .map((r) => r.name.split('/')[0].trim());
  return { show: show.name, characters: [...new Set(names)].slice(0, 8), source: 'tmdb' };
}

// ------------------------------------------------------------------ style card (Claude)
const STYLE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Short evocative face name, 1-3 words, no show title' },
    palette: { type: 'array', items: { type: 'string', description: '#rrggbb' }, description: '[deep background, mid tone, accent]' },
    ink: { type: 'string', description: '#rrggbb text colour readable on the wallpaper' },
    timeFont: { type: 'string', enum: ['Inter Tight', 'Gabarito', 'Libre Baskerville', 'Bebas Neue', 'JetBrains Mono'] },
    motifs: { type: 'array', items: { type: 'string' }, description: '3-5 objects, places or textures from the character\'s world' },
    mood: { type: 'string', description: 'One sentence describing the feeling of the face' },
    nudge: { type: 'string', description: 'Up-next card line in the character\'s spirit, max 26 characters' },
    imagePrompt: { type: 'string', description: 'Prompt for an image model, see rules' },
  },
  required: ['name', 'palette', 'ink', 'timeFont', 'motifs', 'mood', 'nudge', 'imagePrompt'],
  additionalProperties: false,
};

const SYSTEM = `You design premium smartwatch faces (396x484 portrait OLED) inspired by a viewer's favourite TV character.
Capture the character's world through colour, objects, places, textures and atmosphere: the things a fan would recognise instantly.
Hard rules for imagePrompt: never depict the character, any actor or any real person; no faces, no figures, no text, no logos, no letters.
Describe a still-life or environment scene, cinematic lighting, rich but calm, with the top third darker and uncluttered so a large clock stays readable.
Keep the palette consistent with the image you describe.`;

async function styleCard(show, character) {
  const response = await claude.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: STYLE_SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: `Show: ${show}\nFavourite character: ${character}\nDesign their watch face.` }],
  });
  if (response.stop_reason === 'refusal') throw new Error('style request declined');
  const text = response.content.find((b) => b.type === 'text')?.text;
  return JSON.parse(text);
}

// ------------------------------------------------------------------ refine (Claude): "make it darker", "circle frame"…
const REFINE_SCHEMA = {
  type: 'object',
  properties: {
    accent: { type: 'string', description: '#rrggbb' },
    ink: { type: 'string', description: '#rrggbb' },
    timeFont: { type: 'string', enum: STYLE_SCHEMA.properties.timeFont.enum },
    frame: { type: 'string', enum: ['full', 'medallion'], description: 'medallion = artwork inside a ringed circle on a ray burst' },
    clockPos: { type: 'string', enum: ['auto', 'left', 'center', 'right'] },
    timeScale: { type: 'number', description: '0.6 to 1.5, 1 = default' },
    dim: { type: 'number', description: '-0.3 (brighter) to 0.7 (darker), 0 = none' },
    hideCard: { type: 'boolean' },
    regenerateImage: { type: 'boolean', description: 'true only if the request changes what the artwork depicts' },
    imagePrompt: { type: 'string', description: 'updated image prompt when regenerateImage, else empty' },
    summary: { type: 'string', description: 'What changed, under 60 characters' },
  },
  required: ['accent', 'ink', 'timeFont', 'frame', 'clockPos', 'timeScale', 'dim', 'hideCard', 'regenerateImage', 'imagePrompt', 'summary'],
  additionalProperties: false,
};
async function refine(settings, instruction, imagePrompt) {
  const response = await claude.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: REFINE_SCHEMA } },
    system: `You edit a smartwatch face. Return the full updated settings, changing only what the user's request implies and keeping everything else as given. Keep text readable (ink must contrast with the artwork). Image prompt rules: ${SYSTEM.split('\n').slice(2).join(' ')}`,
    messages: [{ role: 'user', content: `Current settings: ${JSON.stringify(settings)}\nCurrent image prompt: ${imagePrompt || '(none: the artwork is a built-in vector scene)'}\nRequest: ${instruction}` }],
  });
  if (response.stop_reason === 'refusal') throw new Error('edit request declined');
  return JSON.parse(response.content.find((b) => b.type === 'text')?.text);
}

// ------------------------------------------------------------------ wallpaper (Replicate / Flux)
async function paint(prompt) {
  const model = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-schnell';
  const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json', Prefer: 'wait' },
    body: JSON.stringify({ input: { prompt, aspect_ratio: '4:5', output_format: 'webp', num_outputs: 1 } }),
  });
  let pred = await res.json();
  for (let i = 0; i < 30 && pred.status && !['succeeded', 'failed', 'canceled'].includes(pred.status); i++) {
    await new Promise((r) => setTimeout(r, 1500));
    pred = await fetch(pred.urls.get, { headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` } }).then((r) => r.json());
  }
  const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  if (!url) throw new Error(`image generation failed: ${pred.error || pred.status}`);
  const img = Buffer.from(await (await fetch(url)).arrayBuffer());
  return `data:image/webp;base64,${img.toString('base64')}`;
}

// ------------------------------------------------------------------ http
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((ok) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { try { ok(JSON.parse(d || '{}')); } catch { ok({}); } }); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/api/health') return json(res, 200, has);
    if (url.pathname === '/api/characters') {
      const title = (url.searchParams.get('show') || '').trim();
      if (has.tmdb) { const r = await tmdbCharacters(title).catch(() => null); if (r?.characters.length) return json(res, 200, r); }
      return json(res, 200, { show: title, characters: BUILT_IN[title.toLowerCase()] || [], source: 'built-in' });
    }
    if (url.pathname === '/api/style' && req.method === 'POST') {
      if (!claude) return json(res, 503, { error: 'ANTHROPIC_API_KEY not set' });
      const { show = '', character = '' } = await readBody(req);
      return json(res, 200, await styleCard(String(show).slice(0, 80), String(character).slice(0, 80)));
    }
    if (url.pathname === '/api/refine' && req.method === 'POST') {
      if (!claude) return json(res, 503, { error: 'ANTHROPIC_API_KEY not set' });
      const { settings = {}, instruction = '', imagePrompt = '' } = await readBody(req);
      return json(res, 200, await refine(settings, String(instruction).slice(0, 400), String(imagePrompt).slice(0, 1200)));
    }
    if (url.pathname === '/api/wallpaper' && req.method === 'POST') {
      if (!has.replicate) return json(res, 503, { error: 'REPLICATE_API_TOKEN not set' });
      const { imagePrompt = '' } = await readBody(req);
      return json(res, 200, { image: await paint(String(imagePrompt).slice(0, 1200)) });
    }
    // static files
    const file = path.join(ROOT, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname));
    if (!file.startsWith(ROOT) || /[\\/](\.env|node_modules|server)([\\/]|$)/.test(file.slice(ROOT.length))) return json(res, 404, { error: 'not found' });
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (err) {
    if (err instanceof Anthropic.APIError) return json(res, 502, { error: `Claude API ${err.status}: ${err.message}` });
    if (err.code === 'ENOENT' || err.code === 'EISDIR') return json(res, 404, { error: 'not found' });
    json(res, 500, { error: String(err.message || err) });
  }
}).listen(PORT, () => console.log(`Encore on http://localhost:${PORT}  providers: ${JSON.stringify(has)}`));

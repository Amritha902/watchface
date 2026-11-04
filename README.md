# PRAHAR · प्रहर

**A living 24-hour watch face that tells time the way India once felt it.**
Entry for the *Titan Watch Face Design Challenge 2026 · Open Innovation* track: *"Think freely. Design boldly. Innovate beyond the dial."*

![PRAHAR showcase](exports/showcase-hero.png)

## The idea in one line
Every watch tells you *what time it is*. PRAHAR also tells you *what kind of time it is*. It splits your day into the eight traditional Indian **prahars**, computes them from **your real sunrise and sunset**, and pairs each one with a gentle circadian nudge.

## What makes it new
| | |
|---|---|
| **A dial that breathes** | Prahars are 4 equal parts of daylight + 4 equal parts of night, so the segments change length every day. Oslo midsummer: daylight prahars ≈ 4h 40m. Oslo midwinter: ≈ 1h 30m. No two days look the same. |
| **The sky is the hand** | No hands, no 12-hour circle. A sun (by day) or moon (by night, **in its real phase**) travels a 24-hour ring: noon at the top, midnight at the bottom. |
| **Living background** | The gradient follows the actual sky: indigo pre-dawn → rose dawn → blue noon → golden hour → stars. |
| **Heritage × wellness** | Each prahar carries a nudge (Madhyahna → *Deep focus*, Aparahna → *Hydrate · walk*, Pradosha → *Unplug*). Brahma muhurta is marked on the bezel. Coaching with zero notifications. |
| **Bilingual** | English ⇄ हिंदी with a single tap. Designed to localise to any Indian language. |
| **Battery-aware AOD** | Always-on mode uses thin outlines on true black with no fills, which keeps the panel cool and avoids burn-in. |

## ♥ Heart sync: the face beats with you
- **Every beat is visible:** the heart icon pulses in time with your real BPM, even at rest.
- **Racing heart (>95 bpm):** the screen edge glows red on each beat, the whole face throbs from bright to dim ("lub-dub" envelope), and a **live ECG trace** replaces the stats row.
- **Sudden spike:** a red ring flashes with each beat and a **breathing ring** takes over (4 s in, 6 s out) to guide you back down, then fades out as your heart rate settles.

| Racing heart | Spike → guided breathing |
|---|---|
| ![](exports/face-11-heart-racing.png) | ![](exports/face-12-heart-spike-breathe.png) |

## 🎬 Binge Match: a face from what you're watching
1. The companion app notices a new series playing on your phone (on-device, opt-in, via the media session).
2. The watch asks: *"Now watching Dark: want a face inspired by it?"*
3. You pick a character, for example **Jonas / Martha / Adam** for *Dark* or **Light Yagami / L / Ryuk** for *Death Note*.
4. A show lookup (title → mood, palette, characters) feeds a generator that designs the skin in about 10 minutes (sped up to 7 s in the demo). The skin sits on top of the same prahar engine, so you keep the sky ring, nudges and heart sync.
5. For any other title, a palette is generated from the title itself.

| Jonas · Dark | Martha · Dark | Adam · Dark |
|---|---|---|
| ![](exports/face-13-binge-dark-jonas.png) | ![](exports/face-14-binge-dark-martha.png) | ![](exports/face-15-binge-dark-adam.png) |
| **Light Yagami · Death Note** | **L · Death Note** | **Ryuk · Death Note** |
| ![](exports/face-16-binge-deathnote-light.png) | ![](exports/face-17-binge-deathnote-l.png) | ![](exports/face-18-binge-deathnote-ryuk.png) |

> All motifs are original geometry (time loops, rain, apples, sugar cubes, wings) that evoke a show's mood. No official artwork, logos or likenesses are used. Shipping official character art would go through a licensed studio partnership.

## The eight prahars
| # | Prahar | | Nudge |
|---|---|---|---|
| 1 | Purvahna | पूर्वाह्न | Move · plan the day |
| 2 | Madhyahna | मध्याह्न | Deep focus window |
| 3 | Aparahna | अपराह्न | Hydrate · take a walk |
| 4 | Sayahna | सायाह्न | Wrap up · reconnect |
| 5 | Pradosha | प्रदोष | Unplug · family time |
| 6 | Nishitha | निशीथ | Wind down for sleep |
| 7 | Triyama | त्रियामा | Deep rest |
| 8 | Usha | उषा | Rise · breathe (Brahma muhurta) |

## Renders (466 × 466 round AMOLED, @2x)
| Usha · 05:15 | Madhyahna · 11:18 | Sayahna · 17:06 | Nishitha · 22:24 |
|---|---|---|---|
| ![](exports/face-01-usha-brahma-muhurta.png) | ![](exports/face-03-madhyahna-focus.png) | ![](exports/face-04-sayahna-golden-hour.png) | ![](exports/face-06-nishitha-night.png) |
| **Always-on** | **हिंदी** | **Oslo · 21 Jun** | **Oslo · 21 Dec** |
| ![](exports/face-07-always-on.png) | ![](exports/face-08-hindi.png) | ![](exports/face-09-oslo-midsummer.png) | ![](exports/face-10-oslo-midwinter.png) |

## Run the interactive prototype
```bash
python3 -m http.server 8123
```
Then open http://localhost:8123. Try **Simulate a spike**, **Binge Match → Detect & suggest a face**, **Play a day**, **Play a year** (watch the prahars breathe), **Always-on**, tapping the face for हिंदी, and switching the city to Oslo.

URL params for direct states: `?t=17.1&doy=308&city=oslo&aod=1&lang=hi&hr=130&theme=dark.jonas`.

## Regenerate the renders
```bash
node scripts/export.cjs http://localhost:8123/
```
Writes `exports/face-*.png` plus showcase screenshots (needs Playwright + Chromium).

## Feasibility
- **Offline:** sunrise and sunset come from the NOAA solar approximation in ~20 lines of math (`src/face.js`). Location is read once from the paired phone, with no GPS polling.
- **Pure vector:** arcs, text and gradients only, so it maps directly to Watch Face Format / Watch Face Studio and similar smartwatch face pipelines.
- **Low cost to run:** the face redraws once a minute; AOD draws under 5% lit pixels.

## Files
- `src/face.js`: face engine (solar math, prahar calculation, moon phase, SVG renderer)
- `src/themes.js`: Binge Match show/character skins and the auto-palette generator
- `src/app.js`: showcase controls (time modes, AOD, language, city, heart sync, Binge Match flow)
- `index.html`: showcase and pitch page
- `exports/`: submission-ready PNGs

# Lancerstudio Engineering Solutions

Single-page editorial marketing site for Lancerstudio Engineering Solutions, a Mumbai-based
facade engineering and technical support firm. React 18 + Vite, CSS Modules, Lenis smooth
scroll.

Design system from the handoff in `../design_handoff_lancers_studio/`; **all copy from
`../Lancerstudio_Company_Profile.pdf`** (LS-CP, 15pp). The handoff's copy was placeholder
written for a different, fictional firm — see *Content* below.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
```

## Content

Every string on the site lives in [src/content.json](src/content.json) and comes from the
company profile PDF. Nothing is invented: where the profile gives no figure, the site gives
no figure.

The design handoff shipped with placeholder copy describing a fictional practice. That copy
was factually wrong for this company and has been removed, not layered over:

| Removed | Why |
| --- | --- |
| "Est. 2009 — Dubai / Bengaluru" | The firm is in Mumbai; the profile states no founding year |
| "1.4 million m² of envelope delivered across 26 cities" | No such figure exists |
| Showroom / test facility in Al Quoz, Dubai | No such facility — this is an engineering and detailing practice |
| Five named projects (Meridian House, Kalyan Pavilion …) | Invented. The profile states project names are shown **only with client permission** |
| Testimonial from "Renata Oyelaran"; "4.9 / 5 — 38 client reviews" | Invented client and invented review score |
| "Four disciplines, one envelope" | There are five services, and different ones |

Three components were deleted with that copy: `ShowroomPinned`, `FeaturedProjects` /
`ProjectCard`, and `Testimonial`. Their design slots are now filled by real content —
`Problems`, `Capability` and `Precision` respectively. `Capability` deliberately carries no
photography and no client names, matching the profile's own position on confidentiality.

An acceptance check asserts that none of the removed strings can reappear in the rendered
DOM, and that the real contact facts are present.

## Structure

```
src/
├─ App.jsx                       page root — menuOpen state, menu navigation
├─ content.json                  all copy, projects, services, image URLs
├─ lib/
│  ├─ SmoothScroll.jsx           Lenis + the single rAF loop + tile parallax + anchor nav
│  ├─ facade.js                  install-sequence geometry + 20s timeline (pure)
│  ├─ useInView.js               IntersectionObserver → data-armed / data-in
│  └─ motion.js                  breakpoint + prefers-reduced-motion helper
├─ styles/
│  ├─ tokens.css                 colour, type scale, spacing, easing
│  └─ global.css                 reset, shared primitives, reveal keyframes
└─ components/
   ├─ Reveal.jsx                 rise | fade | wipe scroll reveal
   ├─ Hero.jsx                   #top — video background over a poster
   ├─ Statement.jsx              intro / positioning
   ├─ About.jsx                  #about
   │  └─ PanelSetOutDrawing.jsx  scroll-driven SVG set-out study
   ├─ Services.jsx               #services
   │  └─ ServiceTile.jsx         staggered + parallax tile
   ├─ Systems.jsx                #systems — eight facade systems
   │  └─ SystemGlyph.jsx         hairline orthographic glyphs
   ├─ Problems.jsx               #problems — the eleven failure points
   ├─ Capability.jsx             #capability — building types, no client names
   ├─ Clients.jsx                #clients — who we work with
   ├─ WhyUs.jsx                  #why
   ├─ Precision.jsx              pull quote + the nine checks + tools
   ├─ ClosingCTA.jsx             #contact
   ├─ SiteFooter.jsx
   ├─ NavPill.jsx                fixed pill
   └─ MenuOverlay.jsx            full-screen index
```

## Design tokens

All in [src/styles/tokens.css](src/styles/tokens.css). Two colours only — `--ink` /
`--charcoal` on `--cream` / `--white`, with 60% muted variants and a hairline rule.
No accent hue. Every size is a `clamp()`; the only radius is the nav pill.

## Motion

One Lenis instance and one `requestAnimationFrame` loop, both owned by
`SmoothScrollProvider`. The tile parallax runs inside that loop.

- **`duration`** is the tunable — `<SmoothScrollProvider duration={1.25}>` in
  [App.jsx](src/App.jsx). 0.6 is snappy, 2.5 is very heavy; 1.25 is the shipped value.
- **Tile parallax** reads `data-depth` off any `[data-tile]` element, so a tile registers
  itself through markup. Culled off-screen, and off entirely below 860px.
- **Reveals** use `IntersectionObserver`, not `animation-timeline: view()` — that is
  Chromium-only. Content renders visible and is hidden only once the observer is wired up,
  so nothing depends on JS to become readable.
- **Showroom pin** is pure CSS: a `200vh` section with a sticky `100svh` inner.
- **The panel set-out drawing** is genuinely scroll-linked, driven by the element's
  position through its own cover range, matching the handoff's `entry`/`cover` ranges.

### Hero video

[Hero.jsx](src/components/Hero.jsx) plays a muted, looping clip behind the headline, over a
still poster that is frame 0 of the loop.

- **The poster paints first and carries LCP**; it is preloaded in
  [index.html](index.html), the video deliberately is not. The video fades in only on the
  `playing` event, so if autoplay is refused (iOS low power mode, a strict policy, a decode
  failure) the poster simply stays and the hero looks exactly as it did before.
- **Skipped entirely** under `prefers-reduced-motion` and under `Save-Data` — in those
  cases no video file is requested at all.
- **Two encodes**, chosen in JS (`media` on `<source>` is not reliably honoured for video):
  1600px for desktop, 1152px for ≤860px.

#### Source preparation

The supplied file was 2560×1440 VP9-in-MP4, 13.05s at 50fps, 16.5 MB, with an audio track.
Three things were wrong with using it directly:

1. **VP9-in-MP4 does not play in Safari at all** — re-encoded to H.264, which plays
   everywhere.
2. **16.5 MB for a background** (~23 Mbps). Now 1.9 MB desktop / 988 KB mobile.
3. **A straight loop cut hard** — the first and last frames differ by 27.5%, because the
   camera drifts throughout. The clip is now a ping-pong (7s forward, 7s reversed) giving a
   14s loop whose seam measures 1.6%, i.e. invisible. The reversal is imperceptible on a
   drift this slow.

Audio is dropped. If the client supplies new footage, the encode is:

```sh
ffmpeg -ss 2.5 -t 7 -i SOURCE.mp4 \
  -filter_complex "[0:v]fps=24,scale=1600:-2:flags=lanczos,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]" \
  -map "[v]" -an -c:v libx264 -preset veryslow -crf 33 -profile:v high -pix_fmt yuv420p \
  -vf "curves=all='0/0 0.5/0.40 1/0.70'" -movflags +faststart hero-desktop.mp4
```

#### Contrast

The handoff's scrim was tuned for a dark photograph; this footage is bright daylight, which
broke the hero eyebrow. Measured on the composited page, p90 luminance, worst frame of the
loop:

| element | original still | video, ungraded | shipped |
| --- | --- | --- | --- |
| eyebrow | 4.46 (fail) | 2.08 (fail) | **5.10** |
| top-right meta | 3.65 (fail) | 2.98 (fail) | **5.37** |
| h1 (large, needs 3:1) | 4.00 | 3.24 | **6.64** |
| stat | 6.55 | 4.17 | **5.19** |

Two changes got there, and **the handoff's scrim gradient is untouched**:

1. A highlight rolloff on the video (`curves=all='0/0 0.5/0.40 1/0.70'`), which also brings
   it closer to the dark tonality the design was built around.
2. The hero's eyebrow and top-right meta no longer use the muted-on-dark token — they are
   full white and 75% white, in [Hero.module.css](src/components/Hero.module.css). They sit
   in the band where the scrim is lightest (the 42% stop at `.18`), and `rgba(255,255,255,.6)`
   cannot reach 4.5:1 there at any scrim value. This is a two-line revert if the muted look
   is preferred — but note both elements already failed WCAG AA on the original still.

### Install sequence (scroll-scrubbed)

[FacadeInstall.jsx](src/components/FacadeInstall.jsx) rebuilds the `Facade Install.dc`
storyboard as an isometric SVG whose 20-second timeline is mapped onto scroll position, so
it advances as you scroll down and runs backwards as you scroll up. Six scenes — Site,
Frame, Hoist, Glaze, Detail, Sweep — surfaced in the UI as a scene rail and a floor
counter.

- **Scroll runway** is `--install-viewports` (default 4) in
  [FacadeInstall.module.css](src/components/FacadeInstall.module.css): a `400svh` section
  with a sticky `100svh` inner, giving 3 viewports of travel over 20s — about 6s of
  timeline per viewport, so half a screen of scroll advances roughly 3 seconds.
- **Geometry and timing are pure functions** in [facade.js](src/lib/facade.js). The
  component renders the SVG once with the `STATIC_TIME` frame baked into the markup, then
  writes each subsequent frame straight to the DOM in a rAF pass — 254 nodes cannot go
  through React at 60fps, and the baked markup means the section still reads if the driver
  never runs. Values within `EPSILON` of the last write are skipped.
- **Measured at 60fps** across the full timeline: median frame 16.7ms, max 17.5ms.
- **Props**: `floors` (26), `reflect` (1.6, reflection-sweep intensity), and `glass`
  (panel fill — defaults to `rgba(255,255,255,.1)`, see below).
- **The rail tracks the profile's seven-step workflow**, not the animation's internal scene
  names: scroll progress maps onto Architectural vision → … → Buildable facade, and the
  tower completes exactly as the last step lands.

### Reduced motion

`prefers-reduced-motion: reduce` skips Lenis and the rAF loop entirely, disables all
animation and transition, and leaves the drawings fully drawn and every reveal visible.
Anchors fall back to native jumps. The install section drops its scroll runway and its pin
(`height: auto`, `position: relative`) so it collapses from 4 viewports to 1.2 and shows
the finished tower as a static drawing — no dead scroll.

## Responsive

One breakpoint, 860px: the two-column grids (About, showroom overlay, testimonial
attribution, footer links) go to one column, and the service tiles stack — offsets and
parallax off, replaced by a rise-in reveal. Everything else is fluid.

## Notes on the handoff

### On the install sequence

The section is rebuilt from the `Facade Install.dc` storyboard, not ported from it — that
file is a Claude Design canvas wrapper, and the `FacadeVideo` component it imports
(`facade.jsx`, `animations-v3.jsx`, `tweaks-panel.jsx`, `support.js`) is not in the
download. The scene names, durations and tweak defaults come from the file's `OM_SCENES`
and `TWEAK_DEFAULTS`; the geometry is new.

Three departures from those defaults:

1. **`glass: #9cc3ec` is not used.** The brief allows no accent hue, so the glazing is
   white at 10% on charcoal — same luminous read, no accent. Pass `glass="#9cc3ec"` to
   restore it, at the cost of the two-tone rule.
2. **No dissolve back to bare site.** That scene exists so the source video loops;
   scroll-scrubbed it would mean scrolling to the end and watching the tower vanish.
   Sweep now ends on the finished facade.
3. **Copy is new.** The eyebrow, headline and body under `install` in
   [content.json](src/content.json) are not from the handoff — the handoff has no such
   section. Client to approve.

Two deliberate departures from `design-reference.html`:

1. **Reveals and the set-out drawing are JS-driven** rather than
   `animation-timeline: view()`, which no non-Chromium browser supports yet. The handoff
   recommends this.
2. **The drawing latches** at its furthest-scrolled state instead of unwinding when you
   scroll back up. Scroll-linked CSS animations are bidirectional; un-drawing the grid on
   the way back up reads as a glitch.

Still open, per the handoff:

- **Photography is all Unsplash placeholder** — 12 images, listed under `images` in
  [src/content.json](src/content.json) and inline in the services/projects/showroom
  entries. Replace before launch, keeping the crops (`3/4.2` tiles, `4/3` gallery,
  full-bleed covers) and the cool/neutral cast.
- **Logo marks are PNGs.** Ask the client for SVGs — at 18px in the nav pill the PNG is
  visibly soft.
- **Fonts come from Google Fonts.** Self-host for production. If the client licenses
  General Sans (Fontshare), it swaps in for Schibsted Grotesk — same role, and it was the
  first-choice brief.
- **No contact endpoint exists**, so `↳ Get a quote` and `↳ Get in touch` are in-page
  anchors to `#contact`. Point them at a contact route when there is one; the visual
  treatment does not change.

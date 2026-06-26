# Care Hero — implementation handoff

Static prototype to port into the Angular `care-fe` app. Default crop is **Nose**.

## Files
- `Hero.html` — standalone hero (loads React + Babel from CDN, mounts `hero-app.jsx`).
- `hero-app.jsx` — all hero markup/logic (the component to port).
- `hero/care-hero-cut.png` — transparent-background portrait (person anchored right).
- `tweaks-panel.jsx` — design-time Tweaks panel only; **do not ship to production**.

## Replacing the portrait
Swap the file at `hero/care-hero-cut.png` (path defined by the `PHOTO` const at the
top of `hero-app.jsx`). Use a transparent PNG, person on the right, framed to end
near the sweater hem so the crop presets line up.

## Crop / zoom
`CROP_MAP` in `hero-app.jsx` holds four presets (full / forehead / nose / mouth) as
CSS custom properties (`--crop-h`, `--crop-bottom`, `--crop-rx`). Default = `nose`.
The vars are spread onto the `.hero` section's inline style; the photo reads them in
`.hero.fullbleed .hero-photo`. To lock a single crop in production, hardcode the
`nose` values and drop the tweak.

## Copy (final)
- Headline: **Care é** + typed cycling word (acolhimento / escuta / vínculo / …).
- Sub: "Uma clínica ampliada de cuidado em saúde mental, relacional, física e social."
- CTA: **Agendar um atendimento** (single primary button).
- Removed: eyebrow line "Clínica Ampliada Ressignificações"; the "— orientada pelos
  quatro pilares" tail; the "Conhecer a Care" ghost link.

## Tweaks (design-time only)
`Hero.html` includes a Tweaks panel (layout, crop, accent, halo, grounding shadow,
etc.) and a URL API used by the comparison page: `?crop=nose&bare=1` forces a crop
and hides the panel. None of this needs to ship — the production hero is the
rendered output with `crop=nose`.

## Comparison
`Hero Crops.html` is a side-by-side canvas of all four crops (iframes of `Hero.html`).
Reference only.

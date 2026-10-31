# HyperLocal Farms — website

Redesign of [hyperlocalfarms.ag](https://www.hyperlocalfarms.ag/): a static, dependency-free site in a "Botanical Editorial" style, built with the farm's own brand (logo, green `#2e8b1f`, ink `#111`, Bebas Neue + Lato).

## Features
- **Cinematic hero**: AI-generated (Higgsfield / Seedance) seed-to-plate film, dewy pea tendrils dissolving into a plated dish, with drifting edible-flower petals.
- **Harvest-to-door scrollytelling**: sticky, scroll-driven story (Seeded → Grown → Cut to order → Packed & chilled → On your dock).
- **Chef's Toolbox catalog**: all 42 real products with filters by category and flavor, plus live search.
- **Build-a-sample-box**: add up to 5 items (saved in localStorage) and request with one click. The request opens a pre-filled email to `orders@hyperlocalfarms.ag`.
- **Animated delivery map**: daily routes from Indiantown, distributor reach statewide, and a "Are you on a route?" city checker.
- **Recipes**: the farm's 5 recipes in a drag-to-scroll rail, with full recipe modals and "add these to my sample box".
- **Impact & certifications**: meals-donated counter, PrimusGFS and Fresh From Florida badges, aerial farm film.
- **Farm tour price calculator**, Build-a-Farm consulting, tabbed FAQ, and a contact form.
- Responsive, keyboard accessible, and respects `prefers-reduced-motion`.

## Structure
```
index.html
css/styles.css
js/products.js   # catalog data (42 products)
js/main.js       # all interactions
assets/img       # generated photography (Higgsfield) + brand logo/badges
assets/products  # product photos from the current site
assets/video     # hero.mp4 (1080p), hero-720.mp4, flowers.mp4, farm.mp4
```

## Run locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy
The site is static. Deploy as-is to Vercel, Netlify, GitHub Pages or Cloudflare Pages; it needs no build step.

## Notes
- The forms use `mailto:` so they work with no backend. To capture leads server-side, point the forms at Formspree, Netlify Forms or a CRM webhook.
- "Download the 2026 catalog" links to the catalog page on the current site.

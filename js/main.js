/* HyperLocal Farms — site interactions (no dependencies) */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'orders@hyperlocalfarms.ag';
  const PRODUCTS = window.HLF_PRODUCTS || [];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const img = id => `assets/products/${id}.webp`;
  const CAT = { shoots: 'Shoots & Tendrils', leaves: 'Specialty Leaves', micro: 'Microgreens', mixes: 'Microgreen Mix', flowers: 'Edible Flower' };

  /* ---------- Loader ---------- */
  const ready = () => document.body.classList.add('is-ready');
  window.addEventListener('load', () => setTimeout(ready, 350));
  setTimeout(ready, 2600);

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(e => (e.textContent = new Date().getFullYear()));

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  let lastY = 0;
  const onScrollNav = () => {
    const y = scrollY;
    nav.classList.toggle('is-solid', y > innerHeight * 0.6);
    nav.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  const burger = $('.burger');
  const toggleMenu = (open) => {
    const o = open ?? !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', o);
    burger.setAttribute('aria-expanded', o);
    $('.mmenu').setAttribute('aria-hidden', !o);
  };
  burger.addEventListener('click', () => toggleMenu());
  $$('.mmenu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  // active section highlight
  const links = $$('.nav__links a');
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = $(l.getAttribute('href')); s && secObs.observe(s); });

  /* ---------- Reveal ---------- */
  $$('.reveal-words').forEach(el => {
    const walk = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.append(document.createTextNode(t)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = t; w.append(i); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    $$('.w > span', el).forEach((s, i) => (s.style.transitionDelay = i * 0.04 + 's'));
  });
  const revObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); revObs.unobserve(e.target); }
  }), { threshold: 0.18 });
  $$('.reveal, .reveal-words, .build').forEach(el => revObs.observe(el));
  $$('.intro__item, .badge').forEach((el, i) => (el.style.transitionDelay = (i % 3) * 0.12 + 's'));

  /* ---------- Counters ---------- */
  const countObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), d = 1600;
    const tick = t => {
      const k = Math.min(1, (t - t0) / d), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = v; if (k < 1) requestAnimationFrame(tick);
    };
    reduce ? (el.textContent = to) : requestAnimationFrame(tick);
    countObs.unobserve(el);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => countObs.observe(el));

  /* ---------- Lazy videos (play only in view) ---------- */
  const vidObs = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) {
      if (v.dataset.src && !v.src) { v.src = v.dataset.src; v.load(); }
      if (!reduce) v.play().catch(() => {});
    } else v.pause();
  }), { rootMargin: '200px' });
  $$('.lazy-video').forEach(v => vidObs.observe(v));
  const heroVid = $('.hero__video');
  if (heroVid && reduce) heroVid.pause();

  /* ---------- Petals canvas ---------- */
  const PETAL_COLORS = ['#9b6bd3', '#f2c230', '#f07f2e', '#e85d8e', '#9fdc8f', '#6aa9e8', '#ffffff'];
  $$('canvas[data-petals]').forEach(cv => {
    if (reduce) return;
    const ctx = cv.getContext('2d');
    let W, H, dpr, petals = [], run = false;
    const N = cv.dataset.petals === 'hero' ? 22 : 30;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const mk = (init) => ({
      x: Math.random() * W, y: init ? Math.random() * H : -20,
      r: 4 + Math.random() * 7, vy: .35 + Math.random() * .8, vx: -.3 + Math.random() * .6,
      a: Math.random() * 6.28, va: -.02 + Math.random() * .04, sw: Math.random() * 6.28,
      c: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0], o: .45 + Math.random() * .45
    });
    const draw = () => {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      petals.forEach(p => {
        p.sw += .015; p.x += p.vx + Math.sin(p.sw) * .6; p.y += p.vy; p.a += p.va;
        if (p.y > H + 20) Object.assign(p, mk(false));
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.o;
        ctx.fillStyle = p.c; ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * .55 * Math.abs(Math.cos(p.sw * 1.3)) + 1, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      });
      requestAnimationFrame(draw);
    };
    size(); petals = Array.from({ length: N }, () => mk(true));
    addEventListener('resize', size);
    new IntersectionObserver(([e]) => { const was = run; run = e.isIntersecting; if (run && !was) draw(); }).observe(cv);
  });

  /* ---------- Journey scrollytelling ---------- */
  const journey = $('#journey');
  const frames = $$('.jframe'), steps = $$('.jstep'), stepList = $('.journey__steps');
  const onJourney = () => {
    const r = journey.getBoundingClientRect();
    const total = journey.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / total));
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
    stepList.style.setProperty('--p', p.toFixed(3));
    steps.forEach((s, i) => { s.classList.toggle('is-active', i === idx); s.classList.toggle('is-done', i < idx); });
    frames.forEach((f, i) => { f.classList.toggle('is-active', i === idx); f.classList.toggle('is-past', i < idx); });
  };
  addEventListener('scroll', onJourney, { passive: true }); onJourney();

  /* ---------- Parallax ---------- */
  const pars = $$('.parallax');
  const onPar = () => pars.forEach(el => {
    const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const k = (r.top + r.height / 2 - innerHeight / 2) * -(+el.dataset.speed || .1);
    el.firstElementChild.style.transform = `translate3d(0,${k}px,0)`;
  });
  if (!reduce) { addEventListener('scroll', onPar, { passive: true }); onPar(); }

  /* ---------- Magnetic buttons ---------- */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('mouseleave', () => (b.style.transform = ''));
    });
  }

  /* ---------- Toast ---------- */
  const toastEl = $('[data-toast]'); let toastT;
  const toast = html => { toastEl.innerHTML = html; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600); };

  /* ---------- Sample box state ---------- */
  const MAX = 5;
  let box = [];
  try { box = JSON.parse(localStorage.getItem('hlf-box') || '[]').filter(id => byId[id]).slice(0, MAX); } catch (_) {}
  const save = () => { try { localStorage.setItem('hlf-box', JSON.stringify(box)); } catch (_) {} };

  const fly = (fromEl, id) => {
    const target = $('[data-box-count]');
    if (!fromEl || !target || reduce) return;
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const d = document.createElement('div'); d.className = 'fly';
    d.innerHTML = `<img src="${img(id)}" alt="">`;
    d.style.left = a.left + a.width / 2 - 27 + 'px'; d.style.top = a.top + a.height / 2 - 27 + 'px';
    document.body.append(d);
    requestAnimationFrame(() => {
      d.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px,${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.25)`;
      d.style.opacity = '.4';
    });
    setTimeout(() => d.remove(), 850);
  };

  const toggleItem = (id, srcEl) => {
    const i = box.indexOf(id);
    if (i > -1) { box.splice(i, 1); toast(`Removed <b>${byId[id].name}</b>`); }
    else {
      if (box.length >= MAX) { toast(`Your box holds <b>5 items</b>. Remove one to swap.`); openBox(); return; }
      box.push(id); fly(srcEl, id);
      toast(`<b>${byId[id].name}</b> added · ${box.length}/${MAX}`);
    }
    save(); renderBox();
  };

  const renderBox = () => {
    $$('[data-box-count]').forEach(c => { c.textContent = box.length; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
    // drawer slots
    $('[data-slots]').innerHTML = Array.from({ length: MAX }, (_, i) => {
      const id = box[i];
      return id
        ? `<div class="slot is-full"><img src="${img(id)}" alt="${byId[id].name}"><span class="slot__name">${byId[id].name}</span><button type="button" data-remove="${id}" aria-label="Remove ${byId[id].name}">×</button></div>`
        : `<div class="slot">${i + 1}</div>`;
    }).join('');
    $('[data-mini-slots]').innerHTML = Array.from({ length: MAX }, (_, i) =>
      box[i] ? `<div class="mini-slot is-full"><img src="${img(box[i])}" alt=""></div>` : `<div class="mini-slot">+</div>`).join('');
    $('[data-box-hint]').innerHTML = box.length ? `${box.length} of ${MAX} picked. ${box.length < MAX ? 'Room for ' + (MAX - box.length) + ' more.' : 'Your box is full!'}` : 'Add items from the catalog with <b>+ Sample</b>.';
    $('[data-box-submit]').disabled = !box.length;
    $$('.card__add').forEach(b => {
      const on = box.includes(b.dataset.add);
      b.classList.toggle('is-on', on); b.textContent = on ? '✓ In box' : '+ Sample';
      b.setAttribute('aria-pressed', on);
    });
    const picks = $('[data-form-picks]');
    picks.hidden = !box.length;
    picks.innerHTML = box.map(id => `<span>${byId[id].name}</span>`).join('');
  };

  const drawer = $('.drawer');
  let lastFocus;
  function openBox() {
    lastFocus = document.activeElement;
    $('[data-box-done]').hidden = true; $('[data-box-form]').hidden = false;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(() => $('.drawer__x', drawer).focus(), 300);
  }
  const closeBox = () => {
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked'); lastFocus && lastFocus.focus();
  };
  $$('[data-open-box]').forEach(b => b.addEventListener('click', openBox));
  drawer.addEventListener('click', e => {
    if (e.target.closest('[data-close-box]')) closeBox();
    const rm = e.target.closest('[data-remove]'); if (rm) toggleItem(rm.dataset.remove);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { drawer.classList.contains('is-open') && closeBox(); document.body.classList.contains('menu-open') && toggleMenu(false); } });

  const mailto = (subject, lines) => {
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`;
  };
  $('[data-box-form]').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    mailto(`Sample box request: ${f.get('company')}`, [
      'Hi HyperLocal Farms team,', '', 'I would like to request a free sample box with:',
      ...box.map((id, i) => `  ${i + 1}. ${byId[id].name} (${byId[id].size})`), '',
      `Name: ${f.get('name')}`, `Restaurant: ${f.get('company')}`, `Email: ${f.get('email')}`, `City: ${f.get('city')}`,
      f.get('message') && `We cook: ${f.get('message')}`, '', 'Thank you!'
    ]);
    e.target.hidden = true; $('[data-box-done]').hidden = false;
  });

  /* ---------- Catalog ---------- */
  const grid = $('[data-grid]');
  const state = { cat: 'all', tag: 'all', q: '' };
  const counts = PRODUCTS.reduce((m, p) => (m[p.cat] = (m[p.cat] || 0) + 1, m), { all: PRODUCTS.length });
  $$('[data-n]').forEach(s => (s.textContent = counts[s.dataset.n] || ''));

  const renderGrid = () => {
    const q = state.q.trim().toLowerCase();
    const list = PRODUCTS.filter(p =>
      (state.cat === 'all' || p.cat === state.cat) &&
      (state.tag === 'all' || p.tags.includes(state.tag)) &&
      (!q || (p.name + ' ' + p.flavor + ' ' + p.desc).toLowerCase().includes(q)));
    grid.innerHTML = list.map((p, i) => `
      <article class="card" style="animation-delay:${Math.min(i, 12) * 0.035}s">
        <div class="card__img">
          <img src="${img(p.id)}" alt="${p.name}" loading="lazy" width="600" height="600">
          <span class="card__size">${p.size}</span>
        </div>
        <div class="card__desc" aria-hidden="true">${p.desc}</div>
        <button class="card__add" data-add="${p.id}" aria-label="Add ${p.name} to sample box">+ Sample</button>
        <div class="card__body">
          <span class="card__cat">${CAT[p.cat]}</span>
          <h3>${p.name}</h3>
          <p class="card__flavor">${p.flavor}</p>
        </div>
      </article>`).join('');
    $('[data-empty]').hidden = !!list.length;
    renderBox();
  };
  $$('[data-filter-group]').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', g).forEach(c => c.classList.toggle('is-on', c === b));
    state[g.dataset.filterGroup] = b.dataset.val; renderGrid();
  }));
  let qT; $('[data-search]').addEventListener('input', e => { clearTimeout(qT); qT = setTimeout(() => { state.q = e.target.value; renderGrid(); }, 120); });
  grid.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (b) toggleItem(b.dataset.add, b); });
  $$('[data-jump-cat]').forEach(a => a.addEventListener('click', () => {
    const b = $(`[data-filter-group="cat"] .chip[data-val="${a.dataset.jumpCat}"]`); b && b.click();
  }));
  renderGrid();

  /* ---------- Recipes ---------- */
  const RECIPES = [
    { id: 'snapper', img: 'snapper', meta: 'Main course · 25 min', title: 'Seared Snapper with Citrus Butter, Micro Cilantro & Nasturtium',
      intro: 'A Florida fish, a quick pan sauce and a bright pile of micro cilantro that does the work a sprig of parsley never could. The nasturtium flowers add a peppery finish and a hit of orange.',
      ing: ['4 snapper fillets, skin on (6 oz each)', '2 tbsp olive oil', '3 tbsp cold butter, cubed', 'Juice and zest of 1 orange', 'Juice of half a lemon', '1 small shallot, minced', '1 oz HyperLocal Micro Cilantro', '8 HyperLocal Nasturtium Flowers', 'Flaky salt'],
      steps: ['Pat the fillets dry and season both sides. Heat the oil in a heavy skillet over medium-high until it shimmers.', 'Lay the fish skin side down, press gently for 20 seconds and cook 4 minutes without moving it until the skin is crisp. Flip and cook 1 minute more. Rest on a warm plate.', 'Lower the heat, add the shallot and cook 30 seconds. Add the orange and lemon juice and reduce by half. Swirl in the cold butter a cube at a time until glossy. Add the zest.', 'Spoon the sauce onto warm plates, set the fish on top and finish with a generous pile of micro cilantro, two nasturtium flowers per plate and flaky salt.'],
      products: ['micro-cilantro', 'nasturtium-flower'] },
    { id: 'burrata', img: 'burrata', meta: 'Starter · 10 min', title: 'Burrata with Pea Tendrils, Sunflower Shoots & Pistachio',
      intro: 'No cooking, five minutes of plating, and the shoots carry it. Pea tendrils bring sweetness and curl, sunflower shoots bring crunch; together they turn a cheese plate into a salad course.',
      ing: ['2 balls burrata (4 oz each)', '2 oz HyperLocal Pea Tendrils', '1 oz HyperLocal Sunflower Shoots', '3 tbsp good olive oil', '2 tbsp pistachios, crushed', 'Zest of 1 lemon', '1 tsp honey', 'Flaky salt and cracked pepper'],
      steps: ['Take the burrata out of the fridge 20 minutes before serving so it is creamy at the center.', 'Toss the pea tendrils and sunflower shoots with 1 tablespoon of the olive oil and a pinch of salt.', 'Set each burrata on a plate, tear the top open slightly and drizzle with the remaining oil and the honey.', 'Pile the dressed shoots over and around the cheese. Finish with pistachio, lemon zest, salt and pepper. Serve with grilled bread.'],
      products: ['pea-tendrils', 'sunflower-shoots'] },
    { id: 'pannacotta', img: 'pannacotta', meta: 'Dessert · 20 min + 4 hr set', title: 'Honey Panna Cotta with Violas, Pansies & Rose Petals',
      intro: 'The classic pastry use for edible flowers: a pale, simple dessert that lets the color do the talking. Violas and pansies hold their shape on cold surfaces, so set them just before service.',
      ing: ['2 cups heavy cream', '1 cup whole milk', '1/3 cup honey, plus more to finish', '1 vanilla bean, split', '2 1/4 tsp powdered gelatin', '3 tbsp cold water', '12 HyperLocal Violas', '6 HyperLocal Pansies', '1 tbsp HyperLocal Rose Petal Mix'],
      steps: ['Sprinkle the gelatin over the cold water and let it bloom 5 minutes.', 'Warm the cream, milk, honey and vanilla bean over medium heat until steaming. Do not boil. Remove from heat, scrape in the vanilla seeds and stir in the gelatin until dissolved.', 'Strain into six shallow bowls or ramekins and chill at least 4 hours until set.', 'Just before serving, spoon a thin layer of honey over each panna cotta and arrange violas, pansies and a few rose petals on top.'],
      products: ['violas', 'pansies', 'rose-petal-mix'] },
    { id: 'tempura', img: 'tempura', meta: 'Starter · 30 min', title: 'Ricotta-Stuffed Squash Blossom Tempura with Shiso',
      intro: 'Squash blossoms are fragile and worth the trouble. A light tempura batter keeps them delicate, and whole shiso leaves fried alongside turn glassy and crisp.',
      ing: ['12 HyperLocal Squash Blossoms', '8 HyperLocal Shiso Leaves', '1 cup whole-milk ricotta', '1/4 cup grated parmesan', 'Zest of 1 lemon, plus wedges to serve', '1 cup all-purpose flour', '1 cup ice-cold sparkling water', 'Neutral oil for frying', 'Flaky salt'],
      steps: ['Mix the ricotta, parmesan, lemon zest and a pinch of salt. Gently open each blossom, remove the stamen and pipe or spoon in a tablespoon of filling. Twist the petals closed.', 'Heat 2 inches of oil to 350°F. Whisk the flour and sparkling water together loosely; lumps are fine.', 'Dip the blossoms in batter, letting the excess run off, and fry in batches 2 to 3 minutes until pale gold. Drain on a rack and salt immediately.', 'Dip the shiso leaves in batter on one side only and fry 30 seconds until crisp. Plate the blossoms with the shiso leaves and lemon wedges.'],
      products: ['squash-blossoms', 'shiso-leaf'] },
    { id: 'gimlet', img: 'gimlet', meta: 'Cocktail · 5 min', title: 'Garden Gimlet with Purple Orchid & Hype Mix',
      intro: 'Bar programs are the fastest-growing use for our flowers. The orchid floats, the gold-flecked Hype Mix sits on the foam, and the drink photographs itself.',
      ing: ['2 oz gin', '3/4 oz fresh lime juice', '3/4 oz simple syrup', '1/2 oz cucumber juice', '1 HyperLocal Purple Orchid', 'A pinch of HyperLocal Hype Mix'],
      steps: ['Chill a coupe glass.', 'Shake the gin, lime juice, simple syrup and cucumber juice hard with ice for 12 seconds.', 'Double strain into the coupe.', 'Float the orchid on the surface and finish with a pinch of Hype Mix so the gold flakes catch the light.'],
      products: ['purple-orchids', 'hype-mix'] }
  ];
  const rail = $('[data-rail]');
  rail.innerHTML = RECIPES.map(r => `
    <button class="rcard" data-recipe="${r.id}" aria-label="Open recipe: ${r.title}">
      <div class="rcard__img"><img src="assets/img/${r.img}.webp" alt="" loading="lazy" draggable="false"></div>
      <div class="rcard__body"><span class="rcard__meta">${r.meta}</span><h3>${r.title}</h3><span class="rcard__go">View recipe →</span></div>
    </button>`).join('');

  // drag-to-scroll + progress
  let down = false, sx = 0, sl = 0, moved = false;
  rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
  addEventListener('pointerup', () => { down = false; rail.classList.remove('is-drag'); });
  rail.addEventListener('pointermove', e => {
    if (!down) return; const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-drag'); }
    rail.scrollLeft = sl - dx;
  });
  const bar = $('[data-rail-bar]');
  const onRail = () => {
    const max = rail.scrollWidth - rail.clientWidth, w = rail.clientWidth / rail.scrollWidth;
    bar.style.width = w * 100 + '%';
    bar.style.transform = `translateX(${max ? (rail.scrollLeft / max) * ((1 - w) / w) * 100 : 0}%)`;
  };
  rail.addEventListener('scroll', onRail, { passive: true }); addEventListener('resize', onRail); setTimeout(onRail, 300);
  const step = () => (rail.firstElementChild?.offsetWidth || 400) + 24;
  $('[data-rail-prev]').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('[data-rail-next]').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));

  const modal = $('[data-recipe-modal]');
  rail.addEventListener('click', e => {
    const c = e.target.closest('[data-recipe]'); if (!c || moved) return;
    const r = RECIPES.find(x => x.id === c.dataset.recipe);
    $('[data-recipe-body]').innerHTML = `
      <div class="rm__img"><img src="assets/img/${r.img}.webp" alt="${r.title}"></div>
      <div class="rm__body">
        <p class="eyebrow">${r.meta}</p>
        <h2>${r.title}</h2>
        <p class="rm__intro">${r.intro}</p>
        <h4>Ingredients</h4><ul>${r.ing.map(i => `<li>${i}</li>`).join('')}</ul>
        <h4>Method</h4><ol>${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        <h4>From our catalog</h4>
        <div class="rm__picks">${r.products.filter(id => byId[id]).map(id => `<span>${byId[id].name} · ${byId[id].size}</span>`).join('')}</div>
        <button class="btn btn--green" data-add-recipe="${r.id}">Add these to my sample box <span class="arr">→</span></button>
      </div>`;
    modal.showModal(); document.body.classList.add('is-locked');
  });
  modal.addEventListener('close', () => document.body.classList.remove('is-locked'));
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close-recipe]')) modal.close();
    const b = e.target.closest('[data-add-recipe]');
    if (b) {
      const r = RECIPES.find(x => x.id === b.dataset.addRecipe);
      let added = 0;
      r.products.forEach(id => { if (byId[id] && !box.includes(id) && box.length < MAX) { box.push(id); added++; } });
      save(); renderBox(); modal.close();
      toast(added ? `Added <b>${added}</b> item${added > 1 ? 's' : ''} to your sample box` : 'Those are already in your box');
      setTimeout(openBox, 350);
    }
  });

  /* ---------- Delivery map ---------- */
  // Coarse Florida outline (lon, lat)
  const FL = [[-87.6,31.0],[-85.0,31.0],[-85.0,30.9],[-84.86,30.71],[-83.5,30.64],[-82.2,30.57],[-82.05,30.36],[-82.0,30.79],[-81.45,30.71],[-81.38,30.25],[-81.25,29.8],[-81.1,29.4],[-80.9,29.0],[-80.6,28.6],[-80.55,28.25],[-80.45,27.85],[-80.3,27.45],[-80.15,27.1],[-80.05,26.7],[-80.05,26.3],[-80.1,25.95],[-80.15,25.7],[-80.3,25.4],[-80.45,25.2],[-80.85,25.15],[-81.1,25.3],[-81.25,25.75],[-81.7,25.9],[-81.85,26.35],[-82.05,26.6],[-82.25,26.95],[-82.55,27.35],[-82.75,27.75],[-82.7,28.15],[-82.7,28.65],[-82.75,29.0],[-83.05,29.15],[-83.4,29.6],[-83.75,29.95],[-84.1,30.08],[-84.4,29.95],[-84.85,29.75],[-85.3,29.68],[-85.4,29.95],[-85.75,30.15],[-86.2,30.38],[-86.75,30.4],[-87.3,30.3],[-87.45,30.35],[-87.4,30.6],[-87.6,30.95]];
  const CITIES = [
    { n: 'Vero Beach', ll: [-80.40, 27.64], t: 'direct', a: 'treasure', dx: 10 },
    { n: 'Port St. Lucie', ll: [-80.35, 27.27], t: 'direct', a: 'treasure', dx: 10 },
    { n: 'Stuart', ll: [-80.25, 27.20], t: 'direct', a: 'treasure', dx: 10, dy: 10 },
    { n: 'Jupiter', ll: [-80.09, 26.93], t: 'direct', a: 'palm', dx: 10 },
    { n: 'West Palm Beach', ll: [-80.05, 26.71], t: 'direct', a: 'palm', dx: 10 },
    { n: 'Boca Raton', ll: [-80.08, 26.36], t: 'direct', a: 'palm', dx: 10 },
    { n: 'Fort Lauderdale', ll: [-80.14, 26.12], t: 'direct', a: 'broward', dx: 10 },
    { n: 'Miami', ll: [-80.19, 25.76], t: 'direct', a: 'miami', dx: 10 },
    { n: 'Homestead', ll: [-80.48, 25.47], t: 'direct', a: 'miami', dx: -78 },
    { n: 'Naples', ll: [-81.79, 26.14], t: 'dist', a: 'state', dx: -54 },
    { n: 'Fort Myers', ll: [-81.87, 26.64], t: 'dist', a: 'state', dx: -72 },
    { n: 'Tampa', ll: [-82.46, 27.95], t: 'dist', a: 'state', dx: -48 },
    { n: 'Orlando', ll: [-81.38, 28.54], t: 'dist', a: 'state', dx: 10 }
  ];
  const HOME = [-80.47, 27.03];
  const svg = $('[data-map]');
  const NS = 'http://www.w3.org/2000/svg';
  const bounds = { x0: -83.3, x1: -79.6, y0: 24.95, y1: 29.0 };
  const kx = Math.cos(27 * Math.PI / 180);
  const sc = Math.min(560 / ((bounds.x1 - bounds.x0) * kx), 610 / (bounds.y1 - bounds.y0));
  const ox = (600 - (bounds.x1 - bounds.x0) * kx * sc) / 2;
  const P = ([lon, lat]) => [ox + (lon - bounds.x0) * kx * sc, 15 + (bounds.y1 - lat) * sc];
  const el = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; };

  const g0 = el('g', { class: 'map__grid' });
  for (let i = 0; i <= 600; i += 40) { el('line', { x1: i, y1: 0, x2: i, y2: 640 }, g0); el('line', { x1: 0, y1: i, x2: 600, y2: i }, g0); }
  el('path', { class: 'map__land', d: 'M' + FL.map(P).map(p => p.map(n => n.toFixed(1)).join(',')).join('L') + 'Z' });
  const [hx, hy] = P(HOME);
  const routes = el('g', {});
  const cityEls = {};
  CITIES.forEach(c => {
    const [x, y] = P(c.ll);
    const mx = (hx + x) / 2 + (c.t === 'dist' ? 0 : 18), my = (hy + y) / 2 - (c.t === 'dist' ? 40 : 0);
    const path = el('path', { class: 'map__route' + (c.t === 'dist' ? ' map__route--dist' : ''), d: `M${hx},${hy} Q${mx},${my} ${x},${y}` }, routes);
    c.path = path;
  });
  CITIES.forEach(c => {
    const [x, y] = P(c.ll);
    const g = el('g', { class: 'map__city' + (c.t === 'dist' ? ' dist' : '') });
    el('circle', { cx: x, cy: y, r: 4.5 }, g);
    const t = el('text', { x: x + (c.dx || 10), y: y + 4 + (c.dy || 0) }, g); t.textContent = c.n;
    cityEls[c.n.toLowerCase()] = g; c.g = g;
  });
  // trucks traveling direct routes
  const trucks = CITIES.filter(c => c.t === 'direct' && ['Miami', 'West Palm Beach', 'Fort Lauderdale', 'Stuart', 'Boca Raton'].includes(c.n))
    .map((c, i) => ({ c, t: i / 5, dot: el('circle', { class: 'map__truck', r: 3.4 }) }));
  const home = el('g', { class: 'map__home' });
  el('circle', { class: 'pulse', cx: hx, cy: hy, r: 8 }, home);
  el('circle', { class: 'core', cx: hx, cy: hy, r: 8 }, home);
  const ht = el('text', { x: hx - 128, y: hy + 6 }, home); ht.textContent = 'INDIANTOWN';

  let mapRun = false;
  const anim = () => {
    if (!mapRun) return;
    trucks.forEach(tr => {
      tr.t = (tr.t + 0.0035) % 1;
      const L = tr.c.path.getTotalLength(), pt = tr.c.path.getPointAtLength(L * tr.t);
      tr.dot.setAttribute('cx', pt.x); tr.dot.setAttribute('cy', pt.y);
      tr.dot.setAttribute('opacity', tr.t > .92 ? (1 - tr.t) * 12 : 1);
    });
    requestAnimationFrame(anim);
  };
  new IntersectionObserver(([e]) => {
    const was = mapRun; mapRun = e.isIntersecting && !reduce;
    $$('.map__route').forEach(p => p.classList.toggle('draw', mapRun));
    if (mapRun && !was) anim();
  }).observe(svg);

  const hot = (area, cityName) => {
    $$('.areas li').forEach(li => li.classList.toggle('is-hot', li.dataset.area === area));
    CITIES.forEach(c => c.g.classList.toggle('is-hot', area ? c.a === area || c.n.toLowerCase() === cityName : false));
  };
  $$('.areas li').forEach(li => {
    li.addEventListener('mouseenter', () => hot(li.dataset.area));
    li.addEventListener('mouseleave', () => hot(null));
  });

  // City checker
  const AREA_CITIES = {
    miami: ['Miami', 'Miami Beach', 'Coral Gables', 'Doral', 'Aventura', 'Homestead', 'Hialeah', 'Miami Lakes', 'Kendall', 'Key Biscayne', 'North Miami', 'Sunny Isles Beach', 'Bal Harbour', 'Surfside', 'Pinecrest', 'Cutler Bay'],
    broward: ['Fort Lauderdale', 'Hollywood', 'Pompano Beach', 'Weston', 'Coral Springs', 'Hallandale Beach', 'Plantation', 'Davie', 'Sunrise', 'Deerfield Beach', 'Pembroke Pines', 'Miramar', 'Lauderdale-by-the-Sea'],
    palm: ['Boca Raton', 'Delray Beach', 'Boynton Beach', 'West Palm Beach', 'Palm Beach', 'Palm Beach Gardens', 'Jupiter', 'Lake Worth Beach', 'Wellington', 'Juno Beach', 'Tequesta', 'Lantana', 'Royal Palm Beach'],
    treasure: ['Stuart', 'Hobe Sound', 'Port St. Lucie', 'Vero Beach', 'Indiantown', 'Jensen Beach', 'Palm City', 'Fort Pierce', 'Sewall\'s Point', 'Okeechobee'],
    state: ['Naples', 'Fort Myers', 'Orlando', 'Tampa', 'St. Petersburg', 'Sarasota', 'Jacksonville', 'Gainesville', 'Tallahassee', 'Daytona Beach', 'Melbourne', 'Cape Coral', 'Clearwater', 'Bonita Springs', 'Key West', 'Lakeland', 'Kissimmee', 'Winter Park', 'Ocala']
  };
  const AREA_NAME = { miami: 'Miami-Dade', broward: 'Broward', palm: 'Palm Beach', treasure: 'Treasure Coast', state: 'statewide' };
  const lookup = {};
  Object.entries(AREA_CITIES).forEach(([a, list]) => list.forEach(c => (lookup[c.toLowerCase()] = a)));
  $('#cities').innerHTML = Object.values(AREA_CITIES).flat().sort().map(c => `<option value="${c}">`).join('');
  $('[data-checker]').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#city').value.trim(), k = v.toLowerCase().replace(/^st\s/, 'st. ');
    const out = $('[data-checker-out]'), a = lookup[k];
    out.className = 'checker__out';
    if (!v) return;
    if (a && a !== 'state') { out.classList.add('ok'); out.textContent = `✓ Yes! ${v} is on our daily direct routes (${AREA_NAME[a]}).`; }
    else if (a === 'state') { out.classList.add('dist'); out.textContent = `✓ We reach ${v} through our foodservice distribution partners. Ask your distributor for HyperLocal Farms by name.`; }
    else { out.classList.add('ask'); out.innerHTML = `We may still reach ${v.replace(/</g, '')}. <a href="#contact">Ask us</a> and we'll confirm your route.`; }
    hot(a || null, k);
  });

  /* ---------- Tour stepper ---------- */
  let guests = 4;
  const setGuests = n => {
    guests = Math.max(1, Math.min(10, n));
    $('[data-guests]').textContent = guests;
    $('[data-tour-total]').textContent = '$' + guests * 25;
  };
  $('[data-stepper]').addEventListener('click', e => { const b = e.target.closest('[data-step]'); b && setGuests(guests + +b.dataset.step); });
  $('[data-tour-link]').addEventListener('click', () => {
    setTopic('Farm Tour');
    const m = $('[data-contact-form] textarea'); m.value = `We'd like to book a farm tour for ${guests} guest${guests > 1 ? 's' : ''} ($${guests * 25}). Preferred dates: `;
  });

  /* ---------- FAQ tabs ---------- */
  const faqGroup = g => {
    $$('[data-faq]').forEach(b => { const on = b.dataset.faq === g; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    let first = true;
    $$('[data-faq-group]').forEach(d => { const on = d.dataset.faqGroup === g; d.hidden = !on; d.open = on && first; if (on) first = false; });
  };
  $$('[data-faq]').forEach(b => b.addEventListener('click', () => faqGroup(b.dataset.faq)));
  faqGroup('chefs');

  /* ---------- Contact form ---------- */
  function setTopic(t) { const r = $(`[data-contact-form] input[name="topic"][value="${t}"]`); if (r) r.checked = true; }
  $$('[data-topic]').forEach(a => a.addEventListener('click', () => setTopic(a.dataset.topic)));
  $('[data-contact-form]').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target), topic = f.get('topic');
    mailto(`${topic}: ${f.get('company') || f.get('name')}`, [
      'Hi HyperLocal Farms team,', '', f.get('message'), '',
      topic === 'Sample Box' && box.length && 'Sample box picks:\n' + box.map((id, i) => `  ${i + 1}. ${byId[id].name} (${byId[id].size})`).join('\n'), '',
      `Name: ${f.get('name')}`, f.get('company') && `Restaurant / company: ${f.get('company')}`, `Email: ${f.get('email')}`,
      f.get('phone') && `Phone: ${f.get('phone')}`, f.get('city') && `City: ${f.get('city')}`, `How we buy: ${f.get('buy')}`
    ]);
    toast('Opening your email app…');
  });

  renderBox();
})();

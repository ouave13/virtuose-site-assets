/* VIRTUOSE — Animations (GSAP + Lenis + SplitType)
   Fichier auto-suffisant : charge les librairies puis lance les animations.
   Utilisation : <script src="...jsdelivr...virtuose-animations.js"> via un
   Custom Element (tag script) dans le Designer Webflow. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var LIBS = [
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js',
    'https://cdn.jsdelivr.net/npm/split-type@0.3.4/umd/index.min.js'
  ];

  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }


  /* ===== PAGE V2 (home-v2) ===== */
  function initV2() {
    // Polices en secours (au cas ou Webflow ne les applique pas)
    var fl = document.createElement('link');
    fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(fl);

    var css = document.createElement('style');
    css.textContent = [
      /* Familles de polices */
      '.v2-hero-title, .v2-about-statement, .v2-work-title, .v2-work-client, .v2-club-title, .v2-contact-title, .v2-contact-mail, .v2-marquee-text, .v2-stat-num, .v2-service-title { font-family: Anton, Impact, sans-serif !important; }',
      '.v2-nav-mail, .v2-nav-cta, .v2-hero-overline, .v2-hero-sub, .v2-hero-cta, .v2-overline-dark, .v2-overline-light, .v2-overline-accent, .v2-about-p, .v2-stat-label, .v2-service-num, .v2-service-desc, .v2-work-tags, .v2-club-p, .v2-club-cta, .v2-label, .v2-input, .v2-submit, .v2-contact-label, .v2-contact-btn, .v2-social, .v2-footer-copy, .v2-footer-link { font-family: Inter, sans-serif !important; }',
      /* Effets hover impossibles a poser via le builder */
      '.v2-work-card:hover .v2-work-img { transform: scale(1.05); }',
      '.v2-client-cell:hover .v2-client-logo { filter: grayscale(0); opacity: 1; }',
      '.v2-hero-cta:hover, .v2-club-cta:hover, .v2-submit:hover { transform: scale(1.05); }',
      '.v2-contact-btn:hover { background-color: #efede6; color: #0f0f0f; }',
      '.v2-social:hover, .v2-footer-link:hover { color: #dcfc59; }',
      '.v2-nav-cta:hover { background-color: #ffffff; color: #0f0f0f; }',
      'html { scroll-behavior: smooth; }',
      'body { margin: 0; }'
    ].join('\n');
    document.head.appendChild(css);

    initV2();
    if (!window.gsap || !window.ScrollTrigger) return;

    // Marquee defilant infini
    var track = document.querySelector('.v2-marquee-track');
    if (track) {
      var text = track.querySelector('.v2-marquee-text');
      if (text) {
        var clone = text.cloneNode(true);
        track.appendChild(clone);
        gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
      }
    }

    // Titres : apparition en decoupage de lignes
    if (window.SplitType) {
      document.querySelectorAll('.v2-hero-title, .v2-about-statement, .v2-work-title, .v2-club-title, .v2-contact-title').forEach(function (el) {
        var split = new SplitType(el, { types: 'lines' });
        gsap.set(el, { visibility: 'visible' });
        split.lines.forEach(function (line) {
          var wrap = document.createElement('div');
          wrap.style.overflow = 'hidden';
          line.parentNode.insertBefore(wrap, line);
          wrap.appendChild(line);
        });
        gsap.from(split.lines, {
          yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
      });
    }

    // Cartes, images et blocs : fondu + remontee
    gsap.utils.toArray('.v2-work-card, .v2-about-img, .v2-club-img, .v2-stat, .v2-service-row, .v2-client-cell').forEach(function (el, i) {
      gsap.from(el, {
        autoAlpha: 0, y: 40, duration: 0.9, ease: 'power3.out', delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: el, start: 'top 92%' }
      });
    });

    // Hero : leger zoom video au scroll
    var hv = document.querySelector('.v2-hero-video');
    if (hv) {
      gsap.to(hv, {
        scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: '.v2-hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }

  function init() {
    // Correctifs CSS : footer du template (textes geants dans colonnes etroites)
    // et empilement de la section contact au-dessus de la photo d'equipe
    var fix = document.createElement('style');
    fix.textContent = [
      '.footer-main .display-1 { font-size: clamp(2rem, 3.2vw, 3.2rem) !important; line-height: 1.05 !important; }',
      '.footer-main .nav-text { font-size: clamp(0.95rem, 1.2vw, 1.15rem) !important; line-height: 1.4 !important; white-space: nowrap; }',
      '.footer-main .navigation-link { height: auto !important; min-height: 0 !important; }',
      '.contact-section { position: relative; z-index: 2; }'
    ].join('\n');
    document.head.appendChild(fix);

    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Smooth scroll (Lenis)
    var lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // 2. Ancres douces (ex : CTA -> #contact)
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          if (lenis) { lenis.scrollTo(id, { offset: -40 }); }
          else { document.querySelector(id).scrollIntoView({ behavior: 'smooth' }); }
        }
      });
    });

    // 3. Typo cinétique : titres révélés ligne par ligne
    if (window.SplitType) {
      document.querySelectorAll('.top-hero h1, .page-content h2, .page-content h3, .contact-section h2, .contact-section h3').forEach(function (el) {
        if (el.closest('.w-richtext') || el.closest('.footer-main')) return;
        var split = new SplitType(el, { types: 'lines', lineClass: 'anim-line' });
        if (!split.lines || !split.lines.length) return;
        split.lines.forEach(function (l) {
          var w = document.createElement('div');
          w.style.overflow = 'hidden';
          l.parentNode.insertBefore(w, l);
          w.appendChild(l);
        });
        gsap.from(split.lines, {
          yPercent: 110, duration: 0.9, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });
    }

    // 4. Reveal doux des paragraphes et blocs contact
    gsap.utils.toArray('.page-content p, .contact-section p, .contact-field, .contact-calendly, .contact-infos').forEach(function (el) {
      if (el.closest('.w-richtext') || el.closest('.footer-main')) return;
      gsap.from(el, {
        y: 32, autoAlpha: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });

    // 5. Parallaxe subtile sur les photos de projets
    gsap.utils.toArray('.w-dyn-item img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // 6. Zoom lent de la vidéo hero au scroll
    var hv = document.querySelector('.hero-video');
    if (hv) {
      gsap.to(hv, {
        scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: hv, start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    ScrollTrigger.refresh();
  }

  function start() {
    LIBS.reduce(function (p, src) {
      return p.then(function () { return load(src); });
    }, Promise.resolve()).then(init).catch(function () { /* silencieux */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

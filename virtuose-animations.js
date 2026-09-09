/* VIRTUOSE — Animations (GSAP + Lenis + SplitType)
   Fichier auto-suffisant : charge les librairies puis lance les animations.
   Utilisation : <script src="...jsdelivr...virtuose-animations.js"> via un
   Custom Element (tag script) dans le Designer Webflow. */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function forcePlay(v) {
    if (!v) return;
    try {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.autoplay = true;
      v.loop = true;
      v.preload = 'auto';
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('autoplay', '');
      v.volume = 0;
    } catch (e) {}
    function go() {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    go();
    v.addEventListener('canplay', go);
    v.addEventListener('loadeddata', go);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && v.paused) go();
    });
    ['touchstart', 'click', 'scroll'].forEach(function (ev) {
      document.addEventListener(ev, go, { once: true, passive: true });
    });
  }

  function sliceHero(video) {
    if (!video || REDUCE) return;
    var n = 15;
    var gap = 0.55;
    var colW = (100 - gap * (n - 1)) / n;
    var drops = [3, 18, 7, 24, 5, 16, 11, 22, 4, 19, 8, 14, 6, 21, 10];
    var rects = [];
    for (var i = 0; i < n; i++) {
      var x = i * (colW + gap);
      var h = 100 - drops[i];
      rects.push('<rect x="' + x.toFixed(2) + '" y="0" width="' + colW.toFixed(2) + '" height="' + h + '" rx="0.15"/>');
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + rects.join('') + '</svg>';
    var uri = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
    video.style.webkitMaskImage = uri;
    video.style.maskImage = uri;
    video.style.webkitMaskSize = '100% 100%';
    video.style.maskSize = '100% 100%';
    video.style.webkitMaskRepeat = 'no-repeat';
    video.style.maskRepeat = 'no-repeat';
  }

  function rewriteLabels() {
    var pairs = [
      ['.v2-hero-overline', '[ paris ]'],
      ['.v2-about .v2-overline-dark', '[ intro ]'],
      ['.v2-services .v2-overline-light', '[ métier ]'],
      ['.v2-work .v2-overline-dark', '[ work ]'],
      ['.v2-clients .v2-overline-dark', '[ ils nous font confiance ]'],
      ['.v2-club .v2-overline-accent', '[ club ]'],
      ['.v2-contact .v2-overline-accent', '[ contact ]']
    ];
    pairs.forEach(function (p) {
      var el = document.querySelector(p[0]);
      if (el) el.textContent = p[1];
    });
  }

  function injectV2Css() {
    if (document.getElementById('v2-cyphr-css')) return;
    var fl = document.createElement('link');
    fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(fl);

    var css = document.createElement('style');
    css.id = 'v2-cyphr-css';
    css.textContent = [
      '@keyframes v2blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }',
      'html { scroll-behavior: smooth; }',
      'body { margin: 0; background: #efede6; }',

      /* Polices */
      '.v2-hero-title, .v2-about-statement, .v2-work-title, .v2-work-client, .v2-club-title, .v2-contact-title, .v2-contact-mail, .v2-marquee-text, .v2-stat-num, .v2-service-title { font-family: Anton, Impact, sans-serif !important; }',
      '.v2-nav-mail, .v2-nav-cta, .v2-hero-sub, .v2-hero-cta, .v2-about-p, .v2-stat-label, .v2-service-desc, .v2-work-tags, .v2-club-p, .v2-club-cta, .v2-label, .v2-input, .v2-submit, .v2-contact-label, .v2-contact-btn, .v2-social, .v2-footer-copy, .v2-footer-link { font-family: Inter, sans-serif !important; }',
      '.v2-hero-overline, .v2-overline-dark, .v2-overline-light, .v2-overline-accent, .v2-service-num { font-family: "IBM Plex Mono", ui-monospace, monospace !important; letter-spacing: 0.08em !important; font-weight: 400 !important; text-transform: lowercase !important; }',

      /* Logo header */
      '.v2-nav-logo { height: 68px !important; width: auto !important; }',
      '.v2-nav { padding: 18px 36px !important; }',

      /* Hero Cyphr : fond creme, video en lamelles, titre qui chevauche */
      '.v2-hero { background: #efede6 !important; overflow: hidden !important; }',
      '.v2-hero-video { top: 0 !important; left: 2.8vw !important; right: 2.8vw !important; width: auto !important; height: 84% !important; bottom: auto !important; }',
      '.v2-hero-overlay { background: none !important; background-image: none !important; pointer-events: none !important; }',
      '.v2-hero-content { padding: 0 4.2vw 4.5vh !important; gap: 14px !important; }',
      '.v2-hero-title { color: #0f0f0f !important; max-width: 16ch !important; font-size: clamp(58px, 11vw, 176px) !important; line-height: 0.88 !important; }',
      '.v2-hero-title .v2-cursor { display: inline-block; width: 7px; height: 0.72em; background: #dcfc59; margin-left: 10px; vertical-align: -0.06em; animation: v2blink 1s steps(1) infinite; }',
      '.v2-hero-overline { color: #0f0f0f !important; font-size: 12px !important; letter-spacing: 0.14em !important; }',
      '.v2-hero-sub { color: #0f0f0f !important; max-width: 340px !important; }',
      '.v2-nav-mail { color: #0f0f0f !important; }',

      /* About : images rondes, decalees, pas une grille egale */
      '.v2-about { padding-top: 72px !important; }',
      '.v2-about-statement { max-width: 16ch; }',
      '.v2-about-grid { grid-template-columns: 0.82fr 1.2fr 0.9fr !important; gap: 28px 36px !important; align-items: start !important; }',
      '.v2-about-img { border-radius: 32px !important; }',
      '.v2-about-img-offset { margin-top: 110px !important; }',
      '.v2-about-grid > *:first-child { margin-top: 48px; }',

      /* Services : moins template */
      '.v2-service-row { grid-template-columns: 72px minmax(0,1.3fr) minmax(0,1fr) !important; padding: 40px 0 !important; align-items: end !important; }',
      '.v2-service-title { font-size: clamp(28px, 4.2vw, 64px) !important; }',

      /* Work : bento Cyphr, titres SUR l image */
      '.v2-work { padding-left: 0 !important; padding-right: 0 !important; }',
      '.v2-work-head { padding: 0 40px 28px !important; }',
      '.v2-work-title { font-size: clamp(56px, 13vw, 210px) !important; line-height: 0.82 !important; letter-spacing: -0.03em !important; overflow: hidden; white-space: nowrap; }',
      '.v2-work-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }',
      '.v2-work-card { position: relative !important; overflow: hidden; }',
      '.v2-work-card:nth-child(1) { grid-column: 1 / -1; }',
      '.v2-work-card:nth-child(1) .v2-work-imgwrap { aspect-ratio: 21 / 9 !important; border-radius: 0 !important; }',
      '.v2-work-card:nth-child(3), .v2-work-card:nth-child(5) { transform: translateY(56px); }',
      '.v2-work-imgwrap { position: relative !important; aspect-ratio: 4 / 5; border-radius: 0 !important; overflow: hidden !important; }',
      '.v2-work-imgwrap:after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.62) 100%); pointer-events: none; z-index: 1; }',
      '.v2-work-img { transition: transform 0.8s cubic-bezier(.22,1,.36,1); }',
      '.v2-work-card:hover .v2-work-img { transform: scale(1.07); }',
      '.v2-work-meta { position: absolute !important; left: 22px; right: 22px; bottom: 20px; z-index: 2; display: flex !important; justify-content: space-between; align-items: flex-end; gap: 12px; margin: 0 !important; }',
      '.v2-work-client { color: #fff !important; font-size: clamp(26px, 3.4vw, 52px) !important; line-height: 0.9 !important; }',
      '.v2-work-tags { color: rgba(255,255,255,0.78) !important; font-size: 11px !important; letter-spacing: 0.12em !important; text-transform: uppercase; }',

      /* Clients : logos beaucoup plus grands, plus d air */
      '.v2-clients { background: #0f0f0f !important; padding: 88px 4vw 120px !important; }',
      '.v2-clients .v2-overline-dark { color: #efede6 !important; margin-bottom: 40px !important; }',
      '.v2-clients-grid { border: 0 !important; margin-top: 12px !important; display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 28px 48px !important; }',
      '.v2-client-cell { aspect-ratio: auto !important; min-height: 140px !important; padding: 28px 16px !important; border: 0 !important; }',
      '.v2-client-logo { max-height: 108px !important; max-width: 88% !important; height: auto !important; width: auto !important; filter: none !important; opacity: 0.92 !important; }',
      '.v2-client-cell:hover .v2-client-logo { opacity: 1 !important; transform: scale(1.06); }',

      /* Club : image qui depasse */
      '.v2-club-img { border-radius: 28px !important; }',

      /* Hover misc */
      '.v2-hero-cta:hover, .v2-club-cta:hover, .v2-submit:hover { transform: scale(1.04); }',
      '.v2-contact-btn:hover { background-color: #efede6; color: #0f0f0f; }',
      '.v2-social:hover, .v2-footer-link:hover { color: #dcfc59; }',
      '.v2-nav-cta:hover { background-color: #0f0f0f; color: #efede6; }',

      /* Mobile */
      '@media (max-width: 767px) {',
      '  .v2-nav { padding: 14px 18px !important; }',
      '  .v2-nav-logo { height: 48px !important; }',
      '  .v2-nav-mail { display: none; }',
      '  .v2-hero-video { left: 3.5vw !important; right: 3.5vw !important; height: 72% !important; }',
      '  .v2-hero-content, .v2-about, .v2-services, .v2-clients, .v2-club, .v2-contact, .v2-footer { padding-left: 20px !important; padding-right: 20px !important; }',
      '  .v2-work-head { padding-left: 20px !important; padding-right: 20px !important; }',
      '  .v2-work-title { white-space: normal; font-size: clamp(42px, 16vw, 72px) !important; }',
      '  .v2-work-grid { grid-template-columns: 1fr !important; }',
      '  .v2-work-card:nth-child(1) { grid-column: auto; }',
      '  .v2-work-card:nth-child(1) .v2-work-imgwrap { aspect-ratio: 4 / 5 !important; }',
      '  .v2-work-card:nth-child(3), .v2-work-card:nth-child(5) { transform: none; }',
      '  .v2-about-grid { grid-template-columns: 1fr !important; }',
      '  .v2-about-img-offset, .v2-about-grid > *:first-child { margin-top: 0 !important; }',
      '  .v2-service-row { grid-template-columns: 1fr !important; gap: 10px !important; padding: 28px 0 !important; }',
      '  .v2-clients-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }',
      '  .v2-client-logo { max-height: 84px !important; }',
      '  .v2-client-cell { min-height: 110px !important; }',
      '  .v2-hero-bottom { flex-direction: column; align-items: flex-start; }',
      '}'
    ].join('\n');
    document.head.appendChild(css);
  }

  function bootV2Chrome() {
    if (!document.querySelector('.v2-hero')) return;
    injectV2Css();
    rewriteLabels();
    var video = document.querySelector('.v2-hero-video');
    if (video && video.tagName !== 'VIDEO') {
      video = video.querySelector('video') || video;
    }
    forcePlay(video);
    sliceHero(video);
    var title = document.querySelector('.v2-hero-title');
    if (title && !title.querySelector('.v2-cursor')) {
      var cur = document.createElement('span');
      cur.className = 'v2-cursor';
      cur.setAttribute('aria-hidden', 'true');
      title.appendChild(cur);
    }
  }

  function initV2Motion() {
    if (!window.gsap || !window.ScrollTrigger || REDUCE) return;
    gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis) {
      var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href');
          if (id.length > 1 && document.querySelector(id)) {
            e.preventDefault();
            lenis.scrollTo(id, { offset: -40 });
          }
        });
      });
    }

    var track = document.querySelector('.v2-marquee-track');
    if (track) {
      var text = track.querySelector('.v2-marquee-text');
      if (text) {
        track.appendChild(text.cloneNode(true));
        gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
      }
    }

    if (window.SplitType) {
      document.querySelectorAll('.v2-about-statement, .v2-work-title, .v2-club-title, .v2-contact-title').forEach(function (el) {
        var split = new SplitType(el, { types: 'lines' });
        gsap.set(el, { visibility: 'visible' });
        split.lines.forEach(function (line) {
          var wrap = document.createElement('div');
          wrap.style.overflow = 'hidden';
          line.parentNode.insertBefore(wrap, line);
          wrap.appendChild(line);
        });
        gsap.from(split.lines, {
          yPercent: 110, duration: 1.15, stagger: 0.08, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
      });
      var ht = document.querySelector('.v2-hero-title');
      if (ht) {
        gsap.from(ht, { y: 40, autoAlpha: 0, duration: 1.1, ease: 'power4.out', delay: 0.15 });
      }
    }

    gsap.utils.toArray('.v2-about-img, .v2-club-img, .v2-stat, .v2-service-row').forEach(function (el, i) {
      gsap.from(el, {
        autoAlpha: 0, y: 48, duration: 1, ease: 'power3.out', delay: (i % 3) * 0.06,
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });
    gsap.utils.toArray('.v2-work-card, .v2-client-cell').forEach(function (el) {
      gsap.from(el, {
        autoAlpha: 0, y: 28, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%' }
      });
    });

    var hv = document.querySelector('.v2-hero-video');
    if (hv) {
      gsap.to(hv, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '.v2-hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    ScrollTrigger.refresh();
  }

  /* ===== PAGE V1 (template Soraya) ===== */
  function initV1() {
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

    var lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

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

    gsap.utils.toArray('.page-content p, .contact-section p, .contact-field, .contact-calendly, .contact-infos').forEach(function (el) {
      if (el.closest('.w-richtext') || el.closest('.footer-main')) return;
      gsap.from(el, {
        y: 32, autoAlpha: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });

    gsap.utils.toArray('.w-dyn-item img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    var hv = document.querySelector('.hero-video');
    if (hv) {
      forcePlay(hv);
      gsap.to(hv, {
        scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: hv, start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    ScrollTrigger.refresh();
  }

  function init() {
    if (document.querySelector('.v2-hero')) {
      bootV2Chrome();
      initV2Motion();
      return;
    }
    initV1();
  }

  function start() {
    bootV2Chrome();
    if (REDUCE) return;
    LIBS.reduce(function (p, src) {
      return p.then(function () { return load(src); });
    }, Promise.resolve()).then(init).catch(function () {
      bootV2Chrome();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

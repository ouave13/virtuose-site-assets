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

  function init() {
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

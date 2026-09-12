/* Preview locale — loader couleur, autoplay, révélations. */
(function () {
  try {
    sessionStorage.removeItem('virtuoseSeen');
    sessionStorage.removeItem('virtuoseSkipOnce');
  } catch (e) {}

  document.documentElement.classList.add('skip-intro');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var video = document.querySelector('.hero-video');
  var loader = document.getElementById('loader');
  var started = Date.now();
  var videoReady = !video;
  var hidden = false;
  var skipIntro = true;

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    if (!loader) return;
    if (reduce || skipIntro) {
      loader.remove();
      return;
    }
    loader.classList.add('is-out');
    setTimeout(function () {
      if (loader && loader.parentNode) loader.remove();
    }, 950);
  }

  function maybeHide() {
    var elapsed = Date.now() - started;
    if (elapsed < 2100) {
      setTimeout(maybeHide, 2100 - elapsed);
      return;
    }
    if (!videoReady && elapsed < 4800) return;
    hideLoader();
  }

  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.volume = 0;

    function play() {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
    play();
    video.addEventListener('canplay', function () {
      videoReady = true;
      play();
      maybeHide();
    });
    video.addEventListener('loadeddata', function () {
      videoReady = true;
      play();
      maybeHide();
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && video.paused) play();
    });
    ['touchstart', 'click'].forEach(function (ev) {
      document.addEventListener(ev, play, { once: true, passive: true });
    });

    if (!reduce) {
      var n = 15;
      var gap = 0.22;
      var colW = (100 - gap * (n - 1)) / n;
      var drops = [4, 16, 7, 22, 5, 14, 10, 20, 6, 18, 8, 13, 5, 19, 9];
      var rects = [];
      for (var i = 0; i < n; i++) {
        var x = i * (colW + gap);
        rects.push('<rect x="' + x.toFixed(2) + '" y="0" width="' + colW.toFixed(2) + '" height="' + (100 - drops[i]) + '" rx="0.12"/>');
      }
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + rects.join('') + '</svg>';
      var uri = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
      video.style.webkitMaskImage = uri;
      video.style.maskImage = uri;
      video.style.webkitMaskSize = '100% 100%';
      video.style.maskSize = '100% 100%';
      video.style.webkitMaskRepeat = 'no-repeat';
    }
  }

  hideLoader();

  document.querySelectorAll('a.footer-social[href="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  function restartNavTint() {
    var logos = document.querySelectorAll('.nav-logo img, .footer-logo img');
    logos.forEach(function (img) { img.style.animation = 'none'; });
    if (logos[0]) logos[0].offsetWidth;
    logos.forEach(function (img) { img.style.animation = ''; });
  }
  restartNavTint();
  window.addEventListener('pageshow', restartNavTint);

  var menuBtn = document.querySelector('.nav-menu');
  var menu = document.getElementById('siteMenu');
  var scrollLockY = 0;

  function setMenu(open) {
    if (open) {
      scrollLockY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollLockY + 'px';
      document.body.style.width = '100%';
    } else if (document.body.classList.contains('is-menu-open')) {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollLockY);
    }
    document.body.classList.toggle('is-menu-open', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'Fermer' : 'Menu';
    }
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  var callSticky = document.querySelector('.call-sticky');
  var heroEl = document.querySelector('.hero');
  var footerEl = document.querySelector('.footer');
  var clubCta = document.querySelector('.club-cta');
  function syncSticky() {
    if (!callSticky) return;
    var show = true;
    if (heroEl) show = heroEl.getBoundingClientRect().bottom < 96;
    if (footerEl && footerEl.getBoundingClientRect().top < window.innerHeight - 72) show = false;
    if (clubCta) {
      var cr = clubCta.getBoundingClientRect();
      if (cr.top < window.innerHeight - 20 && cr.bottom > window.innerHeight - 96) show = false;
    }
    callSticky.classList.toggle('is-on', show);
  }
  syncSticky();
  window.addEventListener('scroll', syncSticky, { passive: true });
  window.addEventListener('resize', syncSticky);

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('is-menu-open'));
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  document.querySelectorAll('a.nav-logo, a.footer-logo').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (/\/projets\//.test(location.pathname)) return;
      e.preventDefault();
      setMenu(false);
      var html = document.documentElement;
      var prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      html.style.scrollBehavior = prev;
      if (location.hash && history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    });
  });

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = (document.getElementById('contactMsg') || {}).value || '';
      var mail = (document.getElementById('contactMail') || {}).value || '';
      var btn = contactForm.querySelector('.contact-go');
      var body = 'Email : ' + mail + '\n\n' + msg;
      var mailto = 'mailto:hello@agencevirtuose.fr?subject=' +
        encodeURIComponent('Nouveau projet') +
        '&body=' + encodeURIComponent(body);
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Envoi…';
      }
      fetch('https://formsubmit.co/ajax/hello@agencevirtuose.fr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: mail,
          message: msg,
          _subject: 'Nouveau projet'
        })
      }).then(function (r) { return r.json(); }).then(function () {
        contactForm.reset();
        if (btn) btn.textContent = 'C’est parti !';
      }).catch(function () {
        window.location.href = mailto;
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Ça part !';
        }
      });
    });
  }

  var workRail = document.querySelector('.work-rail');
  var workLine = document.querySelector('.work-line');
  var workTrack = document.querySelector('.work-track');
  if (workLine && workTrack && !workTrack.querySelector('.work-line[aria-hidden="true"]')) {
    var workClone = workLine.cloneNode(true);
    workClone.setAttribute('aria-hidden', 'true');
    workClone.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
    workTrack.appendChild(workClone);
  }
  if (workRail && workLine && workTrack) {
    workTrack.classList.add('is-manual');
    var workX = 0;
    var workPaused = false;
    var workHover = false;
    var workLast = performance.now();
    var workDrag = false;
    var workMoved = false;
    var workStartX = 0;
    var workStartOff = 0;
    var workLoop = 140000;

    function workWidth() {
      return workLine.getBoundingClientRect().width;
    }

    function workApply() {
      var w = workWidth();
      if (w <= 0) return;
      workX = ((workX % w) + w) % w;
      workTrack.style.transform = 'translate3d(' + (-workX) + 'px,0,0)';
    }

    function workTick(now) {
      var dt = now - workLast;
      workLast = now;
      if (!reduce && !workPaused && !workDrag) {
        var w = workWidth();
        if (w > 0) workX += (w / workLoop) * dt;
        workApply();
      }
      requestAnimationFrame(workTick);
    }

    workRail.addEventListener('mouseenter', function () {
      workHover = true;
      workPaused = true;
    });
    workRail.addEventListener('mouseleave', function () {
      workHover = false;
      if (!workDrag) {
        workPaused = false;
        workLast = performance.now();
      }
    });

    workRail.addEventListener('wheel', function (e) {
      var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!dx) return;
      e.preventDefault();
      if (e.deltaMode === 1) dx *= 16;
      if (e.deltaMode === 2) dx *= workRail.clientWidth;
      workX += dx;
      workApply();
    }, { passive: false });

    workRail.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      workDrag = true;
      workMoved = false;
      workStartX = e.clientX;
      workStartOff = workX;
    });
    workRail.addEventListener('pointermove', function (e) {
      if (!workDrag) return;
      var dx = e.clientX - workStartX;
      if (Math.abs(dx) > 8) {
        if (!workMoved) {
          workMoved = true;
          workRail.classList.add('is-dragging');
          try { workRail.setPointerCapture(e.pointerId); } catch (err) {}
        }
        workX = workStartOff - dx;
        workApply();
      }
    });
    function workEndDrag() {
      workDrag = false;
      workRail.classList.remove('is-dragging');
      if (!workHover) {
        workPaused = false;
        workLast = performance.now();
      }
    }
    workRail.addEventListener('pointerup', workEndDrag);
    workRail.addEventListener('pointercancel', workEndDrag);
    workRail.addEventListener('click', function (e) {
      if (!workMoved) return;
      e.preventDefault();
      e.stopPropagation();
    }, true);

    requestAnimationFrame(workTick);
  }

  function typeHeading(el) {
    if (el.getAttribute('data-typed') === '1') return;
    el.setAttribute('data-typed', '1');
    var full = el.getAttribute('data-text') || el.textContent.trim();
    if (reduce) {
      el.textContent = full;
      return;
    }
    var cursor = el.querySelector('.type-cursor');
    if (!cursor) {
      cursor = document.createElement('span');
      cursor.className = 'type-cursor';
      cursor.textContent = '|';
      cursor.setAttribute('aria-hidden', 'true');
    }
    var i = 0;
    function step() {
      i += 1;
      el.textContent = full.slice(0, i);
      el.appendChild(cursor);
      if (i < full.length) {
        setTimeout(step, 30 + Math.random() * 170);
        return;
      }
      el.textContent = full;
      el.removeAttribute('aria-label');
      el.appendChild(cursor);
      cursor.classList.add('is-out');
      setTimeout(function () {
        if (cursor.parentNode) cursor.remove();
      }, 500);
    }
    step();
  }

  document.querySelectorAll('[data-split]').forEach(function (el) {
    var text = el.textContent.trim();
    el.setAttribute('data-text', text);
    el.setAttribute('aria-label', text);
    if (reduce) return;
    el.textContent = '';
    var cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.textContent = '|';
    cursor.setAttribute('aria-hidden', 'true');
    el.appendChild(cursor);
  });

  var revealSel = '[data-split], [data-rise], .reveal, .club-copy, .club-shot, .club-cta, .contact-form, .contact-aside';
  var targets = document.querySelectorAll(revealSel);

  var fold = document.querySelector('.about-fold');
  if (fold) {
    var foldBtn = fold.querySelector('.about-fold-btn');
    foldBtn.addEventListener('click', function () {
      var open = fold.classList.toggle('is-open');
      foldBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  if (reduce) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('[data-split]').forEach(typeHeading);
    hideLoader();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(revealSel).forEach(function (el) {
        el.classList.add('is-in');
      });
      var self = entry.target;
      if (self.matches && self.matches(revealSel)) self.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.about, .work, .clients, .contact, .club').forEach(function (el) {
    io.observe(el);
  });

  var headingIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      typeHeading(entry.target);
      headingIo.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });

  document.querySelectorAll('[data-split]').forEach(function (el) {
    headingIo.observe(el);
  });

  var parallax = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var ticking = false;
  function shift() {
    ticking = false;
    var vh = window.innerHeight;
    parallax.forEach(function (wrap) {
      if (!wrap.classList.contains('is-in')) return;
      var rect = wrap.getBoundingClientRect();
      var p = (rect.top + rect.height / 2 - vh / 2) / vh;
      var speed = parseFloat(wrap.getAttribute('data-speed') || '0.06');
      wrap.style.transform = 'translate3d(0,' + (p * speed * 120) + 'px,0)';
    });
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(shift);
  }, { passive: true });

  var tints = ['#dbfc59', '#ff6b20', '#eac2d8', '#5946c3'];
  var mx = 0, my = 0, px = 0, py = 0, peekOn = false, following = false;
  var grid = document.querySelector('.clients-grid');
  var peek = document.getElementById('clientPeek');
  var peekImg = peek && peek.querySelector('img');
  var fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function blobPath() {
    var n = 7 + Math.floor(Math.random() * 3);
    var pts = [];
    var i;
    for (i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2 + rand(-0.14, 0.14);
      var r = rand(34, 48);
      pts.push({ x: 50 + Math.cos(ang) * r, y: 50 + Math.sin(ang) * r });
    }
    var d = 'M' + pts[0].x.toFixed(2) + ' ' + pts[0].y.toFixed(2);
    for (i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n];
      var p1 = pts[i];
      var p2 = pts[(i + 1) % n];
      var p3 = pts[(i + 2) % n];
      d += 'C'
        + (p1.x + (p2.x - p0.x) / 6).toFixed(2) + ' ' + (p1.y + (p2.y - p0.y) / 6).toFixed(2) + ' '
        + (p2.x - (p3.x - p1.x) / 6).toFixed(2) + ' ' + (p2.y - (p3.y - p1.y) / 6).toFixed(2) + ' '
        + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2);
    }
    return d + 'Z';
  }

  function blobMask() {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="white" d="' + blobPath() + '"/></svg>';
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
  }

  function applyMask(node, uri) {
    if (!node) return;
    node.style.webkitMaskImage = uri;
    node.style.maskImage = uri;
  }

  function hidePeek() {
    peekOn = false;
    if (grid) {
      grid.classList.remove('is-hot');
      grid.querySelectorAll('.client.is-hot').forEach(function (el) {
        el.classList.remove('is-hot');
      });
    }
    if (peek) peek.classList.remove('is-on');
  }

  function followPeek() {
    if (!peekOn || !peek) {
      following = false;
      return;
    }
    px += (mx - px) * 0.18;
    py += (my - py) * 0.18;
    peek.style.left = px + 'px';
    peek.style.top = py + 'px';
    requestAnimationFrame(followPeek);
  }

  window.addEventListener('pageshow', hidePeek);
  window.addEventListener('blur', hidePeek);

  if (fineHover) {
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });
  }

  if (grid && peek && peekImg && fineHover) {
    grid.addEventListener('mouseleave', hidePeek);

    grid.querySelectorAll('.client').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        grid.classList.add('is-hot');
        el.classList.add('is-hot');
        var blob = el.querySelector('.client-blob');
        var mask = blobMask();
        var tint = tints[Math.floor(Math.random() * tints.length)];
        var rot = (Math.random() * 36 - 18).toFixed(1) + 'deg';
        if (blob) {
          blob.style.background = tint;
          blob.style.setProperty('--blob-rot', rot);
          applyMask(blob, mask);
        }
        applyMask(peek.querySelector('.client-peek-shot'), mask);
        peekImg.src = el.getAttribute('data-shot') || '';
        if (!peekOn) {
          px = mx;
          py = my;
          peek.style.left = px + 'px';
          peek.style.top = py + 'px';
        }
        peek.classList.add('is-on');
        peekOn = true;
        if (!following) {
          following = true;
          followPeek();
        }
      });
      el.addEventListener('mouseleave', function (e) {
        el.classList.remove('is-hot');
        var next = e.relatedTarget && e.relatedTarget.closest
          ? e.relatedTarget.closest('.client')
          : null;
        if (next && grid.contains(next)) return;
        hidePeek();
      });
    });
  }
})();

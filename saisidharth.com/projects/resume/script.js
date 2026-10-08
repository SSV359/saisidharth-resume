/* Sai Sidharth Vinothkannan - portfolio & resume
   Plain JavaScript, no libraries. Each block below is independent:
     1. mobile menu            5. tabs (skills / activities / awards / credentials)
     2. reveal on scroll       6. certificate image viewer
     3. project filter         7. contact form (opens the visitor's email app)
     4. project dialogs        8. print resume, 9. old page links, 10. nav highlight
        + timeline             11. automatic slideshow (CyberSmart pop-up)       */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Mobile menu ----------------------------------------------------- */
  const topbar = $('.topbar');
  const menuToggle = $('.menu-toggle');
  if (topbar && menuToggle) {
    const setOpen = (open) => {
      topbar.toggleAttribute('data-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
    };
    menuToggle.addEventListener('click', () => setOpen(!topbar.hasAttribute('data-open')));
    $$('.mobile-menu a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* 2. Reveal on scroll ------------------------------------------------ */
  const revealItems = $$('[data-reveal]');
  if (calm || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        io.unobserve(e.target);
        setTimeout(() => e.target.classList.add('is-in'), i * 70);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((el) => io.observe(el));
  }

  /* 3. Project filter -------------------------------------------------- */
  const projects = $$('.project');
  const layOut = () => {
    // Same rhythm as the Studio grid: wide, narrow, narrow, wide, then halves
    const spans = [8, 4, 4, 8];
    projects.filter((p) => !p.hidden).forEach((p, i) => { p.dataset.span = spans[i] || 6; });
  };
  $$('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.filter;
      $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      projects.forEach((p) => {
        p.hidden = group !== 'all' && p.dataset.group !== group;
        p.classList.add('is-in');
      });
      layOut();
    });
  });

  /* 4. Project dialogs and timeline ----------------------------------- */
  $$('[data-dialog]').forEach((opener) => {
    opener.addEventListener('click', () => {
      const dialog = document.getElementById(opener.dataset.dialog);
      if (dialog && dialog.showModal) dialog.showModal();
    });
  });
  $$('dialog.modal').forEach((dialog) => {
    $$('[data-close]', dialog).forEach((b) => b.addEventListener('click', () => dialog.close()));
    // a click on the dimmed area outside the panel closes it
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  });

  const milestones = $$('.milestone');
  const desktop = matchMedia('(min-width: 1024px)');
  const showMilestone = (button, toggle) => {
    const already = button.getAttribute('aria-expanded') === 'true';
    milestones.forEach((m) => {
      const on = m === button && !(toggle && already);
      m.setAttribute('aria-expanded', String(on));
      document.getElementById(m.getAttribute('aria-controls')).hidden = !on;
    });
  };
  // On phones the list works as an accordion (tap again to close);
  // on desktop one entry is always shown in the pinned panel.
  milestones.forEach((m) => m.addEventListener('click', () => showMilestone(m, !desktop.matches)));
  desktop.addEventListener('change', (e) => {
    if (e.matches && !milestones.some((m) => m.getAttribute('aria-expanded') === 'true') && milestones[0]) {
      showMilestone(milestones[0], false);
    }
  });

  /* 5. Tabs ------------------------------------------------------------ */
  const tabs = $$('[role="tab"]');
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });

  /* 6. Certificate image viewer --------------------------------------- */
  const shots = $$('[data-zoom]');
  if (shots.length && 'showModal' in HTMLDialogElement.prototype) {
    const viewer = document.createElement('dialog');
    viewer.className = 'viewer';
    viewer.innerHTML = '<img alt=""><button class="btn btn--outline btn--small" type="button">Close</button>';
    document.body.append(viewer);
    const big = $('img', viewer);
    shots.forEach((shot) => shot.addEventListener('click', () => {
      big.src = shot.dataset.zoom;
      big.alt = shot.dataset.alt || '';
      viewer.showModal();
    }));
    viewer.addEventListener('click', () => viewer.close());
  }

  /* 7. Contact form ---------------------------------------------------
     A static site has no server to send mail, so the form builds an email
     and hands it to the visitor's own mail app. */
  const form = $('.form');
  if (form) {
    const types = $$('.form__types button', form);
    types.forEach((b) => b.addEventListener('click', () => {
      types.forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = (types.find((t) => t.getAttribute('aria-pressed') === 'true') || types[0]).textContent.trim();
      const name = form.elements.name.value.trim();
      const from = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      const subject = `${type}: message from ${name}`;
      const body = `${message}\n\n${name}\n${from}`;
      location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* 8. Print resume ---------------------------------------------------- */
  $$('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

  /* 9. Links from the old multi-page site ------------------------------
     e.g. sairesume.html#certifications opens the right tab, then scrolls. */
  const openFromHash = () => {
    const tab = { '#skills': 'tab-skills', '#activities': 'tab-activities', '#awards': 'tab-awards', '#certifications': 'tab-creds', '#languages': 'tab-creds' }[location.hash];
    if (!tab) return;
    selectTab(document.getElementById(tab));
    $('#credentials').scrollIntoView();
  };
  openFromHash();
  addEventListener('hashchange', openFromHash);

  /* 10. Highlight the current section in the top nav ------------------ */
  const links = $$('.topnav a');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.toggleAttribute('aria-current', false));
        const link = links.find((a) => a.getAttribute('href') === `#${entry.target.id}`);
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* 11. Slideshow ------------------------------------------------------
     Moves to the next day automatically and loops back to Day 1.
     It waits while a slide is enlarged, while a keyboard user is inside it,
     and when the visitor presses the pause button.
     Swipe, the arrows, the dots and the left/right keys all still work. */
  const SECONDS_PER_SLIDE = 6;   // change this number to make it faster or slower

  $$('.slideshow').forEach((show) => {
    const track = $('.slideshow__track', show);
    const slides = $$('.slideshow__slide', show);
    const count = $('.slideshow__count', show);
    const dots = $$('.slideshow__dots button', show);
    const toggle = $('[data-toggle]', show);
    const dialog = show.closest('dialog');
    let index = 0;
    let target = null;              // slide we are scrolling to after a click or a tick
    let playing = !calm;            // visitors who ask for reduced motion start paused
    let last = performance.now();   // when the current slide appeared

    const paint = () => {
      count.textContent = `${index + 1} / ${slides.length}`;
      dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    };
    const paintToggle = () => {
      $('use', toggle).setAttribute('href', playing ? '#i-pause' : '#i-play');
      toggle.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
      count.setAttribute('aria-live', playing ? 'off' : 'polite');
    };
    const step = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 0);
    const go = (i) => {
      index = (i + slides.length) % slides.length;   // wraps around at both ends
      target = index;
      last = performance.now();
      track.scrollTo({ left: index * step(), behavior: calm ? 'auto' : 'smooth' });
      paint();
    };

    $('[data-prev]', show).addEventListener('click', () => go(index - 1));
    $('[data-next]', show).addEventListener('click', () => go(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
    toggle.addEventListener('click', () => { playing = !playing; last = performance.now(); paintToggle(); });
    show.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });
    // keeps the counter right when the visitor swipes the strip
    track.addEventListener('scroll', () => {
      if (!step()) return;
      const i = Math.round(track.scrollLeft / step());
      if (target !== null) { if (i === target) target = null; return; }
      if (i !== index) { index = i; last = performance.now(); paint(); }
    }, { passive: true });

    // every time the pop-up opens, start again from Day 1 with a fresh countdown
    if (dialog) {
      new MutationObserver(() => {
        if (!dialog.open) return;
        index = 0; target = null; last = performance.now();
        track.scrollTo({ left: 0, behavior: 'instant' });
        paint();
      }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    }

    const waiting = () => {
      if (!playing || document.hidden) return true;
      if (dialog && !dialog.open) return true;                 // pop-up is closed
      const viewer = $('.viewer');
      if (viewer && viewer.open) return true;                  // a slide is enlarged
      try { if (show.matches(':has(:focus-visible)')) return true; } catch (err) { /* older browsers */ }
      return false;
    };
    setInterval(() => {
      const now = performance.now();
      if (waiting()) { last = now; return; }                   // the countdown restarts afterwards
      if (now - last >= SECONDS_PER_SLIDE * 1000) go(index + 1);
    }, 250);

    paint();
    paintToggle();
  });
})();

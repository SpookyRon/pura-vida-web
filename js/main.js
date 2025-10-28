document.addEventListener('DOMContentLoaded', () => {
  /* ====== Selectores base ====== */
  const siteHeader  = document.querySelector('.site-header');
  const navBar      = document.querySelector('.nav-container');
  const hamburger   = document.querySelector('.hamburguer-menu');
  const menuPanel   = document.querySelector('.menu-panel');
  const shade       = document.querySelector('.shade');
  const menuPreview = document.querySelector('.menu-preview'); // opcional

  // Dropdown idioma (opcional)
  const langSel     = document.querySelector('.language-selector');
  const langTrigger = langSel?.querySelector('.lang-trigger');
  const langList    = langSel?.querySelector('.lang-list');

  if (!siteHeader || !navBar || !hamburger || !menuPanel || !shade) {
    console.warn('[nav] Faltan nodos esenciales en el DOM.');
    return;
  }

  /* ====== Barra blanca al pasar el header ====== */
  const getThreshold = () => {
    const headerH = siteHeader?.offsetHeight || 0;
    const navH    = navBar?.offsetHeight || 0;
    return Math.max(0, headerH - navH);
  };

  let threshold = getThreshold();
  let ticking = false;

  const applyScrolledState = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    navBar.classList.toggle('is-scrolled', y > threshold);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      applyScrolledState();
      ticking = false;
    });
  };

  const onResize = () => {
    threshold = getThreshold();
    applyScrolledState();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  onResize(); // inicializa

  /* ====== Menú lateral ====== */
  const DEFAULT_PREVIEW = 'images/preview.jpg'; // subo esto arriba para evitar dudas de TDZ
  let currentPreview = '';

  const setPreviewImage = (src, force = false) => {
    if (!menuPreview) return;
    if (!menuPanel.classList.contains('is-open') && !force) return;

    const url = src || DEFAULT_PREVIEW || '';
    if (!url) return;
    if (!force && currentPreview === url) return;

    menuPreview.style.backgroundImage = `url("${url}")`;
    currentPreview = url;
  };

  const setMenuState = (open) => {
    menuPanel.classList.toggle('is-open', open);
    shade.classList.toggle('is-visible', open);
    siteHeader.classList.toggle('menu-open', open);

    hamburger.setAttribute('aria-expanded', String(open));
    menuPanel.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : 'auto';

    if (menuPreview && open) {
      setPreviewImage(DEFAULT_PREVIEW, true);
    }
  };

  const toggleMenu = () => setMenuState(!menuPanel.classList.contains('is-open'));

  hamburger.addEventListener('click', toggleMenu);
  shade.addEventListener('click', () => setMenuState(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuPanel.classList.contains('is-open')) {
      setMenuState(false);
    }
  });

  // Cerrar al hacer clic en un enlace del menú
  menuPanel.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMenuState(false));
  });

  /* ====== Preview dinámico ====== */
  if (menuPreview) {
    const preload = (src) => { if (!src) return; const img = new Image(); img.decoding = 'async'; img.src = src; };
    menuPanel.querySelectorAll('.nav-link[data-preview]').forEach(a => preload(a.dataset.preview));
    preload(DEFAULT_PREVIEW);

    const handlePreviewEvt = (e) => {
      const link = e.target.closest('.nav-link[data-preview]');
      if (!link) return;
      setPreviewImage(link.dataset.preview);
    };

    menuPanel.addEventListener('mouseover', handlePreviewEvt);
    menuPanel.addEventListener('focusin', handlePreviewEvt);
    menuPanel.addEventListener('touchstart', handlePreviewEvt, { passive: true });
  }

  /* ====== Dropdown de idioma ====== */
  if (langSel && langTrigger && langList) {
    const currentSpan = langTrigger.querySelector('.current-lang');

    const openDropdown = () => {
      langSel.classList.add('is-open');
      langTrigger.setAttribute('aria-expanded', 'true');
      langList.hidden = false;
    };
    const closeDropdown = () => {
      langSel.classList.remove('is-open');
      langTrigger.setAttribute('aria-expanded', 'false');
      langList.hidden = true;
    };
    const toggleDropdown = () => {
      langSel.classList.contains('is-open') ? closeDropdown() : openDropdown();
    };

    langTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDropdown();
    });

    langList.addEventListener('click', (e) => {
      const a = e.target.closest('.lang-option');
      if (!a) return;
      e.preventDefault();

      const newCode = a.dataset.lang || a.textContent.trim();
      langList.querySelectorAll('.lang-option').forEach(el => {
        el.classList.toggle('active', el === a);
      });
      if (currentSpan) currentSpan.textContent = newCode;

      closeDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!langSel.contains(e.target)) closeDropdown();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
      if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && document.activeElement === langTrigger) {
        e.preventDefault();
        openDropdown();
        const active = langList.querySelector('.lang-option.active') || langList.querySelector('.lang-option');
        active?.focus?.();
      }
    });
  }
});
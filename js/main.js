document.addEventListener('DOMContentLoaded', () => {
  
  const hamburgerMenu = document.querySelector('.hamburguer-menu');
  const menuPanel     = document.querySelector('.menu-panel');
  const shade         = document.querySelector('.shade');
  const siteHeader    = document.querySelector('.site-header');
  const menuPreview   = document.querySelector('.menu-preview');

  const langSel       = document.querySelector('.language-selector');
  const langTrigger   = langSel?.querySelector('.lang-trigger');
  const langList      = langSel?.querySelector('.lang-list');

  const hasPreview = !!menuPreview;
  const DEFAULT_PREVIEW = 'images/preview.jpg';
  const navBar = document.querySelector('.nav-container');

  const setScrolled = () => {
    const scrolled = window.scrollY > 10;
    navBar.classList.toggle('is-scrolled', scrolled);
  };

  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });
  window.addEventListener('resize', setScrolled);

  const setMenuState = (open) => {
    menuPanel.classList.toggle('is-open', open);
    shade.classList.toggle('is-visible', open);
    siteHeader.classList.toggle('menu-open', open);

    hamburgerMenu.setAttribute('aria-expanded', String(open));
    menuPanel.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : 'auto';

    if (hasPreview && open && DEFAULT_PREVIEW) {
      menuPreview.style.backgroundImage = `url("${DEFAULT_PREVIEW}")`;
    }
  };

  const toggleMenu = () => {
    const newIsOpen = !menuPanel.classList.contains('is-open');
    setMenuState(newIsOpen);
  };

  hamburgerMenu.addEventListener('click', toggleMenu);
  shade.addEventListener('click', () => setMenuState(false));
  menuPanel.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMenuState(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuPanel.classList.contains('is-open')) {
      setMenuState(false);
    }
  });

  if (hasPreview) {
    // Preload
    const preload = (src) => { if (!src) return; const img = new Image(); img.decoding='async'; img.src = src; };
    menuPanel.querySelectorAll('.nav-link[data-preview]').forEach(a => preload(a.dataset.preview));
    preload(DEFAULT_PREVIEW);

    const setPreview = (src) => {
      if (!menuPanel.classList.contains('is-open')) return;
      const url = src || DEFAULT_PREVIEW || '';
      if (url && !menuPreview.style.backgroundImage.includes(url)) {
        menuPreview.style.backgroundImage = `url("${url}")`;
      }
      // El “desliz” lo hace el CSS con :hover/focus
    };

    menuPanel.addEventListener('mouseover', (e) => {
      const link = e.target.closest('.nav-link[data-preview]');
      if (!link) return;
      setPreview(link.dataset.preview);
    });

    menuPanel.addEventListener('focusin', (e) => {
      const link = e.target.closest('.nav-link[data-preview]');
      if (!link) return;
      setPreview(link.dataset.preview);
    });

    menuPanel.addEventListener('touchstart', (e) => {
      const link = e.target.closest('.nav-link[data-preview]');
      if (!link) return;
      setPreview(link.dataset.preview);
    }, { passive: true });
  }

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
      const isOpen = langSel.classList.contains('is-open');
      isOpen ? closeDropdown() : openDropdown();
    };

    // Click en el trigger
    langTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDropdown();
    });

    // Elegir idioma
    langList.addEventListener('click', (e) => {
      const a = e.target.closest('.lang-option');
      if (!a) return;

      e.preventDefault();
      const newCode = a.dataset.lang || a.textContent.trim();

      langList.querySelectorAll('.lang-option').forEach(el => el.classList.toggle('active', el === a));

      currentSpan.textContent = newCode;

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

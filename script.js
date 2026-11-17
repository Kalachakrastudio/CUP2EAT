(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal-on-scroll with a graceful fallback.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Sticky header state + top progress indicator.
  const header = document.querySelector('.site-header');
  const progress = document.getElementById('scrollProgress');
  let ticking = false;
  const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${percent}%`;
    header.classList.toggle('scrolled', window.scrollY > 24);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  // Mobile navigation.
  const menuButton = document.getElementById('menuButton');
  const mainNav = document.getElementById('mainNav');
  menuButton.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));

  // Subtle pointer parallax for the hero image.
  const stage = document.getElementById('heroStage');
  const photo = document.querySelector('.hero-photo-wrap');
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    stage.addEventListener('pointermove', event => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      photo.style.marginLeft = `${x * 12}px`;
      photo.style.marginTop = `${y * 12}px`;
    });
    stage.addEventListener('pointerleave', () => {
      photo.style.marginLeft = '0';
      photo.style.marginTop = '0';
    });
  }

  // If a third-party photo host blocks an image, replace it with a known fallback
  // instead of leaving a broken-image icon.
  const fallbacks = [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1000&q=85'
  ];
  document.querySelectorAll('img').forEach((img, index) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackTried) return;
      img.dataset.fallbackTried = 'true';
      img.src = fallbacks[index % fallbacks.length];
      img.classList.add('fallback-photo');
    }, { once: true });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
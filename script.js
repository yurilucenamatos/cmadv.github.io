/**
 * CMA — Carvalho Matos Advocacia
 * Interactive behaviors & scroll animations
 */

(function () {
  'use strict';

  /* =========================================
     HEADER — scroll behavior
     ========================================= */
  const header = document.getElementById('header');

  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();


  /* =========================================
     HAMBURGER — mobile menu
     ========================================= */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', function () {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });


  /* =========================================
     SCROLL REVEAL
     ========================================= */
  const revealElements = document.querySelectorAll('.reveal');

  function createObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all immediately
      revealElements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) { observer.observe(el); });
  }

  createObserver();


  /* =========================================
     SMOOTH SCROLL for anchor links
     ========================================= */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });


  /* =========================================
     ACTIVE NAV LINK on scroll
     ========================================= */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  function updateActiveNav() {
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    let current = '';

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - headerH - 60;
      if (window.scrollY >= sectionTop) {
        current = '#' + section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('nav__link--active', link.getAttribute('href') === current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });


  /* =========================================
     CONTACT FORM — basic validation & UX
     ========================================= */
  const form = document.getElementById('contactForm');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');
      let valid = true;

      // Clear previous errors
      form.querySelectorAll('.form-error').forEach(function (el) { el.remove(); });
      form.querySelectorAll('.form-input--error').forEach(function (el) {
        el.classList.remove('form-input--error');
      });

      function showError(input, msg) {
        input.classList.add('form-input--error');
        const err = document.createElement('p');
        err.className = 'form-error';
        err.style.cssText = 'font-size:12px;color:#D14311;margin-top:4px;';
        err.textContent = msg;
        input.parentNode.appendChild(err);
        valid = false;
      }

      if (!name.value.trim()) {
        showError(name, 'Por favor, informe seu nome.');
      }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        showError(email, 'Informe um e-mail válido.');
      }
      if (!message.value.trim()) {
        showError(message, 'Por favor, escreva sua mensagem.');
      }

      if (!valid) return;

      // Success state
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Mensagem enviada!';
      btn.style.background = '#1a7340';
      btn.style.borderColor = '#1a7340';
      btn.disabled = true;

      // In production, integrate with FormSubmit, EmailJS, or backend
      // For now, redirect to WhatsApp with pre-filled message
      const waMsg = encodeURIComponent(
        'Olá! Me chamo ' + name.value.trim() + ' e gostaria de informações sobre os serviços da CMA Advocacia. Assunto: ' + message.value.trim().slice(0, 100)
      );

      setTimeout(function () {
        window.open('https://wa.me/5515933333333?text=' + waMsg, '_blank');
        form.reset();
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
      }, 1500);
    });

    // Real-time validation feedback
    form.querySelectorAll('.form-input').forEach(function (input) {
      input.addEventListener('blur', function () {
        if (this.classList.contains('form-input--error') && this.value.trim()) {
          this.classList.remove('form-input--error');
          const err = this.parentNode.querySelector('.form-error');
          if (err) err.remove();
        }
      });
    });
  }


  /* =========================================
     PHONE MASK
     ========================================= */
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '');
      if (v.length <= 10) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
      this.value = v;
    });
  }


  /* =========================================
     HERO PARALLAX (subtle)
     ========================================= */
  const heroOrbs = document.querySelectorAll('.hero__orb');

  if (heroOrbs.length && window.matchMedia('(min-width: 768px)').matches) {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          const scrollY = window.scrollY;
          heroOrbs.forEach(function (orb, i) {
            const speed = i === 0 ? 0.15 : 0.08;
            orb.style.transform = 'translateY(' + scrollY * speed + 'px)';
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  /* =========================================
     AREA CARDS — keyboard accessibility
     ========================================= */
  document.querySelectorAll('.area-card').forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        // Future: open modal or navigate
      }
    });
  });


  /* =========================================
     STATS COUNTER ANIMATION
     ========================================= */
  // Simple entrance animation for stat numbers
  const statNumbers = document.querySelectorAll('.stat__number');

  if ('IntersectionObserver' in window && statNumbers.length) {
    const statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeSlideUp 0.6s ease forwards';
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Inject animation
    const styleEl = document.createElement('style');
    styleEl.textContent = '@keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }';
    document.head.appendChild(styleEl);

    statNumbers.forEach(function (el) {
      el.style.opacity = '0';
      statsObserver.observe(el);
    });
  }


  /* =========================================
     CURSOR GLOW (subtle, desktop only)
     ========================================= */
  if (window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      'width:300px',
      'height:300px',
      'border-radius:50%',
      'background:radial-gradient(circle, rgba(209,67,17,0.04) 0%, transparent 70%)',
      'transform:translate(-50%,-50%)',
      'transition:opacity 0.3s',
      'z-index:0',
      'top:0',
      'left:0',
    ].join(';');
    document.body.appendChild(glow);

    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
    });

    function animateGlow() {
      cx += (mx - cx) * 0.1;
      cy += (my - cy) * 0.1;
      glow.style.left = cx + 'px';
      glow.style.top = cy + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }


  /* =========================================
     BLOG CARDS — stagger on load
     ========================================= */
  document.querySelectorAll('.blog-card').forEach(function (card, i) {
    card.style.transitionDelay = (i * 0.08) + 's';
  });


  /* =========================================
     Footer year auto-update
     ========================================= */
  const copyEls = document.querySelectorAll('.footer__copy');
  copyEls.forEach(function (el) {
    el.innerHTML = el.innerHTML.replace('2024', new Date().getFullYear());
  });

})();
